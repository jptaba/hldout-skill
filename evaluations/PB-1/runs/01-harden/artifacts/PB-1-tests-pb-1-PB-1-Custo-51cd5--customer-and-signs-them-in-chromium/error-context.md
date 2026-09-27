# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-004: A complete, valid registration welcomes the new customer and signs them in
- Location: evaluations\PB-1\tests\pb-1.spec.ts:222:3

# Error details

```
Error: [REQ AC-3] heading Welcome <username>

expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Welcome pb1hxeaaij3012xd' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - [REQ AC-3] heading Welcome <username> getByRole('heading', { name: 'Welcome pb1hxeaaij3012xd' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Welcome pb1hxeaaij3012xd' })

```

```yaml
- main:
  - img "Icon for parabank.parasoft.com"
  - heading "parabank.parasoft.com" [level=1]
  - heading "Performing security verification" [level=2]
  - paragraph: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
- contentinfo:
  - text: "Ray ID:"
  - code: a41833f498d7e8a6
  - text: Performance and Security by
  - link "Cloudflare, opens in a new tab":
    - /url: https://www.cloudflare.com?utm_source=challenge&utm_campaign=m
    - text: Cloudflare
  - link "Privacy, opens in a new tab":
    - /url: https://www.cloudflare.com/privacypolicy/
    - text: Privacy
```

# Test source

```ts
  133 | }
  134 | 
  135 | // ---- Customer Login panel (home page) ------------------------------------------------------------
  136 | 
  137 | const loginUsername = (p: Page) => p.locator('input[name="username"]');
  138 | const loginPassword = (p: Page) => p.locator('input[name="password"]');
  139 | const loginButton = (p: Page) => p.getByRole('button', { name: 'Log In', exact: true });
  140 | const loginPanelHeading = (p: Page) => p.getByRole('heading', { name: REQ.AC6_LOGIN_PANEL, exact: true });
  141 | 
  142 | async function signIn(page: Page, username: string, password: string): Promise<void> {
  143 |   await loginUsername(page).fill(username);
  144 |   await loginPassword(page).fill(password);
  145 |   await loginButton(page).click();
  146 | }
  147 | 
  148 | // ---- Accounts Overview ----------------------------------------------------------------------------
  149 | 
  150 | /** Account numbers shown in the Accounts Overview (gap G2: how they are shown). */
  151 | const accountNumberLinks = (p: Page) => p.locator('#accountTable tbody a');
  152 | 
  153 | async function shownAccountNumbers(page: Page): Promise<string[]> {
  154 |   await expect(accountNumberLinks(page).first(), 'account numbers rendered (precondition)').toBeVisible();
  155 |   return (await accountNumberLinks(page).allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  156 | }
  157 | 
  158 | // ---- REST helpers ---------------------------------------------------------------------------------
  159 | 
  160 | async function restLogin(api: Api, username: string, password: string) {
  161 |   return api.get<RestCustomer>(EP.loginByUsernameAndPassword(username, password), { headers: { Accept: 'application/json' } });
  162 | }
  163 | 
  164 | test.describe('PB-1 Customer registration and sign-in', () => {
  165 |   test('SCN-001: Submitting an empty registration form shows a required message next to every required field', { tag: ['@AC-1', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  166 |     await journey.step('Given I am on the registration page register.htm', async () => {
  167 |       await gotoPage(page, PAGES.register);
  168 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  169 |     });
  170 |     await journey.step('When I submit the registration form with every field empty', async () => {
  171 |       await registerButton(page).click();
  172 |     });
  173 |     await journey.step('Then I am still on the registration form', async () => {
  174 |       await expect(registerButton(page), '[REQ AC-1] still on the registration form').toBeVisible();
  175 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-1] no customer created').toHaveCount(0);
  176 |     });
  177 |     for (const { field, message } of REQ.AC1_REQUIRED) {
  178 |       await journey.step(`And "${message}" is shown next to ${field}`, async () => {
  179 |         await expect.soft(fieldRow(page, field), `[REQ AC-1] "${message}" next to ${field}`).toContainText(message);
  180 |       });
  181 |     }
  182 |     await journey.step('And no message is shown for Phone #', async () => {
  183 |       await expect(fieldRow(page, REQ.AC1_OPTIONAL_FIELD), '[REQ AC-1] no message for Phone #').not.toContainText(/required/i);
  184 |     });
  185 |   });
  186 | 
  187 |   test('SCN-002: Registering with a Confirm that differs from Password shows "Passwords did not match."', { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  188 |     const c = validCustomer(data, seed);
  189 |     await journey.step('Given I am on the registration page register.htm', async () => {
  190 |       await gotoPage(page, PAGES.register);
  191 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  192 |     });
  193 |     await journey.step('When I submit a complete registration with a fresh user name whose Confirm differs from Password', async () => {
  194 |       await fillRegistration(page, c, `${c.password}x9`);
  195 |       await registerButton(page).click();
  196 |     });
  197 |     await journey.step('Then the form shows "Passwords did not match."', async () => {
  198 |       await expect(page.getByText(REQ.AC2_MISMATCH), '[REQ AC-2] "Passwords did not match." shown').toBeVisible();
  199 |     });
  200 |   });
  201 | 
  202 |   test('SCN-003: A registration rejected for mismatched passwords creates no customer', { tag: ['@AC-2', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  203 |     const c = validCustomer(data, seed);
  204 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  205 |     await journey.step('Given I submitted a complete registration with a fresh user name whose Confirm differs from Password', async () => {
  206 |       await seed.step('registration with mismatched Confirm submitted via register.htm', async () => {
  207 |         await gotoPage(page, PAGES.register);
  208 |         await fillRegistration(page, c, `${c.password}x9`);
  209 |         await registerButton(page).click();
  210 |         await expect(registerButton(page), 'form re-shown after the rejected registration (precondition)').toBeVisible();
  211 |       });
  212 |     });
  213 |     await journey.step('When I call GET /login/{username}/{password} with that user name and the Password I entered', async () => {
  214 |       res = await restLogin(api, c.username, c.password);
  215 |     });
  216 |     await journey.step('Then the call does not answer 200 with a customer', async () => {
  217 |       const gotCustomer = res.status === REQ.STATUS.OK && typeof res.body === 'object' && res.body !== null && 'id' in (res.body as object);
  218 |       expect(gotCustomer, `[REQ AC-2] user name cannot sign in (got ${res.status})`).toBe(false);
  219 |     });
  220 |   });
  221 | 
  222 |   test('SCN-004: A complete, valid registration welcomes the new customer and signs them in', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  223 |     const c = validCustomer(data, seed);
  224 |     await journey.step('Given I am on the registration page register.htm', async () => {
  225 |       await gotoPage(page, PAGES.register);
  226 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  227 |     });
  228 |     await journey.step('When I submit a complete, valid registration with a fresh user name', async () => {
  229 |       await fillRegistration(page, c);
  230 |       await registerButton(page).click();
  231 |     });
  232 |     await journey.step('Then the page shows the heading "Welcome <username>"', async () => {
> 233 |       await expect(page.getByRole('heading', { name: REQ.AC3_HEADING(c.username) }), '[REQ AC-3] heading Welcome <username>').toBeVisible();
      |                                                                                                                               ^ Error: [REQ AC-3] heading Welcome <username>
  234 |     });
  235 |     await journey.step('And the page shows "Your account was created successfully. You are now logged in."', async () => {
  236 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-3] account created text').toBeVisible();
  237 |     });
  238 |     await journey.step('And the left panel greets me with "Welcome <first name> <last name>"', async () => {
  239 |       await expect(page.getByText(REQ.AC3_GREETING(c.firstName, c.lastName)), '[REQ AC-3] left panel greeting').toBeVisible();
  240 |     });
  241 |     await journey.step('And the left panel shows the Account Services menu', async () => {
  242 |       await expect(page.getByRole('heading', { name: REQ.AC3_MENU }), '[REQ AC-3] Account Services menu').toBeVisible();
  243 |     });
  244 |   });
  245 | 
  246 |   test('SCN-005: Registering with a user name that is already taken shows "This username already exists."', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  247 |     const existing = validCustomer(data, seed);
  248 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  249 |       await registerCustomer(seed, page, existing);
  250 |     });
  251 |     await journey.step('And I am on the registration page register.htm as a new visitor', async () => {
  252 |       await signedOutVisitor(page);
  253 |       await gotoPage(page, PAGES.register);
  254 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  255 |     });
  256 |     await journey.step('When I submit a complete registration with the same user name and a different first and last name', async () => {
  257 |       await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  258 |       await registerButton(page).click();
  259 |     });
  260 |     await journey.step('Then "This username already exists." is shown next to Username', async () => {
  261 |       await expect(fieldRow(page, 'Username'), '[REQ AC-4] "This username already exists." next to Username').toContainText(REQ.AC4_DUPLICATE);
  262 |     });
  263 |   });
  264 | 
  265 |   test('SCN-006: A duplicate registration does not change the existing customer', { tag: ['@AC-4', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  266 |     const existing = validCustomer(data, seed);
  267 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  268 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  269 |       await registerCustomer(seed, page, existing);
  270 |     });
  271 |     await journey.step('And a second registration with the same user name and a different first and last name was submitted', async () => {
  272 |       await seed.step('duplicate registration submitted via register.htm', async () => {
  273 |         await signedOutVisitor(page);
  274 |         await gotoPage(page, PAGES.register);
  275 |         await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  276 |         await registerButton(page).click();
  277 |         await page.waitForLoadState('domcontentloaded');
  278 |       });
  279 |     });
  280 |     await journey.step('When I call GET /login/{username}/{password} for the existing customer', async () => {
  281 |       res = await restLogin(api, existing.username, existing.password);
  282 |     });
  283 |     await journey.step('Then the response returns the original first and last name', async () => {
  284 |       expect(res.status, '[REQ AC-4] existing customer can still log in (REST)').toBe(REQ.STATUS.OK);
  285 |       expect.soft(res.body?.firstName, '[REQ AC-4] original first name kept').toBe(existing.firstName);
  286 |       expect.soft(res.body?.lastName, '[REQ AC-4] original last name kept').toBe(existing.lastName);
  287 |     });
  288 |   });
  289 | 
  290 |   test('SCN-007: Signing in with a wrong password shows the "Error!" page', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  291 |     const c = validCustomer(data, seed);
  292 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  293 |       await registerCustomer(seed, page, c);
  294 |     });
  295 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  296 |       await signedOutVisitor(page);
  297 |       await gotoPage(page, PAGES.home);
  298 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  299 |     });
  300 |     await journey.step('When I sign in on the Customer Login panel with that user name and a wrong password', async () => {
  301 |       await signIn(page, c.username, data.customer.wrongPassword);
  302 |     });
  303 |     await journey.step('Then an "Error!" page is shown', async () => {
  304 |       await expect(page.getByRole('heading', { name: REQ.AC5_ERROR_HEADING }), '[REQ AC-5] "Error!" page').toBeVisible();
  305 |     });
  306 |     await journey.step('And it says "The username and password could not be verified."', async () => {
  307 |       await expect(page.getByText(REQ.AC5_NOT_VERIFIED), '[REQ AC-5] could not be verified').toBeVisible();
  308 |     });
  309 |   });
  310 | 
  311 |   test('SCN-008: Signing in with both fields empty asks for a user name and password', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  312 |     await journey.step('Given I am on the home page as a signed-out visitor', async () => {
  313 |       await signedOutVisitor(page);
  314 |       await gotoPage(page, PAGES.home);
  315 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  316 |     });
  317 |     await journey.step('When I sign in on the Customer Login panel with both fields empty', async () => {
  318 |       await loginButton(page).click();
  319 |     });
  320 |     await journey.step('Then the page says "Please enter a username and password."', async () => {
  321 |       await expect(page.getByText(REQ.AC5_EMPTY), '[REQ AC-5] please enter a username and password').toBeVisible();
  322 |     });
  323 |   });
  324 | 
  325 |   test('SCN-009: Signing in opens the Accounts Overview and Log Out returns to the home page', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  326 |     const c = validCustomer(data, seed);
  327 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  328 |       await registerCustomer(seed, page, c);
  329 |     });
  330 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  331 |       await signedOutVisitor(page);
  332 |       await gotoPage(page, PAGES.home);
  333 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
```