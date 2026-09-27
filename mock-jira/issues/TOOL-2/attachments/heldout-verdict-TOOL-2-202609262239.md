# Held-out Evaluation Verdict — TOOL-2

> **Verdict: ❌ FAIL** — 1 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-6. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [TOOL-2](https://your-domain.atlassian.net/browse/TOOL-2) — Customer registration, sign-in and account protection |
| Application under test | Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) — UI https://practicesoftwaretesting.com · API https://api.practicesoftwaretesting.com |
| Final run | `02-eval` · 2026-09-26T22:39:07.318Z · 14s |
| Tests | 8 total · 7 passed · 1 failed · 0 flaky · 0 skipped (from 8 scenarios) |
| Held-out integrity | ✅ PRESERVED — 15 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (`inspect.ts` for the sign-in page — contract gap G3; `run.ts --label harden --capture`). |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-26T22:39:42.320Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-6 | security | The account locks after 3 failed attempts, not 5 | SCN-007 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (1 root cause(s), 1 failing test(s))

### APP-1 · SCN-007 · AC-6 — The account locks after 3 failed attempts, not 5

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | Scenario: The account locks after five failed attempts. Given a registered customer, When five sign-in attempts with a wrong password are made, Then attempts one to five respond 401, And the sixth attempt, even with the correct password, responds 423 with a message that the account is locked |
| Requirement source | story.md#L51 |
| Test type · layer | security · api |
| SCN-007: expected (requirement) → actual (AUT) | `[401, 401, 401, 401, 401]` → `[401, 401, 401, 423, 423]` |
| Failing step | Then attempts one to five each respond 401 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxz257j30`; recreate equivalent data before reproducing):

- customer dedicated to the lockout scenario (API; not deletable): `{"first_name":"Qa","last_name":"Heldmuiz257l7fq1","dob":"1990-01-01","phone":"0612345678","address":{"street":"Main 1","city":"Utrecht","state":"UT","country":"…` · cleanup: none

**Manually (scenario steps):**

1. Given a registered customer used only by this scenario
2. When five sign-in attempts with a wrong password are made
3. Then attempts one to five each respond 401
4. And the sixth attempt, with the correct password, responds 423 with a message that the account is locked

**API pre-steps: SCN-007** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /users/register → 201`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/register' \
     -H 'Content-Type: application/json' \
     --data '{"first_name":"Qa","last_name":"Heldmuiz257l7fq1","dob":"1990-01-01","phone":"0612345678","address":{"street":"Main 1","city":"Utrecht","state":"UT","country":"NL","postal_code":"1234AB"},"email":"qamuiz257l7fq1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

**Via the API: SCN-007** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 3 (⟵) is the one that contradicts the requirement:

1. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"qamuiz257l7fq1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

2. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"qamuiz257l7fq1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

3. `POST /users/login → 401` ⟵

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"qamuiz257l7fq1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

4. `POST /users/login → 423`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"qamuiz257l7fq1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

5. `POST /users/login → 423`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"qamuiz257l7fq1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

6. `POST /users/login → 423`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"qamuiz257l7fq1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

Observed response of request 3 (SCN-007):

```json
{"error":"Unauthorized"}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts TOOL-2 --label repro --grep "SCN-007:"
```

#### Evidence

- [Page/test context at failure](runs/02-eval/artifacts/TOOL-2-tests-tool-2-TOOL-2-a30bc--after-five-failed-attempts-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/TOOL-2/runs/02-eval/artifacts/TOOL-2-tests-tool-2-TOOL-2-a30bc--after-five-failed-attempts-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/TOOL-2/runs/02-eval/confirm/SCN-007.md

**Evaluator's analysis:** Reproduced live with a dedicated customer: attempts 1–3 → 401, attempts 4 and 5 already → 423 "Account locked, too many failed attempts". AC-6: attempts one to five respond 401 and the sixth responds 423. Customers are locked out two attempts early.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None in the evaluation runs (mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | Registration creates the customer without echoing the password | AC-1 | functional | ✅ passed | - |
| SCN-002 | A registered e-mail address cannot register twice | AC-2 | negative | ✅ passed | - |
| SCN-003 | Weak passwords are rejected with every broken rule listed | AC-3 | negative | ✅ passed | - |
| SCN-004 | Signing in on the web shop | AC-4 | functional | ✅ passed | - |
| SCN-005 | A wrong password is refused by the API | AC-5 | security | ✅ passed | - |
| SCN-006 | A wrong password is refused on the web shop | AC-5 | negative | ✅ passed | - |
| SCN-007 | The account locks after five failed attempts | AC-6 | security | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-008 | Signing out invalidates the token | AC-7 | security | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Scenario: Registration creates the customer without echoing the password. Given a new customer with a unique e-mail address, When their details are posted to POST /users/register, Then the API responds 201 with the customer's details and an id, And the response does not contain the password | SCN-001 | ✅ met |
| AC-2 | Scenario: A registered e-mail address cannot register twice. Given a customer already registered with an e-mail address, When the same e-mail address is registered again, Then the API responds 409 with the message "A customer with this email address already exists." | SCN-002 | ✅ met |
| AC-3 | Scenario: Weak passwords are rejected with every broken rule listed. Given a new customer whose password is "abc", When they register, Then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number | SCN-003 | ✅ met |
| AC-4 | Scenario: Signing in on the web shop. Given a registered customer on the web shop's sign-in page, When they sign in with their e-mail address and password, Then they land on the "My account" page, And the navigation shows their first and last name | SCN-004 | ✅ met |
| AC-5 | Scenario: A wrong password is refused. Given a registered customer, When they sign in with a wrong password, Then POST /users/login responds 401, And the web shop shows "Invalid email or password" | SCN-005, SCN-006 | ✅ met |
| AC-6 | Scenario: The account locks after five failed attempts. Given a registered customer, When five sign-in attempts with a wrong password are made, Then attempts one to five respond 401, And the sixth attempt, even with the correct password, responds 423 with a message that the account is locked | SCN-007 | ❌ not met |
| AC-7 | Scenario: Signing out invalidates the token. Given a signed-in customer with an access token, When they sign out with GET /users/logout, Then GET /users/me with the same token responds 401 | SCN-008 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L23 | SCN-001 Registration creates the customer without echoing the password | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L29 | SCN-002 A registered e-mail address cannot register twice | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L34 | SCN-003 Weak passwords are rejected with every broken rule listed | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L39 | SCN-004 Signing in on the web shop | functional | e2e | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L45 | SCN-005 A wrong password is refused by the API | security | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L45 | SCN-006 A wrong password is refused on the web shop | negative | ui | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L51 | SCN-007 The account locks after five failed attempts | security | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-7** | story.md#L57 | SCN-008 Signing out invalidates the token | security | api | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| functional | 2 | 2 | 2 | 0 | 0 | - |
| negative | 3 | 3 | 3 | 0 | 0 | - |
| security | 3 | 3 | 2 | 1 | 0 | APP-1 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | registration request fields (the story says only "their details") | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 | discovered from the AUT (mechanics only): first_name, last_name, dob, address{street, city, state, country, postal_code}, phone, email, password |
| G2 | API origin and web shop origin (the story gives paths only) | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 | project configuration: API https://api.practicesoftwaretesting.com; web shop https://practicesoftwaretesting.com |
| G3 | web shop sign-in page mechanics: route, form fields, submit button, error element, and where the account page title and the navigation name are shown | how to exercise | AC-4, AC-5 | discovered from the AUT (mechanics only): "Sign in" link → /auth/login; data-test email, password, login-submit; error element data-test login-error; account page title data-test page-title; navigation menu data-test nav-menu |
| G4 | exact wording / shape of the password errors for AC-3: the story says the errors "state all four rules" but gives no messages | expected behaviour | AC-3 | assumed: A rule counts as stated when the 422 response's password errors include a message that names it: the 8-character minimum, upper and lower case letters, a symbol, a number. Exact wording is not checked. |
| G5 | which "customer's details" the AC-1 response must contain | expected behaviour | AC-1 | assumed: The response contains an id and echoes the submitted details (at least first name, last name and e-mail address) with the values posted. |
| G6 | exact wording of the account-locked message for AC-6 (the story says only "a message that the account is locked") | expected behaviour | AC-6 | assumed: The 423 response carries a message that says the account is locked (contains the word "locked", case-insensitive); exact wording is not checked. |
| G7 | sign-in request fields for POST /users/login (the story says "e-mail address and password") | how to exercise | AC-5, AC-6, AC-7 | discovered from the AUT (mechanics only): email, password |
| G8 | how test customers are created and cleaned up | how to exercise | AC-1, AC-2, AC-4, AC-5, AC-6, AC-7 | discovered from the AUT (mechanics only): create via POST /users/register with unique example.com e-mail addresses; no self-delete, no cleanup |

**Assumptions the evaluation made:**

- G4 — exact wording / shape of the password errors for AC-3: the story says the errors "state all four rules" but gives no messages: A rule counts as stated when the 422 response's password errors include a message that names it: the 8-character minimum, upper and lower case letters, a symbol, a number. Exact wording is not checked.
- G5 — which "customer's details" the AC-1 response must contain: The response contains an id and echoes the submitted details (at least first name, last name and e-mail address) with the values posted.
- G6 — exact wording of the account-locked message for AC-6 (the story says only "a message that the account is locked"): The 423 response carries a message that says the account is locked (contains the word "locked", case-insensitive); exact wording is not checked.
- Each scenario registers its own customer through POST /users/register (contract G8); the lockout scenario's customer is dedicated to it because it gets locked.

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 7 | 1 | 0 |
| `02-eval` (final) | 7 | 1 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/02-eval/triage.md](runs/02-eval/triage.md) · JUnit: runs/02-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/TOOL-2/runs/02-eval/html`
