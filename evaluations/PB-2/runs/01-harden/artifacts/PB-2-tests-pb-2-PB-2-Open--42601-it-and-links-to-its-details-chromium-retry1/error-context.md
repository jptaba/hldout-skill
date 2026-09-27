# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-2\tests\pb-2.spec.ts >> PB-2 Open a new CHECKING or SAVINGS account online >> SCN-002: Opening a SAVINGS account on the page confirms it and links to its details
- Location: evaluations\PB-2\tests\pb-2.spec.ts:208:3

# Error details

```
Error: [REQ AC-2] the new account number is a link

expect(locator).toBeVisible() failed

Locator: getByText('Your new account number:').getByRole('link', { name: /^\d+$/ })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - [REQ AC-2] the new account number is a link getByText('Your new account number:').getByRole('link', { name: /^\d+$/ }) with timeout 5000ms
  - waiting for getByText('Your new account number:').getByRole('link', { name: /^\d+$/ })

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
- heading "Account Opened!" [level=1]
- paragraph: Congratulations, your account is now open.
- paragraph:
  - text: "Your new account number:"
  - link "19338":
    - /url: activity.htm?id=19338
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
  122 |  * then transfer the difference between it and the first account.
  123 |  */
  124 | async function addSecondAccount(api: Api, seed: Seed, cust: Customer, exactBalance?: number): Promise<number> {
  125 |   const label = exactBalance === undefined ? 'second account (POST /createAccount)' : `second account holding exactly ${exactBalance.toFixed(2)}`;
  126 |   return seed.create(label, async () => {
  127 |     const r = await openViaService(api, cust.customerId, 'CHECKING', cust.firstAccountId);
  128 |     expect(r.status, 'second account opened (precondition)').toBe(200);
  129 |     const id = Number(r.body.id);
  130 |     expect(id, 'second account id (precondition)').toBeGreaterThan(0);
  131 |     if (exactBalance !== undefined) {
  132 |       const diff = cents(await balanceOf(api, id)) - cents(exactBalance);
  133 |       if (diff > 0) await transfer(api, id, cust.firstAccountId, diff);
  134 |       if (diff < 0) await transfer(api, cust.firstAccountId, id, -diff);
  135 |       expect(cents(await balanceOf(api, id)), 'second account has the exact balance (precondition)').toBe(cents(exactBalance));
  136 |     }
  137 |     return id;
  138 |   });
  139 | }
  140 | 
  141 | /** The Open New Account page, with its funding account list loaded. */
  142 | async function openAccountPage(page: Page, fundingIds: number[]): Promise<void> {
  143 |   await gotoPage(page, 'openaccount.htm');
  144 |   for (const id of fundingIds) {
  145 |     await expect(fundingSelect(page).locator('option', { hasText: String(id) }), 'funding account list loaded').toHaveCount(1); // TODO(harden)
  146 |   }
  147 | }
  148 | const typeSelect = (page: Page) => page.locator('#type');
  149 | const fundingSelect = (page: Page) => page.locator('#fromAccountId');
  150 | 
  151 | async function openOnPage(page: Page, type: AccountType, fromAccountId: number): Promise<void> {
  152 |   await typeSelect(page).selectOption({ label: type });
  153 |   await fundingSelect(page).selectOption({ label: String(fromAccountId) });
  154 |   await page.getByRole('button', { name: 'Open New Account', exact: true }).click();
  155 | }
  156 | 
  157 | /** The new account number link on the confirmation. */
  158 | const newAccountLink = (page: Page) => page.locator('#newAccountId'); // TODO(harden)
  159 | 
  160 | async function newAccountIdOnPage(page: Page): Promise<number> {
  161 |   await expect(newAccountLink(page), 'new account number shown').toHaveText(/^\d+$/);
  162 |   return Number(await newAccountLink(page).innerText());
  163 | }
  164 | 
  165 | /** The Accounts Overview row of an account (the row whose account link is the number). */
  166 | function overviewRow(page: Page, id: number) {
  167 |   return page.getByRole('row').filter({ has: page.getByRole('link', { name: String(id), exact: true }) }); // TODO(harden)
  168 | }
  169 | const overviewBalanceCell = (page: Page, id: number) => overviewRow(page, id).getByRole('cell').nth(1); // TODO(harden)
  170 | 
  171 | async function overviewBalance(page: Page, id: number): Promise<number> {
  172 |   await gotoPage(page, 'overview.htm');
  173 |   await expect(overviewRow(page, id), `account ${id} listed in the overview`).toHaveCount(1);
  174 |   return Number((await overviewBalanceCell(page, id).innerText()).replace(/[^0-9.-]/g, ''));
  175 | }
  176 | 
  177 | interface Tx { type?: string; amount?: number; description?: string }
  178 | async function transactions(api: Api, accountId: number): Promise<Tx[]> {
  179 |   const r = await api.get<Tx[]>(EP.transactions(accountId));
  180 |   return Array.isArray(r.body) ? r.body : [];
  181 | }
  182 | /** G8: Debit/Credit, amount and description as the transactions response represents them. */
  183 | const txMatches = (t: Tx, want: { type: string; amount: number; description: string }) =>
  184 |   t.type === want.type && cents(t.amount) === cents(want.amount) && t.description === want.description; // fields per the OpenAPI Transaction schema
  185 | 
  186 | // ---- scenarios ------------------------------------------------------------------------------------
  187 | 
  188 | test.describe('PB-2 Open a new CHECKING or SAVINGS account online', () => {
  189 |   test('SCN-001: The Open New Account page offers CHECKING and SAVINGS, the customer\'s accounts and the minimum deposit', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  190 |     let cust!: Customer; let second = 0;
  191 |     await journey.step('Given I registered a new customer who has a second account', async () => {
  192 |       cust = await registerCustomer(page, data, seed);
  193 |       second = await addSecondAccount(api, seed, cust);
  194 |     });
  195 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId, second]); });
  196 |     await journey.step('Then the account type choices are exactly CHECKING and SAVINGS', async () => {
  197 |       await expect.soft(typeSelect(page).locator('option'), '[REQ AC-1] account types are exactly CHECKING and SAVINGS').toHaveText([...REQ.ACCOUNT_TYPES]);
  198 |     });
  199 |     await journey.step('And the funding account choices are exactly the customer\'s two accounts', async () => {
  200 |       const options = (await fundingSelect(page).locator('option').allInnerTexts()).map((s) => s.trim()).sort();
  201 |       expect.soft(options, '[REQ AC-1] funding choices are the customer\'s accounts').toEqual([String(cust.firstAccountId), String(second)].sort());
  202 |     });
  203 |     await journey.step('And the page shows "A minimum of $100.00 must be deposited into this account at time of opening."', async () => {
  204 |       await expect.soft(page.getByText(REQ.MIN_DEPOSIT_TEXT, { exact: false }), '[REQ AC-1] minimum opening deposit text').toBeVisible();
  205 |     });
  206 |   });
  207 | 
  208 |   test('SCN-002: Opening a SAVINGS account on the page confirms it and links to its details', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  209 |     let cust!: Customer; let newId = 0;
  210 |     await journey.step('Given I registered a new customer', async () => { cust = await registerCustomer(page, data, seed); });
  211 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId]); });
  212 |     await journey.step('When I open a SAVINGS account funded from my first account', async () => { await openOnPage(page, 'SAVINGS', cust.firstAccountId); });
  213 |     await journey.step('Then the page shows "Account Opened!"', async () => {
  214 |       await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-2] "Account Opened!"').toBeVisible();
  215 |     });
  216 |     await journey.step('And the page shows "Congratulations, your account is now open."', async () => {
  217 |       await expect.soft(page.getByText(REQ.OPENED_TEXT, { exact: true }), '[REQ AC-2] congratulations text').toBeVisible();
  218 |     });
  219 |     await journey.step('And the page shows "Your new account number:" followed by the new account number as a link', async () => {
  220 |       const line = page.getByText(REQ.NEW_NUMBER_LABEL, { exact: false }); // TODO(harden)
  221 |       await expect(line, '[REQ AC-2] "Your new account number:" shown').toBeVisible();
> 222 |       await expect(line.getByRole('link', { name: /^\d+$/ }), '[REQ AC-2] the new account number is a link').toBeVisible(); // TODO(harden)
      |                                                                                                              ^ Error: [REQ AC-2] the new account number is a link
  223 |       newId = await newAccountIdOnPage(page);
  224 |     });
  225 |     await journey.step('When I follow the new account number link', async () => { await newAccountLink(page).click(); });
  226 |     await journey.step('Then the account details page shows Account Type SAVINGS', async () => {
  227 |       await expect.soft(page.locator('#accountType'), '[REQ AC-2] details page: Account Type SAVINGS').toHaveText('SAVINGS'); // TODO(harden)
  228 |       void newId;
  229 |     });
  230 |     await journey.step('And the account details page shows a balance of $100.00', async () => {
  231 |       await expect.soft(page.locator('#balance'), '[REQ AC-2] details page: balance $100.00').toHaveText(REQ.OPENING_BALANCE_UI); // TODO(harden)
  232 |     });
  233 |   });
  234 | 
  235 |   test('SCN-003: After opening a CHECKING account on the page, Accounts Overview and the service show both balances', { tag: ['@AC-3', '@AC-6', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  236 |     let cust!: Customer; let uiBefore = 0; let apiBefore = 0; let newId = 0;
  237 |     await journey.step('Given I registered a new customer', async () => { cust = await registerCustomer(page, data, seed); });
  238 |     await journey.step('And I noted the funding account\'s balance in Accounts Overview and through the service', async () => {
  239 |       uiBefore = await seed.step('funding balance in Accounts Overview', () => overviewBalance(page, cust.firstAccountId));
  240 |       apiBefore = await seed.step('funding balance via GET /accounts/{id}', () => balanceOf(api, cust.firstAccountId));
  241 |     });
  242 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId]); });
  243 |     await journey.step('When I open a CHECKING account funded from my first account', async () => {
  244 |       await openOnPage(page, 'CHECKING', cust.firstAccountId);
  245 |       newId = await newAccountIdOnPage(page);
  246 |     });
  247 |     await journey.step('Then Accounts Overview lists the new account with a balance of $100.00', async () => {
  248 |       await gotoPage(page, 'overview.htm');
  249 |       await expect.soft(overviewRow(page, newId), '[REQ AC-3] new account listed in Accounts Overview').toHaveCount(1);
  250 |       await expect.soft(overviewBalanceCell(page, newId), '[REQ AC-3] new account balance $100.00 in Accounts Overview').toHaveText(REQ.OPENING_BALANCE_UI);
  251 |     });
  252 |     await journey.step('And Accounts Overview shows the funding account\'s balance lower by $100.00 than before', async () => {
  253 |       const after = Number((await overviewBalanceCell(page, cust.firstAccountId).innerText()).replace(/[^0-9.-]/g, ''));
  254 |       expect.soft(cents(after), '[REQ AC-3] funding balance in Accounts Overview lower by $100.00').toBe(cents(uiBefore) - cents(REQ.OPENING_DEPOSIT));
  255 |     });
  256 |     await journey.step('And GET /customers/{customerId}/accounts returns the new account with type CHECKING and a balance of 100.00', async () => {
  257 |       const r = await listAccounts(api, cust.customerId);
  258 |       const acc = (Array.isArray(r.body) ? r.body : []).find((a) => Number(a.id) === newId);
  259 |       expect.soft(acc?.type, '[REQ AC-3] API: new account type CHECKING').toBe('CHECKING');
  260 |       expect.soft(cents(acc?.balance), '[REQ AC-3] API: new account balance 100.00').toBe(cents(REQ.OPENING_DEPOSIT));
  261 |     });
  262 |     await journey.step('And GET /customers/{customerId}/accounts returns the funding account with its balance reduced by 100.00', async () => {
  263 |       const r = await listAccounts(api, cust.customerId);
  264 |       const acc = (Array.isArray(r.body) ? r.body : []).find((a) => Number(a.id) === cust.firstAccountId);
  265 |       expect.soft(cents(acc?.balance), '[REQ AC-3] API: funding balance reduced by 100.00').toBe(cents(apiBefore) - cents(REQ.OPENING_DEPOSIT));
  266 |     });
  267 |   });
  268 | 
  269 |   test('SCN-004: POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  270 |     let cust!: Customer; let res!: ApiResponse<Account>; let got!: ApiResponse<Account>;
  271 |     await journey.step('Given I registered a new customer and know its customer id and first account id', async () => { cust = await registerCustomer(page, data, seed); });
  272 |     await journey.step('When I POST /createAccount for a CHECKING account funded from the first account', async () => {
  273 |       res = await openViaService(api, cust.customerId, 'CHECKING', cust.firstAccountId);
  274 |     });
  275 |     await journey.step('Then the response status is 200', async () => {
  276 |       expect(res.status, '[REQ AC-4] POST /createAccount → 200').toBe(REQ.STATUS_OK);
  277 |     });
  278 |     await journey.step('And the body is the new account with an id, the customer\'s customerId, type CHECKING and balance 100.00', async () => {
  279 |       expect.soft(Number(res.body?.id), '[REQ AC-4] body has the new account id').toBeGreaterThan(0);
  280 |       expect.soft(Number(res.body?.id), '[REQ AC-4] the id is a new account').not.toBe(cust.firstAccountId);
  281 |       expect.soft(Number(res.body?.customerId), '[REQ AC-4] body customerId').toBe(cust.customerId);
  282 |       expect.soft(res.body?.type, '[REQ AC-4] body type CHECKING').toBe('CHECKING');
  283 |       expect.soft(cents(res.body?.balance), '[REQ AC-4] body balance 100.00').toBe(cents(REQ.OPENING_DEPOSIT));
  284 |     });
  285 |     await journey.step('When I GET /accounts/{id} for the returned id', async () => { got = await getAccount(api, Number(res.body?.id)); });
  286 |     await journey.step('Then the response status is 200', async () => {
  287 |       expect(got.status, '[REQ AC-4] GET /accounts/{id} → 200').toBe(REQ.STATUS_OK);
  288 |     });
  289 |     await journey.step('And it returns the same id, customerId, type and balance', async () => {
  290 |       expect.soft({ id: Number(got.body?.id), customerId: Number(got.body?.customerId), type: got.body?.type, balance: cents(got.body?.balance) }, '[REQ AC-4] GET returns the same values')
  291 |         .toEqual({ id: Number(res.body?.id), customerId: Number(res.body?.customerId), type: res.body?.type, balance: cents(res.body?.balance) });
  292 |     });
  293 |   });
  294 | 
  295 |   test('SCN-005: Opening through the service records the transfer on both accounts', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  296 |     let cust!: Customer; let newId = 0;
  297 |     await journey.step('Given I registered a new customer and know its customer id and first account id', async () => { cust = await registerCustomer(page, data, seed); });
  298 |     await journey.step('When I POST /createAccount for a SAVINGS account funded from the first account', async () => {
  299 |       const r = await openViaService(api, cust.customerId, 'SAVINGS', cust.firstAccountId);
  300 |       newId = Number(r.body?.id);
  301 |     });
  302 |     await journey.step('Then the funding account\'s transactions include a Debit of 100.00 "Funds Transfer Sent"', async () => {
  303 |       const txs = await transactions(api, cust.firstAccountId);
  304 |       expect.soft(txs.some((t) => txMatches(t, REQ.FUNDING_TX)), '[REQ AC-5] funding account: Debit 100.00 "Funds Transfer Sent"').toBe(true);
  305 |     });
  306 |     await journey.step('And the new account\'s transactions include a Credit of 100.00 "Funds Transfer Received"', async () => {
  307 |       const txs = await transactions(api, newId);
  308 |       expect.soft(txs.some((t) => txMatches(t, REQ.NEW_ACCOUNT_TX)), '[REQ AC-5] new account: Credit 100.00 "Funds Transfer Received"').toBe(true);
  309 |     });
  310 |   });
  311 | 
  312 |   test('SCN-006: Opening on the page records the transfer on both accounts', { tag: ['@AC-5', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  313 |     let cust!: Customer; let newId = 0;
  314 |     await journey.step('Given I registered a new customer', async () => { cust = await registerCustomer(page, data, seed); });
  315 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId]); });
  316 |     await journey.step('When I open a CHECKING account funded from my first account', async () => {
  317 |       await openOnPage(page, 'CHECKING', cust.firstAccountId);
  318 |       newId = await newAccountIdOnPage(page);
  319 |     });
  320 |     await journey.step('Then the funding account\'s transactions include a Debit of 100.00 "Funds Transfer Sent"', async () => {
  321 |       const txs = await transactions(api, cust.firstAccountId);
  322 |       expect.soft(txs.some((t) => txMatches(t, REQ.FUNDING_TX)), '[REQ AC-5] funding account: Debit 100.00 "Funds Transfer Sent"').toBe(true);
```