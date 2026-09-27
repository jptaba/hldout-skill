# Held-out Evaluation Verdict — DQ-1

> **Verdict: ❌ FAIL** — 2 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-6, AC-7. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [DQ-1](https://your-domain.atlassian.net/browse/DQ-1) — Book Store accounts - create a user, get a token, sign in and sign out |
| Application under test | DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — UI https://demoqa.com |
| Final run | `03-eval` · 2026-09-27T05:59:10.271Z · 82s |
| Tests | 27 total · 24 passed · 3 failed · 0 flaky · 0 skipped (from 19 scenarios) |
| Held-out integrity | ✅ PRESERVED — 49 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 2 (Playwright MCP driven through heldout mcp-probe, its own stdio server — the session's shared mcp__playwright__* browser was deliberately not used… (see hardening log) |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-27T16:56:11.841Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Critical | AC-7 | security | Access token (JWT) contains the user's cleartext password | SCN-007 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Major | AC-6 | negative | GenerateToken refusal answers 200 instead of 401 Unauthorized | SCN-006.1, SCN-006.2 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (2 root cause(s), 3 failing test(s))

### APP-1 · SCN-007 · AC-7 — Access token (JWT) contains the user's cleartext password

| | |
| --- | --- |
| Suggested severity | Critical |
| Requirement AC-7 | The token must not disclose the user's password: decoding the token (a JWT) must not reveal the password in any part of it. |
| Requirement source | story.md#L57 (AC-7) |
| Test type · layer | security · api |
| SCN-007: expected (requirement) → actual (AUT) | `0` → `1` |
| Failing step | And no part of the token or of its decoded header, payload and signature contains the password |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxesvps60`; recreate equivalent data before reproducing):

- account (POST /Account/v1/User): `{"userID":"4b739b7a-0857-4c43-9a04-60049cad848f","userName":"qa-dq1-hxesvps60-mujesvpt1","password":"***redacted***"}` · cleanup: done

**Manually (scenario steps):**

1. Given a user was created through the API
2. When I POST /Account/v1/GenerateToken with the correct user name and password
3. Then the token decodes as a JWT
4. And no part of the token or of its decoded header, payload and signature contains the password

**API pre-steps: SCN-007** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /Account/v1/User → 201`

   ```bash
   curl -i -X POST 'https://demoqa.com/Account/v1/User' \
     -H 'Content-Type: application/json' \
     --data '{"userName":"qa-dq1-hxesvps60-mujesvpt1","password":"<secret from test-data.json / .env>"}'
   ```

**Via the API: SCN-007** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /Account/v1/GenerateToken → 200` ⟵

   ```bash
   curl -i -X POST 'https://demoqa.com/Account/v1/GenerateToken' \
     -H 'Content-Type: application/json' \
     --data '{"userName":"qa-dq1-hxesvps60-mujesvpt1","password":"<secret from test-data.json / .env>"}'
   ```

Observed response of request 1 (SCN-007):

```json
{"token":"***redacted***","expires":"2026-10-04T06:00:04.544Z","status":"Success","result":"User authorized successfully."}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run DQ-1 --label repro --grep "SCN-007:"
```

#### Evidence

- [Page/test context at failure](../../runs/03-eval/artifacts/DQ-1-tests-dq-1-DQ-1-Book--eba10-isclose-the-user-s-password-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DQ-1/runs/03-eval/artifacts/DQ-1-tests-dq-1-DQ-1-Book--eba10-isclose-the-user-s-password-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 with a black-box decode script (evaluations/DQ-1/hardening/confirm-ac7.ts): runs/03-eval/confirm/scn-007-jwt-decode.md - payload claims userName, password (= the password), iat; header and signature clean. Password value never printed.

**Evaluator's analysis:** AC-7: decoding the token must not reveal the password in any part. The token returned by POST /Account/v1/GenerateToken is a JWT whose payload (base64url, not encrypted) carries the claims userName, password and iat; the password claim equals the account's password in cleartext. Anyone holding the token (logs, browser storage, proxies) can read the password. The test decoded the token correctly (3 parts, header JSON with alg/typ), so this is not a script defect.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-006.1, SCN-006.2 · AC-6 — GenerateToken refusal answers 200 instead of 401 Unauthorized

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | POST /Account/v1/GenerateToken with a wrong password issues no token: token and expires are null, status is "Failed" and result is "User authorization failed." |
| Requirement source | story.md#L55 (AC-6), story.md#L75 (PO clarification: 401 for a wrong password or an unknown user name) |
| Test type · layer | negative · api |
| SCN-006.1: expected (requirement) → actual (AUT) | `401` → `200` |
| SCN-006.2: expected (requirement) → actual (AUT) | `401` → `200` |
| Failing step | Then the response status is 401 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxesmdn50`; recreate equivalent data before reproducing):

- account (POST /Account/v1/User): `{"userID":"507fc401-7bb2-41c0-bc2b-a0ba524653b5","userName":"qa-dq1-hxesmdn50-mujesmdn1","password":"***redacted***"}` · cleanup: done

**Manually (scenario steps):**

1. Given a user was created through the API
2. When I POST /Account/v1/GenerateToken with <credentials>
3. Then the response status is 401
4. And token is null
5. And expires is null
6. And the status is "Failed"
7. And the result is "User authorization failed."

**API pre-steps: SCN-006.1** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /Account/v1/User → 201`

   ```bash
   curl -i -X POST 'https://demoqa.com/Account/v1/User' \
     -H 'Content-Type: application/json' \
     --data '{"userName":"qa-dq1-hxesmdn50-mujesmdn1","password":"<secret from test-data.json / .env>"}'
   ```

**Via the API: SCN-006.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /Account/v1/GenerateToken → 200` ⟵

   ```bash
   curl -i -X POST 'https://demoqa.com/Account/v1/GenerateToken' \
     -H 'Content-Type: application/json' \
     --data '{"userName":"qa-dq1-hxesmdn50-mujesmdn1","password":"<secret from test-data.json / .env>"}'
   ```

Observed response of request 1 (SCN-006.1):

```json
{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}
```

**API pre-steps: SCN-006.2** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /Account/v1/User → 201`

   ```bash
   curl -i -X POST 'https://demoqa.com/Account/v1/User' \
     -H 'Content-Type: application/json' \
     --data '{"userName":"qa-dq1-hxesl1y40-mujesl1z1","password":"<secret from test-data.json / .env>"}'
   ```

**Via the API: SCN-006.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /Account/v1/GenerateToken → 200` ⟵

   ```bash
   curl -i -X POST 'https://demoqa.com/Account/v1/GenerateToken' \
     -H 'Content-Type: application/json' \
     --data '{"userName":"qa-dq1-hxesl1y40-mujesl1z1-unknown","password":"<secret from test-data.json / .env>"}'
   ```

Observed response of request 1 (SCN-006.2):

```json
{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run DQ-1 --label repro --grep "SCN-006\.1:"
npm run heldout -- run DQ-1 --label repro --grep "SCN-006\.2:"
```

#### Evidence

- [Page/test context at failure](../../runs/03-eval/artifacts/DQ-1-tests-dq-1-DQ-1-Book--bc0ed--name-and-a-wrong-password--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DQ-1/runs/03-eval/artifacts/DQ-1-tests-dq-1-DQ-1-Book--bc0ed--name-and-a-wrong-password--chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3, api-probe --chain): runs/03-eval/confirm/scn-006-api-probe.md steps 2 (wrong password) and 3 (unknown user name) both -> 200 with the AC-6 body; same result in runs 01-harden, 02-harden (x3) and 03-eval.

**Evaluator's analysis:** The PO clarification (story.md#L75) requires POST /Account/v1/GenerateToken with a wrong password or an unknown user name to answer 401 Unauthorized. The request was well-formed (fields userName/password confirmed in hardening, G6), the declared endpoint answered, and the body matches AC-6 exactly (token/expires null, status Failed, result 'User authorization failed.') - only the HTTP status is 200 instead of 401. Not a mechanics issue.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A client creates a user with a policy-compliant password and gets 201 with the new user | AC-1 | functional | ✅ passed | - |
| SCN-002.1 | A password that breaks the policy is rejected and no account is created (too short) | AC-2 | negative | ✅ passed | - |
| SCN-002.2 | A password that breaks the policy is rejected and no account is created (missing an uppercase) | AC-2 | negative | ✅ passed | - |
| SCN-002.3 | A password that breaks the policy is rejected and no account is created (missing a lowercase) | AC-2 | negative | ✅ passed | - |
| SCN-002.4 | A password that breaks the policy is rejected and no account is created (missing a digit) | AC-2 | negative | ✅ passed | - |
| SCN-002.5 | A password that breaks the policy is rejected and no account is created (missing a special char) | AC-2 | negative | ✅ passed | - |
| SCN-003 | Creating a user whose user name already exists is rejected with 406 | AC-3 | negative | ✅ passed | - |
| SCN-004.1 | Creating a user without a user name or without a password is rejected with 400 (no userName) | AC-4 | negative | ✅ passed | - |
| SCN-004.2 | Creating a user without a user name or without a password is rejected with 400 (no password) | AC-4 | negative | ✅ passed | - |
| SCN-005 | GenerateToken with the correct credentials returns a token | AC-5 | functional | ✅ passed | - |
| SCN-006.1 | GenerateToken with wrong credentials issues no token and answers 401 (the correct user name and a wrong password) | AC-6 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-006.2 | GenerateToken with wrong credentials issues no token and answers 401 (an unknown user name and the account password) | AC-6 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007 | The issued token does not disclose the user's password | AC-7 | security | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-008 | Authorized is false before a token is issued and true afterwards | AC-8 | functional | ✅ passed | - |
| SCN-009 | Signing in on the web site with an API-created account opens the profile | AC-9 | integration | ✅ passed | - |
| SCN-010 | Signing in with a wrong password keeps the user on the login page with an error | AC-10 | negative | ✅ passed | - |
| SCN-011 | Clicking Login with both fields empty does not sign in | AC-11 | negative | ✅ passed | - |
| SCN-012 | Logging out returns to the login page and the profile no longer shows the user | AC-12 | functional | ✅ passed | - |
| SCN-013 | Deleting the account with the user's token returns 204 and the account can no longer get a token | AC-13 | functional | ✅ passed | - |
| SCN-014.1 | The 8-character minimum length is enforced exactly at the boundary (7 chars) | AC-2, AC-1 | boundary | ✅ passed | - |
| SCN-014.2 | The 8-character minimum length is enforced exactly at the boundary (8 chars) | AC-2, AC-1 | boundary | ✅ passed | - |
| SCN-015.1 | An empty user name or empty password counts as missing and is rejected with 400 (empty userName) | AC-4 | negative | ✅ passed | - |
| SCN-015.2 | An empty user name or empty password counts as missing and is rejected with 400 (empty password) | AC-4 | negative | ✅ passed | - |
| SCN-016 | The token expires 7 days after it was issued | AC-5 | contract | ✅ passed | - |
| SCN-017 | Authorized with a wrong password never answers true | AC-8 | negative | ✅ passed | - |
| SCN-018 | The wrong-credentials message is shown in red | AC-10 | usability | ✅ passed | - |
| SCN-019 | Both empty fields are highlighted as invalid after clicking Login | AC-11 | usability | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Creating a user with POST /Account/v1/User and a JSON body { "userName", "password" } whose password satisfies the policy returns 201 Created. The body contains the new user's id (userID, a UUID), username equal to the requested user name, and an empty books list. | SCN-001, SCN-014.1, SCN-014.2 | ✅ met |
| AC-2 | A password that does not satisfy the policy (too short, or missing an uppercase letter, a lowercase letter, a digit or a special character) is rejected with 400, error code "1300" and the message "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer." No account is created (a token cannot be obtained for it). | SCN-002, SCN-014 (7 tests) | ✅ met |
| AC-3 | Creating a user whose user name already exists is rejected with 406, error code "1204" and the message "User exists!". | SCN-003 | ✅ met |
| AC-4 | Creating a user without a user name or without a password is rejected with 400, error code "1200" and the message "UserName and Password required." | SCN-004.1, SCN-004.2, SCN-015.1, SCN-015.2 | ✅ met |
| AC-5 | POST /Account/v1/GenerateToken with the correct user name and password returns 200 with a non-empty token, status "Success", result "User authorized successfully." and an expires timestamp 7 days after the moment the token was issued. | SCN-005, SCN-016 | ✅ met |
| AC-6 | POST /Account/v1/GenerateToken with a wrong password issues no token: token and expires are null, status is "Failed" and result is "User authorization failed." | SCN-006.1, SCN-006.2 | ❌ not met |
| AC-7 | The token must not disclose the user's password: decoding the token (a JWT) must not reveal the password in any part of it. | SCN-007 | ❌ not met |
| AC-8 | POST /Account/v1/Authorized with { "userName", "password" } returns false for a newly created user who has not been issued a token yet, and true once a token has been generated for that user. With a wrong password it never returns true; it answers with the message "User not found!". | SCN-008, SCN-017 | ✅ met |
| AC-9 | On the login page (/login), signing in with an account created through the API opens the profile page (/profile), which shows "User Name :" followed by that user's name. After this sign-in, POST /Account/v1/Authorized returns true for the account. | SCN-009 | ✅ met |
| AC-10 | Signing in with a wrong password keeps the user on the login page and shows the message "Invalid username or password!" in red below the form. | SCN-010, SCN-018 | ✅ met |
| AC-11 | Clicking "Login" with an empty user name and an empty password does not sign in; both fields are highlighted as invalid. | SCN-011, SCN-019 | ✅ met |
| AC-12 | Clicking "Logout" on the profile page signs the user out and returns to the login page. Opening /profile afterwards no longer shows the user name and shows "Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself." | SCN-012 | ✅ met |
| AC-13 | DELETE /Account/v1/User/{UUID}, authorized with the user's token, deletes the account and returns 204 No Content. Afterwards POST /Account/v1/GenerateToken for that user name returns status "Failed". | SCN-013 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L45 (AC-1), story.md#L32-L33 (accounts and data) | SCN-001 A client creates a user with a policy-compliant password and gets 201 with the new user | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L34 (R1 "at least 8 characters"), story.md#L47 (AC-2), story.md#L45 (AC-1) | SCN-014 The 8-character minimum length is enforced exactly at the boundary | boundary | api | 2/2 | ✅ meets requirement | - |
| **AC-2** | story.md#L47 (AC-2), story.md#L34 (password policy) | SCN-002 A password that breaks the policy is rejected and no account is created | negative | api | 5/5 | ✅ meets requirement | - |
| ↳ | story.md#L34 (R1 "at least 8 characters"), story.md#L47 (AC-2), story.md#L45 (AC-1) | SCN-014 The 8-character minimum length is enforced exactly at the boundary | boundary | api | 2/2 | ✅ meets requirement | - |
| **AC-3** | story.md#L49 (AC-3) | SCN-003 Creating a user whose user name already exists is rejected with 406 | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L51 (AC-4) | SCN-004 Creating a user without a user name or without a password is rejected with 400 | negative | api | 2/2 | ✅ meets requirement | - |
| ↳ | story.md#L51 (AC-4), contract G7 (assumed: an empty string also counts as "without") | SCN-015 An empty user name or empty password counts as missing and is rejected with 400 | negative | api | 2/2 | ✅ meets requirement | - |
| **AC-5** | story.md#L53 (AC-5) | SCN-005 GenerateToken with the correct credentials returns a token | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L53 (AC-5), contract G3 (assumed tolerance and time format) | SCN-016 The token expires 7 days after it was issued | contract | api | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L55 (AC-6), story.md#L75 (PO clarification: 401 for a wrong password or an unknown user name) | SCN-006 GenerateToken with wrong credentials issues no token and answers 401 | negative | api | 0/2 | ❌ fails requirement | APP-2 |
| **AC-7** | story.md#L57 (AC-7) | SCN-007 The issued token does not disclose the user's password | security | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-8** | story.md#L59 (AC-8) | SCN-008 Authorized is false before a token is issued and true afterwards | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L59 (AC-8), contract G4 (no status asserted) | SCN-017 Authorized with a wrong password never answers true | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-9** | story.md#L61 (AC-9) | SCN-009 Signing in on the web site with an API-created account opens the profile | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-10** | story.md#L63 (AC-10) | SCN-010 Signing in with a wrong password keeps the user on the login page with an error | negative | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L63 (AC-10), contract G8 (assumed meaning of "in red") | SCN-018 The wrong-credentials message is shown in red | usability | ui | 1/1 | ✅ meets requirement | - |
| **AC-11** | story.md#L65 (AC-11) | SCN-011 Clicking Login with both fields empty does not sign in | negative | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L65 (AC-11), contract G8 (assumed meaning of "highlighted as invalid") | SCN-019 Both empty fields are highlighted as invalid after clicking Login | usability | ui | 1/1 | ✅ meets requirement | - |
| **AC-12** | story.md#L67 (AC-12) | SCN-012 Logging out returns to the login page and the profile no longer shows the user | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-13** | story.md#L69 (AC-13) | SCN-013 Deleting the account with the user's token returns 204 and the account can no longer get a token | functional | api | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 1 | 2 | 2 | 0 | 0 | - |
| contract | 1 | 1 | 1 | 0 | 0 | - |
| functional | 5 | 5 | 5 | 0 | 0 | - |
| integration | 1 | 1 | 1 | 0 | 0 | - |
| negative | 8 | 15 | 13 | 2 | 0 | APP-2 |
| security | 1 | 1 | 0 | 1 | 0 | APP-1 |
| usability | 2 | 2 | 2 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | HTTP status for a refused token request: AC-6 states only the body; the PO comment requires 401 Unauthorized for a wrong password or an unknown user name | expected behaviour | AC-6, AC-13 | found elsewhere in the requirement: 401 Unauthorized for GenerateToken with a wrong password or an unknown user name; body as in AC-6. AC-8 (Authorized) is unchanged. AC-13's outcome stays as written (status "Failed"); the 401 from L75 also applies to that request since the deleted user name is unknown |
| G2 | JSON field that carries the error message (story gives `code` as a field name but says only "the message") | how to exercise | AC-2, AC-3, AC-4, AC-8 | discovered from the AUT (mechanics only): message |
| G3 | how "7 days after the moment the token was issued" is compared: the issue moment is not observable from the client, and the timestamp format/time zone and an acceptable tolerance are not stated | expected behaviour | AC-5 | assumed: the issue moment is taken as the time the GenerateToken request was sent/answered; `expires` (parsed as an ISO-8601 timestamp, UTC if no offset is given) must be 7 days after that moment, allowing only for clock difference between test client and server (a tolerance of a few minutes, not hours) |
| G4 | HTTP status (and body shape) of POST /Account/v1/Authorized with a wrong password; AC-8 states only the message "User not found!" | expected behaviour | AC-8 | assumed: no specific status is asserted; the check is that the response is not `true` and carries the message "User not found!" |
| G5 | how to drive the login and profile pages: user name / password field labels or locators, the login button, where the profile shows "User Name :", how "highlighted as invalid" and "below the form" are rendered | how to exercise | AC-9, AC-10, AC-11, AC-12 | discovered from the AUT (mechanics only): getByRole(textbox, UserName) · getByRole(textbox, Password) · getByRole(button, Login) · getByRole(button, Logout); profile text "User Name :" + name |
| G6 | request field names and body shape for POST /Account/v1/GenerateToken (story says only "user name and password") | how to exercise | AC-2, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-12, AC-13 | discovered from the AUT (mechanics only): { "userName", "password" } |
| G7 | what "without a user name / without a password" means on the wire: field omitted, null, or empty string | expected behaviour | AC-4 | assumed: "without" covers both the field being absent and the field being an empty string; each must give 400 / code "1200" / "UserName and Password required." |
| G8 | what counts as "in red" (AC-10) and "highlighted as invalid" (AC-11): the observable indicator is not specified | expected behaviour | AC-10, AC-11 | assumed: "in red": the message text's rendered colour is a red hue (red channel clearly dominant); "highlighted as invalid": each empty field is visibly marked invalid by the page (e.g. an invalid-state style or indicator on that field) after clicking "Login" |
| G9 | how the user's token is sent to DELETE /Account/v1/User/{UUID} (header name and scheme) | how to exercise | AC-13 | discovered from the AUT (mechanics only): Authorization: Bearer <token> |

**Open questions for the PO** (untested unless a scenario needing clarification below covers it):

- ❓ OQ-1 — what DELETE /Account/v1/User/{UUID} answers without a token or with another user's token is not stated; not tested

**Assumptions the evaluation made:**

- G3 — how "7 days after the moment the token was issued" is compared: the issue moment is not observable from the client, and the timestamp format/time zone and an acceptable tolerance are not stated: the issue moment is taken as the time the GenerateToken request was sent/answered; `expires` (parsed as an ISO-8601 timestamp, UTC if no offset is given) must be 7 days after that moment, allowing only for clock difference between test client and server (a tolerance of a few minutes, not hours)
- G4 — HTTP status (and body shape) of POST /Account/v1/Authorized with a wrong password; AC-8 states only the message "User not found!": no specific status is asserted; the check is that the response is not `true` and carries the message "User not found!"
- G7 — what "without a user name / without a password" means on the wire: field omitted, null, or empty string: "without" covers both the field being absent and the field being an empty string; each must give 400 / code "1200" / "UserName and Password required."
- G8 — what counts as "in red" (AC-10) and "highlighted as invalid" (AC-11): the observable indicator is not specified: "in red": the message text's rendered colour is a red hue (red channel clearly dominant); "highlighted as invalid": each empty field is visibly marked invalid by the page (e.g. an invalid-state style or indicator on that field) after clicking "Login"
- OQ-2 — negative-test passwords are literal invalid strings (they cannot create an account); the 8-character valid boundary password is derived at runtime from DQ_USER_PASSWORD, so no valid password is hard-coded
- one root cause, one failure — the full success body of a create is asserted only in SCN-001; the accepted boundary row (SCN-014.2) asserts only the 201 that AC-1 defines as "accepted"

Full review: [requirement-review.md](../../requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 24 | 3 | 0 |
| `02-harden` (hardening dry-run) | 72 | 9 | 0 |
| `03-eval` (final) | 24 | 3 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Requirement review: [requirement-review.md](../../requirement-review.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/03-eval/triage.md](../../runs/03-eval/triage.md) · JUnit: runs/03-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/DQ-1/runs/03-eval/html`
