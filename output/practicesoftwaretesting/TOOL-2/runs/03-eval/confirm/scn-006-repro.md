# API chain — output/practicesoftwaretesting/TOOL-2/runs/03-eval/confirm/scn-006-chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com · captured 2026-10-05T01:50:26.797Z

1. _(setup)_ **register a fresh customer** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Triage","email":"hldout-triage-ulerxpesw@example.com","password":"***redacted***","dob":"1990-01-01","phone":"0612345678","address":{"street":"Test Street 1","city"` → **201** ✔ (792 ms)
   `{"first_name":"Hldout","last_name":"Triage","email":"hldout-triage-ulerxpesw@example.com","dob":"1990-01-01","phone":"0612345678","id":"01m44w2n9n28x11yxza8x2bxnd","created_at":"2026-10-05 01:50:27","address":{"street":"Test Street 1","house_number":null,"city":"Utrecht","state":"Utrecht","country":`
2. **wrong password attempt 1** — `POST /users/login` body `{"email":"hldout-triage-ulerxpesw@example.com","password":"***redacted***"}` → **401** ✔ (621 ms)
   `{"error":"Unauthorized"}`
3. **wrong password attempt 2** — `POST /users/login` body `{"email":"hldout-triage-ulerxpesw@example.com","password":"***redacted***"}` → **401** ✔ (593 ms)
   `{"error":"Unauthorized"}`
4. **wrong password attempt 3** — `POST /users/login` body `{"email":"hldout-triage-ulerxpesw@example.com","password":"***redacted***"}` → **401** ✔ (621 ms)
   `{"error":"Unauthorized"}`
5. **wrong password attempt 4** — `POST /users/login` body `{"email":"hldout-triage-ulerxpesw@example.com","password":"***redacted***"}` → **423** ✖ expected 401 (428 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
6. **wrong password attempt 5** — `POST /users/login` body `{"email":"hldout-triage-ulerxpesw@example.com","password":"***redacted***"}` → **423** ✖ expected 401 (470 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
7. **sixth attempt, correct password** — `POST /users/login` body `{"email":"hldout-triage-ulerxpesw@example.com","password":"***redacted***"}` → **423** ✔ (494 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`

**2 step(s) did not meet their expectation (status, expectBody or notContains).**
