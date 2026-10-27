/**
 * The probe logs of a story: every inspect, api-probe and mcp-probe call made with --key, one JSON line each,
 * numbered P1, P2… across the story in the order they were made. A probe belongs to the phase it is made in (see
 * probingPhase): hardening's go to 4-hardening/probes.jsonl, triage's to 6-triage/probes.jsonl. A line holds what was asked
 * (the steps or the chain, secrets as their references) and a digest of what came back; the full report is written to
 * the phase's scratch area. A decision, a resolved gap or a confirmed guess cites probes by id (`--evidence P7`), and a
 * cited probe's full report is kept beside its phase's log (4-hardening/P7.md, 6-triage/P7.md).
 */
import fs from 'node:fs';
import path from 'node:path';
import { assertIssueKey } from './config';
import { readJson, rel, writeFile } from './files';
import { recordEvent } from './history';
import { decisionsFor, evalPaths, evalRunsOf, phaseDirs, runFile, type ProbingPhase, type StoryPaths } from './paths';
import type { HeldoutConfig } from './profile';

export interface ProbeEntry {
  id: string;
  at: string;
  /** While hardening (no evaluation run yet) or while triaging. */
  phase: ProbingPhase;
  tool: 'inspect' | 'api-probe' | 'mcp-probe';
  tier: 2 | 3;
  /** What was asked: the walk's steps, the chain, or the call (secrets as their references). */
  input: unknown;
  /** What came back, in a few lines: it has to make sense alone, the full report being scratch until cited. */
  digest: string[];
  /** The full report (scratch while not cited; kept beside the phase's log once cited). */
  report: string;
}

type ProbePaths = Pick<StoryPaths, 'hardened' | 'triage' | 'work'>;
type LogPaths = Pick<StoryPaths, 'hardened' | 'triage'>;
const PHASES: ProbingPhase[] = ['hardening', 'triage'];
const logOf = (p: LogPaths, phase: ProbingPhase) => path.join(phase === 'hardening' ? p.hardened : p.triage, 'probes.jsonl');
const scratchReport = (p: ProbePaths, phase: ProbingPhase, id: string) => path.join(phaseDirs(p, phase).work, 'probes', `${id}.md`);
const keptReport = (p: ProbePaths, phase: ProbingPhase, id: string) => path.join(phaseDirs(p, phase).kept, `${id}.md`);
export const PROBE_ID = /\bP[1-9]\d*\b/g;
const TRIMMED = (id: string) => `${id} was trimmed to its digest when the story's record was tidied for the verdict (nothing cited it): probe again`;

function readLog(file: string): ProbeEntry[] {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim()).flatMap((l) => {
    try { const e: unknown = JSON.parse(l); return e && typeof e === 'object' && !Array.isArray(e) ? [e as ProbeEntry] : []; } catch { return []; }
  });
}

/** Every probe logged for a story, hardening's then triage's; a line that isn't a JSON object (a merge gone wrong) is skipped. */
export function readProbes(p: LogPaths, phase?: ProbingPhase): ProbeEntry[] {
  return (phase ? [phase] : PHASES).flatMap((ph) => readLog(logOf(p, ph)));
}

/** The table rows of the named sections of a markdown report (headers and separators left out). */
export function tableRows(report: string, sections: string[]): string[] {
  const out: string[] = [];
  let inside = false;
  for (const line of report.split('\n')) {
    if (line.startsWith('## ')) inside = sections.some((s) => line.startsWith(`## ${s}`));
    else if (inside && line.startsWith('| ') && !/^\|\s*(#|expression|after|-{3})/.test(line)) out.push(line.slice(0, 240));
  }
  return out.slice(0, 40);
}

/**
 * Held-out isolation: nobody looks at the application for a story before its draft is frozen, so a probe for a story
 * (--key) is refused until `3-tests/freeze.json` exists, whatever tools the caller has. The refusal is a `note` of kind
 * `isolation` in the story's history. A probe for no story (setting a profile up) is not about a story, and stays open.
 */
export function requireFrozen(cfg: HeldoutConfig, key: string | undefined, tool: ProbeEntry['tool']): void {
  if (!key) return;
  const p = evalPaths(cfg, assertIssueKey(key));
  if (fs.existsSync(p.freeze)) return;
  if (fs.existsSync(p.base)) recordEvent(p.history, 'note', { kind: 'isolation', text: `${tool} refused: the draft of ${key} is not frozen yet` });
  throw new Error(`${tool} refused: the draft of ${key} is not frozen yet (${rel(p.freeze)}). Nobody looks at the application for a story before its tests are frozen (held-out isolation); the freeze comes first: heldout integrity ${key} --snapshot`);
}

/**
 * The phase a probe is made in, by where the story is: hardening before the evaluation run, and again when the draft
 * was frozen anew after it or when the triager has decided every failure and some are script defects (the hardener
 * repairs them); triage otherwise.
 */
export function probingPhase(p: Pick<StoryPaths, 'runs' | 'freeze'>): ProbingPhase {
  const last = evalRunsOf(p.runs).at(-1);
  if (!last) return 'hardening';
  const file = runFile(p, last);
  const read = <T>(f: string): T => { try { return readJson<T>(f); } catch (e) { throw new Error(`${rel(f)} can't be read (${(e as Error).message}): mend it from version control before probing`); } };
  const record = read<{ meta?: { startedAt?: string }; entries?: { scenario: string; status: string; auto?: unknown }[] }>(file);
  const frozenAt = fs.existsSync(p.freeze) ? read<{ frozenAt?: string }>(p.freeze).frozenAt : undefined;
  if (frozenAt && record.meta?.startedAt && frozenAt > record.meta.startedAt) return 'hardening';
  const decisions = fs.existsSync(decisionsFor(file)) ? (read<Record<string, Record<string, { category?: string }>>>(decisionsFor(file))[last] ?? {}) : {};
  const failures = (record.entries ?? []).filter((e) => (e.status === 'failed' || e.status === 'flaky') && e.auto);
  const repairing = failures.length > 0 && failures.every((e) => decisions[e.scenario]) && Object.values(decisions).some((d) => d.category === 'SCRIPT_DEFECT');
  return repairing ? 'hardening' : 'triage';
}

/**
 * Hand a probe's report over: with a story (--key), log it as the next Pn of the phase it is made in, write the full
 * report to that phase's scratch area and print the digest; without one (a probe while setting a project up), print
 * the report.
 */
export function deliverProbe(cfg: HeldoutConfig, key: string | undefined, o: { tool: ProbeEntry['tool']; tier: ProbeEntry['tier']; input: unknown; report: string; digest: string[] }): ProbeEntry | undefined {
  if (!key) { console.log(o.report); return undefined; }
  const p = evalPaths(cfg, assertIssueKey(key));
  const id = `P${readProbes(p).reduce((n, e) => Math.max(n, Number(e.id.slice(1)) || 0), 0) + 1}`;
  const phase = probingPhase(p);
  const report = scratchReport(p, phase, id);
  writeFile(report, o.report);
  const entry: ProbeEntry = { id, at: new Date().toISOString(), phase, tool: o.tool, tier: o.tier, input: o.input, digest: o.digest, report: rel(report) };
  fs.mkdirSync(phaseDirs(p, phase).kept, { recursive: true });
  fs.appendFileSync(logOf(p, phase), `${JSON.stringify(entry)}\n`);
  for (const line of o.digest) console.log(`  ${line}`);
  console.log(`✔ ${id}: ${o.tool} — full report ${rel(report)}. Cite it as ${id} (--evidence ${id}); a cited probe's report is kept in ${rel(phaseDirs(p, phase).kept)}/`);
  return entry;
}

/**
 * The probes a piece of evidence cites (P7, "P7, P9 and run 04-eval"): each must be in a log, and its full report is
 * kept in its phase's folder from now on. Returns the ids cited. Text without a probe id (a run, a proven journey) is
 * evidence too, and passes as it is.
 */
export function citeProbes(cfg: HeldoutConfig, key: string, evidence: string): string[] {
  const p = evalPaths(cfg, key);
  const ids = [...new Set(evidence.match(PROBE_ID) ?? [])];
  if (!ids.length) return [];
  const probes = readProbes(p);
  for (const id of ids) {
    const probe = probes.find((x) => x.id === id);
    if (!probe) throw new Error(`${id} is not in the story's probe logs (probes: ${probes.map((x) => x.id).join(', ') || 'none yet'}). Nothing was written.`);
    const kept = keptReport(p, probe.phase, id);
    if (fs.existsSync(kept)) continue;
    const scratch = scratchReport(p, probe.phase, id);
    if (!fs.existsSync(scratch)) throw new Error(`The report of ${id} is gone from the scratch area (${rel(scratch)}): probe again and cite the new id. Nothing was written.`);
    fs.copyFileSync(scratch, kept);
  }
  return ids;
}

/** Probe ids the logs hold more than once (two branches that each made a P7, merged). */
export function duplicateProbeIds(p: LogPaths): string[] {
  const seen = new Set<string>();
  return [...new Set(readProbes(p).filter((e) => seen.has(e.id) || !seen.add(e.id)).map((e) => e.id))];
}

/**
 * Gives each later probe of a duplicated id the next free id (the earliest made keeps it), and says which. A citation
 * can't tell which of the two it meant, so citations keep pointing at the earliest; the renumbered probe's full report
 * stays where it was written.
 */
export function renumberDuplicateProbes(p: LogPaths): { from: string; to: string }[] {
  const probes = readProbes(p);
  let next = probes.reduce((n, e) => Math.max(n, Number(e.id.slice(1)) || 0), 0);
  const first = new Map<string, ProbeEntry>();
  for (const e of [...probes].sort((a, b) => a.at.localeCompare(b.at))) if (!first.has(e.id)) first.set(e.id, e);
  const changed: { from: string; to: string }[] = [];
  const out = probes.map((e) => {
    if (first.get(e.id) === e) return e;
    const to = `P${++next}`;
    changed.push({ from: e.id, to });
    return { ...e, id: to, renumberedFrom: e.id };
  });
  if (changed.length) for (const phase of PHASES) {
    const lines = out.filter((e) => e.phase === phase);
    if (lines.length) fs.writeFileSync(logOf(p, phase), lines.map((e) => `${JSON.stringify(e)}\n`).join(''));
  }
  return changed;
}

/**
 * Keeps the reports of the probes a kept text names (the hardening log's tables, a decision's rationale, a gap's
 * evidence), as `--evidence` keeps the ones it cites: before the logs are trimmed, so nothing named loses its report.
 * A report already gone from the scratch area can't be kept: those ids are returned apart, to be said.
 */
export function keepNamedProbes(p: ProbePaths, texts: string[]): { kept: string[]; lost: string[] } {
  const named = new Set(texts.flatMap((t) => t.match(PROBE_ID) ?? []));
  const kept: string[] = [];
  const lost: string[] = [];
  for (const e of readProbes(p).filter((x) => named.has(x.id))) {
    const to = keptReport(p, e.phase, e.id);
    const from = scratchReport(p, e.phase, e.id);
    if (fs.existsSync(to)) continue;
    if (!fs.existsSync(from)) { lost.push(e.id); continue; }
    fs.copyFileSync(from, to);
    kept.push(e.id);
  }
  return { kept, lost };
}

/**
 * At the story's end, each probe log keeps in full only the probes something cites (their report is kept beside it);
 * the others keep their id, tool and first digest line, so the ids and the counts stay, without the steps or chains
 * nobody reads again. Returns how many lines were trimmed.
 */
export function trimProbeLogs(p: LogPaths): number {
  let trimmed = 0;
  for (const phase of PHASES) {
    const entries = readProbes(p, phase);
    if (!entries.length) continue;
    const dir = phase === 'hardening' ? p.hardened : p.triage;
    const out = entries.map((e) => {
      if (fs.existsSync(path.join(dir, `${e.id}.md`)) || e.input === undefined) return e;
      trimmed++;
      return { id: e.id, at: e.at, phase: e.phase, tool: e.tool, tier: e.tier, digest: e.digest.slice(0, 1), report: '' } as ProbeEntry;
    });
    fs.writeFileSync(logOf(p, phase), out.map((e) => `${JSON.stringify(e)}\n`).join(''));
  }
  return trimmed;
}

/** The values a chain probe saved (the ids it made), for a later chain or walk (`--vars-from Pn`). */
export function savedOf(cfg: HeldoutConfig, key: string, id: string): Record<string, string> {
  const probe = readProbes(evalPaths(cfg, key)).find((x) => x.id === id);
  if (!probe) throw new Error(`${id} is not in the story's probe logs`);
  if (probe.input === undefined) throw new Error(TRIMMED(id));
  const saved = (probe.input as { saved?: Record<string, string> } | undefined)?.saved;
  if (!saved) throw new Error(`${id} saved no values (an api-probe chain whose steps "save" something, or an inspect walk with --save, does)`);
  return saved;
}

/** The chain a probe ran (`api-probe --chain`), as a file the caller can read again, in its phase's scratch area. */
export function chainOfProbe(cfg: HeldoutConfig, key: string, id: string): string {
  const p = evalPaths(cfg, key);
  const probe = readProbes(p).find((x) => x.id === id);
  if (probe && probe.input === undefined) throw new Error(TRIMMED(id));
  const chain = (probe?.input as { chain?: unknown } | undefined)?.chain;
  if (!probe || !chain) throw new Error(`${id} is not an api-probe chain in the story's probe logs`);
  const file = path.join(phaseDirs(p, probe.phase).work, 'chains', `${id}.chain.json`);
  writeFile(file, `${JSON.stringify(chain, null, 2)}\n`);
  return file;
}
