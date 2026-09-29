# API chain — evaluations/JS-3/hardening/repro-chain.json

- AUT: OWASP Juice Shop (profile `owasp-juice-shop`) · http://localhost:3000/ · captured 2026-09-29T12:46:04.279Z

1. _(setup)_ **security question** — `GET /api/SecurityQuestions` → **200** ✔ (59 ms)
   `{"status":"success","data":[{"id":1,"question":"Your eldest siblings middle name?","createdAt":"2026-09-29T12:36:08.865Z","updatedAt":"2026-09-29T12:36:08.865Z"},{"id":2,"question":"Mother's maiden name?","createdAt":"2026-09-29T12:36:08.865Z","updatedAt":"2026-09-29T12:36:08.865Z"},{"id":3,"questio`
2. _(setup)_ **sign up A** — `POST /api/Users` body `{"email":"hldout-a-mo6sxj8ur@example.com","password":"***redacted***","passwordRepeat":"***redacted***","securityQuestion":{"id":1},"securityAnswer":"hldout"}` → **201** ✔ (27 ms)
   `{"status":"success","data":{"username":"","role":"customer","deluxeToken":"***redacted***","lastLoginIp":"0.0.0.0","profileImage":"/assets/public/images/uploads/default.svg","isActive":true,"id":147,"email":"hldout-a-mo6sxj8ur@example.com","updatedAt":"2026-09-29T12:46:04.347Z","createdAt":"2026-09-`
3. _(setup)_ **sign in A** — `POST /rest/user/login` body `{"email":"hldout-a-mo6sxj8ur@example.com","password":"***redacted***"}` → **200** ✔ (17 ms)
   `{"authentication":{"token":"***redacted***","bid":128,"umail":"hldout-a-mo6sxj8ur@example.com"}}`
4. _(setup)_ **sign up B** — `POST /api/Users` body `{"email":"hldout-b-mo6sxj8ur@example.com","password":"***redacted***","passwordRepeat":"***redacted***","securityQuestion":{"id":1},"securityAnswer":"hldout"}` → **201** ✔ (38 ms)
   `{"status":"success","data":{"username":"","role":"customer","deluxeToken":"***redacted***","lastLoginIp":"0.0.0.0","profileImage":"/assets/public/images/uploads/default.svg","isActive":true,"id":148,"email":"hldout-b-mo6sxj8ur@example.com","updatedAt":"2026-09-29T12:46:04.391Z","createdAt":"2026-09-`
5. _(setup)_ **sign in B** — `POST /rest/user/login` body `{"email":"hldout-b-mo6sxj8ur@example.com","password":"***redacted***"}` → **200** ✔ (15 ms)
   `{"authentication":{"token":"***redacted***","bid":129,"umail":"hldout-b-mo6sxj8ur@example.com"}}`
6. **AC-4: PUT a review WITHOUT a token (401 expected)** — `PUT /rest/products/1/reviews` body `{"message":"hldout anon mo6sxj8ur","author":"hldout-a-mo6sxj8ur@example.com"}` → **201** ✖ expected 401 (5 ms)
   `{"status":"success"}`
7. **AC-6: A writes a review whose author names someone else** — `PUT /rest/products/1/reviews` body `{"message":"hldout forged mo6sxj8ur","author":"someone-else-mo6sxj8ur@example.com"}` → **201** ✔ (6 ms)
   `{"status":"success"}`
8. _(setup)_ **A writes a review (for AC-5 and AC-8)** — `PUT /rest/products/1/reviews` body `{"message":"hldout a mo6sxj8ur","author":"hldout-a-mo6sxj8ur@example.com"}` → **201** ✔ (6 ms)
   `{"status":"success"}`
9. **list the reviews (find A's review id: the last one)** — `GET /rest/products/1/reviews` → **200** ✔ (9 ms)
   `data.length` = `102`
10. **AC-5: B edits A's review (403 expected)** — `PATCH /rest/products/reviews` body `{"id":"E2GveXRoAGb68JD7W","message":"hldout edited by B mo6sxj8ur"}` → **200** ✖ expected 403 (7 ms)
   `modified` = `1` · `updated.0.message` = `"hldout edited by B mo6sxj8ur"` · `updated.0.author` = `"hldout-a-mo6sxj8ur@example.com"`
11. **AC-8: B sends three likes for A's review at once** — `POST /rest/products/reviews` body `{"id":"E2GveXRoAGb68JD7W"}` ×3 at once → **200, 200, 200** (158 ms)
   `{"modified":1,"original":[{"product":"1","message":"hldout edited by B mo6sxj8ur","author":"hldout-a-mo6sxj8ur@example.com","likesCount":3,"likedBy":[],"_id":"E2GveXRoAGb68JD7W"}],"updated":[{"product":"1","message":"hldout edited by B mo6sxj8ur","author":"hldout-a-mo6sxj8ur@example.com","likesCount`
12. **read back: the anonymous review (AC-4), the forged author (AC-6), the likes counted (AC-8)** — `GET /rest/products/1/reviews` → **200** ✔ (8 ms)
   `data.-3.message` = `"hldout anon mo6sxj8ur"` · `data.-3.author` = `"hldout-a-mo6sxj8ur@example.com"` · `data.-2.message` = `"hldout forged mo6sxj8ur"` · `data.-2.author` = `"someone-else-mo6sxj8ur@example.com"` · `data.-1.likesCount` = `3` · `data.-1.likedBy` = `["hldout-b-mo6sxj8ur@example.com","hldout-b-mo6sxj8ur@example.com","hldout-b-mo6sxj8ur@example.com"]`

**2 step(s) did not meet their expectation (status, expectBody or notContains).**
