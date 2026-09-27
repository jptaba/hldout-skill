# Evidence pack — TOOLB-2

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: TOOLB-2
  L3   | summary: "Release-candidate check — shopping cart for guests"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/TOOLB-2
  L10  | fetchedAt: 2026-09-26T20:13:50.500Z
  L11  | ---
  L12  | 
  L13  | # TOOLB-2: Release-candidate check — shopping cart for guests
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | Same acceptance criteria as TOOL-3, verified on the release-candidate environment before promotion.
  L18  | 
● L19  | Guests (not signed in) can collect products in a cart before checkout. The web shop keeps the cart across page views; the cart API is also used by the mobile app.
  L20  | 
● L21  | | ID | Criterion | Layer |
  L22  | | --- | --- | --- |
● L23  | | AC-1 | `POST /carts` creates an empty cart and responds 201 with its `id`. | API |
● L24  | | AC-2 | `POST /carts/{id}` with `product_id` and a `quantity` from 1 to 99 adds the product (200); adding a product already in the cart increases its quantity by the amount added. | API |
● L25  | | AC-3 | A quantity outside 1–99 is rejected with 422 and an error for the `quantity` field; the cart is unchanged. | API |
● L26  | | AC-4 | On a product page, choosing a quantity and pressing "Add to cart" shows "Product added to shopping cart." and the cart icon in the navigation shows the total number of items. | UI |
● L27  | | AC-5 | The cart page (checkout step 1) lists each product with its quantity, unit price and line total (price × quantity), and the cart total. | UI |
● L28  | | AC-6 | `DELETE /carts/{id}/product/{productId}` removes the product (204); the cart no longer lists it. | API |
● L29  | | AC-7 | Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. | API |
● L30  | | AC-8 | Any request for a cart that does not exist responds 404 with the message "Cart not found". | API |
  L31  | 
● L32  | **Test data:** any product that is in stock; carts are anonymous, so tests create and delete their own.
  L33  | 
  L34  | ## Attachments
  L35  | 
  L36  | _None_
  L37  | 
```
