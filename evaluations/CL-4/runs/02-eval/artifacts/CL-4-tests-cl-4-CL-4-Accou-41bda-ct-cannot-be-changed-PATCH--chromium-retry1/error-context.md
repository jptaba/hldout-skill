# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: CL-4\tests\cl-4.spec.ts >> CL-4 Account security for contacts >> SCN-007.2: The owner of an existing contact cannot be changed (PATCH)
- Location: evaluations\CL-4\tests\cl-4.spec.ts:178:9

# Error details

```
Error: [REQ AC-7] PATCH /contacts/{id} setting owner to user B is rejected with 400 or keeps owner A

expect(received).toMatch(expected)

Expected pattern: /^(rejected with 400|answered 200 with owner still A)$/
Received string:  "answered 200 with owner set to user B"
```

# Test source

```ts
  90  |         expectResponse(res, { status: REQ.STATUS.UNAUTHORIZED }, `[REQ AC-2] GET /contacts with ${row.token} → 401`);
  91  |       });
  92  |       await journey.step('And the response body is {"error": "Please authenticate."}', async () => {
  93  |         expect(res.body, `[REQ AC-2] GET /contacts with ${row.token} answers {"error": "Please authenticate."}`).toEqual(REQ.NOT_AUTHENTICATED);
  94  |       });
  95  |     });
  96  |   });
  97  | 
  98  |   test('SCN-003: Signing out ends the session', { tag: ['@AC-3', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  99  |     let a!: Account; let headers!: Record<string, string>; let res!: ApiResponse;
  100 |     await journey.step('Given user "A" holds a token that returns A\'s contacts on GET /contacts', async () => {
  101 |       a = await seed.account('user A'); headers = { ...a.headers };
  102 |       expect((await api.get(EP.contacts, { headers })).status, 'the token works before signing out (precondition)').toBe(200);
  103 |     });
  104 |     await journey.step('When user "A" calls POST /users/logout with that token', async () => { res = await api.post(EP.usersLogout, { headers }); });
  105 |     await journey.step('Then the response status is 200', async () => {
  106 |       expectResponse(res, { status: REQ.STATUS.OK }, '[REQ AC-3] POST /users/logout → 200');
  107 |     });
  108 |     await journey.step('And GET /contacts with the same token answers 401', async () => {
  109 |       expectResponse(await api.get(EP.contacts, { headers }), { status: REQ.STATUS.UNAUTHORIZED }, '[REQ AC-3] GET /contacts with the signed-out token → 401');
  110 |     });
  111 |     await journey.step('And GET /users/me with the same token answers 401', async () => {
  112 |       expectResponse(await api.get(EP.usersMe, { headers }), { status: REQ.STATUS.UNAUTHORIZED }, '[REQ AC-3] GET /users/me with the signed-out token → 401');
  113 |     });
  114 |   });
  115 | 
  116 |   test('SCN-004: A user cannot read another user\'s contact', { tag: ['@AC-4', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  117 |     let a!: Account; let b!: Account; let c!: Contact; let res!: ApiResponse;
  118 |     await journey.step('Given user "A" has a contact "Secret Sam" and user "B" has signed up', async () => {
  119 |       a = await seed.account('user A'); b = await seed.account('user B'); c = await contactOf(api, seed, a, REQ.SECRET_SAM);
  120 |     });
  121 |     await journey.step('When user "B" calls GET /contacts/{id of Secret Sam}', async () => { res = await stored(api, b, c._id); });
  122 |     await journey.step('Then the response status is 404', async () => {
  123 |       expectResponse(res, { status: REQ.STATUS.NOT_FOUND }, '[REQ AC-4] GET /contacts/{id} of another user\'s contact → 404');
  124 |     });
  125 |     await journey.step('And GET /contacts for user "B" does not contain "Secret Sam"', async () => {
  126 |       expect(await namesOf(api, b), '[REQ AC-4] user B\'s list does not contain "Secret Sam"').not.toContain(text(REQ.SECRET_SAM));
  127 |     });
  128 |   });
  129 | 
  130 |   const CHANGES: { method: string; send: (api: Api, b: Account, c: Contact) => Promise<ApiResponse> }[] = [
  131 |     { method: 'PUT', send: (api, b, c) => api.put(EP.contact(c._id), { headers: b.headers, data: body({ first: 'Taken', last: 'Over' }) }) },
  132 |     { method: 'PATCH', send: (api, b, c) => api.patch(EP.contact(c._id), { headers: b.headers, data: { lastName: 'Over' } }) },
  133 |     { method: 'DELETE', send: (api, b, c) => api.delete(EP.contact(c._id), { headers: b.headers }) },
  134 |   ];
  135 |   CHANGES.forEach((row, i) => {
  136 |     test(`SCN-005.${i + 1}: A user cannot change or delete another user's contact (${row.method})`, { tag: ['@AC-5', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  137 |       let a!: Account; let b!: Account; let c!: Contact; let res!: ApiResponse;
  138 |       await journey.step('Given user "A" has a contact "Secret Sam" and user "B" has signed up', async () => {
  139 |         a = await seed.account('user A'); b = await seed.account('user B'); c = await contactOf(api, seed, a, REQ.SECRET_SAM);
  140 |       });
  141 |       await journey.step(`When user "B" calls ${row.method} /contacts/{id of Secret Sam} with a valid body`, async () => { res = await row.send(api, b, c); });
  142 |       await journey.step('Then the response status is 404', async () => {
  143 |         expectResponse(res, { status: REQ.STATUS.NOT_FOUND }, `[REQ AC-5] ${row.method} /contacts/{id} of another user's contact → 404`);
  144 |       });
  145 |       await journey.step('And GET /contacts/{id of Secret Sam} for user "A" still returns "Secret Sam" unchanged', async () => {
  146 |         const now = await stored(api, a, c._id);
  147 |         expectResponse(now, { status: REQ.STATUS.OK }, '[REQ AC-5] GET /contacts/{id} for user A still answers 200');
  148 |         expect(nameOf(now.body), '[REQ AC-5] user A\'s contact is still "Secret Sam"').toBe(text(REQ.SECRET_SAM));
  149 |       });
  150 |     });
  151 |   });
  152 | 
  153 |   test('SCN-006: A new contact always belongs to its creator', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  154 |     let a!: Account; let b!: Account; let res!: ApiResponse<Contact>;
  155 |     const n = { first: 'Owned', last: 'ByCreator' };
  156 |     await journey.step('Given users "A" and "B" have signed up', async () => { a = await seed.account('user A'); b = await seed.account('user B'); });
  157 |     await journey.step('When user "A" calls POST /contacts with a valid body that also contains "owner" set to the _id of user "B"', async () => {
  158 |       res = await api.post<Contact>(EP.contacts, { headers: a.headers, data: body(n, { owner: b.id }) });
  159 |       if (res.body?._id) seed.track('contact made by the scenario', res.body, (x) => api.delete(EP.contact(x._id), { headers: a.headers }));
  160 |     });
  161 |     await journey.step('Then the response status is 201', async () => {
  162 |       expectResponse(res, { status: REQ.STATUS.CREATED }, '[REQ AC-6] POST /contacts with owner set to user B → 201');
  163 |     });
  164 |     await journey.step('And the new contact\'s "owner" is the _id of user "A"', async () => {
  165 |       expect(res.body?.owner, '[REQ AC-6] the new contact\'s owner is user A\'s _id').toBe(a.id);
  166 |     });
  167 |     await journey.step('And the new contact is listed for user "A" and not for user "B"', async () => {
  168 |       expect.soft(await namesOf(api, a), '[REQ AC-6] the new contact is listed for user A').toContain(text(n));
  169 |       expect(await namesOf(api, b), '[REQ AC-6] the new contact is not listed for user B').not.toContain(text(n));
  170 |     });
  171 |   });
  172 | 
  173 |   const OWNER_CHANGES: { method: string; body: string; send: (api: Api, a: Account, b: Account, c: Contact) => Promise<ApiResponse<Contact>> }[] = [
  174 |     { method: 'PUT', body: 'first name, last name and owner', send: (api, a, b, c) => api.put<Contact>(EP.contact(c._id), { headers: a.headers, data: body(REQ.SECRET_SAM, { owner: b.id }) }) },
  175 |     { method: 'PATCH', body: 'owner only', send: (api, a, b, c) => api.patch<Contact>(EP.contact(c._id), { headers: a.headers, data: { owner: b.id } }) },
  176 |   ];
  177 |   OWNER_CHANGES.forEach((row, i) => {
  178 |     test(`SCN-007.${i + 1}: The owner of an existing contact cannot be changed (${row.method})`, { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  179 |       let a!: Account; let b!: Account; let c!: Contact; let res!: ApiResponse<Contact>;
  180 |       await journey.step('Given user "A" has a contact "Secret Sam" and user "B" has signed up', async () => {
  181 |         a = await seed.account('user A'); b = await seed.account('user B'); c = await contactOf(api, seed, a, REQ.SECRET_SAM);
  182 |       });
  183 |       await journey.step(`When user "A" calls ${row.method} /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B" (${row.body})`, async () => {
  184 |         res = await row.send(api, a, b, c);
  185 |         // If the owner did move, the contact now belongs to B: B removes it after the test.
  186 |         if (res.body?.owner === b.id) seed.track('contact moved to user B', c, (x) => api.delete(EP.contact(x._id), { headers: b.headers }));
  187 |       });
  188 |       await journey.step('Then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A"', async () => {
  189 |         const outcome = res.status === REQ.STATUS.BAD_REQUEST ? 'rejected with 400' : res.status === REQ.STATUS.OK && res.body?.owner === a.id ? 'answered 200 with owner still A' : `answered ${res.status} with owner ${res.body?.owner === b.id ? 'set to user B' : String(res.body?.owner)}`;
> 190 |         expect(outcome, `[REQ AC-7] ${row.method} /contacts/{id} setting owner to user B is rejected with 400 or keeps owner A`).toMatch(/^(rejected with 400|answered 200 with owner still A)$/);
      |                                                                                                                                  ^ Error: [REQ AC-7] PATCH /contacts/{id} setting owner to user B is rejected with 400 or keeps owner A
  191 |       });
  192 |       await journey.step('And GET /contacts/{id of Secret Sam} for user "A" still answers 200', async () => {
  193 |         expectResponse(await stored(api, a, c._id), { status: REQ.STATUS.OK }, '[REQ AC-7] GET /contacts/{id} for user A still answers 200');
  194 |       });
  195 |       await journey.step('And GET /contacts for user "B" does not contain "Secret Sam"', async () => {
  196 |         expect(await namesOf(api, b), '[REQ AC-7] user B\'s list does not contain "Secret Sam"').not.toContain(text(REQ.SECRET_SAM));
  197 |       });
  198 |     });
  199 |   });
  200 | 
  201 |   test('SCN-008: The contact list page only shows the signed-in user\'s contacts', { tag: ['@AC-8', '@type:security', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
  202 |     let b!: Account;
  203 |     await journey.step('Given user "A" has a contact "Secret Sam" and user "B" has a contact "Bella Bee"', async () => {
  204 |       const a = await seed.account('user A'); b = await seed.account('user B');
  205 |       await contactOf(api, seed, a, REQ.SECRET_SAM); await contactOf(api, seed, b, REQ.BELLA_BEE);
  206 |     });
  207 |     await journey.step('When user "B" signs in on the login page', async () => { await signIn(page, b); });
  208 |     await journey.step('Then the Contact List page shows "Bella Bee"', async () => {
  209 |       await expect(page.getByRole('row').filter({ hasText: text(REQ.BELLA_BEE) }), '[REQ AC-8] the Contact List page shows "Bella Bee"').toHaveCount(1);
  210 |     });
  211 |     await journey.step('And it does not show "Secret Sam"', async () => {
  212 |       await expect(page.getByText(text(REQ.SECRET_SAM)), '[REQ AC-8] the Contact List page does not show "Secret Sam"').toBeHidden();
  213 |     });
  214 |   });
  215 | });
  216 | 
```