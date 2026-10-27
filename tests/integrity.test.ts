import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { checkIntegrity, copyDraft, draftOf, reqAssertions, reqConstants, revisionOf, type Amendment, type Freeze } from '../.github/scripts/authoring/integrity-check';

const SPEC = `
// @req-constants-start
const REQ = { MSG: 'Hello' } as const;
// @req-constants-end
async function helper() { expect(res.status, 'precondition').toBe(200); const x = 1; }
test('SCN-001: a', async () => {
  await expect(page.getByTestId('msg'), '[REQ AC-1] message shown').toHaveText(REQ.MSG);
  await expect.soft(page.getByRole('textbox', { name: 'Message' }), '[REQ AC-2 strict] labelled').toBeVisible();
  await expect.poll(async () => (await list()).some((m) => m.ok), { message: '[REQ AC-3] eventually listed', timeout: 1000 }).toBe(true);
});
`;

const ORACLE = '{"acs":[]}';
/** The frozen `draft` in 3-tests/ with its freeze, and the hardener's copy in 4-hardening/ holding `current`. */
function workspace(draft: string, current: string, amendments: Amendment[] = []): { tests: string; hardened: string; freeze: Freeze } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-int-'));
  const tests = path.join(dir, '3-tests');
  const hardened = path.join(dir, '4-hardening');
  fs.mkdirSync(tests);
  fs.writeFileSync(path.join(tests, 'a.spec.ts'), draft);
  const freeze: Freeze = { ...draftOf(tests, ORACLE), refreezes: [], amendments };
  copyDraft(tests, hardened);
  fs.writeFileSync(path.join(hardened, 'a.spec.ts'), current);
  return { tests, hardened, freeze };
}
const check = (w: { tests: string; hardened: string; freeze: Freeze }) => checkIntegrity(w.tests, w.hardened, w.freeze, ORACLE);

describe('reqAssertions', () => {
  const m = reqAssertions(SPEC);
  it('finds plain, soft and poll requirement assertions', () => {
    assert.deepEqual([...m.keys()], ['[REQ AC-1] message shown', '[REQ AC-2 strict] labelled', '[REQ AC-3] eventually listed']);
  });
  it('freezes only the matcher for normal assertions', () => {
    assert.equal(m.get('[REQ AC-1] message shown'), '.toHaveText(REQ.MSG)');
  });
  it('freezes subject + matcher for strict assertions and never swallows earlier statements', () => {
    assert.equal(m.get('[REQ AC-2 strict] labelled'), "page.getByRole('textbox', { name: 'Message' }) .toBeVisible()");
  });
  it('ignores comments inside an assertion, but not a URL in a string', () => {
    const src = `expect.soft(res.body, '[REQ AC-1] details').toMatchObject({
      email: c.email, // TODO(harden) field names
      site: 'https://x.test/a', /* note */
    });`;
    assert.equal(reqAssertions(src).get('[REQ AC-1] details'), ".toMatchObject({ email: c.email, site: 'https://x.test/a', })");
  });
  it('reads the @req-constants block', () => {
    assert.match(reqConstants(SPEC), /MSG: 'Hello'/);
  });
});

describe('checkIntegrity', () => {
  it('locator changes on normal assertions are allowed (HOW)', () => {
    assert.equal(check(workspace(SPEC, SPEC.replace("getByTestId('msg')", "locator('#msg')"))).status, 'PRESERVED');
  });
  it('adding a literal timeout to a matcher is allowed (HOW); other options are not', () => {
    assert.equal(check(workspace(SPEC, SPEC.replace('.toHaveText(REQ.MSG)', '.toHaveText(REQ.MSG, { timeout: 15_000 })'))).status, 'PRESERVED');
    assert.equal(check(workspace(SPEC, SPEC.replace('.toHaveText(REQ.MSG)', '.toHaveText(REQ.MSG, { ignoreCase: true, timeout: 15_000 })'))).status, 'VIOLATED');
  });
  it('changing an expected value is a violation (WHAT)', () => {
    assert.equal(check(workspace(SPEC, SPEC.replace('.toHaveText(REQ.MSG)', ".toHaveText('Hi')"))).status, 'VIOLATED');
  });
  it('changing the locator of a strict assertion is a violation', () => {
    assert.equal(check(workspace(SPEC, SPEC.replace("getByRole('textbox', { name: 'Message' })", "getByTestId('desc')"))).status, 'VIOLATED');
  });
  it('changing the constants block is a violation', () => {
    assert.equal(check(workspace(SPEC, SPEC.replace("MSG: 'Hello'", "MSG: 'Bye'"))).status, 'VIOLATED');
  });
  it('an audited amendment turns the change into AMENDED', () => {
    const amendment = { assertion: 'a.spec.ts: [REQ AC-1] message shown', draft: '.toHaveText(REQ.MSG)', current: '.toContainText(REQ.MSG)', reason: 'x', approvedAt: 'now' };
    assert.equal(check(workspace(SPEC, SPEC.replace('.toHaveText(REQ.MSG)', '.toContainText(REQ.MSG)'), [amendment])).status, 'AMENDED');
  });
  it('reports remaining TODO(harden) markers', () => {
    assert.equal(check(workspace(SPEC, `${SPEC}\nconst x = page.getByLabel('x'); // TODO(harden)\n`)).unhardenedMarkers.length, 1);
  });
  it('without a freeze there is nothing to compare: NO_DRAFT', () => {
    const w = workspace(SPEC, SPEC);
    assert.equal(checkIntegrity(w.tests, w.hardened, undefined, ORACLE).status, 'NO_DRAFT');
  });
  it('the freeze keeps hashes, not the draft; a draft edited after the freeze is a violation', () => {
    const w = workspace(SPEC, SPEC);
    assert.match(w.freeze.specs['a.spec.ts'], /^[0-9a-f]{64}$/);
    assert.equal(check(w).status, 'PRESERVED');
    fs.writeFileSync(path.join(w.tests, 'a.spec.ts'), SPEC.replace("getByTestId('msg')", "locator('#msg')"));
    const r = check(w);
    assert.equal(r.status, 'VIOLATED');
    assert.deepEqual(r.draftChanged, ['a.spec.ts']);
    // Line endings are no change.
    fs.writeFileSync(path.join(w.tests, 'a.spec.ts'), SPEC.replace(/\n/g, '\r\n'));
    assert.equal(check(w).status, 'PRESERVED');
  });
  it('the hardener\'s copy carries the test data, and a re-freeze lists what the revised draft changed', () => {
    const w = workspace(SPEC, SPEC);
    fs.writeFileSync(path.join(w.tests, 'test-data.json'), '{"term":"x"}');
    assert.deepEqual(copyDraft(w.tests, w.hardened), ['a.spec.ts', 'test-data.json']);
    assert.equal(fs.readFileSync(path.join(w.hardened, 'test-data.json'), 'utf8'), '{"term":"x"}');
    // Audited against the freeze's own hashes: a hardened copy edited the same way changes nothing in the audit.
    fs.writeFileSync(path.join(w.tests, 'a.spec.ts'), SPEC.replace('.toHaveText(REQ.MSG)', ".toHaveText('Hi')").replace("MSG: 'Hello'", "MSG: 'Hey'"));
    fs.copyFileSync(path.join(w.tests, 'a.spec.ts'), path.join(w.hardened, 'a.spec.ts'));
    const r = revisionOf(w.freeze, w.tests);
    assert.deepEqual([r.changed, r.constantsChanged, r.removed, r.added], [['a.spec.ts: [REQ AC-1] message shown'], ['a.spec.ts'], [], []]);
  });
  it('the hardener\'s copy keeps a spec in a subfolder', () => {
    const w = workspace(SPEC, SPEC);
    fs.mkdirSync(path.join(w.tests, 'more'));
    fs.writeFileSync(path.join(w.tests, 'more', 'b.spec.ts'), SPEC);
    copyDraft(w.tests, w.hardened);
    assert.ok(fs.existsSync(path.join(w.hardened, 'more', 'b.spec.ts')));
  });
});

describe('contract oracle in the frozen draft', () => {
  it('a draft frozen with another contract oracle is a violation', () => {
    const w = workspace(SPEC, SPEC);
    const r = checkIntegrity(w.tests, w.hardened, { ...w.freeze, contractOracle: '' }, ORACLE);
    assert.equal(r.status, 'VIOLATED');
    assert.equal(r.contractChanged, true);
  });
});

describe('expectResponse assertions', () => {
  const API = `
test('SCN-002: b', async () => {
  const res = await api.post('/books', { data: {} });
  expectResponse(res, { status: 400, body: { code: '1210', message: 'already present' } }, '[REQ AC-8] POST /books duplicate');
});
`;
  it('are frozen: the expected status and body are the oracle, the response variable is mechanics', () => {
    assert.deepEqual([...reqAssertions(API).keys()], ['[REQ AC-8] POST /books duplicate']);
    assert.equal(check(workspace(API, API.replace('const res =', 'const answer =').replace('expectResponse(res,', 'expectResponse(answer,'))).status, 'PRESERVED');
    assert.equal(check(workspace(API, API.replace('status: 400', 'status: 200'))).status, 'VIOLATED');
    assert.equal(check(workspace(API, API.replace(", body: { code: '1210', message: 'already present' }", ''))).status, 'VIOLATED');
  });
});

describe('messages with other quotes inside', () => {
  const Q = `
test('SCN-007: q', async () => {
  await expect(page.locator('#m'), \`[REQ AC-7] "\${row.link}" shows its message\`).toHaveText(REQ.MSG);
  await expect.soft(page.locator('#n'), "[REQ AC-8] 'Home' opens a tab").toBeVisible();
  await expect.poll(() => shown(page), { message: \`[REQ AC-4] "\${term}" matches\` }).toEqual(expected);
  expectResponse(res, { status: 400 }, \`[REQ AC-5] GET "\${p}"\`);
});
`;
  it('are recognised and frozen', () => {
    assert.equal(reqAssertions(Q).size, 4);
    assert.equal(check(workspace(Q, Q.replace('.toHaveText(REQ.MSG)', ".toContainText('x')"))).status, 'VIOLATED');
  });
});
