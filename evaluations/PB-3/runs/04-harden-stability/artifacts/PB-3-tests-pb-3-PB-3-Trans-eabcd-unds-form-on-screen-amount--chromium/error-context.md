# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-3\tests\pb-3.spec.ts >> PB-3 Transfer funds between my own accounts >> SCN-004.1: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "")
- Location: evaluations\PB-3\tests\pb-3.spec.ts:267:5

# Error details

```
Error: [REQ AC-4] message "The amount cannot be empty." shown

expect(locator).toBeVisible() failed

Locator:  getByText('The amount cannot be empty.', { exact: true })
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - [REQ AC-4] message "The amount cannot be empty." shown getByText('The amount cannot be empty.', { exact: true }) with timeout 5000ms
  - waiting for getByText('The amount cannot be empty.', { exact: true })
    14 × locator resolved to <p class="error" id="amount.errors">↵⇆⇆⇆The amount cannot be empty. ↵⇆⇆</p>
       - unexpected value "hidden"

```

```yaml
- link:
  - /url: admin.htm
  - img
- link "ParaBank":
  - /url: index.htm
  - img "ParaBank"
- paragraph: Experience the difference
- list:
  - listitem: Solutions
  - listitem:
    - link "About Us":
      - /url: about.htm
  - listitem:
    - link "Services":
      - /url: services.htm
  - listitem:
    - link "Products":
      - /url: http://www.parasoft.com/jsp/products.jsp
  - listitem:
    - link "Locations":
      - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
  - listitem:
    - link "Admin Page":
      - /url: admin.htm
- list:
  - listitem:
    - link "home":
      - /url: index.htm
  - listitem:
    - link "about":
      - /url: about.htm
  - listitem:
    - link "contact":
      - /url: contact.htm
- paragraph: Welcome Heldout Tester
- heading "Account Services" [level=2]
- list:
  - listitem:
    - link "Open New Account":
      - /url: openaccount.htm
  - listitem:
    - link "Accounts Overview":
      - /url: overview.htm
  - listitem:
    - link "Transfer Funds":
      - /url: transfer.htm
  - listitem:
    - link "Bill Pay":
      - /url: billpay.htm
  - listitem:
    - link "Find Transactions":
      - /url: findtrans.htm
  - listitem:
    - link "Update Contact Info":
      - /url: updateprofile.htm
  - listitem:
    - link "Request Loan":
      - /url: requestloan.htm
  - listitem:
    - link "Log Out":
      - /url: logout.htm
- heading "Error!" [level=1]
- paragraph: An internal error has occurred and has been logged.
- list:
  - listitem:
    - link "Home":
      - /url: index.htm
    - text: "|"
  - listitem:
    - link "About Us":
      - /url: about.htm
    - text: "|"
  - listitem:
    - link "Services":
      - /url: services.htm
    - text: "|"
  - listitem:
    - link "Products":
      - /url: http://www.parasoft.com/jsp/products.jsp
    - text: "|"
  - listitem:
    - link "Locations":
      - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
    - text: "|"
  - listitem:
    - link "Forum":
      - /url: http://forums.parasoft.com/
    - text: "|"
  - listitem:
    - link "Site Map":
      - /url: sitemap.htm
    - text: "|"
  - listitem:
    - link "Contact Us":
      - /url: contact.htm
- paragraph: © Parasoft. All rights reserved.
- list:
  - listitem: "Visit us at:"
  - listitem:
    - link "www.parasoft.com":
      - /url: http://www.parasoft.com/
```

```
Error: [REQ AC-4] Transfer Funds form stays on screen

expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Transfer', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - [REQ AC-4] Transfer Funds form stays on screen getByRole('button', { name: 'Transfer', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Transfer', exact: true })

```

```yaml
- link:
  - /url: admin.htm
  - img
- link "ParaBank":
  - /url: index.htm
  - img "ParaBank"
- paragraph: Experience the difference
- list:
  - listitem: Solutions
  - listitem:
    - link "About Us":
      - /url: about.htm
  - listitem:
    - link "Services":
      - /url: services.htm
  - listitem:
    - link "Products":
      - /url: http://www.parasoft.com/jsp/products.jsp
  - listitem:
    - link "Locations":
      - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
  - listitem:
    - link "Admin Page":
      - /url: admin.htm
- list:
  - listitem:
    - link "home":
      - /url: index.htm
  - listitem:
    - link "about":
      - /url: about.htm
  - listitem:
    - link "contact":
      - /url: contact.htm
- paragraph: Welcome Heldout Tester
- heading "Account Services" [level=2]
- list:
  - listitem:
    - link "Open New Account":
      - /url: openaccount.htm
  - listitem:
    - link "Accounts Overview":
      - /url: overview.htm
  - listitem:
    - link "Transfer Funds":
      - /url: transfer.htm
  - listitem:
    - link "Bill Pay":
      - /url: billpay.htm
  - listitem:
    - link "Find Transactions":
      - /url: findtrans.htm
  - listitem:
    - link "Update Contact Info":
      - /url: updateprofile.htm
  - listitem:
    - link "Request Loan":
      - /url: requestloan.htm
  - listitem:
    - link "Log Out":
      - /url: logout.htm
- heading "Error!" [level=1]
- paragraph: An internal error has occurred and has been logged.
- list:
  - listitem:
    - link "Home":
      - /url: index.htm
    - text: "|"
  - listitem:
    - link "About Us":
      - /url: about.htm
    - text: "|"
  - listitem:
    - link "Services":
      - /url: services.htm
    - text: "|"
  - listitem:
    - link "Products":
      - /url: http://www.parasoft.com/jsp/products.jsp
    - text: "|"
  - listitem:
    - link "Locations":
      - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
    - text: "|"
  - listitem:
    - link "Forum":
      - /url: http://forums.parasoft.com/
    - text: "|"
  - listitem:
    - link "Site Map":
      - /url: sitemap.htm
    - text: "|"
  - listitem:
    - link "Contact Us":
      - /url: contact.htm
- paragraph: © Parasoft. All rights reserved.
- list:
  - listitem: "Visit us at:"
  - listitem:
    - link "www.parasoft.com":
      - /url: http://www.parasoft.com/
```

# Test source

```ts
  176 |  * ~14 back-to-back tests). Leave at least PACE_MS between the start of one test and the end of the previous one.
  177 |  * The timestamp lives in a file so it survives Playwright's worker restart after a failed test.
  178 |  */
  179 | const PACE_MS = Number(process.env.PB3_PACE_MS ?? 12_000);
  180 | const PACE_FILE = path.join(os.tmpdir(), 'heldout-pb3-pace.txt');
  181 | test.beforeEach(async () => {
  182 |   const last = Number(fs.existsSync(PACE_FILE) ? fs.readFileSync(PACE_FILE, 'utf8') : 0) || 0;
  183 |   const wait = Math.min(PACE_MS, last + PACE_MS - Date.now());
  184 |   if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  185 | });
  186 | test.afterEach(async () => { fs.writeFileSync(PACE_FILE, String(Date.now())); });
  187 | 
  188 | test.describe('PB-3 Transfer funds between my own accounts', () => {
  189 |   test('SCN-001: The customer transfers 25.50 from A to B on the Transfer Funds page', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  190 |     let c!: Customer;
  191 |     let before!: { balances: Record<string, number>; total: number };
  192 |     await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  193 |     await journey.step('And Accounts Overview shows the balances of A and B and the total', async () => {
  194 |       before = await seed.step('read Accounts Overview before the transfer', () => readOverview(page));
  195 |       expect(Number.isFinite(before.balances[c.A]) && Number.isFinite(before.balances[c.B]) && Number.isFinite(before.total), 'overview readable (precondition)').toBe(true);
  196 |     });
  197 |     await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
  198 |     await journey.step('When I transfer 25.50 from A to B', () => fillTransfer(page, REQ.AC1.AMOUNT, c.A, c.B));
  199 |     await journey.step('Then the page shows "Transfer Complete!"', async () => {
  200 |       await expect(page.getByRole('heading', { name: REQ.AC1.COMPLETE, exact: true }), '[REQ AC-1] "Transfer Complete!" shown').toBeVisible();
  201 |     });
  202 |     await journey.step('And the page shows "$25.50 has been transferred from account #<A> to account #<B>."', async () => {
  203 |       await expect(page.getByText(REQ.AC1.SENTENCE(c.A, c.B), { exact: true }), '[REQ AC-1] transfer sentence shown').toBeVisible();
  204 |     });
  205 |     let after!: { balances: Record<string, number>; total: number };
  206 |     await journey.step('And Accounts Overview shows the balance of A lower by $25.50', async () => {
  207 |       after = await readOverview(page);
  208 |       expect.soft(after.balances[c.A], '[REQ AC-1] Accounts Overview: balance of A lower by $25.50').toBeCloseTo(before.balances[c.A] - REQ.AC1.DELTA, 2);
  209 |     });
  210 |     await journey.step('And Accounts Overview shows the balance of B higher by $25.50', async () => {
  211 |       expect.soft(after.balances[c.B], '[REQ AC-1] Accounts Overview: balance of B higher by $25.50').toBeCloseTo(before.balances[c.B] + REQ.AC1.DELTA, 2);
  212 |     });
  213 |     await journey.step('And the total shown on Accounts Overview is unchanged', async () => {
  214 |       expect.soft(after.total, '[REQ AC-1] Accounts Overview: total unchanged').toBeCloseTo(before.total, 2);
  215 |     });
  216 |   });
  217 | 
  218 |   test('SCN-002: The REST service transfers 12.34 from A to B', { tag: ['@AC-2', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  219 |     let c!: Customer;
  220 |     let a0 = 0; let b0 = 0;
  221 |     let res!: ApiResponse<unknown>;
  222 |     await journey.step('Given a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  223 |     await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
  224 |     await journey.step('When the service is called with fromAccountId A, toAccountId B and amount 12.34', async () => { res = await transfer(api, c.A, c.B, REQ.AC2.AMOUNT); });
  225 |     await journey.step('Then it answers 200', async () => {
  226 |       expect.soft(res.status, '[REQ AC-2] POST /transfer answers 200').toBe(REQ.STATUS.OK);
  227 |     });
  228 |     await journey.step('And the body is the text "Successfully transferred $12.34 from account #<A> to account #<B>"', async () => {
  229 |       expect.soft(res.text.trim(), '[REQ AC-2] POST /transfer body is the confirmation text').toBe(REQ.AC2.TEXT(c.A, c.B));
  230 |     });
  231 |     await journey.step('And GET /accounts/<A> returns a balance lower by 12.34', async () => {
  232 |       expect.soft(await balance(api, c.A), '[REQ AC-2] GET /accounts/<A> balance lower by 12.34').toBeCloseTo(a0 - REQ.AC2.DELTA, 2);
  233 |     });
  234 |     await journey.step('And GET /accounts/<B> returns a balance higher by 12.34', async () => {
  235 |       expect.soft(await balance(api, c.B), '[REQ AC-2] GET /accounts/<B> balance higher by 12.34').toBeCloseTo(b0 + REQ.AC2.DELTA, 2);
  236 |     });
  237 |   });
  238 | 
  239 |   test('SCN-003: A transfer made on the page is listed as a transaction on both accounts', { tag: ['@AC-3', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  240 |     let c!: Customer;
  241 |     await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  242 |     await journey.step('And I transferred 25.50 from A to B on the Transfer Funds page', async () => {
  243 |       await openTransferPage(page);
  244 |       await fillTransfer(page, REQ.AC3.AMOUNT, c.A, c.B);
  245 |       await expect(page.getByRole('heading', { name: 'Transfer Complete!', exact: true }), 'transfer done (precondition; asserted by AC-1)').toBeVisible();
  246 |     });
  247 |     await journey.step('Then GET /accounts/<A>/transactions contains a "Debit" of 25.50 described "Funds Transfer Sent"', async () => {
  248 |       expect.soft(await transactions(api, c.A), '[REQ AC-3] GET /accounts/<A>/transactions contains Debit 25.50 "Funds Transfer Sent"').toContainEqual(REQ.AC3.DEBIT);
  249 |     });
  250 |     await journey.step('And GET /accounts/<B>/transactions contains a "Credit" of 25.50 described "Funds Transfer Received"', async () => {
  251 |       expect.soft(await transactions(api, c.B), '[REQ AC-3] GET /accounts/<B>/transactions contains Credit 25.50 "Funds Transfer Received"').toContainEqual(REQ.AC3.CREDIT);
  252 |     });
  253 |     await journey.step('And the Account Activity of A lists "Funds Transfer Sent" with $25.50 in the Debit (-) column', async () => {
  254 |       await gotoPage(page, `activity.htm?id=${c.A}`);
  255 |       const table = page.locator('#transactionTable');
  256 |       await expect(table.getByRole('row').nth(1)).toBeVisible({ timeout: 15_000 });
  257 |       const headers = (await table.getByRole('columnheader').allInnerTexts()).map((h) => h.trim());
  258 |       const col = headers.findIndex((h) => h === REQ.AC3.DEBIT_COLUMN);
  259 |       expect.soft(col, '[REQ AC-3] Account Activity has a "Debit (-)" column').toBeGreaterThanOrEqual(0);
  260 |       // A also has the "Funds Transfer Sent" of opening B: pick the row of this transfer (the one with a $25.50 cell)
  261 |       const row = table.getByRole('row').filter({ hasText: REQ.AC3.ACTIVITY_DESCRIPTION }).filter({ has: page.getByRole('cell', { name: REQ.AC3.ACTIVITY_DEBIT, exact: true }) });
  262 |       await expect.soft(row.first().getByRole('cell').nth(col), '[REQ AC-3] Account Activity of A: "Funds Transfer Sent" with $25.50 in Debit (-)').toHaveText(REQ.AC3.ACTIVITY_DEBIT);
  263 |     });
  264 |   });
  265 | 
  266 |   REQ.AC4.forEach((row, i) => {
  267 |     test(`SCN-004.${i + 1}: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "${row.amount}")`, { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  268 |       let c!: Customer;
  269 |       let a0 = 0; let b0 = 0;
  270 |       await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  271 |       await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
  272 |       await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
  273 |       await journey.step(`When I enter "${row.amount}" as the amount and press Transfer`, () => fillTransfer(page, row.amount, c.A, c.B));
  274 |       await journey.step(`Then the Transfer Funds form stays on screen with the message "${row.message}"`, async () => {
  275 |         await expect.soft(page.getByText(row.message, { exact: true }), `[REQ AC-4] message "${row.message}" shown`).toBeVisible();
> 276 |         await expect.soft(page.getByRole('button', { name: 'Transfer', exact: true }), '[REQ AC-4] Transfer Funds form stays on screen').toBeVisible();
      |                                                                                                                                          ^ Error: [REQ AC-4] Transfer Funds form stays on screen
  277 |       });
  278 |       await journey.step('And the balances of A and B do not change', async () => {
  279 |         expect.soft(await balance(api, c.A), '[REQ AC-4] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
  280 |         expect.soft(await balance(api, c.B), '[REQ AC-4] GET /accounts/<B> balance unchanged').toBeCloseTo(b0, 2);
  281 |       });
  282 |     });
  283 |   });
  284 | 
  285 |   REQ.AC5.AMOUNTS.forEach((amount, i) => {
  286 |     test(`SCN-005.${i + 1}: A zero or negative amount is refused on the Transfer Funds page (${amount})`, { tag: ['@AC-5', '@type:boundary', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  287 |       let c!: Customer;
  288 |       let a0 = 0; let b0 = 0;
  289 |       await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  290 |       await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
  291 |       await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
  292 |       await journey.step(`When I transfer ${amount} from A to B`, () => fillTransfer(page, amount, c.A, c.B));
  293 |       await journey.step('Then the transfer is refused (the page does not show "Transfer Complete!") — bounded 5 s wait for the confirmation', async () => {
  294 |         expect.soft(await appears(page, REQ.AC5.COMPLETE), '[REQ AC-5] page does not show "Transfer Complete!"').toBe(false);
  295 |       });
  296 |       await journey.step('And the balances of A and B do not change', async () => {
  297 |         expect.soft(await balance(api, c.A), '[REQ AC-5] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
  298 |         expect.soft(await balance(api, c.B), '[REQ AC-5] GET /accounts/<B> balance unchanged').toBeCloseTo(b0, 2);
  299 |       });
  300 |     });
  301 |   });
  302 | 
  303 |   REQ.AC5.AMOUNTS.forEach((amount, i) => {
  304 |     test(`SCN-006.${i + 1}: A zero or negative amount is refused by the REST service (${amount})`, { tag: ['@AC-5', '@type:boundary', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  305 |       let c!: Customer;
  306 |       let a0 = 0; let b0 = 0;
  307 |       let res!: ApiResponse<unknown>;
  308 |       await journey.step('Given a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  309 |       await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
  310 |       await journey.step(`When the service is called with fromAccountId A, toAccountId B and amount ${amount}`, async () => { res = await transfer(api, c.A, c.B, amount); });
  311 |       await journey.step('Then the transfer is refused (the service does not answer with the success confirmation of AC-2)', async () => {
  312 |         expect.soft(res.text, '[REQ AC-5] POST /transfer does not answer with the success confirmation').not.toMatch(REQ.AC5.SUCCESS_PREFIX);
  313 |       });
  314 |       await journey.step('And the balances of A and B do not change', async () => {
  315 |         expect.soft(await balance(api, c.A), '[REQ AC-5] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
  316 |         expect.soft(await balance(api, c.B), '[REQ AC-5] GET /accounts/<B> balance unchanged').toBeCloseTo(b0, 2);
  317 |       });
  318 |     });
  319 |   });
  320 | 
  321 |   test('SCN-007: The REST service completes a transfer of 1000.00, more than the balance of A', { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  322 |     let c!: Customer;
  323 |     let a0 = 0; let b0 = 0;
  324 |     let res!: ApiResponse<unknown>;
  325 |     await journey.step('Given a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  326 |     await journey.step('And the balance of A is lower than 1000.00', async () => {
  327 |       [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]);
  328 |       expect(a0, 'balance of A is lower than 1000.00 (precondition)').toBeLessThan(REQ.AC6.LIMIT);
  329 |     });
  330 |     await journey.step('When the service is called with fromAccountId A, toAccountId B and amount 1000.00', async () => { res = await transfer(api, c.A, c.B, REQ.AC6.AMOUNT); });
  331 |     await journey.step('Then it answers 200 with the same confirmation as any other transfer', async () => {
  332 |       expect.soft(res.status, '[REQ AC-6] POST /transfer answers 200').toBe(REQ.STATUS.OK);
  333 |       expect.soft(res.text.trim(), '[REQ AC-6] POST /transfer body is the transfer confirmation for 1000.00').toMatch(REQ.AC6.TEXT(c.A, c.B));
  334 |     });
  335 |     await journey.step('And the balance of A goes negative by the difference', async () => {
  336 |       expect.soft(await balance(api, c.A), '[REQ AC-6] GET /accounts/<A> balance = before − 1000.00 (negative)').toBeCloseTo(a0 - REQ.AC6.DELTA, 2);
  337 |     });
  338 |     await journey.step('And B is credited with the full amount', async () => {
  339 |       expect.soft(await balance(api, c.B), '[REQ AC-6] GET /accounts/<B> balance = before + 1000.00').toBeCloseTo(b0 + REQ.AC6.DELTA, 2);
  340 |     });
  341 |   });
  342 | 
  343 |   test('SCN-008: The Transfer Funds page completes a transfer of 1000.00, more than the balance of A', { tag: ['@AC-6', '@type:boundary', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  344 |     let c!: Customer;
  345 |     let a0 = 0; let b0 = 0;
  346 |     await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  347 |     await journey.step('And the balance of A is lower than 1000.00', async () => {
  348 |       [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]);
  349 |       expect(a0, 'balance of A is lower than 1000.00 (precondition)').toBeLessThan(REQ.AC6.LIMIT);
  350 |     });
  351 |     await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
  352 |     await journey.step('When I transfer 1000.00 from A to B', () => fillTransfer(page, REQ.AC6.AMOUNT, c.A, c.B));
  353 |     await journey.step('Then the page shows "Transfer Complete!"', async () => {
  354 |       await expect.soft(page.getByRole('heading', { name: REQ.AC6.COMPLETE, exact: true }), '[REQ AC-6] "Transfer Complete!" shown').toBeVisible();
  355 |     });
  356 |     await journey.step('And the balance of A goes negative by the difference', async () => {
  357 |       expect.soft(await balance(api, c.A), '[REQ AC-6] GET /accounts/<A> balance = before − 1000.00 (negative)').toBeCloseTo(a0 - REQ.AC6.DELTA, 2);
  358 |     });
  359 |     await journey.step('And B is credited with the full amount', async () => {
  360 |       expect.soft(await balance(api, c.B), '[REQ AC-6] GET /accounts/<B> balance = before + 1000.00').toBeCloseTo(b0 + REQ.AC6.DELTA, 2);
  361 |     });
  362 |   });
  363 | 
  364 |   test('SCN-009: The REST service refuses an unknown destination account', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  365 |     let c!: Customer;
  366 |     let a0 = 0;
  367 |     let res!: ApiResponse<unknown>;
  368 |     await journey.step('Given a newly registered customer who owns account A', async () => { c = await newCustomer(page, seed, data); });
  369 |     await journey.step('And the balance of A is read with GET /accounts/{accountId}', async () => { [a0] = await balancesBefore(api, seed, [c.A]); });
  370 |     await journey.step('When the service is called with fromAccountId A, toAccountId 99999999 and amount 5.00', async () => { res = await transfer(api, c.A, REQ.AC7.TO, REQ.AC7.AMOUNT); });
  371 |     await journey.step('Then it answers 400', async () => {
  372 |       expect.soft(res.status, '[REQ AC-7] POST /transfer answers 400').toBe(REQ.STATUS.BAD_REQUEST);
  373 |     });
  374 |     await journey.step('And the body is the text "Could not find account number <A> and/or 99999999"', async () => {
  375 |       expect.soft(res.text.trim(), '[REQ AC-7] POST /transfer body is the not-found text').toBe(REQ.AC7.TEXT(c.A));
  376 |     });
```