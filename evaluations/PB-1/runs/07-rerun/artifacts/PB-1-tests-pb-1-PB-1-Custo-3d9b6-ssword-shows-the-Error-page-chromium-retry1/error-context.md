# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-007: Signing in with a wrong password shows the "Error!" page
- Location: evaluations\PB-1\tests\pb-1.spec.ts:319:3

# Error details

```
Error: [REQ AC-5] could not be verified

expect(locator).toBeVisible() failed

Locator: getByText('The username and password could not be verified.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - [REQ AC-5] could not be verified getByText('The username and password could not be verified.') with timeout 5000ms
  - waiting for getByText('The username and password could not be verified.')

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
- heading "Customer Login" [level=2]
- paragraph: Username
- textbox
- paragraph: Password
- textbox
- button "Log In"
- paragraph:
  - link "Forgot login info?":
    - /url: lookup.htm
- paragraph:
  - link "Register":
    - /url: register.htm
- heading "Error!" [level=1]
- paragraph: An internal error has occurred and has been logged.
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

# Test source

```ts
  236 |         await open(page, PAGES.register);
  237 |         await fillRegistration(page, c, `${c.password}x9`);
  238 |         await registerButton(page).click(); await passBotCheck(page);
  239 |         await expect(registerButton(page), 'form re-shown after the rejected registration (precondition)').toBeVisible();
  240 |       });
  241 |     });
  242 |     await journey.step('When I call GET /login/{username}/{password} with that user name and the Password I entered', async () => {
  243 |       res = await restLogin(api, c.username, c.password);
  244 |     });
  245 |     await journey.step('Then the call does not answer 200 with a customer', async () => {
  246 |       const gotCustomer = res.status === REQ.STATUS.OK && typeof res.body === 'object' && res.body !== null && 'id' in (res.body as object);
  247 |       expect(gotCustomer, `[REQ AC-2] user name cannot sign in (got ${res.status})`).toBe(false);
  248 |     });
  249 |   });
  250 | 
  251 |   test('SCN-004: A complete, valid registration welcomes the new customer and signs them in', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  252 |     const c = validCustomer(data, seed);
  253 |     await journey.step('Given I am on the registration page register.htm', async () => {
  254 |       await open(page, PAGES.register);
  255 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  256 |     });
  257 |     await journey.step('When I submit a complete, valid registration with a fresh user name', async () => {
  258 |       await fillRegistration(page, c);
  259 |       await registerButton(page).click(); await passBotCheck(page);
  260 |     });
  261 |     await journey.step('Then the page shows the heading "Welcome <username>"', async () => {
  262 |       await expect(page.getByRole('heading', { name: REQ.AC3_HEADING(c.username) }), '[REQ AC-3] heading Welcome <username>').toBeVisible();
  263 |     });
  264 |     await journey.step('And the page shows "Your account was created successfully. You are now logged in."', async () => {
  265 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-3] account created text').toBeVisible();
  266 |     });
  267 |     await journey.step('And the left panel greets me with "Welcome <first name> <last name>"', async () => {
  268 |       await expect(page.getByText(REQ.AC3_GREETING(c.firstName, c.lastName)), '[REQ AC-3] left panel greeting').toBeVisible();
  269 |     });
  270 |     await journey.step('And the left panel shows the Account Services menu', async () => {
  271 |       await expect(page.getByRole('heading', { name: REQ.AC3_MENU }), '[REQ AC-3] Account Services menu').toBeVisible();
  272 |     });
  273 |   });
  274 | 
  275 |   test('SCN-005: Registering with a user name that is already taken shows "This username already exists."', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  276 |     const existing = validCustomer(data, seed);
  277 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  278 |       await registerCustomer(seed, page, existing);
  279 |     });
  280 |     await journey.step('And I am on the registration page register.htm as a new visitor', async () => {
  281 |       await signedOutVisitor(page);
  282 |       await open(page, PAGES.register);
  283 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  284 |     });
  285 |     await journey.step('When I submit a complete registration with the same user name and a different first and last name', async () => {
  286 |       await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  287 |       await registerButton(page).click(); await passBotCheck(page);
  288 |     });
  289 |     await journey.step('Then "This username already exists." is shown next to Username', async () => {
  290 |       await expect(fieldRow(page, 'Username'), '[REQ AC-4] "This username already exists." next to Username').toContainText(REQ.AC4_DUPLICATE);
  291 |     });
  292 |   });
  293 | 
  294 |   test('SCN-006: A duplicate registration does not change the existing customer', { tag: ['@AC-4', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  295 |     const existing = validCustomer(data, seed);
  296 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  297 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  298 |       await registerCustomer(seed, page, existing);
  299 |     });
  300 |     await journey.step('And a second registration with the same user name and a different first and last name was submitted', async () => {
  301 |       await seed.step('duplicate registration submitted via register.htm', async () => {
  302 |         await signedOutVisitor(page);
  303 |         await open(page, PAGES.register);
  304 |         await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  305 |         await registerButton(page).click(); await passBotCheck(page);
  306 |         await page.waitForLoadState('domcontentloaded');
  307 |       });
  308 |     });
  309 |     await journey.step('When I call GET /login/{username}/{password} for the existing customer', async () => {
  310 |       res = await restLogin(api, existing.username, existing.password);
  311 |     });
  312 |     await journey.step('Then the response returns the original first and last name', async () => {
  313 |       expect(res.status, '[REQ AC-4] existing customer can still log in (REST)').toBe(REQ.STATUS.OK);
  314 |       expect.soft(res.body?.firstName, '[REQ AC-4] original first name kept').toBe(existing.firstName);
  315 |       expect.soft(res.body?.lastName, '[REQ AC-4] original last name kept').toBe(existing.lastName);
  316 |     });
  317 |   });
  318 | 
  319 |   test('SCN-007: Signing in with a wrong password shows the "Error!" page', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  320 |     const c = validCustomer(data, seed);
  321 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  322 |       await registerCustomer(seed, page, c);
  323 |     });
  324 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  325 |       await signedOutVisitor(page);
  326 |       await open(page, PAGES.home);
  327 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  328 |     });
  329 |     await journey.step('When I sign in on the Customer Login panel with that user name and a wrong password', async () => {
  330 |       await signIn(page, c.username, data.customer.wrongPassword);
  331 |     });
  332 |     await journey.step('Then an "Error!" page is shown', async () => {
  333 |       await expect(page.getByRole('heading', { name: REQ.AC5_ERROR_HEADING }), '[REQ AC-5] "Error!" page').toBeVisible();
  334 |     });
  335 |     await journey.step('And it says "The username and password could not be verified."', async () => {
> 336 |       await expect(page.getByText(REQ.AC5_NOT_VERIFIED), '[REQ AC-5] could not be verified').toBeVisible();
      |                                                                                              ^ Error: [REQ AC-5] could not be verified
  337 |     });
  338 |   });
  339 | 
  340 |   test('SCN-008: Signing in with both fields empty asks for a user name and password', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  341 |     await journey.step('Given I am on the home page as a signed-out visitor', async () => {
  342 |       await signedOutVisitor(page);
  343 |       await open(page, PAGES.home);
  344 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  345 |     });
  346 |     await journey.step('When I sign in on the Customer Login panel with both fields empty', async () => {
  347 |       await loginButton(page).click(); await passBotCheck(page);
  348 |     });
  349 |     await journey.step('Then the page says "Please enter a username and password."', async () => {
  350 |       await expect(page.getByText(REQ.AC5_EMPTY), '[REQ AC-5] please enter a username and password').toBeVisible();
  351 |     });
  352 |   });
  353 | 
  354 |   test('SCN-009: Signing in opens the Accounts Overview and Log Out returns to the home page', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  355 |     const c = validCustomer(data, seed);
  356 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  357 |       await registerCustomer(seed, page, c);
  358 |     });
  359 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  360 |       await signedOutVisitor(page);
  361 |       await open(page, PAGES.home);
  362 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  363 |     });
  364 |     await journey.step('When I sign in on the Customer Login panel with that user name and password', async () => {
  365 |       await signIn(page, c.username, c.password);
  366 |     });
  367 |     await journey.step('Then the Accounts Overview page opens', async () => {
  368 |       await expect(page.getByRole('heading', { name: REQ.AC6_OVERVIEW }), '[REQ AC-6] Accounts Overview page').toBeVisible();
  369 |     });
  370 |     await journey.step('And it lists at least one account', async () => {
  371 |       await expect(accountNumberLinks(page).first(), '[REQ AC-6] at least one account listed').toBeVisible();
  372 |     });
  373 |     await journey.step('When I click "Log Out"', async () => {
  374 |       await page.getByRole('link', { name: REQ.AC6_LOGOUT }).click(); await passBotCheck(page);
  375 |     });
  376 |     await journey.step('Then I am on the home page with the Customer Login panel', async () => {
  377 |       await expect(loginPanelHeading(page), '[REQ AC-6] Customer Login panel shown').toBeVisible();
  378 |       await expect(loginButton(page), '[REQ AC-6] Customer Login panel usable').toBeVisible();
  379 |     });
  380 |   });
  381 | 
  382 |   test('SCN-010: REST login with valid credentials returns the registered customer as JSON', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  383 |     const c = validCustomer(data, seed);
  384 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  385 |     await journey.step('Given a customer is registered with a fresh user name, a full address and a Phone #', async () => {
  386 |       await registerCustomer(seed, page, c);
  387 |     });
  388 |     await journey.step('When I call GET /login/{username}/{password} with Accept: application/json', async () => {
  389 |       res = await restLogin(api, c.username, c.password);
  390 |     });
  391 |     await journey.step('Then the response status is 200', async () => {
  392 |       expect(res.status, '[REQ AC-7] valid login → 200').toBe(REQ.STATUS.OK);
  393 |     });
  394 |     await journey.step('And the body is JSON', async () => {
  395 |       expect(res.headers['content-type'] ?? '', '[REQ AC-7] JSON content type').toMatch(/json/i);
  396 |       expect(typeof res.body, '[REQ AC-7] body parses as JSON').toBe('object');
  397 |     });
  398 |     await journey.step("And it contains the customer's id", async () => {
  399 |       expect(checkShape(res.body, CUSTOMER_SHAPE, 'customer'), '[REQ AC-7] customer fields present').toEqual([]);
  400 |     });
  401 |     await journey.step('And firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal the values entered at registration', async () => {
  402 |       const b = res.body;
  403 |       expect.soft(b.firstName, '[REQ AC-7] firstName').toBe(c.firstName);
  404 |       expect.soft(b.lastName, '[REQ AC-7] lastName').toBe(c.lastName);
  405 |       expect.soft(b.address?.street, '[REQ AC-7] address.street').toBe(c.street);
  406 |       expect.soft(b.address?.city, '[REQ AC-7] address.city').toBe(c.city);
  407 |       expect.soft(b.address?.state, '[REQ AC-7] address.state').toBe(c.state);
  408 |       expect.soft(b.address?.zipCode, '[REQ AC-7] address.zipCode').toBe(c.zipCode);
  409 |       expect.soft(b.phoneNumber, '[REQ AC-7] phoneNumber').toBe(c.phoneNumber);
  410 |     });
  411 |   });
  412 | 
  413 |   test('SCN-011: REST login without Accept: application/json returns XML with a customer root element', { tag: ['@AC-7', '@type:contract', '@layer:api', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  414 |     const c = validCustomer(data, seed);
  415 |     let res!: Awaited<ReturnType<Api['get']>>;
  416 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  417 |       await registerCustomer(seed, page, c);
  418 |     });
  419 |     await journey.step('When I call GET /login/{username}/{password} without Accept: application/json', async () => {
  420 |       res = await api.get(EP.loginByUsernameAndPassword(c.username, c.password), { headers: { Accept: '*/*' } });
  421 |     });
  422 |     await journey.step('Then the response status is 200', async () => {
  423 |       expect(res.status, '[REQ AC-7] valid login (XML) → 200').toBe(REQ.STATUS.OK);
  424 |     });
  425 |     await journey.step('And the body is XML with a customer root element', async () => {
  426 |       const root = res.text.replace(/^﻿?\s*(<\?xml[^>]*\?>\s*)?/, '').match(/^<([A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)[\s/>]/)?.[2];
  427 |       expect(root, '[REQ AC-7] XML root element is customer').toBe(REQ.AC7_XML_ROOT);
  428 |     });
  429 |   });
  430 | 
  431 |   test('SCN-012: REST login with a wrong password answers 400 "Invalid username and/or password"', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  432 |     const c = validCustomer(data, seed);
  433 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  434 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  435 |       await registerCustomer(seed, page, c);
  436 |     });
```