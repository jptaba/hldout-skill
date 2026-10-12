import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { guessesNotSettled } from '../.github/scripts/fast-harden';
import { draftFinished, markDraftFinished } from '../.github/scripts/phases';

describe('guesses left in tests, settled by the run', () => {
  const passed = (...ids: string[]) => ids.map((scenario) => ({ scenario, status: 'passed' }));
  const visible = { id: 'SCN-004', code: "test('SCN-004: …', async ({ page }) => {\n  await expect(page.getByText(REQ.ADDED), '[REQ AC-5] the message is shown').toBeVisible(); // TODO(harden)\n});" };

  it('a guess on a line that expects what it locates, in a test that passed every time, is settled', () => {
    assert.equal(guessesNotSettled([visible], 1, passed('SCN-004', 'SCN-004')), undefined);
  });
  it('a mark alone on the line above the guessed line counts for that line', () => {
    const above = { id: 'SCN-005', code: "test('SCN-005: …', async ({ page }) => {\n  // TODO(harden): the button's name\n  await page.getByRole('button', { name: 'Save' }).click();\n});" };
    assert.equal(guessesNotSettled([above], 1, passed('SCN-005')), undefined);
  });
  it('a table of cases is settled only when every row passed', () => {
    assert.equal(guessesNotSettled([visible], 1, passed('SCN-004.1', 'SCN-004.2')), undefined);
    assert.match(guessesNotSettled([visible], 1, [...passed('SCN-004.1'), { scenario: 'SCN-004.2', status: 'failed' }])!, /did not pass every time/);
  });
  it('a guess in a failing test, or in a test that did not run, goes to the hardener', () => {
    assert.match(guessesNotSettled([visible], 1, [{ scenario: 'SCN-004', status: 'failed' }])!, /SCN-004 holds a guess and did not pass/);
    assert.match(guessesNotSettled([visible], 1, [{ scenario: 'SCN-004', status: 'flaky' }])!, /did not pass/);
    assert.match(guessesNotSettled([visible], 1, passed('SCN-001'))!, /did not pass/);
  });
  it('a guess in a check that something is absent is not settled by a pass', () => {
    for (const line of ["await expect(page.getByText('Deleted'), '[REQ AC-6] gone').not.toBeVisible(); // TODO(harden)", "await expect(page.locator('.row')).toHaveCount(0); // TODO(harden)", "await expect(page.getByText('x')).toBeHidden(); // TODO(harden)"]) {
      assert.match(guessesNotSettled([{ id: 'SCN-006', code: `test('SCN-006: …', async ({ page }) => {\n  ${line}\n});` }], 1, passed('SCN-006'))!, /absent/);
    }
  });
  it('a guess on a line the run does not exercise is not settled', () => {
    const declared = { id: 'SCN-007', code: "test('SCN-007: …', async ({ page }) => {\n  const toast = page.getByText(REQ.ADDED); // TODO(harden)\n});" };
    assert.match(guessesNotSettled([declared], 1, passed('SCN-007'))!, /does not exercise/);
  });
  it('a guess marked outside any test (a helper of the spec) is not settled', () => {
    assert.match(guessesNotSettled([visible], 2, passed('SCN-004'))!, /outside any test/);
  });
  it('nothing marked: nothing to settle', () => {
    assert.equal(guessesNotSettled([{ id: 'SCN-001', code: "test('SCN-001: …', async () => {});" }], 0, passed('SCN-001')), undefined);
  });
});

describe('the test author marks the draft finished', () => {
  const story = () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-draft-'));
    fs.mkdirSync(path.join(base, 'tests'));
    fs.writeFileSync(path.join(base, 'tests', 'x.spec.ts'), "test('SCN-001: …', async () => {});\n");
    return { base, tests: path.join(base, 'tests') };
  };
  it('a draft without the mark is not finished (its author was cut off)', () => {
    const s = story();
    assert.equal(draftFinished(s.base, s.tests), false);
  });
  it('the mark holds for the spec as it was when it was made', () => {
    const s = story();
    markDraftFinished(s.base, s.tests);
    assert.equal(draftFinished(s.base, s.tests), true);
    fs.appendFileSync(path.join(s.tests, 'x.spec.ts'), "test('SCN-002: …', async () => {});\n");
    assert.equal(draftFinished(s.base, s.tests), false, 'the spec changed after the mark');
    markDraftFinished(s.base, s.tests);
    assert.equal(draftFinished(s.base, s.tests), true);
  });
});
