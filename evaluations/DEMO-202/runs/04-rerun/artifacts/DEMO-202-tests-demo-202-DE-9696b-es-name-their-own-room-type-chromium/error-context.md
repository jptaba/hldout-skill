# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-019: Room card images name their own room type
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:408:3

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
  314 |       expect(res.status, '[REQ AC-9] valid login → 200').toBe(REQ.STATUS.OK);
  315 |     });
  316 |     await journey.step('And the body contains a non-empty "token"', async () => {
  317 |       expect(checkShape(res.body, { token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string' }), '[REQ AC-9] login returns a non-empty token').toEqual([]);
  318 |     });
  319 |   });
  320 | 
  321 |   test('SCN-013: Invalid staff credentials are refused', { tag: ['@AC-9', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
  322 |     let res!: Awaited<ReturnType<Api['post']>>;
  323 |     await journey.step('When I POST the staff username with a wrong password to /api/auth/login', async () => {
  324 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.wrongPassword } });
  325 |     });
  326 |     await journey.step('Then the response status is 401', async () => {
  327 |       expect.soft(res.status, '[REQ AC-9] invalid login → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  328 |     });
  329 |     await journey.step('And the body is {"error": "Invalid credentials"}', async () => {
  330 |       expect.soft(res.body, '[REQ AC-9] invalid login body').toEqual(REQ.LOGIN_INVALID_BODY);
  331 |     });
  332 |   });
  333 | 
  334 |   // ---------------- Cross-layer ----------------
  335 |   test('SCN-014: An enquiry sent from the UI is readable by staff through the API', { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data }) => {
  336 |     const enquiry = validEnquiry(data);
  337 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  338 |     await journey.step('When I submit the contact form with a unique name and a unique subject', async () => {
  339 |       await fillContactForm(page, enquiry);
  340 |     });
  341 |     await journey.step('And I see the confirmation', async () => {
  342 |       await expect(ui(page).confirmation).toBeVisible();
  343 |     });
  344 |     await journey.step('Then the authenticated message list contains an enquiry with that name and subject', async () => {
  345 |       const token = await staffToken(api, data);
  346 |       await expect.poll(async () => (await staffMessages(api, token)).some((m) => m.name === enquiry.name && m.subject === enquiry.subject),
  347 |         { message: '[REQ AC-10] UI enquiry readable by staff via API', timeout: 10_000 }).toBe(true);
  348 |     });
  349 |   });
  350 | 
  351 |   // ---------------- Rooms catalogue ----------------
  352 |   test('SCN-015: The rooms list follows the Room schema', { tag: ['@AC-11', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  353 |     let res!: Awaited<ReturnType<Api['get']>>;
  354 |     await journey.step('When I GET /api/room', async () => { res = await api.get(EP.rooms); });
  355 |     await journey.step('Then the response status is 200', async () => {
  356 |       expect(res.status, '[REQ AC-11] room list → 200').toBe(REQ.STATUS.OK);
  357 |     });
  358 |     await journey.step('And every room matches the Room schema', async () => {
  359 |       const list = (res.body as { rooms?: unknown[] }).rooms;
  360 |       expect(Array.isArray(list) && list.length > 0, '[REQ AC-11] body has a non-empty "rooms" array').toBe(true);
  361 |       const violations = (list ?? []).flatMap((r, i) => checkShape(r, ROOM_SCHEMA, `rooms[${i}]`));
  362 |       expect(violations, '[REQ AC-11] every room matches the Room schema').toEqual([]);
  363 |     });
  364 |   });
  365 | 
  366 |   test('SCN-016: An existing room can be fetched by id', { tag: ['@AC-12', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  367 |     let room!: Room;
  368 |     let res!: Awaited<ReturnType<Api['get']>>;
  369 |     await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
  370 |     await journey.step('When I GET /api/room/{id}', async () => { res = await api.get(EP.roomById(room.roomid)); });
  371 |     await journey.step('Then the response status is 200', async () => {
  372 |       expect(res.status, '[REQ AC-12] existing room → 200').toBe(REQ.STATUS.OK);
  373 |     });
  374 |     await journey.step('And the body is that room and matches the Room schema', async () => {
  375 |       expect.soft((res.body as Room).roomid, '[REQ AC-12] detail is the requested room').toBe(room.roomid);
  376 |       expect.soft(checkShape(res.body, ROOM_SCHEMA, 'room'), '[REQ AC-12] detail matches the Room schema').toEqual([]);
  377 |     });
  378 |   });
  379 | 
  380 |   test('SCN-017: An unknown room id returns 404', { tag: ['@AC-12', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  381 |     let unknownId = 0;
  382 |     let status = 0;
  383 |     await journey.step('Given I know an id that no room has', async () => {
  384 |       unknownId = Math.max(...(await rooms(api)).map((r) => r.roomid)) + 100000;
  385 |     });
  386 |     await journey.step('When I GET /api/room/{id}', async () => { status = (await api.get(EP.roomById(unknownId))).status; });
  387 |     await journey.step('Then the response status is 404', async () => {
  388 |       expect(status, '[REQ AC-12] unknown room → 404').toBe(REQ.STATUS.NOT_FOUND);
  389 |     });
  390 |   });
  391 | 
  392 |   test('SCN-018: Every API room is shown with its type and nightly price', { tag: ['@AC-13', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey }) => {
  393 |     let list: Room[] = [];
  394 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  395 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  396 |     await journey.step("Then each room's type is shown on a room card", async () => {
  397 |       for (const room of list) {
  398 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] a card shows room type ${room.type}`).toBeVisible();
  399 |       }
  400 |     });
  401 |     await journey.step('And that card shows "£<roomPrice> per night"', async () => {
  402 |       for (const room of list) {
  403 |         await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] ${room.type} card shows its nightly price`).toContainText(REQ.PRICE_TEXT(room.roomPrice));
  404 |       }
  405 |     });
  406 |   });
  407 | 
  408 |   test("SCN-019: Room card images name their own room type", { tag: ['@AC-14', '@type:accessibility', '@layer:e2e', '@P2'] }, async ({ page, api, journey }) => {
  409 |     let list: Room[] = [];
  410 |     await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
  411 |     await journey.step('When I open the home page', async () => { await page.goto('/'); });
  412 |     await journey.step('Then each room card\'s image has the alternative text "<Type> Room" for that card\'s type', async () => {
  413 |       for (const room of list) {
> 414 |         await expect.soft(ui(page).roomCard(room.type).first().getByRole('img').first(), `[REQ AC-14] ${room.type} card image alt text`).toHaveAccessibleName(REQ.ALT_TEXT(room.type));
      |                                                                                                                                          ^ Error: [REQ AC-14] Suite card image alt text
  415 |       }
  416 |     });
  417 |   });
  418 | 
  419 |   test('SCN-020: The rooms list responds quickly', { tag: ['@AC-15', '@type:performance', '@layer:api', '@P3', '@performance'] }, async ({ api, journey }) => {
  420 |     const durations: number[] = [];
  421 |     await journey.step('When I GET /api/room 5 times in a row', async () => {
  422 |       for (let i = 0; i < REQ.PERF.REQUESTS; i++) durations.push((await api.get(EP.rooms)).durationMs);
  423 |     });
  424 |     await journey.step('Then every response arrives in under 3000 ms', async () => {
  425 |       expect(Math.max(...durations), `[REQ AC-15] slowest of ${REQ.PERF.REQUESTS} GET /api/room < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS);
  426 |     });
  427 |   });
  428 | 
  429 |   // ---------------- Reliability (rev 2) ----------------
  430 |   test('SCN-021: A retried enquiry with the same Idempotency-Key is stored only once', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  431 |     let token = '';
  432 |     const enquiry = validEnquiry(data);
  433 |     const idempotencyKey = unique('qa-idem').replace(/\s+/g, '-');
  434 |     const statuses: number[] = [];
  435 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  436 |     await journey.step('And a valid enquiry with a unique subject and a unique Idempotency-Key', async () => { /* built above */ });
  437 |     await journey.step('When I POST that enquiry to /api/message twice with the same Idempotency-Key', async () => {
  438 |       for (let i = 0; i < REQ.IDEMPOTENCY.REPEATS; i++) {
  439 |         statuses.push((await api.post(EP.message, { data: enquiry, headers: { [REQ.IDEMPOTENCY.HEADER]: idempotencyKey } })).status);
  440 |       }
  441 |     });
  442 |     await journey.step('Then both responses are 2xx', async () => {
  443 |       expect.soft(statuses.every((s) => s >= 200 && s < 300) ? 'all 2xx' : `statuses ${statuses.join(', ')}`, '[REQ AC-16] every repeat answers 2xx').toBe('all 2xx');
  444 |     });
  445 |     await journey.step('And the authenticated message list contains that subject exactly once', async () => {
  446 |       const stored = (await staffMessages(api, token)).filter((m) => m.subject === enquiry.subject).length;
  447 |       expect.soft(stored, '[REQ AC-16] retried enquiry stored only once').toBe(REQ.IDEMPOTENCY.EXPECTED_STORED);
  448 |     });
  449 |   });
  450 | 
  451 |   test('SCN-022: Repeating GET /api/room/{id} returns an identical body', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P3'] }, async ({ api, journey }) => {
  452 |     let room!: Room;
  453 |     const responses: { status: number; body: unknown }[] = [];
  454 |     await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
  455 |     await journey.step('When I GET /api/room/{id} three times', async () => {
  456 |       for (let i = 0; i < REQ.IDEMPOTENCY.GET_REPEATS; i++) {
  457 |         const r = await api.get(EP.roomById(room.roomid));
  458 |         responses.push({ status: r.status, body: r.body });
  459 |       }
  460 |     });
  461 |     await journey.step('Then all three responses are 200 with identical bodies', async () => {
  462 |       expect.soft(responses.map((r) => r.status), '[REQ AC-16] repeated GET all 200').toEqual(Array(REQ.IDEMPOTENCY.GET_REPEATS).fill(REQ.STATUS.OK));
  463 |       expect.soft(responses.map((r) => r.body), '[REQ AC-16] repeated GET returns identical bodies').toEqual(Array(REQ.IDEMPOTENCY.GET_REPEATS).fill(responses[0].body));
  464 |     });
  465 |   });
  466 | });
  467 | 
```