/**
 * The contract's checks: what a script refuses in them (shape, ids, the budget, a value its cited line doesn't
 * hold), the spec generated from them, which states no expected value, and the integrity of a spec that asserts by
 * reference.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { specFromChecks } from '../.github/scripts/authoring/scaffold';
import { CHECK_BUDGET, checkChecks, grounded, relationProblem, type Check } from '../.github/scripts/contract/checks';
import { checkLines } from '../.github/scripts/contract/contract-render';
import { oracleDigest, type RequirementContract } from '../.github/scripts/contract/contract-model';
import { contractHash } from '../.github/scripts/contract/evidence';
import { checkRefs, ownExpectations } from '../.github/scripts/hardening/integrity-check';

const dirs: string[] = [];
after(() => { for (const d of dirs) fs.rmSync(d, { recursive: true, force: true }); });

const STORY = [
  '# Cart',                                                              // L1
  'Deleting a cart responds 204, also when it was already deleted.',     // L2
  'A quantity below 1 is refused with "The quantity must be at least 1.", and nine products fit a page.', // L3
  'A request without a token is refused.',                               // L4
].join('\n');
function reqDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-checks-'));
  dirs.push(dir);
  fs.writeFileSync(path.join(dir, 'story.md'), STORY);
  return dir;
}
const check = (over: Partial<Check> = {}): Check => ({
  id: 'C1.1', title: 'Deleting a cart twice answers as the first time', type: 'idempotency', layer: 'api',
  given: ['a guest\'s cart'], when: ['I delete the cart', 'I delete the same cart again'],
  expect: [{ id: 'C1.1.a', what: 'the status of the second delete', comparator: 'status', value: 204, source: 'story.md#L2' }], ...over,
});
const contract = (checks: Check[], more: Partial<RequirementContract> = {}): RequirementContract => ({
  key: 'X-1', title: 'Cart', revision: { story: '', linked: {} }, sourcesRead: [], endpoints: [], rules: [], errorModel: [], gaps: [], coverage: [],
  acceptanceCriteria: [{ id: 'AC-1', text: 'Deleting a cart responds 204', quote: 'Deleting a cart responds 204', source: 'story.md#L2', layer: 'api', outcomes: ['204'], checks }], ...more,
});
const codes = (c: RequirementContract) => checkChecks(c, reqDir()).map((f) => f.code);

describe('the contract\'s checks', () => {
  it('accepts a check whose value is in the line it cites, and says nothing of a contract without checks', () => {
    assert.deepEqual(checkChecks(contract([check()]), reqDir()), []);
    assert.deepEqual(checkChecks({ ...contract([]), acceptanceCriteria: [{ ...contract([]).acceptanceCriteria[0], checks: undefined }] }, reqDir()), []);
  });

  it('refuses a value the cited line does not hold, wherever it would come from', () => {
    const bad = checkChecks(contract([check({ expect: [{ id: 'C1.1.a', what: 'the status', comparator: 'status', value: 200, source: 'story.md#L2' }] })]), reqDir());
    assert.deepEqual(bad.map((f) => f.code), ['ungrounded-value']);
    assert.match(bad[0].message, /AC-1 C1\.1 C1\.1\.a: 200 is not in story\.md#L2/);
    assert.deepEqual(codes(contract([check({ expect: [{ id: 'C1.1.a', what: 'the message', comparator: 'equals', value: 'Quantity too low', source: 'story.md#L3' }] })])), ['ungrounded-value']);
    assert.deepEqual(codes(contract([check({ expect: [{ id: 'C1.1.a', what: 'the status', comparator: 'status', value: 204, source: 'story.md#L9' }] })])), ['check-source']);
    assert.deepEqual(codes(contract([check({ rows: [{ label: 'again', expect: { 'C1.1.a': 404 } }] })])), ['ungrounded-value'], 'a row\'s own value too');
  });

  it('states a relation with a comparator, and refuses a yes or no the test would work out', () => {
    const rel = (e: Partial<Check['expect'][number]>) => codes(contract([check({ expect: [{ id: 'C1.1.a', what: 'the prices listed', comparator: 'ordered', source: 'story.md#L3', ...e }] })]));
    assert.deepEqual(rel({ value: 'descending' }), [], 'an order is not a value of the line');
    assert.deepEqual(rel({ value: 'cheapest first' }), ['check-shape']);
    assert.deepEqual(rel({ comparator: 'distinct' }), []);
    assert.deepEqual(rel({ comparator: 'same-as', value: 9 }), ['check-shape']);
    assert.deepEqual(rel({ comparator: 'equals', value: true }), ['boolean-value', 'ungrounded-value']);
  });

  it('judges a relation on what was observed', () => {
    assert.equal(relationProblem('ordered', 'descending', ['89.55', 86.71, '3.55']), undefined, 'figures read as text compare as numbers');
    assert.equal(relationProblem('ordered', 'descending', [3.55, 3.95]), '3.55 before 3.95');
    assert.equal(relationProblem('ordered', 'ascending', ['Bolt cutters', 'claw hammer', 'Drill']), undefined, 'names compare as a reader would');
    assert.match(relationProblem('ordered', 'ascending', [1])!, /shows no order: read more/);
    assert.equal(relationProblem('distinct', undefined, ['a', 'b', 'c']), undefined);
    assert.equal(relationProblem('distinct', undefined, ['a', 'b', 'a']), '"a" more than once');
    assert.equal(relationProblem('same-as', undefined, [9, '9']), undefined);
    assert.equal(relationProblem('same-as', undefined, [9, 8]), '9 and 8');
    assert.match(relationProblem('same-as', undefined, 9)!, /not a pair/);
  });

  it('reads a value as the story writes it: a number word, quoted text, a pattern of its words, a status class', () => {
    assert.equal(grounded(9, 'equals', STORY), true, 'nine');
    assert.equal(grounded('The quantity must be at least 1.', 'equals', STORY), true);
    assert.equal(grounded('at least 1', 'matches', STORY), true);
    assert.equal(grounded('must be positive', 'matches', STORY), false);
    assert.equal(grounded('4xx', 'status', 'is refused'), true);
    assert.equal(grounded([204, 9], 'one-of', STORY), true);
    assert.equal(grounded([204, 500], 'one-of', STORY), false);
    assert.equal(grounded(null, 'equals', 'the percentage is null without a rental'), true, 'null is a value the story can state');
    assert.equal(grounded(null, 'equals', STORY), false);
  });

  it('takes a value from the gap a check rests on, once the gap has one', () => {
    const k = check({ restsOn: ['G1'], expect: [{ id: 'C1.1.a', what: 'the status', comparator: 'status', value: 401, source: 'story.md#L4' }] });
    const gap = { id: 'G1', element: 'the status of a refusal', kind: 'oracle' as const, required: false, affects: ['AC-1'], tried: [], resolution: 'assumed' as const, value: '401 Unauthorized' };
    assert.deepEqual(codes(contract([k], { gaps: [gap] })), []);
    assert.deepEqual(codes(contract([k], { gaps: [{ ...gap, value: undefined, resolution: 'open' }] })), ['ungrounded-value']);
    assert.deepEqual(codes(contract([k])), ['unknown-gap', 'ungrounded-value']);
    // How a step is done never unsettles what is expected: a check rests on oracle gaps only.
    assert.deepEqual(codes(contract([check({ restsOn: ['G1'] })], { gaps: [{ ...gap, kind: 'mechanics', resolution: 'open', value: undefined }] })), ['rests-on-mechanics']);
  });

  it('holds a criterion to its budget, and its ids and shape to the rules', () => {
    const many = Array.from({ length: CHECK_BUDGET + 1 }, (_, i) => check({ id: `C1.${i + 1}`, expect: [{ ...check().expect[0], id: `C1.${i + 1}.a` }] }));
    assert.deepEqual(codes(contract(many)), ['over-budget']);
    const reasoned = contract(many);
    reasoned.acceptanceCriteria[0].budget = 'the criterion states five refusals, each with its own message';
    assert.deepEqual(checkChecks(reasoned, reqDir()), []);
    assert.deepEqual(codes(contract([check({ rows: Array.from({ length: 7 }, (_, i) => ({ label: `row ${i}` })) })])), ['over-budget']);
    assert.deepEqual(codes(contract([check({ id: 'C2.1' })])), ['check-id', 'check-id'], 'a check of AC-1 is C1.n, and so are its expectations');
    assert.deepEqual(codes(contract([check(), check()])), ['check-id']);
    assert.deepEqual(codes(contract([check({ when: [] })])), ['check-shape']);
    assert.deepEqual(codes(contract([check({ expect: [{ id: 'C1.1.a', what: 'the cart', comparator: 'absent', value: 1, source: 'story.md#L2' }] })])), ['check-shape']);
    const two = contract([check()]);
    two.acceptanceCriteria.push({ ...two.acceptanceCriteria[0], id: 'AC-2', checks: [] });
    assert.deepEqual(codes(two), ['no-checks']);
  });

  it('is part of what is reviewed and frozen: a changed expected value changes both hashes, a corrected citation only the review\'s', () => {
    const base = contract([check()]);
    const other = contract([check({ expect: [{ ...check().expect[0], value: 404 }] })]);
    const cited = contract([check({ expect: [{ ...check().expect[0], source: 'story.md#L3' }] })]);
    assert.notEqual(contractHash(base), contractHash(other));
    assert.notEqual(oracleDigest(base), oracleDigest(other));
    assert.notEqual(contractHash(base), contractHash(cited));
    assert.equal(oracleDigest(base), oracleDigest(cited));
  });

  it('reads in plain words', () => {
    assert.deepEqual(checkLines(contract([check({ rows: [{ label: 'a deleted cart', values: { times: 2 }, expect: { 'C1.1.a': 204 } }] })]).acceptanceCriteria[0]), [
      '**C1.1 · AC-1: Deleting a cart twice answers as the first time** _(idempotency, api)_', '',
      '- Given a guest\'s cart', '- When I delete the cart', '- When I delete the same cart again',
      '- Then the status of the second delete is 204 _(C1.1.a, story.md#L2)_',
      '  - a deleted cart: times 2 → C1.1.a 204', '',
    ]);
  });
});

describe('the spec generated from the checks', () => {
  const at = { key: 'X-1', fixtures: '../../../../heldout-support/fixtures', journeys: '../../../../journeys/fixtures', journeysDir: 'journeys/fixtures' };
  const gap = { id: 'G1', element: 'the status of a refusal', kind: 'oracle' as const, required: false, affects: ['AC-1'], tried: [], resolution: 'assumed' as const, value: '401' };
  const spec = specFromChecks(contract([
    check(),
    check({ id: 'C1.2', title: 'A quantity below 1 isn\'t taken', type: 'boundary', layer: 'ui', restsOn: ['G1'], given: [], when: ['I set the quantity'],
      expect: [{ id: 'C1.2.a', what: 'the message shown', comparator: 'equals', value: 'The quantity must be at least 1.', source: 'story.md#L3' }],
      rows: [{ label: 'zero', values: { quantity: 0 } }, { label: 'one', values: { quantity: 1 }, expect: { 'C1.2.a': 'ok' } }] }),
  ], { gaps: [gap] }), at);

  it('has a test per check with its steps in the contract\'s words, and a test per row of a check with rows', () => {
    assert.match(spec, /test\('SCN-001: Deleting a cart twice answers as the first time', \{ tag: \['@AC-1', '@type:idempotency', '@layer:api', '@P1'\] \}, async \(\{ api, journey, data, seed \}\)/);
    assert.match(spec, /await journey\.step\('When I delete the same cart again', async \(\) => \{\n {6}\/\/ TODO\(harden\)/);
    assert.match(spec, /for \(const \[i, row\] of rowsOf\('C1\.2'\)\.entries\(\)\) \{\n {4}test\(`SCN-002\.\$\{i \+ 1\}: A quantity below 1 isn\\'t taken \(\$\{row\.label\}\)`, \{ tag: \['@AC-1', '@type:boundary', '@layer:ui', '@P1', '@assumes:G1'\] \}, async \(\{ page, api,/);
    assert.match(spec, /\/\/ from story\.md#L3\n {2}\/\/ check C1\.2/);
    assert.match(spec, /\/\/ ASSUMPTION: G1 — the status of a refusal: 401/);
  });

  it('tags a test as unsettled only for an oracle gap that is assumed or open', () => {
    const tagsOf = (resolution: 'assumed' | 'open' | 'found-in-requirement', kind: 'oracle' | 'mechanics' = 'oracle') =>
      /SCN-001[^\n]*tag: \[([^\]]*)\]/.exec(specFromChecks(contract([check({ restsOn: ['G1'] })], { gaps: [{ ...gap, kind, resolution }] }), at))![1];
    assert.match(tagsOf('assumed'), /'@assumes:G1'$/);
    assert.match(tagsOf('open'), /'@needs-clarification'$/);
    assert.match(tagsOf('found-in-requirement'), /'@P1'$/);
    assert.match(tagsOf('open', 'mechanics'), /'@P1'$/);
  });

  it('asserts every expectation by its id and states no expected value in code', () => {
    assert.deepEqual([...spec.matchAll(/expectCheck\('([^']+)', actual(, row)?\);/g)].map((m) => `${m[1]}${m[2] ?? ''}`), ['C1.1.a', 'C1.2.a, row']);
    assert.deepEqual(ownExpectations(spec), []);
    assert.deepEqual(checkRefs(spec), ['C1.1.a', 'C1.2.a']);
    // The words of a step say what is expected, for the reader; a row's own value is left to the row.
    assert.match(spec, /'Then the status of the second delete is 204'/);
    assert.match(spec, /'Then the message shown is what this row states'/);
  });
});

describe('a spec that asserts by reference', () => {
  it('names the lines that state an expectation of their own', () => {
    const src = ['expectCheck(\'C1.1.a\', status);', '  expect(status).toBe(204);', '// expect(x) in a comment', 'expectResponse(res, { status: 204 }, \'m\');', 'await expect.poll(() => n).toBe(1);'].join('\n');
    assert.deepEqual(ownExpectations(src), [2, 4, 5]);
  });
});
