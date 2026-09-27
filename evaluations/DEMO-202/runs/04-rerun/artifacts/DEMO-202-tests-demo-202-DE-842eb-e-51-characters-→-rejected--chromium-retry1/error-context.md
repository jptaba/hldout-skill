# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-006.4: The API enforces field boundaries (name 51 characters → rejected)
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:216:5

# Error details

```
Error: [REQ AC-6] name 51 characters is rejected with 400

expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 200
```

# Test source

```ts
  127 |   await u.input('Phone').fill(e.phone ?? '');
  128 |   await u.input('Subject').fill(e.subject ?? '');
  129 |   await u.input('Message').fill(e.description ?? '');
  130 |   await u.submit.click();
  131 | }
  132 | 
  133 | test.describe('DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API', () => {
  134 |   // ---------------- Contact form (UI) ----------------
  135 |   test('SCN-001: Contact form offers every field with an accessible label', { tag: ['@AC-1', '@type:accessibility', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  136 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  137 |     await journey.step('Then I see the "Send Us a Message" form', async () => {
  138 |       await expect(ui(page).formHeading, '[REQ AC-1] "Send Us a Message" form present').toBeVisible();
  139 |     });
  140 |     await journey.step('And the fields Name, Email, Phone, Subject and Message are each exposed with that accessible name', async () => {
  141 |       for (const field of REQ.FIELDS) {
  142 |         await expect.soft(page.getByRole('textbox', { name: field, exact: true }), `[REQ AC-1 strict] ${field} field has an accessible label`).toBeVisible();
  143 |       }
  144 |     });
  145 |     await journey.step('And I see a "Submit" button', async () => {
  146 |       await expect(page.getByRole('button', { name: REQ.SUBMIT, exact: true }), '[REQ AC-1 strict] Submit button present').toBeVisible();
  147 |     });
  148 |   });
  149 | 
  150 |   test('SCN-002: A valid enquiry shows the personalised confirmation', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
  151 |     const enquiry = validEnquiry(data);
  152 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  153 |     await journey.step('When I submit the contact form with a unique name, a valid email, phone, a unique subject and a 20+ character message', async () => {
  154 |       await fillContactForm(page, enquiry);
  155 |     });
  156 |     await journey.step('Then I see the heading "Thanks for getting in touch <Name>!" with my name', async () => {
  157 |       await expect(ui(page).confirmation, '[REQ AC-2] confirmation heading names the guest').toHaveText(`${REQ.CONFIRM_PREFIX}${enquiry.name}!`);
  158 |     });
  159 |     await journey.step('And I see "We\'ll get back to you about <Subject> as soon as possible." with my subject', async () => {
  160 |       const section = ui(page).confirmationCard;
  161 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_START);
  162 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(enquiry.subject);
  163 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_END);
  164 |     });
  165 |     await journey.step('And the contact form is no longer shown', async () => {
  166 |       await expect(ui(page).submit, '[REQ AC-2] form replaced by confirmation').toBeHidden();
  167 |     });
  168 |   });
  169 | 
  170 |   test('SCN-003: An empty submission keeps the form and reports every field', { tag: ['@AC-3', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
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
> 227 |           expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
      |                                                                                       ^ Error: [REQ AC-6] name 51 characters is rejected with 400
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
  271 |       expect.soft(res.text, '[REQ AC-8] no message data without token').not.toContain('"messages"');
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
```