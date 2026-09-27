# Evidence pack — JS-1

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).

**Non-text attachments** — open each with the Read tool and transcribe what it states into `requirement/transcripts/<file>.md`
(first line `transcribedFrom: attachments/<file>`); then re-run `contract KEY --pack` so the transcript is numbered here:

- attachments/search-empty-state.png (transcribed)


## story.md

```text
  L1   | ---
  L2   | key: JS-1
  L3   | summary: "Product search and product details"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/JS-1
  L10  | fetchedAt: 2026-09-27T00:53:24.275Z
  L11  | ---
  L12  | 
  L13  | # JS-1: Product search and product details
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## Context
  L18  | 
● L19  | Customers find juices by typing a term into the top-bar search of the shop (an Angular single-page app).  
● L20  | The search view lives at the hash route `/#/search?q=<term>` and is backed by the REST search endpoint on  
● L21  | the same origin. Product detail information includes customer reviews. This story covers the search results  
● L22  | list, the search REST contract, how the field handles unusual input, and the review listing for a product.
  L23  | 
● L24  | Notes for whoever verifies this:
  L25  | 
● L26  | - The app shows a welcome banner and a cookie notice on first visit; dismiss them before reading the page.
● L27  | - Prices are rendered with a currency placeholder glyph (e.g. `1.99¤`).
● L28  | - No login is required for search or for reading reviews.
  L29  | 
  L30  | ## Acceptance criteria
  L31  | 
● L32  | 1. **(UI) Results list.** Navigating to `/#/search?q=apple` shows the matching products as a grid of cards. Each card shows the product name, its price, and an **Add to Basket** button. The results header reads `Search Results - apple` (the header echoes the exact term that was searched).
  L33  | 
● L34  | 1. **(API) Search contract.** `GET /rest/products/search?q=<term>` returns HTTP 200 with a JSON body of the shape `{"status":"success","data":[ ... ]}`. Every product object in `data` matches `<term>` in its **name or its description**, case-insensitively. For a term that matches nothing, `data` is an empty array (still HTTP 200, still `"status":"success"`).
  L35  | 
● L36  | 1. **(End-to-end) UI is backed by the search API.** For the same term, the set of product names displayed on the `/#/search` results page equals the set of product names returned by `GET /rest/products/search?q=<term>`.
  L37  | 
● L38  | 1. **(UI) Empty state.** See the attached mock-up `search-empty-state.png`. When a search returns no matching products, the results view shows the header `Search Results - <term>`, a **No results found** title, the helper line _Try adjusting your search to find what you're looking for._, and a result count of `0 of 0`.
  L39  | 
● L40  | 1. **(Security) Special characters are treated as data, not code.** The search term is user input and must be handled as literal text. When the term contains characters that are significant in SQL or markup — for example a single apostrophe (`'`), or an SQL-like fragment — the search endpoint must still return a normal HTTP 200 success envelope (with an empty `data` array when nothing matches). It must never return a server-side error status or leak a database engine / query message to the client.
  L41  | 
● L42  | 1. **(API) Review listing.** `GET /rest/products/{id}/reviews` returns HTTP 200 with a body of the shape `{"status":"success","data":[ ... ]}`. Each review object carries at least a `message` string and an `author`. For product `1` the listing is non-empty.
  L43  | 
  L44  | ## Out of scope
  L45  | 
● L46  | Writing or liking reviews; search autocomplete; sorting and the items-per-page control.
  L47  | 
  L48  | ## Attachments
  L49  | 
  L50  | | File | MIME | Bytes | How to read | Local path |
  L51  | | --- | --- | --- | --- | --- |
  L52  | | search-empty-state.png | image/png | 14782 | image — open with the Read tool (vision) | attachments/search-empty-state.png |
  L53  | 
```

## transcripts/search-empty-state.png.md

```text
  L1   | transcribedFrom: attachments/search-empty-state.png
  L2   | 
● L3   | Screenshot-style mock-up of a web page (no annotations or notes on the image).
  L4   | 
● L5   | Top bar (dark brown): left, the text "OWASP Juice Shop"; right, a search field containing the text "apple".
  L6   | 
● L7   | Page body:
● L8   | - Heading: "Search Results - apple" ("Search Results -" in dark text, "apple" in orange).
● L9   | - Centred: a magnifying-glass icon in a light circle.
● L10  | - Centred bold title below the icon: "No results found"
● L11  | - Centred grey line below the title: "Try adjusting your search to find what you're looking for."
● L12  | - A horizontal divider line.
● L13  | - Footer row, right-aligned: "Items per page:" followed by "15", then "0 of 0".
  L14  | 
```
