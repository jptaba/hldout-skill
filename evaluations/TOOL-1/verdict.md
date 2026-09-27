# Held-out Evaluation Verdict — TOOL-1

> **Verdict: ❌ FAIL** — 2 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-6, AC-7. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [TOOL-1](https://your-domain.atlassian.net/browse/TOOL-1) — Catalogue search, sorting and category filter |
| Application under test | Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) — UI https://practicesoftwaretesting.com · API https://api.practicesoftwaretesting.com |
| Final run | `04-eval` · 2026-09-26T22:36:26.231Z · 25s |
| Tests | 8 total · 6 passed · 2 failed · 0 flaky · 0 skipped (from 8 scenarios) |
| Held-out integrity | ✅ PRESERVED — 13 requirement assertions identical to the pre-hardening draft |
| Hardening | see hardening log |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-26T22:36:56.504Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-7 | functional | An empty search returns no products instead of all | SCN-008 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Minor | AC-6 | boundary | Catalogue pages hold 9 products, not 12 | SCN-007 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (2 root cause(s), 2 failing test(s))

### APP-1 · SCN-008 · AC-7 — An empty search returns no products instead of all

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-7 | An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. |
| Requirement source | story.md#L29 |
| Test type · layer | functional · api |
| SCN-008: expected (requirement) → actual (AUT) | `50` → `0` |
| Failing step | Then its total equals the total of GET /products |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (scenario steps):**

1. When I GET /products/search with an empty q
2. Then its total equals the total of GET /products

**Via the API: SCN-008** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 2 (⟵) is the one that contradicts the requirement:

1. `GET /products/search → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products/search?q='
   ```

2. `GET /products → 200` ⟵

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products'
   ```

Observed response of request 2 (SCN-008):

```json
{"current_page":1,"data":[{"id":"01M3FVQJG6E2QF0114BDA47REV","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold e…
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts TOOL-1 --label repro --grep "SCN-008:"
```

#### Evidence

- [Page/test context at failure](runs/04-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-3775a-search-returns-all-products-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/TOOL-1/runs/04-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-3775a-search-returns-all-products-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/TOOL-1/runs/03-eval/confirm/SCN-007-008-api.md

**Evaluator's analysis:** Reproduced live: GET /products/search?q= and GET /products/search both return total 0 while GET /products has total 50. AC-7: an empty search returns all products (G5/G6 assumptions recorded). (Confirmed in run 03-eval; identical failure signature in 04-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-007 · AC-6 — Catalogue pages hold 9 products, not 12

| | |
| --- | --- |
| Suggested severity | Minor |
| Requirement AC-6 | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. |
| Requirement source | story.md#L28 |
| Test type · layer | boundary · e2e |
| SCN-007: expected (requirement) → actual (AUT) | `12` → `9` |
| SCN-007: also failed | [REQ AC-6] API per_page — `12` → `9` |
| Failing step | Then the first page shows 12 products |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (scenario steps):**

1. Given I am on the web shop catalogue
2. Then the first page shows 12 products
3. And GET /products reports per_page 12

**Via the API: SCN-007** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /products → 200` ⟵

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products'
   ```

Observed response of request 1 (SCN-007):

```json
{"current_page":1,"data":[{"id":"01M3FVQJG6E2QF0114BDA47REV","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges, these pliers deliver excellent grip and leverage for a wide range of tasks. The precision-machined jaws combine flat gripping surfaces with a pipe-grip section and integrated wire cutter for true multi-purpose functionality. Ergonomic bi-component handles reduce hand fatigue during extended use and provide a secure hold e…
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts TOOL-1 --label repro --grep "SCN-007:"
```

#### Evidence

- [Page/test context at failure](runs/04-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-8eab2--007-Pages-hold-12-products-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/TOOL-1/runs/04-eval/artifacts/TOOL-1-tests-tool-1-TOOL-1-8eab2--007-Pages-hold-12-products-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/TOOL-1/runs/03-eval/confirm/SCN-007-008-api.md; evaluations/TOOL-1/runs/03-eval/confirm/SCN-007-ui.md

**Evaluator's analysis:** Reproduced live: the web shop's first page shows 9 product cards and GET /products reports per_page 9 (data.length 9). AC-6 requires 12 per page on both. (Confirmed in run 03-eval; identical failure signature in 04-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (1)

| Found in run | Test | Symptom | Diagnosis | Fix applied | Final run |
| --- | --- | --- | --- | --- | --- |
| `03-eval` | SCN-001 | [REQ AC-1] search caption | The caption "Searched for: pliers" is shown (data-test search-caption, see hardening/inspect-noresults.md); the test looked for data-test search-title, which does not exist. Mechanics only. | Use the caption's real test id (search-caption); the expected text is unchanged. | ✅ passed |

## Draft re-freezes (audited)

The frozen draft was re-created after its first freeze, for example after a requirement revision. Each re-freeze has a logged reason; the previous draft is archived.

| When | Reason | REQ changes absorbed | Previous draft |
| --- | --- | --- | --- |
| 2026-09-26T22:33:50.381Z | Requirement contract rebuilt with the model-driven intake (schema v2: extractor subagent + independent review) before any evaluation run; the frozen contract oracle is replaced. REQ assertions unchanged; hardening mechanics (search wait, card locator) absorbed. | none | hardening/draft-history/2026-09-26T22-33-50-378Z |

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | Searching the web shop shows only matching products and a caption | AC-1 | functional | ✅ passed | - |
| SCN-002 | The search API returns only matching products | AC-2 | functional | ✅ passed | - |
| SCN-003 | The search API ignores letter case | AC-2 | functional | ✅ passed | - |
| SCN-004 | A search without matches says so on the web shop and in the API | AC-3 | negative | ✅ passed | - |
| SCN-005 | Sorting by price, low to high | AC-4 | functional | ✅ passed | - |
| SCN-006 | Filtering by the category "Hammer" | AC-5 | functional | ✅ passed | - |
| SCN-007 | Pages hold 12 products | AC-6 | boundary | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-008 | An empty search returns all products | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-1 |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>". | SCN-001 | ✅ met |
| AC-2 | GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers"). | SCN-002, SCN-003 | ✅ met |
| AC-3 | A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0. | SCN-004 | ✅ met |
| AC-4 | Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order. | SCN-005 | ✅ met |
| AC-5 | Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category. | SCN-006 | ✅ met |
| AC-6 | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. | SCN-007 | ❌ not met |
| AC-7 | An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. | SCN-008 | ❌ not met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L23 | SCN-001 Searching the web shop shows only matching products and a caption | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L24 | SCN-002 The search API returns only matching products | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L24 | SCN-003 The search API ignores letter case | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L25 | SCN-004 A search without matches says so on the web shop and in the API | negative | e2e | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L26 | SCN-005 Sorting by price, low to high | functional | e2e | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L27 | SCN-006 Filtering by the category "Hammer" | functional | e2e | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L28 | SCN-007 Pages hold 12 products | boundary | e2e | 0/1 | ❌ fails requirement | APP-2 |
| **AC-7** | story.md#L29 | SCN-008 An empty search returns all products | functional | api | 0/1 | ❌ fails requirement | APP-1 |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 1 | 1 | 0 | 1 | 0 | APP-2 |
| functional | 6 | 6 | 5 | 1 | 0 | APP-1 |
| negative | 1 | 1 | 1 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | API origin of the public catalogue API and origin of the web shop | how to exercise | * | project configuration: API https://api.practicesoftwaretesting.com; web shop https://practicesoftwaretesting.com |
| G2 | where the web shop catalogue lives and how its search, caption, no-results message, sort control, category filter and product cards are identified | how to exercise | AC-1, AC-3, AC-4, AC-5, AC-6 | discovered from the AUT (mechanics only): home page / — search-query + search-submit, search-caption, no-results, sort combobox, category checkboxes by name, product cards (links /product/<id>) with product-name / product-price |
| G3 | id of the "Hammer" category for GET /products?by_category=<id of Hammer> | how to exercise | AC-5 | found elsewhere in the requirement: look up the category named Hammer in GET /categories/tree at run time and use its id |
| G4 | how to observe which category a product belongs to (API products; products shown in the web shop, whose cards show no category) | how to exercise | AC-5 | discovered from the AUT (mechanics only): API: each product's category.id / category.name; web shop: take the product id from each card link /product/<id> and read that product's category via GET /products/{id} |
| G5 | how to send "an empty search (no term)" to the search endpoint: q present but empty, or q omitted | how to exercise | AC-7 | assumed: GET /products/search?q= (q present with an empty value) — the literal reading of "empty search"; q omitted is the alternative reading |
| G6 | what observably counts as "returns all products" for an empty search | expected behaviour | AC-7 | assumed: the empty search's total equals the total of the unfiltered catalogue list GET /products (same run) |
| G7 | whether the web shop's "name contains the term" (AC-1) ignores letter case | expected behaviour | AC-1 | found elsewhere in the requirement: letter case is ignored when checking that a product name contains the term |

**Assumptions the evaluation made:**

- G5 — "an empty search (no term)" is sent as GET /products/search?q= (q present, empty).
- G6 — "returns all products" means the empty search's total equals the total of the unfiltered GET /products in the same run.
- The category id for "Hammer" is looked up from GET /categories/tree at run time (pre-step, contract G3); "only hammers" on the web shop is checked against the API's Hammer products.

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 5 | 3 | 0 |
| `02-harden` (hardening dry-run) | 9 | 7 | 0 |
| `03-eval` | 5 | 3 | 0 |
| `04-eval` (final) | 6 | 2 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/04-eval/triage.md](runs/04-eval/triage.md) · JUnit: runs/04-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/TOOL-1/runs/04-eval/html`
