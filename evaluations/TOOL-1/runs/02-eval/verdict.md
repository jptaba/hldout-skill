# Held-out Evaluation Verdict — TOOL-1

> **Verdict: ❌ FAIL** — 1 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-6. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [TOOL-1](https://your-domain.atlassian.net/browse/TOOL-1) — Catalogue search, sorting and category filter |
| Application under test | Practice Software Testing (profile `practicesoftwaretesting`) — UI https://practicesoftwaretesting.com/ · API https://api.practicesoftwaretesting.com/ |
| Final run | `02-eval` · 2026-09-29T22:05:32.365Z · 28s |
| Tests | 14 total · 10 passed · 4 failed · 0 flaky · 0 skipped (from 13 scenarios) |
| Held-out integrity | ✅ PRESERVED — 25 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (bundled heldout inspect with steps files and locator probes, heldout api-probe), after one tier-2 navigation. |
| App knowledge | tests written blind; consulted after the freeze: 92 entries (0 proven, 92 seen, 0 stale) · 17 recorded for later stories |
| Evaluator | Opus (blind round r22) |
| Generated | 2026-09-29T22:07:12.862Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-6 | functional, contract | Catalogue pages hold 9 products, not 12 | SCN-010, SCN-011 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (1 root cause(s), 2 failing test(s))

### APP-1 · SCN-010, SCN-011 · AC-6 — Catalogue pages hold 9 products, not 12

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. |
| Requirement source | story.md#L29 (AC-6, web shop) |
| Test type · layer | functional, contract · ui |
| SCN-010: expected (requirement) → actual (AUT) | `12` → `9` |
| SCN-011: expected (requirement) → actual (AUT) | `12` → `9` |
| SCN-011: also failed | [REQ AC-6] GET /products/search per_page 12 — `12` → `9` |
| SCN-011: also failed | [REQ AC-6] GET /products page 1 holds 12 products — `12` → `9` |
| Failing step | Then page 1 shows 12 products |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (scenario steps):**

1. Given I am on the web shop catalogue
2. Then page 1 shows 12 products
3. And a further page of results can be opened

**Via the API: SCN-011** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /products → 200` ⟵

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products'
   ```

2. `GET /products/search → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products/search?q=pliers'
   ```

Observed response of request 1 (SCN-011):

```json
{"current_page":1,"data":[{"id":"01M3QJXQFBJC3M2NF6FXJT54CK","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold e…
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run TOOL-1 --label repro --grep "SCN-010:"
npm run heldout -- run TOOL-1 --label repro --grep "SCN-011:"
```

#### Evidence

![SCN-010 at the moment of failure](../../runs/02-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-5a4d7--shows-12-products-per-page-chromium-retry1/test-failed-1.png)

- [Page/test context at failure](../../runs/02-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-5a4d7--shows-12-products-per-page-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/TOOL-1/runs/02-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-5a4d7--shows-12-products-per-page-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-29 (tier 3, heldout inspect): runs/02-eval/confirm/webshop-page1.md — getByTestId('product-name') count 9; also runs 01-harden (x3) and 02-eval

**Evaluator's analysis:** AC-6 states 12 products per page on the web shop. The unfiltered catalogue (50 products per the API total) shows 9 product cards on page 1, with pagination to Page-5; the list rendered fully (readiness anchor seen) and the locator counts every card.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A shopper searches the web shop for "pliers" and sees only matching products with the caption | AC-1 | functional | ✅ passed | - |
| SCN-002 | The search API returns only products whose name contains the term | AC-2 | functional | ✅ passed | - |
| SCN-003 | The search API ignores letter case | AC-2 | functional | ✅ passed | - |
| SCN-004 | A web shop search without matches says there are no products | AC-3 | negative | ✅ passed | - |
| SCN-005 | The search API answers a search without matches with an empty list | AC-3 | negative | ✅ passed | - |
| SCN-006 | Sorting the web shop by "Price (Low - High)" lists products by ascending price | AC-4 | functional | ✅ passed | - |
| SCN-007 | GET /products?sort=price,asc returns products in ascending price order | AC-4 | functional | ✅ passed | - |
| SCN-008 | Filtering the web shop by the category "Hammer" shows only hammers | AC-5 | functional | ✅ passed | - |
| SCN-009 | GET /products?by_category=<id of Hammer> returns only hammers | AC-5 | functional | ✅ passed | - |
| SCN-010 | The web shop shows 12 products per page | AC-6 | functional | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-011 | The catalogue API pages its answers with 12 products per page | AC-6 | contract | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-012.1 | An empty search returns all products (q omitted) | AC-7 | functional | ❌ failed | APPLICATION_DEFECT |
| SCN-012.2 | An empty search returns all products (q empty ("")) | AC-7 | functional | ❌ failed | APPLICATION_DEFECT |
| SCN-013 | The web shop and the search API find the same products | AC-1, AC-2 | integration | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>". | SCN-001, SCN-013 | ✅ met |
| AC-2 | GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers"). | SCN-002, SCN-003, SCN-013 | ✅ met |
| AC-3 | A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0. | SCN-004, SCN-005 | ✅ met |
| AC-4 | Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order. | SCN-006, SCN-007 | ✅ met |
| AC-5 | Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category. | SCN-008, SCN-009 | ✅ met |
| AC-6 | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. | SCN-010, SCN-011 | ❌ not met |
| AC-7 | An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. | SCN-012.1, SCN-012.2 | ❌ not met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L24 (AC-1) | SCN-001 A shopper searches the web shop for "pliers" and sees only matching products with the caption | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L18 (R1), story.md#L24-L25 (AC-1, AC-2) | SCN-013 The web shop and the search API find the same products | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L25 (AC-2) | SCN-002 The search API returns only products whose name contains the term | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L25 (AC-2, "searching "PLIERS" finds the same products as "pliers"") | SCN-003 The search API ignores letter case | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L18 (R1), story.md#L24-L25 (AC-1, AC-2) | SCN-013 The web shop and the search API find the same products | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L26 (AC-3, web shop) | SCN-004 A web shop search without matches says there are no products | negative | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L26 (AC-3, API) | SCN-005 The search API answers a search without matches with an empty list | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L27 (AC-4, web shop) | SCN-006 Sorting the web shop by "Price (Low - High)" lists products by ascending price | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L27 (AC-4, API) | SCN-007 GET /products?sort=price,asc returns products in ascending price order | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L28 (AC-5, web shop), story.md#L34 (R3) | SCN-008 Filtering the web shop by the category "Hammer" shows only hammers | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L28 (AC-5, API), story.md#L34 (R3) | SCN-009 GET /products?by_category=<id of Hammer> returns only hammers | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L29 (AC-6, web shop) | SCN-010 The web shop shows 12 products per page | functional | ui | 0/1 | ❌ fails requirement | APP-1 |
| ↳ | story.md#L29 (AC-6, API), story.md#L20 (R2) | SCN-011 The catalogue API pages its answers with 12 products per page | contract | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-7** | story.md#L30 (AC-7) — literal reading of the open question G4 | SCN-012 An empty search returns all products | functional | api | 0/2 | ❔ inconclusive | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| contract | 1 | 1 | 0 | 1 | 0 | APP-1 |
| functional | 9 | 10 | 7 | 3 | 0 | APP-1 |
| integration | 1 | 1 | 1 | 0 | 0 | - |
| negative | 2 | 2 | 2 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | web shop catalogue page: its route and how the search box, the search caption, the product cards (name, price), the sort control, the category filter, the no-results message and the pagination are found | how to exercise | AC-1, AC-3, AC-4, AC-5, AC-6 | discovered from the AUT (mechanics only): The catalogue is the start page (/), ready when getByTestId('product-name') shows; search: getByTestId('search-query') + getByTestId('search-submit'); caption getByTestId('search-caption'); cards: getByTestId('product-name') / getByTestId('product-price'); sort: getByTestId('sort') (select); category filter: getByRole('checkbox', { name: 'Hammer', exact: true }); no-results box getByTestId('no-results'); pagination buttons Page-1..Page-n, pagination-next |
| G2 | API product fields: where a product's name, price and category are in the items of data | how to exercise | AC-2, AC-4, AC-5 | discovered from the AUT (mechanics only): data[] items: id (string), name (string), price (number), category { id, name, slug } |
| G3 | how the id of the category "Hammer" is read from the GET /categories/tree answer (structure, name and id fields) | how to exercise | AC-5 | discovered from the AUT (mechanics only): GET /categories/tree answers an array of { id, name, slug, parent_id, sub_categories[] }; Hammer is a sub-category of Hand Tools; walk sub_categories and read id where name == 'Hammer' |
| G4 | AC-7 empty search: does "no term" mean q omitted, q empty, or both; what status is expected (not stated); and is "all products" judged as total equal to the unfiltered GET /products total? | expected behaviour | AC-7 | ❓ open |

**For the owner's information** (questions the criteria can be judged without, as the review confirmed; they don't affect the verdict):

- ℹ️ G4 — AC-7 empty search: does "no term" mean q omitted, q empty, or both; what status is expected (not stated); and is "all products" judged as total equal to the unfiltered GET /products total? Tested literally below (@needs-clarification): both readings, "all products" as the same total as unfiltered GET /products; no status is asserted.

**Scenarios needing clarification** (each tests the literal reading of an open question):

- SCN-012: An empty search returns all products — passed: the application meets the literal reading

**Assumptions the evaluation made:**

- The catalogue is reference data (products and categories are read-only for a shopper): the tests create nothing and read the existing catalogue. The story's own example term "pliers" is taken to match at least one product (checked as a precondition, not a requirement).
- "name contains the term" on the web shop is compared ignoring letter case, like the API (AC-2), because R1 says the web shop and the API must behave the same way.
- "only products whose name contains the term" and "only products in that category" are checked on every page of the API answer (all pages up to last_page); on the web shop, on the first page of results.
- "ascending price order" is checked within page 1 and across the page 1 / page 2 boundary (non-decreasing prices; equal prices allowed).
- "shows only hammers" on the web shop is judged by each shown product's category, read from the unfiltered GET /products listing (every page), so the web shop check does not rely on the by_category filter under test.
- AC-6 "12 products per page" is checked on a listing with more than 12 results (the unfiltered catalogue): page 1 holds exactly 12 products and a further page exists.

**Readings the application contradicts** (the requirement does not settle these: an assumed value, or the literal reading of an open question; not reported as defects, the owner decides):

| Test | Rests on | Expected (by that reading) | Actual |
| --- | --- | --- | --- |
| SCN-012.1 | G4 (literal reading) | 50 | 0 |
| SCN-012.2 | G4 (literal reading) | 50 | 0 |

Full review: [requirement-review.md](../../requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above). App knowledge from earlier stories (how to reach pages and call endpoints, never what the application answers) is available only after the freeze.
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 30 | 12 | 0 |
| `02-eval` (final) | 10 | 4 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Requirement review: [requirement-review.md](../../requirement-review.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/02-eval/triage.md](../../runs/02-eval/triage.md) · JUnit: runs/02-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/TOOL-1/runs/02-eval/html`
