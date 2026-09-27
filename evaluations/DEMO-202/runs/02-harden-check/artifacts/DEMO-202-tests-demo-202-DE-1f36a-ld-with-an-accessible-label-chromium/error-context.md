# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-001: Contact form offers every field with an accessible label
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:134:3

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
  41  |     { field: 'message', value: 19, outcome: 'rejected' }, { field: 'message', value: 20, outcome: 'accepted' },
  42  |     { field: 'message', value: 2000, outcome: 'accepted' }, { field: 'message', value: 2001, outcome: 'rejected' },
  43  |     { field: 'email', value: 'guest@example', outcome: 'rejected' }, { field: 'email', value: 'guest@example.com', outcome: 'accepted' },
  44  |   ],
  45  |   PERSONAL_DATA_KEYS: ['email', 'phone', 'description'],
  46  | } as const;
  47  | // @req-constants-end
  48  | 
  49  | // Endpoints exactly as declared in the requirement's API contract.
  50  | const EP = {
  51  |   message: '/api/message',
  52  |   messageById: (id: number | string) => `/api/message/${id}`,
  53  |   login: '/api/auth/login',
  54  |   rooms: '/api/room',
  55  |   roomById: (id: number | string) => `/api/room/${id}`,
  56  | };
  57  | 
  58  | // Room schema (api-contract.md §Room schema)
  59  | const ROOM_SCHEMA: Record<string, ShapeRule> = {
  60  |   roomid: 'integer',
  61  |   roomName: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string',
  62  |   type: (v) => (REQ.ROOM_TYPES as readonly string[]).includes(v as string) || `should be one of ${REQ.ROOM_TYPES.join('/')} but is ${JSON.stringify(v)}`,
  63  |   accessible: 'boolean',
  64  |   roomPrice: (v) => (Number.isInteger(v) && (v as number) > 0) || `should be an integer > 0 but is ${JSON.stringify(v)}`,
  65  |   features: 'string[]',
  66  |   image: 'string',
  67  |   description: 'string',
  68  | };
  69  | const MESSAGE_SUMMARY_SCHEMA: Record<string, ShapeRule> = { id: 'integer', name: 'string', subject: 'string', read: 'boolean' };
  70  | 
  71  | interface Room { roomid: number; roomName: string; type: string; roomPrice: number }
  72  | interface MessageSummary { id: number; name: string; subject: string; read: boolean }
  73  | type Enquiry = { name: string; email: string; phone: string; subject: string; description: string };
  74  | 
  75  | // ---- data builders ----------------------------------------------------------------------------
  76  | const chars = (n: number, ch = 'x') => ch.repeat(n);
  77  | function validEnquiry(data: TestData, overrides: Partial<Enquiry> = {}): Enquiry {
  78  |   return {
  79  |     name: unique('QA Guest'),
  80  |     email: data.enquiry.email,
  81  |     phone: data.enquiry.phone,
  82  |     subject: unique('QA Subject'),
  83  |     description: data.enquiry.message,
  84  |     ...overrides,
  85  |   };
  86  | }
  87  | /** Value of `length` characters that is otherwise valid for the field. */
  88  | function ofLength(field: string, length: number): string {
  89  |   return field.toLowerCase() === 'phone' ? chars(length, '1') : chars(length, 'q');
  90  | }
  91  | const apiFieldName = (field: string) => (field === 'message' ? 'description' : field);
  92  | 
  93  | // ---- API mechanics ----------------------------------------------------------------------------
  94  | async function staffToken(api: Api, data: TestData): Promise<string> {
  95  |   const res = await api.post<{ token?: string }>(EP.login, { data: { username: data.staff.username, password: data.staff.password } });
  96  |   expect(res.status, 'staff login succeeded (precondition)').toBe(REQ.STATUS.OK);
  97  |   return res.body.token!;
  98  | }
  99  | async function staffMessages(api: Api, token: string): Promise<MessageSummary[]> {
  100 |   const res = await api.get<{ messages: MessageSummary[] }>(EP.message, { cookies: { token } });
  101 |   expect(res.status, 'authenticated message list (precondition)').toBe(REQ.STATUS.OK);
  102 |   return res.body.messages;
  103 | }
  104 | async function rooms(api: Api): Promise<Room[]> {
  105 |   const res = await api.get<{ rooms: Room[] }>(EP.rooms);
  106 |   expect(res.status, 'room list (precondition)').toBe(REQ.STATUS.OK);
  107 |   return res.body.rooms;
  108 | }
  109 | 
  110 | // ---- UI mechanics (hardened against the live AUT — see hardening/hardening-log.md) ------------
  111 | const ui = (page: Page) => ({
  112 |   formHeading: page.getByRole('heading', { name: REQ.FORM_HEADING }),
  113 |   // Message has no accessible name in the AUT (observed deviation, asserted strictly in SCN-001) → fill it by test id.
  114 |   input: (field: string) => (field === 'Message' ? page.getByTestId('ContactDescription') : page.getByRole('textbox', { name: field, exact: true })),
  115 |   submit: page.getByRole('button', { name: REQ.SUBMIT }),
  116 |   errors: page.locator('.alert-danger'),
  117 |   confirmation: page.getByRole('heading', { name: /Thanks for getting in touch/ }),
  118 |   confirmationCard: page.locator('.card-body').filter({ has: page.getByRole('heading', { name: /Thanks for getting in touch/ }) }),
  119 |   roomCard: (type: string) => page.locator('.room-card').filter({ has: page.getByRole('heading', { name: type, exact: true }) }),
  120 | });
  121 | 
  122 | async function fillContactForm(page: Page, e: Partial<Enquiry>) {
  123 |   const u = ui(page);
  124 |   await u.input('Name').fill(e.name ?? '');
  125 |   await u.input('Email').fill(e.email ?? '');
  126 |   await u.input('Phone').fill(e.phone ?? '');
  127 |   await u.input('Subject').fill(e.subject ?? '');
  128 |   await u.input('Message').fill(e.description ?? '');
  129 |   await u.submit.click();
  130 | }
  131 | 
  132 | test.describe('DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API', () => {
  133 |   // ---------------- Contact form (UI) ----------------
  134 |   test('SCN-001: Contact form offers every field with an accessible label', { tag: ['@AC-1', '@P2', '@ui', '@a11y'] }, async ({ page, journey }) => {
  135 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  136 |     await journey.step('Then I see the "Send Us a Message" form', async () => {
  137 |       await expect(ui(page).formHeading, '[REQ AC-1] "Send Us a Message" form present').toBeVisible();
  138 |     });
  139 |     await journey.step('And the fields Name, Email, Phone, Subject and Message are each exposed with that accessible name', async () => {
  140 |       for (const field of REQ.FIELDS) {
> 141 |         await expect.soft(page.getByRole('textbox', { name: field, exact: true }), `[REQ AC-1 strict] ${field} field has an accessible label`).toBeVisible();
      |                                                                                                                                                ^ Error: [REQ AC-1 strict] Message field has an accessible label
  142 |       }
  143 |     });
  144 |     await journey.step('And I see a "Submit" button', async () => {
  145 |       await expect(page.getByRole('button', { name: REQ.SUBMIT, exact: true }), '[REQ AC-1 strict] Submit button present').toBeVisible();
  146 |     });
  147 |   });
  148 | 
  149 |   test('SCN-002: A valid enquiry shows the personalised confirmation', { tag: ['@AC-2', '@P1', '@ui'] }, async ({ page, journey, data }) => {
  150 |     const enquiry = validEnquiry(data);
  151 |     await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
  152 |     await journey.step('When I submit the contact form with a unique name, a valid email, phone, a unique subject and a 20+ character message', async () => {
  153 |       await fillContactForm(page, enquiry);
  154 |     });
  155 |     await journey.step('Then I see the heading "Thanks for getting in touch <Name>!" with my name', async () => {
  156 |       await expect(ui(page).confirmation, '[REQ AC-2] confirmation heading names the guest').toHaveText(`${REQ.CONFIRM_PREFIX}${enquiry.name}!`);
  157 |     });
  158 |     await journey.step('And I see "We\'ll get back to you about <Subject> as soon as possible." with my subject', async () => {
  159 |       const section = ui(page).confirmationCard;
  160 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_START);
  161 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(enquiry.subject);
  162 |       await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_END);
  163 |     });
  164 |     await journey.step('And the contact form is no longer shown', async () => {
  165 |       await expect(ui(page).submit, '[REQ AC-2] form replaced by confirmation').toBeHidden();
  166 |     });
  167 |   });
  168 | 
  169 |   test('SCN-003: An empty submission keeps the form and reports every field', { tag: ['@AC-3', '@P2', '@ui'] }, async ({ page, journey }) => {
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
  180 |         await expect.soft(ui(page).errors, `[REQ AC-3] validation errors mention ${field}`).toContainText(new RegExp(`\\b${field}\\b`, 'i'));
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
```