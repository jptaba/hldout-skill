# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-303\tests\demo-303.spec.ts >> DEMO-303 Partner booking API >> SCN-014.3: Writing to a booking that does not exist returns 404 (DELETE)
- Location: evaluations\DEMO-303\tests\demo-303.spec.ts:236:5

# Error details

```
Error: [REQ AC-11] DELETE unknown id → 404

expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 405
```

# Test source

```ts
  142 | 
  143 |   REQ.MISSING_FIELD_ROWS.forEach((field, i) => {
  144 |     test(`SCN-007.${i + 1}: A booking missing a required field is rejected with 400 (${field})`, { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  145 |       const b = validBooking(data);
  146 |       let status = 0;
  147 |       await journey.step(`When I POST a valid booking without ${field}`, async () => { const r = await api.post(EP.bookings, { data: without(b, field) }); status = r.status; trackCreated(seed, api, data, r); });
  148 |       await journey.step('Then the response status is 400', async () => { expect.soft(status, `[REQ AC-6] missing ${field} → 400`).toBe(REQ.STATUS.BAD_REQUEST); });
  149 |       await journey.step('And the booking is not stored', async () => {
  150 |         if (field === 'firstname' || field === 'lastname') return; // cannot search by an absent name; covered by the status assertion
  151 |         expect.soft(await search(api, b.firstname, b.lastname), `[REQ AC-6] booking without ${field} not stored`).toEqual([]);
  152 |       });
  153 |     });
  154 |   });
  155 | 
  156 |   REQ.BOUNDARY_ROWS.forEach((row, i) => {
  157 |     test(`SCN-008.${i + 1}: Price and date boundaries are enforced (${row.change} → ${row.outcome})`, { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  158 |       const b = validBooking(data, { totalprice: row.totalprice, bookingdates: { checkin: data.booking.checkin, checkout: addDays(data.booking.checkin, row.checkoutOffset) } });
  159 |       let r!: ApiResponse;
  160 |       await journey.step(`When I POST a valid booking with ${row.change}`, async () => { r = await api.post(EP.bookings, { data: b }); trackCreated(seed, api, data, r); });
  161 |       await journey.step(`Then the booking is ${row.outcome}`, async () => {
  162 |         if (row.outcome === 'accepted') {
  163 |           expect(r.status, `[REQ AC-6] ${row.change} accepted`).toBe(REQ.STATUS.OK);
  164 |         } else {
  165 |           expect.soft(r.status, `[REQ AC-6] ${row.change} rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  166 |           expect.soft(await search(api, b.firstname, b.lastname), `[REQ AC-6] ${row.change} not stored`).toEqual([]);
  167 |         }
  168 |       });
  169 |     });
  170 |   });
  171 | 
  172 |   REQ.WRITE_METHODS.forEach((method, i) => {
  173 |     test(`SCN-009.${i + 1}: Writes without authentication are refused and change nothing (${method})`, { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  174 |       const b = validBooking(data);
  175 |       let id = 0; let status = 0;
  176 |       await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, b); });
  177 |       await journey.step(`When I ${method} /booking/{id} without authentication`, async () => {
  178 |         status = (await write(api, method, id, method === 'PATCH' ? { firstname: 'Changed' } : { ...b, firstname: 'Changed' })).status;
  179 |       });
  180 |       await journey.step('Then the response status is 403', async () => { expect.soft(status, `[REQ AC-7] ${method} without auth → 403`).toBe(REQ.STATUS.FORBIDDEN); });
  181 |       await journey.step('And the stored booking is unchanged', async () => { expect.soft((await api.get(EP.booking(id))).body, `[REQ AC-7] ${method} without auth changes nothing`).toEqual(b); });
  182 |     });
  183 |   });
  184 | 
  185 |   (['token cookie', 'Basic auth'] as const).forEach((auth, i) => {
  186 |     test(`SCN-010.${i + 1}: A full update succeeds with either authentication method (${auth})`, { tag: ['@AC-7', '@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  187 |       const b = validBooking(data);
  188 |       const changed = { ...b, lastname: unique('Updated'), totalprice: 222 };
  189 |       let id = 0; let r!: ApiResponse;
  190 |       await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, b); });
  191 |       await journey.step(`When I PUT a changed booking to /booking/{id} authenticated with ${auth}`, async () => {
  192 |         // Auth pre-step: token acquired once per worker via POST /auth (token issuance itself is covered by SCN-001).
  193 |         const headers = auth === 'Basic auth' ? basic(data) : { Cookie: `token=${await seed.once('partner-token', 'partner token (POST /auth)', () => token(api, data))}` };
  194 |         r = await write(api, 'PUT', id, changed, headers);
  195 |       });
  196 |       await journey.step('Then the response status is 200', async () => { expect(r.status, `[REQ AC-7] PUT with ${auth} → 200`).toBe(REQ.STATUS.OK); });
  197 |       await journey.step('And the body equals the changed booking', async () => { expect(r.body, '[REQ AC-8] PUT returns the updated booking').toEqual(changed); });
  198 |     });
  199 |   });
  200 | 
  201 |   test('SCN-011: Repeating the same PUT is idempotent', { tag: ['@AC-8', '@type:idempotency', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  202 |     const b = validBooking(data);
  203 |     const changed = { ...b, additionalneeds: 'Late checkout' };
  204 |     let id = 0; const results: { status: number; body: unknown }[] = [];
  205 |     await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, b); });
  206 |     await journey.step('When I PUT the same changed booking twice', async () => {
  207 |       for (let n = 0; n < 2; n++) { const r = await write(api, 'PUT', id, changed, basic(data)); results.push({ status: r.status, body: r.body }); }
  208 |     });
  209 |     await journey.step('Then both responses are 200 with identical bodies', async () => {
  210 |       expect.soft(results.map((r) => r.status), '[REQ AC-8] repeated PUT → 200 both times').toEqual([REQ.STATUS.OK, REQ.STATUS.OK]);
  211 |       expect.soft(results[1].body, '[REQ AC-8] repeated PUT returns identical body').toEqual(results[0].body);
  212 |     });
  213 |     await journey.step('And GET /booking/{id} returns that changed booking', async () => { expect.soft((await api.get(EP.booking(id))).body, '[REQ AC-8] stored state after repeated PUT').toEqual(changed); });
  214 |   });
  215 | 
  216 |   test('SCN-012: PATCH changes only the supplied fields', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  217 |     const b = validBooking(data);
  218 |     let id = 0; let r!: ApiResponse;
  219 |     await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, b); });
  220 |     await journey.step('When I PATCH only the firstname', async () => { r = await write(api, 'PATCH', id, { firstname: 'Patched' }, basic(data)); });
  221 |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-9] PATCH → 200').toBe(REQ.STATUS.OK); });
  222 |     await journey.step('And only the firstname differs from the original booking', async () => {
  223 |       expect((await api.get(EP.booking(id))).body, '[REQ AC-9] only firstname changed').toEqual({ ...b, firstname: 'Patched' });
  224 |     });
  225 |   });
  226 | 
  227 |   test('SCN-013: Cancelling a booking returns 204 and removes it', { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  228 |     let id = 0; let status = 0;
  229 |     await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, validBooking(data)); });
  230 |     await journey.step('When I DELETE /booking/{id} with Basic authentication', async () => { status = (await write(api, 'DELETE', id, undefined, basic(data))).status; });
  231 |     await journey.step('Then the response status is 204', async () => { expect.soft(status, '[REQ AC-10] DELETE → 204').toBe(REQ.STATUS.NO_CONTENT); });
  232 |     await journey.step('And GET /booking/{id} responds 404', async () => { expect.soft((await api.get(EP.booking(id))).status, '[REQ AC-10] deleted booking → 404').toBe(REQ.STATUS.NOT_FOUND); });
  233 |   });
  234 | 
  235 |   REQ.WRITE_METHODS.forEach((method, i) => {
  236 |     test(`SCN-014.${i + 1}: Writing to a booking that does not exist returns 404 (${method})`, { tag: ['@AC-11', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  237 |       let id = 0; let status = 0;
  238 |       await journey.step('Given the id of a booking that no longer exists', async () => { id = await goneId(seed, api, data); });
  239 |       await journey.step(`When I ${method} /booking/{id} with authentication`, async () => {
  240 |         status = (await write(api, method, id, method === 'PATCH' ? { firstname: 'Ghost' } : validBooking(data), basic(data))).status;
  241 |       });
> 242 |       await journey.step('Then the response status is 404', async () => { expect(status, `[REQ AC-11] ${method} unknown id → 404`).toBe(REQ.STATUS.NOT_FOUND); });
      |                                                                                                                                    ^ Error: [REQ AC-11] DELETE unknown id → 404
  243 |     });
  244 |   });
  245 | 
  246 |   test('SCN-015: Reading a booking is fast', { tag: ['@AC-12', '@type:performance', '@layer:api', '@P3'] }, async ({ api, journey, data, seed }) => {
  247 |     let id = 0; const ms: number[] = [];
  248 |     await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, validBooking(data)); });
  249 |     await journey.step('When I GET /booking/{id} 5 times in a row', async () => { for (let n = 0; n < REQ.PERF.REQUESTS; n++) ms.push((await api.get(EP.booking(id))).durationMs); });
  250 |     await journey.step('Then every response arrives in under 3000 ms', async () => { expect(Math.max(...ms), `[REQ AC-12] slowest of ${REQ.PERF.REQUESTS} < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS); });
  251 |   });
  252 | });
  253 | 
```