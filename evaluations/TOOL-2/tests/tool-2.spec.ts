/**
 * Held-out acceptance tests for TOOL-2 — "Customer registration, sign-in and account protection".
 * Written from evaluations/TOOL-2/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import { test, expect, gotoPage, type Api, type ApiResponse, type Seed, type TestData } from '../../../heldout-support/fixtures';
import type { Page } from '@playwright/test';

// @req-constants-start — expected outcomes copied verbatim from TOOL-2 (never edit during hardening)
const REQ = {
  STATUS: { CREATED: 201, CONFLICT: 409, UNPROCESSABLE: 422, UNAUTHORIZED: 401, LOCKED: 423 },
  DUPLICATE_MESSAGE: 'A customer with this email address already exists.',
  WEAK_PASSWORD: 'abc',
  PASSWORD_RULES: [ // G4: a rule counts as stated when a password error names it
    { rule: 'at least 8 characters', named: /\b8\b/ },
    { rule: 'upper and lower case letters', named: /upper/i },
    { rule: 'a symbol', named: /symbol/i },
    { rule: 'a number', named: /number/i },
  ],
  FAILED_ATTEMPTS_ALLOWED: 5,
  LOCKED_MESSAGE: /locked/i, // G6
  MY_ACCOUNT: 'My account',
  WRONG_PASSWORD_UI: 'Invalid email or password',
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = { register: '/users/register', login: '/users/login', me: '/users/me', logout: '/users/logout' };

interface Customer { first_name: string; last_name: string; email: string; password: string }

// ---- mechanics (payload fields: contract G1 / API docs) ----------------------------------------------
let seq = 0;
function newCustomer(data: TestData, over: Partial<Customer> = {}): Customer & Record<string, unknown> {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}${++seq}`;
  return {
    first_name: 'Qa', last_name: `Held${id}`, dob: '1990-01-01', phone: '0612345678',
    address: { street: 'Main 1', city: 'Utrecht', state: 'UT', country: 'NL', postal_code: '1234AB' },
    email: `qa${id}@example.com`, password: data.customerPassword as string, ...over,
  };
}
/** Seed a registered customer (customers cannot be deleted by a customer — contract G8). */
async function registered(seed: Seed, api: Api, data: TestData, label = 'registered customer'): Promise<Customer> {
  return seed.create(`${label} (API; not deletable)`, async () => {
    const c = newCustomer(data);
    const r = await api.post(EP.register, { data: c });
    expect(r.status, 'register (precondition)').toBe(REQ.STATUS.CREATED);
    return c;
  });
}
async function login(api: Api, c: Pick<Customer, 'email' | 'password'>) {
  return api.post<{ access_token?: string; error?: string; message?: string }>(EP.login, { data: { email: c.email, password: c.password } });
}
async function signInOnWebShop(page: Page, c: Pick<Customer, 'email' | 'password'>) {
  await page.getByTestId('email').fill(c.email);
  await page.getByTestId('password').fill(c.password);
  await page.getByTestId('login-submit').click();
}
const containsPassword = (body: unknown, pw: string) => JSON.stringify(body ?? {}).includes(pw) || /"password"\s*:/.test(JSON.stringify(body ?? {}));

test.describe('TOOL-2 Customer registration, sign-in and account protection', () => {
  test('SCN-001: Registration creates the customer without echoing the password', { tag: ['@AC-1', '@type:functional', '@layer:api'] }, async ({ api, journey, data }) => {
    const c = newCustomer(data);
    let r!: ApiResponse<Record<string, unknown>>;
    await journey.step('When I post a new customer with a unique e-mail address to POST /users/register', async () => { r = await api.post(EP.register, { data: c }); });
    await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-1] register → 201').toBe(REQ.STATUS.CREATED); });
    await journey.step('And the response has an id and my first name, last name and e-mail address', async () => {
      expect({ hasId: Boolean(r.body?.id), first_name: r.body?.first_name, last_name: r.body?.last_name, email: r.body?.email }, '[REQ AC-1] customer details and id')
        .toEqual({ hasId: true, first_name: c.first_name, last_name: c.last_name, email: c.email });
    });
    await journey.step('And the response does not contain the password', async () => { expect(containsPassword(r.body, c.password), '[REQ AC-1] no password in the response').toBe(false); });
  });

  test('SCN-002: A registered e-mail address cannot register twice', { tag: ['@AC-2', '@type:negative', '@layer:api'] }, async ({ api, journey, data, seed }) => {
    let first!: Customer; let r!: ApiResponse<{ email?: string[]; message?: string }>;
    await journey.step('Given a customer already registered with an e-mail address', async () => { first = await registered(seed, api, data); });
    await journey.step('When the same e-mail address is registered again', async () => { r = await api.post(EP.register, { data: newCustomer(data, { email: first.email }) }); });
    await journey.step('Then the response status is 409', async () => { expect.soft(r.status, '[REQ AC-2] duplicate e-mail → 409').toBe(REQ.STATUS.CONFLICT); });
    await journey.step('And the message is "A customer with this email address already exists."', async () => {
      expect.soft(JSON.stringify(r.body), '[REQ AC-2] duplicate message').toContain(REQ.DUPLICATE_MESSAGE);
    });
  });

  test('SCN-003: Weak passwords are rejected with every broken rule listed', { tag: ['@AC-3', '@type:negative', '@layer:api'] }, async ({ api, journey, data }) => {
    let r!: ApiResponse<{ password?: string[]; errors?: { password?: string[] } }>;
    await journey.step('When a new customer registers with the password "abc"', async () => { r = await api.post(EP.register, { data: newCustomer(data, { password: REQ.WEAK_PASSWORD }) }); });
    await journey.step('Then the response status is 422', async () => { expect.soft(r.status, '[REQ AC-3] weak password → 422').toBe(REQ.STATUS.UNPROCESSABLE); });
    await journey.step('And the password errors name the 8-character minimum, upper and lower case letters, a symbol and a number', async () => {
      const errors = (r.body?.password ?? r.body?.errors?.password ?? []).join(' | ');
      expect.soft(REQ.PASSWORD_RULES.filter((x) => !x.named.test(errors)).map((x) => x.rule), `[REQ AC-3] every broken rule is listed (errors: ${errors})`).toEqual([]);
    });
  });

  test('SCN-004: Signing in on the web shop', { tag: ['@AC-4', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    await journey.step("Given a registered customer on the web shop's sign-in page", async () => { c = await registered(seed, api, data); await gotoPage(page, '/auth/login'); });
    await journey.step('When they sign in with their e-mail address and password', async () => { await signInOnWebShop(page, c); });
    await journey.step('Then they land on the "My account" page', async () => { await expect(page.getByTestId('page-title'), '[REQ AC-4] My account page').toHaveText(REQ.MY_ACCOUNT); });
    await journey.step('And the navigation shows their first and last name', async () => { await expect(page.getByTestId('nav-menu'), '[REQ AC-4] name in the navigation').toContainText(`${c.first_name} ${c.last_name}`); });
  });

  test('SCN-005: A wrong password is refused by the API', { tag: ['@AC-5', '@type:security', '@layer:api'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let r!: ApiResponse;
    await journey.step('Given a registered customer', async () => { c = await registered(seed, api, data); });
    await journey.step('When they POST their e-mail address with a wrong password to /users/login', async () => { r = await login(api, { email: c.email, password: `${c.password}-wrong` }); });
    await journey.step('Then the response status is 401', async () => { expect(r.status, '[REQ AC-5] wrong password → 401').toBe(REQ.STATUS.UNAUTHORIZED); });
  });

  test('SCN-006: A wrong password is refused on the web shop', { tag: ['@AC-5', '@type:negative', '@layer:ui'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    await journey.step("Given a registered customer on the web shop's sign-in page", async () => { c = await registered(seed, api, data); await gotoPage(page, '/auth/login'); });
    await journey.step('When they sign in with a wrong password', async () => { await signInOnWebShop(page, { email: c.email, password: `${c.password}-wrong` }); });
    await journey.step('Then the web shop shows "Invalid email or password"', async () => { await expect(page.getByTestId('login-error'), '[REQ AC-5] wrong-password message').toHaveText(REQ.WRONG_PASSWORD_UI); });
  });

  test('SCN-007: The account locks after five failed attempts', { tag: ['@AC-6', '@type:security', '@layer:api'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; const statuses: number[] = []; let sixth!: ApiResponse<{ error?: string; message?: string }>;
    await journey.step('Given a registered customer used only by this scenario', async () => { c = await registered(seed, api, data, 'customer dedicated to the lockout scenario'); });
    await journey.step('When five sign-in attempts with a wrong password are made', async () => {
      for (let i = 1; i <= REQ.FAILED_ATTEMPTS_ALLOWED; i++) statuses.push((await login(api, { email: c.email, password: `wrong-${i}-Pw!` })).status);
    });
    await journey.step('Then attempts one to five each respond 401', async () => {
      expect.soft(statuses, '[REQ AC-6] attempts one to five → 401').toEqual(Array(REQ.FAILED_ATTEMPTS_ALLOWED).fill(REQ.STATUS.UNAUTHORIZED));
    });
    await journey.step('And the sixth attempt, with the correct password, responds 423 with a message that the account is locked', async () => {
      sixth = await login(api, c);
      expect.soft(sixth.status, '[REQ AC-6] sixth attempt → 423').toBe(REQ.STATUS.LOCKED);
      expect.soft(JSON.stringify(sixth.body), '[REQ AC-6] locked message').toMatch(REQ.LOCKED_MESSAGE);
    });
  });

  test('SCN-008: Signing out invalidates the token', { tag: ['@AC-7', '@type:security', '@layer:api'] }, async ({ api, journey, data, seed }) => {
    let token = '';
    await journey.step('Given a signed-in customer with an access token', async () => {
      const c = await registered(seed, api, data);
      token = await seed.step('sign in (POST /users/login)', async () => {
        const r = await login(api, c);
        expect(r.status, 'login (pre-step)').toBe(200);
        expect(typeof r.body.access_token, 'login returned a token (pre-step)').toBe('string');
        return r.body.access_token!;
      });
    });
    await journey.step('When they sign out with GET /users/logout', async () => { await api.get(EP.logout, { headers: { Authorization: `Bearer ${token}` } }); });
    await journey.step('Then GET /users/me with the same token responds 401', async () => {
      expect((await api.get(EP.me, { headers: { Authorization: `Bearer ${token}` } })).status, '[REQ AC-7] token rejected after sign-out').toBe(REQ.STATUS.UNAUTHORIZED);
    });
  });
});
