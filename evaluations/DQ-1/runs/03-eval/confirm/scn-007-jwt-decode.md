# AC-7 live confirmation — 2026-09-27T06:01:02.838Z

- account: `qa-dq1-confirm-mujeu8hi` (created and deleted by this script)
- P1 POST /Account/v1/User → 201
- P2 POST /Account/v1/GenerateToken → 200, status "Success"
- token has 3 dot-separated part(s)
- header: contains the password: **no** · claims: alg, typ
- payload: contains the password: **YES** · claims: userName, password (= the password), iat
- signature: contains the password: **no**
- raw token string contains the password: no
- cleanup DELETE /Account/v1/User/{UUID} → 204
