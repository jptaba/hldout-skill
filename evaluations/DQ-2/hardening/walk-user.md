# API chain — evaluations/DQ-2/hardening/walk-user.chain.json

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) · https://demoqa.com · captured 2026-09-27T12:15:51.073Z

1. _(setup)_ **create walk user** — `POST /Account/v1/User` body `{"userName":"qa-dq2-walk-1790511350","password":"***redacted***"}` → **201** (1707 ms)
   `userID` = `"6eb033d0-525d-4f9b-a73c-62a36cf2790f"`
2. _(setup)_ **token** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq2-walk-1790511350","password":"***redacted***"}` → **200** (1623 ms)
   `{"token":"***redacted***","expires":"2026-10-04T12:15:53.411Z","status":"Success","result":"User authorized successfully."}`
3. **add two books** — `POST /BookStore/v1/Books` body `{"userId":"6eb033d0-525d-4f9b-a73c-62a36cf2790f","collectionOfIsbns":[{"isbn":"9781449325862"},{"isbn":"9781593277574"}]}` → **201** (387 ms)
   `{"books":[{"isbn":"9781449325862"},{"isbn":"9781593277574"}]}`

All expectations held.
