# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-303\tests\demo-303.spec.ts >> DEMO-303 Partner booking API >> SCN-007.1: A booking missing a required field is rejected with 400 (firstname)
- Location: evaluations\DEMO-303\tests\demo-303.spec.ts:125:5

# Error details

```
Error: [REQ AC-6] missing firstname → 400

expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 500
```

# Test source

```ts
  29  | const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  30  | function validBooking(data: TestData, over: Partial<Booking> = {}): Booking {
  31  |   return {
  32  |     firstname: unique('QA'), lastname: unique('Heldout'), totalprice: data.booking.totalprice, depositpaid: data.booking.depositpaid,
  33  |     bookingdates: { checkin: data.booking.checkin, checkout: data.booking.checkout }, additionalneeds: data.booking.additionalneeds, ...over,
  34  |   };
  35  | }
  36  | function without(b: Booking, dotted: string): Record<string, unknown> {
  37  |   const copy = JSON.parse(JSON.stringify(b)) as Record<string, Record<string, unknown>>;
  38  |   const [a, c] = dotted.split('.');
  39  |   if (c) delete copy[a][c]; else delete copy[a];
  40  |   return copy;
  41  | }
  42  | 
  43  | // ---- API mechanics (verified during hardening) --------------------------------------------------
  44  | async function token(api: Api, data: TestData): Promise<string> {
  45  |   const r = await api.post<{ token?: string }>(EP.auth, { data: { username: data.partner.username, password: data.partner.password } });
  46  |   expect(r.status, 'auth (precondition)').toBe(REQ.STATUS.OK);
  47  |   return r.body.token!;
  48  | }
  49  | const basic = (data: TestData) => ({ Authorization: `Basic ${Buffer.from(`${data.partner.username}:${data.partner.password}`).toString('base64')}` });
  50  | async function create(api: Api, b: Booking): Promise<number> {
  51  |   const r = await api.post<{ bookingid: number }>(EP.bookings, { data: b });
  52  |   expect(r.status, 'create booking (precondition)').toBe(REQ.STATUS.OK);
  53  |   return r.body.bookingid;
  54  | }
  55  | async function search(api: Api, firstname: string, lastname: string): Promise<number[]> {
  56  |   const r = await api.get<{ bookingid: number }[]>(EP.bookings, { params: { firstname, lastname } });
  57  |   return Array.isArray(r.body) ? r.body.map((x) => x.bookingid) : [];
  58  | }
  59  | async function goneId(api: Api, data: TestData): Promise<number> {
  60  |   const id = await create(api, validBooking(data));
  61  |   const del = await api.delete(EP.booking(id), { headers: basic(data) });
  62  |   expect(del.status < 300, 'cleanup delete succeeded (precondition)').toBe(true);
  63  |   return id;
  64  | }
  65  | async function write(api: Api, method: string, id: number, body: unknown, headers: Record<string, string> = {}): Promise<ApiResponse> {
  66  |   return api.call(method, EP.booking(id), method === 'DELETE' ? { headers } : { data: body, headers });
  67  | }
  68  | 
  69  | test.describe('DEMO-303 Partner booking API', () => {
  70  |   test('SCN-001: Valid partner credentials return a token', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  71  |     let r!: ApiResponse;
  72  |     await journey.step('When I POST the partner credentials to /auth', async () => { r = await api.post(EP.auth, { data: { username: data.partner.username, password: data.partner.password } }); });
  73  |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-1] valid auth → 200').toBe(REQ.STATUS.OK); });
  74  |     await journey.step('And the body contains a non-empty "token"', async () => {
  75  |       expect(checkShape(r.body, { token: (v) => (typeof v === 'string' && v.length > 0) || 'should be a non-empty string' }), '[REQ AC-1] token returned').toEqual([]);
  76  |     });
  77  |   });
  78  | 
  79  |   test('SCN-002: Invalid credentials are refused with 401', { tag: ['@AC-2', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  80  |     let r!: ApiResponse;
  81  |     await journey.step('When I POST the partner username with a wrong password to /auth', async () => { r = await api.post(EP.auth, { data: { username: data.partner.username, password: data.wrongPassword } }); });
  82  |     await journey.step('Then the response status is 401', async () => { expect.soft(r.status, '[REQ AC-2] invalid auth → 401').toBe(REQ.STATUS.UNAUTHORIZED); });
  83  |     await journey.step('And the body is {"reason": "Bad credentials"}', async () => { expect.soft(r.body, '[REQ AC-2] invalid auth body').toEqual(REQ.BAD_CREDENTIALS_BODY); });
  84  |   });
  85  | 
  86  |   test('SCN-003: Creating a valid booking echoes it with an id', { tag: ['@AC-3', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  87  |     const b = validBooking(data);
  88  |     let r!: ApiResponse<{ bookingid: unknown; booking: unknown }>;
  89  |     await journey.step('When I POST a valid booking with a unique name to /booking', async () => { r = await api.post(EP.bookings, { data: b }); });
  90  |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-3] create → 200').toBe(REQ.STATUS.OK); });
  91  |     await journey.step('And the body has an integer "bookingid" and "booking" equal to what I sent', async () => {
  92  |       expect.soft(Number.isInteger(r.body.bookingid), '[REQ AC-3] integer bookingid').toBe(true);
  93  |       expect.soft(r.body.booking, '[REQ AC-3] booking echoed exactly').toEqual(b);
  94  |     });
  95  |   });
  96  | 
  97  |   test('SCN-004: A created booking can be read back unchanged', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  98  |     const b = validBooking(data);
  99  |     let id = 0; let r!: ApiResponse;
  100 |     await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
  101 |     await journey.step('When I GET /booking/{id}', async () => { r = await api.get(EP.booking(id)); });
  102 |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-4] read → 200').toBe(REQ.STATUS.OK); });
  103 |     await journey.step('And the body equals the booking I created', async () => { expect(r.body, '[REQ AC-4] stored booking identical').toEqual(b); });
  104 |   });
  105 | 
  106 |   test('SCN-005: Reading a booking that does not exist returns 404', { tag: ['@AC-4', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
  107 |     let id = 0; let status = 0;
  108 |     await journey.step('Given the id of a booking that no longer exists', async () => { id = await goneId(api, data); });
  109 |     await journey.step('When I GET /booking/{id}', async () => { status = (await api.get(EP.booking(id))).status; });
  110 |     await journey.step('Then the response status is 404', async () => { expect(status, '[REQ AC-4] unknown id → 404').toBe(REQ.STATUS.NOT_FOUND); });
  111 |   });
  112 | 
  113 |   test('SCN-006: Searching by name finds the booking', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
  114 |     const b = validBooking(data);
  115 |     let id = 0; let r!: ApiResponse<{ bookingid: number }[]>;
  116 |     await journey.step('Given I created a valid booking with a unique first and last name', async () => { id = await create(api, b); });
  117 |     await journey.step('When I GET /booking with that firstname and lastname', async () => { r = await api.get(EP.bookings, { params: { firstname: b.firstname, lastname: b.lastname } }); });
  118 |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-5] search → 200').toBe(REQ.STATUS.OK); });
  119 |     await journey.step('And the result contains the created booking id', async () => {
  120 |       expect((Array.isArray(r.body) ? r.body : []).map((x) => x.bookingid), '[REQ AC-5] search includes the booking').toContain(id);
  121 |     });
  122 |   });
  123 | 
  124 |   REQ.MISSING_FIELD_ROWS.forEach((field, i) => {
  125 |     test(`SCN-007.${i + 1}: A booking missing a required field is rejected with 400 (${field})`, { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  126 |       const b = validBooking(data);
  127 |       let status = 0;
  128 |       await journey.step(`When I POST a valid booking without ${field}`, async () => { status = (await api.post(EP.bookings, { data: without(b, field) })).status; });
> 129 |       await journey.step('Then the response status is 400', async () => { expect.soft(status, `[REQ AC-6] missing ${field} → 400`).toBe(REQ.STATUS.BAD_REQUEST); });
      |                                                                                                                                    ^ Error: [REQ AC-6] missing firstname → 400
  130 |       await journey.step('And the booking is not stored', async () => {
  131 |         if (field === 'firstname' || field === 'lastname') return; // cannot search by an absent name; covered by the status assertion
  132 |         expect.soft(await search(api, b.firstname, b.lastname), `[REQ AC-6] booking without ${field} not stored`).toEqual([]);
  133 |       });
  134 |     });
  135 |   });
  136 | 
  137 |   REQ.BOUNDARY_ROWS.forEach((row, i) => {
  138 |     test(`SCN-008.${i + 1}: Price and date boundaries are enforced (${row.change} → ${row.outcome})`, { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  139 |       const b = validBooking(data, { totalprice: row.totalprice, bookingdates: { checkin: data.booking.checkin, checkout: addDays(data.booking.checkin, row.checkoutOffset) } });
  140 |       let r!: ApiResponse;
  141 |       await journey.step(`When I POST a valid booking with ${row.change}`, async () => { r = await api.post(EP.bookings, { data: b }); });
  142 |       await journey.step(`Then the booking is ${row.outcome}`, async () => {
  143 |         if (row.outcome === 'accepted') {
  144 |           expect(r.status, `[REQ AC-6] ${row.change} accepted`).toBe(REQ.STATUS.OK);
  145 |         } else {
  146 |           expect.soft(r.status, `[REQ AC-6] ${row.change} rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  147 |           expect.soft(await search(api, b.firstname, b.lastname), `[REQ AC-6] ${row.change} not stored`).toEqual([]);
  148 |         }
  149 |       });
  150 |     });
  151 |   });
  152 | 
  153 |   REQ.WRITE_METHODS.forEach((method, i) => {
  154 |     test(`SCN-009.${i + 1}: Writes without authentication are refused and change nothing (${method})`, { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  155 |       const b = validBooking(data);
  156 |       let id = 0; let status = 0;
  157 |       await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
  158 |       await journey.step(`When I ${method} /booking/{id} without authentication`, async () => {
  159 |         status = (await write(api, method, id, method === 'PATCH' ? { firstname: 'Changed' } : { ...b, firstname: 'Changed' })).status;
  160 |       });
  161 |       await journey.step('Then the response status is 403', async () => { expect.soft(status, `[REQ AC-7] ${method} without auth → 403`).toBe(REQ.STATUS.FORBIDDEN); });
  162 |       await journey.step('And the stored booking is unchanged', async () => { expect.soft((await api.get(EP.booking(id))).body, `[REQ AC-7] ${method} without auth changes nothing`).toEqual(b); });
  163 |     });
  164 |   });
  165 | 
  166 |   (['token cookie', 'Basic auth'] as const).forEach((auth, i) => {
  167 |     test(`SCN-010.${i + 1}: A full update succeeds with either authentication method (${auth})`, { tag: ['@AC-7', '@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  168 |       const b = validBooking(data);
  169 |       const changed = { ...b, lastname: unique('Updated'), totalprice: 222 };
  170 |       let id = 0; let r!: ApiResponse;
  171 |       await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
  172 |       await journey.step(`When I PUT a changed booking to /booking/{id} authenticated with ${auth}`, async () => {
  173 |         const headers = auth === 'Basic auth' ? basic(data) : { Cookie: `token=${await token(api, data)}` };
  174 |         r = await write(api, 'PUT', id, changed, headers);
  175 |       });
  176 |       await journey.step('Then the response status is 200', async () => { expect(r.status, `[REQ AC-7] PUT with ${auth} → 200`).toBe(REQ.STATUS.OK); });
  177 |       await journey.step('And the body equals the changed booking', async () => { expect(r.body, '[REQ AC-8] PUT returns the updated booking').toEqual(changed); });
  178 |     });
  179 |   });
  180 | 
  181 |   test('SCN-011: Repeating the same PUT is idempotent', { tag: ['@AC-8', '@type:idempotency', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
  182 |     const b = validBooking(data);
  183 |     const changed = { ...b, additionalneeds: 'Late checkout' };
  184 |     let id = 0; const results: { status: number; body: unknown }[] = [];
  185 |     await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
  186 |     await journey.step('When I PUT the same changed booking twice', async () => {
  187 |       for (let n = 0; n < 2; n++) { const r = await write(api, 'PUT', id, changed, basic(data)); results.push({ status: r.status, body: r.body }); }
  188 |     });
  189 |     await journey.step('Then both responses are 200 with identical bodies', async () => {
  190 |       expect.soft(results.map((r) => r.status), '[REQ AC-8] repeated PUT → 200 both times').toEqual([REQ.STATUS.OK, REQ.STATUS.OK]);
  191 |       expect.soft(results[1].body, '[REQ AC-8] repeated PUT returns identical body').toEqual(results[0].body);
  192 |     });
  193 |     await journey.step('And GET /booking/{id} returns that changed booking', async () => { expect.soft((await api.get(EP.booking(id))).body, '[REQ AC-8] stored state after repeated PUT').toEqual(changed); });
  194 |   });
  195 | 
  196 |   test('SCN-012: PATCH changes only the supplied fields', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
  197 |     const b = validBooking(data);
  198 |     let id = 0; let r!: ApiResponse;
  199 |     await journey.step('Given I created a valid booking', async () => { id = await create(api, b); });
  200 |     await journey.step('When I PATCH only the firstname', async () => { r = await write(api, 'PATCH', id, { firstname: 'Patched' }, basic(data)); });
  201 |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-9] PATCH → 200').toBe(REQ.STATUS.OK); });
  202 |     await journey.step('And only the firstname differs from the original booking', async () => {
  203 |       expect((await api.get(EP.booking(id))).body, '[REQ AC-9] only firstname changed').toEqual({ ...b, firstname: 'Patched' });
  204 |     });
  205 |   });
  206 | 
  207 |   test('SCN-013: Cancelling a booking returns 204 and removes it', { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  208 |     let id = 0; let status = 0;
  209 |     await journey.step('Given I created a valid booking', async () => { id = await create(api, validBooking(data)); });
  210 |     await journey.step('When I DELETE /booking/{id} with Basic authentication', async () => { status = (await write(api, 'DELETE', id, undefined, { Authorisation: basic(data).Authorization })).status; });
  211 |     await journey.step('Then the response status is 204', async () => { expect.soft(status, '[REQ AC-10] DELETE → 204').toBe(REQ.STATUS.NO_CONTENT); });
  212 |     await journey.step('And GET /booking/{id} responds 404', async () => { expect.soft((await api.get(EP.booking(id))).status, '[REQ AC-10] deleted booking → 404').toBe(REQ.STATUS.NOT_FOUND); });
  213 |   });
  214 | 
  215 |   REQ.WRITE_METHODS.forEach((method, i) => {
  216 |     test(`SCN-014.${i + 1}: Writing to a booking that does not exist returns 404 (${method})`, { tag: ['@AC-11', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data }) => {
  217 |       let id = 0; let status = 0;
  218 |       await journey.step('Given the id of a booking that no longer exists', async () => { id = await goneId(api, data); });
  219 |       await journey.step(`When I ${method} /booking/{id} with authentication`, async () => {
  220 |         status = (await write(api, method, id, method === 'PATCH' ? { firstname: 'Ghost' } : validBooking(data), basic(data))).status;
  221 |       });
  222 |       await journey.step('Then the response status is 404', async () => { expect(status, `[REQ AC-11] ${method} unknown id → 404`).toBe(REQ.STATUS.NOT_FOUND); });
  223 |     });
  224 |   });
  225 | 
  226 |   test('SCN-015: Reading a booking is fast', { tag: ['@AC-12', '@type:performance', '@layer:api', '@P3'] }, async ({ api, journey, data }) => {
  227 |     let id = 0; const ms: number[] = [];
  228 |     await journey.step('Given I created a valid booking', async () => { id = await create(api, validBooking(data)); });
  229 |     await journey.step('When I GET /booking/{id} 5 times in a row', async () => { for (let n = 0; n < REQ.PERF.REQUESTS; n++) ms.push((await api.get(EP.booking(id))).durationMs); });
```