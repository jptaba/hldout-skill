# API chain — evaluations/TOOL-3/hardening/tier3/cart-api.chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com/ · captured 2026-09-29T22:51:48.121Z

1. **catalogue** — `GET /products` → **200** (572 ms)
   `data.0.id` = `"01M3QJXQFBJC3M2NF6FXJT54CK"` · `data.0.in_stock` = `true` · `data.1.id` = `"01M3QJXQFN6VFQVMSDHQEBX7M7"` · `data.1.in_stock` = `true`
2. **create cart** — `POST /carts` → **201** (482 ms)
   `{"id":"01m3qnvz1mnahvx6rjhdyrvdy8"}`
3. **read new cart** — `GET /carts/01m3qnvz1mnahvx6rjhdyrvdy8` → **200** (466 ms)
   `{"id":"01m3qnvz1mnahvx6rjhdyrvdy8","additional_discount_percentage":null,"lat":null,"lng":null,"cart_items":[]}`
4. **add p1 x2** — `POST /carts/01m3qnvz1mnahvx6rjhdyrvdy8` body `{"product_id":"01M3QJXQFBJC3M2NF6FXJT54CK","quantity":2}` → **200** (550 ms)
   `{"result":"item added or updated"}`
5. **add p1 x3 again** — `POST /carts/01m3qnvz1mnahvx6rjhdyrvdy8` body `{"product_id":"01M3QJXQFBJC3M2NF6FXJT54CK","quantity":3}` → **200** (469 ms)
   `{"result":"item added or updated"}`
6. **read cart** — `GET /carts/01m3qnvz1mnahvx6rjhdyrvdy8` → **200** (496 ms)
   `{"id":"01m3qnvz1mnahvx6rjhdyrvdy8","additional_discount_percentage":null,"lat":null,"lng":null,"cart_items":[{"id":"01m3qnw01nskwnjf3zhhj2jp1j","quantity":5,"discount_percentage":null,"cart_id":"01m3qnvz1mnahvx6rjhdyrvdy8","product_id":"01M3QJXQFBJC3M2NF6FXJT54CK","product":{"id":"01M3QJXQFBJC3M2NF6`
7. **add p2 qty 0** — `POST /carts/01m3qnvz1mnahvx6rjhdyrvdy8` body `{"product_id":"01M3QJXQFN6VFQVMSDHQEBX7M7","quantity":0}` → **422** (462 ms)
   `{"message":"The quantity field must be at least 1.","errors":{"quantity":["The quantity field must be at least 1."]}}`
8. **add p2 qty 100** — `POST /carts/01m3qnvz1mnahvx6rjhdyrvdy8` body `{"product_id":"01M3QJXQFN6VFQVMSDHQEBX7M7","quantity":100}` → **422** (442 ms)
   `{"message":"The quantity field must not be greater than 99.","errors":{"quantity":["The quantity field must not be greater than 99."]}}`
9. **read cart after rejects** — `GET /carts/01m3qnvz1mnahvx6rjhdyrvdy8` → **200** (448 ms)
   `{"id":"01m3qnvz1mnahvx6rjhdyrvdy8","additional_discount_percentage":null,"lat":null,"lng":null,"cart_items":[{"id":"01m3qnw01nskwnjf3zhhj2jp1j","quantity":5,"discount_percentage":null,"cart_id":"01m3qnvz1mnahvx6rjhdyrvdy8","product_id":"01M3QJXQFBJC3M2NF6FXJT54CK","product":{"id":"01M3QJXQFBJC3M2NF6`
10. **remove p1** — `DELETE /carts/01m3qnvz1mnahvx6rjhdyrvdy8/product/01M3QJXQFBJC3M2NF6FXJT54CK` → **204** (476 ms)
   ``
11. **read cart after remove** — `GET /carts/01m3qnvz1mnahvx6rjhdyrvdy8` → **200** (796 ms)
   `{"id":"01m3qnvz1mnahvx6rjhdyrvdy8","additional_discount_percentage":null,"lat":null,"lng":null,"cart_items":[]}`
12. **delete cart** — `DELETE /carts/01m3qnvz1mnahvx6rjhdyrvdy8` → **204** (483 ms)
   ``
13. **delete cart again** — `DELETE /carts/01m3qnvz1mnahvx6rjhdyrvdy8` → **404** (482 ms)
   `{"message":"Cart doesnt exists"}`
14. **read deleted cart** — `GET /carts/01m3qnvz1mnahvx6rjhdyrvdy8` → **404** (472 ms)
   `{"message":"Requested item not found"}`
15. **add to deleted cart** — `POST /carts/01m3qnvz1mnahvx6rjhdyrvdy8` body `{"product_id":"01M3QJXQFBJC3M2NF6FXJT54CK","quantity":1}` → **404** (460 ms)
   `{"message":"Cart not found"}`
16. **remove from deleted cart** — `DELETE /carts/01m3qnvz1mnahvx6rjhdyrvdy8/product/01M3QJXQFBJC3M2NF6FXJT54CK` → **404** (454 ms)
   `{"message":"Cart doesnt exists"}`

All expectations held.
