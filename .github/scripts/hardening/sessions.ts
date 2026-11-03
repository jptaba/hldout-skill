/**
 * Hardening a large story a domain at a time (specs/008-hardening-sessions): one session holds all it has read on every
 * turn, so a story whose guesses spread over several journey domains gets a session per domain, then a last one that
 * proves stability. The plan is recorded once, and which session comes next is read from the files: a session can pick
 * the story up anywhere, and a domain with guesses left comes round again. Sessions hand over through the application
 * map, the probe log and the hardening log.
 */
import fs from 'node:fs';
import path from 'node:path';
import { allJourneys, journeyUse, journeysUsedBy } from '../authoring/journeys/registry';
import { baseScenarioId, readSuite, specFiles } from '../authoring/spec-model';
import { readContract } from '../contract/contract-model';
import { lastEvent, readHistory, recordEvent } from '../core/history';
import { evalPaths, listRuns } from '../core/paths';
import type { HeldoutConfig } from '../core/profile';

const H = 'npm run heldout --';
/** A first guess at where a session's cold start begins to pay: below this, one session holds the story. */
export const MIN_GUESSES = 20;

export interface DomainGuesses { domain: string; marks: number; tests: number }

const domainOf = (file: string) => path.basename(file).replace(/\.ts$/, '');

/** The tests (base ids) that use a domain's journeys, directly or through other journeys. */
export function testsOfDomain(cfg: HeldoutConfig, key: string, dir: string, domain: string): Set<string> {
  const p = evalPaths(cfg, key);
  const journeys = allJourneys(cfg, cfg.autId);
  const use = journeyUse(journeys, specFiles(dir), readSuite(dir, readContract(p.contract)).scenarios);
  const ofDomain = journeys.filter((j) => j.domain === domain).flatMap((j) => [...(use.get(j.id) ?? [])]);
  return new Set(ofDomain.map(baseScenarioId));
}

/** The journey domains of this story's tests that hold guesses. */
export function guessesByDomain(cfg: HeldoutConfig, key: string): DomainGuesses[] {
  const p = evalPaths(cfg, key);
  return journeysUsedBy(cfg, cfg.autId, specFiles(p.hardened)).flatMap((file) => {
    const marks = (fs.readFileSync(file, 'utf8').match(/TODO\(harden\)/g) ?? []).length;
    return marks ? [{ domain: domainOf(file), marks, tests: testsOfDomain(cfg, key, p.hardened, domainOf(file)).size }] : [];
  });
}

/** The sessions a story's guesses call for, those most tests use first (they hold what the others stand on); none for a story one session can hold. */
export function plannedDomains(found: DomainGuesses[]): string[] {
  if (found.length < 2 || found.reduce((n, d) => n + d.marks, 0) < MIN_GUESSES) return [];
  return [...found].sort((a, b) => b.tests - a.tests || a.domain.localeCompare(b.domain)).map((d) => d.domain);
}

/** The next session of a planned story: a domain that still holds guesses, in the plan's order, or else the last one. */
export function nextSession(key: string, planned: string[], found: DomainGuesses[]): { task: string; why: string } {
  const left = new Set(found.map((d) => d.domain));
  const domain = [...planned, ...left].find((d) => left.has(d));
  const of = planned.length + 1;
  if (!domain) return { task: `Finish hardening ${key}, session ${of} of ${of}: no guess is left in the journeys, and sessions covered ${planned.join(', ')}. Resolve what gaps are left and the spec's own marks, prove stability and finish the log`, why: 'the last session' };
  const at = planned.indexOf(domain) + 1;
  // A file no test's calls reach (imported by a journey nothing calls) has nothing for the view to list.
  const view = found.find((d) => d.domain === domain)!.tests ? ` (${H} show ${key} spec --domain ${domain})` : '; no test calls them directly, so start from the file';
  return { task: `Harden the "${domain}" journeys for ${key}, session ${at || of} of ${of}: that domain and the tests that use it${view}`, why: 'one session per domain' };
}

export const isPlanned = (history: string) => Boolean(lastEvent(history, 'hardening-planned'));

/** Whether the path with no hardener may try this story: not after a run, and not a story hardened in sessions, as probes were made. */
export const mayHardenWithoutHardener = (p: { runs: string; history: string }) => !listRuns(p.runs).length && !isPlanned(p.history);

/** The session `advance` hands over, for a planned story: the plan is made once, before any run. Undefined when one session holds the story. */
export function hardeningSession(cfg: HeldoutConfig, key: string): { task: string; why: string } | undefined {
  const p = evalPaths(cfg, key);
  const found = guessesByDomain(cfg, key);
  let planned = lastEvent<{ domains: string[] }>(p.history, 'hardening-planned')?.domains;
  if (!planned && !listRuns(p.runs).length) {
    const domains = plannedDomains(found);
    if (domains.length) { recordEvent(p.history, 'hardening-planned', { domains }); planned = domains; }
  }
  if (!planned) return undefined;
  const session = nextSession(key, planned, found);
  // Hardening reopened after a run for this reason: only the task reaches the session.
  const violated = lastEvent<{ status: string }>(p.history, 'integrity')?.status === 'VIOLATED';
  return violated ? { ...session, task: `${session.task}. First: integrity is VIOLATED (${H} integrity ${key}): restore what the tests expect, or report the assertion whose implementation is wrong` } : session;
}

/**
 * A planned story isn't hardened until a stability run was made, whatever a session's log already says: a harden run
 * with repeats and a result. A part of a suite counts (a long stability run is made in parts, by --grep), so this can't
 * tell one part from all of them.
 */
export function stabilityProven(history: string): boolean {
  if (!isPlanned(history)) return true;
  return readHistory(history).some((e) => e.event === 'run' && /^\d+-harden/.test(String(e.run)) && Number(e.repeatEach) >= 2 && Boolean(e.stats));
}
