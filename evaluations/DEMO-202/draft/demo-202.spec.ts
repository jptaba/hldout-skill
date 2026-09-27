/**
 * Held-out acceptance tests for DEMO-202 — "Guest enquiries — contact form, rooms catalogue and messages API".
 * Generated from evaluations/DEMO-202/scenarios.feature (requirement + attachments only). UI + API.
 */
import type { Page } from '@playwright/test';
import { test, expect, unique, checkShape, type Api, type ShapeRule, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from DEMO-202 + attachments (never edit during hardening)
const REQ = {
  FORM_HEADING: 'Send Us a Message',
  FIELDS: ['Name', 'Email', 'Phone', 'Subject', 'Message'],
  SUBMIT: 'Submit',
  CONFIRM_PREFIX: 'Thanks for getting in touch ', // + "<Name>!"   (ux-copy.md)
  CONFIRM_BODY_START: "We'll get back to you about",
  CONFIRM_BODY_END: 'as soon as possible.',
  STATUS: { CREATED: 201, BAD_REQUEST: 400, UNAUTHORIZED: 401, OK: 200, NOT_FOUND: 404 },
  CREATE_BODY: { success: true },
  LOGIN_INVALID_BODY: { error: 'Invalid credentials' },
  ROOM_TYPES: ['Single', 'Twin', 'Double', 'Family', 'Suite'],
  PRICE_TEXT: (price: number) => `£${price} per night`, // ux-copy.md §Rooms list
  ALT_TEXT: (type: string) => `${type} Room`, // ux-copy.md §Rooms list
  PERF: { REQUESTS: 5, MAX_MS: 3000 },
  LENGTH_MESSAGE: { // field-rules.csv → length_error_message
    name: 'Name must be between 2 and 50 characters.',
    phone: 'Phone must be between 11 and 21 characters.',
    subject: 'Subject must be between 5 and 100 characters.',
    message: 'Message must be between 20 and 2000 characters.',
  },
  UI_BOUNDARIES: [ // SCN-004 Examples
    { field: 'Phone', length: 10, message: 'Phone must be between 11 and 21 characters.' },
    { field: 'Subject', length: 101, message: 'Subject must be between 5 and 100 characters.' },
    { field: 'Message', length: 19, message: 'Message must be between 20 and 2000 characters.' },
  ],
  API_BOUNDARIES: [ // SCN-006 Examples — value is a length, or a literal string for email
    { field: 'name', value: 1, outcome: 'rejected' }, { field: 'name', value: 2, outcome: 'accepted' },
    { field: 'name', value: 50, outcome: 'accepted' }, { field: 'name', value: 51, outcome: 'rejected' },
    { field: 'phone', value: 10, outcome: 'rejected' }, { field: 'phone', value: 11, outcome: 'accepted' },
    { field: 'phone', value: 21, outcome: 'accepted' }, { field: 'phone', value: 22, outcome: 'rejected' },
    { field: 'subject', value: 4, outcome: 'rejected' }, { field: 'subject', value: 5, outcome: 'accepted' },
    { field: 'subject', value: 100, outcome: 'accepted' }, { field: 'subject', value: 101, outcome: 'rejected' },
    { field: 'message', value: 19, outcome: 'rejected' }, { field: 'message', value: 20, outcome: 'accepted' },
    { field: 'message', value: 2000, outcome: 'accepted' }, { field: 'message', value: 2001, outcome: 'rejected' },
    { field: 'email', value: 'guest@example', outcome: 'rejected' }, { field: 'email', value: 'guest@example.com', outcome: 'accepted' },
  ],
  PERSONAL_DATA_KEYS: ['email', 'phone', 'description'],
  IDEMPOTENCY: { HEADER: 'Idempotency-Key', REPEATS: 2, EXPECTED_STORED: 1, GET_REPEATS: 3 }, // rev 2 — api-contract.md §Idempotency
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement's API contract.
const EP = {
  message: '/api/message',
  messageById: (id: number | string) => `/api/message/${id}`,
  login: '/api/auth/login',
  rooms: '/api/room',
  roomById: (id: number | string) => `/api/room/${id}`,
};

// Room schema (api-contract.md §Room schema)
const ROOM_SCHEMA: Record<string, ShapeRule> = {
  roomid: 'integer',
  roomName: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string',
  type: (v) => (REQ.ROOM_TYPES as readonly string[]).includes(v as string) || `should be one of ${REQ.ROOM_TYPES.join('/')} but is ${JSON.stringify(v)}`,
  accessible: 'boolean',
  roomPrice: (v) => (Number.isInteger(v) && (v as number) > 0) || `should be an integer > 0 but is ${JSON.stringify(v)}`,
  features: 'string[]',
  image: 'string',
  description: 'string',
};
const MESSAGE_SUMMARY_SCHEMA: Record<string, ShapeRule> = { id: 'integer', name: 'string', subject: 'string', read: 'boolean' };

interface Room { roomid: number; roomName: string; type: string; roomPrice: number }
interface MessageSummary { id: number; name: string; subject: string; read: boolean }
type Enquiry = { name: string; email: string; phone: string; subject: string; description: string };

// ---- data builders ----------------------------------------------------------------------------
const chars = (n: number, ch = 'x') => ch.repeat(n);
function validEnquiry(data: TestData, overrides: Partial<Enquiry> = {}): Enquiry {
  return {
    name: unique('QA Guest'),
    email: data.enquiry.email,
    phone: data.enquiry.phone,
    subject: unique('QA Subject'),
    description: data.enquiry.message,
    ...overrides,
  };
}
/** Value of `length` characters that is otherwise valid for the field. */
function ofLength(field: string, length: number): string {
  return field.toLowerCase() === 'phone' ? chars(length, '1') : chars(length, 'q');
}
const apiFieldName = (field: string) => (field === 'message' ? 'description' : field);

// ---- API mechanics ----------------------------------------------------------------------------
async function staffToken(api: Api, data: TestData): Promise<string> {
  const res = await api.post<{ token?: string }>(EP.login, { data: { username: data.staff.username, password: data.staff.password } });
  expect(res.status, 'staff login succeeded (precondition)').toBe(REQ.STATUS.OK);
  return res.body.token!;
}
async function staffMessages(api: Api, token: string): Promise<MessageSummary[]> {
  const res = await api.get<{ messages: MessageSummary[] }>(EP.message, { cookies: { token } });
  expect(res.status, 'authenticated message list (precondition)').toBe(REQ.STATUS.OK);
  return res.body.messages;
}
async function rooms(api: Api): Promise<Room[]> {
  const res = await api.get<{ rooms: Room[] }>(EP.rooms);
  expect(res.status, 'room list (precondition)').toBe(REQ.STATUS.OK);
  return res.body.rooms;
}

// ---- UI mechanics (hardened against the live AUT — see hardening/hardening-log.md) ------------
const ui = (page: Page) => ({
  formHeading: page.getByRole('heading', { name: REQ.FORM_HEADING }),
  // Message has no accessible name in the AUT (observed deviation, asserted strictly in SCN-001) → fill it by test id.
  input: (field: string) => (field === 'Message' ? page.getByTestId('ContactDescription') : page.getByRole('textbox', { name: field, exact: true })),
  submit: page.getByRole('button', { name: REQ.SUBMIT }),
  errors: page.locator('.alert-danger'),
  confirmation: page.getByRole('heading', { name: /Thanks for getting in touch/ }),
  confirmationCard: page.locator('.card-body').filter({ has: page.getByRole('heading', { name: /Thanks for getting in touch/ }) }),
  roomCard: (type: string) => page.locator('.room-card').filter({ has: page.getByRole('heading', { name: type, exact: true }) }),
});

async function fillContactForm(page: Page, e: Partial<Enquiry>) {
  const u = ui(page);
  await u.input('Name').fill(e.name ?? '');
  await u.input('Email').fill(e.email ?? '');
  await u.input('Phone').fill(e.phone ?? '');
  await u.input('Subject').fill(e.subject ?? '');
  await u.input('Message').fill(e.description ?? '');
  await u.submit.click();
}

test.describe('DEMO-202 Guest enquiries — contact form, rooms catalogue and messages API', () => {
  // ---------------- Contact form (UI) ----------------
  test('SCN-001: Contact form offers every field with an accessible label', { tag: ['@AC-1', '@type:accessibility', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
    await journey.step('Then I see the "Send Us a Message" form', async () => {
      await expect(ui(page).formHeading, '[REQ AC-1] "Send Us a Message" form present').toBeVisible();
    });
    await journey.step('And the fields Name, Email, Phone, Subject and Message are each exposed with that accessible name', async () => {
      for (const field of REQ.FIELDS) {
        await expect.soft(page.getByRole('textbox', { name: field, exact: true }), `[REQ AC-1 strict] ${field} field has an accessible label`).toBeVisible();
      }
    });
    await journey.step('And I see a "Submit" button', async () => {
      await expect(page.getByRole('button', { name: REQ.SUBMIT, exact: true }), '[REQ AC-1 strict] Submit button present').toBeVisible();
    });
  });

  test('SCN-002: A valid enquiry shows the personalised confirmation', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
    const enquiry = validEnquiry(data);
    await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
    await journey.step('When I submit the contact form with a unique name, a valid email, phone, a unique subject and a 20+ character message', async () => {
      await fillContactForm(page, enquiry);
    });
    await journey.step('Then I see the heading "Thanks for getting in touch <Name>!" with my name', async () => {
      await expect(ui(page).confirmation, '[REQ AC-2] confirmation heading names the guest').toHaveText(`${REQ.CONFIRM_PREFIX}${enquiry.name}!`);
    });
    await journey.step('And I see "We\'ll get back to you about <Subject> as soon as possible." with my subject', async () => {
      const section = ui(page).confirmationCard;
      await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_START);
      await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(enquiry.subject);
      await expect(section, '[REQ AC-2] confirmation body names the subject').toContainText(REQ.CONFIRM_BODY_END);
    });
    await journey.step('And the contact form is no longer shown', async () => {
      await expect(ui(page).submit, '[REQ AC-2] form replaced by confirmation').toBeHidden();
    });
  });

  test('SCN-003: An empty submission keeps the form and reports every field', { tag: ['@AC-3', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
    await journey.step('When I submit the contact form with every field empty', async () => {
      await ui(page).submit.click();
    });
    await journey.step('Then the contact form is still shown', async () => {
      await expect(ui(page).submit, '[REQ AC-3] form still shown after empty submit').toBeVisible();
    });
    await journey.step('And the validation errors mention Name, Email, Phone, Subject and Message', async () => {
      await expect(ui(page).errors).toBeVisible();
      for (const field of REQ.FIELDS) {
        await expect.soft(ui(page).errors, `[REQ AC-3] validation errors mention ${field}`).toContainText(new RegExp(field, 'i'));
      }
    });
  });

  REQ.UI_BOUNDARIES.forEach((row, i) => {
    test(`SCN-004.${i + 1}: The UI rejects a value one character outside a boundary (${row.field} ${row.length})`, { tag: ['@AC-4', '@type:boundary', '@layer:ui', '@P2', '@boundary'] }, async ({ page, journey, data }) => {
      const key = row.field === 'Message' ? 'description' : (row.field.toLowerCase() as keyof Enquiry);
      const enquiry = validEnquiry(data, { [key]: ofLength(row.field, row.length) });
      await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
      await journey.step(`When I submit the contact form with a valid enquiry whose ${row.field} is ${row.length} characters long`, async () => {
        await fillContactForm(page, enquiry);
      });
      await journey.step(`Then the form shows the error "${row.message}"`, async () => {
        await expect(ui(page).errors, `[REQ AC-4] UI shows the ${row.field} length error`).toContainText(row.message);
      });
    });
  });

  // ---------------- Messages API ----------------
  test('SCN-005: Creating a valid enquiry returns 201 Created', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    let res!: Awaited<ReturnType<Api['post']>>;
    await journey.step('When I POST a valid enquiry to /api/message', async () => {
      res = await api.post(EP.message, { data: validEnquiry(data) });
    });
    await journey.step('Then the response status is 201', async () => {
      expect.soft(res.status, '[REQ AC-5] create enquiry → 201 Created').toBe(REQ.STATUS.CREATED);
    });
    await journey.step('And the response body is {"success": true}', async () => {
      expect.soft(res.body, '[REQ AC-5] create enquiry body').toEqual(REQ.CREATE_BODY);
    });
  });

  REQ.API_BOUNDARIES.forEach((row, i) => {
    const label = typeof row.value === 'number' ? `${row.value} characters` : `"${row.value}"`;
    test(`SCN-006.${i + 1}: The API enforces field boundaries (${row.field} ${label} → ${row.outcome})`, { tag: ['@AC-4', '@AC-6', '@type:boundary', '@layer:api', '@P1', '@boundary'] }, async ({ api, journey, data }) => {
      const value = typeof row.value === 'number' ? ofLength(row.field, row.value) : row.value;
      let res!: Awaited<ReturnType<Api['post']>>;
      await journey.step(`When I POST a valid enquiry to /api/message whose ${row.field} is ${label}`, async () => {
        res = await api.post(EP.message, { data: validEnquiry(data, { [apiFieldName(row.field)]: value }) });
      });
      await journey.step(`Then the enquiry is ${row.outcome}`, async () => {
        if (row.outcome === 'accepted') {
          const outcome = res.status >= 200 && res.status < 300 ? 'accepted' : `rejected (${res.status}: ${res.text.slice(0, 160)})`;
          expect(outcome, `[REQ AC-4] ${row.field} ${label} is accepted`).toBe('accepted');
        } else {
          expect(res.status, `[REQ AC-6] ${row.field} ${label} is rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
        }
      });
      const expectedMessage = row.outcome === 'rejected' ? REQ.LENGTH_MESSAGE[row.field as keyof typeof REQ.LENGTH_MESSAGE] : undefined;
      if (expectedMessage) {
        await journey.step(`And when rejected, the error list contains "${expectedMessage}"`, async () => {
          expect(res.body, `[REQ AC-6] error list contains the ${row.field} length message`).toContain(expectedMessage);
        });
      }
    });
  });

  test('SCN-007: A rejected enquiry is not stored', { tag: ['@AC-6', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
    let token = '';
    const enquiry = validEnquiry(data, { phone: '123' });
    await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
    await journey.step('When I POST an enquiry with a unique subject and a too-short phone to /api/message', async () => {
      const res = await api.post(EP.message, { data: enquiry });
      expect(res.status, '[REQ AC-6] invalid enquiry → 400').toBe(REQ.STATUS.BAD_REQUEST);
    });
    await journey.step('Then the response status is 400', async () => { /* asserted with the request above */ });
    await journey.step('And the authenticated message list does not contain that subject', async () => {
      const subjects = (await staffMessages(api, token)).map((m) => m.subject);
      expect(subjects, '[REQ AC-6] rejected enquiry is not stored').not.toContain(enquiry.subject);
    });
  });

  test('SCN-008: A malformed JSON body is a client error', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
    let status = 0;
    await journey.step('When I POST a body that is not valid JSON to /api/message', async () => {
      status = (await api.post(EP.message, { data: '{"name": "QA malformed", "email": ' })).status;
    });
    await journey.step('Then the response status is 400', async () => {
      expect(status, '[REQ AC-7] malformed JSON → 400 (never 5xx)').toBe(REQ.STATUS.BAD_REQUEST);
    });
  });

  test('SCN-009: Listing enquiries without a staff token is refused', { tag: ['@AC-8', '@type:security', '@layer:api', '@P1', '@security'] }, async ({ api, journey }) => {
    let res!: Awaited<ReturnType<Api['get']>>;
    await journey.step('When I GET /api/message without a token', async () => { res = await api.get(EP.message); });
    await journey.step('Then the response status is 401', async () => {
      expect.soft(res.status, '[REQ AC-8] message list without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
    });
    await journey.step('And the response contains no message data', async () => {
      expect.soft(res.text, '[REQ AC-8] no message data without token').not.toContain('"messages"');
    });
  });

  test('SCN-010: Reading an enquiry without a staff token is refused', { tag: ['@AC-8', '@type:security', '@layer:api', '@P1', '@security'] }, async ({ api, journey, data }) => {
    let id = 0;
    let res!: Awaited<ReturnType<Api['get']>>;
    await journey.step('Given I am authenticated as staff and know the id of an existing enquiry', async () => {
      const list = await staffMessages(api, await staffToken(api, data));
      expect(list.length, 'at least one enquiry exists (precondition)').toBeGreaterThan(0);
      id = list[0].id;
    });
    await journey.step('When I GET /api/message/{id} without a token', async () => { res = await api.get(EP.messageById(id)); });
    await journey.step('Then the response status is 401', async () => {
      expect.soft(res.status, '[REQ AC-8] message detail without token → 401').toBe(REQ.STATUS.UNAUTHORIZED);
    });
    await journey.step('And the response contains no personal data', async () => {
      const leaked = REQ.PERSONAL_DATA_KEYS.filter((k) => res.text.includes(`"${k}"`));
      expect.soft(leaked, '[REQ AC-8] no personal data without token').toEqual([]);
    });
  });

  test('SCN-011: Staff can list enquiries with a valid token', { tag: ['@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    let token = '';
    let res!: Awaited<ReturnType<Api['get']>>;
    await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
    await journey.step('When I GET /api/message with the token cookie', async () => { res = await api.get('/api/messages', { cookies: { token } }); });
    await journey.step('Then the response status is 200', async () => {
      expect(res.status, '[REQ AC-8] message list with token → 200').toBe(REQ.STATUS.OK);
    });
    await journey.step('And every message has id, name, subject and read', async () => {
      const messages = (res.body as { messages?: unknown[] }).messages ?? [];
      const violations = messages.flatMap((m, i) => checkShape(m, MESSAGE_SUMMARY_SCHEMA, `messages[${i}]`));
      expect(violations, '[REQ AC-8] message summary schema').toEqual([]);
    });
  });

  test('SCN-012: Valid staff credentials return a token', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    let res!: Awaited<ReturnType<Api['post']>>;
    await journey.step('When I POST the staff credentials to /api/auth/login', async () => {
      res = await api.post(EP.login, { data: { username: data.staff.username, password: data.staff.password } });
    });
    await journey.step('Then the response status is 200', async () => {
      expect(res.status, '[REQ AC-9] valid login → 200').toBe(REQ.STATUS.OK);
    });
    await journey.step('And the body contains a non-empty "token"', async () => {
      expect(checkShape(res.body, { token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string' }), '[REQ AC-9] login returns a non-empty token').toEqual([]);
    });
  });

  test('SCN-013: Invalid staff credentials are refused', { tag: ['@AC-9', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
    let res!: Awaited<ReturnType<Api['post']>>;
    await journey.step('When I POST the staff username with a wrong password to /api/auth/login', async () => {
      res = await api.post(EP.login, { data: { username: data.staff.username, password: data.wrongPassword } });
    });
    await journey.step('Then the response status is 401', async () => {
      expect.soft(res.status, '[REQ AC-9] invalid login → 401').toBe(REQ.STATUS.UNAUTHORIZED);
    });
    await journey.step('And the body is {"error": "Invalid credentials"}', async () => {
      expect.soft(res.body, '[REQ AC-9] invalid login body').toEqual(REQ.LOGIN_INVALID_BODY);
    });
  });

  // ---------------- Cross-layer ----------------
  test('SCN-014: An enquiry sent from the UI is readable by staff through the API', { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data }) => {
    const enquiry = validEnquiry(data);
    await journey.step('Given I am on the home page', async () => { await page.goto('/'); });
    await journey.step('When I submit the contact form with a unique name and a unique subject', async () => {
      await fillContactForm(page, enquiry);
    });
    await journey.step('And I see the confirmation', async () => {
      await expect(ui(page).confirmation).toBeVisible();
    });
    await journey.step('Then the authenticated message list contains an enquiry with that name and subject', async () => {
      const token = await staffToken(api, data);
      await expect.poll(async () => (await staffMessages(api, token)).some((m) => m.name === enquiry.name && m.subject === enquiry.subject),
        { message: '[REQ AC-10] UI enquiry readable by staff via API', timeout: 10_000 }).toBe(true);
    });
  });

  // ---------------- Rooms catalogue ----------------
  test('SCN-015: The rooms list follows the Room schema', { tag: ['@AC-11', '@type:contract', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: Awaited<ReturnType<Api['get']>>;
    await journey.step('When I GET /api/room', async () => { res = await api.get(EP.rooms); });
    await journey.step('Then the response status is 200', async () => {
      expect(res.status, '[REQ AC-11] room list → 200').toBe(REQ.STATUS.OK);
    });
    await journey.step('And every room matches the Room schema', async () => {
      const list = (res.body as { rooms?: unknown[] }).rooms;
      expect(Array.isArray(list) && list.length > 0, '[REQ AC-11] body has a non-empty "rooms" array').toBe(true);
      const violations = (list ?? []).flatMap((r, i) => checkShape(r, ROOM_SCHEMA, `rooms[${i}]`));
      expect(violations, '[REQ AC-11] every room matches the Room schema').toEqual([]);
    });
  });

  test('SCN-016: An existing room can be fetched by id', { tag: ['@AC-12', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
    let room!: Room;
    let res!: Awaited<ReturnType<Api['get']>>;
    await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
    await journey.step('When I GET /api/room/{id}', async () => { res = await api.get(EP.roomById(room.roomid)); });
    await journey.step('Then the response status is 200', async () => {
      expect(res.status, '[REQ AC-12] existing room → 200').toBe(REQ.STATUS.OK);
    });
    await journey.step('And the body is that room and matches the Room schema', async () => {
      expect.soft((res.body as Room).roomid, '[REQ AC-12] detail is the requested room').toBe(room.roomid);
      expect.soft(checkShape(res.body, ROOM_SCHEMA, 'room'), '[REQ AC-12] detail matches the Room schema').toEqual([]);
    });
  });

  test('SCN-017: An unknown room id returns 404', { tag: ['@AC-12', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
    let unknownId = 0;
    let status = 0;
    await journey.step('Given I know an id that no room has', async () => {
      unknownId = Math.max(...(await rooms(api)).map((r) => r.roomid)) + 100000;
    });
    await journey.step('When I GET /api/room/{id}', async () => { status = (await api.get(EP.roomById(unknownId))).status; });
    await journey.step('Then the response status is 404', async () => {
      expect(status, '[REQ AC-12] unknown room → 404').toBe(REQ.STATUS.NOT_FOUND);
    });
  });

  test('SCN-018: Every API room is shown with its type and nightly price', { tag: ['@AC-13', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey }) => {
    let list: Room[] = [];
    await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
    await journey.step('When I open the home page', async () => { await page.goto('/'); });
    await journey.step("Then each room's type is shown on a room card", async () => {
      for (const room of list) {
        await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] a card shows room type ${room.type}`).toBeVisible();
      }
    });
    await journey.step('And that card shows "£<roomPrice> per night"', async () => {
      for (const room of list) {
        await expect.soft(ui(page).roomCard(room.type).first(), `[REQ AC-13] ${room.type} card shows its nightly price`).toContainText(REQ.PRICE_TEXT(room.roomPrice));
      }
    });
  });

  test("SCN-019: Room card images name their own room type", { tag: ['@AC-14', '@type:accessibility', '@layer:e2e', '@P2'] }, async ({ page, api, journey }) => {
    let list: Room[] = [];
    await journey.step('Given the rooms returned by GET /api/room', async () => { list = await rooms(api); });
    await journey.step('When I open the home page', async () => { await page.goto('/'); });
    await journey.step('Then each room card\'s image has the alternative text "<Type> Room" for that card\'s type', async () => {
      for (const room of list) {
        await expect.soft(ui(page).roomCard(room.type).first().getByRole('img').first(), `[REQ AC-14] ${room.type} card image alt text`).toHaveAccessibleName(REQ.ALT_TEXT(room.type));
      }
    });
  });

  test('SCN-020: The rooms list responds quickly', { tag: ['@AC-15', '@type:performance', '@layer:api', '@P3', '@performance'] }, async ({ api, journey }) => {
    const durations: number[] = [];
    await journey.step('When I GET /api/room 5 times in a row', async () => {
      for (let i = 0; i < REQ.PERF.REQUESTS; i++) durations.push((await api.get(EP.rooms)).durationMs);
    });
    await journey.step('Then every response arrives in under 3000 ms', async () => {
      expect(Math.max(...durations), `[REQ AC-15] slowest of ${REQ.PERF.REQUESTS} GET /api/room < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS);
    });
  });

  // ---------------- Reliability (rev 2) ----------------
  test('SCN-021: A retried enquiry with the same Idempotency-Key is stored only once', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    let token = '';
    const enquiry = validEnquiry(data);
    const idempotencyKey = unique('qa-idem').replace(/\s+/g, '-');
    const statuses: number[] = [];
    await journey.step('Given I am authenticated as staff', async () => { token = await staffToken(api, data); });
    await journey.step('And a valid enquiry with a unique subject and a unique Idempotency-Key', async () => { /* built above */ });
    await journey.step('When I POST that enquiry to /api/message twice with the same Idempotency-Key', async () => {
      for (let i = 0; i < REQ.IDEMPOTENCY.REPEATS; i++) {
        statuses.push((await api.post(EP.message, { data: enquiry, headers: { [REQ.IDEMPOTENCY.HEADER]: idempotencyKey } })).status);
      }
    });
    await journey.step('Then both responses are 2xx', async () => {
      expect.soft(statuses.every((s) => s >= 200 && s < 300) ? 'all 2xx' : `statuses ${statuses.join(', ')}`, '[REQ AC-16] every repeat answers 2xx').toBe('all 2xx');
    });
    await journey.step('And the authenticated message list contains that subject exactly once', async () => {
      const stored = (await staffMessages(api, token)).filter((m) => m.subject === enquiry.subject).length;
      expect.soft(stored, '[REQ AC-16] retried enquiry stored only once').toBe(REQ.IDEMPOTENCY.EXPECTED_STORED);
    });
  });

  test('SCN-022: Repeating GET /api/room/{id} returns an identical body', { tag: ['@AC-16', '@type:idempotency', '@layer:api', '@P3'] }, async ({ api, journey }) => {
    let room!: Room;
    const responses: { status: number; body: unknown }[] = [];
    await journey.step('Given I know the id of a room from GET /api/room', async () => { room = (await rooms(api))[0]; });
    await journey.step('When I GET /api/room/{id} three times', async () => {
      for (let i = 0; i < REQ.IDEMPOTENCY.GET_REPEATS; i++) {
        const r = await api.get(EP.roomById(room.roomid));
        responses.push({ status: r.status, body: r.body });
      }
    });
    await journey.step('Then all three responses are 200 with identical bodies', async () => {
      expect.soft(responses.map((r) => r.status), '[REQ AC-16] repeated GET all 200').toEqual(Array(REQ.IDEMPOTENCY.GET_REPEATS).fill(REQ.STATUS.OK));
      expect.soft(responses.map((r) => r.body), '[REQ AC-16] repeated GET returns identical bodies').toEqual(Array(REQ.IDEMPOTENCY.GET_REPEATS).fill(responses[0].body));
    });
  });
});
