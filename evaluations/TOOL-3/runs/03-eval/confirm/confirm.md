# API chain — evaluations/TOOL-3/runs/03-eval/confirm/chain.json

- AUT: Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) · https://api.practicesoftwaretesting.com · captured 2026-09-26T22:45:37.341Z

1. _(setup)_ **find an in-stock product** — `GET /products/search?q=pliers` → **200** (572 ms)
   `data.0.name` = `"Combination Pliers"`
2. _(setup)_ **create a cart** — `POST /carts` → **201** ✔ (443 ms)
   `id` = `"01m3fya2t554hmz87bwv2x9a91"`
3. **SCN-002 as the test sent it (productId)** — `POST /carts/01m3fya2t554hmz87bwv2x9a91` body `{"productId":"01M3FVQJG6E2QF0114BDA47REV","quantity":1}` → **422** (431 ms)
   `message` = `"The product id field is required."` · `errors` = `{"product_id":["The product id field is required."]}`
4. **SCN-002 with the declared field product_id, quantity 1** — `POST /carts/01m3fya2t554hmz87bwv2x9a91` body `{"product_id":"01M3FVQJG6E2QF0114BDA47REV","quantity":1}` → **200** ✔ (493 ms)
   `result` = `"item added or updated"`
5. **SCN-002 quantity 99 on a fresh product line** — `PUT /carts/01m3fya2t554hmz87bwv2x9a91/product/quantity` body `{"product_id":"01M3FVQJG6E2QF0114BDA47REV","quantity":99}` → **200** (470 ms)
   `result` = `"item added or updated"`
6. **cart now holds the product** — `GET /carts/01m3fya2t554hmz87bwv2x9a91` → **200** (466 ms)
   `cart_items.0.quantity` = `99`
7. **SCN-008 delete the cart** — `DELETE /carts/01m3fya2t554hmz87bwv2x9a91` → **204** ✔ (557 ms)
   ``
8. **SCN-008 delete the same cart again (story: 204)** — `DELETE /carts/01m3fya2t554hmz87bwv2x9a91` → **404** ✖ expected 204 (502 ms)
   `message` = `"Cart doesnt exists"`
9. **SCN-009 read a never-existing cart** — `GET /carts/nxiza9x9n5e` → **404** ✔ (499 ms)
   `message` = `"Requested item not found"`
10. **SCN-009 add to a never-existing cart** — `POST /carts/nxiza9x9n5e` body `{"product_id":"01M3FVQJG6E2QF0114BDA47REV","quantity":1}` → **404** ✔ (520 ms)
   `message` = `"Cart not found"`
11. **SCN-009 remove from a never-existing cart** — `DELETE /carts/nxiza9x9n5e/product/01M3FVQJG6E2QF0114BDA47REV` → **404** ✔ (531 ms)
   `message` = `"Cart doesnt exists"`
12. **SCN-009 delete a never-existing cart** — `DELETE /carts/nxiza9x9n5e` → **404** ✔ (500 ms)
   `message` = `"Cart doesnt exists"`

**1 step(s) did not return the expected status.**
