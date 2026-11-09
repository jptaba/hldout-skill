/**
 * The application map: what hardeners and triagers proved about how an application works (an answer's shape, the call a
 * page makes, a wait it needs), one JSON line per entry, one file per domain, each entry citing the probe that proved it.
 * Held-out: every use goes through requireFrozen, or today's behaviour would become the oracle. An entry is a starting
 * point for the next story and never its evidence, so it holds mechanics and no judgement of the application.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { plainText, readsLikeInstruction } from '../contract/evidence';
import { assertIssueKey } from '../core/config';
import { recordEvent } from '../core/history';
import { appMapDir, currentTestData, evalPaths } from '../core/paths';
import { citeProbes, PROBE_ID, readProbes, requireFrozen } from '../core/probe-log';
import type { HeldoutConfig } from '../core/profile';
import { safeToScrub, secretForms } from '../core/redact';
import { projectSecrets } from '../core/secrets';
import { envNamesIn } from './accounts-recipe';

export interface MapEntry {
  id: string;
  at: string;
  domain: string;
  text: string;
  /** The story and its probes that proved it. */
  story: string;
  probes: string[];
  /** What contradicted it: gone from reading, kept in the file. */
  stale?: { at: string; story: string; probes: string[] };
}

const MAX_TEXT = 400;
const DOMAIN = /^[a-z][a-z0-9-]*$/;
export const RECORD_ID = /\b\d{5,}\b|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i;
export const CREDENTIAL = /\b(?:bearer|basic)\s+(?=[\w.~+/=-]*\d)[\w.~+/=-]{16,}|\beyJ[\w-]{10,}\./i;
// "Accept" alone is a header, a mechanic; what the application accepts is for a requirement to judge. "No login step" is
// about a walk, what a call or a page lets through is not. Only a step is excepted: a heuristic all the same, and the
// agents' rule and a round's reading cover what it can't tell ("no sign-in step stands before it").
export const JUDGEMENT = /\b(?:defect\w*|bug(?:s|gy)?|should(?:n['’]t)?|wrong\w*|incorrect\w*|violat\w*|broken|expected|fails? to|accept(?:s|ed)|refus\w*|reject\w*|(?:no|without)\s+(?:any\s+)?(?:(?:sign-?in|log-?in)(?!\s+steps?\b)|auth\w*|credentials?|cookies?|tokens?))\b/i;

const fileOf = (cfg: HeldoutConfig, domain: string) => path.join(appMapDir(cfg), `${domain}.jsonl`);
const parsed = (line: string): MapEntry | undefined => {
  try {
    const e = JSON.parse(line) as Partial<MapEntry> | null;
    const staleIsFine = e?.stale === undefined || Array.isArray(e.stale?.probes);
    return e && typeof e.id === 'string' && typeof e.at === 'string' && typeof e.text === 'string' && typeof e.story === 'string' && Array.isArray(e.probes) && staleIsFine ? e as MapEntry : undefined;
  } catch { return undefined; }
};
const linesOf = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim()) : []);

/**
 * A domain's entries, one per id: a merge of two branches can leave a line twice, the stale copy beside the live one,
 * and the stale one wins.
 */
function readFile(file: string): MapEntry[] {
  const entries = new Map<string, MapEntry>();
  for (const e of linesOf(file).flatMap((l) => parsed(l) ?? [])) if (!entries.has(e.id) || e.stale) entries.set(e.id, e);
  return [...entries.values()];
}

function domainsOf(cfg: HeldoutConfig): string[] {
  const dir = appMapDir(cfg);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl')).map((f) => f.replace(/\.jsonl$/, '')).sort();
}

export function assertDomain(domain: string): void {
  if (!DOMAIN.test(domain)) throw new Error(`"${domain}" is not a domain: a word like the journeys' file names (cart, user-accounts)`);
}

/** The probes evidence cites, at least one, each in this story's logs; their reports are kept in the record. */
export function citedProbes(cfg: HeldoutConfig, key: string, evidence: string | undefined): string[] {
  const ids = evidence ? citeProbes(cfg, key, evidence) : [];
  if (!ids.length) throw new Error('--evidence must cite a probe of this story (P7): an entry is what a probe proved. Nothing was written.');
  return ids;
}

export const holds = (text: string, value: string) => {
  if (value.length < 3) return false;
  if (safeToScrub(value)) return secretForms([value]).some((form) => text.includes(form));
  // A short or all-letter secret could be an ordinary word's part: only the whole word counts.
  return new RegExp(`(?<![\\w])${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w])`).test(text);
};

/** Why a text can't be an entry, if so. The reason never repeats a value. `made` holds what the cited probes saved. */
export function whyNotAnEntry(text: string, secrets: string[] = [], made: string[] = []): string | undefined {
  if (!text) return 'it is empty';
  if (text.length > MAX_TEXT) return `it has ${text.length} characters, and an entry at most ${MAX_TEXT}: one mechanic each`;
  if (secrets.some((v) => holds(text, v)) || CREDENTIAL.test(text)) return 'it holds a secret value, or a word that is one: write its reference, ${env:NAME}, or reword';
  if (RECORD_ID.test(text) || made.some((v) => holds(text, v))) return 'it names a record of this run, which means nothing to the next story: write {id}';
  if (JUDGEMENT.test(text)) return 'it says what the application accepts, refuses or lets through, or judges it: that goes to the story\'s log or decisions, and the map says how to reach and read it';
  if (readsLikeInstruction(text)) return 'it reads like an instruction to an agent';
  return undefined;
}

/**
 * Where a story's secrets are referenced: its tests, its probes and the profile's accounts (the accounts alone with no
 * story, at onboarding). A username is no secret, and often an ordinary word that a route holds too.
 */
export function secretSources(cfg: HeldoutConfig, key?: string): unknown[] {
  const accounts = JSON.parse(JSON.stringify(cfg.aut?.accounts ?? {}, (k, v: unknown) => (k === 'username' ? undefined : v))) as unknown;
  if (!key) return [accounts];
  const p = evalPaths(cfg, key);
  const data = currentTestData(p);
  return [fs.existsSync(data) ? fs.readFileSync(data, 'utf8') : '', readProbes(p).map((e) => e.input), accounts];
}

/**
 * The secret values an entry must not hold: those the sources reference, and what the project calls a secret, vault
 * values the command loaded included. A refusal rewrites nothing, so a value too weak to scrub counts too.
 */
export function secretsFor(cfg: HeldoutConfig, key?: string): string[] {
  const named = envNamesIn(secretSources(cfg, key)).map((n) => process.env[n]).filter((v): v is string => !!v);
  return [...named, ...projectSecrets().map(([, value]) => value)];
}

/** What the cited probes saved (the ids a chain made). */
export function madeBy(cfg: HeldoutConfig, key: string, probes: string[]): string[] {
  return readProbes(evalPaths(cfg, key)).filter((e) => probes.includes(e.id))
    .flatMap((e) => Object.values((e.input as { saved?: Record<string, unknown> } | undefined)?.saved ?? {}).map(String));
}

/** The application's domains that have entries a reader would see, with how many. */
export function mapIndex(cfg: HeldoutConfig, key: string): { domain: string; entries: number }[] {
  requireFrozen(cfg, assertIssueKey(key), 'map');
  return domainsOf(cfg).map((domain) => ({ domain, entries: readFile(fileOf(cfg, domain)).filter((e) => !e.stale).length })).filter((d) => d.entries);
}

/** One domain's entries, those nothing has contradicted. */
export function readDomain(cfg: HeldoutConfig, key: string, domain: string): MapEntry[] {
  requireFrozen(cfg, assertIssueKey(key), 'map');
  assertDomain(domain);
  return readFile(fileOf(cfg, domain)).filter((e) => !e.stale);
}

export function addEntry(cfg: HeldoutConfig, key: string, domain: string, rawText: string, evidence: string | undefined): MapEntry {
  requireFrozen(cfg, assertIssueKey(key), 'map');
  assertDomain(domain);
  const text = plainText(rawText).replace(/\s+/g, ' ').trim();
  // Before the citation, which keeps a probe's report: a refused entry leaves nothing behind.
  const why = whyNotAnEntry(text, secretsFor(cfg, key), madeBy(cfg, key, evidence?.match(PROBE_ID) ?? []));
  if (why) throw new Error(`Not an entry: ${why}. Nothing was written.`);
  // From the text, not a counter: two branches adding to one domain merge without two entries sharing an id.
  const id = `M${createHash('sha256').update(`${domain}\n${text}`).digest('hex').slice(0, 6)}`;
  const same = readFile(fileOf(cfg, domain)).find((e) => e.id === id);
  if (same) throw new Error(`${id} says this already${same.stale ? `, and is stale (${same.stale.story} ${same.stale.probes.join(' ')}): say what holds now` : ''}. Nothing was written.`);
  const probes = citedProbes(cfg, key, evidence);
  const entry: MapEntry = { id, at: new Date().toISOString(), domain, text, story: key, probes };
  fs.mkdirSync(appMapDir(cfg), { recursive: true });
  fs.appendFileSync(fileOf(cfg, domain), `${JSON.stringify(entry)}\n`);
  recordEvent(evalPaths(cfg, key).history, 'map-entry', { id, domain, probes });
  return entry;
}

export function markStale(cfg: HeldoutConfig, key: string, id: string, evidence: string | undefined): MapEntry {
  requireFrozen(cfg, assertIssueKey(key), 'map');
  const domain = domainsOf(cfg).find((d) => readFile(fileOf(cfg, d)).some((e) => e.id === id));
  if (!domain) throw new Error(`${id} is not in this application's map. Nothing was written.`);
  const file = fileOf(cfg, domain);
  const entry = readFile(file).find((e) => e.id === id)!;
  if (entry.stale) throw new Error(`${id} is stale already (${entry.stale.story} ${entry.stale.probes.join(' ')}). Nothing was written.`);
  const stale = { at: new Date().toISOString(), story: key, probes: citedProbes(cfg, key, evidence) };
  // Line by line, so a line that doesn't parse (a merge gone wrong) stays for a person to mend.
  fs.writeFileSync(file, linesOf(file).map((l) => `${parsed(l)?.id === id ? JSON.stringify({ ...parsed(l), stale }) : l}\n`).join(''));
  recordEvent(evalPaths(cfg, key).history, 'map-entry', { id, domain, stale: true, probes: stale.probes });
  return { ...entry, stale };
}
