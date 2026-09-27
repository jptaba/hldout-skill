# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-011: Staff can list enquiries with a valid token
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:292:3

# Error details

```
Error: [REQ AC-8] message list with token → 200

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 404
```

# Test source

```ts
  198 | 
  199 |   // ---------------- Messages API ----------------
  200 |   test('SCN-005: Creating a valid enquiry returns 201 Created', { tag: ['@AC-5', '@P1', '@api'] }, async ({ api, journey, data }) => {
  201 |     let res!: Awaited<ReturnType<Api['post']>>;
  202 |     await journey.step('When I POST a valid enquiry to /api/message', async () => {
  203 |       res = await api.post(EP.message, { data: validEnquiry(data) });
  204 |     });
  205 |     await journey.step('Then the response status is 201', async () => {
  206 |       expect.soft(res.status, '[REQ AC-5] create enquiry → 201 Created').toBe(REQ.STATUS.CREATED);
  207 |     });
  208 |     await journey.step('And the response body is {"success": true}', async () => {
  209 |       expect.soft(res.body, '[REQ AC-5] create enquiry body').toEqual(REQ.CREATE_BODY);
  210 |     });
  211 |   });
  212 | 
  213 |   REQ.API_BOUNDARIES.forEach((row, i) => {
  214 |     const label = typeof row.value === 'number' ? `${row.value} characters` : `"${row.value}"`;
  215 |     test(`SCN-006.${i + 1}: The API enforces field boundaries (${row.field} ${label} → ${row.outcome})`, { tag: ['@AC-4', '@AC-6', '@P1', '@api', '@boundary'] }, async ({ api, journey, data }) => {
  216 |       const value = typeof row.value === 'number' ? ofLength(row.field, row.value) : row.value;
  217 |       let res!: Awaited<ReturnType<Api['post']>>;
  218 |       await journey.step(`When I POST a valid enquiry to /api/message whose ${row.field} is ${label}`, async () => {
  219 |         res = await api.post(EP.message, { data: validEnquiry(data, { [apiFieldName(row.field)]: value }) });
  220 |       });
  221 |       await journey.step(`Then the enquiry is ${row.outcome}`, async () => {
  222 |         if (row.outcome === 'accepted') {
  223 |           const outcome = res.status >= 200 && res.status < 300 ? 'accepted' : `rejected (${res.status}: ${res.text.slice(0, 160)})`;
  224 |           expect(outcome, `[REQ AC-4] ${row.field} ${label} is accepted`).toBe('accepted');
  225 |         } else {
  226 |           expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  227 |         }
  228 |       });
  229 |       const expectedMessage = row.outcome === 'rejected' ? REQ.LENGTH_MESSAGE[row.field as keyof typeof REQ.LENGTH_MESSAGE] : undefined;
  230 |       if (expectedMessage) {
  231 |         await journey.step(`And when rejected, the error list contains "${expectedMessage}"`, async () => {
  232 |           expect(res.body, `[REQ AC-6] error list contains the ${row.field} length message`).toContain(expectedMessage);
  233 |         });
  234 |       }
  235 |     });
  236 |   });
  237 | 
  238 |   test('SCN-007: A rejected enquiry is not stored', { tag: ['@AC-6', '@P2', '@api'] }, async ({ api, journey, data }) => {
  239 |     let token = '';
  240 |     const enquiry = validEnquiry(data, { phone: '123' });
  241 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  242 |     await journey.step('When I POST an enquiry with a unique subject and a too-short phone to /api/message', async () => {
  243 |       const res = await api.post(EP.message, { data: enquiry });
  244 |       expect(res.status, '[REQ AC-6] invalid enquiry → 400').toBe(REQ.STATUS.BAD_REQUEST);
  245 |     });
  246 |     await journey.step('Then the response status is 400', async () => { /* asserted with the request above */ });
  247 |     await journey.step('And the authenticated message list does not contain that subject', async () => {
  248 |       const subjects = (await staffMessages(api, token)).map((m) => m.subject);
  249 |       expect(subjects, '[REQ AC-6] rejected enquiry is not stored').not.toContain(enquiry.subject);
  250 |     });
  251 |   });
  252 | 
  253 |   test('SCN-008: A malformed JSON body is a client error', { tag: ['@AC-7', '@P2', '@api'] }, async ({ api, journey }) => {
  254 |     let status = 0;
  255 |     await journey.step('When I POST a body that is not valid JSON to /api/message', async () => {
  256 |       status = (await api.post(EP.message, { data: '{"name": "QA malformed", "email": ' })).status;
  257 |     });
  258 |     await journey.step('Then the response status is 400', async () => {
  259 |       expect(status, '[REQ AC-7] malformed JSON → 400 (never 5xx)').toBe(REQ.STATUS.BAD_REQUEST);
  260 |     });
  261 |   });
  262 | 
  263 |   test('SCN-009: Listing enquiries without a staff token is refused', { tag: ['@AC-8', '@P1', '@api', '@security'] }, async ({ api, journey }) => {
  264 |     let res!: Awaited<ReturnType<Api['get']>>;
  265 |     await journey.step('When I GET /api/message without a token', async () => { res = await api.get(EP.message); });
  266 |     await journey.step('Then the response status is 401', async () => {
  267 |       expect.soft(res.status, '[REQ AC-8] message list without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  268 |     });
  269 |     await journey.step('And the response contains no message data', async () => {
  270 |       expect.soft(res.text, '[REQ AC-8] no message data without token').not.toContain('"messages"');
  271 |     });
  272 |   });
  273 | 
  274 |   test('SCN-010: Reading an enquiry without a staff token is refused', { tag: ['@AC-8', '@P1', '@api', '@security'] }, async ({ api, journey, data }) => {
  275 |     let id = 0;
  276 |     let res!: Awaited<ReturnType<Api['get']>>;
  277 |     await journey.step('Given I am authenticated as staff and know the id of an existing enquiry', async () => {
  278 |       const list = await staffMessages(api, await staffToken(api, data));
  279 |       expect(list.length, 'at least one enquiry exists (precondition)').toBeGreaterThan(0);
  280 |       id = list[0].id;
  281 |     });
  282 |     await journey.step('When I GET /api/message/{id} without a token', async () => { res = await api.get(EP.messageById(id)); });
  283 |     await journey.step('Then the response status is 401', async () => {
  284 |       expect.soft(res.status, '[REQ AC-8] message detail without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  285 |     });
  286 |     await journey.step('And the response contains no personal data', async () => {
  287 |       const leaked = REQ.PERSONAL_DATA_KEYS.filter((k) => res.text.includes(`"${k}"`));
  288 |       expect.soft(leaked, '[REQ AC-8] no personal data without token').toEqual([]);
  289 |     });
  290 |   });
  291 | 
  292 |   test('SCN-011: Staff can list enquiries with a valid token', { tag: ['@AC-8', '@P1', '@api'] }, async ({ api, journey, data }) => {
  293 |     let token = '';
  294 |     let res!: Awaited<ReturnType<Api['get']>>;
  295 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  296 |     await journey.step('When I GET /api/message with the token cookie', async () => { res = await api.get('/api/messages', { cookies: { token } }); });
  297 |     await journey.step('Then the response status is 200', async () => {
> 298 |       expect(res.status, '[REQ AC-8] message list with token → 200').toBe(REQ.STATUS.OK);
      |                                                                      ^ Error: [REQ AC-8] message list with token → 200
  299 |     });
  300 |     await journey.step('And every message has id, name, subject and read', async () => {
  301 |       const messages = (res.body as { messages?: unknown[] }).messages ?? [];
  302 |       const violations = messages.flatMap((m, i) => checkShape(m, MESSAGE_SUMMARY_SCHEMA, `messages[${i}]`));
  303 |       expect(violations, '[REQ AC-8] message summary schema').toEqual([]);
  304 |     });
  305 |   });
  306 | 
  307 |   test('SCN-012: Valid staff credentials return a token', { tag: ['@AC-9', '@P1', '@api'] }, async ({ api, journey, data }) => {
  308 |     let res!: Awaited<ReturnType<Api['post']>>;
  309 |     await journey.step('When I POST the staff credentials to /api/auth/login', async () => {
  310 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.staff.password } });
  311 |     });
  312 |     await journey.step('Then the response status is 200', async () => {
  313 |       expect(res.status, '[REQ AC-9] valid login → 200').toBe(REQ.STATUS.OK);
  314 |     });
  315 |     await journey.step('And the body contains a non-empty "token"', async () => {
  316 |       expect(checkShape(res.body, { token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string' }), '[REQ AC-9] login returns a non-empty token').toEqual([]);
  317 |     });
  318 |   });
  319 | 
  320 |   test('SCN-013: Invalid staff credentials are refused', { tag: ['@AC-9', '@P2', '@api'] }, async ({ api, journey, data }) => {
  321 |     let res!: Awaited<ReturnType<Api['post']>>;
  322 |     await journey.step('When I POST the staff username with a wrong password to /api/auth/login', async () => {
  323 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.wrongPassword } });
  324 |     });
  325 |     await journey.step('Then the response status is 401', async () => {
  326 |       expect.soft(res.status, '[REQ AC-9] invalid login → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  327 |     });
  328 |     await journey.step('And the body is {"error": "Invalid credentials"}', async () => {
  329 |       expect.soft(res.body, '[REQ AC-9] invalid login body').toEqual(REQ.LOGIN_INVALID_BODY);
  330 |     });
  331 |   });
  332 | 
  333 |   // ---------------- Cross-layer ----------------
  334 |   test('SCN-014: An enquiry sent from the UI is readable by staff through the API', { tag: ['@AC-10', '@P1', '@e2e'] }, async ({ page, api, journey, data }) => {
  335 |     const enquiry = validEnquiry(data);
  336 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  337 |     await journey.step('When I submit the contact form with a unique name and a unique subject', async () => {
  338 |       await fillContactForm(page, enquiry);
  339 |     });
  340 |     await journey.step('And I see the confirmation', async () => {
  341 |       await expect(ui(page).confirmation).toBeVisible();
  342 |     });
  343 |     await journey.step('Then the authenticated message list contains an enquiry with that name and subject', async () => {
  344 |       const token = await staffToken(api, data);
  345 |       await expect.poll(async () => (await staffMessages(api, token)).some((m) => m.name === enquiry.name && m.subject === enquiry.subject),
  346 |         { message: '[REQ AC-10] UI enquiry readable by staff via API', timeout: 10_000 }).toBe(true);
  347 |     });
  348 |   });
  349 | 
  350 |   // ---------------- Rooms catalogue ----------------
  351 |   test('SCN-015: The rooms list follows the Room schema', { tag: ['@AC-11', '@P1', '@api'] }, async ({ api, journey }) => {
  352 |     let res!: Awaited<ReturnType<Api['get']>>;
  353 |     await journey.step('When I GET /api/room', async () => { res = await api.get(EP.rooms); });
  354 |     await journey.step('Then the response status is 200', async () => {
  355 |       expect(res.status, '[REQ AC-11] room list → 200').toBe(REQ.STATUS.OK);
  356 |     });
  357 |     await journey.step('And every room matches the Room schema', async () => {
  358 |       const list = (res.body as { rooms?: unknown[] }).rooms;
  359 |       expect(Array.isArray(list) && list.length > 0, '[REQ AC-11] body has a non-empty "rooms" array').toBe(true);
  360 |       const violations = (list ?? []).flatMap((r, i) => checkShape(r, ROOM_SCHEMA, `rooms[${i}]`));
  361 |       expect(violations, '[REQ AC-11] every room matches the Room schema').toEqual([]);
  362 |     });
  363 |   });
  364 | 
  365 |   test('SCN-016: An existing room can be fetched by id', { tag: ['@AC-12', '@P2', '@api'] }, async ({ api, journey }) => {
  366 |     let room!: Room;
  367 |     let res!: Awaited<ReturnType<Api['get']>>;
  368 |     await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
  369 |     await journey.step('When I GET /api/room/{id}', async () => { res = await api.get(EP.roomById(room.roomid)); });
  370 |     await journey.step('Then the response status is 200', async () => {
  371 |       expect(res.status, '[REQ AC-12] existing room → 200').toBe(REQ.STATUS.OK);
  372 |     });
  373 |     await journey.step('And the body is that room and matches the Room schema', async () => {
  374 |       expect.soft((res.body as Room).roomid, '[REQ AC-12] detail is the requested room').toBe(room.roomid);
  375 |       expect.soft(checkShape(res.body, ROOM_SCHEMA, 'room'), '[REQ AC-12] detail matches the Room schema').toEqual([]);
  376 |     });
  377 |   });
  378 | 
  379 |   test('SCN-017: An unknown room id returns 404', { tag: ['@AC-12', '@P2', '@api'] }, async ({ api, journey }) => {
  380 |     let unknownId = 0;
  381 |     let status = 0;
  382 |     await journey.step('Given I know an id that no room has', async () => {
  383 |       unknownId = Math.max(...(await rooms(api)).map((r) => r.roomid)) + 100000;
  384 |     });
  385 |     await journey.step('When I GET /api/room/{id}', async () => { status = (await api.get(EP.roomById(unknownId))).status; });
  386 |     await journey.step('Then the response status is 404', async () => {
  387 |       expect(status, '[REQ AC-12] unknown room → 404').toBe(REQ.STATUS.NOT_FOUND);
  388 |     });
  389 |   });
  390 | 
  391 |   test('SCN-018: Every API room is shown with its type and nightly price', { tag: ['@AC-13', '@P1', '@e2e'] }, async ({ page, api, journey }) => {
  392 |     let list: Room[] = [];
  393 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  394 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  395 |     await journey.step("Then each room's type is shown on a room card", async () => {
  396 |       for (const room of list) {
  397 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] a card shows room type ${room.type}`).toBeVisible();
  398 |       }
```