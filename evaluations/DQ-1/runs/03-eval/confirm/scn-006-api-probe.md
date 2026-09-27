# API chain — evaluations/DQ-1/hardening/confirm-ac6.chain.json

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) · https://demoqa.com · captured 2026-09-27T06:00:55.322Z

1. _(setup)_ **P1 create account** — `POST /Account/v1/User` body `{"userName":"qa-dq1-confirm6-jeu2oqlkj","password":"***redacted***"}` → **201** ✔ (1592 ms)
   `{"userID":"38823be7-e4f5-469f-ad02-da3a6369a19b","username":"qa-dq1-confirm6-jeu2oqlkj","books":[]}`
2. **AC-6 GenerateToken, wrong password (expect 401)** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq1-confirm6-jeu2oqlkj","password":"***redacted***"}` → **200** ✖ expected 401 (1489 ms)
   `{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}`
3. **AC-6 GenerateToken, unknown user name (expect 401)** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq1-confirm6-jeu2oqlkj-unknown","password":"***redacted***"}` → **200** ✖ expected 401 (1032 ms)
   `{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}`
4. _(setup)_ **cleanup token** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq1-confirm6-jeu2oqlkj","password":"***redacted***"}` → **200** (1110 ms)
   `status` = `"Success"`
5. _(setup)_ **cleanup delete** — `DELETE /Account/v1/User/38823be7-e4f5-469f-ad02-da3a6369a19b` → **204** ✔ (1272 ms)
   ``

**2 step(s) did not return the expected status.**
