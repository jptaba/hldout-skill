# Evidence pack — TOOL-4

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: TOOL-4
  L3   | summary: "Favourites for signed-in customers"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/TOOL-4
  L10  | fetchedAt: 2026-09-26T20:13:47.849Z
  L11  | ---
  L12  | 
  L13  | # TOOL-4: Favourites for signed-in customers
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | Signed-in customers can keep a personal list of favourite products, from the product page (web shop) and through the API (mobile app).
  L18  | 
● L19  | **Technical notes:** endpoints `POST /favorites` (body `{"product_id"}`), `GET /favorites`, `DELETE /favorites/{favoriteId}`; all require `Authorization: Bearer <token>` from `POST /users/login`. Duplicate favourites are rejected with 422.
  L20  | 
  L21  | ## Acceptance criteria (custom field)
  L22  | 
● L23  | - AC-1: A signed-in customer adds a product to favourites with POST /favorites; the API responds 201 with the favourite (its id and the product id).
● L24  | - AC-2: Adding a product that is already a favourite is rejected and the list still contains it once.
● L25  | - AC-3: GET /favorites lists the customer's own favourites only; another customer's favourites are never included.
● L26  | - AC-4: Every favourites endpoint responds 401 without a valid token.
● L27  | - AC-5: On the web shop, a signed-in customer who clicks "Add to favourites" on a product page sees "Product added to your favorites list." and the product then appears on the "Favorites" page of their account.
● L28  | - AC-6: DELETE /favorites/{favoriteId} removes the favourite (204) and it no longer appears in GET /favorites.
  L29  | 
  L30  | ## Comments (clarifications from the issue)
  L31  | 
  L32  | **Priya (Product Owner)** — 2026-09-26:
  L33  | 
● L34  | Clarification from refinement: a duplicate favourite is a conflict, so the API must answer **409 Conflict** (not 422 as in the technical notes). The web shop can keep its current message for duplicates.
  L35  | 
  L36  | 
  L37  | ## Attachments
  L38  | 
  L39  | _None_
  L40  | 
```
