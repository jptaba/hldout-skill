/**
 * Requirement contract — the normalised, source-anchored shape of a story (phase 1b).
 *
 * Jira stories arrive in any format (headings or none, AC custom field or bullets in the description,
 * Given/When/Then, numbered lists, tables, screenshots embedded in the description or the criteria, a linked
 * Confluence page with the rules or an API definition…).
 * A MODEL reads them (the heldout-contract-extractor subagent) and writes ONE shape,
 * `output/<profile>/<KEY>/requirement-contract.json`; an independent reviewer subagent checks it. This module only
 * validates, mechanically:
 *
 *  - Every AC is **quoted verbatim** from a cited source file, and the quote is verified, so an acceptance
 *    criterion cannot be invented or silently paraphrased. Coverage and literal grounding: see ./evidence.ts.
 *  - Missing but required elements are recorded as **gaps** with the resolution ladder that was tried:
 *    requirement (story + what it embeds and links) → AUT (black-box discovery) → project config → the user.
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
import { checkCoverage, checkLiterals, decodeEntities, parseRange, type CoverageEntry } from './evidence';

export const CONTRACT_FILE = 'requirement-contract.json';
export type Layer = 'ui' | 'api' | 'e2e';
export type GapResolution = 'found-in-requirement' | 'found-in-config' | 'discovered-in-aut' | 'provided-by-user' | 'assumed' | 'open';
/** story = title, description and acceptance criteria; linked = the screenshots they embed and the pages they link. */
export type LadderStep = 'story' | 'linked' | 'aut' | 'config' | 'user';

export interface ContractAC {
  id: string;
  /** Normalised statement: the criterion the tests tagged @AC-n prove, and the verdict quotes. */
  text: string;
  /** Verbatim excerpt from the source that states this criterion (verified against the file). */
  quote: string;
  /** Source file relative to requirement/, optionally with a line: "story.md#L19", "linked/confluence-123-cart-api.md#L4". */
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

/**
 * A dimension the story says every criterion it names must be checked across ("for each user type", "for the data
 * sets A, B and C"). Each value is one setup; a criterion it applies to needs a test for every combination of the
 * values of all the variants that apply to it, tagged @variant:<key>=<value>.
 */
export interface Variant {
  /** V1, V2… */
  id: string;
  /** As the story names it: "user type", "category". */
  name: string;
  /** The tag key: "user-type" → @variant:user-type=<value>. */
  key: string;
  /** Each setup: an id for the tag ("guest") and the story's words for it ("not signed in"). */
  values: { id: string; text?: string }[];
  /** The criteria it applies to; "*" for every criterion. */
  appliesTo: string[];
  source: string;
}

export interface RequirementContract {
  key: string;
  title: string;
  revision: { story: string; linked: Record<string, string> };
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
  /** Setups every criterion they apply to must be checked across (user types, data sets). */
  variants?: Variant[];
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

const TEXT_FILE = /\.(md|txt|html?|xml|json|ya?ml|csv)$/i;
const lf = (s: string) => s.replace(/\r\n/g, '\n');

export function requirementRevision(reqDir: string): RequirementContract['revision'] {
  const storyFile = path.join(reqDir, 'story.md');
  const dir = path.join(reqDir, 'linked');
  const linked: Record<string, string> = {};
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, f);
    // Text is hashed with LF line endings: a clone that checks files out with CRLF (Windows) is the same requirement.
    if (fs.statSync(full).isFile()) linked[f] = sha(TEXT_FILE.test(f) ? lf(fs.readFileSync(full, 'utf8')) : fs.readFileSync(full));
  }
  return { story: fs.existsSync(storyFile) ? sha(storyBody(lf(fs.readFileSync(storyFile, 'utf8')))) : '', linked };
}

// ---- quote anchoring ----------------------------------------------------------------------------

/** Normalise text for quote matching: markdown/table punctuation, quotes, dashes and whitespace. */
export function normaliseText(s: string): string {
  return decodeEntities(s).toLowerCase()
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

/** Files the agent must read: story.md, each screenshot it embeds (read with vision) and each page it links. */
export function requirementFiles(reqDir: string): string[] {
  const dir = path.join(reqDir, 'linked');
  return ['story.md', ...(fs.existsSync(dir) ? fs.readdirSync(dir).sort().map((f) => `linked/${f}`) : [])];
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
/** Rung of each ladder step: the requirement (story, what it embeds and links) first, then the AUT and the project
 * config in either order (the builder reads config in phase 1b, hardening probes the AUT later), and the user last. */
const LADDER_RUNG: Record<LadderStep, number> = { story: 0, linked: 0, aut: 1, config: 1, user: 2 };

export interface CheckOptions {
  /** The AUT profile has an API origin (required when any AC is api/e2e). */
  hasApiBase?: boolean;
  /** The AUT profile's API origin: a base path the sources state under it grounds the paths relative to it. */
  apiBaseURL?: string;
}

/** Field types the checks rely on; a wrong type is reported as a finding instead of crashing a check. */
export function shapeFindings(c: RequirementContract): ContractFinding[] {
  const out: ContractFinding[] = [];
  const list = (where: string, v: unknown, optional = false) => {
    if (v === undefined && optional) return;
    if (!Array.isArray(v)) out.push({ level: 'error', code: 'contract-shape', message: `${where} must be a list (JSON array)${v === undefined ? ', and it is missing' : `, got ${typeof v}`}` });
  };
  for (const k of ['sourcesRead', 'acceptanceCriteria', 'endpoints', 'rules', 'errorModel', 'gaps', 'coverage'] as const) list(k, c[k]);
  list('actors', c.actors, true);
  list('outOfScope', c.outOfScope, true);
  list('nonFunctional', c.nonFunctional, true);
  list('variants', c.variants, true);
  if (Array.isArray(c.variants)) for (const v of c.variants) { list(`${v.id}.values`, v.values); list(`${v.id}.appliesTo`, v.appliesTo); }
  list('testData.constraints', c.testData?.constraints, true);
  if (c.context !== undefined && typeof c.context !== 'string') out.push({ level: 'error', code: 'contract-shape', message: 'context must be a string' });
  if (Array.isArray(c.acceptanceCriteria)) for (const a of c.acceptanceCriteria) {
    list(`${a.id}.outcomes`, a.outcomes);
    list(`${a.id}.endpoints`, a.endpoints, true);
    list(`${a.id}.gaps`, a.gaps, true);
  }
  if (Array.isArray(c.gaps)) for (const g of c.gaps) { list(`${g.id}.tried`, g.tried); list(`${g.id}.affects`, g.affects); }
  if (Array.isArray(c.endpoints)) for (const e of c.endpoints) list(`endpoint ${e.method} ${e.path} requestFields`, e.requestFields, true);
  return out;
}

export function checkContract(c: RequirementContract, reqDir: string, opts: CheckOptions = {}): ContractFinding[] {
  const shape = shapeFindings(c);
  if (shape.length) return shape;
  const out: ContractFinding[] = [];
  const err = (code: string, message: string) => out.push({ level: 'error', code, message });
  const warn = (code: string, message: string) => out.push({ level: 'warn', code, message });

  // Revision: the contract must describe the requirement as fetched now.
  const now = requirementRevision(reqDir);
  if (c.revision?.story !== now.story) err('contract-stale', 'story.md changed since the contract was built (re-fetch / revision) — rebuild the contract, then re-review it and the tests');
  const was = c.revision?.linked ?? {};
  const diff = [...new Set([...Object.keys(was), ...Object.keys(now.linked)])].filter((f) => was[f] !== now.linked[f]);
  if (diff.length) err('contract-stale', `screenshots or linked pages changed since the contract was built: ${diff.join(', ')}`);

  // Every source must have been read.
  for (const file of requirementFiles(reqDir)) {
    const s = c.sourcesRead?.find((x) => x.file === file);
    if (!s || !s.read) err('source-unread', `${file} is not marked read in sourcesRead — read every linked page and screenshot (transcribe what each screenshot shows) before building the contract`);
  }

  // Acceptance criteria: present, unique, anchored, observable.
  if (!c.acceptanceCriteria?.length && notEvaluable(c)) warn('not-evaluable', 'The story states no acceptance criteria, and the contract records that as a required open question: nothing is tested, and heldout advance reports the story as not evaluable (verdict INCONCLUSIVE, the question put to its owner).');
  else if (!c.acceptanceCriteria?.length) err('no-acs','The contract has no acceptance criteria. If the story has none, record a required oracle gap ("what are the acceptance criteria?", affecting *) and leave it open: the story is reported as not evaluable — do not invent criteria.');
  const ids = new Set<string>();
  const endpointKeys = new Set((c.endpoints ?? []).map(epKey));
  const gapIds = new Set((c.gaps ?? []).map((g) => g.id));
  for (const ac of c.acceptanceCriteria ?? []) {
    if (!/^AC-\d+$/.test(ac.id)) err('ac-id', `"${ac.id}" is not an AC-n id`);
    if (ids.has(ac.id)) err('ac-duplicate', `${ac.id} appears twice`);
    ids.add(ac.id);
    // A screenshot can't be quoted directly: the evaluator transcribes it into
    // requirement/transcripts/<file>.md whose first line is "transcribedFrom: linked/<file>".
    const srcFile = parseSource(ac.source ?? '').file;
    if (/\.(png|jpe?g|gif|webp|bmp|pdf|docx?|xlsx?|pptx?)$/i.test(srcFile)) {
      err('quote-from-binary', `${ac.id} cites ${srcFile} directly — transcribe it to transcripts/${path.basename(srcFile)}.md ("transcribedFrom: ${srcFile}" on the first line) and cite the transcript`);
    } else if (srcFile.startsWith('transcripts/')) {
      const tFile = path.join(reqDir, srcFile);
      const origin = fs.existsSync(tFile) ? fs.readFileSync(tFile, 'utf8').match(/^transcribedFrom:\s*(\S+)/m)?.[1] : undefined;
      if (!origin) err('transcript-origin', `${ac.id}: ${srcFile} must start with "transcribedFrom: linked/<file>"`);
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
  // Citations: "<file>#L<n>[-L<m>]", several separated by commas; an endpoint may instead cite the gap that found it.
  const cites = (where: string, ref: string | undefined, allowGap = false) => {
    if (!ref) return;
    for (const part of ref.split(/\s*[,;]\s*/).filter(Boolean)) {
      if (allowGap && gapIds.has(part)) continue;
      const r = parseRange(part);
      if (!r) warn('citation-format', `${where} cites "${part}" — use <file>#L<n> or <file>#L<n>-L<m>, several separated by commas`);
      else if (!fs.existsSync(path.join(reqDir, r.file))) err('citation-file', `${where} cites ${r.file}, which does not exist under requirement/`);
    }
  };
  for (const r of c.rules ?? []) cites(r.id, r.source);
  for (const e of c.errorModel ?? []) cites(e.id, e.source);
  // Variants: a setup grid the story requires; each value must be one the sources name.
  const variantKeys = new Set<string>();
  for (const v of c.variants ?? []) {
    if (!/^V\d+$/.test(v.id ?? '')) err('variant-id', `variant "${v.name}" needs an id V<n>`);
    else if (itemIds.has(v.id)) err('variant-duplicate', `${v.id} appears twice`);
    itemIds.add(v.id);
    if (!/^[a-z][a-z0-9-]*$/.test(v.key ?? '')) err('variant-key', `${v.id}: key "${v.key}" must be lower case with dashes (the tag is @variant:<key>=<value>)`);
    else if (variantKeys.has(v.key)) err('variant-duplicate', `${v.id}: key ${v.key} is used twice`);
    variantKeys.add(v.key);
    if ((v.values ?? []).length < 2) err('variant-values', `${v.id} (${v.name}) needs at least two values — one setup is not a variant`);
    const valueIds = new Set<string>();
    for (const x of v.values ?? []) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(x.id ?? '')) err('variant-value', `${v.id}: value "${x.id}" must be lower case with dashes`);
      if (valueIds.has(x.id)) err('variant-value', `${v.id}: value ${x.id} appears twice`);
      valueIds.add(x.id);
    }
    if (!(v.appliesTo ?? []).length) err('variant-applies', `${v.id} applies to no criterion — list the AC ids, or "*" for every criterion`);
    for (const a of v.appliesTo ?? []) if (a !== '*' && !ids.has(a)) err('variant-applies', `${v.id} applies to ${a}, which is not an AC in the contract`);
    if (!v.source) err('variant-source', `${v.id} has no source — cite the lines that require the checks across ${v.name}`);
    cites(v.id, v.source);
    // Each setup is one the sources name (its words, or its id read as words): never one the builder made up.
    const transcripts = fs.existsSync(path.join(reqDir, 'transcripts')) ? fs.readdirSync(path.join(reqDir, 'transcripts')).map((f) => `transcripts/${f}`) : [];
    const text = normaliseText([...requirementFiles(reqDir), ...transcripts].filter((f) => TEXT_FILE.test(f) && fs.existsSync(path.join(reqDir, f))).map((f) => fs.readFileSync(path.join(reqDir, f), 'utf8')).join('\n'));
    for (const x of v.values ?? []) {
      const words = [x.text, x.id?.replace(/-/g, ' ')].filter((w): w is string => Boolean(w)).map(normaliseText);
      if (!words.some((w) => text.includes(w))) err('variant-ungrounded', `${v.id}: value "${x.text ?? x.id}" is not in the sources — a setup the story doesn't name is not part of the requirement`);
    }
  }
  for (const n of c.nonFunctional ?? []) cites(n.id, n.source);
  for (const e of c.endpoints ?? []) cites(`endpoint ${epKey(e)}`, e.source, true);

  // Gaps: ladder, oracle/mechanics rule, resolution evidence.
  for (const g of c.gaps ?? []) {
    const tried = (g.tried ?? []).map((t) => t.where);
    if (g.kind === 'oracle' && g.resolution === 'discovered-in-aut') {
      err('oracle-from-aut', `${g.id} (${g.element}) is about expected behaviour but was "discovered in the AUT" — that makes the oracle circular. Keep it open (the verdict puts the question to the story's owner) or make it an explicit assumption.`);
    }
    if (g.kind === 'oracle' && tried.includes('aut')) warn('oracle-probed', `${g.id}: probing the AUT for expected behaviour is not a valid source — observations may only inform the question you ask`);
    if (!tried.includes('story') && !tried.includes('linked')) err('gap-ladder', `${g.id}: the requirement (the story, its screenshots and linked pages) was not searched before resolving "${g.element}"`);
    const order = tried.map((t) => LADDER_RUNG[t] ?? -1);
    if (order.some((v, i) => i > 0 && v < order[i - 1])) warn('gap-ladder-order', `${g.id}: ladder walked out of order (${tried.join(' → ')}); expected the requirement, then the AUT or config, then the user`);
    if (g.resolution === 'discovered-in-aut' && !g.evidence) err('gap-evidence', `${g.id}: discovered-in-aut needs evidence (probe command / output file)`);
    if (g.resolution === 'provided-by-user' && (!g.value || !g.evidence)) err('gap-evidence', `${g.id}: provided-by-user needs the answer (value) and evidence (who / when)`);
    if (g.resolution === 'provided-by-user' && !tried.includes('user')) err('gap-ladder', `${g.id}: resolved by the user but "user" is not in tried[]`);
    if (g.resolution === 'found-in-requirement' && !g.evidence) warn('gap-evidence', `${g.id}: cite where in the requirement it was found (evidence)`);
    if (g.resolution === 'open' && g.kind === 'mechanics') warn('mechanics-to-discover', `${g.id} (${g.element}) — discover it from the application during hardening (heldout inspect and the API calls its pages make, heldout api-probe) and record discovered-in-aut with evidence`);
    if (g.resolution === 'open' && g.kind === 'oracle' && g.required) warn('oracle-gap-open', `${g.id} (${g.element}) is unresolved — nobody is asked during an evaluation: ${g.affects.join(', ') || 'the affected criteria'} must be tagged @needs-clarification or the spec must carry // OPEN-QUESTION: ${g.id}, and the verdict puts the question to the story's owner`);
    if (g.resolution === 'assumed' && g.kind === 'oracle') warn('oracle-assumed', `${g.id}: expected behaviour is assumed (${g.value ?? '?'}) — it must appear as // ASSUMPTION: in the spec and in the verdict`);
    for (const a of g.affects ?? []) if (!ids.has(a) && a !== '*') err('gap-affects', `${g.id} affects ${a}, which is not an AC in the contract`);
  }

  // Evidence: nothing omitted (coverage ledger), nothing invented (literal grounding).
  out.push(...checkCoverage(c, reqDir), ...checkLiterals(c, reqDir, { apiBaseURL: opts.apiBaseURL }));
  return out;
}

/**
 * Open oracle gaps (required first): the questions the verdict puts to the story's owner. Only the owner can say WHAT
 * is correct, and nobody is asked while an evaluation runs.
 */
export function openQuestions(c: RequirementContract): Gap[] {
  return (c.gaps ?? []).filter((g) => g.resolution === 'open' && g.kind === 'oracle').sort((a, b) => Number(b.required) - Number(a.required));
}

/**
 * The builder found no acceptance criteria and recorded that as a required open oracle gap: nothing can be tested and
 * nobody is asked, so the story's result is an INCONCLUSIVE verdict that puts the question to its owner.
 */
export function notEvaluable(c: RequirementContract): boolean {
  return !c.acceptanceCriteria?.length && openQuestions(c).some((g) => g.required);
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
    ...(c.variants?.length ? { variants: c.variants.map((v) => ({ id: v.id, key: v.key, values: v.values.map((x) => x.id), appliesTo: v.appliesTo })) } : {}),
  }, null, 2);
}

/** The variants that apply to a criterion. */
export const variantsOf = (c: RequirementContract | undefined, ac: string): Variant[] =>
  (c?.variants ?? []).filter((v) => v.appliesTo.includes('*') || v.appliesTo.includes(ac));

/** Every combination of values a criterion must be tested in: [{ "user-type": "guest", category: "hammer" }, …]. */
export function variantCombinations(c: RequirementContract | undefined, ac: string): Record<string, string>[] {
  return variantsOf(c, ac).reduce<Record<string, string>[]>((combos, v) => combos.flatMap((combo) => v.values.map((x) => ({ ...combo, [v.key]: x.id }))), [{}])
    .filter((combo) => Object.keys(combo).length);
}

/** "user-type=guest × category=hammer" */
export const comboLabel = (combo: Record<string, string>) => Object.entries(combo).map(([k, v]) => `${k}=${v}`).join(' × ');

/**
 * The traceability lint's part for variants: every criterion they apply to is tested in every combination of their
 * values (each test's @variant:<key>=<value> tags, or a table's // cases: line), and no test names a setup the
 * contract doesn't have.
 */
export function checkVariantCoverage(c: RequirementContract, suite: { acs: { id: string }[]; scenarios: { id: string; acs: string[]; cases: Record<string, string[]>[] }[] }): ContractFinding[] {
  const out: ContractFinding[] = [];
  const keys = new Map((c.variants ?? []).map((v) => [v.key, new Set(v.values.map((x) => x.id))]));
  for (const s of suite.scenarios) for (const cs of s.cases) for (const [k, vals] of Object.entries(cs)) {
    if (!keys.has(k)) out.push({ level: 'error', code: 'unknown-variant', message: `${s.id} is tagged @variant:${k}=…, but the contract has no variant with the key ${k}${keys.size ? ` (keys: ${[...keys.keys()].join(', ')})` : ''}` });
    else if (!vals.length) out.push({ level: 'error', code: 'variant-cases-missing', message: `${s.id} builds its @variant:${k}=… tag from its rows, but no "// cases: ${k}=${[...keys.get(k)!].join('|')}" line above it says which values it covers` });
    else for (const v of vals) if (!keys.get(k)!.has(v)) out.push({ level: 'error', code: 'unknown-variant', message: `${s.id}: ${k}=${v} is not a value of that variant (${[...keys.get(k)!].join(', ')})` });
  }
  for (const ac of suite.acs) {
    const combos = variantCombinations(c, ac.id);
    const tested = (combo: Record<string, string>) => suite.scenarios.some((s) => s.acs.includes(ac.id) && s.cases.some((cs) => Object.entries(combo).every(([k, v]) => cs[k]?.includes(v))));
    const missing = combos.filter((combo) => !tested(combo));
    if (missing.length) out.push({ level: 'error', code: 'variant-uncovered', message: `${ac.id} must be tested in ${combos.length} setup(s) and ${missing.length} have no test: ${missing.slice(0, 6).map(comboLabel).join('; ')}${missing.length > 6 ? '; …' : ''} — tag a test for each with @variant:<key>=<value> (or give a table of cases a "// cases: …" line)` });
  }
  return out;
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

/** Cross-check the specs' scenarios against the contract's gaps (called by the traceability lint). */
export function checkSuiteAgainstContract(c: RequirementContract, suite: {
  openQuestions: string[]; assumptions: string[]; scenarios: { id: string; acs: string[]; needsClarification: boolean; assumes?: string[] }[];
}): ContractFinding[] {
  const out: ContractFinding[] = [];
  for (const g of openQuestions(c)) {
    const tagged = g.affects.some((ac) => suite.scenarios.some((s) => s.acs.includes(ac) && s.needsClarification));
    const asked = suite.openQuestions.some((q) => q.includes(g.id));
    if (!tagged && !asked) out.push({ level: 'error', code: 'open-gap-not-surfaced', message: `${g.id} (${g.element}) is open but no test of ${g.affects.join(', ')} is tagged @needs-clarification and no // OPEN-QUESTION: mentions ${g.id}` });
  }
  for (const g of (c.gaps ?? []).filter((x) => x.resolution === 'assumed' && x.kind === 'oracle')) {
    if (!suite.assumptions.some((a) => a.includes(g.id))) out.push({ level: 'error', code: 'assumption-not-surfaced', message: `${g.id} is an assumed oracle value but no // ASSUMPTION: in the spec mentions ${g.id}` });
    // An assumption that only drops an assertion ("no status asserted") has no expectation to tag: "(not asserted)".
    const notAsserted = suite.assumptions.some((a) => a.includes(g.id) && /\(not asserted\)/i.test(a));
    if (g.affects.length && !notAsserted && !suite.scenarios.some((s) => s.assumes?.includes(g.id))) out.push({ level: 'warn', code: 'assumption-not-tagged', message: `tag the tests whose expectation rests on ${g.id} with @assumes:${g.id}, so a failure there reads as a question for the owner, not a defect` });
  }
  return out;
}
