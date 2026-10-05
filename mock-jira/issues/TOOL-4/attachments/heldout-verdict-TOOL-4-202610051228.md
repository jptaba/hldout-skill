# Held-out Evaluation Verdict — TOOL-4

> **Verdict: ✅ PASS** — Every test passed and every acceptance criterion is covered.

| | |
| --- | --- |
| Story | [TOOL-4](https://jira.example.com/browse/TOOL-4) — Favourites for signed-in customers |
| Application under test | Practice Software Testing (profile `practicesoftwaretesting`) — UI https://practicesoftwaretesting.com/ · API https://api.practicesoftwaretesting.com |
| Final run | `03-eval` · 2026-10-05T12:28:02.795Z · 22s |
| Tests | 15 total · 15 passed · 0 failed · 0 flaky · 0 skipped (from 10 scenarios) |
| Held-out integrity | ✅ PRESERVED — 20 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (bundled heldout inspect for the web shop pages and heldout api-probe chains for the favourites API). |
| Actions | 6 action(s) from actions/practicesoftwaretesting/ (0 proven by earlier stories, 6 new to the map) · 5 action file(s) changed after the freeze: api/favorites/_shared.ts, ui/account/open-favorites-page.ts, ui/account/read-favorite-product-names.ts, ui/product/click-add-to-favourites.ts, ui/product/open-product-page.ts |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-10-05T12:28:33.664Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A signed-in customer adds a product to favourites and gets 201 with that product | AC-1 | functional | ✅ passed | - |
| SCN-002 | Adding a product that is already a favourite again is rejected with 409 and it stays listed once | AC-2 | idempotency | ✅ passed | - |
| SCN-003 | GET /favorites answers 200 with the customer's own favourites | AC-3 | functional | ✅ passed | - |
| SCN-004.1 | GET /favorites without a token answers 401 | AC-4 | security | ✅ passed | - |
| SCN-004.2 | GET /favorites with an invalid token answers 401 | AC-4 | security | ✅ passed | - |
| SCN-004.3 | POST /favorites without a token answers 401 | AC-4 | security | ✅ passed | - |
| SCN-004.4 | POST /favorites with an invalid token answers 401 | AC-4 | security | ✅ passed | - |
| SCN-004.5 | DELETE /favorites/{favoriteId} without a token answers 401 | AC-4 | security | ✅ passed | - |
| SCN-004.6 | DELETE /favorites/{favoriteId} with an invalid token answers 401 | AC-4 | security | ✅ passed | - |
| SCN-005 | In the web shop, a customer adds a product to favourites on its page and finds it on the Favorites page | AC-5 | functional | ✅ passed | - |
| SCN-006 | DELETE /favorites/{favoriteId} removes the favourite with 204 and GET /favorites no longer lists it | AC-6 | functional | ✅ passed | - |
| SCN-007 | POST /favorites answers with the favourite: its id and its product id | AC-1 | contract | ✅ passed | - |
| SCN-008 | GET /favorites never includes another customer's favourites | AC-3 | security | ✅ passed | - |
| SCN-009 | A favourite added with POST is listed by GET and removed with its id by DELETE | AC-1, AC-3, AC-6 | composition | ✅ passed | - |
| SCN-010 | A product added to favourites in the web shop is in the customer's GET /favorites | AC-5 | integration | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | A signed-in customer adds a product to favourites with POST /favorites; the API responds 201 with the favourite (its id and the product id). | SCN-001, SCN-007, SCN-009 | ✅ met |
| AC-2 | Adding a product that is already a favourite is rejected and the list still contains it once. | SCN-002 | ✅ met |
| AC-3 | GET /favorites lists the customer's own favourites only; another customer's favourites are never included. | SCN-003, SCN-008, SCN-009 | ✅ met |
| AC-4 | Every favourites endpoint responds 401 without a valid token. | SCN-004.1, SCN-004.2, SCN-004.3, SCN-004.4, SCN-004.5, SCN-004.6 | ✅ met |
| AC-5 | On the web shop, a signed-in customer who clicks "Add to favourites" on a product page sees "Product added to your favorites list." and the product then appears on the "Favorites" page of their account. | SCN-005, SCN-010 | ✅ met |
| AC-6 | DELETE /favorites/{favoriteId} removes the favourite (204) and it no longer appears in GET /favorites. | SCN-006, SCN-009 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L23, linked/confluence-880001-favourites-api.md#L18-L30 | SCN-001 A signed-in customer adds a product to favourites and gets 201 with that product | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L23, linked/confluence-880001-favourites-api.md#L29-L30 | SCN-007 POST /favorites answers with the favourite: its id and its product id | contract | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L23, story.md#L25, story.md#L28 | SCN-009 A favourite added with POST is listed by GET and removed with its id by DELETE | composition | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L24, linked/confluence-880001-favourites-api.md#L32 | SCN-002 Adding a product that is already a favourite again is rejected with 409 and it stays listed once | idempotency | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L25, linked/confluence-880001-favourites-api.md#L12-L16 | SCN-003 GET /favorites answers 200 with the customer's own favourites | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L25, story.md#L17, linked/confluence-880001-favourites-api.md#L16 | SCN-008 GET /favorites never includes another customer's favourites | security | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L23, story.md#L25, story.md#L28 | SCN-009 A favourite added with POST is listed by GET and removed with its id by DELETE | composition | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L26, linked/confluence-880001-favourites-api.md#L17, #L31, #L39 | SCN-004 … … answers 401 | security | api | 6/6 | ✅ meets requirement | - |
| **AC-5** | story.md#L27 | SCN-005 In the web shop, a customer adds a product to favourites on its page and finds it on the Favorites page | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L27, story.md#L17 (one personal list, from the web shop and through the API) | SCN-010 A product added to favourites in the web shop is in the customer's GET /favorites | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L28, linked/confluence-880001-favourites-api.md#L33-L38 | SCN-006 DELETE /favorites/{favoriteId} removes the favourite with 204 and GET /favorites no longer lists it | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L23, story.md#L25, story.md#L28 | SCN-009 A favourite added with POST is listed by GET and removed with its id by DELETE | composition | api | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| idempotency | 1 | 1 | 1 | 0 | 0 | - |
| security | 2 | 7 | 7 | 0 | 0 | - |
| contract | 1 | 1 | 1 | 0 | 0 | - |
| composition | 1 | 1 | 1 | 0 | 0 | - |
| integration | 1 | 1 | 1 | 0 | 0 | - |
| functional | 4 | 4 | 4 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | how a test finds the id of an existing product to put in product_id (no products endpoint or product is named) | how to exercise | AC-1, AC-2, AC-3, AC-4, AC-6 | discovered from the AUT (mechanics only): Existing catalogue products from GET /products (page 1, data[].id, ULID strings); POST /favorites accepted such an id as product_id (201). Action pickCatalogueProducts; same GET /products as readWholeCatalogue, proven by TOOL-1 |
| G2 | web shop product page: its route and how the "Add to favourites" button and the confirmation message are found | how to exercise | AC-5 | discovered from the AUT (mechanics only): Route /product/{productId}; the product's name is heading data-test=product-name; the button is getByRole('button', { name: 'Add to favourites', exact: true }) (data-test=add-to-favorites, 1 match); the confirmation is shown as the page's role=alert with the text (getByText matches 1); the click calls POST /favorites (201) |
| G3 | the "Favorites" page of the customer's account: its route and how the listed products are found | how to exercise | AC-5 | discovered from the AUT (mechanics only): Route /account/favorites (account menu 'My favorites'), loads GET /favorites; each favourite is a card data-test=favorite-<favourite id> whose product name is data-test=product-name: locator('[data-test^="favorite-"]').getByTestId('product-name') |

**For the owner's information** (questions the criteria can be judged without: gaps the review marked not required, and what the tests found the criteria leave unsaid; they don't affect the verdict):

- ℹ️ what DELETE /favorites/{favoriteId} must answer for another customer's favourite (no criterion says; not tested).
- ℹ️ whether adding the same product twice at the same moment must also leave it in the list once (AC-2 speaks of a product that is already a favourite; not tested).
- ℹ️ what POST /favorites must answer without product_id (R3 makes it required) or for an unknown product, and DELETE for an unknown favourite id (no status stated; not tested).

**Assumptions the evaluation made:**

- the exact success statuses are asserted once each: 201 of POST /favorites in SCN-001, 200 of GET /favorites in SCN-003, 204 of DELETE /favorites/{favoriteId} in SCN-006. The other tests only need those calls to succeed (a precondition, or "accepted" in the composition SCN-009) and check what their own criterion names.
- the favourite's id and its product id are read where the answer carries them (the favourite's `id`; its `product_id`, or the id of a nested product): the requirement names the values, not their field names; the hardener confirms where they are.

## How this verdict was produced

1. The requirement (the story's title, description and acceptance criteria, the images they show and the Confluence pages they link) was fetched from Jira and turned into a requirement contract ([requirement-contract.md](requirement-contract.md)): every criterion quoted from its source, the endpoints, error cases and gaps, checked by an independent reviewer.
2. Playwright TypeScript tests (UI and API) were written from the contract **only**, with no access to the AUT source or developer tests. Each test is tagged with the criteria it proves, its test type and the requirement source it comes from; expected values were copied verbatim from the requirement. Their steps call the shared actions of the application (how to reach pages and call endpoints, never what the application answers).
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only, in the tests and in the actions they call. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 15 | 0 | 0 |
| `02-harden` (hardening dry-run) | 45 | 0 | 0 |
| `03-eval` (final) | 15 | 0 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md) · contract: [requirement-contract.md](requirement-contract.md)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Actions: actions/practicesoftwaretesting/
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/03-eval/triage.md](runs/03-eval/triage.md) · JUnit: runs/03-eval/junit.xml
- HTML report: `npx playwright show-report output/practicesoftwaretesting/TOOL-4/runs/03-eval/html`
