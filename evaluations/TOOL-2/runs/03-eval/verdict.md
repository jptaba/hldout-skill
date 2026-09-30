# Held-out Evaluation Verdict — TOOL-2

> **Verdict: ❌ FAIL** — 1 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-6. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [TOOL-2](https://your-domain.atlassian.net/browse/TOOL-2) — Customer registration, sign-in and account protection |
| Application under test | Practice Software Testing (profile `practicesoftwaretesting`) — UI https://practicesoftwaretesting.com/ · API https://api.practicesoftwaretesting.com/ |
| Final run | `03-eval` · 2026-09-29T22:31:38.206Z · 12s |
| Tests | 10 total · 8 passed · 2 failed · 0 flaky · 0 skipped (from 10 scenarios) |
| Held-out integrity | ✅ PRESERVED — 25 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 only (bundled heldout inspect for the sign-in and "My account" pages, heldout api-probe --chain for every API mechanic, plus a read of the published API… (see hardening log) |
| App knowledge | tests written blind; consulted after the freeze: 107 entries (18 proven, 89 seen, 0 stale) · 11 recorded for later stories |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-09-29T22:32:31.408Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-6 | security, boundary | The account locks after three failed sign-ins, not five | SCN-007, SCN-008 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (1 root cause(s), 2 failing test(s))

### APP-1 · SCN-007, SCN-008 · AC-6 — The account locks after three failed sign-ins, not five

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | The account locks after five failed attempts: given a registered customer, when five sign-in attempts with a wrong password are made, then attempts one to five respond 401, and the sixth attempt, even with the correct password, responds 423 with a message that the account is locked |
| Requirement source | story.md#L51; story.md#L51 — one step inside the stated limit of five |
| Test type · layer | security, boundary · api |
| SCN-007: expected (requirement) → actual (AUT) | `[401, 401, 401, 401, 401]` → `[401, 401, 401, 423, 423]` |
| SCN-008: expected (requirement) → actual (AUT) | `not 423` → `423` |
| SCN-008: also failed | [REQ AC-6] POST /users/login after four failures returns an access_token — `"string"` → `"undefined"` |
| Failing step | Then attempts one to five respond 401 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldout9409n40`; recreate equivalent data before reproducing):

- a registered customer (POST /users/register): `{"email":"hldout-n9409oxb-1@example.com","password":"***redacted***","firstName":"Hldout","lastName":"Tester"}` · cleanup: none

**Manually (scenario steps):**

1. Given a registered customer
2. When five sign-in attempts with a wrong password are made with POST /users/login
3. Then attempts one to five respond 401
4. And the sixth attempt, with the correct password, responds 423
5. And the 423 answer says that the account is locked

**API pre-steps: SCN-007** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /users/register → 201`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/register' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"first_name":"Hldout","last_name":"Tester","email":"hldout-n9409oxb-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

**Via the API: SCN-007** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 3 (⟵) is the one that contradicts the requirement:

1. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409oxb-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

2. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409oxb-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

3. `POST /users/login → 401` ⟵

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409oxb-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

4. `POST /users/login → 423`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409oxb-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

5. `POST /users/login → 423`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409oxb-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

6. `POST /users/login → 423`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409oxb-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

Observed response of request 3 (SCN-007):

```json
{"error":"Unauthorized"}
```

**API pre-steps: SCN-008** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /users/register → 201`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/register' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"first_name":"Hldout","last_name":"Tester","email":"hldout-n9409qlz-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

**Via the API: SCN-008** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 5 (⟵) is the one that contradicts the requirement:

1. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409qlz-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

2. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409qlz-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

3. `POST /users/login → 401`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409qlz-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

4. `POST /users/login → 423`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409qlz-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

5. `POST /users/login → 423` ⟵

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-n9409qlz-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

Observed response of request 5 (SCN-008):

```json
{"error":"Account locked, too many failed attempts. Please contact the administrator."}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run TOOL-2 --label repro --grep "SCN-007:"
npm run heldout -- run TOOL-2 --label repro --grep "SCN-008:"
```

#### Evidence

- [Page/test context at failure](../../runs/03-eval/artifacts/TOOL-2-tests-tool-2-TOOL-2-d97ae-gainst-the-correct-password-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/TOOL-2/runs/03-eval/artifacts/TOOL-2-tests-tool-2-TOOL-2-d97ae-gainst-the-correct-password-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live on 2026-09-29 (tier 3, api-probe --chain): runs/03-eval/confirm/api-lockout.md — POST /users/login statuses 401,401,401,423,423 then 423 with the correct password; control customer 401.

**Evaluator's analysis:** AC-6 states attempts one to five with a wrong password respond 401 and the sixth responds 423. On a freshly registered customer, attempts 1-3 respond 401 and attempt 4 already responds 423 ('Account locked, too many failed attempts...'), so attempts 4 and 5 are 423 instead of 401. The sixth attempt (correct password) does respond 423 with a message about the lock, as required. A control customer registered right after gets 401 on its first wrong attempt, so this is a per-account lock, not a client rate limit. Same result in 01-harden, 02-harden (3/3 repeats) and 03-eval.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A new customer registers and gets their details and an id back | AC-1 | functional | ✅ passed | - |
| SCN-002 | The registration answer does not contain the password | AC-1 | security | ✅ passed | - |
| SCN-003 | Registering an already registered e-mail address again is refused | AC-2 | negative | ✅ passed | - |
| SCN-004 | A weak password lists every broken password rule | AC-3 | negative | ✅ passed | - |
| SCN-005 | A registered customer signs in on the web shop | AC-4 | functional | ✅ passed | - |
| SCN-006 | Signing in on the web shop with a wrong password is refused | AC-5 | negative | ✅ passed | - |
| SCN-007 | Five wrong passwords lock the account, even against the correct password | AC-6 | security | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-008 | Four wrong passwords do not lock the account | AC-6 | boundary | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-009 | A token no longer works after signing out | AC-7 | security | ✅ passed | - |
| SCN-010 | A customer registers, signs in, sees their own account, signs out and loses access | AC-1, AC-7 | composition | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Registration creates the customer without echoing the password: given a new customer with a unique e-mail address, when their details are posted to POST /users/register, then the API responds 201 with the customer's details and an id, and the response does not contain the password | SCN-001, SCN-002, SCN-010 | ✅ met |
| AC-2 | A registered e-mail address cannot register twice: given a customer already registered with an e-mail address, when the same e-mail address is registered again, then the API responds 409 with the message "A customer with this email address already exists." | SCN-003 | ✅ met |
| AC-3 | Weak passwords are rejected with every broken rule listed: given a new customer whose password is "abc", when they register, then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number | SCN-004 | ✅ met |
| AC-4 | Signing in on the web shop: given a registered customer on the web shop's sign-in page, when they sign in with their e-mail address and password, then they land on the "My account" page, and the navigation shows their first and last name | SCN-005 | ✅ met |
| AC-5 | A wrong password is refused: given a registered customer, when they sign in with a wrong password, then POST /users/login responds 401, and the web shop shows "Invalid email or password" | SCN-006 | ✅ met |
| AC-6 | The account locks after five failed attempts: given a registered customer, when five sign-in attempts with a wrong password are made, then attempts one to five respond 401, and the sixth attempt, even with the correct password, responds 423 with a message that the account is locked | SCN-007, SCN-008 | ❌ not met |
| AC-7 | Signing out invalidates the token: given a signed-in customer with an access token, when they sign out with GET /users/logout, then GET /users/me with the same token responds 401 | SCN-009, SCN-010 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L23 (Scenario: Registration creates the customer without echoing the password) | SCN-001 A new customer registers and gets their details and an id back | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L23 (Scenario: Registration creates the customer without echoing the password) | SCN-002 The registration answer does not contain the password | security | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L23, story.md#L57 — the customer registered in AC-1 is the one who signs in and out | SCN-010 A customer registers, signs in, sees their own account, signs out and loses access | composition | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L29 | SCN-003 Registering an already registered e-mail address again is refused | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L34 | SCN-004 A weak password lists every broken password rule | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L39 | SCN-005 A registered customer signs in on the web shop | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L45 | SCN-006 Signing in on the web shop with a wrong password is refused | negative | e2e | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L51 | SCN-007 Five wrong passwords lock the account, even against the correct password | security | api | 0/1 | ❌ fails requirement | APP-1 |
| ↳ | story.md#L51 — one step inside the stated limit of five | SCN-008 Four wrong passwords do not lock the account | boundary | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-7** | story.md#L57 | SCN-009 A token no longer works after signing out | security | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L23, story.md#L57 — the customer registered in AC-1 is the one who signs in and out | SCN-010 A customer registers, signs in, sees their own account, signs out and loses access | composition | api | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 1 | 1 | 0 | 1 | 0 | APP-1 |
| composition | 1 | 1 | 1 | 0 | 0 | - |
| functional | 2 | 2 | 2 | 0 | 0 | - |
| negative | 3 | 3 | 3 | 0 | 0 | - |
| security | 3 | 3 | 2 | 1 | 0 | APP-1 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | web shop sign-in page: its route (the story says only "Sign in" in the navigation) and how the e-mail, password and submit elements and the error message are found | how to exercise | AC-4, AC-5 | discovered from the AUT (mechanics only): The 'Sign in' navigation link goes to /auth/login (ready: heading 'Login'); e-mail getByTestId('email'), password getByTestId('password'), submit getByTestId('login-submit'); the page calls POST /users/login on the API host |
| G2 | "My account" page: how the page is recognised (route or heading) and where the navigation shows the customer's first and last name | how to exercise | AC-4 | discovered from the AUT (mechanics only): After sign-in the address is /account and the page shows heading 'My account' (level 1); the navigation landmark (getByRole('navigation')) holds a menu item with the customer's name |
| G3 | where the password errors are in the 422 answer of POST /users/register (field or key that holds them) | how to exercise | AC-3 | discovered from the AUT (mechanics only): The 422 answer holds the password errors as a list of strings under the top-level key 'password' |
| G4 | whether and when a locked account unlocks (lock duration or unlock procedure); the story does not say, so a locked test account may stay locked | expected behaviour | AC-6 | ❓ open |

**For the owner's information** (questions the criteria can be judged without, as the review confirmed; they don't affect the verdict):

- ℹ️ G4 — whether and when a locked account unlocks (lock duration or unlock procedure); the story does not say, so a locked test account may stay locked. Not tested; every lock scenario uses a customer of its own.

**Assumptions the evaluation made:**

- every precondition customer is registered by the test itself through POST /users/register (the story names no other way), with a unique e-mail address; the application offers customers no stated way to delete themselves, so these customers are kept (tagged hldout-…).
- "the customer's details" (AC-1) are the details that were posted, other than the password: the answer must carry the posted e-mail address, first name and last name. Which other fields registration needs is mechanics (found while hardening); their values are not asserted.
- the password rules of AC-3 are stated as meanings, not as texts: each rule counts as stated when the password errors mention it (8 characters / upper and lower case / symbol / number), whatever the exact wording.
- AC-6's "a message that the account is locked" is judged as a meaning: the 423 answer mentions that the account is locked.
- one root cause, one failure (rule 5): the 201 status of registration is asserted in SCN-001 only; SCN-002 asserts only that the password is absent.

Full review: [requirement-review.md](../../requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above). App knowledge from earlier stories (how to reach pages and call endpoints, never what the application answers) is available only after the freeze.
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 8 | 2 | 0 |
| `02-harden` (hardening dry-run) | 24 | 6 | 0 |
| `03-eval` (final) | 8 | 2 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Requirement review: [requirement-review.md](../../requirement-review.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/03-eval/triage.md](../../runs/03-eval/triage.md) · JUnit: runs/03-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/TOOL-2/runs/03-eval/html`
