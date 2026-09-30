# API chain — evaluations/TOOL-2/hardening/tier3/accounts.chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com/ · captured 2026-09-29T22:25:00.087Z

1. **create a test customer** — `POST /users/register` body `{"first_name":"Hldout","last_name":"Tester","email":"hldout-n8vb93nqp@example.com","password":"***redacted***"}` → **201** ✔ (771 ms)
   `{"first_name":"Hldout","last_name":"Tester","email":"hldout-n8vb93nqp@example.com","id":"01m3qmawdnqazehjx2bpfamanx","created_at":"2026-09-29 22:25:00","address":{"street":null,"house_number":null,"city":null,"state":null,"country":null,"postal_code":null}}`
2. **sign the customer in** — `POST /users/login` body `{"email":"hldout-n8vb93nqp@example.com","password":"***redacted***"}` → **200** ✔ (579 ms)
   `{"access_token":"***redacted***","token_type":"***redacted***","expires_in":300}`
3. **can the customer delete itself?** — `DELETE /users/01m3qmawdnqazehjx2bpfamanx` → **403** (544 ms)
   `{"message":"Forbidden"}`

All expectations held.
