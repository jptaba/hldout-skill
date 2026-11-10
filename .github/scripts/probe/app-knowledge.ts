/**
 * What an application is, and what is known of its business: application-map/<profile>/app.yml, beside the domain map
 * (specs/017-application-knowledge). Two parts, two kinds of reader:
 * - the overview (purpose, areas, kinds of user, sign-in, API, terms): every agent reads it, before a story's freeze
 *   too, so it holds the application's words and shape and never an expected value, a rule or a message, and is
 *   written at setup only (specs/018-lean-skill-one-writer);
 * - the rules, required by an earlier story's requirement or observed in the application: read after the freeze only,
 *   as the domain map is. Neither is ever evidence for a story: that is its own contract, probe or run.
 * One entry per line in YAML flow style (a JSON object), so two branches merge by keeping both sides' lines.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { checkReview, plainText, readReview, readsLikeInstruction } from '../contract/evidence';
import { readContract } from '../contract/contract-model';
import { assertIssueKey } from '../core/config';
import { readJson } from '../core/files';
import { recordEvent } from '../core/history';
import { appMapDir, evalPaths, knowledgeFile, listStories } from '../core/paths';
import { citeProbes, PROBE_ID, requireFrozen } from '../core/probe-log';
import type { HeldoutConfig } from '../core/profile';
import { assertDomain, citedProbes, CREDENTIAL, holds, JUDGEMENT, madeBy, RECORD_ID, secretsFor } from './app-map';

export const PARTS = ['purpose', 'area', 'user', 'sign-in', 'api', 'term'] as const;
export type Part = typeof PARTS[number];
interface Stale { at: string; story: string; evidence: string[] }
export interface OverviewEntry { id: string; part: Part; text: string; at: string; stale?: Stale }
export interface RuleEntry { id: string; kind: 'required' | 'observed'; text: string; domain?: string; story: string; source: string[]; at: string; stale?: Stale }

const MAX_OVERVIEW = 300;
const MAX_OBSERVED = 400;
const MAX_REQUIRED = 600;
export const OVERVIEW_ID = /\bO[0-9a-f]{6}\b/;
export const RULE_ID = /\bB[0-9a-f]{6}\b/;
/** A figure not glued to a word or a path: "10 items", "24h", "2FA" are refused; "v1", "/api/v2", "OAuth2" pass. */
const FIGURE = /(?<![\p{L}\d/_.-])\d/u;
/** A figure in words ("ten lines", "a dozen", "twice"): "one" is left out, it says "a" as often as a number. */
const FIGURE_WORDS = /\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundreds?|thousands?|millions?|dozens?|half|twice|double|triple|percent|per cent)\b|%/i;
/** Quoted text: a message or a label as the application writes it. An apostrophe inside a word ("user's") is no quote. */
const QUOTED = /["“”„«»`]|‘[^’]*’|(?:^|[\s(])'[^'\n]+'(?=$|[\s).,;:!?])/;
/** Words that state a rule: what is required, allowed, limited or always so. Rules wait for a freeze. */
const RULE_WORDS = /\b(?:must(?:n['’]t)?|only|at (?:least|most)|up to|(?:no )?(?:more|less|fewer) than|exactly|required?|requires|mandatory|optional|allow(?:s|ed)?|permit(?:s|ted)?|forbid\w*|prohibit\w*|limit\w*|maxim\w*|minim\w*|max|min|cannot|can['’]t|never|always|unless|valid\w*|invalid\w*|needs? to|ha(?:s|ve) to|may not|above|below|beyond|exceed\w*|no longer than|within)\b/i;
/** A judgement of the application, which a rule never is: what it accepts or refuses may be said, not that it is wrong. */
const JUDGED = /\b(?:defect\w*|bug(?:s|gy)?|should(?:n['’]t)?|wrong\w*|incorrect\w*|violat\w*|broken|expected|fails? to)\b/i;

export { knowledgeFile };
const HEADER = [
  '# What this application is, and what is known of its business. Written by `heldout map`, one entry per line, so two',
  '# branches merge by keeping both sides\' lines. overview: every agent reads it (heldout map --overview); rules: read',
  '# after a story\'s freeze only (heldout map KEY --rules). Neither is ever a story\'s evidence.',
  'schema: 1',
];

const isStale = (s: unknown) => s === undefined || (typeof s === 'object' && s !== null && Array.isArray((s as Stale).evidence));
function asOverview(e: Record<string, unknown>): OverviewEntry | undefined {
  return typeof e.id === 'string' && OVERVIEW_ID.test(e.id) && PARTS.includes(e.part as Part) && typeof e.text === 'string' && typeof e.at === 'string' && isStale(e.stale) ? e as unknown as OverviewEntry : undefined;
}
function asRule(e: Record<string, unknown>): RuleEntry | undefined {
  return typeof e.id === 'string' && RULE_ID.test(e.id) && (e.kind === 'required' || e.kind === 'observed') && typeof e.text === 'string' && typeof e.story === 'string' && Array.isArray(e.source) && typeof e.at === 'string' && isStale(e.stale) ? e as unknown as RuleEntry : undefined;
}

interface Store { overview: OverviewEntry[]; rules: RuleEntry[]; unread: string[] }

/** When an entry's copy last changed: its stale mark, or its writing (a rule required again is written anew). */
const stamp = (e: { at: string; stale?: Stale }) => e.stale?.at ?? e.at;
const later = <T extends { at: string; stale?: Stale }>(had: T | undefined, e: T) => !had || stamp(e) >= stamp(had);

/**
 * The file's entries, one per id. A merge can leave a line twice: the copy changed last wins, so a stale mark beats the
 * live copy it was made on, and a rule required again beats the stale mark before it.
 */
export function readStore(cfg: Pick<HeldoutConfig, 'autId'>): Store {
  const file = knowledgeFile(cfg);
  const overview = new Map<string, OverviewEntry>(); const rules = new Map<string, RuleEntry>(); const unread: string[] = [];
  const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/) : [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#') || /^(schema:\s*\d+|overview:|rules:)$/.test(t)) continue;
    const m = /^-\s*(\{.*\})$/.exec(t);
    let e: Record<string, unknown> | undefined;
    try { e = m ? JSON.parse(m[1]) as Record<string, unknown> : undefined; } catch { e = undefined; }
    const o = e && asOverview(e); const r = e && asRule(e);
    if (o) { if (later(overview.get(o.id), o)) overview.set(o.id, o); } else if (r) { if (later(rules.get(r.id), r)) rules.set(r.id, r); } else unread.push(t.slice(0, 80));
  }
  return { overview: [...overview.values()], rules: [...rules.values()], unread };
}

function writeStore(cfg: Pick<HeldoutConfig, 'autId'>, s: Store): void {
  // Line by line, on purpose: a line it can't read (a merge gone wrong) would be lost by a rewrite, so a person mends it.
  if (s.unread.length) throw new Error(`${path.relative(process.cwd(), knowledgeFile(cfg))} has ${s.unread.length} line(s) it can't read (a merge gone wrong?): ${s.unread.slice(0, 2).join(' | ')} — mend them from version control first. Nothing was written.`);
  const order = (p: Part) => PARTS.indexOf(p);
  const overview = [...s.overview].sort((a, b) => order(a.part) - order(b.part) || a.at.localeCompare(b.at));
  const rules = [...s.rules].sort((a, b) => a.at.localeCompare(b.at));
  fs.mkdirSync(appMapDir(cfg), { recursive: true });
  fs.writeFileSync(knowledgeFile(cfg), [...HEADER, 'overview:', ...overview.map((e) => `- ${JSON.stringify(e)}`), 'rules:', ...rules.map((e) => `- ${JSON.stringify(e)}`), ''].join('\n'));
}

const idOf = (prefix: 'O' | 'B', ...parts: string[]) => `${prefix}${createHash('sha256').update(parts.join('\n')).digest('hex').slice(0, 6)}`;
const clean = (raw: string) => plainText(raw).replace(/\s+/g, ' ').trim();
const secretIn = (text: string, secrets: string[]) => secrets.some((v) => holds(text, v)) || CREDENTIAL.test(text);

/** Why a text can't be in the overview, if so: it says what the application is, never what it does with a value. */
export function whyNotOverview(text: string, secrets: string[] = []): string | undefined {
  if (!text) return 'it is empty';
  if (text.length > MAX_OVERVIEW) return `it has ${text.length} characters, and an overview entry at most ${MAX_OVERVIEW}: one thing each`;
  if (secretIn(text, secrets)) return 'it holds a secret value, or a word that is one: write its reference, ${env:NAME}, or reword';
  if (RECORD_ID.test(text)) return 'it names a record, which means nothing to the next story';
  if (FIGURE.test(text) || FIGURE_WORDS.test(text)) return 'it holds a figure: the overview says what the application is, never a number, an amount or a limit it works with';
  if (QUOTED.test(text)) return 'it quotes the application (a message, a label): say what the thing is in your own words, without quotes';
  if (RULE_WORDS.test(text)) return 'it states a rule (what is required, allowed or limited): rules are read after a freeze only, heldout map KEY --rule';
  if (JUDGEMENT.test(text)) return 'it says what the application accepts, refuses or lets through, or judges it: that is a rule, read after a freeze only';
  if (readsLikeInstruction(text)) return 'it reads like an instruction to an agent';
  return undefined;
}

/** Why a text can't be an observed rule: it may say what the application accepts or refuses, never that it is wrong. */
export function whyNotObservedRule(text: string, secrets: string[] = [], made: string[] = []): string | undefined {
  if (!text) return 'it is empty';
  if (text.length > MAX_OBSERVED) return `it has ${text.length} characters, and a rule at most ${MAX_OBSERVED}: one rule each`;
  if (secretIn(text, secrets)) return 'it holds a secret value, or a word that is one: write its reference, ${env:NAME}, or reword';
  if (RECORD_ID.test(text) || made.some((v) => holds(text, v))) return 'it names a record of this run, which means nothing to the next story: write {id}';
  if (JUDGED.test(text)) return 'it judges the application (a defect, what it should do): an observed rule says what it was seen to do, and the story\'s decisions judge it';
  if (readsLikeInstruction(text)) return 'it reads like an instruction to an agent';
  return undefined;
}

/** Why a requirement's own text can't be kept as a required rule: only what must never be kept at all. */
function whyNotRequiredRule(text: string, secrets: string[]): string | undefined {
  if (!text) return 'it is empty';
  if (text.length > MAX_REQUIRED) return `it has ${text.length} characters, more than ${MAX_REQUIRED}`;
  if (secretIn(text, secrets)) return 'it holds a secret value';
  if (readsLikeInstruction(text)) return 'it reads like an instruction to an agent';
  return undefined;
}

/**
 * A story of the profile between its fetch and its freeze (and with no verdict), if any. Held-out: while its contract
 * or tests are being written, what those agents read stays as it was and nobody looks at the application for setup
 * either. Setup is before any story, or between stories.
 */
export function draftingStory(cfg: HeldoutConfig): string | undefined {
  return listStories(cfg).find((s) => s.profile === cfg.autId && !fs.existsSync(evalPaths(cfg, s.key).freeze) && !fs.existsSync(evalPaths(cfg, s.key).verdictJson))?.key;
}

/** The overview, as nothing has contradicted it. Every agent reads it, so no freeze is asked for. */
export const readOverview = (cfg: Pick<HeldoutConfig, 'autId'>): OverviewEntry[] => readStore(cfg).overview.filter((e) => !e.stale);
export const hasOverview = (cfg: Pick<HeldoutConfig, 'autId'>): boolean => readOverview(cfg).length > 0;

/**
 * An overview entry, written at setup: before a story or between stories, never by a story (specs/018). What every
 * agent reads before a freeze has one writer, at one time, so a story's agents only mark an entry stale. An entry a
 * probe marked stale is restored by saying it again: a person decides it holds after all, and is told whose mark
 * they overrode (`restored`, which the file doesn't keep).
 */
export function addOverview(cfg: HeldoutConfig, part: string, raw: string): OverviewEntry & { restored?: Stale } {
  if (!PARTS.includes(part as Part)) throw new Error(`"${part}" is not a part of the overview: ${PARTS.join(', ')}. Nothing was written.`);
  const drafting = draftingStory(cfg);
  if (drafting) throw new Error(`${drafting} is between its fetch and its freeze: the overview is written at setup, before a story or between stories, and stays as it is while a contract or tests are written from it. Nothing was written.`);
  const text = clean(raw);
  const why = whyNotOverview(text, secretsFor(cfg));
  if (why) throw new Error(`Not an overview entry: ${why}. Nothing was written.`);
  const store = readStore(cfg);
  const id = idOf('O', part, text);
  const same = store.overview.find((e) => e.id === id);
  if (same && !same.stale) throw new Error(`${id} says this already. Nothing was written.`);
  const entry: OverviewEntry = { id, part: part as Part, text, at: new Date().toISOString() };
  writeStore(cfg, { ...store, overview: [...store.overview.filter((e) => e.id !== id), entry] });
  return same?.stale ? { ...entry, restored: same.stale } : entry;
}

/** The rules nothing has contradicted, all or one domain's: after the story's freeze only. */
export function readRules(cfg: HeldoutConfig, key: string, domain?: string): RuleEntry[] {
  requireFrozen(cfg, assertIssueKey(key), 'map');
  if (domain !== undefined) assertDomain(domain);
  // A required rule has no domain (a contract names none): it is shown with every domain's rules.
  return readStore(cfg).rules.filter((r) => !r.stale && (domain === undefined || r.domain === domain || r.domain === undefined));
}

/** What the application was seen to do, citing this story's probe: kept as observed, never as required. */
export function addObservedRule(cfg: HeldoutConfig, key: string, domain: string | undefined, raw: string, evidence: string | undefined): RuleEntry {
  requireFrozen(cfg, assertIssueKey(key), 'map');
  if (domain !== undefined) assertDomain(domain);
  const text = clean(raw);
  const why = whyNotObservedRule(text, secretsFor(cfg, key), madeBy(cfg, key, evidence?.match(PROBE_ID) ?? []));
  if (why) throw new Error(`Not a rule: ${why}. Nothing was written.`);
  const store = readStore(cfg);
  const id = idOf('B', 'observed', domain ?? '', text);
  const same = store.rules.find((e) => e.id === id);
  if (same) throw new Error(`${id} says this already${same.stale ? ', and is stale: say what holds now' : ''}. Nothing was written.`);
  // Before the citation, which keeps a probe's report: a write that can't happen leaves nothing behind.
  if (store.unread.length) writeStore(cfg, store);
  const source = citedProbes(cfg, key, evidence);
  const rule: RuleEntry = { id, kind: 'observed', text, ...(domain ? { domain } : {}), story: key, source, at: new Date().toISOString() };
  writeStore(cfg, { ...store, rules: [...store.rules, rule] });
  recordEvent(evalPaths(cfg, key).history, 'knowledge-entry', { id, kind: 'observed', domain, probes: source });
  return rule;
}

/**
 * A story's requirement, kept for the next stories once it is judged: its contract's rules and the gaps its owner
 * answered. Assumed and open gaps are not requirement. A text it can't keep is said, never dropped quietly.
 */
export function harvestRules(cfg: HeldoutConfig, key: string): { added: RuleEntry[]; known: number; left: { item: string; why: string }[] } {
  requireFrozen(cfg, assertIssueKey(key), 'map');
  const p = evalPaths(cfg, key);
  const contract = readContract(p.contract);
  if (!contract) throw new Error(`${key} has no contract to take rules from. Nothing was written.`);
  if (!fs.existsSync(p.verdictJson)) throw new Error(`${key} has no verdict yet: a story's rules are kept once it is judged (heldout verdict ${key}). Nothing was written.`);
  // A story that was not evaluable is never frozen, so the freeze above already keeps nothing of it.
  const verdict = readJson<{ finalRun?: string }>(p.verdictJson);
  // A requirement is kept only as the evaluation read it: a contract its independent review accepted as it is now.
  // Not clean (an answer recorded after the verdict, say): nothing is kept, it is said, and the story goes on.
  const review = checkReview(contract, readReview(p.review), { requireReview: true }).filter((f) => f.level === 'error');
  if (review.length) {
    const why = `the contract is not reviewed clean as it is now (${review[0].code}): review it again, then heldout map ${key} --harvest`;
    recordEvent(p.history, 'rules-harvested', { finalRun: verdict.finalRun ?? '-', added: 0, known: 0, left: ['*'], why });
    return { added: [], known: 0, left: [{ item: '*', why }] };
  }
  const items = [
    ...(contract.rules ?? []).map((r) => ({ item: r.id, text: clean(r.text) })),
    ...contract.gaps.filter((g) => g.kind === 'oracle' && g.resolution === 'provided-by-user' && g.value).map((g) => ({ item: g.id, text: clean(`${g.element}: ${g.value}`) })),
  ];
  const secrets = secretsFor(cfg, key);
  const store = readStore(cfg);
  const added: RuleEntry[] = []; const left: { item: string; why: string }[] = []; let known = 0;
  const at = new Date().toISOString();
  let rules = store.rules;
  for (const { item, text } of items) {
    const why = whyNotRequiredRule(text, secrets);
    if (why) { left.push({ item, why }); continue; }
    const id = idOf('B', 'required', text);
    const same = rules.find((r) => r.id === id);
    if (added.some((r) => r.id === id) || (same && !same.stale)) { known++; continue; }
    // Required again after something marked it stale: this story's requirement stands, so the rule is read again.
    const rule: RuleEntry = { id, kind: 'required', text, story: key, source: [item], at };
    if (same) rules = rules.map((r) => (r.id === id ? rule : r)); else rules = [...rules, rule];
    added.push(rule);
  }
  if (added.length) writeStore(cfg, { ...store, rules });
  recordEvent(p.history, 'rules-harvested', { finalRun: verdict.finalRun ?? '-', added: added.length, known, left: left.map((l) => l.item) });
  return { added, known, left };
}

/**
 * Marks an overview entry or a rule stale: by this story's probe, or (a required rule) by an item of this story's
 * contract that replaces it. Reading no longer shows it; the file keeps it with what contradicted it.
 */
export function markKnowledgeStale(cfg: HeldoutConfig, key: string, id: string, evidence: string | undefined): OverviewEntry | RuleEntry {
  requireFrozen(cfg, assertIssueKey(key), 'map');
  const store = readStore(cfg);
  const entry = OVERVIEW_ID.test(id) ? store.overview.find((e) => e.id === id) : store.rules.find((e) => e.id === id);
  if (!entry) throw new Error(`${id} is not in this application's knowledge (${path.basename(knowledgeFile(cfg))}). Nothing was written.`);
  if (entry.stale) throw new Error(`${id} is stale already (${entry.stale.story} ${entry.stale.evidence.join(' ')}). Nothing was written.`);
  if (store.unread.length) writeStore(cfg, store);
  // A required rule is retired only by a later requirement: what the application does never settles what was asked
  // (a probe that contradicts one is a question for the verdict). The rest, overview and observed rules, by a probe.
  const required = 'kind' in entry && entry.kind === 'required';
  let cited: string[];
  if (required) {
    if (entry.story === key) throw new Error(`${id} is ${key}'s own requirement: a later story's requirement retires it, never the story that asked for it. Nothing was written.`);
    const contract = readContract(evalPaths(cfg, key).contract);
    cited = [...new Set(evidence?.match(/\b[RG]\d+\b/g) ?? [])].filter((i) => contract && ((contract.rules ?? []).some((r) => r.id === i) || contract.gaps.some((g) => g.id === i && g.resolution === 'provided-by-user')));
    if (!cited.length) throw new Error(`${id} is required by ${entry.story}: only this story's requirement that replaces it retires it, its contract's rule (R2) or its owner's answer (G3) as --evidence. A probe that contradicts it is a question for the verdict. Nothing was written.`);
    // As the harvest: a requirement counts as the evaluation read it, in a contract its review accepted as it is now.
    const unreviewed = contract ? checkReview(contract, readReview(evalPaths(cfg, key).review), { requireReview: true }).filter((f) => f.level === 'error') : [];
    if (unreviewed.length) throw new Error(`${id} is required by ${entry.story}, and ${key}'s contract is not reviewed clean as it is now (${unreviewed[0].code}): only a reviewed requirement retires a rule. Nothing was written.`);
  } else {
    cited = citeProbes(cfg, key, evidence ?? '');
    if (!cited.length) throw new Error('--evidence must cite a probe of this story (P7). Nothing was written.');
  }
  const stale: Stale = { at: new Date().toISOString(), story: key, evidence: cited };
  const marked = { ...entry, stale };
  writeStore(cfg, OVERVIEW_ID.test(id)
    ? { ...store, overview: store.overview.map((e) => (e.id === id ? marked as OverviewEntry : e)) }
    : { ...store, rules: store.rules.map((e) => (e.id === id ? marked as RuleEntry : e)) });
  recordEvent(evalPaths(cfg, key).history, 'knowledge-entry', { id, stale: true, evidence: stale.evidence });
  return marked;
}
