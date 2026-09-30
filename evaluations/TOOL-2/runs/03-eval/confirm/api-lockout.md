# API chain — evaluations/TOOL-2/hardening/tier3/lockout.chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com/ · captured 2026-09-29T22:32:09.859Z

1. _(setup)_ **register a fresh customer** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Lock","email":"hldout-lock-n94iv71xd@example.com","password":"***redacted***"}` → **201** ✔ (1042 ms)
   `{"first_name":"Hldout","last_name":"Lock","email":"hldout-lock-n94iv71xd@example.com","id":"01m3qmr0bjcb9dy8zwzw62nqx2","created_at":"2026-09-29 22:32:10","address":{"street":null,"house_number":null,"city":null,"state":null,"country":null,"postal_code":null}}`
2. **attempt 1, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n94iv71xd@example.com","password":"Wr0ng!pass-1"}` → **401** ✔ (563 ms)
   `{"error":"Unauthorized"}`
3. **attempt 2, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n94iv71xd@example.com","password":"Wr0ng!pass-2"}` → **401** ✔ (544 ms)
   `{"error":"Unauthorized"}`
4. **attempt 3, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n94iv71xd@example.com","password":"Wr0ng!pass-3"}` → **401** ✔ (522 ms)
   `{"error":"Unauthorized"}`
5. **attempt 4, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n94iv71xd@example.com","password":"Wr0ng!pass-4"}` → **423** ✖ expected 401 (501 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
6. **attempt 5, wrong password** — `POST /users/login` body `{"email":"hldout-lock-n94iv71xd@example.com","password":"Wr0ng!pass-5"}` → **423** ✖ expected 401 (609 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
7. **attempt 6, correct password** — `POST /users/login` body `{"email":"hldout-lock-n94iv71xd@example.com","password":"***redacted***"}` → **423** ✔ (620 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
8. _(setup)_ **control: another fresh customer, first wrong attempt (is the lock per account?)** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Ctrl","email":"hldout-ctrl-n94iv71xd@example.com","password":"***redacted***"}` → **201** ✔ (822 ms)
   `{"first_name":"Hldout","last_name":"Ctrl","email":"hldout-ctrl-n94iv71xd@example.com","id":"01m3qmr4dew3ryhg5fkby99zxy","created_at":"2026-09-29 22:32:15","address":{"street":null,"house_number":null,"city":null,"state":null,"country":null,"postal_code":null}}`
9. **control: attempt 1, wrong password** — `POST /users/login` body `{"email":"hldout-ctrl-n94iv71xd@example.com","password":"Wr0ng!pass-1"}` → **401** ✔ (594 ms)
   `{"error":"Unauthorized"}`

**2 step(s) did not meet their expectation (status, expectBody or notContains).**
