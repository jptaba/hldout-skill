/** The verification of a run's findings before they are published: what `heldout verify` decides and writes (verify.ts). */
import fs from 'node:fs';
import path from 'node:path';
import { readJson } from '../core/files';
import type { StoryPaths } from '../core/paths';
import { signature, type TriageEntry } from '../run/run-record';

export interface Verified { title: string; tests: string[]; held: boolean; by: string; why?: string }
export interface Verification { run: string; at: string; findings: Verified[] }

export const verificationFile = (p: Pick<StoryPaths, 'triage'>) => path.join(p.triage, 'verification.json');
export const readVerification = (p: Pick<StoryPaths, 'triage'>): Verification | undefined => (fs.existsSync(verificationFile(p)) ? readJson<Verification>(verificationFile(p)) : undefined);

/** The run's findings: its confirmed application defects, one per root cause (the decision's title). */
export function findingsOf(entries: TriageEntry[]): Map<string, TriageEntry[]> {
  const out = new Map<string, TriageEntry[]>();
  for (const e of entries.filter((x) => x.status === 'failed' && x.final?.category === 'APPLICATION_DEFECT')) {
    const k = e.final!.title ?? e.scenario;
    out.set(k, [...(out.get(k) ?? []), e]);
  }
  return out;
}

/** A decision the tool made by sending the test's calls again, twice: reproduced already, outside the test. */
export const replayed = (e: TriageEntry) => /^replayed by the tool/.test(e.final?.evidence ?? '');

/**
 * Whether a finding held when its tests ran again on their own: every test failed again, the same way (the same
 * failure signature as in the evaluation run). `again` is the rerun's entries.
 */
export function heldAgain(tests: TriageEntry[], again: Pick<TriageEntry, 'scenario' | 'status' | 'error' | 'failingStep'>[]): string | undefined {
  for (const t of tests) {
    const r = again.find((x) => x.scenario === t.scenario);
    if (!r) return `${t.scenario} did not run again`;
    if (r.status === 'passed') return `${t.scenario} passed when it ran again on its own`;
    if (r.status !== 'failed' && r.status !== 'flaky') return `${t.scenario} ended ${r.status} when it ran again`;
    if (signature(r as TriageEntry) !== signature(t)) return `${t.scenario} failed another way when it ran again: ${(r.error?.headline ?? '').slice(0, 160)}`;
  }
  return undefined;
}
