# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-202\tests\demo-202.spec.ts >> DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API >> SCN-004.2: The UI rejects a value one character outside a boundary (Subject 101)
- Location: evaluations\DEMO-202\tests\demo-202.spec.ts:184:5

# Error details

```
TimeoutError: locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for getByLabel('Message', { exact: true })

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e5]:
        - link "Shady Meadows B&B" [ref=e6] [cursor=pointer]:
          - /url: /
        - list [ref=e9]:
          - listitem [ref=e10]:
            - link "Rooms" [ref=e11] [cursor=pointer]:
              - /url: /#rooms
          - listitem [ref=e12]:
            - link "Booking" [ref=e13] [cursor=pointer]:
              - /url: /#booking
          - listitem [ref=e14]:
            - link "Amenities" [ref=e15] [cursor=pointer]:
              - /url: /#amenities
          - listitem [ref=e16]:
            - link "Location" [ref=e17] [cursor=pointer]:
              - /url: /#location
          - listitem [ref=e18]:
            - link "Contact" [ref=e19] [cursor=pointer]:
              - /url: /#contact
          - listitem [ref=e20]:
            - link "Admin" [ref=e21] [cursor=pointer]:
              - /url: /admin
    - generic [ref=e25]:
      - heading "Welcome to Shady Meadows B&B" [level=1] [ref=e26]
      - paragraph [ref=e27]: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
      - link "Book Now" [ref=e28] [cursor=pointer]:
        - /url: "#booking"
    - generic [ref=e29]:
      - generic [ref=e33]:
        - heading "Check Availability & Book Your Stay" [level=3] [ref=e34]
        - generic [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]: Check In
            - textbox [ref=e41]: 26/09/2026
          - generic [ref=e42]:
            - generic [ref=e43]: Check Out
            - textbox [ref=e46]: 27/09/2026
          - button "Check Availability" [ref=e49] [cursor=pointer]
      - generic [ref=e52]:
        - generic [ref=e53]:
          - heading "Our Rooms" [level=2] [ref=e54]
          - paragraph [ref=e55]: Comfortable beds and delightful breakfast from locally sourced ingredients
        - generic [ref=e56]:
          - generic [ref=e58]:
            - img "Single Room" [ref=e60]
            - generic [ref=e61]:
              - heading "Single" [level=5] [ref=e62]
              - paragraph [ref=e63]: Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.
              - generic [ref=e65]:
                - generic [ref=e66]:
                  - generic [ref=e67]: 
                  - text: TV
                - generic [ref=e68]:
                  - generic [ref=e69]: 
                  - text: WiFi
                - generic [ref=e70]:
                  - generic [ref=e71]: 
                  - text: Safe
            - generic [ref=e72]:
              - generic [ref=e73]: £100 per night
              - link "Book now" [ref=e74] [cursor=pointer]:
                - /url: /reservation/1?checkin=2026-09-26&checkout=2026-09-27
          - generic [ref=e76]:
            - img "Single Room" [ref=e78]
            - generic [ref=e79]:
              - heading "Double" [level=5] [ref=e80]
              - paragraph [ref=e81]: Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl.
              - generic [ref=e83]:
                - generic [ref=e84]:
                  - generic [ref=e85]: 
                  - text: TV
                - generic [ref=e86]:
                  - generic [ref=e87]: 
                  - text: Radio
                - generic [ref=e88]:
                  - generic [ref=e89]: 
                  - text: Safe
            - generic [ref=e90]:
              - generic [ref=e91]: £150 per night
              - link "Book now" [ref=e92] [cursor=pointer]:
                - /url: /reservation/2?checkin=2026-09-26&checkout=2026-09-27
          - generic [ref=e94]:
            - img "Single Room" [ref=e96]
            - generic [ref=e97]:
              - heading "Suite" [level=5] [ref=e98]
              - paragraph [ref=e99]: Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex.
              - generic [ref=e101]:
                - generic [ref=e102]:
                  - generic [ref=e103]: 
                  - text: Radio
                - generic [ref=e104]:
                  - generic [ref=e105]: 
                  - text: WiFi
                - generic [ref=e106]:
                  - generic [ref=e107]: 
                  - text: Safe
            - generic [ref=e108]:
              - generic [ref=e109]: £225 per night
              - link "Book now" [ref=e110] [cursor=pointer]:
                - /url: /reservation/3?checkin=2026-09-26&checkout=2026-09-27
    - generic [ref=e112]:
      - generic [ref=e113]:
        - heading "Our Location" [level=2] [ref=e114]
        - paragraph [ref=e115]: Find us in the beautiful Newingtonfordburyshire countryside
      - generic [ref=e116]:
        - generic [ref=e120]:
          - generic [ref=e123]:
            - generic:
              - img:
                - generic [ref=e124] [cursor=pointer]
          - generic [ref=e127]:
            - generic [ref=e128]:
              - link "Pigeon" [ref=e129] [cursor=pointer]:
                - /url: https://pigeon-maps.js.org/
              - text: "|"
            - generic [ref=e130]:
              - text: ©
              - link "OpenStreetMap" [ref=e131] [cursor=pointer]:
                - /url: https://www.openstreetmap.org/copyright
              - text: contributors
        - generic [ref=e134]:
          - heading "Contact Information" [level=3] [ref=e135]
          - generic [ref=e136]:
            - generic [ref=e137]: 
            - generic [ref=e139]:
              - heading "Address" [level=5] [ref=e140]
              - paragraph [ref=e141]: Shady Meadows B&B, Shadows valley, Newingtonfordburyshire, Dilbery, N1 1AA
          - generic [ref=e142]:
            - generic [ref=e143]: 
            - generic [ref=e145]:
              - heading "Phone" [level=5] [ref=e146]
              - paragraph [ref=e147]: "012345678901"
          - generic [ref=e148]:
            - generic [ref=e149]: 
            - generic [ref=e151]:
              - heading "Email" [level=5] [ref=e152]
              - paragraph [ref=e153]: fake@fakeemail.com
          - separator [ref=e154]
          - heading "Getting Here" [level=4] [ref=e155]
          - paragraph [ref=e156]: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
    - generic [ref=e162]:
      - heading "Send Us a Message" [level=3] [ref=e163]
      - generic [ref=e164]:
        - generic [ref=e165]:
          - generic [ref=e166]: Name
          - textbox "Name" [ref=e167]: QA Guest iiyoaxrb-1
        - generic [ref=e168]:
          - generic [ref=e169]: Email
          - textbox "Email" [ref=e170]: qa.guest@example.com
        - generic [ref=e171]:
          - generic [ref=e172]: Phone
          - textbox "Phone" [ref=e173]: "01234567890"
        - generic [ref=e174]:
          - generic [ref=e175]: Subject
          - textbox "Subject" [active] [ref=e176]: qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq
        - generic [ref=e177]:
          - generic [ref=e178]: Message
          - textbox [ref=e179]
        - button "Submit" [ref=e181] [cursor=pointer]
    - contentinfo [ref=e182]:
      - generic [ref=e183]:
        - generic [ref=e184]:
          - generic [ref=e185]:
            - heading "Shady Meadows B&B" [level=5] [ref=e186]
            - paragraph [ref=e187]: Welcome to Shady Meadows, a delightful Bed & Breakfast nestled in the hills on Newingtonfordburyshire. A place so beautiful you will never want to leave. All our rooms have comfortable beds and we provide breakfast from the locally sourced supermarket. It is a delightful place.
            - generic [ref=e188]:
              - link "" [ref=e189] [cursor=pointer]:
                - /url: "#"
              - link "" [ref=e191] [cursor=pointer]:
                - /url: "#"
              - link "" [ref=e193] [cursor=pointer]:
                - /url: "#"
          - generic [ref=e195]:
            - heading "Contact Us" [level=5] [ref=e196]
            - list [ref=e197]:
              - listitem [ref=e198]:
                - generic [ref=e199]: 
                - text: Shady Meadows B&B, Shadows valley, Newingtonfordburyshire, Dilbery, N1 1AA
              - listitem [ref=e200]:
                - generic [ref=e201]: 
                - text: "012345678901"
              - listitem [ref=e202]:
                - generic [ref=e203]: 
                - text: fake@fakeemail.com
          - generic [ref=e204]:
            - heading "Quick Links" [level=5] [ref=e205]
            - list [ref=e206]:
              - listitem [ref=e207]:
                - link "Home" [ref=e208] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e209]:
                - link "Rooms" [ref=e210] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e211]:
                - link "Booking" [ref=e212] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e213]:
                - link "Contact" [ref=e214] [cursor=pointer]:
                  - /url: "#"
        - separator [ref=e215]
        - generic [ref=e217]:
          - text: restful-booker-platform v2.2 Created by
          - link "Mark Winteringham" [ref=e218] [cursor=pointer]:
            - /url: http://www.mwtestconsultancy.co.uk
          - text: "- © 2019-26"
          - link "Cookie-Policy" [ref=e219] [cursor=pointer]:
            - /url: /cookie
          - text: "-"
          - link "Privacy-Policy" [ref=e220] [cursor=pointer]:
            - /url: /privacy
          - text: "-"
          - link "Admin panel" [ref=e221] [cursor=pointer]:
            - /url: /admin
  - alert [ref=e222]
```

# Test source

```ts
  26  |     subject: 'Subject must be between 5 and 100 characters.',
  27  |     message: 'Message must be between 20 and 2000 characters.',
  28  |   },
  29  |   UI_BOUNDARIES: [ // SCN-004 Examples
  30  |     { field: 'Phone', length: 10, message: 'Phone must be between 11 and 21 characters.' },
  31  |     { field: 'Subject', length: 101, message: 'Subject must be between 5 and 100 characters.' },
  32  |     { field: 'Message', length: 19, message: 'Message must be between 20 and 2000 characters.' },
  33  |   ],
  34  |   API_BOUNDARIES: [ // SCN-006 Examples — value is a length, or a literal string for email
  35  |     { field: 'name', value: 1, outcome: 'rejected' }, { field: 'name', value: 2, outcome: 'accepted' },
  36  |     { field: 'name', value: 50, outcome: 'accepted' }, { field: 'name', value: 51, outcome: 'rejected' },
  37  |     { field: 'phone', value: 10, outcome: 'rejected' }, { field: 'phone', value: 11, outcome: 'accepted' },
  38  |     { field: 'phone', value: 21, outcome: 'accepted' }, { field: 'phone', value: 22, outcome: 'rejected' },
  39  |     { field: 'subject', value: 4, outcome: 'rejected' }, { field: 'subject', value: 5, outcome: 'accepted' },
  40  |     { field: 'subject', value: 100, outcome: 'accepted' }, { field: 'subject', value: 101, outcome: 'rejected' },
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
  110 | // ---- UI mechanics (locators are hardened in phase 4) ------------------------------------------
  111 | const ui = (page: Page) => ({
  112 |   formHeading: page.getByRole('heading', { name: REQ.FORM_HEADING }), // TODO(harden)
  113 |   input: (field: string) => page.getByLabel(field, { exact: true }), // TODO(harden)
  114 |   submit: page.getByRole('button', { name: REQ.SUBMIT }), // TODO(harden)
  115 |   errors: page.getByRole('alert'), // TODO(harden)
  116 |   confirmation: page.getByRole('heading', { name: /Thanks for getting in touch/ }), // TODO(harden)
  117 |   roomCard: (type: string) => page.locator('.room-card').filter({ has: page.getByRole('heading', { name: type, exact: true }) }), // TODO(harden)
  118 | });
  119 | 
  120 | async function fillContactForm(page: Page, e: Partial<Enquiry>) {
  121 |   const u = ui(page);
  122 |   await u.input('Name').fill(e.name ?? '');
  123 |   await u.input('Email').fill(e.email ?? '');
  124 |   await u.input('Phone').fill(e.phone ?? '');
  125 |   await u.input('Subject').fill(e.subject ?? '');
> 126 |   await u.input('Message').fill(e.description ?? '');
      |                            ^ TimeoutError: locator.fill: Timeout 10000ms exceeded.
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
  224 |           expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  225 |         }
  226 |       });
```