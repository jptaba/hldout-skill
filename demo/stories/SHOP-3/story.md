# Shopping cart: quantities, totals and the combined rental discount

As a shopper I want to choose how many of each product I buy and see straight away what my cart costs, so that there are no surprises at checkout.

The cart is the first step of the checkout: each product with its quantity, unit price and line total, and the cart total below. No sign-in is needed; a cart is created with POST /carts and identified by its id. Location-based offers and the eco-friendly discount are other stories.

API used by the shop:
- POST /carts/{id} with `product_id` and `quantity` adds a product.
- PUT /carts/{id}/product/quantity with `product_id` and `quantity` sets the quantity of a line.
- DELETE /carts/{id}/product/{productId} removes a line.
- GET /carts/{id} returns the cart with its `cart_items` and `additional_discount_percentage`.

## Acceptance criteria

**AC-1** Adding a product from its detail page puts it in the cart with the chosen quantity and shows "Product added to shopping cart."; adding the same product again raises the quantity of the existing line instead of adding a second line.

**AC-2** Any quantity from 1 to 99 can be added at once, and any quantity from 1 to 99 can be set for a line; both calls answer 200 with `{"result": "item added or updated"}`.

**AC-3** A quantity below 1 is refused with 422 and "The quantity field must be at least 1."; a quantity above 99 is refused with 422 and "The quantity field must not be greater than 99.". After a refusal the line keeps the quantity it had.

**AC-4** On the cart page, changing a quantity field updates the line and shows "Product quantity updated."; typing more than 99 puts 99 in the field and warns "You can order at most 99 of this product.".

**AC-5** A line total is quantity × unit price, and without a discount the cart total is the sum of the line totals; amounts are shown to the cent.

**AC-6** When the cart holds at least one rental and at least one product that is not a rental, a 15% discount applies: the cart shows the subtotal, a line "Discount (15%)" with the amount, and the total after the discount. GET /carts/{id} reports `additional_discount_percentage` 15, and null without that combination. Removing the last rental or the last non-rental product removes the discount.

**AC-7** Removing a line with its delete button takes it out of the cart and shows "Product deleted."; the API call answers 204.

**AC-8** Some products may only be in the cart once. When a product cannot be added, the shop shows an appropriate message and the cart is unchanged.
