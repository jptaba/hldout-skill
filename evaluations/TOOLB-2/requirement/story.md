---
key: TOOLB-2
summary: "Release-candidate check — shopping cart for guests"
type: Story
status: Ready for QA
priority: High
labels: []
source: mock-jira
url: https://your-domain.atlassian.net/browse/TOOLB-2
fetchedAt: 2026-09-26T20:13:50.500Z
---

# TOOLB-2: Release-candidate check — shopping cart for guests

## Description

Same acceptance criteria as TOOL-3, verified on the release-candidate environment before promotion.

Guests (not signed in) can collect products in a cart before checkout. The web shop keeps the cart across page views; the cart API is also used by the mobile app.

| ID | Criterion | Layer |
| --- | --- | --- |
| AC-1 | `POST /carts` creates an empty cart and responds 201 with its `id`. | API |
| AC-2 | `POST /carts/{id}` with `product_id` and a `quantity` from 1 to 99 adds the product (200); adding a product already in the cart increases its quantity by the amount added. | API |
| AC-3 | A quantity outside 1–99 is rejected with 422 and an error for the `quantity` field; the cart is unchanged. | API |
| AC-4 | On a product page, choosing a quantity and pressing "Add to cart" shows "Product added to shopping cart." and the cart icon in the navigation shows the total number of items. | UI |
| AC-5 | The cart page (checkout step 1) lists each product with its quantity, unit price and line total (price × quantity), and the cart total. | UI |
| AC-6 | `DELETE /carts/{id}/product/{productId}` removes the product (204); the cart no longer lists it. | API |
| AC-7 | Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. | API |
| AC-8 | Any request for a cart that does not exist responds 404 with the message "Cart not found". | API |

**Test data:** any product that is in stock; carts are anonymous, so tests create and delete their own.

## Attachments

_None_
