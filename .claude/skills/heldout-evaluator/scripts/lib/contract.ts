/**
 * Requirement contract — the normalised, source-anchored shape of a story (phase 1b).
 *
 * Jira stories arrive in any format (headings or none, AC custom field or bullets in the description,
 * Given/When/Then, numbered lists, tables, rules in a CSV, an API spec in an attachment, screenshots…).
 * A MODEL reads them (the heldout-contract-extractor subagent) and writes ONE shape,
 * `evaluations/<KEY>/requirement-contract.json`; an independent reviewer subagent checks it. This module only
 * validates, mechanically:
 *
 *  - Every AC is **quoted verbatim** from a cited source file, and the quote is verified, so an acceptance
 *    criterion cannot be invented or silently paraphrased. Coverage and literal grounding: see ./evidence.ts.
 *  - Missing but required elements are recorded as **gaps** with the resolution ladder that was tried:
 *    requirement (story + attachments) → AUT (black-box discovery) → project config → the user.
 *  - **Oracle vs mechanics.** A gap about HOW to exercise the AUT (a path, an auth header, where a journey
 *    starts) may be discovered from the AUT. A gap about WHAT is correct (a status code, a message, a limit)
 *    may never be — copying the AUT's behaviour into the oracle would make the evaluation circular. Oracle
 *    gaps are answered by the requirement or the user, or stay open / an explicit assumption.
 *  - The contract records the requirement revision (hashes) it was built from, so a re-fetch that changes
 *    the story makes it stale; its oracle part is frozen with the draft tests (integrity).
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { checkCoverage, checkLiterals, type CoverageEntry } from './evidence';

export const CONTRACT_FILE = 'requirement-contract.json';
export type Layer = 'ui' | 'api' | 'e2e';
export type GapResolution = 'found-in-requirement' | 'found-in-config' | 'discovered-in-aut' | 'provided-by-user' | 'assumed' | 'open';
export type LadderStep = 'story' | 'attachments' | 'aut' | 'config' | 'user';

export interface ContractAC {
  id: string;
  /** Normalised statement used in scenarios.feature (`# AC-n: <text>`). */
  text: string;
  /** Verbatim excerpt from the source that states this criterion (verified against the file). */
  quote: string;
  /** Source file relative to requirement/, optionally with a line: "story.md#L19", "attachments/rules.csv#L4". */
  source: string;
  layer: Layer;
  /** Observable outcomes that decide pass/fail (status codes, messages, visible state). */
  outcomes: string[];
  /** Endpoint keys this AC exercises ("POST /api/users"). Required for api/e2e ACs. */
  endpoints?: string[];
  /** Where the UI journey starts (page/route/screen), for ui/e2e ACs. */
  entryPoint?: string;
  /** Needs pre-existing data/state (→ seeding). */
  needsData?: boolean;
  /** Gap ids that affect this AC. */
  gaps?: string[];
}

export interface ContractEndpoint {
  method: string; path: string; auth?: 'required' | 'optional' | 'none';
  /** Free-text description of the request body (for people). */
  request?: string;
  /** Machine-checkable request shape: top-level wrapper key ({"article": {…}}) and the field names the body uses. */
  envelope?: string;
  requestFields?: string[];
  success?: string; source: string;
}
export interface SourceRead { file: string; read: boolean; contributes?: string }
export interface Gap {
  id: string;
  /** What is missing, e.g. "error status for wrong login credentials", "API base path". */
  element: string;
  /** mechanics = HOW to exercise the AUT; oracle = WHAT the correct behaviour is. */
  kind: 'mechanics' | 'oracle';
  required: boolean;
  affects: string[];
  /** Resolution ladder actually walked, in order. */
  tried: { where: LadderStep; result: string }[];
  resolution: GapResolution;
  value?: string;
  /** For discovered-in-aut: the probe output / file; for provided-by-user: who and when. */
  evidence?: string;
}

export interface RequirementContract {
  key: string;
  title: string;
  revision: { story: string; attachments: Record<string, string> };
  context?: string;
  actors?: string[];
  sourcesRead: SourceRead[];
  acceptanceCriteria: ContractAC[];
  endpoints: ContractEndpoint[];
  /** Business rules, boundaries and validation tables (each quoted from its source). */
  rules: { id: string; text: string; source: string }[];
  /** Error cases the sources state, E1… in source order. */
  errorModel: { id: string; case: string; status?: number; body?: string; source: string }[];
  auth?: { mechanism: string; credentials?: string; source: string };
  testData?: { strategy: string; constraints?: string[]; cleanup?: string; source?: string };
  nonFunctional?: { id: string; text: string; source: string }[];
  outOfScope?: string[];
  gaps: Gap[];
  /** Where every requirement-bearing source line went (captured as …, or dismissed with a reason). */
  coverage: CoverageEntry[];
}

export interface ContractFinding { level: 'error' | 'warn'; code: string; message: string }

// ---- revision -----------------------------------------------------------------------------------

const sha = (b: Buffer | string) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
/** story.md without the volatile fetch timestamp. */
const storyBody = (md: string) => md.replace(/^fetchedAt: .*$/m, '').trim();

export function requirementRevision(reqDir: string): RequirementContract['revision'] {
  const storyFile = path.join(reqDir, 'story.md');
  const attDir = path.join(reqDir, 'attachments');
  const attachments: Record<string, string> = {};
  if (fs.existsSync(attDir)) for (const f of fs.readdirSync(attDir).sort()) {
    const full = path.join(attDir, f);
    if (fs.statSync(full).isFile()) attachments[f] = sha(fs.readFileSync(full));
  }
  return { story: fs.existsSync(storyFile) ? sha(storyBody(fs.readFileSync(storyFile, 'utf8'))) : '', attachments };
}

// ---- quote anchoring ----------------------------------------------------------------------------

/** Normalise text for quote matching: markdown/table punctuation, quotes, dashes and whitespace. */
export function normaliseText(s: string): string {
  return s.toLowerCase()
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
    // Emphasis/code markers vanish ("(**201**)" ≡ "(201)"); structural ones (headings, quotes, table pipes) separate words.
    .replace(/[*_`]+/g, '').replace(/[#>|]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parseSource(ref: string): { file: string; line?: number } {
  const m = ref.match(/^(.+?)(?:#L(\d+))?$/);
  return { file: m?.[1] ?? ref, line: m?.[2] ? Number(m[2]) : undefined };
}

/** Is `quote` present in the cited source? `near` is true when a cited line is within ±3 lines of the match. */
export function locateQuote(reqDir: string, ref: string, quote: string): { found: boolean; near?: boolean; reason?: string } {
  const { file, line } = parseSource(ref);
  const full = path.join(reqDir, file);
  if (!fs.existsSync(full)) return { found: false, reason: `source ${file} does not exist under requirement/` };
  const q = normaliseText(quote);
  if (q.length < 8) return { found: false, reason: 'quote is too short to anchor (< 8 characters)' };
  const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
  if (!normaliseText(lines.join('\n')).includes(q)) return { found: false, reason: `quote not found in ${file}` };
  if (!line) return { found: true };
  // The window grows with the quote: a multi-line quote (a Gherkin block) starts at the cited line and runs on.
  let end = line - 1;
  let span = '';
  while (end < lines.length && normaliseText(span).length < q.length) span += `\n${lines[end++]}`;
  const window = normaliseText(lines.slice(Math.max(0, line - 4), end + 3).join('\n'));
  return { found: true, near: window.includes(q) };
}

/** Files the agent must read: story.md plus every attachment (non-text ones are read with vision/PDF tools). */
export function requirementFiles(reqDir: string): string[] {
  const attDir = path.join(reqDir, 'attachments');
  return ['story.md', ...(fs.existsSync(attDir) ? fs.readdirSync(attDir).sort().map((f) => `attachments/${f}`) : [])];
}

/** Empty contract bound to the current requirement revision; the model fills it in from the evidence pack. */
export function skeletonContract(key: string, reqDir: string): RequirementContract {
  const files = requirementFiles(reqDir);
  const title = fs.existsSync(path.join(reqDir, 'story.md'))
    ? (fs.readFileSync(path.join(reqDir, 'story.md'), 'utf8').match(/^summary:\s*"?(.*?)"?\s*$/m)?.[1] ?? '') : '';
  return {
    key, title, revision: requirementRevision(reqDir),
    sourcesRead: files.map((file) => ({ file, read: false })),
    acceptanceCriteria: [], endpoints: [], rules: [], errorModel: [], gaps: [], coverage: [],
  };
}

// ---- validation ---------------------------------------------------------------------------------

const epKey = (e: { method: string; path: string }) => `${e.method.toUpperCase()} ${e.path.replace(/\/+$/, '') || '/'}`;
const LADDER_ORDER: LadderStep[] = ['story', 'attachments', 'aut', 'config', 'user'];

export interface CheckOptions {
  /** The AUT profile has an API origin (required when any AC is api/e2e). */
  hasApiBase?: boolean;
}

export function checkContract(c: RequirementContract, reqDir: string, opts: CheckOptions = {}): ContractFinding[] {
  const out: ContractFinding[] = [];
  const err = (code: string, message: string) => out.push({ level: 'error', code, message });
  const warn = (code: string, message: string) => out.push({ level: 'warn', code, message });

  // Revision: the contract must describe the requirement as fetched now.
  const now = requirementRevision(reqDir);
  if (c.revision?.story !== now.story) err('contract-stale', 'story.md changed since the contract was built (re-fetch / revision) — rebuild the contract, then re-review scenarios');
  const was = c.revision?.attachments ?? {};
  const attDiff = [...new Set([...Object.keys(was), ...Object.keys(now.attachments)])].filter((f) => was[f] !== now.attachments[f]);
  if (attDiff.length) err('contract-stale', `attachments changed since the contract was built: ${attDiff.join(', ')}`);

  // Every source must have been read.
  for (const file of requirementFiles(reqDir)) {
    const s = c.sourcesRead?.find((x) => x.file === file);
    if (!s || !s.read) err('source-unread', `${file} is not marked read in sourcesRead — read every attachment (images/PDFs with the Read tool) before building the contract`);
  }

  // Acceptance criteria: present, unique, anchored, observable.
  if (!c.acceptanceCriteria?.length) err('no-acs', 'The contract has no acceptance criteria. If the story has none, record a required oracle gap and ask the user — do not invent criteria.');
  const ids = new Set<string>();
  const endpointKeys = new Set((c.endpoints ?? []).map(epKey));
  const gapIds = new Set((c.gaps ?? []).map((g) => g.id));
  for (const ac of c.acceptanceCriteria ?? []) {
    if (!/^AC-\d+$/.test(ac.id)) err('ac-id', `"${ac.id}" is not an AC-n id`);
    if (ids.has(ac.id)) err('ac-duplicate', `${ac.id} appears twice`);
    ids.add(ac.id);
    // Images / PDFs / office files can't be quoted directly: the evaluator transcribes them (Read tool) into
    // requirement/transcripts/<file>.md whose first line is "transcribedFrom: attachments/<file>".
    const srcFile = parseSource(ac.source ?? '').file;
    if (/\.(png|jpe?g|gif|webp|bmp|pdf|docx?|xlsx?|pptx?)$/i.test(srcFile)) {
      err('quote-from-binary', `${ac.id} cites ${srcFile} directly — transcribe it to transcripts/${path.basename(srcFile)}.md ("transcribedFrom: ${srcFile}" on the first line) and cite the transcript`);
    } else if (srcFile.startsWith('transcripts/')) {
      const tFile = path.join(reqDir, srcFile);
      const origin = fs.existsSync(tFile) ? fs.readFileSync(tFile, 'utf8').match(/^transcribedFrom:\s*(\S+)/m)?.[1] : undefined;
      if (!origin) err('transcript-origin', `${ac.id}: ${srcFile} must start with "transcribedFrom: attachments/<file>"`);
      else if (!fs.existsSync(path.join(reqDir, origin))) err('transcript-origin', `${ac.id}: ${srcFile} says it was transcribed from ${origin}, which does not exist`);
      else warn('quote-from-transcript', `${ac.id} is quoted from the evaluator's transcript of ${origin} — the reviewer should compare it with the original`);
    }
    const loc = locateQuote(reqDir, ac.source ?? '', ac.quote ?? '');
    if (!loc.found) err('quote-not-found', `${ac.id}: ${loc.reason} — every criterion must be quoted verbatim from its source`);
    else if (loc.near === false) warn('source-line-drift', `${ac.id}: quote found in ${parseSource(ac.source).file} but not near the cited line`);
    const acGaps = (ac.gaps ?? []).filter((g) => gapIds.has(g));
    for (const g of ac.gaps ?? []) if (!gapIds.has(g)) err('unknown-gap', `${ac.id} references gap ${g}, which is not in gaps[]`);
    if (!ac.outcomes?.length && !acGaps.length) err('no-outcome', `${ac.id} has no observable outcome — add one, or record an oracle gap ("what does success/failure look like?")`);
    if (!['ui', 'api', 'e2e'].includes(ac.layer)) err('ac-layer', `${ac.id}: layer must be ui, api or e2e`);
    if (ac.layer !== 'ui') {
      if (!ac.endpoints?.length && !acGaps.length) err('no-endpoint', `${ac.id} is ${ac.layer} but names no endpoint — find it in the requirement, discover it (mechanics gap) or ask`);
      for (const e of ac.endpoints ?? []) {
        const [m, p] = e.split(/\s+/);
        if (!endpointKeys.has(epKey({ method: m ?? '', path: p ?? '' }))) err('endpoint-undeclared', `${ac.id} uses "${e}", which is not in endpoints[]`);
      }
    }
    if (ac.layer !== 'api' && !ac.entryPoint && !acGaps.length) warn('no-entry-point', `${ac.id} is ${ac.layer} but has no entryPoint (where does the journey start?)`);
  }

  // Endpoints and auth.
  for (const e of c.endpoints ?? []) {
    if (!/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(e.method)) err('endpoint-method', `endpoint "${e.method} ${e.path}" has an unknown method`);
    if (!e.source) err('endpoint-source', `endpoint ${epKey(e)} has no source (requirement file or the gap that discovered it)`);
  }
  if ((c.endpoints ?? []).some((e) => e.auth === 'required') && !c.auth?.mechanism) err('no-auth', 'Some endpoints require authentication but auth.mechanism is not stated');
  if ((c.acceptanceCriteria ?? []).some((a) => a.layer !== 'ui') && opts.hasApiBase === false) err('no-api-base', 'API criteria exist but the AUT profile has no apiBaseURL (config gap)');
  if (!c.testData?.strategy) warn('no-test-data', 'testData.strategy is empty — say how data is created (seeding API, fixtures) or "none needed"');

  // Rules and error model: ids the reviewer and the coverage ledger refer to.
  const itemIds = new Set<string>();
  for (const r of c.rules ?? []) {
    if (!/^R\d+$/.test(r.id)) err('rule-id', `rule "${r.id}" is not an R<n> id`);
    if (itemIds.has(r.id)) err('rule-duplicate', `${r.id} appears twice`);
    itemIds.add(r.id);
  }
  for (const e of c.errorModel ?? []) {
    if (!/^E\d+$/.test(e.id ?? '')) err('error-id', `error-model entry "${e.case}" needs an id E<n>`);
    else if (itemIds.has(e.id)) err('error-duplicate', `${e.id} appears twice`);
    itemIds.add(e.id);
  }

  // Gaps: ladder, oracle/mechanics rule, resolution evidence.
  for (const g of c.gaps ?? []) {
    const tried = (g.tried ?? []).map((t) => t.where);
    if (g.kind === 'oracle' && g.resolution === 'discovered-in-aut') {
      err('oracle-from-aut', `${g.id} (${g.element}) is about expected behaviour but was "discovered in the AUT" — that makes the oracle circular. Ask the user, or keep it open / an explicit assumption.`);
    }
    if (g.kind === 'oracle' && tried.includes('aut')) warn('oracle-probed', `${g.id}: probing the AUT for expected behaviour is not a valid source — observations may only inform the question you ask`);
    if (!tried.includes('story') && !tried.includes('attachments')) err('gap-ladder', `${g.id}: the requirement (story/attachments) was not searched before resolving "${g.element}"`);
    const order = tried.map((t) => LADDER_ORDER.indexOf(t));
    if (order.some((v, i) => i > 0 && v < order[i - 1])) warn('gap-ladder-order', `${g.id}: ladder walked out of order (${tried.join(' → ')}); expected requirement → AUT → config → user`);
    if (g.resolution === 'discovered-in-aut' && !g.evidence) err('gap-evidence', `${g.id}: discovered-in-aut needs evidence (probe command / output file)`);
    if (g.resolution === 'provided-by-user' && (!g.value || !g.evidence)) err('gap-evidence', `${g.id}: provided-by-user needs the answer (value) and evidence (who / when)`);
    if (g.resolution === 'provided-by-user' && !tried.includes('user')) err('gap-ladder', `${g.id}: resolved by the user but "user" is not in tried[]`);
    if (g.resolution === 'found-in-requirement' && !g.evidence) warn('gap-evidence', `${g.id}: cite where in the requirement it was found (evidence)`);
    if (g.resolution === 'open' && g.kind === 'mechanics') warn('mechanics-to-discover', `${g.id} (${g.element}) — discover it from the application during hardening (published API docs, heldout api-probe, heldout inspect) and record discovered-in-aut with evidence`);
    if (g.resolution === 'open' && g.kind === 'oracle' && g.required) warn('oracle-gap-open', `${g.id} (${g.element}) is unresolved — ask the user; unanswered, ${g.affects.join(', ') || 'the affected criteria'} must be @needs-clarification or carry # OPEN-QUESTION: ${g.id}`);
    if (g.resolution === 'assumed' && g.kind === 'oracle') warn('oracle-assumed', `${g.id}: expected behaviour is assumed (${g.value ?? '?'}) — it must appear as # ASSUMPTION in the feature and in the verdict`);
    for (const a of g.affects ?? []) if (!ids.has(a) && a !== '*') err('gap-affects', `${g.id} affects ${a}, which is not an AC in the contract`);
  }

  // Evidence: nothing omitted (coverage ledger), nothing invented (literal grounding).
  out.push(...checkCoverage(c, reqDir), ...checkLiterals(c, reqDir));
  return out;
}

/** Questions for the user: open oracle gaps (required first). Only the requirement's owner can say WHAT is correct. */
export function openQuestions(c: RequirementContract): Gap[] {
  return (c.gaps ?? []).filter((g) => g.resolution === 'open' && g.kind === 'oracle').sort((a, b) => Number(b.required) - Number(a.required));
}

/** Open mechanics gaps: HOW to exercise the app, found by black-box discovery during hardening. */
export function toDiscover(c: RequirementContract): Gap[] {
  return (c.gaps ?? []).filter((g) => g.resolution === 'open' && g.kind === 'mechanics');
}

/**
 * The oracle part of the contract — frozen with the draft tests. Mechanics (endpoint paths discovered
 * later, entry points, test-data strategy) may evolve during hardening; this may not without a re-freeze.
 */
export function oracleDigest(c: RequirementContract): string {
  // Expected behaviour only: correcting a citation (source line) is not a change of what the tests must prove.
  return JSON.stringify({
    acs: (c.acceptanceCriteria ?? []).map((a) => ({ id: a.id, text: a.text, outcomes: a.outcomes })),
    rules: (c.rules ?? []).map((r) => ({ id: r.id, text: r.text })),
    errorModel: (c.errorModel ?? []).map((e) => ({ id: e.id, case: e.case, status: e.status ?? null, body: e.body ?? null })),
    oracleGaps: (c.gaps ?? []).filter((g) => g.kind === 'oracle').map((g) => ({ id: g.id, resolution: g.resolution, value: g.value ?? null })),
  }, null, 2);
}

/** Request contracts for triage: endpoints with a declared envelope and/or request field names. */
export function requestContracts(c?: RequirementContract): { method: string; path: string; envelope?: string; fields?: string[] }[] {
  return (c?.endpoints ?? [])
    .map((e) => ({ method: e.method, path: e.path, envelope: e.envelope, fields: e.requestFields }))
    .filter((e) => e.envelope || e.fields?.length);
}

export function readContract(evalDir: string): RequirementContract | undefined {
  const file = path.join(evalDir, CONTRACT_FILE);
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as RequirementContract) : undefined;
}

/** Cross-check scenarios.feature against the contract (called by the traceability lint). */
export function checkFeatureAgainstContract(c: RequirementContract, feature: {
  acs: { id: string; text: string }[]; endpoints: { method: string; path: string }[];
  openQuestions: string[]; assumptions: string[]; scenarios: { id: string; acs: string[]; needsClarification: boolean }[];
}): ContractFinding[] {
  const out: ContractFinding[] = [];
  const cAcs = new Map((c.acceptanceCriteria ?? []).map((a) => [a.id, a]));
  for (const a of feature.acs) {
    const ca = cAcs.get(a.id);
    if (!ca) out.push({ level: 'error', code: 'ac-not-in-contract', message: `${a.id} is in scenarios.feature but not in the requirement contract` });
    else if (normaliseText(ca.text) !== normaliseText(a.text)) out.push({ level: 'error', code: 'ac-text-drift', message: `${a.id} text differs from the contract — copy it verbatim ("${ca.text.slice(0, 80)}…")` });
  }
  for (const id of cAcs.keys()) if (!feature.acs.some((a) => a.id === id)) out.push({ level: 'error', code: 'contract-ac-missing', message: `${id} is in the contract but has no "# ${id}:" line in scenarios.feature` });
  const keys = new Set((c.endpoints ?? []).map(epKey));
  for (const e of feature.endpoints) if (!keys.has(epKey(e))) out.push({ level: 'error', code: 'endpoint-not-in-contract', message: `# ENDPOINT: ${epKey(e)} is not in the contract (add it with its source or a discovery gap)` });
  for (const g of openQuestions(c)) {
    const tagged = g.affects.some((ac) => feature.scenarios.some((s) => s.acs.includes(ac) && s.needsClarification));
    const asked = feature.openQuestions.some((q) => q.includes(g.id));
    if (!tagged && !asked) out.push({ level: 'error', code: 'open-gap-not-surfaced', message: `${g.id} (${g.element}) is open but no scenario of ${g.affects.join(', ')} is @needs-clarification and no # OPEN-QUESTION mentions ${g.id}` });
  }
  for (const g of (c.gaps ?? []).filter((x) => x.resolution === 'assumed' && x.kind === 'oracle')) {
    if (!feature.assumptions.some((a) => a.includes(g.id))) out.push({ level: 'error', code: 'assumption-not-surfaced', message: `${g.id} is an assumed oracle value but no # ASSUMPTION mentions ${g.id}` });
  }
  return out;
}
