/** Pure verdict decision (unit tested). */
export type Verdict = 'PASS' | 'PASS_WITH_WARNINGS' | 'FAIL' | 'INCONCLUSIVE';

export interface VerdictInputs {
  integrity: 'PRESERVED' | 'AMENDED' | 'VIOLATED' | 'NO_DRAFT';
  confirmedAppDefects: { refs: string[] }[];
  failures: number;
  /** Scenarios that did not run (test.skip / fixme). A PASS requires every scenario to have run. */
  skipped?: number;
  flaky: number;
  uncoveredAcs: number;
  clarifications: number;
  /** Failures whose expectation rested only on an assumed oracle value (@assumes:G<n>): questions, not defects. */
  contradictedAssumptions?: number;
  openQuestions: number;
  /** Non-functional requirements the story states that no scenario verified. */
  unverifiedRequirements?: number;
}

export function decideVerdict(i: VerdictInputs): { verdict: Verdict; reason: string } {
  if (i.integrity === 'VIOLATED') {
    return { verdict: 'INCONCLUSIVE', reason: 'Held-out integrity was violated — requirement assertions changed after the draft was frozen without an audited amendment, so results cannot be trusted.' };
  }
  if (i.confirmedAppDefects.length) {
    const refs = [...new Set(i.confirmedAppDefects.flatMap((d) => d.refs))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return { verdict: 'FAIL', reason: `${i.confirmedAppDefects.length} application defect(s) reproduced by the evaluator: the AUT does not satisfy ${refs.join(', ')}. Awaiting reviewer confirmation.` };
  }
  if (i.failures) {
    return { verdict: 'INCONCLUSIVE', reason: `${i.failures} failure(s) not attributable to the application yet (unconfirmed, script, environment or needs investigation).` };
  }
  if (i.skipped) {
    return { verdict: 'INCONCLUSIVE', reason: `${i.skipped} scenario(s) did not run (skipped), so the requirement is not fully evaluated.` };
  }
  if (i.flaky || i.uncoveredAcs || i.clarifications || i.openQuestions || i.contradictedAssumptions || i.unverifiedRequirements) {
    const why = [i.contradictedAssumptions && `${i.contradictedAssumptions} reading(s) the application contradicts (an assumed value or an open question: ask the owner)`, i.flaky && `${i.flaky} flaky`, i.uncoveredAcs && `${i.uncoveredAcs} uncovered AC(s)`, i.clarifications && `${i.clarifications} scenario(s) needing clarification`, i.openQuestions && `${i.openQuestions} open question(s) not tested`, i.unverifiedRequirements && `${i.unverifiedRequirements} stated requirement(s) not verified`].filter(Boolean).join(', ');
    return { verdict: 'PASS_WITH_WARNINGS', reason: `${i.contradictedAssumptions ? 'Every requirement-backed scenario passed' : 'All scenarios passed'}, with warnings: ${why}.` };
  }
  return { verdict: 'PASS', reason: 'Every scenario passed and every acceptance criterion is covered.' };
}
