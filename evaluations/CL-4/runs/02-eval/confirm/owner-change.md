# API chain — evaluations/CL-4/runs/02-eval/confirm/chain-owner.json

- AUT: Contact List App (profile `thinking-tester-contact-list`) · https://thinking-tester-contact-list.herokuapp.com/ · captured 2026-09-29T11:16:44.648Z

1. _(setup)_ **sign up user A** — `POST /users` body `{"firstName":"Hldout","lastName":"A","email":"hldout-mkzxewzg6-a@example.com","password":"***redacted***"}` → **201** ✔ (355 ms)
   `{"user":{"_id":"6abb9e1db45a2a0015047822","firstName":"Hldout","lastName":"A","email":"hldout-mkzxewzg6-a@example.com","__v":1},"token":"***redacted***"}`
2. _(setup)_ **sign up user B** — `POST /users` body `{"firstName":"Hldout","lastName":"B","email":"hldout-mkzxewzg6-b@example.com","password":"***redacted***"}` → **201** ✔ (207 ms)
   `{"user":{"_id":"6abb9e1db45a2a0015047824","firstName":"Hldout","lastName":"B","email":"hldout-mkzxewzg6-b@example.com","__v":1},"token":"***redacted***"}`
3. _(setup)_ **A adds Secret Sam** — `POST /contacts` body `{"firstName":"Secret","lastName":"Sam"}` → **201** ✔ (66 ms)
   `{"_id":"6abb9e1db45a2a0015047826","firstName":"Secret","lastName":"Sam","owner":"6abb9e1db45a2a0015047822","__v":0}`
4. **A sets the owner to B with PATCH** — `PATCH /contacts/6abb9e1db45a2a0015047826` body `{"owner":"6abb9e1db45a2a0015047824"}` → **200** (65 ms)
   `owner` = `"6abb9e1db45a2a0015047824"`
5. **A reads Secret Sam** — `GET /contacts/6abb9e1db45a2a0015047826` → **404** (70 ms)
   ``
6. **B's list** — `GET /contacts` → **200** (90 ms)
   `length` = `1` · `0.firstName` = `"Secret"` · `0.lastName` = `"Sam"` · `0.owner` = `"6abb9e1db45a2a0015047824"`
7. _(setup)_ **cleanup: B deletes the contact** — `DELETE /contacts/6abb9e1db45a2a0015047826` → **200** (72 ms)
   `Contact deleted`
8. _(setup)_ **cleanup: delete user A** — `DELETE /users/me` → **200** (68 ms)
   ``
9. _(setup)_ **cleanup: delete user B** — `DELETE /users/me` → **200** (67 ms)
   ``

All expectations held.
