# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-010: Reading an enquiry without a staff token is refused
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:299:3

# Error details

```
Error: [REQ AC-8] message detail without token → 401

expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 200
```

```
Error: [REQ AC-8] no personal data without token

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 5

- Array []
+ Array [
+   "email",
+   "phone",
+   "description",
+ ]
```

# Test source

```ts
  222 |     await journey.step('When I POST a valid enquiry to /api/message', async () => {
  223 |       const enquiry = validEnquiry(data);
  224 |       trackEnquiry(seed, api, data, enquiry.subject);
  225 |       res = await api.post(EP.message, { data: enquiry });
  226 |     });
  227 |     await journey.step('Then the response status is 201', async () => {
  228 |       expect.soft(res.status, '[REQ AC-5] create enquiry → 201 Created').toBe(REQ.STATUS.CREATED);
  229 |     });
  230 |     await journey.step('And the response body is {"success": true}', async () => {
  231 |       expect.soft(res.body, '[REQ AC-5] create enquiry body').toEqual(REQ.CREATE_BODY);
  232 |     });
  233 |   });
  234 | 
  235 |   REQ.API_BOUNDARIES.forEach((row, i) => {
  236 |     const label = typeof row.value === 'number' ? `${row.value} characters` : `"${row.value}"`;
  237 |     test(`SCN-006.${i + 1}: The API enforces field boundaries (${row.field} ${label} → ${row.outcome})`, { tag: ['@AC-4', '@AC-6', '@type:boundary', '@layer:api', '@P1', '@boundary'] }, async ({ api, journey, data, seed }) => {
  238 |       const value = typeof row.value === 'number' ? ofLength(row.field, row.value) : row.value;
  239 |       let res!: Awaited<ReturnType<Api['post']>>;
  240 |       await journey.step(`When I POST a valid enquiry to /api/message whose ${row.field} is ${label}`, async () => {
  241 |         const enquiry = validEnquiry(data, { [apiFieldName(row.field)]: value });
  242 |         trackEnquiry(seed, api, data, enquiry.subject);
  243 |         res = await api.post(EP.message, { data: enquiry });
  244 |       });
  245 |       await journey.step(`Then the enquiry is ${row.outcome}`, async () => {
  246 |         if (row.outcome === 'accepted') {
  247 |           const outcome = res.status >= 200 && res.status < 300 ? 'accepted' : `rejected (${res.status}: ${res.text.slice(0, 160)})`;
  248 |           expect(outcome, `[REQ AC-4] ${row.field} ${label} is accepted`).toBe('accepted');
  249 |         } else {
  250 |           expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  251 |         }
  252 |       });
  253 |       const expectedMessage = row.outcome === 'rejected' ? REQ.LENGTH_MESSAGE[row.field as keyof typeof REQ.LENGTH_MESSAGE] : undefined;
  254 |       if (expectedMessage) {
  255 |         await journey.step(`And when rejected, the error list contains "${expectedMessage}"`, async () => {
  256 |           expect(res.body, `[REQ AC-6] error list contains the ${row.field} length message`).toContain(expectedMessage);
  257 |         });
  258 |       }
  259 |     });
  260 |   });
  261 | 
  262 |   test('SCN-007: A rejected enquiry is not stored', { tag: ['@AC-6', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  263 |     let token = '';
  264 |     const enquiry = validEnquiry(data, { phone: '123' });
  265 |     trackEnquiry(seed, api, data, enquiry.subject);
  266 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffSession(seed, api, data); });
  267 |     await journey.step('When I POST an enquiry with a unique subject and a too-short phone to /api/message', async () => {
  268 |       const res = await api.post(EP.message, { data: enquiry });
  269 |       expect(res.status, '[REQ AC-6] invalid enquiry → 400').toBe(REQ.STATUS.BAD_REQUEST);
  270 |     });
  271 |     await journey.step('Then the response status is 400', async () => { /* asserted with the request above */ });
  272 |     await journey.step('And the authenticated message list does not contain that subject', async () => {
  273 |       const subjects = (await staffMessages(api, token)).map((m) => m.subject);
  274 |       expect(subjects, '[REQ AC-6] rejected enquiry is not stored').not.toContain(enquiry.subject);
  275 |     });
  276 |   });
  277 | 
  278 |   test('SCN-008: A malformed JSON body is a client error', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  279 |     let status = 0;
  280 |     await journey.step('When I POST a body that is not valid JSON to /api/message', async () => {
  281 |       status = (await api.post(EP.message, { data: '{"name": "QA malformed", "email": ' })).status;
  282 |     });
  283 |     await journey.step('Then the response status is 400', async () => {
  284 |       expect(status, '[REQ AC-7] malformed JSON → 400 (never 5xx)').toBe(REQ.STATUS.BAD_REQUEST);
  285 |     });
  286 |   });
  287 | 
  288 |   test('SCN-009: Listing enquiries without a staff token is refused', { tag: ['@AC-8', '@type:security', '@layer:api', '@P1', '@security'] }, async ({ api, journey }) => {
  289 |     let res!: Awaited<ReturnType<Api['get']>>;
  290 |     await journey.step('When I GET /api/message without a token', async () => { res = await api.get(EP.message); });
  291 |     await journey.step('Then the response status is 401', async () => {
  292 |       expect.soft(res.status, '[REQ AC-8] message list without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  293 |     });
  294 |     await journey.step('And the response contains no message data', async () => {
  295 |       expect.soft(res.text, '[REQ AC-8] no message data without token').not.toContain('"messages"');
  296 |     });
  297 |   });
  298 | 
  299 |   test('SCN-010: Reading an enquiry without a staff token is refused', { tag: ['@AC-8', '@type:security', '@layer:api', '@P1', '@security'] }, async ({ api, journey, data, seed }) => {
  300 |     let id = 0;
  301 |     let res!: Awaited<ReturnType<Api['get']>>;
  302 |     await journey.step('Given I am authenticated as staff and know the id of an existing enquiry', async () => {
  303 |       // API pre-step chain — never rely on whatever data the shared environment holds:
  304 |       //  1. auth context (reused per worker)  2. seed our own enquiry  3. wait until staff can see it → its id.
  305 |       const token = await staffSession(seed, api, data);
  306 |       const e = validEnquiry(data);
  307 |       await seed.create('enquiry', async () => {
  308 |         const r = await api.post(EP.message, { data: e });
  309 |         expect(r.status >= 200 && r.status < 300, 'create enquiry (seed)').toBe(true);
  310 |         return e.subject;
  311 |       }, (subject) => deleteEnquiries(api, data, subject));
  312 |       const found = await seed.until('seeded enquiry visible to staff',
  313 |         async () => (await staffMessages(api, token)).find((m) => m.subject === e.subject), (m) => Boolean(m));
  314 |       id = found!.id;
  315 |     });
  316 |     await journey.step('When I GET /api/message/{id} without a token', async () => { res = await api.get(EP.messageById(id)); });
  317 |     await journey.step('Then the response status is 401', async () => {
  318 |       expect.soft(res.status, '[REQ AC-8] message detail without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  319 |     });
  320 |     await journey.step('And the response contains no personal data', async () => {
  321 |       const leaked = REQ.PERSONAL_DATA_KEYS.filter((k) => res.text.includes(`"${k}"`));
> 322 |       expect.soft(leaked, '[REQ AC-8] no personal data without token').toEqual([]);
      |                                                                        ^ Error: [REQ AC-8] no personal data without token
  323 |     });
  324 |   });
  325 | 
  326 |   test('SCN-011: Staff can list enquiries with a valid token', { tag: ['@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  327 |     let token = '';
  328 |     let res!: Awaited<ReturnType<Api['get']>>;
  329 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffSession(seed, api, data); });
  330 |     await journey.step('When I GET /api/message with the token cookie', async () => { res = await api.get(EP.message, { cookies: { token } }); });
  331 |     await journey.step('Then the response status is 200', async () => {
  332 |       expect(res.status, '[REQ AC-8] message list with token → 200').toBe(REQ.STATUS.OK);
  333 |     });
  334 |     await journey.step('And every message has id, name, subject and read', async () => {
  335 |       const messages = (res.body as { messages?: unknown[] }).messages ?? [];
  336 |       const violations = messages.flatMap((m, i) => checkShape(m, MESSAGE_SUMMARY_SCHEMA, `messages[${i}]`));
  337 |       expect(violations, '[REQ AC-8] message summary schema').toEqual([]);
  338 |     });
  339 |   });
  340 | 
  341 |   test('SCN-012: Valid staff credentials return a token', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  342 |     let res!: Awaited<ReturnType<Api['post']>>;
  343 |     await journey.step('When I POST the staff credentials to /api/auth/login', async () => {
  344 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.staff.password } });
  345 |     });
  346 |     await journey.step('Then the response status is 200', async () => {
  347 |       expect(res.status, '[REQ AC-9] valid login → 200').toBe(REQ.STATUS.OK);
  348 |     });
  349 |     await journey.step('And the body contains a non-empty "token"', async () => {
  350 |       expect(checkShape(res.body, { token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string' }), '[REQ AC-9] login returns a non-empty token').toEqual([]);
  351 |     });
  352 |   });
  353 | 
  354 |   test('SCN-013: Invalid staff credentials are refused', { tag: ['@AC-9', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
  355 |     let res!: Awaited<ReturnType<Api['post']>>;
  356 |     await journey.step('When I POST the staff username with a wrong password to /api/auth/login', async () => {
  357 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.wrongPassword } });
  358 |     });
  359 |     await journey.step('Then the response status is 401', async () => {
  360 |       expect.soft(res.status, '[REQ AC-9] invalid login → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  361 |     });
  362 |     await journey.step('And the body is {"error": "Invalid credentials"}', async () => {
  363 |       expect.soft(res.body, '[REQ AC-9] invalid login body').toEqual(REQ.LOGIN_INVALID_BODY);
  364 |     });
  365 |   });
  366 | 
  367 |   // ---------------- Cross-layer ----------------
  368 |   test('SCN-014: An enquiry sent from the UI is readable by staff through the API', { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  369 |     const enquiry = validEnquiry(data);
  370 |     trackEnquiry(seed, api, data, enquiry.subject);
  371 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  372 |     await journey.step('When I submit the contact form with a unique name and a unique subject', async () => {
  373 |       await fillContactForm(page, enquiry);
  374 |     });
  375 |     await journey.step('And I see the confirmation', async () => {
  376 |       await expect(ui(page).confirmation).toBeVisible();
  377 |     });
  378 |     await journey.step('Then the authenticated message list contains an enquiry with that name and subject', async () => {
  379 |       const token = await staffSession(seed, api, data); // auth pre-step for the cross-layer check
  380 |       await expect.poll(async () => (await staffMessages(api, token)).some((m) => m.name === enquiry.name && m.subject === enquiry.subject),
  381 |         { message: '[REQ AC-10] UI enquiry readable by staff via API', timeout: 10_000 }).toBe(true);
  382 |     });
  383 |   });
  384 | 
  385 |   // ---------------- Rooms catalogue ----------------
  386 |   test('SCN-015: The rooms list follows the Room schema', { tag: ['@AC-11', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  387 |     let res!: Awaited<ReturnType<Api['get']>>;
  388 |     await journey.step('When I GET /api/room', async () => { res = await api.get(EP.rooms); });
  389 |     await journey.step('Then the response status is 200', async () => {
  390 |       expect(res.status, '[REQ AC-11] room list → 200').toBe(REQ.STATUS.OK);
  391 |     });
  392 |     await journey.step('And every room matches the Room schema', async () => {
  393 |       const list = (res.body as { rooms?: unknown[] }).rooms;
  394 |       expect(Array.isArray(list) && list.length > 0, '[REQ AC-11] body has a non-empty "rooms" array').toBe(true);
  395 |       const violations = (list ?? []).flatMap((r, i) => checkShape(r, ROOM_SCHEMA, `rooms[${i}]`));
  396 |       expect(violations, '[REQ AC-11] every room matches the Room schema').toEqual([]);
  397 |     });
  398 |   });
  399 | 
  400 |   test('SCN-016: An existing room can be fetched by id', { tag: ['@AC-12', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  401 |     let room!: Room;
  402 |     let res!: Awaited<ReturnType<Api['get']>>;
  403 |     await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
  404 |     await journey.step('When I GET /api/room/{id}', async () => { res = await api.get(EP.roomById(room.roomid)); });
  405 |     await journey.step('Then the response status is 200', async () => {
  406 |       expect(res.status, '[REQ AC-12] existing room → 200').toBe(REQ.STATUS.OK);
  407 |     });
  408 |     await journey.step('And the body is that room and matches the Room schema', async () => {
  409 |       expect.soft((res.body as Room).roomid, '[REQ AC-12] detail is the requested room').toBe(room.roomid);
  410 |       expect.soft(checkShape(res.body, ROOM_SCHEMA, 'room'), '[REQ AC-12] detail matches the Room schema').toEqual([]);
  411 |     });
  412 |   });
  413 | 
  414 |   test('SCN-017: An unknown room id returns 404', { tag: ['@AC-12', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  415 |     let unknownId = 0;
  416 |     let status = 0;
  417 |     await journey.step('Given I know an id that no room has', async () => {
  418 |       unknownId = Math.max(...(await rooms(api)).map((r) => r.roomid)) + 100000;
  419 |     });
  420 |     await journey.step('When I GET /api/room/{id}', async () => { status = (await api.get(EP.roomById(unknownId))).status; });
  421 |     await journey.step('Then the response status is 404', async () => {
  422 |       expect(status, '[REQ AC-12] unknown room → 404').toBe(REQ.STATUS.NOT_FOUND);
```