/**
 * Held-out acceptance tests for TOOL-2 — "Customer registration, sign-in and account protection".
 * Written from requirement-contract.json (the requirement only; never from the AUT's code). The steps call the
 * actions in actions/practicesoftwaretesting/ (npm run heldout -- actions TOOL-2); every expectation stays here.
 *
 * Live application: every test registers customers of its own (e-mail addresses with the data prefix) that the
 * application offers no known way to delete; SCN-006 locks the account it registered.
 */
import { test, expect, expectResponse, type Api, type ApiResponse } from '../../../../heldout-support/fixtures';
import { registerCustomer } from '../../../../actions/practicesoftwaretesting/api/users/register-customer';
import { signInCustomer } from '../../../../actions/practicesoftwaretesting/api/users/sign-in-customer';
import { newCustomer, randomLetters, strongPassword, type NewCustomer } from '../../../../actions/practicesoftwaretesting/api/users/_shared';
import { openSignInPage } from '../../../../actions/practicesoftwaretesting/ui/account/open-sign-in-page';
import { submitSignInForm } from '../../../../actions/practicesoftwaretesting/ui/account/submit-sign-in-form';

// OPEN-QUESTION: G1 — the web shop sign-in page's route, its e-mail, password and submit elements and where "Invalid email or password" appears (mechanics: found while hardening)
// OPEN-QUESTION: G2 — how the "My account" page is recognised and where the navigation shows the customer's name (mechanics: found while hardening)
// OPEN-QUESTION: G3 — the response field that holds the 409 message, the 422 password errors and the 423 lock message (mechanics: found while hardening; the 409 and 423 checks read the whole answer)
// G4 (provided by the user, 2026-10-05): GET /users/logout must return any 2xx success; its body is not checked.
// ASSUMPTION: a password error "states" a rule of R1 when it names the rule's key words (8 and characters; upper and lower case; symbol; number): the story gives the rules, not the application's wording.
// ASSUMPTION: rule 4 — the exact success status of a registration (201) is asserted once, in SCN-001; the other registrations only check that they were accepted.

// @req-constants-start — expected outcomes copied verbatim from TOOL-2 (never edit during hardening)
const REQ = {
  STATUS: { CREATED: 201, UNAUTHORIZED: 401, CONFLICT: 409, UNPROCESSABLE: 422, LOCKED: 423 },
  DUPLICATE_MESSAGE: 'A customer with this email address already exists.',
  INVALID_SIGN_IN_MESSAGE: 'Invalid email or password',
  MY_ACCOUNT: 'My account',
  /** "the 423 response carries a message saying the account is locked" */
  LOCKED_MESSAGE: /locked/i,
  /** "attempts one to five respond 401 and the sixth attempt, even with the correct password, responds 423" */
  FAILED_ATTEMPTS_BEFORE_LOCK: 5,
  /** R1: at least 8 characters, upper and lower case letters, a symbol, a number */
  PASSWORD_RULES: {
    LENGTH: { text: 'at least 8 characters', words: [/\b8\b/, /characters?/i] },
    CASE: { text: 'upper and lower case letters', words: [/upper/i, /lower/i] },
    SYMBOL: { text: 'a symbol', words: [/symbol/i] },
    NUMBER: { text: 'a number', words: [/number/i] },
  },
  MIN_PASSWORD_LENGTH: 8,
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** POST /users/register */ usersRegister: '/users/register',
  /** POST /users/login */ usersLogin: '/users/login',
  /** GET /users/me */ usersMe: '/users/me',
  /** GET /users/logout */ usersLogout: '/users/logout',
};

/** Inputs: the weak password AC-3 names, and passwords that break exactly one rule of R1 (random, never leaked). */
const WEAK_PASSWORD = 'abc';
const ONE_RULE_BROKEN = [
  { broken: 'CASE', note: 'no upper case letter', password: () => `${randomLetters(10)}7!` },
  { broken: 'CASE', note: 'no lower case letter', password: () => `${randomLetters(10).toUpperCase()}7!` },
  { broken: 'SYMBOL', note: 'no symbol', password: () => `Q${randomLetters(10)}73` },
  { broken: 'NUMBER', note: 'no number', password: () => `Q${randomLetters(10)}!#` },
] as const;
const LENGTH_CASES = [
  { length: REQ.MIN_PASSWORD_LENGTH - 1, outcome: 'rejected' },
  { length: REQ.MIN_PASSWORD_LENGTH, outcome: 'accepted' },
] as const;

/** The password errors of a 422 registration answer, as one text. */
function passwordErrors(res: ApiResponse): string {
  const body = res.body as Record<string, unknown> | undefined;
  const errors = body?.password ?? (body?.errors as Record<string, unknown> | undefined)?.password; // TODO(harden) where the 422 answer lists the password errors (G3)
  return Array.isArray(errors) ? errors.join(' | ') : String(errors ?? '');
}

/** Every key of a JSON value, at every level. */
function keysDeep(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keysDeep);
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => [k, ...keysDeep(v)]);
  return [];
}

/** POST /users/register with a customer's details: the call under test of AC-1 to AC-3. */
const register = (api: Api, customer: NewCustomer) => api.post<Record<string, unknown>>(EP.usersRegister, { data: customer }); // TODO(harden) request fields
/** POST /users/login with an e-mail address and a password: the call under test of AC-5 and AC-6. */
const login = (api: Api, email: string, password: string) => api.post(EP.usersLogin, { data: { email, password } }); // TODO(harden) request fields

test.describe('TOOL-2 Customer registration, sign-in and account protection', () => {
  // ---- First pass: one test per criterion ----------------------------------------------------------------------

  // from story.md#L23
  test('SCN-001: A new customer registers and the API answers 201 with their details and an id', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let customer!: NewCustomer; let res!: ApiResponse<Record<string, unknown>>;
    await journey.step('Given a new customer with a unique e-mail address', async () => { customer = newCustomer(); });
    await journey.step('When their details are posted to POST /users/register', async () => {
      res = await register(api, customer);
      seed.track(`registered customer ${customer.email}`, res.body);
    });
    await journey.step("Then the API responds 201 with the customer's details and an id", async () => {
      expectResponse(res, { status: REQ.STATUS.CREATED }, '[REQ AC-1] POST /users/register responds 201');
      expect.soft(res.body, "[REQ AC-1] POST /users/register answers the customer's details").toMatchObject({
        first_name: customer.first_name, last_name: customer.last_name, email: customer.email, // TODO(harden) field names of the answer
      });
      expect.soft(res.body?.id, '[REQ AC-1] POST /users/register answers an id').toBeTruthy(); // TODO(harden) field of the id
    });
  });

  // from story.md#L29
  test('SCN-002: Registering an already registered e-mail address again is refused with 409', { tag: ['@AC-2', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let existing!: NewCustomer; let res!: ApiResponse;
    await journey.step('Given a customer already registered with an e-mail address', async () => { existing = await registerCustomer(api, seed); });
    await journey.step('When the same e-mail address is registered again', async () => {
      res = await register(api, newCustomer({ email: existing.email }));
    });
    await journey.step('Then the API responds 409 with the message "A customer with this email address already exists."', async () => {
      expectResponse(res, { status: REQ.STATUS.CONFLICT }, '[REQ AC-2] POST /users/register with a registered e-mail responds 409');
      expect.soft(res.text, '[REQ AC-2] POST /users/register answers "A customer with this email address already exists."').toContain(REQ.DUPLICATE_MESSAGE);
    });
  });

  // from story.md#L34
  test('SCN-003: Registering with the password "abc" is refused with 422 and all four password rules', { tag: ['@AC-3', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let customer!: NewCustomer; let res!: ApiResponse;
    await journey.step('Given a new customer whose password is "abc"', async () => { customer = newCustomer({ password: WEAK_PASSWORD }); });
    await journey.step('When they register', async () => {
      res = await register(api, customer);
      if (res.ok) seed.track(`customer wrongly registered ${customer.email}`, res.body);
    });
    await journey.step('Then the API responds 422 and the password errors state all four rules', async () => {
      expectResponse(res, { status: REQ.STATUS.UNPROCESSABLE }, '[REQ AC-3] POST /users/register with password "abc" responds 422');
      const errors = passwordErrors(res);
      for (const rule of Object.values(REQ.PASSWORD_RULES)) {
        for (const word of rule.words) {
          expect.soft(errors, `[REQ AC-3] POST /users/register password errors state the rule: ${rule.text}`).toMatch(word);
        }
      }
    });
  });

  // from story.md#L39
  test('SCN-004: A registered customer signs in on the web shop and lands on "My account" with their name shown', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: NewCustomer;
    await journey.step("Given a registered customer on the web shop's sign-in page", async () => {
      me = await registerCustomer(api, seed);
      await openSignInPage(page);
    });
    await journey.step('When they sign in with their e-mail address and password', async () => {
      await submitSignInForm(page, me.email, me.password);
    });
    await journey.step('Then they land on the "My account" page', async () => {
      await expect(page.getByRole('heading', { name: REQ.MY_ACCOUNT }), '[REQ AC-4] the "My account" page is shown').toBeVisible({ timeout: 15_000 }); // TODO(harden)
    });
    await journey.step('And the navigation shows their first and last name', async () => {
      await expect(page.getByRole('navigation').first(), "[REQ AC-4] the navigation shows the customer's first and last name").toContainText(`${me.first_name} ${me.last_name}`); // TODO(harden)
    });
  });

  // from story.md#L45
  test('SCN-005: Signing in with a wrong password is refused by POST /users/login with 401', { tag: ['@AC-5', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: NewCustomer; let res!: ApiResponse;
    await journey.step('Given a registered customer', async () => { me = await registerCustomer(api, seed); });
    await journey.step('When they sign in with a wrong password', async () => { res = await login(api, me.email, `${me.password}x`); });
    await journey.step('Then POST /users/login responds 401', async () => {
      expectResponse(res, { status: REQ.STATUS.UNAUTHORIZED }, '[REQ AC-5] POST /users/login with a wrong password responds 401');
    });
  });

  // from story.md#L51
  test('SCN-006: After five failed sign-ins the account is locked: the sixth, with the correct password, gets 423', { tag: ['@AC-6', '@type:security', '@layer:api', '@P1', '@irreversible'] }, async ({ api, journey, seed }) => {
    let me!: NewCustomer; const attempts: ApiResponse[] = []; let sixth!: ApiResponse;
    await journey.step('Given a registered customer', async () => { me = await registerCustomer(api, seed); });
    await journey.step('When five sign-in attempts with a wrong password are made', async () => {
      for (let i = 1; i <= REQ.FAILED_ATTEMPTS_BEFORE_LOCK; i++) attempts.push(await login(api, me.email, `${me.password}x${i}`));
    });
    await journey.step('Then attempts one to five respond 401', async () => {
      attempts.forEach((res, i) => {
        expect.soft(res.status, `[REQ AC-6] POST /users/login wrong-password attempt ${i + 1} responds 401`).toBe(REQ.STATUS.UNAUTHORIZED);
      });
    });
    await journey.step('And the sixth attempt, even with the correct password, responds 423 with a message that the account is locked', async () => {
      sixth = await login(api, me.email, me.password);
      expectResponse(sixth, { status: REQ.STATUS.LOCKED }, '[REQ AC-6] POST /users/login sixth attempt with the correct password responds 423');
      expect.soft(sixth.text, '[REQ AC-6] POST /users/login 423 answer says the account is locked').toMatch(REQ.LOCKED_MESSAGE);
    });
  });

  // from story.md#L57
  test('SCN-007: After GET /users/logout the same token gets 401 from GET /users/me', { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let auth!: { token: string; headers: Record<string, string> }; let me!: ApiResponse;
    await journey.step('Given a signed-in customer with an access token', async () => {
      const customer = await registerCustomer(api, seed);
      auth = await signInCustomer(api, seed, customer.email, customer.password);
      await seed.step('the token is accepted by GET /users/me before signing out', async () => {
        const before = await api.get(EP.usersMe, { headers: auth.headers });
        expect(before.ok, `GET /users/me with the fresh token (precondition): ${before.status}`).toBe(true);
      });
    });
    await journey.step('When they sign out with GET /users/logout', async () => { await api.get(EP.usersLogout, { headers: auth.headers }); });
    await journey.step('Then GET /users/me with the same token responds 401', async () => {
      me = await api.get(EP.usersMe, { headers: auth.headers });
      expectResponse(me, { status: REQ.STATUS.UNAUTHORIZED }, '[REQ AC-7] GET /users/me with the signed-out token responds 401');
    });
  });

  // ---- Second pass: the types the criteria state or imply ------------------------------------------------------

  // from story.md#L27
  test('SCN-008: The registration answer does not contain the password', { tag: ['@AC-1', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let customer!: NewCustomer; let res!: ApiResponse<Record<string, unknown>>;
    await journey.step('Given a new customer with a unique e-mail address', async () => { customer = newCustomer(); });
    await journey.step('When their details are posted to POST /users/register', async () => {
      res = await register(api, customer);
      seed.track(`registered customer ${customer.email}`, res.body);
      expect(res.ok, `the registration was accepted (precondition): ${res.status}`).toBe(true);
    });
    await journey.step('Then the response does not contain the password', async () => {
      expect.soft(res.text, '[REQ AC-1] POST /users/register answer does not contain the password').not.toContain(customer.password);
      expect.soft(keysDeep(res.body).filter((k) => /password/i.test(k)), '[REQ AC-1] POST /users/register answer has no password field').toEqual([]);
    });
  });

  // from story.md#L29-L32 (R2: an e-mail address can be registered only once)
  test('SCN-009: Simultaneous registrations of one e-mail address: exactly one is accepted, the others get 409', { tag: ['@AC-2', '@type:concurrency', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    for (let round = 1; round <= 3; round++) {
      let email = ''; let answers: ApiResponse[] = [];
      await journey.step(`Given a new, unregistered e-mail address (round ${round})`, async () => { email = newCustomer().email; });
      await journey.step(`When three customers register it at the same moment (round ${round})`, async () => {
        answers = await Promise.all([1, 2, 3].map(() => register(api, newCustomer({ email }))));
        answers.filter((a) => a.ok).forEach((a) => seed.track(`registered customer ${email}`, a.body));
      });
      await journey.step(`Then exactly one registration is accepted and the others respond 409 (round ${round})`, async () => {
        const statuses = answers.map((a) => a.status);
        expect.soft(statuses.filter((s) => s >= 200 && s < 300).length, `[REQ AC-2] POST /users/register round ${round}: exactly one registration of ${email} is accepted`).toBe(1);
        expect(statuses.filter((s) => s >= 300).every((s) => s === REQ.STATUS.CONFLICT), `[REQ AC-2] POST /users/register round ${round}: the other registrations respond 409 (${statuses.join(', ')})`).toBe(true);
      });
    }
  });

  LENGTH_CASES.forEach((row, i) => {
    // from story.md#L37 (R1: at least 8 characters)
    test(`SCN-010.${i + 1}: A password of ${row.length} characters meeting every other rule is ${row.outcome}`, { tag: ['@AC-3', '@type:boundary', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
      let customer!: NewCustomer; let res!: ApiResponse;
      await journey.step(`Given a new customer whose password has ${row.length} characters, with upper and lower case letters, a symbol and a number`, async () => {
        customer = newCustomer({ password: strongPassword(row.length) });
      });
      await journey.step('When they register', async () => {
        res = await register(api, customer);
        if (res.ok) seed.track(`registered customer ${customer.email}`, res.body);
      });
      if (row.outcome === 'accepted') {
        await journey.step('Then the registration is accepted', async () => {
          expect(res.ok, `[REQ AC-3] POST /users/register with a ${row.length}-character password is accepted (${res.status})`).toBe(true);
        });
      } else {
        await journey.step('Then the API responds 422 and the password errors state the rule: at least 8 characters', async () => {
          expectResponse(res, { status: REQ.STATUS.UNPROCESSABLE }, `[REQ AC-3] POST /users/register with a ${row.length}-character password responds 422`);
          for (const word of REQ.PASSWORD_RULES.LENGTH.words) {
            expect.soft(passwordErrors(res), `[REQ AC-3] POST /users/register password errors state the rule: ${REQ.PASSWORD_RULES.LENGTH.text}`).toMatch(word);
          }
        });
      }
    });
  });

  ONE_RULE_BROKEN.forEach((row, i) => {
    const rule = REQ.PASSWORD_RULES[row.broken];
    // from story.md#L34-L37 (every broken rule listed)
    test(`SCN-011.${i + 1}: A password with ${row.note} is refused with 422 and the rule "${rule.text}"`, { tag: ['@AC-3', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
      let customer!: NewCustomer; let res!: ApiResponse;
      await journey.step(`Given a new customer whose password has ${row.note}`, async () => { customer = newCustomer({ password: row.password() }); });
      await journey.step('When they register', async () => {
        res = await register(api, customer);
        if (res.ok) seed.track(`customer wrongly registered ${customer.email}`, res.body);
      });
      await journey.step(`Then the API responds 422 and the password errors state the rule: ${rule.text}`, async () => {
        expectResponse(res, { status: REQ.STATUS.UNPROCESSABLE }, `[REQ AC-3] POST /users/register with a password with ${row.note} responds 422`);
        for (const word of rule.words) {
          expect.soft(passwordErrors(res), `[REQ AC-3] POST /users/register password errors state the rule: ${rule.text}`).toMatch(word);
        }
      });
    });
  });

  // from story.md#L45-L49
  test('SCN-012: Signing in on the web shop with a wrong password shows "Invalid email or password"', { tag: ['@AC-5', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: NewCustomer;
    await journey.step("Given a registered customer on the web shop's sign-in page", async () => {
      me = await registerCustomer(api, seed);
      await openSignInPage(page);
    });
    await journey.step('When they sign in with a wrong password', async () => {
      await submitSignInForm(page, me.email, `${me.password}x`);
    });
    await journey.step('Then the web shop shows "Invalid email or password"', async () => {
      await expect(page.getByText(REQ.INVALID_SIGN_IN_MESSAGE), '[REQ AC-5] the web shop shows "Invalid email or password"').toBeVisible({ timeout: 15_000 });
    });
  });

  // from story.md#L59, G4 (provided by the user)
  test('SCN-013: Signing out with GET /users/logout answers a 2xx success', { tag: ['@AC-7', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    let auth!: { token: string; headers: Record<string, string> }; let res!: ApiResponse;
    await journey.step('Given a signed-in customer with an access token', async () => {
      const customer = await registerCustomer(api, seed);
      auth = await signInCustomer(api, seed, customer.email, customer.password);
    });
    await journey.step('When they sign out with GET /users/logout', async () => { res = await api.get(EP.usersLogout, { headers: auth.headers }); });
    await journey.step('Then GET /users/logout answers a 2xx success (body not checked)', async () => {
      expect(res.status >= 200 && res.status < 300, `[REQ AC-7] GET /users/logout answers a 2xx success (${res.status})`).toBe(true);
    });
  });
});
