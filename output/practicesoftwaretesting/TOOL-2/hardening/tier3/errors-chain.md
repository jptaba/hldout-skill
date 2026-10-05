# API chain — output/practicesoftwaretesting/TOOL-2/hardening/tier3/errors-chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com · captured 2026-10-05T01:40:54.532Z

1. **register a new customer** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Tester","email":"hldout-ul2idgtou@example.com","password":"***redacted***","dob":"1990-01-01","phone":"0612345678","address":{"street":"Test Street 1","city":"Utrec` → **201** (827 ms)
   `{"first_name":"Hldout","last_name":"Tester","email":"hldout-ul2idgtou@example.com","dob":"1990-01-01","phone":"0612345678","id":"01m44vh6fk9jtc2533ng38q6zq","created_at":"2026-10-05 01:40:55","address":{"street":"Test Street 1","house_number":null,"city":"Utrecht","state":"Utrecht","country":"NL","p`
2. **register the same e-mail again (409 shape)** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Tester","email":"hldout-ul2idgtou@example.com","password":"***redacted***","dob":"1990-01-01","phone":"0612345678","address":{"street":"Test Street 1","city":"Utrec` → **409** (545 ms)
   `{"email":["A customer with this email address already exists."]}`
3. **register with password abc (422 shape)** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Tester","email":"hldout-ul2idgtou-weak@example.com","password":"abc","dob":"1990-01-01","phone":"0612345678","address":{"street":"Test Street 1","city":"Utrecht","s` → **422** (443 ms)
   `{"password":["The password field must be at least 8 characters.","The password field must contain at least one uppercase and one lowercase letter.","The password field must contain at least one symbol.","The password field must contain at least one number."]}`
4. **wrong password 1** — `POST /users/login` body `{"email":"hldout-ul2idgtou@example.com","password":"Wrong-pass-1x"}` → **401** (549 ms)
   `{"error":"Unauthorized"}`
5. **wrong password 2** — `POST /users/login` body `{"email":"hldout-ul2idgtou@example.com","password":"Wrong-pass-2x"}` → **401** (544 ms)
   `{"error":"Unauthorized"}`
6. **wrong password 3** — `POST /users/login` body `{"email":"hldout-ul2idgtou@example.com","password":"Wrong-pass-3x"}` → **401** (509 ms)
   `{"error":"Unauthorized"}`
7. **wrong password 4** — `POST /users/login` body `{"email":"hldout-ul2idgtou@example.com","password":"Wrong-pass-4x"}` → **423** (430 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
8. **wrong password 5** — `POST /users/login` body `{"email":"hldout-ul2idgtou@example.com","password":"Wrong-pass-5x"}` → **423** (481 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`
9. **correct password after five failures (423 shape)** — `POST /users/login` body `{"email":"hldout-ul2idgtou@example.com","password":"***redacted***"}` → **423** (493 ms)
   `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`

All expectations held.
