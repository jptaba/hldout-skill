# API chain — evaluations/TOOL-2/hardening/tier3/identity.chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com/ · captured 2026-09-29T22:24:39.720Z

1. **register a new customer** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Tester","email":"hldout-n8uvjcd5r@example.com","password":"***redacted***"}` → **201** ✔ (1797 ms)
   `{"first_name":"Hldout","last_name":"Tester","email":"hldout-n8uvjcd5r@example.com","id":"01m3qma9hk4yx5k1ne2ed5yh4d","created_at":"2026-09-29 22:24:41","address":{"street":null,"house_number":null,"city":null,"state":null,"country":null,"postal_code":null}}`
2. **sign in** — `POST /users/login` body `{"email":"hldout-n8uvjcd5r@example.com","password":"***redacted***"}` → **200** (512 ms)
   `{"access_token":"***redacted***","token_type":"***redacted***","expires_in":300}`
3. **who am I** — `GET /users/me` → **200** (486 ms)
   `{"id":"01m3qma9hk4yx5k1ne2ed5yh4d","provider":null,"first_name":"Hldout","last_name":"Tester","phone":null,"dob":null,"email":"hldout-n8uvjcd5r@example.com","totp_enabled":false,"created_at":"2026-09-29 22:24:41","address":{"street":null,"house_number":null,"city":null,"state":null,"country":null,"p`
4. **sign out** — `GET /users/logout` → **200** (481 ms)
   `{"message":"Successfully logged out"}`
5. **who am I after sign-out** — `GET /users/me` → **401** (601 ms)
   `{"message":"Unauthorized"}`
6. **weak password (where are the password errors?)** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Tester","email":"hldout-n8uvjcd5r-weak@example.com","password":"abc"}` → **422** (510 ms)
   `{"password":["The password field must be at least 8 characters.","The password field must contain at least one uppercase and one lowercase letter.","The password field must contain at least one symbol.","The password field must contain at least one number."]}`

All expectations held.
