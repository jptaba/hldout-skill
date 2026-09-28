# Held-out Evaluation Verdict — CL-3

> **Verdict: ✅ PASS** — Every scenario passed and every acceptance criterion is covered.

| | |
| --- | --- |
| Story | [CL-3](https://your-domain.atlassian.net/browse/CL-3) — Edit and delete a contact |
| Application under test | Contact List App (profile `thinking-tester-contact-list`) — UI https://thinking-tester-contact-list.herokuapp.com/ |
| Final run | `02-eval` · 2026-09-28T19:13:00.391Z · 10s |
| Tests | 20 total · 20 passed · 0 failed · 0 flaky · 0 skipped (from 14 scenarios) |
| Held-out integrity | ✅ PRESERVED — 33 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (heldout api-probe --chain, heldout inspect with steps, probes and the page's own API calls, heldout accounts --from-chain / --sign-in-steps with a live… (see hardening log) |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-09-28T19:13:12.529Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | The edit form is pre-filled with the contact's current values | AC-1 | functional | ✅ passed | - |
| SCN-002 | Editing the city saves it and shows it on the Contact Details page | AC-2 | functional | ✅ passed | - |
| SCN-003 | An edit in the web app is what the API returns | AC-3 | integration | ✅ passed | - |
| SCN-004 | Emptying the phone in the web app clears it | AC-3 | integration | ✅ passed | - |
| SCN-005 | An invalid e-mail is refused and nothing is stored | AC-4 | negative | ✅ passed | - |
| SCN-006 | PUT replaces the contact | AC-5 | functional | ✅ passed | - |
| SCN-007 | PUT clears the optional fields it does not send | AC-5 | functional | ✅ passed | - |
| SCN-008 | PATCH changes only the fields it sends | AC-6 | functional | ✅ passed | - |
| SCN-009.1 | An update that would lose the first or last name is refused (PUT without firstName) | AC-7 | negative | ✅ passed | - |
| SCN-009.2 | An update that would lose the first or last name is refused (PUT without lastName) | AC-7 | negative | ✅ passed | - |
| SCN-009.3 | An update that would lose the first or last name is refused (PUT with firstName "") | AC-7 | negative | ✅ passed | - |
| SCN-009.4 | An update that would lose the first or last name is refused (PATCH with lastName "") | AC-7 | negative | ✅ passed | - |
| SCN-010 | Cancelling the delete keeps the contact | AC-8 | functional | ✅ passed | - |
| SCN-011 | Confirming the delete removes the contact | AC-8 | functional | ✅ passed | - |
| SCN-012 | DELETE answers "Contact deleted" | AC-9 | functional | ✅ passed | - |
| SCN-013 | A deleted contact is gone for good | AC-10 | negative | ✅ passed | - |
| SCN-014.1 | A malformed contact id is refused (GET) | AC-11 | negative | ✅ passed | - |
| SCN-014.2 | A malformed contact id is refused (PUT) | AC-11 | negative | ✅ passed | - |
| SCN-014.3 | A malformed contact id is refused (PATCH) | AC-11 | negative | ✅ passed | - |
| SCN-014.4 | A malformed contact id is refused (DELETE) | AC-11 | negative | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | "Edit Contact" on the Contact Details page opens the Edit Contact page with every field pre-filled with the contact's current values. | SCN-001 | ✅ met |
| AC-2 | Changing a value (for example the city) and pressing Submit saves the change and returns the user to the Contact Details page, which shows the new value. | SCN-002 | ✅ met |
| AC-3 | After an edit in the web app, GET /contacts/{id} returns the new value. Emptying an optional field in the edit form (for example the phone) removes that value: the Contact Details page shows it empty and the API returns null for it. | SCN-003, SCN-004 | ✅ met |
| AC-4 | Submitting the edit form with an invalid e-mail address (for example not-an-email) keeps the user on the Edit Contact page with a message containing "Email is invalid", and the stored contact is not changed. | SCN-005 | ✅ met |
| AC-5 | PUT /contacts/{id} replaces the contact as described in the contract: 200 with the full updated contact; optional fields that are not in the body are cleared (null). | SCN-006, SCN-007 | ✅ met |
| AC-6 | PATCH /contacts/{id} changes only the fields in the body: 200 with the updated contact, and all other fields keep their previous values. | SCN-008 | ✅ met |
| AC-7 | A PUT or PATCH that would leave the contact without a first name or last name (field missing from a PUT body, or sent as an empty string) is rejected with 400 and the stored contact stays exactly as it was. | SCN-009.1, SCN-009.2, SCN-009.3, SCN-009.4 | ✅ met |
| AC-8 | "Delete Contact" asks "Are you sure you want to delete this contact?". Cancelling keeps the contact and the user stays on the Contact Details page; confirming deletes it and returns the user to the Contact List page, where the contact is no longer listed. | SCN-010, SCN-011 | ✅ met |
| AC-9 | DELETE /contacts/{id} answers 200 with the body Contact deleted. | SCN-012 | ✅ met |
| AC-10 | A deleted contact is gone for good: GET /contacts/{id} answers 404, it is not part of GET /contacts, and a second DELETE, a PUT or a PATCH on it also answer 404. | SCN-013 | ✅ met |
| AC-11 | A malformed contact id (for example abc) on GET, PUT, PATCH or DELETE /contacts/{id} is answered with 400 and the body Invalid Contact ID. | SCN-014.1, SCN-014.2, SCN-014.3, SCN-014.4 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md AC-1 | SCN-001 The edit form is pre-filled with the contact's current values | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md AC-2 | SCN-002 Editing the city saves it and shows it on the Contact Details page | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md AC-3 | SCN-003 An edit in the web app is what the API returns | integration | e2e | 1/1 | ✅ meets requirement | - |
| ↳ | story.md AC-3 | SCN-004 Emptying the phone in the web app clears it | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md AC-4 | SCN-005 An invalid e-mail is refused and nothing is stored | negative | ui | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md AC-5 | SCN-006 PUT replaces the contact | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md AC-5, attachment L30 | SCN-007 PUT clears the optional fields it does not send | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md AC-6 | SCN-008 PATCH changes only the fields it sends | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-7** | story.md AC-7, attachment L35/L47 | SCN-009 An update that would lose the first or last name is refused | negative | api | 4/4 | ✅ meets requirement | - |
| **AC-8** | story.md AC-8 | SCN-010 Cancelling the delete keeps the contact | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md AC-8 | SCN-011 Confirming the delete removes the contact | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-9** | story.md AC-9 | SCN-012 DELETE answers "Contact deleted" | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-10** | story.md AC-10 | SCN-013 A deleted contact is gone for good | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-11** | story.md AC-11 | SCN-014 A malformed contact id is refused | negative | api | 4/4 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| functional | 8 | 8 | 8 | 0 | 0 | - |
| integration | 2 | 2 | 2 | 0 | 0 | - |
| negative | 4 | 10 | 10 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | Contact List page: route, how a contact's row is found and clicked, and how to tell a contact is no longer listed | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-8 | discovered from the AUT (mechanics only): /contactList; a contact's row is the table row with its first and last name; clicking it opens /contactDetails; a deleted contact has no row |
| G2 | Contact Details page: route, how the field values are read, the Edit Contact and Delete Contact buttons, and how the delete confirmation is shown and answered (browser dialog or in-page) | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-8 | discovered from the AUT (mechanics only): /contactDetails; values in elements with the field ids; buttons by name; loads the contact after it opens; Delete asks with a native confirm() |
| G3 | Edit Contact page: route, field labels/locators, Submit button, and where the validation message appears | how to exercise | AC-1, AC-2, AC-3, AC-4 | discovered from the AUT (mechanics only): /editContact; inputs with the field ids, pre-filled after load; Submit; message in #error |
| G4 | Creating and removing test data: POST /contacts request body, success status and auth header (or the Add Contact page's route and fields); auth for DELETE /users/me | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10 | discovered from the AUT (mechanics only): POST /contacts with the contact fields and Authorization: Bearer <token> → 201 with _id; DELETE /users/me with the Bearer token (the accounts recipe's delete) |
| G5 | GET /contacts: auth header and where the contacts are in the response | how to exercise | AC-10 | discovered from the AUT (mechanics only): GET /contacts with Authorization: Bearer <token> → array of contacts with _id |
| G6 | An emptied optional field: AC-3 says the API returns null for it; the contract attachment says an optional field without a value is either absent or null. Must the field be null, or is absent also acceptable? | expected behaviour | AC-3 | ❓ open |
| G7 | No acceptance criterion covers the Return to Contact List button on the Contact Details page or the Cancel button on the Edit Contact page; are they in scope, and what must they do? | expected behaviour |  | ❓ open |
| G8 | No acceptance criterion covers these stated error cases: 401 {"error": "Please authenticate."} for a missing or invalid token, 404 for a contact that belongs to another user, and 400 with a JSON message for an invalid e-mail on PUT or PATCH; are they in scope? | expected behaviour |  | ❓ open |

**For the owner's information** (questions the criteria can be judged without, as the review confirmed; they don't affect the verdict):

- ℹ️ G6 — An emptied optional field: AC-3 says the API returns null for it; the contract attachment says an optional field without a value is either absent or null. Must the field be null, or is absent also acceptable?
- ℹ️ G7 — No acceptance criterion covers the Return to Contact List button on the Contact Details page or the Cancel button on the Edit Contact page; are they in scope, and what must they do?
- ℹ️ G8 — No acceptance criterion covers these stated error cases: 401 {"error": "Please authenticate."} for a missing or invalid token, 404 for a contact that belongs to another user, and 400 with a JSON message for an invalid e-mail on PUT or PATCH; are they in scope?

**Assumptions the evaluation made:**

- every test signs up its own user (seed.account(), deleted afterwards) and creates the contacts it needs through POST /contacts, deleting them afterwards.

Full review: [requirement-review.md](../../requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 40 | 0 | 0 |
| `02-eval` (final) | 20 | 0 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Requirement review: [requirement-review.md](../../requirement-review.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/02-eval/triage.md](../../runs/02-eval/triage.md) · JUnit: runs/02-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/CL-3/runs/02-eval/html`
