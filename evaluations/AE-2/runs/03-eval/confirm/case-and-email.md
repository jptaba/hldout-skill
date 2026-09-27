# API chain — evaluations/AE-2/runs/03-eval/confirm/case-and-email.chain.json

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · https://automationexercise.com · captured 2026-09-27T06:08:36.251Z

1. _(setup)_ **create lower-case customer** — `POST /api/createAccount` body `name=QA+Confirm&email=hxconfirm.case.c1%40example.com&password=***redacted***&firstname=Asha&lastname=Rao&address1=12+MG+Road&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=` → **200** (579 ms)
   `responseCode` = `201` · `message` = `"User created!"`
2. **AC-3: create same address upper-cased** — `POST /api/createAccount` body `name=QA+Confirm&email=HXCONFIRM.CASE.C1%40EXAMPLE.COM&password=***redacted***&firstname=Asha&lastname=Rao&address1=12+MG+Road&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=` → **200** (635 ms)
   `responseCode` = `201` · `message` = `"User created!"`
3. **AC-3: read upper-cased address** — `GET /api/getUserDetailByEmail?email=HXCONFIRM.CASE.C1@EXAMPLE.COM` → **200** (174 ms)
   `responseCode` = `200` · `user.id` = `2937273` · `user.email` = `"HXCONFIRM.CASE.C1@EXAMPLE.COM"`
4. **AC-3: read lower-case address** — `GET /api/getUserDetailByEmail?email=hxconfirm.case.c1@example.com` → **200** (175 ms)
   `responseCode` = `200` · `user.id` = `2937272` · `user.email` = `"hxconfirm.case.c1@example.com"` · `user.mobile_number` = `undefined`
5. **AC-5: create with no @** — `POST /api/createAccount` body `name=QA+Confirm&email=hxconfirm.noat.c1.example.com&password=***redacted***&firstname=Asha&lastname=Rao&address1=12+MG+Road&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=98` → **200** (158 ms)
   `responseCode` = `201` · `message` = `"User created!"`
6. **AC-5: read no-@ address** — `GET /api/getUserDetailByEmail?email=hxconfirm.noat.c1.example.com` → **200** (154 ms)
   `responseCode` = `200` · `user.email` = `"hxconfirm.noat.c1.example.com"`
7. **AC-5: create with no domain** — `POST /api/createAccount` body `name=QA+Confirm&email=hxconfirm.nodomain.c1%40&password=***redacted***&firstname=Asha&lastname=Rao&address1=12+MG+Road&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000` → **200** (174 ms)
   `responseCode` = `201` · `message` = `"User created!"`
8. **AC-5: create with no local part** — `POST /api/createAccount` body `name=QA+Confirm&email=%40hxconfirm.nolocal.c1.example.com&password=***redacted***&firstname=Asha&lastname=Rao&address1=12+MG+Road&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_num` → **200** (202 ms)
   `responseCode` = `201` · `message` = `"User created!"`
9. _(setup)_ **cleanup upper** — `DELETE /api/deleteAccount` body `email=HXCONFIRM.CASE.C1%40EXAMPLE.COM&password=***redacted***` → **200** (183 ms)
   `responseCode` = `200` · `message` = `"Account deleted!"`
10. _(setup)_ **cleanup lower** — `DELETE /api/deleteAccount` body `email=hxconfirm.case.c1%40example.com&password=***redacted***` → **200** (274 ms)
   `responseCode` = `200` · `message` = `"Account deleted!"`
11. _(setup)_ **cleanup no-@** — `DELETE /api/deleteAccount` body `email=hxconfirm.noat.c1.example.com&password=***redacted***` → **200** (263 ms)
   `responseCode` = `200` · `message` = `"Account deleted!"`
12. _(setup)_ **cleanup no domain** — `DELETE /api/deleteAccount` body `email=hxconfirm.nodomain.c1%40&password=***redacted***` → **200** (509 ms)
   `responseCode` = `200` · `message` = `"Account deleted!"`
13. _(setup)_ **cleanup no local** — `DELETE /api/deleteAccount` body `email=%40hxconfirm.nolocal.c1.example.com&password=***redacted***` → **200** (484 ms)
   `responseCode` = `200` · `message` = `"Account deleted!"`

All expectations held.
