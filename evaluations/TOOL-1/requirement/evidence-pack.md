# Evidence pack — TOOL-1

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).
This pack is the whole requirement: the story, its acceptance-criteria field, comments and text attachments (`requirement/raw-issue.json` is the tracker's raw answer they came from; nothing to read there).

**Project configuration** (heldout.config.json: not requirement, nothing to cite or cover; a gap it answers is `found-in-config`):

- AUT profile `practicesoftwaretesting` "Practice Software Testing": web https://practicesoftwaretesting.com/, API https://api.practicesoftwaretesting.com/


## story.md

```text
  L1   | ---
  L2   | key: TOOL-1
  L3   | summary: "Catalogue search, sorting and category filter"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/TOOL-1
  L10  | fetchedAt: 2026-09-29T21:47:27.366Z
  L11  | ---
  L12  | 
  L13  | # TOOL-1: Catalogue search, sorting and category filter
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | As a shopper I want to search, sort and filter the tool catalogue so that I find the right tool quickly.  
● L18  | The web shop and the public catalogue API (used by our mobile app) must behave the same way.
  L19  | 
● L20  | Catalogue API: `GET /products` (list, `sort` and `by_category` parameters, paginated) and `GET /products/search?q=<term>` (search). Both return `{ "current_page", "data": [products], "per_page", "total", "last_page" }`.
  L21  | 
  L22  | ## Acceptance Criteria
  L23  | 
● L24  | 1. Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>".
● L25  | 2. GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers").
● L26  | 3. A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0.
● L27  | 4. Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order.
● L28  | 5. Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category.
● L29  | 6. Results are paginated with 12 products per page (per_page 12) on the web shop and in the API.
● L30  | 7. An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen.
  L31  | 
  L32  | ## Notes
  L33  | 
● L34  | - Category ids come from GET /categories/tree.
● L35  | - Out of scope: product detail pages, brands filter.
  L36  | 
  L37  | ## Attachments
  L38  | 
  L39  | _None_
  L40  | 
```
