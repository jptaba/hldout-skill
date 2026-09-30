# API chain — evaluations/TOOL-3/hardening/tier3/seed-422.chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com/ · captured 2026-09-29T23:03:51.543Z

1. **search Slip Joint Pliers** — `GET /products/search?q=Slip%20Joint%20Pliers` → **200** (665 ms)
   `data.0.id` = `"01M3QPBHTPKX7C1EYS2YZDDD5Z"` · `data.0.in_stock` = `true`
2. **create cart** — `POST /carts` → **201** (467 ms)
   `{"id":"01m3qpj1kgdxvz4adbcbneegrn"}`
3. **add 1 (current id)** — `POST /carts/01m3qpj1kgdxvz4adbcbneegrn` body `{"product_id":"01M3QPBHTPKX7C1EYS2YZDDD5Z","quantity":1}` → **200** (500 ms)
   `{"result":"item added or updated"}`
4. **add 1 with an id that no longer exists** — `POST /carts/01m3qpj1kgdxvz4adbcbneegrn` body `{"product_id":"01M3QJXQFBJC3M2NF6FXJT5XXX","quantity":1}` → **422** (430 ms)
   `{"message":"The selected product id is invalid.","errors":{"product_id":["The selected product id is invalid."]}}`
5. **leftover cart from run 03 (cleanup answered 500)** — `DELETE /carts/01m3qpb1bfbk3nwwjb20fe3st0` → **404** (1494 ms)
   `{"message":"Cart doesnt exists"}`
6. **delete cart** — `DELETE /carts/01m3qpj1kgdxvz4adbcbneegrn` → **204** ✔ (612 ms)
   ``

All expectations held.
