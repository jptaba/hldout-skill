# Held-out Evaluation Verdict — TOOL-4

> **Verdict: ✅ PASS** — Every scenario passed and every acceptance criterion is covered.

| | |
| --- | --- |
| Story | [TOOL-4](https://your-domain.atlassian.net/browse/TOOL-4) — Favourites for signed-in customers |
| Application under test | Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) — UI https://practicesoftwaretesting.com · API https://api.practicesoftwaretesting.com |
| Final run | `02-eval` · 2026-09-26T23:20:21.241Z · 14s |
| Tests | 11 total · 11 passed · 0 failed · 0 flaky · 0 skipped (from 6 scenarios) |
| Held-out integrity | ✅ PRESERVED — 10 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (`inspect.ts` for the favourites UI — contract gaps G5/G6; `run.ts --label harden --capture`). |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-26T23:20:40.501Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (0)

_None in the evaluation runs (mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A signed-in customer adds a favourite | AC-1 | functional | ✅ passed | - |
| SCN-002 | Adding the same favourite twice is rejected with 409 | AC-2 | negative | ✅ passed | - |
| SCN-003 | A customer sees only their own favourites | AC-3 | security | ✅ passed | - |
| SCN-004.1 | POST /favorites with no token is refused with 401 | AC-4 | security | ✅ passed | - |
| SCN-004.2 | GET /favorites with no token is refused with 401 | AC-4 | security | ✅ passed | - |
| SCN-004.3 | DELETE /favorites/{id} with no token is refused with 401 | AC-4 | security | ✅ passed | - |
| SCN-004.4 | POST /favorites with an invalid token is refused with 401 | AC-4 | security | ✅ passed | - |
| SCN-004.5 | GET /favorites with an invalid token is refused with 401 | AC-4 | security | ✅ passed | - |
| SCN-004.6 | DELETE /favorites/{id} with an invalid token is refused with 401 | AC-4 | security | ✅ passed | - |
| SCN-005 | Adding a favourite on the web shop | AC-5 | integration | ✅ passed | - |
| SCN-006 | Removing a favourite | AC-6 | functional | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | A signed-in customer adds a product to favourites with POST /favorites; the API responds 201 with the favourite (its id and the product id). | SCN-001 | ✅ met |
| AC-2 | Adding a product that is already a favourite is rejected and the list still contains it once. | SCN-002 | ✅ met |
| AC-3 | GET /favorites lists the customer's own favourites only; another customer's favourites are never included. | SCN-003 | ✅ met |
| AC-4 | Every favourites endpoint responds 401 without a valid token. | SCN-004.1, SCN-004.2, SCN-004.3, SCN-004.4, SCN-004.5, SCN-004.6 | ✅ met |
| AC-5 | On the web shop, a signed-in customer who clicks "Add to favourites" on a product page sees "Product added to your favorites list." and the product then appears on the "Favorites" page of their account. | SCN-005 | ✅ met |
| AC-6 | DELETE /favorites/{favoriteId} removes the favourite (204) and it no longer appears in GET /favorites. | SCN-006 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L23 | SCN-001 A signed-in customer adds a favourite | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L24, story.md#L34 | SCN-002 Adding the same favourite twice is rejected with 409 | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L25 | SCN-003 A customer sees only their own favourites | security | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L26 | SCN-004 <request> with <credentials> is refused with 401 | security | api | 6/6 | ✅ meets requirement | - |
| **AC-5** | story.md#L27 | SCN-005 Adding a favourite on the web shop | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L28 | SCN-006 Removing a favourite | functional | api | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| functional | 2 | 2 | 2 | 0 | 0 | - |
| integration | 1 | 1 | 1 | 0 | 0 | - |
| negative | 1 | 1 | 1 | 0 | 0 | - |
| security | 2 | 7 | 7 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | status for a duplicate favourite: the technical notes say 422, the PO comment says 409 | expected behaviour | AC-2 | found elsewhere in the requirement: 409 |
| G2 | API origin (the story gives paths only) | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-6 | project configuration: https://api.practicesoftwaretesting.com (web shop https://practicesoftwaretesting.com) |
| G3 | how to create a test customer who can sign in | how to exercise | AC-1, AC-2, AC-3, AC-5, AC-6 | discovered from the AUT (mechanics only): POST /users/register |
| G4 | how to obtain a product id to add to favourites | how to exercise | AC-1, AC-2, AC-3, AC-5, AC-6 | discovered from the AUT (mechanics only): GET /products/search |
| G5 | web-shop sign-in route and form, product page route and the "Add to favourites" control, where the confirmation appears (AC-5) | how to exercise | AC-5 | discovered from the AUT (mechanics only): /auth/login (data-test email / password / login-submit); /product/<id> with data-test add-to-favorites; toast role=alert |
| G6 | where the account's "Favorites" page lives and how its entries are marked (AC-5) | how to exercise | AC-5 | discovered from the AUT (mechanics only): /account/favorites, entries data-test product-name |
| G7 | response field names for the favourite's id and the product id (AC-1) | how to exercise | AC-1 | assumed: id for the favourite's id, product_id for the product id (same name as the request field in story.md#L19) |

**Assumptions the evaluation made:**

- G7 — response field names for the favourite's id and the product id (AC-1): id for the favourite's id, product_id for the product id (same name as the request field in story.md#L19)
- G1 — duplicates answer 409: the Product Owner's comment explicitly supersedes the technical note's 422 (story.md#L34).
- Each scenario registers its own customer(s) via POST /users/register and signs in via POST /users/login; favourites are removed after the test.

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 11 | 0 | 0 |
| `02-eval` (final) | 11 | 0 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/02-eval/triage.md](../../runs/02-eval/triage.md) · JUnit: runs/02-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/TOOL-4/runs/02-eval/html`
