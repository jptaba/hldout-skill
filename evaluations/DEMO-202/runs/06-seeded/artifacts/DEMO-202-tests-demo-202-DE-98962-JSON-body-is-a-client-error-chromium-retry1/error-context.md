# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-008: A malformed JSON body is a client error
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:273:3

# Error details

```
Error: [REQ AC-7] malformed JSON → 400 (never 5xx)

expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 500
```

# Test source

```ts
  179 |       await expect(ui(page).submit, '[REQ AC-2] form replaced by confirmation').toBeHidden();
  180 |     });
  181 |   });
  182 | 
  183 |   test('SCN-003: An empty submission keeps the form and reports every field', { tag: ['@AC-3', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  184 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  185 |     await journey.step('When I submit the contact form with every field empty', async () => {
  186 |       await ui(page).submit.click();
  187 |     });
  188 |     await journey.step('Then the contact form is still shown', async () => {
  189 |       await expect(ui(page).submit, '[REQ AC-3] form still shown after empty submit').toBeVisible();
  190 |     });
  191 |     await journey.step('And the validation errors mention Name, Email, Phone, Subject and Message', async () => {
  192 |       await expect(ui(page).errors).toBeVisible();
  193 |       for (const field of REQ.FIELDS) {
  194 |         await expect.soft(ui(page).errors, `[REQ AC-3] validation errors mention ${field}`).toContainText(new RegExp(field, 'i'));
  195 |       }
  196 |     });
  197 |   });
  198 | 
  199 |   REQ.UI_BOUNDARIES.forEach((row, i) => {
  200 |     test(`SCN-004.${i + 1}: The UI rejects a value one character outside a boundary (${row.field} ${row.length})`, { tag: ['@AC-4', '@type:boundary', '@layer:ui', '@P2', '@boundary'] }, async ({ page, api, journey, data, seed }) => {
  201 |       const key = row.field === 'Message' ? 'description' : (row.field.toLowerCase() as keyof Enquiry);
  202 |       const enquiry = validEnquiry(data, { [key]: ofLength(row.field, row.length) });
  203 |       trackEnquiry(seed, api, data, enquiry.subject);
  204 |       await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  205 |       await journey.step(`When I submit the contact form with a valid enquiry whose ${row.field} is ${row.length} characters long`, async () => {
  206 |         await fillContactForm(page, enquiry);
  207 |       });
  208 |       await journey.step(`Then the form shows the error "${row.message}"`, async () => {
  209 |         await expect(ui(page).errors, `[REQ AC-4] UI shows the ${row.field} length error`).toContainText(row.message);
  210 |       });
  211 |     });
  212 |   });
  213 | 
  214 |   // ---------------- Messages API ----------------
  215 |   test('SCN-005: Creating a valid enquiry returns 201 Created', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  216 |     let res!: Awaited<ReturnType<Api['post']>>;
  217 |     await journey.step('When I POST a valid enquiry to /api/message', async () => {
  218 |       const enquiry = validEnquiry(data);
  219 |       trackEnquiry(seed, api, data, enquiry.subject);
  220 |       res = await api.post(EP.message, { data: enquiry });
  221 |     });
  222 |     await journey.step('Then the response status is 201', async () => {
  223 |       expect.soft(res.status, '[REQ AC-5] create enquiry → 201 Created').toBe(REQ.STATUS.CREATED);
  224 |     });
  225 |     await journey.step('And the response body is {"success": true}', async () => {
  226 |       expect.soft(res.body, '[REQ AC-5] create enquiry body').toEqual(REQ.CREATE_BODY);
  227 |     });
  228 |   });
  229 | 
  230 |   REQ.API_BOUNDARIES.forEach((row, i) => {
  231 |     const label = typeof row.value === 'number' ? `${row.value} characters` : `"${row.value}"`;
  232 |     test(`SCN-006.${i + 1}: The API enforces field boundaries (${row.field} ${label} → ${row.outcome})`, { tag: ['@AC-4', '@AC-6', '@type:boundary', '@layer:api', '@P1', '@boundary'] }, async ({ api, journey, data, seed }) => {
  233 |       const value = typeof row.value === 'number' ? ofLength(row.field, row.value) : row.value;
  234 |       let res!: Awaited<ReturnType<Api['post']>>;
  235 |       await journey.step(`When I POST a valid enquiry to /api/message whose ${row.field} is ${label}`, async () => {
  236 |         const enquiry = validEnquiry(data, { [apiFieldName(row.field)]: value });
  237 |         trackEnquiry(seed, api, data, enquiry.subject);
  238 |         res = await api.post(EP.message, { data: enquiry });
  239 |       });
  240 |       await journey.step(`Then the enquiry is ${row.outcome}`, async () => {
  241 |         if (row.outcome === 'accepted') {
  242 |           const outcome = res.status >= 200 && res.status < 300 ? 'accepted' : `rejected (${res.status}: ${res.text.slice(0, 160)})`;
  243 |           expect(outcome, `[REQ AC-4] ${row.field} ${label} is accepted`).toBe('accepted');
  244 |         } else {
  245 |           expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  246 |         }
  247 |       });
  248 |       const expectedMessage = row.outcome === 'rejected' ? REQ.LENGTH_MESSAGE[row.field as keyof typeof REQ.LENGTH_MESSAGE] : undefined;
  249 |       if (expectedMessage) {
  250 |         await journey.step(`And when rejected, the error list contains "${expectedMessage}"`, async () => {
  251 |           expect(res.body, `[REQ AC-6] error list contains the ${row.field} length message`).toContain(expectedMessage);
  252 |         });
  253 |       }
  254 |     });
  255 |   });
  256 | 
  257 |   test('SCN-007: A rejected enquiry is not stored', { tag: ['@AC-6', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  258 |     let token = '';
  259 |     const enquiry = validEnquiry(data, { phone: '123' });
  260 |     trackEnquiry(seed, api, data, enquiry.subject);
  261 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  262 |     await journey.step('When I POST an enquiry with a unique subject and a too-short phone to /api/message', async () => {
  263 |       const res = await api.post(EP.message, { data: enquiry });
  264 |       expect(res.status, '[REQ AC-6] invalid enquiry → 400').toBe(REQ.STATUS.BAD_REQUEST);
  265 |     });
  266 |     await journey.step('Then the response status is 400', async () => { /* asserted with the request above */ });
  267 |     await journey.step('And the authenticated message list does not contain that subject', async () => {
  268 |       const subjects = (await staffMessages(api, token)).map((m) => m.subject);
  269 |       expect(subjects, '[REQ AC-6] rejected enquiry is not stored').not.toContain(enquiry.subject);
  270 |     });
  271 |   });
  272 | 
  273 |   test('SCN-008: A malformed JSON body is a client error', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  274 |     let status = 0;
  275 |     await journey.step('When I POST a body that is not valid JSON to /api/message', async () => {
  276 |       status = (await api.post(EP.message, { data: '{"name": "QA malformed", "email": ' })).status;
  277 |     });
  278 |     await journey.step('Then the response status is 400', async () => {
> 279 |       expect(status, '[REQ AC-7] malformed JSON → 400 (never 5xx)').toBe(REQ.STATUS.BAD_REQUEST);
      |                                                                     ^ Error: [REQ AC-7] malformed JSON → 400 (never 5xx)
  280 |     });
  281 |   });
  282 | 
  283 |   test('SCN-009: Listing enquiries without a staff token is refused', { tag: ['@AC-8', '@type:security', '@layer:api', '@P1', '@security'] }, async ({ api, journey }) => {
  284 |     let res!: Awaited<ReturnType<Api['get']>>;
  285 |     await journey.step('When I GET /api/message without a token', async () => { res = await api.get(EP.message); });
  286 |     await journey.step('Then the response status is 401', async () => {
  287 |       expect.soft(res.status, '[REQ AC-8] message list without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  288 |     });
  289 |     await journey.step('And the response contains no message data', async () => {
  290 |       expect.soft(res.text, '[REQ AC-8] no message data without token').not.toContain('"messages"');
  291 |     });
  292 |   });
  293 | 
  294 |   test('SCN-010: Reading an enquiry without a staff token is refused', { tag: ['@AC-8', '@type:security', '@layer:api', '@P1', '@security'] }, async ({ api, journey, data, seed }) => {
  295 |     let id = 0;
  296 |     let res!: Awaited<ReturnType<Api['get']>>;
  297 |     await journey.step('Given I am authenticated as staff and know the id of an existing enquiry', async () => {
  298 |       // Seed our own enquiry rather than relying on whatever data the shared environment holds.
  299 |       id = await seed.create('enquiry', async () => {
  300 |         const e = validEnquiry(data);
  301 |         const r = await api.post(EP.message, { data: e });
  302 |         expect(r.status >= 200 && r.status < 300, 'create enquiry (seed)').toBe(true);
  303 |         const found = (await staffMessages(api, await staffToken(api, data))).find((m) => m.subject === e.subject);
  304 |         expect(found, 'seeded enquiry visible to staff (seed)').toBeTruthy();
  305 |         return found!.id;
  306 |       }, async (mid) => { const token = await staffToken(api, data); await api.delete(EP.messageById(mid), { cookies: { token } }); });
  307 |     });
  308 |     await journey.step('When I GET /api/message/{id} without a token', async () => { res = await api.get(EP.messageById(id)); });
  309 |     await journey.step('Then the response status is 401', async () => {
  310 |       expect.soft(res.status, '[REQ AC-8] message detail without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  311 |     });
  312 |     await journey.step('And the response contains no personal data', async () => {
  313 |       const leaked = REQ.PERSONAL_DATA_KEYS.filter((k) => res.text.includes(`"${k}"`));
  314 |       expect.soft(leaked, '[REQ AC-8] no personal data without token').toEqual([]);
  315 |     });
  316 |   });
  317 | 
  318 |   test('SCN-011: Staff can list enquiries with a valid token', { tag: ['@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  319 |     let token = '';
  320 |     let res!: Awaited<ReturnType<Api['get']>>;
  321 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  322 |     await journey.step('When I GET /api/message with the token cookie', async () => { res = await api.get(EP.message, { cookies: { token } }); });
  323 |     await journey.step('Then the response status is 200', async () => {
  324 |       expect(res.status, '[REQ AC-8] message list with token → 200').toBe(REQ.STATUS.OK);
  325 |     });
  326 |     await journey.step('And every message has id, name, subject and read', async () => {
  327 |       const messages = (res.body as { messages?: unknown[] }).messages ?? [];
  328 |       const violations = messages.flatMap((m, i) => checkShape(m, MESSAGE_SUMMARY_SCHEMA, `messages[${i}]`));
  329 |       expect(violations, '[REQ AC-8] message summary schema').toEqual([]);
  330 |     });
  331 |   });
  332 | 
  333 |   test('SCN-012: Valid staff credentials return a token', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  334 |     let res!: Awaited<ReturnType<Api['post']>>;
  335 |     await journey.step('When I POST the staff credentials to /api/auth/login', async () => {
  336 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.staff.password } });
  337 |     });
  338 |     await journey.step('Then the response status is 200', async () => {
  339 |       expect(res.status, '[REQ AC-9] valid login → 200').toBe(REQ.STATUS.OK);
  340 |     });
  341 |     await journey.step('And the body contains a non-empty "token"', async () => {
  342 |       expect(checkShape(res.body, { token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string' }), '[REQ AC-9] login returns a non-empty token').toEqual([]);
  343 |     });
  344 |   });
  345 | 
  346 |   test('SCN-013: Invalid staff credentials are refused', { tag: ['@AC-9', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
  347 |     let res!: Awaited<ReturnType<Api['post']>>;
  348 |     await journey.step('When I POST the staff username with a wrong password to /api/auth/login', async () => {
  349 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.wrongPassword } });
  350 |     });
  351 |     await journey.step('Then the response status is 401', async () => {
  352 |       expect.soft(res.status, '[REQ AC-9] invalid login → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  353 |     });
  354 |     await journey.step('And the body is {"error": "Invalid credentials"}', async () => {
  355 |       expect.soft(res.body, '[REQ AC-9] invalid login body').toEqual(REQ.LOGIN_INVALID_BODY);
  356 |     });
  357 |   });
  358 | 
  359 |   // ---------------- Cross-layer ----------------
  360 |   test('SCN-014: An enquiry sent from the UI is readable by staff through the API', { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  361 |     const enquiry = validEnquiry(data);
  362 |     trackEnquiry(seed, api, data, enquiry.subject);
  363 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  364 |     await journey.step('When I submit the contact form with a unique name and a unique subject', async () => {
  365 |       await fillContactForm(page, enquiry);
  366 |     });
  367 |     await journey.step('And I see the confirmation', async () => {
  368 |       await expect(ui(page).confirmation).toBeVisible();
  369 |     });
  370 |     await journey.step('Then the authenticated message list contains an enquiry with that name and subject', async () => {
  371 |       const token = await staffToken(api, data);
  372 |       await expect.poll(async () => (await staffMessages(api, token)).some((m) => m.name === enquiry.name && m.subject === enquiry.subject),
  373 |         { message: '[REQ AC-10] UI enquiry readable by staff via API', timeout: 10_000 }).toBe(true);
  374 |     });
  375 |   });
  376 | 
  377 |   // ---------------- Rooms catalogue ----------------
  378 |   test('SCN-015: The rooms list follows the Room schema', { tag: ['@AC-11', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  379 |     let res!: Awaited<ReturnType<Api['get']>>;
```