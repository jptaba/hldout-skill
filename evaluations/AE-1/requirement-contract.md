# Requirement contract — AE-1: Product search and catalogue on the shop and the public product API

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, context (UI page, API endpoints, out of scope), Gherkin AC-1..AC-11, PO clarification replacing AC-4 |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | Catalogue is available through the API: GET /api/productsList lists the products of the catalogue in a "products" array; every product has an "id", a "name", a "price", a "brand" and a "category"; the category holds the audience ("usertype", e.g. Women, Men, Kids) and the category name; every price is written as "Rs. " followed by the amount, e.g. "Rs. 500". | the response lists the catalogue products in a "products" array; every product has an "id", a "name", a "price", a "brand" and a "category"; every category holds the audience "usertype" (e.g. Women, Men, Kids) and the category name; every price is "Rs. " followed by the amount, e.g. "Rs. 500" | story.md#L35 |
| AC-2 | api | Search by a term through the API: posting search_product = "jean" to /api/searchProduct returns exactly these products: "Soft Stretch Jeans", "Regular Fit Straight Jeans", "Grunt Blue Slim Fit Jeans". | search_product = "jean" returns exactly "Soft Stretch Jeans", "Regular Fit Straight Jeans", "Grunt Blue Slim Fit Jeans"; no other product is returned | story.md#L42 |
| AC-3 | api | Search ignores letter case: searching for "TOP" and for "top" returns the same products. | searching "TOP" and searching "top" return the same products | story.md#L46 |
| AC-4 | api | Search matches the product name or its category name (AC-4 as replaced by the Product Owner clarification of 2026-09-26): searching "dress" returns every product whose name contains "dress" plus every product in a "Dress" category, even if the word is not in its name, and nothing else; the brand is not a search field. | searching "dress" returns every catalogue product whose name contains "dress" (case-insensitive); searching "dress" also returns every product in a "Dress" category, even if the word is not in its name, e.g. "Sleeves Top and Short - Blue & Pink" (Kids > Dress); nothing else comes back: every product returned has "dress" in its name or its category name; searching "Polo" only finds products with "Polo" in the name or category (the brand is not a search field) | story.md#L50 |
| AC-5 | api | Nothing matches: searching for "zzqxv" returns an empty product list, not an error. | searching "zzqxv" returns an empty product list; the response is not an error | story.md#L55 |
| AC-6 | api | Search without a term (empty value): posting search_product with an empty value returns the whole catalogue, the same products as GET /api/productsList. | search_product with an empty value returns the whole catalogue; the products are the same as GET /api/productsList returns | story.md#L59 |
| AC-7 | api | Search without a term (parameter missing): posting to /api/searchProduct without the search_product parameter is rejected with response code 400 and the message "Bad request, search_product parameter is missing in POST request." | response code 400; message "Bad request, search_product parameter is missing in POST request." | story.md#L63 |
| AC-8 | ui | Search from the Products page: a shopper on the Products page types "jean" in the search box and presses the search button; the product grid is headed "Searched Products", the search box still shows "jean", and exactly the three jeans products listed in AC-2 are shown. | the product grid is headed "Searched Products"; the search box still shows "jean"; exactly "Soft Stretch Jeans", "Regular Fit Straight Jeans", "Grunt Blue Slim Fit Jeans" are shown | story.md#L68 |
| AC-9 | e2e | Searching from the Products page without a term: a shopper on the Products page leaves the search box empty and presses the search button; the grid is headed "All Products" and every product of the catalogue (GET /api/productsList) is shown. | the grid is headed "All Products"; every product GET /api/productsList returns is shown | story.md#L75 |
| AC-10 | e2e | The shop and the API agree on search results: when a shopper searches for "<term>" on the Products page, the products shown are exactly the products POST /api/searchProduct returns for "<term>", for the terms top, dress and Men Tshirt. | for "top", the products shown are exactly those POST /api/searchProduct returns for "top"; for "dress", the products shown are exactly those POST /api/searchProduct returns for "dress"; for "Men Tshirt", the products shown are exactly those POST /api/searchProduct returns for "Men Tshirt" | story.md#L81 |
| AC-11 | ui | No results on the Products page: when a shopper searches for "zzqxv" on the Products page, the grid is headed "Searched Products" and no product is shown. | the grid is headed "Searched Products"; no product is shown | story.md#L91 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /api/productsList | none | lists the products of the catalogue in a "products" array (story.md#L37) | story.md#L25 |
| POST /api/searchProduct | none |  | story.md#L26 |

## Rules and boundaries

- **R1** Search matches the product name or its category name (the category under Women / Men / Kids, e.g. "Dress", "Tops", "Tops & Shirts", "Tshirts"); nothing else should come back. This replaces scenario AC-4 as written. _(story.md#L100-L102)_
- **R2** The brand is not a search field: searching "Polo" only finds products with "Polo" in the name or category. _(story.md#L103)_
- **R3** Matching is a "contains" match, case-insensitive, as in AC-3. _(story.md#L104)_
- **R4** Search terms are plain words or phrases, for example jean, top, dress, Men Tshirt; punctuation and special characters in search terms are out of scope. _(story.md#L27-L28)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | POST /api/searchProduct without the search_product parameter | 400 | Bad request, search_product parameter is missing in POST request. | story.md#L63-L66 |

## Authentication

none: the product API is described as public _(story.md#L17)_

## Test data

none needed: read-only; every criterion searches or lists the existing catalogue, and nothing is created
- AC-2 and AC-8 rely on the catalogue containing "Soft Stretch Jeans", "Regular Fit Straight Jeans" and "Grunt Blue Slim Fit Jeans" (story.md#L44)
- AC-4 relies on the catalogue containing "Sleeves Top and Short - Blue & Pink" in Kids > Dress (story.md#L102)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | what searching "dress" must return: AC-4 as written says only products with the term in their name; the Product Owner clarification says name or category name | oracle | yes | AC-4 | story | found-in-requirement: searching "dress" returns every product whose name contains "dress" plus every product in a "Dress" category (e.g. "Sleeves Top and Short - Blue & Pink", Kids > Dress), and nothing else; brand is not searched |
| G2 | what "response code 400" refers to: the HTTP status of the response, or a response-code value carried in the response body | oracle | yes | AC-7 | story | assumed: the HTTP status of the response is 400 (the usual meaning of "response code"). Alternative reading, not assumed: HTTP status is not constrained and a response-code value of 400 is carried in the body. Confirm with the Product Owner |
| G3 | field name that holds the category name inside a product's "category" (only "usertype" is named) | mechanics | yes | AC-1, AC-4 | story → aut | discovered-in-aut: category name is product.category.category; audience is product.category.usertype.usertype |
| G4 | shape of the POST /api/searchProduct response: where the list of matching products is carried and how a product is identified when comparing result sets | mechanics | yes | AC-2, AC-3, AC-4, AC-5, AC-6, AC-10 | story → aut | discovered-in-aut: the matching products are in the body "products" array (same product shape as GET /api/productsList); a product is identified by "id" |
| G5 | what makes the no-match response "not an error": no status code or body is stated for a successful search | oracle | no | AC-5 | story | assumed: the response is a successful one carrying an empty product list: no error status and no error message (as in the AC-7 error case) is returned. No specific status code is asserted |
| G6 | where the error message of AC-7 is carried in the response (body field name / format) | mechanics | yes | AC-7 | story → aut | discovered-in-aut: the message is carried in the body field "message" |
| G7 | UI locators on the Products page: search box, search button label, product grid heading and product cards (only the search box placeholder/label "Search Product" and the headings are stated) | mechanics | yes | AC-8, AC-9, AC-10, AC-11 | story → aut | discovered-in-aut: search box getByRole(textbox, "Search Product"); button #submit_search; heading .features_items h2.title; card names .features_items .productinfo p; submission navigates to /products?search=<term> |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17-L19 | context | user story: actors (shopper, partner app using the public API) and goal; L17 also grounds auth none (public API) |
| story.md#L17 | auth |  |
| story.md#L23 | context,G7 | Products page route, heading and search box used as entry point of AC-8..AC-11 |
| story.md#L24-L26 | endpoint |  |
| story.md#L27 | R4 |  |
| story.md#L28 | out-of-scope,R4 |  |
| story.md#L32 | not-a-requirement | opening code fence of the Gherkin block |
| story.md#L33 | context | Feature title of the Gherkin block; no testable statement |
| story.md#L35-L40 | AC-1 |  |
| story.md#L42-L44 | AC-2,test-data |  |
| story.md#L46-L48 | AC-3 |  |
| story.md#L50-L53 | AC-4,G1 | superseded as written by the PO clarification at L100-L104 |
| story.md#L55-L57 | AC-5,G5 |  |
| story.md#L59-L61 | AC-6 |  |
| story.md#L63-L66 | AC-7,E1,G2 |  |
| story.md#L68-L73 | AC-8 |  |
| story.md#L75-L79 | AC-9 |  |
| story.md#L81-L89 | AC-10 |  |
| story.md#L91-L93 | AC-11 |  |
| story.md#L94 | not-a-requirement | closing code fence of the Gherkin block |
| story.md#L100 | G1,R1 |  |
| story.md#L102 | R1,G1,AC-4,test-data |  |
| story.md#L103 | R2,AC-4,out-of-scope |  |
| story.md#L104 | R3,AC-4 |  |
