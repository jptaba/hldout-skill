/**
 * The agent setup (.agents/README.md): maintainer-only (never shipped by init), project-agnostic in its generic parts,
 * bridged for both agent apps, and its gate doing what GOVERNANCE.md says — checked on its logic and on a real git
 * repository taken through verify, review, commit and the audit.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { approvals, asText, contractSection, gateProblems, globToRegExp, parseReview, secretHits, tierOf, trailersOf, vetoes, withTrailers } from '../.agents/scripts/agentctl.mjs';
import { SHIPPED } from '../.github/scripts/setup/update';

const REPO = path.resolve(import.meta.dirname, '..');
const AGENTCTL = path.join(REPO, '.agents', 'scripts', 'agentctl.mjs');
const config = JSON.parse(fs.readFileSync(path.join(REPO, '.agents', 'config.json'), 'utf8'));
const SKILLS = fs.readdirSync(path.join(REPO, '.agents', 'skills'));
/** The parts of the setup that are the same in every project: the project's facts are in config.json, its rules in AGENTS.md. */
const GENERIC = [
  '.agents/scripts/agentctl.mjs', '.agents/templates/contract.md', '.agents/README.md', '.agents/policy/guardrails.md',
  '.githooks/pre-commit', '.githooks/prepare-commit-msg', '.githooks/commit-msg', '.github/agents/code-reviewer.agent.md',
  '.claude/agents/code-reviewer.md', ...SKILLS.flatMap((s) => [`.agents/skills/${s}/SKILL.md`, `.claude/skills/${s}/SKILL.md`]),
  'CLAUDE.md', 'GOVERNANCE.md', 'SECURITY.md', '.github/copilot-instructions.md', '.github/workflows/verify.yml',
];
/** The project's own: two files, plus the two its host requires in its own format. */
const PROJECT = ['AGENTS.md', '.agents/config.json', '.github/CODEOWNERS', '.github/dependabot.yml'];
const MAINTAINER = [...GENERIC, ...PROJECT];
const frontmatter = (file: string) => Object.fromEntries((fs.readFileSync(path.join(REPO, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '')
  .split(/\r?\n/).map((l) => /^([\w-]+):\s*(.*)$/.exec(l)).filter((m) => m !== null).map((m) => [m![1], m![2]]));
const tierNamed = (name: string) => config.tiers.find((t: { name: string }) => t.name === name);

describe('the agent setup: boundary and portability', () => {
  it('exists, and none of it is shipped to the projects init sets up', () => {
    for (const f of MAINTAINER) assert.ok(fs.existsSync(path.join(REPO, f)), `${f} exists`);
    const shippedBy = (f: string) => SHIPPED.find((s) => f === s || f.startsWith(`${s}/`));
    assert.deepEqual(MAINTAINER.filter(shippedBy), []);
  });

  it('names no project in its generic parts, so it works anywhere with only its config and AGENTS.md changed', () => {
    const named = GENERIC.filter((f) => /held-?out|\bAUT\b|Jira|Playwright|Toolshop|ParaBank|hldout|jptaba|npm (run|ci)/i.test(fs.readFileSync(path.join(REPO, f), 'utf8')));
    assert.deepEqual(named, []);
  });

  it('keeps each project fact once: the owner in CODEOWNERS is the one config.json names', () => {
    assert.match(config.owner, /^@\S+$/);
    assert.match(fs.readFileSync(path.join(REPO, '.github', 'CODEOWNERS'), 'utf8'), new RegExp(`^\\*\\s+${config.owner}\\s*$`, 'm'));
  });

  it('puts the gate\'s own files, what defines the proof, and the held-out rules in the strictest tier', () => {
    const guarded = [...GENERIC, ...PROJECT, 'tests/agent-kit.test.ts', 'package.json', 'tsconfig.json', 'tests/tsconfig.json', '.gitignore',
      '.github/scripts/setup/update.ts', '.github/skills/heldout-evaluator/SKILL.md', '.github/skills/heldout-evaluator/references/triage.md'];
    for (const f of guarded) assert.equal(tierOf(config, [f]).name, 'guardrail', f);
  });

  it('gives Claude Code a bridge to each skill and the reviewer, carrying the same name and description', () => {
    for (const s of SKILLS) {
      const [skill, bridge] = [frontmatter(`.agents/skills/${s}/SKILL.md`), frontmatter(`.claude/skills/${s}/SKILL.md`)];
      assert.equal(bridge.name, s);
      assert.equal(bridge.name, skill.name);
      assert.equal(bridge.description, skill.description);
      assert.match(fs.readFileSync(path.join(REPO, `.claude/skills/${s}/SKILL.md`), 'utf8'), new RegExp(`\\.agents/skills/${s}/SKILL\\.md`));
    }
    const claude = frontmatter('.claude/agents/code-reviewer.md');
    assert.match(claude.disallowedTools, /Write/);
    assert.match(claude.disallowedTools, /Edit/);
    assert.doesNotMatch(claude.tools, /Write|Edit/);
    assert.doesNotMatch(frontmatter('.github/agents/code-reviewer.agent.md').tools, /edit/);
  });
});

describe('the agent setup: the gate\'s logic', () => {
  it('matches globs as git paths', () => {
    assert.ok(globToRegExp('docs/**').test('docs/adr/0001.md'));
    assert.ok(globToRegExp('**').test('a/b/c.ts'));
    assert.ok(globToRegExp('.github/scripts/authoring/integrity*.ts').test('.github/scripts/authoring/integrity-check.ts'));
    assert.ok(!globToRegExp('docs/*.md').test('docs/adr/0001.md'));
    assert.ok(globToRegExp('**/*.md').test('README.md'));
  });

  it('lets the most demanding tier of any file govern a change, whatever the order tiers are listed in', () => {
    assert.equal(tierOf(config, ['docs/x.md']).name, 'docs');
    assert.equal(tierOf(config, ['tests/x.test.ts']).name, 'code');
    assert.equal(tierOf(config, ['docs/x.md', '.github/scripts/flow/x.ts']).name, 'code');
    assert.equal(tierOf(config, ['README.md', '.github/scripts/flow/x.ts']).name, 'code');
    assert.equal(tierOf(config, ['docs/x.md', '.github/scripts/core/redact.ts']).name, 'guardrail');
    // Tiers that don't nest: each requirement at its most demanding.
    const loose = { tiers: [{ name: 'a', match: ['a/**'], contract: true, reviews: 1 }, { name: 'b', match: ['b/**'], reviews: 1, models: 2 }, { name: 'rest', match: ['**'], proof: false, reviews: 0, gate: false }] };
    const both = tierOf(loose, ['a/x', 'b/y']);
    assert.equal(both.contract, true);
    assert.equal(both.models, 2);
    assert.equal(both.proof, true);
  });

  it('counts the latest approval of each reviewer and model; a request for changes vetoes the tree for good', () => {
    const r = (tree: string, verdict: string, model: string, ts: string) => ({ kind: 'review' as const, tree, verdict, model, reviewer: 'code-reviewer', findings: 0, ts });
    const proof = (ts: string) => ({ kind: 'proof' as const, tree: 't1', ok: true, steps: [], ts, head: 'h' });
    const records = [r('t1', 'REQUEST_CHANGES', 'm1', '1'), r('t1', 'APPROVE', 'm1', '2'), r('t1', 'APPROVE', 'm2', '3'), r('t2', 'APPROVE', 'm3', '5')];
    assert.deepEqual(approvals(records, 't1').map((x) => x.model), ['m1', 'm2']);
    assert.deepEqual(vetoes(records, 't1').map((x) => x.verdict), ['REQUEST_CHANGES'], 'asking again does not overturn it');
    assert.deepEqual(vetoes(records, 't2'), []);
    // BLOCKED (no proof yet) lapses once a proof is recorded after it; recorded after the proof, it holds.
    assert.deepEqual(vetoes([r('t1', 'BLOCKED', 'm1', '1'), proof('2')], 't1'), []);
    assert.equal(vetoes([proof('1'), r('t1', 'BLOCKED', 'm1', '2')], 't1').length, 1);
  });

  it('reads trailers from the last paragraph, never from the subject, and keeps them above commit -v\'s scissors', () => {
    assert.deepEqual(trailersOf('Journeys: one line only'), []);
    assert.deepEqual(trailersOf('Subject\n\nBody text.\n\nGate: restated\nCo-Authored-By: X <x@y>').map((t) => t.key), ['Gate', 'Co-Authored-By']);
    assert.equal(withTrailers('Subject\n\nGate: g', ['Tier: code']), 'Subject\n\nGate: g\nTier: code\n');
    assert.equal(withTrailers('Subject only', ['Tier: code']), 'Subject only\n\nTier: code\n');
    const scissors = '# ------------------------ >8 ------------------------\ndiff --git a/x b/x';
    assert.equal(withTrailers(`Subject\n\n${scissors}`, ['Tier: code']), `Subject\n\nTier: code\n\n${scissors}`);
    assert.deepEqual(parseReview('code-reviewer · m1 · APPROVE · 2 finding(s) · tree abcdef123456'), { reviewer: 'code-reviewer', model: 'm1', verdict: 'APPROVE', findings: 2, tree: 'abcdef123456' });
    assert.equal(parseReview('a · m1 · not APPROVE'), undefined);
  });

  it('says what a commit lacks for its tier, from the ledger', () => {
    const tier = tierNamed('guardrail');
    const proof = { kind: 'proof' as const, tree: 't', ok: true, steps: [], ts: '1', head: 'h', contract: 'docs/x.md#A', contractSha: 'abc' };
    const review = (model: string, verdict = 'APPROVE') => ({ kind: 'review' as const, tree: 't', verdict, model, reviewer: 'code-reviewer', findings: 0, ts: '2' });
    const gate = 'Subject\n\nGate: the change restated in the gatekeeper\'s own words, with what was not checked';
    const check = (records: unknown[], o: { message?: string; gate?: string; approvers?: string[]; tree?: string } = {}) =>
      gateProblems({ config: { gate: (o.gate ?? 'agent') as 'agent', approvers: o.approvers }, tier, message: o.message ?? gate, tree: o.tree ?? 't', records: records as never }).join(' | ');
    assert.equal(check([proof, review('m1'), review('m2')]), '');
    assert.match(check([proof, review('m1')]), /1 approving review/);
    assert.match(check([proof, review('m1'), { ...review('m1'), reviewer: 'second' }]), /from 1 model/);
    assert.match(check([proof, review('m1'), review('m2'), review('m3', 'REQUEST_CHANGES')]), /did not approve/, 'a dissent vetoes');
    assert.match(check([proof, review('m1', 'REQUEST_CHANGES'), review('m1'), review('m2')]), /did not approve/, 'and asking again does not lift it');
    assert.match(check([proof, review('m1'), review('m2')], { gate: 'human', approvers: ['@owner'], message: 'S\n\nApproved-by: @owner-impostor' }), /approvers/, 'an exact name, not a prefix');
    assert.match(check([proof, review('m1'), review('m2')], { gate: 'human', approvers: ['@owner'], message: 'S\n\nApproved-by: not @owner' }), /approvers/, 'exactly one approver, nothing else');
    assert.match(check([proof, review('m1'), review('m2')], { message: 'Subject' }), /Gate/);
    assert.match(check([proof, review('m1'), review('m2')], { gate: 'human' }), /Approved-by/);
    assert.match(check([proof, review('m1'), review('m2')], { gate: 'human', approvers: ['@owner'], message: 'S\n\nApproved-by: @someone-else' }), /approvers/);
    assert.equal(check([proof, review('m1'), review('m2')], { gate: 'human', approvers: ['@owner'], message: 'S\n\nApproved-by: @owner' }), '');
    assert.match(check([proof, review('m1'), review('m2')], { tree: 'other' }), /no passing proof/);
    assert.match(check([{ ...proof, contract: undefined }, review('m1'), review('m2')]), /names no contract/);
  });

  it('checks a pushed commit\'s trailers against its own tree and contract', () => {
    const tier = tierNamed('guardrail');
    const tree = 'abcdef1234567890';
    const message = (proofTree: string, reviewTree = proofTree) => [
      'Subject', '', 'Gate: the change restated in the gatekeeper\'s own words, with what was not checked',
      'Contract: docs/x.md#A · sha256:0123456789ab', `Proof: tests ok · tree ${proofTree}`,
      `Review: code-reviewer · m1 · APPROVE · 0 finding(s) · tree ${reviewTree}`, `Review: code-reviewer · m2 · APPROVE · 1 finding(s) · tree ${reviewTree}`,
    ].join('\n');
    const at = (sha: string) => () => sha;
    const audit = (msg: string, sha = '0123456789abcdef') => gateProblems({ config: {}, tier, message: msg, tree, contractShaAt: at(sha) }).join(' | ');
    assert.equal(audit(message('abcdef123456')), '');
    assert.match(audit(message('ffffff123456')), /another tree/);
    assert.match(audit(message('abcdef123456', 'ffffff123456')), /0 approving/);
    assert.match(audit(message('abcdef123456'), 'ffff'), /not the one proven/);
    assert.match(audit(`${message('abcdef123456')}\nReview: code-reviewer · m3 · REQUEST_CHANGES · 2 finding(s) · tree abcdef123456`), /did not approve/, 'a dissent in the trailers fails the audit');
  });

  it('takes a contract\'s section by heading or table row', () => {
    const text = '# Plan\n\n## 1. One\nfirst\n### detail\nmore\n## 2. Two\nsecond\n\n| GP1 | phase gate |\n';
    assert.equal(contractSection(text, 'p.md', '1. One'), '## 1. One\nfirst\n### detail\nmore');
    assert.equal(contractSection(text, 'p.md', 'GP1'), '| GP1 | phase gate |');
    assert.throws(() => contractSection(text, 'p.md', 'nowhere'), /no heading or table row/);
  });

  it('finds token shapes, credentials given literals and high-entropy strings, not ordinary code', () => {
    const fake = (...parts: string[]) => parts.join('');
    assert.equal(secretHits(`const k = "${fake('AKIA', 'ABCDEFGHIJKLMNOP')}";`).length, 1);
    assert.equal(secretHits(`stripe: ${fake('sk_live_', 'abcdefghijklmnop1234')}`).length, 1);
    assert.equal(secretHits(`token: "${fake('q8ZfT3kLm9XwR2v', 'B7nY5cH1jD4sG6aPe')}"`).length, 1);
    assert.equal(secretHits(`password: ${fake('Hunter2', 'Secret9')}`).length, 1);
    assert.equal(secretHits("password: '${env:USER_PASSWORD}'\napi_key = process.env.KEY").length, 0, 'references are not secrets');
    assert.equal(secretHits(`DB_PASSWORD=${fake('Pa55', 'word99')}`).length, 1, 'environment style');
    assert.equal(secretHits(`AWS_SECRET_ACCESS_KEY=${fake('wJalrXUtnFEMI', '7K7MDENGbPxRfiCY')}`).length, 1);
    assert.equal(secretHits(`Authorization: Bearer ${fake('abc123DEF456', 'ghi789JKL012mno')}`).length, 1, 'a bearer token');
    assert.equal(secretHits(`url = "https://admin:${fake('s3cr3', 'tpw')}@db.example.com"`).length, 1, 'credentials in a URL');
    assert.equal(secretHits('url = "https://${user}:${pass}@db.example.com"').length, 0, 'references in a URL are not secrets');
    assert.equal(secretHits('url = "https://user:<password>@db.example.com"').length, 0, 'a placeholder in a URL is not a secret');
    for (const line of [`SECRET_KEY = "${fake('abc1234', '5xyz')}"`, `GITHUB_TOKEN=${fake('abc123def', '456ghi')}`, `API_TOKEN=${fake('tok123', '456789')}`,
      `access_token: "${fake('abc123', 'def456')}"`, `clientSecret: "${fake('abc123', 'def456')}"`, `const dbPassword = "${fake('S3cret', 'Pass99')}"`]) {
      assert.equal(secretHits(line).length, 1, line);
    }
    for (const line of [`$env:API_TOKEN = "${fake('abc123', 'def456')}"`, `password1=${fake('Hunter2', 'Secret')}`, `API_KEY2=${fake('abc123', 'def456')}`,
      `PAGE_ACCESS_TOKEN=${fake('EAAB12', 'cdef34')}`, `DB_PASS=${fake('hunter2', 'abc')}`]) {
      assert.equal(secretHits(line).length, 1, line);
    }
    // In a configuration file every value is a literal, whatever it looks like.
    for (const [file, line] of [['.env', `DB_PASSWORD=${fake('hunter2', '.prod')}`], ['app.yml', `clientSecret: ${fake('a1b2c3d4', '.e5f6')}`],
      ['application.properties', `spring.datasource.password=${fake('Secr3t', '.Pass1')}`], ['.env', `SMTP_PASSWORD=${fake('my(pass)', 'w0rd')}`]]) {
      assert.equal(secretHits(line, file).length, 1, `${file}: ${line}`);
    }
    assert.equal(secretHits(`const cfg = { password: "${fake('P@ss,', 'w0rd2024')}" };`, 'src/x.ts').length, 1, 'a quoted value runs to its closing quote');
    assert.equal(secretHits(`CSRF_TOKEN_SECRET=${fake('a8f3k2', 'j9x7q1')}`, '.env').length, 1, 'another credential word keeps it a credential');
    assert.equal(secretHits('DB_PASSWORD=$DB_PASSWORD_V2', 'deploy.sh').length, 0, 'a shell reference is not a literal');
    assert.equal(secretHits('    token: t.slice(0, 12),', 'README.md').length, 0, 'a code example in Markdown is code');
    // In source code an unquoted expression is code.
    for (const line of ['passwordRepeat: "Abc12345xyz"', 'token_type: "Bearer01"', 'const secretName = "app-secret-01"', 'if (token === expected01) {}',
      'const token = tokens[0];', 'token: t.slice(0, 12),', 'const apiKey = cfg.keys.v2;', 'const secret = crypto.randomBytes(32).toString("hex");',
      'const tokens = { access_token: refreshed.at2 }', 'tokenLimit: 4096tokens', 'nextPageToken: "abc123def456"', 'csrfToken: "abc123def456"',
      'tokenExpiresAt: 2026-10-18T19:15:22Z']) {
      assert.equal(secretHits(line, 'src/x.ts').length, 0, line);
    }
    assert.equal(secretHits(`token: "${fake('q8ZfT3kLm9XwR2v', 'B7nY5cH1jD4sG6aPe')}" // agentctl-allow-secret: a test fixture`).length, 0);
    assert.equal(secretHits("import x from '.github/scripts/requirement/contract-model-and-more';\nconst s = 'abcdefghijklmnopqrstuvwxyzabcdefgh';").length, 0);
    const utf16 = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(`k = "${fake('AKIA', 'ABCDEFGHIJKLMNOP')}"`, 'utf16le')]);
    assert.equal(secretHits(asText(utf16) ?? '').length, 1, 'a UTF-16 file is read, not skipped');
    assert.equal(asText(Buffer.from([1, 0, 2])), undefined, 'binary content is skipped');
  });
});

describe('the agent setup: end to end in a git repository', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-kit-'));
  after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const run = (cmd: string, args: string[]) => spawnSync(cmd, args, { cwd: dir, encoding: 'utf8' });
  const ctl = (...args: string[]) => run(process.execPath, [AGENTCTL, ...args]);
  const write = (f: string, text: string) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), text); };
  const kitConfig = {
    proof: [{ name: 'check', run: 'node --version' }], gate: 'agent', branchPolicy: 'proof',
    tiers: [
      { name: 'guard', match: ['guard/**'], proof: true, reviews: 2, models: 2, gate: true, contract: true },
      { name: 'docs', match: ['docs/**'], proof: false, reviews: 0, gate: false },
      { name: 'code', match: ['**'], proof: true, reviews: 1, gate: true, contract: true },
    ],
  };
  const msg = path.join(dir, '.git', 'MSG');
  const gateLine = 'Gate: two constants added exactly as asked; nothing else changed, nothing left unchecked';
  const commit = (text: string) => { fs.writeFileSync(msg, text); ctl('hook', 'prepare-commit-msg', msg); return ctl('hook', 'commit-msg', msg); };

  it('proves, reviews and gates a change, and refuses each missing piece', () => {
    run('git', ['init', '-q']);
    run('git', ['config', 'user.email', 't@example.com']);
    run('git', ['config', 'user.name', 'T']);
    write('.agents/config.json', JSON.stringify(kitConfig));
    write('.gitignore', '.agents/runs/\n');
    write('docs/contract.md', '# C\n\n## A\nadd two constants\n\n## B\nlater\n');
    write('a.ts', 'export const a = 1;\n');
    run('git', ['add', '-A']);

    assert.equal(ctl('hook', 'pre-commit').status, 1, 'no proof yet');
    assert.equal(ctl('verify').status, 1, 'the code tier needs a contract');
    write('b.ts', 'export const b = 2;\n');
    assert.equal(ctl('verify', '--contract', 'docs/contract.md#A').status, 1, 'an unstaged file is refused');
    run('git', ['add', '-A']);
    const proven = ctl('verify', '--contract', 'docs/contract.md#A');
    assert.equal(proven.status, 0, proven.stderr);
    assert.match(fs.readFileSync(path.join(dir, '.agents', 'runs', 'packet.md'), 'utf8'), /## A\nadd two constants/);
    assert.equal(ctl('hook', 'pre-commit').status, 0);

    assert.equal(commit('Add a and b\n').status, 1, 'no review, no gate');
    assert.match(fs.readFileSync(msg, 'utf8'), /Tier: code\nContract: docs\/contract\.md#A · sha256:[0-9a-f]{12}\nProof: secrets ok · check ok · tree /);
    assert.equal(ctl('review', '--verdict', 'APPROVE', '--findings', '0', '--model', 'M1').status, 0);
    const ok = commit(`Add a and b\n\n${gateLine}\n`);
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(fs.readFileSync(msg, 'utf8'), /Review: code-reviewer · m1 · APPROVE · 0 finding\(s\) · tree [0-9a-f]{12}/);

    // A contract edited and staged after the proof is another tree: the proof and the review no longer count.
    write('docs/contract.md', '# C\n\n## A\nadd three constants\n\n## B\nlater\n');
    run('git', ['add', 'docs/contract.md']);
    assert.match(commit(`Add a and b\n\n${gateLine}\n`).stderr, /no passing proof/);
    write('docs/contract.md', '# C\n\n## A\nadd two constants\n\n## B\nlater\n');
    run('git', ['add', 'docs/contract.md']);
    assert.equal(commit(`Add a and b\n\n${gateLine}\n`).status, 0, 'the proven tree again');

    const committed = run('git', ['commit', '-q', '-F', msg]);
    assert.equal(committed.status, 0, committed.stderr);
    assert.equal(ctl('audit', 'HEAD').status, 0, ctl('audit', 'HEAD').stderr);
  });

  it('classes a rename out of a guarded path by both paths, and refuses a staged secret', () => {
    // The guarded file exists in history first (a fixture: committed without the hooks).
    write('guard/policy.ts', 'export const p = 1;\n');
    run('git', ['add', '-A']);
    run('git', ['commit', '-q', '--no-verify', '-m', 'fixture']);
    run('git', ['mv', 'guard/policy.ts', 'docs/policy.ts']);
    const status = ctl('status');
    assert.match(status.stdout, /tier guard/, 'the rename still counts the guarded path');

    // A non-ASCII file name (quoted by git by default) is scanned like any other.
    write('données/c.ts', `export const key = "${['AKIA', 'ABCDEFGHIJKLMNOP'].join('')}";\n`);
    run('git', ['add', '-A']);
    const secret = ctl('hook', 'pre-commit');
    assert.equal(secret.status, 1);
    assert.match(secret.stderr, /données\/c\.ts:1/);
    assert.equal(ctl('verify', '--contract', 'docs/contract.md#A').status, 1, 'verify scans too');
    assert.equal(ctl('scan-secrets', 'no-such-file.ts').status, 1, 'a path that can\'t be read is an error, not clean');
  });

  it('fails a proof whose step rewrites the tree', () => {
    run('git', ['reset', '-q', '--hard', 'HEAD']);
    run('git', ['clean', '-qfd']);
    const rewriting = { ...kitConfig, proof: [{ name: 'format', run: 'node -e "require(\'fs\').appendFileSync(\'a.ts\', \'// formatted\\n\')"' }] };
    write('.agents/config.json', JSON.stringify(rewriting));
    write('e.ts', 'export const e = 5;\n');
    run('git', ['add', '-A']);
    const v = ctl('verify', '--contract', 'docs/contract.md#A');
    assert.equal(v.status, 1);
    assert.match(v.stderr, /changed the working tree/);
    run('git', ['reset', '-q', '--hard', 'HEAD']);
    run('git', ['clean', '-qfd']);
  });

  it('scans each pushed commit\'s own files, so a secret added and then removed is still found', () => {
    write('f.ts', `export const key = "${['AKIA', 'ABCDEFGHIJKLMNOP'].join('')}";\n`);
    run('git', ['add', '-A']);
    run('git', ['commit', '-q', '--no-verify', '-m', 'add']);
    fs.rmSync(path.join(dir, 'f.ts'));
    run('git', ['add', '-A']);
    run('git', ['commit', '-q', '--no-verify', '-m', 'remove']);
    const audit = ctl('audit', 'HEAD~2..HEAD');
    assert.equal(audit.status, 1);
    assert.match(audit.stderr, /f\.ts:1/);
    assert.match(audit.stdout, /HEAD~2\.\.HEAD/);
    run('git', ['reset', '-q', '--hard', 'HEAD~2']);
  });

  it('gates a merge by its own files: one whose sides touched different files passes, one that changes files itself needs the gate', () => {
    const main = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
    const start = run('git', ['rev-parse', 'HEAD']).stdout.trim();
    const key = (n: number) => `export const k${n} = "${['AKIA', 'ABCDEFGHIJKLMNO', String(n)].join('')}";\n`;
    try {
      run('git', ['checkout', '-q', '-b', 'side']);
      write('side.ts', key(1));
      run('git', ['add', '-A']);
      run('git', ['commit', '-q', '--no-verify', '-m', 'side']);
      run('git', ['checkout', '-q', main]);
      write('old.ts', key(2));
      run('git', ['add', '-A']);
      run('git', ['commit', '-q', '--no-verify', '-m', 'old']);
      // A clean merge: nothing of its own, nothing to gate.
      run('git', ['merge', '-q', '--no-ff', '--no-commit', 'side']);
      fs.writeFileSync(msg, "Merge branch 'side'\n");
      assert.equal(ctl('hook', 'commit-msg', msg).status, 0, 'a clean merge is not gated');
      assert.equal(run('git', ['commit', '-q', '--no-verify', '-m', "Merge branch 'side'"]).status, 0);
      const clean = run('git', ['rev-parse', 'HEAD']).stdout.trim();
      // An "evil merge": the merge adds a file of its own, holding a secret.
      run('git', ['checkout', '-q', '-b', 'side2', `${clean}~1`]);
      write('side2.ts', 'export const s2 = 2;\n');
      run('git', ['add', '-A']);
      run('git', ['commit', '-q', '--no-verify', '-m', 'side2']);
      run('git', ['checkout', '-q', main]);
      run('git', ['merge', '-q', '--no-ff', '--no-commit', 'side2']);
      write('evil.ts', key(3));
      run('git', ['add', '-A']);
      fs.writeFileSync(msg, "Merge branch 'side2'\n");
      assert.equal(ctl('hook', 'commit-msg', msg).status, 1, 'a merge that adds a file of its own is gated by it');
      assert.equal(run('git', ['commit', '-q', '--no-verify', '-m', "Merge branch 'side2'"]).status, 0);
      const evil = run('git', ['rev-parse', 'HEAD']).stdout.trim();
      const audit = ctl('audit', `${start}..HEAD`);
      const hits = (f: string) => (audit.stderr.match(new RegExp(`${f}:1`, 'g')) ?? []).length;
      assert.equal(hits('evil\\.ts'), 1, 'what only the merge brings is scanned, once');
      assert.equal(hits('old\\.ts'), 1, 'a side\'s file is its own commit\'s, reported once');
      assert.equal(hits('side\\.ts'), 1);
      assert.doesNotMatch(audit.stderr, new RegExp(`✖ ${clean.slice(0, 10)}`), 'the clean merge is not reported');
      assert.match(audit.stderr, new RegExp(`✖ ${evil.slice(0, 10)}`), 'the merge with files of its own is audited like a commit');
    } finally {
      run('git', ['merge', '--abort']);
      run('git', ['checkout', '-q', main]);
      run('git', ['reset', '-q', '--hard', start]);
      run('git', ['branch', '-q', '-D', 'side', 'side2']);
    }
  });

  it('gates a merge where both sides changed one file and git combined them without a conflict', () => {
    const main = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
    const start = run('git', ['rev-parse', 'HEAD']).stdout.trim();
    try {
      write('f.ts', ['export const one = 1;', '', '', '', '', '', 'export const seven = 7;', ''].join('\n'));
      run('git', ['add', '-A']);
      run('git', ['commit', '-q', '--no-verify', '-m', 'f']);
      run('git', ['checkout', '-q', '-b', 'top']);
      write('f.ts', ['export const one = 11;', '', '', '', '', '', 'export const seven = 7;', ''].join('\n'));
      run('git', ['commit', '-q', '--no-verify', '-am', 'top']);
      run('git', ['checkout', '-q', main]);
      write('f.ts', ['export const one = 1;', '', '', '', '', '', 'export const seven = 77;', ''].join('\n'));
      run('git', ['commit', '-q', '--no-verify', '-am', 'bottom']);
      assert.equal(run('git', ['merge', '-q', '--no-ff', '--no-commit', 'top']).status, 0, 'no conflict');
      fs.writeFileSync(msg, "Merge branch 'top'\n");
      assert.match(ctl('hook', 'commit-msg', msg).stderr, /no passing proof/, 'the combined file is the merge\'s own');
    } finally {
      run('git', ['merge', '--abort']);
      run('git', ['reset', '-q', '--hard', start]);
      run('git', ['branch', '-q', '-D', 'top']);
    }
  });

  it('needs a proof to commit a merge that resolved a conflict', () => {
    const main = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
    const start = run('git', ['rev-parse', 'HEAD']).stdout.trim();
    run('git', ['checkout', '-q', '-b', 'other']);
    write('a.ts', 'export const a = 10;\n');
    run('git', ['commit', '-q', '--no-verify', '-am', 'other a']);
    run('git', ['checkout', '-q', main]);
    write('a.ts', 'export const a = 20;\n');
    run('git', ['commit', '-q', '--no-verify', '-am', 'main a']);
    run('git', ['merge', '-q', 'other']);
    write('a.ts', 'export const a = 30;\n');
    run('git', ['add', 'a.ts']);
    const refused = ctl('hook', 'pre-commit');
    assert.equal(refused.status, 1, 'the resolved tree has no proof');
    assert.match(refused.stderr, /no passing proof/);
    run('git', ['merge', '--abort']);
    run('git', ['reset', '-q', '--hard', start]);
    run('git', ['branch', '-q', '-D', 'other']);
  });

  it('names the binary files it does not scan, and refuses to gate on a damaged ledger', () => {
    fs.writeFileSync(path.join(dir, 'blob.bin'), Buffer.from([0x50, 0x4b, 0x00, 0x01, 0x02]));
    run('git', ['add', 'blob.bin']);
    const scan = ctl('scan-secrets', '--staged');
    assert.equal(scan.status, 0);
    assert.match(scan.stdout, /not scanned \(binary\): blob\.bin/);
    const ledger = path.join(dir, '.agents', 'runs', 'ledger.jsonl');
    const lines = fs.readFileSync(ledger, 'utf8').split('\n').filter(Boolean).length;
    fs.appendFileSync(ledger, '{"kind":"review", broken\n');
    assert.match(ctl('status').stderr, new RegExp(`ledger\\.jsonl:${lines + 1} is not a record`), 'status warns');
    fs.writeFileSync(msg, `Add blob\n\n${gateLine}\n`);
    const refused = ctl('hook', 'commit-msg', msg);
    assert.equal(refused.status, 1, 'the gate refuses');
    assert.match(refused.stderr, /damaged ledger can hide a veto/);
    for (const step of [ctl('hook', 'pre-commit'), ctl('hook', 'prepare-commit-msg', msg), ctl('review', '--verdict', 'APPROVE', '--findings', '0', '--model', 'm1')]) {
      assert.equal(step.status, 1);
      assert.match(step.stderr, /damaged ledger can hide a veto/);
    }
    fs.writeFileSync(ledger, `${fs.readFileSync(ledger, 'utf8').split('\n').filter(Boolean).slice(0, lines).join('\n')}\n`);
    run('git', ['rm', '-q', '--cached', 'blob.bin']);
    fs.rmSync(path.join(dir, 'blob.bin'));
  });

  it('refuses a commit whose contract can no longer be read', () => {
    write('.gitignore', '.agents/runs/\nprivate/\n');
    run('git', ['add', '-A']);
    run('git', ['commit', '-q', '--no-verify', '-m', 'ignore private/']);
    write('private/contract.md', '# P\n\n## A\nthe private contract\n');
    write('g.ts', 'export const g = 7;\n');
    run('git', ['add', '-A']);
    assert.equal(ctl('verify', '--contract', 'private/contract.md#A').status, 0);
    ctl('review', '--verdict', 'APPROVE', '--findings', '0', '--model', 'm1');
    fs.rmSync(path.join(dir, 'private'), { recursive: true });
    fs.writeFileSync(msg, `Add g\n\n${gateLine}\n`);
    ctl('hook', 'prepare-commit-msg', msg);
    assert.match(ctl('hook', 'commit-msg', msg).stderr, /can't be read/);
  });

  it('fails the audit of a commit made with --no-verify and invented trailers', () => {
    run('git', ['reset', '-q', '--hard', 'HEAD']);
    write('d.ts', 'export const d = 4;\n');
    run('git', ['add', '-A']);
    const forged = 'Forged\n\nContract: docs/contract.md#A · sha256:000000000000\nProof: check ok · tree 000000000000\nReview: code-reviewer · m1 · APPROVE · 0 finding(s) · tree 000000000000\nGate: restated in words that look long enough to pass the gate check';
    assert.equal(run('git', ['commit', '-q', '--no-verify', '-m', forged]).status, 0);
    const audit = ctl('audit', 'HEAD~1..HEAD');
    assert.equal(audit.status, 1);
    assert.match(audit.stderr, /another tree/);
    // The fixture commit carries no trailers at all: the audit says so too.
    assert.match(ctl('audit', 'HEAD~2..HEAD~1').stderr, /no Proof trailer/);
  });
});
