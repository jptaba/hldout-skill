# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-303\tests\demo-303.spec.ts >> DEMO-303 Partner booking API >> SCN-014.1: Writing to a booking that does not exist returns 404 (PUT)
- Location: evaluations\DEMO-303\tests\demo-303.spec.ts:216:5

# Error details

```
Error: [REQ AC-11] PUT unknown id → 404

expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 405
```

# Test source

```ts
  122 |   });
  123 | 
  124 |   REQ.MISSING_FIELD_ROWS.forEach((field, i) => {
  125 |     test(`SCN-007.${i + 1}: A booking missing a required field is rejected with 400 (${field})`, { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data }) => {
  126 |       const b = validBooking(data);
  127 |       let status = 0;
  128 |       await journey.step(`When I POST a valid booking without ${field}`, async () => { status = (await api.post(EP.bookings, { data: without(b, field) })).status; });
  129 |       await journey.step('Then the response status is 400', async () => { expect.soft(status, `[REQ AC-6] missing ${field} → 400`).toBe(REQ.STATUS.BAD_REQUEST); });
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
  210 |     await journey.step('When I DELETE /booking/{id} with Basic authentication', async () => { status = (await write(api, 'DELETE', id, undefined, basic(data))).status; });
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
> 222 |       await journey.step('Then the response status is 404', async () => { expect(status, `[REQ AC-11] ${method} unknown id → 404`).toBe(REQ.STATUS.NOT_FOUND); });
      |                                                                                                                                    ^ Error: [REQ AC-11] PUT unknown id → 404
  223 |     });
  224 |   });
  225 | 
  226 |   test('SCN-015: Reading a booking is fast', { tag: ['@AC-12', '@type:performance', '@layer:api', '@P3'] }, async ({ api, journey, data }) => {
  227 |     let id = 0; const ms: number[] = [];
  228 |     await journey.step('Given I created a valid booking', async () => { id = await create(api, validBooking(data)); });
  229 |     await journey.step('When I GET /booking/{id} 5 times in a row', async () => { for (let n = 0; n < REQ.PERF.REQUESTS; n++) ms.push((await api.get(EP.booking(id))).durationMs); });
  230 |     await journey.step('Then every response arrives in under 3000 ms', async () => { expect(Math.max(...ms), `[REQ AC-12] slowest of ${REQ.PERF.REQUESTS} < ${REQ.PERF.MAX_MS} ms`).toBeLessThan(REQ.PERF.MAX_MS); });
  231 |   });
  232 | });
  233 | 
```