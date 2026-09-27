/**
 * Held-out acceptance tests for PB-3 — "Transfer funds between my own accounts".
 * Written from evaluations/PB-3/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { test, expect, gotoPage, uniqueId, type Api, type ApiResponse, type Seed, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from PB-3 (never edit during hardening)
const REQ = {
  STATUS: { OK: 200, BAD_REQUEST: 400 },
  AC1: {
    AMOUNT: '25.50',
    DELTA: 25.5,
    COMPLETE: 'Transfer Complete!',
    SENTENCE: (a: string, b: string) => `$25.50 has been transferred from account #${a} to account #${b}.`,
  },
  AC2: {
    AMOUNT: '12.34',
    DELTA: 12.34,
    TEXT: (a: string, b: string) => `Successfully transferred $12.34 from account #${a} to account #${b}`,
  },
  AC3: {
    AMOUNT: '25.50',
    DEBIT: { type: 'Debit', amount: 25.5, description: 'Funds Transfer Sent' },
    CREDIT: { type: 'Credit', amount: 25.5, description: 'Funds Transfer Received' },
    ACTIVITY_DESCRIPTION: 'Funds Transfer Sent',
    DEBIT_COLUMN: 'Debit (-)',
    ACTIVITY_DEBIT: '$25.50',
  },
  AC4: [
    { amount: '', message: 'The amount cannot be empty.' },
    { amount: 'abc', message: 'Please enter a valid amount.' },
  ],
  AC5: { AMOUNTS: ['0', '-10.00'], COMPLETE: 'Transfer Complete!', SUCCESS_PREFIX: /^\s*Successfully transferred/ },
  AC6: {
    AMOUNT: '1000.00',
    DELTA: 1000,
    LIMIT: 1000,
    COMPLETE: 'Transfer Complete!',
    // "same confirmation as any other transfer" (AC-2 sentence for 1000.00); thousands separator not stated → both accepted (ASSUMPTION)
    TEXT: (a: string, b: string) => new RegExp(`^Successfully transferred \\$1,?000\\.00 from account #${a} to account #${b}$`),
  },
  AC7: {
    TO: '99999999',
    AMOUNT: '5.00',
    TEXT: (a: string) => `Could not find account number ${a} and/or 99999999`,
  },
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** POST /transfer */ transfer: '/transfer',
  /** GET /accounts/{accountId} */ accountsByAccountId: (accountId: string | number) => `/accounts/${accountId}`,
  /** GET /accounts/{accountId}/transactions */ accountsTransactionsByAccountId: (accountId: string | number) => `/accounts/${accountId}/transactions`,
};

interface Customer { username: string; A: string; B: string }
interface Tx { type?: string; amount?: number | string; description?: string }

/** Money as shown on a page ("$1,234.56", "-$10.00", "($10.00)") → number. */
function money(text: string): number {
  const t = text.replace(/\s/g, '');
  const neg = /^-|^\(.*\)$|-\$/.test(t);
  const n = Number(t.replace(/[^0-9.]/g, ''));
  return neg ? -n : n;
}

/** Given a newly registered customer who owns accounts A and B (UI registration + "Open New Account"). */
async function newCustomer(page: Page, seed: Seed, data: TestData): Promise<Customer> {
  return seed.create('customer who owns accounts A and B (register + Open New Account)', async () => {
    const username = uniqueId('pb3').slice(0, 20);
    const c = data.customer;
    // Mechanics: the AUT sits behind a rate-limiting CDN; images are not part of any criterion, so skip them to keep traffic low.
    await page.route(/\.(png|jpe?g|gif|ico|svg)(\?.*)?$/i, (r) => r.abort());
    await gotoPage(page, 'register.htm');
    await page.locator('[id="customer.firstName"]').fill(c.firstName);
    await page.locator('[id="customer.lastName"]').fill(c.lastName);
    await page.locator('[id="customer.address.street"]').fill(c.street);
    await page.locator('[id="customer.address.city"]').fill(c.city);
    await page.locator('[id="customer.address.state"]').fill(c.state);
    await page.locator('[id="customer.address.zipCode"]').fill(c.zipCode);
    await page.locator('[id="customer.phoneNumber"]').fill(c.phone);
    await page.locator('[id="customer.ssn"]').fill(c.ssn);
    await page.locator('[id="customer.username"]').fill(username);
    await page.locator('[id="customer.password"]').fill(data.password);
    await page.locator('#repeatedPassword').fill(data.password);
    await page.getByRole('button', { name: 'Register', exact: true }).click();
    await expect(page.getByText('Your account was created successfully'), 'registered and signed in (seed)').toBeVisible({ timeout: 15_000 });

    // A = the customer's first account (Accounts Overview)
    await gotoPage(page, 'overview.htm');
    const firstLink = page.locator('#accountTable').getByRole('link').first();
    await expect(firstLink, 'Accounts Overview lists an account (seed)').toHaveText(/^\d+$/, { timeout: 15_000 });
    const A = (await firstLink.innerText()).trim();
    expect(A, 'account A found (seed)').toMatch(/^\d+$/);

    // B = opened with "Open New Account"
    await gotoPage(page, 'openaccount.htm');
    await expect(page.locator(`#fromAccountId option[value="${A}"]`), 'source account listed (seed)').toBeAttached({ timeout: 15_000 });
    await page.getByRole('button', { name: 'Open New Account', exact: true }).click();
    await expect(page.locator('#newAccountId'), 'new account number shown (seed)').toHaveText(/^\d+$/, { timeout: 15_000 });
    const B = (await page.locator('#newAccountId').innerText()).trim();
    expect(B, 'account B opened (seed)').toMatch(/^\d+$/);
    expect(B, 'B differs from A (seed)').not.toBe(A);
    return { username, A, B };
  });
}

async function balance(api: Api, id: string): Promise<number> {
  const r = await api.get<{ balance?: number | string }>(EP.accountsByAccountId(id)); // no auth (G4), field `balance` (G7)
  expect(r.status, `GET /accounts/${id} (read balance)`).toBe(200);
  return Number(r.body.balance);
}

async function balancesBefore(api: Api, seed: Seed, ids: string[]): Promise<number[]> {
  return seed.step('read balances before the action (GET /accounts/{accountId})', async () => {
    const out: number[] = [];
    for (const id of ids) out.push(await balance(api, id));
    return out;
  });
}

/** Accounts Overview: balance per account number and the total. */
async function readOverview(page: Page): Promise<{ balances: Record<string, number>; total: number }> {
  await gotoPage(page, 'overview.htm');
  const table = page.locator('#accountTable');
  await expect(table.getByRole('row').filter({ hasText: /^\s*Total/ })).toBeVisible({ timeout: 15_000 });
  await expect(table.getByRole('link').first()).toBeVisible();
  const balances: Record<string, number> = {};
  let total = NaN;
  for (const row of await table.getByRole('row').all()) {
    const cells = (await row.getByRole('cell').allInnerTexts()).map((s) => s.trim());
    if (!cells.length) continue;
    if (/^\d+$/.test(cells[0])) balances[cells[0]] = money(cells[1]);
    else if (/total/i.test(cells[0])) total = money(cells[1]);
  }
  return { balances, total };
}

async function openTransferPage(page: Page): Promise<void> {
  await gotoPage(page, 'transfer.htm');
  await expect(page.getByRole('button', { name: 'Transfer', exact: true })).toBeVisible();
  await expect(page.locator('#toAccountId:has(option)')).toBeVisible({ timeout: 15_000 });
}

async function fillTransfer(page: Page, amount: string, from: string, to: string): Promise<void> {
  await expect(page.locator(`#toAccountId option[value="${to}"]`)).toBeAttached({ timeout: 15_000 });
  await page.locator('#amount').fill(amount);
  await page.locator('#fromAccountId').selectOption(from);
  await page.locator('#toAccountId').selectOption(to);
  await page.getByRole('button', { name: 'Transfer', exact: true }).click();
}

function transfer(api: Api, from: string, to: string, amount: string): Promise<ApiResponse<unknown>> {
  return api.post(EP.transfer, { params: { fromAccountId: from, toAccountId: to, amount } }); // query string, no auth (G3/G4)
}

async function transactions(api: Api, id: string): Promise<{ type?: string; amount: number; description?: string }[]> {
  const r = await api.get<Tx[]>(EP.accountsTransactionsByAccountId(id)); // fields type/amount/description (G7)
  expect(r.status, `GET /accounts/${id}/transactions (read)`).toBe(200);
  const list = Array.isArray(r.body) ? r.body : [];
  return list.map((t) => ({ type: t.type, amount: Number(t.amount), description: t.description }));
}

/** Bounded wait for an unwanted success confirmation: true when it appeared within the window. */
async function appears(page: Page, text: string, ms = 5_000): Promise<boolean> {
  return page.getByRole('heading', { name: text, exact: true }).waitFor({ state: 'visible', timeout: ms }).then(() => true, () => false);
}

/**
 * Mechanics, not oracle: the AUT sits behind a CDN that rate-limits bursts (Cloudflare Error 1015 / HTTP 429 after
 * ~14 back-to-back tests). Leave at least PACE_MS between the start of one test and the end of the previous one.
 * The timestamp lives in a file so it survives Playwright's worker restart after a failed test.
 */
const PACE_MS = Number(process.env.PB3_PACE_MS ?? 12_000);
const PACE_FILE = path.join(os.tmpdir(), 'heldout-pb3-pace.txt');
test.beforeEach(async () => {
  const last = Number(fs.existsSync(PACE_FILE) ? fs.readFileSync(PACE_FILE, 'utf8') : 0) || 0;
  const wait = Math.min(PACE_MS, last + PACE_MS - Date.now());
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
});
test.afterEach(async () => { fs.writeFileSync(PACE_FILE, String(Date.now())); });

test.describe('PB-3 Transfer funds between my own accounts', () => {
  test('SCN-001: The customer transfers 25.50 from A to B on the Transfer Funds page', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    let c!: Customer;
    let before!: { balances: Record<string, number>; total: number };
    await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
    await journey.step('And Accounts Overview shows the balances of A and B and the total', async () => {
      before = await seed.step('read Accounts Overview before the transfer', () => readOverview(page));
      expect(Number.isFinite(before.balances[c.A]) && Number.isFinite(before.balances[c.B]) && Number.isFinite(before.total), 'overview readable (precondition)').toBe(true);
    });
    await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
    await journey.step('When I transfer 25.50 from A to B', () => fillTransfer(page, REQ.AC1.AMOUNT, c.A, c.B));
    await journey.step('Then the page shows "Transfer Complete!"', async () => {
      await expect(page.getByRole('heading', { name: REQ.AC1.COMPLETE, exact: true }), '[REQ AC-1] "Transfer Complete!" shown').toBeVisible();
    });
    await journey.step('And the page shows "$25.50 has been transferred from account #<A> to account #<B>."', async () => {
      await expect(page.getByText(REQ.AC1.SENTENCE(c.A, c.B), { exact: true }), '[REQ AC-1] transfer sentence shown').toBeVisible();
    });
    let after!: { balances: Record<string, number>; total: number };
    await journey.step('And Accounts Overview shows the balance of A lower by $25.50', async () => {
      after = await readOverview(page);
      expect.soft(after.balances[c.A], '[REQ AC-1] Accounts Overview: balance of A lower by $25.50').toBeCloseTo(before.balances[c.A] - REQ.AC1.DELTA, 2);
    });
    await journey.step('And Accounts Overview shows the balance of B higher by $25.50', async () => {
      expect.soft(after.balances[c.B], '[REQ AC-1] Accounts Overview: balance of B higher by $25.50').toBeCloseTo(before.balances[c.B] + REQ.AC1.DELTA, 2);
    });
    await journey.step('And the total shown on Accounts Overview is unchanged', async () => {
      expect.soft(after.total, '[REQ AC-1] Accounts Overview: total unchanged').toBeCloseTo(before.total, 2);
    });
  });

  test('SCN-002: The REST service transfers 12.34 from A to B', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    let a0 = 0; let b0 = 0;
    let res!: ApiResponse<unknown>;
    await journey.step('Given a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
    await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
    await journey.step('When the service is called with fromAccountId A, toAccountId B and amount 12.34', async () => { res = await transfer(api, c.A, c.B, REQ.AC2.AMOUNT); });
    await journey.step('Then it answers 200', async () => {
      expect.soft(res.status, '[REQ AC-2] POST /transfer answers 200').toBe(REQ.STATUS.OK);
    });
    await journey.step('And the body is the text "Successfully transferred $12.34 from account #<A> to account #<B>"', async () => {
      expect.soft(res.text.trim(), '[REQ AC-2] POST /transfer body is the confirmation text').toBe(REQ.AC2.TEXT(c.A, c.B));
    });
    await journey.step('And GET /accounts/<A> returns a balance lower by 12.34', async () => {
      expect.soft(await balance(api, c.A), '[REQ AC-2] GET /accounts/<A> balance lower by 12.34').toBeCloseTo(a0 - REQ.AC2.DELTA, 2);
    });
    await journey.step('And GET /accounts/<B> returns a balance higher by 12.34', async () => {
      expect.soft(await balance(api, c.B), '[REQ AC-2] GET /accounts/<B> balance higher by 12.34').toBeCloseTo(b0 + REQ.AC2.DELTA, 2);
    });
  });

  test('SCN-003: A transfer made on the page is listed as a transaction on both accounts', { tag: ['@AC-3', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
    await journey.step('And I transferred 25.50 from A to B on the Transfer Funds page', async () => {
      await openTransferPage(page);
      await fillTransfer(page, REQ.AC3.AMOUNT, c.A, c.B);
      await expect(page.getByRole('heading', { name: 'Transfer Complete!', exact: true }), 'transfer done (precondition; asserted by AC-1)').toBeVisible();
    });
    await journey.step('Then GET /accounts/<A>/transactions contains a "Debit" of 25.50 described "Funds Transfer Sent"', async () => {
      expect.soft(await transactions(api, c.A), '[REQ AC-3] GET /accounts/<A>/transactions contains Debit 25.50 "Funds Transfer Sent"').toContainEqual(REQ.AC3.DEBIT);
    });
    await journey.step('And GET /accounts/<B>/transactions contains a "Credit" of 25.50 described "Funds Transfer Received"', async () => {
      expect.soft(await transactions(api, c.B), '[REQ AC-3] GET /accounts/<B>/transactions contains Credit 25.50 "Funds Transfer Received"').toContainEqual(REQ.AC3.CREDIT);
    });
    await journey.step('And the Account Activity of A lists "Funds Transfer Sent" with $25.50 in the Debit (-) column', async () => {
      await gotoPage(page, `activity.htm?id=${c.A}`);
      const table = page.locator('#transactionTable');
      await expect(table.getByRole('row').nth(1)).toBeVisible({ timeout: 15_000 });
      const headers = (await table.getByRole('columnheader').allInnerTexts()).map((h) => h.trim());
      const col = headers.findIndex((h) => h === REQ.AC3.DEBIT_COLUMN);
      expect.soft(col, '[REQ AC-3] Account Activity has a "Debit (-)" column').toBeGreaterThanOrEqual(0);
      // A also has the "Funds Transfer Sent" of opening B: pick the row of this transfer (the one with a $25.50 cell)
      const row = table.getByRole('row').filter({ hasText: REQ.AC3.ACTIVITY_DESCRIPTION }).filter({ has: page.getByRole('cell', { name: REQ.AC3.ACTIVITY_DEBIT, exact: true }) });
      await expect.soft(row.first().getByRole('cell').nth(col), '[REQ AC-3] Account Activity of A: "Funds Transfer Sent" with $25.50 in Debit (-)').toHaveText(REQ.AC3.ACTIVITY_DEBIT);
    });
  });

  REQ.AC4.forEach((row, i) => {
    test(`SCN-004.${i + 1}: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "${row.amount}")`, { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, api, journey, data, seed }) => {
      let c!: Customer;
      let a0 = 0; let b0 = 0;
      await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
      await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
      await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
      await journey.step(`When I enter "${row.amount}" as the amount and press Transfer`, () => fillTransfer(page, row.amount, c.A, c.B));
      await journey.step(`Then the Transfer Funds form stays on screen with the message "${row.message}"`, async () => {
        await expect.soft(page.getByText(row.message, { exact: true }), `[REQ AC-4] message "${row.message}" shown`).toBeVisible();
        await expect.soft(page.getByRole('button', { name: 'Transfer', exact: true }), '[REQ AC-4] Transfer Funds form stays on screen').toBeVisible();
      });
      await journey.step('And the balances of A and B do not change', async () => {
        expect.soft(await balance(api, c.A), '[REQ AC-4] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
        expect.soft(await balance(api, c.B), '[REQ AC-4] GET /accounts/<B> balance unchanged').toBeCloseTo(b0, 2);
      });
    });
  });

  REQ.AC5.AMOUNTS.forEach((amount, i) => {
    test(`SCN-005.${i + 1}: A zero or negative amount is refused on the Transfer Funds page (${amount})`, { tag: ['@AC-5', '@type:boundary', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
      let c!: Customer;
      let a0 = 0; let b0 = 0;
      await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
      await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
      await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
      await journey.step(`When I transfer ${amount} from A to B`, () => fillTransfer(page, amount, c.A, c.B));
      await journey.step('Then the transfer is refused (the page does not show "Transfer Complete!") — bounded 5 s wait for the confirmation', async () => {
        expect.soft(await appears(page, REQ.AC5.COMPLETE), '[REQ AC-5] page does not show "Transfer Complete!"').toBe(false);
      });
      await journey.step('And the balances of A and B do not change', async () => {
        expect.soft(await balance(api, c.A), '[REQ AC-5] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
        expect.soft(await balance(api, c.B), '[REQ AC-5] GET /accounts/<B> balance unchanged').toBeCloseTo(b0, 2);
      });
    });
  });

  REQ.AC5.AMOUNTS.forEach((amount, i) => {
    test(`SCN-006.${i + 1}: A zero or negative amount is refused by the REST service (${amount})`, { tag: ['@AC-5', '@type:boundary', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
      let c!: Customer;
      let a0 = 0; let b0 = 0;
      let res!: ApiResponse<unknown>;
      await journey.step('Given a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
      await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
      await journey.step(`When the service is called with fromAccountId A, toAccountId B and amount ${amount}`, async () => { res = await transfer(api, c.A, c.B, amount); });
      await journey.step('Then the transfer is refused (the service does not answer with the success confirmation of AC-2)', async () => {
        expect.soft(res.text, '[REQ AC-5] POST /transfer does not answer with the success confirmation').not.toMatch(REQ.AC5.SUCCESS_PREFIX);
      });
      await journey.step('And the balances of A and B do not change', async () => {
        expect.soft(await balance(api, c.A), '[REQ AC-5] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
        expect.soft(await balance(api, c.B), '[REQ AC-5] GET /accounts/<B> balance unchanged').toBeCloseTo(b0, 2);
      });
    });
  });

  test('SCN-007: The REST service completes a transfer of 1000.00, more than the balance of A', { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    let a0 = 0; let b0 = 0;
    let res!: ApiResponse<unknown>;
    await journey.step('Given a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
    await journey.step('And the balance of A is lower than 1000.00', async () => {
      [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]);
      expect(a0, 'balance of A is lower than 1000.00 (precondition)').toBeLessThan(REQ.AC6.LIMIT);
    });
    await journey.step('When the service is called with fromAccountId A, toAccountId B and amount 1000.00', async () => { res = await transfer(api, c.A, c.B, REQ.AC6.AMOUNT); });
    await journey.step('Then it answers 200 with the same confirmation as any other transfer', async () => {
      expect.soft(res.status, '[REQ AC-6] POST /transfer answers 200').toBe(REQ.STATUS.OK);
      expect.soft(res.text.trim(), '[REQ AC-6] POST /transfer body is the transfer confirmation for 1000.00').toMatch(REQ.AC6.TEXT(c.A, c.B));
    });
    await journey.step('And the balance of A goes negative by the difference', async () => {
      expect.soft(await balance(api, c.A), '[REQ AC-6] GET /accounts/<A> balance = before − 1000.00 (negative)').toBeCloseTo(a0 - REQ.AC6.DELTA, 2);
    });
    await journey.step('And B is credited with the full amount', async () => {
      expect.soft(await balance(api, c.B), '[REQ AC-6] GET /accounts/<B> balance = before + 1000.00').toBeCloseTo(b0 + REQ.AC6.DELTA, 2);
    });
  });

  test('SCN-008: The Transfer Funds page completes a transfer of 1000.00, more than the balance of A', { tag: ['@AC-6', '@type:boundary', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    let a0 = 0; let b0 = 0;
    await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
    await journey.step('And the balance of A is lower than 1000.00', async () => {
      [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]);
      expect(a0, 'balance of A is lower than 1000.00 (precondition)').toBeLessThan(REQ.AC6.LIMIT);
    });
    await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
    await journey.step('When I transfer 1000.00 from A to B', () => fillTransfer(page, REQ.AC6.AMOUNT, c.A, c.B));
    await journey.step('Then the page shows "Transfer Complete!"', async () => {
      await expect.soft(page.getByRole('heading', { name: REQ.AC6.COMPLETE, exact: true }), '[REQ AC-6] "Transfer Complete!" shown').toBeVisible();
    });
    await journey.step('And the balance of A goes negative by the difference', async () => {
      expect.soft(await balance(api, c.A), '[REQ AC-6] GET /accounts/<A> balance = before − 1000.00 (negative)').toBeCloseTo(a0 - REQ.AC6.DELTA, 2);
    });
    await journey.step('And B is credited with the full amount', async () => {
      expect.soft(await balance(api, c.B), '[REQ AC-6] GET /accounts/<B> balance = before + 1000.00').toBeCloseTo(b0 + REQ.AC6.DELTA, 2);
    });
  });

  test('SCN-009: The REST service refuses an unknown destination account', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P2'] }, async ({ page, api, journey, data, seed }) => {
    let c!: Customer;
    let a0 = 0;
    let res!: ApiResponse<unknown>;
    await journey.step('Given a newly registered customer who owns account A', async () => { c = await newCustomer(page, seed, data); });
    await journey.step('And the balance of A is read with GET /accounts/{accountId}', async () => { [a0] = await balancesBefore(api, seed, [c.A]); });
    await journey.step('When the service is called with fromAccountId A, toAccountId 99999999 and amount 5.00', async () => { res = await transfer(api, c.A, REQ.AC7.TO, REQ.AC7.AMOUNT); });
    await journey.step('Then it answers 400', async () => {
      expect.soft(res.status, '[REQ AC-7] POST /transfer answers 400').toBe(REQ.STATUS.BAD_REQUEST);
    });
    await journey.step('And the body is the text "Could not find account number <A> and/or 99999999"', async () => {
      expect.soft(res.text.trim(), '[REQ AC-7] POST /transfer body is the not-found text').toBe(REQ.AC7.TEXT(c.A));
    });
    await journey.step('And the balance of A does not change', async () => {
      expect.soft(await balance(api, c.A), '[REQ AC-7] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
    });
  });
});
