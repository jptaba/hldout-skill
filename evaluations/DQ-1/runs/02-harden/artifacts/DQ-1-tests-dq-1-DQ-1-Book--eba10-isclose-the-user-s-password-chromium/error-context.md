# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DQ-1\tests\dq-1.spec.ts >> DQ-1 Book Store accounts - create a user, get a token, sign in and sign out >> SCN-007: The issued token does not disclose the user's password
- Location: evaluations\DQ-1\tests\dq-1.spec.ts:342:3

# Error details

```
Error: [REQ AC-7] the password appears in no part of the token

expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Test source

```ts
  261 |       await journey.step('And the error code is "1200"', async () => {
  262 |         expect.soft(String(obj(res).code), '[REQ AC-4] error code 1200').toBe(REQ.AC4_CODE);
  263 |       });
  264 |       await journey.step('And the error message is "UserName and Password required."', async () => {
  265 |         expect.soft(messageOf(res), '[REQ AC-4] message').toBe(REQ.AC4_MESSAGE);
  266 |       });
  267 |     });
  268 |   });
  269 | 
  270 |   test('SCN-005: GenerateToken with the correct credentials returns a token', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  271 |     let a!: Account;
  272 |     let res!: ApiResponse;
  273 |     await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
  274 |     await journey.step('When I POST /Account/v1/GenerateToken with the correct user name and password', async () => {
  275 |       res = await tokenRequest(api, a.userName, a.password);
  276 |     });
  277 |     await journey.step('Then the response status is 200', async () => {
  278 |       expect(res.status, '[REQ AC-5] GenerateToken → 200').toBe(REQ.STATUS.S200);
  279 |     });
  280 |     await journey.step('And the token is non-empty', async () => {
  281 |       const token = obj(res).token;
  282 |       expect.soft(typeof token === 'string' && token.length > 0, '[REQ AC-5] token is non-empty').toBe(true);
  283 |     });
  284 |     await journey.step('And the status is "Success"', async () => {
  285 |       expect.soft(obj(res).status, '[REQ AC-5] status "Success"').toBe(REQ.AC5_STATUS);
  286 |     });
  287 |     await journey.step('And the result is "User authorized successfully."', async () => {
  288 |       expect.soft(obj(res).result, '[REQ AC-5] result').toBe(REQ.AC5_RESULT);
  289 |     });
  290 |   });
  291 | 
  292 |   test('SCN-016: The token expires 7 days after it was issued', { tag: ['@AC-5', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  293 |     let a!: Account;
  294 |     let res!: ApiResponse;
  295 |     let sentAt = 0;
  296 |     let answeredAt = 0;
  297 |     await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
  298 |     await journey.step('When I POST /Account/v1/GenerateToken with the correct user name and password', async () => {
  299 |       sentAt = Date.now();
  300 |       res = await tokenRequest(api, a.userName, a.password);
  301 |       answeredAt = Date.now();
  302 |     });
  303 |     await journey.step('Then expires is a timestamp 7 days after the moment the token was issued', async () => {
  304 |       const raw = String(obj(res).expires ?? '');
  305 |       const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  306 |       const at = Date.parse(hasOffset ? raw : `${raw}Z`);
  307 |       expect(Number.isNaN(at), `[REQ AC-5] expires is a timestamp (got "${raw}")`).toBe(false);
  308 |       const week = REQ.AC5_EXPIRES_DAYS * 24 * 3600 * 1000;
  309 |       expect(at, '[REQ AC-5] expires ≥ issue moment + 7 days (G3 tolerance)').toBeGreaterThanOrEqual(sentAt + week - REQ.G3_TOLERANCE_MS);
  310 |       expect(at, '[REQ AC-5] expires ≤ issue moment + 7 days (G3 tolerance)').toBeLessThanOrEqual(answeredAt + week + REQ.G3_TOLERANCE_MS);
  311 |     });
  312 |   });
  313 | 
  314 |   REQ.AC6_CREDENTIALS.forEach((credentials, i) => {
  315 |     test(`SCN-006.${i + 1}: GenerateToken with wrong credentials issues no token and answers 401 (${credentials})`, { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  316 |       let a!: Account;
  317 |       let res!: ApiResponse;
  318 |       await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
  319 |       await journey.step(`When I POST /Account/v1/GenerateToken with ${credentials}`, async () => {
  320 |         res = i === 0
  321 |           ? await tokenRequest(api, a.userName, wrongPassword(data))
  322 |           : await tokenRequest(api, `${a.userName}-unknown`, a.password);
  323 |       });
  324 |       await journey.step('Then the response status is 401', async () => {
  325 |         expect.soft(res.status, '[REQ AC-6] refused token request → 401 Unauthorized').toBe(REQ.STATUS.S401);
  326 |       });
  327 |       await journey.step('And token is null', async () => {
  328 |         expect.soft(obj(res).token, '[REQ AC-6] token is null').toBeNull();
  329 |       });
  330 |       await journey.step('And expires is null', async () => {
  331 |         expect.soft(obj(res).expires, '[REQ AC-6] expires is null').toBeNull();
  332 |       });
  333 |       await journey.step('And the status is "Failed"', async () => {
  334 |         expect.soft(obj(res).status, '[REQ AC-6] status "Failed"').toBe(REQ.AC6_STATUS);
  335 |       });
  336 |       await journey.step('And the result is "User authorization failed."', async () => {
  337 |         expect.soft(obj(res).result, '[REQ AC-6] result').toBe(REQ.AC6_RESULT);
  338 |       });
  339 |     });
  340 |   });
  341 | 
  342 |   test('SCN-007: The issued token does not disclose the user\'s password', { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  343 |     let a!: Account;
  344 |     let token = '';
  345 |     await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
  346 |     await journey.step('When I POST /Account/v1/GenerateToken with the correct user name and password', async () => {
  347 |       const res = await tokenRequest(api, a.userName, a.password);
  348 |       token = String(obj(res).token ?? '');
  349 |       expect(token.length > 0, 'GenerateToken returned a token (precondition for AC-7)').toBe(true);
  350 |     });
  351 |     let parts: string[] = [];
  352 |     await journey.step('Then the token decodes as a JWT', async () => {
  353 |       parts = token.split('.');
  354 |       expect(parts.length, '[REQ AC-7] token is a JWT (3 dot-separated parts)').toBe(3);
  355 |       const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as unknown;
  356 |       expect(typeof header === 'object' && header !== null, '[REQ AC-7] JWT header decodes to JSON').toBe(true);
  357 |     });
  358 |     await journey.step('And no part of the token or of its decoded header, payload and signature contains the password', async () => {
  359 |       const decoded = parts.map((p) => Buffer.from(p, 'base64url').toString('latin1'));
  360 |       const leaks = [token, ...decoded].filter((s) => s.includes(a.password)).length;
> 361 |       expect(leaks, '[REQ AC-7] the password appears in no part of the token').toBe(0);
      |                                                                                ^ Error: [REQ AC-7] the password appears in no part of the token
  362 |     });
  363 |   });
  364 | 
  365 |   test('SCN-008: Authorized is false before a token is issued and true afterwards', { tag: ['@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  366 |     let a!: Account;
  367 |     let before!: ApiResponse;
  368 |     let after!: ApiResponse;
  369 |     await journey.step('Given a user was created through the API and no token has been issued for it', async () => { a = await createAccount(seed, api, data); });
  370 |     await journey.step('When I POST /Account/v1/Authorized with the user name and password', async () => {
  371 |       before = await api.post(EP.accountAuthorized, { data: { userName: a.userName, password: a.password } });
  372 |     });
  373 |     await journey.step('Then the answer is false', async () => {
  374 |       expect.soft(before.body, '[REQ AC-8] Authorized before any token → false').toBe(false);
  375 |     });
  376 |     await journey.step('When I generate a token for that user', async () => { await issueToken(seed, api, a); });
  377 |     await journey.step('And I POST /Account/v1/Authorized with the user name and password again', async () => {
  378 |       after = await api.post(EP.accountAuthorized, { data: { userName: a.userName, password: a.password } });
  379 |     });
  380 |     await journey.step('Then the answer is true', async () => {
  381 |       expect(after.body, '[REQ AC-8] Authorized after a token was generated → true').toBe(true);
  382 |     });
  383 |   });
  384 | 
  385 |   test('SCN-017: Authorized with a wrong password never answers true', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  386 |     let a!: Account;
  387 |     let res!: ApiResponse;
  388 |     await journey.step('Given a user was created through the API and a token was generated for it', async () => {
  389 |       a = await createAccount(seed, api, data);
  390 |       await issueToken(seed, api, a);
  391 |     });
  392 |     await journey.step('When I POST /Account/v1/Authorized with the user name and a wrong password', async () => {
  393 |       res = await api.post(EP.accountAuthorized, { data: { userName: a.userName, password: wrongPassword(data) } });
  394 |     });
  395 |     await journey.step('Then the answer is not true', async () => {
  396 |       expect(res.body, '[REQ AC-8] wrong password never → true').not.toBe(true);
  397 |     });
  398 |     await journey.step('And the message is "User not found!"', async () => {
  399 |       expect.soft(messageOf(res), '[REQ AC-8] message "User not found!"').toBe(REQ.AC8_WRONG_PASSWORD_MESSAGE);
  400 |     });
  401 |   });
  402 | 
  403 |   test('SCN-009: Signing in on the web site with an API-created account opens the profile', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  404 |     let a!: Account;
  405 |     await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
  406 |     await journey.step('And I am on the login page /login', async () => { await gotoPage(page, '/login'); });
  407 |     await journey.step('When I sign in with that user name and password', async () => { await uiSignIn(page, a.userName, a.password); });
  408 |     await journey.step('Then the profile page /profile is open', async () => {
  409 |       await expect(page, '[REQ AC-9] profile page is open').toHaveURL(REQ.AC9_PROFILE_PATH);
  410 |     });
  411 |     await journey.step('And the profile shows "User Name :" followed by the user name', async () => {
  412 |       await expect(page.locator('body'), '[REQ AC-9] "User Name :" followed by the user name')
  413 |         .toContainText(new RegExp(`${escapeRe(REQ.AC9_PROFILE_LABEL)}\\s*${escapeRe(a.userName)}`));
  414 |     });
  415 |     await journey.step('And POST /Account/v1/Authorized returns true for the account', async () => {
  416 |       const r = await api.post(EP.accountAuthorized, { data: { userName: a.userName, password: a.password } });
  417 |       expect(r.body, '[REQ AC-9] Authorized → true after the web sign-in').toBe(true);
  418 |     });
  419 |   });
  420 | 
  421 |   test('SCN-010: Signing in with a wrong password keeps the user on the login page with an error', { tag: ['@AC-10', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  422 |     let a!: Account;
  423 |     await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
  424 |     await journey.step('And I am on the login page /login', async () => { await gotoPage(page, '/login'); });
  425 |     await journey.step('When I sign in with that user name and a wrong password', async () => { await uiSignIn(page, a.userName, wrongPassword(data)); });
  426 |     await journey.step('Then I am still on the login page /login', async () => {
  427 |       const msg = page.getByText(REQ.AC10_MESSAGE, { exact: true });
  428 |       await msg.waitFor({ state: 'visible' }).catch(() => undefined); // let the sign-in attempt settle
  429 |       await expect(page, '[REQ AC-10] stays on the login page').toHaveURL(REQ.LOGIN_PATH);
  430 |     });
  431 |     await journey.step('And the message "Invalid username or password!" is shown below the form', async () => {
  432 |       const msg = page.getByText(REQ.AC10_MESSAGE, { exact: true });
  433 |       await expect(msg, '[REQ AC-10] message "Invalid username or password!" is shown').toBeVisible();
  434 |       const msgBox = await msg.boundingBox();
  435 |       const pwBox = await loginLocators(page).password.boundingBox();
  436 |       expect(msgBox && pwBox ? msgBox.y >= pwBox.y + pwBox.height : false, '[REQ AC-10] message is below the form fields').toBe(true);
  437 |     });
  438 |   });
  439 | 
  440 |   test('SCN-018: The wrong-credentials message is shown in red', { tag: ['@AC-10', '@type:usability', '@layer:ui', '@P3'] }, async ({ page, api, journey, data, seed }) => {
  441 |     let a!: Account;
  442 |     await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
  443 |     await journey.step('And I am on the login page /login', async () => { await gotoPage(page, '/login'); });
  444 |     await journey.step('When I sign in with that user name and a wrong password', async () => { await uiSignIn(page, a.userName, wrongPassword(data)); });
  445 |     await journey.step('Then the message "Invalid username or password!" is rendered in red', async () => {
  446 |       const msg = page.getByText(REQ.AC10_MESSAGE, { exact: true });
  447 |       await expect(msg, '[REQ AC-10] message is shown').toBeVisible();
  448 |       const color = await msg.evaluate((el) => getComputedStyle(el).color);
  449 |       const [r, g, b] = (color.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  450 |       expect(r >= 150 && r - g >= 60 && r - b >= 60, `[REQ AC-10] message colour is red (G8; got ${color})`).toBe(true);
  451 |     });
  452 |   });
  453 | 
  454 |   test('SCN-011: Clicking Login with both fields empty does not sign in', { tag: ['@AC-11', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  455 |     await journey.step('Given I am not signed in', async () => { await page.context().clearCookies(); });
  456 |     await journey.step('And I am on the login page /login', async () => { await gotoPage(page, '/login'); });
  457 |     await journey.step('When I click "Login" with an empty user name and an empty password', async () => {
  458 |       await loginLocators(page).login.click();
  459 |     });
  460 |     await journey.step('Then I am still on the login page /login', async () => {
  461 |       await expect(page, '[REQ AC-11] empty fields → still on the login page').toHaveURL(REQ.LOGIN_PATH);
```