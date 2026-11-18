/**
 * Each finding reproduced once more before it is published (triage/verify.ts).
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TriageEntry } from '../.github/scripts/run/run-record';
import { findingsOf, heldAgain } from '../.github/scripts/triage/verification';
import { saysAnyReading } from '../.github/scripts/triage/triage';

describe('a decision that says it holds under any reading', () => {
  it('is told apart from one that depends on the answer', () => {
    for (const s of ['under either reading the line\'s quantity was changed to a value nobody sent', 'It is wrong whichever way G3 is answered', 'a defect under any reading of G7', 'holds under every reading']) assert.ok(saysAnyReading(s), s);
    for (const s of ['under the narrow reading the story states no outcome', 'the owner is asked which reading holds', 'reading the list shows two lines']) assert.ok(!saysAnyReading(s), s);
  });
});

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
  it('holds when the same check fails again on another record: a run picks its own, and what it received names it', () => {
    const run1 = [defect('SCN-004', 'Not removed')]; run1[0].error = { headline: '[REQ AC-4] Removing a favourite: the product in the list (expects nothing there, got {"favourite":"01KA1"})' } as TriageEntry['error'];
    const again = entry('SCN-004', { error: { headline: '[REQ AC-4] Removing a favourite: the product in the list (expects nothing there, got {"favourite":"01KB7"})' } as TriageEntry['error'] });
    assert.equal(heldAgain(run1, [again]), undefined);
    const other = entry('SCN-004', { error: { headline: '[REQ AC-4] Removing a favourite: the message shown (expects Removed)' } as TriageEntry['error'] });
    assert.match(heldAgain(run1, [other])!, /failed another way/, 'another check of the same criterion is another failure');
  });

  it('does not hold when a test passed, failed another way, or did not run', () => {
    assert.match(heldAgain(tests, [entry('SCN-001'), entry('SCN-002', { status: 'passed' })])!, /SCN-002 passed when it ran again/);
    assert.match(heldAgain(tests, [entry('SCN-001'), entry('SCN-002', { error: { headline: 'locator not found' } as TriageEntry['error'] })])!, /failed another way/);
    assert.match(heldAgain(tests, [entry('SCN-001')])!, /SCN-002 did not run again/);
  });
});
