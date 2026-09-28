# Held-out Evaluation Verdict — TOOL-4

> **Verdict: ✅ PASS** — Every scenario passed and every acceptance criterion is covered.

| | |
| --- | --- |
| Story | [TOOL-4](https://your-domain.atlassian.net/browse/TOOL-4) — Favourites for signed-in customers |
| Application under test | Practice Software Testing (profile `practicesoftwaretesting`) — UI https://practicesoftwaretesting.com/ · API https://api.practicesoftwaretesting.com |
| Final run | `02-eval` · 2026-09-28T20:29:21.101Z · 17s |
| Tests | 11 total · 11 passed · 0 failed · 0 flaky · 0 skipped (from 6 scenarios) |
| Held-out integrity | ✅ PRESERVED — 14 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (heldout api-probe --chain, heldout inspect with probes and the page's own API calls, heldout accounts --from-chain / --sign-in-steps, dry run 01-harden… (see hardening log) |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-09-28T20:29:40.794Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A customer adds a product to favourites | AC-1 | functional | ✅ passed | - |
| SCN-002 | Adding a product that is already a favourite is refused | AC-2 | idempotency | ✅ passed | - |
| SCN-003 | Each customer sees only their own favourites | AC-3 | security | ✅ passed | - |
| SCN-004.1 | The favourites endpoints refuse calls without a valid token (POST /favorites without a token) | AC-4 | security | ✅ passed | - |
| SCN-004.2 | The favourites endpoints refuse calls without a valid token (GET /favorites without a token) | AC-4 | security | ✅ passed | - |
| SCN-004.3 | The favourites endpoints refuse calls without a valid token (DELETE /favorites/{favoriteId} without a token) | AC-4 | security | ✅ passed | - |
| SCN-004.4 | The favourites endpoints refuse calls without a valid token (POST /favorites with an invalid token) | AC-4 | security | ✅ passed | - |
| SCN-004.5 | The favourites endpoints refuse calls without a valid token (GET /favorites with an invalid token) | AC-4 | security | ✅ passed | - |
| SCN-004.6 | The favourites endpoints refuse calls without a valid token (DELETE /favorites/{favoriteId} with an invalid token) | AC-4 | security | ✅ passed | - |
| SCN-005 | Adding to favourites in the web shop | AC-5 | integration | ✅ passed | - |
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
| **AC-1** | story.md AC-1 | SCN-001 A customer adds a product to favourites | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md AC-2, PO comment (story.md#L34) | SCN-002 Adding a product that is already a favourite is refused | idempotency | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md AC-3 | SCN-003 Each customer sees only their own favourites | security | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md AC-4 | SCN-004 The favourites endpoints refuse calls without a valid token | security | api | 6/6 | ✅ meets requirement | - |
| **AC-5** | story.md AC-5 | SCN-005 Adding to favourites in the web shop | integration | ui | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md AC-6 | SCN-006 Removing a favourite | functional | api | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| functional | 2 | 2 | 2 | 0 | 0 | - |
| idempotency | 1 | 1 | 1 | 0 | 0 | - |
| integration | 1 | 1 | 1 | 0 | 0 | - |
| security | 2 | 7 | 7 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | status for a duplicate favourite: the technical notes say 422, the PO comment says 409 | expected behaviour | AC-2 | found elsewhere in the requirement: 409 |
| G2 | which product a test adds to favourites and how it gets its product id (no source names a product or how to find one) | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 | discovered from the AUT (mechanics only): GET /products (public) answers {data: [{id, name, …}]}; tests take existing products from it |
| G3 | field names in the favourite returned by POST /favorites and listed by GET /favorites (the favourite's id, the product id) and the shape of the GET /favorites list | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-6 | discovered from the AUT (mechanics only): POST /favorites answers {id, product_id, …}; GET /favorites an array of those |
| G4 | how a web shop test signs the customer in (sign-in page route and fields, or how the API token becomes a web session) | how to exercise | AC-5 | discovered from the AUT (mechanics only): /auth/login: getByTestId('email'), getByTestId('password'), getByTestId('login-submit'); lands on /account (the profile's UI sign-in) |
| G5 | product page: its route, how the "Add to favourites" control is found, and where the message "Product added to your favorites list." appears | how to exercise | AC-5 | discovered from the AUT (mechanics only): /product/<id>; button getByTestId('add-to-favorites'); the message is shown as a toast |
| G6 | "Favorites" page of the customer's account: its route or navigation, and how the listed products are found | how to exercise | AC-5 | discovered from the AUT (mechanics only): C:/Program Files/Git/account/favorites lists each favourite with its product name |

**Assumptions the evaluation made:**

- every test registers its own customer (seed.account()); customers the application doesn't let tests delete are kept, named hldout-….
- favourites a test adds are removed afterwards (DELETE /favorites/{favoriteId}); one added in the web shop is found through GET /favorites and removed the same way.

Full review: [requirement-review.md](../../requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 22 | 0 | 0 |
| `02-eval` (final) | 11 | 0 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Requirement review: [requirement-review.md](../../requirement-review.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/02-eval/triage.md](../../runs/02-eval/triage.md) · JUnit: runs/02-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/TOOL-4/runs/02-eval/html`
