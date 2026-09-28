# API chain — evaluations/JS-2/runs/02-eval/confirm/chain-other-basket.json

- AUT: OWASP Juice Shop (profile `owasp-juice-shop`) · http://localhost:3000/ · captured 2026-09-28T23:03:25.738Z

1. _(setup)_ **security questions** — `GET /api/SecurityQuestions` → **200** ✔ (53 ms)
   `{"status":"success","data":[{"id":1,"question":"Your eldest siblings middle name?","createdAt":"2026-09-28T20:32:12.116Z","updatedAt":"2026-09-28T20:32:12.116Z"},{"id":2,"question":"Mother's maiden name?","createdAt":"2026-09-28T20:32:12.117Z","updatedAt":"2026-09-28T20:32:12.117Z"},{"id":3,"questio`
2. _(setup)_ **register A** — `POST /api/Users` body `{"email":"hldout-lusvmyu0g-a@example.com","password":"***redacted***","passwordRepeat":"***redacted***","securityQuestion":{"id":1},"securityAnswer":"hldout"}` → **201** ✔ (25 ms)
   `{"status":"success","data":{"username":"","role":"customer","deluxeToken":"***redacted***","lastLoginIp":"0.0.0.0","profileImage":"/assets/public/images/uploads/default.svg","isActive":true,"id":154,"email":"hldout-lusvmyu0g-a@example.com","updatedAt":"2026-09-28T23:03:25.801Z","createdAt":"2026-09-`
3. _(setup)_ **register B** — `POST /api/Users` body `{"email":"hldout-lusvmyu0g-b@example.com","password":"***redacted***","passwordRepeat":"***redacted***","securityQuestion":{"id":1},"securityAnswer":"hldout"}` → **201** ✔ (23 ms)
   `{"status":"success","data":{"username":"","role":"customer","deluxeToken":"***redacted***","lastLoginIp":"0.0.0.0","profileImage":"/assets/public/images/uploads/default.svg","isActive":true,"id":155,"email":"hldout-lusvmyu0g-b@example.com","updatedAt":"2026-09-28T23:03:25.827Z","createdAt":"2026-09-`
4. _(setup)_ **A logs in** — `POST /rest/user/login` body `{"email":"hldout-lusvmyu0g-a@example.com","password":"***redacted***"}` → **200** ✔ (14 ms)
   `{"authentication":{"token":"***redacted***","bid":121,"umail":"hldout-lusvmyu0g-a@example.com"}}`
5. _(setup)_ **B logs in** — `POST /rest/user/login` body `{"email":"hldout-lusvmyu0g-b@example.com","password":"***redacted***"}` → **200** ✔ (20 ms)
   `{"authentication":{"token":"***redacted***","bid":122,"umail":"hldout-lusvmyu0g-b@example.com"}}`
6. **A reads B's basket with A's token** — `GET /rest/basket/122` → **200** (25 ms)
   `status` = `"success"` · `data.id` = `122` · `data.UserId` = `155`
7. **A reads A's own basket** — `GET /rest/basket/121` → **200** ✔ (15 ms)
   `data.id` = `121` · `data.UserId` = `154`

All expectations held.
