# API chain — evaluations/DQ-1/hardening/mechanics.chain.json

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) · https://demoqa.com · captured 2026-09-27T05:45:17.210Z

1. _(setup)_ **create account** — `POST /Account/v1/User` body `{"userName":"qa-dq1-probe-je9yu228b","password":"***redacted***"}` → **201** (1661 ms)
   `userID` = `"2acfa5e5-db33-4003-aa69-062f09630312"` · `username` = `"qa-dq1-probe-je9yu228b"` · `books` = `[]`
2. **G2 error body shape (duplicate)** — `POST /Account/v1/User` body `{"userName":"qa-dq1-probe-je9yu228b","password":"***redacted***"}` → **406** (812 ms)
   `{"code":"1204","message":"User exists!"}`
3. **G6 GenerateToken body { userName, password }** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq1-probe-je9yu228b","password":"***redacted***"}` → **200** (1313 ms)
   `status` = `"Success"` · `result` = `"User authorized successfully."` · `expires` = `"2026-10-04T05:45:19.983Z"`
4. **Authorized after token** — `POST /Account/v1/Authorized` body `{"userName":"qa-dq1-probe-je9yu228b","password":"***redacted***"}` → **200** (233 ms)
   `true`
5. **G9 DELETE with Authorization: Bearer** — `DELETE /Account/v1/User/2acfa5e5-db33-4003-aa69-062f09630312` → **204** (1303 ms)
   ``
6. **GenerateToken after delete** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq1-probe-je9yu228b","password":"***redacted***"}` → **200** (1299 ms)
   `{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}`

All expectations held.
