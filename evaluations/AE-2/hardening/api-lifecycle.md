# API chain — evaluations/AE-2/hardening/lifecycle.chain.json

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · https://automationexercise.com · captured 2026-09-27T06:02:46.705Z

1. **create** — `POST /api/createAccount` body `name=QA+Probe&email=hxprobe.lifecycle.a1%40example.com&password=***redacted***&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme+QA&address1=12+MG+Road` → **200** ✔ (597 ms)
   `responseCode` = `201` · `message` = `"User created!"`
2. **read** — `GET /api/getUserDetailByEmail?email=hxprobe.lifecycle.a1@example.com` → **200** ✔ (486 ms)
   `responseCode` = `200` · `user` = `{"id":2937098,"name":"QA Probe","email":"hxprobe.lifecycle.a1@example.com","title":"Mrs","birth_day":"12","birth_month":"March","birth_year":"1991","first_name":"Asha","last_name":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","state":"Karnataka","city":"Bengaluru","zipcode":"560001"}`
3. **verify** — `POST /api/verifyLogin` body `email=hxprobe.lifecycle.a1%40example.com&password=***redacted***` → **200** ✔ (161 ms)
   `responseCode` = `200` · `message` = `"User exists!"`
4. **update** — `PUT /api/updateAccount` body `email=hxprobe.lifecycle.a1%40example.com&password=***redacted***&name=QA+Probe+Renamed&city=Mysuru` → **200** ✔ (173 ms)
   `responseCode` = `200` · `message` = `"User updated!"`
5. **read after update** — `GET /api/getUserDetailByEmail?email=hxprobe.lifecycle.a1@example.com` → **200** ✔ (166 ms)
   `responseCode` = `200` · `user` = `{"id":2937098,"name":"QA Probe Renamed","email":"hxprobe.lifecycle.a1@example.com","title":"Mrs","birth_day":"12","birth_month":"March","birth_year":"1991","first_name":"Asha","last_name":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","state":"Karnataka","city":"Mysuru","zipcode":"560001"}`
6. **verifyLogin DELETE** — `DELETE /api/verifyLogin` body `email=hxprobe.lifecycle.a1%40example.com&password=***redacted***` → **200** ✔ (157 ms)
   `responseCode` = `405` · `message` = `"This request method is not supported."`
7. **delete** — `DELETE /api/deleteAccount` body `email=hxprobe.lifecycle.a1%40example.com&password=***redacted***` → **200** ✔ (524 ms)
   `responseCode` = `200` · `message` = `"Account deleted!"`
8. **read after delete** — `GET /api/getUserDetailByEmail?email=hxprobe.lifecycle.a1@example.com` → **200** ✔ (269 ms)
   `responseCode` = `404` · `message` = `"Account not found with this email, try another email!"`

All expectations held.
