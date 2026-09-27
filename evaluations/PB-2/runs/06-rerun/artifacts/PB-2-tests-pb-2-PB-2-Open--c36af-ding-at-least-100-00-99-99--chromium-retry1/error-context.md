# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-2\tests\pb-2.spec.ts >> PB-2 Open a new CHECKING or SAVINGS account online >> SCN-010.2: The page opens an account only from a funding account holding at least 100.00 (99.99)
- Location: evaluations\PB-2\tests\pb-2.spec.ts:430:5

# Error details

```
Error: [REQ AC-6] R5: funding 99.99 → an error is shown

expect(locator).toBeVisible() failed

Locator:  getByText(/error/i).first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - [REQ AC-6] R5: funding 99.99 → an error is shown getByText(/error/i).first() with timeout 5000ms
  - waiting for getByText(/error/i).first()
    14 × locator resolved to <h1 class="title">Error!</h1>
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
- heading "Account Opened!" [level=1]
- paragraph: Congratulations, your account is now open.
- paragraph:
  - text: "Your new account number:"
  - link "35544":
    - /url: activity.htm?id=35544
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
Error: [REQ AC-6] R5: funding 99.99 → no "Account Opened!"

expect(locator).toBeHidden() failed

Locator:  getByText('Account Opened!', { exact: true })
Expected: hidden
Received: visible
Timeout:  5000ms

Call log:
  - [REQ AC-6] R5: funding 99.99 → no "Account Opened!" getByText('Account Opened!', { exact: true }) with timeout 5000ms
  - waiting for getByText('Account Opened!', { exact: true })
    14 × locator resolved to <h1 class="title">Account Opened!</h1>
       - unexpected value "visible"

```

```yaml
- heading "Account Opened!" [level=1]
```

```
Error: [REQ AC-6] R5: accounts the same as before

[REQ AC-6] R5: accounts the same as before

expect(received).toBe(expected) // Object.is equality

Expected: 2
Received: 3

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Test source

```ts
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
  424 |         expect.soft(cents(await balanceOf(api, funding)), `[REQ AC-6] R5/R7: funding balance after is ${row.balanceAfterLabel}`).toBe(cents(row.balanceAfter));
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
> 450 |           { message: `[REQ AC-6] R5: accounts ${row.accountsAfter}`, timeout: 10_000 }).toBe(countBefore + (row.opened ? 1 : 0));
      |                                                                                         ^ Error: [REQ AC-6] R5: accounts the same as before
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