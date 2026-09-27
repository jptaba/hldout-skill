# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-006.4: The API enforces field boundaries (name 51 characters → rejected)
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:213:5

# Error details

```
Error: [REQ AC-6] name 51 characters is rejected with 400

expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  124 |   await u.input('Phone').fill(e.phone ?? '');
  125 |   await u.input('Subject').fill(e.subject ?? '');
  126 |   await u.input('Message').fill(e.description ?? '');
  127 |   await u.submit.click();
  128 | }
  129 | 
  130 | test.describe('DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API', () => {
  131 |   // ---------------- Contact form (UI) ----------------
  132 |   test('SCN-001: Contact form offers every field with an accessible label', { tag: ['@AC-1', '@P2', '@ui', '@a11y'] }, async ({ page, journey }) => {
  133 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  134 |     await journey.step('Then I see the "Send Us a Message" form', async () => {
  135 |       await expect(ui(page).formHeading, '[REQ AC-1] "Send Us a Message" form present').toBeVisible();
  136 |     });
  137 |     await journey.step('And the fields Name, Email, Phone, Subject and Message are each exposed with that accessible name', async () => {
  138 |       for (const field of REQ.FIELDS) {
  139 |         await expect.soft(page.getByRole('textbox', { name: field, exact: true }), `[REQ AC-1 strict] ${field} field has an accessible label`).toBeVisible();
  140 |       }
  141 |     });
  142 |     await journey.step('And I see a "Submit" button', async () => {
  143 |       await expect(page.getByRole('button', { name: REQ.SUBMIT, exact: true }), '[REQ AC-1 strict] Submit button present').toBeVisible();
  144 |     });
  145 |   });
  146 | 
  147 |   test('SCN-002: A valid enquiry shows the personalised confirmation', { tag: ['@AC-2', '@P1', '@ui'] }, async ({ page, journey, data }) => {
  148 |     const enquiry = validEnquiry(data);
  149 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  150 |     await journey.step('When I submit the contact form with a unique name, a valid email, phone, a unique subject and a 20+ character message', async () => {
  151 |       await fillContactForm(page, enquiry);
  152 |     });
  153 |     await journey.step('Then I see the heading "Thanks for getting in touch <Name>!" with my name', async () => {
  154 |       await expect(ui(page).confirmation, '[REQ AC-2] confirmation heading names the guest').toHaveText(`${REQ.CONFIRM_PREFIX}${enquiry.name}!`);
  155 |     });
  156 |     await journey.step('And I see "We\'ll get back to you about <Subject> as soon as possible." with my subject', async () => {
  157 |       const section = page.locator('section, div').filter({ has: ui(page).confirmation }).last(); // TODO(harden)
  158 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_START);
  159 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(enquiry.subject);
  160 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_END);
  161 |     });
  162 |     await journey.step('And the contact form is no longer shown', async () => {
  163 |       await expect(ui(page).submit, '[REQ AC-2] form replaced by confirmation').toBeHidden();
  164 |     });
  165 |   });
  166 | 
  167 |   test('SCN-003: An empty submission keeps the form and reports every field', { tag: ['@AC-3', '@P2', '@ui'] }, async ({ page, journey }) => {
  168 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  169 |     await journey.step('When I submit the contact form with every field empty', async () => {
  170 |       await ui(page).submit.click();
  171 |     });
  172 |     await journey.step('Then the contact form is still shown', async () => {
  173 |       await expect(ui(page).submit, '[REQ AC-3] form still shown after empty submit').toBeVisible();
  174 |     });
  175 |     await journey.step('And the validation errors mention Name, Email, Phone, Subject and Message', async () => {
  176 |       await expect(ui(page).errors).toBeVisible();
  177 |       for (const field of REQ.FIELDS) {
  178 |         await expect.soft(ui(page).errors, `[REQ AC-3] validation errors mention ${field}`).toContainText(new RegExp(`\\b${field}\\b`, 'i'));
  179 |       }
  180 |     });
  181 |   });
  182 | 
  183 |   REQ.UI_BOUNDARIES.forEach((row, i) => {
  184 |     test(`SCN-004.${i + 1}: The UI rejects a value one character outside a boundary (${row.field} ${row.length})`, { tag: ['@AC-4', '@P2', '@ui', '@boundary'] }, async ({ page, journey, data }) => {
  185 |       const key = row.field === 'Message' ? 'description' : (row.field.toLowerCase() as keyof Enquiry);
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
> 224 |           expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
      |                                                                                       ^ Error: [REQ AC-6] name 51 characters is rejected with 400
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
```