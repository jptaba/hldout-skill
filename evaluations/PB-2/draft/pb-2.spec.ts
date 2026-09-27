/**
 * Held-out acceptance tests for PB-2 — "Open a new CHECKING or SAVINGS account online".
 * Written from evaluations/PB-2/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Page } from '@playwright/test';
import { test, expect, gotoPage, type Api, type ApiResponse, type Seed, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from PB-2 (never edit during hardening)
const REQ = {
  /** AC-1, R1, R2: exactly these account types. */
  ACCOUNT_TYPES: ['CHECKING', 'SAVINGS'],
  /** AC-1, R3. */
  MIN_DEPOSIT_TEXT: 'A minimum of $100.00 must be deposited into this account at time of opening.',
  /** AC-2 confirmation copy. */
  OPENED_TITLE: 'Account Opened!',
  OPENED_TEXT: 'Congratulations, your account is now open.',
  NEW_NUMBER_LABEL: 'Your new account number:',
  /** R3, R6: opening deposit / opening balance (API numbers, in USD). */
  OPENING_DEPOSIT: 100.0,
  /** AC-2, AC-3: the opening balance as the page shows it. */
  OPENING_BALANCE_UI: '$100.00',
  /** AC-4. */
  STATUS_OK: 200,
  /** AC-5, R8, R9. */
  FUNDING_TX: { type: 'Debit', amount: 100.0, description: 'Funds Transfer Sent' },
  NEW_ACCOUNT_TX: { type: 'Credit', amount: 100.0, description: 'Funds Transfer Received' },
  /** R5: balance >= 100.00 opens; below is refused, nothing moves. */
  R5_SERVICE_ROWS: [
    { fundingBalance: 100.0, label: '100.00', opened: true, balanceAfter: 0.0, balanceAfterLabel: '0.00' },
    { fundingBalance: 99.99, label: '99.99', opened: false, balanceAfter: 99.99, balanceAfterLabel: '99.99' },
  ],
  R5_PAGE_ROWS: [
    { fundingBalance: 100.0, label: '100.00', opened: true, pageOutcome: '"Account Opened!"', accountsAfter: 'one more than before', balanceAfter: 0.0, balanceAfterLabel: '0.00' },
    { fundingBalance: 99.99, label: '99.99', opened: false, pageOutcome: 'an error instead of the opening', accountsAfter: 'the same as before', balanceAfter: 99.99, balanceAfterLabel: '99.99' },
  ],
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** POST /createAccount */ createAccount: '/createAccount',
  /** GET /customers/{customerId}/accounts */ customerAccounts: (customerId: string | number) => `/customers/${customerId}/accounts`,
  /** GET /accounts/{accountId} */ account: (accountId: string | number) => `/accounts/${accountId}`,
  /** GET /accounts/{accountId}/transactions */ transactions: (accountId: string | number) => `/accounts/${accountId}/transactions`,
};
// Plumbing only (declared as # SEED-ENDPOINT in scenarios.feature).
const SEED_EP = {
  /** move money between the customer's own accounts to give a funding account an exact balance (G5) */
  transfer: '/transfer', // TODO(harden)
};

/** G1: how newAccountType encodes the type (mechanics, discovered during hardening). */
const TYPE_PARAM: Record<'CHECKING' | 'SAVINGS', string | number> = { CHECKING: 'CHECKING', SAVINGS: 'SAVINGS' }; // TODO(harden)

type AccountType = 'CHECKING' | 'SAVINGS';
interface Account { id: number; customerId: number; type: string; balance: number }
interface Customer { username: string; customerId: number; firstAccountId: number }

const cents = (v: unknown) => Math.round(Number(v) * 100);

// ---- helpers (mechanics) -------------------------------------------------------------------------

/** Register a fresh customer on register.htm (the story's route), leaving the page signed in as that customer. */
async function registerCustomer(page: Page, data: TestData, seed: Seed, label = 'new customer (register.htm)'): Promise<Customer> {
  return seed.create(label, async () => {
    const username = `hx${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    await gotoPage(page, 'logout.htm'); // TODO(harden) no leftover session
    await gotoPage(page, 'register.htm');
    const c = data.customer;
    const field = (name: string) => page.locator(`[id="customer.${name}"]`); // TODO(harden)
    await field('firstName').fill(c.firstName);
    await field('lastName').fill(c.lastName);
    await field('address.street').fill(c.street);
    await field('address.city').fill(c.city);
    await field('address.state').fill(c.state);
    await field('address.zipCode').fill(c.zipCode);
    await field('phoneNumber').fill(c.phone);
    await field('ssn').fill(c.ssn);
    await field('username').fill(username);
    await field('password').fill(c.password);
    await page.locator('#repeatedPassword').fill(c.password); // TODO(harden)
    await page.getByRole('button', { name: 'Register' }).click(); // TODO(harden)
    await expect(page.getByText(/account was created successfully/i), 'registration succeeded (precondition)').toBeVisible(); // TODO(harden)
    // G2: the customer id and the first account id, from the Accounts Overview page's own account list request.
    const listed = page.waitForResponse((r) => /\/customers\/\d+\/accounts/.test(r.url()) && r.ok()); // TODO(harden)
    await gotoPage(page, 'overview.htm'); // TODO(harden)
    const res = await listed;
    const customerId = Number(res.url().match(/customers\/(\d+)\/accounts/)?.[1]);
    const accounts = (await res.json()) as Account[];
    expect(customerId, 'customer id found (precondition)').toBeGreaterThan(0);
    expect(accounts.length, 'new customer has one account (precondition)').toBe(1);
    return { username, customerId, firstAccountId: Number(accounts[0].id) };
  });
}

async function listAccounts(api: Api, customerId: number): Promise<ApiResponse<Account[]>> {
  return api.get<Account[]>(EP.customerAccounts(customerId));
}

async function getAccount(api: Api, id: number): Promise<ApiResponse<Account>> {
  return api.get<Account>(EP.account(id));
}

async function balanceOf(api: Api, id: number): Promise<number> {
  const r = await getAccount(api, id);
  expect(r.status, `read account ${id} (precondition)`).toBe(200);
  return Number(r.body.balance);
}

function openViaService(api: Api, customerId: number, type: AccountType, fromAccountId: number): Promise<ApiResponse<Account>> {
  return api.post<Account>(EP.createAccount, { params: { customerId, newAccountType: TYPE_PARAM[type], fromAccountId } }); // TODO(harden) G1/G3
}

async function transfer(api: Api, fromAccountId: number, toAccountId: number, amountCents: number): Promise<void> {
  const r = await api.post(SEED_EP.transfer, { params: { fromAccountId, toAccountId, amount: (amountCents / 100).toFixed(2) } }); // TODO(harden)
  expect(r.status, 'transfer (precondition)').toBe(200);
}

/**
 * Give the customer a second account, optionally with an exact balance (G5): open it through the service,
 * then transfer the difference between it and the first account.
 */
async function addSecondAccount(api: Api, seed: Seed, cust: Customer, exactBalance?: number): Promise<number> {
  const label = exactBalance === undefined ? 'second account (POST /createAccount)' : `second account holding exactly ${exactBalance.toFixed(2)}`;
  return seed.create(label, async () => {
    const r = await openViaService(api, cust.customerId, 'CHECKING', cust.firstAccountId);
    expect(r.status, 'second account opened (precondition)').toBe(200);
    const id = Number(r.body.id);
    expect(id, 'second account id (precondition)').toBeGreaterThan(0);
    if (exactBalance !== undefined) {
      const diff = cents(await balanceOf(api, id)) - cents(exactBalance);
      if (diff > 0) await transfer(api, id, cust.firstAccountId, diff);
      if (diff < 0) await transfer(api, cust.firstAccountId, id, -diff);
      expect(cents(await balanceOf(api, id)), 'second account has the exact balance (precondition)').toBe(cents(exactBalance));
    }
    return id;
  });
}

/** The Open New Account page, with its funding account list loaded. */
async function openAccountPage(page: Page, fundingIds: number[]): Promise<void> {
  await gotoPage(page, 'openaccount.htm');
  for (const id of fundingIds) {
    await expect(fundingSelect(page).locator('option', { hasText: String(id) }), 'funding account list loaded').toHaveCount(1); // TODO(harden)
  }
}
const typeSelect = (page: Page) => page.locator('#type'); // TODO(harden)
const fundingSelect = (page: Page) => page.locator('#fromAccountId'); // TODO(harden)

async function openOnPage(page: Page, type: AccountType, fromAccountId: number): Promise<void> {
  await typeSelect(page).selectOption({ label: type });
  await fundingSelect(page).selectOption({ label: String(fromAccountId) });
  await page.getByRole('button', { name: 'Open New Account' }).click(); // TODO(harden)
}

/** The new account number link on the confirmation. */
const newAccountLink = (page: Page) => page.locator('#newAccountId'); // TODO(harden)

async function newAccountIdOnPage(page: Page): Promise<number> {
  await expect(newAccountLink(page), 'new account number shown').toHaveText(/^\d+$/);
  return Number(await newAccountLink(page).innerText());
}

/** The Accounts Overview row of an account (the row whose account link is the number). */
function overviewRow(page: Page, id: number) {
  return page.getByRole('row').filter({ has: page.getByRole('link', { name: String(id), exact: true }) }); // TODO(harden)
}
const overviewBalanceCell = (page: Page, id: number) => overviewRow(page, id).getByRole('cell').nth(1); // TODO(harden)

async function overviewBalance(page: Page, id: number): Promise<number> {
  await gotoPage(page, 'overview.htm');
  await expect(overviewRow(page, id), `account ${id} listed in the overview`).toHaveCount(1);
  return Number((await overviewBalanceCell(page, id).innerText()).replace(/[^0-9.-]/g, ''));
}

interface Tx { type?: string; amount?: number; description?: string }
async function transactions(api: Api, accountId: number): Promise<Tx[]> {
  const r = await api.get<Tx[]>(EP.transactions(accountId));
  return Array.isArray(r.body) ? r.body : [];
}
/** G8: Debit/Credit, amount and description as the transactions response represents them. */
const txMatches = (t: Tx, want: { type: string; amount: number; description: string }) =>
  t.type === want.type && cents(t.amount) === cents(want.amount) && t.description === want.description; // TODO(harden)

// ---- scenarios ------------------------------------------------------------------------------------

test.describe('PB-2 Open a new CHECKING or SAVINGS account online', () => {
  test('SCN-001: The Open New Account page offers CHECKING and SAVINGS, the customer\'s accounts and the minimum deposit', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let cust!: Customer; let second = 0;
    await journey.step('Given I registered a new customer who has a second account', async () => {
      cust = await registerCustomer(page, data, seed);
      second = await addSecondAccount(api, seed, cust);
    });
    await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId, second]); });
    await journey.step('Then the account type choices are exactly CHECKING and SAVINGS', async () => {
      await expect.soft(typeSelect(page).locator('option'), '[REQ AC-1] account types are exactly CHECKING and SAVINGS').toHaveText([...REQ.ACCOUNT_TYPES]);
    });
    await journey.step('And the funding account choices are exactly the customer\'s two accounts', async () => {
      const options = (await fundingSelect(page).locator('option').allInnerTexts()).map((s) => s.trim()).sort();
      expect.soft(options, '[REQ AC-1] funding choices are the customer\'s accounts').toEqual([String(cust.firstAccountId), String(second)].sort());
    });
    await journey.step('And the page shows "A minimum of $100.00 must be deposited into this account at time of opening."', async () => {
      await expect.soft(page.getByText(REQ.MIN_DEPOSIT_TEXT, { exact: false }), '[REQ AC-1] minimum opening deposit text').toBeVisible();
    });
  });

  test('SCN-002: Opening a SAVINGS account on the page confirms it and links to its details', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    let cust!: Customer; let newId = 0;
    await journey.step('Given I registered a new customer', async () => { cust = await registerCustomer(page, data, seed); });
    await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId]); });
    await journey.step('When I open a SAVINGS account funded from my first account', async () => { await openOnPage(page, 'SAVINGS', cust.firstAccountId); });
    await journey.step('Then the page shows "Account Opened!"', async () => {
      await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-2] "Account Opened!"').toBeVisible();
    });
    await journey.step('And the page shows "Congratulations, your account is now open."', async () => {
      await expect.soft(page.getByText(REQ.OPENED_TEXT, { exact: true }), '[REQ AC-2] congratulations text').toBeVisible();
    });
    await journey.step('And the page shows "Your new account number:" followed by the new account number as a link', async () => {
      const line = page.getByText(REQ.NEW_NUMBER_LABEL, { exact: false }); // TODO(harden)
      await expect(line, '[REQ AC-2] "Your new account number:" shown').toBeVisible();
      await expect(line.getByRole('link', { name: /^\d+$/ }), '[REQ AC-2] the new account number is a link').toBeVisible(); // TODO(harden)
      newId = await newAccountIdOnPage(page);
    });
    await journey.step('When I follow the new account number link', async () => { await newAccountLink(page).click(); });
    await journey.step('Then the account details page shows Account Type SAVINGS', async () => {
      await expect.soft(page.locator('#accountType'), '[REQ AC-2] details page: Account Type SAVINGS').toHaveText('SAVINGS'); // TODO(harden)
      void newId;
    });
    await journey.step('And the account details page shows a balance of $100.00', async () => {
      await expect.soft(page.locator('#balance'), '[REQ AC-2] details page: balance $100.00').toHaveText(REQ.OPENING_BALANCE_UI); // TODO(harden)
    });
  });

  test('SCN-003: After opening a CHECKING account on the page, Accounts Overview and the service show both balances', { tag: ['@AC-3', '@AC-6', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let cust!: Customer; let uiBefore = 0; let apiBefore = 0; let newId = 0;
    await journey.step('Given I registered a new customer', async () => { cust = await registerCustomer(page, data, seed); });
    await journey.step('And I noted the funding account\'s balance in Accounts Overview and through the service', async () => {
      uiBefore = await seed.step('funding balance in Accounts Overview', () => overviewBalance(page, cust.firstAccountId));
      apiBefore = await seed.step('funding balance via GET /accounts/{id}', () => balanceOf(api, cust.firstAccountId));
    });
    await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId]); });
    await journey.step('When I open a CHECKING account funded from my first account', async () => {
      await openOnPage(page, 'CHECKING', cust.firstAccountId);
      newId = await newAccountIdOnPage(page);
    });
    await journey.step('Then Accounts Overview lists the new account with a balance of $100.00', async () => {
      await gotoPage(page, 'overview.htm');
      await expect.soft(overviewRow(page, newId), '[REQ AC-3] new account listed in Accounts Overview').toHaveCount(1);
      await expect.soft(overviewBalanceCell(page, newId), '[REQ AC-3] new account balance $100.00 in Accounts Overview').toHaveText(REQ.OPENING_BALANCE_UI);
    });
    await journey.step('And Accounts Overview shows the funding account\'s balance lower by $100.00 than before', async () => {
      const after = Number((await overviewBalanceCell(page, cust.firstAccountId).innerText()).replace(/[^0-9.-]/g, ''));
      expect.soft(cents(after), '[REQ AC-3] funding balance in Accounts Overview lower by $100.00').toBe(cents(uiBefore) - cents(REQ.OPENING_DEPOSIT));
    });
    await journey.step('And GET /customers/{customerId}/accounts returns the new account with type CHECKING and a balance of 100.00', async () => {
      const r = await listAccounts(api, cust.customerId);
      const acc = (Array.isArray(r.body) ? r.body : []).find((a) => Number(a.id) === newId);
      expect.soft(acc?.type, '[REQ AC-3] API: new account type CHECKING').toBe('CHECKING');
      expect.soft(cents(acc?.balance), '[REQ AC-3] API: new account balance 100.00').toBe(cents(REQ.OPENING_DEPOSIT));
    });
    await journey.step('And GET /customers/{customerId}/accounts returns the funding account with its balance reduced by 100.00', async () => {
      const r = await listAccounts(api, cust.customerId);
      const acc = (Array.isArray(r.body) ? r.body : []).find((a) => Number(a.id) === cust.firstAccountId);
      expect.soft(cents(acc?.balance), '[REQ AC-3] API: funding balance reduced by 100.00').toBe(cents(apiBefore) - cents(REQ.OPENING_DEPOSIT));
    });
  });

  test('SCN-004: POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let cust!: Customer; let res!: ApiResponse<Account>; let got!: ApiResponse<Account>;
    await journey.step('Given I registered a new customer and know its customer id and first account id', async () => { cust = await registerCustomer(page, data, seed); });
    await journey.step('When I POST /createAccount for a CHECKING account funded from the first account', async () => {
      res = await openViaService(api, cust.customerId, 'CHECKING', cust.firstAccountId);
    });
    await journey.step('Then the response status is 200', async () => {
      expect(res.status, '[REQ AC-4] POST /createAccount → 200').toBe(REQ.STATUS_OK);
    });
    await journey.step('And the body is the new account with an id, the customer\'s customerId, type CHECKING and balance 100.00', async () => {
      expect.soft(Number(res.body?.id), '[REQ AC-4] body has the new account id').toBeGreaterThan(0);
      expect.soft(Number(res.body?.id), '[REQ AC-4] the id is a new account').not.toBe(cust.firstAccountId);
      expect.soft(Number(res.body?.customerId), '[REQ AC-4] body customerId').toBe(cust.customerId);
      expect.soft(res.body?.type, '[REQ AC-4] body type CHECKING').toBe('CHECKING');
      expect.soft(cents(res.body?.balance), '[REQ AC-4] body balance 100.00').toBe(cents(REQ.OPENING_DEPOSIT));
    });
    await journey.step('When I GET /accounts/{id} for the returned id', async () => { got = await getAccount(api, Number(res.body?.id)); });
    await journey.step('Then the response status is 200', async () => {
      expect(got.status, '[REQ AC-4] GET /accounts/{id} → 200').toBe(REQ.STATUS_OK);
    });
    await journey.step('And it returns the same id, customerId, type and balance', async () => {
      expect.soft({ id: Number(got.body?.id), customerId: Number(got.body?.customerId), type: got.body?.type, balance: cents(got.body?.balance) }, '[REQ AC-4] GET returns the same values')
        .toEqual({ id: Number(res.body?.id), customerId: Number(res.body?.customerId), type: res.body?.type, balance: cents(res.body?.balance) });
    });
  });

  test('SCN-005: Opening through the service records the transfer on both accounts', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let cust!: Customer; let newId = 0;
    await journey.step('Given I registered a new customer and know its customer id and first account id', async () => { cust = await registerCustomer(page, data, seed); });
    await journey.step('When I POST /createAccount for a SAVINGS account funded from the first account', async () => {
      const r = await openViaService(api, cust.customerId, 'SAVINGS', cust.firstAccountId);
      newId = Number(r.body?.id);
    });
    await journey.step('Then the funding account\'s transactions include a Debit of 100.00 "Funds Transfer Sent"', async () => {
      const txs = await transactions(api, cust.firstAccountId);
      expect.soft(txs.some((t) => txMatches(t, REQ.FUNDING_TX)), '[REQ AC-5] funding account: Debit 100.00 "Funds Transfer Sent"').toBe(true);
    });
    await journey.step('And the new account\'s transactions include a Credit of 100.00 "Funds Transfer Received"', async () => {
      const txs = await transactions(api, newId);
      expect.soft(txs.some((t) => txMatches(t, REQ.NEW_ACCOUNT_TX)), '[REQ AC-5] new account: Credit 100.00 "Funds Transfer Received"').toBe(true);
    });
  });

  test('SCN-006: Opening on the page records the transfer on both accounts', { tag: ['@AC-5', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, data, seed }) => {
    let cust!: Customer; let newId = 0;
    await journey.step('Given I registered a new customer', async () => { cust = await registerCustomer(page, data, seed); });
    await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId]); });
    await journey.step('When I open a CHECKING account funded from my first account', async () => {
      await openOnPage(page, 'CHECKING', cust.firstAccountId);
      newId = await newAccountIdOnPage(page);
    });
    await journey.step('Then the funding account\'s transactions include a Debit of 100.00 "Funds Transfer Sent"', async () => {
      const txs = await transactions(api, cust.firstAccountId);
      expect.soft(txs.some((t) => txMatches(t, REQ.FUNDING_TX)), '[REQ AC-5] funding account: Debit 100.00 "Funds Transfer Sent"').toBe(true);
    });
    await journey.step('And the new account\'s transactions include a Credit of 100.00 "Funds Transfer Received"', async () => {
      const txs = await transactions(api, newId);
      expect.soft(txs.some((t) => txMatches(t, REQ.NEW_ACCOUNT_TX)), '[REQ AC-5] new account: Credit 100.00 "Funds Transfer Received"').toBe(true);
    });
  });

  test('SCN-007: The service takes the opening deposit from the funding account the customer chose', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let cust!: Customer; let second = 0; let firstBefore = 0; let secondBefore = 0;
    await journey.step('Given I registered a new customer who has a second account', async () => {
      cust = await registerCustomer(page, data, seed);
      second = await addSecondAccount(api, seed, cust);
    });
    await journey.step('And I noted the balances of both accounts', async () => {
      firstBefore = await seed.step('first account balance', () => balanceOf(api, cust.firstAccountId));
      secondBefore = await seed.step('second account balance', () => balanceOf(api, second));
    });
    await journey.step('When I POST /createAccount for a SAVINGS account funded from the second account', async () => {
      await openViaService(api, cust.customerId, 'SAVINGS', second);
    });
    await journey.step('Then the second account\'s balance is its previous balance minus 100.00', async () => {
      expect.soft(cents(await balanceOf(api, second)), '[REQ AC-6] R4/R7: chosen funding account debited 100.00').toBe(cents(secondBefore) - cents(REQ.OPENING_DEPOSIT));
    });
    await journey.step('And the first account\'s balance is unchanged', async () => {
      expect.soft(cents(await balanceOf(api, cust.firstAccountId)), '[REQ AC-6] R4: the other account is not debited').toBe(cents(firstBefore));
    });
  });

  test('SCN-008: The page takes the opening deposit from the funding account the customer chose', { tag: ['@AC-6', '@type:functional', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let cust!: Customer; let second = 0; let firstBefore = 0; let secondBefore = 0;
    await journey.step('Given I registered a new customer who has a second account', async () => {
      cust = await registerCustomer(page, data, seed);
      second = await addSecondAccount(api, seed, cust);
    });
    await journey.step('And I noted the balances of both accounts', async () => {
      firstBefore = await seed.step('first account balance', () => balanceOf(api, cust.firstAccountId));
      secondBefore = await seed.step('second account balance', () => balanceOf(api, second));
    });
    await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId, second]); });
    await journey.step('When I open a CHECKING account funded from the second account', async () => { await openOnPage(page, 'CHECKING', second); });
    await journey.step('Then the page shows "Account Opened!"', async () => {
      await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-6] "Account Opened!"').toBeVisible();
    });
    await journey.step('And the second account\'s balance is its previous balance minus 100.00', async () => {
      await expect.poll(async () => cents(await balanceOf(api, second)), { message: '[REQ AC-6] R4/R7: chosen funding account debited 100.00', timeout: 10_000 })
        .toBe(cents(secondBefore) - cents(REQ.OPENING_DEPOSIT));
    });
    await journey.step('And the first account\'s balance is unchanged', async () => {
      expect.soft(cents(await balanceOf(api, cust.firstAccountId)), '[REQ AC-6] R4: the other account is not debited').toBe(cents(firstBefore));
    });
  });

  REQ.R5_SERVICE_ROWS.forEach((row, i) => {
    test(`SCN-009.${i + 1}: The service opens an account only from a funding account holding at least 100.00 (${row.label})`, { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
      let cust!: Customer; let funding = 0; let countBefore = 0;
      await journey.step(`Given I registered a new customer who has a funding account holding exactly ${row.label}`, async () => {
        cust = await registerCustomer(page, data, seed);
        funding = await addSecondAccount(api, seed, cust, row.fundingBalance);
        countBefore = await seed.step('number of accounts before', async () => (await listAccounts(api, cust.customerId)).body.length);
      });
      await journey.step('When I POST /createAccount for a CHECKING account funded from that account', async () => {
        await openViaService(api, cust.customerId, 'CHECKING', funding);
      });
      await journey.step(`Then the new account is ${row.opened ? 'opened' : 'not opened'}`, async () => {
        const r = await listAccounts(api, cust.customerId);
        expect.soft(Array.isArray(r.body) ? r.body.length : -1, `[REQ AC-6] R5: funding ${row.label} → ${row.opened ? 'opened' : 'not opened'}`)
          .toBe(countBefore + (row.opened ? 1 : 0));
      });
      await journey.step(`And the funding account's balance is ${row.balanceAfterLabel}`, async () => {
        expect.soft(cents(await balanceOf(api, funding)), `[REQ AC-6] R5/R7: funding balance after is ${row.balanceAfterLabel}`).toBe(cents(row.balanceAfter));
      });
    });
  });

  REQ.R5_PAGE_ROWS.forEach((row, i) => {
    test(`SCN-010.${i + 1}: The page opens an account only from a funding account holding at least 100.00 (${row.label})`, { tag: ['@AC-6', '@type:boundary', '@layer:e2e', '@P1', '@needs-clarification'] }, async ({ page, api, journey, data, seed }) => {
      let cust!: Customer; let funding = 0; let countBefore = 0;
      await journey.step(`Given I registered a new customer who has a funding account holding exactly ${row.label}`, async () => {
        cust = await registerCustomer(page, data, seed);
        funding = await addSecondAccount(api, seed, cust, row.fundingBalance);
        countBefore = await seed.step('number of accounts before', async () => (await listAccounts(api, cust.customerId)).body.length);
      });
      await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId, funding]); });
      await journey.step('When I open a SAVINGS account funded from that account', async () => { await openOnPage(page, 'SAVINGS', funding); });
      await journey.step(`Then the page shows ${row.pageOutcome}`, async () => {
        if (row.opened) {
          await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-6] R5: funding 100.00 → "Account Opened!"').toBeVisible();
        } else {
          // G6: the error's wording is not stated — only that an error is shown instead of the opening.
          await expect.soft(page.getByText(/error/i).first(), '[REQ AC-6] R5: funding 99.99 → an error is shown').toBeVisible(); // TODO(harden)
          await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-6] R5: funding 99.99 → no "Account Opened!"').toBeHidden();
        }
      });
      await journey.step(`And the customer's accounts are ${row.accountsAfter}`, async () => {
        await expect.poll(async () => { const r = await listAccounts(api, cust.customerId); return Array.isArray(r.body) ? r.body.length : -1; },
          { message: `[REQ AC-6] R5: accounts ${row.accountsAfter}`, timeout: 10_000 }).toBe(countBefore + (row.opened ? 1 : 0));
      });
      await journey.step(`And the funding account's balance is ${row.balanceAfterLabel}`, async () => {
        expect.soft(cents(await balanceOf(api, funding)), `[REQ AC-6] R5/R7: funding balance after is ${row.balanceAfterLabel}`).toBe(cents(row.balanceAfter));
      });
    });
  });

  test('SCN-011: The service does not fund a new account from another customer\'s account', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1', '@needs-clarification'] }, async ({ page, api, journey, data, seed }) => {
    let a!: Customer; let b!: Customer; let bBefore = 0; let aCountBefore = 0;
    await journey.step('Given I registered customer A and customer B', async () => {
      b = await registerCustomer(page, data, seed, 'customer B (register.htm)');
      a = await registerCustomer(page, data, seed, 'customer A (register.htm)');
      aCountBefore = await seed.step('customer A account count', async () => (await listAccounts(api, a.customerId)).body.length);
    });
    await journey.step('And I noted the balance of customer B\'s account', async () => {
      bBefore = await seed.step('customer B balance', () => balanceOf(api, b.firstAccountId));
    });
    await journey.step('When I POST /createAccount for customer A funded from customer B\'s account', async () => {
      await openViaService(api, a.customerId, 'CHECKING', b.firstAccountId);
    });
    await journey.step('Then no new account is opened for customer A', async () => {
      const r = await listAccounts(api, a.customerId);
      expect.soft(Array.isArray(r.body) ? r.body.length : -1, '[REQ AC-6] R4: no account opened from another customer\'s account').toBe(aCountBefore);
    });
    await journey.step('And customer B\'s account balance is unchanged', async () => {
      expect.soft(cents(await balanceOf(api, b.firstAccountId)), '[REQ AC-6] R4: another customer\'s account is not debited').toBe(cents(bBefore));
    });
  });
});
