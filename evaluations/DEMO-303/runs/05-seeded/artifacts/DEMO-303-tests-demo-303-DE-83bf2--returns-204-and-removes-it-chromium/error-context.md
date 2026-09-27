# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-303\tests\demo-303.spec.ts >> DEMO-303 Partner booking API >> SCN-013: Cancelling a booking returns 204 and removes it
- Location: evaluations\DEMO-303\tests\demo-303.spec.ts:219:3

# Error details

```
Error: [REQ AC-10] DELETE → 204

expect(received).toBe(expected) // Object.is equality

Expected: 204
Received: 201
```

# Test source

```ts
  123 |   });
  124 | 
  125 |   test('SCN-006: Searching by name finds the booking', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  126 |     const b = validBooking(data);
  127 |     let id = 0; let r!: ApiResponse<{ bookingid: number }[]>;
  128 |     await journey.step('Given I created a valid booking with a unique first and last name', async () => { id = await create(seed, api, data, b); });
  129 |     await journey.step('When I GET /booking with that firstname and lastname', async () => { r = await api.get(EP.bookings, { params: { firstname: b.firstname, lastname: b.lastname } }); });
  130 |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-5] search → 200').toBe(REQ.STATUS.OK); });
  131 |     await journey.step('And the result contains the created booking id', async () => {
  132 |       expect((Array.isArray(r.body) ? r.body : []).map((x) => x.bookingid), '[REQ AC-5] search includes the booking').toContain(id);
  133 |     });
  134 |   });
  135 | 
  136 |   REQ.MISSING_FIELD_ROWS.forEach((field, i) => {
  137 |     test(`SCN-007.${i + 1}: A booking missing a required field is rejected with 400 (${field})`, { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  138 |       const b = validBooking(data);
  139 |       let status = 0;
  140 |       await journey.step(`When I POST a valid booking without ${field}`, async () => { const r = await api.post(EP.bookings, { data: without(b, field) }); status = r.status; trackCreated(seed, api, data, r); });
  141 |       await journey.step('Then the response status is 400', async () => { expect.soft(status, `[REQ AC-6] missing ${field} → 400`).toBe(REQ.STATUS.BAD_REQUEST); });
  142 |       await journey.step('And the booking is not stored', async () => {
  143 |         if (field === 'firstname' || field === 'lastname') return; // cannot search by an absent name; covered by the status assertion
  144 |         expect.soft(await search(api, b.firstname, b.lastname), `[REQ AC-6] booking without ${field} not stored`).toEqual([]);
  145 |       });
  146 |     });
  147 |   });
  148 | 
  149 |   REQ.BOUNDARY_ROWS.forEach((row, i) => {
  150 |     test(`SCN-008.${i + 1}: Price and date boundaries are enforced (${row.change} → ${row.outcome})`, { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  151 |       const b = validBooking(data, { totalprice: row.totalprice, bookingdates: { checkin: data.booking.checkin, checkout: addDays(data.booking.checkin, row.checkoutOffset) } });
  152 |       let r!: ApiResponse;
  153 |       await journey.step(`When I POST a valid booking with ${row.change}`, async () => { r = await api.post(EP.bookings, { data: b }); trackCreated(seed, api, data, r); });
  154 |       await journey.step(`Then the booking is ${row.outcome}`, async () => {
  155 |         if (row.outcome === 'accepted') {
  156 |           expect(r.status, `[REQ AC-6] ${row.change} accepted`).toBe(REQ.STATUS.OK);
  157 |         } else {
  158 |           expect.soft(r.status, `[REQ AC-6] ${row.change} rejected with 400`).toBe(REQ.STATUS.BAD_REQUEST);
  159 |           expect.soft(await search(api, b.firstname, b.lastname), `[REQ AC-6] ${row.change} not stored`).toEqual([]);
  160 |         }
  161 |       });
  162 |     });
  163 |   });
  164 | 
  165 |   REQ.WRITE_METHODS.forEach((method, i) => {
  166 |     test(`SCN-009.${i + 1}: Writes without authentication are refused and change nothing (${method})`, { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  167 |       const b = validBooking(data);
  168 |       let id = 0; let status = 0;
  169 |       await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, b); });
  170 |       await journey.step(`When I ${method} /booking/{id} without authentication`, async () => {
  171 |         status = (await write(api, method, id, method === 'PATCH' ? { firstname: 'Changed' } : { ...b, firstname: 'Changed' })).status;
  172 |       });
  173 |       await journey.step('Then the response status is 403', async () => { expect.soft(status, `[REQ AC-7] ${method} without auth → 403`).toBe(REQ.STATUS.FORBIDDEN); });
  174 |       await journey.step('And the stored booking is unchanged', async () => { expect.soft((await api.get(EP.booking(id))).body, `[REQ AC-7] ${method} without auth changes nothing`).toEqual(b); });
  175 |     });
  176 |   });
  177 | 
  178 |   (['token cookie', 'Basic auth'] as const).forEach((auth, i) => {
  179 |     test(`SCN-010.${i + 1}: A full update succeeds with either authentication method (${auth})`, { tag: ['@AC-7', '@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  180 |       const b = validBooking(data);
  181 |       const changed = { ...b, lastname: unique('Updated'), totalprice: 222 };
  182 |       let id = 0; let r!: ApiResponse;
  183 |       await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, b); });
  184 |       await journey.step(`When I PUT a changed booking to /booking/{id} authenticated with ${auth}`, async () => {
  185 |         const headers = auth === 'Basic auth' ? basic(data) : { Cookie: `token=${await token(api, data)}` };
  186 |         r = await write(api, 'PUT', id, changed, headers);
  187 |       });
  188 |       await journey.step('Then the response status is 200', async () => { expect(r.status, `[REQ AC-7] PUT with ${auth} → 200`).toBe(REQ.STATUS.OK); });
  189 |       await journey.step('And the body equals the changed booking', async () => { expect(r.body, '[REQ AC-8] PUT returns the updated booking').toEqual(changed); });
  190 |     });
  191 |   });
  192 | 
  193 |   test('SCN-011: Repeating the same PUT is idempotent', { tag: ['@AC-8', '@type:idempotency', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  194 |     const b = validBooking(data);
  195 |     const changed = { ...b, additionalneeds: 'Late checkout' };
  196 |     let id = 0; const results: { status: number; body: unknown }[] = [];
  197 |     await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, b); });
  198 |     await journey.step('When I PUT the same changed booking twice', async () => {
  199 |       for (let n = 0; n < 2; n++) { const r = await write(api, 'PUT', id, changed, basic(data)); results.push({ status: r.status, body: r.body }); }
  200 |     });
  201 |     await journey.step('Then both responses are 200 with identical bodies', async () => {
  202 |       expect.soft(results.map((r) => r.status), '[REQ AC-8] repeated PUT → 200 both times').toEqual([REQ.STATUS.OK, REQ.STATUS.OK]);
  203 |       expect.soft(results[1].body, '[REQ AC-8] repeated PUT returns identical body').toEqual(results[0].body);
  204 |     });
  205 |     await journey.step('And GET /booking/{id} returns that changed booking', async () => { expect.soft((await api.get(EP.booking(id))).body, '[REQ AC-8] stored state after repeated PUT').toEqual(changed); });
  206 |   });
  207 | 
  208 |   test('SCN-012: PATCH changes only the supplied fields', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  209 |     const b = validBooking(data);
  210 |     let id = 0; let r!: ApiResponse;
  211 |     await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, b); });
  212 |     await journey.step('When I PATCH only the firstname', async () => { r = await write(api, 'PATCH', id, { firstname: 'Patched' }, basic(data)); });
  213 |     await journey.step('Then the response status is 200', async () => { expect(r.status, '[REQ AC-9] PATCH → 200').toBe(REQ.STATUS.OK); });
  214 |     await journey.step('And only the firstname differs from the original booking', async () => {
  215 |       expect((await api.get(EP.booking(id))).body, '[REQ AC-9] only firstname changed').toEqual({ ...b, firstname: 'Patched' });
  216 |     });
  217 |   });
  218 | 
  219 |   test('SCN-013: Cancelling a booking returns 204 and removes it', { tag: ['@AC-10', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
  220 |     let id = 0; let status = 0;
  221 |     await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, validBooking(data)); });
  222 |     await journey.step('When I DELETE /booking/{id} with Basic authentication', async () => { status = (await write(api, 'DELETE', id, undefined, basic(data))).status; });
> 223 |     await journey.step('Then the response status is 204', async () => { expect.soft(status, '[REQ AC-10] DELETE → 204').toBe(REQ.STATUS.NO_CONTENT); });
      |                                                                                                                         ^ Error: [REQ AC-10] DELETE → 204
  224 |     await journey.step('And GET /booking/{id} responds 404', async () => { expect.soft((await api.get(EP.booking(id))).status, '[REQ AC-10] deleted booking → 404').toBe(REQ.STATUS.NOT_FOUND); });
  225 |   });
  226 | 
  227 |   REQ.WRITE_METHODS.forEach((method, i) => {
  228 |     test(`SCN-014.${i + 1}: Writing to a booking that does not exist returns 404 (${method})`, { tag: ['@AC-11', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
  229 |       let id = 0; let status = 0;
  230 |       await journey.step('Given the id of a booking that no longer exists', async () => { id = await goneId(seed, api, data); });
  231 |       await journey.step(`When I ${method} /booking/{id} with authentication`, async () => {
  232 |         status = (await write(api, method, id, method === 'PATCH' ? { firstname: 'Ghost' } : validBooking(data), basic(data))).status;
  233 |       });
  234 |       await journey.step('Then the response status is 404', async () => { expect(status, `[REQ AC-11] ${method} unknown id → 404`).toBe(REQ.STATUS.NOT_FOUND); });
  235 |     });
  236 |   });
  237 | 
  238 |   test('SCN-015: Reading a booking is fast', { tag: ['@AC-12', '@type:performance', '@layer:api', '@P3'] }, async ({ api, journey, data, seed }) => {
  239 |     let id = 0; const ms: number[] = [];
  240 |     await journey.step('Given I created a valid booking', async () => { id = await create(seed, api, data, validBooking(data)); });
  241 |     await journey.step('When I GET /booking/{id} 5 times in a row', async () => { for (let n = 0; n < REQ.PERF.REQUESTS; n++) ms.push((await api.get(EP.booking(id))).durationMs); });
  242 |     await journey.step('Then every response arrives in under 3000 ms', async () => { expect(Math.max(...ms), `[REQ AC-12] slowest of ${REQ.PERF.REQUESTS} < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS); });
  243 |   });
  244 | });
  245 | 
```