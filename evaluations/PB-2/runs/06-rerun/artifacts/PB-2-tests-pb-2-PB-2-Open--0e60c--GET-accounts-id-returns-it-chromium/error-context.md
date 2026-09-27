# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-2\tests\pb-2.spec.ts >> PB-2 Open a new CHECKING or SAVINGS account online >> SCN-004: POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it
- Location: evaluations\PB-2\tests\pb-2.spec.ts:301:3

# Error details

```
Error: [REQ AC-4] body balance 100.00

expect(received).toBe(expected) // Object.is equality

Expected: 10000
Received: 0
```

```
Error: [REQ AC-4] GET returns the same values

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Object {
-   "balance": 0,
+   "balance": 10000,
    "customerId": 19316,
    "id": 29994,
    "type": "CHECKING",
  }
```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - generic [ref=f3e2]:
    - generic [ref=f3e3]:
      - link:
        - /url: admin.htm
        - img [ref=f3e4] [cursor=pointer]
      - link "ParaBank":
        - /url: index.htm
        - img "ParaBank" [ref=f3e5] [cursor=pointer]
      - paragraph [ref=f3e6]: Experience the difference
    - generic [ref=f3e7]:
      - list [ref=f3e8]:
        - listitem [ref=f3e9]: Solutions
        - listitem [ref=f3e10]:
          - link "About Us" [ref=f3e11] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f3e12]:
          - link "Services" [ref=f3e13] [cursor=pointer]:
            - /url: services.htm
        - listitem [ref=f3e14]:
          - link "Products" [ref=f3e15] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/products.jsp
        - listitem [ref=f3e16]:
          - link "Locations" [ref=f3e17] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - listitem [ref=f3e18]:
          - link "Admin Page" [ref=f3e19] [cursor=pointer]:
            - /url: admin.htm
      - list [ref=f3e20]:
        - listitem [ref=f3e21]:
          - link "home" [ref=f3e22] [cursor=pointer]:
            - /url: index.htm
        - listitem [ref=f3e23]:
          - link "about" [ref=f3e24] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f3e25]:
          - link "contact" [ref=f3e26] [cursor=pointer]:
            - /url: contact.htm
    - generic [ref=f3e27]:
      - generic [ref=f3e28]:
        - paragraph [ref=f3e29]: Welcome Heldout Tester
        - heading "Account Services" [level=2] [ref=f3e30]
        - list [ref=f3e31]:
          - listitem [ref=f3e32]:
            - link "Open New Account" [ref=f3e33] [cursor=pointer]:
              - /url: openaccount.htm
          - listitem [ref=f3e34]:
            - link "Accounts Overview" [ref=f3e35] [cursor=pointer]:
              - /url: overview.htm
          - listitem [ref=f3e36]:
            - link "Transfer Funds" [ref=f3e37] [cursor=pointer]:
              - /url: transfer.htm
          - listitem [ref=f3e38]:
            - link "Bill Pay" [ref=f3e39] [cursor=pointer]:
              - /url: billpay.htm
          - listitem [ref=f3e40]:
            - link "Find Transactions" [ref=f3e41] [cursor=pointer]:
              - /url: findtrans.htm
          - listitem [ref=f3e42]:
            - link "Update Contact Info" [ref=f3e43] [cursor=pointer]:
              - /url: updateprofile.htm
          - listitem [ref=f3e44]:
            - link "Request Loan" [ref=f3e45] [cursor=pointer]:
              - /url: requestloan.htm
          - listitem [ref=f3e46]:
            - link "Log Out" [ref=f3e47] [cursor=pointer]:
              - /url: logout.htm
      - generic [ref=f3e50]:
        - heading "Accounts Overview" [level=1] [ref=f3e51]
        - table [ref=f3e52]:
          - rowgroup [ref=f3e53]:
            - row [ref=f3e54]:
              - columnheader "Account" [ref=f3e55]
              - columnheader "Balance*" [ref=f3e56]
              - columnheader "Available Amount" [ref=f3e57]
          - rowgroup [ref=f3e58]:
            - row [ref=f3e59]:
              - cell [ref=f3e60]:
                - link "29883" [ref=f3e61] [cursor=pointer]:
                  - /url: activity.htm?id=29883
              - cell "$515.50" [ref=f3e62]
              - cell "$515.50" [ref=f3e63]
            - row [ref=f3e64]:
              - cell "Total" [ref=f3e65]
              - cell "$515.50" [ref=f3e66]
              - cell [ref=f3e67]
          - rowgroup [ref=f3e68]:
            - row [ref=f3e69]:
              - cell "*Balance includes deposits that may be subject to holds" [ref=f3e70]
  - generic [ref=f3e72]:
    - list [ref=f3e73]:
      - listitem [ref=f3e74]:
        - link "Home" [ref=f3e75] [cursor=pointer]:
          - /url: index.htm
        - text: "|"
      - listitem [ref=f3e76]:
        - link "About Us" [ref=f3e77] [cursor=pointer]:
          - /url: about.htm
        - text: "|"
      - listitem [ref=f3e78]:
        - link "Services" [ref=f3e79] [cursor=pointer]:
          - /url: services.htm
        - text: "|"
      - listitem [ref=f3e80]:
        - link "Products" [ref=f3e81] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/products.jsp
        - text: "|"
      - listitem [ref=f3e82]:
        - link "Locations" [ref=f3e83] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - text: "|"
      - listitem [ref=f3e84]:
        - link "Forum" [ref=f3e85] [cursor=pointer]:
          - /url: http://forums.parasoft.com/
        - text: "|"
      - listitem [ref=f3e86]:
        - link "Site Map" [ref=f3e87] [cursor=pointer]:
          - /url: sitemap.htm
        - text: "|"
      - listitem [ref=f3e88]:
        - link "Contact Us" [ref=f3e89] [cursor=pointer]:
          - /url: contact.htm
    - paragraph [ref=f3e90]: © Parasoft. All rights reserved.
    - list [ref=f3e91]:
      - listitem [ref=f3e92]: "Visit us at:"
      - listitem [ref=f3e93]:
        - link "www.parasoft.com" [ref=f3e94] [cursor=pointer]:
          - /url: http://www.parasoft.com/
```

# Test source

```ts
  223 |     await journey.step('Given I registered a new customer who has a second account', async () => {
  224 |       cust = await registerCustomer(page, data, seed);
  225 |       second = await addSecondAccount(api, seed, cust);
  226 |     });
  227 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId, second]); });
  228 |     await journey.step('Then the account type choices are exactly CHECKING and SAVINGS', async () => {
  229 |       await expect.soft(typeSelect(page).locator('option'), '[REQ AC-1] account types are exactly CHECKING and SAVINGS').toHaveText([...REQ.ACCOUNT_TYPES]);
  230 |     });
  231 |     await journey.step('And the funding account choices are exactly the customer\'s two accounts', async () => {
  232 |       const options = (await fundingSelect(page).locator('option').allInnerTexts()).map((s) => s.trim()).sort();
  233 |       expect.soft(options, '[REQ AC-1] funding choices are the customer\'s accounts').toEqual([String(cust.firstAccountId), String(second)].sort());
  234 |     });
  235 |     await journey.step('And the page shows "A minimum of $100.00 must be deposited into this account at time of opening."', async () => {
  236 |       await expect.soft(page.getByText(REQ.MIN_DEPOSIT_TEXT, { exact: false }), '[REQ AC-1] minimum opening deposit text').toBeVisible();
  237 |     });
  238 |   });
  239 | 
  240 |   test('SCN-002: Opening a SAVINGS account on the page confirms it and links to its details', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  241 |     let cust!: Customer; let newId = 0;
  242 |     await journey.step('Given I registered a new customer', async () => { cust = await registerCustomer(page, data, seed); });
  243 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId]); });
  244 |     await journey.step('When I open a SAVINGS account funded from my first account', async () => { await openOnPage(page, 'SAVINGS', cust.firstAccountId); });
  245 |     await journey.step('Then the page shows "Account Opened!"', async () => {
  246 |       await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-2] "Account Opened!"').toBeVisible();
  247 |     });
  248 |     await journey.step('And the page shows "Congratulations, your account is now open."', async () => {
  249 |       await expect.soft(page.getByText(REQ.OPENED_TEXT, { exact: true }), '[REQ AC-2] congratulations text').toBeVisible();
  250 |     });
  251 |     await journey.step('And the page shows "Your new account number:" followed by the new account number as a link', async () => {
  252 |       const line = page.getByRole('paragraph').filter({ hasText: REQ.NEW_NUMBER_LABEL });
  253 |       await expect(line, '[REQ AC-2] "Your new account number:" shown').toBeVisible();
  254 |       await expect(line.getByRole('link', { name: /^\d+$/ }), '[REQ AC-2] the new account number is a link').toBeVisible();
  255 |       newId = await newAccountIdOnPage(page);
  256 |     });
  257 |     await journey.step('When I follow the new account number link', async () => { await newAccountLink(page).click(); });
  258 |     await journey.step('Then the account details page shows Account Type SAVINGS', async () => {
  259 |       await expect.soft(page.locator('#accountType'), '[REQ AC-2] details page: Account Type SAVINGS').toHaveText('SAVINGS'); // details page (activity.htm) value cell, verified in 04-harden
  260 |       void newId;
  261 |     });
  262 |     await journey.step('And the account details page shows a balance of $100.00', async () => {
  263 |       await expect.soft(page.locator('#balance'), '[REQ AC-2] details page: balance $100.00').toHaveText(REQ.OPENING_BALANCE_UI); // details page (activity.htm) value cell, verified in 04-harden
  264 |     });
  265 |   });
  266 | 
  267 |   test('SCN-003: After opening a CHECKING account on the page, Accounts Overview and the service show both balances', { tag: ['@AC-3', '@AC-6', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  268 |     let cust!: Customer; let uiBefore = 0; let apiBefore = 0; let newId = 0;
  269 |     await journey.step('Given I registered a new customer', async () => { cust = await registerCustomer(page, data, seed); });
  270 |     await journey.step('And I noted the funding account\'s balance in Accounts Overview and through the service', async () => {
  271 |       uiBefore = await seed.step('funding balance in Accounts Overview', () => overviewBalance(page, cust.firstAccountId));
  272 |       apiBefore = await seed.step('funding balance via GET /accounts/{id}', () => balanceOf(api, cust.firstAccountId));
  273 |     });
  274 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId]); });
  275 |     await journey.step('When I open a CHECKING account funded from my first account', async () => {
  276 |       await openOnPage(page, 'CHECKING', cust.firstAccountId);
  277 |       newId = await newAccountIdOnPage(page);
  278 |     });
  279 |     await journey.step('Then Accounts Overview lists the new account with a balance of $100.00', async () => {
  280 |       await go(page, 'overview.htm');
  281 |       await expect.soft(overviewRow(page, newId), '[REQ AC-3] new account listed in Accounts Overview').toHaveCount(1);
  282 |       await expect.soft(overviewBalanceCell(page, newId), '[REQ AC-3] new account balance $100.00 in Accounts Overview').toHaveText(REQ.OPENING_BALANCE_UI);
  283 |     });
  284 |     await journey.step('And Accounts Overview shows the funding account\'s balance lower by $100.00 than before', async () => {
  285 |       const after = Number((await overviewBalanceCell(page, cust.firstAccountId).innerText()).replace(/[^0-9.-]/g, ''));
  286 |       expect.soft(cents(after), '[REQ AC-3] funding balance in Accounts Overview lower by $100.00').toBe(cents(uiBefore) - cents(REQ.OPENING_DEPOSIT));
  287 |     });
  288 |     await journey.step('And GET /customers/{customerId}/accounts returns the new account with type CHECKING and a balance of 100.00', async () => {
  289 |       const r = await listAccounts(api, cust.customerId);
  290 |       const acc = (Array.isArray(r.body) ? r.body : []).find((a) => Number(a.id) === newId);
  291 |       expect.soft(acc?.type, '[REQ AC-3] API: new account type CHECKING').toBe('CHECKING');
  292 |       expect.soft(cents(acc?.balance), '[REQ AC-3] API: new account balance 100.00').toBe(cents(REQ.OPENING_DEPOSIT));
  293 |     });
  294 |     await journey.step('And GET /customers/{customerId}/accounts returns the funding account with its balance reduced by 100.00', async () => {
  295 |       const r = await listAccounts(api, cust.customerId);
  296 |       const acc = (Array.isArray(r.body) ? r.body : []).find((a) => Number(a.id) === cust.firstAccountId);
  297 |       expect.soft(cents(acc?.balance), '[REQ AC-3] API: funding balance reduced by 100.00').toBe(cents(apiBefore) - cents(REQ.OPENING_DEPOSIT));
  298 |     });
  299 |   });
  300 | 
  301 |   test('SCN-004: POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  302 |     let cust!: Customer; let res!: ApiResponse<Account>; let got!: ApiResponse<Account>;
  303 |     await journey.step('Given I registered a new customer and know its customer id and first account id', async () => { cust = await registerCustomer(page, data, seed); });
  304 |     await journey.step('When I POST /createAccount for a CHECKING account funded from the first account', async () => {
  305 |       res = await openViaService(api, cust.customerId, 'CHECKING', cust.firstAccountId);
  306 |     });
  307 |     await journey.step('Then the response status is 200', async () => {
  308 |       expect(res.status, '[REQ AC-4] POST /createAccount → 200').toBe(REQ.STATUS_OK);
  309 |     });
  310 |     await journey.step('And the body is the new account with an id, the customer\'s customerId, type CHECKING and balance 100.00', async () => {
  311 |       expect.soft(Number(res.body?.id), '[REQ AC-4] body has the new account id').toBeGreaterThan(0);
  312 |       expect.soft(Number(res.body?.id), '[REQ AC-4] the id is a new account').not.toBe(cust.firstAccountId);
  313 |       expect.soft(Number(res.body?.customerId), '[REQ AC-4] body customerId').toBe(cust.customerId);
  314 |       expect.soft(res.body?.type, '[REQ AC-4] body type CHECKING').toBe('CHECKING');
  315 |       expect.soft(cents(res.body?.balance), '[REQ AC-4] body balance 100.00').toBe(cents(REQ.OPENING_DEPOSIT));
  316 |     });
  317 |     await journey.step('When I GET /accounts/{id} for the returned id', async () => { got = await getAccount(api, Number(res.body?.id)); });
  318 |     await journey.step('Then the response status is 200', async () => {
  319 |       expect(got.status, '[REQ AC-4] GET /accounts/{id} → 200').toBe(REQ.STATUS_OK);
  320 |     });
  321 |     await journey.step('And it returns the same id, customerId, type and balance', async () => {
  322 |       expect.soft({ id: Number(got.body?.id), customerId: Number(got.body?.customerId), type: got.body?.type, balance: cents(got.body?.balance) }, '[REQ AC-4] GET returns the same values')
> 323 |         .toEqual({ id: Number(res.body?.id), customerId: Number(res.body?.customerId), type: res.body?.type, balance: cents(res.body?.balance) });
      |          ^ Error: [REQ AC-4] GET returns the same values
  324 |     });
  325 |   });
  326 | 
  327 |   test('SCN-005: Opening through the service records the transfer on both accounts', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  328 |     let cust!: Customer; let newId = 0;
  329 |     await journey.step('Given I registered a new customer and know its customer id and first account id', async () => { cust = await registerCustomer(page, data, seed); });
  330 |     await journey.step('When I POST /createAccount for a SAVINGS account funded from the first account', async () => {
  331 |       const r = await openViaService(api, cust.customerId, 'SAVINGS', cust.firstAccountId);
  332 |       newId = Number(r.body?.id);
  333 |     });
  334 |     await journey.step('Then the funding account\'s transactions include a Debit of 100.00 "Funds Transfer Sent"', async () => {
  335 |       const txs = await transactions(api, cust.firstAccountId);
  336 |       expect.soft(txs.some((t) => txMatches(t, REQ.FUNDING_TX)), '[REQ AC-5] funding account: Debit 100.00 "Funds Transfer Sent"').toBe(true);
  337 |     });
  338 |     await journey.step('And the new account\'s transactions include a Credit of 100.00 "Funds Transfer Received"', async () => {
  339 |       const txs = await transactions(api, newId);
  340 |       expect.soft(txs.some((t) => txMatches(t, REQ.NEW_ACCOUNT_TX)), '[REQ AC-5] new account: Credit 100.00 "Funds Transfer Received"').toBe(true);
  341 |     });
  342 |   });
  343 | 
  344 |   test('SCN-006: Opening on the page records the transfer on both accounts', { tag: ['@AC-5', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  345 |     let cust!: Customer; let newId = 0;
  346 |     await journey.step('Given I registered a new customer', async () => { cust = await registerCustomer(page, data, seed); });
  347 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId]); });
  348 |     await journey.step('When I open a CHECKING account funded from my first account', async () => {
  349 |       await openOnPage(page, 'CHECKING', cust.firstAccountId);
  350 |       newId = await newAccountIdOnPage(page);
  351 |     });
  352 |     await journey.step('Then the funding account\'s transactions include a Debit of 100.00 "Funds Transfer Sent"', async () => {
  353 |       const txs = await transactions(api, cust.firstAccountId);
  354 |       expect.soft(txs.some((t) => txMatches(t, REQ.FUNDING_TX)), '[REQ AC-5] funding account: Debit 100.00 "Funds Transfer Sent"').toBe(true);
  355 |     });
  356 |     await journey.step('And the new account\'s transactions include a Credit of 100.00 "Funds Transfer Received"', async () => {
  357 |       const txs = await transactions(api, newId);
  358 |       expect.soft(txs.some((t) => txMatches(t, REQ.NEW_ACCOUNT_TX)), '[REQ AC-5] new account: Credit 100.00 "Funds Transfer Received"').toBe(true);
  359 |     });
  360 |   });
  361 | 
  362 |   test('SCN-007: The service takes the opening deposit from the funding account the customer chose', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  363 |     let cust!: Customer; let second = 0; let firstBefore = 0; let secondBefore = 0;
  364 |     await journey.step('Given I registered a new customer who has a second account', async () => {
  365 |       cust = await registerCustomer(page, data, seed);
  366 |       second = await addSecondAccount(api, seed, cust);
  367 |     });
  368 |     await journey.step('And I noted the balances of both accounts', async () => {
  369 |       firstBefore = await seed.step('first account balance', () => balanceOf(api, cust.firstAccountId));
  370 |       secondBefore = await seed.step('second account balance', () => balanceOf(api, second));
  371 |     });
  372 |     await journey.step('When I POST /createAccount for a SAVINGS account funded from the second account', async () => {
  373 |       await openViaService(api, cust.customerId, 'SAVINGS', second);
  374 |     });
  375 |     await journey.step('Then the second account\'s balance is its previous balance minus 100.00', async () => {
  376 |       expect.soft(cents(await balanceOf(api, second)), '[REQ AC-6] R4/R7: chosen funding account debited 100.00').toBe(cents(secondBefore) - cents(REQ.OPENING_DEPOSIT));
  377 |     });
  378 |     await journey.step('And the first account\'s balance is unchanged', async () => {
  379 |       expect.soft(cents(await balanceOf(api, cust.firstAccountId)), '[REQ AC-6] R4: the other account is not debited').toBe(cents(firstBefore));
  380 |     });
  381 |   });
  382 | 
  383 |   test('SCN-008: The page takes the opening deposit from the funding account the customer chose', { tag: ['@AC-6', '@type:functional', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  384 |     let cust!: Customer; let second = 0; let firstBefore = 0; let secondBefore = 0;
  385 |     await journey.step('Given I registered a new customer who has a second account', async () => {
  386 |       cust = await registerCustomer(page, data, seed);
  387 |       second = await addSecondAccount(api, seed, cust);
  388 |     });
  389 |     await journey.step('And I noted the balances of both accounts', async () => {
  390 |       firstBefore = await seed.step('first account balance', () => balanceOf(api, cust.firstAccountId));
  391 |       secondBefore = await seed.step('second account balance', () => balanceOf(api, second));
  392 |     });
  393 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId, second]); });
  394 |     await journey.step('When I open a CHECKING account funded from the second account', async () => { await openOnPage(page, 'CHECKING', second); });
  395 |     await journey.step('Then the page shows "Account Opened!"', async () => {
  396 |       await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-6] "Account Opened!"').toBeVisible();
  397 |     });
  398 |     await journey.step('And the second account\'s balance is its previous balance minus 100.00', async () => {
  399 |       await expect.poll(async () => cents(await balanceOf(api, second)), { message: '[REQ AC-6] R4/R7: chosen funding account debited 100.00', timeout: 10_000 })
  400 |         .toBe(cents(secondBefore) - cents(REQ.OPENING_DEPOSIT));
  401 |     });
  402 |     await journey.step('And the first account\'s balance is unchanged', async () => {
  403 |       expect.soft(cents(await balanceOf(api, cust.firstAccountId)), '[REQ AC-6] R4: the other account is not debited').toBe(cents(firstBefore));
  404 |     });
  405 |   });
  406 | 
  407 |   REQ.R5_SERVICE_ROWS.forEach((row, i) => {
  408 |     test(`SCN-009.${i + 1}: The service opens an account only from a funding account holding at least 100.00 (${row.label})`, { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  409 |       let cust!: Customer; let funding = 0; let countBefore = 0;
  410 |       await journey.step(`Given I registered a new customer who has a funding account holding exactly ${row.label}`, async () => {
  411 |         cust = await registerCustomer(page, data, seed);
  412 |         funding = await addSecondAccount(api, seed, cust, row.fundingBalance);
  413 |         countBefore = await seed.step('number of accounts before', async () => (await listAccounts(api, cust.customerId)).body.length);
  414 |       });
  415 |       await journey.step('When I POST /createAccount for a CHECKING account funded from that account', async () => {
  416 |         await openViaService(api, cust.customerId, 'CHECKING', funding);
  417 |       });
  418 |       await journey.step(`Then the new account is ${row.opened ? 'opened' : 'not opened'}`, async () => {
  419 |         const r = await listAccounts(api, cust.customerId);
  420 |         expect.soft(Array.isArray(r.body) ? r.body.length : -1, `[REQ AC-6] R5: funding ${row.label} → ${row.opened ? 'opened' : 'not opened'}`)
  421 |           .toBe(countBefore + (row.opened ? 1 : 0));
  422 |       });
  423 |       await journey.step(`And the funding account's balance is ${row.balanceAfterLabel}`, async () => {
```