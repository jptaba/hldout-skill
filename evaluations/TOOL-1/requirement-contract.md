# Requirement contract — TOOL-1: Catalogue search, sorting and category filter

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-26T22:32

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | context and parity requirement (L17), catalogue API endpoints, parameters and response envelope (L19), AC-1…AC-7 (L23-L29), category ids from GET /categories/tree (L33), out of scope (L34). No attachments. |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>". | every product shown has a name that contains the term (letter case ignored, G7); caption "Searched for: <term>" is shown | story.md#L23 |
| AC-2 | api | GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers"). | returns 200; every product in data has a name that contains the term (letter case ignored); searching "PLIERS" finds the same products as "pliers" | story.md#L24 |
| AC-3 | e2e | A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0. | web shop shows "There are no products found."; API returns 200; API data list is empty; API total is 0 | story.md#L25 |
| AC-4 | e2e | Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order. | after choosing "Price (Low - High)" the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order | story.md#L26 |
| AC-5 | e2e | Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category. | with the "Hammer" filter the web shop shows only hammers (every product shown is in the "Hammer" category, G4); GET /products?by_category=<id of Hammer> returns only products in that category | story.md#L27 |
| AC-6 | e2e | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. | the web shop shows 12 products per page (when more than 12 products exist); API responses carry per_page 12; API data holds 12 products on a full page | story.md#L28 |
| AC-7 | api | An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. | a search with no term returns all products (total equals the total of the unfiltered catalogue list GET /products, G6) | story.md#L29 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /products | none | { current_page, data: [products], per_page, total, last_page } | story.md#L19 |
| GET /products/search | none | { current_page, data: [products], per_page, total, last_page } | story.md#L19 |
| GET /categories/tree | none | category tree (source of category ids) | story.md#L33 |
| GET /products/{id} | none | one product, including its category (id, name) | G4 |

## Rules and boundaries

- **R1** GET /products and GET /products/search both return { current_page, data: [products], per_page, total, last_page } _(story.md#L19)_
- **R2** GET /products lists products, takes sort and by_category parameters and is paginated; GET /products/search?q=<term> searches _(story.md#L19)_
- **R3** The web shop and the public catalogue API must behave the same way _(story.md#L17)_
- **R4** Category ids come from GET /categories/tree _(story.md#L33)_

## Authentication

none: public catalogue API and public web shop (no sign-in needed) _(story.md#L17)_

## Test data

None created: every test only reads the existing catalogue. Search terms come from the story ("pliers" / "PLIERS"); the no-match search uses a random nonsense term unique to the run; the Hammer category id is looked up at run time from GET /categories/tree.
- the catalogue is a shared sandbox: other users' data exists, so never hard-code product names, counts or totals
- compare web shop and API (and search vs list totals) within the same run
- read-only: nothing is created, updated or deleted
- Cleanup: none needed (read-only)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | API origin of the public catalogue API and origin of the web shop | mechanics | yes | * | story → config | found-in-config: API https://api.practicesoftwaretesting.com; web shop https://practicesoftwaretesting.com |
| G2 | where the web shop catalogue lives and how its search, caption, no-results message, sort control, category filter and product cards are identified | mechanics | yes | AC-1, AC-3, AC-4, AC-5, AC-6 | story → attachments → aut | discovered-in-aut: home page / — search-query + search-submit, search-caption, no-results, sort combobox, category checkboxes by name, product cards (links /product/<id>) with product-name / product-price |
| G3 | id of the "Hammer" category for GET /products?by_category=<id of Hammer> | mechanics | yes | AC-5 | story | found-in-requirement: look up the category named Hammer in GET /categories/tree at run time and use its id |
| G4 | how to observe which category a product belongs to (API products; products shown in the web shop, whose cards show no category) | mechanics | yes | AC-5 | story → attachments → aut | discovered-in-aut: API: each product's category.id / category.name; web shop: take the product id from each card link /product/<id> and read that product's category via GET /products/{id} |
| G5 | how to send "an empty search (no term)" to the search endpoint: q present but empty, or q omitted | mechanics | yes | AC-7 | story → attachments → user | assumed: GET /products/search?q= (q present with an empty value) — the literal reading of "empty search"; q omitted is the alternative reading |
| G6 | what observably counts as "returns all products" for an empty search | oracle | yes | AC-7 | story → attachments → user | assumed: the empty search's total equals the total of the unfiltered catalogue list GET /products (same run) |
| G7 | whether the web shop's "name contains the term" (AC-1) ignores letter case | oracle | yes | AC-1 | story | found-in-requirement: letter case is ignored when checking that a product name contains the term |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context R3 G7 | user story (context) plus the web shop / API parity requirement |
| story.md#L19 | endpoint R1 R2 | GET /products and GET /products/search, their parameters and response envelope |
| story.md#L23 | AC-1 |  |
| story.md#L24 | AC-2 |  |
| story.md#L25 | AC-3 |  |
| story.md#L26 | AC-4 |  |
| story.md#L27 | AC-5 |  |
| story.md#L28 | AC-6 |  |
| story.md#L29 | AC-7 |  |
| story.md#L33 | R4 G3 endpoint | GET /categories/tree is the source of category ids |
| story.md#L34 | out-of-scope | product detail pages, brands filter |
