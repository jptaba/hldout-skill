/** The test catalogue: every check in plain words, with its result and how to run it again (verdict/catalogue.ts). */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { RequirementContract } from '../.github/scripts/contract/contract-model';
import { renderCatalogue } from '../.github/scripts/verdict/catalogue';

const contract = {
  acceptanceCriteria: [
    { id: 'AC-1', text: 'The cart shows its total', checks: [
      { id: 'C1.1', title: 'the total of two lines', type: 'functional', layer: 'ui', given: ['a cart with two lines of 5'], when: ['the shopper opens the cart'], expect: [{ id: 'C1.1.a', what: 'the total shown', comparator: 'equals', value: 10, source: 'story.md#L4' }] },
      { id: 'C1.2', title: 'a refused quantity', type: 'negative', layer: 'api', given: [], when: ['a line is added with the quantity'], expect: [{ id: 'C1.2.a', what: 'the status', comparator: 'status', value: '4xx', source: 'story.md#L5' }], rows: [{ label: 'zero', values: { qty: 0 } }, { label: 'too many', values: { qty: 100 } }] },
    ] },
    { id: 'AC-2', text: 'The cart can be emptied' },
  ],
} as unknown as RequirementContract;

describe('the test catalogue', () => {
  const md = renderCatalogue('ABC-1', contract, { name: '02-eval', entries: [{ scenario: 'SCN-001', status: 'passed' }, { scenario: 'SCN-002.1', status: 'passed' }, { scenario: 'SCN-002.2', status: 'failed' }] });
  it('says each check in words, with what the story expects and where it says so', () => {
    for (const says of ['## AC-1 — The cart shows its total', '### C1.1 · SCN-001 — the total of two lines', '- Given a cart with two lines of 5', '- When the shopper opens the cart', '- Then the total shown is 10 — the story, story.md#L4', 'In the browser', 'Through the API']) assert.ok(md.includes(says), says);
  });
  it('gives each check its result, row by row when the rows differ, and the command that runs it again', () => {
    assert.match(md, /SCN-001 — the total of two lines\n\nIn the browser\. \*\*Result:\*\* ✅ passed\./);
    assert.match(md, /\*\*Result:\*\* SCN-002\.1 ✅ passed, SCN-002\.2 ❌ failed\./);
    assert.match(md, /\| too many \| qty: 100 \| as above \|/);
    assert.ok(md.includes('run ABC-1 --label repro --grep "SCN-001:"'));
    assert.ok(md.includes('run ABC-1 --label repro --grep "SCN-002[.:]"'), 'a check with rows runs every row');
  });
  it('says what was not tested', () => {
    assert.match(md, /## AC-2 — The cart can be emptied\n\n_Not tested: this criterion has no check\._/);
  });
});
