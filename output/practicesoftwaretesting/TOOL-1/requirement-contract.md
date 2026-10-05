# Requirement contract — TOOL-1: Catalogue search, sorting and category filter

_Built by the evaluator from the story (title, description, acceptance criteria), the images they show and the pages they link. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5.5), 2026-10-05T01:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, rule that web shop and API behave the same, catalogue API endpoints and response shape, AC 1-7, category-id note, out of scope |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>". | every product shown has a name that contains the searched term, regardless of letter case (G6, provided by the user); caption "Searched for: <term>" is shown | story.md#L23 |
| AC-2 | api | GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers"). | GET /products/search?q=<term> returns 200; every product in data has a name that contains the term, regardless of letter case; searching "PLIERS" finds the same products as "pliers" | story.md#L24 |
| AC-3 | e2e | A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0. | web shop: a search without matches shows "There are no products found."; API: GET /products/search with a term without matches returns 200; API: data is an empty list; API: total is 0 | story.md#L25 |
| AC-4 | e2e | Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order. | web shop: after choosing "Price (Low - High)" the products are listed by ascending price; API: GET /products?sort=price,asc returns 200 (G3, provided by the user); API: GET /products?sort=price,asc returns the products in ascending price order | story.md#L26 |
| AC-5 | e2e | Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category. | web shop: filtering by the category "Hammer" shows only hammers (products in the Hammer category); API: GET /products?by_category=<id of Hammer> returns 200 (G3, provided by the user); API: GET /products?by_category=<id of Hammer> returns only products in the Hammer category | story.md#L27 |
| AC-6 | e2e | Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. | web shop: a full page of results shows 12 products; API: GET /products returns 200 (G3, provided by the user); API: the response has per_page 12; API: a full page holds 12 products in data | story.md#L28 |
| AC-7 | api | An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. | GET /products/search?q= (q with no value, G5) returns 200 (G3); the answer is a normal paginated answer whose total equals the whole catalogue, the same total as GET /products (G4, provided by the user) | story.md#L29 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /products | none | { "current_page", "data": [products], "per_page", "total", "last_page" } (paginated); 200 per G3 (provided by the user) | story.md#L20 |
| GET /products/search | none | 200 { "current_page", "data": [products], "per_page", "total", "last_page" } | story.md#L20 |
| GET /categories/tree |  |  | story.md#L32 |

## Rules and boundaries

- **R1** The web shop and the public catalogue API (used by our mobile app) must behave the same way. _(story.md#L18)_
- **R2** Category ids come from GET /categories/tree. _(story.md#L32)_

## Test data

not stated in the sources; the criteria only read the existing catalogue
- the catalogue has a category "Hammer" (story.md#L27)
- the catalogue has products found by searching "pliers" (story.md#L24)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | web shop catalogue page: its route and how the search field, the search caption, the no-results message, the sort control, the category filter, the product cards (name, price) and the page of results are found | mechanics | yes | AC-1, AC-3, AC-4, AC-5, AC-6 | story → config → aut | discovered-in-aut: Catalogue page is the site root '/'; search field getByTestId('search-query'), submit getByTestId('search-submit'); caption getByTestId('search-caption') (text 'Searched for: <term>'); no-results getByTestId('no-results'); sort control getByTestId('sort') (select, options by label); category filter getByRole('checkbox', { name: <category>, exact: true }); product cards a.card[data-test^='product-'] with getByTestId('product-name') and getByTestId('product-price') ('$14.15'); the page loads lists with HTTP QUERY /products and QUERY /products/search; page of results via pagination-next/prev, API ?page=N |
| G2 | where the id of the category "Hammer" is in the GET /categories/tree answer (nesting, field names), and how a product's category is seen in the product data and on the web shop to check "only hammers" | mechanics | yes | AC-5 | story → aut | discovered-in-aut: GET /categories/tree answers a JSON array of top-level nodes {id, name, slug, parent_id, sub_categories:[nodes]}; 'Hammer' is a sub-category of 'Hand Tools' (id 01M44NSB700A1N91T5WRW6YVJH, a string ULID). A product's category is the nested object category {id, name, slug} in the product data; on the web shop the card shows no category, so 'only hammers' is checked against the API's products whose category.id is the Hammer id |
| G3 | exact success status of GET /products (sort, by_category, pagination) and of the empty search: the story states 200 only for GET /products/search with a term (AC-2, AC-3) | oracle | no | AC-4, AC-5, AC-6, AC-7 | story → user | provided-by-user: GET /products (sort, filter, pagination) and the empty search return 200 |
| G4 | what "returns all products" means for an empty search given that results are paginated (AC-6): a paginated answer whose total equals the whole catalogue (the total of GET /products), or every product in one answer? Proposed reading: paginated, total equals the catalogue total | oracle | yes | AC-7 | story → user | provided-by-user: a normal paginated answer whose total equals the whole catalogue (the same total as GET /products) |
| G5 | what counts as an empty search (no term): q present but empty, q left out, or both must return all products | oracle | no | AC-7 | story → user | provided-by-user: an empty search is the search endpoint called with q= with no value |
| G6 | whether the web shop search must also ignore letter case: AC-2 states it for the API only, while story.md#L18 says the web shop and the API must behave the same way | oracle | no | AC-1 | story → user | provided-by-user: yes, the web shop search must also ignore letter case, like the API (R1) |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context |  |
| story.md#L18 | R1, endpoint | also states the catalogue API is public (auth none) |
| story.md#L20 | endpoint |  |
| story.md#L23 | AC-1 |  |
| story.md#L24 | AC-2 |  |
| story.md#L25 | AC-3 |  |
| story.md#L26 | AC-4 |  |
| story.md#L27 | AC-5 |  |
| story.md#L28 | AC-6 |  |
| story.md#L29 | AC-7 |  |
| story.md#L32 | R2, endpoint |  |
| story.md#L33 | out-of-scope |  |
