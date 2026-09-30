# API chain — evaluations/TOOL-3/hardening/tier3/thor.chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com/ · captured 2026-09-29T22:56:58.163Z

1. **search Thor Hammer** — `GET /products/search?q=Thor%20Hammer` → **200** (777 ms)
   `data.0.id` = `"01M3QJXQJHDB71SAG06CVTHSEY"` · `data.0.name` = `"Thor Hammer"` · `data.0.in_stock` = `true` · `data.0.is_rental` = `false`
2. **create cart** — `POST /carts` → **201** (717 ms)
   `{"id":"01m3qp5e0q10fng344me23rk5g"}`
3. **add Thor Hammer x2** — `POST /carts/01m3qp5e0q10fng344me23rk5g` body `{"product_id":"01M3QJXQJHDB71SAG06CVTHSEY","quantity":2}` → **400** (805 ms)
   `{"message":"You can only have one Thor Hammer in the cart."}`
4. **add Thor Hammer x1** — `POST /carts/01m3qp5e0q10fng344me23rk5g` body `{"product_id":"01M3QJXQJHDB71SAG06CVTHSEY","quantity":1}` → **200** (477 ms)
   `{"result":"item added or updated"}`
5. **add Thor Hammer x1 again** — `POST /carts/01m3qp5e0q10fng344me23rk5g` body `{"product_id":"01M3QJXQJHDB71SAG06CVTHSEY","quantity":1}` → **400** (494 ms)
   `{"message":"You can only have one Thor Hammer in the cart."}`
6. **read cart** — `GET /carts/01m3qp5e0q10fng344me23rk5g` → **200** (468 ms)
   `{"id":"01m3qp5e0q10fng344me23rk5g","additional_discount_percentage":null,"lat":null,"lng":null,"cart_items":[{"id":"01m3qp5fgr0vnf77dkr39n624v","quantity":1,"discount_percentage":null,"cart_id":"01m3qp5e0q10fng344me23rk5g","product_id":"01M3QJXQJHDB71SAG06CVTHSEY","product":{"id":"01M3QJXQJHDB71SAG0`
7. **delete cart** — `DELETE /carts/01m3qp5e0q10fng344me23rk5g` → **204** ✔ (539 ms)
   ``

All expectations held.
