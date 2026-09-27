/**
 * Held-out acceptance tests for PB-1 — "Customer registration and sign-in".
 * Written from evaluations/PB-1/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Locator, Page } from '@playwright/test';
import { test, expect, gotoPage, checkShape, type Api, type ShapeRule, type Seed, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from PB-1 (never edit during hardening)
const REQ = {
  STATUS: { OK: 200, BAD_REQUEST: 400 },
  AC1_REQUIRED: [
    { field: 'First Name', message: 'First name is required.' },
    { field: 'Last Name', message: 'Last name is required.' },
    { field: 'Address', message: 'Address is required.' },
    { field: 'City', message: 'City is required.' },
    { field: 'State', message: 'State is required.' },
    { field: 'Zip Code', message: 'Zip Code is required.' },
    { field: 'SSN', message: 'Social Security Number is required.' },
    { field: 'Username', message: 'Username is required.' },
    { field: 'Password', message: 'Password is required.' },
    { field: 'Confirm', message: 'Password confirmation is required.' },
  ],
  AC1_OPTIONAL_FIELD: 'Phone #',
  AC2_MISMATCH: 'Passwords did not match.',
  AC3_HEADING: (username: string) => `Welcome ${username}`,
  AC3_CREATED: 'Your account was created successfully. You are now logged in.',
  AC3_GREETING: (first: string, last: string) => `Welcome ${first} ${last}`,
  AC3_MENU: 'Account Services',
  AC4_DUPLICATE: 'This username already exists.',
  AC5_ERROR_HEADING: 'Error!',
  AC5_NOT_VERIFIED: 'The username and password could not be verified.',
  AC5_EMPTY: 'Please enter a username and password.',
  AC6_OVERVIEW: 'Accounts Overview',
  AC6_LOGOUT: 'Log Out',
  AC6_LOGIN_PANEL: 'Customer Login',
  AC7_XML_ROOT: 'customer',
  AC8_BODY: 'Invalid username and/or password',
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** GET /login/{username}/{password} */ loginByUsernameAndPassword: (username: string | number, password: string | number) => `/login/${encodeURIComponent(String(username))}/${encodeURIComponent(String(password))}`,
  /** GET /customers/{id} */ customersById: (id: string | number) => `/customers/${id}`,
  /** GET /customers/{id}/accounts */ customersAccountsById: (id: string | number) => `/customers/${id}/accounts`,
};

// Entry points (story Context) — routes relative to the AUT profile URL.
const PAGES = { home: 'index.htm', register: 'register.htm', overview: 'overview.htm' }; // overview route: TODO(harden) (gap G2)

/** Shape the story states for the customer returned by the REST services (AC-7). */
const CUSTOMER_SHAPE: Record<string, ShapeRule> = {
  id: (v) => v !== undefined && v !== null && v !== '' || 'missing id',
  firstName: 'string', lastName: 'string', address: 'object', phoneNumber: 'string',
};

interface Customer {
  firstName: string; lastName: string; street: string; city: string; state: string; zipCode: string;
  phoneNumber: string; ssn: string; username: string; password: string;
}

interface RestCustomer {
  id: number | string; firstName: string; lastName: string; phoneNumber: string;
  address: { street: string; city: string; state: string; zipCode: string };
}

let serial = 0;
/** A fresh, unique user name (letters + digits only, so it is safe in the REST path). */
function freshUsername(seed: Seed): string {
  serial += 1;
  return `pb1${seed.tag}${serial}${Math.random().toString(36).slice(2, 5)}`;
}

function validCustomer(data: TestData, seed: Seed, overrides: Partial<Customer> = {}): Customer {
  const c = data.customer;
  return {
    firstName: 'Hana', lastName: `Heldout${seed.tag.slice(-4)}`,
    street: c.address.street, city: c.address.city, state: c.address.state, zipCode: c.address.zipCode,
    phoneNumber: c.phoneNumber, ssn: c.ssn, username: freshUsername(seed), password: c.password,
    ...overrides,
  };
}

// ---- registration page (register.htm) -----------------------------------------------------------

const FIELD: Record<string, (p: Page) => Locator> = {
  'First Name': (p) => p.getByLabel('First Name'), // TODO(harden)
  'Last Name': (p) => p.getByLabel('Last Name'), // TODO(harden)
  Address: (p) => p.getByLabel('Address'), // TODO(harden)
  City: (p) => p.getByLabel('City'), // TODO(harden)
  State: (p) => p.getByLabel('State'), // TODO(harden)
  'Zip Code': (p) => p.getByLabel('Zip Code'), // TODO(harden)
  'Phone #': (p) => p.getByLabel('Phone #'), // TODO(harden)
  SSN: (p) => p.getByLabel('SSN'), // TODO(harden)
  Username: (p) => p.getByLabel('Username'), // TODO(harden)
  Password: (p) => p.getByLabel('Password', { exact: true }), // TODO(harden)
  Confirm: (p) => p.getByLabel('Confirm'), // TODO(harden)
};
/** The form row that holds a field and its message ("next to" the field). */
const fieldRow = (p: Page, field: string): Locator => p.locator('tr').filter({ has: FIELD[field](p) }); // TODO(harden)
const registerButton = (p: Page) => p.getByRole('button', { name: 'Register' }); // TODO(harden)

async function fillRegistration(page: Page, c: Customer, confirm = c.password): Promise<void> {
  await FIELD['First Name'](page).fill(c.firstName);
  await FIELD['Last Name'](page).fill(c.lastName);
  await FIELD.Address(page).fill(c.street);
  await FIELD.City(page).fill(c.city);
  await FIELD.State(page).fill(c.state);
  await FIELD['Zip Code'](page).fill(c.zipCode);
  await FIELD['Phone #'](page).fill(c.phoneNumber);
  await FIELD.SSN(page).fill(c.ssn);
  await FIELD.Username(page).fill(c.username);
  await FIELD.Password(page).fill(c.password);
  await FIELD.Confirm(page).fill(confirm);
}

/** Sign the browser out (fresh visitor) without depending on the Log Out link under test in AC-6. */
async function signedOutVisitor(page: Page): Promise<void> {
  await page.context().clearCookies();
}

/** Precondition: register a customer through register.htm (gap G1: no REST registration endpoint in the story). */
async function registerCustomer(seed: Seed, page: Page, c: Customer, label = 'customer registered via register.htm'): Promise<Customer> {
  return seed.create(label, async () => {
    await signedOutVisitor(page);
    await gotoPage(page, PAGES.register);
    await fillRegistration(page, c);
    await registerButton(page).click();
    await expect(page.getByText(REQ.AC3_CREATED), 'registration succeeded (precondition)').toBeVisible(); // TODO(harden)
    return c;
  });
}

// ---- Customer Login panel (home page) ------------------------------------------------------------

const loginUsername = (p: Page) => p.getByLabel('Username'); // TODO(harden)
const loginPassword = (p: Page) => p.getByLabel('Password'); // TODO(harden)
const loginButton = (p: Page) => p.getByRole('button', { name: 'Log In' }); // TODO(harden)
const loginPanelHeading = (p: Page) => p.getByRole('heading', { name: REQ.AC6_LOGIN_PANEL }); // TODO(harden)

async function signIn(page: Page, username: string, password: string): Promise<void> {
  await loginUsername(page).fill(username);
  await loginPassword(page).fill(password);
  await loginButton(page).click();
}

// ---- Accounts Overview ----------------------------------------------------------------------------

/** Account numbers shown in the Accounts Overview (gap G2: how they are shown). */
const accountNumberLinks = (p: Page) => p.locator('table a'); // TODO(harden)

async function shownAccountNumbers(page: Page): Promise<string[]> {
  await expect(accountNumberLinks(page).first(), 'account numbers rendered (precondition)').toBeVisible();
  return (await accountNumberLinks(page).allInnerTexts()).map((t) => t.trim()).filter(Boolean);
}

// ---- REST helpers ---------------------------------------------------------------------------------

async function restLogin(api: Api, username: string, password: string) {
  return api.get<RestCustomer>(EP.loginByUsernameAndPassword(username, password), { headers: { Accept: 'application/json' } });
}

test.describe('PB-1 Customer registration and sign-in', () => {
  test('SCN-001: Submitting an empty registration form shows a required message next to every required field', { tag: ['@AC-1', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the registration page register.htm', async () => {
      await gotoPage(page, PAGES.register);
      await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
    });
    await journey.step('When I submit the registration form with every field empty', async () => {
      await registerButton(page).click();
    });
    await journey.step('Then I am still on the registration form', async () => {
      await expect(registerButton(page), '[REQ AC-1] still on the registration form').toBeVisible();
      await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-1] no customer created').toHaveCount(0);
    });
    for (const { field, message } of REQ.AC1_REQUIRED) {
      await journey.step(`And "${message}" is shown next to ${field}`, async () => {
        await expect.soft(fieldRow(page, field), `[REQ AC-1] "${message}" next to ${field}`).toContainText(message);
      });
    }
    await journey.step('And no message is shown for Phone #', async () => {
      await expect(fieldRow(page, REQ.AC1_OPTIONAL_FIELD), '[REQ AC-1] no message for Phone #').not.toContainText(/required/i);
    });
  });

  test('SCN-002: Registering with a Confirm that differs from Password shows "Passwords did not match."', { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    await journey.step('Given I am on the registration page register.htm', async () => {
      await gotoPage(page, PAGES.register);
      await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
    });
    await journey.step('When I submit a complete registration with a fresh user name whose Confirm differs from Password', async () => {
      await fillRegistration(page, c, `${c.password}x9`);
      await registerButton(page).click();
    });
    await journey.step('Then the form shows "Passwords did not match."', async () => {
      await expect(page.getByText(REQ.AC2_MISMATCH), '[REQ AC-2] "Passwords did not match." shown').toBeVisible(); // TODO(harden)
    });
  });

  test('SCN-003: A registration rejected for mismatched passwords creates no customer', { tag: ['@AC-2', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    let res!: Awaited<ReturnType<typeof restLogin>>;
    await journey.step('Given I submitted a complete registration with a fresh user name whose Confirm differs from Password', async () => {
      await seed.step('registration with mismatched Confirm submitted via register.htm', async () => {
        await gotoPage(page, PAGES.register);
        await fillRegistration(page, c, `${c.password}x9`);
        await registerButton(page).click();
        await expect(registerButton(page), 'form re-shown after the rejected registration (precondition)').toBeVisible();
      });
    });
    await journey.step('When I call GET /login/{username}/{password} with that user name and the Password I entered', async () => {
      res = await restLogin(api, c.username, c.password);
    });
    await journey.step('Then the call does not answer 200 with a customer', async () => {
      const gotCustomer = res.status === REQ.STATUS.OK && typeof res.body === 'object' && res.body !== null && 'id' in (res.body as object);
      expect(gotCustomer, `[REQ AC-2] user name cannot sign in (got ${res.status})`).toBe(false);
    });
  });

  test('SCN-004: A complete, valid registration welcomes the new customer and signs them in', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    await journey.step('Given I am on the registration page register.htm', async () => {
      await gotoPage(page, PAGES.register);
      await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
    });
    await journey.step('When I submit a complete, valid registration with a fresh user name', async () => {
      await fillRegistration(page, c);
      await registerButton(page).click();
    });
    await journey.step('Then the page shows the heading "Welcome <username>"', async () => {
      await expect(page.getByRole('heading', { name: REQ.AC3_HEADING(c.username) }), '[REQ AC-3] heading Welcome <username>').toBeVisible(); // TODO(harden)
    });
    await journey.step('And the page shows "Your account was created successfully. You are now logged in."', async () => {
      await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-3] account created text').toBeVisible(); // TODO(harden)
    });
    await journey.step('And the left panel greets me with "Welcome <first name> <last name>"', async () => {
      await expect(page.getByText(REQ.AC3_GREETING(c.firstName, c.lastName)), '[REQ AC-3] left panel greeting').toBeVisible(); // TODO(harden)
    });
    await journey.step('And the left panel shows the Account Services menu', async () => {
      await expect(page.getByRole('heading', { name: REQ.AC3_MENU }), '[REQ AC-3] Account Services menu').toBeVisible(); // TODO(harden)
    });
  });

  test('SCN-005: Registering with a user name that is already taken shows "This username already exists."', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    const existing = validCustomer(data, seed);
    await journey.step('Given a customer is registered with a fresh user name', async () => {
      await registerCustomer(seed, page, existing);
    });
    await journey.step('And I am on the registration page register.htm as a new visitor', async () => {
      await signedOutVisitor(page);
      await gotoPage(page, PAGES.register);
      await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
    });
    await journey.step('When I submit a complete registration with the same user name and a different first and last name', async () => {
      await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
      await registerButton(page).click();
    });
    await journey.step('Then "This username already exists." is shown next to Username', async () => {
      await expect(fieldRow(page, 'Username'), '[REQ AC-4] "This username already exists." next to Username').toContainText(REQ.AC4_DUPLICATE);
    });
  });

  test('SCN-006: A duplicate registration does not change the existing customer', { tag: ['@AC-4', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    const existing = validCustomer(data, seed);
    let res!: Awaited<ReturnType<typeof restLogin>>;
    await journey.step('Given a customer is registered with a fresh user name', async () => {
      await registerCustomer(seed, page, existing);
    });
    await journey.step('And a second registration with the same user name and a different first and last name was submitted', async () => {
      await seed.step('duplicate registration submitted via register.htm', async () => {
        await signedOutVisitor(page);
        await gotoPage(page, PAGES.register);
        await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
        await registerButton(page).click();
        await page.waitForLoadState('domcontentloaded');
      });
    });
    await journey.step('When I call GET /login/{username}/{password} for the existing customer', async () => {
      res = await restLogin(api, existing.username, existing.password);
    });
    await journey.step('Then the response returns the original first and last name', async () => {
      expect(res.status, '[REQ AC-4] existing customer can still log in (REST)').toBe(REQ.STATUS.OK);
      expect.soft(res.body?.firstName, '[REQ AC-4] original first name kept').toBe(existing.firstName);
      expect.soft(res.body?.lastName, '[REQ AC-4] original last name kept').toBe(existing.lastName);
    });
  });

  test('SCN-007: Signing in with a wrong password shows the "Error!" page', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    await journey.step('Given a customer is registered with a fresh user name', async () => {
      await registerCustomer(seed, page, c);
    });
    await journey.step('And I am on the home page as a signed-out visitor', async () => {
      await signedOutVisitor(page);
      await gotoPage(page, PAGES.home);
      await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
    });
    await journey.step('When I sign in on the Customer Login panel with that user name and a wrong password', async () => {
      await signIn(page, c.username, data.customer.wrongPassword);
    });
    await journey.step('Then an "Error!" page is shown', async () => {
      await expect(page.getByRole('heading', { name: REQ.AC5_ERROR_HEADING }), '[REQ AC-5] "Error!" page').toBeVisible(); // TODO(harden)
    });
    await journey.step('And it says "The username and password could not be verified."', async () => {
      await expect(page.getByText(REQ.AC5_NOT_VERIFIED), '[REQ AC-5] could not be verified').toBeVisible(); // TODO(harden)
    });
  });

  test('SCN-008: Signing in with both fields empty asks for a user name and password', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the home page as a signed-out visitor', async () => {
      await signedOutVisitor(page);
      await gotoPage(page, PAGES.home);
      await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
    });
    await journey.step('When I sign in on the Customer Login panel with both fields empty', async () => {
      await loginButton(page).click();
    });
    await journey.step('Then the page says "Please enter a username and password."', async () => {
      await expect(page.getByText(REQ.AC5_EMPTY), '[REQ AC-5] please enter a username and password').toBeVisible(); // TODO(harden)
    });
  });

  test('SCN-009: Signing in opens the Accounts Overview and Log Out returns to the home page', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    await journey.step('Given a customer is registered with a fresh user name', async () => {
      await registerCustomer(seed, page, c);
    });
    await journey.step('And I am on the home page as a signed-out visitor', async () => {
      await signedOutVisitor(page);
      await gotoPage(page, PAGES.home);
      await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
    });
    await journey.step('When I sign in on the Customer Login panel with that user name and password', async () => {
      await signIn(page, c.username, c.password);
    });
    await journey.step('Then the Accounts Overview page opens', async () => {
      await expect(page.getByRole('heading', { name: REQ.AC6_OVERVIEW }), '[REQ AC-6] Accounts Overview page').toBeVisible(); // TODO(harden)
    });
    await journey.step('And it lists at least one account', async () => {
      await expect(accountNumberLinks(page).first(), '[REQ AC-6] at least one account listed').toBeVisible();
    });
    await journey.step('When I click "Log Out"', async () => {
      await page.getByRole('link', { name: REQ.AC6_LOGOUT }).click(); // TODO(harden)
    });
    await journey.step('Then I am on the home page with the Customer Login panel', async () => {
      await expect(loginPanelHeading(page), '[REQ AC-6] Customer Login panel shown').toBeVisible();
      await expect(loginButton(page), '[REQ AC-6] Customer Login panel usable').toBeVisible();
    });
  });

  test('SCN-010: REST login with valid credentials returns the registered customer as JSON', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    let res!: Awaited<ReturnType<typeof restLogin>>;
    await journey.step('Given a customer is registered with a fresh user name, a full address and a Phone #', async () => {
      await registerCustomer(seed, page, c);
    });
    await journey.step('When I call GET /login/{username}/{password} with Accept: application/json', async () => {
      res = await restLogin(api, c.username, c.password);
    });
    await journey.step('Then the response status is 200', async () => {
      expect(res.status, '[REQ AC-7] valid login → 200').toBe(REQ.STATUS.OK);
    });
    await journey.step('And the body is JSON', async () => {
      expect(res.headers['content-type'] ?? '', '[REQ AC-7] JSON content type').toMatch(/json/i);
      expect(typeof res.body, '[REQ AC-7] body parses as JSON').toBe('object');
    });
    await journey.step("And it contains the customer's id", async () => {
      expect(checkShape(res.body, CUSTOMER_SHAPE, 'customer'), '[REQ AC-7] customer fields present').toEqual([]);
    });
    await journey.step('And firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal the values entered at registration', async () => {
      const b = res.body;
      expect.soft(b.firstName, '[REQ AC-7] firstName').toBe(c.firstName);
      expect.soft(b.lastName, '[REQ AC-7] lastName').toBe(c.lastName);
      expect.soft(b.address?.street, '[REQ AC-7] address.street').toBe(c.street);
      expect.soft(b.address?.city, '[REQ AC-7] address.city').toBe(c.city);
      expect.soft(b.address?.state, '[REQ AC-7] address.state').toBe(c.state);
      expect.soft(b.address?.zipCode, '[REQ AC-7] address.zipCode').toBe(c.zipCode);
      expect.soft(b.phoneNumber, '[REQ AC-7] phoneNumber').toBe(c.phoneNumber);
    });
  });

  test('SCN-011: REST login without Accept: application/json returns XML with a customer root element', { tag: ['@AC-7', '@type:contract', '@layer:api', '@P2'] }, async ({ page, api, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    let res!: Awaited<ReturnType<Api['get']>>;
    await journey.step('Given a customer is registered with a fresh user name', async () => {
      await registerCustomer(seed, page, c);
    });
    await journey.step('When I call GET /login/{username}/{password} without Accept: application/json', async () => {
      res = await api.get(EP.loginByUsernameAndPassword(c.username, c.password), { headers: { Accept: '*/*' } });
    });
    await journey.step('Then the response status is 200', async () => {
      expect(res.status, '[REQ AC-7] valid login (XML) → 200').toBe(REQ.STATUS.OK);
    });
    await journey.step('And the body is XML with a customer root element', async () => {
      const root = res.text.replace(/^﻿?\s*(<\?xml[^>]*\?>\s*)?/, '').match(/^<([A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)[\s/>]/)?.[2];
      expect(root, '[REQ AC-7] XML root element is customer').toBe(REQ.AC7_XML_ROOT);
    });
  });

  test('SCN-012: REST login with a wrong password answers 400 "Invalid username and/or password"', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    let res!: Awaited<ReturnType<typeof restLogin>>;
    await journey.step('Given a customer is registered with a fresh user name', async () => {
      await registerCustomer(seed, page, c);
    });
    await journey.step('When I call GET /login/{username}/{password} with a wrong password', async () => {
      res = await restLogin(api, c.username, data.customer.wrongPassword);
    });
    await journey.step('Then the response status is 400', async () => {
      expect(res.status, '[REQ AC-8] wrong password → 400').toBe(REQ.STATUS.BAD_REQUEST);
    });
    await journey.step('And the body is "Invalid username and/or password"', async () => {
      expect(res.text.trim(), '[REQ AC-8] body text').toBe(REQ.AC8_BODY);
    });
  });

  async function registeredWithOverview(seed: Seed, page: Page, api: Api, c: Customer, journey: { step<T>(t: string, f: () => Promise<T>): Promise<T> }) {
    let shown: string[] = [];
    let login!: RestCustomer;
    await journey.step('Given a customer is registered through the registration page with a fresh user name', async () => {
      await registerCustomer(seed, page, c);
    });
    await journey.step('And I noted the account numbers shown in the Accounts Overview', async () => {
      shown = await seed.step('read account numbers from Accounts Overview', async () => {
        await gotoPage(page, PAGES.overview);
        return shownAccountNumbers(page);
      });
    });
    await journey.step('And I obtained the customer id from GET /login/{username}/{password}', async () => {
      login = await seed.step('customer id from GET /login/{username}/{password}', async () => {
        const r = await restLogin(api, c.username, c.password);
        expect(r.status, 'REST login (precondition)').toBe(200);
        expect(r.body?.id, 'login returned a customer id (precondition)').toBeTruthy();
        return r.body;
      });
    });
    return { shown, login };
  }

  test('SCN-013: The customer and accounts services return the customer registered through the page', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    const { shown, login } = await registeredWithOverview(seed, page, api, c, journey);
    let cust!: Awaited<ReturnType<Api['get']>>;
    let accts!: Awaited<ReturnType<Api['get']>>;
    await journey.step('When I call GET /customers/{id}', async () => {
      cust = await api.get(EP.customersById(login.id)); // auth: TODO(harden) (gap G4)
    });
    await journey.step('Then it returns the customer with the same id, first name and last name as the login response', async () => {
      const b = cust.body as RestCustomer;
      expect(cust.status, '[REQ AC-9] GET /customers/{id} succeeds').toBe(REQ.STATUS.OK);
      expect.soft(String(b?.id), '[REQ AC-9] same id').toBe(String(login.id));
      expect.soft(b?.firstName, '[REQ AC-9] same first name').toBe(login.firstName);
      expect.soft(b?.lastName, '[REQ AC-9] same last name').toBe(login.lastName);
    });
    await journey.step('When I call GET /customers/{id}/accounts', async () => {
      accts = await api.get(EP.customersAccountsById(login.id)); // auth: TODO(harden) (gap G4)
    });
    await journey.step('Then every account number shown in the Accounts Overview is returned', async () => {
      expect(accts.status, '[REQ AC-9] GET /customers/{id}/accounts succeeds').toBe(REQ.STATUS.OK);
      const ids = (Array.isArray(accts.body) ? accts.body : []).map((a: { id: unknown }) => String(a.id));
      expect(ids, '[REQ AC-9] shown account numbers returned').toEqual(expect.arrayContaining(shown));
    });
  });

  test('SCN-014: The customer and accounts services match the login response and the Accounts Overview exactly', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, data, seed }) => {
    const c = validCustomer(data, seed);
    const { shown, login } = await registeredWithOverview(seed, page, api, c, journey);
    let cust!: Awaited<ReturnType<Api['get']>>;
    let accts!: Awaited<ReturnType<Api['get']>>;
    await journey.step('When I call GET /customers/{id}', async () => {
      cust = await api.get(EP.customersById(login.id)); // auth: TODO(harden) (gap G4)
    });
    await journey.step('Then its id, firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal the login response', async () => {
      const b = cust.body as RestCustomer;
      expect(cust.status, '[REQ AC-9] GET /customers/{id} succeeds').toBe(REQ.STATUS.OK);
      expect.soft({ id: String(b?.id), firstName: b?.firstName, lastName: b?.lastName, address: b?.address && { street: b.address.street, city: b.address.city, state: b.address.state, zipCode: b.address.zipCode }, phoneNumber: b?.phoneNumber },
        '[REQ AC-9] same customer as the login response').toEqual({ id: String(login.id), firstName: login.firstName, lastName: login.lastName, address: { street: login.address.street, city: login.address.city, state: login.address.state, zipCode: login.address.zipCode }, phoneNumber: login.phoneNumber });
    });
    await journey.step('When I call GET /customers/{id}/accounts', async () => {
      accts = await api.get(EP.customersAccountsById(login.id)); // auth: TODO(harden) (gap G4)
    });
    await journey.step('Then the account ids returned are exactly the account numbers shown in the Accounts Overview', async () => {
      expect(accts.status, '[REQ AC-9] GET /customers/{id}/accounts succeeds').toBe(REQ.STATUS.OK);
      const ids = (Array.isArray(accts.body) ? accts.body : []).map((a: { id: unknown }) => String(a.id)).sort();
      expect(ids, '[REQ AC-9] account set equals the Accounts Overview').toEqual([...shown].sort());
    });
  });
});
