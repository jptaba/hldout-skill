# API chain — D:/projects/heldout-rounds/reviews-qa/evaluations/JS-3/hardening/chain-account.json

- AUT: OWASP Juice Shop (profile `owasp-juice-shop`) · http://localhost:3000/ · captured 2026-09-29T12:43:11.701Z

1. **security questions (the sign-up form loads them)** — `GET /api/SecurityQuestions` → **200** ✔ (60 ms)
   `{"status":"success","data":[{"id":1,"question":"Your eldest siblings middle name?","createdAt":"2026-09-29T12:36:08.865Z","updatedAt":"2026-09-29T12:36:08.865Z"},{"id":2,"question":"Mother's maiden name?","createdAt":"2026-09-29T12:36:08.865Z","updatedAt":"2026-09-29T12:36:08.865Z"},{"id":3,"questio`
2. **sign up** — `POST /api/Users` body `{"email":"hldout-mo33rpe09@example.com","password":"***redacted***","passwordRepeat":"***redacted***","securityQuestion":{"id":1},"securityAnswer":"hldout"}` → **201** ✔ (37 ms)
   `data.email` = `"hldout-mo33rpe09@example.com"`
3. **sign in** — `POST /rest/user/login` body `{"email":"hldout-mo33rpe09@example.com","password":"***redacted***"}` → **200** ✔ (22 ms)
   `token|jwt` = `undefined`
4. **write a review (probe)** — `PUT /rest/products/1/reviews` body `{"message":"hldout probe mo33rpe09","author":"hldout-mo33rpe09@example.com"}` → **201** ✔ (11 ms)
   `{"status":"success"}`

All expectations held.
