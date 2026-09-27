# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-009: Listing enquiries without a staff token is refused
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:263:3

# Error details

```
Error: [REQ AC-8] message list without token → 401

expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 200
```

```
Error: [REQ AC-8] no message data without token

expect(received).not.toContain(expected) // indexOf

Expected substring: not "\"messages\""
Received string:        "{\"messages\":[{\"id\":1,\"name\":\"James Dean\",\"read\":false,\"subject\":\"Booking enquiry\"},{\"id\":2,\"name\":\"QA Probe\",\"read\":false,\"subject\":\"QA probe subject\"},{\"id\":3,\"name\":\"QA probe\",\"read\":false,\"subject\":\"QA probe subject\"},{\"id\":4,\"name\":\"QA Guest ij2v6b6g-1\",\"read\":false,\"subject\":\"QA Subject ij2v6b78-2\"},{\"id\":5,\"name\":\"QA Guest ij2zovny-5\",\"read\":false,\"subject\":\"QA Subject ij2zovzp-6\"},{\"id\":6,\"name\":\"qq\",\"read\":false,\"subject\":\"QA Subject ij30xqya-6\"},{\"id\":7,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ij31hzu9-8\"},{\"id\":8,\"name\":\"q\",\"read\":false,\"subject\":\"QA Subject ij31inza-2\"},{\"id\":9,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ij31u420-2\"},{\"id\":10,\"name\":\"QA Guest ij32am21-3\",\"read\":false,\"subject\":\"QA Subject ij32amyp-4\"},{\"id\":11,\"name\":\"QA Guest ij331zwi-1\",\"read\":false,\"subject\":\"QA Subject ij331z0t-2\"},{\"id\":12,\"name\":\"QA Guest ij33l52w-3\",\"read\":false,\"subject\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\"},{\"id\":13,\"name\":\"QA Guest ij33k9cy-9\",\"read\":false,\"subject\":\"qqqqq\"},{\"id\":14,\"name\":\"QA Guest ij342z4l-5\",\"read\":false,\"subject\":\"QA Subject ij342z13-6\"},{\"id\":15,\"name\":\"QA Guest ij344xlg-11\",\"read\":false,\"subject\":\"QA Subject ij344xqk-12\"},{\"id\":16,\"name\":\"QA Guest ij34loyg-13\",\"read\":false,\"subject\":\"QA Subject ij34loz4-14\"},{\"id\":17,\"name\":\"QA Guest ij34kk8e-7\",\"read\":false,\"subject\":\"QA Subject ij34kkwg-8\"},{\"id\":18,\"name\":\"QA Guest ij37oo0q-1\",\"read\":false,\"subject\":\"QA Subject ij37ooi5-2\"},{\"id\":19,\"name\":\"ttt ttt\",\"read\":false,\"subject\":\"You have a new booking!\"},{\"id\":20,\"name\":\"QA Guest ij7m9rdo-1\",\"read\":false,\"subject\":\"QA Subject ij7m9r88-2\"},{\"id\":21,\"name\":\"QA Guest ij7oye2s-3\",\"read\":false,\"subject\":\"QA Subject ij7oyeqc-4\"},{\"id\":22,\"name\":\"q\",\"read\":false,\"subject\":\"QA Subject ij7qai8o-4\"},{\"id\":23,\"name\":\"QA Guest ij7qu4tq-1\",\"read\":false,\"subject\":\"QA Subject ij7qu4dv-2\"},{\"id\":24,\"name\":\"qq\",\"read\":false,\"subject\":\"QA Subject ij7ram1s-6\"},{\"id\":25,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ij7rqicd-8\"},{\"id\":26,\"name\":\"q\",\"read\":false,\"subject\":\"QA Subject ij7sat76-2\"},{\"id\":27,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ij7sinbq-2\"},{\"id\":28,\"name\":\"QA Guest ij7sz9qa-3\",\"read\":false,\"subject\":\"QA Subject ij7sz99p-4\"},{\"id\":29,\"name\":\"QA Guest ij7tea92-5\",\"read\":false,\"subject\":\"QA Subject ij7tea43-6\"},{\"id\":30,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ij7tkkrr-2\"},{\"id\":31,\"name\":\"QA Guest ij7udc4b-3\",\"read\":false,\"subject\":\"qqqqq\"},{\"id\":32,\"name\":\"QA Guest ij7v3h97-13\",\"read\":false,\"subject\":\"QA Subject ij7v3hxj-14\"},{\"id\":33,\"name\":\"QA Guest ij7v9dx1-7\",\"read\":false,\"subject\":\"QA Subject ij7v9dnj-8\"},{\"id\":34,\"name\":\"QA Guest ij7ve7d1-1\",\"read\":false,\"subject\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\"},{\"id\":35,\"name\":\"QA Guest ij7vorb3-9\",\"read\":false,\"subject\":\"QA Subject ij7vorbi-10\"},{\"id\":36,\"name\":\"QA Guest ij7vvxd1-17\",\"read\":false,\"subject\":\"QA Subject ij7vvxfg-18\"}]}"
```

# Test source

```ts
  170 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  171 |     await journey.step('When I submit the contact form with every field empty', async () => {
  172 |       await ui(page).submit.click();
  173 |     });
  174 |     await journey.step('Then the contact form is still shown', async () => {
  175 |       await expect(ui(page).submit, '[REQ AC-3] form still shown after empty submit').toBeVisible();
  176 |     });
  177 |     await journey.step('And the validation errors mention Name, Email, Phone, Subject and Message', async () => {
  178 |       await expect(ui(page).errors).toBeVisible();
  179 |       for (const field of REQ.FIELDS) {
  180 |         await expect.soft(ui(page).errors, `[REQ AC-3] validation errors mention ${field}`).toContainText(new RegExp(field, 'i'));
  181 |       }
  182 |     });
  183 |   });
  184 | 
  185 |   REQ.UI_BOUNDARIES.forEach((row, i) => {
  186 |     test(`SCN-004.${i + 1}: The UI rejects a value one character outside a boundary (${row.field} ${row.length})`, { tag: ['@AC-4', '@P2', '@ui', '@boundary'] }, async ({ page, journey, data }) => {
  187 |       const key = row.field === 'Message' ? 'description' : (row.field.toLowerCase() as keyof Enquiry);
  188 |       const enquiry = validEnquiry(data, { [key]: ofLength(row.field, row.length) });
  189 |       await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  190 |       await journey.step(`When I submit the contact form with a valid enquiry whose ${row.field} is ${row.length} characters long`, async () => {
  191 |         await fillContactForm(page, enquiry);
  192 |       });
  193 |       await journey.step(`Then the form shows the error "${row.message}"`, async () => {
  194 |         await expect(ui(page).errors, `[REQ AC-4] UI shows the ${row.field} length error`).toContainText(row.message);
  195 |       });
  196 |     });
  197 |   });
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
> 270 |       expect.soft(res.text, '[REQ AC-8] no message data without token').not.toContain('"messages"');
      |                                                                             ^ Error: [REQ AC-8] no message data without token
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
```