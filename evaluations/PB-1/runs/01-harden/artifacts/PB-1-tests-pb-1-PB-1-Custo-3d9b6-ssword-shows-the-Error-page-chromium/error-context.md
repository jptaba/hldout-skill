# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-007: Signing in with a wrong password shows the "Error!" page
- Location: evaluations\PB-1\tests\pb-1.spec.ts:290:3

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
  233 |       await expect(page.getByRole('heading', { name: REQ.AC3_HEADING(c.username) }), '[REQ AC-3] heading Welcome <username>').toBeVisible();
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
> 307 |       await expect(page.getByText(REQ.AC5_NOT_VERIFIED), '[REQ AC-5] could not be verified').toBeVisible();
      |                                                                                              ^ Error: [REQ AC-5] could not be verified
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
  334 |     });
  335 |     await journey.step('When I sign in on the Customer Login panel with that user name and password', async () => {
  336 |       await signIn(page, c.username, c.password);
  337 |     });
  338 |     await journey.step('Then the Accounts Overview page opens', async () => {
  339 |       await expect(page.getByRole('heading', { name: REQ.AC6_OVERVIEW }), '[REQ AC-6] Accounts Overview page').toBeVisible();
  340 |     });
  341 |     await journey.step('And it lists at least one account', async () => {
  342 |       await expect(accountNumberLinks(page).first(), '[REQ AC-6] at least one account listed').toBeVisible();
  343 |     });
  344 |     await journey.step('When I click "Log Out"', async () => {
  345 |       await page.getByRole('link', { name: REQ.AC6_LOGOUT }).click();
  346 |     });
  347 |     await journey.step('Then I am on the home page with the Customer Login panel', async () => {
  348 |       await expect(loginPanelHeading(page), '[REQ AC-6] Customer Login panel shown').toBeVisible();
  349 |       await expect(loginButton(page), '[REQ AC-6] Customer Login panel usable').toBeVisible();
  350 |     });
  351 |   });
  352 | 
  353 |   test('SCN-010: REST login with valid credentials returns the registered customer as JSON', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  354 |     const c = validCustomer(data, seed);
  355 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  356 |     await journey.step('Given a customer is registered with a fresh user name, a full address and a Phone #', async () => {
  357 |       await registerCustomer(seed, page, c);
  358 |     });
  359 |     await journey.step('When I call GET /login/{username}/{password} with Accept: application/json', async () => {
  360 |       res = await restLogin(api, c.username, c.password);
  361 |     });
  362 |     await journey.step('Then the response status is 200', async () => {
  363 |       expect(res.status, '[REQ AC-7] valid login → 200').toBe(REQ.STATUS.OK);
  364 |     });
  365 |     await journey.step('And the body is JSON', async () => {
  366 |       expect(res.headers['content-type'] ?? '', '[REQ AC-7] JSON content type').toMatch(/json/i);
  367 |       expect(typeof res.body, '[REQ AC-7] body parses as JSON').toBe('object');
  368 |     });
  369 |     await journey.step("And it contains the customer's id", async () => {
  370 |       expect(checkShape(res.body, CUSTOMER_SHAPE, 'customer'), '[REQ AC-7] customer fields present').toEqual([]);
  371 |     });
  372 |     await journey.step('And firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal the values entered at registration', async () => {
  373 |       const b = res.body;
  374 |       expect.soft(b.firstName, '[REQ AC-7] firstName').toBe(c.firstName);
  375 |       expect.soft(b.lastName, '[REQ AC-7] lastName').toBe(c.lastName);
  376 |       expect.soft(b.address?.street, '[REQ AC-7] address.street').toBe(c.street);
  377 |       expect.soft(b.address?.city, '[REQ AC-7] address.city').toBe(c.city);
  378 |       expect.soft(b.address?.state, '[REQ AC-7] address.state').toBe(c.state);
  379 |       expect.soft(b.address?.zipCode, '[REQ AC-7] address.zipCode').toBe(c.zipCode);
  380 |       expect.soft(b.phoneNumber, '[REQ AC-7] phoneNumber').toBe(c.phoneNumber);
  381 |     });
  382 |   });
  383 | 
  384 |   test('SCN-011: REST login without Accept: application/json returns XML with a customer root element', { tag: ['@AC-7', '@type:contract', '@layer:api', '@P2'] }, async ({ page, api, journey, data, seed }) => {
  385 |     const c = validCustomer(data, seed);
  386 |     let res!: Awaited<ReturnType<Api['get']>>;
  387 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  388 |       await registerCustomer(seed, page, c);
  389 |     });
  390 |     await journey.step('When I call GET /login/{username}/{password} without Accept: application/json', async () => {
  391 |       res = await api.get(EP.loginByUsernameAndPassword(c.username, c.password), { headers: { Accept: '*/*' } });
  392 |     });
  393 |     await journey.step('Then the response status is 200', async () => {
  394 |       expect(res.status, '[REQ AC-7] valid login (XML) → 200').toBe(REQ.STATUS.OK);
  395 |     });
  396 |     await journey.step('And the body is XML with a customer root element', async () => {
  397 |       const root = res.text.replace(/^﻿?\s*(<\?xml[^>]*\?>\s*)?/, '').match(/^<([A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)[\s/>]/)?.[2];
  398 |       expect(root, '[REQ AC-7] XML root element is customer').toBe(REQ.AC7_XML_ROOT);
  399 |     });
  400 |   });
  401 | 
  402 |   test('SCN-012: REST login with a wrong password answers 400 "Invalid username and/or password"', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  403 |     const c = validCustomer(data, seed);
  404 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  405 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  406 |       await registerCustomer(seed, page, c);
  407 |     });
```