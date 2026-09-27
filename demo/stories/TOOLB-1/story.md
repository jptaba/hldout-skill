# TOOLB-1: Release-candidate check — catalogue search, sorting and category filter

Same acceptance criteria as TOOL-1, verified on the release-candidate environment before promotion.

As a shopper I want to search, sort and filter the tool catalogue so that I find the right tool quickly.
The web shop and the public catalogue API (used by our mobile app) must behave the same way.

Catalogue API: `GET /products` (list, `sort` and `by_category` parameters, paginated) and `GET /products/search?q=<term>` (search). Both return `{ "current_page", "data": [products], "per_page", "total", "last_page" }`.

## Acceptance Criteria
1. Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>".
2. GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers").
3. A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0.
4. Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order.
5. Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category.
6. Results are paginated with 12 products per page (per_page 12) on the web shop and in the API.
7. An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen.

## Notes
- Category ids come from GET /categories/tree.
- Out of scope: product detail pages, brands filter.
