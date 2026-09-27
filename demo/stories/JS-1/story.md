# JS-1: Product search and product details

## Context
Customers find juices by typing a term into the top-bar search of the shop (an Angular single-page app).
The search view lives at the hash route `/#/search?q=<term>` and is backed by the REST search endpoint on
the same origin. Product detail information includes customer reviews. This story covers the search results
list, the search REST contract, how the field handles unusual input, and the review listing for a product.

Notes for whoever verifies this:
- The app shows a welcome banner and a cookie notice on first visit; dismiss them before reading the page.
- Prices are rendered with a currency placeholder glyph (e.g. `1.99¤`).
- No login is required for search or for reading reviews.

## Acceptance criteria

1. **(UI) Results list.** Navigating to `/#/search?q=apple` shows the matching products as a grid of cards.
   Each card shows the product name, its price, and an **Add to Basket** button. The results header reads
   `Search Results - apple` (the header echoes the exact term that was searched).

2. **(API) Search contract.** `GET /rest/products/search?q=<term>` returns HTTP 200 with a JSON body of the
   shape `{"status":"success","data":[ ... ]}`. Every product object in `data` matches `<term>` in its
   **name or its description**, case-insensitively. For a term that matches nothing, `data` is an empty array
   (still HTTP 200, still `"status":"success"`).

3. **(End-to-end) UI is backed by the search API.** For the same term, the set of product names displayed on
   the `/#/search` results page equals the set of product names returned by `GET /rest/products/search?q=<term>`.

4. **(UI) Empty state.** See the attached mock-up `search-empty-state.png`. When a search returns no matching
   products, the results view shows the header `Search Results - <term>`, a **No results found** title, the
   helper line *Try adjusting your search to find what you're looking for.*, and a result count of `0 of 0`.

5. **(Security) Special characters are treated as data, not code.** The search term is user input and must be
   handled as literal text. When the term contains characters that are significant in SQL or markup — for
   example a single apostrophe (`'`), or an SQL-like fragment — the search endpoint must still return a normal
   HTTP 200 success envelope (with an empty `data` array when nothing matches). It must never return a
   server-side error status or leak a database engine / query message to the client.

6. **(API) Review listing.** `GET /rest/products/{id}/reviews` returns HTTP 200 with a body of the shape
   `{"status":"success","data":[ ... ]}`. Each review object carries at least a `message` string and an
   `author`. For product `1` the listing is non-empty.

## Out of scope
Writing or liking reviews; search autocomplete; sorting and the items-per-page control.
