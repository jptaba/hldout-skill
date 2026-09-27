# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-001: Contact form offers every field with an accessible label
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:152:3

# Error details

```
Error: [REQ AC-1 strict] Message field has an accessible label

expect(locator).toBeVisible() failed

Locator: getByRole('textbox', { name: 'Message', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - [REQ AC-1 strict] Message field has an accessible label getByRole('textbox', { name: 'Message', exact: true }) with timeout 5000ms
  - waiting for getByRole('textbox', { name: 'Message', exact: true })

```

```yaml
- navigation:
  - link "Shady Meadows B&B":
    - /url: /
  - list:
    - listitem:
      - link "Rooms":
        - /url: /#rooms
    - listitem:
      - link "Booking":
        - /url: /#booking
    - listitem:
      - link "Amenities":
        - /url: /#amenities
    - listitem:
      - link "Location":
        - /url: /#location
    - listitem:
      - link "Contact":
        - /url: /#contact
    - listitem:
      - link "Admin":
        - /url: /admin
- heading "Welcome to Shady Meadows B&B" [level=1]
- paragraph: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- link "Book Now":
  - /url: "#booking"
- heading "Check Availability & Book Your Stay" [level=3]
- text: Check In
- textbox: 26/09/2026
- text: Check Out
- textbox: 27/09/2026
- button "Check Availability"
- heading "Our Rooms" [level=2]
- paragraph: Comfortable beds and delightful breakfast from locally sourced ingredients
- img "Single Room"
- heading "Single" [level=5]
- paragraph: Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.
- text:  TV  WiFi  Safe £100 per night
- link "Book now":
  - /url: /reservation/1?checkin=2026-09-26&checkout=2026-09-27
- img "Single Room"
- heading "Double" [level=5]
- paragraph: Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl.
- text:  TV  Radio  Safe £150 per night
- link "Book now":
  - /url: /reservation/2?checkin=2026-09-26&checkout=2026-09-27
- img "Single Room"
- heading "Suite" [level=5]
- paragraph: Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex.
- text:  Radio  WiFi  Safe £225 per night
- link "Book now":
  - /url: /reservation/3?checkin=2026-09-26&checkout=2026-09-27
- heading "Our Location" [level=2]
- paragraph: Find us in the beautiful Newingtonfordburyshire countryside
- img
- link "Pigeon":
  - /url: https://pigeon-maps.js.org/
- text: "| ©"
- link "OpenStreetMap":
  - /url: https://www.openstreetmap.org/copyright
- text: contributors
- heading "Contact Information" [level=3]
- text: 
- heading "Address" [level=5]
- paragraph: Shady Meadows B&B, Shadows valley, Newingtonfordburyshire, Dilbery, N1 1AA
- text: 
- heading "Phone" [level=5]
- paragraph: "012345678901"
- text: 
- heading "Email" [level=5]
- paragraph: fake@fakeemail.com
- separator
- heading "Getting Here" [level=4]
- paragraph: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
- heading "Send Us a Message" [level=3]
- text: Name
- textbox "Name"
- text: Email
- textbox "Email"
- text: Phone
- textbox "Phone"
- text: Subject
- textbox "Subject"
- text: Message
- textbox
- button "Submit"
- contentinfo:
  - heading "Shady Meadows B&B" [level=5]
  - paragraph: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
  - link "":
    - /url: "#"
  - link "":
    - /url: "#"
  - link "":
    - /url: "#"
  - heading "Contact Us" [level=5]
  - list:
    - listitem:  Shady Meadows B&B, Shadows valley, Newingtonfordburyshire, Dilbery, N1 1AA
    - listitem:  012345678901
    - listitem:  fake@fakeemail.com
  - heading "Quick Links" [level=5]
  - list:
    - listitem:
      - link "Home":
        - /url: "#"
    - listitem:
      - link "Rooms":
        - /url: "#"
    - listitem:
      - link "Booking":
        - /url: "#"
    - listitem:
      - link "Contact":
        - /url: "#"
  - separator
  - text: restful-booker-platform v2.2 Created by
  - link "Mark Winteringham":
    - /url: http://www.mwtestconsultancy.co.uk
  - text: "- © 2019-26"
  - link "Cookie-Policy":
    - /url: /cookie
  - text: "-"
  - link "Privacy-Policy":
    - /url: /privacy
  - text: "-"
  - link "Admin panel":
    - /url: /admin
- alert
```

# Test source

```ts
  59  | // Room schema (api-contract.md §Room schema)
  60  | const ROOM_SCHEMA: Record<string, ShapeRule> = {
  61  |   roomid: 'integer',
  62  |   roomName: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string',
  63  |   type: (v) => (REQ.ROOM_TYPES as readonly string[]).includes(v as string) || `should be one of ${REQ.ROOM_TYPES.join('/')} but is ${JSON.stringify(v)}`,
  64  |   accessible: 'boolean',
  65  |   roomPrice: (v) => (Number.isInteger(v) && (v as number) > 0) || `should be an integer > 0 but is ${JSON.stringify(v)}`,
  66  |   features: 'string[]',
  67  |   image: 'string',
  68  |   description: 'string',
  69  | };
  70  | const MESSAGE_SUMMARY_SCHEMA: Record<string, ShapeRule> = { id: 'integer', name: 'string', subject: 'string', read: 'boolean' };
  71  | 
  72  | interface Room { roomid: number; roomName: string; type: string; roomPrice: number }
  73  | interface MessageSummary { id: number; name: string; subject: string; read: boolean }
  74  | type Enquiry = { name: string; email: string; phone: string; subject: string; description: string };
  75  | 
  76  | // ---- data builders ----------------------------------------------------------------------------
  77  | const chars = (n: number, ch = 'x') => ch.repeat(n);
  78  | function validEnquiry(data: TestData, overrides: Partial<Enquiry> = {}): Enquiry {
  79  |   return {
  80  |     name: unique('QA Guest'),
  81  |     email: data.enquiry.email,
  82  |     phone: data.enquiry.phone,
  83  |     subject: unique('QA Subject'),
  84  |     description: data.enquiry.message,
  85  |     ...overrides,
  86  |   };
  87  | }
  88  | /** Value of `length` characters that is otherwise valid for the field. */
  89  | function ofLength(field: string, length: number): string {
  90  |   return field.toLowerCase() === 'phone' ? chars(length, '1') : chars(length, 'q');
  91  | }
  92  | const apiFieldName = (field: string) => (field === 'message' ? 'description' : field);
  93  | 
  94  | // ---- API mechanics ----------------------------------------------------------------------------
  95  | async function staffToken(api: Api, data: TestData): Promise<string> {
  96  |   const res = await api.post<{ token?: string }>(EP.login, { data: { username: data.staff.username, password: data.staff.password } });
  97  |   expect(res.status, 'staff login succeeded (precondition)').toBe(REQ.STATUS.OK);
  98  |   return res.body.token!;
  99  | }
  100 | async function staffMessages(api: Api, token: string): Promise<MessageSummary[]> {
  101 |   const res = await api.get<{ messages: MessageSummary[] }>(EP.message, { cookies: { token } });
  102 |   expect(res.status, 'authenticated message list (precondition)').toBe(REQ.STATUS.OK);
  103 |   return res.body.messages;
  104 | }
  105 | /**
  106 |  * Data hygiene on a shared sandbox: every enquiry a test creates is deleted after the test, found by its
  107 |  * unique subject in the staff list (cleanup uses the plumbing-only # SEED-ENDPOINT DELETE /api/message/{id}).
  108 |  */
  109 | function trackEnquiry(seed: Seed, api: Api, data: TestData, subject: string): void {
  110 |   seed.track('enquiry', subject, (subj) => deleteEnquiries(api, data, subj));
  111 | }
  112 | async function deleteEnquiries(api: Api, data: TestData, subject: string): Promise<void> {
  113 |   const token = await staffToken(api, data);
  114 |   for (const m of (await staffMessages(api, token)).filter((x) => x.subject === subject)) {
  115 |     await api.delete(EP.messageById(m.id), { cookies: { token } });
  116 |   }
  117 | }
  118 | /** API pre-step: staff auth context, acquired once per worker and reused (login itself is covered by SCN-012/013). */
  119 | function staffSession(seed: Seed, api: Api, data: TestData): Promise<string> {
  120 |   return seed.once('staff-token', `staff token (POST ${EP.login})`, () => staffToken(api, data));
  121 | }
  122 | async function rooms(api: Api): Promise<Room[]> {
  123 |   const res = await api.get<{ rooms: Room[] }>(EP.rooms);
  124 |   expect(res.status, 'room list (precondition)').toBe(REQ.STATUS.OK);
  125 |   return res.body.rooms;
  126 | }
  127 | 
  128 | // ---- UI mechanics (hardened against the live AUT — see hardening/hardening-log.md) ------------
  129 | const ui = (page: Page) => ({
  130 |   formHeading: page.getByRole('heading', { name: REQ.FORM_HEADING }),
  131 |   // Message has no accessible name in the AUT (observed deviation, asserted strictly in SCN-001) → fill it by test id.
  132 |   input: (field: string) => (field === 'Message' ? page.getByTestId('ContactDescription') : page.getByRole('textbox', { name: field, exact: true })),
  133 |   submit: page.getByRole('button', { name: REQ.SUBMIT }),
  134 |   errors: page.locator('.alert-danger'),
  135 |   confirmation: page.getByRole('heading', { name: /Thanks for getting in touch/ }),
  136 |   confirmationCard: page.locator('.card-body').filter({ has: page.getByRole('heading', { name: /Thanks for getting in touch/ }) }),
  137 |   roomCard: (type: string) => page.locator('.room-card').filter({ has: page.getByRole('heading', { name: type, exact: true }) }),
  138 | });
  139 | 
  140 | async function fillContactForm(page: Page, e: Partial<Enquiry>) {
  141 |   const u = ui(page);
  142 |   await u.input('Name').fill(e.name ?? '');
  143 |   await u.input('Email').fill(e.email ?? '');
  144 |   await u.input('Phone').fill(e.phone ?? '');
  145 |   await u.input('Subject').fill(e.subject ?? '');
  146 |   await u.input('Message').fill(e.description ?? '');
  147 |   await u.submit.click();
  148 | }
  149 | 
  150 | test.describe('DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API', () => {
  151 |   // ---------------- Contact form (UI) ----------------
  152 |   test('SCN-001: Contact form offers every field with an accessible label', { tag: ['@AC-1', '@type:accessibility', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  153 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  154 |     await journey.step('Then I see the "Send Us a Message" form', async () => {
  155 |       await expect(ui(page).formHeading, '[REQ AC-1] "Send Us a Message" form present').toBeVisible();
  156 |     });
  157 |     await journey.step('And the fields Name, Email, Phone, Subject and Message are each exposed with that accessible name', async () => {
  158 |       for (const field of REQ.FIELDS) {
> 159 |         await expect.soft(page.getByRole('textbox', { name: field, exact: true }), `[REQ AC-1 strict] ${field} field has an accessible label`).toBeVisible();
      |                                                                                                                                                ^ Error: [REQ AC-1 strict] Message field has an accessible label
  160 |       }
  161 |     });
  162 |     await journey.step('And I see a "Submit" button', async () => {
  163 |       await expect(page.getByRole('button', { name: REQ.SUBMIT, exact: true }), '[REQ AC-1 strict] Submit button present').toBeVisible();
  164 |     });
  165 |   });
  166 | 
  167 |   test('SCN-002: A valid enquiry shows the personalised confirmation', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  168 |     const enquiry = validEnquiry(data);
  169 |     trackEnquiry(seed, api, data, enquiry.subject);
  170 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  171 |     await journey.step('When I submit the contact form with a unique name, a valid email, phone, a unique subject and a 20+ character message', async () => {
  172 |       await fillContactForm(page, enquiry);
  173 |     });
  174 |     await journey.step('Then I see the heading "Thanks for getting in touch <Name>!" with my name', async () => {
  175 |       await expect(ui(page).confirmation, '[REQ AC-2] confirmation heading names the guest').toHaveText(`${REQ.CONFIRM_PREFIX}${enquiry.name}!`);
  176 |     });
  177 |     await journey.step('And I see "We\'ll get back to you about <Subject> as soon as possible." with my subject', async () => {
  178 |       const section = ui(page).confirmationCard;
  179 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_START);
  180 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(enquiry.subject);
  181 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_END);
  182 |     });
  183 |     await journey.step('And the contact form is no longer shown', async () => {
  184 |       await expect(ui(page).submit, '[REQ AC-2] form replaced by confirmation').toBeHidden();
  185 |     });
  186 |   });
  187 | 
  188 |   test('SCN-003: An empty submission keeps the form and reports every field', { tag: ['@AC-3', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  189 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  190 |     await journey.step('When I submit the contact form with every field empty', async () => {
  191 |       await ui(page).submit.click();
  192 |     });
  193 |     await journey.step('Then the contact form is still shown', async () => {
  194 |       await expect(ui(page).submit, '[REQ AC-3] form still shown after empty submit').toBeVisible();
  195 |     });
  196 |     await journey.step('And the validation errors mention Name, Email, Phone, Subject and Message', async () => {
  197 |       await expect(ui(page).errors).toBeVisible();
  198 |       for (const field of REQ.FIELDS) {
  199 |         await expect.soft(ui(page).errors, `[REQ AC-3] validation errors mention ${field}`).toContainText(new RegExp(field, 'i'));
  200 |       }
  201 |     });
  202 |   });
  203 | 
  204 |   REQ.UI_BOUNDARIES.forEach((row, i) => {
  205 |     test(`SCN-004.${i + 1}: The UI rejects a value one character outside a boundary (${row.field} ${row.length})`, { tag: ['@AC-4', '@type:boundary', '@layer:ui', '@P2', '@boundary'] }, async ({ page, api, journey, data, seed }) => {
  206 |       const key = row.field === 'Message' ? 'description' : (row.field.toLowerCase() as keyof Enquiry);
  207 |       const enquiry = validEnquiry(data, { [key]: ofLength(row.field, row.length) });
  208 |       trackEnquiry(seed, api, data, enquiry.subject);
  209 |       await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  210 |       await journey.step(`When I submit the contact form with a valid enquiry whose ${row.field} is ${row.length} characters long`, async () => {
  211 |         await fillContactForm(page, enquiry);
  212 |       });
  213 |       await journey.step(`Then the form shows the error "${row.message}"`, async () => {
  214 |         await expect(ui(page).errors, `[REQ AC-4] UI shows the ${row.field} length error`).toContainText(row.message);
  215 |       });
  216 |     });
  217 |   });
  218 | 
  219 |   // ---------------- Messages API ----------------
  220 |   test('SCN-005: Creating a valid enquiry returns 201 Created', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  221 |     let res!: Awaited<ReturnType<Api['post']>>;
  222 |     await journey.step('When I POST a valid enquiry to /api/message', async () => {
  223 |       const enquiry = validEnquiry(data);
  224 |       trackEnquiry(seed, api, data, enquiry.subject);
  225 |       res = await api.post(EP.message, { data: enquiry });
  226 |     });
  227 |     await journey.step('Then the response status is 201', async () => {
  228 |       expect.soft(res.status, '[REQ AC-5] create enquiry → 201 Created').toBe(REQ.STATUS.CREATED);
  229 |     });
  230 |     await journey.step('And the response body is {"success": true}', async () => {
  231 |       expect.soft(res.body, '[REQ AC-5] create enquiry body').toEqual(REQ.CREATE_BODY);
  232 |     });
  233 |   });
  234 | 
  235 |   REQ.API_BOUNDARIES.forEach((row, i) => {
  236 |     const label = typeof row.value === 'number' ? `${row.value} characters` : `"${row.value}"`;
  237 |     test(`SCN-006.${i + 1}: The API enforces field boundaries (${row.field} ${label} → ${row.outcome})`, { tag: ['@AC-4', '@AC-6', '@type:boundary', '@layer:api', '@P1', '@boundary'] }, async ({ api, journey, data, seed }) => {
  238 |       const value = typeof row.value === 'number' ? ofLength(row.field, row.value) : row.value;
  239 |       let res!: Awaited<ReturnType<Api['post']>>;
  240 |       await journey.step(`When I POST a valid enquiry to /api/message whose ${row.field} is ${label}`, async () => {
  241 |         const enquiry = validEnquiry(data, { [apiFieldName(row.field)]: value });
  242 |         trackEnquiry(seed, api, data, enquiry.subject);
  243 |         res = await api.post(EP.message, { data: enquiry });
  244 |       });
  245 |       await journey.step(`Then the enquiry is ${row.outcome}`, async () => {
  246 |         if (row.outcome === 'accepted') {
  247 |           const outcome = res.status >= 200 && res.status < 300 ? 'accepted' : `rejected (${res.status}: ${res.text.slice(0, 160)})`;
  248 |           expect(outcome, `[REQ AC-4] ${row.field} ${label} is accepted`).toBe('accepted');
  249 |         } else {
  250 |           expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  251 |         }
  252 |       });
  253 |       const expectedMessage = row.outcome === 'rejected' ? REQ.LENGTH_MESSAGE[row.field as keyof typeof REQ.LENGTH_MESSAGE] : undefined;
  254 |       if (expectedMessage) {
  255 |         await journey.step(`And when rejected, the error list contains "${expectedMessage}"`, async () => {
  256 |           expect(res.body, `[REQ AC-6] error list contains the ${row.field} length message`).toContain(expectedMessage);
  257 |         });
  258 |       }
  259 |     });
```