# API chain — evaluations/DQ-2/hardening/chain-account.json

- AUT: demosite (profile `demoqa`) · https://demoqa.com/ · captured 2026-09-28T19:23:12.106Z

1. **sign in (token)** — `POST /Account/v1/GenerateToken` body `{"userName":"***redacted***","password":"***redacted***"}` → **200** ✔ (1925 ms)
   `{"token":"***redacted***","expires":"2026-10-05T19:23:12.932Z","status":"Success","result":"User authorized successfully."}`
2. **the account id (as the login page reads it)** — `POST /Account/v1/Login` body `{"userName":"***redacted***","password":"***redacted***"}` → **200** ✔ (937 ms)
   `{"userId":"6e276455-1354-4799-b6ff-8fe70fd227aa","username":"***redacted***","password":"***redacted***","token":"***redacted***","expires":"2026-10-05T19:23:12.000Z","created_date":"2026-09-28T19:14:21.000Z","isActive":false}`
3. **read my collection** — `GET /Account/v1/User/6e276455-1354-4799-b6ff-8fe70fd227aa` → **200** ✔ (1037 ms)
   `books` = `[]`
4. **empty my collection (the reset)** — `DELETE /BookStore/v1/Books?UserId=6e276455-1354-4799-b6ff-8fe70fd227aa` → **204** ✔ (215 ms)
   ``
5. **empty it again (idempotent?)** — `DELETE /BookStore/v1/Books?UserId=6e276455-1354-4799-b6ff-8fe70fd227aa` → **204** (230 ms)
   ``

All expectations held.
