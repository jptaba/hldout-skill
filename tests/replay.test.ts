/**
 * The mechanical reproduction of an API failure: which failures a script may settle, the replay with the ids of
 * new records, and the decision it records only when the application answers as in the run, twice.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ApiExchange } from '../.github/scripts/run/classify';
import type { TriageEntry } from '../.github/scripts/run/run-record';
import { replayOnce, replayPending, replayPlan, sameBody, signInWith, type Send } from '../.github/scripts/triage/replay';

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

  it('sends a signed-in call with a fresh sign-in of the user the record names, and leaves out the test\'s own sign-in', async () => {
    const login = call('POST', '/users/login', 200, { access_token: '***redacted***' }, { email: 'jane@shop.test', password: '***redacted:1a2b***' });
    const add = { ...call('POST', '/favorites', 201, { id: 'fav' }, { product_id: 'p1' }, { Authorization: '***redacted***' }) };
    add.request.as = 'customer (customer) · jane@shop.test';
    const e = failure({ scenario: 'SCN-006', error: { headline: '[REQ AC-5] adding the same product again is refused', reqTag: 'AC-5', expected: '409', received: '201', message: '' } },
      { api: undefined, apiRelevantIndex: undefined, preSequence: [login, add], apiSequence: [add] });
    assert.match(why(e)!, /signed in/, 'with no way to sign in');
    const plan = replayPlan(e, '/users/login');
    assert.ok('calls' in plan);
    assert.deepEqual([plan.calls.length, plan.compareFrom], [2, 1], 'the sign-in is left out; every call of the test is compared');
    const sent: { url: string; headers: Record<string, string>; body?: unknown }[] = [];
    const send: Send = async (c) => { sent.push(c); return c.url.endsWith('/users/login') ? { status: 200, body: { access_token: 'tok-1' } } : { status: 201, body: { id: 'fav' } }; };
    const signIn = signInWith({ existing: [{ username: 'jane@shop.test', password: '${env:PW}' }], token: { method: 'POST', path: '/users/login', body: { email: '${username}', password: '${password}' }, token: 'access_token' } },
      'http://app.test', (s) => s.replace('${env:PW}', 'secret'), send)!;
    const done = await replayPending([e], () => 'g', send, signIn);
    assert.deepEqual(done.confirmed.map((x) => x.scenario), ['SCN-006']);
    assert.deepEqual(sent[0], { method: 'POST', url: 'http://app.test/users/login', headers: {}, body: { email: 'jane@shop.test', password: 'secret' } });
    assert.equal(sent.filter((c) => c.url.endsWith('/users/login')).length, 1, 'each account signs in once');
    assert.equal(sent[1].headers.Authorization, 'Bearer tok-1');
    assert.match(done.confirmed[0].final!.evidence!, /POST \/favorites → 201/);
    // A user the profile doesn't hold (one the test made) can't be signed in again.
    add.request.as = 'a new customer · hldout-1@example.com';
    assert.match((await replayPending([e], () => 'g', send, signIn)).left[0].why, /could not be signed in again/);
  });

  it('compares an answer the record cut as far as the record goes', () => {
    const cut = '{"current_page":1,"data":[{"id":"01M7K7WKV0G771RSQA98HWJZPH","name":"Combinati… [5120 more characters, cut in the run record]';
    assert.equal(sameBody(cut, { current_page: 1, data: [{ id: '01N8AAAAAAAAAAAAAAAAAAAAAA', name: 'Combination Pliers', price: 14.15 }] }), true);
    assert.equal(sameBody(cut, { current_page: 2, data: [] }), false);
    assert.equal(sameBody({ message: 'gone' }, { message: 'gone' }), true);
    assert.equal(sameBody({ message: 'gone' }, { message: 'Gone for good' }), false);
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
