# API chain — output/practicesoftwaretesting/TOOL-2/hardening/tier3/logout-chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com · captured 2026-10-05T01:41:00.103Z

1. **register a new customer** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Tester","email":"hldout-ul2mo7xd1@example.com","password":"***redacted***","dob":"1990-01-01","phone":"0612345678","address":{"street":"Test Street 1","city":"Utrec` → **201** (751 ms)
   `{"first_name":"Hldout","last_name":"Tester","email":"hldout-ul2mo7xd1@example.com","dob":"1990-01-01","phone":"0612345678","id":"01m44vhbv0hr6pxx98j96mf027","created_at":"2026-10-05 01:41:00","address":{"street":"Test Street 1","house_number":null,"city":"Utrecht","state":"Utrecht","country":"NL","p`
2. **sign in** — `POST /users/login` body `{"email":"hldout-ul2mo7xd1@example.com","password":"***redacted***"}` → **200** (542 ms)
   `{"access_token":"***redacted***","token_type":"***redacted***","expires_in":300}`
3. **sign out** — `GET /users/logout` → **200** (475 ms)
   `{"message":"Successfully logged out"}`
4. **who am I with the signed-out token** — `GET /users/me` → **401** (462 ms)
   `{"message":"Unauthorized"}`

All expectations held.
