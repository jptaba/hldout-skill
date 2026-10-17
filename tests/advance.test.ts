import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { guessesNotSettled, journeyGuessesNotSettled } from '../.github/scripts/run/fast-harden';
import { evalRunsOf } from '../.github/scripts/core/paths';
import { draftFinished, markDraftFinished } from '../.github/scripts/authoring/draft';
import { readHistory } from '../.github/scripts/core/history';

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

describe('guesses left in a journey that is new with the story, settled by the run', () => {
  const passed = (...ids: string[]) => ids.map((scenario) => ({ scenario, status: 'passed' }));
  const click = { id: 'ui.cart.empty-cart', code: "export async function emptyCart(page: Page) {\n  await gotoPage(page, 'cart');\n  await page.getByRole('button', { name: 'Empty cart' }).click(); // TODO(harden)\n}" };
  const fresh = new Set(['ui.cart.empty-cart']);
  const use = new Map([['ui.cart.empty-cart', new Set(['SCN-003', 'SCN-004'])]]);

  it('a locator the journey clicks, with every test that uses it passing, is settled', () => {
    assert.equal(journeyGuessesNotSettled([click], 1, fresh, use), undefined, 'the code alone, before the run');
    assert.equal(journeyGuessesNotSettled([click], 1, fresh, use, passed('SCN-003', 'SCN-003', 'SCN-004.1', 'SCN-004.2')), undefined);
  });
  it('not when a test that uses the journey failed, or none uses it', () => {
    assert.match(journeyGuessesNotSettled([click], 1, fresh, use, [...passed('SCN-003'), { scenario: 'SCN-004', status: 'failed' }])!, /SCN-004, which uses it, did not pass every time/);
    assert.match(journeyGuessesNotSettled([click], 1, fresh, use, passed('SCN-003'))!, /SCN-004/, 'a test that did not run proves nothing');
    assert.match(journeyGuessesNotSettled([click], 1, fresh, new Map())!, /no test of the story uses it/);
  });
  it('not in a journey other stories already rely on', () => {
    assert.match(journeyGuessesNotSettled([click], 1, new Set(), use)!, /not new with this story/);
  });
  it('not in a branch, which a run may never take', () => {
    const branch = { id: 'ui.cart.empty-cart', code: "export async function emptyCart(page: Page) {\n  if (await page.getByText('Your cart').isVisible()) {\n    await page.getByRole('button', { name: 'Empty cart' }).click(); // TODO(harden)\n  }\n}" };
    assert.match(journeyGuessesNotSettled([branch], 1, fresh, use)!, /in a branch/);
  });
  it('not a path, a field or a value the journey returns', () => {
    const call = { id: 'ui.cart.empty-cart', code: "export function sendEmptyCart(api: Api, id: string) {\n  return api.delete(`/carts/${id}`); // TODO(harden)\n}" };
    assert.match(journeyGuessesNotSettled([call], 1, fresh, use)!, /does not exercise on its own line/);
    const yesNo = { id: 'ui.cart.empty-cart', code: "export async function onCartPage(page: Page) {\n  // TODO(harden) the address\n  return page.url().includes('/cart');\n}" };
    assert.match(journeyGuessesNotSettled([yesNo], 1, fresh, use)!, /does not exercise on its own line/);
    const absent = { id: 'ui.cart.empty-cart', code: "export async function waitUntilEmptied(page: Page) {\n  await page.getByRole('row').first().waitFor({ state: 'hidden' }); // TODO(harden)\n}" };
    assert.match(journeyGuessesNotSettled([absent], 1, fresh, use)!, /absent/);
  });
  it('not a guess in a constant or a helper of the file', () => {
    assert.match(journeyGuessesNotSettled([click], 2, fresh, use)!, /outside any journey/);
  });
});

describe('which runs are evaluations', () => {
  it('never a hardening, reproduction or repair run, and never a run of some of the tests', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'runs-'));
    const run = (name: string, meta?: object) => { fs.mkdirSync(path.join(dir, name)); if (meta) fs.writeFileSync(path.join(dir, name, 'run-meta.json'), JSON.stringify(meta)); };
    run('01-harden', { grep: null });
    run('02-eval', { grep: null });
    run('03-repair', { grep: 'SCN-010|SCN-014' });
    run('04-check', { grep: 'SCN-010' });
    run('05-rerun', {});
    run('06-repro');
    assert.deepEqual(evalRunsOf(dir), ['02-eval', '05-rerun']);
  });
});

describe('the test author marks the draft finished', () => {
  const story = () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-draft-'));
    fs.mkdirSync(path.join(base, '3-tests'));
    fs.writeFileSync(path.join(base, '3-tests', 'x.spec.ts'), "test('SCN-001: …', async () => {});\n");
    return { history: path.join(base, 'history.jsonl'), tests: path.join(base, '3-tests') };
  };
  it('a draft without the mark is not finished (its author was cut off)', () => {
    assert.equal(draftFinished(story()), false);
  });
  it('the mark holds for the spec as it was when it was made, and is kept in the history', () => {
    const s = story();
    markDraftFinished(s);
    assert.equal(draftFinished(s), true);
    fs.appendFileSync(path.join(s.tests, 'x.spec.ts'), "test('SCN-002: …', async () => {});\n");
    assert.equal(draftFinished(s), false, 'the spec changed after the mark');
    markDraftFinished(s);
    assert.equal(draftFinished(s), true);
    assert.deepEqual(readHistory(s.history).map((e) => e.event), ['draft-finished', 'draft-finished']);
  });
});
