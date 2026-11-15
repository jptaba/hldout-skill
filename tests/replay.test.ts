/**
 * The mechanical reproduction of an API failure: which failures a script may settle, the replay with the ids of
 * new records, and the decision it records only when the application answers as in the run, twice.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ApiExchange } from '../.github/scripts/run/classify';
import type { TriageEntry } from '../.github/scripts/run/run-record';
import { replayOnce, replayPending, replayPlan, type Send } from '../.github/scripts/triage/replay';

const call = (method: string, url: string, status: number, body?: unknown, sent?: unknown, headers?: Record<string, string>): ApiExchange =>
  ({ request: { method, url: `http://app.test${url}`, ...(sent === undefined ? {} : { body: sent }), ...(headers ? { headers } : {}) }, response: { status, body } });
const failure = (over: Partial<TriageEntry> = {}, evidence: Partial<TriageEntry['evidence']> = {}): TriageEntry => {
  const api = call('DELETE', '/carts/01hxabcdefgh', 404, { message: 'Cart doesnt exists' });
  return {
    scenario: 'SCN-016', title: 'SCN-016: deleting again', file: 'x.spec.ts', status: 'failed', tags: ['@AC-7', '@type:idempotency', '@layer:api'], requirementRefs: ['AC-7'], layer: 'api',
    error: { headline: '[REQ AC-7] the second delete answers 204 too', reqTag: 'AC-7', expected: '204', received: '404', message: '' }, otherFailures: [],
    evidence: { attempts: 2, api, apiSequence: [call('POST', '/carts', 201, { id: '01hxabcdefgh' }), call('DELETE', '/carts/01hxabcdefgh', 204), api], apiRelevantIndex: 2, ...evidence },
    auto: { category: 'APPLICATION_DEFECT', confidence: 'high', signals: [], next: '' }, ...over,
  };
};
const why = (e: TriageEntry) => { const p = replayPlan(e); return 'why' in p ? p.why : undefined; };

describe('which failures a replay may settle', () => {
  it('takes a sure application defect on an API answer, with every call the test sent up to the failing one', () => {
    const plan = replayPlan(failure({}, { preSequence: [call('GET', '/products', 200, [])] }));
    assert.ok('calls' in plan);
    assert.deepEqual(plan.calls.map((c) => `${c.request.method} ${new URL(c.request.url).pathname}`), ['GET /products', 'POST /carts', 'DELETE /carts/01hxabcdefgh', 'DELETE /carts/01hxabcdefgh']);
  });

  it('leaves to the triager what needs judgement or what the record does not hold', () => {
    assert.match(why(failure({ auto: { category: 'APPLICATION_DEFECT', confidence: 'medium', signals: [], next: '' } }))!, /not a sure application defect/);
    assert.match(why(failure({ auto: { category: 'SCRIPT_DEFECT', confidence: 'high', signals: [], next: '' } }))!, /not a sure application defect/);
    assert.match(why(failure({ tags: ['@AC-7', '@assumes:G2'] }))!, /assumption or an open question/);
    assert.match(why(failure({ tags: ['@AC-7', '@needs-clarification'] }))!, /assumption or an open question/);
    assert.match(why(failure({ layer: 'ui' }))!, /not on an API answer/);
    assert.match(why(failure({ error: { headline: 'locator not found', message: '' } }))!, /not on a requirement assertion/);
    assert.match(why(failure({}, { apiSequence: [call('GET', '/me', 200, {}, undefined, { Authorization: '***redacted***' })], apiRelevantIndex: 0 }))!, /signed in/);
    assert.match(why(failure({}, { apiSequence: [call('POST', '/login', 200, {}, { password: '***redacted***' })], apiRelevantIndex: 0 }))!, /masked secret/);
    assert.equal(why(failure({ status: 'passed', error: undefined })), 'not a failure');
  });
});

describe('the replay', () => {
  const plan = replayPlan(failure());
  assert.ok('calls' in plan);
  /** An application that makes a cart with a new id each time and answers a second delete as the run recorded, or not. */
  const app = (second: number): { send: Send; sent: string[] } => {
    const sent: string[] = []; const carts = new Map<string, boolean>(); let n = 0;
    return { sent, send: async ({ method, url }) => {
      sent.push(`${method} ${new URL(url).pathname}`);
      if (method === 'POST') { const id = `01hynewcart${++n}`; carts.set(id, true); return { status: 201, body: { id } }; }
      const id = url.split('/').pop()!;
      if (carts.get(id)) { carts.set(id, false); return { status: 204, body: undefined }; }
      return carts.has(id) ? { status: second, body: second === 404 ? { message: 'Cart doesnt exists' } : undefined } : { status: 404, body: { message: 'Requested item not found' } };
    } };
  };

  it('names the records it makes, and finds the answer the test failed on', async () => {
    const { send, sent } = app(404);
    assert.equal(await replayOnce(plan.calls, send), undefined);
    assert.deepEqual(sent, ['POST /carts', 'DELETE /carts/01hynewcart1', 'DELETE /carts/01hynewcart1']);
  });

  it('says what differed when the application answers otherwise', async () => {
    assert.match((await replayOnce(plan.calls, app(204).send))!, /DELETE \/carts\/01hxabcdefgh answered 204, in the run 404/);
    const other: Send = async ({ method }) => (method === 'POST' ? { status: 201, body: { id: '01hynewcart9' } } : { status: 404, body: { message: 'Gone for good' } });
    assert.match((await replayOnce(plan.calls.slice(0, 1).concat(plan.calls.slice(2)), other))!, /another body than in the run/);
    assert.match((await replayOnce(plan.calls, async () => ({ status: 500, body: undefined })))!, /POST \/carts answered 500, in the run 201/);
  });

  it('confirms only what answers the same twice, one title for failures that look alike', async () => {
    const twin = failure({ scenario: 'SCN-017' });
    const judged = failure({ scenario: 'SCN-018', tags: ['@AC-7', '@needs-clarification'] });
    const { confirmed, left } = await replayPending([failure(), twin, judged], () => 'same group', app(404).send);
    assert.deepEqual(confirmed.map((e) => e.scenario), ['SCN-016', 'SCN-017']);
    assert.deepEqual(left.map((l) => l.scenario), ['SCN-018']);
    const d = confirmed[0].final!;
    assert.deepEqual([d.category, d.severity, d.title, confirmed[1].final!.title], ['APPLICATION_DEFECT', 'Major', 'Not met: the second delete answers 204 too', d.title]);
    assert.match(d.rationale, /AC-7 requires: the second delete answers 204 too\. Expected 204, received 404\. Sent again outside the test, twice \(3 calls each time\)/);
    assert.equal(d.evidence, 'replayed by the tool, twice: DELETE /carts/01hxabcdefgh → 404');

    // The second time the application answers as it should: nothing is confirmed.
    let round = 0;
    const flaky = app(404); const fixed = app(204);
    const once: Send = async (c) => { if (c.method === 'POST') round++; return (round === 1 ? flaky : fixed).send(c); };
    const unsure = await replayPending([failure()], () => 'g', once);
    assert.deepEqual([unsure.confirmed.length, unsure.left.length], [0, 1]);
    const down = await replayPending([failure()], () => 'g', async () => { throw new Error('connect ECONNREFUSED'); });
    assert.match(down.left[0].why, /could not be sent \(connect ECONNREFUSED\)/);
  });
});
