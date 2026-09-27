# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AE-2\tests\ae-2.spec.ts >> AE-2 Customer account lifecycle through the partner Account API, with shop sign-in >> SCN-004: An e-mail that differs from a registered one only in letter case is refused
- Location: evaluations\AE-2\tests\ae-2.spec.ts:168:3

# Error details

```
Error: [REQ AC-3] e-mail differing only in case → responseCode 400

expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 201
```

# Test source

```ts
  77  |   }
  78  | }
  79  | 
  80  | /** Given a customer exists — created through createAccount (P1), closed in cleanup. */
  81  | async function seedCustomer(seed: Seed, api: Api, data: TestData, name?: string): Promise<Customer> {
  82  |   const email = uniqueEmail(seed, data);
  83  |   const form = registrationForm(data, email, name);
  84  |   return seed.create('customer (POST /api/createAccount)', async () => {
  85  |     const r = await createAccount(api, form);
  86  |     expect(r.body?.responseCode, 'create customer (seed)').toBe(201);
  87  |     return { email, password: form.password, name: form.name, form };
  88  |   }, (c) => closeAccount(api, c));
  89  | }
  90  | 
  91  | /** Read the profile as a precondition (seed step). */
  92  | async function readProfile(seed: Seed, api: Api, email: string): Promise<Record<string, unknown>> {
  93  |   return seed.step('read profile (GET /api/getUserDetailByEmail)', async () => {
  94  |     const r = await getUser(api, email);
  95  |     expect(r.body?.user, 'profile readable (precondition)').toBeTruthy();
  96  |     return r.body.user as Record<string, unknown>;
  97  |   });
  98  | }
  99  | 
  100 | /** Track an account the scenario itself may have created by mistake, so it is closed after the test. */
  101 | function trackIfCreated(seed: Seed, api: Api, res: Res, c: { email: string; password: string }): void {
  102 |   if (res.body?.responseCode === REQ.CODE.CREATED) seed.track('customer', c, (x) => closeAccount(api, x));
  103 | }
  104 | 
  105 | // ---- UI helpers (shop sign-in, G2) ----------------------------------------------------------------------------------
  106 | 
  107 | function loginForm(page: Page) {
  108 |   // The page has two "Email Address" inputs (login + signup): scope to the form that holds the Login button (probed: 1 match).
  109 |   return page.locator('form').filter({ has: page.getByRole('button', { name: 'Login', exact: true }) });
  110 | }
  111 | async function signIn(page: Page, email: string, password: string): Promise<void> {
  112 |   const form = loginForm(page);
  113 |   await form.getByPlaceholder('Email Address').fill(email);
  114 |   await form.getByPlaceholder('Password').fill(password);
  115 |   await form.getByRole('button', { name: 'Login', exact: true }).click();
  116 | }
  117 | 
  118 | test.describe('AE-2 Customer account lifecycle through the partner Account API, with shop sign-in', () => {
  119 |   // ---------------------------------------------------------------- AC-1
  120 |   test('SCN-001: The partner creates a customer with all required fields and a new e-mail', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  121 |     let email = ''; let res!: Res;
  122 |     await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
  123 |     await journey.step('When the partner calls createAccount with every required and optional field and that e-mail', async () => {
  124 |       const form = registrationForm(data, email);
  125 |       res = await createAccount(api, form);
  126 |       trackIfCreated(seed, api, res, form as { email: string; password: string });
  127 |     });
  128 |     await journey.step('Then the responseCode is 201', async () => {
  129 |       expect(res.body?.responseCode, '[REQ AC-1] createAccount → responseCode 201').toBe(REQ.CODE.CREATED);
  130 |     });
  131 |     await journey.step('And the message is "User created!"', async () => {
  132 |       expect(res.body?.message, '[REQ AC-1] createAccount → "User created!"').toBe(REQ.MSG.USER_CREATED);
  133 |     });
  134 |   });
  135 | 
  136 |   test('SCN-002: createAccount answers with the documented response envelope', { tag: ['@AC-1', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  137 |     let email = ''; let res!: Res;
  138 |     await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
  139 |     await journey.step('When the partner calls createAccount with all required fields and that e-mail', async () => {
  140 |       const form = registrationForm(data, email);
  141 |       res = await createAccount(api, form);
  142 |       trackIfCreated(seed, api, res, form as { email: string; password: string });
  143 |     });
  144 |     await journey.step('Then the HTTP status is 200', async () => {
  145 |       expect(res.status, '[REQ AC-1] every Account API response has HTTP status 200 (R1)').toBe(REQ.HTTP_STATUS);
  146 |     });
  147 |     await journey.step('And the body is a JSON object with an integer responseCode and a string message', async () => {
  148 |       const envelope: Record<string, ShapeRule> = { responseCode: 'integer', message: 'string' };
  149 |       expect(checkShape(res.body, envelope, 'body'), '[REQ AC-1] response envelope: integer responseCode + string message (R1)').toEqual([]);
  150 |     });
  151 |   });
  152 | 
  153 |   // ---------------------------------------------------------------- AC-2, AC-3
  154 |   test('SCN-003: A second account for an already registered e-mail is refused', { tag: ['@AC-2', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  155 |     let c!: Customer; let res!: Res;
  156 |     await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
  157 |     await journey.step('When the partner calls createAccount again with the same e-mail address', async () => {
  158 |       res = await createAccount(api, registrationForm(data, c.email));
  159 |     });
  160 |     await journey.step('Then the responseCode is 400', async () => {
  161 |       expect(res.body?.responseCode, '[REQ AC-2] duplicate e-mail → responseCode 400').toBe(REQ.CODE.BAD_REQUEST);
  162 |     });
  163 |     await journey.step('And the message is "Email already exists!"', async () => {
  164 |       expect(res.body?.message, '[REQ AC-2] duplicate e-mail → "Email already exists!"').toBe(REQ.MSG.EMAIL_EXISTS);
  165 |     });
  166 |   });
  167 | 
  168 |   test('SCN-004: An e-mail that differs from a registered one only in letter case is refused', { tag: ['@AC-3', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  169 |     let c!: Customer; let res!: Res;
  170 |     await journey.step('Given a customer exists with a unique lower-case e-mail address', async () => { c = await seedCustomer(seed, api, data); });
  171 |     await journey.step('When the partner calls createAccount with the same e-mail address in upper case', async () => {
  172 |       const upper = c.email.toUpperCase();
  173 |       res = await createAccount(api, registrationForm(data, upper));
  174 |       trackIfCreated(seed, api, res, { email: upper, password: c.password });
  175 |     });
  176 |     await journey.step('Then the responseCode is 400', async () => {
> 177 |       expect(res.body?.responseCode, '[REQ AC-3] e-mail differing only in case → responseCode 400').toBe(REQ.CODE.BAD_REQUEST);
      |                                                                                                     ^ Error: [REQ AC-3] e-mail differing only in case → responseCode 400
  178 |     });
  179 |     await journey.step('And the message is "Email already exists!"', async () => {
  180 |       expect(res.body?.message, '[REQ AC-3] e-mail differing only in case → "Email already exists!"').toBe(REQ.MSG.EMAIL_EXISTS);
  181 |     });
  182 |   });
  183 | 
  184 |   // ---------------------------------------------------------------- AC-4
  185 |   REQ.REQUIRED_FIELDS.forEach((field, i) => {
  186 |     test(`SCN-005.${i + 1}: createAccount without a required field is refused and creates nothing (${field})`, { tag: ['@AC-4', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  187 |       let email = ''; let res!: Res;
  188 |       await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
  189 |       await journey.step(`When the partner calls createAccount with all required fields except ${field}`, async () => {
  190 |         const form = registrationForm(data, email);
  191 |         delete form[field];
  192 |         res = await createAccount(api, form);
  193 |         trackIfCreated(seed, api, res, { email, password: data.customer.password });
  194 |       });
  195 |       await journey.step('Then the responseCode is 400', async () => {
  196 |         expect(res.body?.responseCode, `[REQ AC-4] missing ${field} → responseCode 400`).toBe(REQ.CODE.BAD_REQUEST);
  197 |       });
  198 |       await journey.step(`And the message is "${REQ.MSG.MISSING_POST_PARAM(field)}"`, async () => {
  199 |         expect(res.body?.message, `[REQ AC-4] missing ${field} → message names the parameter`).toBe(REQ.MSG.MISSING_POST_PARAM(field));
  200 |       });
  201 |       await journey.step('And getUserDetailByEmail for that e-mail answers responseCode 404 "Account not found with this email, try another email!"', async () => {
  202 |         if (field === 'email') return; // no address was sent: nothing to look up (ASSUMPTION in scenarios.feature)
  203 |         const g = await getUser(api, email);
  204 |         expect.soft(g.body?.responseCode, `[REQ AC-4] missing ${field} → account not created (404)`).toBe(REQ.CODE.NOT_FOUND);
  205 |         expect.soft(g.body?.message, `[REQ AC-4] missing ${field} → account not created (message)`).toBe(REQ.MSG.ACCOUNT_NOT_FOUND_BY_EMAIL);
  206 |       });
  207 |     });
  208 |   });
  209 | 
  210 |   // ---------------------------------------------------------------- AC-5
  211 |   test('SCN-006: createAccount with an e-mail that has no "@" is refused and creates nothing', { tag: ['@AC-5', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  212 |     let address = ''; let res!: Res;
  213 |     await journey.step('Given a unique address without "@"', async () => { address = uniqueEmail(seed, data).replace('@', '.at.'); });
  214 |     await journey.step('When the partner calls createAccount with all required fields and that address', async () => {
  215 |       res = await createAccount(api, registrationForm(data, address));
  216 |       trackIfCreated(seed, api, res, { email: address, password: data.customer.password });
  217 |     });
  218 |     await journey.step('Then the responseCode is 400', async () => {
  219 |       expect(res.body?.responseCode, '[REQ AC-5] e-mail without "@" → responseCode 400').toBe(REQ.CODE.BAD_REQUEST);
  220 |     });
  221 |     await journey.step('And getUserDetailByEmail for that address answers responseCode 404', async () => {
  222 |       const g = await getUser(api, address);
  223 |       expect(g.body?.responseCode, '[REQ AC-5] e-mail without "@" → account not created (404)').toBe(REQ.CODE.NOT_FOUND);
  224 |     });
  225 |   });
  226 | 
  227 |   REQ.INVALID_EMAIL_SHAPES.forEach((shape, i) => {
  228 |     test(`SCN-007.${i + 1}: createAccount with an e-mail that has an "@" but is still invalid is refused and creates nothing (${shape})`, { tag: ['@AC-5', '@type:boundary', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  229 |       let address = ''; let res!: Res;
  230 |       await journey.step(`Given a unique address with ${shape}`, async () => {
  231 |         const [local] = uniqueEmail(seed, data).split('@');
  232 |         address = i === 0 ? `${local}@` : `@${local}.${data.customer.emailDomain}`;
  233 |       });
  234 |       await journey.step('When the partner calls createAccount with all required fields and that address', async () => {
  235 |         res = await createAccount(api, registrationForm(data, address));
  236 |         trackIfCreated(seed, api, res, { email: address, password: data.customer.password });
  237 |       });
  238 |       await journey.step('Then the responseCode is 400', async () => {
  239 |         expect(res.body?.responseCode, `[REQ AC-5] invalid e-mail (${shape}) → responseCode 400`).toBe(REQ.CODE.BAD_REQUEST);
  240 |       });
  241 |       await journey.step('And getUserDetailByEmail for that address answers responseCode 404', async () => {
  242 |         const g = await getUser(api, address);
  243 |         expect(g.body?.responseCode, `[REQ AC-5] invalid e-mail (${shape}) → account not created (404)`).toBe(REQ.CODE.NOT_FOUND);
  244 |       });
  245 |     });
  246 |   });
  247 | 
  248 |   // ---------------------------------------------------------------- AC-6
  249 |   test('SCN-008: verifyLogin with a valid e-mail and password confirms the customer', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  250 |     let c!: Customer; let res!: Res;
  251 |     await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
  252 |     await journey.step('When the partner calls verifyLogin with that e-mail and the correct password', async () => {
  253 |       res = await verifyLogin(api, { email: c.email, password: c.password });
  254 |     });
  255 |     await journey.step('Then the responseCode is 200', async () => {
  256 |       expect(res.body?.responseCode, '[REQ AC-6] valid credentials → responseCode 200').toBe(REQ.CODE.OK);
  257 |     });
  258 |     await journey.step('And the message is "User exists!"', async () => {
  259 |       expect(res.body?.message, '[REQ AC-6] valid credentials → "User exists!"').toBe(REQ.MSG.USER_EXISTS);
  260 |     });
  261 |   });
  262 | 
  263 |   test('SCN-009: verifyLogin with a wrong password is refused', { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  264 |     let c!: Customer; let res!: Res;
  265 |     await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
  266 |     await journey.step('When the partner calls verifyLogin with that e-mail and a wrong password', async () => {
  267 |       res = await verifyLogin(api, { email: c.email, password: wrongPassword(data) });
  268 |     });
  269 |     await journey.step('Then the responseCode is 404', async () => {
  270 |       expect(res.body?.responseCode, '[REQ AC-6] wrong password → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
  271 |     });
  272 |     await journey.step('And the message is "User not found!"', async () => {
  273 |       expect(res.body?.message, '[REQ AC-6] wrong password → "User not found!"').toBe(REQ.MSG.USER_NOT_FOUND);
  274 |     });
  275 |   });
  276 | 
  277 |   test('SCN-010: verifyLogin with an unknown e-mail is refused', { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
```