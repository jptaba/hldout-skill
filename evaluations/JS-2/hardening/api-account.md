# API chain — evaluations/JS-2/hardening/chain-account.json

- AUT: OWASP Juice Shop (profile `owasp-juice-shop`) · http://localhost:3000/ · captured 2026-09-28T23:02:08.177Z

1. **security questions** — `GET /api/SecurityQuestions` → **200** ✔ (66 ms)
   `data.0.id` = `1` · `data.0.question` = `"Your eldest siblings middle name?"` · `data.length` = `14`
2. **register** — `POST /api/Users` body `{"email":"hldout-lur7shalu@example.com","password":"***redacted***","passwordRepeat":"***redacted***","securityQuestion":{"id":1},"securityAnswer":"heldout"}` → **201** ✔ (28 ms)
   `status` = `"success"` · `data.id` = `102` · `data.email` = `"hldout-lur7shalu@example.com"` · `data.role` = `"customer"`
3. **log in** — `POST /rest/user/login` body `{"email":"hldout-lur7shalu@example.com","password":"***redacted***"}` → **200** ✔ (19 ms)
   `authentication.token|jwt` = `{"header":{"typ":"JWT","alg":"RS256"},"payload":{"data":{"id":102,"username":"","email":"hldout-lur7shalu@example.com","password":"***redacted***","role":"customer","deluxeToken":"***redacted***","lastLoginIp":"0.0.0.0","profileImage":"/assets/public/images/uploads/default.svg","totpSecret":"***redacted***","isActive":true,"createdAt":"2026-09-28 23:02:08.256 +00:00","updatedAt":"2026-09-28 23:02:08.256 +00:00","deletedAt":null},"bid":73,"iat":1790636528},"signature":"P-QrjBQHoCKMCAOdNWOysFddJGKAPskNCmMHrTHLzdavuh-aXXB5RpfYYKkAOIJwqE5zPttqEliwWl79hahMRa6R-NiVh878YF9FdCckw7U9mgJqAPLeLY1P249bVKXH2VIp37M0DaSkcslfa1ZEaoXT1vtn7PjKZIzRgiqZy18"}` · `authentication.bid` = `73` · `authentication.umail` = `"hldout-lur7shalu@example.com"`
4. **who am I** — `GET /rest/user/whoami` → **200** (5 ms)
   `user.id` = `undefined` · `user.email` = `undefined`
5. **a product** — `GET /api/Products` → **200** ✔ (36 ms)
   `data.0.id` = `1` · `data.0.name` = `"Apple Juice (1000ml)"`
6. **add to basket** — `POST /api/BasketItems` body `{"BasketId":73,"ProductId":1,"quantity":2}` → **200** (9 ms)
   `status` = `"success"` · `data.id` = `30` · `data.quantity` = `2`
7. **read own basket** — `GET /rest/basket/73` → **200** ✔ (20 ms)
   `data.id` = `73` · `data.UserId` = `102` · `data.Products.length` = `1`
8. **remove basket item** — `DELETE /api/BasketItems/30` → **200** (23 ms)
   `status` = `"success"`
9. **delete the user (permission?)** — `DELETE /api/Users/102` → **401** (5 ms)
   `{"error":{"message":"error:1E08010C:DECODER routines::unsupported","name":"UnauthorizedError","code":"invalid_token","status":401,"inner":{"opensslErrorStack":["error:1E08010C:DECODER routines::unsupported"],"library":"DECODER routines","reason":"unsupported","code":"ERR_OSSL_UNSUPPORTED"}}}`

All expectations held.
