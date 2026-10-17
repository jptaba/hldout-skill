/**
 * The history of a story (history.jsonl at the top of its folder): one JSON line per step that changed the story,
 * written by the command that made the change. It holds what no file shows (the draft marked finished, the verdict
 * published, the journeys harvested) and the record a later review reads: how many runs a story took and why, what
 * each phase decided, which skill version did it. A file a person can see stays authoritative over it.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SCRIPTS_DIR } from './config';

export type HistoryEventName =
  | 'fetched' | 'revised' | 'contract-checked' | 'draft-finished' | 'frozen' | 'refrozen' | 'amended' | 'integrity'
  | 'run' | 'triaged' | 'decided' | 'verdict' | 'published' | 'harvested' | 'note' | 'stray-moved' | 'pruned';

export interface HistoryEvent { at: string; event: HistoryEventName; skill: string; command?: string; [field: string]: unknown }

/** Hash of the skill's scripts and the test support code, so two steps can be told apart if the skill changed between them. */
export function skillFingerprint(): string {
  const files = fs.readdirSync(SCRIPTS_DIR, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.ts')).sort()
    .map((f) => path.join(SCRIPTS_DIR, f));
  const support = path.resolve('heldout-support', 'fixtures.ts');
  const h = createHash('sha256');
  for (const f of [...files, ...(fs.existsSync(support) ? [support] : [])]) h.update(fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n'));
  return h.digest('hex').slice(0, 16);
}

let commandLine: string | undefined;
/**
 * The command being run, as the history records it: its name, its positional arguments and the names of its flags.
 * Flag values are left out: they may hold a secret or a request body.
 */
export function setCommandLine(name: string, argv: string[]): void {
  commandLine = ['heldout', name, ...argv.filter((a, i) => a.startsWith('--') || !argv[i - 1]?.startsWith('--')).map((a) => a.split('=')[0])].join(' ');
}

let fingerprint: string | undefined;
/** Append one event to a story's history. */
export function recordEvent(file: string, event: HistoryEventName, data: Record<string, unknown> = {}): HistoryEvent {
  fingerprint ??= skillFingerprint();
  const entry: HistoryEvent = { at: new Date().toISOString(), event, skill: fingerprint, ...(commandLine ? { command: commandLine } : {}), ...data };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`);
  return entry;
}

/**
 * Append an event only when its outcome differs from the latest of its kind: a check run again with the same result
 * (the builder re-running the contract check, the hardener re-running integrity) adds no line.
 */
export function recordChange(file: string, event: HistoryEventName, data: Record<string, unknown>): HistoryEvent | undefined {
  const before = lastEvent(file, event);
  if (before && Object.entries(data).every(([k, v]) => JSON.stringify(before[k]) === JSON.stringify(v))) return undefined;
  return recordEvent(file, event, data);
}

/** Every event of a story, oldest first. A line that isn't JSON (a merge gone wrong) is skipped, not fatal. */
export function readHistory(file: string): HistoryEvent[] {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim()).flatMap((l) => {
    try { return [JSON.parse(l) as HistoryEvent]; } catch { return []; }
  });
}

/** The latest event of a kind, if there is one. */
export function lastEvent<T extends object = Record<string, unknown>>(file: string, event: HistoryEventName): (HistoryEvent & T) | undefined {
  return readHistory(file).filter((e) => e.event === event).at(-1) as (HistoryEvent & T) | undefined;
}
