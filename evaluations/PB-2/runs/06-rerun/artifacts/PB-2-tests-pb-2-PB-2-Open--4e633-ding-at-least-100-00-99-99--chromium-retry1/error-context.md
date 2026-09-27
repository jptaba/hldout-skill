# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-2\tests\pb-2.spec.ts >> PB-2 Open a new CHECKING or SAVINGS account online >> SCN-009.2: The service opens an account only from a funding account holding at least 100.00 (99.99)
- Location: evaluations\PB-2\tests\pb-2.spec.ts:408:5

# Error details

```
Error: [REQ AC-6] R5: funding 99.99 → not opened

expect(received).toBe(expected) // Object.is equality

Expected: 2
Received: 3
```

```
Error: [REQ AC-6] R5/R7: funding balance after is 99.99

expect(received).toBe(expected) // Object.is equality

Expected: 9999
Received: -1
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
                - link "33324" [ref=f3e61] [cursor=pointer]:
                  - /url: activity.htm?id=33324
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
> 424 |         expect.soft(cents(await balanceOf(api, funding)), `[REQ AC-6] R5/R7: funding balance after is ${row.balanceAfterLabel}`).toBe(cents(row.balanceAfter));
      |                                                                                                                                  ^ Error: [REQ AC-6] R5/R7: funding balance after is 99.99
  425 |       });
  426 |     });
  427 |   });
  428 | 
  429 |   REQ.R5_PAGE_ROWS.forEach((row, i) => {
  430 |     test(`SCN-010.${i + 1}: The page opens an account only from a funding account holding at least 100.00 (${row.label})`, { tag: ['@AC-6', '@type:boundary', '@layer:e2e', '@P1', '@needs-clarification'] }, async ({ page, api, journey, data, seed }) => {
  431 |       let cust!: Customer; let funding = 0; let countBefore = 0;
  432 |       await journey.step(`Given I registered a new customer who has a funding account holding exactly ${row.label}`, async () => {
  433 |         cust = await registerCustomer(page, data, seed);
  434 |         funding = await addSecondAccount(api, seed, cust, row.fundingBalance);
  435 |         countBefore = await seed.step('number of accounts before', async () => (await listAccounts(api, cust.customerId)).body.length);
  436 |       });
  437 |       await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId, funding]); });
  438 |       await journey.step('When I open a SAVINGS account funded from that account', async () => { await openOnPage(page, 'SAVINGS', funding); });
  439 |       await journey.step(`Then the page shows ${row.pageOutcome}`, async () => {
  440 |         if (row.opened) {
  441 |           await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-6] R5: funding 100.00 → "Account Opened!"').toBeVisible();
  442 |         } else {
  443 |           // G6: the error's wording is not stated — only that an error is shown instead of the opening.
  444 |           await expect.soft(page.getByText(/error/i).first(), '[REQ AC-6] R5: funding 99.99 → an error is shown').toBeVisible(); // G6: no stated wording; the page showed no error to locate (observed deviation)
  445 |           await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-6] R5: funding 99.99 → no "Account Opened!"').toBeHidden();
  446 |         }
  447 |       });
  448 |       await journey.step(`And the customer's accounts are ${row.accountsAfter}`, async () => {
  449 |         await expect.poll(async () => { const r = await listAccounts(api, cust.customerId); return Array.isArray(r.body) ? r.body.length : -1; },
  450 |           { message: `[REQ AC-6] R5: accounts ${row.accountsAfter}`, timeout: 10_000 }).toBe(countBefore + (row.opened ? 1 : 0));
  451 |       });
  452 |       await journey.step(`And the funding account's balance is ${row.balanceAfterLabel}`, async () => {
  453 |         expect.soft(cents(await balanceOf(api, funding)), `[REQ AC-6] R5/R7: funding balance after is ${row.balanceAfterLabel}`).toBe(cents(row.balanceAfter));
  454 |       });
  455 |     });
  456 |   });
  457 | 
  458 |   test('SCN-011: The service does not fund a new account from another customer\'s account', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1', '@needs-clarification'] }, async ({ page, api, journey, data, seed }) => {
  459 |     let a!: Customer; let b!: Customer; let bBefore = 0; let aCountBefore = 0;
  460 |     await journey.step('Given I registered customer A and customer B', async () => {
  461 |       b = await registerCustomer(page, data, seed, 'customer B (register.htm)');
  462 |       a = await registerCustomer(page, data, seed, 'customer A (register.htm)');
  463 |       aCountBefore = await seed.step('customer A account count', async () => (await listAccounts(api, a.customerId)).body.length);
  464 |     });
  465 |     await journey.step('And I noted the balance of customer B\'s account', async () => {
  466 |       bBefore = await seed.step('customer B balance', () => balanceOf(api, b.firstAccountId));
  467 |     });
  468 |     await journey.step('When I POST /createAccount for customer A funded from customer B\'s account', async () => {
  469 |       await openViaService(api, a.customerId, 'CHECKING', b.firstAccountId);
  470 |     });
  471 |     await journey.step('Then no new account is opened for customer A', async () => {
  472 |       const r = await listAccounts(api, a.customerId);
  473 |       expect.soft(Array.isArray(r.body) ? r.body.length : -1, '[REQ AC-6] R4: no account opened from another customer\'s account').toBe(aCountBefore);
  474 |     });
  475 |     await journey.step('And customer B\'s account balance is unchanged', async () => {
  476 |       expect.soft(cents(await balanceOf(api, b.firstAccountId)), '[REQ AC-6] R4: another customer\'s account is not debited').toBe(cents(bBefore));
  477 |     });
  478 |   });
  479 | });
  480 | 
```