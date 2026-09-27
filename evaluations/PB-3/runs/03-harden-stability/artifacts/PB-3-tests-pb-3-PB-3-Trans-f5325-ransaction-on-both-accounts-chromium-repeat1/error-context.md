# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-3\tests\pb-3.spec.ts >> PB-3 Transfer funds between my own accounts >> SCN-003: A transfer made on the page is listed as a transaction on both accounts
- Location: evaluations\PB-3\tests\pb-3.spec.ts:222:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Transfer', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'Transfer', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Transfer', exact: true })

```

```yaml
- banner:
  - heading "Error 1015" [level=1]
  - text: "Ray ID: a41a9d80491ccd7c • 2026-09-27 12:47:08 UTC"
  - heading "You are being rate limited" [level=2]
- heading "What happened?" [level=2]
- paragraph: The owner of this website (parabank.parasoft.com) has banned you temporarily from accessing this website.
- paragraph:
  - text: Please see
  - link "https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/":
    - /url: https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/
  - text: for more details.
- text: Was this page helpful?
- button "Yes"
- button "No"
- paragraph:
  - text: "Cloudflare Ray ID:"
  - strong: a41a9d80491ccd7c
  - text: "• Your IP:"
  - button "Click to reveal"
  - text: • Performance & security by
  - link "Cloudflare":
    - /url: https://www.cloudflare.com/5xx-error-landing
```

# Test source

```ts
  43  |   AC7: {
  44  |     TO: '99999999',
  45  |     AMOUNT: '5.00',
  46  |     TEXT: (a: string) => `Could not find account number ${a} and/or 99999999`,
  47  |   },
  48  | } as const;
  49  | // @req-constants-end
  50  | 
  51  | // Endpoints exactly as declared in the requirement.
  52  | const EP = {
  53  |   /** POST /transfer */ transfer: '/transfer',
  54  |   /** GET /accounts/{accountId} */ accountsByAccountId: (accountId: string | number) => `/accounts/${accountId}`,
  55  |   /** GET /accounts/{accountId}/transactions */ accountsTransactionsByAccountId: (accountId: string | number) => `/accounts/${accountId}/transactions`,
  56  | };
  57  | 
  58  | interface Customer { username: string; A: string; B: string }
  59  | interface Tx { type?: string; amount?: number | string; description?: string }
  60  | 
  61  | /** Money as shown on a page ("$1,234.56", "-$10.00", "($10.00)") → number. */
  62  | function money(text: string): number {
  63  |   const t = text.replace(/\s/g, '');
  64  |   const neg = /^-|^\(.*\)$|-\$/.test(t);
  65  |   const n = Number(t.replace(/[^0-9.]/g, ''));
  66  |   return neg ? -n : n;
  67  | }
  68  | 
  69  | /** Given a newly registered customer who owns accounts A and B (UI registration + "Open New Account"). */
  70  | async function newCustomer(page: Page, seed: Seed, data: TestData): Promise<Customer> {
  71  |   return seed.create('customer who owns accounts A and B (register + Open New Account)', async () => {
  72  |     const username = uniqueId('pb3').slice(0, 20);
  73  |     const c = data.customer;
  74  |     // Mechanics: the AUT sits behind a rate-limiting CDN; images are not part of any criterion, so skip them to keep traffic low.
  75  |     await page.route(/\.(png|jpe?g|gif|ico|svg)(\?.*)?$/i, (r) => r.abort());
  76  |     await gotoPage(page, 'register.htm');
  77  |     await page.locator('[id="customer.firstName"]').fill(c.firstName);
  78  |     await page.locator('[id="customer.lastName"]').fill(c.lastName);
  79  |     await page.locator('[id="customer.address.street"]').fill(c.street);
  80  |     await page.locator('[id="customer.address.city"]').fill(c.city);
  81  |     await page.locator('[id="customer.address.state"]').fill(c.state);
  82  |     await page.locator('[id="customer.address.zipCode"]').fill(c.zipCode);
  83  |     await page.locator('[id="customer.phoneNumber"]').fill(c.phone);
  84  |     await page.locator('[id="customer.ssn"]').fill(c.ssn);
  85  |     await page.locator('[id="customer.username"]').fill(username);
  86  |     await page.locator('[id="customer.password"]').fill(data.password);
  87  |     await page.locator('#repeatedPassword').fill(data.password);
  88  |     await page.getByRole('button', { name: 'Register', exact: true }).click();
  89  |     await expect(page.getByText('Your account was created successfully'), 'registered and signed in (seed)').toBeVisible({ timeout: 15_000 });
  90  | 
  91  |     // A = the customer's first account (Accounts Overview)
  92  |     await gotoPage(page, 'overview.htm');
  93  |     const firstLink = page.locator('#accountTable').getByRole('link').first();
  94  |     await expect(firstLink, 'Accounts Overview lists an account (seed)').toHaveText(/^\d+$/, { timeout: 15_000 });
  95  |     const A = (await firstLink.innerText()).trim();
  96  |     expect(A, 'account A found (seed)').toMatch(/^\d+$/);
  97  | 
  98  |     // B = opened with "Open New Account"
  99  |     await gotoPage(page, 'openaccount.htm');
  100 |     await expect(page.locator(`#fromAccountId option[value="${A}"]`), 'source account listed (seed)').toBeAttached({ timeout: 15_000 });
  101 |     await page.getByRole('button', { name: 'Open New Account', exact: true }).click();
  102 |     await expect(page.locator('#newAccountId'), 'new account number shown (seed)').toHaveText(/^\d+$/, { timeout: 15_000 });
  103 |     const B = (await page.locator('#newAccountId').innerText()).trim();
  104 |     expect(B, 'account B opened (seed)').toMatch(/^\d+$/);
  105 |     expect(B, 'B differs from A (seed)').not.toBe(A);
  106 |     return { username, A, B };
  107 |   });
  108 | }
  109 | 
  110 | async function balance(api: Api, id: string): Promise<number> {
  111 |   const r = await api.get<{ balance?: number | string }>(EP.accountsByAccountId(id)); // no auth (G4), field `balance` (G7)
  112 |   expect(r.status, `GET /accounts/${id} (read balance)`).toBe(200);
  113 |   return Number(r.body.balance);
  114 | }
  115 | 
  116 | async function balancesBefore(api: Api, seed: Seed, ids: string[]): Promise<number[]> {
  117 |   return seed.step('read balances before the action (GET /accounts/{accountId})', async () => {
  118 |     const out: number[] = [];
  119 |     for (const id of ids) out.push(await balance(api, id));
  120 |     return out;
  121 |   });
  122 | }
  123 | 
  124 | /** Accounts Overview: balance per account number and the total. */
  125 | async function readOverview(page: Page): Promise<{ balances: Record<string, number>; total: number }> {
  126 |   await gotoPage(page, 'overview.htm');
  127 |   const table = page.locator('#accountTable');
  128 |   await expect(table.getByRole('row').filter({ hasText: /^\s*Total/ })).toBeVisible({ timeout: 15_000 });
  129 |   await expect(table.getByRole('link').first()).toBeVisible();
  130 |   const balances: Record<string, number> = {};
  131 |   let total = NaN;
  132 |   for (const row of await table.getByRole('row').all()) {
  133 |     const cells = (await row.getByRole('cell').allInnerTexts()).map((s) => s.trim());
  134 |     if (!cells.length) continue;
  135 |     if (/^\d+$/.test(cells[0])) balances[cells[0]] = money(cells[1]);
  136 |     else if (/total/i.test(cells[0])) total = money(cells[1]);
  137 |   }
  138 |   return { balances, total };
  139 | }
  140 | 
  141 | async function openTransferPage(page: Page): Promise<void> {
  142 |   await gotoPage(page, 'transfer.htm');
> 143 |   await expect(page.getByRole('button', { name: 'Transfer', exact: true })).toBeVisible();
      |                                                                             ^ Error: expect(locator).toBeVisible() failed
  144 |   await expect(page.locator('#toAccountId:has(option)')).toBeVisible({ timeout: 15_000 });
  145 | }
  146 | 
  147 | async function fillTransfer(page: Page, amount: string, from: string, to: string): Promise<void> {
  148 |   await expect(page.locator(`#toAccountId option[value="${to}"]`)).toBeAttached({ timeout: 15_000 });
  149 |   await page.locator('#amount').fill(amount);
  150 |   await page.locator('#fromAccountId').selectOption(from);
  151 |   await page.locator('#toAccountId').selectOption(to);
  152 |   await page.getByRole('button', { name: 'Transfer', exact: true }).click();
  153 | }
  154 | 
  155 | function transfer(api: Api, from: string, to: string, amount: string): Promise<ApiResponse<unknown>> {
  156 |   return api.post(EP.transfer, { params: { fromAccountId: from, toAccountId: to, amount } }); // query string, no auth (G3/G4)
  157 | }
  158 | 
  159 | async function transactions(api: Api, id: string): Promise<{ type?: string; amount: number; description?: string }[]> {
  160 |   const r = await api.get<Tx[]>(EP.accountsTransactionsByAccountId(id)); // fields type/amount/description (G7)
  161 |   expect(r.status, `GET /accounts/${id}/transactions (read)`).toBe(200);
  162 |   const list = Array.isArray(r.body) ? r.body : [];
  163 |   return list.map((t) => ({ type: t.type, amount: Number(t.amount), description: t.description }));
  164 | }
  165 | 
  166 | /** Bounded wait for an unwanted success confirmation: true when it appeared within the window. */
  167 | async function appears(page: Page, text: string, ms = 5_000): Promise<boolean> {
  168 |   return page.getByRole('heading', { name: text, exact: true }).waitFor({ state: 'visible', timeout: ms }).then(() => true, () => false);
  169 | }
  170 | 
  171 | test.describe('PB-3 Transfer funds between my own accounts', () => {
  172 |   test('SCN-001: The customer transfers 25.50 from A to B on the Transfer Funds page', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  173 |     let c!: Customer;
  174 |     let before!: { balances: Record<string, number>; total: number };
  175 |     await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  176 |     await journey.step('And Accounts Overview shows the balances of A and B and the total', async () => {
  177 |       before = await seed.step('read Accounts Overview before the transfer', () => readOverview(page));
  178 |       expect(Number.isFinite(before.balances[c.A]) && Number.isFinite(before.balances[c.B]) && Number.isFinite(before.total), 'overview readable (precondition)').toBe(true);
  179 |     });
  180 |     await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
  181 |     await journey.step('When I transfer 25.50 from A to B', () => fillTransfer(page, REQ.AC1.AMOUNT, c.A, c.B));
  182 |     await journey.step('Then the page shows "Transfer Complete!"', async () => {
  183 |       await expect(page.getByRole('heading', { name: REQ.AC1.COMPLETE, exact: true }), '[REQ AC-1] "Transfer Complete!" shown').toBeVisible();
  184 |     });
  185 |     await journey.step('And the page shows "$25.50 has been transferred from account #<A> to account #<B>."', async () => {
  186 |       await expect(page.getByText(REQ.AC1.SENTENCE(c.A, c.B), { exact: true }), '[REQ AC-1] transfer sentence shown').toBeVisible();
  187 |     });
  188 |     let after!: { balances: Record<string, number>; total: number };
  189 |     await journey.step('And Accounts Overview shows the balance of A lower by $25.50', async () => {
  190 |       after = await readOverview(page);
  191 |       expect.soft(after.balances[c.A], '[REQ AC-1] Accounts Overview: balance of A lower by $25.50').toBeCloseTo(before.balances[c.A] - REQ.AC1.DELTA, 2);
  192 |     });
  193 |     await journey.step('And Accounts Overview shows the balance of B higher by $25.50', async () => {
  194 |       expect.soft(after.balances[c.B], '[REQ AC-1] Accounts Overview: balance of B higher by $25.50').toBeCloseTo(before.balances[c.B] + REQ.AC1.DELTA, 2);
  195 |     });
  196 |     await journey.step('And the total shown on Accounts Overview is unchanged', async () => {
  197 |       expect.soft(after.total, '[REQ AC-1] Accounts Overview: total unchanged').toBeCloseTo(before.total, 2);
  198 |     });
  199 |   });
  200 | 
  201 |   test('SCN-002: The REST service transfers 12.34 from A to B', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  202 |     let c!: Customer;
  203 |     let a0 = 0; let b0 = 0;
  204 |     let res!: ApiResponse<unknown>;
  205 |     await journey.step('Given a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  206 |     await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
  207 |     await journey.step('When the service is called with fromAccountId A, toAccountId B and amount 12.34', async () => { res = await transfer(api, c.A, c.B, REQ.AC2.AMOUNT); });
  208 |     await journey.step('Then it answers 200', async () => {
  209 |       expect.soft(res.status, '[REQ AC-2] POST /transfer answers 200').toBe(REQ.STATUS.OK);
  210 |     });
  211 |     await journey.step('And the body is the text "Successfully transferred $12.34 from account #<A> to account #<B>"', async () => {
  212 |       expect.soft(res.text.trim(), '[REQ AC-2] POST /transfer body is the confirmation text').toBe(REQ.AC2.TEXT(c.A, c.B));
  213 |     });
  214 |     await journey.step('And GET /accounts/<A> returns a balance lower by 12.34', async () => {
  215 |       expect.soft(await balance(api, c.A), '[REQ AC-2] GET /accounts/<A> balance lower by 12.34').toBeCloseTo(a0 - REQ.AC2.DELTA, 2);
  216 |     });
  217 |     await journey.step('And GET /accounts/<B> returns a balance higher by 12.34', async () => {
  218 |       expect.soft(await balance(api, c.B), '[REQ AC-2] GET /accounts/<B> balance higher by 12.34').toBeCloseTo(b0 + REQ.AC2.DELTA, 2);
  219 |     });
  220 |   });
  221 | 
  222 |   test('SCN-003: A transfer made on the page is listed as a transaction on both accounts', { tag: ['@AC-3', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  223 |     let c!: Customer;
  224 |     await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  225 |     await journey.step('And I transferred 25.50 from A to B on the Transfer Funds page', async () => {
  226 |       await openTransferPage(page);
  227 |       await fillTransfer(page, REQ.AC3.AMOUNT, c.A, c.B);
  228 |       await expect(page.getByRole('heading', { name: 'Transfer Complete!', exact: true }), 'transfer done (precondition; asserted by AC-1)').toBeVisible();
  229 |     });
  230 |     await journey.step('Then GET /accounts/<A>/transactions contains a "Debit" of 25.50 described "Funds Transfer Sent"', async () => {
  231 |       expect.soft(await transactions(api, c.A), '[REQ AC-3] GET /accounts/<A>/transactions contains Debit 25.50 "Funds Transfer Sent"').toContainEqual(REQ.AC3.DEBIT);
  232 |     });
  233 |     await journey.step('And GET /accounts/<B>/transactions contains a "Credit" of 25.50 described "Funds Transfer Received"', async () => {
  234 |       expect.soft(await transactions(api, c.B), '[REQ AC-3] GET /accounts/<B>/transactions contains Credit 25.50 "Funds Transfer Received"').toContainEqual(REQ.AC3.CREDIT);
  235 |     });
  236 |     await journey.step('And the Account Activity of A lists "Funds Transfer Sent" with $25.50 in the Debit (-) column', async () => {
  237 |       await gotoPage(page, `activity.htm?id=${c.A}`);
  238 |       const table = page.locator('#transactionTable');
  239 |       await expect(table.getByRole('row').nth(1)).toBeVisible({ timeout: 15_000 });
  240 |       const headers = (await table.getByRole('columnheader').allInnerTexts()).map((h) => h.trim());
  241 |       const col = headers.findIndex((h) => h === REQ.AC3.DEBIT_COLUMN);
  242 |       expect.soft(col, '[REQ AC-3] Account Activity has a "Debit (-)" column').toBeGreaterThanOrEqual(0);
  243 |       // A also has the "Funds Transfer Sent" of opening B: pick the row of this transfer (the one with a $25.50 cell)
```