# Requirement review — TOOL-4

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | description, technical notes (endpoints, auth, duplicate status), AC-1..AC-6, PO clarification (409 for duplicates) |

## Testability decisions

_How each criterion is verified (write the decision after the arrow)._

- **AC-1** (api) A signed-in customer adds a product to favourites with POST /favorites; the API responds 201 with the favourite (its id and the product id). →
- **AC-2** (api) Adding a product that is already a favourite is rejected and the list still contains it once. →
- **AC-3** (api) GET /favorites lists the customer's own favourites only; another customer's favourites are never included. →
- **AC-4** (api) Every favourites endpoint responds 401 without a valid token. →
- **AC-5** (ui) On the web shop, a signed-in customer who clicks "Add to favourites" on a product page sees "Product added to your favorites list." and t… →
- **AC-6** (api) DELETE /favorites/{favoriteId} removes the favourite (204) and it no longer appears in GET /favorites. →

## Ambiguities / open questions

- G1 (oracle, required): status for a duplicate favourite: the technical notes say 422, the PO comment says 409 — found-in-requirement: 409
- G2 (mechanics, required): which product a test adds to favourites and how it gets its product id (no source names a product or how to find one) — open
- G3 (mechanics, required): field names in the favourite returned by POST /favorites and listed by GET /favorites (the favourite's id, the product id) and the shape of the GET /favorites list — open
- G4 (mechanics, required): how a web shop test signs the customer in (sign-in page route and fields, or how the API token becomes a web session) — open
- G5 (mechanics, required): product page: its route, how the "Add to favourites" control is found, and where the message "Product added to your favorites list." appears — open
- G6 (mechanics, required): "Favorites" page of the customer's account: its route or navigation, and how the listed products are found — open
