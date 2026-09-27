# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-009: Listing enquiries without a staff token is refused
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:264:3

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
Received string:        "{\"messages\":[{\"id\":1,\"name\":\"James Dean\",\"read\":false,\"subject\":\"Booking enquiry\"},{\"id\":2,\"name\":\"ttt ttt\",\"read\":false,\"subject\":\"You have a new booking!\"},{\"id\":3,\"name\":\"QA Guest ijjvtm33-1\",\"read\":false,\"subject\":\"QA Subject ijjvtmxc-2\"},{\"id\":4,\"name\":\"QA Guest ijk109sz-3\",\"read\":false,\"subject\":\"QA Subject ijk109c2-4\"},{\"id\":5,\"name\":\"q\",\"read\":false,\"subject\":\"QA Subject ijk22yyz-4\"},{\"id\":6,\"name\":\"qq\",\"read\":false,\"subject\":\"QA Subject ijk2roqb-6\"},{\"id\":7,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ijk3azl5-8\"},{\"id\":8,\"name\":\"QA Guest ijk39kji-1\",\"read\":false,\"subject\":\"QA Subject ijk39knf-2\"},{\"id\":9,\"name\":\"q\",\"read\":false,\"subject\":\"QA Subject ijk3mjyi-2\"},{\"id\":10,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ijk3n4o3-10\"},{\"id\":11,\"name\":\"QA Guest ijk5emgv-1\",\"read\":false,\"subject\":\"QA Subject ijk5enzp-2\"},{\"id\":12,\"name\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\",\"read\":false,\"subject\":\"QA Subject ijk5el45-2\"},{\"id\":13,\"name\":\"QA Guest ijk5invw-3\",\"read\":false,\"subject\":\"QA Subject ijk5in1p-4\"},{\"id\":14,\"name\":\"QA Guest ijk6mt2w-5\",\"read\":false,\"subject\":\"qqqqq\"},{\"id\":15,\"name\":\"QA Guest ijk77017-9\",\"read\":false,\"subject\":\"QA Subject ijk770l0-10\"},{\"id\":16,\"name\":\"QA Guest ijk7d5es-1\",\"read\":false,\"subject\":\"qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq\"},{\"id\":17,\"name\":\"QA Guest ijk7gfak-9\",\"read\":false,\"subject\":\"QA Subject ijk7gf0i-10\"},{\"id\":18,\"name\":\"QA Guest ijk7w6lf-11\",\"read\":false,\"subject\":\"QA Subject ijk7w6dn-12\"},{\"id\":19,\"name\":\"QA Guest ijk7ydol-3\",\"read\":false,\"subject\":\"QA Subject ijk7ydb9-4\"},{\"id\":20,\"name\":\"QA Guest ijk9l0ug-1\",\"read\":false,\"subject\":\"QA Subject ijk9l07k-2\"}]}"
```

# Test source

```ts
  171 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  172 |     await journey.step('When I submit the contact form with every field empty', async () => {
  173 |       await ui(page).submit.click();
  174 |     });
  175 |     await journey.step('Then the contact form is still shown', async () => {
  176 |       await expect(ui(page).submit, '[REQ AC-3] form still shown after empty submit').toBeVisible();
  177 |     });
  178 |     await journey.step('And the validation errors mention Name, Email, Phone, Subject and Message', async () => {
  179 |       await expect(ui(page).errors).toBeVisible();
  180 |       for (const field of REQ.FIELDS) {
  181 |         await expect.soft(ui(page).errors, `[REQ AC-3] validation errors mention ${field}`).toContainText(new RegExp(field, 'i'));
  182 |       }
  183 |     });
  184 |   });
  185 | 
  186 |   REQ.UI_BOUNDARIES.forEach((row, i) => {
  187 |     test(`SCN-004.${i + 1}: The UI rejects a value one character outside a boundary (${row.field} ${row.length})`, { tag: ['@AC-4', '@type:boundary', '@layer:ui', '@P2', '@boundary'] }, async ({ page, journey, data }) => {
  188 |       const key = row.field === 'Message' ? 'description' : (row.field.toLowerCase() as keyof Enquiry);
  189 |       const enquiry = validEnquiry(data, { [key]: ofLength(row.field, row.length) });
  190 |       await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  191 |       await journey.step(`When I submit the contact form with a valid enquiry whose ${row.field} is ${row.length} characters long`, async () => {
  192 |         await fillContactForm(page, enquiry);
  193 |       });
  194 |       await journey.step(`Then the form shows the error "${row.message}"`, async () => {
  195 |         await expect(ui(page).errors, `[REQ AC-4] UI shows the ${row.field} length error`).toContainText(row.message);
  196 |       });
  197 |     });
  198 |   });
  199 | 
  200 |   // ---------------- Messages API ----------------
  201 |   test('SCN-005: Creating a valid enquiry returns 201 Created', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  202 |     let res!: Awaited<ReturnType<Api['post']>>;
  203 |     await journey.step('When I POST a valid enquiry to /api/message', async () => {
  204 |       res = await api.post(EP.message, { data: validEnquiry(data) });
  205 |     });
  206 |     await journey.step('Then the response status is 201', async () => {
  207 |       expect.soft(res.status, '[REQ AC-5] create enquiry → 201 Created').toBe(REQ.STATUS.CREATED);
  208 |     });
  209 |     await journey.step('And the response body is {"success": true}', async () => {
  210 |       expect.soft(res.body, '[REQ AC-5] create enquiry body').toEqual(REQ.CREATE_BODY);
  211 |     });
  212 |   });
  213 | 
  214 |   REQ.API_BOUNDARIES.forEach((row, i) => {
  215 |     const label = typeof row.value === 'number' ? `${row.value} characters` : `"${row.value}"`;
  216 |     test(`SCN-006.${i + 1}: The API enforces field boundaries (${row.field} ${label} → ${row.outcome})`, { tag: ['@AC-4', '@AC-6', '@type:boundary', '@layer:api', '@P1', '@boundary'] }, async ({ api, journey, data }) => {
  217 |       const value = typeof row.value === 'number' ? ofLength(row.field, row.value) : row.value;
  218 |       let res!: Awaited<ReturnType<Api['post']>>;
  219 |       await journey.step(`When I POST a valid enquiry to /api/message whose ${row.field} is ${label}`, async () => {
  220 |         res = await api.post(EP.message, { data: validEnquiry(data, { [apiFieldName(row.field)]: value }) });
  221 |       });
  222 |       await journey.step(`Then the enquiry is ${row.outcome}`, async () => {
  223 |         if (row.outcome === 'accepted') {
  224 |           const outcome = res.status >= 200 && res.status < 300 ? 'accepted' : `rejected (${res.status}: ${res.text.slice(0, 160)})`;
  225 |           expect(outcome, `[REQ AC-4] ${row.field} ${label} is accepted`).toBe('accepted');
  226 |         } else {
  227 |           expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  228 |         }
  229 |       });
  230 |       const expectedMessage = row.outcome === 'rejected' ? REQ.LENGTH_MESSAGE[row.field as keyof typeof REQ.LENGTH_MESSAGE] : undefined;
  231 |       if (expectedMessage) {
  232 |         await journey.step(`And when rejected, the error list contains "${expectedMessage}"`, async () => {
  233 |           expect(res.body, `[REQ AC-6] error list contains the ${row.field} length message`).toContain(expectedMessage);
  234 |         });
  235 |       }
  236 |     });
  237 |   });
  238 | 
  239 |   test('SCN-007: A rejected enquiry is not stored', { tag: ['@AC-6', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
  240 |     let token = '';
  241 |     const enquiry = validEnquiry(data, { phone: '123' });
  242 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  243 |     await journey.step('When I POST an enquiry with a unique subject and a too-short phone to /api/message', async () => {
  244 |       const res = await api.post(EP.message, { data: enquiry });
  245 |       expect(res.status, '[REQ AC-6] invalid enquiry → 400').toBe(REQ.STATUS.BAD_REQUEST);
  246 |     });
  247 |     await journey.step('Then the response status is 400', async () => { /* asserted with the request above */ });
  248 |     await journey.step('And the authenticated message list does not contain that subject', async () => {
  249 |       const subjects = (await staffMessages(api, token)).map((m) => m.subject);
  250 |       expect(subjects, '[REQ AC-6] rejected enquiry is not stored').not.toContain(enquiry.subject);
  251 |     });
  252 |   });
  253 | 
  254 |   test('SCN-008: A malformed JSON body is a client error', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  255 |     let status = 0;
  256 |     await journey.step('When I POST a body that is not valid JSON to /api/message', async () => {
  257 |       status = (await api.post(EP.message, { data: '{"name": "QA malformed", "email": ' })).status;
  258 |     });
  259 |     await journey.step('Then the response status is 400', async () => {
  260 |       expect(status, '[REQ AC-7] malformed JSON → 400 (never 5xx)').toBe(REQ.STATUS.BAD_REQUEST);
  261 |     });
  262 |   });
  263 | 
  264 |   test('SCN-009: Listing enquiries without a staff token is refused', { tag: ['@AC-8', '@type:security', '@layer:api', '@P1', '@security'] }, async ({ api, journey }) => {
  265 |     let res!: Awaited<ReturnType<Api['get']>>;
  266 |     await journey.step('When I GET /api/message without a token', async () => { res = await api.get(EP.message); });
  267 |     await journey.step('Then the response status is 401', async () => {
  268 |       expect.soft(res.status, '[REQ AC-8] message list without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  269 |     });
  270 |     await journey.step('And the response contains no message data', async () => {
> 271 |       expect.soft(res.text, '[REQ AC-8] no message data without token').not.toContain('"messages"');
      |                                                                             ^ Error: [REQ AC-8] no message data without token
  272 |     });
  273 |   });
  274 | 
  275 |   test('SCN-010: Reading an enquiry without a staff token is refused', { tag: ['@AC-8', '@type:security', '@layer:api', '@P1', '@security'] }, async ({ api, journey, data }) => {
  276 |     let id = 0;
  277 |     let res!: Awaited<ReturnType<Api['get']>>;
  278 |     await journey.step('Given I am authenticated as staff and know the id of an existing enquiry', async () => {
  279 |       const list = await staffMessages(api, await staffToken(api, data));
  280 |       expect(list.length, 'at least one enquiry exists (precondition)').toBeGreaterThan(0);
  281 |       id = list[0].id;
  282 |     });
  283 |     await journey.step('When I GET /api/message/{id} without a token', async () => { res = await api.get(EP.messageById(id)); });
  284 |     await journey.step('Then the response status is 401', async () => {
  285 |       expect.soft(res.status, '[REQ AC-8] message detail without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
  286 |     });
  287 |     await journey.step('And the response contains no personal data', async () => {
  288 |       const leaked = REQ.PERSONAL_DATA_KEYS.filter((k) => res.text.includes(`"${k}"`));
  289 |       expect.soft(leaked, '[REQ AC-8] no personal data without token').toEqual([]);
  290 |     });
  291 |   });
  292 | 
  293 |   test('SCN-011: Staff can list enquiries with a valid token', { tag: ['@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  294 |     let token = '';
  295 |     let res!: Awaited<ReturnType<Api['get']>>;
  296 |     await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
  297 |     await journey.step('When I GET /api/message with the token cookie', async () => { res = await api.get(EP.message, { cookies: { token } }); });
  298 |     await journey.step('Then the response status is 200', async () => {
  299 |       expect(res.status, '[REQ AC-8] message list with token → 200').toBe(REQ.STATUS.OK);
  300 |     });
  301 |     await journey.step('And every message has id, name, subject and read', async () => {
  302 |       const messages = (res.body as { messages?: unknown[] }).messages ?? [];
  303 |       const violations = messages.flatMap((m, i) => checkShape(m, MESSAGE_SUMMARY_SCHEMA, `messages[${i}]`));
  304 |       expect(violations, '[REQ AC-8] message summary schema').toEqual([]);
  305 |     });
  306 |   });
  307 | 
  308 |   test('SCN-012: Valid staff credentials return a token', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  309 |     let res!: Awaited<ReturnType<Api['post']>>;
  310 |     await journey.step('When I POST the staff credentials to /api/auth/login', async () => {
  311 |       res = await api.post(EP.login, { data: { username: data.staff.username, password: data.staff.password } });
  312 |     });
  313 |     await journey.step('Then the response status is 200', async () => {
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
```