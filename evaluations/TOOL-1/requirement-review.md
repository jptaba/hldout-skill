# Requirement review — TOOL-1

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | description, catalogue API, acceptance criteria 1-7, notes |

## Testability decisions

_How each criterion is verified (write the decision after the arrow)._

- **AC-1** (ui) Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>". → SCN-001: search "pliers" (the story's own example), assert the caption text "Searched for: pliers" and that every product card's name contains "pliers" ignoring case (R1: same behaviour as the API, which is case-insensitive per AC-2). A non-empty result is a precondition, not a requirement check. SCN-013 (integration, R1) compares the web shop result with the API's first page.
- **AC-2** (api) GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" … → SCN-002: status 200 and every item of every page (up to last_page) contains "pliers" case-insensitively. SCN-003: the set of product ids for "PLIERS" equals the set for "pliers" (all pages).
- **AC-3** (e2e) A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0. → A unique nonsense term (data prefix + random) that no product name can contain. SCN-004 (UI): message shown and no product card; the "no card" check waits for the message first. SCN-005 (API): 200, data [] and total 0.
- **AC-4** (e2e) Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in… → SCN-006 (UI): after choosing the option, the shown prices are non-decreasing. SCN-007 (API): prices non-decreasing within page 1 and across the page 1/2 boundary.
- **AC-5** (e2e) Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in tha… → The web shop cards may not show a category, so SCN-008 judges each shown product's category from the unfiltered GET /products listing (independent of the by_category filter). SCN-009: id from GET /categories/tree (R3), every item on every page is in "Hammer".
- **AC-6** (e2e) Results are paginated with 12 products per page (per_page 12) on the web shop and in the API. → SCN-010 (UI): unfiltered catalogue, page 1 has exactly 12 cards and a next page opens. SCN-011 (contract): both endpoints return the R2 shape with per_page 12; GET /products page 1 holds 12 items.
- **AC-7** (api) An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen. → Open oracle question G4 (no user available). SCN-012 tests the literal reading, @needs-clarification: both q omitted and q="", "all products" = the same total as unfiltered GET /products; no status asserted.

## Ambiguities / open questions

- G1 (mechanics, required): web shop catalogue page: its route and how the search box, the search caption, the product cards (name, price), the sort control, the category filter, the no-results message and the pagination are found — open
- G2 (mechanics, required): API product fields: where a product's name, price and category are in the items of data — open
- G3 (mechanics, required): how the id of the category "Hammer" is read from the GET /categories/tree answer (structure, name and id fields) — open
- G4 (oracle): AC-7 empty search: does "no term" mean q omitted, q empty, or both; what status is expected (not stated); and is "all products" judged as total equal to the unfiltered GET /products total? — open; no user available in this session. Tested literally in SCN-012 (@needs-clarification); a failure there is a question for the owner, not a defect.
- Observation for the owner (not a gap): the story does not say whether "Hammer" includes subcategories, or whether web-shop "only products whose name contains the term" is case-sensitive; the scenarios read both as in the ASSUMPTION lines of scenarios.feature.
