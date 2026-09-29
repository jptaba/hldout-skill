# Held-out Evaluation Verdict — CL-4

> **Verdict: ❌ FAIL** — 1 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-7. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [CL-4](https://your-domain.atlassian.net/browse/CL-4) — Account security for contacts |
| Application under test | Contact List App (profile `thinking-tester-contact-list`) — UI https://thinking-tester-contact-list.herokuapp.com/ |
| Final run | `02-eval` · 2026-09-29T11:16:35.441Z · 8s |
| Tests | 17 total · 16 passed · 1 failed · 0 flaky · 0 skipped (from 8 scenarios) |
| Held-out integrity | ✅ PRESERVED — 22 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (heldout api-probe --chain, heldout accounts --from-chain / --sign-in-steps with a live check, dry run 01-harden with --repeat-each 2). |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-09-29T11:17:14.613Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | TBD | AC-7 | security | PATCH moves a contact to another user (the owner can be changed) | SCN-007.2 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (1 root cause(s), 1 failing test(s))

### APP-1 · SCN-007.2 · AC-7 — PATCH moves a contact to another user (the owner can be changed)

| | |
| --- | --- |
| Suggested severity | TBD |
| Requirement AC-7 | Scenario Outline: The owner of an existing contact cannot be changed. When user "A" calls <method> /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B", then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A", GET /contacts/{id of Secret Sam} for user "A" still answers 200, and GET /contacts for user "B" does not contain "Secret Sam". Examples: PUT with first name, last name and owner; PATCH with owner only. |
| Requirement source | story.md AC-7 |
| Test type · layer | security · api |
| SCN-007.2: expected (requirement) → actual (AUT) | `/^(rejected with 400\|answered 200 with owner still A)$/` → `"answered 200 with owner set to user B"` |
| Failing step | Then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A" |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldoutkzv7v40`; recreate equivalent data before reproducing):

- user A: `{"id":"6abb9e1a2f701c0015676bce","username":"hldout-mkzv7x4y-1@example.com"}` · cleanup: done
- user B: `{"id":"6abb9e1a2f701c0015676bd0","username":"hldout-mkzvh5ez-2@example.com"}` · cleanup: done
- contact "Secret Sam" of hldout-mkzv7x4y-1@example.com: `{"_id":"6abb9e1a2f701c0015676bd2","firstName":"Secret","lastName":"Sam","owner":"6abb9e1a2f701c0015676bce","__v":0}` · cleanup: done (already gone (HTTP 404))
- contact moved to user B (created by the scenario): `{"_id":"6abb9e1a2f701c0015676bd2","firstName":"Secret","lastName":"Sam","owner":"6abb9e1a2f701c0015676bce","__v":0}` · cleanup: done

**Manually (scenario steps):**

1. Given user "A" has a contact "Secret Sam" and user "B" has signed up
2. When user "A" calls <method> /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B" (<body>)
3. Then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A"
4. And GET /contacts/{id of Secret Sam} for user "A" still answers 200
5. And GET /contacts for user "B" does not contain "Secret Sam"

**API pre-steps: SCN-007.2** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /users → 201`

   ```bash
   curl -i -X POST 'https://thinking-tester-contact-list.herokuapp.com/users' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"firstName":"QA","lastName":"Heldout","email":"hldout-mkzv7x4y-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

P2. `POST /users → 201`

   ```bash
   curl -i -X POST 'https://thinking-tester-contact-list.herokuapp.com/users' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"firstName":"QA","lastName":"Heldout","email":"hldout-mkzvh5ez-2@example.com","password":"<secret from test-data.json / .env>"}'
   ```

P3. `POST /contacts → 201`

   ```bash
   curl -i -X POST 'https://thinking-tester-contact-list.herokuapp.com/contacts' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"firstName":"Secret","lastName":"Sam"}'
   ```

**Via the API: SCN-007.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `PATCH /contacts/6abb9e1a2f701c0015676bd2 → 200` ⟵

   ```bash
   curl -i -X PATCH 'https://thinking-tester-contact-list.herokuapp.com/contacts/6abb9e1a2f701c0015676bd2' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"owner":"6abb9e1a2f701c0015676bd0"}'
   ```

Observed response of request 1 (SCN-007.2):

```json
{"_id":"6abb9e1a2f701c0015676bd2","firstName":"Secret","lastName":"Sam","owner":"6abb9e1a2f701c0015676bd0","__v":0}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run CL-4 --label repro --grep "SCN-007\.2:"
```

#### Evidence

- [Page/test context at failure](../../runs/02-eval/artifacts/CL-4-tests-cl-4-CL-4-Accou-41bda-ct-cannot-be-changed-PATCH--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/CL-4/runs/02-eval/artifacts/CL-4-tests-cl-4-CL-4-Accou-41bda-ct-cannot-be-changed-PATCH--chromium-retry1/trace.zip`
- Live re-check by the evaluator: runs/02-eval/confirm/owner-change.md

**Evaluator's analysis:** AC-7: setting owner to user B's _id must be rejected with 400 or leave owner A. Live: user A's PATCH /contacts/{id} {owner: B's _id} answers 200 with owner = B; A then gets 404 for the contact and it is in B's list. The PUT example keeps owner A (passes).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001.1 | Contacts endpoints require a session token (GET /contacts) | AC-1 | security | ✅ passed | - |
| SCN-001.2 | Contacts endpoints require a session token (POST /contacts) | AC-1 | security | ✅ passed | - |
| SCN-001.3 | Contacts endpoints require a session token (GET /contacts/{id of Secret Sam}) | AC-1 | security | ✅ passed | - |
| SCN-001.4 | Contacts endpoints require a session token (PUT /contacts/{id of Secret Sam}) | AC-1 | security | ✅ passed | - |
| SCN-001.5 | Contacts endpoints require a session token (PATCH /contacts/{id of Secret Sam}) | AC-1 | security | ✅ passed | - |
| SCN-001.6 | Contacts endpoints require a session token (DELETE /contacts/{id of Secret Sam}) | AC-1 | security | ✅ passed | - |
| SCN-002.1 | A token that was not issued by the application is refused (a made-up token) | AC-2 | security | ✅ passed | - |
| SCN-002.2 | A token that was not issued by the application is refused (user A's token with its signature altered) | AC-2 | security | ✅ passed | - |
| SCN-003 | Signing out ends the session | AC-3 | security | ✅ passed | - |
| SCN-004 | A user cannot read another user's contact | AC-4 | security | ✅ passed | - |
| SCN-005.1 | A user cannot change or delete another user's contact (PUT) | AC-5 | security | ✅ passed | - |
| SCN-005.2 | A user cannot change or delete another user's contact (PATCH) | AC-5 | security | ✅ passed | - |
| SCN-005.3 | A user cannot change or delete another user's contact (DELETE) | AC-5 | security | ✅ passed | - |
| SCN-006 | A new contact always belongs to its creator | AC-6 | security | ✅ passed | - |
| SCN-007.1 | The owner of an existing contact cannot be changed (PUT) | AC-7 | security | ✅ passed | - |
| SCN-007.2 | The owner of an existing contact cannot be changed (PATCH) | AC-7 | security | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-008 | The contact list page only shows the signed-in user's contacts | AC-8 | security | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Scenario Outline: Contacts endpoints require a session token. When a client calls <method> <path> without an Authorization header, then the response status is 401, the response body is {"error": "Please authenticate."} and no contact is created, changed or deleted. Examples: GET /contacts, POST /contacts, GET, PUT, PATCH and DELETE /contacts/{id of Secret Sam}. | SCN-001.1, SCN-001.2, SCN-001.3, SCN-001.4, SCN-001.5, SCN-001.6 | ✅ met |
| AC-2 | Scenario: A token that was not issued by the application is refused. When a client calls GET /contacts with "Authorization: Bearer" followed by a made-up or altered token, then the response status is 401 and the response body is {"error": "Please authenticate."} | SCN-002.1, SCN-002.2 | ✅ met |
| AC-3 | Scenario: Signing out ends the session. Given user "A" holds a token that returns A's contacts on GET /contacts, when user "A" calls POST /users/logout with that token, then the response status is 200, GET /contacts with the same token answers 401 and GET /users/me with the same token answers 401. | SCN-003 | ✅ met |
| AC-4 | Scenario: A user cannot read another user's contact. When user "B" calls GET /contacts/{id of Secret Sam}, then the response status is 404 and GET /contacts for user "B" does not contain "Secret Sam". | SCN-004 | ✅ met |
| AC-5 | Scenario Outline: A user cannot change or delete another user's contact. When user "B" calls <method> /contacts/{id of Secret Sam} with a valid body, then the response status is 404 and GET /contacts/{id of Secret Sam} for user "A" still returns "Secret Sam" unchanged. Examples: PUT, PATCH, DELETE. | SCN-005.1, SCN-005.2, SCN-005.3 | ✅ met |
| AC-6 | Scenario: A new contact always belongs to its creator. When user "A" calls POST /contacts with a valid body that also contains "owner" set to the _id of user "B", then the response status is 201, the new contact's "owner" is the _id of user "A", and the new contact is listed for user "A" and not for user "B". | SCN-006 | ✅ met |
| AC-7 | Scenario Outline: The owner of an existing contact cannot be changed. When user "A" calls <method> /contacts/{id of Secret Sam} with a body that sets "owner" to the _id of user "B", then the request is either rejected with 400 or answered 200 with "owner" still the _id of user "A", GET /contacts/{id of Secret Sam} for user "A" still answers 200, and GET /contacts for user "B" does not contain "Secret Sam". Examples: PUT with first name, last name and owner; PATCH with owner only. | SCN-007.1, SCN-007.2 | ❌ not met |
| AC-8 | Scenario: The contact list page only shows the signed-in user's contacts. Given user "B" has a contact "Bella Bee", when user "B" signs in on the login page, then the Contact List page shows "Bella Bee" and does not show "Secret Sam". | SCN-008 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md AC-1 | SCN-001 Contacts endpoints require a session token (<method> <path>) | security | api | 6/6 | ✅ meets requirement | - |
| **AC-2** | story.md AC-2 | SCN-002 A token that was not issued by the application is refused (<token>) | security | api | 2/2 | ✅ meets requirement | - |
| **AC-3** | story.md AC-3 | SCN-003 Signing out ends the session | security | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md AC-4 | SCN-004 A user cannot read another user's contact | security | api | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md AC-5 | SCN-005 A user cannot change or delete another user's contact (<method>) | security | api | 3/3 | ✅ meets requirement | - |
| **AC-6** | story.md AC-6 | SCN-006 A new contact always belongs to its creator | security | api | 1/1 | ✅ meets requirement | - |
| **AC-7** | story.md AC-7 | SCN-007 The owner of an existing contact cannot be changed (<method>) | security | api | 1/2 | ❌ fails requirement | APP-1 |
| **AC-8** | story.md AC-8 | SCN-008 The contact list page only shows the signed-in user's contacts | security | ui | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| security | 8 | 17 | 16 | 1 | 0 | APP-1 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | the request body of a valid contact for POST /contacts, PUT /contacts/{id} and PATCH /contacts/{id}: its field names, how a contact named "Secret Sam" or "Bella Bee" maps to them, and the first name / last name fields of AC-7's PUT row | how to exercise | AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8 | discovered from the AUT (mechanics only): a contact body is {firstName, lastName, …}; the story's names are first and last name |
| G2 | where a contact's id, its name and its "owner" are in the answers of POST /contacts, GET /contacts and GET /contacts/{id} (to get the id of Secret Sam, check "owner" and whether a list contains a contact) | how to exercise | AC-1, AC-3, AC-4, AC-5, AC-6, AC-7 | discovered from the AUT (mechanics only): POST /contacts answers 201 with _id and owner; GET /contacts answers an array of contacts; GET /contacts/{id} the contact |
| G3 | the login page (AC-8): its route and how its e-mail, password and submit elements are found | how to exercise | AC-8 | discovered from the AUT (mechanics only): the login page is / (Email, Password, Submit), saved as the profile's UI sign-in |
| G4 | the Contact List page (AC-8): its route and how the contacts it shows (their names) are found | how to exercise | AC-8 | discovered from the AUT (mechanics only): /contactList: each contact is a table row with its name |

**Assumptions the evaluation made:**

- users "A" and "B" are made per test by seed.account() (POST /users, deleted afterwards with DELETE /users/me); contacts a test makes go with their user
- "Secret Sam" and "Bella Bee" are a contact's first and last name, made unique per test with the data prefix in another field only where the list must tell them apart

Full review: [requirement-review.md](../../requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 32 | 2 | 0 |
| `02-eval` (final) | 16 | 1 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Requirement review: [requirement-review.md](../../requirement-review.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/02-eval/triage.md](../../runs/02-eval/triage.md) · JUnit: runs/02-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/CL-4/runs/02-eval/html`
