# API chain — evaluations/DQ-2/hardening/walk-cleanup.chain.json

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) · https://demoqa.com · captured 2026-09-27T12:16:51.427Z

1. _(setup)_ **token** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq2-walk-1790511350","password":"***redacted***"}` → **200** (1798 ms)
   `{"token":"***redacted***","expires":"2026-10-04T12:16:52.102Z","status":"Success","result":"User authorized successfully."}`
2. **delete walk user** — `DELETE /Account/v1/User/6eb033d0-525d-4f9b-a73c-62a36cf2790f` → **204** ✔ (1860 ms)
   ``

All expectations held.
