# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-017: An unknown room id returns 404
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:414:3

# Error details

```
Error: [REQ AC-12] unknown room → 404

expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 500
```

# Test source

```ts
  322 |       expect.soft(leaked, '[REQ AC-8] no personal data without token').toEqual([]);
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
> 422 |       expect(status, '[REQ AC-12] unknown room → 404').toBe(REQ.STATUS.NOT_FOUND);
      |                                                        ^ Error: [REQ AC-12] unknown room → 404
  423 |     });
  424 |   });
  425 | 
  426 |   test('SCN-018: Every API room is shown with its type and nightly price', { tag: ['@AC-13', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey }) => {
  427 |     let list: Room[] = [];
  428 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  429 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  430 |     await journey.step("Then each room's type is shown on a room card", async () => {
  431 |       for (const room of list) {
  432 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] a card shows room type ${room.type}`).toBeVisible();
  433 |       }
  434 |     });
  435 |     await journey.step('And that card shows "£<roomPrice> per night"', async () => {
  436 |       for (const room of list) {
  437 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] ${room.type} card shows its nightly price`).toContainText(REQ.PRICE_TEXT(room.roomPrice));
  438 |       }
  439 |     });
  440 |   });
  441 | 
  442 |   test("SCN-019: Room card images name their own room type", { tag: ['@AC-14', '@type:accessibility', '@layer:e2e', '@P2'] }, async ({ page, api, journey }) => {
  443 |     let list: Room[] = [];
  444 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  445 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  446 |     await journey.step('Then each room card\'s image has the alternative text "<Type> Room" for that card\'s type', async () => {
  447 |       for (const room of list) {
  448 |         await expect.soft(ui(page).roomCard(room.type).first().getByRole('img').first(), `[REQ AC-14] ${room.type} card image alt text`).toHaveAccessibleName(REQ.ALT_TEXT(room.type));
  449 |       }
  450 |     });
  451 |   });
  452 | 
  453 |   test('SCN-020: The rooms list responds quickly', { tag: ['@AC-15', '@type:performance', '@layer:api', '@P3', '@performance'] }, async ({ api, journey }) => {
  454 |     const durations: number[] = [];
  455 |     await journey.step('When I GET /api/room 5 times in a row', async () => {
  456 |       for (let i = 0; i < REQ.PERF.REQUESTS; i++) durations.push((await api.get(EP.rooms)).durationMs);
  457 |     });
  458 |     await journey.step('Then every response arrives in under 3000 ms', async () => {
  459 |       expect(Math.max(...durations), `[REQ AC-15] slowest of ${REQ.PERF.REQUESTS} GET /api/room < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS);
  460 |     });
  461 |   });
  462 | 
  463 |   // ---------------- Reliability (rev 2) ----------------
  464 |   test('SCN-021: A retried enquiry with the same Idempotency-Key is stored only once', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  465 |     let token = '';
  466 |     const enquiry = validEnquiry(data);
  467 |     trackEnquiry(seed, api, data, enquiry.subject);
  468 |     const idempotencyKey = unique('qa-idem').replace(/\s+/g, '-');
  469 |     const statuses: number[] = [];
  470 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffSession(seed, api, data); });
  471 |     await journey.step('And a valid enquiry with a unique subject and a unique Idempotency-Key', async () => { /* built above */ });
  472 |     await journey.step('When I POST that enquiry to /api/message twice with the same Idempotency-Key', async () => {
  473 |       for (let i = 0; i < REQ.IDEMPOTENCY.REPEATS; i++) {
  474 |         statuses.push((await api.post(EP.message, { data: enquiry, headers: { [REQ.IDEMPOTENCY.HEADER]: idempotencyKey } })).status);
  475 |       }
  476 |     });
  477 |     await journey.step('Then both responses are 2xx', async () => {
  478 |       expect.soft(statuses.every((s) => s >= 200 && s < 300) ? 'all 2xx' : `statuses ${statuses.join(', ')}`, '[REQ AC-16] every repeat answers 2xx').toBe('all 2xx');
  479 |     });
  480 |     await journey.step('And the authenticated message list contains that subject exactly once', async () => {
  481 |       const stored = (await staffMessages(api, token)).filter((m) => m.subject === enquiry.subject).length;
  482 |       expect.soft(stored, '[REQ AC-16] retried enquiry stored only once').toBe(REQ.IDEMPOTENCY.EXPECTED_STORED);
  483 |     });
  484 |   });
  485 | 
  486 |   test('SCN-022: Repeating GET /api/room/{id} returns an identical body', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P3'] }, async ({ api, journey }) => {
  487 |     let room!: Room;
  488 |     const responses: { status: number; body: unknown }[] = [];
  489 |     await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
  490 |     await journey.step('When I GET /api/room/{id} three times', async () => {
  491 |       for (let i = 0; i < REQ.IDEMPOTENCY.GET_REPEATS; i++) {
  492 |         const r = await api.get(EP.roomById(room.roomid));
  493 |         responses.push({ status: r.status, body: r.body });
  494 |       }
  495 |     });
  496 |     await journey.step('Then all three responses are 200 with identical bodies', async () => {
  497 |       expect.soft(responses.map((r) => r.status), '[REQ AC-16] repeated GET all 200').toEqual(Array(REQ.IDEMPOTENCY.GET_REPEATS).fill(REQ.STATUS.OK));
  498 |       expect.soft(responses.map((r) => r.body), '[REQ AC-16] repeated GET returns identical bodies').toEqual(Array(REQ.IDEMPOTENCY.GET_REPEATS).fill(responses[0].body));
  499 |     });
  500 |   });
  501 | });
  502 | 
```