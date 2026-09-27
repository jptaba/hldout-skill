# API chain — evaluations/DQ-2/hardening/api-mechanics.chain.json

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) · https://demoqa.com · captured 2026-09-27T12:14:05.051Z

1. **G1 create user with {userName,password}** — `POST /Account/v1/User` body `{"userName":"qa-dq2-probe-js5ypnzkw","password":"***redacted***"}` → **201** (1636 ms)
   `userID` = `"da572a41-f348-40eb-96b0-a73399fd071c"` · `username` = `"qa-dq2-probe-js5ypnzkw"` · `books` = `[]`
2. **token** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq2-probe-js5ypnzkw","password":"***redacted***"}` → **200** (1508 ms)
   `status` = `"Success"` · `result` = `"User authorized successfully."` · `expires` = `"2026-10-04T12:14:07.296Z"`
3. **add two books** — `POST /BookStore/v1/Books` body `{"userId":"da572a41-f348-40eb-96b0-a73399fd071c","collectionOfIsbns":[{"isbn":"9781449325862"},{"isbn":"9781593277574"}]}` → **201** (339 ms)
   `{"books":[{"isbn":"9781449325862"},{"isbn":"9781593277574"}]}`
4. **read user** — `GET /Account/v1/User/da572a41-f348-40eb-96b0-a73399fd071c` → **200** (977 ms)
   `books.length` = `2` · `userId` = `"da572a41-f348-40eb-96b0-a73399fd071c"` · `username` = `"qa-dq2-probe-js5ypnzkw"`
5. **delete one book** — `DELETE /BookStore/v1/Book` body `{"isbn":"9781449325862","userId":"da572a41-f348-40eb-96b0-a73399fd071c"}` → **204** (488 ms)
   ``
6. **read user again** — `GET /Account/v1/User/da572a41-f348-40eb-96b0-a73399fd071c` → **200** (218 ms)
   `books.length` = `1`
7. **cleanup: delete user** — `DELETE /Account/v1/User/da572a41-f348-40eb-96b0-a73399fd071c` → **204** (987 ms)
   ``

All expectations held.
