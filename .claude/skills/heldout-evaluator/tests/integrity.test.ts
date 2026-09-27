import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { checkIntegrity, reqAssertions, reqConstants } from '../scripts/lib/integrity';

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
function workspace(draft: string, current: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-int-'));
  fs.mkdirSync(path.join(dir, 'draft')); fs.mkdirSync(path.join(dir, 'tests'));
  fs.writeFileSync(path.join(dir, 'draft', 'a.spec.ts'), draft);
  fs.writeFileSync(path.join(dir, 'draft', 'contract-oracle.json'), ORACLE);
  fs.writeFileSync(path.join(dir, 'tests', 'a.spec.ts'), current);
  return dir;
}

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
  it('reads the @req-constants block', () => {
    assert.match(reqConstants(SPEC), /MSG: 'Hello'/);
  });
});

describe('checkIntegrity', () => {
  it('locator changes on normal assertions are allowed (HOW)', () => {
    const dir = workspace(SPEC, SPEC.replace("getByTestId('msg')", "locator('#msg')"));
    assert.equal(checkIntegrity(path.join(dir, 'tests'), path.join(dir, 'draft'), undefined, ORACLE).status, 'PRESERVED');
  });
  it('changing an expected value is a violation (WHAT)', () => {
    const dir = workspace(SPEC, SPEC.replace('.toHaveText(REQ.MSG)', ".toHaveText('Hi')"));
    assert.equal(checkIntegrity(path.join(dir, 'tests'), path.join(dir, 'draft'), undefined, ORACLE).status, 'VIOLATED');
  });
  it('changing the locator of a strict assertion is a violation', () => {
    const dir = workspace(SPEC, SPEC.replace("getByRole('textbox', { name: 'Message' })", "getByTestId('desc')"));
    assert.equal(checkIntegrity(path.join(dir, 'tests'), path.join(dir, 'draft'), undefined, ORACLE).status, 'VIOLATED');
  });
  it('changing the constants block is a violation', () => {
    const dir = workspace(SPEC, SPEC.replace("MSG: 'Hello'", "MSG: 'Bye'"));
    assert.equal(checkIntegrity(path.join(dir, 'tests'), path.join(dir, 'draft'), undefined, ORACLE).status, 'VIOLATED');
  });
  it('an audited amendment turns the change into AMENDED', () => {
    const dir = workspace(SPEC, SPEC.replace('.toHaveText(REQ.MSG)', '.toContainText(REQ.MSG)'));
    const amend = path.join(dir, 'amend.json');
    fs.writeFileSync(amend, JSON.stringify([{ assertion: 'a.spec.ts: [REQ AC-1] message shown', draft: '.toHaveText(REQ.MSG)', current: '.toContainText(REQ.MSG)', reason: 'x', approvedAt: 'now' }]));
    assert.equal(checkIntegrity(path.join(dir, 'tests'), path.join(dir, 'draft'), amend, ORACLE).status, 'AMENDED');
  });
  it('reports remaining TODO(harden) markers', () => {
    const dir = workspace(SPEC, `${SPEC}\nconst x = page.getByLabel('x'); // TODO(harden)\n`);
    assert.equal(checkIntegrity(path.join(dir, 'tests'), path.join(dir, 'draft'), undefined, ORACLE).unhardenedMarkers.length, 1);
  });
});

describe('contract oracle in the frozen draft', () => {
  it('a draft frozen without the contract oracle is a violation', () => {
    const dir = workspace(SPEC, SPEC);
    fs.rmSync(path.join(dir, 'draft', 'contract-oracle.json'));
    const r = checkIntegrity(path.join(dir, 'tests'), path.join(dir, 'draft'), undefined, ORACLE);
    assert.equal(r.status, 'VIOLATED');
    assert.equal(r.contractChanged, true);
  });
});
