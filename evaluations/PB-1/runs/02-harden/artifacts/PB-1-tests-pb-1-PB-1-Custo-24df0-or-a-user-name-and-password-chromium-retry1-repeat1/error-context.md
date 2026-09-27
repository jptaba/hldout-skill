# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-008: Signing in with both fields empty asks for a user name and password
- Location: evaluations\PB-1\tests\pb-1.spec.ts:327:3

# Error details

```
Error: Customer Login panel shown (precondition)

expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Log In', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Customer Login panel shown (precondition) getByRole('button', { name: 'Log In', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Log In', exact: true })

```

```yaml
- banner:
  - heading "Error 1015" [level=1]
  - text: "Ray ID: a4183721be693ee0 • 2026-09-27 05:47:44 UTC"
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
  - strong: a4183721be693ee0
  - text: "• Your IP:"
  - button "Click to reveal"
  - text: • Performance & security by
  - link "Cloudflare":
    - /url: https://www.cloudflare.com/5xx-error-landing
```

# Test source

```ts
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
  242 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
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
> 331 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
      |                                                                                    ^ Error: Customer Login panel shown (precondition)
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
  343 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  344 |       await registerCustomer(seed, page, c);
  345 |     });
  346 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  347 |       await signedOutVisitor(page);
  348 |       await open(page, PAGES.home);
  349 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  350 |     });
  351 |     await journey.step('When I sign in on the Customer Login panel with that user name and password', async () => {
  352 |       await signIn(page, c.username, c.password);
  353 |     });
  354 |     await journey.step('Then the Accounts Overview page opens', async () => {
  355 |       await expect(page.getByRole('heading', { name: REQ.AC6_OVERVIEW }), '[REQ AC-6] Accounts Overview page').toBeVisible();
  356 |     });
  357 |     await journey.step('And it lists at least one account', async () => {
  358 |       await expect(accountNumberLinks(page).first(), '[REQ AC-6] at least one account listed').toBeVisible();
  359 |     });
  360 |     await journey.step('When I click "Log Out"', async () => {
  361 |       await page.getByRole('link', { name: REQ.AC6_LOGOUT }).click(); await passBotCheck(page);
  362 |     });
  363 |     await journey.step('Then I am on the home page with the Customer Login panel', async () => {
  364 |       await expect(loginPanelHeading(page), '[REQ AC-6] Customer Login panel shown').toBeVisible();
  365 |       await expect(loginButton(page), '[REQ AC-6] Customer Login panel usable').toBeVisible();
  366 |     });
  367 |   });
  368 | 
  369 |   test('SCN-010: REST login with valid credentials returns the registered customer as JSON', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  370 |     const c = validCustomer(data, seed);
  371 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  372 |     await journey.step('Given a customer is registered with a fresh user name, a full address and a Phone #', async () => {
  373 |       await registerCustomer(seed, page, c);
  374 |     });
  375 |     await journey.step('When I call GET /login/{username}/{password} with Accept: application/json', async () => {
  376 |       res = await restLogin(api, c.username, c.password);
  377 |     });
  378 |     await journey.step('Then the response status is 200', async () => {
  379 |       expect(res.status, '[REQ AC-7] valid login → 200').toBe(REQ.STATUS.OK);
  380 |     });
  381 |     await journey.step('And the body is JSON', async () => {
  382 |       expect(res.headers['content-type'] ?? '', '[REQ AC-7] JSON content type').toMatch(/json/i);
  383 |       expect(typeof res.body, '[REQ AC-7] body parses as JSON').toBe('object');
  384 |     });
  385 |     await journey.step("And it contains the customer's id", async () => {
  386 |       expect(checkShape(res.body, CUSTOMER_SHAPE, 'customer'), '[REQ AC-7] customer fields present').toEqual([]);
  387 |     });
  388 |     await journey.step('And firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal the values entered at registration', async () => {
  389 |       const b = res.body;
  390 |       expect.soft(b.firstName, '[REQ AC-7] firstName').toBe(c.firstName);
  391 |       expect.soft(b.lastName, '[REQ AC-7] lastName').toBe(c.lastName);
  392 |       expect.soft(b.address?.street, '[REQ AC-7] address.street').toBe(c.street);
  393 |       expect.soft(b.address?.city, '[REQ AC-7] address.city').toBe(c.city);
  394 |       expect.soft(b.address?.state, '[REQ AC-7] address.state').toBe(c.state);
  395 |       expect.soft(b.address?.zipCode, '[REQ AC-7] address.zipCode').toBe(c.zipCode);
  396 |       expect.soft(b.phoneNumber, '[REQ AC-7] phoneNumber').toBe(c.phoneNumber);
  397 |     });
  398 |   });
  399 | 
  400 |   test('SCN-011: REST login without Accept: application/json returns XML with a customer root element', { tag: ['@AC-7', '@type:contract', '@layer:api', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  401 |     const c = validCustomer(data, seed);
  402 |     let res!: Awaited<ReturnType<Api['get']>>;
  403 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  404 |       await registerCustomer(seed, page, c);
  405 |     });
  406 |     await journey.step('When I call GET /login/{username}/{password} without Accept: application/json', async () => {
  407 |       res = await api.get(EP.loginByUsernameAndPassword(c.username, c.password), { headers: { Accept: '*/*' } });
  408 |     });
  409 |     await journey.step('Then the response status is 200', async () => {
  410 |       expect(res.status, '[REQ AC-7] valid login (XML) → 200').toBe(REQ.STATUS.OK);
  411 |     });
  412 |     await journey.step('And the body is XML with a customer root element', async () => {
  413 |       const root = res.text.replace(/^﻿?\s*(<\?xml[^>]*\?>\s*)?/, '').match(/^<([A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)[\s/>]/)?.[2];
  414 |       expect(root, '[REQ AC-7] XML root element is customer').toBe(REQ.AC7_XML_ROOT);
  415 |     });
  416 |   });
  417 | 
  418 |   test('SCN-012: REST login with a wrong password answers 400 "Invalid username and/or password"', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  419 |     const c = validCustomer(data, seed);
  420 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  421 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  422 |       await registerCustomer(seed, page, c);
  423 |     });
  424 |     await journey.step('When I call GET /login/{username}/{password} with a wrong password', async () => {
  425 |       res = await restLogin(api, c.username, data.customer.wrongPassword);
  426 |     });
  427 |     await journey.step('Then the response status is 400', async () => {
  428 |       expect(res.status, '[REQ AC-8] wrong password → 400').toBe(REQ.STATUS.BAD_REQUEST);
  429 |     });
  430 |     await journey.step('And the body is "Invalid username and/or password"', async () => {
  431 |       expect(res.text.trim(), '[REQ AC-8] body text').toBe(REQ.AC8_BODY);
```