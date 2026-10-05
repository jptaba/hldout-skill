# Held-out Evaluation Verdict — TOOL-2

> **Verdict: ❌ FAIL** — 1 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-6. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [TOOL-2](https://jira.example.com/browse/TOOL-2) — Customer registration, sign-in and account protection |
| Application under test | Practice Software Testing (profile `practicesoftwaretesting`) — UI https://practicesoftwaretesting.com/ · API https://api.practicesoftwaretesting.com |
| Final run | `03-eval` · 2026-10-05T01:48:43.194Z · 12s |
| Tests | 17 total · 16 passed · 1 failed · 0 flaky · 0 skipped (from 13 scenarios) |
| Held-out integrity | ✅ PRESERVED WITH 1 AUDITED AMENDMENT(S) — 25 requirement assertions; see "Assertion amendments" |
| Hardening | tier 2 (Playwright MCP, loaded natively) to walk the sign-in page and the wrong-password message, and tier 3 (heldout inspect probes, heldout api-probe… (see hardening log) |
| Actions | 4 action(s) from actions/practicesoftwaretesting/ (0 proven by earlier stories, 4 new to the map) · 5 action file(s) changed after the freeze: api/users/_shared.ts, api/users/register-customer.ts, api/users/sign-in-customer.ts, ui/account/_shared.ts, ui/account/open-sign-in-page.ts |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-10-05T01:51:05.173Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-6 | security | Account locks after three failed sign-ins instead of five | SCN-006 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (1 root cause(s), 1 failing test(s))

### APP-1 · SCN-006 · AC-6 — Account locks after three failed sign-ins instead of five

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | The account locks after five failed attempts: given a registered customer, when five sign-in attempts with a wrong password are made, then attempts one to five respond 401, and the sixth attempt, even with the correct password, responds 423 with a message that the account is locked. |
| Requirement source | story.md#L51 |
| Test type · layer | security · api |
| SCN-006: expected (requirement) → actual (AUT) | `401` → `423` |
| SCN-006: also failed | [REQ AC-6] POST /users/login wrong-password attempt 5 responds 401 — `401` → `423` |
| Failing step | Then attempts one to five respond 401 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldoutlcprl40`; recreate equivalent data before reproducing):

- registered customer hldout-ulcprnun-1@example.com: `{"first_name":"Hldout","last_name":"Testerzfiazm","email":"hldout-ulcprnun-1@example.com","password":"***redacted***","dob":"1990-01-01","phone":"0612345678","a…` · cleanup: none

**Manually (the test's steps):**

1. Given a registered customer
2. When five sign-in attempts with a wrong password are made
3. Then attempts one to five respond 401
4. And the sixth attempt, even with the correct password, responds 423 with a message that the account is locked

**API pre-steps: SCN-006** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /users/register → 201`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/register' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"first_name":"Hldout","last_name":"Testerzfiazm","email":"hldout-ulcprnun-1@example.com","password":"<secret 3ce5 from test-data.json / .env>","dob":"1990-01-01","phone":"0612345678","address":{"street":"Test Street 1","city":"Utrecht","state":"Utrecht","country":"NL","postal_code":"3511AA"}}'
   ```

**Via the API: SCN-006** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 6 (⟵) is the one that contradicts the requirement:

1. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-ulcprnun-1@example.com","password":"<secret accc from test-data.json / .env>"}'
   ```

2. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-ulcprnun-1@example.com","password":"<secret 6098 from test-data.json / .env>"}'
   ```

3. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-ulcprnun-1@example.com","password":"<secret beff from test-data.json / .env>"}'
   ```

4. `POST /users/login → 423`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-ulcprnun-1@example.com","password":"<secret 709a from test-data.json / .env>"}'
   ```

5. `POST /users/login → 423`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-ulcprnun-1@example.com","password":"<secret 29cd from test-data.json / .env>"}'
   ```

6. `POST /users/login → 423` ⟵

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-ulcprnun-1@example.com","password":"<secret 3ce5 from test-data.json / .env>"}'
   ```

Observed response of request 6 (SCN-006):

```json
{"error":"Account locked, too many failed attempts. Please contact the administrator."}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run TOOL-2 --label repro --grep "SCN-006:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/practicesoftwaretesting-TO-0acda-e-correct-password-gets-423-chromium-once/error-context.md)
- Step-by-step trace: `npx playwright show-trace output/practicesoftwaretesting/TOOL-2/runs/03-eval/artifacts/practicesoftwaretesting-TO-0acda-e-correct-password-gets-423-chromium-once/trace.zip`
- Live re-check by the evaluator: Replayed live on 2026-10-05 (tier 3, api-probe chain, fresh customer hldout-triage-ulerxpesw@example.com): register 201; wrong-password attempts 1-3 -> 401 {error: Unauthorized}; attempts 4-5 -> 423 {error: Account locked, too many failed attempts...}; sixth with correct password -> 423. runs/03-eval/confirm/scn-006-chain.json, runs/03-eval/confirm/scn-006-repro.md. Run 03-eval exchanges #1-#6 show the same pattern.

**Evaluator's analysis:** AC-6 requires wrong-password attempts one to five to respond 401 and the sixth (correct password) to respond 423. The test registered a fresh customer (no prior attempts) and called the declared endpoint POST /users/login with the declared body; attempts 1-3 answered 401, attempts 4 and 5 already answered 423 'Account locked, too many failed attempts. Please contact the administrator.'. The request mechanics are correct (same endpoint and body shape answer 401 for attempts 1-3 and the 423 message and status at the end match AC-6), so the app locks after three failures, not five. The lock threshold is server-side; the public demo exposes no settings page that governs it, so this is not a changed sandbox setting.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Assertion amendments (audited)

Fixes to how a requirement assertion was *implemented*. What it requires is unchanged. Each was approved with a reason before the official run.

| Assertion | Draft | Amended | Reason |
| --- | --- | --- | --- |
| tool-2.spec.ts: [REQ AC-1] POST /users/register answers the customer's details | `.toMatchObject({ first_name: customer.first_name, last_name: customer.last_name, email: customer.email, // TODO(harden) field names of the answer })` | `.toMatchObject({ first_name: customer.first_name, last_name: customer.last_name, email: customer.email, })` | Only a TODO(harden) comment inside the assertion was removed (field names confirmed in tier3/account-chain.md); the code and expected values are unchanged |

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A new customer registers and the API answers 201 with their details and an id | AC-1 | functional | ✅ passed | - |
| SCN-002 | Registering an already registered e-mail address again is refused with 409 | AC-2 | negative | ✅ passed | - |
| SCN-003 | Registering with the password "abc" is refused with 422 and all four password rules | AC-3 | negative | ✅ passed | - |
| SCN-004 | A registered customer signs in on the web shop and lands on "My account" with their name shown | AC-4 | functional | ✅ passed | - |
| SCN-005 | Signing in with a wrong password is refused by POST /users/login with 401 | AC-5 | security | ✅ passed | - |
| SCN-006 | After five failed sign-ins the account is locked: the sixth, with the correct password, gets 423 | AC-6 | security | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-007 | After GET /users/logout the same token gets 401 from GET /users/me | AC-7 | security | ✅ passed | - |
| SCN-008 | The registration answer does not contain the password | AC-1 | security | ✅ passed | - |
| SCN-009 | Simultaneous registrations of one e-mail address: exactly one is accepted, the others get 409 | AC-2 | concurrency | ✅ passed | - |
| SCN-010.1 | A password of 7 characters meeting every other rule is rejected | AC-3 | boundary | ✅ passed | - |
| SCN-010.2 | A password of 8 characters meeting every other rule is accepted | AC-3 | boundary | ✅ passed | - |
| SCN-011.1 | A password with no upper case letter is refused with 422 and the rule "upper and lower case letters" | AC-3 | negative | ✅ passed | - |
| SCN-011.2 | A password with no lower case letter is refused with 422 and the rule "upper and lower case letters" | AC-3 | negative | ✅ passed | - |
| SCN-011.3 | A password with no symbol is refused with 422 and the rule "a symbol" | AC-3 | negative | ✅ passed | - |
| SCN-011.4 | A password with no number is refused with 422 and the rule "a number" | AC-3 | negative | ✅ passed | - |
| SCN-012 | Signing in on the web shop with a wrong password shows "Invalid email or password" | AC-5 | negative | ✅ passed | - |
| SCN-013 | Signing out with GET /users/logout answers a 2xx success | AC-7 | functional | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Registration creates the customer without echoing the password: given a new customer with a unique e-mail address, when their details are posted to POST /users/register, then the API responds 201 with the customer's details and an id, and the response does not contain the password. | SCN-001, SCN-008 | ✅ met |
| AC-2 | A registered e-mail address cannot register twice: given a customer already registered with an e-mail address, when the same e-mail address is registered again, then the API responds 409 with the message "A customer with this email address already exists." | SCN-002, SCN-009 | ✅ met |
| AC-3 | Weak passwords are rejected with every broken rule listed: given a new customer whose password is "abc", when they register, then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number. | SCN-003, SCN-010, SCN-011 (7 tests) | ✅ met |
| AC-4 | Signing in on the web shop: given a registered customer on the web shop's sign-in page, when they sign in with their e-mail address and password, then they land on the "My account" page and the navigation shows their first and last name. | SCN-004 | ✅ met |
| AC-5 | A wrong password is refused: given a registered customer, when they sign in with a wrong password, then POST /users/login responds 401 and the web shop shows "Invalid email or password". | SCN-005, SCN-012 | ✅ met |
| AC-6 | The account locks after five failed attempts: given a registered customer, when five sign-in attempts with a wrong password are made, then attempts one to five respond 401, and the sixth attempt, even with the correct password, responds 423 with a message that the account is locked. | SCN-006 | ❌ not met |
| AC-7 | Signing out invalidates the token: given a signed-in customer with an access token, when they sign out with GET /users/logout, then GET /users/me with the same token responds 401. | SCN-007, SCN-013 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L23 | SCN-001 A new customer registers and the API answers 201 with their details and an id | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L27 | SCN-008 The registration answer does not contain the password | security | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L29 | SCN-002 Registering an already registered e-mail address again is refused with 409 | negative | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L29-L32 (R2: an e-mail address can be registered only once) | SCN-009 Simultaneous registrations of one e-mail address: exactly one is accepted, the others get 409 | concurrency | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L34 | SCN-003 Registering with the password "abc" is refused with 422 and all four password rules | negative | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L37 (R1: at least 8 characters) | SCN-010 A password of ${row.length} characters meeting every other rule is | boundary | api | 2/2 | ✅ meets requirement | - |
| ↳ | story.md#L34-L37 (every broken rule listed) | SCN-011 A password with ${row.note} is refused with 422 and the rule "${rule.text}" | negative | api | 4/4 | ✅ meets requirement | - |
| **AC-4** | story.md#L39 | SCN-004 A registered customer signs in on the web shop and lands on "My account" with their name shown | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L45 | SCN-005 Signing in with a wrong password is refused by POST /users/login with 401 | security | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L45-L49 | SCN-012 Signing in on the web shop with a wrong password shows "Invalid email or password" | negative | ui | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L51 | SCN-006 After five failed sign-ins the account is locked: the sixth, with the correct password, gets 423 | security | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-7** | story.md#L57 | SCN-007 After GET /users/logout the same token gets 401 from GET /users/me | security | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L59, G4 (provided by the user) | SCN-013 Signing out with GET /users/logout answers a 2xx success | functional | api | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| concurrency | 1 | 1 | 1 | 0 | 0 | - |
| security | 4 | 4 | 3 | 1 | 0 | APP-1 |
| boundary | 1 | 2 | 2 | 0 | 0 | - |
| negative | 4 | 7 | 7 | 0 | 0 | - |
| functional | 3 | 3 | 3 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | web shop sign-in page: its route (reached through "Sign in" in the navigation), how the e-mail, password and submit elements are found, and where the "Invalid email or password" message appears | how to exercise | AC-4, AC-5 | discovered from the AUT (mechanics only): Route /auth/login (the navigation's "Sign in" link, href /auth/login). Fields by test id: getByTestId('email'), getByTestId('password'), submit getByTestId('login-submit') (label 'Password *' so getByLabel('Password', {exact:true}) matches nothing). A wrong password shows 'Invalid email or password' in getByTestId('login-error') under the form; the page stays on /auth/login |
| G2 | "My account" page and navigation: how the page is recognised, where the navigation shows the customer's name, and where the signed-in customer's first and last name come from (the seeded account's details) | how to exercise | AC-4 | discovered from the AUT (mechanics only): After sign-in the app goes to /account; the page is recognised by heading 'My account' (h1, test id page-title, getByRole('heading', { name: 'My account' }) unique). The single navigation landmark (getByRole('navigation')) shows the signed-in customer's 'first_name last_name' as the nav-menu button; the name is the one the customer registered with (POST /users/register first_name/last_name, echoed by GET /users/me) |
| G3 | where the error responses carry their messages: the 409 message (AC-2), the 422 password errors (AC-3) and the 423 lock message (AC-6) | how to exercise | AC-2, AC-3, AC-6 | discovered from the AUT (mechanics only): JSON bodies: 409 {"email": ["<message>"]}; 422 {"password": ["<one message per broken rule>"]} (other fields' errors under their own field names); 423 {"error": "<message>"}; 401 from /users/login {"error": "Unauthorized"} |
| G4 | what GET /users/logout itself must respond (status, body) when the customer signs out | expected behaviour | AC-7 | answered by the user: GET /users/logout must return any 2xx success; its body is not checked |

**Assumptions the evaluation made:**

- a password error "states" a rule of R1 when it names the rule's key words (8 and characters; upper and lower case; symbol; number): the story gives the rules, not the application's wording.
- rule 4 — the exact success status of a registration (201) is asserted once, in SCN-001; the other registrations only check that they were accepted.

## How this verdict was produced

1. The requirement (the story's title, description and acceptance criteria, the images they show and the Confluence pages they link) was fetched from Jira and turned into a requirement contract ([requirement-contract.md](requirement-contract.md)): every criterion quoted from its source, the endpoints, error cases and gaps, checked by an independent reviewer.
2. Playwright TypeScript tests (UI and API) were written from the contract **only**, with no access to the AUT source or developer tests. Each test is tagged with the criteria it proves, its test type and the requirement source it comes from; expected values were copied verbatim from the requirement. Their steps call the shared actions of the application (how to reach pages and call endpoints, never what the application answers).
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only, in the tests and in the actions they call. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 16 | 1 | 0 |
| `02-harden` (hardening dry-run) | 48 | 1 | 0 |
| `03-eval` (final) | 16 | 1 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md) · contract: [requirement-contract.md](requirement-contract.md)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Actions: actions/practicesoftwaretesting/
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/03-eval/triage.md](runs/03-eval/triage.md) · JUnit: runs/03-eval/junit.xml
- HTML report: `npx playwright show-report output/practicesoftwaretesting/TOOL-2/runs/03-eval/html`
