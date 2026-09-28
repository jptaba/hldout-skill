# API chain — evaluations/JS-2/runs/02-eval/confirm/chain-short-password.json

- AUT: OWASP Juice Shop (profile `owasp-juice-shop`) · http://localhost:3000/ · captured 2026-09-28T23:03:24.807Z

1. _(setup)_ **security questions** — `GET /api/SecurityQuestions` → **200** ✔ (58 ms)
   `{"status":"success","data":[{"id":1,"question":"Your eldest siblings middle name?","createdAt":"2026-09-28T20:32:12.116Z","updatedAt":"2026-09-28T20:32:12.116Z"},{"id":2,"question":"Mother's maiden name?","createdAt":"2026-09-28T20:32:12.117Z","updatedAt":"2026-09-28T20:32:12.117Z"},{"id":3,"questio`
2. **register with a 4-character password** — `POST /api/Users` body `{"email":"hldout-lusux3jwt-a@example.com","password":"abcd","passwordRepeat":"abcd","securityQuestion":{"id":1},"securityAnswer":"hldout"}` → **201** ✖ expected 400 (29 ms)
   `status` = `"success"` · `data.id` = `152` · `data.email` = `"hldout-lusux3jwt-a@example.com"`
3. **log in with it (the customer exists?)** — `POST /rest/user/login` body `{"email":"hldout-lusux3jwt-a@example.com","password":"abcd"}` → **200** (27 ms)
   `authentication.bid` = `120`
4. **register with a 3-character password** — `POST /api/Users` body `{"email":"hldout-lusux3jwt-b@example.com","password":"abc","passwordRepeat":"abc","securityQuestion":{"id":1},"securityAnswer":"hldout"}` → **201** ✖ expected 400 (35 ms)
   `status` = `"success"` · `data.id` = `153`

**2 step(s) did not meet their expectation (status, expectBody or notContains).**
