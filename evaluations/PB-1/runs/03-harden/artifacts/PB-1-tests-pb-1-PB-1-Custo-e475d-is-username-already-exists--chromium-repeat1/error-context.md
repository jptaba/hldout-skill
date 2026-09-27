# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-005: Registering with a user name that is already taken shows "This username already exists."
- Location: evaluations\PB-1\tests\pb-1.spec.ts:267:3

# Error details

```
Error: [REQ AC-4] "This username already exists." next to Username

expect(locator).toContainText(expected) failed

Locator: locator('tr').filter({ has: locator('[id="customer.username"]') })
Expected substring: "This username already exists."
Timeout: 5000ms
Error: element(s) not found

Call log:
  - [REQ AC-4] "This username already exists." next to Username locator('tr').filter({ has: locator('[id="customer.username"]') }) with timeout 5000ms
  - waiting for locator('tr').filter({ has: locator('[id="customer.username"]') })

```

```yaml
- main:
  - heading "parabank.parasoft.com" [level=1]
  - heading "Performing security verification" [level=2]
  - paragraph: This website uses a security service to protect against malicious bots. This page is displayed while the website verifies you are not a bot.
- contentinfo:
  - text: "Ray ID:"
  - code: a418408948a472b0
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
  182 |   test.beforeEach(async ({ page }) => {
  183 |     await page.route(/\.(png|jpe?g|gif|svg|ico|woff2?|ttf)(\?|$)/i, (route) => route.abort());
  184 |   });
  185 | 
  186 |   test('SCN-001: Submitting an empty registration form shows a required message next to every required field', { tag: ['@AC-1', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  187 |     await journey.step('Given I am on the registration page register.htm', async () => {
  188 |       await open(page, PAGES.register);
  189 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  190 |     });
  191 |     await journey.step('When I submit the registration form with every field empty', async () => {
  192 |       await registerButton(page).click(); await passBotCheck(page);
  193 |     });
  194 |     await journey.step('Then I am still on the registration form', async () => {
  195 |       await expect(registerButton(page), '[REQ AC-1] still on the registration form').toBeVisible();
  196 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-1] no customer created').toHaveCount(0);
  197 |     });
  198 |     for (const { field, message } of REQ.AC1_REQUIRED) {
  199 |       await journey.step(`And "${message}" is shown next to ${field}`, async () => {
  200 |         await expect.soft(fieldRow(page, field), `[REQ AC-1] "${message}" next to ${field}`).toContainText(message);
  201 |       });
  202 |     }
  203 |     await journey.step('And no message is shown for Phone #', async () => {
  204 |       await expect(fieldRow(page, REQ.AC1_OPTIONAL_FIELD), '[REQ AC-1] no message for Phone #').not.toContainText(/required/i);
  205 |     });
  206 |   });
  207 | 
  208 |   test('SCN-002: Registering with a Confirm that differs from Password shows "Passwords did not match."', { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  209 |     const c = validCustomer(data, seed);
  210 |     await journey.step('Given I am on the registration page register.htm', async () => {
  211 |       await open(page, PAGES.register);
  212 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  213 |     });
  214 |     await journey.step('When I submit a complete registration with a fresh user name whose Confirm differs from Password', async () => {
  215 |       await fillRegistration(page, c, `${c.password}x9`);
  216 |       await registerButton(page).click(); await passBotCheck(page);
  217 |     });
  218 |     await journey.step('Then the form shows "Passwords did not match."', async () => {
  219 |       await expect(page.getByText(REQ.AC2_MISMATCH), '[REQ AC-2] "Passwords did not match." shown').toBeVisible();
  220 |     });
  221 |   });
  222 | 
  223 |   test('SCN-003: A registration rejected for mismatched passwords creates no customer', { tag: ['@AC-2', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  224 |     const c = validCustomer(data, seed);
  225 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  226 |     await journey.step('Given I submitted a complete registration with a fresh user name whose Confirm differs from Password', async () => {
  227 |       await seed.step('registration with mismatched Confirm submitted via register.htm', async () => {
  228 |         await open(page, PAGES.register);
  229 |         await fillRegistration(page, c, `${c.password}x9`);
  230 |         await registerButton(page).click(); await passBotCheck(page);
  231 |         await expect(registerButton(page), 'form re-shown after the rejected registration (precondition)').toBeVisible();
  232 |       });
  233 |     });
  234 |     await journey.step('When I call GET /login/{username}/{password} with that user name and the Password I entered', async () => {
  235 |       res = await restLogin(api, c.username, c.password);
  236 |     });
  237 |     await journey.step('Then the call does not answer 200 with a customer', async () => {
  238 |       const gotCustomer = res.status === REQ.STATUS.OK && typeof res.body === 'object' && res.body !== null && 'id' in (res.body as object);
  239 |       expect(gotCustomer, `[REQ AC-2] user name cannot sign in (got ${res.status})`).toBe(false);
  240 |     });
  241 |   });
  242 | 
  243 |   test('SCN-004: A complete, valid registration welcomes the new customer and signs them in', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  244 |     const c = validCustomer(data, seed);
  245 |     await journey.step('Given I am on the registration page register.htm', async () => {
  246 |       await open(page, PAGES.register);
  247 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  248 |     });
  249 |     await journey.step('When I submit a complete, valid registration with a fresh user name', async () => {
  250 |       await fillRegistration(page, c);
  251 |       await registerButton(page).click(); await passBotCheck(page);
  252 |     });
  253 |     await journey.step('Then the page shows the heading "Welcome <username>"', async () => {
  254 |       await expect(page.getByRole('heading', { name: REQ.AC3_HEADING(c.username) }), '[REQ AC-3] heading Welcome <username>').toBeVisible();
  255 |     });
  256 |     await journey.step('And the page shows "Your account was created successfully. You are now logged in."', async () => {
  257 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-3] account created text').toBeVisible();
  258 |     });
  259 |     await journey.step('And the left panel greets me with "Welcome <first name> <last name>"', async () => {
  260 |       await expect(page.getByText(REQ.AC3_GREETING(c.firstName, c.lastName)), '[REQ AC-3] left panel greeting').toBeVisible();
  261 |     });
  262 |     await journey.step('And the left panel shows the Account Services menu', async () => {
  263 |       await expect(page.getByRole('heading', { name: REQ.AC3_MENU }), '[REQ AC-3] Account Services menu').toBeVisible();
  264 |     });
  265 |   });
  266 | 
  267 |   test('SCN-005: Registering with a user name that is already taken shows "This username already exists."', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  268 |     const existing = validCustomer(data, seed);
  269 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  270 |       await registerCustomer(seed, page, existing);
  271 |     });
  272 |     await journey.step('And I am on the registration page register.htm as a new visitor', async () => {
  273 |       await signedOutVisitor(page);
  274 |       await open(page, PAGES.register);
  275 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  276 |     });
  277 |     await journey.step('When I submit a complete registration with the same user name and a different first and last name', async () => {
  278 |       await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  279 |       await registerButton(page).click(); await passBotCheck(page);
  280 |     });
  281 |     await journey.step('Then "This username already exists." is shown next to Username', async () => {
> 282 |       await expect(fieldRow(page, 'Username'), '[REQ AC-4] "This username already exists." next to Username').toContainText(REQ.AC4_DUPLICATE);
      |                                                                                                               ^ Error: [REQ AC-4] "This username already exists." next to Username
  283 |     });
  284 |   });
  285 | 
  286 |   test('SCN-006: A duplicate registration does not change the existing customer', { tag: ['@AC-4', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  287 |     const existing = validCustomer(data, seed);
  288 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  289 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  290 |       await registerCustomer(seed, page, existing);
  291 |     });
  292 |     await journey.step('And a second registration with the same user name and a different first and last name was submitted', async () => {
  293 |       await seed.step('duplicate registration submitted via register.htm', async () => {
  294 |         await signedOutVisitor(page);
  295 |         await open(page, PAGES.register);
  296 |         await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  297 |         await registerButton(page).click(); await passBotCheck(page);
  298 |         await page.waitForLoadState('domcontentloaded');
  299 |       });
  300 |     });
  301 |     await journey.step('When I call GET /login/{username}/{password} for the existing customer', async () => {
  302 |       res = await restLogin(api, existing.username, existing.password);
  303 |     });
  304 |     await journey.step('Then the response returns the original first and last name', async () => {
  305 |       expect(res.status, '[REQ AC-4] existing customer can still log in (REST)').toBe(REQ.STATUS.OK);
  306 |       expect.soft(res.body?.firstName, '[REQ AC-4] original first name kept').toBe(existing.firstName);
  307 |       expect.soft(res.body?.lastName, '[REQ AC-4] original last name kept').toBe(existing.lastName);
  308 |     });
  309 |   });
  310 | 
  311 |   test('SCN-007: Signing in with a wrong password shows the "Error!" page', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  312 |     const c = validCustomer(data, seed);
  313 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  314 |       await registerCustomer(seed, page, c);
  315 |     });
  316 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  317 |       await signedOutVisitor(page);
  318 |       await open(page, PAGES.home);
  319 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  320 |     });
  321 |     await journey.step('When I sign in on the Customer Login panel with that user name and a wrong password', async () => {
  322 |       await signIn(page, c.username, data.customer.wrongPassword);
  323 |     });
  324 |     await journey.step('Then an "Error!" page is shown', async () => {
  325 |       await expect(page.getByRole('heading', { name: REQ.AC5_ERROR_HEADING }), '[REQ AC-5] "Error!" page').toBeVisible();
  326 |     });
  327 |     await journey.step('And it says "The username and password could not be verified."', async () => {
  328 |       await expect(page.getByText(REQ.AC5_NOT_VERIFIED), '[REQ AC-5] could not be verified').toBeVisible();
  329 |     });
  330 |   });
  331 | 
  332 |   test('SCN-008: Signing in with both fields empty asks for a user name and password', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  333 |     await journey.step('Given I am on the home page as a signed-out visitor', async () => {
  334 |       await signedOutVisitor(page);
  335 |       await open(page, PAGES.home);
  336 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  337 |     });
  338 |     await journey.step('When I sign in on the Customer Login panel with both fields empty', async () => {
  339 |       await loginButton(page).click(); await passBotCheck(page);
  340 |     });
  341 |     await journey.step('Then the page says "Please enter a username and password."', async () => {
  342 |       await expect(page.getByText(REQ.AC5_EMPTY), '[REQ AC-5] please enter a username and password').toBeVisible();
  343 |     });
  344 |   });
  345 | 
  346 |   test('SCN-009: Signing in opens the Accounts Overview and Log Out returns to the home page', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  347 |     const c = validCustomer(data, seed);
  348 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  349 |       await registerCustomer(seed, page, c);
  350 |     });
  351 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  352 |       await signedOutVisitor(page);
  353 |       await open(page, PAGES.home);
  354 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  355 |     });
  356 |     await journey.step('When I sign in on the Customer Login panel with that user name and password', async () => {
  357 |       await signIn(page, c.username, c.password);
  358 |     });
  359 |     await journey.step('Then the Accounts Overview page opens', async () => {
  360 |       await expect(page.getByRole('heading', { name: REQ.AC6_OVERVIEW }), '[REQ AC-6] Accounts Overview page').toBeVisible();
  361 |     });
  362 |     await journey.step('And it lists at least one account', async () => {
  363 |       await expect(accountNumberLinks(page).first(), '[REQ AC-6] at least one account listed').toBeVisible();
  364 |     });
  365 |     await journey.step('When I click "Log Out"', async () => {
  366 |       await page.getByRole('link', { name: REQ.AC6_LOGOUT }).click(); await passBotCheck(page);
  367 |     });
  368 |     await journey.step('Then I am on the home page with the Customer Login panel', async () => {
  369 |       await expect(loginPanelHeading(page), '[REQ AC-6] Customer Login panel shown').toBeVisible();
  370 |       await expect(loginButton(page), '[REQ AC-6] Customer Login panel usable').toBeVisible();
  371 |     });
  372 |   });
  373 | 
  374 |   test('SCN-010: REST login with valid credentials returns the registered customer as JSON', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  375 |     const c = validCustomer(data, seed);
  376 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  377 |     await journey.step('Given a customer is registered with a fresh user name, a full address and a Phone #', async () => {
  378 |       await registerCustomer(seed, page, c);
  379 |     });
  380 |     await journey.step('When I call GET /login/{username}/{password} with Accept: application/json', async () => {
  381 |       res = await restLogin(api, c.username, c.password);
  382 |     });
```