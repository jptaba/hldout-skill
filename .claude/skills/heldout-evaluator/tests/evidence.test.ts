import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { requirementRevision, type RequirementContract } from '../scripts/lib/contract';
import { checkCoverage, checkLiterals, checkReview, contractHash, evidencePack, inventedLiterals, reviewRefs, sourceLines, type ContractReview } from '../scripts/lib/evidence';

const STORY = `---
key: ABC-1
summary: "Orders"
---

# ABC-1: Orders

## Description

Shoppers place orders through POST /orders.

## Acceptance criteria

- AC-1: Orders above 50 items are rejected with 422 and the message "Too many items".
- AC-2: The sixth failed payment locks the order.

**Priya (Product Owner)** — 2026-09-26:

Duplicate orders are a conflict (409) answered with \`{ "error": "Duplicate order" }\`.

## Attachments

| File | MIME |
| --- | --- |
`;

function fixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-'));
  fs.mkdirSync(path.join(dir, 'attachments'));
  fs.writeFileSync(path.join(dir, 'story.md'), STORY);
  fs.writeFileSync(path.join(dir, 'attachments', 'limits.csv'), 'rule,limit\nmax items,50\n');
  return dir;
}
function contract(dir: string): RequirementContract {
  return {
    key: 'ABC-1', title: 'Orders', revision: requirementRevision(dir),
    sourcesRead: [{ file: 'story.md', read: true }, { file: 'attachments/limits.csv', read: true }],
    acceptanceCriteria: [
      { id: 'AC-1', text: 'Orders above 50 items are rejected with 422 and the message "Too many items".', quote: 'Orders above 50 items are rejected with 422 and the message "Too many items".', source: 'story.md#L14', layer: 'api', endpoints: ['POST /orders'], outcomes: ['51 items → 422', 'message "Too many items"', '50 items accepted'] },
      { id: 'AC-2', text: 'The sixth failed payment locks the order.', quote: 'The sixth failed payment locks the order.', source: 'story.md#L15', layer: 'api', endpoints: ['POST /orders'], outcomes: ['6th failed payment → order locked'] },
    ],
    endpoints: [{ method: 'POST', path: '/orders', source: 'story.md#L10' }],
    rules: [{ id: 'R1', text: 'max 50 items', source: 'attachments/limits.csv#L2' }],
    errorModel: [{ id: 'E1', case: 'duplicate order', status: 409, source: 'story.md#L19' }],
    gaps: [],
    coverage: [
      { lines: 'story.md#L10', as: 'context' }, { lines: 'story.md#L14', as: 'AC-1' }, { lines: 'story.md#L15', as: 'AC-2' },
      { lines: 'story.md#L19', as: 'error-model' }, { lines: 'attachments/limits.csv#L1-L2', as: 'R1' },
    ],
  };
}
const codes = (fs: { code: string }[]) => fs.map((f) => f.code);

describe('evidence pack and accountable lines', () => {
  it('numbers every line and marks only content lines as accountable', () => {
    const dir = fixture();
    const acc = sourceLines(dir).filter((l) => l.accountable).map((l) => `${l.file}#${l.line}`);
    assert.deepEqual(acc, ['story.md#10', 'story.md#14', 'story.md#15', 'story.md#19', 'attachments/limits.csv#1', 'attachments/limits.csv#2']);
    const pack = evidencePack('ABC-1', dir, []);
    assert.match(pack, /● L14 {2}\| - AC-1: Orders above 50 items/);
    assert.match(pack, / {2}L1 {3}\| ---/);
  });
});

describe('coverage ledger', () => {
  it('passes when every accountable line is covered', () => { const dir = fixture(); assert.deepEqual(checkCoverage(contract(dir), dir), []); });
  it('reports uncovered lines, unknown kinds and reasonless dismissals', () => {
    const dir = fixture();
    const c = contract(dir);
    c.coverage = [{ lines: 'story.md#L14', as: 'AC-1' }, { lines: 'story.md#L15', as: 'AC-2' }, { lines: 'story.md#L19', as: 'not-a-requirement' }, { lines: 'story.md#L10', as: 'banana' }];
    const f = codes(checkCoverage(c, dir));
    assert.ok(f.includes('uncovered-lines'));
    assert.ok(f.includes('coverage-dismissal'));
    assert.ok(f.includes('coverage-as'));
  });
});

describe('literal grounding', () => {
  it('accepts literals from the sources, number words and one step past a boundary', () => {
    const dir = fixture();
    assert.deepEqual(inventedLiterals(contract(dir), dir), []);
  });
  it('grounds a JSON error body copied from the sources, and rejects an invented one', () => {
    const dir = fixture();
    const c = contract(dir);
    c.errorModel[0].body = '{"error": "Duplicate order"}';
    assert.deepEqual(inventedLiterals(c, dir), []);
    c.errorModel[0].body = '{"error": "Order exists"}';
    assert.deepEqual(inventedLiterals(c, dir).map((x) => x.where + ' ' + x.literal), ['E1.body "order exists"']);
  });
  it('rejects an invented status, message and path', () => {
    const dir = fixture();
    const c = contract(dir);
    c.acceptanceCriteria[0].outcomes.push('duplicate → 400', 'message "Order too large"');
    c.endpoints.push({ method: 'GET', path: '/orders/{id}/history', source: 'story.md#L10' });
    const v = inventedLiterals(c, dir).map((x) => `${x.kind} ${x.literal}`);
    assert.deepEqual(v.sort(), ['path /orders/{id}/history', 'status 400', 'text "order too large"'].sort()); // literals are compared (and reported) normalised
  });
  it('grounds one step of a stated decimal precision past a boundary, and no more', () => {
    const dir = fixture();
    fs.appendFileSync(path.join(dir, 'story.md'), '\nA deposit of at least 100.00 is required.\n');
    const c = contract(dir);
    c.acceptanceCriteria[0].outcomes.push('deposit 99.99 rejected', 'deposit 99.98 rejected');
    assert.deepEqual(inventedLiterals(c, dir).map((x) => x.literal), ['99.98']);
  });
  it('grounds a path composed from a stated base URL and a relative path, and nothing else under it', () => {
    const dir = fixture();
    fs.appendFileSync(path.join(dir, 'story.md'), '\nBase URL: https://shop.example.com/api/v2\n');
    const c = contract(dir);
    c.endpoints.push({ method: 'POST', path: '/api/v2/orders', source: 'story.md#L10' }, { method: 'GET', path: '/api/v2/refunds', source: 'story.md#L10' });
    assert.deepEqual(inventedLiterals(c, dir).map((x) => x.literal), ['/api/v2/refunds']);
  });
  it('flags expected values that exist only in what was discovered from the app', () => {
    const dir = fixture();
    const c = contract(dir);
    c.gaps.push({ id: 'G1', element: 'status for a cancelled order', kind: 'mechanics', required: true, affects: ['AC-1'], tried: [{ where: 'story', result: 'silent' }, { where: 'aut', result: 'returns 410' }], resolution: 'discovered-in-aut', value: 'the app returns 410', evidence: 'probe' });
    c.acceptanceCriteria[0].outcomes.push('cancelled order → 410');
    assert.ok(codes(checkLiterals(c, dir)).includes('oracle-literal-from-aut'));
    c.gaps[0] = { ...c.gaps[0], kind: 'oracle', tried: [{ where: 'story', result: 'silent' }, { where: 'user', result: 'asked' }], resolution: 'provided-by-user', value: '410 Gone', evidence: 'PO, 2026-09-26' };
    assert.deepEqual(checkLiterals(c, dir), []);
  });
});

describe('independent review', () => {
  const review = (c: RequirementContract, over: Partial<ContractReview> = {}): ContractReview => ({
    reviewer: 'test', reviewedAt: '2026-09-26T00:00:00Z', contractHash: contractHash(c),
    items: reviewRefs(c).map((ref) => ({ ref, verdict: 'supported' as const })), missed: [], ...over,
  });
  it('requires a review that covers every item of exactly this contract version', () => {
    const dir = fixture();
    const c = contract(dir);
    assert.deepEqual(reviewRefs(c), ['AC-1', 'AC-2', 'R1', 'E1', 'POST /orders']);
    assert.equal(checkReview(c, undefined)[0].level, 'warn');
    assert.equal(checkReview(c, undefined, { requireReview: true })[0].level, 'error');
    assert.deepEqual(checkReview(c, review(c)), []);
    const r = review(c);
    c.acceptanceCriteria[0].outcomes.push('extra');
    assert.deepEqual(codes(checkReview(c, r)), ['review-stale']);
  });
  it('turns unsupported / misread items and missed lines into errors', () => {
    const dir = fixture();
    const c = contract(dir);
    const r = review(c);
    r.items[1] = { ref: 'AC-2', verdict: 'misread', note: 'the source says sixth, not seventh' };
    r.items.pop();
    r.missed.push({ lines: 'story.md#L19', note: 'duplicate rule' });
    assert.deepEqual(codes(checkReview(c, r)).sort(), ['review-incomplete', 'review-misread', 'review-missed']);
  });
});

describe('review hash covers reviewed content only', () => {
  it('a mechanics detail (request fields, entry point) does not invalidate the review; an outcome change does', () => {
    const dir = fixture();
    const c = contract(dir);
    const h = contractHash(c);
    c.endpoints[0].requestFields = ['items'];
    c.acceptanceCriteria[0].entryPoint = '/orders/new';
    assert.equal(contractHash(c), h);
    c.acceptanceCriteria[0].outcomes.push('extra outcome');
    assert.notEqual(contractHash(c), h);
  });
});

describe('mechanics stay out of the review', () => {
  it('discovering a mechanics gap and the endpoint it found needs no re-review; re-labelling an oracle gap does', () => {
    const dir = fixture();
    const c = contract(dir);
    c.gaps.push({ id: 'G1', element: 'endpoint for cancelling an order', kind: 'mechanics', required: true, affects: ['AC-2'], tried: [{ where: 'story', result: 'no path' }], resolution: 'open' });
    const h = contractHash(c);
    c.gaps[0] = { ...c.gaps[0], tried: [...c.gaps[0].tried, { where: 'aut', result: 'API docs' }], resolution: 'discovered-in-aut', value: 'POST /orders/{id}/cancel', evidence: 'openapi.json' };
    c.endpoints.push({ method: 'POST', path: '/orders/{id}/cancel', source: 'G1' });
    c.acceptanceCriteria[1].endpoints = ['POST /orders/{id}/cancel'];
    c.acceptanceCriteria[1].gaps = ['G1'];
    assert.equal(contractHash(c), h);
    assert.deepEqual(reviewRefs(c), ['AC-1', 'AC-2', 'R1', 'E1', 'POST /orders']);
    c.gaps[0].kind = 'oracle';
    assert.notEqual(contractHash(c), h);
  });
});
