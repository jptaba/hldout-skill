/**
 * The benchmark's fault proxy: a call passes unchanged with no fault on, a fault changes only its own calls and
 * only while it is on, and the control address switches faults and counts what each changed.
 */
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { CONTROL, createProxy, type Fault } from '../dev/bench/proxy';
import { FAULTS } from '../dev/bench/faults';

const faults: Fault[] = [
  { id: 'T1', title: 'the list comes back reversed', response: (req, res) => {
    if (req.method !== 'GET' || req.path !== '/items' || !Array.isArray(res.body)) return false;
    res.body.reverse();
    return true;
  } },
  { id: 'T2', title: 'a quantity is always sent as 1', request: (req) => {
    if (req.method !== 'POST' || req.path !== '/items') return false;
    (req.body as { quantity: number }).quantity = 1;
    return true;
  } },
  { id: 'T3', title: 'a delete is answered and never done', request: (req) => (req.method === 'DELETE' ? { status: 204, body: null } : false) },
  { id: 'T4', title: 'the page asked for is ignored', request: (req) => {
    if (req.path !== '/echo' || !req.query.has('page')) return false;
    req.query.set('page', '1');
    return true;
  } },
];

describe('the fault proxy', () => {
  const seen: { method: string; url: string; body: string }[] = [];
  const upstream = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c)).on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      seen.push({ method: req.method!, url: req.url!, body });
      if (req.url === '/items' && req.method === 'GET') return res.writeHead(200, { 'content-type': 'application/json', 'x-kept': 'yes' }).end('[1, 2, 3]');
      if (req.url === '/text') return res.writeHead(200, { 'content-type': 'text/plain' }).end('[1, 2, 3]');
      res.writeHead(req.method === 'DELETE' ? 404 : 201, { 'content-type': 'application/json' }).end(JSON.stringify({ url: req.url, got: body }));
    });
  });
  const proxy = createProxy('http://placeholder', faults);
  let base = '';
  let real: ReturnType<typeof createProxy>;
  const call = async (path: string, init?: RequestInit) => { const r = await fetch(base + path, init); return { status: r.status, text: await r.text(), headers: r.headers }; };
  const switchOn = (on: string[]) => call(CONTROL, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ on }) });
  const post = (body: unknown) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

  before(async () => {
    await new Promise<void>((r) => upstream.listen(0, r));
    real = createProxy(`http://localhost:${(upstream.address() as AddressInfo).port}`, faults);
    await new Promise<void>((r) => real.server.listen(0, r));
    base = `http://localhost:${(real.server.address() as AddressInfo).port}`;
  });
  after(() => { upstream.close(); real.server.close(); proxy.server.close(); });

  it('passes a call unchanged, byte for byte, while no fault is on', async () => {
    const list = await call('/items');
    assert.deepEqual([list.status, list.text, list.headers.get('x-kept')], [200, '[1, 2, 3]', 'yes']);
    const made = await call('/items?b=2&a=1', post({ quantity: 5 }));
    assert.equal(made.status, 201);
    assert.deepEqual(JSON.parse(made.text), { url: '/items?b=2&a=1', got: '{"quantity":5}' });
  });

  it('changes an answer or a request only for the fault that is on, and counts it', async () => {
    await switchOn(['T1']);
    assert.equal((await call('/items')).text, '[3,2,1]');
    assert.equal(JSON.parse((await call('/items', post({ quantity: 5 }))).text).got, '{"quantity":5}', 'T2 is off');
    assert.equal((await call('/text')).text, '[1, 2, 3]', 'an answer that is not JSON is left alone');
    assert.deepEqual(JSON.parse((await call(CONTROL)).text).hits, { T1: 1 });
    await switchOn(['T2', 'T4']);
    assert.equal((await call('/items')).text, '[1, 2, 3]', 'T1 is off again');
    assert.equal(JSON.parse((await call('/items', post({ quantity: 5 }))).text).got, '{"quantity":1}');
    assert.equal(JSON.parse((await call('/echo?page=3&q=x', post({}))).text).url, '/echo?page=1&q=x');
    assert.deepEqual(JSON.parse((await call(CONTROL)).text), { on: ['T2', 'T4'], hits: { T2: 1, T4: 1 }, all: faults.map(({ id, title }) => ({ id, title })) });
  });

  it('answers without forwarding when a fault says so, readable from a page of another origin', async () => {
    await switchOn(['T3']);
    const before = seen.length;
    const gone = await call('/items/7', { method: 'DELETE', headers: { origin: 'http://shop.test' } });
    assert.deepEqual([gone.status, gone.headers.get('access-control-allow-origin'), seen.length], [204, 'http://shop.test', before]);
    await switchOn([]);
    assert.equal((await call('/items/7', { method: 'DELETE' })).status, 404);
  });

  it('refuses a fault it does not know, and keeps what was on', async () => {
    await switchOn(['T1']);
    assert.equal((await switchOn(['T1', 'NOPE'])).status, 502);
    assert.deepEqual(JSON.parse((await call(CONTROL)).text).on, ['T1']);
    assert.throws(() => proxy.set(['NOPE']), /no such fault: NOPE/);
  });
});

describe('the fault catalogue', () => {
  it('gives every fault an id of its own, a title and something it changes', () => {
    assert.equal(new Set(FAULTS.map((f) => f.id)).size, FAULTS.length);
    for (const f of FAULTS) {
      assert.match(f.id, /^F\d{2}$/);
      assert.ok(f.title.length > 10, `${f.id} says what is wrong`);
      assert.ok(f.request || f.response, `${f.id} changes a request or an answer`);
    }
  });
});
