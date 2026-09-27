# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-2\tests\pb-2.spec.ts >> PB-2 Open a new CHECKING or SAVINGS account online >> SCN-009.2: The service opens an account only from a funding account holding at least 100.00 (99.99)
- Location: evaluations\PB-2\tests\pb-2.spec.ts:406:5

# Error details

```
TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
```

# Page snapshot

```yaml
- generic [ref=f3e3]:
  - banner [ref=f3e4]:
    - heading "Error 1015" [level=1] [ref=f3e5]
    - generic [ref=f3e6]: "Ray ID: a41a6bb2ca6f4350 •"
    - generic [ref=f3e7]: 2026-09-27 12:13:08 UTC
    - heading "You are being rate limited" [level=2] [ref=f3e8]
  - generic [ref=f3e10]:
    - heading "What happened?" [level=2] [ref=f3e11]
    - paragraph [ref=f3e12]: The owner of this website (parabank.parasoft.com) has banned you temporarily from accessing this website.
    - paragraph [ref=f3e13]:
      - text: Please see
      - link "https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/" [ref=f3e14] [cursor=pointer]:
        - /url: https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/
      - text: for more details.
  - generic [ref=f3e16]:
    - text: Was this page helpful?
    - button "Yes" [ref=f3e17] [cursor=pointer]
    - button "No" [ref=f3e18] [cursor=pointer]
  - paragraph [ref=f3e20]:
    - generic [ref=f3e21]:
      - text: "Cloudflare Ray ID:"
      - strong [ref=f3e22]: a41a6bb2ca6f4350
    - text: •
    - generic [ref=f3e23]:
      - text: "Your IP:"
      - button "Click to reveal" [ref=f3e24] [cursor=pointer]
      - text: •
    - generic [ref=f3e25]:
      - text: Performance & security by
      - link "Cloudflare" [ref=f3e26] [cursor=pointer]:
        - /url: https://www.cloudflare.com/5xx-error-landing
```

# Test source

```ts
  11  |   ACCOUNT_TYPES: ['CHECKING', 'SAVINGS'],
  12  |   /** AC-1, R3. */
  13  |   MIN_DEPOSIT_TEXT: 'A minimum of $100.00 must be deposited into this account at time of opening.',
  14  |   /** AC-2 confirmation copy. */
  15  |   OPENED_TITLE: 'Account Opened!',
  16  |   OPENED_TEXT: 'Congratulations, your account is now open.',
  17  |   NEW_NUMBER_LABEL: 'Your new account number:',
  18  |   /** R3, R6: opening deposit / opening balance (API numbers, in USD). */
  19  |   OPENING_DEPOSIT: 100.0,
  20  |   /** AC-2, AC-3: the opening balance as the page shows it. */
  21  |   OPENING_BALANCE_UI: '$100.00',
  22  |   /** AC-4. */
  23  |   STATUS_OK: 200,
  24  |   /** AC-5, R8, R9. */
  25  |   FUNDING_TX: { type: 'Debit', amount: 100.0, description: 'Funds Transfer Sent' },
  26  |   NEW_ACCOUNT_TX: { type: 'Credit', amount: 100.0, description: 'Funds Transfer Received' },
  27  |   /** R5: balance >= 100.00 opens; below is refused, nothing moves. */
  28  |   R5_SERVICE_ROWS: [
  29  |     { fundingBalance: 100.0, label: '100.00', opened: true, balanceAfter: 0.0, balanceAfterLabel: '0.00' },
  30  |     { fundingBalance: 99.99, label: '99.99', opened: false, balanceAfter: 99.99, balanceAfterLabel: '99.99' },
  31  |   ],
  32  |   R5_PAGE_ROWS: [
  33  |     { fundingBalance: 100.0, label: '100.00', opened: true, pageOutcome: '"Account Opened!"', accountsAfter: 'one more than before', balanceAfter: 0.0, balanceAfterLabel: '0.00' },
  34  |     { fundingBalance: 99.99, label: '99.99', opened: false, pageOutcome: 'an error instead of the opening', accountsAfter: 'the same as before', balanceAfter: 99.99, balanceAfterLabel: '99.99' },
  35  |   ],
  36  | } as const;
  37  | // @req-constants-end
  38  | 
  39  | // Endpoints exactly as declared in the requirement.
  40  | const EP = {
  41  |   /** POST /createAccount */ createAccount: '/createAccount',
  42  |   /** GET /customers/{customerId}/accounts */ customerAccounts: (customerId: string | number) => `/customers/${customerId}/accounts`,
  43  |   /** GET /accounts/{accountId} */ account: (accountId: string | number) => `/accounts/${accountId}`,
  44  |   /** GET /accounts/{accountId}/transactions */ transactions: (accountId: string | number) => `/accounts/${accountId}/transactions`,
  45  | };
  46  | // Plumbing only (declared as # SEED-ENDPOINT in scenarios.feature).
  47  | const SEED_EP = {
  48  |   /** move money between the customer's own accounts to give a funding account an exact balance (G5) */
  49  |   transfer: '/transfer',
  50  | };
  51  | 
  52  | /** G1: how newAccountType encodes the type (mechanics, discovered during hardening). */
  53  | // OpenAPI: newAccountType is an int32 query parameter "(CHECKING, SAVINGS, LOAN)"; live: 1 → SAVINGS (hardening/api-chain-mechanics.md).
  54  | const TYPE_PARAM: Record<'CHECKING' | 'SAVINGS', number> = { CHECKING: 0, SAVINGS: 1 };
  55  | 
  56  | type AccountType = 'CHECKING' | 'SAVINGS';
  57  | interface Account { id: number; customerId: number; type: string; balance: number }
  58  | interface Customer { username: string; customerId: number; firstAccountId: number }
  59  | 
  60  | const cents = (v: unknown) => Math.round(Number(v) * 100);
  61  | 
  62  | // ---- shared-sandbox pacing (mechanics) ------------------------------------------------------------
  63  | // The demo sits behind Cloudflare, which rate-limits bursts (HTTP 429 / "Error 1015", retry_after ≈ 30 s),
  64  | // also caused by other clients of the shared sandbox. A 429 means the request was not processed, so wait as
  65  | // told and send it again; decorative images are not loaded, to keep each page view to a few requests.
  66  | const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  67  | async function gentle<T>(call: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
  68  |   let r = await call();
  69  |   for (let i = 0; i < 3 && r.status === 429; i++) {
  70  |     const after = Number((r.body as { retry_after?: number } | undefined)?.retry_after ?? r.headers['retry-after'] ?? 30);
  71  |     await sleep(Math.min(Math.max(after, 5), 60) * 1000);
  72  |     r = await call();
  73  |   }
  74  |   return r;
  75  | }
  76  | const rateLimited = async (page: Page) => (await page.getByRole('heading', { name: /Error 1015|being rate limited/i }).count()) > 0;
  77  | /** Entry-point navigation that waits out a rate-limit page. */
  78  | async function go(page: Page, path: string): Promise<void> {
  79  |   for (let i = 0; ; i++) {
  80  |     await gotoPage(page, path);
  81  |     if (i >= 3 || !(await rateLimited(page))) return;
  82  |     await sleep(35_000);
  83  |   }
  84  | }
  85  | 
  86  | // ---- helpers (mechanics) -------------------------------------------------------------------------
  87  | 
  88  | /** Register a fresh customer on register.htm (the story's route), leaving the page signed in as that customer. */
  89  | async function registerCustomer(page: Page, data: TestData, seed: Seed, label = 'new customer (register.htm)'): Promise<Customer> {
  90  |   return seed.create(label, async () => {
  91  |     const username = `hx${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  92  |     await go(page, 'logout.htm'); // a previous customer's session (SCN-011 registers two)
  93  |     await go(page, 'register.htm');
  94  |     const c = data.customer;
  95  |     const field = (name: string) => page.locator(`[id="customer.${name}"]`); // inputs have no accessible name (hardening/inspect-register.steps.json)
  96  |     await field('firstName').fill(c.firstName);
  97  |     await field('lastName').fill(c.lastName);
  98  |     await field('address.street').fill(c.street);
  99  |     await field('address.city').fill(c.city);
  100 |     await field('address.state').fill(c.state);
  101 |     await field('address.zipCode').fill(c.zipCode);
  102 |     await field('phoneNumber').fill(c.phone);
  103 |     await field('ssn').fill(c.ssn);
  104 |     await field('username').fill(username);
  105 |     await field('password').fill(c.password);
  106 |     await page.locator('#repeatedPassword').fill(c.password);
  107 |     await page.getByRole('button', { name: 'Register', exact: true }).click();
  108 |     expect(await rateLimited(page), 'registration not rate-limited (precondition)').toBe(false);
  109 |     await expect(page.getByText(`Welcome ${c.firstName} ${c.lastName}`), 'registration succeeded and signed in (precondition)').toBeVisible();
  110 |     // G2: the customer id and the first account id, from the Accounts Overview page's own account list request.
> 111 |     const listed = page.waitForResponse((r) => /\/customers\/\d+\/accounts/.test(r.url()) && r.ok());
      |                         ^ TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
  112 |     await go(page, 'overview.htm');
  113 |     const res = await listed;
  114 |     const customerId = Number(res.url().match(/customers\/(\d+)\/accounts/)?.[1]);
  115 |     const accounts = (await res.json()) as Account[];
  116 |     expect(customerId, 'customer id found (precondition)').toBeGreaterThan(0);
  117 |     expect(accounts.length, 'new customer has one account (precondition)').toBe(1);
  118 |     return { username, customerId, firstAccountId: Number(accounts[0].id) };
  119 |   });
  120 | }
  121 | 
  122 | async function listAccounts(api: Api, customerId: number): Promise<ApiResponse<Account[]>> {
  123 |   return gentle(() => api.get<Account[]>(EP.customerAccounts(customerId)));
  124 | }
  125 | 
  126 | async function getAccount(api: Api, id: number): Promise<ApiResponse<Account>> {
  127 |   return gentle(() => api.get<Account>(EP.account(id)));
  128 | }
  129 | 
  130 | async function balanceOf(api: Api, id: number): Promise<number> {
  131 |   const r = await getAccount(api, id);
  132 |   expect(r.status, `read account ${id} (precondition)`).toBe(200);
  133 |   return Number(r.body.balance);
  134 | }
  135 | 
  136 | function openViaService(api: Api, customerId: number, type: AccountType, fromAccountId: number): Promise<ApiResponse<Account>> {
  137 |   return gentle(() => api.post<Account>(EP.createAccount, { params: { customerId, newAccountType: TYPE_PARAM[type], fromAccountId } })); // G1 query params; G3 no credentials needed
  138 | }
  139 | 
  140 | async function transfer(api: Api, fromAccountId: number, toAccountId: number, amountCents: number): Promise<void> {
  141 |   const r = await gentle(() => api.post(SEED_EP.transfer, { params: { fromAccountId, toAccountId, amount: (amountCents / 100).toFixed(2) } }));
  142 |   expect(r.status, 'transfer (precondition)').toBe(200);
  143 | }
  144 | 
  145 | /**
  146 |  * Give the customer a second account, optionally with an exact balance (G5): open it through the service,
  147 |  * then transfer the difference between it and the first account.
  148 |  */
  149 | async function addSecondAccount(api: Api, seed: Seed, cust: Customer, exactBalance?: number): Promise<number> {
  150 |   const label = exactBalance === undefined ? 'second account (POST /createAccount)' : `second account holding exactly ${exactBalance.toFixed(2)}`;
  151 |   return seed.create(label, async () => {
  152 |     const r = await openViaService(api, cust.customerId, 'CHECKING', cust.firstAccountId);
  153 |     expect(r.status, 'second account opened (precondition)').toBe(200);
  154 |     const id = Number(r.body.id);
  155 |     expect(id, 'second account id (precondition)').toBeGreaterThan(0);
  156 |     if (exactBalance !== undefined) {
  157 |       const diff = cents(await balanceOf(api, id)) - cents(exactBalance);
  158 |       if (diff > 0) await transfer(api, id, cust.firstAccountId, diff);
  159 |       if (diff < 0) await transfer(api, cust.firstAccountId, id, -diff);
  160 |       expect(cents(await balanceOf(api, id)), 'second account has the exact balance (precondition)').toBe(cents(exactBalance));
  161 |     }
  162 |     return id;
  163 |   });
  164 | }
  165 | 
  166 | /** The Open New Account page, with its funding account list loaded. */
  167 | async function openAccountPage(page: Page, fundingIds: number[]): Promise<void> {
  168 |   await go(page, 'openaccount.htm');
  169 |   for (const id of fundingIds) {
  170 |     await expect(fundingSelect(page).locator('option', { hasText: String(id) }), 'funding account list loaded').toHaveCount(1);
  171 |   }
  172 | }
  173 | const typeSelect = (page: Page) => page.locator('#type');
  174 | const fundingSelect = (page: Page) => page.locator('#fromAccountId');
  175 | 
  176 | async function openOnPage(page: Page, type: AccountType, fromAccountId: number): Promise<void> {
  177 |   await typeSelect(page).selectOption({ label: type });
  178 |   await fundingSelect(page).selectOption({ label: String(fromAccountId) });
  179 |   await page.getByRole('button', { name: 'Open New Account', exact: true }).click();
  180 | }
  181 | 
  182 | /** The new account number link on the confirmation. */
  183 | const newAccountLink = (page: Page) => page.locator('#newAccountId');
  184 | 
  185 | async function newAccountIdOnPage(page: Page): Promise<number> {
  186 |   await expect(newAccountLink(page), 'new account number shown').toHaveText(/^\d+$/);
  187 |   return Number(await newAccountLink(page).innerText());
  188 | }
  189 | 
  190 | /** The Accounts Overview row of an account (the row whose account link is the number). */
  191 | function overviewRow(page: Page, id: number) {
  192 |   return page.getByRole('row').filter({ has: page.getByRole('link', { name: String(id), exact: true }) });
  193 | }
  194 | const overviewBalanceCell = (page: Page, id: number) => overviewRow(page, id).getByRole('cell').nth(1); // columns: Account | Balance* | Available Amount
  195 | 
  196 | async function overviewBalance(page: Page, id: number): Promise<number> {
  197 |   await go(page, 'overview.htm');
  198 |   await expect(overviewRow(page, id), `account ${id} listed in the overview`).toHaveCount(1);
  199 |   return Number((await overviewBalanceCell(page, id).innerText()).replace(/[^0-9.-]/g, ''));
  200 | }
  201 | 
  202 | interface Tx { type?: string; amount?: number; description?: string }
  203 | async function transactions(api: Api, accountId: number): Promise<Tx[]> {
  204 |   const r = await gentle(() => api.get<Tx[]>(EP.transactions(accountId)));
  205 |   return Array.isArray(r.body) ? r.body : [];
  206 | }
  207 | /** G8: Debit/Credit, amount and description as the transactions response represents them. */
  208 | const txMatches = (t: Tx, want: { type: string; amount: number; description: string }) =>
  209 |   t.type === want.type && cents(t.amount) === cents(want.amount) && t.description === want.description; // fields per the OpenAPI Transaction schema
  210 | 
  211 | // ---- scenarios ------------------------------------------------------------------------------------
```