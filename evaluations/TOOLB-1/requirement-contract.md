# Requirement contract — TOOLB-1: Release-candidate check — catalogue search, sorting and category filter

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-26T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | all criteria (L25-L31), API endpoints and response shape (L21), category lookup (L35), scope (L19, L36) |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>". | every product shown has a name that contains the term (matched regardless of letter case, per G7); caption "Searched for: <term>" is shown with the searched term | story.md#L25 |
| AC-2 | api | GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers"). | returns 200; every product in data has a name that contains the term, ignoring letter case; searching "PLIERS" finds the same products as "pliers" | story.md#L26 |
| AC-3 | e2e | A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0. | web shop shows "There are no products found."; API returns 200; API data is an empty list; API total is 0 | story.md#L27 |
| AC-4 | e2e | Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order. | after choosing "Price (Low - High)" the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order | story.md#L28 |
| AC-5 | e2e | Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category. | after filtering the web shop by the category "Hammer" only hammers are shown; GET /products?by_category=<id of Hammer> returns only products in the category "Hammer" | story.md#L29 |
| AC-6 | e2e | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. | API responses report per_page 12; an API page holds at most 12 products in data, and exactly 12 when it is not the last page; a web shop results page shows at most 12 products, and exactly 12 when it is not the last page | story.md#L30 |
| AC-7 | api | An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. | an empty search on the search endpoint returns all products: its total equals the total of GET /products without filters | story.md#L31 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /products | none | { current_page, data: [products], per_page, total, last_page } | story.md#L21 |
| GET /products/search | none | { current_page, data: [products], per_page, total, last_page } | story.md#L21 |
| GET /categories/tree | none |  | story.md#L35 |

## Rules and boundaries

- **R1** The web shop and the public catalogue API (used by our mobile app) must behave the same way. _(story.md#L19)_
- **R2** GET /products and GET /products/search both return { "current_page", "data": [products], "per_page", "total", "last_page" }; GET /products is paginated. _(story.md#L21)_

## Authentication

none: the story calls it the public catalogue API _(story.md#L19)_

## Test data

none needed: read-only checks against the existing catalogue of the release-candidate environment
- search terms PLIERS / pliers for the case-insensitivity check (story.md#L26)
- a search term that matches no product for AC-3 (story.md#L27), chosen by the evaluator, e.g. a random string
- the category Hammer, whose id is looked up in GET /categories/tree (story.md#L29, story.md#L35)
- Cleanup: none (nothing is created)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | the release-candidate environment the checks run on (L17 names it but gives no URL) | mechanics | yes | * | story → config | found-in-config: AUT profile toolshop-rc (web shop https://with-bugs.practicesoftwaretesting.com, API https://api-with-bugs.practicesoftwaretesting.com) |
| G2 | web shop controls: the search field and submit, the sort control, the category filter and the pagination control (the story gives only the labels "Price (Low - High)" and "Hammer") | mechanics | no | AC-1, AC-3, AC-4, AC-5, AC-6 | story | open |
| G3 | the id of the category Hammer used in GET /products?by_category=<id of Hammer> | mechanics | yes | AC-5 | story | found-in-requirement: look up the id of the category named Hammer in the GET /categories/tree response at run time |
| G4 | how a product's category shows in the product data (web shop and API), needed to check "only hammers" / "only products in that category" | mechanics | no | AC-5 | story | open |
| G5 | what request an "empty search (no term)" is on the search endpoint: q present but empty, or q omitted | oracle | yes | AC-7 | story | assumed: an empty search is GET /products/search?q= (q present with an empty term); the variant with q omitted is not asserted |
| G6 | HTTP status for an empty search (AC-7 says it "returns all products" but states no status) | oracle | no | AC-7 | story | open |
| G7 | whether "name contains the term" on the web shop ignores letter case (AC-1 does not say; AC-2 says so for the API) | oracle | no | AC-1 | story | found-in-requirement: the web shop matches regardless of letter case, like the API |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context, G1 | The criteria said to be the same as TOOL-1 are restated in full at L25-L31 and are taken from there; TOOL-1 itself is not a source. The release-candidate environment is resolved from config in G1. |
| story.md#L19 | R1, G7, auth, context | User-story sentence is context; 'must behave the same way' is R1; 'public catalogue API' grounds auth none |
| story.md#L21 | endpoint, R2 |  |
| story.md#L25 | AC-1 |  |
| story.md#L26 | AC-2 |  |
| story.md#L27 | AC-3 |  |
| story.md#L28 | AC-4 |  |
| story.md#L29 | AC-5 |  |
| story.md#L30 | AC-6 |  |
| story.md#L31 | AC-7, G5, G6 |  |
| story.md#L35 | endpoint, G3 |  |
| story.md#L36 | out-of-scope |  |
