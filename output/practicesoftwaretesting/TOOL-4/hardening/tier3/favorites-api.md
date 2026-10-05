# API chain — output/practicesoftwaretesting/TOOL-4/hardening/tier3/favorites-api.chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com · captured 2026-10-05T12:22:47.341Z

1. _(setup)_ **register a customer (accounts recipe)** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Tester","email":"hldout-probe-v7zz1puoe@example.com","password":"***redacted***","dob":"1990-01-01","phone":"0612345678","address":{"street":"Test Street 1","city":` → **201** (891 ms)
   `{"first_name":"Hldout","last_name":"Tester","email":"hldout-probe-v7zz1puoe@example.com","dob":"1990-01-01","phone":"0612345678","id":"01m4608gm07vpy7vp366jy1r03","created_at":"2026-10-05 12:22:48","address":{"street":"Test Street 1","house_number":null,"city":"Utrecht","state":"Utrecht","country":"`
2. _(setup)_ **sign in** — `POST /users/login` body `{"email":"hldout-probe-v7zz1puoe@example.com","password":"***redacted***"}` → **200** (561 ms)
   `{"access_token":"***redacted***","token_type":"***redacted***","expires_in":300}`
3. **first catalogue product (G1)** — `GET /products?page=1` → **200** (465 ms)
   `data.0.id` = `"01M45YZK4F8P54Y5ZZ5DDEXFRF"` · `data.0.name` = `"Combination Pliers"`
4. **add favourite** — `POST /favorites` body `{"product_id":"01M45YZK4F8P54Y5ZZ5DDEXFRF"}` → **201** (466 ms)
   `{"product_id":"01M45YZK4F8P54Y5ZZ5DDEXFRF","user_id":"01m4608gm07vpy7vp366jy1r03","id":"01m4608j5p29gp00k76xnyvwhg"}`
5. **list favourites** — `GET /favorites` → **200** (475 ms)
   `[{"id":"01m4608j5p29gp00k76xnyvwhg","user_id":"01m4608gm07vpy7vp366jy1r03","product_id":"01M45YZK4F8P54Y5ZZ5DDEXFRF","product":{"id":"01M45YZK4F8P54Y5ZZ5DDEXFRF","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featur`
6. **remove favourite** — `DELETE /favorites/01m4608j5p29gp00k76xnyvwhg` → **204** (464 ms)
   ``

All expectations held.
