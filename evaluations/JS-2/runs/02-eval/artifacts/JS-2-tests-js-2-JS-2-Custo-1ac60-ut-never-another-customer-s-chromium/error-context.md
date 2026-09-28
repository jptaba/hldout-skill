# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: JS-2\tests\js-2.spec.ts >> JS-2 Customer registration, login and basket >> SCN-007: A customer reads their own basket but never another customer's
- Location: evaluations\JS-2\tests\js-2.spec.ts:173:7

# Error details

```
Error: [REQ AC-6] GET /rest/basket/{id} for B's basket with A's token does not return B's basket

expect(received).not.toBe(expected) // Object.is equality

Expected: not 111
```

# Test source

```ts
  83  |     });
  84  |     await journey.step('And the body carries a validation error whose message states the e-mail must be unique', async () => {
  85  |       const messages = (res.body?.errors ?? []).map((e) => String(e.message));
  86  |       expect(messages, '[REQ AC-2] POST /api/Users duplicate e-mail: a validation error states the e-mail must be unique').toContainEqual(expect.stringMatching(/e-?mail.*unique|unique.*e-?mail/i));
  87  |     });
  88  |     await journey.step('And no second account is created for that e-mail: logging in with it still signs in the first customer', async () => {
  89  |       const login = await api.post<Login>(EP.login, { data: { email: address, password: PASSWORD() } });
  90  |       const token = login.body?.authentication?.token ?? '';
  91  |       expect(token ? jwtPayload(token).data?.id : undefined, '[REQ AC-2] POST /rest/user/login after the duplicate signs in the first customer (no second account)').toBe(first.id);
  92  |     });
  93  |   });
  94  | 
  95  |   ([4, 3] as const).forEach((length, i) => {
  96  |     test(`SCN-003.${i + 1}: A password shorter than 5 characters is rejected and no customer is created (${length} characters)`, { tag: ['@AC-3', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  97  |       let qid = 0; const address = email(); const password = passwordOf(length); let res!: ApiResponse<{ data: User }>;
  98  |       await journey.step('Given I know a valid security question id from GET /api/SecurityQuestions', async () => { qid = await securityQuestion(api, seed); });
  99  |       await journey.step(`When I POST /api/Users with a unique e-mail and a ${length}-character password`, async () => {
  100 |         expect(password.length, 'the password has the length under test').toBe(length);
  101 |         res = await register(api, address, password, qid); keep(seed, res);
  102 |       });
  103 |       await journey.step(`Then registering with a ${length}-character password → HTTP 400`, async () => {
  104 |         expectResponse(res, { status: REQ.STATUS.BAD_REQUEST }, `[REQ AC-3] POST /api/Users with a ${length}-character password (minimum ${REQ.MIN_PASSWORD_LENGTH})`);
  105 |       });
  106 |       await journey.step('And the customer is not created: a follow-up login with that e-mail and password fails', async () => {
  107 |         const login = await api.post<Login>(EP.login, { data: { email: address, password } });
  108 |         const signedIn = login.status === REQ.STATUS.OK && Boolean(login.body?.authentication?.token);
  109 |         expect(signedIn, `[REQ AC-3] POST /rest/user/login after a ${length}-character registration fails (no customer was created)`).toBe(false);
  110 |       });
  111 |     });
  112 |   });
  113 | 
  114 |   test('SCN-005: A registered customer logs in and receives a JWT and their basket id', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  115 |     const address = email(); let res!: ApiResponse<Login>;
  116 |     await journey.step('Given a customer registered with a unique e-mail and a password', async () => {
  117 |       const qid = await securityQuestion(api, seed);
  118 |       await seed.create('customer (kept: no delete in this application)', async () => {
  119 |         const r = await register(api, address, PASSWORD(), qid);
  120 |         expect(r.status, 'register the customer (precondition)').toBe(REQ.STATUS.CREATED);
  121 |         return r.body.data;
  122 |       });
  123 |     });
  124 |     await journey.step('When I POST /rest/user/login with that e-mail and password', async () => { res = await api.post<Login>(EP.login, { data: { email: address, password: PASSWORD() } }); });
  125 |     await journey.step('Then login with the correct e-mail and password → HTTP 200', async () => { expectResponse(res, { status: REQ.STATUS.OK }, '[REQ AC-4] POST /rest/user/login'); });
  126 |     await journey.step('And the body contains an authentication token that is a JWT', async () => {
  127 |       expect(res.body?.authentication?.token ?? '', '[REQ AC-4] POST /rest/user/login answers a JWT in authentication.token').toMatch(/^[\w-]+\.[\w-]+\.[\w-]*$/);
  128 |     });
  129 |     await journey.step('And the body contains the customer\'s basket id bid', async () => {
  130 |       expect(typeof res.body?.authentication?.bid, '[REQ AC-4] POST /rest/user/login answers the basket id authentication.bid').toBe('number');
  131 |     });
  132 |   });
  133 | 
  134 |   test('SCN-006: A product added to one\'s own basket through the API is listed on the basket page after a UI login', { tag: ['@AC-5', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
  135 |     let me!: Account; let product!: Product; let res!: ApiResponse<{ data?: { id: number; quantity: number } }>;
  136 |     await journey.step('Given I am a customer with my own token and basket id, and know an existing product', async () => {
  137 |       me = await seed.account();
  138 |       expect(typeof bidOf(me), 'my basket id from the sign-in answer (precondition)').toBe('number');
  139 |       product = await seed.step('an existing product', async () => (await api.get<{ data: Product[] }>(EP.products)).body.data[0]);
  140 |     });
  141 |     await journey.step('When I POST /api/BasketItems with my token, my basket id, that product and quantity 3', async () => {
  142 |       res = await api.post(EP.basketItems, { headers: me.headers, data: { BasketId: bidOf(me), ProductId: product.id, quantity: 3 } });
  143 |       if (res.ok && res.body?.data?.id) seed.track('basket item', res.body.data, (item) => api.delete(EP.basketItem(item.id), { headers: me.headers }));
  144 |     });
  145 |     await journey.step('And I log in through the UI and open /#/basket', async () => {
  146 |       await signIn(page, me);
  147 |       await gotoPage(page, '#/basket');
  148 |     });
  149 |     await journey.step('Then the product is added to my basket', async () => {
  150 |       expect(res.ok, '[REQ AC-5] POST /api/BasketItems with my own token adds the product (a success status)').toBe(true);
  151 |     });
  152 |     const row = () => page.getByRole('row').filter({ hasText: product.name });
  153 |     await journey.step('And the basket page lists that product', async () => {
  154 |       await expect(row(), '[REQ AC-5] /#/basket lists the product').toBeVisible();
  155 |     });
  156 |     await journey.step('And the listed product shows quantity 3', async () => {
  157 |       await expect(row().locator('mat-cell.mat-column-quantity'), '[REQ AC-5] /#/basket shows the quantity that was added').toHaveText('3');
  158 |     });
  159 |   });
  160 | 
  161 |   /** Customers A and B, B with a product in their basket (removed afterwards). */
  162 |   const twoCustomers = async (api: Api, seed: Seed) => {
  163 |     const a = await seed.account('customer A'); const b = await seed.account('customer B');
  164 |     const product = await seed.step('an existing product', async () => (await api.get<{ data: Product[] }>(EP.products)).body.data[0]);
  165 |     await seed.create('a product in B\'s basket', async () => {
  166 |       const r = await api.post<{ data: { id: number } }>(EP.basketItems, { headers: b.headers, data: { BasketId: bidOf(b), ProductId: product.id, quantity: 1 } });
  167 |       expect(r.ok, 'add a product to B\'s basket (precondition)').toBe(true);
  168 |       return r.body.data;
  169 |     }, (item) => api.delete(EP.basketItem(item.id), { headers: b.headers }));
  170 |     return { a, b };
  171 |   };
  172 | 
  173 |   test('SCN-007: A customer reads their own basket but never another customer\'s', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  174 |     let a!: Account; let b!: Account; let own!: ApiResponse<{ data?: Basket }>; let other!: ApiResponse<{ data?: Basket }>;
  175 |     await journey.step('Given customers A and B, and B has a product in their basket', async () => { ({ a, b } = await twoCustomers(api, seed)); });
  176 |     await journey.step('When A requests GET /rest/basket/{id} with A\'s token for A\'s basket id', async () => { own = await api.get(EP.basket(bidOf(a)), { headers: a.headers }); });
  177 |     await journey.step('And A requests GET /rest/basket/{id} with A\'s token for B\'s basket id', async () => { other = await api.get(EP.basket(bidOf(b)), { headers: a.headers }); });
  178 |     await journey.step('Then A reading their own basket gets it', async () => {
  179 |       expect.soft(own.ok, '[REQ AC-6] GET /rest/basket/{id} for A\'s own basket succeeds').toBe(true);
  180 |       expect.soft(own.body?.data?.id, '[REQ AC-6] GET /rest/basket/{id} for A\'s own basket returns it').toBe(bidOf(a));
  181 |     });
  182 |     await journey.step('And the request for B\'s basket does not return B\'s basket', async () => {
> 183 |       expect(other.body?.data?.id ?? null, '[REQ AC-6] GET /rest/basket/{id} for B\'s basket with A\'s token does not return B\'s basket').not.toBe(bidOf(b));
      |                                                                                                                                                ^ Error: [REQ AC-6] GET /rest/basket/{id} for B's basket with A's token does not return B's basket
  184 |     });
  185 |   });
  186 | 
  187 |   test('SCN-008: A request for another customer\'s basket is refused', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1', '@assumes:G4'] }, async ({ api, journey, seed }) => {
  188 |     let a!: Account; let b!: Account; let other!: ApiResponse;
  189 |     await journey.step('Given customers A and B', async () => { ({ a, b } = await twoCustomers(api, seed)); });
  190 |     await journey.step('When A requests GET /rest/basket/{id} with A\'s token for B\'s basket id', async () => { other = await api.get(EP.basket(bidOf(b)), { headers: a.headers }); });
  191 |     await journey.step('Then the request is refused with a non-2xx status', async () => {
  192 |       expect(String(other.status), '[REQ AC-6] GET /rest/basket/{id} for B\'s basket with A\'s token is refused (not 2xx)').not.toMatch(/^2\d\d$/);
  193 |     });
  194 |   });
  195 | });
  196 | 
```