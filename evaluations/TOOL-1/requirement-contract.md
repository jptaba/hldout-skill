# Requirement contract — TOOL-1: Catalogue search, sorting and category filter

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-29T21:53

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | description, catalogue API, acceptance criteria 1-7, notes |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>". | every product shown has a name that contains the term; caption "Searched for: <term>" | story.md#L24 |
| AC-2 | api | GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers"). | 200; every product in data has a name that contains the term, regardless of letter case; searching "PLIERS" finds the same products as "pliers" | story.md#L25 |
| AC-3 | e2e | A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0. | web shop shows "There are no products found."; API: 200; API: data is an empty list; API: total 0 | story.md#L26 |
| AC-4 | e2e | Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order. | web shop: after choosing "Price (Low - High)" the products are listed by ascending price; API: GET /products?sort=price,asc returns the products in ascending price order | story.md#L27 |
| AC-5 | e2e | Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category. | web shop: filtering by the category "Hammer" shows only hammers; API: GET /products?by_category=<id of Hammer> returns only products in the category "Hammer" | story.md#L28 |
| AC-6 | e2e | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. | web shop: results are paginated with 12 products per page; API: per_page 12 | story.md#L29 |
| AC-7 | api | An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. | a search with no term returns all products | story.md#L30 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /products | none | { current_page, data: [products], per_page, total, last_page } | story.md#L20 |
| GET /products/search | none | 200 { current_page, data: [products], per_page, total, last_page } | story.md#L20 |
| GET /categories/tree |  |  | story.md#L34 |

## Rules and boundaries

- **R1** The web shop and the public catalogue API (used by the mobile app) must behave the same way. _(story.md#L18)_
- **R2** GET /products and GET /products/search both return { "current_page", "data": [products], "per_page", "total", "last_page" }. _(story.md#L20)_
- **R3** Category ids come from GET /categories/tree. _(story.md#L34)_

## Test data

not stated in the sources; the criteria only read the existing catalogue
- the catalogue already contains products, including the category "Hammer" (story.md#L28)
- AC-2 uses the example term "pliers" / "PLIERS" (story.md#L25)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | web shop catalogue page: its route and how the search box, the search caption, the product cards (name, price), the sort control, the category filter, the no-results message and the pagination are found | mechanics | yes | AC-1, AC-3, AC-4, AC-5, AC-6 | story → config → aut | discovered-in-aut: The catalogue is the start page (/), ready when getByTestId('product-name') shows; search: getByTestId('search-query') + getByTestId('search-submit'); caption getByTestId('search-caption'); cards: getByTestId('product-name') / getByTestId('product-price'); sort: getByTestId('sort') (select); category filter: getByRole('checkbox', { name: 'Hammer', exact: true }); no-results box getByTestId('no-results'); pagination buttons Page-1..Page-n, pagination-next |
| G2 | API product fields: where a product's name, price and category are in the items of data | mechanics | yes | AC-2, AC-4, AC-5 | story → aut | discovered-in-aut: data[] items: id (string), name (string), price (number), category { id, name, slug } |
| G3 | how the id of the category "Hammer" is read from the GET /categories/tree answer (structure, name and id fields) | mechanics | yes | AC-5 | story → aut | discovered-in-aut: GET /categories/tree answers an array of { id, name, slug, parent_id, sub_categories[] }; Hammer is a sub-category of Hand Tools; walk sub_categories and read id where name == 'Hammer' |
| G4 | AC-7 empty search: does "no term" mean q omitted, q empty, or both; what status is expected (not stated); and is "all products" judged as total equal to the unfiltered GET /products total? | oracle | no | AC-7 | story → user | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context |  |
| story.md#L18 | R1, context |  |
| story.md#L20 | endpoint, R2 |  |
| story.md#L24 | AC-1 |  |
| story.md#L25 | AC-2 |  |
| story.md#L26 | AC-3 |  |
| story.md#L27 | AC-4 |  |
| story.md#L28 | AC-5 |  |
| story.md#L29 | AC-6 |  |
| story.md#L30 | AC-7, G4 |  |
| story.md#L34 | endpoint, R3 |  |
| story.md#L35 | out-of-scope |  |
