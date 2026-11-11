import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { AGENT_FILES, SKILL_DIR, otherAppFile } from '../.github/scripts/core/config';
import { PHASE_FOLDERS } from '../.github/scripts/core/paths';
import { claudeAgentFile, copilotAgentFile, type RoleName } from '../.github/scripts/core/agent-text';
import { COORDINATOR, ROLES, nameClashes, toolProblems } from '../.github/scripts/core/roles';
import { drifted } from '../dev/agents';
import { COMMANDS, loadCommand } from '../.github/scripts/heldout';

const REPO = path.resolve(import.meta.dirname, '..');
/** Copilot's coordinator: shipped, with no Claude Code bridge (its main agent with the skill coordinates there). */
const COORD = `.github/agents/${COORDINATOR}.agent.md`;
/** The phase subagents' Copilot files. */
const COPILOT = AGENT_FILES.filter((f) => f.startsWith('.github/agents/') && f !== COORD);
/** Maintainer-only agents, never shipped by init: dev-* ones, and the agent setup's reviewer (.agents/README.md). */
const DEV = fs.readdirSync(path.join(REPO, '.github', 'agents')).filter((f) => f.startsWith('dev-') || f === 'code-reviewer.agent.md').map((f) => `.github/agents/${f}`);
/** The Claude Code bridge of a Copilot agent file. */
const bridgeOf = (f: string) => f.replace('.github/agents/', '.claude/agents/').replace('.agent.md', '.md');
/** The YAML frontmatter as raw `key: value` lines (values kept as written). */
function frontmatter(file: string): Record<string, string> {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(path.join(REPO, file), 'utf8'));
  assert.ok(m, `${file} has no frontmatter`);
  return Object.fromEntries(m[1].split(/\r?\n/).map((l) => /^([\w-]+):\s*(.*)$/.exec(l)).filter((x) => x !== null).map((x) => [x[1], x[2]]));
}
/** A subagent's brief in the skill: its procedure, printed by `heldout brief` (specs/020-brief-per-role). */
const briefOf = (f: string) => path.join(SKILL_DIR, 'briefs', `${path.basename(f).replace(/(\.agent)?\.md$/, '')}.md`);
const BRIEFS = COPILOT.map(briefOf);
/**
 * All a subagent is told: its file (who it is, its limits) and its brief (what to do). The sentences these tests pin
 * were in the file alone before the brief; an agent of the kit or the coordinator has its file only.
 */
const told = (f: string) => {
  const file = fs.readFileSync(path.join(REPO, '.github', 'agents', path.basename(f)), 'utf8');
  return fs.existsSync(briefOf(f)) ? `${file}\n${fs.readFileSync(briefOf(f), 'utf8')}` : file;
};

describe('agent files', () => {
  it('sends each agent to the part it needs, not a whole handoff or a reference of another phase', () => {
    const read = told;
    const triager = read('heldout-triager.agent.md'), hardener = read('heldout-hardener.agent.md'), author = read('heldout-test-author.agent.md');
    for (const view of ['--group <n>', 'show KEY spec --test', 'show KEY contract --ac', '--rules', '--errors', '--endpoints', '--variants', '--gaps', '--auth', 'show KEY probes', 'probes.md']) assert.ok(triager.includes(view), view);
    for (const whole of ['references/hardening.md', '2-contract/contract.json', 'probes.jsonl', '6-triage/triage-<run>.md', '*.spec.ts']) assert.ok(!triager.includes(whole), whole);
    assert.ok(hardener.includes('show KEY spec'));
    assert.match(hardener, /0\. Don't open the spec file\. Search it for `TODO\(harden\)` and `@irreversible`/);
    for (const kept of ['-- show KEY spec` says where it is', 'searching `2-contract/contract.json` for the words of', 'with the same flags and `--grep`, the tests that failed on a mechanic and those that call a journey you changed', 'a call under test from a precondition']) assert.ok(hardener.includes(kept), kept);
    for (const later of ['`hardening-cases.md` for the cases', '`journeys.md` when you add', '`accounts.md` when']) assert.ok(hardener.includes(later), later);
    const procedure = fs.readFileSync(path.join(SKILL_DIR, 'references', 'hardening.md'), 'utf8');
    const cases = fs.readFileSync(path.join(SKILL_DIR, 'references', 'hardening-cases.md'), 'utf8');
    for (const section of ['Tier 2 in practice', 'Tier notes', 'Values the application takes as codes', 'Assertion-implementation bugs', 'Requirement revision']) {
      assert.ok(procedure.includes(section), `hardening.md points to ${section}`);
      assert.match(cases, new RegExp(`^## ${section}`, 'm'), `hardening-cases.md holds ${section}`);
    }
    assert.ok(!/accounts\.md/.test(author), 'setting up accounts is not the author\'s');
    const references = path.join(SKILL_DIR, 'references');
    for (const f of ['probes.md', 'accounts.md']) assert.ok(fs.existsSync(path.join(references, f)), f);
    assert.ok(!fs.readFileSync(path.join(references, 'hardening.md'), 'utf8').includes('| An earlier chain with one value changed |'), 'the table lives in probes.md alone');
    assert.ok(!fs.readFileSync(path.join(references, 'data-and-journeys.md'), 'utf8').includes('--add-existing'), 'the recipe lives in accounts.md alone');
  });

  it('sends the agents after the freeze to the application map and its rules, and those before it to the overview alone (specs/007-application-map, specs/017-application-knowledge)', () => {
    const read = told;
    for (const f of ['heldout-hardener.agent.md', 'heldout-triager.agent.md']) {
      // One command reads all of it (specs/018-lean-skill-one-writer); the parts are for a map too large to print whole.
      for (const use of ['heldout -- map KEY`', 'map KEY --domain <domain>', '--add', '--stale <id>', '--rules', 'map KEY --rule "']) assert.ok(read(f).includes(use), `${f}: ${use}`);
      // The overview has one writer, setup: a story's agent marks an entry stale and says what is missing.
      assert.ok(!read(f).includes('--about'), `${f} names no way to add to the overview`);
      assert.match(read(f), /overview lacks[^.]*reply/, `${f} reports what the overview lacks`);
    }
    for (const f of ['heldout-test-author.agent.md', 'heldout-contract-extractor.agent.md', 'heldout-contract-reviewer.agent.md']) {
      assert.ok(read(f).includes('`application-map/`'), `${f} is told to stay out of the files`);
      const uses = [...read(f).matchAll(/heldout(?: '?--'?)? map\b[^`\n]*/g)].map((m) => m[0]);
      assert.deepEqual(uses, ['heldout -- map KEY --overview'], `${f} names the overview and no other way in`);
      assert.match(read(f), /never (?:give|supply|gives|supplies)[^.]*(?:value|criterion)/, `${f} is told the overview is no oracle`);
    }
    assert.match(read('heldout-evaluator.agent.md'), /map --survey/, 'the coordinator writes the overview at setup');
    for (const f of ['heldout-hardener.agent.md', 'heldout-triager.agent.md']) {
      assert.match(read(f), /probe that contradicts a required rule[^.]*(?:leaves it as it is|stays)/, `${f}: a probe never retires a required rule`);
    }
    const skill = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf8');
    assert.match(skill, /overview lacks[^.]*map --about <part> --add/, 'the closing summary hands what is missing to a person');
    for (const f of ['hardening.md', 'triage.md']) assert.ok(!fs.readFileSync(path.join(SKILL_DIR, 'references', f), 'utf8').includes('--about'), `${f} names no way to add to the overview`);
    for (const f of ['test-authoring.md', 'requirement-contract.md', 'contract-review-prompt.md', 'data-and-journeys.md', 'journeys.md']) {
      assert.ok(!/heldout(?: '?--'?)? map\b/.test(fs.readFileSync(path.join(SKILL_DIR, 'references', f), 'utf8')), `${f} is read before the freeze`);
    }
  });

  it('every agent file and bridge init ships exists', () => {
    for (const f of AGENT_FILES) assert.ok(fs.existsSync(path.join(REPO, f)), f);
    for (const f of COPILOT) assert.ok(AGENT_FILES.includes(bridgeOf(f)), `${f} has a Claude Code bridge`);
  });

  it('no dev-only agent is shipped, and every agent in .github/agents is either shipped or dev-only', () => {
    assert.deepEqual(AGENT_FILES.filter((f) => path.basename(f).startsWith('dev-')), []);
    const all = fs.readdirSync(path.join(REPO, '.github', 'agents')).map((f) => `.github/agents/${f}`);
    assert.deepEqual(all.filter((f) => !AGENT_FILES.includes(f) && !DEV.includes(f)), [], 'name a new agent dev-… (or make it part of the agent setup) or give it a role in core/roles.ts');
  });

  it('each Claude Code bridge carries the name and description of what it points at', () => {
    const skill = frontmatter(path.relative(REPO, path.join(SKILL_DIR, 'SKILL.md')));
    const bridge = frontmatter('.claude/skills/heldout-evaluator/SKILL.md');
    assert.equal(bridge.name, skill.name);
    assert.equal(bridge.description, skill.description);
    for (const f of [...COPILOT, ...DEV]) {
      const agent = frontmatter(f);
      const claude = frontmatter(bridgeOf(f));
      assert.equal(claude.name, agent.name, f);
      assert.equal(claude.description, agent.description, f);
      // A subagent's two files have one body, written from one definition; an agent of the kit points at its file.
      const body = (file: string) => fs.readFileSync(path.join(REPO, file), 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
      if (COPILOT.includes(f)) assert.equal(body(bridgeOf(f)), body(f), `${bridgeOf(f)} has the body of ${f}`);
      else assert.ok(body(bridgeOf(f)).includes(f), `${bridgeOf(f)} points at ${f}`);
    }
  });

  it('each subagent\'s files are what one definition writes: a role, its limits and the brief to start with (specs/020-brief-per-role)', () => {
    for (const name of Object.keys(ROLES) as RoleName[]) {
      const disk = (f: string) => fs.readFileSync(path.join(REPO, f), 'utf8').replace(/\r\n/g, '\n');
      assert.equal(disk(`.github/agents/${name}.agent.md`), copilotAgentFile(name), `${name}: npx tsx dev/agents.ts --write`);
      assert.equal(disk(`.claude/agents/${name}.md`), claudeAgentFile(name), `${name}: npx tsx dev/agents.ts --write`);
      const file = copilotAgentFile(name);
      assert.ok(file.split('\n').length <= 25, `${name} has ${file.split('\n').length} lines`);
      assert.ok(file.includes(`npm run heldout -- brief KEY --role ${name}`), `${name} starts with its brief`);
      assert.ok(fs.existsSync(briefOf(name)), `the skill has ${name}'s brief`);
      assert.ok(!fs.readFileSync(briefOf(name), 'utf8').startsWith('---'), `${name}'s brief is a procedure, with no frontmatter`);
      // The limits are in the file itself: a brief that fails to print removes none.
      assert.match(file, /\nNever |\. Never |never open/, name);
    }
    const limits: Record<RoleName, string[]> = {
      'heldout-contract-extractor': ['Never look at the application, its code or `application-map/`', 'Never invent criteria', 'Never write the review'],
      'heldout-contract-reviewer': ['Never open the\napplication, its code, `application-map/` or the test files', 'never modify the contract'],
      'heldout-test-author': ['Never open the application, its code, its tests or `application-map/`', 'never freeze the\ndraft', 'never edit `journeys/registry.yml`'],
      'heldout-hardener': ['Never change WHAT a test expects', 'never resolve an oracle gap', 'Never run `heldout integrity --snapshot`,\n`--amend` or `--reject`'],
      'heldout-triager': ['Never edit the tests or the journeys', 'Never amend an assertion nobody proposed', 'never create or\nchange Jira issues'],
    };
    for (const [name, kept] of Object.entries(limits)) for (const limit of kept) assert.ok(copilotAgentFile(name as RoleName).includes(limit), `${name}: ${limit}`);
    assert.deepEqual(drifted(), []);
    // Nothing shipped still calls a subagent's Claude Code file a pointer at its Copilot one, and a project that
    // changed one is told the other app's file doesn't read it.
    const skill = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf8'), setup = fs.readFileSync(path.join(SKILL_DIR, 'references', 'setup.md'), 'utf8');
    assert.match(skill, /each `\.claude\/agents\/\*\.md` has the body of its Copilot file/);
    for (const text of [skill, setup]) assert.ok(!/`\.claude\/agents\/[^\n]*(?:bridges?[^\n]*point|point at the same files)/.test(text));
    assert.ok(setup.includes('change both'));
    // Only a subagent has a file in each app: the coordinator (Copilot only), the skill's bridge and a project's own
    // files have no counterpart to name.
    for (const name of Object.keys(ROLES)) {
      assert.equal(otherAppFile(`.github/agents/${name}.agent.md`), `.claude/agents/${name}.md`);
      assert.equal(otherAppFile(`.claude/agents/${name}.md`), `.github/agents/${name}.agent.md`);
    }
    for (const f of [COORD, bridgeOf(COORD), '.claude/skills/heldout-evaluator/SKILL.md', '.github/agents/mine.agent.md', 'playwright.config.ts']) assert.equal(otherAppFile(f), undefined, f);
    assert.deepEqual(AGENT_FILES.filter((f) => otherAppFile(f)).length, Object.keys(ROLES).length * 2);
    assert.match(fs.readFileSync(path.join(REPO, '.github', 'scripts', 'setup', 'update.ts'), 'utf8'), /otherAppFile\(file\) \? `; \$\{otherAppFile\(file\)\}, the same agent's file for the other agent app, doesn't read this one/);
  });

  it('the skill and its agents fit what both apps load (specs/018-lean-skill-one-writer)', () => {
    // GitHub Copilot and Claude Code: a skill's name is its folder's, its description at most 1024 characters.
    const skill = frontmatter(path.relative(REPO, path.join(SKILL_DIR, 'SKILL.md')));
    assert.equal(skill.name, path.basename(SKILL_DIR));
    assert.match(skill.name, /^[a-z0-9-]{1,64}$/);
    assert.ok(skill.description.length > 0 && skill.description.length <= 1024, `the description has ${skill.description.length} characters`);
    // The bridge is a skill of its own to the app that loads it: its name is its own folder's too.
    const bridges = path.join(REPO, '.claude', 'skills');
    const pointing = fs.readdirSync(bridges).filter((d) => fs.readFileSync(path.join(bridges, d, 'SKILL.md'), 'utf8').includes('.github/skills/heldout-evaluator/SKILL.md'));
    assert.deepEqual(pointing, [skill.name]);
    assert.equal(frontmatter(`.claude/skills/${pointing[0]}/SKILL.md`).name, pointing[0]);
    // A Copilot agent's body is cut at 30,000 characters.
    for (const f of [COORD, ...COPILOT]) {
      const body = fs.readFileSync(path.join(REPO, f), 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
      assert.ok(body.length <= 30_000, `${f}: ${body.length} characters`);
    }
    // The coordinator reads SKILL.md every evaluation: it holds the loop and the rules, and names where the rest is.
    const file = path.join(SKILL_DIR, 'SKILL.md');
    assert.ok(fs.statSync(file).size <= 24_000, `SKILL.md has ${fs.statSync(file).size} bytes`);
    const text = fs.readFileSync(file, 'utf8');
    for (const ref of ['setup.md', 'phases.md', 'layout.md']) {
      assert.ok(fs.existsSync(path.join(SKILL_DIR, 'references', ref)), ref);
      assert.ok(text.includes(`references/${ref}`), `SKILL.md names references/${ref}`);
    }
    for (const kept of ['## Who coordinates', '## Unattended', '## Guardrails', '## Finishing']) assert.ok(text.includes(kept), kept);
    const setup = fs.readFileSync(path.join(SKILL_DIR, 'references', 'setup.md'), 'utf8');
    for (const says of ['GitHub Copilot', 'Claude Code', '.vscode/mcp.json', '.mcp.json', 'map --survey', 'Opus', 'Manual', 'Assisted', 'Allow all', 'never yours']) assert.ok(setup.includes(says), `setup.md: ${says}`);
  });

  it('each evaluation agent has the no-scripts rule and reports a tool gap', () => {
    for (const f of COPILOT) {
      const text = told(f);
      // In the file itself too, with the limits: it holds without the brief.
      assert.match(fs.readFileSync(path.join(REPO, f), 'utf8'), /No scripts of your own/, f);
      assert.match(text, /No scripts of your own/, f);
      assert.match(text, /Tool gap: /, f);
      assert.match(text, /note KEY --tool-gap/, f);
    }
  });

  it('every `heldout <command> --flag` the agents, SKILL.md and the references write exists', async () => {
    const refs = path.join(SKILL_DIR, 'references');
    const docs = [...[COORD, ...COPILOT].map((f) => path.join(REPO, f)), ...BRIEFS, path.join(SKILL_DIR, 'SKILL.md'), ...fs.readdirSync(refs).filter((f) => f.endsWith('.md')).map((f) => path.join(refs, f))];
    const problems: string[] = [];
    let checked = 0;
    for (const doc of docs) {
      const text = fs.readFileSync(doc, 'utf8');
      // Code spans and the lines of fenced blocks: where commands are written.
      const fenced = [...text.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].flatMap((m) => m[1].split('\n'));
      const spans = [...text.replace(/```[^\n]*\n[\s\S]*?```/g, '').matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      for (const span of [...fenced, ...spans]) {
        for (const part of span.split(/(?=\bheldout\s)/).filter((s) => s.startsWith('heldout'))) {
          const m = part.match(/^heldout\s+(?:'--'\s+|--\s+)?([a-z][a-z-]*)([\s\S]*)$/);
          if (!m || !COMMANDS[m[1]]) { if (m && !/^(evaluator|skill)/.test(m[1])) problems.push(`${path.basename(doc)}: no command "${m[1]}" (${part.slice(0, 60)})`); continue; }
          checked++;
          const flags = new Set((await loadCommand(m[1])).spec.flags);
          const rest = m[2].split(/\s(?:\||&&|;|then)\s/)[0].replace(/"[^"]*"|'[^']*'/g, '');
          for (const f of rest.matchAll(/(?<![\w-])--([a-z][a-z-]+)/g)) if (!flags.has(f[1]) && f[1] !== 'help') problems.push(`${path.basename(doc)}: heldout ${m[1]} has no --${f[1]} (${part.slice(0, 80).replace(/\s+/g, ' ')})`);
        }
      }
    }
    assert.deepEqual([...new Set(problems)], []);
    assert.ok(checked > 100, `only ${checked} commands found in the documents: the scan is broken`);
  });

  it('each subagent\'s tools in both apps are exactly what its role allows (core/roles.ts)', () => {
    const onDisk = fs.readdirSync(path.join(REPO, '.github', 'agents')).map((f) => `.github/agents/${f}`).filter((f) => !DEV.includes(f) && f !== COORD);
    assert.deepEqual(Object.keys(ROLES).sort(), onDisk.map((f) => path.basename(f, '.agent.md')).sort());
    for (const f of [...COPILOT, ...COPILOT.map(bridgeOf)]) assert.deepEqual(toolProblems(f, fs.readFileSync(path.join(REPO, f), 'utf8')), [], f);
    // No role looks at the application before the freeze; the contract reviewer never edits what it judges.
    for (const [name, role] of Object.entries(ROLES)) assert.equal(role.browser, ['heldout-hardener', 'heldout-triager'].includes(name), name);
    assert.equal(ROLES['heldout-contract-reviewer'].writes, 'create');
  });

  it('Copilot\'s coordinator calls the phase agents only, with its own tools and no bridge (specs/016-coordinator-agent)', () => {
    const text = fs.readFileSync(path.join(REPO, COORD), 'utf8');
    assert.ok(AGENT_FILES.includes(COORD), 'shipped');
    assert.deepEqual(toolProblems(COORD, text), []);
    assert.ok(!fs.existsSync(path.join(REPO, bridgeOf(COORD))), 'no Claude Code bridge: its main agent with the skill coordinates');
    assert.ok(!AGENT_FILES.includes(bridgeOf(COORD)));
    const fm = frontmatter(COORD);
    assert.equal(fm['user-invocable'], 'true');
    assert.ok((JSON.parse(fm.model.replace(/'/g, '"')) as string[]).length >= 2, 'a primary model and a fallback');
    for (const use of ['SKILL.md', 'heldout -- advance KEY', '--quiet', 'no `cd`', 'note KEY --usage', 'No scripts of your own']) assert.ok(text.includes(use), use);
    const widened = [
      text.replace(/^tools:.*$/m, "tools: ['agent', 'read', 'search', 'edit', 'execute', 'browser']"),
      text.replace(/^tools:.*\r?\n/m, ''),
      text.replace(/^agents:.*$/m, "agents: ['heldout-contract-extractor', 'heldout-contract-reviewer', 'heldout-test-author', 'heldout-hardener', 'heldout-triager', 'Explore']"),
      text.replace(/^agents:.*$/m, "agents: ['*']"),
      text.replace(/^agents:.*\r?\n/m, ''),
      text.replace(/^name:/m, 'handoffs: x\nname:'),
    ];
    for (const t of widened) assert.ok(toolProblems(COORD, t).length >= 1, t.slice(0, 400));
    // Another agent's file may not take the coordinator's keys or tools.
    const author = '.github/agents/heldout-test-author.agent.md';
    assert.ok(toolProblems(author, fs.readFileSync(path.join(REPO, author), 'utf8').replace(/^name:/m, "agents: ['heldout-hardener']\nname:")).length >= 1);
    assert.ok(toolProblems(bridgeOf(COORD), '---\nname: heldout-evaluator\ntools: Read\n---\n').length >= 1, 'a Claude Code file for it has no role');
    // Copilot calls agents by name: a file whose name: isn't its own, or another agent with a skill agent's name, is caught.
    assert.ok(toolProblems(author, fs.readFileSync(path.join(REPO, author), 'utf8').replace(/^name:.*$/m, 'name: heldout-hardener')).some((p) => p.includes('must be heldout-test-author')));
    assert.deepEqual(nameClashes([['.github/agents/mine.agent.md', '---\nname: heldout-hardener\ntools: [\'*\']\n---\n'], ['.github/agents/other.agent.md', '---\nname: other\n---\n']]),
      ['.github/agents/mine.agent.md: name heldout-hardener is the skill\'s own agent\'s']);
    assert.equal(nameClashes([['.github/agents/x.agent.md', '---\nname: heldout-evaluator\n---\n']]).length, 1);
  });

  it('the agent that fixes an assertion proposes its amendment, a fresh triager decides it (specs/019-amendment-review)', () => {
    const read = told;
    const hardener = read('heldout-hardener.agent.md'), triager = read('heldout-triager.agent.md');
    assert.ok(hardener.includes('integrity KEY --propose'));
    assert.ok(hardener.includes('Never run `heldout integrity --snapshot`, `--amend` or `--reject`'));
    assert.ok(triager.includes('integrity KEY --amend') && triager.includes('--reject'));
    assert.ok(triager.includes('Never amend an assertion nobody proposed'));
    const roles = fs.readFileSync(path.join(SKILL_DIR, 'references', 'governance.md'), 'utf8');
    assert.match(roles, /\| Orchestrator \|[^\n]*nothing about WHAT is correct: it runs `heldout advance`/);
    assert.match(roles, /\| Triager \|[^\n]*whether a proposed amendment is recorded or rejected/);
    assert.match(roles, /\| Hardener \|[^\n]*approve its own amendment/);
    assert.match(fs.readFileSync(path.join(SKILL_DIR, 'references', 'triage.md'), 'utf8'), /^## Reviewing a proposed amendment$/m);
    // The coordinator decides nothing about an amendment: neither file tells it to run one.
    const skill = fs.readFileSync(path.join(SKILL_DIR, 'SKILL.md'), 'utf8');
    for (const text of [skill, fs.readFileSync(path.join(REPO, COORD), 'utf8'), fs.readFileSync(path.join(SKILL_DIR, 'references', 'phases.md'), 'utf8')]) {
      assert.ok(!/you\*{0,2} decide on/i.test(text) && !/decide on the audited amendment yourself/.test(text));
    }
    assert.ok(skill.includes('Whoever\n    proposes never approves'));
    // Nor to record one: the coordinator's file and the phases name no `--amend` (SKILL.md names it in its guardrail).
    for (const f of [path.join(REPO, COORD), path.join(SKILL_DIR, 'references', 'phases.md')]) assert.ok(!fs.readFileSync(f, 'utf8').includes('--amend'), f);
  });

  it('both apps approve edits in the record, the scratch area and the journeys, and nothing wider (specs/016-coordinator-agent)', () => {
    const json = (f: string) => JSON.parse(fs.readFileSync(path.join(REPO, f), 'utf8'));
    const edits = (json('.claude/settings.json').permissions.allow as string[]).filter((r) => r.startsWith('Edit'));
    assert.deepEqual(edits.sort(), ['Edit(/.heldout/**)', 'Edit(/journeys-*/**)', 'Edit(/journeys/**)', 'Edit(/output/**)']);
    // Copilot already approves edits in the workspace, except dotfiles: only the scratch area is added, and its glob
    // matches no file the repository tracks (the skill's own code among them).
    const copilot = json('.vscode/settings.json')['chat.tools.edits.autoApprove'] as Record<string, boolean>;
    assert.deepEqual(copilot, { '**/.heldout/**': true });
    const tracked = spawnSync('git', ['-C', REPO, 'ls-files'], { encoding: 'utf8' }).stdout.split('\n').filter(Boolean);
    assert.ok(tracked.length > 100);
    assert.deepEqual(tracked.filter((f) => Object.keys(copilot).some((g) => path.matchesGlob(f, g))), []);
    assert.ok(path.matchesGlob('.heldout/parabank/PB-1/4-hardening/x.md', '**/.heldout/**'));
    // Claude Code's rules are anchored at the project root: none reaches a file the skill ships either.
    const claude = edits.map((r) => r.slice('Edit(/'.length, -1));
    assert.deepEqual(tracked.filter((f) => claude.some((g) => path.matchesGlob(f, g))), []);
    assert.ok(path.matchesGlob('journeys-parabank/fixtures/accounts.ts', claude.find((g) => g.startsWith('journeys-'))!));
  });

  it('a widened tool list is caught, however it is written', () => {
    const read = (f: string) => fs.readFileSync(path.join(REPO, f), 'utf8');
    const author = '.github/agents/heldout-test-author.agent.md';
    const bridge = bridgeOf(author);
    const hardener = bridgeOf('.github/agents/heldout-hardener.agent.md');
    const reviewer = bridgeOf('.github/agents/heldout-contract-reviewer.agent.md');
    const widened: [string, string][] = [
      [author, read(author).replace(/^tools:.*$/m, "tools: ['read', 'search', 'edit', 'execute', 'browser']")],
      [author, read(author).replace(/^tools:.*\r?\n/m, '')], // no tools line: every tool
      [author, read(author).replace(/^tools: \[(.*)\]$/m, "tools: [$1,\n  'browser', 'playwright/*']")], // continued on the next line
      [author, read(author).replace(/^name:/m, "mcp-servers:\n  - x\nname:")],
      [bridge, read(bridge).replace(/^(tools:.*)$/m, '$1,\n  WebFetch')],
      [bridge, read(bridge).replace(/^(tools:.*)$/m, '$1\ntools: Read, Grep, Glob, Write, Edit, Bash, WebFetch')], // given twice
      [bridge, read(bridge).replace(/^(tools:.*)$/m, '$1\ndisallowedTools: NotebookEdit')],
      [hardener, read(hardener).replace(/^(model:.*)$/m, '$1\npermissionMode: bypassPermissions')],
      [hardener, read(hardener).replace('mcp__playwright__*', 'mcp__*')],
      [hardener, read(hardener).replace(/^tools:.*\r?\n/m, '')],
      [reviewer, read(reviewer).replace('Write,', 'Write, Edit,')], // the reviewer never edits the contract
    ];
    for (const [f, text] of widened) assert.ok(toolProblems(f, text).length >= 1, `${f}:\n${text.slice(0, 400)}`);
    assert.deepEqual(toolProblems(author, `${String.fromCharCode(0xfeff)}${read(author)}`), [], 'a byte-order mark is no change');
    // The frontmatter ends only at an exact "---" line: one with more after it is a problem, not the end.
    const early = toolProblems(bridge, read(bridge).replace(/^(model:.*)$/m, '$1\n---x: 1\nmcpServers: {a: 1}'));
    assert.ok(early.some((p) => p.includes('isn\'t one "key: value" (---x')), early.join('\n'));
    assert.ok(early.some((p) => p.includes('unknown frontmatter key mcpServers')), 'the lines after it are still read');
  });

  it('each subagent names only the phase folders of its inputs and its own output (specs/001-phase-separation)', () => {
    const allowed: Record<string, string[]> = {
      'heldout-contract-extractor': ['1-requirement', '2-contract'],
      'heldout-contract-reviewer': ['1-requirement', '2-contract'],
      'heldout-test-author': ['2-contract', '3-tests'],
      // The hardener is told the draft in 3-tests/ stays as frozen; it works in its own folder.
      'heldout-hardener': ['2-contract', '3-tests', '4-hardening'],
      'heldout-triager': ['2-contract', '4-hardening', '5-run', '6-triage'],
    };
    // Every phase folder named in the agent files, SKILL.md and the references is one of the layout's, with or without "/".
    const docs = [...fs.readdirSync(path.join(REPO, '.github', 'agents')).map((f) => path.join(REPO, '.github', 'agents', f)), ...BRIEFS,
      path.join(SKILL_DIR, 'SKILL.md'), ...fs.readdirSync(path.join(SKILL_DIR, 'references')).map((f) => path.join(SKILL_DIR, 'references', f))];
    const unknown = docs.flatMap((f) => [...fs.readFileSync(f, 'utf8').matchAll(/\b[1-9]-(?:requirement|contract|tests|hardening|evidence|runs?|triage|verdict)\b/g)]
      .map((m) => m[0]).filter((n) => !(PHASE_FOLDERS as readonly string[]).includes(n)).map((n) => `${f}: ${n}`));
    assert.deepEqual(unknown, []);
    for (const [name, folders] of Object.entries(allowed)) {
      const named = [...new Set(told(`${name}.agent.md`).match(/\b[1-7]-[a-z]+(?=\/)/g) ?? [])];
      assert.deepEqual(named.filter((f) => !folders.includes(f)), [], `${name} names folders outside its phase's inputs and output`);
    }
  });

  it('each Copilot agent lists its model with fallbacks; each Claude Code bridge names one model', () => {
    for (const f of [...COPILOT, ...DEV]) {
      assert.match(frontmatter(bridgeOf(f)).model, /^(opus|sonnet|haiku|fable|inherit|claude-[\w.-]+)$/, bridgeOf(f));
      const models = JSON.parse(frontmatter(f).model.replace(/'/g, '"')) as string[];
      assert.ok(Array.isArray(models) && models.length >= 2, `${f}: a primary model and at least one fallback`);
    }
  });
});
