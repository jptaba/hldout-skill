# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TOOL-2\tests\tool-2.spec.ts >> TOOL-2 Customer registration, sign-in and account protection >> SCN-007: The account locks after five failed attempts
- Location: evaluations\TOOL-2\tests\tool-2.spec.ts:115:3

# Error details

```
Error: [REQ AC-6] attempts one to five → 401

expect(received).toEqual(expected) // deep equality

- Expected  - 2
+ Received  + 2

  Array [
    401,
    401,
    401,
-   401,
-   401,
+   423,
+   423,
  ]
```

# Test source

```ts
  22  |   WRONG_PASSWORD_UI: 'Invalid email or password',
  23  | } as const;
  24  | // @req-constants-end
  25  | 
  26  | // Endpoints exactly as declared in the requirement.
  27  | const EP = { register: '/users/register', login: '/users/login', me: '/users/me', logout: '/users/logout' };
  28  | 
  29  | interface Customer { first_name: string; last_name: string; email: string; password: string }
  30  | 
  31  | // ---- mechanics (payload fields: contract G1 / API docs) ----------------------------------------------
  32  | let seq = 0;
  33  | function newCustomer(data: TestData, over: Partial<Customer> = {}): Customer & Record<string, unknown> {
  34  |   const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}${++seq}`;
  35  |   return {
  36  |     first_name: 'Qa', last_name: `Held${id}`, dob: '1990-01-01', phone: '0612345678',
  37  |     address: { street: 'Main 1', city: 'Utrecht', state: 'UT', country: 'NL', postal_code: '1234AB' },
  38  |     email: `qa${id}@example.com`, password: data.customerPassword as string, ...over,
  39  |   };
  40  | }
  41  | /** Seed a registered customer (customers cannot be deleted by a customer — contract G8). */
  42  | async function registered(seed: Seed, api: Api, data: TestData, label = 'registered customer'): Promise<Customer> {
  43  |   return seed.create(`${label} (API; not deletable)`, async () => {
  44  |     const c = newCustomer(data);
  45  |     const r = await api.post(EP.register, { data: c });
  46  |     expect(r.status, 'register (precondition)').toBe(REQ.STATUS.CREATED);
  47  |     return c;
  48  |   });
  49  | }
  50  | async function login(api: Api, c: Pick<Customer, 'email' | 'password'>) {
  51  |   return api.post<{ access_token?: string; error?: string; message?: string }>(EP.login, { data: { email: c.email, password: c.password } });
  52  | }
  53  | async function signInOnWebShop(page: Page, c: Pick<Customer, 'email' | 'password'>) {
  54  |   await page.getByTestId('email').fill(c.email);
  55  |   await page.getByTestId('password').fill(c.password);
  56  |   await page.getByTestId('login-submit').click();
  57  | }
  58  | const containsPassword = (body: unknown, pw: string) => JSON.stringify(body ?? {}).includes(pw) || /"password"\s*:/.test(JSON.stringify(body ?? {}));
  59  | 
  60  | test.describe('TOOL-2 Customer registration, sign-in and account protection', () => {
  61  |   test('SCN-001: Registration creates the customer without echoing the password', { tag: ['@AC-1', '@type:functional', '@layer:api'] }, async ({ api, journey, data }) => {
  62  |     const c = newCustomer(data);
  63  |     let r!: ApiResponse<Record<string, unknown>>;
  64  |     await journey.step('When I post a new customer with a unique e-mail address to POST /users/register', async () => { r = await api.post(EP.register, { data: c }); });
  65  |     await journey.step('Then the response status is 201', async () => { expect(r.status, '[REQ AC-1] register → 201').toBe(REQ.STATUS.CREATED); });
  66  |     await journey.step('And the response has an id and my first name, last name and e-mail address', async () => {
  67  |       expect({ hasId: Boolean(r.body?.id), first_name: r.body?.first_name, last_name: r.body?.last_name, email: r.body?.email }, '[REQ AC-1] customer details and id')
  68  |         .toEqual({ hasId: true, first_name: c.first_name, last_name: c.last_name, email: c.email });
  69  |     });
  70  |     await journey.step('And the response does not contain the password', async () => { expect(containsPassword(r.body, c.password), '[REQ AC-1] no password in the response').toBe(false); });
  71  |   });
  72  | 
  73  |   test('SCN-002: A registered e-mail address cannot register twice', { tag: ['@AC-2', '@type:negative', '@layer:api'] }, async ({ api, journey, data, seed }) => {
  74  |     let first!: Customer; let r!: ApiResponse<{ email?: string[]; message?: string }>;
  75  |     await journey.step('Given a customer already registered with an e-mail address', async () => { first = await registered(seed, api, data); });
  76  |     await journey.step('When the same e-mail address is registered again', async () => { r = await api.post(EP.register, { data: newCustomer(data, { email: first.email }) }); });
  77  |     await journey.step('Then the response status is 409', async () => { expect.soft(r.status, '[REQ AC-2] duplicate e-mail → 409').toBe(REQ.STATUS.CONFLICT); });
  78  |     await journey.step('And the message is "A customer with this email address already exists."', async () => {
  79  |       expect.soft(JSON.stringify(r.body), '[REQ AC-2] duplicate message').toContain(REQ.DUPLICATE_MESSAGE);
  80  |     });
  81  |   });
  82  | 
  83  |   test('SCN-003: Weak passwords are rejected with every broken rule listed', { tag: ['@AC-3', '@type:negative', '@layer:api'] }, async ({ api, journey, data }) => {
  84  |     let r!: ApiResponse<{ password?: string[]; errors?: { password?: string[] } }>;
  85  |     await journey.step('When a new customer registers with the password "abc"', async () => { r = await api.post(EP.register, { data: newCustomer(data, { password: REQ.WEAK_PASSWORD }) }); });
  86  |     await journey.step('Then the response status is 422', async () => { expect.soft(r.status, '[REQ AC-3] weak password → 422').toBe(REQ.STATUS.UNPROCESSABLE); });
  87  |     await journey.step('And the password errors name the 8-character minimum, upper and lower case letters, a symbol and a number', async () => {
  88  |       const errors = (r.body?.password ?? r.body?.errors?.password ?? []).join(' | ');
  89  |       expect.soft(REQ.PASSWORD_RULES.filter((x) => !x.named.test(errors)).map((x) => x.rule), `[REQ AC-3] every broken rule is listed (errors: ${errors})`).toEqual([]);
  90  |     });
  91  |   });
  92  | 
  93  |   test('SCN-004: Signing in on the web shop', { tag: ['@AC-4', '@type:functional', '@layer:e2e'] }, async ({ page, api, journey, data, seed }) => {
  94  |     let c!: Customer;
  95  |     await journey.step("Given a registered customer on the web shop's sign-in page", async () => { c = await registered(seed, api, data); await gotoPage(page, '/auth/login'); });
  96  |     await journey.step('When they sign in with their e-mail address and password', async () => { await signInOnWebShop(page, c); });
  97  |     await journey.step('Then they land on the "My account" page', async () => { await expect(page.getByTestId('page-title'), '[REQ AC-4] My account page').toHaveText(REQ.MY_ACCOUNT); });
  98  |     await journey.step('And the navigation shows their first and last name', async () => { await expect(page.getByTestId('nav-menu'), '[REQ AC-4] name in the navigation').toContainText(`${c.first_name} ${c.last_name}`); });
  99  |   });
  100 | 
  101 |   test('SCN-005: A wrong password is refused by the API', { tag: ['@AC-5', '@type:security', '@layer:api'] }, async ({ api, journey, data, seed }) => {
  102 |     let c!: Customer; let r!: ApiResponse;
  103 |     await journey.step('Given a registered customer', async () => { c = await registered(seed, api, data); });
  104 |     await journey.step('When they POST their e-mail address with a wrong password to /users/login', async () => { r = await login(api, { email: c.email, password: `${c.password}-wrong` }); });
  105 |     await journey.step('Then the response status is 401', async () => { expect(r.status, '[REQ AC-5] wrong password → 401').toBe(REQ.STATUS.UNAUTHORIZED); });
  106 |   });
  107 | 
  108 |   test('SCN-006: A wrong password is refused on the web shop', { tag: ['@AC-5', '@type:negative', '@layer:ui'] }, async ({ page, api, journey, data, seed }) => {
  109 |     let c!: Customer;
  110 |     await journey.step("Given a registered customer on the web shop's sign-in page", async () => { c = await registered(seed, api, data); await gotoPage(page, '/auth/login'); });
  111 |     await journey.step('When they sign in with a wrong password', async () => { await signInOnWebShop(page, { email: c.email, password: `${c.password}-wrong` }); });
  112 |     await journey.step('Then the web shop shows "Invalid email or password"', async () => { await expect(page.getByTestId('login-error'), '[REQ AC-5] wrong-password message').toHaveText(REQ.WRONG_PASSWORD_UI); });
  113 |   });
  114 | 
  115 |   test('SCN-007: The account locks after five failed attempts', { tag: ['@AC-6', '@type:security', '@layer:api'] }, async ({ api, journey, data, seed }) => {
  116 |     let c!: Customer; const statuses: number[] = []; let sixth!: ApiResponse<{ error?: string; message?: string }>;
  117 |     await journey.step('Given a registered customer used only by this scenario', async () => { c = await registered(seed, api, data, 'customer dedicated to the lockout scenario'); });
  118 |     await journey.step('When five sign-in attempts with a wrong password are made', async () => {
  119 |       for (let i = 1; i <= REQ.FAILED_ATTEMPTS_ALLOWED; i++) statuses.push((await login(api, { email: c.email, password: `wrong-${i}-Pw!` })).status);
  120 |     });
  121 |     await journey.step('Then attempts one to five each respond 401', async () => {
> 122 |       expect.soft(statuses, '[REQ AC-6] attempts one to five → 401').toEqual(Array(REQ.FAILED_ATTEMPTS_ALLOWED).fill(REQ.STATUS.UNAUTHORIZED));
      |                                                                      ^ Error: [REQ AC-6] attempts one to five → 401
  123 |     });
  124 |     await journey.step('And the sixth attempt, with the correct password, responds 423 with a message that the account is locked', async () => {
  125 |       sixth = await login(api, c);
  126 |       expect.soft(sixth.status, '[REQ AC-6] sixth attempt → 423').toBe(REQ.STATUS.LOCKED);
  127 |       expect.soft(JSON.stringify(sixth.body), '[REQ AC-6] locked message').toMatch(REQ.LOCKED_MESSAGE);
  128 |     });
  129 |   });
  130 | 
  131 |   test('SCN-008: Signing out invalidates the token', { tag: ['@AC-7', '@type:security', '@layer:api'] }, async ({ api, journey, data, seed }) => {
  132 |     let token = '';
  133 |     await journey.step('Given a signed-in customer with an access token', async () => {
  134 |       const c = await registered(seed, api, data);
  135 |       token = await seed.step('sign in (POST /users/login)', async () => {
  136 |         const r = await login(api, c);
  137 |         expect(r.status, 'login (pre-step)').toBe(200);
  138 |         expect(typeof r.body.access_token, 'login returned a token (pre-step)').toBe('string');
  139 |         return r.body.access_token!;
  140 |       });
  141 |     });
  142 |     await journey.step('When they sign out with GET /users/logout', async () => { await api.get(EP.logout, { headers: { Authorization: `Bearer ${token}` } }); });
  143 |     await journey.step('Then GET /users/me with the same token responds 401', async () => {
  144 |       expect((await api.get(EP.me, { headers: { Authorization: `Bearer ${token}` } })).status, '[REQ AC-7] token rejected after sign-out').toBe(REQ.STATUS.UNAUTHORIZED);
  145 |     });
  146 |   });
  147 | });
  148 | 
```