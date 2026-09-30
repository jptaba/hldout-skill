# API chain — evaluations/TOOL-2/hardening/tier3/lockout.chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com/ · captured 2026-09-29T22:27:55.595Z

1. _(setup)_ **register a fresh customer** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Lock","email":"hldout-lock-n8z2oaike@example.com","password":"***redacted***"}` → **201** ✔ (726 ms)
   `{"first_name":"Hldout","last_name":"Lock","email":"hldout-lock-n8z2oaike@example.com","id":"01m3qmg7s2yfsezmpd858d5tgc","created_at":"2026-09-29 22:27:56","address":{"street":null,"house_number":null,"city":null,"state":null,"country":null,"postal_code":null}}`
2. **attempt 1, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n8z2oaike@example.com","password":"Wr0ng!pass-1"}` → **401** ✔ (545 ms)
   `{"error":"Unauthorized"}`
3. **attempt 2, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n8z2oaike@example.com","password":"Wr0ng!pass-2"}` → **401** ✔ (850 ms)
   `{"error":"Unauthorized"}`
4. **attempt 3, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n8z2oaike@example.com","password":"Wr0ng!pass-3"}` → **401** ✔ (642 ms)
   `{"error":"Unauthorized"}`
5. **attempt 4, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n8z2oaike@example.com","password":"Wr0ng!pass-4"}` → **423** ✖ expected 401 (508 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
6. **attempt 5, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n8z2oaike@example.com","password":"Wr0ng!pass-5"}` → **423** ✖ expected 401 (457 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
7. **attempt 6, correct password** — `POST /users/login` body `{"email":"hldout-lock-n8z2oaike@example.com","password":"***redacted***"}` → **423** ✔ (470 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
8. _(setup)_ **control: another fresh customer, first wrong attempt (is the lock per account?)** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Ctrl","email":"hldout-ctrl-n8z2oaike@example.com","password":"***redacted***"}` → **201** ✔ (705 ms)
   `{"first_name":"Hldout","last_name":"Ctrl","email":"hldout-ctrl-n8z2oaike@example.com","id":"01m3qmgbvbvjgdpfah8mpkxvcf","created_at":"2026-09-29 22:28:00","address":{"street":null,"house_number":null,"city":null,"state":null,"country":null,"postal_code":null}}`
9. **control: attempt 1, wrong password** — `POST /users/login` body `{"email":"hldout-ctrl-n8z2oaike@example.com","password":"Wr0ng!pass-1"}` → **401** ✔ (584 ms)
   `{"error":"Unauthorized"}`

**2 step(s) did not meet their expectation (status, expectBody or notContains).**
