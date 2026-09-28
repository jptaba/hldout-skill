# API chain — evaluations/TOOL-4/hardening/chain-account.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com · captured 2026-09-28T20:24:43.685Z

1. **register** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Test","email":"hldout-lp4sdhovm@example.com","password":"***redacted***"}` → **201** ✔ (787 ms)
   `id` = `"01m3mv1y3a6q7s74ntvmx739t8"` · `email` = `"hldout-lp4sdhovm@example.com"`
2. **log in** — `POST /users/login` body `{"email":"hldout-lp4sdhovm@example.com","password":"***redacted***"}` → **200** ✔ (551 ms)
   `token_type` = `"bearer"` · `access_token|jwt` = `{"header":{"typ":"JWT","alg":"HS256"},"payload":{"iss":"https://api.practicesoftwaretesting.com/users/login","iat":1790627084,"exp":1790627384,"nbf":1790627084,"jti":"feQ8Abw7C40rl3BM","sub":"01m3mv1y3a6q7s74ntvmx739t8","prv":"23bd5c8949f600adb39e701c400872db7a5976f7","role":"user"},"signature":"j_Zk1bFaZkkUl3p05dvnbKEIiSKm8aCSVD-JNwAtPsI"}`
3. **a product** — `GET /products` → **200** ✔ (443 ms)
   `data.0.id` = `"01M3MSNAZE6S13ANG13HA5VGE6"` · `data.0.name` = `"Combination Pliers"`
4. **add favourite** — `POST /favorites` body `{"product_id":"01M3MSNAZE6S13ANG13HA5VGE6"}` → **201** ✔ (488 ms)
   `id` = `"01m3mv1zhxptypp3jmp6j41jt2"` · `product_id` = `"01M3MSNAZE6S13ANG13HA5VGE6"`
5. **list favourites** — `GET /favorites` → **200** ✔ (484 ms)
   `length` = `1`
6. **remove favourite** — `DELETE /favorites/01m3mv1zhxptypp3jmp6j41jt2` → **204** ✔ (445 ms)
   ``
7. **delete the user (permission?)** — `DELETE /users/01m3mv1y3a6q7s74ntvmx739t8` → **403** (485 ms)
   `{"message":"Forbidden"}`

All expectations held.
