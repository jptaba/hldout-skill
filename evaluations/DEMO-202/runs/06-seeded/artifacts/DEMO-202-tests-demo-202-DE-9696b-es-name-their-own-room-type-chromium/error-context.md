# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-019: Room card images name their own room type
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:434:3

# Error details

```
Error: [REQ AC-14] Double card image alt text

expect(locator).toHaveAccessibleName(expected) failed

Locator:  locator('.room-card').filter({ has: getByRole('heading', { name: 'Double', exact: true }) }).first().getByRole('img').first()
Expected: "Double Room"
Received: "Single Room"
Timeout:  5000ms

Call log:
  - [REQ AC-14] Double card image alt text locator('.room-card').filter({ has: getByRole('heading', { name: 'Double', exact: true }) }).first().getByRole('img').first() with timeout 5000ms
  - waiting for locator('.room-card').filter({ has: getByRole('heading', { name: 'Double', exact: true }) }).first().getByRole('img').first()
    14 × locator resolved to <img alt="Single Room" class="card-img-top" src="/images/room2.jpg"/>
       - unexpected value "Single Room"

```

```yaml
- img "Single Room"
```

```
Error: [REQ AC-14] Suite card image alt text

expect(locator).toHaveAccessibleName(expected) failed

Locator:  locator('.room-card').filter({ has: getByRole('heading', { name: 'Suite', exact: true }) }).first().getByRole('img').first()
Expected: "Suite Room"
Received: "Single Room"
Timeout:  5000ms

Call log:
  - [REQ AC-14] Suite card image alt text locator('.room-card').filter({ has: getByRole('heading', { name: 'Suite', exact: true }) }).first().getByRole('img').first() with timeout 5000ms
  - waiting for locator('.room-card').filter({ has: getByRole('heading', { name: 'Suite', exact: true }) }).first().getByRole('img').first()
    14 × locator resolved to <img alt="Single Room" class="card-img-top" src="/images/room3.jpg"/>
       - unexpected value "Single Room"

```

```yaml
- img "Single Room"
```

# Test source

```ts
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
  380 |     await journey.step('When I GET /api/room', async () => { res = await api.get(EP.rooms); });
  381 |     await journey.step('Then the response status is 200', async () => {
  382 |       expect(res.status, '[REQ AC-11] room list → 200').toBe(REQ.STATUS.OK);
  383 |     });
  384 |     await journey.step('And every room matches the Room schema', async () => {
  385 |       const list = (res.body as { rooms?: unknown[] }).rooms;
  386 |       expect(Array.isArray(list) && list.length > 0, '[REQ AC-11] body has a non-empty "rooms" array').toBe(true);
  387 |       const violations = (list ?? []).flatMap((r, i) => checkShape(r, ROOM_SCHEMA, `rooms[${i}]`));
  388 |       expect(violations, '[REQ AC-11] every room matches the Room schema').toEqual([]);
  389 |     });
  390 |   });
  391 | 
  392 |   test('SCN-016: An existing room can be fetched by id', { tag: ['@AC-12', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  393 |     let room!: Room;
  394 |     let res!: Awaited<ReturnType<Api['get']>>;
  395 |     await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
  396 |     await journey.step('When I GET /api/room/{id}', async () => { res = await api.get(EP.roomById(room.roomid)); });
  397 |     await journey.step('Then the response status is 200', async () => {
  398 |       expect(res.status, '[REQ AC-12] existing room → 200').toBe(REQ.STATUS.OK);
  399 |     });
  400 |     await journey.step('And the body is that room and matches the Room schema', async () => {
  401 |       expect.soft((res.body as Room).roomid, '[REQ AC-12] detail is the requested room').toBe(room.roomid);
  402 |       expect.soft(checkShape(res.body, ROOM_SCHEMA, 'room'), '[REQ AC-12] detail matches the Room schema').toEqual([]);
  403 |     });
  404 |   });
  405 | 
  406 |   test('SCN-017: An unknown room id returns 404', { tag: ['@AC-12', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  407 |     let unknownId = 0;
  408 |     let status = 0;
  409 |     await journey.step('Given I know an id that no room has', async () => {
  410 |       unknownId = Math.max(...(await rooms(api)).map((r) => r.roomid)) + 100000;
  411 |     });
  412 |     await journey.step('When I GET /api/room/{id}', async () => { status = (await api.get(EP.roomById(unknownId))).status; });
  413 |     await journey.step('Then the response status is 404', async () => {
  414 |       expect(status, '[REQ AC-12] unknown room → 404').toBe(REQ.STATUS.NOT_FOUND);
  415 |     });
  416 |   });
  417 | 
  418 |   test('SCN-018: Every API room is shown with its type and nightly price', { tag: ['@AC-13', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey }) => {
  419 |     let list: Room[] = [];
  420 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  421 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  422 |     await journey.step("Then each room's type is shown on a room card", async () => {
  423 |       for (const room of list) {
  424 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] a card shows room type ${room.type}`).toBeVisible();
  425 |       }
  426 |     });
  427 |     await journey.step('And that card shows "£<roomPrice> per night"', async () => {
  428 |       for (const room of list) {
  429 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] ${room.type} card shows its nightly price`).toContainText(REQ.PRICE_TEXT(room.roomPrice));
  430 |       }
  431 |     });
  432 |   });
  433 | 
  434 |   test("SCN-019: Room card images name their own room type", { tag: ['@AC-14', '@type:accessibility', '@layer:e2e', '@P2'] }, async ({ page, api, journey }) => {
  435 |     let list: Room[] = [];
  436 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  437 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  438 |     await journey.step('Then each room card\'s image has the alternative text "<Type> Room" for that card\'s type', async () => {
  439 |       for (const room of list) {
> 440 |         await expect.soft(ui(page).roomCard(room.type).first().getByRole('img').first(), `[REQ AC-14] ${room.type} card image alt text`).toHaveAccessibleName(REQ.ALT_TEXT(room.type));
      |                                                                                                                                          ^ Error: [REQ AC-14] Suite card image alt text
  441 |       }
  442 |     });
  443 |   });
  444 | 
  445 |   test('SCN-020: The rooms list responds quickly', { tag: ['@AC-15', '@type:performance', '@layer:api', '@P3', '@performance'] }, async ({ api, journey }) => {
  446 |     const durations: number[] = [];
  447 |     await journey.step('When I GET /api/room 5 times in a row', async () => {
  448 |       for (let i = 0; i < REQ.PERF.REQUESTS; i++) durations.push((await api.get(EP.rooms)).durationMs);
  449 |     });
  450 |     await journey.step('Then every response arrives in under 3000 ms', async () => {
  451 |       expect(Math.max(...durations), `[REQ AC-15] slowest of ${REQ.PERF.REQUESTS} GET /api/room < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS);
  452 |     });
  453 |   });
  454 | 
  455 |   // ---------------- Reliability (rev 2) ----------------
  456 |   test('SCN-021: A retried enquiry with the same Idempotency-Key is stored only once', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  457 |     let token = '';
  458 |     const enquiry = validEnquiry(data);
  459 |     trackEnquiry(seed, api, data, enquiry.subject);
  460 |     const idempotencyKey = unique('qa-idem').replace(/\s+/g, '-');
  461 |     const statuses: number[] = [];
  462 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  463 |     await journey.step('And a valid enquiry with a unique subject and a unique Idempotency-Key', async () => { /* built above */ });
  464 |     await journey.step('When I POST that enquiry to /api/message twice with the same Idempotency-Key', async () => {
  465 |       for (let i = 0; i < REQ.IDEMPOTENCY.REPEATS; i++) {
  466 |         statuses.push((await api.post(EP.message, { data: enquiry, headers: { [REQ.IDEMPOTENCY.HEADER]: idempotencyKey } })).status);
  467 |       }
  468 |     });
  469 |     await journey.step('Then both responses are 2xx', async () => {
  470 |       expect.soft(statuses.every((s) => s >= 200 && s < 300) ? 'all 2xx' : `statuses ${statuses.join(', ')}`, '[REQ AC-16] every repeat answers 2xx').toBe('all 2xx');
  471 |     });
  472 |     await journey.step('And the authenticated message list contains that subject exactly once', async () => {
  473 |       const stored = (await staffMessages(api, token)).filter((m) => m.subject === enquiry.subject).length;
  474 |       expect.soft(stored, '[REQ AC-16] retried enquiry stored only once').toBe(REQ.IDEMPOTENCY.EXPECTED_STORED);
  475 |     });
  476 |   });
  477 | 
  478 |   test('SCN-022: Repeating GET /api/room/{id} returns an identical body', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P3'] }, async ({ api, journey }) => {
  479 |     let room!: Room;
  480 |     const responses: { status: number; body: unknown }[] = [];
  481 |     await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
  482 |     await journey.step('When I GET /api/room/{id} three times', async () => {
  483 |       for (let i = 0; i < REQ.IDEMPOTENCY.GET_REPEATS; i++) {
  484 |         const r = await api.get(EP.roomById(room.roomid));
  485 |         responses.push({ status: r.status, body: r.body });
  486 |       }
  487 |     });
  488 |     await journey.step('Then all three responses are 200 with identical bodies', async () => {
  489 |       expect.soft(responses.map((r) => r.status), '[REQ AC-16] repeated GET all 200').toEqual(Array(REQ.IDEMPOTENCY.GET_REPEATS).fill(REQ.STATUS.OK));
  490 |       expect.soft(responses.map((r) => r.body), '[REQ AC-16] repeated GET returns identical bodies').toEqual(Array(REQ.IDEMPOTENCY.GET_REPEATS).fill(responses[0].body));
  491 |     });
  492 |   });
  493 | });
  494 | 
```