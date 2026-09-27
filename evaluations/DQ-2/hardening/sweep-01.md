# API chain — evaluations/DQ-2/hardening/sweep-01.chain.json

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) · https://demoqa.com · captured 2026-09-27T12:19:35.752Z

1. _(setup)_ **token qa-dq2-mujsahektkxgw** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq2-mujsahektkxgw","password":"***redacted***"}` → **200** (1974 ms)
   `{"token":"***redacted***","expires":"2026-10-04T12:19:36.449Z","status":"Success","result":"User authorized successfully."}`
2. **delete qa-dq2-mujsahektkxgw** — `DELETE /Account/v1/User/90a50561-7dc5-441e-9232-c6aee34f78c9` → **204** ✔ (1844 ms)
   ``
3. _(setup)_ **token qa-dq2-mujsakzdle5vc** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq2-mujsakzdle5vc","password":"***redacted***"}` → **200** (1352 ms)
   `{"token":"***redacted***","expires":"2026-10-04T12:19:39.685Z","status":"Success","result":"User authorized successfully."}`
4. **delete qa-dq2-mujsakzdle5vc** — `DELETE /Account/v1/User/ff4f9b65-3a7c-4829-9254-5ccee4d31c8f` → **204** ✔ (1138 ms)
   ``
5. _(setup)_ **token qa-dq2-mujsb986lrsfa** — `POST /Account/v1/GenerateToken` body `{"userName":"qa-dq2-mujsb986lrsfa","password":"***redacted***"}` → **200** (1368 ms)
   `{"token":"***redacted***","expires":"2026-10-04T12:19:42.171Z","status":"Success","result":"User authorized successfully."}`
6. **delete qa-dq2-mujsb986lrsfa** — `DELETE /Account/v1/User/eb7c7e3a-2e50-4686-bf52-da369a9e704f` → **204** ✔ (1263 ms)
   ``

All expectations held.
