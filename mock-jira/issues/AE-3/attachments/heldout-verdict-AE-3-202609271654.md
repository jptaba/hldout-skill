# Held-out Evaluation Verdict — AE-3

> **Verdict: ⚠️ PASS WITH WARNINGS** — All scenarios passed, with warnings: 2 scenario(s) needing clarification, 4 open question(s) not tested.

| | |
| --- | --- |
| Story | [AE-3](https://your-domain.atlassian.net/browse/AE-3) — Brands in the catalogue API and shop, and the Contact Us form |
| Application under test | Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — UI https://automationexercise.com |
| Final run | `09-eval` · 2026-09-27T12:17:07.689Z · 14s |
| Tests | 16 total · 16 passed · 0 failed · 0 flaky · 0 skipped (from 12 scenarios) |
| Held-out integrity | ✅ PRESERVED — 31 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 2 (Playwright MCP driven through the bundled stdio client heldout mcp-probe: Contact Us form walk with Cancel on the confirmation) and tier 3 (heldout… (see hardening log) |
| ⚠️ Run history | run(s) 05 were deleted: their results are not part of this record |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-27T16:53:57.786Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | The brands list has the agreed shape | AC-1 | contract | ✅ passed | - |
| SCN-002 | Every brandsList entry names the brand of the product with that id | AC-1 | integration | ✅ passed | - |
| SCN-003.1 | Unsupported methods on the brands list are refused in the body (PUT) | AC-2 | negative | ✅ passed | - |
| SCN-003.2 | Unsupported methods on the brands list are refused in the body (POST) | AC-2 | negative | ✅ passed | - |
| SCN-003.3 | Unsupported methods on the brands list are refused in the body (DELETE) | AC-2 | negative | ✅ passed | - |
| SCN-004 | The Brands panel lists each brand once with its product count | AC-3 | functional | ✅ passed | - |
| SCN-005 | The Brands panel matches the brands list of the API | AC-4 | integration | ✅ passed | - |
| SCN-006.1 | A brand's page lists exactly that brand's products (Polo) | AC-5 | integration | ✅ passed | - |
| SCN-006.2 | A brand's page lists exactly that brand's products (H&M) | AC-5 | integration | ✅ passed | - |
| SCN-006.3 | A brand's page lists exactly that brand's products (Mast & Harbour) | AC-5 | integration | ✅ passed | - |
| SCN-007 | The Contact Us form offers the mock-up's fields | AC-6 | functional | ✅ passed | - |
| SCN-008 | The form is not sent while the mandatory Email is empty | AC-6 | negative | ✅ passed | - |
| SCN-009 | The form is not sent with an e-mail that is not a valid address | AC-6 | negative | ✅ passed | - |
| SCN-010 | The form can be sent with only a valid Email | AC-6 | functional | ✅ passed | - |
| SCN-011 | Sending the form asks for confirmation, shows success and offers a Home button | AC-7 | functional | ✅ passed | - |
| SCN-012 | Cancelling the confirmation keeps the form as filled | AC-8 | negative | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | GET /api/brandsList returns responseCode 200 and a brands array; every entry has an id and a brand. For every entry, the product with that id in GET /api/productsList has exactly that brand. | SCN-001, SCN-002 | ✅ met |
| AC-2 | PUT /api/brandsList is not supported: the HTTP status stays 200 and the JSON body is responseCode 405 with message "This request method is not supported.". POST and DELETE on /api/brandsList answer the same way. | SCN-003.1, SCN-003.2, SCN-003.3 | ✅ met |
| AC-3 | The "Brands" panel on the Products page lists every brand exactly once, each followed by the number of its products in parentheses, e.g. "(6)". | SCN-004 | ✅ met |
| AC-4 | The brands in the sidebar are exactly the distinct brand names in GET /api/brandsList, and the number shown next to each brand equals the number of brandsList entries with that brand. | SCN-005 | ✅ met |
| AC-5 | Clicking a brand in the sidebar opens that brand's page headed "Brand - <brand> Products" (e.g. "Brand - Polo Products") that lists only that brand's products: exactly the products that GET /api/productsList gives that brand. Check at least Polo, H&M and Mast & Harbour. | SCN-006.1, SCN-006.2, SCN-006.3 | ✅ met |
| AC-6 | The Contact Us form offers the fields shown in the mock-up (Name, Email, Subject, Message; the Attachment field is not part of this story); the mandatory field marked in the mock-up (Email) must be filled for the form to be sent, and an e-mail that is not a valid address stops the form from being sent. Fields marked optional (Name, Subject, Message) may be left empty. | SCN-007, SCN-008, SCN-009, SCN-010 | ✅ met |
| AC-7 | Sending the form follows the mock-up: the customer is asked to confirm (browser confirmation "Press OK to proceed!"); after confirming, the message "Success! Your details have been submitted successfully." is shown and the form is replaced by a "Home" button that returns to the home page. | SCN-011 | ✅ met |
| AC-8 | If the customer cancels the confirmation, no success message is shown and the form stays on the page with what they typed. | SCN-012 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L31, story.md#L21-L22 (AC-1, R1, R2) | SCN-001 The brands list has the agreed shape | contract | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L31, story.md#L21 (AC-1, R1) | SCN-002 Every brandsList entry names the brand of the product with that id | integration | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L32 (AC-2, E1) | SCN-003 Unsupported methods on the brands list are refused in the body | negative | api | 3/3 | ✅ meets requirement | - |
| **AC-3** | story.md#L33, story.md#L23 (AC-3, R3) | SCN-004 The Brands panel lists each brand once with its product count | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L34, story.md#L21 (AC-4, R1) | SCN-005 The Brands panel matches the brands list of the API | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L35, story.md#L23 (AC-5, R3) | SCN-006 A brand's page lists exactly that brand's products | integration | e2e | 3/3 | ✅ meets requirement | - |
| **AC-6** | story.md#L36, contact-us-mockup.png (fields and placeholders) | SCN-007 The Contact Us form offers the mock-up's fields | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L36, contact-us-mockup.png (Email marked mandatory; legend) | SCN-008 The form is not sent while the mandatory Email is empty | negative | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L36, contact-us-mockup.png (legend: "the e-mail is not a valid address") | SCN-009 The form is not sent with an e-mail that is not a valid address | negative | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L36, contact-us-mockup.png (Name, Subject, Message marked "(optional)") | SCN-010 The form can be sent with only a valid Email | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-7** | story.md#L37, contact-us-mockup.png (submit flow note) | SCN-011 Sending the form asks for confirmation, shows success and offers a Home button | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-8** | story.md#L38, contact-us-mockup.png (submit flow note: "Cancel keeps the form as filled, no banner") | SCN-012 Cancelling the confirmation keeps the form as filled | negative | ui | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| contract | 1 | 1 | 1 | 0 | 0 | - |
| functional | 4 | 4 | 4 | 0 | 0 | - |
| integration | 3 | 5 | 5 | 0 | 0 | - |
| negative | 4 | 6 | 6 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | shape of the GET /api/productsList response: where the product list, each product's id and its brand are found | how to exercise | AC-1, AC-5 | discovered from the AUT (mechanics only): body.products[] — each product has id and brand |
| G2 | how to match the products listed on a brand page to products in GET /api/productsList (e.g. by name or by product link / id) | how to exercise | AC-5 | discovered from the AUT (mechanics only): match by product id taken from the "View Product" link /product_details/{id} |
| G3 | how to recognise the home page reached through the "Home" button (route or landmark) | how to exercise | AC-7 | discovered from the AUT (mechanics only): home page = URL https://automationexercise.com/ (path /) |
| G4 | which e-mail values count as "not a valid address" (which malformed values must be refused) | expected behaviour | AC-6 | ❓ open |
| G5 | what observably shows that the form was not sent: no browser confirmation, no success message, a validation message (its text is not stated), or several of these | expected behaviour | AC-6 | ❓ open |
| G6 | whether AC-6 requires the mock-up's labels and markers to appear literally ("Name"/"Subject"/"Message" followed by "(optional)", "Email" with a red "*", the legend) or only that the fields exist; the mock-up is marked "not to scale" | expected behaviour | AC-6 | ❓ open |

**Open questions for the PO** (untested unless a scenario needing clarification below covers it):

- ❓ G4 — which e-mail values count as "not a valid address" (which malformed values must be refused). Only "not-an-email" (no "@"), invalid under any reading, is tested; other malformed values are not tested
- ❓ G5 — what observably shows that the form was not sent: no browser confirmation, no success message, a validation message (its text is not stated), or several of these. Tested literally in SCN-008 and SCN-009 (@needs-clarification): after attempting to send (Submit, accepting any confirmation), no success message is shown and the form stays on the page
- ❓ G6 — whether AC-6 requires the mock-up's labels and markers to appear literally ("Name"/"Subject"/"Message" followed by "(optional)", "Email" with a red "*", the legend) or only that the fields exist; the mock-up is marked "not to scale". Only the fields (by their mock-up placeholders) and the Submit button are asserted
- ❓ found during hardening (not an acceptance criterion, not tested) — sending the Contact Us form makes no request to the server: after OK the success message and "Home" button are rendered in place and no form data leaves the browser (hardening/tier3/ae3-net.mjs, hardening/hardening-log.md). No AC states that the message must be delivered, but the story's goal is "anyone can reach us through the Contact Us form": must the form actually deliver the message, and how can that be observed?

**Scenarios needing clarification:**

- SCN-008: The form is not sent while the mandatory Email is empty
- SCN-009: The form is not sent with an e-mail that is not a valid address

**Assumptions the evaluation made:**

- A1 — "each followed by the number of its products in parentheses": each Brands-panel entry must carry a count "(n)"; the position of the count relative to the name in the page markup is not asserted (the mock-up does not cover the panel)
- A2 — brand names are compared exactly as text (case-sensitive, surrounding whitespace trimmed); the brand page's heading uses the brand name as brandsList spells it
- A3 — one root cause, one failure: the exact success message is the subject of SCN-011 (AC-7); SCN-010 (optional fields may be empty) uses the same message as its evidence that the form was sent
- A4 — the AUT offers no way to delete a sent Contact Us message, so sent messages are not cleaned up; every typed value is unique (unique()) so leftovers are identifiable

Full review: [requirement-review.md](requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 13 | 3 | 0 |
| `02-harden` (hardening dry-run) | 1 | 2 | 0 |
| `03-harden` (hardening dry-run) | 3 | 0 | 0 |
| `04-harden` (hardening dry-run) | 48 | 0 | 0 |
| `06-harden` (hardening dry-run) | 2 | 0 | 0 |
| `07-harden` (hardening dry-run) | 7 | 0 | 0 |
| `08-harden` (hardening dry-run) | 48 | 0 | 0 |
| `09-eval` (final) | 16 | 0 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/09-eval/triage.md](runs/09-eval/triage.md) · JUnit: runs/09-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/AE-3/runs/09-eval/html`
