# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-017: An unknown room id returns 404
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:377:3

# Error details

```
Error: [REQ AC-12] unknown room → 404

expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 500
```

# Test source

```ts
  285 |       const leaked = REQ.PERSONAL_DATA_KEYS.filter((k) => res.text.includes(`"${k}"`));
  286 |       expect.soft(leaked, '[REQ AC-8] no personal data without token').toEqual([]);
  287 |     });
  288 |   });
  289 | 
  290 |   test('SCN-011: Staff can list enquiries with a valid token', { tag: ['@AC-8', '@P1', '@api'] }, async ({ api, journey, data }) => {
  291 |     let token = '';
  292 |     let res!: Awaited<ReturnType<Api['get']>>;
  293 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  294 |     await journey.step('When I GET /api/message with the token cookie', async () => { res = await api.get(EP.message, { cookies: { token } }); });
  295 |     await journey.step('Then the response status is 200', async () => {
  296 |       expect(res.status, '[REQ AC-8] message list with token → 200').toBe(REQ.STATUS.OK);
  297 |     });
  298 |     await journey.step('And every message has id, name, subject and read', async () => {
  299 |       const messages = (res.body as { messages?: unknown[] }).messages ?? [];
  300 |       const violations = messages.flatMap((m, i) => checkShape(m, MESSAGE_SUMMARY_SCHEMA, `messages[${i}]`));
  301 |       expect(violations, '[REQ AC-8] message summary schema').toEqual([]);
  302 |     });
  303 |   });
  304 | 
  305 |   test('SCN-012: Valid staff credentials return a token', { tag: ['@AC-9', '@P1', '@api'] }, async ({ api, journey, data }) => {
  306 |     let res!: Awaited<ReturnType<Api['post']>>;
  307 |     await journey.step('When I POST the staff credentials to /api/auth/login', async () => {
  308 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.staff.password } });
  309 |     });
  310 |     await journey.step('Then the response status is 200', async () => {
  311 |       expect(res.status, '[REQ AC-9] valid login → 200').toBe(REQ.STATUS.OK);
  312 |     });
  313 |     await journey.step('And the body contains a non-empty "token"', async () => {
  314 |       expect(checkShape(res.body, { token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string' }), '[REQ AC-9] login returns a non-empty token').toEqual([]);
  315 |     });
  316 |   });
  317 | 
  318 |   test('SCN-013: Invalid staff credentials are refused', { tag: ['@AC-9', '@P2', '@api'] }, async ({ api, journey, data }) => {
  319 |     let res!: Awaited<ReturnType<Api['post']>>;
  320 |     await journey.step('When I POST the staff username with a wrong password to /api/auth/login', async () => {
  321 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.wrongPassword } });
  322 |     });
  323 |     await journey.step('Then the response status is 401', async () => {
  324 |       expect.soft(res.status, '[REQ AC-9] invalid login → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  325 |     });
  326 |     await journey.step('And the body is {"error": "Invalid credentials"}', async () => {
  327 |       expect.soft(res.body, '[REQ AC-9] invalid login body').toEqual(REQ.LOGIN_INVALID_BODY);
  328 |     });
  329 |   });
  330 | 
  331 |   // ---------------- Cross-layer ----------------
  332 |   test('SCN-014: An enquiry sent from the UI is readable by staff through the API', { tag: ['@AC-10', '@P1', '@e2e'] }, async ({ page, api, journey, data }) => {
  333 |     const enquiry = validEnquiry(data);
  334 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  335 |     await journey.step('When I submit the contact form with a unique name and a unique subject', async () => {
  336 |       await fillContactForm(page, enquiry);
  337 |     });
  338 |     await journey.step('And I see the confirmation', async () => {
  339 |       await expect(ui(page).confirmation).toBeVisible();
  340 |     });
  341 |     await journey.step('Then the authenticated message list contains an enquiry with that name and subject', async () => {
  342 |       const token = await staffToken(api, data);
  343 |       await expect.poll(async () => (await staffMessages(api, token)).some((m) => m.name === enquiry.name && m.subject === enquiry.subject),
  344 |         { message: '[REQ AC-10] UI enquiry readable by staff via API', timeout: 10_000 }).toBe(true);
  345 |     });
  346 |   });
  347 | 
  348 |   // ---------------- Rooms catalogue ----------------
  349 |   test('SCN-015: The rooms list follows the Room schema', { tag: ['@AC-11', '@P1', '@api'] }, async ({ api, journey }) => {
  350 |     let res!: Awaited<ReturnType<Api['get']>>;
  351 |     await journey.step('When I GET /api/room', async () => { res = await api.get(EP.rooms); });
  352 |     await journey.step('Then the response status is 200', async () => {
  353 |       expect(res.status, '[REQ AC-11] room list → 200').toBe(REQ.STATUS.OK);
  354 |     });
  355 |     await journey.step('And every room matches the Room schema', async () => {
  356 |       const list = (res.body as { rooms?: unknown[] }).rooms;
  357 |       expect(Array.isArray(list) && list.length > 0, '[REQ AC-11] body has a non-empty "rooms" array').toBe(true);
  358 |       const violations = (list ?? []).flatMap((r, i) => checkShape(r, ROOM_SCHEMA, `rooms[${i}]`));
  359 |       expect(violations, '[REQ AC-11] every room matches the Room schema').toEqual([]);
  360 |     });
  361 |   });
  362 | 
  363 |   test('SCN-016: An existing room can be fetched by id', { tag: ['@AC-12', '@P2', '@api'] }, async ({ api, journey }) => {
  364 |     let room!: Room;
  365 |     let res!: Awaited<ReturnType<Api['get']>>;
  366 |     await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
  367 |     await journey.step('When I GET /api/room/{id}', async () => { res = await api.get(EP.roomById(room.roomid)); });
  368 |     await journey.step('Then the response status is 200', async () => {
  369 |       expect(res.status, '[REQ AC-12] existing room → 200').toBe(REQ.STATUS.OK);
  370 |     });
  371 |     await journey.step('And the body is that room and matches the Room schema', async () => {
  372 |       expect.soft((res.body as Room).roomid, '[REQ AC-12] detail is the requested room').toBe(room.roomid);
  373 |       expect.soft(checkShape(res.body, ROOM_SCHEMA, 'room'), '[REQ AC-12] detail matches the Room schema').toEqual([]);
  374 |     });
  375 |   });
  376 | 
  377 |   test('SCN-017: An unknown room id returns 404', { tag: ['@AC-12', '@P2', '@api'] }, async ({ api, journey }) => {
  378 |     let unknownId = 0;
  379 |     let status = 0;
  380 |     await journey.step('Given I know an id that no room has', async () => {
  381 |       unknownId = Math.max(...(await rooms(api)).map((r) => r.roomid)) + 100000;
  382 |     });
  383 |     await journey.step('When I GET /api/room/{id}', async () => { status = (await api.get(EP.roomById(unknownId))).status; });
  384 |     await journey.step('Then the response status is 404', async () => {
> 385 |       expect(status, '[REQ AC-12] unknown room → 404').toBe(REQ.STATUS.NOT_FOUND);
      |                                                        ^ Error: [REQ AC-12] unknown room → 404
  386 |     });
  387 |   });
  388 | 
  389 |   test('SCN-018: Every API room is shown with its type and nightly price', { tag: ['@AC-13', '@P1', '@e2e'] }, async ({ page, api, journey }) => {
  390 |     let list: Room[] = [];
  391 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  392 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  393 |     await journey.step("Then each room's type is shown on a room card", async () => {
  394 |       for (const room of list) {
  395 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] a card shows room type ${room.type}`).toBeVisible();
  396 |       }
  397 |     });
  398 |     await journey.step('And that card shows "£<roomPrice> per night"', async () => {
  399 |       for (const room of list) {
  400 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] ${room.type} card shows its nightly price`).toContainText(REQ.PRICE_TEXT(room.roomPrice));
  401 |       }
  402 |     });
  403 |   });
  404 | 
  405 |   test("SCN-019: Room card images name their own room type", { tag: ['@AC-14', '@P2', '@e2e', '@a11y'] }, async ({ page, api, journey }) => {
  406 |     let list: Room[] = [];
  407 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  408 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  409 |     await journey.step('Then each room card\'s image has the alternative text "<Type> Room" for that card\'s type', async () => {
  410 |       for (const room of list) {
  411 |         await expect.soft(ui(page).roomCard(room.type).first().getByRole('img').first(), `[REQ AC-14] ${room.type} card image alt text`).toHaveAccessibleName(REQ.ALT_TEXT(room.type));
  412 |       }
  413 |     });
  414 |   });
  415 | 
  416 |   test('SCN-020: The rooms list responds quickly', { tag: ['@AC-15', '@P3', '@api', '@performance'] }, async ({ api, journey }) => {
  417 |     const durations: number[] = [];
  418 |     await journey.step('When I GET /api/room 5 times in a row', async () => {
  419 |       for (let i = 0; i < REQ.PERF.REQUESTS; i++) durations.push((await api.get(EP.rooms)).durationMs);
  420 |     });
  421 |     await journey.step('Then every response arrives in under 3000 ms', async () => {
  422 |       expect(Math.max(...durations), `[REQ AC-15] slowest of ${REQ.PERF.REQUESTS} GET /api/room < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS);
  423 |     });
  424 |   });
  425 | });
  426 | 
```