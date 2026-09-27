# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-2\tests\pb-2.spec.ts >> PB-2 Open a new CHECKING or SAVINGS account online >> SCN-010.2: The page opens an account only from a funding account holding at least 100.00 (99.99)
- Location: evaluations\PB-2\tests\pb-2.spec.ts:428:5

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
    13 × locator resolved to <h1 class="title">Error!</h1>
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
  - link "27330":
    - /url: activity.htm?id=27330
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
  348 |       newId = await newAccountIdOnPage(page);
  349 |     });
  350 |     await journey.step('Then the funding account\'s transactions include a Debit of 100.00 "Funds Transfer Sent"', async () => {
  351 |       const txs = await transactions(api, cust.firstAccountId);
  352 |       expect.soft(txs.some((t) => txMatches(t, REQ.FUNDING_TX)), '[REQ AC-5] funding account: Debit 100.00 "Funds Transfer Sent"').toBe(true);
  353 |     });
  354 |     await journey.step('And the new account\'s transactions include a Credit of 100.00 "Funds Transfer Received"', async () => {
  355 |       const txs = await transactions(api, newId);
  356 |       expect.soft(txs.some((t) => txMatches(t, REQ.NEW_ACCOUNT_TX)), '[REQ AC-5] new account: Credit 100.00 "Funds Transfer Received"').toBe(true);
  357 |     });
  358 |   });
  359 | 
  360 |   test('SCN-007: The service takes the opening deposit from the funding account the customer chose', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  361 |     let cust!: Customer; let second = 0; let firstBefore = 0; let secondBefore = 0;
  362 |     await journey.step('Given I registered a new customer who has a second account', async () => {
  363 |       cust = await registerCustomer(page, data, seed);
  364 |       second = await addSecondAccount(api, seed, cust);
  365 |     });
  366 |     await journey.step('And I noted the balances of both accounts', async () => {
  367 |       firstBefore = await seed.step('first account balance', () => balanceOf(api, cust.firstAccountId));
  368 |       secondBefore = await seed.step('second account balance', () => balanceOf(api, second));
  369 |     });
  370 |     await journey.step('When I POST /createAccount for a SAVINGS account funded from the second account', async () => {
  371 |       await openViaService(api, cust.customerId, 'SAVINGS', second);
  372 |     });
  373 |     await journey.step('Then the second account\'s balance is its previous balance minus 100.00', async () => {
  374 |       expect.soft(cents(await balanceOf(api, second)), '[REQ AC-6] R4/R7: chosen funding account debited 100.00').toBe(cents(secondBefore) - cents(REQ.OPENING_DEPOSIT));
  375 |     });
  376 |     await journey.step('And the first account\'s balance is unchanged', async () => {
  377 |       expect.soft(cents(await balanceOf(api, cust.firstAccountId)), '[REQ AC-6] R4: the other account is not debited').toBe(cents(firstBefore));
  378 |     });
  379 |   });
  380 | 
  381 |   test('SCN-008: The page takes the opening deposit from the funding account the customer chose', { tag: ['@AC-6', '@type:functional', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  382 |     let cust!: Customer; let second = 0; let firstBefore = 0; let secondBefore = 0;
  383 |     await journey.step('Given I registered a new customer who has a second account', async () => {
  384 |       cust = await registerCustomer(page, data, seed);
  385 |       second = await addSecondAccount(api, seed, cust);
  386 |     });
  387 |     await journey.step('And I noted the balances of both accounts', async () => {
  388 |       firstBefore = await seed.step('first account balance', () => balanceOf(api, cust.firstAccountId));
  389 |       secondBefore = await seed.step('second account balance', () => balanceOf(api, second));
  390 |     });
  391 |     await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId, second]); });
  392 |     await journey.step('When I open a CHECKING account funded from the second account', async () => { await openOnPage(page, 'CHECKING', second); });
  393 |     await journey.step('Then the page shows "Account Opened!"', async () => {
  394 |       await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-6] "Account Opened!"').toBeVisible();
  395 |     });
  396 |     await journey.step('And the second account\'s balance is its previous balance minus 100.00', async () => {
  397 |       await expect.poll(async () => cents(await balanceOf(api, second)), { message: '[REQ AC-6] R4/R7: chosen funding account debited 100.00', timeout: 10_000 })
  398 |         .toBe(cents(secondBefore) - cents(REQ.OPENING_DEPOSIT));
  399 |     });
  400 |     await journey.step('And the first account\'s balance is unchanged', async () => {
  401 |       expect.soft(cents(await balanceOf(api, cust.firstAccountId)), '[REQ AC-6] R4: the other account is not debited').toBe(cents(firstBefore));
  402 |     });
  403 |   });
  404 | 
  405 |   REQ.R5_SERVICE_ROWS.forEach((row, i) => {
  406 |     test(`SCN-009.${i + 1}: The service opens an account only from a funding account holding at least 100.00 (${row.label})`, { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  407 |       let cust!: Customer; let funding = 0; let countBefore = 0;
  408 |       await journey.step(`Given I registered a new customer who has a funding account holding exactly ${row.label}`, async () => {
  409 |         cust = await registerCustomer(page, data, seed);
  410 |         funding = await addSecondAccount(api, seed, cust, row.fundingBalance);
  411 |         countBefore = await seed.step('number of accounts before', async () => (await listAccounts(api, cust.customerId)).body.length);
  412 |       });
  413 |       await journey.step('When I POST /createAccount for a CHECKING account funded from that account', async () => {
  414 |         await openViaService(api, cust.customerId, 'CHECKING', funding);
  415 |       });
  416 |       await journey.step(`Then the new account is ${row.opened ? 'opened' : 'not opened'}`, async () => {
  417 |         const r = await listAccounts(api, cust.customerId);
  418 |         expect.soft(Array.isArray(r.body) ? r.body.length : -1, `[REQ AC-6] R5: funding ${row.label} → ${row.opened ? 'opened' : 'not opened'}`)
  419 |           .toBe(countBefore + (row.opened ? 1 : 0));
  420 |       });
  421 |       await journey.step(`And the funding account's balance is ${row.balanceAfterLabel}`, async () => {
  422 |         expect.soft(cents(await balanceOf(api, funding)), `[REQ AC-6] R5/R7: funding balance after is ${row.balanceAfterLabel}`).toBe(cents(row.balanceAfter));
  423 |       });
  424 |     });
  425 |   });
  426 | 
  427 |   REQ.R5_PAGE_ROWS.forEach((row, i) => {
  428 |     test(`SCN-010.${i + 1}: The page opens an account only from a funding account holding at least 100.00 (${row.label})`, { tag: ['@AC-6', '@type:boundary', '@layer:e2e', '@P1', '@needs-clarification'] }, async ({ page, api, journey, data, seed }) => {
  429 |       let cust!: Customer; let funding = 0; let countBefore = 0;
  430 |       await journey.step(`Given I registered a new customer who has a funding account holding exactly ${row.label}`, async () => {
  431 |         cust = await registerCustomer(page, data, seed);
  432 |         funding = await addSecondAccount(api, seed, cust, row.fundingBalance);
  433 |         countBefore = await seed.step('number of accounts before', async () => (await listAccounts(api, cust.customerId)).body.length);
  434 |       });
  435 |       await journey.step('And I am on the Open New Account page', async () => { await openAccountPage(page, [cust.firstAccountId, funding]); });
  436 |       await journey.step('When I open a SAVINGS account funded from that account', async () => { await openOnPage(page, 'SAVINGS', funding); });
  437 |       await journey.step(`Then the page shows ${row.pageOutcome}`, async () => {
  438 |         if (row.opened) {
  439 |           await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-6] R5: funding 100.00 → "Account Opened!"').toBeVisible();
  440 |         } else {
  441 |           // G6: the error's wording is not stated — only that an error is shown instead of the opening.
  442 |           await expect.soft(page.getByText(/error/i).first(), '[REQ AC-6] R5: funding 99.99 → an error is shown').toBeVisible(); // G6: no stated wording; the page showed no error to locate (observed deviation)
  443 |           await expect.soft(page.getByText(REQ.OPENED_TITLE, { exact: true }), '[REQ AC-6] R5: funding 99.99 → no "Account Opened!"').toBeHidden();
  444 |         }
  445 |       });
  446 |       await journey.step(`And the customer's accounts are ${row.accountsAfter}`, async () => {
  447 |         await expect.poll(async () => { const r = await listAccounts(api, cust.customerId); return Array.isArray(r.body) ? r.body.length : -1; },
> 448 |           { message: `[REQ AC-6] R5: accounts ${row.accountsAfter}`, timeout: 10_000 }).toBe(countBefore + (row.opened ? 1 : 0));
      |                                                                                         ^ Error: [REQ AC-6] R5: accounts the same as before
  449 |       });
  450 |       await journey.step(`And the funding account's balance is ${row.balanceAfterLabel}`, async () => {
  451 |         expect.soft(cents(await balanceOf(api, funding)), `[REQ AC-6] R5/R7: funding balance after is ${row.balanceAfterLabel}`).toBe(cents(row.balanceAfter));
  452 |       });
  453 |     });
  454 |   });
  455 | 
  456 |   test('SCN-011: The service does not fund a new account from another customer\'s account', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1', '@needs-clarification'] }, async ({ page, api, journey, data, seed }) => {
  457 |     let a!: Customer; let b!: Customer; let bBefore = 0; let aCountBefore = 0;
  458 |     await journey.step('Given I registered customer A and customer B', async () => {
  459 |       b = await registerCustomer(page, data, seed, 'customer B (register.htm)');
  460 |       a = await registerCustomer(page, data, seed, 'customer A (register.htm)');
  461 |       aCountBefore = await seed.step('customer A account count', async () => (await listAccounts(api, a.customerId)).body.length);
  462 |     });
  463 |     await journey.step('And I noted the balance of customer B\'s account', async () => {
  464 |       bBefore = await seed.step('customer B balance', () => balanceOf(api, b.firstAccountId));
  465 |     });
  466 |     await journey.step('When I POST /createAccount for customer A funded from customer B\'s account', async () => {
  467 |       await openViaService(api, a.customerId, 'CHECKING', b.firstAccountId);
  468 |     });
  469 |     await journey.step('Then no new account is opened for customer A', async () => {
  470 |       const r = await listAccounts(api, a.customerId);
  471 |       expect.soft(Array.isArray(r.body) ? r.body.length : -1, '[REQ AC-6] R4: no account opened from another customer\'s account').toBe(aCountBefore);
  472 |     });
  473 |     await journey.step('And customer B\'s account balance is unchanged', async () => {
  474 |       expect.soft(cents(await balanceOf(api, b.firstAccountId)), '[REQ AC-6] R4: another customer\'s account is not debited').toBe(cents(bBefore));
  475 |     });
  476 |   });
  477 | });
  478 | 
```