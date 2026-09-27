# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-2\tests\pb-2.spec.ts >> PB-2 Open a new CHECKING or SAVINGS account online >> SCN-011: The service does not fund a new account from another customer's account
- Location: evaluations\PB-2\tests\pb-2.spec.ts:456:3

# Error details

```
Error: [REQ AC-6] R4: no account opened from another customer's account

expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 2
```

```
Error: [REQ AC-6] R4: another customer's account is not debited

expect(received).toBe(expected) // Object.is equality

Expected: 51550
Received: 41550
```

# Page snapshot

```yaml
- generic [active] [ref=f7e1]:
  - generic [ref=f7e2]:
    - generic [ref=f7e3]:
      - link:
        - /url: admin.htm
        - img [ref=f7e4] [cursor=pointer]
      - link "ParaBank":
        - /url: index.htm
        - img "ParaBank" [ref=f7e5] [cursor=pointer]
      - paragraph [ref=f7e6]: Experience the difference
    - generic [ref=f7e7]:
      - list [ref=f7e8]:
        - listitem [ref=f7e9]: Solutions
        - listitem [ref=f7e10]:
          - link "About Us" [ref=f7e11] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f7e12]:
          - link "Services" [ref=f7e13] [cursor=pointer]:
            - /url: services.htm
        - listitem [ref=f7e14]:
          - link "Products" [ref=f7e15] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/products.jsp
        - listitem [ref=f7e16]:
          - link "Locations" [ref=f7e17] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - listitem [ref=f7e18]:
          - link "Admin Page" [ref=f7e19] [cursor=pointer]:
            - /url: admin.htm
      - list [ref=f7e20]:
        - listitem [ref=f7e21]:
          - link "home" [ref=f7e22] [cursor=pointer]:
            - /url: index.htm
        - listitem [ref=f7e23]:
          - link "about" [ref=f7e24] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f7e25]:
          - link "contact" [ref=f7e26] [cursor=pointer]:
            - /url: contact.htm
    - generic [ref=f7e27]:
      - generic [ref=f7e28]:
        - paragraph [ref=f7e29]: Welcome Heldout Tester
        - heading "Account Services" [level=2] [ref=f7e30]
        - list [ref=f7e31]:
          - listitem [ref=f7e32]:
            - link "Open New Account" [ref=f7e33] [cursor=pointer]:
              - /url: openaccount.htm
          - listitem [ref=f7e34]:
            - link "Accounts Overview" [ref=f7e35] [cursor=pointer]:
              - /url: overview.htm
          - listitem [ref=f7e36]:
            - link "Transfer Funds" [ref=f7e37] [cursor=pointer]:
              - /url: transfer.htm
          - listitem [ref=f7e38]:
            - link "Bill Pay" [ref=f7e39] [cursor=pointer]:
              - /url: billpay.htm
          - listitem [ref=f7e40]:
            - link "Find Transactions" [ref=f7e41] [cursor=pointer]:
              - /url: findtrans.htm
          - listitem [ref=f7e42]:
            - link "Update Contact Info" [ref=f7e43] [cursor=pointer]:
              - /url: updateprofile.htm
          - listitem [ref=f7e44]:
            - link "Request Loan" [ref=f7e45] [cursor=pointer]:
              - /url: requestloan.htm
          - listitem [ref=f7e46]:
            - link "Log Out" [ref=f7e47] [cursor=pointer]:
              - /url: logout.htm
      - generic [ref=f7e50]:
        - heading "Accounts Overview" [level=1] [ref=f7e51]
        - table [ref=f7e52]:
          - rowgroup [ref=f7e53]:
            - row [ref=f7e54]:
              - columnheader "Account" [ref=f7e55]
              - columnheader "Balance*" [ref=f7e56]
              - columnheader "Available Amount" [ref=f7e57]
          - rowgroup [ref=f7e58]:
            - row [ref=f7e59]:
              - cell [ref=f7e60]:
                - link "27885" [ref=f7e61] [cursor=pointer]:
                  - /url: activity.htm?id=27885
              - cell "$515.50" [ref=f7e62]
              - cell "$515.50" [ref=f7e63]
            - row [ref=f7e64]:
              - cell "Total" [ref=f7e65]
              - cell "$515.50" [ref=f7e66]
              - cell [ref=f7e67]
          - rowgroup [ref=f7e68]:
            - row [ref=f7e69]:
              - cell "*Balance includes deposits that may be subject to holds" [ref=f7e70]
  - generic [ref=f7e72]:
    - list [ref=f7e73]:
      - listitem [ref=f7e74]:
        - link "Home" [ref=f7e75] [cursor=pointer]:
          - /url: index.htm
        - text: "|"
      - listitem [ref=f7e76]:
        - link "About Us" [ref=f7e77] [cursor=pointer]:
          - /url: about.htm
        - text: "|"
      - listitem [ref=f7e78]:
        - link "Services" [ref=f7e79] [cursor=pointer]:
          - /url: services.htm
        - text: "|"
      - listitem [ref=f7e80]:
        - link "Products" [ref=f7e81] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/products.jsp
        - text: "|"
      - listitem [ref=f7e82]:
        - link "Locations" [ref=f7e83] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - text: "|"
      - listitem [ref=f7e84]:
        - link "Forum" [ref=f7e85] [cursor=pointer]:
          - /url: http://forums.parasoft.com/
        - text: "|"
      - listitem [ref=f7e86]:
        - link "Site Map" [ref=f7e87] [cursor=pointer]:
          - /url: sitemap.htm
        - text: "|"
      - listitem [ref=f7e88]:
        - link "Contact Us" [ref=f7e89] [cursor=pointer]:
          - /url: contact.htm
    - paragraph [ref=f7e90]: © Parasoft. All rights reserved.
    - list [ref=f7e91]:
      - listitem [ref=f7e92]: "Visit us at:"
      - listitem [ref=f7e93]:
        - link "www.parasoft.com" [ref=f7e94] [cursor=pointer]:
          - /url: http://www.parasoft.com/
```

# Test source

```ts
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
  448 |           { message: `[REQ AC-6] R5: accounts ${row.accountsAfter}`, timeout: 10_000 }).toBe(countBefore + (row.opened ? 1 : 0));
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
> 474 |       expect.soft(cents(await balanceOf(api, b.firstAccountId)), '[REQ AC-6] R4: another customer\'s account is not debited').toBe(cents(bBefore));
      |                                                                                                                               ^ Error: [REQ AC-6] R4: another customer's account is not debited
  475 |     });
  476 |   });
  477 | });
  478 | 
```