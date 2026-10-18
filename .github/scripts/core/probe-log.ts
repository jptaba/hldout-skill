/**
 * The probe log of a story (4-evidence/probes.jsonl): every inspect, api-probe and mcp-probe call made with --key, one
 * JSON line each, numbered P1, P2… in the order they were made, whoever made them (the hardener, the triager). A line
 * holds what was asked (the steps or the chain, secrets as their references) and a digest of what came back; the
 * full report is written to the scratch area. A decision, a resolved gap or a confirmed guess cites probes by id
 * (`--evidence P7`), and a cited probe's full report is kept in the record, beside the log (4-evidence/P7.md).
 */
import fs from 'node:fs';
import path from 'node:path';
import { rel, writeFile } from './files';
import { evalPaths, evalRunsOf, type StoryPaths } from './paths';
import type { HeldoutConfig } from './profile';

export interface ProbeEntry {
  id: string;
  at: string;
  /** While hardening (no evaluation run yet) or while triaging. */
  phase: 'harden' | 'triage';
  tool: 'inspect' | 'api-probe' | 'mcp-probe';
  tier: 2 | 3;
  /** What was asked: the walk's steps, the chain, or the call (secrets as their references). */
  input: unknown;
  /** What came back, in a few lines: it has to make sense alone, the full report being scratch until cited. */
  digest: string[];
  /** The full report (scratch while not cited; 4-evidence/<id>.md once cited). */
  report: string;
}

const logOf = (p: Pick<StoryPaths, 'evidence'>) => path.join(p.evidence, 'probes.jsonl');
const scratchReport = (p: Pick<StoryPaths, 'work'>, id: string) => path.join(p.work.evidence, 'probes', `${id}.md`);
const keptReport = (p: Pick<StoryPaths, 'evidence'>, id: string) => path.join(p.evidence, `${id}.md`);
export const PROBE_ID = /\bP[1-9]\d*\b/g;

export function readProbes(p: Pick<StoryPaths, 'evidence'>): ProbeEntry[] {
  const file = logOf(p);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim()).flatMap((l) => { try { return [JSON.parse(l) as ProbeEntry]; } catch { return []; } });
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
 * Hand a probe's report over: with a story (--key), log it as the next Pn, write the full report to the scratch area
 * and print the digest; without one (a probe while setting a project up), print the report.
 */
export function deliverProbe(cfg: HeldoutConfig, key: string | undefined, o: { tool: ProbeEntry['tool']; tier: ProbeEntry['tier']; input: unknown; report: string; digest: string[] }): ProbeEntry | undefined {
  if (!key) { console.log(o.report); return undefined; }
  const p = evalPaths(cfg, key);
  const probes = readProbes(p);
  const id = `P${probes.reduce((n, e) => Math.max(n, Number(e.id.slice(1)) || 0), 0) + 1}`;
  const report = scratchReport(p, id);
  writeFile(report, o.report);
  const entry: ProbeEntry = { id, at: new Date().toISOString(), phase: evalRunsOf(p.runs).length ? 'triage' : 'harden', tool: o.tool, tier: o.tier, input: o.input, digest: o.digest, report: rel(report) };
  fs.mkdirSync(p.evidence, { recursive: true });
  fs.appendFileSync(logOf(p), `${JSON.stringify(entry)}\n`);
  for (const line of o.digest) console.log(`  ${line}`);
  console.log(`✔ ${id}: ${o.tool} — full report ${rel(report)}. Cite it as ${id} (--evidence ${id}); a cited probe's report is kept in ${rel(p.evidence)}/`);
  return entry;
}

/**
 * The probes a piece of evidence cites (P7, "P7, P9 and run 04-eval"): each must be in the log, and its full report is
 * kept in the record from now on. Returns the ids cited. Text without a probe id (a run, a proven journey) is
 * evidence too, and passes as it is.
 */
export function citeProbes(cfg: HeldoutConfig, key: string, evidence: string): string[] {
  const p = evalPaths(cfg, key);
  const ids = [...new Set(evidence.match(PROBE_ID) ?? [])];
  if (!ids.length) return [];
  const probes = readProbes(p);
  for (const id of ids) {
    const probe = probes.find((x) => x.id === id);
    if (!probe) throw new Error(`${id} is not in ${rel(logOf(p))} (probes: ${probes.map((x) => x.id).join(', ') || 'none yet'}). Nothing was written.`);
    const kept = keptReport(p, id);
    if (fs.existsSync(kept)) continue;
    const scratch = scratchReport(p, id);
    if (!fs.existsSync(scratch)) throw new Error(`The report of ${id} is gone from the scratch area (${rel(scratch)}): probe again and cite the new id. Nothing was written.`);
    fs.copyFileSync(scratch, kept);
  }
  return ids;
}

/** Probe ids the log holds more than once (two branches that each made a P7, merged). */
export function duplicateProbeIds(p: Pick<StoryPaths, 'evidence'>): string[] {
  const seen = new Set<string>();
  return [...new Set(readProbes(p).filter((e) => seen.has(e.id) || !seen.add(e.id)).map((e) => e.id))];
}

/**
 * Gives each later probe of a duplicated id the next free id (the earliest made keeps it), and says which. A citation
 * can't tell which of the two it meant, so citations keep pointing at the earliest; the renumbered probe's full report
 * stays where it was written.
 */
export function renumberDuplicateProbes(p: Pick<StoryPaths, 'evidence'>): { from: string; to: string }[] {
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
  if (changed.length) fs.writeFileSync(logOf(p), out.map((e) => `${JSON.stringify(e)}\n`).join(''));
  return changed;
}

/** The values a chain probe saved (the ids it made), for a later chain or walk (`--vars-from Pn`). */
export function savedOf(cfg: HeldoutConfig, key: string, id: string): Record<string, string> {
  const p = evalPaths(cfg, key);
  const probe = readProbes(p).find((x) => x.id === id);
  if (!probe) throw new Error(`${id} is not in ${rel(logOf(p))}`);
  const saved = (probe.input as { saved?: Record<string, string> } | undefined)?.saved;
  if (!saved) throw new Error(`${id} saved no values (an api-probe chain whose steps "save" something, or an inspect walk with --save, does)`);
  return saved;
}

/** The chain a probe ran (`api-probe --chain`), as a file the caller can read again. */
export function chainOfProbe(cfg: HeldoutConfig, key: string, id: string): string {
  const p = evalPaths(cfg, key);
  const probe = readProbes(p).find((x) => x.id === id);
  const chain = (probe?.input as { chain?: unknown } | undefined)?.chain;
  if (!probe || !chain) throw new Error(`${id} is not an api-probe chain in ${rel(logOf(p))}`);
  const file = path.join(p.work.evidence, 'chains', `${id}.chain.json`);
  writeFile(file, `${JSON.stringify(chain, null, 2)}\n`);
  return file;
}
