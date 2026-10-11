# TOOL-8: Stocking a new product line

As a shop administrator I want to add a new product line myself (its category, its brand and its products) so that it is on sale in the web shop without help from development. It has to work in the admin area and through the API, because the purchasing team imports whole lines in bulk.

What we expect:

- An administrator can create a category, a sub-category under it, and a brand. Each gets a name and a slug. Two brands can't share a slug.
- A product is created under one category and one brand, with a name, a price, a stock quantity and a picture from the image library. Without an existing brand or category it is refused with a message that says what is wrong.
- Once created, customers find the product in the web shop: by its name in the search, under its sub-category and its brand in the filters, and on its own product page with the right name and price.
- A customer can put it in the cart, and the cart shows it with the price the administrator set.
- Only administrators manage the catalogue. Customers, and visitors who are not signed in, must not be able to create, change or delete categories, brands or products.
- A brand or a category that still has products can't be deleted, and neither can a product that sits in someone's cart. When nothing uses them any more they can be removed again, and the product disappears from the shop.

Notes from refinement: the API side is /categories, /brands, /products and /images, the same ones the shop already uses; the administrator's calls carry the administrator's token. Editing pictures and rental products are out of scope. Please clean up whatever the checks create, this is a shared environment.
