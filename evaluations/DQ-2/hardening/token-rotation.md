# API chain — evaluations/DQ-2/hardening/token-rotation.chain.json

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) · https://demoqa.com · captured 2026-09-27T12:19:08.387Z

1. _(setup)_ **create user** — `POST /Account/v1/User` body `{"userName":"qa-dq2-tok-jscgrn0c9","password":"***redacted***"}` → **201** (1765 ms)
   `{"userID":"6cf5e164-a645-427d-9868-2da115a182af","username":"qa-dq2-tok-jscgrn0c9","books":[]}`
2. **token A** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq2-tok-jscgrn0c9","password":"***redacted***"}` → **200** (1677 ms)
   `{"token":"***redacted***","expires":"2026-10-04T12:19:10.770Z","status":"Success","result":"User authorized successfully."}`
3. **read with A** — `GET /Account/v1/User/6cf5e164-a645-427d-9868-2da115a182af` → **200** (313 ms)
   `username` = `"qa-dq2-tok-jscgrn0c9"`
4. **token B (a second sign-in)** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq2-tok-jscgrn0c9","password":"***redacted***"}` → **200** (1457 ms)
   `{"token":"***redacted***","expires":"2026-10-04T12:19:12.255Z","status":"Success","result":"User authorized successfully."}`
5. **read with A after B was issued** — `GET /Account/v1/User/6cf5e164-a645-427d-9868-2da115a182af` → **401** (1028 ms)
   `{"code":"1200","message":"User not authorized!"}`
6. **read with B** — `GET /Account/v1/User/6cf5e164-a645-427d-9868-2da115a182af` → **200** (351 ms)
   `username` = `"qa-dq2-tok-jscgrn0c9"`
7. **cleanup** — `DELETE /Account/v1/User/6cf5e164-a645-427d-9868-2da115a182af` → **204** (485 ms)
   ``

All expectations held.
