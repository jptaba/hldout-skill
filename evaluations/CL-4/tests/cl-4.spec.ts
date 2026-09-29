/**
 * Held-out acceptance tests for CL-4 — "Account security for contacts".
 * Written from evaluations/CL-4/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import { test, expect, expectResponse, signIn, type Account, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';

// Accounts: `const a = await seed.account('user A')` makes a test user on Contact List App (the profile's recipe; deleted
// after the test). `a.headers` authenticates API calls as it; `a.id` is its _id.

// @req-constants-start — expected outcomes copied verbatim from CL-4 (never edit during hardening)
const REQ = {
  STATUS: { OK: 200, CREATED: 201, BAD_REQUEST: 400, UNAUTHORIZED: 401, NOT_FOUND: 404 },
  NOT_AUTHENTICATED: { error: 'Please authenticate.' },
  SECRET_SAM: { first: 'Secret', last: 'Sam' },
  BELLA_BEE: { first: 'Bella', last: 'Bee' },
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  usersMe: '/users/me',
  usersLogout: '/users/logout',
  contacts: '/contacts',
  contact: (id: string) => `/contacts/${id}`,
};

interface Contact { _id: string; firstName: string; lastName: string; owner: string }
type Name = { first: string; last: string };
const nameOf = (c: Pick<Contact, 'firstName' | 'lastName'>) => `${c.firstName} ${c.lastName}`;
const text = (n: Name) => `${n.first} ${n.last}`;
/** A valid contact body (G1). */
const body = (n: Name, extra: Record<string, unknown> = {}) => ({ firstName: n.first, lastName: n.last, ...extra });

/** A contact of the given user, made through POST /contacts (Background). */
async function contactOf(api: Api, seed: Seed, user: Account, n: Name): Promise<Contact> {
  return seed.create(`contact "${text(n)}" of ${user.username}`, async () => {
    const res = await api.post<Contact>(EP.contacts, { headers: user.headers, data: body(n) });
    expect(res.status, 'create contact (precondition)').toBe(201);
    return res.body;
  }, (c) => api.delete(EP.contact(c._id), { headers: user.headers }));
}
/** The names of a user's contacts (GET /contacts). */
async function namesOf(api: Api, user: Account): Promise<string[]> {
  const res = await api.get<Contact[]>(EP.contacts, { headers: user.headers });
  expect(res.status, 'read the contact list').toBe(200);
  return (res.body ?? []).map(nameOf);
}
async function stored(api: Api, user: Account, id: string): Promise<ApiResponse<Contact>> {
  return api.get<Contact>(EP.contact(id), { headers: user.headers });
}

test.describe('CL-4 Account security for contacts', () => {
  const NO_TOKEN: { method: string; path: string; send: (api: Api, c: Contact) => Promise<ApiResponse> }[] = [
    { method: 'GET', path: '/contacts', send: (api) => api.get(EP.contacts) },
    { method: 'POST', path: '/contacts', send: (api) => api.post(EP.contacts, { data: body({ first: 'Intruder', last: 'Contact' }) }) },
    { method: 'GET', path: '/contacts/{id of Secret Sam}', send: (api, c) => api.get(EP.contact(c._id)) },
    { method: 'PUT', path: '/contacts/{id of Secret Sam}', send: (api, c) => api.put(EP.contact(c._id), { data: body({ first: 'Changed', last: 'Name' }) }) },
    { method: 'PATCH', path: '/contacts/{id of Secret Sam}', send: (api, c) => api.patch(EP.contact(c._id), { data: { lastName: 'Changed' } }) },
    { method: 'DELETE', path: '/contacts/{id of Secret Sam}', send: (api, c) => api.delete(EP.contact(c._id)) },
  ];
  NO_TOKEN.forEach((row, i) => {
    test(`SCN-001.${i + 1}: Contacts endpoints require a session token (${row.method} ${row.path})`, { tag: ['@AC-1', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let a!: Account; let c!: Contact; let res!: ApiResponse;
      await journey.step('Given user "A" has a contact "Secret Sam"', async () => { a = await seed.account('user A'); c = await contactOf(api, seed, a, REQ.SECRET_SAM); });
      await journey.step(`When a client calls ${row.method} ${row.path} without an Authorization header`, async () => { res = await row.send(api, c); });
      await journey.step('Then the response status is 401', async () => {
        expectResponse(res, { status: REQ.STATUS.UNAUTHORIZED }, `[REQ AC-1] ${row.method} ${row.path} without a token → 401`);
      });
      await journey.step('And the response body is {"error": "Please authenticate."}', async () => {
        expect(res.body, `[REQ AC-1] ${row.method} ${row.path} without a token answers {"error": "Please authenticate."}`).toEqual(REQ.NOT_AUTHENTICATED);
      });
      await journey.step('And no contact is created, changed or deleted', async () => {
        expect(await namesOf(api, a), '[REQ AC-1] user A\'s contacts are unchanged').toEqual([text(REQ.SECRET_SAM)]);
      });
    });
  });

  const BAD_TOKENS: { token: string; make: (a: Account) => string }[] = [
    { token: 'a made-up token', make: () => 'made.up.token' },
    { token: 'user A\'s token with its signature altered', make: (a) => { const t = a.token!; const last = t.slice(-1); return `${t.slice(0, -1)}${last === 'A' ? 'B' : 'A'}`; } },
  ];
  BAD_TOKENS.forEach((row, i) => {
    test(`SCN-002.${i + 1}: A token that was not issued by the application is refused (${row.token})`, { tag: ['@AC-2', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let a!: Account; let res!: ApiResponse;
      await journey.step('Given user "A" has signed up', async () => { a = await seed.account('user A'); });
      await journey.step(`When a client calls GET /contacts with "Authorization: Bearer" followed by ${row.token}`, async () => {
        res = await api.get(EP.contacts, { headers: { Authorization: `Bearer ${row.make(a)}` } });
      });
      await journey.step('Then the response status is 401', async () => {
        expectResponse(res, { status: REQ.STATUS.UNAUTHORIZED }, `[REQ AC-2] GET /contacts with ${row.token} → 401`);
      });
      await journey.step('And the response body is {"error": "Please authenticate."}', async () => {
        expect(res.body, `[REQ AC-2] GET /contacts with ${row.token} answers {"error": "Please authenticate."}`).toEqual(REQ.NOT_AUTHENTICATED);
      });
    });
  });

  test('SCN-003: Signing out ends the session', { tag: ['@AC-3', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let a!: Account; let headers!: Record<string, string>; let res!: ApiResponse;
    await journey.step('Given user "A" holds a token that returns A\'s contacts on GET /contacts', async () => {
      a = await seed.account('user A'); headers = { ...a.headers };
      expect((await api.get(EP.contacts, { headers })).status, 'the token works before signing out (precondition)').toBe(200);
    });
    await journey.step('When user "A" calls POST /users/logout with that token', async () => { res = await api.post(EP.usersLogout, { headers }); });
    await journey.step('Then the response status is 200', async () => {
      expectResponse(res, { status: REQ.STATUS.OK }, '[REQ AC-3] POST /users/logout → 200');
    });
    await journey.step('And GET /contacts with the same token answers 401', async () => {
      expectResponse(await api.get(EP.contacts, { headers }), { status: REQ.STATUS.UNAUTHORIZED }, '[REQ AC-3] GET /contacts with the signed-out token → 401');
    });
    await journey.step('And GET /users/me with the same token answers 401', async () => {
      expectResponse(await api.get(EP.usersMe, { headers }), { status: REQ.STATUS.UNAUTHORIZED }, '[REQ AC-3] GET /users/me with the signed-out token → 401');
    });
  });

  test('SCN-004: A user cannot read another user\'s contact', { tag: ['@AC-4', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let a!: Account; let b!: Account; let c!: Contact; let res!: ApiResponse;
    await journey.step('Given user "A" has a contact "Secret Sam" and user "B" has signed up', async () => {
      a = await seed.account('user A'); b = await seed.account('user B'); c = await contactOf(api, seed, a, REQ.SECRET_SAM);
    });
    await journey.step('When user "B" calls GET /contacts/{id of Secret Sam}', async () => { res = await stored(api, b, c._id); });
    await journey.step('Then the response status is 404', async () => {
      expectResponse(res, { status: REQ.STATUS.NOT_FOUND }, '[REQ AC-4] GET /contacts/{id} of another user\'s contact → 404');
    });
    await journey.step('And GET /contacts for user "B" does not contain "Secret Sam"', async () => {
      expect(await namesOf(api, b), '[REQ AC-4] user B\'s list does not contain "Secret Sam"').not.toContain(text(REQ.SECRET_SAM));
    });
  });

  const CHANGES: { method: string; send: (api: Api, b: Account, c: Contact) => Promise<ApiResponse> }[] = [
    { method: 'PUT', send: (api, b, c) => api.put(EP.contact(c._id), { headers: b.headers, data: body({ first: 'Taken', last: 'Over' }) }) },
    { method: 'PATCH', send: (api, b, c) => api.patch(EP.contact(c._id), { headers: b.headers, data: { lastName: 'Over' } }) },
    { method: 'DELETE', send: (api, b, c) => api.delete(EP.contact(c._id), { headers: b.headers }) },
  ];
  CHANGES.forEach((row, i) => {
    test(`SCN-005.${i + 1}: A user cannot change or delete another user's contact (${row.method})`, { tag: ['@AC-5', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let a!: Account; let b!: Account; let c!: Contact; let res!: ApiResponse;
      await journey.step('Given user "A" has a contact "Secret Sam" and user "B" has signed up', async () => {
        a = await seed.account('user A'); b = await seed.account('user B'); c = await contactOf(api, seed, a, REQ.SECRET_SAM);
      });
      await journey.step(`When user "B" calls ${row.method} /contacts/{id of Secret Sam} with a valid body`, async () => { res = await row.send(api, b, c); });
      await journey.step('Then the response status is 404', async () => {
        expectResponse(res, { status: REQ.STATUS.NOT_FOUND }, `[REQ AC-5] ${row.method} /contacts/{id} of another user's contact → 404`);
      });
      await journey.step('And GET /contacts/{id of Secret Sam} for user "A" still returns "Secret Sam" unchanged', async () => {
        const now = await stored(api, a, c._id);
        expectResponse(now, { status: REQ.STATUS.OK }, '[REQ AC-5] GET /contacts/{id} for user A still answers 200');
        expect(nameOf(now.body), '[REQ AC-5] user A\'s contact is still "Secret Sam"').toBe(text(REQ.SECRET_SAM));
      });
    });
  });

  test('SCN-006: A new contact always belongs to its creator', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let a!: Account; let b!: Account; let res!: ApiResponse<Contact>;
    const n = { first: 'Owned', last: 'ByCreator' };
    await journey.step('Given users "A" and "B" have signed up', async () => { a = await seed.account('user A'); b = await seed.account('user B'); });
    await journey.step('When user "A" calls POST /contacts with a valid body that also contains "owner" set to the _id of user "B"', async () => {
      res = await api.post<Contact>(EP.contacts, { headers: a.headers, data: body(n, { owner: b.id }) });
      if (res.body?._id) seed.track('contact made by the scenario', res.body, (x) => api.delete(EP.contact(x._id), { headers: a.headers }));
    });
    await journey.step('Then the response status is 201', async () => {
      expectResponse(res, { status: REQ.STATUS.CREATED }, '[REQ AC-6] POST /contacts with owner set to user B → 201');
    });
    await journey.step('And the new contact\'s "owner" is the _id of user "A"', async () => {
      expect(res.body?.owner, '[REQ AC-6] the new contact\'s owner is user A\'s _id').toBe(a.id);
    });
    await journey.step('And the new contact is listed for user "A" and not for user "B"', async () => {
      expect.soft(await namesOf(api, a), '[REQ AC-6] the new contact is listed for user A').toContain(text(n));
      expect(await namesOf(api, b), '[REQ AC-6] the new contact is not listed for user B').not.toContain(text(n));
    });
  });

  const OWNER_CHANGES: { method: string; body: string; send: (api: Api, a: Account, b: Account, c: Contact) => Promise<ApiResponse<Contact>> }[] = [
    { method: 'PUT', body: 'first name, last name and owner', send: (api, a, b, c) => api.put<Contact>(EP.contact(c._id), { headers: a.headers, data: body(REQ.SECRET_SAM, { owner: b.id }) }) },
    { method: 'PATCH', body: 'owner only', send: (api, a, b, c) => api.patch<Contact>(EP.contact(c._id), { headers: a.headers, data: { owner: b.id } }) },
  ];
  OWNER_CHANGES.forEach((row, i) => {
    test(`SCN-007.${i + 1}: The owner of an existing contact cannot be changed (${row.method})`, { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let a!: Account; let b!: Account; let c!: Contact; let res!: ApiResponse<Contact>;
      await journey.step('Given user "A" has a contact "Secret Sam" and user "B" has signed up', async () => {
        a = await seed.account('user A'); b = await seed.account('user B'); c = await contactOf(api, seed, a, REQ.SECRET_SAM);
      });
      await journey.step(`When user "A" calls ${row.method} /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B" (${row.body})`, async () => {
        res = await row.send(api, a, b, c);
        // If the owner did move, the contact now belongs to B: B removes it after the test.
        if (res.body?.owner === b.id) seed.track('contact moved to user B', c, (x) => api.delete(EP.contact(x._id), { headers: b.headers }));
      });
      await journey.step('Then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A"', async () => {
        const outcome = res.status === REQ.STATUS.BAD_REQUEST ? 'rejected with 400' : res.status === REQ.STATUS.OK && res.body?.owner === a.id ? 'answered 200 with owner still A' : `answered ${res.status} with owner ${res.body?.owner === b.id ? 'set to user B' : String(res.body?.owner)}`;
        expect(outcome, `[REQ AC-7] ${row.method} /contacts/{id} setting owner to user B is rejected with 400 or keeps owner A`).toMatch(/^(rejected with 400|answered 200 with owner still A)$/);
      });
      await journey.step('And GET /contacts/{id of Secret Sam} for user "A" still answers 200', async () => {
        expectResponse(await stored(api, a, c._id), { status: REQ.STATUS.OK }, '[REQ AC-7] GET /contacts/{id} for user A still answers 200');
      });
      await journey.step('And GET /contacts for user "B" does not contain "Secret Sam"', async () => {
        expect(await namesOf(api, b), '[REQ AC-7] user B\'s list does not contain "Secret Sam"').not.toContain(text(REQ.SECRET_SAM));
      });
    });
  });

  test('SCN-008: The contact list page only shows the signed-in user\'s contacts', { tag: ['@AC-8', '@type:security', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let b!: Account;
    await journey.step('Given user "A" has a contact "Secret Sam" and user "B" has a contact "Bella Bee"', async () => {
      const a = await seed.account('user A'); b = await seed.account('user B');
      await contactOf(api, seed, a, REQ.SECRET_SAM); await contactOf(api, seed, b, REQ.BELLA_BEE);
    });
    await journey.step('When user "B" signs in on the login page', async () => { await signIn(page, b); });
    await journey.step('Then the Contact List page shows "Bella Bee"', async () => {
      await expect(page.getByRole('row').filter({ hasText: text(REQ.BELLA_BEE) }), '[REQ AC-8] the Contact List page shows "Bella Bee"').toHaveCount(1);
    });
    await journey.step('And it does not show "Secret Sam"', async () => {
      await expect(page.getByText(text(REQ.SECRET_SAM)), '[REQ AC-8] the Contact List page does not show "Secret Sam"').toBeHidden();
    });
  });
});
