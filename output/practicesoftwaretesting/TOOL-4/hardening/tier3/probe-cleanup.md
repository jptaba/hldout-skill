# API chain — output/practicesoftwaretesting/TOOL-4/hardening/tier3/probe-cleanup.chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com · captured 2026-10-05T12:24:00.642Z

1. _(setup)_ **sign in the probe customer** — `POST /users/login` body `{"email":"hldout-probe-v7zz1puoe@example.com","password":"***redacted***"}` → **200** (601 ms)
   `{"access_token":"***redacted***","token_type":"***redacted***","expires_in":300}`
2. **list favourites** — `GET /favorites` → **200** (551 ms)
   `[{"id":"01m4609fg3smq79nz72aw55b6x","user_id":"01m4608gm07vpy7vp366jy1r03","product_id":"01M45YZK4F8P54Y5ZZ5DDEXFRF","product":{"id":"01M45YZK4F8P54Y5ZZ5DDEXFRF","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featur`
3. **remove the favourite the UI probe added** — `DELETE /favorites/01m4609fg3smq79nz72aw55b6x` → **204** ✔ (718 ms)
   ``

All expectations held.
