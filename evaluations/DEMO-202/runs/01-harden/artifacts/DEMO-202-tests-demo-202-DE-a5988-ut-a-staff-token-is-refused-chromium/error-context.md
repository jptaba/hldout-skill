# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-010: Reading an enquiry without a staff token is refused
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:272:3

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
  186 |       const enquiry = validEnquiry(data, { [key]: ofLength(row.field, row.length) });
  187 |       await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  188 |       await journey.step(`When I submit the contact form with a valid enquiry whose ${row.field} is ${row.length} characters long`, async () => {
  189 |         await fillContactForm(page, enquiry);
  190 |       });
  191 |       await journey.step(`Then the form shows the error "${row.message}"`, async () => {
  192 |         await expect(ui(page).errors, `[REQ AC-4] UI shows the ${row.field} length error`).toContainText(row.message);
  193 |       });
  194 |     });
  195 |   });
  196 | 
  197 |   // ---------------- Messages API ----------------
  198 |   test('SCN-005: Creating a valid enquiry returns 201 Created', { tag: ['@AC-5', '@P1', '@api'] }, async ({ api, journey, data }) => {
  199 |     let res!: Awaited<ReturnType<Api['post']>>;
  200 |     await journey.step('When I POST a valid enquiry to /api/message', async () => {
  201 |       res = await api.post(EP.message, { data: validEnquiry(data) });
  202 |     });
  203 |     await journey.step('Then the response status is 201', async () => {
  204 |       expect.soft(res.status, '[REQ AC-5] create enquiry → 201 Created').toBe(REQ.STATUS.CREATED);
  205 |     });
  206 |     await journey.step('And the response body is {"success": true}', async () => {
  207 |       expect.soft(res.body, '[REQ AC-5] create enquiry body').toEqual(REQ.CREATE_BODY);
  208 |     });
  209 |   });
  210 | 
  211 |   REQ.API_BOUNDARIES.forEach((row, i) => {
  212 |     const label = typeof row.value === 'number' ? `${row.value} characters` : `"${row.value}"`;
  213 |     test(`SCN-006.${i + 1}: The API enforces field boundaries (${row.field} ${label} → ${row.outcome})`, { tag: ['@AC-4', '@AC-6', '@P1', '@api', '@boundary'] }, async ({ api, journey, data }) => {
  214 |       const value = typeof row.value === 'number' ? ofLength(row.field, row.value) : row.value;
  215 |       let res!: Awaited<ReturnType<Api['post']>>;
  216 |       await journey.step(`When I POST a valid enquiry to /api/message whose ${row.field} is ${label}`, async () => {
  217 |         res = await api.post(EP.message, { data: validEnquiry(data, { [apiFieldName(row.field)]: value }) });
  218 |       });
  219 |       await journey.step(`Then the enquiry is ${row.outcome}`, async () => {
  220 |         if (row.outcome === 'accepted') {
  221 |           const outcome = res.status >= 200 && res.status < 300 ? 'accepted' : `rejected (${res.status}: ${res.text.slice(0, 160)})`;
  222 |           expect(outcome, `[REQ AC-4] ${row.field} ${label} is accepted`).toBe('accepted');
  223 |         } else {
  224 |           expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  225 |         }
  226 |       });
  227 |       const expectedMessage = row.outcome === 'rejected' ? REQ.LENGTH_MESSAGE[row.field as keyof typeof REQ.LENGTH_MESSAGE] : undefined;
  228 |       if (expectedMessage) {
  229 |         await journey.step(`And when rejected, the error list contains "${expectedMessage}"`, async () => {
  230 |           expect(res.body, `[REQ AC-6] error list contains the ${row.field} length message`).toContain(expectedMessage);
  231 |         });
  232 |       }
  233 |     });
  234 |   });
  235 | 
  236 |   test('SCN-007: A rejected enquiry is not stored', { tag: ['@AC-6', '@P2', '@api'] }, async ({ api, journey, data }) => {
  237 |     let token = '';
  238 |     const enquiry = validEnquiry(data, { phone: '123' });
  239 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  240 |     await journey.step('When I POST an enquiry with a unique subject and a too-short phone to /api/message', async () => {
  241 |       const res = await api.post(EP.message, { data: enquiry });
  242 |       expect(res.status, '[REQ AC-6] invalid enquiry → 400').toBe(REQ.STATUS.BAD_REQUEST);
  243 |     });
  244 |     await journey.step('Then the response status is 400', async () => { /* asserted with the request above */ });
  245 |     await journey.step('And the authenticated message list does not contain that subject', async () => {
  246 |       const subjects = (await staffMessages(api, token)).map((m) => m.subject);
  247 |       expect(subjects, '[REQ AC-6] rejected enquiry is not stored').not.toContain(enquiry.subject);
  248 |     });
  249 |   });
  250 | 
  251 |   test('SCN-008: A malformed JSON body is a client error', { tag: ['@AC-7', '@P2', '@api'] }, async ({ api, journey }) => {
  252 |     let status = 0;
  253 |     await journey.step('When I POST a body that is not valid JSON to /api/message', async () => {
  254 |       status = (await api.post(EP.message, { data: '{"name": "QA malformed", "email": ' })).status;
  255 |     });
  256 |     await journey.step('Then the response status is 400', async () => {
  257 |       expect(status, '[REQ AC-7] malformed JSON → 400 (never 5xx)').toBe(REQ.STATUS.BAD_REQUEST);
  258 |     });
  259 |   });
  260 | 
  261 |   test('SCN-009: Listing enquiries without a staff token is refused', { tag: ['@AC-8', '@P1', '@api', '@security'] }, async ({ api, journey }) => {
  262 |     let res!: Awaited<ReturnType<Api['get']>>;
  263 |     await journey.step('When I GET /api/message without a token', async () => { res = await api.get(EP.message); });
  264 |     await journey.step('Then the response status is 401', async () => {
  265 |       expect.soft(res.status, '[REQ AC-8] message list without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  266 |     });
  267 |     await journey.step('And the response contains no message data', async () => {
  268 |       expect.soft(res.text, '[REQ AC-8] no message data without token').not.toContain('"messages"');
  269 |     });
  270 |   });
  271 | 
  272 |   test('SCN-010: Reading an enquiry without a staff token is refused', { tag: ['@AC-8', '@P1', '@api', '@security'] }, async ({ api, journey, data }) => {
  273 |     let id = 0;
  274 |     let res!: Awaited<ReturnType<Api['get']>>;
  275 |     await journey.step('Given I am authenticated as staff and know the id of an existing enquiry', async () => {
  276 |       const list = await staffMessages(api, await staffToken(api, data));
  277 |       expect(list.length, 'at least one enquiry exists (precondition)').toBeGreaterThan(0);
  278 |       id = list[0].id;
  279 |     });
  280 |     await journey.step('When I GET /api/message/{id} without a token', async () => { res = await api.get(EP.messageById(id)); });
  281 |     await journey.step('Then the response status is 401', async () => {
  282 |       expect.soft(res.status, '[REQ AC-8] message detail without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  283 |     });
  284 |     await journey.step('And the response contains no personal data', async () => {
  285 |       const leaked = REQ.PERSONAL_DATA_KEYS.filter((k) => res.text.includes(`"${k}"`));
> 286 |       expect.soft(leaked, '[REQ AC-8] no personal data without token').toEqual([]);
      |                                                                        ^ Error: [REQ AC-8] no personal data without token
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
  385 |       expect(status, '[REQ AC-12] unknown room → 404').toBe(REQ.STATUS.NOT_FOUND);
  386 |     });
```