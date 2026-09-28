/**
 * Held-out acceptance tests for JS-2 — "Customer registration, login and basket".
 * Written from evaluations/JS-2/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import { test, expect, expectResponse, gotoPage, signIn, uniqueId, type Account, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from JS-2 (never edit during hardening)
const REQ = {
  STATUS: { CREATED: 201, OK: 200, BAD_REQUEST: 400 },
  ROLE: 'customer',
  MIN_PASSWORD_LENGTH: 5,
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement (and the cleanup endpoint found while hardening).
const EP = {
  users: '/api/Users',
  securityQuestions: '/api/SecurityQuestions',
  login: '/rest/user/login',
  products: '/api/Products',
  basketItems: '/api/BasketItems',
  basketItem: (id: number) => `/api/BasketItems/${id}`, // SEED-ENDPOINT (cleanup)
  basket: (id: number) => `/rest/basket/${id}`,
};

interface User { id: number; email: string; role?: string }
interface Login { authentication?: { token?: string; bid?: number; umail?: string } }
interface Basket { id: number; UserId: number; Products?: { id: number; name: string }[] }
interface Product { id: number; name: string }

const PASSWORD = () => String(process.env.JS_USER_PASSWORD);
const email = () => `${uniqueId()}@example.com`;
/** A password of exactly n characters for the length rules (not a secret: it is refused, or thrown away). */
const passwordOf = (n: number) => 'Qx9!rT5@kL'.slice(0, n);

/** A valid security question id (GET /api/SecurityQuestions). */
const securityQuestion = (api: Api, seed: Seed) => seed.step('a security question id', async () => {
  const id = (await api.get<{ data: { id: number }[] }>(EP.securityQuestions)).body?.data?.[0]?.id;
  expect(id, 'a security question id (precondition)').toBeDefined();
  return id!;
});
const register = (api: Api, address: string, password: string, qid: number) => api.post<{ data: User }>(EP.users, {
  data: { email: address, password, passwordRepeat: password, securityQuestion: { id: qid }, securityAnswer: 'heldout' },
});
/** Customers can't be deleted in this application: a customer the scenario registers is listed as kept. */
const keep = (seed: Seed, res: ApiResponse<{ data: User }>) => { if (res.ok) seed.track('customer registered by the scenario', { id: res.body?.data?.id, email: res.body?.data?.email }); };
const bidOf = (me: Account) => (me.signInBody as Login | undefined)?.authentication?.bid as number;
const jwtPayload = (token: string) => JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as { data?: { id?: number } };

test.describe('JS-2 Customer registration, login and basket', () => {
  test('SCN-001: A visitor registers with a unique e-mail and a rule-compliant password', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let qid = 0; const address = email(); let res!: ApiResponse<{ data: User }>;
    await journey.step('Given I know a valid security question id from GET /api/SecurityQuestions', async () => { qid = await securityQuestion(api, seed); });
    await journey.step('When I POST /api/Users with a unique e-mail, the password as password and passwordRepeat, the security question id and an answer', async () => {
      res = await register(api, address, PASSWORD(), qid); keep(seed, res);
    });
    await journey.step('Then registration → HTTP 201', async () => { expectResponse(res, { status: REQ.STATUS.CREATED }, '[REQ AC-1] POST /api/Users registration'); });
    await journey.step('And the response body describes the new user with the submitted email', async () => {
      expect(res.body?.data?.email, '[REQ AC-1] POST /api/Users answers the submitted email').toBe(address);
    });
    await journey.step('And the new user\'s role = customer', async () => {
      expect(res.body?.data?.role, '[REQ AC-1] POST /api/Users answers role = customer').toBe(REQ.ROLE);
    });
  });

  test('SCN-002: Registering an e-mail that already belongs to a customer is rejected', { tag: ['@AC-2', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    const address = email(); let first!: User; let res!: ApiResponse<{ errors?: { field?: string; message?: string }[] }>;
    await journey.step('Given a customer registered with a unique e-mail', async () => {
      const qid = await securityQuestion(api, seed);
      first = await seed.create('customer (kept: no delete in this application)', async () => {
        const r = await register(api, address, PASSWORD(), qid);
        expect(r.status, 'register the first customer (precondition)').toBe(REQ.STATUS.CREATED);
        return r.body.data;
      });
    });
    await journey.step('When I POST /api/Users again with the same e-mail', async () => {
      const qid = await securityQuestion(api, seed);
      res = await register(api, address, PASSWORD(), qid) as ApiResponse<{ errors?: { field?: string; message?: string }[] }>;
      if (res.ok) seed.track('second customer registered by the scenario', res.body);
    });
    await journey.step('Then registering an e-mail that already belongs to a customer → HTTP 400', async () => {
      expectResponse(res, { status: REQ.STATUS.BAD_REQUEST }, '[REQ AC-2] POST /api/Users duplicate e-mail');
    });
    await journey.step('And the body carries a validation error whose message states the e-mail must be unique', async () => {
      const messages = (res.body?.errors ?? []).map((e) => String(e.message));
      expect(messages, '[REQ AC-2] POST /api/Users duplicate e-mail: a validation error states the e-mail must be unique').toContainEqual(expect.stringMatching(/e-?mail.*unique|unique.*e-?mail/i));
    });
    await journey.step('And no second account is created for that e-mail: logging in with it still signs in the first customer', async () => {
      const login = await api.post<Login>(EP.login, { data: { email: address, password: PASSWORD() } });
      const token = login.body?.authentication?.token ?? '';
      expect(token ? jwtPayload(token).data?.id : undefined, '[REQ AC-2] POST /rest/user/login after the duplicate signs in the first customer (no second account)').toBe(first.id);
    });
  });

  ([4, 3] as const).forEach((length, i) => {
    test(`SCN-003.${i + 1}: A password shorter than 5 characters is rejected and no customer is created (${length} characters)`, { tag: ['@AC-3', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let qid = 0; const address = email(); const password = passwordOf(length); let res!: ApiResponse<{ data: User }>;
      await journey.step('Given I know a valid security question id from GET /api/SecurityQuestions', async () => { qid = await securityQuestion(api, seed); });
      await journey.step(`When I POST /api/Users with a unique e-mail and a ${length}-character password`, async () => {
        expect(password.length, 'the password has the length under test').toBe(length);
        res = await register(api, address, password, qid); keep(seed, res);
      });
      await journey.step(`Then registering with a ${length}-character password → HTTP 400`, async () => {
        expectResponse(res, { status: REQ.STATUS.BAD_REQUEST }, `[REQ AC-3] POST /api/Users with a ${length}-character password (minimum ${REQ.MIN_PASSWORD_LENGTH})`);
      });
      await journey.step('And the customer is not created: a follow-up login with that e-mail and password fails', async () => {
        const login = await api.post<Login>(EP.login, { data: { email: address, password } });
        const signedIn = login.status === REQ.STATUS.OK && Boolean(login.body?.authentication?.token);
        expect(signedIn, `[REQ AC-3] POST /rest/user/login after a ${length}-character registration fails (no customer was created)`).toBe(false);
      });
    });
  });

  test('SCN-005: A registered customer logs in and receives a JWT and their basket id', { tag: ['@AC-4', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    const address = email(); let res!: ApiResponse<Login>;
    await journey.step('Given a customer registered with a unique e-mail and a password', async () => {
      const qid = await securityQuestion(api, seed);
      await seed.create('customer (kept: no delete in this application)', async () => {
        const r = await register(api, address, PASSWORD(), qid);
        expect(r.status, 'register the customer (precondition)').toBe(REQ.STATUS.CREATED);
        return r.body.data;
      });
    });
    await journey.step('When I POST /rest/user/login with that e-mail and password', async () => { res = await api.post<Login>(EP.login, { data: { email: address, password: PASSWORD() } }); });
    await journey.step('Then login with the correct e-mail and password → HTTP 200', async () => { expectResponse(res, { status: REQ.STATUS.OK }, '[REQ AC-4] POST /rest/user/login'); });
    await journey.step('And the body contains an authentication token that is a JWT', async () => {
      expect(res.body?.authentication?.token ?? '', '[REQ AC-4] POST /rest/user/login answers a JWT in authentication.token').toMatch(/^[\w-]+\.[\w-]+\.[\w-]*$/);
    });
    await journey.step('And the body contains the customer\'s basket id bid', async () => {
      expect(typeof res.body?.authentication?.bid, '[REQ AC-4] POST /rest/user/login answers the basket id authentication.bid').toBe('number');
    });
  });

  test('SCN-006: A product added to one\'s own basket through the API is listed on the basket page after a UI login', { tag: ['@AC-5', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let product!: Product; let res!: ApiResponse<{ data?: { id: number; quantity: number } }>;
    await journey.step('Given I am a customer with my own token and basket id, and know an existing product', async () => {
      me = await seed.account();
      expect(typeof bidOf(me), 'my basket id from the sign-in answer (precondition)').toBe('number');
      product = await seed.step('an existing product', async () => (await api.get<{ data: Product[] }>(EP.products)).body.data[0]);
    });
    await journey.step('When I POST /api/BasketItems with my token, my basket id, that product and quantity 3', async () => {
      res = await api.post(EP.basketItems, { headers: me.headers, data: { BasketId: bidOf(me), ProductId: product.id, quantity: 3 } });
      if (res.ok && res.body?.data?.id) seed.track('basket item', res.body.data, (item) => api.delete(EP.basketItem(item.id), { headers: me.headers }));
    });
    await journey.step('And I log in through the UI and open /#/basket', async () => {
      await signIn(page, me);
      await gotoPage(page, '#/basket');
    });
    await journey.step('Then the product is added to my basket', async () => {
      expect(res.ok, '[REQ AC-5] POST /api/BasketItems with my own token adds the product (a success status)').toBe(true);
    });
    const row = () => page.getByRole('row').filter({ hasText: product.name });
    await journey.step('And the basket page lists that product', async () => {
      await expect(row(), '[REQ AC-5] /#/basket lists the product').toBeVisible();
    });
    await journey.step('And the listed product shows quantity 3', async () => {
      await expect(row().locator('mat-cell.mat-column-quantity'), '[REQ AC-5] /#/basket shows the quantity that was added').toHaveText('3');
    });
  });

  /** Customers A and B, B with a product in their basket (removed afterwards). */
  const twoCustomers = async (api: Api, seed: Seed) => {
    const a = await seed.account('customer A'); const b = await seed.account('customer B');
    const product = await seed.step('an existing product', async () => (await api.get<{ data: Product[] }>(EP.products)).body.data[0]);
    await seed.create('a product in B\'s basket', async () => {
      const r = await api.post<{ data: { id: number } }>(EP.basketItems, { headers: b.headers, data: { BasketId: bidOf(b), ProductId: product.id, quantity: 1 } });
      expect(r.ok, 'add a product to B\'s basket (precondition)').toBe(true);
      return r.body.data;
    }, (item) => api.delete(EP.basketItem(item.id), { headers: b.headers }));
    return { a, b };
  };

  test('SCN-007: A customer reads their own basket but never another customer\'s', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let a!: Account; let b!: Account; let own!: ApiResponse<{ data?: Basket }>; let other!: ApiResponse<{ data?: Basket }>;
    await journey.step('Given customers A and B, and B has a product in their basket', async () => { ({ a, b } = await twoCustomers(api, seed)); });
    await journey.step('When A requests GET /rest/basket/{id} with A\'s token for A\'s basket id', async () => { own = await api.get(EP.basket(bidOf(a)), { headers: a.headers }); });
    await journey.step('And A requests GET /rest/basket/{id} with A\'s token for B\'s basket id', async () => { other = await api.get(EP.basket(bidOf(b)), { headers: a.headers }); });
    await journey.step('Then A reading their own basket gets it', async () => {
      expect.soft(own.ok, '[REQ AC-6] GET /rest/basket/{id} for A\'s own basket succeeds').toBe(true);
      expect.soft(own.body?.data?.id, '[REQ AC-6] GET /rest/basket/{id} for A\'s own basket returns it').toBe(bidOf(a));
    });
    await journey.step('And the request for B\'s basket does not return B\'s basket', async () => {
      expect(other.body?.data?.id ?? null, '[REQ AC-6] GET /rest/basket/{id} for B\'s basket with A\'s token does not return B\'s basket').not.toBe(bidOf(b));
    });
  });

  test('SCN-008: A request for another customer\'s basket is refused', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1', '@assumes:G4'] }, async ({ api, journey, seed }) => {
    let a!: Account; let b!: Account; let other!: ApiResponse;
    await journey.step('Given customers A and B', async () => { ({ a, b } = await twoCustomers(api, seed)); });
    await journey.step('When A requests GET /rest/basket/{id} with A\'s token for B\'s basket id', async () => { other = await api.get(EP.basket(bidOf(b)), { headers: a.headers }); });
    await journey.step('Then the request is refused with a non-2xx status', async () => {
      expect(String(other.status), '[REQ AC-6] GET /rest/basket/{id} for B\'s basket with A\'s token is refused (not 2xx)').not.toMatch(/^2\d\d$/);
    });
  });
});
