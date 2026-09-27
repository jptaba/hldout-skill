# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AE-2\tests\ae-2.spec.ts >> AE-2 Customer account lifecycle through the partner Account API, with shop sign-in >> SCN-014: getUserDetailByEmail returns the registration values of the same-named fields
- Location: evaluations\AE-2\tests\ae-2.spec.ts:337:3

# Error details

```
Error: [REQ AC-7] user.mobile_number holds the registration value

expect(received).toBe(expected) // Object.is equality

Expected: "9800000000"
Received: "undefined"
```

# Test source

```ts
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
  278 |     let email = ''; let res!: Res;
  279 |     await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
  280 |     await journey.step('When the partner calls verifyLogin with that e-mail and a password', async () => {
  281 |       res = await verifyLogin(api, { email, password: data.customer.password });
  282 |     });
  283 |     await journey.step('Then the responseCode is 404', async () => {
  284 |       expect(res.body?.responseCode, '[REQ AC-6] unknown e-mail → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
  285 |     });
  286 |     await journey.step('And the message is "User not found!"', async () => {
  287 |       expect(res.body?.message, '[REQ AC-6] unknown e-mail → "User not found!"').toBe(REQ.MSG.USER_NOT_FOUND);
  288 |     });
  289 |   });
  290 | 
  291 |   REQ.VERIFY_MISSING.forEach((missing, i) => {
  292 |     test(`SCN-011.${i + 1}: verifyLogin without the ${missing} parameter is refused`, { tag: ['@AC-6', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  293 |       let email = ''; let res!: Res;
  294 |       await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
  295 |       await journey.step(`When the partner calls verifyLogin without the ${missing} parameter`, async () => {
  296 |         const form: Form = { email, password: data.customer.password };
  297 |         delete form[missing];
  298 |         res = await verifyLogin(api, form);
  299 |       });
  300 |       await journey.step('Then the responseCode is 400', async () => {
  301 |         expect(res.body?.responseCode, `[REQ AC-6] ${missing} missing → responseCode 400`).toBe(REQ.CODE.BAD_REQUEST);
  302 |       });
  303 |       await journey.step('And the message is "Bad request, email or password parameter is missing in POST request."', async () => {
  304 |         expect(res.body?.message, `[REQ AC-6] ${missing} missing → missing-parameter message`).toBe(REQ.MSG.VERIFY_MISSING_PARAM);
  305 |       });
  306 |     });
  307 |   });
  308 | 
  309 |   test('SCN-012: verifyLogin called with the DELETE method is not supported', { tag: ['@AC-6', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  310 |     let email = ''; let res!: Res;
  311 |     await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
  312 |     await journey.step('When the partner calls verifyLogin with the DELETE method', async () => {
  313 |       res = await api.delete<Body>(EP.verifylogin, { form: { email, password: data.customer.password } });
  314 |     });
  315 |     await journey.step('Then the responseCode is 405', async () => {
  316 |       expect(res.body?.responseCode, '[REQ AC-6] DELETE on verifyLogin → responseCode 405').toBe(REQ.CODE.NOT_SUPPORTED);
  317 |     });
  318 |     await journey.step('And the message is "This request method is not supported."', async () => {
  319 |       expect(res.body?.message, '[REQ AC-6] DELETE on verifyLogin → "This request method is not supported."').toBe(REQ.MSG.METHOD_NOT_SUPPORTED);
  320 |     });
  321 |   });
  322 | 
  323 |   // ---------------------------------------------------------------- AC-7
  324 |   test('SCN-013: getUserDetailByEmail returns a user object with every field of the contract', { tag: ['@AC-7', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  325 |     let c!: Customer; let res!: Res;
  326 |     await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
  327 |     await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, c.email); });
  328 |     await journey.step('Then the responseCode is 200', async () => {
  329 |       expect(res.body?.responseCode, '[REQ AC-7] known e-mail → responseCode 200').toBe(REQ.CODE.OK);
  330 |     });
  331 |     await journey.step('And the user object has the fields id, name, email, title, birth_day, birth_month, birth_year, first_name, last_name, company, address1, address2, country, state, city, zipcode, mobile_number', async () => {
  332 |       const present: Record<string, ShapeRule> = Object.fromEntries(REQ.USER_FIELDS.map((f) => [f, () => true]));
  333 |       expect(checkShape(res.body?.user, present, 'user'), '[REQ AC-7] user object has every contract field').toEqual([]);
  334 |     });
  335 |   });
  336 | 
  337 |   test('SCN-014: getUserDetailByEmail returns the registration values of the same-named fields', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  338 |     let c!: Customer; let res!: Res;
  339 |     await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
  340 |     await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, c.email); });
  341 |     await journey.step('Then the responseCode is 200', async () => {
  342 |       expect(res.body?.responseCode, '[REQ AC-7] known e-mail → responseCode 200').toBe(REQ.CODE.OK);
  343 |     });
  344 |     await journey.step('And name, email, title, birth_month, birth_year, company, address1, address2, country, state, city, zipcode and mobile_number hold the registration values', async () => {
  345 |       const user = res.body?.user ?? {};
  346 |       for (const f of REQ.SAME_NAMED_FIELDS) {
> 347 |         expect.soft(String(user[f]), `[REQ AC-7] user.${f} holds the registration value`).toBe(c.form[f]);
      |                                                                                           ^ Error: [REQ AC-7] user.mobile_number holds the registration value
  348 |       }
  349 |     });
  350 |   });
  351 | 
  352 |   test('SCN-015: getUserDetailByEmail returns the registration values of the renamed fields', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  353 |     let c!: Customer; let res!: Res;
  354 |     await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
  355 |     await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, c.email); });
  356 |     await journey.step('Then the responseCode is 200', async () => {
  357 |       expect(res.body?.responseCode, '[REQ AC-7] known e-mail → responseCode 200').toBe(REQ.CODE.OK);
  358 |     });
  359 |     await journey.step('And birth_day holds the registered birth_date, first_name the registered firstname and last_name the registered lastname', async () => {
  360 |       const user = res.body?.user ?? {};
  361 |       for (const [resp, reqField] of Object.entries(REQ.RENAMED_FIELDS)) {
  362 |         expect.soft(String(user[resp]), `[REQ AC-7] user.${resp} holds the registered ${reqField} (G3)`).toBe(c.form[reqField]);
  363 |       }
  364 |     });
  365 |   });
  366 | 
  367 |   test('SCN-016: getUserDetailByEmail never returns the password', { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  368 |     let c!: Customer; let res!: Res;
  369 |     await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
  370 |     await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, c.email); });
  371 |     await journey.step('Then the responseCode is 200', async () => {
  372 |       expect(res.body?.responseCode, '[REQ AC-7] known e-mail → responseCode 200').toBe(REQ.CODE.OK);
  373 |     });
  374 |     await journey.step('And the user object has no password field', async () => {
  375 |       expect(Object.keys(res.body?.user ?? {}).filter((k) => /pass/i.test(k)), '[REQ AC-7] user object has no password field').toEqual([]);
  376 |     });
  377 |     await journey.step("And the response does not contain the customer's password", async () => {
  378 |       expect(res.text.includes(c.password), '[REQ AC-7] the password value is never returned').toBe(false);
  379 |     });
  380 |   });
  381 | 
  382 |   test('SCN-017: getUserDetailByEmail for an unknown e-mail is refused', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  383 |     let email = ''; let res!: Res;
  384 |     await journey.step('Given a unique e-mail address that is not registered', async () => { email = uniqueEmail(seed, data); });
  385 |     await journey.step('When the partner calls getUserDetailByEmail with that e-mail', async () => { res = await getUser(api, email); });
  386 |     await journey.step('Then the responseCode is 404', async () => {
  387 |       expect(res.body?.responseCode, '[REQ AC-7] unknown e-mail → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
  388 |     });
  389 |     await journey.step('And the message is "Account not found with this email, try another email!"', async () => {
  390 |       expect(res.body?.message, '[REQ AC-7] unknown e-mail → "Account not found with this email, try another email!"').toBe(REQ.MSG.ACCOUNT_NOT_FOUND_BY_EMAIL);
  391 |     });
  392 |   });
  393 | 
  394 |   // ---------------------------------------------------------------- AC-8
  395 |   test('SCN-018: updateAccount changes only the fields sent', { tag: ['@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  396 |     let c!: Customer; let before: Record<string, unknown> = {}; let res!: Res;
  397 |     const newName = unique('QA Renamed');
  398 |     const newCity = data.customer.update.city as string;
  399 |     await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
  400 |     await journey.step("And I read the customer's profile through getUserDetailByEmail", async () => { before = await readProfile(seed, api, c.email); });
  401 |     await journey.step('When the partner calls updateAccount with the correct e-mail and password and a new name and city only', async () => {
  402 |       res = await updateAccount(api, { email: c.email, password: c.password, name: newName, city: newCity });
  403 |     });
  404 |     await journey.step('Then the responseCode is 200', async () => {
  405 |       expect(res.body?.responseCode, '[REQ AC-8] update with correct credentials → responseCode 200').toBe(REQ.CODE.OK);
  406 |     });
  407 |     await journey.step('And the message is "User updated!"', async () => {
  408 |       expect(res.body?.message, '[REQ AC-8] update with correct credentials → "User updated!"').toBe(REQ.MSG.USER_UPDATED);
  409 |     });
  410 |     let after: Record<string, unknown> = {};
  411 |     await journey.step('And getUserDetailByEmail shows the new name and city', async () => {
  412 |       after = (await getUser(api, c.email)).body?.user ?? {};
  413 |       expect.soft(after.name, '[REQ AC-8] sent field name changed').toBe(newName);
  414 |       expect.soft(after.city, '[REQ AC-8] sent field city changed').toBe(newCity);
  415 |     });
  416 |     await journey.step('And getUserDetailByEmail shows every other field unchanged', async () => {
  417 |       for (const f of REQ.USER_FIELDS.filter((x) => x !== 'name' && x !== 'city')) {
  418 |         expect.soft(after[f], `[REQ AC-8] field not sent (${f}) keeps its value`).toEqual(before[f]);
  419 |       }
  420 |     });
  421 |   });
  422 | 
  423 |   test('SCN-019: updateAccount with a wrong password is refused and changes nothing', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  424 |     let c!: Customer; let before: Record<string, unknown> = {}; let res!: Res;
  425 |     await journey.step('Given a customer exists with every registration field filled', async () => { c = await seedCustomer(seed, api, data); });
  426 |     await journey.step("And I read the customer's profile through getUserDetailByEmail", async () => { before = await readProfile(seed, api, c.email); });
  427 |     await journey.step('When the partner calls updateAccount with the e-mail, a wrong password and a new name and city', async () => {
  428 |       res = await updateAccount(api, { email: c.email, password: wrongPassword(data), name: unique('QA Intruder'), city: data.customer.update.city });
  429 |     });
  430 |     await journey.step('Then the responseCode is 404', async () => {
  431 |       expect(res.body?.responseCode, '[REQ AC-8] update with wrong password → responseCode 404').toBe(REQ.CODE.NOT_FOUND);
  432 |     });
  433 |     await journey.step('And the message is "Account not found!"', async () => {
  434 |       expect(res.body?.message, '[REQ AC-8] update with wrong password → "Account not found!"').toBe(REQ.MSG.ACCOUNT_NOT_FOUND);
  435 |     });
  436 |     await journey.step('And getUserDetailByEmail shows the profile unchanged', async () => {
  437 |       const after = (await getUser(api, c.email)).body?.user ?? {};
  438 |       expect(after, '[REQ AC-8] wrong-password update changes nothing').toEqual(before);
  439 |     });
  440 |   });
  441 | 
  442 |   // ---------------------------------------------------------------- AC-9
  443 |   test('SCN-020: deleteAccount with the correct credentials closes the account', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  444 |     let c!: Customer; let res!: Res;
  445 |     await journey.step('Given a customer exists with a unique e-mail address', async () => { c = await seedCustomer(seed, api, data); });
  446 |     await journey.step('When the partner calls deleteAccount with the correct e-mail and password', async () => { res = await deleteAccount(api, c.email, c.password); });
  447 |     await journey.step('Then the responseCode is 200', async () => {
```