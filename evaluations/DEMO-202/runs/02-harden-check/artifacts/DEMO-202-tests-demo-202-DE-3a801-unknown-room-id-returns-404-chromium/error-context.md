# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-017: An unknown room id returns 404
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:379:3

# Error details

```
Error: [REQ AC-12] unknown room → 404

expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 500
```

# Test source

```ts
  287 |       const leaked = REQ.PERSONAL_DATA_KEYS.filter((k) => res.text.includes(`"${k}"`));
  288 |       expect.soft(leaked, '[REQ AC-8] no personal data without token').toEqual([]);
  289 |     });
  290 |   });
  291 | 
  292 |   test('SCN-011: Staff can list enquiries with a valid token', { tag: ['@AC-8', '@P1', '@api'] }, async ({ api, journey, data }) => {
  293 |     let token = '';
  294 |     let res!: Awaited<ReturnType<Api['get']>>;
  295 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  296 |     await journey.step('When I GET /api/message with the token cookie', async () => { res = await api.get(EP.message, { cookies: { token } }); });
  297 |     await journey.step('Then the response status is 200', async () => {
  298 |       expect(res.status, '[REQ AC-8] message list with token → 200').toBe(REQ.STATUS.OK);
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
> 387 |       expect(status, '[REQ AC-12] unknown room → 404').toBe(REQ.STATUS.NOT_FOUND);
      |                                                        ^ Error: [REQ AC-12] unknown room → 404
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
  399 |     });
  400 |     await journey.step('And that card shows "£<roomPrice> per night"', async () => {
  401 |       for (const room of list) {
  402 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] ${room.type} card shows its nightly price`).toContainText(REQ.PRICE_TEXT(room.roomPrice));
  403 |       }
  404 |     });
  405 |   });
  406 | 
  407 |   test("SCN-019: Room card images name their own room type", { tag: ['@AC-14', '@P2', '@e2e', '@a11y'] }, async ({ page, api, journey }) => {
  408 |     let list: Room[] = [];
  409 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  410 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  411 |     await journey.step('Then each room card\'s image has the alternative text "<Type> Room" for that card\'s type', async () => {
  412 |       for (const room of list) {
  413 |         await expect.soft(ui(page).roomCard(room.type).first().getByRole('img').first(), `[REQ AC-14] ${room.type} card image alt text`).toHaveAccessibleName(REQ.ALT_TEXT(room.type));
  414 |       }
  415 |     });
  416 |   });
  417 | 
  418 |   test('SCN-020: The rooms list responds quickly', { tag: ['@AC-15', '@P3', '@api', '@performance'] }, async ({ api, journey }) => {
  419 |     const durations: number[] = [];
  420 |     await journey.step('When I GET /api/room 5 times in a row', async () => {
  421 |       for (let i = 0; i < REQ.PERF.REQUESTS; i++) durations.push((await api.get(EP.rooms)).durationMs);
  422 |     });
  423 |     await journey.step('Then every response arrives in under 3000 ms', async () => {
  424 |       expect(Math.max(...durations), `[REQ AC-15] slowest of ${REQ.PERF.REQUESTS} GET /api/room < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS);
  425 |     });
  426 |   });
  427 | });
  428 | 
```