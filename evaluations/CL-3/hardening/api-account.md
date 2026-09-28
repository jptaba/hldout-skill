# API chain — evaluations/CL-3/hardening/chain-account.json

- AUT: Contact List App (profile `thinking-tester-contact-list`) · https://thinking-tester-contact-list.herokuapp.com/ · captured 2026-09-28T19:11:55.843Z

1. **sign up** — `POST /users` body `{"firstName":"QA","lastName":"Heldout","email":"qa-lmj64j3lz@example.com","password":"***redacted***"}` → **201** ✔ (584 ms)
   `{"user":{"_id":"6ababbfca857860015460f41","firstName":"QA","lastName":"Heldout","email":"qa-lmj64j3lz@example.com","__v":1},"token":"***redacted***"}`
2. **log in** — `POST /users/login` body `{"email":"qa-lmj64j3lz@example.com","password":"***redacted***"}` → **200** ✔ (533 ms)
   `{"user":{"_id":"6ababbfca857860015460f41","firstName":"QA","lastName":"Heldout","email":"qa-lmj64j3lz@example.com","__v":2},"token":"***redacted***"}`
3. **delete the user** — `DELETE /users/me` → **200** ✔ (105 ms)
   ``

All expectations held.
