# Held-out Evaluation Verdict — PB-1

> **Verdict: ❌ FAIL** — 1 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-5. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [PB-1](https://your-domain.atlassian.net/browse/PB-1) — Customer registration and sign-in |
| Application under test | ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — UI https://parabank.parasoft.com/parabank/ · API https://parabank.parasoft.com/parabank/services/bank/ |
| Final run | `07-rerun` · 2026-09-27T06:03:51.507Z · 47s |
| Tests | 14 total · 13 passed · 1 failed · 0 flaky · 0 skipped (from 14 scenarios) |
| Held-out integrity | ✅ PRESERVED — 42 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 2 (Playwright MCP through the bundled stdio client `heldout mcp-probe`, own server; the session's native `mcp__playwright__*` tools were deliberately not u… (see hardening log) |
| Evaluator | heldout-evaluator (Claude Opus 5.5) |
| Generated | 2026-09-27T06:05:07.875Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-5 | negative | Wrong-password sign-in shows an internal-error message instead of 'The username and password could not be verified.' | SCN-007 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (1 root cause(s), 1 failing test(s))

### APP-1 · SCN-007 · AC-5 — Wrong-password sign-in shows an internal-error message instead of 'The username and password could not be verified.'

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-5 | On the Customer Login panel, signing in with a wrong password shows an "Error!" page with "The username and password could not be verified."; signing in with both fields empty shows "Please enter a username and password." |
| Requirement source | story.md#L36 (AC-5) |
| Test type · layer | negative · ui |
| SCN-007: expected (requirement) → actual (AUT) | `visible` → `element not found: getByText('The username and password could not be verified.')` |
| Failing step | And it says "The username and password could not be verified." |
| Evaluator classification | APPLICATION_DEFECT (reproduced live; automatic triage said NEEDS_INVESTIGATION, overridden after investigation) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxeyc9510`; recreate equivalent data before reproducing):

- customer registered via register.htm: `{"firstName":"Hana","lastName":"Heldout9510","street":"12 Heldout Lane","city":"Testville","state":"CA","zipCode":"94016","phoneNumber":"5551234567","ssn":"123-…` · cleanup: none

**Manually (scenario steps):**

1. Given a customer is registered with a fresh user name
2. And I am on the home page as a signed-out visitor
3. When I sign in on the Customer Login panel with that user name and a wrong password
4. Then an "Error!" page is shown
5. And it says "The username and password could not be verified."

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run PB-1 --label repro --grep "SCN-007:"
```

#### Evidence

![SCN-007 at the moment of failure](runs/07-rerun/artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/test-failed-1.png)

- [Page/test context at failure](runs/07-rerun/artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/PB-1/runs/07-rerun/artifacts/PB-1-tests-pb-1-PB-1-Custo-3d9b6-ssword-shows-the-Error-page-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3, heldout inspect): registered customer + wrong password on index.htm → heading 'Error!', text 'An internal error has occurred and has been logged.', required text 0 matches (runs/07-rerun/confirm/SCN-007-wrong-password.md); REST cross-check GET login/{user}/{wrong} → 400 'Invalid username and/or password' (runs/07-rerun/confirm/SCN-007-rest-wrong-password.md)

**Evaluator's analysis:** Signing in on the Customer Login panel with a registered user name and a wrong password reaches the 'Error!' page (as AC-5 requires), but the page says 'An internal error has occurred and has been logged.' instead of the required 'The username and password could not be verified.'. Locators are verified (heading 'Error!' found; the required text is absent). Deterministic: same result in every harden run, in 04-eval, 05/06/07-rerun and in two live replays. The REST login with the same credentials correctly answers 400 'Invalid username and/or password', so the customer exists and only the password is wrong.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None in the evaluation runs (mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | Submitting an empty registration form shows a required message next to every required field | AC-1 | negative | ✅ passed | - |
| SCN-002 | Registering with a Confirm that differs from Password shows "Passwords did not match." | AC-2 | negative | ✅ passed | - |
| SCN-003 | A registration rejected for mismatched passwords creates no customer | AC-2 | integration | ✅ passed | - |
| SCN-004 | A complete, valid registration welcomes the new customer and signs them in | AC-3 | functional | ✅ passed | - |
| SCN-005 | Registering with a user name that is already taken shows "This username already exists." | AC-4 | negative | ✅ passed | - |
| SCN-006 | A duplicate registration does not change the existing customer | AC-4 | integration | ✅ passed | - |
| SCN-007 | Signing in with a wrong password shows the "Error!" page | AC-5 | negative | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-008 | Signing in with both fields empty asks for a user name and password | AC-5 | negative | ✅ passed | - |
| SCN-009 | Signing in opens the Accounts Overview and Log Out returns to the home page | AC-6 | functional | ✅ passed | - |
| SCN-010 | REST login with valid credentials returns the registered customer as JSON | AC-7 | functional | ✅ passed | - |
| SCN-011 | REST login without Accept: application/json returns XML with a customer root element | AC-7 | contract | ✅ passed | - |
| SCN-012 | REST login with a wrong password answers 400 "Invalid username and/or password" | AC-8 | negative | ✅ passed | - |
| SCN-013 | The customer and accounts services return the customer registered through the page | AC-9 | integration | ✅ passed | - |
| SCN-014 | The customer and accounts services match the login response and the Accounts Overview exactly | AC-9 | integration | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Submitting the registration form with every field empty keeps the customer on the form and shows a message next to each required field: "First name is required.", "Last name is required.", "Address is required.", "City is required.", "State is required.", "Zip Code is required.", "Social Security Number is required.", "Username is required.", "Password is required.", "Password confirmation is required.". No message is shown for Phone #. | SCN-001 | ✅ met |
| AC-2 | When Password and Confirm differ, the form shows "Passwords did not match." and no customer is created (the user name cannot sign in afterwards). | SCN-002, SCN-003 | ✅ met |
| AC-3 | A complete, valid registration opens a page with the heading Welcome <username> (source: "Welcome _&lt;username&gt;_") and the text "Your account was created successfully. You are now logged in." The customer is signed in: the left panel greets them with Welcome <first name> <last name> (source: "Welcome _&lt;first name&gt; &lt;last name&gt;_") and shows the Account Services menu. | SCN-004 | ✅ met |
| AC-4 | Registering again with a user name that is already taken shows "This username already exists." next to Username and does not change the existing customer (a REST login of the existing customer still returns their original first and last name). | SCN-005, SCN-006 | ✅ met |
| AC-5 | On the Customer Login panel, signing in with a wrong password shows an "Error!" page with "The username and password could not be verified."; signing in with both fields empty shows "Please enter a username and password." | SCN-007, SCN-008 | ❌ not met |
| AC-6 | Signing in with the registered user name and password opens the Accounts Overview page, which lists at least one account for the new customer. "Log Out" returns to the home page with the Customer Login panel. | SCN-009 | ✅ met |
| AC-7 | GET /login/{username}/{password} with valid credentials answers 200 and returns the customer: id, firstName, lastName, address (street, city, state, zipCode) and phoneNumber, equal to the values entered at registration. With Accept: application/json the body is JSON; without it, XML with a customer root element. | SCN-010, SCN-011 | ✅ met |
| AC-8 | GET /login/{username}/{password} with a wrong password answers 400 with the body "Invalid username and/or password". | SCN-012 | ✅ met |
| AC-9 | End to end: for a customer registered through the page, GET /customers/{id} (id from the login response) returns the same customer, and GET /customers/{id}/accounts returns the account(s) whose numbers are shown in the Accounts Overview. | SCN-013, SCN-014 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L32 (AC-1), story.md#L26 (R1) | SCN-001 Submitting an empty registration form shows a required message next to every required field | negative | ui | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L33 (AC-2) | SCN-002 Registering with a Confirm that differs from Password shows "Passwords did not match." | negative | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L33 (AC-2), gap G5 | SCN-003 A registration rejected for mismatched passwords creates no customer | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L34 (AC-3) | SCN-004 A complete, valid registration welcomes the new customer and signs them in | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L35 (AC-4) | SCN-005 Registering with a user name that is already taken shows "This username already exists." | negative | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L35 (AC-4) | SCN-006 A duplicate registration does not change the existing customer | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L36 (AC-5) | SCN-007 Signing in with a wrong password shows the "Error!" page | negative | ui | 0/1 | ❌ fails requirement | APP-1 |
| ↳ | story.md#L36 (AC-5) | SCN-008 Signing in with both fields empty asks for a user name and password | negative | ui | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L37 (AC-6) | SCN-009 Signing in opens the Accounts Overview and Log Out returns to the home page | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-7** | story.md#L38 (AC-7) | SCN-010 REST login with valid credentials returns the registered customer as JSON | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L38 (AC-7) | SCN-011 REST login without Accept: application/json returns XML with a customer root element | contract | api | 1/1 | ✅ meets requirement | - |
| **AC-8** | story.md#L39 (AC-8) | SCN-012 REST login with a wrong password answers 400 "Invalid username and/or password" | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-9** | story.md#L40 (AC-9) | SCN-013 The customer and accounts services return the customer registered through the page | integration | e2e | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L40 (AC-9), gap G6 | SCN-014 The customer and accounts services match the login response and the Accounts Overview exactly | integration | e2e | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| contract | 1 | 1 | 1 | 0 | 0 | - |
| functional | 3 | 3 | 3 | 0 | 0 | - |
| integration | 4 | 4 | 4 | 0 | 0 | - |
| negative | 6 | 6 | 5 | 1 | 0 | APP-1 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | how an API-layer check creates its customer: the story states that every check registers its own customer, but names only the registration page (register.htm), no REST registration endpoint | how to exercise | AC-7, AC-8 | discovered from the AUT (mechanics only): Customers are created through the registration page register.htm (UI seed wrapped in seed.create); no REST registration endpoint exists. No customer-deletion endpoint exists, so registered customers cannot be cleaned up |
| G2 | Customer Login panel locators (user name and password field labels, sign-in button), Accounts Overview route and how its account numbers are shown | how to exercise | AC-5, AC-6, AC-9 | discovered from the AUT (mechanics only): Login panel: input[name="username"], input[name="password"], button "Log In"; Accounts Overview route overview.htm, heading "Accounts Overview"; account numbers: links in #accountTable tbody |
| G3 | exact page/control locators on register.htm (submit button label, where each field message is rendered) and the left-panel element for the greeting and Account Services menu | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-9 | discovered from the AUT (mechanics only): Inputs by id ([id="customer.firstName"], … [id="customer.password"], [id="repeatedPassword"]); submit button "Register"; message = same table row as the field; greeting text + heading "Account Services" in the left panel |
| G4 | authentication for GET /customers/{id} and GET /customers/{id}/accounts: the story does not say whether these calls need credentials or how they are sent | how to exercise | AC-9 | discovered from the AUT (mechanics only): No credentials are sent; both calls take only the customer id in the path |
| G5 | how "the user name cannot sign in afterwards" is observed: the story does not state what GET /login/{username}/{password} (or the Customer Login panel) answers for a user name that was never created | expected behaviour | AC-2 | assumed: Sign-in fails: GET /login/{username}/{password} with that user name and the password used does not answer 200 with a customer. No specific status or message is asserted. |
| G6 | what "returns the same customer" and "returns the account(s) whose numbers are shown" compare: which customer fields, and whether the account set must be equal or only contain the shown numbers | expected behaviour | AC-9 | assumed: GET /customers/{id} succeeds and its id, firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal those of the login response (the fields AC-7 lists); the account ids returned by GET /customers/{id}/accounts are exactly the account numbers shown in the Accounts Overview. |

**Assumptions the evaluation made:**

- G5 — how "the user name cannot sign in afterwards" is observed: the story does not state what GET /login/{username}/{password} (or the Customer Login panel) answers for a user name that was never created: Sign-in fails: GET /login/{username}/{password} with that user name and the password used does not answer 200 with a customer. No specific status or message is asserted.
- G6 — what "returns the same customer" and "returns the account(s) whose numbers are shown" compare: which customer fields, and whether the account set must be equal or only contain the shown numbers: GET /customers/{id} succeeds and its id, firstName, lastName, address (street, city, state, zipCode) and phoneNumber equal those of the login response (the fields AC-7 lists); the account ids returned by GET /customers/{id}/accounts are exactly the account numbers shown in the Accounts Overview.
- AC-7 "without Accept: application/json" is exercised with "Accept: */*" (the test client always sends an Accept header; */* does not ask for JSON).
- every scenario registers its own customer through register.htm (the story names no REST registration endpoint, gap G1). The story offers no way to delete a customer, so registered customers stay in the shared demo DB with unique pb1… user names.
- one root cause, one failure: the exact success texts of registration are asserted only in SCN-004; other scenarios that register a customer treat registration as a precondition.

Full review: [requirement-review.md](requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 9 | 3 | 2 |
| `02-harden` (hardening dry-run) | 17 | 24 | 1 |
| `03-harden` (hardening dry-run) | 36 | 5 | 1 |
| `04-eval` | 8 | 5 | 1 |
| `05-rerun` | 11 | 2 | 1 |
| `06-rerun` | 11 | 2 | 1 |
| `07-rerun` (final) | 13 | 1 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/07-rerun/triage.md](runs/07-rerun/triage.md) · JUnit: runs/07-rerun/junit.xml
- HTML report: `npx playwright show-report evaluations/PB-1/runs/07-rerun/html`
