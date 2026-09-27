# API chain — evaluations/DQ-1/hardening/confirm-ac6.chain.json

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) · https://demoqa.com · captured 2026-09-27T05:58:32.289Z

1. _(setup)_ **P1 create account** — `POST /Account/v1/User` body `{"userName":"qa-dq1-confirm6-jer0bl3vt","password":"***redacted***"}` → **201** ✔ (1819 ms)
   `{"userID":"0d53a49d-ca4a-42e9-8dc1-cd4811bffb64","username":"qa-dq1-confirm6-jer0bl3vt","books":[]}`
2. **AC-6 GenerateToken, wrong password (expect 401)** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq1-confirm6-jer0bl3vt","password":"***redacted***"}` → **200** ✖ expected 401 (1549 ms)
   `{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}`
3. **AC-6 GenerateToken, unknown user name (expect 401)** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq1-confirm6-jer0bl3vt-unknown","password":"***redacted***"}` → **200** ✖ expected 401 (856 ms)
   `{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}`
4. _(setup)_ **cleanup token** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq1-confirm6-jer0bl3vt","password":"***redacted***"}` → **200** (800 ms)
   `status` = `"Success"`
5. _(setup)_ **cleanup delete** — `DELETE /Account/v1/User/0d53a49d-ca4a-42e9-8dc1-cd4811bffb64` → **204** ✔ (1356 ms)
   ``

**2 step(s) did not return the expected status.**
