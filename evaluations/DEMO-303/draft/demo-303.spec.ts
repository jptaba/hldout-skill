/**
 * Held-out acceptance tests for DEMO-303 — "Partner booking API".
 * Generated from evaluations/DEMO-303/scenarios.feature (requirement + attachments only). API only.
 */
import { test, expect, unique, checkShape, type Api, type ApiResponse, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from DEMO-303 + attachments (never edit during hardening)
const REQ = {
  STATUS: { OK: 200, NO_CONTENT: 204, BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404 },
  BAD_CREDENTIALS_BODY: { reason: 'Bad credentials' },
  MISSING_FIELD_ROWS: ['firstname', 'lastname', 'depositpaid', 'bookingdates.checkin'], // booking-rules.csv R1 R2 R4 R5
  BOUNDARY_ROWS: [ // booking-rules.csv R3 R6
    { change: 'totalprice 0', totalprice: 0, checkoutOffset: 4, outcome: 'accepted' },
    { change: 'totalprice -1', totalprice: -1, checkoutOffset: 4, outcome: 'rejected' },
    { change: 'checkout = checkin + 1 day', totalprice: 150, checkoutOffset: 1, outcome: 'accepted' },
    { change: 'checkout = checkin (same day)', totalprice: 150, checkoutOffset: 0, outcome: 'rejected' },
    { change: 'checkout = checkin - 4 days', totalprice: 150, checkoutOffset: -4, outcome: 'rejected' },
  ],
  WRITE_METHODS: ['PUT', 'PATCH', 'DELETE'],
  PERF: { REQUESTS: 5, MAX_MS: 3000 },
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = { auth: '/auth', bookings: '/booking', booking: (id: number | string) => `/booking/${id}` };

interface Booking { firstname: string; lastname: string; totalprice: number; depositpaid: boolean; bookingdates: { checkin: string; checkout: string }; additionalneeds?: string }

const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
function validBooking(data: TestData, over: Partial<Booking> = {}): Booking {
  return {
    firstname: unique('QA'), lastname: unique('Heldout'), totalprice: data.booking.totalprice, depositpaid: data.booking.depositpaid,
    bookingdates: { checkin: data.booking.checkin, checkout: data.booking.checkout }, additionalneeds: data.booking.additionalneeds, ...over,
  };
}
function without(b: Booking, dotted: string): Record<string, unknown> {
  const copy = JSON.parse(JSON.stringify(b)) as Record<string, Record<string, unknown>>;
  const [a, c] = dotted.split('.');
  if (c) delete copy[a][c]; else delete copy[a];
  return copy;
}

// ---- API mechanics (verified during hardening) --------------------------------------------------
async function token(api: Api, data: TestData): Promise<string> {
  const r = await api.post<{ token?: string }>(EP.auth, { data: { username: data.partner.username, password: data.partner.password } });
  expect(r.status, 'auth (precondition)').toBe(REQ.STATUS.OK);
  return r.body.token!;
}
const basic = (data: TestData) => ({ Authorization: `Basic ${Buffer.from(`${data.partner.username}:${data.partner.password}`).toString('base64')}` });
async function create(api: Api, b: Booking): Promise<number> {
  const r = await api.post<{ bookingid: number }>(EP.bookings, { data: b });
  expect(r.status, 'create booking (precondition)').toBe(REQ.STATUS.OK);
  return r.body.bookingid;
}
async function search(api: Api, firstname: string, lastname: string): Promise<number[]> {
  const r = await api.get<{ bookingid: number }[]>(EP.bookings, { params: { firstname, lastname } });
  return Array.isArray(r.body) ? r.body.map((x) => x.bookingid) : [];
}
async function goneId(api: Api, data: TestData): Promise<number> {
  const id = await create(api, validBooking(data));
  const del = await api.delete(EP.booking(id), { headers: basic(data) });
  expect(del.status < 300, 'cleanup delete succeeded (precondition)').toBe(true);
  return id;
}
async function write(api: Api, method: string, id: number, body: unknown, headers: Record<string, string> = {}): Promise<ApiResponse> {
  return api.call(method, EP.booking(id), method === 'DELETE' ? { headers } : { data: body, headers });
}

test.describe('DEMO-303 Partner booking API', () => {
  test('SCN-001: Valid partner credentials return a token', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    let r!: ApiResponse;
    await journey.step('When I POST the partner credentials to /auth', async () => { r = await api.post(EP.auth, { data: { username: data.partner.username, password: data.partner.password } }); });
    await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-1] valid auth → 200').toBe(REQ.STATUS.OK); });
    await journey.step('And the body contains a non-empty "token"', async () => {
      expect(checkShape(r.body, { token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string' }), '[REQ AC-1] token returned').toEqual([]);
    });
  });

  test('SCN-002: Invalid credentials are refused with 401', { tag: ['@AC-2', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    let r!: ApiResponse;
    await journey.step('When I POST the partner username with a wrong password to /auth', async () => { r = await api.post(EP.auth, { data: { username: data.partner.username, password: data.wrongPassword } }); });
    await journey.step('Then the response status is 401', async () => { expect.soft(r.status, '[REQ AC-2] invalid auth → 401').toBe(REQ.STATUS.UNAUTHORIZED); });
    await journey.step('And the body is {"reason": "Bad credentials"}', async () => { expect.soft(r.body, '[REQ AC-2] invalid auth body').toEqual(REQ.BAD_CREDENTIALS_BODY); });
  });

  test('SCN-003: Creating a valid booking echoes it with an id', { tag: ['@AC-3', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    const b = validBooking(data);
    let r!: ApiResponse<{ bookingid: unknown; booking: unknown }>;
    await journey.step('When I POST a valid booking with a unique name to /booking', async () => { r = await api.post(EP.bookings, { data: b }); });
    await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-3] create → 200').toBe(REQ.STATUS.OK); });
    await journey.step('And the body has an integer "bookingid" and "booking" equal to what I sent', async () => {
      expect.soft(Number.isInteger(r.body.bookingid), '[REQ AC-3] integer bookingid').toBe(true);
      expect.soft(r.body.booking, '[REQ AC-3] booking echoed exactly').toEqual(b);
    });
  });

  test('SCN-004: A created booking can be read back unchanged', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    const b = validBooking(data);
    let id = 0; let r!: ApiResponse;
    await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
    await journey.step('When I GET /booking/{id}', async () => { r = await api.get(EP.booking(id)); });
    await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-4] read → 200').toBe(REQ.STATUS.OK); });
    await journey.step('And the body equals the booking I created', async () => { expect(r.body, '[REQ AC-4] stored booking identical').toEqual(b); });
  });

  test('SCN-005: Reading a booking that does not exist returns 404', { tag: ['@AC-4', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
    let id = 0; let status = 0;
    await journey.step('Given the id of a booking that no longer exists', async () => { id = await goneId(api, data); });
    await journey.step('When I GET /booking/{id}', async () => { status = (await api.get(EP.booking(id))).status; });
    await journey.step('Then the response status is 404', async () => { expect(status, '[REQ AC-4] unknown id → 404').toBe(REQ.STATUS.NOT_FOUND); });
  });

  test('SCN-006: Searching by name finds the booking', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
    const b = validBooking(data);
    let id = 0; let r!: ApiResponse<{ bookingid: number }[]>;
    await journey.step('Given I created a valid booking with a unique first and last name', async () => { id = await create(api, b); });
    await journey.step('When I GET /booking with that firstname and lastname', async () => { r = await api.get(EP.bookings, { params: { firstname: b.firstname, lastname: b.lastname } }); });
    await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-5] search → 200').toBe(REQ.STATUS.OK); });
    await journey.step('And the result contains the created booking id', async () => {
      expect((Array.isArray(r.body) ? r.body : []).map((x) => x.bookingid), '[REQ AC-5] search includes the booking').toContain(id);
    });
  });

  REQ.MISSING_FIELD_ROWS.forEach((field, i) => {
    test(`SCN-007.${i + 1}: A booking missing a required field is rejected with 400 (${field})`, { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
      const b = validBooking(data);
      let status = 0;
      await journey.step(`When I POST a valid booking without ${field}`, async () => { status = (await api.post(EP.bookings, { data: without(b, field) })).status; });
      await journey.step('Then the response status is 400', async () => { expect.soft(status, `[REQ AC-6] missing ${field} → 400`).toBe(REQ.STATUS.BAD_REQUEST); });
      await journey.step('And the booking is not stored', async () => {
        if (field === 'firstname' || field === 'lastname') return; // cannot search by an absent name; covered by the status assertion
        expect.soft(await search(api, b.firstname, b.lastname), `[REQ AC-6] booking without ${field} not stored`).toEqual([]);
      });
    });
  });

  REQ.BOUNDARY_ROWS.forEach((row, i) => {
    test(`SCN-008.${i + 1}: Price and date boundaries are enforced (${row.change} → ${row.outcome})`, { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
      const b = validBooking(data, { totalprice: row.totalprice, bookingdates: { checkin: data.booking.checkin, checkout: addDays(data.booking.checkin, row.checkoutOffset) } });
      let r!: ApiResponse;
      await journey.step(`When I POST a valid booking with ${row.change}`, async () => { r = await api.post(EP.bookings, { data: b }); });
      await journey.step(`Then the booking is ${row.outcome}`, async () => {
        if (row.outcome === 'accepted') {
          expect(r.status, `[REQ AC-6] ${row.change} accepted`).toBe(REQ.STATUS.OK);
        } else {
          expect.soft(r.status, `[REQ AC-6] ${row.change} rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
          expect.soft(await search(api, b.firstname, b.lastname), `[REQ AC-6] ${row.change} not stored`).toEqual([]);
        }
      });
    });
  });

  REQ.WRITE_METHODS.forEach((method, i) => {
    test(`SCN-009.${i + 1}: Writes without authentication are refused and change nothing (${method})`, { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
      const b = validBooking(data);
      let id = 0; let status = 0;
      await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
      await journey.step(`When I ${method} /booking/{id} without authentication`, async () => {
        status = (await write(api, method, id, method === 'PATCH' ? { firstname: 'Changed' } : { ...b, firstname: 'Changed' })).status;
      });
      await journey.step('Then the response status is 403', async () => { expect.soft(status, `[REQ AC-7] ${method} without auth → 403`).toBe(REQ.STATUS.FORBIDDEN); });
      await journey.step('And the stored booking is unchanged', async () => { expect.soft((await api.get(EP.booking(id))).body, `[REQ AC-7] ${method} without auth changes nothing`).toEqual(b); });
    });
  });

  (['token cookie', 'Basic auth'] as const).forEach((auth, i) => {
    test(`SCN-010.${i + 1}: A full update succeeds with either authentication method (${auth})`, { tag: ['@AC-7', '@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
      const b = validBooking(data);
      const changed = { ...b, lastname: unique('Updated'), totalprice: 222 };
      let id = 0; let r!: ApiResponse;
      await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
      await journey.step(`When I PUT a changed booking to /booking/{id} authenticated with ${auth}`, async () => {
        const headers = auth === 'Basic auth' ? basic(data) : { Cookie: `token=${await token(api, data)}` };
        r = await write(api, 'PUT', id, changed, headers);
      });
      await journey.step('Then the response status is 200', async () => { expect(r.status, `[REQ AC-7] PUT with ${auth} → 200`).toBe(REQ.STATUS.OK); });
      await journey.step('And the body equals the changed booking', async () => { expect(r.body, '[REQ AC-8] PUT returns the updated booking').toEqual(changed); });
    });
  });

  test('SCN-011: Repeating the same PUT is idempotent', { tag: ['@AC-8', '@type:idempotency', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
    const b = validBooking(data);
    const changed = { ...b, additionalneeds: 'Late checkout' };
    let id = 0; const results: { status: number; body: unknown }[] = [];
    await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
    await journey.step('When I PUT the same changed booking twice', async () => {
      for (let n = 0; n < 2; n++) { const r = await write(api, 'PUT', id, changed, basic(data)); results.push({ status: r.status, body: r.body }); }
    });
    await journey.step('Then both responses are 200 with identical bodies', async () => {
      expect.soft(results.map((r) => r.status), '[REQ AC-8] repeated PUT → 200 both times').toEqual([REQ.STATUS.OK, REQ.STATUS.OK]);
      expect.soft(results[1].body, '[REQ AC-8] repeated PUT returns identical body').toEqual(results[0].body);
    });
    await journey.step('And GET /booking/{id} returns that changed booking', async () => { expect.soft((await api.get(EP.booking(id))).body, '[REQ AC-8] stored state after repeated PUT').toEqual(changed); });
  });

  test('SCN-012: PATCH changes only the supplied fields', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
    const b = validBooking(data);
    let id = 0; let r!: ApiResponse;
    await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
    await journey.step('When I PATCH only the firstname', async () => { r = await write(api, 'PATCH', id, { firstname: 'Patched' }, basic(data)); });
    await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-9] PATCH → 200').toBe(REQ.STATUS.OK); });
    await journey.step('And only the firstname differs from the original booking', async () => {
      expect((await api.get(EP.booking(id))).body, '[REQ AC-9] only firstname changed').toEqual({ ...b, firstname: 'Patched' });
    });
  });

  test('SCN-013: Cancelling a booking returns 204 and removes it', { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
    let id = 0; let status = 0;
    await journey.step('Given I created a valid booking', async () => { id = await create(api, validBooking(data)); });
    await journey.step('When I DELETE /booking/{id} with Basic authentication', async () => { status = (await write(api, 'DELETE', id, undefined, basic(data))).status; });
    await journey.step('Then the response status is 204', async () => { expect.soft(status, '[REQ AC-10] DELETE → 204').toBe(REQ.STATUS.NO_CONTENT); });
    await journey.step('And GET /booking/{id} responds 404', async () => { expect.soft((await api.get(EP.booking(id))).status, '[REQ AC-10] deleted booking → 404').toBe(REQ.STATUS.NOT_FOUND); });
  });

  REQ.WRITE_METHODS.forEach((method, i) => {
    test(`SCN-014.${i + 1}: Writing to a booking that does not exist returns 404 (${method})`, { tag: ['@AC-11', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
      let id = 0; let status = 0;
      await journey.step('Given the id of a booking that no longer exists', async () => { id = await goneId(api, data); });
      await journey.step(`When I ${method} /booking/{id} with authentication`, async () => {
        status = (await write(api, method, id, method === 'PATCH' ? { firstname: 'Ghost' } : validBooking(data), basic(data))).status;
      });
      await journey.step('Then the response status is 404', async () => { expect(status, `[REQ AC-11] ${method} unknown id → 404`).toBe(REQ.STATUS.NOT_FOUND); });
    });
  });

  test('SCN-015: Reading a booking is fast', { tag: ['@AC-12', '@type:performance', '@layer:api', '@P3'] }, async ({ api, journey, data }) => {
    let id = 0; const ms: number[] = [];
    await journey.step('Given I created a valid booking', async () => { id = await create(api, validBooking(data)); });
    await journey.step('When I GET /booking/{id} 5 times in a row', async () => { for (let n = 0; n < REQ.PERF.REQUESTS; n++) ms.push((await api.get(EP.booking(id))).durationMs); });
    await journey.step('Then every response arrives in under 3000 ms', async () => { expect(Math.max(...ms), `[REQ AC-12] slowest of ${REQ.PERF.REQUESTS} < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS); });
  });
});
