# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-004: A complete, valid registration welcomes the new customer and signs them in
- Location: evaluations\PB-1\tests\pb-1.spec.ts:238:3

# Error details

```
Error: registration form shown (precondition)

expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Register', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - registration form shown (precondition) getByRole('button', { name: 'Register', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Register', exact: true })

```

```yaml
- banner:
  - heading "Error 1015" [level=1]
  - text: "Ray ID: a41839a5391f42e9 • 2026-09-27 05:49:27 UTC"
  - heading "You are being rate limited" [level=2]
- heading "What happened?" [level=2]
- paragraph: The owner of this website (parabank.parasoft.com) has banned you temporarily from accessing this website.
- paragraph:
  - text: Please see
  - link "https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/":
    - /url: https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/
  - text: for more details.
- text: Was this page helpful?
- button "Yes"
- button "No"
- paragraph:
  - text: "Cloudflare Ray ID:"
  - strong: a41839a5391f42e9
  - text: "• Your IP:"
  - button "Click to reveal"
  - text: • Performance & security by
  - link "Cloudflare":
    - /url: https://www.cloudflare.com/5xx-error-landing
```

# Test source

```ts
  142 |     await signedOutVisitor(page);
  143 |     await open(page, PAGES.register);
  144 |     await fillRegistration(page, c);
  145 |     await registerButton(page).click(); await passBotCheck(page);
  146 |     await expect(page.getByText(REQ.AC3_CREATED), 'registration succeeded (precondition)').toBeVisible();
  147 |     return c;
  148 |   });
  149 | }
  150 | 
  151 | // ---- Customer Login panel (home page) ------------------------------------------------------------
  152 | 
  153 | const loginUsername = (p: Page) => p.locator('input[name="username"]');
  154 | const loginPassword = (p: Page) => p.locator('input[name="password"]');
  155 | const loginButton = (p: Page) => p.getByRole('button', { name: 'Log In', exact: true });
  156 | const loginPanelHeading = (p: Page) => p.getByRole('heading', { name: REQ.AC6_LOGIN_PANEL, exact: true });
  157 | 
  158 | async function signIn(page: Page, username: string, password: string): Promise<void> {
  159 |   await loginUsername(page).fill(username);
  160 |   await loginPassword(page).fill(password);
  161 |   await loginButton(page).click(); await passBotCheck(page);
  162 | }
  163 | 
  164 | // ---- Accounts Overview ----------------------------------------------------------------------------
  165 | 
  166 | /** Account numbers shown in the Accounts Overview (gap G2: how they are shown). */
  167 | const accountNumberLinks = (p: Page) => p.locator('#accountTable tbody a');
  168 | 
  169 | async function shownAccountNumbers(page: Page): Promise<string[]> {
  170 |   await expect(accountNumberLinks(page).first(), 'account numbers rendered (precondition)').toBeVisible();
  171 |   return (await accountNumberLinks(page).allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  172 | }
  173 | 
  174 | // ---- REST helpers ---------------------------------------------------------------------------------
  175 | 
  176 | async function restLogin(api: Api, username: string, password: string) {
  177 |   return api.get<RestCustomer>(EP.loginByUsernameAndPassword(username, password), { headers: { Accept: 'application/json' } });
  178 | }
  179 | 
  180 | test.describe('PB-1 Customer registration and sign-in', () => {
  181 |   test('SCN-001: Submitting an empty registration form shows a required message next to every required field', { tag: ['@AC-1', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  182 |     await journey.step('Given I am on the registration page register.htm', async () => {
  183 |       await open(page, PAGES.register);
  184 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  185 |     });
  186 |     await journey.step('When I submit the registration form with every field empty', async () => {
  187 |       await registerButton(page).click(); await passBotCheck(page);
  188 |     });
  189 |     await journey.step('Then I am still on the registration form', async () => {
  190 |       await expect(registerButton(page), '[REQ AC-1] still on the registration form').toBeVisible();
  191 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-1] no customer created').toHaveCount(0);
  192 |     });
  193 |     for (const { field, message } of REQ.AC1_REQUIRED) {
  194 |       await journey.step(`And "${message}" is shown next to ${field}`, async () => {
  195 |         await expect.soft(fieldRow(page, field), `[REQ AC-1] "${message}" next to ${field}`).toContainText(message);
  196 |       });
  197 |     }
  198 |     await journey.step('And no message is shown for Phone #', async () => {
  199 |       await expect(fieldRow(page, REQ.AC1_OPTIONAL_FIELD), '[REQ AC-1] no message for Phone #').not.toContainText(/required/i);
  200 |     });
  201 |   });
  202 | 
  203 |   test('SCN-002: Registering with a Confirm that differs from Password shows "Passwords did not match."', { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  204 |     const c = validCustomer(data, seed);
  205 |     await journey.step('Given I am on the registration page register.htm', async () => {
  206 |       await open(page, PAGES.register);
  207 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  208 |     });
  209 |     await journey.step('When I submit a complete registration with a fresh user name whose Confirm differs from Password', async () => {
  210 |       await fillRegistration(page, c, `${c.password}x9`);
  211 |       await registerButton(page).click(); await passBotCheck(page);
  212 |     });
  213 |     await journey.step('Then the form shows "Passwords did not match."', async () => {
  214 |       await expect(page.getByText(REQ.AC2_MISMATCH), '[REQ AC-2] "Passwords did not match." shown').toBeVisible();
  215 |     });
  216 |   });
  217 | 
  218 |   test('SCN-003: A registration rejected for mismatched passwords creates no customer', { tag: ['@AC-2', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  219 |     const c = validCustomer(data, seed);
  220 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  221 |     await journey.step('Given I submitted a complete registration with a fresh user name whose Confirm differs from Password', async () => {
  222 |       await seed.step('registration with mismatched Confirm submitted via register.htm', async () => {
  223 |         await open(page, PAGES.register);
  224 |         await fillRegistration(page, c, `${c.password}x9`);
  225 |         await registerButton(page).click(); await passBotCheck(page);
  226 |         await expect(registerButton(page), 'form re-shown after the rejected registration (precondition)').toBeVisible();
  227 |       });
  228 |     });
  229 |     await journey.step('When I call GET /login/{username}/{password} with that user name and the Password I entered', async () => {
  230 |       res = await restLogin(api, c.username, c.password);
  231 |     });
  232 |     await journey.step('Then the call does not answer 200 with a customer', async () => {
  233 |       const gotCustomer = res.status === REQ.STATUS.OK && typeof res.body === 'object' && res.body !== null && 'id' in (res.body as object);
  234 |       expect(gotCustomer, `[REQ AC-2] user name cannot sign in (got ${res.status})`).toBe(false);
  235 |     });
  236 |   });
  237 | 
  238 |   test('SCN-004: A complete, valid registration welcomes the new customer and signs them in', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  239 |     const c = validCustomer(data, seed);
  240 |     await journey.step('Given I am on the registration page register.htm', async () => {
  241 |       await open(page, PAGES.register);
> 242 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
      |                                                                                    ^ Error: registration form shown (precondition)
  243 |     });
  244 |     await journey.step('When I submit a complete, valid registration with a fresh user name', async () => {
  245 |       await fillRegistration(page, c);
  246 |       await registerButton(page).click(); await passBotCheck(page);
  247 |     });
  248 |     await journey.step('Then the page shows the heading "Welcome <username>"', async () => {
  249 |       await expect(page.getByRole('heading', { name: REQ.AC3_HEADING(c.username) }), '[REQ AC-3] heading Welcome <username>').toBeVisible();
  250 |     });
  251 |     await journey.step('And the page shows "Your account was created successfully. You are now logged in."', async () => {
  252 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-3] account created text').toBeVisible();
  253 |     });
  254 |     await journey.step('And the left panel greets me with "Welcome <first name> <last name>"', async () => {
  255 |       await expect(page.getByText(REQ.AC3_GREETING(c.firstName, c.lastName)), '[REQ AC-3] left panel greeting').toBeVisible();
  256 |     });
  257 |     await journey.step('And the left panel shows the Account Services menu', async () => {
  258 |       await expect(page.getByRole('heading', { name: REQ.AC3_MENU }), '[REQ AC-3] Account Services menu').toBeVisible();
  259 |     });
  260 |   });
  261 | 
  262 |   test('SCN-005: Registering with a user name that is already taken shows "This username already exists."', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  263 |     const existing = validCustomer(data, seed);
  264 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  265 |       await registerCustomer(seed, page, existing);
  266 |     });
  267 |     await journey.step('And I am on the registration page register.htm as a new visitor', async () => {
  268 |       await signedOutVisitor(page);
  269 |       await open(page, PAGES.register);
  270 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  271 |     });
  272 |     await journey.step('When I submit a complete registration with the same user name and a different first and last name', async () => {
  273 |       await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  274 |       await registerButton(page).click(); await passBotCheck(page);
  275 |     });
  276 |     await journey.step('Then "This username already exists." is shown next to Username', async () => {
  277 |       await expect(fieldRow(page, 'Username'), '[REQ AC-4] "This username already exists." next to Username').toContainText(REQ.AC4_DUPLICATE);
  278 |     });
  279 |   });
  280 | 
  281 |   test('SCN-006: A duplicate registration does not change the existing customer', { tag: ['@AC-4', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  282 |     const existing = validCustomer(data, seed);
  283 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  284 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  285 |       await registerCustomer(seed, page, existing);
  286 |     });
  287 |     await journey.step('And a second registration with the same user name and a different first and last name was submitted', async () => {
  288 |       await seed.step('duplicate registration submitted via register.htm', async () => {
  289 |         await signedOutVisitor(page);
  290 |         await open(page, PAGES.register);
  291 |         await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  292 |         await registerButton(page).click(); await passBotCheck(page);
  293 |         await page.waitForLoadState('domcontentloaded');
  294 |       });
  295 |     });
  296 |     await journey.step('When I call GET /login/{username}/{password} for the existing customer', async () => {
  297 |       res = await restLogin(api, existing.username, existing.password);
  298 |     });
  299 |     await journey.step('Then the response returns the original first and last name', async () => {
  300 |       expect(res.status, '[REQ AC-4] existing customer can still log in (REST)').toBe(REQ.STATUS.OK);
  301 |       expect.soft(res.body?.firstName, '[REQ AC-4] original first name kept').toBe(existing.firstName);
  302 |       expect.soft(res.body?.lastName, '[REQ AC-4] original last name kept').toBe(existing.lastName);
  303 |     });
  304 |   });
  305 | 
  306 |   test('SCN-007: Signing in with a wrong password shows the "Error!" page', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  307 |     const c = validCustomer(data, seed);
  308 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  309 |       await registerCustomer(seed, page, c);
  310 |     });
  311 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  312 |       await signedOutVisitor(page);
  313 |       await open(page, PAGES.home);
  314 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  315 |     });
  316 |     await journey.step('When I sign in on the Customer Login panel with that user name and a wrong password', async () => {
  317 |       await signIn(page, c.username, data.customer.wrongPassword);
  318 |     });
  319 |     await journey.step('Then an "Error!" page is shown', async () => {
  320 |       await expect(page.getByRole('heading', { name: REQ.AC5_ERROR_HEADING }), '[REQ AC-5] "Error!" page').toBeVisible();
  321 |     });
  322 |     await journey.step('And it says "The username and password could not be verified."', async () => {
  323 |       await expect(page.getByText(REQ.AC5_NOT_VERIFIED), '[REQ AC-5] could not be verified').toBeVisible();
  324 |     });
  325 |   });
  326 | 
  327 |   test('SCN-008: Signing in with both fields empty asks for a user name and password', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  328 |     await journey.step('Given I am on the home page as a signed-out visitor', async () => {
  329 |       await signedOutVisitor(page);
  330 |       await open(page, PAGES.home);
  331 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  332 |     });
  333 |     await journey.step('When I sign in on the Customer Login panel with both fields empty', async () => {
  334 |       await loginButton(page).click(); await passBotCheck(page);
  335 |     });
  336 |     await journey.step('Then the page says "Please enter a username and password."', async () => {
  337 |       await expect(page.getByText(REQ.AC5_EMPTY), '[REQ AC-5] please enter a username and password').toBeVisible();
  338 |     });
  339 |   });
  340 | 
  341 |   test('SCN-009: Signing in opens the Accounts Overview and Log Out returns to the home page', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  342 |     const c = validCustomer(data, seed);
```