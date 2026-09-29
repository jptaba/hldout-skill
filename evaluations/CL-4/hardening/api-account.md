# API chain — evaluations/CL-4/hardening/chain-account.json

- AUT: Contact List App (profile `thinking-tester-contact-list`) · https://thinking-tester-contact-list.herokuapp.com/ · captured 2026-09-29T11:12:07.218Z

1. **sign up** — `POST /users` body `{"firstName":"QA","lastName":"Heldout","email":"hldout-mktzcihr9@example.com","password":"***redacted***"}` → **201** ✔ (425 ms)
   `{"user":{"_id":"6abb9d072f701c0015676b56","firstName":"QA","lastName":"Heldout","email":"hldout-mktzcihr9@example.com","__v":1},"token":"***redacted***"}`
2. **log in** — `POST /users/login` body `{"email":"hldout-mktzcihr9@example.com","password":"***redacted***"}` → **200** ✔ (202 ms)
   `{"user":{"_id":"6abb9d072f701c0015676b56","firstName":"QA","lastName":"Heldout","email":"hldout-mktzcihr9@example.com","__v":2},"token":"***redacted***"}`
3. **delete the user** — `DELETE /users/me` → **200** ✔ (63 ms)
   ``

All expectations held.
