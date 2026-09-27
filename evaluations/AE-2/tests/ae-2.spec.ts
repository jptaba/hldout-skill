/**
 * Held-out acceptance tests for AE-2 — "Customer account lifecycle through the partner Account API, with shop sign-in".
 * Written from evaluations/AE-2/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Page } from '@playwright/test';
import { test, expect, gotoPage, checkShape, unique, type Api, type ApiResponse, type Seed, type ShapeRule, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from AE-2 (never edit during hardening)
const REQ = {
  HTTP_STATUS: 200,
  CODE: { CREATED: 201, OK: 200, BAD_REQUEST: 400, NOT_FOUND: 404, NOT_SUPPORTED: 405 },
  MSG: {
    USER_CREATED: 'User created!',
    EMAIL_EXISTS: 'Email already exists!',
    MISSING_POST_PARAM: (field: string) => `Bad request, ${field} parameter is missing in POST request.`,
    USER_EXISTS: 'User exists!',
    USER_NOT_FOUND: 'User not found!',
    VERIFY_MISSING_PARAM: 'Bad request, email or password parameter is missing in POST request.',
    METHOD_NOT_SUPPORTED: 'This request method is not supported.',
    ACCOUNT_NOT_FOUND_BY_EMAIL: 'Account not found with this email, try another email!',
    USER_UPDATED: 'User updated!',
    ACCOUNT_NOT_FOUND: 'Account not found!',
    ACCOUNT_DELETED: 'Account deleted!',
    LOGIN_INCORRECT: 'Your email or password is incorrect!',
  },
  LOGGED_IN_AS: (name: string) => `Logged in as ${name}`,
  LOGIN_PATH: /\/login(?:[?#].*)?$/,
  REQUIRED_FIELDS: ['name', 'email', 'password', 'firstname', 'lastname', 'address1', 'country', 'zipcode', 'state', 'city', 'mobile_number'],
  USER_FIELDS: ['id', 'name', 'email', 'title', 'birth_day', 'birth_month', 'birth_year', 'first_name', 'last_name', 'company', 'address1', 'address2', 'country', 'state', 'city', 'zipcode', 'mobile_number'],
  /** Same-named request → response fields (AC-7, requirement-backed). */
  SAME_NAMED_FIELDS: ['name', 'email', 'title', 'birth_month', 'birth_year', 'company', 'address1', 'address2', 'country', 'state', 'city', 'zipcode', 'mobile_number'],
  /** Renamed fields, response ← request (G3, assumed). */
  RENAMED_FIELDS: { birth_day: 'birth_date', first_name: 'firstname', last_name: 'lastname' },
  INVALID_EMAIL_SHAPES: ['no domain after the "@"', 'no local part before the "@"'],
  VERIFY_MISSING: ['email', 'password'],
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** POST /api/createAccount */ createaccount: '/api/createAccount',
  /** POST, DELETE /api/verifyLogin */ verifylogin: '/api/verifyLogin',
  /** GET /api/getUserDetailByEmail */ getuserdetailbyemail: '/api/getUserDetailByEmail',
  /** PUT /api/updateAccount */ updateaccount: '/api/updateAccount',
  /** DELETE /api/deleteAccount */ deleteaccount: '/api/deleteAccount',
};

type Body = { responseCode?: unknown; message?: unknown; user?: Record<string, unknown> };
type Res = ApiResponse<Body>;
type Form = Record<string, string>;
interface Customer { email: string; password: string; name: string; form: Form }

// ---- builders (valid by default, from the contract's field table) ---------------------------------------------------

let emailCounter = 0;
/** Unique lower-case e-mail address on the test domain. */
function uniqueEmail(seed: Seed, data: TestData): string {
  emailCounter += 1;
  return `${seed.tag}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}${emailCounter}@${data.customer.emailDomain}`.toLowerCase();
}
function registrationForm(data: TestData, email: string, name = unique('QA Customer')): Form {
  return { name, email, password: data.customer.password, ...data.customer.profile };
}
const wrongPassword = (data: TestData) => `${data.customer.password}Xq7`;

const createAccount = (api: Api, form: Form) => api.post<Body>(EP.createaccount, { form });
const verifyLogin = (api: Api, form: Form) => api.post<Body>(EP.verifylogin, { form });
const getUser = (api: Api, email: string) => api.get<Body>(EP.getuserdetailbyemail, { params: { email } });
const updateAccount = (api: Api, form: Form) => api.put<Body>(EP.updateaccount, { form });
const deleteAccount = (api: Api, email: string, password: string) => api.delete<Body>(EP.deleteaccount, { form: { email, password } });

/** Cleanup: close the account; "already gone" (404) is fine, anything else is reported as a failed cleanup. */
async function closeAccount(api: Api, c: { email: string; password: string }): Promise<void> {
  const r = await deleteAccount(api, c.email, c.password);
  if (r.body?.responseCode !== REQ.CODE.OK && r.body?.responseCode !== REQ.CODE.NOT_FOUND) {
    throw new Error(`deleteAccount cleanup answered ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`);
  }
}

/** Given a customer exists — created through createAccount (P1), closed in cleanup. */
async function seedCustomer(seed: Seed, api: Api, data: TestData, name?: string): Promise<Customer> {
  const email = uniqueEmail(seed, data);
  const form = registrationForm(data, email, name);
  return seed.create('customer (POST /api/createAccount)', async () => {
    const r = await createAccount(api, form);
    expect(r.body?.responseCode, 'create customer (seed)').toBe(201);
    return { email, password: form.password, name: form.name, form };
  }, (c) => closeAccount(api, c));
}

/** Read the profile as a precondition (seed step). */
async function readProfile(seed: Seed, api: Api, email: string): Promise<Record<string, unknown>> {
  return seed.step('read profile (GET /api/getUserDetailByEmail)', async () => {
    const r = await getUser(api, email);
    expect(r.body?.user, 'profile readable (precondition)').toBeTruthy();
    return r.body.user as Record<string, unknown>;
  });
}

/** Track an account the scenario itself may have created by mistake, so it is closed after the test. */
function trackIfCreated(seed: Seed, api: Api, res: Res, c: { email: string; password: string }): void {
  if (res.body?.responseCode === REQ.CODE.CREATED) seed.track('customer', c, (x) => closeAccount(api, x));
}

// ---- UI helpers (shop sign-in, G2) ----------------------------------------------------------------------------------

function loginForm(page: Page) {
  // The page has two "Email Address" inputs (login + signup): scope to the form that holds the Login button (probed: 1 match).
  return page.locator('form').filter({ has: page.getByRole('button', { name: 'Login', exact: true }) });
}
async function signIn(page: Page, email: string, password: string): Promise<void> {
  const form = loginForm(page);
  await form.getByPlaceholder('Email Address').fill(email);
  await form.getByPlaceholder('Password').fill(password);
  await form.getByRole('button', { name: 'Login', exact: true }).click();
}

test.describe('AE-2 Customer account lifecycle through the partner Account API, with shop sign-in', () => {
  // ---------------------------------------------------------------- AC-1
  test('SCN-001: The partner creates a customer with all required fields and a new e-mail', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let email = ''; let res!: Res;
    await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
    await journey.step('When the partner calls createAccount with every required and optional field and that e-mail', async () => {
      const form = registrationForm(data, email);
      res = await createAccount(api, form);
      trackIfCreated(seed, api, res, form as { email: string; password: string });
    });
    await journey.step('Then the responseCode is 201', async () => {
      expect(res.body?.responseCode, '[REQ AC-1] createAccount → responseCode 201').toBe(REQ.CODE.CREATED);
    });
    await journey.step('And the message is "User created!"', async () => {
      expect(res.body?.message, '[REQ AC-1] createAccount → "User created!"').toBe(REQ.MSG.USER_CREATED);
    });
  });

  test('SCN-002: createAccount answers with the documented response envelope', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let email = ''; let res!: Res;
    await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
    await journey.step('When the partner calls createAccount with all required fields and that e-mail', async () => {
      const form = registrationForm(data, email);
      res = await createAccount(api, form);
      trackIfCreated(seed, api, res, form as { email: string; password: string });
    });
    await journey.step('Then the HTTP status is 200', async () => {
      expect(res.status, '[REQ AC-1] every Account API response has HTTP status 200 (R1)').toBe(REQ.HTTP_STATUS);
    });
    await journey.step('And the body is a JSON object with an integer responseCode and a string message', async () => {
      const envelope: Record<string, ShapeRule> = { responseCode: 'integer', message: 'string' };
      expect(checkShape(res.body, envelope, 'body'), '[REQ AC-1] response envelope: integer responseCode + string message (R1)').toEqual([]);
    });
  });

  // ---------------------------------------------------------------- AC-2, AC-3
  test('SCN-003: A second account for an already registered e-mail is refused', { tag: ['@AC-2', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls createAccount again with the same e-mail address', async () => {
      res = await createAccount(api, registrationForm(data, c.email));
    });
    await journey.step('Then the responseCode is 400', async () => {
      expect(res.body?.responseCode, '[REQ AC-2] duplicate e-mail → responseCode 400').toBe(REQ.CODE.BAD_REQUEST);
    });
    await journey.step('And the message is "Email already exists!"', async () => {
      expect(res.body?.message, '[REQ AC-2] duplicate e-mail → "Email already exists!"').toBe(REQ.MSG.EMAIL_EXISTS);
    });
  });

  test('SCN-004: An e-mail that differs from a registered one only in letter case is refused', { tag: ['@AC-3', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with a unique lower-case e-mail address', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls createAccount with the same e-mail address in upper case', async () => {
      const upper = c.email.toUpperCase();
      res = await createAccount(api, registrationForm(data, upper));
      trackIfCreated(seed, api, res, { email: upper, password: c.password });
    });
    await journey.step('Then the responseCode is 400', async () => {
      expect(res.body?.responseCode, '[REQ AC-3] e-mail differing only in case → responseCode 400').toBe(REQ.CODE.BAD_REQUEST);
    });
    await journey.step('And the message is "Email already exists!"', async () => {
      expect(res.body?.message, '[REQ AC-3] e-mail differing only in case → "Email already exists!"').toBe(REQ.MSG.EMAIL_EXISTS);
    });
  });

  // ---------------------------------------------------------------- AC-4
  REQ.REQUIRED_FIELDS.forEach((field, i) => {
    test(`SCN-005.${i + 1}: createAccount without a required field is refused and creates nothing (${field})`, { tag: ['@AC-4', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let email = ''; let res!: Res;
      await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
      await journey.step(`When the partner calls createAccount with all required fields except ${field}`, async () => {
        const form = registrationForm(data, email);
        delete form[field];
        res = await createAccount(api, form);
        trackIfCreated(seed, api, res, { email, password: data.customer.password });
      });
      await journey.step('Then the responseCode is 400', async () => {
        expect(res.body?.responseCode, `[REQ AC-4] missing ${field} → responseCode 400`).toBe(REQ.CODE.BAD_REQUEST);
      });
      await journey.step(`And the message is "${REQ.MSG.MISSING_POST_PARAM(field)}"`, async () => {
        expect(res.body?.message, `[REQ AC-4] missing ${field} → message names the parameter`).toBe(REQ.MSG.MISSING_POST_PARAM(field));
      });
      await journey.step('And getUserDetailByEmail for that e-mail answers responseCode 404 "Account not found with this email, try another email!"', async () => {
        if (field === 'email') return; // no address was sent: nothing to look up (ASSUMPTION in scenarios.feature)
        const g = await getUser(api, email);
        expect.soft(g.body?.responseCode, `[REQ AC-4] missing ${field} → account not created (404)`).toBe(REQ.CODE.NOT_FOUND);
        expect.soft(g.body?.message, `[REQ AC-4] missing ${field} → account not created (message)`).toBe(REQ.MSG.ACCOUNT_NOT_FOUND_BY_EMAIL);
      });
    });
  });

  // ---------------------------------------------------------------- AC-5
  test('SCN-006: createAccount with an e-mail that has no "@" is refused and creates nothing', { tag: ['@AC-5', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let address = ''; let res!: Res;
    await journey.step('Given a unique address without "@"', async () => { address = uniqueEmail(seed, data).replace('@', '.at.'); });
    await journey.step('When the partner calls createAccount with all required fields and that address', async () => {
      res = await createAccount(api, registrationForm(data, address));
      trackIfCreated(seed, api, res, { email: address, password: data.customer.password });
    });
    await journey.step('Then the responseCode is 400', async () => {
      expect(res.body?.responseCode, '[REQ AC-5] e-mail without "@" → responseCode 400').toBe(REQ.CODE.BAD_REQUEST);
    });
    await journey.step('And getUserDetailByEmail for that address answers responseCode 404', async () => {
      const g = await getUser(api, address);
      expect(g.body?.responseCode, '[REQ AC-5] e-mail without "@" → account not created (404)').toBe(REQ.CODE.NOT_FOUND);
    });
  });

  REQ.INVALID_EMAIL_SHAPES.forEach((shape, i) => {
    test(`SCN-007.${i + 1}: createAccount with an e-mail that has an "@" but is still invalid is refused and creates nothing (${shape})`, { tag: ['@AC-5', '@type:boundary', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
      let address = ''; let res!: Res;
      await journey.step(`Given a unique address with ${shape}`, async () => {
        const [local] = uniqueEmail(seed, data).split('@');
        address = i === 0 ? `${local}@` : `@${local}.${data.customer.emailDomain}`;
      });
      await journey.step('When the partner calls createAccount with all required fields and that address', async () => {
        res = await createAccount(api, registrationForm(data, address));
        trackIfCreated(seed, api, res, { email: address, password: data.customer.password });
      });
      await journey.step('Then the responseCode is 400', async () => {
        expect(res.body?.responseCode, `[REQ AC-5] invalid e-mail (${shape}) → responseCode 400`).toBe(REQ.CODE.BAD_REQUEST);
      });
      await journey.step('And getUserDetailByEmail for that address answers responseCode 404', async () => {
        const g = await getUser(api, address);
        expect(g.body?.responseCode, `[REQ AC-5] invalid e-mail (${shape}) → account not created (404)`).toBe(REQ.CODE.NOT_FOUND);
      });
    });
  });

  // ---------------------------------------------------------------- AC-6
  test('SCN-008: verifyLogin with a valid e-mail and password confirms the customer', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls verifyLogin with that e-mail and the correct password', async () => {
      res = await verifyLogin(api, { email: c.email, password: c.password });
    });
    await journey.step('Then the responseCode is 200', async () => {
      expect(res.body?.responseCode, '[REQ AC-6] valid credentials → responseCode 200').toBe(REQ.CODE.OK);
    });
    await journey.step('And the message is "User exists!"', async () => {
      expect(res.body?.message, '[REQ AC-6] valid credentials → "User exists!"').toBe(REQ.MSG.USER_EXISTS);
    });
  });

  test('SCN-009: verifyLogin with a wrong password is refused', { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls verifyLogin with that e-mail and a wrong password', async () => {
      res = await verifyLogin(api, { email: c.email, password: wrongPassword(data) });
    });
    await journey.step('Then the responseCode is 404', async () => {
      expect(res.body?.responseCode, '[REQ AC-6] wrong password → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
    });
    await journey.step('And the message is "User not found!"', async () => {
      expect(res.body?.message, '[REQ AC-6] wrong password → "User not found!"').toBe(REQ.MSG.USER_NOT_FOUND);
    });
  });

  test('SCN-010: verifyLogin with an unknown e-mail is refused', { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let email = ''; let res!: Res;
    await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
    await journey.step('When the partner calls verifyLogin with that e-mail and a password', async () => {
      res = await verifyLogin(api, { email, password: data.customer.password });
    });
    await journey.step('Then the responseCode is 404', async () => {
      expect(res.body?.responseCode, '[REQ AC-6] unknown e-mail → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
    });
    await journey.step('And the message is "User not found!"', async () => {
      expect(res.body?.message, '[REQ AC-6] unknown e-mail → "User not found!"').toBe(REQ.MSG.USER_NOT_FOUND);
    });
  });

  REQ.VERIFY_MISSING.forEach((missing, i) => {
    test(`SCN-011.${i + 1}: verifyLogin without the ${missing} parameter is refused`, { tag: ['@AC-6', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
      let email = ''; let res!: Res;
      await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
      await journey.step(`When the partner calls verifyLogin without the ${missing} parameter`, async () => {
        const form: Form = { email, password: data.customer.password };
        delete form[missing];
        res = await verifyLogin(api, form);
      });
      await journey.step('Then the responseCode is 400', async () => {
        expect(res.body?.responseCode, `[REQ AC-6] ${missing} missing → responseCode 400`).toBe(REQ.CODE.BAD_REQUEST);
      });
      await journey.step('And the message is "Bad request, email or password parameter is missing in POST request."', async () => {
        expect(res.body?.message, `[REQ AC-6] ${missing} missing → missing-parameter message`).toBe(REQ.MSG.VERIFY_MISSING_PARAM);
      });
    });
  });

  test('SCN-012: verifyLogin called with the DELETE method is not supported', { tag: ['@AC-6', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let email = ''; let res!: Res;
    await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
    await journey.step('When the partner calls verifyLogin with the DELETE method', async () => {
      res = await api.delete<Body>(EP.verifylogin, { form: { email, password: data.customer.password } });
    });
    await journey.step('Then the responseCode is 405', async () => {
      expect(res.body?.responseCode, '[REQ AC-6] DELETE on verifyLogin → responseCode 405').toBe(REQ.CODE.NOT_SUPPORTED);
    });
    await journey.step('And the message is "This request method is not supported."', async () => {
      expect(res.body?.message, '[REQ AC-6] DELETE on verifyLogin → "This request method is not supported."').toBe(REQ.MSG.METHOD_NOT_SUPPORTED);
    });
  });

  // ---------------------------------------------------------------- AC-7
  test('SCN-013: getUserDetailByEmail returns a user object with every field of the contract', { tag: ['@AC-7', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, c.email); });
    await journey.step('Then the responseCode is 200', async () => {
      expect(res.body?.responseCode, '[REQ AC-7] known e-mail → responseCode 200').toBe(REQ.CODE.OK);
    });
    await journey.step('And the user object has the fields id, name, email, title, birth_day, birth_month, birth_year, first_name, last_name, company, address1, address2, country, state, city, zipcode, mobile_number', async () => {
      const present: Record<string, ShapeRule> = Object.fromEntries(REQ.USER_FIELDS.map((f) => [f, () => true]));
      expect(checkShape(res.body?.user, present, 'user'), '[REQ AC-7] user object has every contract field').toEqual([]);
    });
  });

  test('SCN-014: getUserDetailByEmail returns the registration values of the same-named fields', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, c.email); });
    await journey.step('Then the responseCode is 200', async () => {
      expect(res.body?.responseCode, '[REQ AC-7] known e-mail → responseCode 200').toBe(REQ.CODE.OK);
    });
    await journey.step('And name, email, title, birth_month, birth_year, company, address1, address2, country, state, city, zipcode and mobile_number hold the registration values', async () => {
      const user = res.body?.user ?? {};
      for (const f of REQ.SAME_NAMED_FIELDS) {
        expect.soft(String(user[f]), `[REQ AC-7] user.${f} holds the registration value`).toBe(c.form[f]);
      }
    });
  });

  test('SCN-015: getUserDetailByEmail returns the registration values of the renamed fields', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, c.email); });
    await journey.step('Then the responseCode is 200', async () => {
      expect(res.body?.responseCode, '[REQ AC-7] known e-mail → responseCode 200').toBe(REQ.CODE.OK);
    });
    await journey.step('And birth_day holds the registered birth_date, first_name the registered firstname and last_name the registered lastname', async () => {
      const user = res.body?.user ?? {};
      for (const [resp, reqField] of Object.entries(REQ.RENAMED_FIELDS)) {
        expect.soft(String(user[resp]), `[REQ AC-7] user.${resp} holds the registered ${reqField} (G3)`).toBe(c.form[reqField]);
      }
    });
  });

  test('SCN-016: getUserDetailByEmail never returns the password', { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, c.email); });
    await journey.step('Then the responseCode is 200', async () => {
      expect(res.body?.responseCode, '[REQ AC-7] known e-mail → responseCode 200').toBe(REQ.CODE.OK);
    });
    await journey.step('And the user object has no password field', async () => {
      expect(Object.keys(res.body?.user ?? {}).filter((k) => /pass/i.test(k)), '[REQ AC-7] user object has no password field').toEqual([]);
    });
    await journey.step("And the response does not contain the customer's password", async () => {
      expect(res.text.includes(c.password), '[REQ AC-7] the password value is never returned').toBe(false);
    });
  });

  test('SCN-017: getUserDetailByEmail for an unknown e-mail is refused', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let email = ''; let res!: Res;
    await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
    await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, email); });
    await journey.step('Then the responseCode is 404', async () => {
      expect(res.body?.responseCode, '[REQ AC-7] unknown e-mail → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
    });
    await journey.step('And the message is "Account not found with this email, try another email!"', async () => {
      expect(res.body?.message, '[REQ AC-7] unknown e-mail → "Account not found with this email, try another email!"').toBe(REQ.MSG.ACCOUNT_NOT_FOUND_BY_EMAIL);
    });
  });

  // ---------------------------------------------------------------- AC-8
  test('SCN-018: updateAccount changes only the fields sent', { tag: ['@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let before: Record<string, unknown> = {}; let res!: Res;
    const newName = unique('QA Renamed');
    const newCity = data.customer.update.city as string;
    await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step("And I read the customer's profile through getUserDetailByEmail", async () => { before = await readProfile(seed, api, c.email); });
    await journey.step('When the partner calls updateAccount with the correct e-mail and password and a new name and city only', async () => {
      res = await updateAccount(api, { email: c.email, password: c.password, name: newName, city: newCity });
    });
    await journey.step('Then the responseCode is 200', async () => {
      expect(res.body?.responseCode, '[REQ AC-8] update with correct credentials → responseCode 200').toBe(REQ.CODE.OK);
    });
    await journey.step('And the message is "User updated!"', async () => {
      expect(res.body?.message, '[REQ AC-8] update with correct credentials → "User updated!"').toBe(REQ.MSG.USER_UPDATED);
    });
    let after: Record<string, unknown> = {};
    await journey.step('And getUserDetailByEmail shows the new name and city', async () => {
      after = (await getUser(api, c.email)).body?.user ?? {};
      expect.soft(after.name, '[REQ AC-8] sent field name changed').toBe(newName);
      expect.soft(after.city, '[REQ AC-8] sent field city changed').toBe(newCity);
    });
    await journey.step('And getUserDetailByEmail shows every other field unchanged', async () => {
      for (const f of REQ.USER_FIELDS.filter((x) => x !== 'name' && x !== 'city')) {
        expect.soft(after[f], `[REQ AC-8] field not sent (${f}) keeps its value`).toEqual(before[f]);
      }
    });
  });

  test('SCN-019: updateAccount with a wrong password is refused and changes nothing', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let before: Record<string, unknown> = {}; let res!: Res;
    await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step("And I read the customer's profile through getUserDetailByEmail", async () => { before = await readProfile(seed, api, c.email); });
    await journey.step('When the partner calls updateAccount with the e-mail, a wrong password and a new name and city', async () => {
      res = await updateAccount(api, { email: c.email, password: wrongPassword(data), name: unique('QA Intruder'), city: data.customer.update.city });
    });
    await journey.step('Then the responseCode is 404', async () => {
      expect(res.body?.responseCode, '[REQ AC-8] update with wrong password → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
    });
    await journey.step('And the message is "Account not found!"', async () => {
      expect(res.body?.message, '[REQ AC-8] update with wrong password → "Account not found!"').toBe(REQ.MSG.ACCOUNT_NOT_FOUND);
    });
    await journey.step('And getUserDetailByEmail shows the profile unchanged', async () => {
      const after = (await getUser(api, c.email)).body?.user ?? {};
      expect(after, '[REQ AC-8] wrong-password update changes nothing').toEqual(before);
    });
  });

  // ---------------------------------------------------------------- AC-9
  test('SCN-020: deleteAccount with the correct credentials closes the account', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls deleteAccount with the correct e-mail and password', async () => { res = await deleteAccount(api, c.email, c.password); });
    await journey.step('Then the responseCode is 200', async () => {
      expect(res.body?.responseCode, '[REQ AC-9] delete with correct credentials → responseCode 200').toBe(REQ.CODE.OK);
    });
    await journey.step('And the message is "Account deleted!"', async () => {
      expect(res.body?.message, '[REQ AC-9] delete with correct credentials → "Account deleted!"').toBe(REQ.MSG.ACCOUNT_DELETED);
    });
    await journey.step('And verifyLogin for that e-mail and password answers responseCode 404 "User not found!"', async () => {
      const v = await verifyLogin(api, { email: c.email, password: c.password });
      expect.soft(v.body?.responseCode, '[REQ AC-9] after delete verifyLogin → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
      expect.soft(v.body?.message, '[REQ AC-9] after delete verifyLogin → "User not found!"').toBe(REQ.MSG.USER_NOT_FOUND);
    });
    await journey.step('And getUserDetailByEmail for that e-mail answers responseCode 404 "Account not found with this email, try another email!"', async () => {
      const g = await getUser(api, c.email);
      expect.soft(g.body?.responseCode, '[REQ AC-9] after delete getUserDetailByEmail → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
      expect.soft(g.body?.message, '[REQ AC-9] after delete getUserDetailByEmail → not-found message').toBe(REQ.MSG.ACCOUNT_NOT_FOUND_BY_EMAIL);
    });
  });

  test('SCN-021: deleteAccount with a wrong password is refused', { tag: ['@AC-9', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer; let res!: Res;
    await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls deleteAccount with the e-mail and a wrong password', async () => { res = await deleteAccount(api, c.email, wrongPassword(data)); });
    await journey.step('Then the responseCode is 404', async () => {
      expect(res.body?.responseCode, '[REQ AC-9] delete with wrong password → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
    });
    await journey.step('And the message is "Account not found!"', async () => {
      expect(res.body?.message, '[REQ AC-9] delete with wrong password → "Account not found!"').toBe(REQ.MSG.ACCOUNT_NOT_FOUND);
    });
  });

  test('SCN-022: After a refused deleteAccount the account remains usable', { tag: ['@AC-9', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let c!: Customer;
    await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('When the partner calls deleteAccount with the e-mail and a wrong password', async () => { await deleteAccount(api, c.email, wrongPassword(data)); });
    await journey.step('Then verifyLogin with the correct e-mail and password answers responseCode 200 "User exists!"', async () => {
      const v = await verifyLogin(api, { email: c.email, password: c.password });
      expect.soft(v.body?.responseCode, '[REQ AC-9] account remains usable: verifyLogin → responseCode 200 (G4)').toBe(REQ.CODE.OK);
      expect.soft(v.body?.message, '[REQ AC-9] account remains usable: verifyLogin → "User exists!" (G4)').toBe(REQ.MSG.USER_EXISTS);
    });
    await journey.step('And getUserDetailByEmail for that e-mail answers responseCode 200', async () => {
      const g = await getUser(api, c.email);
      expect(g.body?.responseCode, '[REQ AC-9] account remains usable: getUserDetailByEmail → responseCode 200 (G4)').toBe(REQ.CODE.OK);
    });
  });

  // ---------------------------------------------------------------- AC-10 .. AC-12 (shop sign-in)
  test('SCN-023: A customer created through the API signs in on the shop and sees their name', { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    await journey.step('Given a customer exists with a unique e-mail address and a unique name', async () => { c = await seedCustomer(seed, api, data, unique('QA Shopper')); });
    await journey.step('And I am on the Signup / Login page', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I sign in in the "Login to your account" form with that e-mail and password', async () => { await signIn(page, c.email, c.password); });
    await journey.step('Then the header shows "Logged in as <name>" with the registered name', async () => {
      await expect(page.locator('header').getByText(REQ.LOGGED_IN_AS(c.name)), '[REQ AC-10] header shows "Logged in as <name>"').toBeVisible();
    });
  });

  test('SCN-024: After a name change through updateAccount the shop header shows the new name', { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer; const newName = unique('QA Renamed');
    await journey.step('Given a customer exists with a unique e-mail address and a unique name', async () => { c = await seedCustomer(seed, api, data, unique('QA Shopper')); });
    await journey.step("And the customer's name was changed through updateAccount to a new unique name", async () => {
      await seed.step('rename customer (PUT /api/updateAccount)', async () => {
        const r = await updateAccount(api, { email: c.email, password: c.password, name: newName });
        expect(r.body?.responseCode, 'rename accepted (precondition)').toBe(200);
      });
    });
    await journey.step('And I am on the Signup / Login page', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I sign in in the "Login to your account" form with that e-mail and password', async () => { await signIn(page, c.email, c.password); });
    await journey.step('Then the header shows "Logged in as <name>" with the new name', async () => {
      await expect(page.locator('header').getByText(REQ.LOGGED_IN_AS(newName)), '[REQ AC-10] header shows the name changed through updateAccount').toBeVisible();
    });
  });

  test('SCN-025: Shop sign-in with a wrong password is refused on the login page', { tag: ['@AC-11', '@type:negative', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
    await journey.step('And I am on the Signup / Login page', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I sign in in the "Login to your account" form with that e-mail and a wrong password', async () => { await signIn(page, c.email, wrongPassword(data)); });
    await journey.step('Then I am still on the login page', async () => {
      await expect(page, '[REQ AC-11] stays on the login page').toHaveURL(REQ.LOGIN_PATH);
    });
    await journey.step('And the message "Your email or password is incorrect!" is shown', async () => {
      await expect(page.getByText(REQ.MSG.LOGIN_INCORRECT), '[REQ AC-11] "Your email or password is incorrect!" shown').toBeVisible();
    });
  });

  test('SCN-026: Shop sign-in for an account closed through deleteAccount is refused', { tag: ['@AC-12', '@type:negative', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    await journey.step('Given a customer existed with a unique e-mail address and was closed through deleteAccount', async () => {
      c = await seedCustomer(seed, api, data);
      await seed.step('close customer (DELETE /api/deleteAccount)', async () => {
        const r = await deleteAccount(api, c.email, c.password);
        expect(r.body?.responseCode, 'account closed (precondition)').toBe(200);
      });
    });
    await journey.step('And I am on the Signup / Login page', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I sign in in the "Login to your account" form with that e-mail and password', async () => { await signIn(page, c.email, c.password); });
    await journey.step('Then the message "Your email or password is incorrect!" is shown', async () => {
      await expect(page.getByText(REQ.MSG.LOGIN_INCORRECT), '[REQ AC-12] closed account → "Your email or password is incorrect!"').toBeVisible();
    });
  });
});
