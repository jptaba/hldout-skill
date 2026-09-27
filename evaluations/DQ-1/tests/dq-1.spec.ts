/**
 * Held-out acceptance tests for DQ-1 — "Book Store accounts - create a user, get a token, sign in and sign out".
 * Written from evaluations/DQ-1/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Page } from '@playwright/test';
import { test, expect, gotoPage, type Api, type ApiResponse, type Seed, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from DQ-1 (never edit during hardening)
const REQ = {
  STATUS: { S200: 200, S201: 201, S204: 204, S400: 400, S401: 401, S406: 406 },
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  AC2_CODE: '1300',
  AC2_MESSAGE: "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer.",
  AC2_INVALID_PASSWORDS: [
    { violation: 'too short', password: 'Qa1!xyz' },
    { violation: 'missing an uppercase', password: 'qa1!xyzw9' },
    { violation: 'missing a lowercase', password: 'QA1!XYZW9' },
    { violation: 'missing a digit', password: 'Qa!xyzwv#' },
    { violation: 'missing a special char', password: 'Qa1xyzw9k' },
  ],
  MIN_LENGTH_BOUNDARY: [
    { length: 7, outcome: 'rejected' },
    { length: 8, outcome: 'accepted' },
  ],
  AC3_CODE: '1204',
  AC3_MESSAGE: 'User exists!',
  AC4_CODE: '1200',
  AC4_MESSAGE: 'UserName and Password required.',
  AC4_FIELDS: ['userName', 'password'],
  AC5_STATUS: 'Success',
  AC5_RESULT: 'User authorized successfully.',
  AC5_EXPIRES_DAYS: 7,
  G3_TOLERANCE_MS: 5 * 60 * 1000,
  AC6_STATUS: 'Failed',
  AC6_RESULT: 'User authorization failed.',
  AC6_CREDENTIALS: ['the correct user name and a wrong password', 'an unknown user name and the account password'],
  AC8_WRONG_PASSWORD_MESSAGE: 'User not found!',
  AC9_PROFILE_LABEL: 'User Name :',
  AC9_PROFILE_PATH: /\/profile(?:[?#].*)?$/,
  LOGIN_PATH: /\/login(?:[?#].*)?$/,
  AC10_MESSAGE: 'Invalid username or password!',
  AC12_NOT_LOGGED_IN: 'Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself.',
  AC13_STATUS: 'Failed',
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** POST /Account/v1/User */ accountUser: '/Account/v1/User',
  /** POST /Account/v1/GenerateToken */ accountGenerateToken: '/Account/v1/GenerateToken',
  /** POST /Account/v1/Authorized */ accountAuthorized: '/Account/v1/Authorized',
  /** DELETE /Account/v1/User/{UUID} */ accountUserByUUID: (UUID: string | number) => `/Account/v1/User/${UUID}`,
};

// ---- plumbing (HOW) -----------------------------------------------------------------------------

interface Account { userID: string; userName: string; password: string }
type Body = Record<string, unknown> | null;

let seq = 0;
const newUserName = (data: TestData, seed: Seed) =>
  `${data.account.userNamePrefix}-${seed.tag}-${Date.now().toString(36)}${(seq += 1)}`;
const wrongPassword = (data: TestData) => `${data.account.password}${data.account.wrongPasswordSuffix}`;
const obj = (r: ApiResponse): Record<string, unknown> => (r.body && typeof r.body === 'object' ? (r.body as Record<string, unknown>) : {});
/** G2: the JSON field that carries the error message. */
const messageOf = (r: ApiResponse) => obj(r).message; // G2 discovered: error bodies are { code, message } (hardening/api-mechanics.md)
/** G9: how the user's token is sent to DELETE /Account/v1/User/{UUID}. */
const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` }); // G9 discovered: Authorization: Bearer <token> (hardening/api-mechanics.md)

const tokenRequest = (api: Api, userName: string, password: string) =>
  api.post(EP.accountGenerateToken, { data: { userName, password } }); // G6 discovered: { userName, password } (hardening/api-mechanics.md)

/** Cleanup: delete the account; an account that can no longer get a token is already gone. */
async function deleteAccount(api: Api, a: { userID: string; userName: string; password: string }) {
  const t = await tokenRequest(api, a.userName, a.password);
  const token = obj(t).token;
  if (typeof token !== 'string' || !token) return 'already gone (no token)';
  const d = await api.delete(EP.accountUserByUUID(a.userID), { headers: authHeader(token) });
  if (d.status >= 300) throw new Error(`cleanup DELETE ${a.userID} → ${d.status}`);
  return d.status;
}

async function createAccount(seed: Seed, api: Api, data: TestData, password: string = data.account.password): Promise<Account> {
  const userName = newUserName(data, seed);
  return seed.create('account (POST /Account/v1/User)', async () => {
    const r = await api.post(EP.accountUser, { data: { userName, password } });
    expect(r.status, 'create account (seed)').toBe(201);
    const userID = obj(r).userID;
    expect(typeof userID === 'string' && userID.length > 0, 'create account returned a userID (seed)').toBe(true);
    return { userID: userID as string, userName, password };
  }, (a) => deleteAccount(api, a));
}

async function issueToken(seed: Seed, api: Api, a: Account): Promise<string> {
  return seed.step('token for the account (POST /Account/v1/GenerateToken)', async () => {
    const t = await tokenRequest(api, a.userName, a.password);
    const token = obj(t).token;
    expect(typeof token === 'string' && token.length > 0, 'GenerateToken returned a token (precondition)').toBe(true);
    return token as string;
  });
}

/** Password of the given length that contains one character of each class, built from DQ_USER_PASSWORD. */
function policyPasswordOfLength(base: string, length: number): string {
  const pick = (re: RegExp) => [...base].find((c) => re.test(c));
  const classes = [pick(/[A-Z]/), pick(/[a-z]/), pick(/[0-9]/), pick(/[^A-Za-z0-9]/)];
  expect(classes.every(Boolean), 'DQ_USER_PASSWORD has every character class (precondition)').toBe(true);
  let out = classes.join('');
  for (let i = 0; out.length < length; i += 1) out += base[i % base.length];
  return out.slice(0, length);
}

const loginLocators = (page: Page) => ({
  userName: page.getByRole('textbox', { name: 'UserName', exact: true }),
  password: page.getByRole('textbox', { name: 'Password', exact: true }),
  login: page.getByRole('button', { name: 'Login', exact: true }),
});

async function uiSignIn(page: Page, userName: string, password: string) {
  const l = loginLocators(page);
  await l.userName.fill(userName);
  await l.password.fill(password);
  await l.login.click();
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---- scenarios ----------------------------------------------------------------------------------

test.describe('DQ-1 Book Store accounts - create a user, get a token, sign in and sign out', () => {
  test('SCN-001: A client creates a user with a policy-compliant password and gets 201 with the new user', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let userName = '';
    let res!: ApiResponse;
    await journey.step('Given a unique user name and the password from DQ_USER_PASSWORD', async () => { userName = newUserName(data, seed); });
    await journey.step('When I POST /Account/v1/User with that user name and password', async () => {
      res = await api.post(EP.accountUser, { data: { userName, password: data.account.password } });
      const id = obj(res).userID;
      if (typeof id === 'string' && id) seed.track('account (created under test)', { userID: id, userName, password: data.account.password as string }, (a) => deleteAccount(api, a));
    });
    await journey.step('Then the response status is 201', async () => {
      expect(res.status, '[REQ AC-1] create → 201 Created').toBe(REQ.STATUS.S201);
    });
    await journey.step('And the body contains a userID that is a UUID', async () => {
      expect.soft(String(obj(res).userID ?? ''), '[REQ AC-1] userID is a UUID').toMatch(REQ.UUID);
    });
    await journey.step('And the body username equals the requested user name', async () => {
      expect.soft(obj(res).username, '[REQ AC-1] username equals the requested user name').toBe(userName);
    });
    await journey.step('And the body books is an empty list', async () => {
      expect.soft(obj(res).books, '[REQ AC-1] books is an empty list').toEqual([]);
    });
  });

  REQ.AC2_INVALID_PASSWORDS.forEach((row, i) => {
    test(`SCN-002.${i + 1}: A password that breaks the policy is rejected and no account is created (${row.violation})`, { tag: ['@AC-2', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let userName = '';
      let res!: ApiResponse;
      await journey.step('Given a unique user name', async () => { userName = newUserName(data, seed); });
      await journey.step(`When I POST /Account/v1/User with the password "<password>" that is ${row.violation}`, async () => {
        res = await api.post(EP.accountUser, { data: { userName, password: row.password } });
        const id = obj(res).userID;
        if (typeof id === 'string' && id) seed.track('account (wrongly accepted)', { userID: id, userName, password: row.password as string }, (a) => deleteAccount(api, a));
      });
      await journey.step('Then the response status is 400', async () => {
        expect(res.status, `[REQ AC-2] ${row.violation} → 400`).toBe(REQ.STATUS.S400);
      });
      await journey.step('And the error code is "1300"', async () => {
        expect.soft(String(obj(res).code), '[REQ AC-2] error code 1300').toBe(REQ.AC2_CODE);
      });
      await journey.step('And the error message is the password-policy message', async () => {
        expect.soft(messageOf(res), '[REQ AC-2] password-policy message').toBe(REQ.AC2_MESSAGE);
      });
      await journey.step('And a token cannot be obtained for that user name and password', async () => {
        const t = await tokenRequest(api, userName, row.password);
        expect.soft(obj(t).token ?? null, '[REQ AC-2] no token can be obtained (no account created)').toBeFalsy();
      });
    });
  });

  REQ.MIN_LENGTH_BOUNDARY.forEach((row, i) => {
    test(`SCN-014.${i + 1}: The 8-character minimum length is enforced exactly at the boundary (${row.length} chars)`, { tag: ['@AC-2', '@AC-1', '@type:boundary', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
      let userName = '';
      let password = '';
      let res!: ApiResponse;
      await journey.step('Given a unique user name', async () => { userName = newUserName(data, seed); password = policyPasswordOfLength(data.account.password, row.length); });
      await journey.step(`When I POST /Account/v1/User with a password of ${row.length} characters containing every required character class`, async () => {
        res = await api.post(EP.accountUser, { data: { userName, password } });
        const id = obj(res).userID;
        if (typeof id === 'string' && id) seed.track('account (boundary)', { userID: id, userName, password }, (a) => deleteAccount(api, a));
      });
      await journey.step(`Then the account is ${row.outcome}`, async () => {
        if (row.outcome === 'rejected') {
          expect(res.status, '[REQ AC-2] 7 characters → 400').toBe(REQ.STATUS.S400);
          expect.soft(String(obj(res).code), '[REQ AC-2] 7 characters → code 1300').toBe(REQ.AC2_CODE);
        } else {
          expect(res.status, '[REQ AC-1] 8 characters meets the policy → 201').toBe(REQ.STATUS.S201);
        }
      });
    });
  });

  test('SCN-003: Creating a user whose user name already exists is rejected with 406', { tag: ['@AC-3', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let a!: Account;
    let res!: ApiResponse;
    await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
    await journey.step('When I POST /Account/v1/User again with the same user name', async () => {
      res = await api.post(EP.accountUser, { data: { userName: a.userName, password: a.password } });
    });
    await journey.step('Then the response status is 406', async () => {
      expect(res.status, '[REQ AC-3] duplicate user name → 406').toBe(REQ.STATUS.S406);
    });
    await journey.step('And the error code is "1204"', async () => {
      expect.soft(String(obj(res).code), '[REQ AC-3] error code 1204').toBe(REQ.AC3_CODE);
    });
    await journey.step('And the error message is "User exists!"', async () => {
      expect.soft(messageOf(res), '[REQ AC-3] message "User exists!"').toBe(REQ.AC3_MESSAGE);
    });
  });

  REQ.AC4_FIELDS.forEach((field, i) => {
    test(`SCN-004.${i + 1}: Creating a user without a user name or without a password is rejected with 400 (no ${field})`, { tag: ['@AC-4', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let body: Record<string, string> = {};
      let res!: ApiResponse;
      await journey.step('Given a unique user name and the password from DQ_USER_PASSWORD', async () => {
        body = { userName: newUserName(data, seed), password: data.account.password };
      });
      await journey.step(`When I POST /Account/v1/User without the ${field} field`, async () => {
        const sent = { ...body };
        delete sent[field];
        res = await api.post(EP.accountUser, { data: sent });
        const id = obj(res).userID;
        if (typeof id === 'string' && id) seed.track('account (wrongly accepted)', { userID: id, userName: body.userName, password: body.password }, (a) => deleteAccount(api, a));
      });
      await journey.step('Then the response status is 400', async () => {
        expect(res.status, `[REQ AC-4] no ${field} → 400`).toBe(REQ.STATUS.S400);
      });
      await journey.step('And the error code is "1200"', async () => {
        expect.soft(String(obj(res).code), '[REQ AC-4] error code 1200').toBe(REQ.AC4_CODE);
      });
      await journey.step('And the error message is "UserName and Password required."', async () => {
        expect.soft(messageOf(res), '[REQ AC-4] message').toBe(REQ.AC4_MESSAGE);
      });
    });
  });

  REQ.AC4_FIELDS.forEach((field, i) => {
    test(`SCN-015.${i + 1}: An empty user name or empty password counts as missing and is rejected with 400 (empty ${field})`, { tag: ['@AC-4', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
      let body: Record<string, string> = {};
      let res!: ApiResponse;
      await journey.step('Given a unique user name and the password from DQ_USER_PASSWORD', async () => {
        body = { userName: newUserName(data, seed), password: data.account.password };
      });
      await journey.step(`When I POST /Account/v1/User with an empty ${field}`, async () => {
        res = await api.post(EP.accountUser, { data: { ...body, [field]: '' } });
        const id = obj(res).userID;
        if (typeof id === 'string' && id) seed.track('account (wrongly accepted)', { userID: id, userName: body.userName, password: body.password }, (a) => deleteAccount(api, a));
      });
      await journey.step('Then the response status is 400', async () => {
        expect(res.status, `[REQ AC-4] empty ${field} → 400`).toBe(REQ.STATUS.S400);
      });
      await journey.step('And the error code is "1200"', async () => {
        expect.soft(String(obj(res).code), '[REQ AC-4] error code 1200').toBe(REQ.AC4_CODE);
      });
      await journey.step('And the error message is "UserName and Password required."', async () => {
        expect.soft(messageOf(res), '[REQ AC-4] message').toBe(REQ.AC4_MESSAGE);
      });
    });
  });

  test('SCN-005: GenerateToken with the correct credentials returns a token', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let a!: Account;
    let res!: ApiResponse;
    await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
    await journey.step('When I POST /Account/v1/GenerateToken with the correct user name and password', async () => {
      res = await tokenRequest(api, a.userName, a.password);
    });
    await journey.step('Then the response status is 200', async () => {
      expect(res.status, '[REQ AC-5] GenerateToken → 200').toBe(REQ.STATUS.S200);
    });
    await journey.step('And the token is non-empty', async () => {
      const token = obj(res).token;
      expect.soft(typeof token === 'string' && token.length > 0, '[REQ AC-5] token is non-empty').toBe(true);
    });
    await journey.step('And the status is "Success"', async () => {
      expect.soft(obj(res).status, '[REQ AC-5] status "Success"').toBe(REQ.AC5_STATUS);
    });
    await journey.step('And the result is "User authorized successfully."', async () => {
      expect.soft(obj(res).result, '[REQ AC-5] result').toBe(REQ.AC5_RESULT);
    });
  });

  test('SCN-016: The token expires 7 days after it was issued', { tag: ['@AC-5', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey, data, seed }) => {
    let a!: Account;
    let res!: ApiResponse;
    let sentAt = 0;
    let answeredAt = 0;
    await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
    await journey.step('When I POST /Account/v1/GenerateToken with the correct user name and password', async () => {
      sentAt = Date.now();
      res = await tokenRequest(api, a.userName, a.password);
      answeredAt = Date.now();
    });
    await journey.step('Then expires is a timestamp 7 days after the moment the token was issued', async () => {
      const raw = String(obj(res).expires ?? '');
      const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/i.test(raw);
      const at = Date.parse(hasOffset ? raw : `${raw}Z`);
      expect(Number.isNaN(at), `[REQ AC-5] expires is a timestamp (got "${raw}")`).toBe(false);
      const week = REQ.AC5_EXPIRES_DAYS * 24 * 3600 * 1000;
      expect(at, '[REQ AC-5] expires ≥ issue moment + 7 days (G3 tolerance)').toBeGreaterThanOrEqual(sentAt + week - REQ.G3_TOLERANCE_MS);
      expect(at, '[REQ AC-5] expires ≤ issue moment + 7 days (G3 tolerance)').toBeLessThanOrEqual(answeredAt + week + REQ.G3_TOLERANCE_MS);
    });
  });

  REQ.AC6_CREDENTIALS.forEach((credentials, i) => {
    test(`SCN-006.${i + 1}: GenerateToken with wrong credentials issues no token and answers 401 (${credentials})`, { tag: ['@AC-6', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
      let a!: Account;
      let res!: ApiResponse;
      await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
      await journey.step(`When I POST /Account/v1/GenerateToken with ${credentials}`, async () => {
        res = i === 0
          ? await tokenRequest(api, a.userName, wrongPassword(data))
          : await tokenRequest(api, `${a.userName}-unknown`, a.password);
      });
      await journey.step('Then the response status is 401', async () => {
        expect.soft(res.status, '[REQ AC-6] refused token request → 401 Unauthorized').toBe(REQ.STATUS.S401);
      });
      await journey.step('And token is null', async () => {
        expect.soft(obj(res).token, '[REQ AC-6] token is null').toBeNull();
      });
      await journey.step('And expires is null', async () => {
        expect.soft(obj(res).expires, '[REQ AC-6] expires is null').toBeNull();
      });
      await journey.step('And the status is "Failed"', async () => {
        expect.soft(obj(res).status, '[REQ AC-6] status "Failed"').toBe(REQ.AC6_STATUS);
      });
      await journey.step('And the result is "User authorization failed."', async () => {
        expect.soft(obj(res).result, '[REQ AC-6] result').toBe(REQ.AC6_RESULT);
      });
    });
  });

  test('SCN-007: The issued token does not disclose the user\'s password', { tag: ['@AC-7', '@type:security', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let a!: Account;
    let token = '';
    await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
    await journey.step('When I POST /Account/v1/GenerateToken with the correct user name and password', async () => {
      const res = await tokenRequest(api, a.userName, a.password);
      token = String(obj(res).token ?? '');
      expect(token.length > 0, 'GenerateToken returned a token (precondition for AC-7)').toBe(true);
    });
    let parts: string[] = [];
    await journey.step('Then the token decodes as a JWT', async () => {
      parts = token.split('.');
      expect(parts.length, '[REQ AC-7] token is a JWT (3 dot-separated parts)').toBe(3);
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as unknown;
      expect(typeof header === 'object' && header !== null, '[REQ AC-7] JWT header decodes to JSON').toBe(true);
    });
    await journey.step('And no part of the token or of its decoded header, payload and signature contains the password', async () => {
      const decoded = parts.map((p) => Buffer.from(p, 'base64url').toString('latin1'));
      const leaks = [token, ...decoded].filter((s) => s.includes(a.password)).length;
      expect(leaks, '[REQ AC-7] the password appears in no part of the token').toBe(0);
    });
  });

  test('SCN-008: Authorized is false before a token is issued and true afterwards', { tag: ['@AC-8', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let a!: Account;
    let before!: ApiResponse;
    let after!: ApiResponse;
    await journey.step('Given a user was created through the API and no token has been issued for it', async () => { a = await createAccount(seed, api, data); });
    await journey.step('When I POST /Account/v1/Authorized with the user name and password', async () => {
      before = await api.post(EP.accountAuthorized, { data: { userName: a.userName, password: a.password } });
    });
    await journey.step('Then the answer is false', async () => {
      expect.soft(before.body, '[REQ AC-8] Authorized before any token → false').toBe(false);
    });
    await journey.step('When I generate a token for that user', async () => { await issueToken(seed, api, a); });
    await journey.step('And I POST /Account/v1/Authorized with the user name and password again', async () => {
      after = await api.post(EP.accountAuthorized, { data: { userName: a.userName, password: a.password } });
    });
    await journey.step('Then the answer is true', async () => {
      expect(after.body, '[REQ AC-8] Authorized after a token was generated → true').toBe(true);
    });
  });

  test('SCN-017: Authorized with a wrong password never answers true', { tag: ['@AC-8', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let a!: Account;
    let res!: ApiResponse;
    await journey.step('Given a user was created through the API and a token was generated for it', async () => {
      a = await createAccount(seed, api, data);
      await issueToken(seed, api, a);
    });
    await journey.step('When I POST /Account/v1/Authorized with the user name and a wrong password', async () => {
      res = await api.post(EP.accountAuthorized, { data: { userName: a.userName, password: wrongPassword(data) } });
    });
    await journey.step('Then the answer is not true', async () => {
      expect(res.body, '[REQ AC-8] wrong password never → true').not.toBe(true);
    });
    await journey.step('And the message is "User not found!"', async () => {
      expect.soft(messageOf(res), '[REQ AC-8] message "User not found!"').toBe(REQ.AC8_WRONG_PASSWORD_MESSAGE);
    });
  });

  test('SCN-009: Signing in on the web site with an API-created account opens the profile', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let a!: Account;
    await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
    await journey.step('And I am on the login page /login', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I sign in with that user name and password', async () => { await uiSignIn(page, a.userName, a.password); });
    await journey.step('Then the profile page /profile is open', async () => {
      await expect(page, '[REQ AC-9] profile page is open').toHaveURL(REQ.AC9_PROFILE_PATH);
    });
    await journey.step('And the profile shows "User Name :" followed by the user name', async () => {
      await expect(page.locator('body'), '[REQ AC-9] "User Name :" followed by the user name')
        .toContainText(new RegExp(`${escapeRe(REQ.AC9_PROFILE_LABEL)}\\s*${escapeRe(a.userName)}`));
    });
    await journey.step('And POST /Account/v1/Authorized returns true for the account', async () => {
      const r = await api.post(EP.accountAuthorized, { data: { userName: a.userName, password: a.password } });
      expect(r.body, '[REQ AC-9] Authorized → true after the web sign-in').toBe(true);
    });
  });

  test('SCN-010: Signing in with a wrong password keeps the user on the login page with an error', { tag: ['@AC-10', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let a!: Account;
    await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
    await journey.step('And I am on the login page /login', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I sign in with that user name and a wrong password', async () => { await uiSignIn(page, a.userName, wrongPassword(data)); });
    await journey.step('Then I am still on the login page /login', async () => {
      const msg = page.getByText(REQ.AC10_MESSAGE, { exact: true });
      await msg.waitFor({ state: 'visible' }).catch(() => undefined); // let the sign-in attempt settle
      await expect(page, '[REQ AC-10] stays on the login page').toHaveURL(REQ.LOGIN_PATH);
    });
    await journey.step('And the message "Invalid username or password!" is shown below the form', async () => {
      const msg = page.getByText(REQ.AC10_MESSAGE, { exact: true });
      await expect(msg, '[REQ AC-10] message "Invalid username or password!" is shown').toBeVisible();
      const msgBox = await msg.boundingBox();
      const pwBox = await loginLocators(page).password.boundingBox();
      expect(msgBox && pwBox ? msgBox.y >= pwBox.y + pwBox.height : false, '[REQ AC-10] message is below the form fields').toBe(true);
    });
  });

  test('SCN-018: The wrong-credentials message is shown in red', { tag: ['@AC-10', '@type:usability', '@layer:ui', '@P3'] }, async ({ page, api, journey, data, seed }) => {
    let a!: Account;
    await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
    await journey.step('And I am on the login page /login', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I sign in with that user name and a wrong password', async () => { await uiSignIn(page, a.userName, wrongPassword(data)); });
    await journey.step('Then the message "Invalid username or password!" is rendered in red', async () => {
      const msg = page.getByText(REQ.AC10_MESSAGE, { exact: true });
      await expect(msg, '[REQ AC-10] message is shown').toBeVisible();
      const color = await msg.evaluate((el) => getComputedStyle(el).color);
      const [r, g, b] = (color.match(/\d+(\.\d+)?/g) ?? []).map(Number);
      expect(r >= 150 && r - g >= 60 && r - b >= 60, `[REQ AC-10] message colour is red (G8; got ${color})`).toBe(true);
    });
  });

  test('SCN-011: Clicking Login with both fields empty does not sign in', { tag: ['@AC-11', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am not signed in', async () => { await page.context().clearCookies(); });
    await journey.step('And I am on the login page /login', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I click "Login" with an empty user name and an empty password', async () => {
      await loginLocators(page).login.click();
    });
    await journey.step('Then I am still on the login page /login', async () => {
      await expect(page, '[REQ AC-11] empty fields → still on the login page').toHaveURL(REQ.LOGIN_PATH);
      await expect(page, '[REQ AC-11] empty fields → not on the profile').not.toHaveURL(REQ.AC9_PROFILE_PATH);
    });
  });

  test('SCN-019: Both empty fields are highlighted as invalid after clicking Login', { tag: ['@AC-11', '@type:usability', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
    const isMarkedInvalid = (el: Element) =>
      el.getAttribute('aria-invalid') === 'true' || /invalid|error/i.test(el.className);
    await journey.step('Given I am not signed in', async () => { await page.context().clearCookies(); });
    await journey.step('And I am on the login page /login', async () => { await gotoPage(page, '/login'); });
    await journey.step('When I click "Login" with an empty user name and an empty password', async () => {
      await loginLocators(page).login.click();
    });
    await journey.step('Then the user name field is highlighted as invalid', async () => {
      await expect.poll(() => loginLocators(page).userName.evaluate(isMarkedInvalid), { message: '[REQ AC-11] user name field highlighted as invalid (G8)' }).toBe(true);
    });
    await journey.step('And the password field is highlighted as invalid', async () => {
      await expect.poll(() => loginLocators(page).password.evaluate(isMarkedInvalid), { message: '[REQ AC-11] password field highlighted as invalid (G8)' }).toBe(true);
    });
  });

  test('SCN-012: Logging out returns to the login page and the profile no longer shows the user', { tag: ['@AC-12', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, data, seed }) => {
    let a!: Account;
    await journey.step('Given a user was created through the API', async () => { a = await createAccount(seed, api, data); });
    await journey.step('And I am signed in on the web site and on the profile page /profile', async () => {
      await seed.step('sign in on the web site (UI)', async () => {
        await gotoPage(page, '/login');
        await uiSignIn(page, a.userName, a.password);
        await expect(page, 'signed in and on the profile page (precondition)').toHaveURL(REQ.AC9_PROFILE_PATH);
      });
    });
    await journey.step('When I click "Logout"', async () => {
      await page.getByRole('button', { name: 'Logout', exact: true }).click();
    });
    await journey.step('Then I am on the login page /login', async () => {
      await expect(page, '[REQ AC-12] Logout returns to the login page').toHaveURL(REQ.LOGIN_PATH);
    });
    await journey.step('When I open /profile', async () => { await gotoPage(page, '/profile'); });
    await journey.step('Then the user name is not shown', async () => {
      await expect(page.locator('body'), '[REQ AC-12] not-logged-in text rendered (readiness for absence check)').toContainText(REQ.AC12_NOT_LOGGED_IN);
      await expect(page.locator('body'), '[REQ AC-12] user name no longer shown').not.toContainText(a.userName);
    });
    await journey.step('And the text "Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself." is shown', async () => {
      await expect(page.locator('body'), '[REQ AC-12] not-logged-in message').toContainText(REQ.AC12_NOT_LOGGED_IN);
    });
  });

  test('SCN-013: Deleting the account with the user\'s token returns 204 and the account can no longer get a token', { tag: ['@AC-13', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, data, seed }) => {
    let a!: Account;
    let token = '';
    let res!: ApiResponse;
    await journey.step('Given a user was created through the API and a token was generated for it', async () => {
      a = await createAccount(seed, api, data);
      token = await issueToken(seed, api, a);
    });
    await journey.step('When I DELETE /Account/v1/User/{UUID} with the user\'s token', async () => {
      res = await api.delete(EP.accountUserByUUID(a.userID), { headers: authHeader(token) });
    });
    await journey.step('Then the response status is 204', async () => {
      expect.soft(res.status, '[REQ AC-13] DELETE → 204 No Content').toBe(REQ.STATUS.S204);
    });
    await journey.step('And POST /Account/v1/GenerateToken for that user name returns status "Failed"', async () => {
      const t = await tokenRequest(api, a.userName, a.password);
      expect(obj(t).status, '[REQ AC-13] GenerateToken after delete → status "Failed"').toBe(REQ.AC13_STATUS);
    });
  });
});
