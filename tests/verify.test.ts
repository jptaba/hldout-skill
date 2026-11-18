/**
 * Each finding reproduced once more before it is published (triage/verify.ts).
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TriageEntry } from '../.github/scripts/run/run-record';
import { findingsOf, heldAgain } from '../.github/scripts/triage/verification';

const entry = (scenario: string, o: Partial<TriageEntry> = {}): TriageEntry => ({
  scenario, title: `${scenario}: x`, file: 'a.spec.ts', status: 'failed', tags: [], requirementRefs: ['AC-1'], otherFailures: [], evidence: { attempts: 1 },
  error: { headline: '[REQ AC-1] the total: expected 10, received 12' } as TriageEntry['error'], ...o,
});
const defect = (scenario: string, title: string, evidence = 'P7') => entry(scenario, { final: { category: 'APPLICATION_DEFECT', title, rationale: 'r', evidence, confirmedAt: 'now' } });

describe('the findings of a run', () => {
  it('are its confirmed application defects, one per root cause', () => {
    const f = findingsOf([defect('SCN-001', 'Total wrong'), defect('SCN-002', 'Total wrong'), defect('SCN-003', 'No refusal'), entry('SCN-004'), entry('SCN-005', { status: 'passed' })]);
    assert.deepEqual([...f].map(([t, es]) => [t, es.map((e) => e.scenario)]), [['Total wrong', ['SCN-001', 'SCN-002']], ['No refusal', ['SCN-003']]]);
  });
});

describe('a finding run again', () => {
  const tests = [defect('SCN-001', 'Total wrong'), defect('SCN-002', 'Total wrong')];
  it('holds when every test failed again the same way', () => {
    assert.equal(heldAgain(tests, [entry('SCN-001'), entry('SCN-002')]), undefined);
  });
  it('does not hold when a test passed, failed another way, or did not run', () => {
    assert.match(heldAgain(tests, [entry('SCN-001'), entry('SCN-002', { status: 'passed' })])!, /SCN-002 passed when it ran again/);
    assert.match(heldAgain(tests, [entry('SCN-001'), entry('SCN-002', { error: { headline: 'locator not found' } as TriageEntry['error'] })])!, /failed another way/);
    assert.match(heldAgain(tests, [entry('SCN-001')])!, /SCN-002 did not run again/);
  });
});
