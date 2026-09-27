# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-007: Signing in with a wrong password shows the "Error!" page
- Location: evaluations\PB-1\tests\pb-1.spec.ts:321:3

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
  238 |         await open(page, PAGES.register);
  239 |         await fillRegistration(page, c, `${c.password}x9`);
  240 |         await registerButton(page).click(); await passBotCheck(page);
  241 |         await expect(registerButton(page), 'form re-shown after the rejected registration (precondition)').toBeVisible();
  242 |       });
  243 |     });
  244 |     await journey.step('When I call GET /login/{username}/{password} with that user name and the Password I entered', async () => {
  245 |       res = await restLogin(api, c.username, c.password);
  246 |     });
  247 |     await journey.step('Then the call does not answer 200 with a customer', async () => {
  248 |       const gotCustomer = res.status === REQ.STATUS.OK && typeof res.body === 'object' && res.body !== null && 'id' in (res.body as object);
  249 |       expect(gotCustomer, `[REQ AC-2] user name cannot sign in (got ${res.status})`).toBe(false);
  250 |     });
  251 |   });
  252 | 
  253 |   test('SCN-004: A complete, valid registration welcomes the new customer and signs them in', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  254 |     const c = validCustomer(data, seed);
  255 |     await journey.step('Given I am on the registration page register.htm', async () => {
  256 |       await open(page, PAGES.register);
  257 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  258 |     });
  259 |     await journey.step('When I submit a complete, valid registration with a fresh user name', async () => {
  260 |       await fillRegistration(page, c);
  261 |       await registerButton(page).click(); await passBotCheck(page);
  262 |     });
  263 |     await journey.step('Then the page shows the heading "Welcome <username>"', async () => {
  264 |       await expect(page.getByRole('heading', { name: REQ.AC3_HEADING(c.username) }), '[REQ AC-3] heading Welcome <username>').toBeVisible();
  265 |     });
  266 |     await journey.step('And the page shows "Your account was created successfully. You are now logged in."', async () => {
  267 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-3] account created text').toBeVisible();
  268 |     });
  269 |     await journey.step('And the left panel greets me with "Welcome <first name> <last name>"', async () => {
  270 |       await expect(page.getByText(REQ.AC3_GREETING(c.firstName, c.lastName)), '[REQ AC-3] left panel greeting').toBeVisible();
  271 |     });
  272 |     await journey.step('And the left panel shows the Account Services menu', async () => {
  273 |       await expect(page.getByRole('heading', { name: REQ.AC3_MENU }), '[REQ AC-3] Account Services menu').toBeVisible();
  274 |     });
  275 |   });
  276 | 
  277 |   test('SCN-005: Registering with a user name that is already taken shows "This username already exists."', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  278 |     const existing = validCustomer(data, seed);
  279 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  280 |       await registerCustomer(seed, page, existing);
  281 |     });
  282 |     await journey.step('And I am on the registration page register.htm as a new visitor', async () => {
  283 |       await signedOutVisitor(page);
  284 |       await open(page, PAGES.register);
  285 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  286 |     });
  287 |     await journey.step('When I submit a complete registration with the same user name and a different first and last name', async () => {
  288 |       await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  289 |       await registerButton(page).click(); await passBotCheck(page);
  290 |     });
  291 |     await journey.step('Then "This username already exists." is shown next to Username', async () => {
  292 |       await expect(fieldRow(page, 'Username'), '[REQ AC-4] "This username already exists." next to Username').toContainText(REQ.AC4_DUPLICATE);
  293 |     });
  294 |   });
  295 | 
  296 |   test('SCN-006: A duplicate registration does not change the existing customer', { tag: ['@AC-4', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  297 |     const existing = validCustomer(data, seed);
  298 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  299 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  300 |       await registerCustomer(seed, page, existing);
  301 |     });
  302 |     await journey.step('And a second registration with the same user name and a different first and last name was submitted', async () => {
  303 |       await seed.step('duplicate registration submitted via register.htm', async () => {
  304 |         await signedOutVisitor(page);
  305 |         await open(page, PAGES.register);
  306 |         await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  307 |         await registerButton(page).click(); await passBotCheck(page);
  308 |         await page.waitForLoadState('domcontentloaded');
  309 |       });
  310 |     });
  311 |     await journey.step('When I call GET /login/{username}/{password} for the existing customer', async () => {
  312 |       res = await restLogin(api, existing.username, existing.password);
  313 |     });
  314 |     await journey.step('Then the response returns the original first and last name', async () => {
  315 |       expect(res.status, '[REQ AC-4] existing customer can still log in (REST)').toBe(REQ.STATUS.OK);
  316 |       expect.soft(res.body?.firstName, '[REQ AC-4] original first name kept').toBe(existing.firstName);
  317 |       expect.soft(res.body?.lastName, '[REQ AC-4] original last name kept').toBe(existing.lastName);
  318 |     });
  319 |   });
  320 | 
  321 |   test('SCN-007: Signing in with a wrong password shows the "Error!" page', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  322 |     const c = validCustomer(data, seed);
  323 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  324 |       await registerCustomer(seed, page, c);
  325 |     });
  326 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  327 |       await signedOutVisitor(page);
  328 |       await open(page, PAGES.home);
  329 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  330 |     });
  331 |     await journey.step('When I sign in on the Customer Login panel with that user name and a wrong password', async () => {
  332 |       await signIn(page, c.username, data.customer.wrongPassword);
  333 |     });
  334 |     await journey.step('Then an "Error!" page is shown', async () => {
  335 |       await expect(page.getByRole('heading', { name: REQ.AC5_ERROR_HEADING }), '[REQ AC-5] "Error!" page').toBeVisible();
  336 |     });
  337 |     await journey.step('And it says "The username and password could not be verified."', async () => {
> 338 |       await expect(page.getByText(REQ.AC5_NOT_VERIFIED), '[REQ AC-5] could not be verified').toBeVisible();
      |                                                                                              ^ Error: [REQ AC-5] could not be verified
  339 |     });
  340 |   });
  341 | 
  342 |   test('SCN-008: Signing in with both fields empty asks for a user name and password', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  343 |     await journey.step('Given I am on the home page as a signed-out visitor', async () => {
  344 |       await signedOutVisitor(page);
  345 |       await open(page, PAGES.home);
  346 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  347 |     });
  348 |     await journey.step('When I sign in on the Customer Login panel with both fields empty', async () => {
  349 |       await loginButton(page).click(); await passBotCheck(page);
  350 |     });
  351 |     await journey.step('Then the page says "Please enter a username and password."', async () => {
  352 |       await expect(page.getByText(REQ.AC5_EMPTY), '[REQ AC-5] please enter a username and password').toBeVisible();
  353 |     });
  354 |   });
  355 | 
  356 |   test('SCN-009: Signing in opens the Accounts Overview and Log Out returns to the home page', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  357 |     const c = validCustomer(data, seed);
  358 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  359 |       await registerCustomer(seed, page, c);
  360 |     });
  361 |     await journey.step('And I am on the home page as a signed-out visitor', async () => {
  362 |       await signedOutVisitor(page);
  363 |       await open(page, PAGES.home);
  364 |       await expect(loginButton(page), 'Customer Login panel shown (precondition)').toBeVisible();
  365 |     });
  366 |     await journey.step('When I sign in on the Customer Login panel with that user name and password', async () => {
  367 |       await signIn(page, c.username, c.password);
  368 |     });
  369 |     await journey.step('Then the Accounts Overview page opens', async () => {
  370 |       await expect(page.getByRole('heading', { name: REQ.AC6_OVERVIEW }), '[REQ AC-6] Accounts Overview page').toBeVisible();
  371 |     });
  372 |     await journey.step('And it lists at least one account', async () => {
  373 |       await expect(accountNumberLinks(page).first(), '[REQ AC-6] at least one account listed').toBeVisible();
  374 |     });
  375 |     await journey.step('When I click "Log Out"', async () => {
  376 |       await page.getByRole('link', { name: REQ.AC6_LOGOUT }).click(); await passBotCheck(page);
  377 |     });
  378 |     await journey.step('Then I am on the home page with the Customer Login panel', async () => {
  379 |       await expect(loginPanelHeading(page), '[REQ AC-6] Customer Login panel shown').toBeVisible();
  380 |       await expect(loginButton(page), '[REQ AC-6] Customer Login panel usable').toBeVisible();
  381 |     });
  382 |   });
  383 | 
  384 |   test('SCN-010: REST login with valid credentials returns the registered customer as JSON', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  385 |     const c = validCustomer(data, seed);
  386 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  387 |     await journey.step('Given a customer is registered with a fresh user name, a full address and a Phone #', async () => {
  388 |       await registerCustomer(seed, page, c);
  389 |     });
  390 |     await journey.step('When I call GET /login/{username}/{password} with Accept: application/json', async () => {
  391 |       res = await restLogin(api, c.username, c.password);
  392 |     });
  393 |     await journey.step('Then the response status is 200', async () => {
  394 |       expect(res.status, '[REQ AC-7] valid login → 200').toBe(REQ.STATUS.OK);
  395 |     });
  396 |     await journey.step('And the body is JSON', async () => {
  397 |       expect(res.headers['content-type'] ?? '', '[REQ AC-7] JSON content type').toMatch(/json/i);
  398 |       expect(typeof res.body, '[REQ AC-7] body parses as JSON').toBe('object');
  399 |     });
  400 |     await journey.step("And it contains the customer's id", async () => {
  401 |       expect(checkShape(res.body, CUSTOMER_SHAPE, 'customer'), '[REQ AC-7] customer fields present').toEqual([]);
  402 |     });
  403 |     await journey.step('And firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal the values entered at registration', async () => {
  404 |       const b = res.body;
  405 |       expect.soft(b.firstName, '[REQ AC-7] firstName').toBe(c.firstName);
  406 |       expect.soft(b.lastName, '[REQ AC-7] lastName').toBe(c.lastName);
  407 |       expect.soft(b.address?.street, '[REQ AC-7] address.street').toBe(c.street);
  408 |       expect.soft(b.address?.city, '[REQ AC-7] address.city').toBe(c.city);
  409 |       expect.soft(b.address?.state, '[REQ AC-7] address.state').toBe(c.state);
  410 |       expect.soft(b.address?.zipCode, '[REQ AC-7] address.zipCode').toBe(c.zipCode);
  411 |       expect.soft(b.phoneNumber, '[REQ AC-7] phoneNumber').toBe(c.phoneNumber);
  412 |     });
  413 |   });
  414 | 
  415 |   test('SCN-011: REST login without Accept: application/json returns XML with a customer root element', { tag: ['@AC-7', '@type:contract', '@layer:api', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  416 |     const c = validCustomer(data, seed);
  417 |     let res!: Awaited<ReturnType<Api['get']>>;
  418 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  419 |       await registerCustomer(seed, page, c);
  420 |     });
  421 |     await journey.step('When I call GET /login/{username}/{password} without Accept: application/json', async () => {
  422 |       res = await api.get(EP.loginByUsernameAndPassword(c.username, c.password), { headers: { Accept: '*/*' } });
  423 |     });
  424 |     await journey.step('Then the response status is 200', async () => {
  425 |       expect(res.status, '[REQ AC-7] valid login (XML) → 200').toBe(REQ.STATUS.OK);
  426 |     });
  427 |     await journey.step('And the body is XML with a customer root element', async () => {
  428 |       const root = res.text.replace(/^﻿?\s*(<\?xml[^>]*\?>\s*)?/, '').match(/^<([A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)[\s/>]/)?.[2];
  429 |       expect(root, '[REQ AC-7] XML root element is customer').toBe(REQ.AC7_XML_ROOT);
  430 |     });
  431 |   });
  432 | 
  433 |   test('SCN-012: REST login with a wrong password answers 400 "Invalid username and/or password"', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  434 |     const c = validCustomer(data, seed);
  435 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  436 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  437 |       await registerCustomer(seed, page, c);
  438 |     });
```