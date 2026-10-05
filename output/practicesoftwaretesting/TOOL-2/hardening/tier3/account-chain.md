# API chain — output/practicesoftwaretesting/TOOL-2/hardening/tier3/account-chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com · captured 2026-10-05T01:40:29.520Z

1. **register a new customer** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Tester","email":"hldout-ul1z2owxm@example.com","password":"***redacted***","dob":"1990-01-01","phone":"0612345678","address":{"street":"Test Street 1","city":"Utrec` → **201** ✔ (872 ms)
   `{"first_name":"Hldout","last_name":"Tester","email":"hldout-ul1z2owxm@example.com","dob":"1990-01-01","phone":"0612345678","id":"01m44vge3180x89acd8vt5vkkk","created_at":"2026-10-05 01:40:30","address":{"street":"Test Street 1","house_number":null,"city":"Utrecht","state":"Utrecht","country":"NL","p`
2. **sign in** — `POST /users/login` body `{"email":"hldout-ul1z2owxm@example.com","password":"***redacted***"}` → **200** ✔ (519 ms)
   `{"access_token":"***redacted***","token_type":"***redacted***","expires_in":300}`
3. **who am I** — `GET /users/me` → **200** ✔ (475 ms)
   `{"id":"01m44vge3180x89acd8vt5vkkk","provider":null,"first_name":"Hldout","last_name":"Tester","phone":"0612345678","dob":"1990-01-01","email":"hldout-ul1z2owxm@example.com","totp_enabled":false,"created_at":"2026-10-05 01:40:30","address":{"street":"Test Street 1","house_number":null,"city":"Utrecht`

All expectations held.
