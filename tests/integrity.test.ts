import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { checkIntegrity, checkRefs, copyDraft, draftOf, echoedActuals, revisionOf, type Freeze } from '../.github/scripts/hardening/integrity-check';

/** A generated spec, as scaffold writes it: steps marked for the operator, expectations by reference. */
const DRAFT = `
import { test, expectCheck, rowsOf } from '../fixtures';
test('SCN-001: the total', async ({ page, api }) => {
  await journey.step('When I open the cart', async () => {
    // TODO(harden) do this: call a journey, or add one
  });
  await journey.step('Then the total is 10', async () => {
    // TODO(harden) read the total from what the application answered or shows
    const actual: unknown = undefined;
    expectCheck('C1.1.a', actual);
  });
});
for (const [i, row] of rowsOf('C1.2').entries()) {
  test(\`SCN-002.\${i + 1}: refused (\${row.label})\`, async ({ api }) => {
    await journey.step('Then the status is 422', async () => {
      // TODO(harden) read the status from what the application answered or shows
      const actual: unknown = undefined;
      expectCheck('C1.2.a', actual, row);
    });
  });
}
`;
/** The same spec made to run. */
const HARDENED = DRAFT
  .replace(/\/\/ TODO\(harden\) do this[^\n]*/, 'await openCart(page);')
  .replace(/\/\/ TODO\(harden\) read the total[^\n]*\n(\s*)const actual: unknown = undefined;/, '$1const actual = await page.getByTestId(\'total\').textContent();')
  .replace(/\/\/ TODO\(harden\) read the status[^\n]*\n(\s*)const actual: unknown = undefined;/, '$1const actual = (await api.post(\'/cart\', { data: row.values })).status;');

const ORACLE = '{"acs":[]}';
/** The frozen `draft` in 3-tests/ with its freeze, and the operator's copy in 4-hardening/ holding `current`. */
function workspace(draft: string, current: string): { tests: string; hardened: string; freeze: Freeze } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-int-'));
  const tests = path.join(dir, '3-tests');
  const hardened = path.join(dir, '4-hardening');
  fs.mkdirSync(tests);
  fs.writeFileSync(path.join(tests, 'a.spec.ts'), draft);
  const freeze: Freeze = { ...draftOf(tests, ORACLE), refreezes: [] };
  copyDraft(tests, hardened);
  fs.writeFileSync(path.join(hardened, 'a.spec.ts'), current);
  return { tests, hardened, freeze };
}
const check = (w: { tests: string; hardened: string; freeze: Freeze }) => checkIntegrity(w.tests, w.hardened, w.freeze, ORACLE);

describe('the expectations a spec names', () => {
  it('are its expectCheck calls, in order, comments left out', () => {
    assert.deepEqual(checkRefs(`${DRAFT}\n// expectCheck('C9.9.a', x)`), ['C1.1.a', 'C1.2.a']);
  });
});

describe('an actual value not read from the application', () => {
  it('is a literal, or the test\'s own input, directly or through a const', () => {
    assert.deepEqual(echoedActuals("expectCheck('C1.1.a', 10);\nexpectCheck('C1.1.b', 'Saved');\nexpectCheck('C1.2.a', row.values.qty, row);"), ['C1.1.a: 10', "C1.1.b: 'Saved'", 'C1.2.a: row.values.qty']);
    assert.deepEqual(echoedActuals("const actual = row.values.name;\nexpectCheck('C1.1.a', actual);"), ['C1.1.a: actual = row.values.name']);
    assert.deepEqual(echoedActuals("let actual = 5;\nactual = data.total;\nexpectCheck('C1.1.a', actual);"), ['C1.1.a: actual = data.total']);
    assert.deepEqual(echoedActuals('const actual: unknown = undefined;\nexpectCheck(\'C1.1.a\', actual);'), ['C1.1.a: actual = undefined'], 'a step not filled in yet');
  });
  it('is not a value the application gave: a call, a locator\'s text, a field of an answer', () => {
    assert.deepEqual(echoedActuals(HARDENED), []);
    assert.deepEqual(echoedActuals("const res = await api.get('/x');\nexpectCheck('C1.1.a', res.body.total);"), []);
  });
});

describe('checkIntegrity', () => {
  it('a spec made to run, every expectation still asserted by reference, is preserved', () => {
    const r = check(workspace(DRAFT, HARDENED));
    assert.equal(r.status, 'PRESERVED', JSON.stringify(r));
    assert.deepEqual(r.files, [{ file: 'a.spec.ts', draftChecks: 2, currentChecks: 2 }]);
  });
  it('a step not filled in is an unhardened marker and an actual not read', () => {
    const r = check(workspace(DRAFT, DRAFT));
    assert.equal(r.unhardenedMarkers.length, 3);
    assert.equal(r.status, 'VIOLATED');
    assert.equal(r.echoed.length, 2);
  });
  it('an expectation removed, added, or written in the test is a violation', () => {
    assert.deepEqual(check(workspace(DRAFT, HARDENED.replace("expectCheck('C1.1.a', actual);", ''))).removed, ['a.spec.ts: C1.1.a']);
    assert.deepEqual(check(workspace(DRAFT, `${HARDENED}\nexpectCheck('C1.1.a', await page.title());`)).added, ['a.spec.ts: C1.1.a #2']);
    const own = check(workspace(DRAFT, HARDENED.replace("expectCheck('C1.1.a', actual);", "expect(actual).toBe('10');")));
    assert.equal(own.status, 'VIOLATED');
    assert.deepEqual([own.removed, own.own], [['a.spec.ts: C1.1.a'], ['a.spec.ts: line 9']]);
  });
  it('an actual value echoed from the test\'s input is a violation', () => {
    const r = check(workspace(DRAFT, HARDENED.replace("(await api.post('/cart', { data: row.values })).status", 'row.values.status')));
    assert.equal(r.status, 'VIOLATED');
    assert.deepEqual(r.echoed, ['a.spec.ts: C1.2.a: actual = row.values.status']);
  });
  it('without a freeze there is nothing to compare: NO_DRAFT', () => {
    const w = workspace(DRAFT, HARDENED);
    assert.equal(checkIntegrity(w.tests, w.hardened, undefined, ORACLE).status, 'NO_DRAFT');
  });
  it('the freeze keeps hashes, not the draft; a draft edited after the freeze is a violation', () => {
    const w = workspace(DRAFT, HARDENED);
    assert.match(w.freeze.specs['a.spec.ts'], /^[0-9a-f]{64}$/);
    fs.writeFileSync(path.join(w.tests, 'a.spec.ts'), HARDENED);
    const r = check(w);
    assert.equal(r.status, 'VIOLATED');
    assert.deepEqual(r.draftChanged, ['a.spec.ts']);
    // Line endings are no change.
    fs.writeFileSync(path.join(w.tests, 'a.spec.ts'), DRAFT.replace(/\n/g, '\r\n'));
    assert.equal(check(w).status, 'PRESERVED');
  });
  it('a draft frozen with another contract oracle is a violation', () => {
    const w = workspace(DRAFT, HARDENED);
    const r = checkIntegrity(w.tests, w.hardened, { ...w.freeze, contractOracle: '' }, ORACLE);
    assert.deepEqual([r.status, r.contractChanged], ['VIOLATED', true]);
  });
  it('a journey may wait for a page, never assert a requirement', () => {
    const w = workspace(DRAFT, HARDENED);
    const journey = path.join(path.dirname(w.tests), 'cart.ts');
    fs.writeFileSync(journey, "export async function openCart(page) {\n  await expect(page.getByRole('heading')).toBeVisible();\n}\n");
    assert.equal(checkIntegrity(w.tests, w.hardened, w.freeze, ORACLE, { files: [journey], hashes: {} }).status, 'PRESERVED');
    fs.appendFileSync(journey, "export function total(r) { expectResponse(r, { status: 200 }, '[REQ AC-1] x'); }\n");
    assert.deepEqual(checkIntegrity(w.tests, w.hardened, w.freeze, ORACLE, { files: [journey], hashes: {} }).journeyAssertions, ['cart.ts: line 4']);
  });
  it('the operator\'s copy carries the test data, and a re-freeze lists the expectations a draft generated again adds or drops', () => {
    const w = workspace(DRAFT, HARDENED);
    fs.writeFileSync(path.join(w.tests, 'test-data.json'), '{"term":"x"}');
    assert.deepEqual(copyDraft(w.tests, w.hardened), ['a.spec.ts', 'test-data.json']);
    fs.writeFileSync(path.join(w.tests, 'a.spec.ts'), DRAFT.replace("'C1.1.a'", "'C1.1.b'"));
    assert.deepEqual(revisionOf(w.freeze, w.tests), { added: ['C1.1.b'], removed: ['C1.1.a'] });
  });
});
