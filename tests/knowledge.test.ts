import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { compact, entries, fold, keys, loadKnowledge, normPath, oracleLeak, relevantTo, statusOf, usesLocator, writeFacts, type Observation } from '../.github/scripts/lib/knowledge';
import { endpointPathOf, endpointsOfApiDoc, routeOf } from '../.github/scripts/lib/learn';
import type { RequirementContract } from '../.github/scripts/lib/contract';

const obs = (o: Partial<Observation> & Pick<Observation, 'key' | 'value' | 'status' | 'at'>): Observation => ({ kind: 'page', by: 'doctor', ...o });

describe('app knowledge: fold', () => {
  const a = obs({ key: 'page:/contacts', value: { route: '/contacts', ready: 'h1' }, status: 'seen', at: '2026-10-01T00:00:00Z' });
  const b = obs({ key: 'page:/contacts', value: { ready: 'h1', route: '/contacts' }, status: 'proven', at: '2026-10-02T00:00:00Z', by: 'CL-1' });
  const c = obs({ key: 'page:/contacts', value: { route: '/contacts', ready: 'h1' }, status: 'stale', at: '2026-10-03T00:00:00Z', by: 'doctor' });

  it('merges the same value in any order (key order in the value does not matter)', () => {
    const one = fold([a, b, c]);
    const two = fold([c, b, a]);
    assert.deepEqual(one, two);
    assert.equal(one.length, 1);
    assert.deepEqual(one[0].stories, ['CL-1']);
  });

  it('is idempotent: folding its own output again changes nothing', () => {
    const once = fold([a, b, c]);
    assert.deepEqual(fold([...once, ...once, a]), once);
  });

  it('a later stale mark beats earlier sightings; a later proof revives it', () => {
    assert.equal(statusOf(fold([a, b, c])[0]), 'stale');
    const again = obs({ ...b, at: '2026-10-04T00:00:00Z', by: 'CL-2' });
    const r = fold([a, b, c, again])[0];
    assert.equal(statusOf(r), 'proven');
    assert.deepEqual(r.stories, ['CL-1', 'CL-2']);
  });

  it('a doctor sighting after a proof does not demote it', () => {
    const later = obs({ ...a, at: '2026-10-05T00:00:00Z' });
    assert.equal(statusOf(fold([b, later])[0]), 'proven');
  });

  it('two different proven values stay side by side: the most recent first, the other as an alternative', () => {
    const x = obs({ key: 'page:/contacts', value: { route: '/contacts', ready: 'h2' }, status: 'proven', at: '2026-10-03T00:00:00Z', by: 'CL-3' });
    const [e] = entries(fold([b, x]));
    assert.equal(e.best.value.ready, 'h2');
    assert.equal(e.alternatives.length, 1);
    assert.equal(e.alternatives[0].value.ready, 'h1');
  });

  it('proven beats seen even when the sighting is newer', () => {
    const seenNew = obs({ key: 'page:/contacts', value: { route: '/contacts', ready: 'h3' }, status: 'seen', at: '2026-10-09T00:00:00Z' });
    const [e] = entries(fold([b, seenNew]));
    assert.equal(e.best.value.ready, 'h1');
    assert.equal(e.status, 'proven');
  });
});

describe('app knowledge: files never conflict', () => {
  it('each write is a new file; compaction folds them into one snapshot with the same content', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heldout-kn-'));
    const f1 = writeFacts('shop', 'doctor', [obs({ key: 'page:/', value: { route: '/' }, status: 'seen', at: '2026-10-01T00:00:00Z' })], root);
    const f2 = writeFacts('shop', 'CL-1', [obs({ key: 'page:/', value: { route: '/' }, status: 'proven', at: '2026-10-02T00:00:00Z', by: 'CL-1' })], root);
    assert.notEqual(f1, f2);
    assert.equal(writeFacts('shop', 'CL-2', [], root), undefined);
    const before = loadKnowledge('shop', root).records;
    const r = compact('shop', root);
    assert.equal(r?.folded, 2);
    const after = loadKnowledge('shop', root);
    assert.deepEqual(after.records, before);
    assert.equal(after.files.length, 0);
    // A fact file merged in later (another branch) folds on top of the snapshot.
    writeFacts('shop', 'CL-3', [obs({ key: 'page:/', value: { route: '/' }, status: 'proven', at: '2026-10-03T00:00:00Z', by: 'CL-3' })], root);
    assert.deepEqual(loadKnowledge('shop', root).records[0].stories, ['CL-1', 'CL-3']);
  });
});

describe('app knowledge: keys and routes', () => {
  it('path parameters in any spelling match', () => {
    assert.equal(normPath('/contacts/{id}'), normPath('/contacts/:contactId'));
    assert.equal(keys.endpoint('post', '/contacts/'), 'api:POST /contacts');
  });
  it('routes are relative to the base URL, hash routes kept', () => {
    assert.equal(routeOf('https://x.test/app/contactList', 'https://x.test/app/'), '/contactList');
    assert.equal(routeOf('http://localhost:3000/#/login', 'http://localhost:3000'), '/#/login');
    assert.equal(routeOf('https://other.test/a', 'https://x.test/'), undefined);
  });
  it('API paths are relative to the API base, record ids generalised', () => {
    assert.equal(endpointPathOf('https://api.x.test/v1/contacts/64f1a2b3c4d5e6f7a8b9c0d1', 'https://api.x.test/v1/'), '/contacts/{id}');
    assert.equal(endpointPathOf('https://api.x.test/users/42/books', 'https://api.x.test'), '/users/{id}/books');
  });
  it('reads request mechanics from an OpenAPI document and leaves responses out', () => {
    const doc = {
      openapi: '3.0.0', servers: [{ url: '/api' }], security: [{ bearer: [] }],
      components: { schemas: { Contact: { properties: { firstName: {}, lastName: {} } } } },
      paths: { '/contacts': { post: { requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Contact' } } } }, responses: { 201: { description: 'Created' } } } },
        '/health': { get: { security: [], parameters: [{ in: 'query', name: 'verbose' }], responses: { 200: {} } } } },
    };
    const eps = endpointsOfApiDoc(doc, 'https://x.test/api');
    assert.deepEqual(eps, [{ method: 'POST', path: '/contacts', requestFields: ['firstName', 'lastName'], auth: 'required' }, { method: 'GET', path: '/health', query: ['verbose'], auth: 'none' }]);
  });
});

describe('app knowledge: never the oracle', () => {
  const contract = { acceptanceCriteria: [{ id: 'AC-1', outcomes: ['the message "Email is invalid" is shown'] }], errorModel: [{ id: 'E1', case: 'dup', body: 'Email address is already in use' }] } as unknown as RequirementContract;
  it('refuses a note stating what the application answers', () => {
    assert.match(oracleLeak({ kind: 'note', value: { topic: 'dup', text: 'a duplicate returns 400' } }) ?? '', /statuses are the oracle/);
    assert.match(oracleLeak({ kind: 'note', value: { topic: 'x', text: 'shows Email is invalid under the field' } }, contract) ?? '', /expected value/);
    assert.match(oracleLeak({ kind: 'note', value: { topic: 'x', text: 'says email address is already in use' } }, contract) ?? '', /expected value/);
  });
  it('a quoted control name is where to click, not an answer', () => {
    const c = { acceptanceCriteria: [{ id: 'AC-1', outcomes: ['pressing the "Add to cart" button adds the product', 'the message "Product added to shopping cart." is shown'] }], errorModel: [] } as unknown as RequirementContract;
    assert.equal(oracleLeak({ kind: 'note', value: { topic: 'cart', text: 'the Add to cart button sits under the quantity' } }, c), undefined);
    assert.match(oracleLeak({ kind: 'note', value: { topic: 'cart', text: 'a toast says Product added to shopping cart.' } }, c) ?? '', /expected value/);
  });
  it('refuses a locator that looks for an expected message', () => {
    const c = { acceptanceCriteria: [{ id: 'AC-3', outcomes: ['"There are no products found." is shown'] }], errorModel: [] } as unknown as RequirementContract;
    assert.match(oracleLeak({ kind: 'locator', value: { element: 'no results', locator: "getByText('There are no products found.')" } }, c) ?? '', /expected value/);
    assert.equal(oracleLeak({ kind: 'locator', value: { element: 'no results', locator: "getByTestId('no-results')" } }, c), undefined);
  });
  it('lets mechanics through', () => {
    assert.equal(oracleLeak({ kind: 'note', value: { topic: 'pacing', text: 'the host rate-limits bursts: one worker, 10 s apart' } }, contract), undefined);
    assert.equal(oracleLeak({ kind: 'locator', value: { element: 'error', locator: "locator('#error')" } }, contract), undefined);
  });
});

describe('app knowledge: a locator the tests use', () => {
  const spec = `await expect(page.getByRole('heading', { name: REQ.AC4_MY_ACCOUNT, exact: true })).toBeVisible();\nawait page.getByTestId("email").fill(x);`;
  it('matches through constants, extra options, spacing and quote style', () => {
    assert.ok(usesLocator(spec, "getByRole('heading', { name: 'My account' })"));
    assert.ok(usesLocator(spec, "page.getByTestId('email')"));
  });
  it('matches a name built from a variable, and a trailing .first()', () => {
    const src = "for (const name of cats) await page.getByRole('checkbox', { name, exact: true }).check();\nawait page.getByTestId('product-name').click();";
    assert.ok(usesLocator(src, "getByRole('checkbox', { name: 'Hammer', exact: true })"));
    assert.ok(usesLocator(src, "getByTestId('product-name').first()"));
  });
  it('does not match another call or another role', () => {
    assert.ok(!usesLocator(spec, "getByRole('button', { name: 'My account' })"));
    assert.ok(!usesLocator(spec, "getByTestId('password')"));
  });
});

describe('app knowledge: what a story needs', () => {
  const at = '2026-10-01T00:00:00Z';
  const all = entries(fold([
    obs({ key: keys.page('/'), value: { route: '/', name: 'start page' }, status: 'seen', at }),
    obs({ key: keys.page('/contactList'), value: { route: '/contactList', name: 'Contact List' }, status: 'seen', at }),
    obs({ key: keys.page('/login'), value: { route: '/login', purpose: 'sign-in' }, status: 'seen', at }),
    obs({ key: keys.page('/about'), value: { route: '/about', name: 'About' }, status: 'seen', at }),
    obs({ key: keys.locator('/contactList', 'Add button'), kind: 'locator', value: { route: '/contactList', element: 'Add button', locator: 'x' }, status: 'proven', at, by: 'CL-1' }),
    obs({ key: keys.endpoint('POST', '/contacts'), kind: 'endpoint', value: { method: 'POST', path: '/contacts' }, status: 'seen', at }),
    obs({ key: keys.endpoint('GET', '/users/me'), kind: 'endpoint', value: { method: 'GET', path: '/users/me' }, status: 'seen', at }),
    obs({ key: keys.endpoint('GET', '/contacts/{id}'), kind: 'endpoint', value: { method: 'GET', path: '/contacts/{id}' }, status: 'seen', at }),
    obs({ key: keys.endpoint('DELETE', '/contacts/{id}'), kind: 'endpoint', value: { method: 'DELETE', path: '/contacts/{id}' }, status: 'seen', at }),
    obs({ key: keys.endpoint('PATCH', '/contacts/{id}'), kind: 'endpoint', value: { method: 'PATCH', path: '/contacts/{id}' }, status: 'seen', at }),
    obs({ key: keys.endpoint('GET', '/contacts/{id}/history/{n}'), kind: 'endpoint', value: { method: 'GET', path: '/contacts/{id}/history/{n}' }, status: 'seen', at }),
    obs({ key: keys.seed('contact'), kind: 'seed', value: { entity: 'contact', create: 'POST /contacts' }, status: 'proven', at, by: 'CL-1' }),
  ]));
  const contract = {
    title: 'Edit a contact', acceptanceCriteria: [{ id: 'AC-1', text: 'Edit the contact', entryPoint: 'the Contact List page', outcomes: [] }],
    endpoints: [{ method: 'POST', path: '/contacts', source: 'story.md#L1' }], testData: { strategy: 'seed a contact' },
  } as unknown as RequirementContract;
  it('picks the endpoints, pages, their locators, seeds and sign-in page the story names', () => {
    const got = relevantTo(all, contract).map((e) => e.key).sort();
    // Reading back and deleting one record of the story's collection are shown too; changing it, or deeper paths, not.
    assert.deepEqual(got, ['api:DELETE /contacts/{}', 'api:GET /contacts/{}', 'api:POST /contacts', 'locator:/contactList add-button', 'page:/', 'page:/contactList', 'page:/login', 'seed:contact']);
  });
});
