# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-3\tests\pb-3.spec.ts >> PB-3 Transfer funds between my own accounts >> SCN-006.2: A zero or negative amount is refused by the REST service (-10.00)
- Location: evaluations\PB-3\tests\pb-3.spec.ts:287:5

# Error details

```
Error: [REQ AC-5] POST /transfer does not answer with the success confirmation

expect(received).not.toMatch(expected)

Expected pattern: not /^\s*Successfully transferred/
Received string:      "Successfully transferred $-10.00 from account #54525 to account #54636"
```

```
Error: [REQ AC-5] GET /accounts/<A> balance unchanged

expect(received).toBeCloseTo(expected, precision)

Expected: 415.5
Received: 425.5

Expected precision:    2
Expected difference: < 0.005
Received difference:   10
```

```
Error: [REQ AC-5] GET /accounts/<B> balance unchanged

expect(received).toBeCloseTo(expected, precision)

Expected: 100
Received: 90

Expected precision:    2
Expected difference: < 0.005
Received difference:   10
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
        - heading "Account Opened!" [level=1] [ref=f3e51]
        - paragraph [ref=f3e52]: Congratulations, your account is now open.
        - paragraph [ref=f3e53]:
          - text: "Your new account number:"
          - link "54636" [ref=f3e54] [cursor=pointer]:
            - /url: activity.htm?id=54636
  - generic [ref=f3e56]:
    - list [ref=f3e57]:
      - listitem [ref=f3e58]:
        - link "Home" [ref=f3e59] [cursor=pointer]:
          - /url: index.htm
        - text: "|"
      - listitem [ref=f3e60]:
        - link "About Us" [ref=f3e61] [cursor=pointer]:
          - /url: about.htm
        - text: "|"
      - listitem [ref=f3e62]:
        - link "Services" [ref=f3e63] [cursor=pointer]:
          - /url: services.htm
        - text: "|"
      - listitem [ref=f3e64]:
        - link "Products" [ref=f3e65] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/products.jsp
        - text: "|"
      - listitem [ref=f3e66]:
        - link "Locations" [ref=f3e67] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - text: "|"
      - listitem [ref=f3e68]:
        - link "Forum" [ref=f3e69] [cursor=pointer]:
          - /url: http://forums.parasoft.com/
        - text: "|"
      - listitem [ref=f3e70]:
        - link "Site Map" [ref=f3e71] [cursor=pointer]:
          - /url: sitemap.htm
        - text: "|"
      - listitem [ref=f3e72]:
        - link "Contact Us" [ref=f3e73] [cursor=pointer]:
          - /url: contact.htm
    - paragraph [ref=f3e74]: © Parasoft. All rights reserved.
    - list [ref=f3e75]:
      - listitem [ref=f3e76]: "Visit us at:"
      - listitem [ref=f3e77]:
        - link "www.parasoft.com" [ref=f3e78] [cursor=pointer]:
          - /url: http://www.parasoft.com/
```

# Test source

```ts
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
  244 |       const row = table.getByRole('row').filter({ hasText: REQ.AC3.ACTIVITY_DESCRIPTION }).filter({ has: page.getByRole('cell', { name: REQ.AC3.ACTIVITY_DEBIT, exact: true }) });
  245 |       await expect.soft(row.first().getByRole('cell').nth(col), '[REQ AC-3] Account Activity of A: "Funds Transfer Sent" with $25.50 in Debit (-)').toHaveText(REQ.AC3.ACTIVITY_DEBIT);
  246 |     });
  247 |   });
  248 | 
  249 |   REQ.AC4.forEach((row, i) => {
  250 |     test(`SCN-004.${i + 1}: An empty or non-numeric amount keeps the Transfer Funds form on screen (amount "${row.amount}")`, { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  251 |       let c!: Customer;
  252 |       let a0 = 0; let b0 = 0;
  253 |       await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  254 |       await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
  255 |       await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
  256 |       await journey.step(`When I enter "${row.amount}" as the amount and press Transfer`, () => fillTransfer(page, row.amount, c.A, c.B));
  257 |       await journey.step(`Then the Transfer Funds form stays on screen with the message "${row.message}"`, async () => {
  258 |         await expect.soft(page.getByText(row.message, { exact: true }), `[REQ AC-4] message "${row.message}" shown`).toBeVisible();
  259 |         await expect.soft(page.getByRole('button', { name: 'Transfer', exact: true }), '[REQ AC-4] Transfer Funds form stays on screen').toBeVisible();
  260 |       });
  261 |       await journey.step('And the balances of A and B do not change', async () => {
  262 |         expect.soft(await balance(api, c.A), '[REQ AC-4] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
  263 |         expect.soft(await balance(api, c.B), '[REQ AC-4] GET /accounts/<B> balance unchanged').toBeCloseTo(b0, 2);
  264 |       });
  265 |     });
  266 |   });
  267 | 
  268 |   REQ.AC5.AMOUNTS.forEach((amount, i) => {
  269 |     test(`SCN-005.${i + 1}: A zero or negative amount is refused on the Transfer Funds page (${amount})`, { tag: ['@AC-5', '@type:boundary', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  270 |       let c!: Customer;
  271 |       let a0 = 0; let b0 = 0;
  272 |       await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  273 |       await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
  274 |       await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
  275 |       await journey.step(`When I transfer ${amount} from A to B`, () => fillTransfer(page, amount, c.A, c.B));
  276 |       await journey.step('Then the transfer is refused (the page does not show "Transfer Complete!") — bounded 5 s wait for the confirmation', async () => {
  277 |         expect.soft(await appears(page, REQ.AC5.COMPLETE), '[REQ AC-5] page does not show "Transfer Complete!"').toBe(false);
  278 |       });
  279 |       await journey.step('And the balances of A and B do not change', async () => {
  280 |         expect.soft(await balance(api, c.A), '[REQ AC-5] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
  281 |         expect.soft(await balance(api, c.B), '[REQ AC-5] GET /accounts/<B> balance unchanged').toBeCloseTo(b0, 2);
  282 |       });
  283 |     });
  284 |   });
  285 | 
  286 |   REQ.AC5.AMOUNTS.forEach((amount, i) => {
  287 |     test(`SCN-006.${i + 1}: A zero or negative amount is refused by the REST service (${amount})`, { tag: ['@AC-5', '@type:boundary', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  288 |       let c!: Customer;
  289 |       let a0 = 0; let b0 = 0;
  290 |       let res!: ApiResponse<unknown>;
  291 |       await journey.step('Given a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  292 |       await journey.step('And the balances of A and B are read with GET /accounts/{accountId}', async () => { [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]); });
  293 |       await journey.step(`When the service is called with fromAccountId A, toAccountId B and amount ${amount}`, async () => { res = await transfer(api, c.A, c.B, amount); });
  294 |       await journey.step('Then the transfer is refused (the service does not answer with the success confirmation of AC-2)', async () => {
  295 |         expect.soft(res.text, '[REQ AC-5] POST /transfer does not answer with the success confirmation').not.toMatch(REQ.AC5.SUCCESS_PREFIX);
  296 |       });
  297 |       await journey.step('And the balances of A and B do not change', async () => {
  298 |         expect.soft(await balance(api, c.A), '[REQ AC-5] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
> 299 |         expect.soft(await balance(api, c.B), '[REQ AC-5] GET /accounts/<B> balance unchanged').toBeCloseTo(b0, 2);
      |                                                                                                ^ Error: [REQ AC-5] GET /accounts/<B> balance unchanged
  300 |       });
  301 |     });
  302 |   });
  303 | 
  304 |   test('SCN-007: The REST service completes a transfer of 1000.00, more than the balance of A', { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  305 |     let c!: Customer;
  306 |     let a0 = 0; let b0 = 0;
  307 |     let res!: ApiResponse<unknown>;
  308 |     await journey.step('Given a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  309 |     await journey.step('And the balance of A is lower than 1000.00', async () => {
  310 |       [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]);
  311 |       expect(a0, 'balance of A is lower than 1000.00 (precondition)').toBeLessThan(REQ.AC6.LIMIT);
  312 |     });
  313 |     await journey.step('When the service is called with fromAccountId A, toAccountId B and amount 1000.00', async () => { res = await transfer(api, c.A, c.B, REQ.AC6.AMOUNT); });
  314 |     await journey.step('Then it answers 200 with the same confirmation as any other transfer', async () => {
  315 |       expect.soft(res.status, '[REQ AC-6] POST /transfer answers 200').toBe(REQ.STATUS.OK);
  316 |       expect.soft(res.text.trim(), '[REQ AC-6] POST /transfer body is the transfer confirmation for 1000.00').toMatch(REQ.AC6.TEXT(c.A, c.B));
  317 |     });
  318 |     await journey.step('And the balance of A goes negative by the difference', async () => {
  319 |       expect.soft(await balance(api, c.A), '[REQ AC-6] GET /accounts/<A> balance = before − 1000.00 (negative)').toBeCloseTo(a0 - REQ.AC6.DELTA, 2);
  320 |     });
  321 |     await journey.step('And B is credited with the full amount', async () => {
  322 |       expect.soft(await balance(api, c.B), '[REQ AC-6] GET /accounts/<B> balance = before + 1000.00').toBeCloseTo(b0 + REQ.AC6.DELTA, 2);
  323 |     });
  324 |   });
  325 | 
  326 |   test('SCN-008: The Transfer Funds page completes a transfer of 1000.00, more than the balance of A', { tag: ['@AC-6', '@type:boundary', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  327 |     let c!: Customer;
  328 |     let a0 = 0; let b0 = 0;
  329 |     await journey.step('Given I am signed in as a newly registered customer who owns accounts A and B', async () => { c = await newCustomer(page, seed, data); });
  330 |     await journey.step('And the balance of A is lower than 1000.00', async () => {
  331 |       [a0, b0] = await balancesBefore(api, seed, [c.A, c.B]);
  332 |       expect(a0, 'balance of A is lower than 1000.00 (precondition)').toBeLessThan(REQ.AC6.LIMIT);
  333 |     });
  334 |     await journey.step('And I am on the Transfer Funds page', () => openTransferPage(page));
  335 |     await journey.step('When I transfer 1000.00 from A to B', () => fillTransfer(page, REQ.AC6.AMOUNT, c.A, c.B));
  336 |     await journey.step('Then the page shows "Transfer Complete!"', async () => {
  337 |       await expect.soft(page.getByRole('heading', { name: REQ.AC6.COMPLETE, exact: true }), '[REQ AC-6] "Transfer Complete!" shown').toBeVisible();
  338 |     });
  339 |     await journey.step('And the balance of A goes negative by the difference', async () => {
  340 |       expect.soft(await balance(api, c.A), '[REQ AC-6] GET /accounts/<A> balance = before − 1000.00 (negative)').toBeCloseTo(a0 - REQ.AC6.DELTA, 2);
  341 |     });
  342 |     await journey.step('And B is credited with the full amount', async () => {
  343 |       expect.soft(await balance(api, c.B), '[REQ AC-6] GET /accounts/<B> balance = before + 1000.00').toBeCloseTo(b0 + REQ.AC6.DELTA, 2);
  344 |     });
  345 |   });
  346 | 
  347 |   test('SCN-009: The REST service refuses an unknown destination account', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  348 |     let c!: Customer;
  349 |     let a0 = 0;
  350 |     let res!: ApiResponse<unknown>;
  351 |     await journey.step('Given a newly registered customer who owns account A', async () => { c = await newCustomer(page, seed, data); });
  352 |     await journey.step('And the balance of A is read with GET /accounts/{accountId}', async () => { [a0] = await balancesBefore(api, seed, [c.A]); });
  353 |     await journey.step('When the service is called with fromAccountId A, toAccountId 99999999 and amount 5.00', async () => { res = await transfer(api, c.A, REQ.AC7.TO, REQ.AC7.AMOUNT); });
  354 |     await journey.step('Then it answers 400', async () => {
  355 |       expect.soft(res.status, '[REQ AC-7] POST /transfer answers 400').toBe(REQ.STATUS.BAD_REQUEST);
  356 |     });
  357 |     await journey.step('And the body is the text "Could not find account number <A> and/or 99999999"', async () => {
  358 |       expect.soft(res.text.trim(), '[REQ AC-7] POST /transfer body is the not-found text').toBe(REQ.AC7.TEXT(c.A));
  359 |     });
  360 |     await journey.step('And the balance of A does not change', async () => {
  361 |       expect.soft(await balance(api, c.A), '[REQ AC-7] GET /accounts/<A> balance unchanged').toBeCloseTo(a0, 2);
  362 |     });
  363 |   });
  364 | });
  365 | 
```