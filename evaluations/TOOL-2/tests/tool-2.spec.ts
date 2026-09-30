/**
 * Held-out acceptance tests for TOOL-2 — "Customer registration, sign-in and account protection".
 * Written from evaluations/TOOL-2/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Page } from '@playwright/test';
import { test, expect, expectResponse, gotoPage, uniqueId, type Api, type ApiResponse, type Seed, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from TOOL-2 (never edit during hardening)
const REQ = {
  STATUS: { S201: 201, S401: 401, S409: 409, S422: 422, S423: 423 },
  AC2_DUPLICATE_MESSAGE: 'A customer with this email address already exists.',
  AC3_WEAK_PASSWORD: 'abc',
  // The four rules of AC-3, stated as meanings (ASSUMPTION in the feature): each must be mentioned by the password errors.
  AC3_RULES: [
    { rule: 'at least 8 characters', mentions: [/8/, /character/i] },
    { rule: 'upper and lower case letters', mentions: [/upper/i, /lower/i] },
    { rule: 'a symbol', mentions: [/symbol/i] },
    { rule: 'a number', mentions: [/number/i] },
  ],
  AC4_MY_ACCOUNT: 'My account',
  AC5_WEB_MESSAGE: 'Invalid email or password',
  AC6_FAILED_ATTEMPTS: 5,
  AC6_LOCKED_MEANING: /lock/i,
  LOGIN_ANSWER_FIELDS: ['access_token', 'token_type', 'expires_in'],
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** POST /users/register */ usersRegister: '/users/register',
  /** POST /users/login */ usersLogin: '/users/login',
  /** GET /users/me */ usersMe: '/users/me',
  /** GET /users/logout */ usersLogout: '/users/logout',
};

interface Customer { email: string; password: string; firstName: string; lastName: string }

/** A new customer's details, unique e-mail address. */
function newCustomer(data: TestData, password: string = data.customer.password): Customer {
  return { email: `${uniqueId()}@example.com`, password, firstName: data.customer.firstName, lastName: data.customer.lastName };
}

/** The registration request body. Which fields registration needs is mechanics (hardening). */
function registerBody(c: Customer): Record<string, unknown> {
  // Hardened: required fields per the published API document (UserRequest) and api-identity.md: first_name, last_name, email, password.
  return { first_name: c.firstName, last_name: c.lastName, email: c.email, password: c.password };
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

const login = (api: Api, email: string, password: string) => api.post<Record<string, unknown>>(EP.usersLogin, { data: { email, password } }); // hardened: JSON {email, password} (api-identity.md)

/** Precondition: a registered customer (kept: no stated way to delete a customer). */
async function registeredCustomer(seed: Seed, api: Api, data: TestData): Promise<Customer> {
  return seed.create('a registered customer (POST /users/register)', async () => {
    const c = newCustomer(data);
    const r = await api.post<Record<string, unknown>>(EP.usersRegister, { data: registerBody(c) });
    expect(r.status, 'register the customer (seed)').toBeLessThan(300);
    return c;
  });
}

/** Text of every password error in a 422 answer. Where they are is mechanics (G3). */
function passwordErrors(body: unknown): string {
  const b = body as Record<string, unknown> | undefined;
  // Hardened (G3): the password errors are a list under the answer's "password" key (api-identity.md).
  const errs = (b?.password ?? (b?.errors as Record<string, unknown> | undefined)?.password) as unknown;
  return JSON.stringify(errs ?? '');
}

async function openSignIn(page: Page) {
  // Hardened (G1): the "Sign in" navigation link leads to /auth/login; ready when the "Login" heading shows (inspect-login.md).
  await gotoPage(page, '/auth/login');
  await expect(page.getByRole('heading', { name: 'Login', exact: true }), 'the sign-in form is shown (precondition)').toBeVisible();
}

async function fillSignIn(page: Page, email: string, password: string) {
  await page.getByTestId('email').fill(email);
  await page.getByTestId('password').fill(password);
  await page.getByTestId('login-submit').click();
}

test.describe('TOOL-2 Customer registration, sign-in and account protection', () => {
  test('SCN-001: A new customer registers and gets their details and an id back', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer;
    let res!: ApiResponse<Record<string, unknown>>;
    await journey.step('Given a new customer with a unique e-mail address', async () => { c = newCustomer(data); });
    await journey.step('When their details are posted to POST /users/register', async () => {
      res = await api.post<Record<string, unknown>>(EP.usersRegister, { data: registerBody(c) });
      seed.track('registered customer', c.email);
    });
    await journey.step('Then the API responds 201', async () => {
      expectResponse(res, { status: REQ.STATUS.S201 }, '[REQ AC-1] POST /users/register responds 201');
    });
    await journey.step("And the response contains the customer's e-mail address, first name and last name and an id", async () => {
      const b = res.body ?? {};
      expect.soft(b.email, '[REQ AC-1] POST /users/register returns the e-mail address').toBe(c.email);
      expect.soft(b.first_name, '[REQ AC-1] POST /users/register returns the first name').toBe(c.firstName); // field names as posted (api-identity.md)
      expect.soft(b.last_name, '[REQ AC-1] POST /users/register returns the last name').toBe(c.lastName);
      expect(b.id !== undefined && b.id !== null && String(b.id) !== '', '[REQ AC-1] POST /users/register returns an id').toBe(true);
    });
  });

  test('SCN-002: The registration answer does not contain the password', { tag: ['@AC-1', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer;
    let res!: ApiResponse<Record<string, unknown>>;
    await journey.step('Given a new customer with a unique e-mail address', async () => { c = newCustomer(data); });
    await journey.step('When their details are posted to POST /users/register', async () => {
      res = await api.post<Record<string, unknown>>(EP.usersRegister, { data: registerBody(c) });
      seed.track('registered customer', c.email);
      expect(res.status, 'registration succeeded (precondition for the check)').toBeLessThan(300);
    });
    await journey.step('Then the response does not contain the password', async () => {
      expect.soft(res.text.includes(c.password), '[REQ AC-1] POST /users/register answer does not contain the password value').toBe(false);
      expect(Object.keys(res.body ?? {}).filter((k) => /password/i.test(k)), '[REQ AC-1] POST /users/register answer has no password field').toEqual([]);
    });
  });

  test('SCN-003: Registering an already registered e-mail address again is refused', { tag: ['@AC-2', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let first!: Customer;
    let res!: ApiResponse<Record<string, unknown>>;
    await journey.step('Given a customer already registered with a unique e-mail address', async () => { first = await registeredCustomer(seed, api, data); });
    await journey.step('When a new customer registers with the same e-mail address', async () => {
      const second = { ...newCustomer(data), email: first.email, firstName: 'Other', lastName: 'Person' };
      res = await api.post<Record<string, unknown>>(EP.usersRegister, { data: registerBody(second) });
    });
    await journey.step('Then the API responds 409', async () => {
      expectResponse(res, { status: REQ.STATUS.S409 }, '[REQ AC-2] POST /users/register with a registered e-mail responds 409');
    });
    await journey.step('And the message is "A customer with this email address already exists."', async () => {
      expect(res.text, '[REQ AC-2] POST /users/register with a registered e-mail carries the duplicate message').toContain(REQ.AC2_DUPLICATE_MESSAGE);
    });
  });

  test('SCN-004: A weak password lists every broken password rule', { tag: ['@AC-3', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer;
    let res!: ApiResponse<Record<string, unknown>>;
    await journey.step('Given a new customer with a unique e-mail address whose password is "abc"', async () => { c = newCustomer(data, REQ.AC3_WEAK_PASSWORD); });
    await journey.step('When they register with POST /users/register', async () => {
      res = await api.post<Record<string, unknown>>(EP.usersRegister, { data: registerBody(c) });
      if (res.status < 300) seed.track('customer the application accepted with a weak password', c.email);
    });
    await journey.step('Then the API responds 422', async () => {
      expectResponse(res, { status: REQ.STATUS.S422 }, '[REQ AC-3] POST /users/register with password "abc" responds 422');
    });
    for (const r of REQ.AC3_RULES) {
      await journey.step(`And the password errors state the rule: ${r.rule}`, async () => {
        const errs = passwordErrors(res.body);
        for (const m of r.mentions) expect.soft(errs, `[REQ AC-3] POST /users/register password errors state the rule: ${r.rule}`).toMatch(m);
      });
    }
  });

  test('SCN-005: A registered customer signs in on the web shop', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    await journey.step('Given a registered customer with a first and last name', async () => { c = await registeredCustomer(seed, api, data); });
    await journey.step("And I am on the web shop's sign-in page", async () => { await openSignIn(page); });
    await journey.step("When I sign in with the customer's e-mail address and password", async () => { await fillSignIn(page, c.email, c.password); });
    await journey.step('Then I land on the "My account" page', async () => {
      await expect(page.getByRole('heading', { name: REQ.AC4_MY_ACCOUNT }), '[REQ AC-4] lands on the "My account" page').toBeVisible(); // probed: 1 match (inspect-my-account.md)
    });
    await journey.step("And the navigation shows the customer's first and last name", async () => {
      await expect(page.getByRole('navigation'), "[REQ AC-4] the navigation shows the customer's first and last name").toContainText(`${c.firstName} ${c.lastName}`); // probed: one navigation landmark (inspect-my-account.md)
    });
  });

  test('SCN-006: Signing in on the web shop with a wrong password is refused', { tag: ['@AC-5', '@type:negative', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    let status = 0;
    await journey.step('Given a registered customer', async () => { c = await registeredCustomer(seed, api, data); });
    await journey.step("And I am on the web shop's sign-in page", async () => { await openSignIn(page); });
    await journey.step("When I sign in with the customer's e-mail address and a wrong password", async () => {
      const answer = page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith(EP.usersLogin));
      await fillSignIn(page, c.email, `Wr0ng!${uniqueId()}`);
      status = (await answer).status();
    });
    await journey.step('Then POST /users/login responds 401', async () => {
      expect(status, '[REQ AC-5] POST /users/login with a wrong password responds 401').toBe(REQ.STATUS.S401);
    });
    await journey.step('And the web shop shows "Invalid email or password"', async () => {
      await expect(page.getByText(REQ.AC5_WEB_MESSAGE), '[REQ AC-5] the web shop shows "Invalid email or password"').toBeVisible();
    });
  });

  test('SCN-007: Five wrong passwords lock the account, even against the correct password', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer;
    const statuses: number[] = [];
    let sixth!: ApiResponse<Record<string, unknown>>;
    await journey.step('Given a registered customer', async () => { c = await registeredCustomer(seed, api, data); });
    await journey.step('When five sign-in attempts with a wrong password are made with POST /users/login', async () => {
      for (let i = 1; i <= REQ.AC6_FAILED_ATTEMPTS; i++) statuses.push((await login(api, c.email, `Wr0ng!${i}${uniqueId()}`)).status);
    });
    await journey.step('Then attempts one to five respond 401', async () => {
      expect.soft(statuses, '[REQ AC-6] POST /users/login attempts one to five with a wrong password respond 401').toEqual(Array(REQ.AC6_FAILED_ATTEMPTS).fill(REQ.STATUS.S401));
    });
    await journey.step('And the sixth attempt, with the correct password, responds 423', async () => {
      sixth = await login(api, c.email, c.password);
      expectResponse(sixth, { status: REQ.STATUS.S423 }, '[REQ AC-6] POST /users/login sixth attempt with the correct password responds 423');
    });
    await journey.step('And the 423 answer says that the account is locked', async () => {
      expect(sixth.text, '[REQ AC-6] POST /users/login sixth attempt says the account is locked').toMatch(REQ.AC6_LOCKED_MEANING);
    });
  });

  test('SCN-008: Four wrong passwords do not lock the account', { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer;
    let fifth!: ApiResponse<Record<string, unknown>>;
    await journey.step('Given a registered customer', async () => { c = await registeredCustomer(seed, api, data); });
    await journey.step('When four sign-in attempts with a wrong password are made with POST /users/login', async () => {
      for (let i = 1; i < REQ.AC6_FAILED_ATTEMPTS; i++) await login(api, c.email, `Wr0ng!${i}${uniqueId()}`);
    });
    await journey.step('And a fifth attempt is made with the correct password', async () => { fifth = await login(api, c.email, c.password); });
    await journey.step('Then the fifth attempt is not refused as locked and returns an access token', async () => {
      expect.soft(fifth.status, '[REQ AC-6] POST /users/login after four failures is not refused as locked').not.toBe(REQ.STATUS.S423);
      expect(typeof fifth.body?.access_token, '[REQ AC-6] POST /users/login after four failures returns an access_token').toBe('string');
    });
  });

  test('SCN-009: A token no longer works after signing out', { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let token = '';
    let me!: ApiResponse;
    await journey.step('Given a signed-in customer with an access token', async () => {
      const me = await seed.account('a signed-in customer'); // the profile's accounts recipe (register + POST /users/login)
      token = me.token as string;
      expect(typeof token === 'string' && token.length > 0, 'the account has an access token (precondition)').toBe(true);
      await seed.step('the token works before signing out (GET /users/me)', async () => {
        const r = await api.get(EP.usersMe, { headers: bearer(token) });
        expect(r.status, 'GET /users/me with a fresh token succeeds (precondition)').toBeLessThan(300);
      });
    });
    await journey.step('When they sign out with GET /users/logout', async () => {
      const out = await api.get(EP.usersLogout, { headers: bearer(token) });
      expect(out.status, 'sign-out was accepted (precondition for the check)').toBeLessThan(300);
    });
    await journey.step('Then GET /users/me with the same token responds 401', async () => {
      me = await api.get(EP.usersMe, { headers: bearer(token) });
      expectResponse(me, { status: REQ.STATUS.S401 }, '[REQ AC-7] GET /users/me with the signed-out token responds 401');
    });
  });

  test('SCN-010: A customer registers, signs in, sees their own account, signs out and loses access', { tag: ['@AC-1', '@AC-7', '@type:composition', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer;
    let id = '';
    let token = '';
    await journey.step('Given a new customer with a unique e-mail address', async () => { c = newCustomer(data); });
    await journey.step('When their details are posted to POST /users/register', async () => {
      const r = await api.post<Record<string, unknown>>(EP.usersRegister, { data: registerBody(c) });
      seed.track('registered customer', c.email);
      expectResponse(r, { status: REQ.STATUS.S201 }, '[REQ AC-1] POST /users/register responds 201');
      id = String(r.body?.id ?? '');
    });
    await journey.step('Then the API responds 201 with an id', async () => {
      expect(id, '[REQ AC-1] POST /users/register returns an id').not.toBe('');
    });
    await journey.step('When they sign in with POST /users/login using the registered e-mail address and password', async () => {
      const r = await login(api, c.email, c.password);
      token = String(r.body?.access_token ?? '');
      expect(token, 'the sign-in answer carries an access_token (hand-off)').not.toBe('');
    });
    await journey.step("Then GET /users/me with the access token shows the registered customer's id", async () => {
      const r = await api.get<Record<string, unknown>>(EP.usersMe, { headers: bearer(token) });
      expect(String(r.body?.id ?? ''), '[REQ AC-1] GET /users/me shows the customer registered by POST /users/register').toBe(id);
    });
    await journey.step('When they sign out with GET /users/logout', async () => {
      await api.get(EP.usersLogout, { headers: bearer(token) });
    });
    await journey.step('Then GET /users/me with the same token responds 401', async () => {
      const r = await api.get(EP.usersMe, { headers: bearer(token) });
      expectResponse(r, { status: REQ.STATUS.S401 }, '[REQ AC-7] GET /users/me with the signed-out token responds 401');
    });
  });
});
