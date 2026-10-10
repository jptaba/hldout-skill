import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { accountRoles, existingAccountWorkers, validateConfig, type AccountRecipe } from '../.github/scripts/config';
import {
  checkContract, checkVariantCoverage, comboLabel, requirementRevision, variantCombinations, type RequirementContract,
} from '../.github/scripts/contract-model';
import { contractHash, reviewRefs } from '../.github/scripts/evidence';
import { readSuite } from '../.github/scripts/spec-model';

const STORY = `# ABC-7: Invoices for every user type

Validate every acceptance criterion for each user type: guest (not signed in), customer and administrator.
Where a criterion names data sets, validate it for every data set as well.

1. GET /users is for administrators only: an administrator gets 200, a customer 403 and a guest 401.
2. GET /products?by_category={id} returns only products of that category. Data sets: Hammer, Hand Saw and Wrench.
`;

function fixture(): { dir: string; contract: RequirementContract } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'variants-'));
  fs.writeFileSync(path.join(dir, 'story.md'), STORY);
  const contract: RequirementContract = {
    key: 'ABC-7', title: 'Invoices for every user type', revision: requirementRevision(dir),
    sourcesRead: [{ file: 'story.md', read: true }],
    acceptanceCriteria: [
      { id: 'AC-1', text: 'GET /users for administrators only', quote: 'GET /users is for administrators only: an administrator gets 200, a customer 403 and a guest 401.', source: 'story.md#L6', layer: 'api', outcomes: ['administrator: 200', 'customer: 403', 'guest: 401'], endpoints: ['GET /users'] },
      { id: 'AC-2', text: 'products of a category', quote: 'GET /products?by_category={id} returns only products of that category.', source: 'story.md#L7', layer: 'api', outcomes: ['only products of that category'], endpoints: ['GET /products'] },
    ],
    endpoints: [{ method: 'GET', path: '/users', source: 'story.md#L6' }, { method: 'GET', path: '/products', source: 'story.md#L7' }],
    rules: [], errorModel: [], gaps: [],
    variants: [
      { id: 'V1', name: 'user type', key: 'user-type', values: [{ id: 'guest', text: 'not signed in' }, { id: 'customer' }, { id: 'administrator' }], appliesTo: ['*'], source: 'story.md#L3' },
      { id: 'V2', name: 'data set', key: 'category', values: [{ id: 'hammer' }, { id: 'hand-saw' }, { id: 'wrench' }], appliesTo: ['AC-2'], source: 'story.md#L4, story.md#L7' },
    ],
    testData: { strategy: 'read-only' },
    coverage: [
      { lines: 'story.md#L1', as: 'context' }, { lines: 'story.md#L3-L4', as: 'V1, V2' },
      { lines: 'story.md#L6', as: 'AC-1' }, { lines: 'story.md#L7', as: 'AC-2' },
    ],
  } as unknown as RequirementContract;
  return { dir, contract };
}

describe('variants in the contract', () => {
  it('a criterion needs every combination of the variants that apply to it', () => {
    const { contract } = fixture();
    assert.deepEqual(variantCombinations(contract, 'AC-1').map(comboLabel), ['user-type=guest', 'user-type=customer', 'user-type=administrator']);
    assert.equal(variantCombinations(contract, 'AC-2').length, 9);
    assert.equal(comboLabel(variantCombinations(contract, 'AC-2')[1]), 'user-type=guest × category=hand-saw');
  });
  it('checks ids, keys, values the sources name and the criteria they apply to', () => {
    const { dir, contract } = fixture();
    const codes = (c: RequirementContract) => checkContract(c, dir).filter((f) => f.level === 'error' && f.code.startsWith('variant')).map((f) => f.code);
    assert.deepEqual(codes(contract), []);
    const invented = structuredClone(contract);
    invented.variants![0].values.push({ id: 'auditor' });
    assert.deepEqual(codes(invented), ['variant-ungrounded']);
    const stray = structuredClone(contract);
    stray.variants![1].appliesTo = ['AC-9'];
    assert.deepEqual(codes(stray), ['variant-applies']);
    const single = structuredClone(contract);
    single.variants![1].values = [{ id: 'hammer' }];
    assert.deepEqual(codes(single), ['variant-values']);
  });
  it('is part of what the reviewer checks: a review covers V1 and V2, and a changed variant changes the hash', () => {
    const { contract } = fixture();
    assert.ok(reviewRefs(contract).includes('V1') && reviewRefs(contract).includes('V2'));
    const changed = structuredClone(contract);
    changed.variants![1].values.pop();
    assert.notEqual(contractHash(changed), contractHash(contract));
  });
});

describe('variant coverage in the specs', () => {
  const SPEC = `import { test } from '../../../../heldout-support/fixtures';
// from story.md#L6
test('SCN-001: a guest gets 401', { tag: ['@AC-1', '@type:security', '@layer:api', '@variant:user-type=guest'] }, async () => {});
test('SCN-002: a customer gets 403', { tag: ['@AC-1', '@type:security', '@layer:api', '@variant:user-type=customer'] }, async () => {});

const USERS = ['guest', 'customer', 'administrator'];
const CATS = ['hammer', 'hand-saw', 'wrench'];
// from story.md#L7
// cases: user-type=guest|customer|administrator, category=hammer|hand-saw|wrench
for (const [i, [u, c]] of USERS.flatMap((u) => CATS.map((c) => [u, c])).entries()) {
  test(\`SCN-003.\${i + 1}: products of \${c} for a \${u}\`, { tag: ['@AC-2', '@type:functional', '@layer:api', \`@variant:user-type=\${u}\`, \`@variant:category=\${c}\`] }, async () => {});
}
`;
  function suite(spec: string) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'variants-spec-'));
    fs.writeFileSync(path.join(dir, 'abc-7.spec.ts'), spec);
    return readSuite(dir, fixture().contract);
  }
  it('reads the setups each test covers: literal tags, and a table\'s // cases: line', () => {
    const s = suite(SPEC);
    assert.deepEqual(s.scenarios.find((x) => x.id === 'SCN-001')?.cases, [{ 'user-type': ['guest'] }]);
    assert.deepEqual(s.scenarios.find((x) => x.id === 'SCN-003')?.cases, [{ 'user-type': ['guest', 'customer', 'administrator'], category: ['hammer', 'hand-saw', 'wrench'] }]);
  });
  it('the lint names each missing setup, and accepts a full table', () => {
    const f = checkVariantCoverage(fixture().contract, suite(SPEC));
    assert.deepEqual(f.map((x) => x.code), ['variant-uncovered']);
    assert.match(f[0].message, /AC-1 must be tested in 3 setup\(s\) and 1 have no test: user-type=administrator/);
  });
  it('a table without its // cases: line, and a tag naming no variant, are errors', () => {
    const noCases = SPEC.replace('// cases: user-type=guest|customer|administrator, category=hammer|hand-saw|wrench\n', '');
    assert.ok(checkVariantCoverage(fixture().contract, suite(noCases)).some((x) => x.code === 'variant-cases-missing'));
    const typo = SPEC.replace("'@variant:user-type=customer'", "'@variant:role=customer'");
    assert.ok(checkVariantCoverage(fixture().contract, suite(typo)).some((x) => x.code === 'unknown-variant'));
  });
});

describe('accounts with roles', () => {
  const recipe = (roles: (string | undefined)[], create = false): AccountRecipe => ({
    ...(create ? { create: { method: 'POST', path: '/users', id: 'id' }, password: '${env:P}' } : {}),
    existing: roles.map((role, i) => ({ username: `u${i}`, password: '${env:P}', ...(role ? { role } : {}) })),
  });
  it('counts accounts per role, and allows no more workers than the scarcest role has accounts', () => {
    assert.deepEqual([...accountRoles(recipe(['customer', 'customer', 'admin']))], [['customer', 2], ['admin', 1]]);
    assert.equal(existingAccountWorkers(recipe(['customer', 'customer', 'admin'])), 1);
    assert.equal(existingAccountWorkers(recipe([undefined, undefined, undefined, undefined])), 4);
    assert.equal(existingAccountWorkers(recipe([], true)), undefined);
    assert.equal(existingAccountWorkers(recipe(['admin', 'admin'], true)), 2, 'created accounts don\'t limit workers; the role pool does');
  });
  it('a role is a lower-case name', () => {
    const cfg = (role: string) => ({ auts: { app: { baseURL: 'https://x.example.com', accounts: { existing: [{ username: 'a', password: '${env:P}', role }] } } } });
    assert.deepEqual(validateConfig(cfg('admin')), []);
    assert.ok(validateConfig(cfg('Admin User')).some((m) => m.includes('role')));
  });
});
