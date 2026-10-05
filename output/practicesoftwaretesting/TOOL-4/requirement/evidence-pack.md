# Evidence pack — TOOL-4

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).
This pack is the whole requirement: the story's title, description and acceptance criteria, the screenshots they show, and the Confluence pages they link (`linked/confluence-*.md`). Comments and other attachments are not part of it, and there is no API document unless one of these sources contains it (`requirement/raw-issue.json` is the tracker's raw answer; nothing to read there).

**Project configuration** (heldout.config.json: not requirement, nothing to cite or cover; a gap it answers is `found-in-config`):

- AUT profile `practicesoftwaretesting` "Practice Software Testing": web https://practicesoftwaretesting.com/, API https://api.practicesoftwaretesting.com


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
  L9   | url: https://jira.example.com/browse/TOOL-4
  L10  | fetchedAt: 2026-10-05T12:13:33.169Z
  L11  | ---
  L12  | 
  L13  | # TOOL-4: Favourites for signed-in customers
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | Signed-in customers can keep a personal list of favourite products, from the product page (web shop) and through the API (mobile app).
  L18  | 
● L19  | *Technical notes:* the favourites API is defined on the [Favourites API|https://confluence.example.com/pages/viewpage.action?pageId=880001] page.
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
  L30  | ## Linked pages
  L31  | 
  L32  | | Page | Link | Status | Local path |
  L33  | | --- | --- | --- | --- |
  L34  | | Favourites API | https://confluence.example.com/pages/viewpage.action?pageId=880001 | read | linked/confluence-880001-favourites-api.md |
  L35  | 
  L36  | ## Screenshots
  L37  | 
  L38  | _None_
  L39  | 
```

## linked/confluence-880001-favourites-api.md

```text
  L1   | confluencePage: https://confluence.example.com/pages/viewpage.action?pageId=880001
  L2   | 
  L3   | # Favourites API
  L4   | 
● L5   | The favourites endpoints of the shop API, used by the mobile app. Every call needs `Authorization: Bearer <token>`, the token from `POST /users/login`.
  L6   | 
● L7   | Excerpt of the service's OpenAPI definition (favourites only):
  L8   | 
  L9   | ```yaml
● L10  | paths:
● L11  |   /favorites:
● L12  |     get:
● L13  |       summary: The signed-in customer's favourites
● L14  |       security: [{ bearer: [] }]
● L15  |       responses:
● L16  |         "200": { description: The customer's own favourites }
● L17  |         "401": { description: No valid token }
● L18  |     post:
● L19  |       summary: Add a product to the signed-in customer's favourites
● L20  |       security: [{ bearer: [] }]
● L21  |       requestBody:
● L22  |         content:
● L23  |           application/json:
● L24  |             schema:
● L25  |               type: object
● L26  |               required: [product_id]
● L27  |               properties:
● L28  |                 product_id: { type: string }
● L29  |       responses:
● L30  |         "201": { description: The favourite, with its id and the product id }
● L31  |         "401": { description: No valid token }
● L32  |         "409": { description: The product is already a favourite (a conflict) }
● L33  |   /favorites/{favoriteId}:
● L34  |     delete:
● L35  |       summary: Remove a favourite
● L36  |       security: [{ bearer: [] }]
● L37  |       responses:
● L38  |         "204": { description: Removed }
● L39  |         "401": { description: No valid token }
  L40  | ```
  L41  | 
```
