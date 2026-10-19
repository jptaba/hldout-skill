#!/usr/bin/env node
// @ts-check
/**
 * agentctl — the agent setup's one tool: evidence, review records, the commit gate, the audit and the secret scan.
 * Project-agnostic: everything project-specific is in .agents/config.json. No dependencies (Node 20+ and git).
 *
 *   node .agents/scripts/agentctl.mjs verify [--contract <file>[#section]]
 *        scan the staged files for secrets, run the proof steps on the staged change, write the packet
 *        (.agents/runs/packet.md) and a ledger line, both bound to the staged tree. Exit 0 only when all passed.
 *   node .agents/scripts/agentctl.mjs review --verdict APPROVE|REQUEST_CHANGES|BLOCKED --findings N --model <model> [--reviewer <name>]
 *        the reviewer's one write: its verdict on the staged tree, in the ledger
 *   node .agents/scripts/agentctl.mjs status        the staged change: its tier, and what it has and still needs
 *   node .agents/scripts/agentctl.mjs install-hooks  git config core.hooksPath .githooks (once per clone)
 *   node .agents/scripts/agentctl.mjs scan-secrets --staged | <paths…>
 *        a line can carry `agentctl-allow-secret` (with the reason) to pass a known non-secret: reviewers see it
 *   node .agents/scripts/agentctl.mjs audit <git range | auto>   check each commit's trailers against its tier and its
 *        own tree, and scan what the range changed (auto: from the merge base with the remote's default branch)
 *   node .agents/scripts/agentctl.mjs ci [--audit <git range | auto>]   the config's install, its proof steps, the audit
 *   node .agents/scripts/agentctl.mjs hook pre-commit | prepare-commit-msg <file> [source] | commit-msg <file>
 *
 * What it can and cannot prove: locally, proof and reviews are recorded by the exact tree and the hooks check them.
 * In CI, each pushed commit's trailers are checked for consistency with its own tree and contract, and the final tree's
 * proof steps run again; a trailer set written by hand and consistent with the commit can't be told from a real one.
 * Who reviewed (reviewer, model) and who approved are declared, not authenticated. GOVERNANCE.md says how that is
 * covered.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** @typedef {{ name: string, match: string[], proof?: boolean, reviews?: number, models?: number, gate?: boolean, contract?: boolean }} Tier */
/** @typedef {{ owner?: string, install?: string, proof: { name: string, run: string }[], tiers: Tier[], gate?: 'agent' | 'human', approvers?: string[], branchPolicy?: 'proof' | 'no-direct-commits', protectedBranches?: string[], maxFileBytes?: number, packet?: string, ledger?: string, secretScan?: { skip?: string[] } }} Config */
/** @typedef {{ kind: 'proof', ts: string, tree: string, ok: boolean, steps: { name: string, exit: number, ms: number }[], contract?: string, contractSha?: string, head: string }} ProofRecord */
/** @typedef {{ kind: 'review', ts: string, tree: string, verdict: string, findings: number, model: string, reviewer: string }} ReviewRecord */
/** @typedef {ProofRecord | ReviewRecord} LedgerRecord */

const VERDICTS = ['APPROVE', 'REQUEST_CHANGES', 'BLOCKED'];
/** The scan's skip list when a config sets none. @type {string[]} */
export const DEFAULT_SKIP = ['**/package-lock.json'];
const SCISSORS = /^# -+ >8 -+$/m;

// ---------------------------------------------------------------- pure logic (exported for tests)

/**
 * A glob as a regular expression: `**` any depth, `*` within a folder, `?` one character.
 * @param {string} glob
 */
export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') { re += glob[i + 2] === '/' ? '(?:.*/)?' : '.*'; i += glob[i + 2] === '/' ? 2 : 1; }
    else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += /[.+^${}()|[\]\\]/.test(c) ? `\\${c}` : c;
  }
  return new RegExp(`^${re}$`);
}

/**
 * How much a tier demands. The order tiers are listed in only decides which one a file falls in (first match); which
 * tier governs a change is the most demanding one any of its files falls in.
 * @param {Tier} t
 */
export const demands = (t) => (t.reviews ?? 0) * 1000 + (t.models ?? 1) * 100 + (t.proof === false ? 0 : 10) + (t.gate === false ? 0 : 2) + (t.contract ? 1 : 0);

/**
 * The tier of one file: the first tier whose globs match it.
 * @param {Pick<Config, 'tiers'>} config
 * @param {string} file
 * @returns {Tier}
 */
export function tierOfFile(config, file) {
  return config.tiers.find((t) => t.match.some((g) => globToRegExp(g).test(file))) ?? /** @type {Tier} */ (config.tiers.at(-1));
}

/**
 * The tier of a change: every requirement at its most demanding across the tiers its files fall in, named after the
 * most demanding of them (tiers that don't nest still lose nothing: one's contract, another's two models).
 * @param {Pick<Config, 'tiers'>} config
 * @param {string[]} files
 * @returns {Tier}
 */
export function tierOf(config, files) {
  const tiers = files.map((f) => tierOfFile(config, f));
  return tiers.length ? combine(tiers) : /** @type {Tier} */ (config.tiers.at(-1));
}

/**
 * Tiers combined: every requirement at its most demanding, named after the most demanding tier.
 * @param {Tier[]} tiers
 * @returns {Tier}
 */
function combine(tiers) {
  const top = tiers.reduce((best, t) => (demands(t) > demands(best) ? t : best));
  return {
    name: top.name, match: top.match,
    proof: tiers.some((t) => t.proof !== false),
    reviews: Math.max(...tiers.map((t) => t.reviews ?? 0)),
    models: Math.max(...tiers.map((t) => t.models ?? 1)),
    gate: tiers.some((t) => t.gate !== false),
    contract: tiers.some((t) => Boolean(t.contract)),
  };
}

/**
 * What a change is held to: the stricter of the config it commits and the config before it, tier by tier and for the
 * gate itself, so that no change relaxes its own requirements (a change to the config passes the old rules first).
 * @param {Config} config the config as it will be committed
 * @param {Config | undefined} before the config before the change (none for the first commit)
 * @param {string[]} files
 * @returns {{ tier: Tier, gate: Pick<Config, 'gate' | 'approvers'> }}
 */
export function governing(config, before, files) {
  const tier = before ? combine([tierOf(config, files), tierOf(before, files)]) : tierOf(config, files);
  const humans = [before, config].filter((c) => c?.gate === 'human');
  if (!humans.length) return { tier, gate: { gate: config.gate ?? 'agent' } };
  // Approvers a change can't add itself: only those every human gate in play names.
  const approvers = humans.map((c) => (c?.approvers ?? []).map((a) => a.toLowerCase())).reduce((a, b) => a.filter((x) => b.includes(x)));
  return { tier, gate: { gate: 'human', approvers } };
}

/**
 * The scan's own settings a change is held to: only the skip globs both configs have, and the smaller size limit. The
 * proof steps are the committed config's: changing them is a change to `.agents/`, which its tier reviews.
 * @param {Config} config
 * @param {Config | undefined} before
 * @returns {Config}
 */
export function scanSettings(config, before) {
  if (!before) return config;
  // An unset skip list is the default one; only the globs both lists have stay skipped.
  const theirs = before.secretScan?.skip ?? DEFAULT_SKIP;
  const skip = (config.secretScan?.skip ?? DEFAULT_SKIP).filter((g) => theirs.includes(g));
  return { ...config, secretScan: { skip }, maxFileBytes: Math.min(config.maxFileBytes ?? 1024 * 1024, before.maxFileBytes ?? 1024 * 1024) };
}

/**
 * The latest verdict of each reviewer and model on a tree.
 * @param {LedgerRecord[]} records
 * @param {string} tree
 * @returns {ReviewRecord[]}
 */
export function latestVerdicts(records, tree) {
  /** @type {Map<string, ReviewRecord>} */
  const latest = new Map();
  for (const r of records) if (r.kind === 'review' && r.tree === tree) latest.set(`${r.reviewer}\u0000${r.model.toLowerCase()}`, r);
  return [...latest.values()];
}

/**
 * The approvals that count for a tree: the latest verdict of each reviewer and model, when it is APPROVE.
 * @param {LedgerRecord[]} records
 * @param {string} tree
 */
export const approvals = (records, tree) => latestVerdicts(records, tree).filter((r) => r.verdict === 'APPROVE');

/**
 * The reviews that veto a tree. A REQUEST_CHANGES vetoes it for good: asking again can't overturn it, only a changed
 * tree (a fix) can. A BLOCKED is a review that couldn't happen; it vetoes until a passing proof is recorded after it,
 * and then only while it is that reviewer's latest word on the tree.
 * @param {LedgerRecord[]} records
 * @param {string} tree
 * @returns {ReviewRecord[]}
 */
export function vetoes(records, tree) {
  const proofs = records.filter((r) => r.kind === 'proof' && r.tree === tree && r.ok).map((r) => r.ts);
  const lastProof = proofs.sort().at(-1) ?? '';
  const changes = records.filter(/** @returns {r is ReviewRecord} */ (r) => r.kind === 'review' && r.tree === tree && r.verdict === 'REQUEST_CHANGES');
  const blocked = latestVerdicts(records, tree).filter((r) => r.verdict === 'BLOCKED' && r.ts > lastProof);
  return [...changes, ...blocked];
}

/**
 * A commit message without what git strips: comment lines, and everything below the scissors line (`commit -v`).
 * @param {string} message
 */
const kept = (message) => message.split(SCISSORS)[0].replace(/^#.*$/gm, '');

/**
 * The trailers of a commit message: the `Key: value` lines of its last paragraph (never the subject).
 * @param {string} message
 * @returns {{ key: string, value: string }[]}
 */
export function trailersOf(message) {
  const paragraphs = kept(message).trim().split(/\n\s*\n/);
  if (paragraphs.length < 2) return [];
  return (paragraphs.at(-1) ?? '').split('\n').flatMap((l) => { const m = l.match(/^([A-Za-z][\w-]*):\s*(.*)$/); return m ? [{ key: m[1], value: m[2].trim() }] : []; });
}

/**
 * A Review trailer as the hook writes it: `reviewer · model · VERDICT · N finding(s) · tree <hash>`.
 * @param {string} value
 */
export function parseReview(value) {
  const m = value.match(/^(\S+) · (\S+) · (APPROVE|REQUEST_CHANGES|BLOCKED) · (\d+) finding\(s\) · tree ([0-9a-f]{7,40})$/);
  return m ? { reviewer: m[1], model: m[2].toLowerCase(), verdict: m[3], findings: Number(m[4]), tree: m[5] } : undefined;
}

/**
 * What a commit lacks for its tier. Locally (`records` given) from the ledger, for the staged tree. In the audit of a
 * pushed commit (no `records`) from its trailers, each checked against the commit's own tree and contract.
 * @param {{ config: Pick<Config, 'gate' | 'approvers'>, tier: Tier, message: string, tree: string, records?: LedgerRecord[], contractShaAt?: (contract: string) => string | undefined }} o
 * @returns {string[]}
 */
export function gateProblems({ config, tier, message, tree, records, contractShaAt }) {
  /** @type {string[]} */
  const problems = [];
  const trailers = trailersOf(message);
  /** @param {string} key */
  const all = (key) => trailers.filter((t) => t.key.toLowerCase() === key.toLowerCase()).map((t) => t.value);
  const short = tree.slice(0, 12);
  const proof = records ? /** @type {ProofRecord[]} */ (records.filter((r) => r.kind === 'proof' && r.tree === tree && r.ok)).at(-1) : undefined;
  if (tier.proof !== false) {
    if (records) { if (!proof) problems.push(`no passing proof for this staged tree: run \`agentctl verify\` after staging (tier ${tier.name})`); }
    else {
      const p = all('Proof')[0] ?? '';
      if (!p) problems.push(`no Proof trailer (tier ${tier.name})`);
      else if (!p.endsWith(`tree ${short}`)) problems.push(`the Proof trailer is for another tree than this commit's (${short})`);
    }
  }
  if (tier.contract) {
    if (records) { if (proof && !proof.contract) problems.push(`the proof names no contract: verify again with --contract <file>[#section] (tier ${tier.name})`); }
    else {
      const c = all('Contract')[0] ?? '';
      const m = c.match(/^(.+) · sha256:([0-9a-f]{12})$/);
      if (!m) problems.push(`no Contract trailer (tier ${tier.name})`);
      else if (contractShaAt && !contractShaAt(m[1])?.startsWith(m[2])) problems.push(`the contract ${m[1]} at this commit is not the one proven (sha256:${m[2]})`);
    }
  }
  const reviews = tier.reviews ?? 0;
  if (reviews > 0) {
    /** @type {{ reviewer: string, model: string, verdict: string }[]} */
    const dissent = records ? vetoes(records, tree) : [];
    /** @type {{ reviewer: string, model: string }[]} */
    let ok = records ? approvals(records, tree) : [];
    if (!records) {
      const parsed = all('Review').map(parseReview).filter((r) => r !== undefined && r.tree === short);
      for (const r of parsed) if (r && r.verdict !== 'APPROVE') dissent.push(r);
      ok = /** @type {{ reviewer: string, model: string }[]} */ (parsed.filter((r) => r?.verdict === 'APPROVE'));
    }
    const distinct = new Set(ok.map((r) => `${r.reviewer}|${r.model}`)).size;
    const models = new Set(ok.map((r) => r.model)).size;
    if (dissent.length) problems.push(`a review of this tree did not approve (${dissent.map((r) => `${r.reviewer}/${r.model}: ${r.verdict}`).join(', ')}): change it (fix, stage, verify) and have the new tree reviewed`);
    else if (distinct < reviews) problems.push(`${distinct} approving review(s) of this tree, tier ${tier.name} needs ${reviews}`);
    else if (models < (tier.models ?? 1)) problems.push(`approving reviews come from ${models} model(s), tier ${tier.name} needs ${tier.models}`);
  }
  if (tier.gate !== false) {
    if ((config.gate ?? 'agent') === 'human') {
      const by = all('Approved-by').map((a) => a.toLowerCase());
      const listed = (config.approvers ?? []).map((a) => a.toLowerCase());
      if (!by.length) problems.push('no Approved-by trailer: a person approves this change (gate "human")');
      else if (!by.some((a) => listed.includes(a))) problems.push(`an Approved-by trailer must be exactly one of the config's approvers (${listed.join(', ') || 'none listed'})`);
    } else {
      const gate = all('Gate')[0] ?? '';
      if (gate.length < 40) problems.push('no Gate trailer of at least 40 characters: restate the change in your own words, and name what was not checked');
    }
  }
  return problems;
}

/**
 * The trailers prepare-commit-msg adds, from the ledger, for what the staged tree has on record.
 * @param {Tier} tier
 * @param {LedgerRecord[]} records
 * @param {string} tree
 */
export function recordTrailers(tier, records, tree) {
  const short = tree.slice(0, 12);
  const out = [`Tier: ${tier.name}`];
  const proof = /** @type {ProofRecord[]} */ (records.filter((r) => r.kind === 'proof' && r.tree === tree && r.ok)).at(-1);
  if (proof?.contract) out.push(`Contract: ${proof.contract} · sha256:${(proof.contractSha ?? '').slice(0, 12)}`);
  if (proof) out.push(`Proof: ${proof.steps.map((s) => `${s.name} ok`).join(' · ')} · tree ${short}`);
  for (const r of approvals(records, tree)) out.push(`Review: ${r.reviewer} · ${r.model.toLowerCase()} · ${r.verdict} · ${r.findings} finding(s) · tree ${short}`);
  for (const r of vetoes(records, tree)) out.push(`Review: ${r.reviewer} · ${r.model.toLowerCase()} · ${r.verdict} · ${r.findings} finding(s) · tree ${short}`);
  return [...new Set(out)];
}

/**
 * Adds trailers to a message: into its trailer paragraph when it has one, else as a new last paragraph; above the
 * scissors line of `commit -v`, where git keeps them.
 * @param {string} message
 * @param {string[]} lines
 */
export function withTrailers(message, lines) {
  const cut = message.search(SCISSORS);
  const head = cut < 0 ? message : message.slice(0, cut);
  const tail = cut < 0 ? '' : `\n${message.slice(cut)}`;
  const body = head.replace(/\s+$/, '');
  const have = new Set(trailersOf(body).map((t) => `${t.key}: ${t.value}`));
  const add = lines.filter((l) => !have.has(l));
  if (!add.length) return `${body}\n${tail}`;
  return `${body}${trailersOf(body).length ? '\n' : '\n\n'}${add.join('\n')}\n${tail}`;
}

// Secrets: provider token shapes, private keys, credential assignments, long high-entropy quoted strings.
const SECRET_PATTERNS = new RegExp([
  'AKIA[0-9A-Z]{16}', 'gh[pousr]_[A-Za-z0-9]{36}', 'github_pat_[A-Za-z0-9_]{22,}', 'glpat-[A-Za-z0-9_-]{20,}',
  'xox[baprs]-[A-Za-z0-9-]{10,}', 'AIza[0-9A-Za-z_-]{35}', 'sk-(?:live|test|proj|ant)-[A-Za-z0-9_-]{16,}',
  '(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}', 'eyJ[A-Za-z0-9_-]{10,}\\.eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}',
  '-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED |PGP )?PRIVATE KEY(?: BLOCK)?-----',
].join('|'));
// A key given a value: `key: value`, `"key": "value"`, `KEY=value`, `const key = "value"`, `$env:KEY = "value"`.
// A quoted value runs to its closing quote; an unquoted one, in source code, to the end of the expression.
const PAIR = /([A-Za-z_][A-Za-z0-9_.-]*)["']?\s*(?::|=(?!=))\s*(?:(["'`])((?:(?!\2).){8,}?)\2|([^\s"'`,;)}]{8,}))/g;
// In a configuration file an unquoted value runs to the end of the word: `)`, `}`, `,` and `;` can be part of it.
const PAIR_CONFIG = /([A-Za-z_][A-Za-z0-9_.-]*)["']?\s*(?::|=(?!=))\s*(?:(["'`])((?:(?!\2).){8,}?)\2|([^\s"'`]{8,}))/g;
// A key names a credential when one of its words does (snake, kebab or camel case): DB_PASSWORD, clientSecret,
// GITHUB_TOKEN, api_key, SECRET_KEY. Its last word saying it is about the credential, not one, rules it out
// (passwordRepeat, token_type, secretName).
const CREDENTIAL_WORDS = new Set(['password', 'passwd', 'pass', 'pwd', 'secret', 'token', 'apikey', 'credential', 'credentials', 'privatekey', 'accesskey']);
// The last word saying the key is about a credential rather than one (its type, limit, expiry, location …).
const NOT_A_CREDENTIAL = new Set(['repeat', 'type', 'name', 'field', 'label', 'length', 'policy', 'required', 'url', 'uri', 'path', 'file', 'id', 'env', 'var', 'header', 'prefix', 'regex', 'pattern', 'hint', 'count', 'min', 'max', 'hash', 'endpoint', 'expiry', 'expires', 'ttl', 'at', 'limit', 'limits', 'size', 'page', 'cursor', 'index']);
// Tokens that are not credentials, by the word just before "token": pagination cursors, CSRF tokens, token counts.
const NOT_A_SECRET_TOKEN = new Set(['csrf', 'xsrf', 'page', 'next', 'max', 'min', 'continuation']);
/** @param {string} key */
const keyWords = (key) => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Za-z])([0-9])/g, '$1_$2').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
/** @param {string} key */
export function namesCredential(key) {
  const words = keyWords(key).filter((w) => !/^[0-9]+$/.test(w));
  const joined = words.flatMap((w, i) => (i ? [w, `${words[i - 1]}${w}`] : [w]));
  const credential = joined.filter((w) => CREDENTIAL_WORDS.has(w));
  if (!credential.length || NOT_A_CREDENTIAL.has(words.at(-1) ?? '')) return false;
  // A CSRF or paging token is no credential, unless the key names another credential word too (CSRF_TOKEN_SECRET).
  const t = words.lastIndexOf('token');
  return !(credential.every((w) => w === 'token') && t > 0 && NOT_A_SECRET_TOKEN.has(words[t - 1]));
}
/**
 * Source code (and Markdown, whose examples are code), where an unquoted value can be an expression; configuration
 * files (.env, YAML, properties, shell) hold literals.
 */
const SOURCE = /\.(?:[cm]?[jt]sx?|py|rb|go|java|kt|kts|cs|swift|rs|php|scala|groovy|dart|lua|md|mdx|markdown)$/i;
/**
 * In source code, an unquoted value is code, not a literal, when it calls, indexes, or is a dotted path (`tokens[0]`,
 * `t.slice(0`, `cfg.keys.v2`); a quoted value, or any value in a configuration file, is a literal.
 * @param {string} value
 * @param {boolean} quoted
 * @param {boolean} source
 */
const looksLikeCode = (value, quoted, source) => source && !quoted && (/[([]/.test(value) || /^[A-Za-z_$][\w$]*(\.[\w$]+)+$/.test(value));
// A bearer token or credentials inside a URL.
const BEARER = /\bBearer\s+([A-Za-z0-9._~+/-]{20,}=*)/;
const URL_CREDENTIALS = /\b[a-z][a-z0-9+.-]*:\/\/([^\s/:@$<>]+):([^\s/@$<>]{6,})@/i;
// Not a literal: a reference, a placeholder, or code (a regex, a path, an expression).
const PLACEHOLDER = /^(?:\$\{|\$\(|<|process\.env|env\.|os\.environ|getenv|\{\{|%|\*+$|x+$|example|changeme|placeholder|redacted|dummy|your[_-]|[/\\[({])/i;
const ALLOW = 'agentctl-allow-secret';
/** @param {string} s */
const entropy = (s) => { /** @type {Map<string, number>} */ const n = new Map(); for (const c of s) n.set(c, (n.get(c) ?? 0) + 1); return [...n.values()].reduce((h, k) => h - (k / s.length) * Math.log2(k / s.length), 0); };

/**
 * The lines of a text that look like a secret, with their numbers. A line carrying `agentctl-allow-secret` passes.
 * @param {string} text
 * @param {string} [file] the file's path: in source code an unquoted expression is not taken for a literal
 */
export function secretHits(text, file = '') {
  const source = SOURCE.test(file);
  /** @type {{ line: number, why: string }[]} */
  const hits = [];
  text.split('\n').forEach((line, i) => {
    if (line.includes(ALLOW)) return;
    if (SECRET_PATTERNS.test(line)) { hits.push({ line: i + 1, why: 'token or key pattern' }); return; }
    const literal = (/** @type {string} */ v) => !PLACEHOLDER.test(v) && /[0-9]/.test(v) && /[A-Za-z]/.test(v);
    // PowerShell's `$env:NAME = …` names the key after the prefix.
    const pairs = [...line.replace(/\$?env:(?=[A-Za-z_])/gi, '').matchAll(source ? PAIR : PAIR_CONFIG)];
    // Not a secret: a quoted value with spaces (prose: a validation message, a label; the trade-off is that a passphrase
    // with spaces is missed), or a whole `$NAME` unquoted or in double quotes (a shell expands it there; in single
    // quotes it would not, so `'$NAME'` is taken as written). A `${…}` placeholder (`${env:NAME}`, `${{ secrets.X }}`)
    // is a reference in any quoting (PLACEHOLDER).
    const reference = /^\$(?:[A-Za-z_]\w*|\{[A-Za-z_]\w*\})$/;
    const credential = (/** @type {RegExpMatchArray} */ m) => {
      const quoted = m[2] !== undefined;
      const value = m[3] ?? m[4];
      if (quoted && /\s/.test(value)) return false;
      if ((!quoted || m[2] === '"') && reference.test(value)) return false;
      return namesCredential(m[1]) && literal(value) && !looksLikeCode(value, quoted, source);
    };
    if (pairs.some(credential)) { hits.push({ line: i + 1, why: 'a credential assigned a literal value' }); return; }
    const b = line.match(BEARER);
    if (b && literal(b[1])) { hits.push({ line: i + 1, why: 'a bearer token' }); return; }
    const u = line.match(URL_CREDENTIALS);
    if (u && !PLACEHOLDER.test(u[2])) { hits.push({ line: i + 1, why: 'credentials inside a URL' }); return; }
    for (const m of line.matchAll(/["'`]([A-Za-z0-9+/=_-]{32,})["'`]/g)) {
      const v = m[1];
      if (/[0-9]/.test(v) && /[a-z]/.test(v) && /[A-Z]/.test(v) && entropy(v) >= 4.2) { hits.push({ line: i + 1, why: 'long high-entropy quoted string' }); break; }
    }
  });
  return hits;
}

/**
 * A file's bytes as text: UTF-8, or UTF-16 with a byte-order mark; undefined for binary content.
 * @param {Buffer} bytes
 */
export function asText(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return bytes.subarray(2).toString('utf16le');
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return Buffer.from(bytes.subarray(2)).swap16().toString('utf16le');
  return bytes.includes(0) ? undefined : bytes.toString('utf8');
}

// ---------------------------------------------------------------- git and files

/**
 * @param {string[]} args
 * @param {{ allowFail?: boolean, raw?: boolean }} [opts]
 * @returns {any}
 */
function git(args, opts = {}) {
  const r = spawnSync('git', ['-c', 'core.quotepath=off', ...args], { maxBuffer: 256 * 1024 * 1024, ...(opts.raw ? {} : { encoding: 'utf8' }) });
  if (r.status !== 0 && !opts.allowFail) throw new Error(`git ${args.join(' ')}: ${String(r.stderr || r.stdout).trim()}`);
  return r.status === 0 ? r.stdout : opts.raw ? Buffer.alloc(0) : '';
}
/** @param {string} out */
const nul = (out) => out.split('\0').filter(Boolean);
const root = () => git(['rev-parse', '--show-toplevel']).trim();
/** Every path a staged change touches, both sides of a rename. */
const stagedFiles = () => nul(git(['diff', '--cached', '--name-only', '-z', '--no-renames']));
/** The staged files that exist (what will be committed), for the scans. */
const stagedPresent = () => nul(git(['diff', '--cached', '--name-only', '-z', '--no-renames', '--diff-filter=d']));
const stagedTree = () => git(['write-tree']).trim();
const merging = () => fs.existsSync(path.join(git(['rev-parse', '--git-dir']).trim(), 'MERGE_HEAD'));
/**
 * The files a change is gated by. For a merge in progress, its own files: those staged differently from every side (a
 * conflict resolution, an edit made in the merge, and a file both sides changed that git combined: a combination
 * neither side's proof or review saw); what one side brought unchanged is that side's commits' own.
 */
function gatedFiles() {
  if (!merging()) return stagedFiles();
  const heads = fs.readFileSync(path.join(git(['rev-parse', '--git-dir']).trim(), 'MERGE_HEAD'), 'utf8').split('\n').filter(Boolean);
  return heads.reduce((own, h) => { const differs = new Set(nul(git(['diff', '--cached', '--name-only', '-z', '--no-renames', h]))); return own.filter((f) => differs.has(f)); }, stagedFiles());
}

/**
 * The config as a commit had it (default: HEAD, the config before the staged change), if it had one.
 * @param {string} [rev]
 * @returns {Config | undefined}
 */
function configAt(rev = 'HEAD') {
  const bytes = git(['show', `${rev}:.agents/config.json`], { raw: true, allowFail: true });
  if (!bytes.length) return undefined;
  // A config that can't be read would drop the rules a change is held to: refuse rather than go on without them.
  try { return JSON.parse(bytes.toString('utf8')); } catch { throw new Error(`.agents/config.json at ${rev} can't be read, so the rules before this change are unknown: repair it first`); }
}

/** @param {string} dir */
function loadConfig(dir) {
  const file = path.join(dir, '.agents', 'config.json');
  if (!fs.existsSync(file)) throw new Error(`${file} not found: the agent setup needs its config (see .agents/README.md)`);
  /** @type {Config} */ const c = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!c.tiers?.length) throw new Error('.agents/config.json lists no tiers');
  if (!c.tiers.at(-1)?.match.includes('**')) throw new Error('.agents/config.json: the last tier must match "**", so every file has a tier');
  return c;
}
/** @param {string} dir @param {Config} c */
const ledgerFile = (dir, c) => path.join(dir, c.ledger ?? '.agents/runs/ledger.jsonl');
/**
 * The ledger's records. A line that isn't one could have been a veto, so the gate (`strict`) refuses to go on; the
 * read-only commands warn.
 * @param {string} dir
 * @param {Config} c
 * @param {{ strict?: boolean }} [opts]
 * @returns {LedgerRecord[]}
 */
function readLedger(dir, c, opts = {}) {
  const f = ledgerFile(dir, c);
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).flatMap((l, i) => {
    try {
      const r = JSON.parse(l);
      if (!r || typeof r !== 'object' || !['proof', 'review'].includes(r.kind) || typeof r.tree !== 'string') throw new Error('not a record');
      return [r];
    } catch {
      const what = `${path.relative(dir, f)}:${i + 1} is not a record: a damaged ledger can hide a veto`;
      if (opts.strict) throw new Error(`${what}. Repair or remove that line (and re-run verify and the reviews if unsure), then commit again.`);
      console.error(`⚠ ${what}; check it`);
      return [];
    }
  });
}
/** @param {string} dir @param {Config} c @param {LedgerRecord} record */
function appendLedger(dir, c, record) {
  const f = ledgerFile(dir, c);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.appendFileSync(f, `${JSON.stringify(record)}\n`);
}
/** @param {string[]} args @param {string} name */
const flag = (args, name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const hooksInstalled = () => git(['config', 'core.hooksPath'], { allowFail: true }).trim().replace(/\/$/, '') === '.githooks';

/**
 * The part of a markdown text a contract names: the section under the heading that contains `anchor`, or the table
 * row that does, or the whole text when no anchor is given.
 * @param {string} text
 * @param {string} name
 * @param {string | undefined} anchor
 */
export function contractSection(text, name, anchor) {
  if (!anchor) return text;
  const lines = text.split('\n');
  const start = lines.findIndex((l) => /^#{1,6}\s/.test(l) && l.toLowerCase().includes(anchor.toLowerCase()));
  if (start < 0) {
    const row = lines.find((l) => l.startsWith('|') && l.toLowerCase().includes(anchor.toLowerCase()));
    if (row === undefined) throw new Error(`--contract ${name}#${anchor}: no heading or table row there contains "${anchor}"`);
    return row;
  }
  const level = (lines[start].match(/^#+/) ?? ['#'])[0].length;
  const end = lines.findIndex((l, i) => i > start && new RegExp(`^#{1,${level}}\\s`).test(l));
  return lines.slice(start, end < 0 ? undefined : end).join('\n');
}
/** @param {string} text */
const sha256 = (text) => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex');

/**
 * Scans files for secrets: read from the index (`staged`), from a commit, or from the working tree.
 * @param {Config} config
 * @param {string[]} files
 * @param {(f: string) => Buffer} read
 */
function scanFiles(config, files, read) {
  const skip = (config.secretScan?.skip ?? DEFAULT_SKIP).map(globToRegExp);
  let found = 0;
  let scanned = 0;
  /** @type {string[]} */
  const binary = [];
  for (const f of [...new Set(files)].filter((x) => !skip.some((re) => re.test(x)))) {
    const text = asText(read(f));
    // Binary content (images, archives; also UTF-16 without a byte-order mark) is not scanned, and is said so.
    if (text === undefined) { binary.push(f); continue; }
    scanned++;
    for (const h of secretHits(text, f)) { console.error(`  ${f}:${h.line}: ${h.why}`); found++; }
  }
  const skipped = binary.length ? `not scanned (binary): ${binary.slice(0, 5).join(', ')}${binary.length > 5 ? ` and ${binary.length - 5} more` : ''}` : '';
  if (skipped) console.log(`  ${skipped}`);
  return { found, scanned, skipped };
}
/** @param {string} f */
const readStaged = (f) => git(['show', `:${f}`], { raw: true });

// ---------------------------------------------------------------- commands

/** @param {string[]} args */
function verify(args) {
  const dir = root();
  const config = loadConfig(dir);
  const dirty = () => [...nul(git(['diff', '--name-only', '-z'])), ...nul(git(['ls-files', '--others', '--exclude-standard', '-z']))];
  const before = dirty();
  if (before.length) {
    console.error(`✖ stage everything first: the proof runs on the working tree and is bound to the staged tree.\n  not staged: ${before.slice(0, 10).join(', ')}${before.length > 10 ? ', …' : ''}`);
    return 1;
  }
  const files = stagedFiles();
  if (!files.length) { console.error('✖ nothing is staged'); return 1; }
  if (!hooksInstalled()) console.log('⚠ the hooks are not installed in this clone: node .agents/scripts/agentctl.mjs install-hooks');
  const tree = stagedTree();
  const { tier, gate } = governing(config, configAt(), files);
  const contractArg = flag(args, 'contract');
  let contract; let contractSha; let asked = '(no contract given: --contract <file>[#section])';
  if (contractArg) {
    const [file, anchor] = contractArg.split('#');
    const abs = path.join(dir, file);
    if (!fs.existsSync(abs)) { console.error(`✖ --contract ${file}: not found`); return 1; }
    asked = contractSection(fs.readFileSync(abs, 'utf8'), file, anchor);
    contract = contractArg;
    contractSha = sha256(asked);
  } else if (tier.contract) { console.error(`✖ tier ${tier.name} needs a contract: --contract <file>[#section]`); return 1; }
  const scan = scanFiles(scanSettings(config, configAt()), stagedPresent(), readStaged);
  /** @type {{ name: string, exit: number, ms: number }[]} */
  const steps = [{ name: 'secrets', exit: scan.found ? 1 : 0, ms: 0 }];
  const outputs = [{ step: { name: 'secrets', run: 'agentctl scan-secrets --staged' }, exit: scan.found ? 1 : 0, tail: [`${scan.found} hit(s) in ${scan.scanned} file(s)`, scan.skipped].filter(Boolean).join('\n') }];
  console.log(`${scan.found ? '✖' : '✔'} secrets: ${scan.found} hit(s) in ${scan.scanned} staged file(s)`);
  if (!scan.found) for (const step of config.proof) {
    const t0 = Date.now();
    console.log(`▶ ${step.name}: ${step.run}`);
    const r = spawnSync(step.run, { cwd: dir, shell: true, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const exit = r.status ?? 1;
    steps.push({ name: step.name, exit, ms: Date.now() - t0 });
    outputs.push({ step, exit, tail: `${r.stdout ?? ''}${r.stderr ?? ''}`.trimEnd().split('\n').slice(-20).join('\n') });
    console.log(`  ${exit === 0 ? '✔' : '✖'} ${step.name} (exit ${exit}, ${Math.round((Date.now() - t0) / 1000)} s)`);
    if (exit !== 0) break;
  }
  // A step that rewrote files (a formatter, generated output) proved another tree than the one staged.
  const changed = dirty();
  const sameTree = stagedTree() === tree && !changed.length;
  if (!sameTree) console.error(`✖ the proof steps changed the working tree (${changed.slice(0, 5).join(', ')}): stage the result and verify again`);
  const ok = sameTree && steps.length === config.proof.length + 1 && steps.every((s) => s.exit === 0);
  const head = git(['rev-parse', 'HEAD'], { allowFail: true }).trim() || 'none';
  const packet = path.join(dir, config.packet ?? '.agents/runs/packet.md');
  fs.mkdirSync(path.dirname(packet), { recursive: true });
  fs.writeFileSync(packet, [
    `# PR packet — ${new Date().toISOString()}`, '',
    `- Staged tree: \`${tree}\` (on ${head.slice(0, 12)})`,
    `- Tier: **${tier.name}**: proof ${tier.proof === false ? 'not required' : 'required'}, ${tier.reviews ?? 0} review(s)${(tier.models ?? 1) > 1 ? ` from ${tier.models} models` : ''}, gate ${tier.gate === false ? 'not required' : gate.gate}`,
    `- Contract: ${contract ? `${contract} (sha256 of the section: ${contractSha})` : 'none'}`, '',
    '## What was asked', '', asked.split('\n').slice(0, 120).join('\n'), '',
    '## What changed', '', '```', git(['diff', '--cached', '--stat', '--no-renames']).trimEnd(), '```', '',
    '## What was run', '',
    ...outputs.flatMap((o) => [`### ${o.step.name}: \`${o.step.run}\` → exit ${o.exit}`, '', '```', o.tail, '```', '']),
    '## What the reviewer could not check', '', '- (the reviewer fills this in its reply)', '',
    '## Verdict', '', ok ? '- READY FOR REVIEW: every step passed on this tree.' : '- NOT READY: a step failed or the tree changed. Do not review; fix first.', '',
  ].join('\n'));
  /** @type {ProofRecord} */ const record = { kind: 'proof', ts: new Date().toISOString(), tree, ok, steps, ...(contract ? { contract, contractSha } : {}), head };
  appendLedger(dir, config, record);
  console.log(`${ok ? '✔' : '✖'} ${ok ? 'proven' : 'not proven'}: tree ${tree.slice(0, 12)}, tier ${tier.name} → ${path.relative(dir, packet)}`);
  if (ok && (tier.reviews ?? 0) > 0) console.log(`  next: ${tier.reviews} independent review(s) of the staged diff (the code-reviewer agent${(tier.models ?? 1) > 1 ? `, on ${tier.models} models` : ''}), then commit with a Gate: trailer`);
  return ok ? 0 : 1;
}

/** @param {string[]} args */
function review(args) {
  const dir = root();
  const config = loadConfig(dir);
  const verdict = flag(args, 'verdict');
  const findings = Number(flag(args, 'findings') ?? NaN);
  const model = flag(args, 'model');
  const reviewer = flag(args, 'reviewer') ?? 'code-reviewer';
  if (!verdict || !VERDICTS.includes(verdict)) { console.error(`✖ --verdict ${VERDICTS.join('|')}`); return 1; }
  if (!Number.isInteger(findings) || findings < 0) { console.error('✖ --findings N (how many findings the review reports)'); return 1; }
  if (!model || !/^[\w.-]+$/.test(model)) { console.error('✖ --model <the model that reviewed, as its id: letters, digits, dots, dashes>'); return 1; }
  if (!/^[\w.-]+$/.test(reviewer)) { console.error('✖ --reviewer <name: letters, digits, dots, dashes>'); return 1; }
  const tree = stagedTree();
  const records = readLedger(dir, config, { strict: true });
  if (verdict === 'APPROVE' && !records.some((r) => r.kind === 'proof' && r.tree === tree && r.ok)) {
    console.error('✖ no passing proof for the staged tree: an approval needs one (agentctl verify). Report BLOCKED instead.'); return 1;
  }
  /** @type {ReviewRecord} */ const record = { kind: 'review', ts: new Date().toISOString(), tree, verdict, findings, model: model.toLowerCase(), reviewer };
  appendLedger(dir, config, record);
  console.log(`✔ ${reviewer} (${record.model}): ${verdict}, ${findings} finding(s), recorded for tree ${tree.slice(0, 12)}`);
  return 0;
}

function status() {
  const dir = root();
  const config = loadConfig(dir);
  if (!hooksInstalled()) console.log('⚠ the hooks are not installed in this clone: node .agents/scripts/agentctl.mjs install-hooks');
  const files = stagedFiles();
  if (!files.length) { console.log('nothing staged'); return 0; }
  const tree = stagedTree();
  const { tier, gate } = governing(config, configAt(), gatedFiles());
  const records = readLedger(dir, config);
  console.log(`staged: ${files.length} file(s), tree ${tree.slice(0, 12)}, tier ${tier.name}`);
  for (const f of files.slice(0, 20)) console.log(`  ${tierOfFile(config, f).name.padEnd(10)} ${f}`);
  if (files.length > 20) console.log(`  … ${files.length - 20} more`);
  const proof = records.filter(/** @returns {r is ProofRecord} */ (r) => r.kind === 'proof' && r.tree === tree).at(-1);
  console.log(`proof:   ${proof ? (proof.ok ? `passed ${proof.ts}${proof.contract ? `, contract ${proof.contract}` : ''}` : `FAILED ${proof.ts}`) : tier.proof === false ? 'not required' : 'none yet (agentctl verify)'}`);
  const verdicts = latestVerdicts(records, tree);
  console.log(`reviews: ${verdicts.length ? verdicts.map((r) => `${r.reviewer}/${r.model} ${r.verdict}`).join(', ') : 'none'} (tier needs ${tier.reviews ?? 0}${(tier.models ?? 1) > 1 ? ` from ${tier.models} models` : ''})`);
  // The commit message's own trailer (Gate or Approved-by) is written at commit time: everything else is checked here.
  const missing = gateProblems({ config: gate, tier: { ...tier, gate: false }, message: '', tree, records });
  console.log(missing.length ? `missing: ${missing.join('; ')}` : `✔ ready to commit${tier.gate === false ? '' : gate.gate === 'human' ? ' (a person adds Approved-by:)' : ' (with a Gate: trailer)'}`);
  return 0;
}

/** @param {string[]} args */
function scanSecrets(args) {
  const dir = root();
  const config = fs.existsSync(path.join(dir, '.agents', 'config.json')) ? loadConfig(dir) : /** @type {Config} */ ({ proof: [], tiers: [{ name: 'all', match: ['**'] }] });
  const staged = args[0] === '--staged';
  // A path that can't be read is an error, never "clean".
  const { found, scanned } = staged ? scanFiles(scanSettings(config, configAt()), stagedPresent(), readStaged)
    : scanFiles(config, args.map((a) => path.relative(dir, path.resolve(a)).split(path.sep).join('/')), (f) => fs.readFileSync(path.join(dir, f)));
  console.log(found ? `✖ scan-secrets: ${found} hit(s)` : `✔ scan-secrets: clean (${scanned} file(s))`);
  return found ? 1 : 0;
}

function preCommit() {
  const dir = root();
  const config = loadConfig(dir);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD'], { allowFail: true }).trim();
  if ((config.branchPolicy ?? 'proof') === 'no-direct-commits' && (config.protectedBranches ?? ['main', 'master']).includes(branch)) {
    console.error(`✖ pre-commit: no direct commits to ${branch}: commit on a branch and open a pull request`); return 1;
  }
  if (scanSecrets(['--staged']) !== 0) { console.error(`✖ pre-commit: a staged file looks like it holds a secret (above). Remove it (if one was ever committed, rotate it); a known non-secret line can carry "${ALLOW}" with the reason.`); return 1; }
  const limit = scanSettings(config, configAt()).maxFileBytes ?? 1024 * 1024;
  const big = stagedPresent().filter((f) => Number(git(['cat-file', '-s', `:${f}`])) > limit);
  if (big.length) { console.error(`✖ pre-commit: over ${limit} bytes: ${big.join(', ')}`); return 1; }
  const files = gatedFiles();
  const { tier } = governing(config, configAt(), files);
  if (files.length && tier.proof !== false && !readLedger(dir, config, { strict: true }).some((r) => r.kind === 'proof' && r.tree === stagedTree() && r.ok)) {
    console.error(`✖ pre-commit: no passing proof for the staged tree (tier ${tier.name}): node .agents/scripts/agentctl.mjs verify`); return 1;
  }
  return 0;
}

/** @param {string[]} args */
function prepareCommitMsg([file, source]) {
  if (!file || source === 'squash') return 0;
  const dir = root();
  const config = loadConfig(dir);
  const files = gatedFiles();
  if (!files.length) return 0;
  const tree = stagedTree();
  fs.writeFileSync(file, withTrailers(fs.readFileSync(file, 'utf8'), recordTrailers(governing(config, configAt(), files).tier, readLedger(dir, config, { strict: true }), tree)));
  return 0;
}

/** @param {string[]} args */
function commitMsg([file]) {
  const dir = root();
  const config = loadConfig(dir);
  // A merge is gated by its own files only (gatedFiles): none when the sides touched different files. A message-only
  // amend stages nothing new; an amend is tiered against HEAD here, against its real parent in the audit.
  const files = gatedFiles();
  if (!files.length) return 0;
  const tree = stagedTree();
  const records = readLedger(dir, config, { strict: true });
  const held = governing(config, configAt(), files);
  const problems = gateProblems({ config: held.gate, tier: held.tier, message: fs.readFileSync(file, 'utf8'), tree, records });
  // The contract proven must still say the same, in the version being committed.
  const proof = /** @type {ProofRecord[]} */ (records.filter((r) => r.kind === 'proof' && r.tree === tree && r.ok)).at(-1);
  if (proof?.contract) {
    const [f, anchor] = proof.contract.split('#');
    // The contract as it will be committed; one outside version control as it is on disk.
    const staged = git(['show', `:${f}`], { raw: true, allowFail: true });
    const text = staged.length ? asText(staged) : fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8') : undefined;
    let now;
    try { now = text === undefined ? undefined : sha256(contractSection(text, f, anchor)); } catch { /* the section is gone */ }
    if (now === undefined) problems.push(`the contract ${proof.contract} can't be read`);
    else if (now !== proof.contractSha) problems.push(`the contract ${proof.contract} changed since it was proven: verify again`);
  }
  if (problems.length) { console.error(`✖ commit refused by the gate:\n${problems.map((p) => `  - ${p}`).join('\n')}`); return 1; }
  return 0;
}

/**
 * A range to audit: as given, or from the merge base with the remote's default branch (a new branch's first push).
 * @param {string} range
 */
export function rangeOf(range) {
  if (range !== 'auto') return range;
  const head = git(['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD'], { allowFail: true }).trim()
    || ['origin/main', 'origin/master'].find((b) => git(['rev-parse', '--verify', '--quiet', b], { allowFail: true }).trim()) || '';
  const base = head ? git(['merge-base', 'HEAD', head], { allowFail: true }).trim() : '';
  return base ? `${base}..HEAD` : 'HEAD';
}

/** @param {string[]} args */
function audit([given]) {
  if (!given) { console.error('usage: agentctl audit <git range | auto>, e.g. origin/main..HEAD'); return 1; }
  const dir = root();
  const config = loadConfig(dir);
  const range = rangeOf(given);
  let bad = 0;
  let found = 0;
  let scanned = 0;
  let gated = 0;
  const big = [];
  // Every commit's own files are scanned as that commit has them, merges included (a secret added and removed in one
  // push stays in history). The gate applies to the commits that make changes; a merge only brings them together.
  const all = git(['rev-list', range]).split('\n').filter(Boolean);
  const merges = new Set(git(['rev-list', '--merges', range]).split('\n').filter(Boolean));
  for (const c of all) {
    // A merge's own files are the ones that differ from every parent (a conflict resolution, an evil merge): what either
    // side brought is that side's commits' own, whichever way the merge goes (combined diff).
    const files = merges.has(c) ? nul(git(['diff-tree', '--no-commit-id', '-r', '-c', '--name-only', '-z', c]))
      : nul(git(['diff-tree', '--no-commit-id', '--name-only', '-r', '-z', '--root', '--no-renames', c]));
    const present = files.filter((f) => git(['cat-file', '-t', `${c}:${f}`], { allowFail: true }).trim() === 'blob');
    // Scanned as the commit's own config and the one before it allow together (a commit can't skip itself out).
    const settings = scanSettings(configAt(c) ?? config, configAt(`${c}^`));
    const limit = settings.maxFileBytes ?? 1024 * 1024;
    const scan = scanFiles(settings, present, (f) => git(['show', `${c}:${f}`], { raw: true }));
    found += scan.found;
    scanned += scan.scanned;
    big.push(...present.filter((f) => Number(git(['cat-file', '-s', `${c}:${f}`])) > limit).map((f) => `${c.slice(0, 10)}:${f}`));
    // A merge whose sides touched different files has none of its own and nothing to gate; one with files that differ
    // from every parent (a resolution, an edit, a file git combined from both sides) is gated by them.
    if (merges.has(c) && !files.length) continue;
    gated++;
    // Held, as at commit time, to the stricter of the config it committed and the one before it.
    const { tier, gate } = governing(configAt(c) ?? config, configAt(`${c}^`), files);
    /** @param {string} contract */
    const contractShaAt = (contract) => {
      const [f, anchor] = contract.split('#');
      const bytes = git(['show', `${c}:${f}`], { raw: true, allowFail: true });
      const text = bytes.length ? asText(bytes) : undefined;
      try { return text === undefined ? undefined : sha256(contractSection(text, f, anchor)); } catch { return undefined; }
    };
    const tree = git(['rev-parse', `${c}^{tree}`]).trim();
    const problems = gateProblems({ config: gate, tier, message: git(['log', '-1', '--format=%B', c]), tree, contractShaAt });
    if (problems.length) { bad++; console.error(`✖ ${c.slice(0, 10)} (tier ${tier.name}): ${problems.join('; ')}`); }
  }
  if (big.length) console.error(`✖ over the size limit: ${big.join(', ')}`);
  console.log(bad ? `✖ audit (${range}): ${bad} of ${gated} commit(s) lack what their tier needs, or carry trailers that don't match them` : `✔ audit (${range}): ${gated} commit(s) carry trailers consistent with their tier, tree and contract`);
  console.log(found ? `✖ audit: ${found} possible secret(s) in the commits' own files` : `✔ audit: no secret in the ${scanned} file version(s) the commits changed`);
  return bad || found || big.length ? 1 : 0;
}

/**
 * CI: install, every proof step, then the audit of the commits a push or pull request brings.
 * @param {string[]} args
 */
function ci(args) {
  const dir = root();
  const config = loadConfig(dir);
  for (const step of [...(config.install ? [{ name: 'install', run: config.install }] : []), ...config.proof]) {
    console.log(`▶ ${step.name}: ${step.run}`);
    const r = spawnSync(step.run, { cwd: dir, shell: true, stdio: 'inherit' });
    if (r.status !== 0) { console.error(`✖ ${step.name} failed (exit ${r.status})`); return 1; }
  }
  const range = flag(args, 'audit');
  return range ? audit([range]) : 0;
}

function installHooks() {
  git(['config', 'core.hooksPath', '.githooks']);
  console.log('✔ hooks installed: git config core.hooksPath .githooks');
  return 0;
}

/**
 * @param {string[]} argv
 * @returns {number}
 */
export function main(argv) {
  const [cmd, ...args] = argv;
  switch (cmd) {
    case 'verify': return verify(args);
    case 'review': return review(args);
    case 'status': return status();
    case 'install-hooks': return installHooks();
    case 'scan-secrets': return scanSecrets(args);
    case 'audit': return audit(args);
    case 'ci': return ci(args);
    case 'hook': {
      const [name, ...rest] = args;
      if (name === 'pre-commit') return preCommit();
      if (name === 'prepare-commit-msg') return prepareCommitMsg(rest);
      if (name === 'commit-msg') return commitMsg(rest);
      console.error(`unknown hook ${name}`); return 1;
    }
    default:
      console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').match(/^\/\*\*([\s\S]*?)\*\//m)?.[1].replace(/^ \* ?/gm, '').trim());
      return cmd ? 1 : 0;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (e) { console.error(`✖ ${e instanceof Error ? e.message : e}`); process.exitCode = 1; }
}
