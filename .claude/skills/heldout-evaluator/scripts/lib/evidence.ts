/**
 * Evidence checks for the requirement contract. The MODEL reads the story and builds the contract (it understands
 * any format); these functions only check, mechanically and without understanding language, that what the model
 * wrote is grounded in the sources:
 *
 *   evidencePack()  every source line numbered, so the model and the reviewer cite "story.md#L12-L14"
 *   checkCoverage() every requirement-bearing line is accounted for (captured, or dismissed with a reason) — omissions
 *   checkLiterals() every status code, number, quoted message and path in the expected outcomes exists in the sources
 *                   (or in an explicitly recorded gap answer) — invented facts
 *   checkReview()   an independent reviewer (fresh subagent) confirmed each item against the sources, for exactly
 *                   this version of the contract (hash-bound)
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { ContractFinding, RequirementContract } from './contract';

export const REVIEW_FILE = 'requirement-contract.review.json';
const TEXT_SOURCE = /\.(md|txt|csv|tsv|json|feature|ya?ml|xml|html?)$/i;

export interface SourceLine { file: string; line: number; text: string; accountable: boolean }

/** Text sources the evidence is drawn from: story.md, text attachments, and transcripts of non-text attachments. */
export function textSources(reqDir: string): string[] {
  const list = (dir: string, prefix: string) => (fs.existsSync(path.join(reqDir, dir))
    ? fs.readdirSync(path.join(reqDir, dir)).sort().filter((f) => TEXT_SOURCE.test(f)).map((f) => `${prefix}${f}`) : []);
  return [...(fs.existsSync(path.join(reqDir, 'story.md')) ? ['story.md'] : []), ...list('attachments', 'attachments/'), ...list('transcripts', 'transcripts/')];
}

/**
 * Lines that carry content and must be accounted for in the coverage ledger. Structure the fetch itself adds to
 * story.md (front matter, title, section headings, attachment index, comment author lines), blank lines, table
 * separators and header rows, and markdown headings are not accountable.
 */
const SEPARATOR = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/;
export function sourceLines(reqDir: string): SourceLine[] {
  const out: SourceLine[] = [];
  for (const file of textSources(reqDir)) {
    const lines = fs.readFileSync(path.join(reqDir, file), 'utf8').split(/\r?\n/);
    let inFront = file === 'story.md' && lines[0]?.trim() === '---';
    let inAttachmentIndex = false;
    lines.forEach((text, i) => {
      const t = text.trim();
      let accountable = true;
      if (file === 'story.md' && /^## Attachments$/.test(t)) inAttachmentIndex = true;
      if (inFront) { accountable = false; if (i > 0 && t === '---') inFront = false; }
      // Code fences (```gherkin) and a Gherkin "Feature:" title are structure, like a heading.
      else if (!t || SEPARATOR.test(t) || /^#{1,6}\s/.test(t) || /^-{3,}$/.test(t) || /^(`{3,}|~{3,})[\w-]*$/.test(t) || /^Feature:/.test(t)) accountable = false;
      // A table header row only names the columns; the rows under it carry the content.
      else if (t.startsWith('|') && SEPARATOR.test(lines[i + 1]?.trim() ?? '')) accountable = false;
      else if (file === 'story.md') {
        if (inAttachmentIndex || /^_\(?(none|empty)\)?_$/i.test(t) || /^\*\*.+\*\* — \d{4}-\d{2}-\d{2}:$/.test(t)) accountable = false;
      } else if (file.startsWith('transcripts/') && /^transcribedFrom:/.test(t)) accountable = false;
      out.push({ file, line: i + 1, text, accountable });
    });
  }
  return out;
}

/** The numbered evidence pack the extractor and the reviewer work from. ● = must appear in the coverage ledger. */
/** The project's facts about the application (not requirement): lets gaps such as "which host" resolve as found-in-config. */
export interface PackConfig { profile: string; name: string; baseURL: string; apiBaseURL?: string }

export function evidencePack(key: string, reqDir: string, binaryAttachments: string[], config?: PackConfig): string {
  const lines = sourceLines(reqDir);
  const out = [
    `# Evidence pack — ${key}`, '',
    'Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract\'s `coverage` ledger',
    '(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).',
    'This pack is the whole requirement: the story, its acceptance-criteria field, comments and text attachments (`requirement/raw-issue.json` is the tracker\'s raw answer they came from; nothing to read there).', '',
  ];
  if (binaryAttachments.length) {
    out.push('**Non-text attachments** — open each with the Read tool and transcribe what it states into `requirement/transcripts/<file>.md`',
      '(first line `transcribedFrom: attachments/<file>`); then re-run `contract KEY --pack` so the transcript is numbered here:', '',
      ...binaryAttachments.map((a) => `- ${a}${fs.existsSync(path.join(reqDir, 'transcripts', `${path.basename(a)}.md`)) ? ' (transcribed)' : ' — **not transcribed yet**'}`), '');
  }
  if (config) {
    out.push('**Project configuration** (heldout.config.json: not requirement, nothing to cite or cover; a gap it answers is `found-in-config`):', '',
      `- AUT profile \`${config.profile}\` "${config.name}": web ${config.baseURL}${config.apiBaseURL && config.apiBaseURL !== config.baseURL ? `, API ${config.apiBaseURL}` : ' (API on the same origin)'}`, '');
  }
  let file = '';
  for (const l of lines) {
    if (l.file !== file) { file = l.file; out.push('', `## ${file}`, '', '```text'); }
    out.push(`${l.accountable ? '●' : ' '} L${String(l.line).padEnd(4)}| ${l.text}`);
    const next = lines[lines.indexOf(l) + 1];
    if (!next || next.file !== file) out.push('```');
  }
  return `${out.join('\n')}\n`;
}

// ---- coverage ---------------------------------------------------------------------------------------

export interface CoverageEntry { lines: string; as: string; note?: string }
const COVERAGE_KINDS = ['context', 'endpoint', 'error-model', 'auth', 'test-data', 'out-of-scope', 'non-functional', 'not-a-requirement', 'example', 'duplicate'];

/** "story.md#L12-L14" / "story.md#L12" → { file, from, to } */
export function parseRange(ref: string): { file: string; from: number; to: number } | undefined {
  const m = ref.match(/^(.+?)#L(\d+)(?:-L?(\d+))?$/);
  return m ? { file: m[1], from: Number(m[2]), to: Number(m[3] ?? m[2]) } : undefined;
}

const compress = (ns: number[]) => ns.reduce<[number, number][]>((acc, n) => {
  const last = acc.at(-1);
  if (last && n === last[1] + 1) last[1] = n; else acc.push([n, n]);
  return acc;
}, []).map(([a, b]) => (a === b ? `L${a}` : `L${a}-L${b}`)).join(', ');

export function checkCoverage(c: RequirementContract, reqDir: string): ContractFinding[] {
  const out: ContractFinding[] = [];
  const coverage = c.coverage;
  const known = new Set([...(c.acceptanceCriteria ?? []).map((a) => a.id), ...(c.rules ?? []).map((r) => r.id), ...(c.errorModel ?? []).map((e) => e.id), ...(c.gaps ?? []).map((g) => g.id), ...(c.nonFunctional ?? []).map((n) => n.id)]);
  const covered = new Set<string>();
  for (const e of coverage) {
    const r = parseRange(e.lines ?? '');
    if (!r) { out.push({ level: 'error', code: 'coverage-range', message: `coverage entry "${e.lines}" is not <file>#L<n>[-L<m>]` }); continue; }
    if (!fs.existsSync(path.join(reqDir, r.file))) out.push({ level: 'error', code: 'coverage-range', message: `coverage cites ${r.file}, which does not exist under requirement/` });
    const refs = String(e.as ?? '').split(/[,\s]+/).filter(Boolean);
    for (const ref of refs) if (!known.has(ref) && !COVERAGE_KINDS.includes(ref)) out.push({ level: 'error', code: 'coverage-as', message: `coverage ${e.lines} is accounted "as" ${ref} — not an AC/rule/gap id in the contract nor one of ${COVERAGE_KINDS.join(', ')}` });
    if (refs.includes('not-a-requirement') && !e.note) out.push({ level: 'error', code: 'coverage-dismissal', message: `coverage ${e.lines} is dismissed as not-a-requirement without a note saying why` });
    for (let n = r.from; n <= r.to; n++) covered.add(`${r.file}#${n}`);
  }
  const missing = new Map<string, number[]>();
  for (const l of sourceLines(reqDir)) if (l.accountable && !covered.has(`${l.file}#${l.line}`)) missing.set(l.file, [...(missing.get(l.file) ?? []), l.line]);
  for (const [file, lines] of missing) {
    const sample = sourceLines(reqDir).find((l) => l.file === file && l.line === lines[0])?.text.trim().slice(0, 60);
    out.push({ level: 'error', code: 'uncovered-lines', message: `${file} ${compress(lines)} not accounted for in coverage (e.g. "${sample}…") — capture them or dismiss them with a reason` });
  }
  // Every captured item must itself be covered by at least one ledger entry pointing at it.
  for (const id of known) if (!coverage.some((e) => String(e.as).split(/[,\s]+/).includes(id)) && /^AC-/.test(id)) out.push({ level: 'error', code: 'coverage-missing-item', message: `${id} is not referenced by any coverage entry — which lines state it?` });
  return out;
}

// ---- literals -----------------------------------------------------------------------------------------

const NUMBER_WORDS: Record<string, number> = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20, thirty: 30, hundred: 100,
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, once: 1, twice: 2 };
/** HTML entities that stories copied from web pages or wiki markup carry (&lt;username&gt; reads as <username>). */
export const decodeEntities = (s: string) => s.replace(/&(lt|gt|amp|quot|apos|nbsp|#39);/g, (_m, k: string) => ({ lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: ' ', '#39': "'" } as Record<string, string>)[k]);
const norm = (s: string) => decodeEntities(s).toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[*_`]+/g, '').replace(/\s+/g, ' ');

function numbersIn(text: string): Set<number> {
  const out = new Set<number>();
  for (const m of norm(text).matchAll(/(?<![\w.])(\d+(?:\.\d+)?)(?:st|nd|rd|th)?(?![\w.]*\d)/g)) out.add(Number(m[1]));
  for (const m of norm(text).matchAll(/\b([a-z]+)\b/g)) if (NUMBER_WORDS[m[1]] !== undefined) out.add(NUMBER_WORDS[m[1]]);
  return out;
}
/** Stated decimals with the step their precision implies ("100.00" → 0.01): one step outside is a boundary value. */
function decimalSteps(text: string): [number, number][] {
  return [...norm(text).matchAll(/(?<![\w.])(\d+)\.(\d+)(?![\w.]*\d)/g)].map((m) => [Number(`${m[1]}.${m[2]}`), 10 ** -m[2].length]);
}

export interface LiteralViolation { where: string; literal: string; kind: 'status' | 'number' | 'text' | 'path'; fromAutOnly?: boolean }

/**
 * Every literal in the expected-behaviour fields must be grounded: present in the sources, or (numbers) one step
 * outside a number that is (boundary values: "1–99" grounds 0 and 100), or in the value of a gap answered by the
 * requirement / config / user / an explicit assumption. A literal found only in a gap "discovered in the AUT" is
 * the oracle being read off the application → reported as fromAutOnly.
 */
export function inventedLiterals(c: RequirementContract, reqDir: string, opts: { apiBaseURL?: string } = {}): LiteralViolation[] {
  const sourceText = norm(textSources(reqDir).map((f) => fs.readFileSync(path.join(reqDir, f), 'utf8')).join('\n'));
  const sourceNumbers = numbersIn(sourceText);
  const sourceSteps = decimalSteps(sourceText);
  const answered = (c.gaps ?? []).filter((g) => ['found-in-requirement', 'found-in-config', 'provided-by-user', 'assumed'].includes(g.resolution)).map((g) => norm(`${g.value ?? ''} ${g.evidence ?? ''}`)).join('\n');
  const fromAut = (c.gaps ?? []).filter((g) => g.resolution === 'discovered-in-aut').map((g) => norm(`${g.value ?? ''}`)).join('\n');
  const answeredNumbers = numbersIn(answered);
  // A spec that states a base (https://host/api, or the bare path "the REST service under /api") and paths relative to
  // it grounds the composed path (/api/x). A base under the API origin's own path (base /parabank/services/bank, API
  // https://host/parabank/) grounds the path relative to that origin too (/services/bank/x).
  const urlBases = [...sourceText.matchAll(/https?:\/\/[^\s/"'`)<>]+(\/[a-z0-9_\-./]*[a-z0-9_\-])/g)].map((m) => m[1]);
  const pathBases = [...sourceText.matchAll(/(?<![\w/:.])(\/[a-z0-9_\-]+(?:\/[a-z0-9_\-]+)+)(?![\w/{])/g)].map((m) => m[1]);
  const apiPath = opts.apiBaseURL ? new URL(opts.apiBaseURL).pathname.replace(/\/+$/, '') : '';
  const bases = [...new Set([...urlBases, ...pathBases].map((b) => b.replace(/\/+$/, ''))
    .flatMap((b) => (apiPath && b.startsWith(`${apiPath}/`) ? [b, b.slice(apiPath.length)] : [b])))];
  const params = (s: string) => s.replace(/\{[^}]+\}|<[^>]+>|:[a-z_]+/g, '{}');
  const paramSources = params(sourceText);
  // A declared template (/contacts/{id}) filled with a value the sources give ("a malformed id, for example abc").
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const templates = [...new Set([...sourceText.matchAll(/(?<![\w/])(\/[a-z0-9_\-./]*\{[^}]+\}[a-z0-9_\-./{}]*)/g)].map((m) => m[1]))];
  const filledFromSources = (p: string) => templates.some((t) => {
    const hit = p.match(new RegExp(`^${t.split(/\{[^}]+\}/).map(esc).join('([^/]+)')}$`));
    return Boolean(hit) && hit!.slice(1).every((v) => new RegExp(`(^|[^\\w-])${esc(v)}([^\\w-]|$)`).test(sourceText));
  });
  const pathInSources = (p: string) => sourceText.includes(p) || paramSources.includes(params(p)) || filledFromSources(p);
  const out: LiteralViolation[] = [];
  const check = (where: string, text: string | undefined, opts: { mechanics?: boolean } = {}) => {
    if (!text) return;
    let rest = norm(text);
    // Quoted messages. Every pair of quotes is one quotation, a one-letter one ("A") included, so the closing quote of a
    // short name never opens a false one; a quotation shorter than two characters is a name, not a message.
    for (const m of [...rest.matchAll(/"([^"]*)"/g)]) {
      const lit = m[1].trim();
      if (lit.length >= 2 && !sourceText.includes(lit) && !answered.includes(lit)) out.push({ where, literal: `"${lit}"`, kind: 'text', fromAutOnly: fromAut.includes(lit) });
      rest = rest.replace(m[0], ' ');
    }
    for (const m of [...rest.matchAll(/(?<![\w/])(\/[a-z0-9_\-.{}:<>/]*[a-z0-9_}>])/g)]) { // paths
      const p = m[1];
      const underBase = bases.some((b) => p.startsWith(`${b}/`) && pathInSources(p.slice(b.length)));
      const grounded = pathInSources(p) || underBase || answered.includes(p) || (opts.mechanics && fromAut.includes(p));
      if (!grounded) out.push({ where, literal: p, kind: 'path', fromAutOnly: fromAut.includes(p) });
      rest = rest.replace(p, ' ');
    }
    // Ids of the contract's own items ("as AC-6 states", G2, NFR-1, SCN-003) are references, not expected values.
    rest = rest.replace(/\b(?:AC|R|E|G|NFR|SCN)-?\d+(?:\.\d+)?\b/gi, ' ');
    // Status codes (after →, "status", "responds", "returns", "HTTP"…) must match exactly; other numbers may sit one
    // step outside a stated boundary (1–99 grounds 0 and 100).
    const statuses = new Set([...rest.matchAll(/(?:→|->|\bstatus(?: code)?|\brespon(?:ds?|se)(?: with)?|\breturns?|\bcode|\bhttp|\banswer(?:s|ed)?(?: with)?)\s*(\d{3})\b/g)].map((m) => Number(m[1])));
    if (/^\s*\d{3}\s*$/.test(rest)) statuses.add(Number(rest.trim()));
    for (const n of numbersIn(rest)) {
      const ok = sourceNumbers.has(n) || answeredNumbers.has(n) || (!statuses.has(n) && (sourceNumbers.has(n - 1) || sourceNumbers.has(n + 1)
        || sourceSteps.some(([v, step]) => Math.abs(Math.abs(n - v) - step) < step / 1000)));
      if (!ok) out.push({ where, literal: String(n), kind: n >= 100 && n <= 599 && Number.isInteger(n) ? 'status' : 'number', fromAutOnly: numbersIn(fromAut).has(n) });
    }
  };
  for (const a of c.acceptanceCriteria ?? []) { check(`${a.id}.text`, a.text); (a.outcomes ?? []).forEach((o, i) => check(`${a.id}.outcomes[${i}]`, o)); }
  for (const r of c.rules ?? []) check(`rule ${r.id}`, r.text);
  // An error body is grounded as a whole when the sources contain it (quotes, backticks and spacing aside, so a JSON
  // body copied from a spec matches); otherwise each quoted string in it, or the plain text, must be grounded.
  const compact = (s: string) => norm(s).replace(/["'`\s]/g, '');
  const compactSources = `${compact(sourceText)}\n${compact(answered)}`;
  (c.errorModel ?? []).forEach((e) => {
    check(`${e.id}.status`, e.status !== undefined ? String(e.status) : undefined);
    if (!e.body || compactSources.includes(compact(e.body))) return;
    check(`${e.id}.body`, /"[^"]{2,}"/.test(e.body) ? e.body : `"${e.body.replace(/"/g, '')}"`);
  });
  for (const e of c.endpoints ?? []) {
    const viaGap = (c.gaps ?? []).some((g) => g.id === e.source && g.resolution !== 'open');
    if (!viaGap) check(`endpoint ${e.method} ${e.path}`, e.path, { mechanics: true });
  }
  return out;
}

export function checkLiterals(c: RequirementContract, reqDir: string, opts: { apiBaseURL?: string } = {}): ContractFinding[] {
  return inventedLiterals(c, reqDir, opts).map((v) => v.fromAutOnly
    ? { level: 'error' as const, code: 'oracle-literal-from-aut', message: `${v.where}: ${v.literal} appears only in what was discovered from the AUT — expected behaviour can't come from the application under test` }
    : { level: 'error' as const, code: 'invented-literal', message: `${v.where}: ${v.kind} ${v.literal} does not appear in the story, its attachments/transcripts or any answered gap — quote the source, or record a gap (ask / assume) for it` });
}

// ---- independent review ------------------------------------------------------------------------------

export type ReviewVerdict = 'supported' | 'unsupported' | 'misread' | 'incomplete';
export interface ContractReview {
  reviewer: string;
  reviewedAt: string;
  contractHash: string;
  items: { ref: string; verdict: ReviewVerdict; evidence?: string; note?: string }[];
  missed: { lines: string; note: string }[];
  /** Descriptive fields (actors, auth, testData…) that state more than the sources: warnings for the builder. */
  observations?: { field: string; note: string }[];
  summary?: string;
}

const canonical = (v: unknown): unknown => (Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, canonical((v as Record<string, unknown>)[k])])) : v);
const oracleGapIds = (c: RequirementContract) => new Set((c.gaps ?? []).filter((g) => g.kind === 'oracle').map((g) => g.id));
const mechanicsGapIds = (c: RequirementContract) => new Set((c.gaps ?? []).filter((g) => g.kind === 'mechanics').map((g) => g.id));
/** Endpoints stated by the requirement (reviewed), as opposed to endpoints found as mechanics (a gap discovered them). */
export const requirementEndpoints = (c: RequirementContract) => (c.endpoints ?? []).filter((e) => !mechanicsGapIds(c).has(e.source));

/**
 * Hash of the contract's REVIEWED content — WHAT the story requires: criteria (with their oracle gaps), rules,
 * error model, oracle gaps, the endpoints the requirement states (with the auth and success it states for them), the
 * stated auth scheme, and the coverage ledger. A review applies to
 * exactly this. Mechanics — HOW to exercise the app: mechanics gaps and their discoveries, endpoints they found,
 * which endpoints an AC calls, entry points, request fields, test data — are completed during hardening without a
 * re-review. Re-labelling an oracle gap as mechanics changes the hash.
 */
export const reviewedContent = (c: RequirementContract) => {
  const oracle = oracleGapIds(c);
  return {
    acceptanceCriteria: (c.acceptanceCriteria ?? []).map((a) => ({ id: a.id, text: a.text, quote: a.quote, source: a.source, layer: a.layer, outcomes: a.outcomes, gaps: (a.gaps ?? []).filter((g) => oracle.has(g)) })),
    rules: c.rules ?? [], errorModel: c.errorModel ?? [],
    gaps: (c.gaps ?? []).filter((g) => g.kind === 'oracle').map((g) => ({ id: g.id, element: g.element, kind: g.kind, required: g.required, affects: g.affects, resolution: g.resolution, value: g.value ?? null })),
    endpoints: requirementEndpoints(c).map((e) => ({ method: e.method, path: e.path, source: e.source, auth: e.auth ?? null, success: e.success ?? null })),
    auth: c.auth ? { mechanism: c.auth.mechanism, source: c.auth.source } : null,
    coverage: c.coverage,
  };
};
export const contractHash = (c: RequirementContract) => crypto.createHash('sha256').update(JSON.stringify(canonical(reviewedContent(c)))).digest('hex').slice(0, 16);

/** What the reviewer must cover: every AC, rule, error-model entry, oracle gap and endpoint the requirement states. */
export function reviewRefs(c: RequirementContract): string[] {
  return [
    ...(c.acceptanceCriteria ?? []).map((a) => a.id),
    ...(c.rules ?? []).map((r) => r.id),
    ...(c.errorModel ?? []).map((e) => e.id),
    ...(c.gaps ?? []).filter((g) => g.kind === 'oracle').map((g) => g.id),
    ...requirementEndpoints(c).map((e) => `${e.method} ${e.path}`),
  ];
}

export function readReview(evalDir: string): ContractReview | undefined {
  const f = path.join(evalDir, REVIEW_FILE);
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, 'utf8')) as ContractReview) : undefined;
}

export function checkReview(c: RequirementContract, review: ContractReview | undefined, opts: { requireReview?: boolean } = {}): ContractFinding[] {
  const out: ContractFinding[] = [];
  if (!review) {
    out.push({ level: opts.requireReview ? 'error' : 'warn', code: 'not-reviewed', message: `The contract has not been independently reviewed — run the heldout-contract-reviewer subagent (see references/requirement-contract.md)${opts.requireReview ? '. Before the review, the builder checks with: heldout contract <KEY> --allow-unreviewed' : ''}` });
    return out;
  }
  if (review.contractHash !== contractHash(c)) {
    out.push({ level: opts.requireReview ? 'error' : 'warn', code: 'review-stale', message: `The review (${review.reviewedAt}) was for another version of the contract (hash ${review.contractHash} ≠ ${contractHash(c)}) — the contract changed after review; run the reviewer again` });
    return out;
  }
  const byRef = new Map(review.items.map((i) => [i.ref, i]));
  for (const ref of reviewRefs(c)) if (!byRef.has(ref)) out.push({ level: 'error', code: 'review-unanswered', message: `the review has no verdict for ${ref}` });
  for (const i of review.items) if (i.verdict !== 'supported') out.push({ level: 'error', code: `review-${i.verdict}`, message: `reviewer: ${i.ref} is ${i.verdict}${i.note ? ` — ${i.note}` : ''}${i.evidence ? ` (${i.evidence})` : ''}` });
  for (const m of review.missed ?? []) out.push({ level: 'error', code: 'review-missed', message: `reviewer: ${m.lines} states something the contract does not capture — ${m.note}` });
  for (const o of review.observations ?? []) out.push({ level: 'warn', code: 'review-observation', message: `reviewer: ${o.field} — ${o.note}` });
  return out;
}
