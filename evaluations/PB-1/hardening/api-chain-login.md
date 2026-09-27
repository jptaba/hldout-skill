# API chain — evaluations/PB-1/hardening/api-chain-login.json

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) · https://parabank.parasoft.com/parabank/services/bank/ · captured 2026-09-27T05:42:37.007Z

1. **login JSON** — `GET /parabank/services/bank/login/pb1h487730/***redacted***` → **200** (440 ms)
   `{"id":14987,"firstName":"Hana","lastName":"Probe","address":{"street":"12 Heldout Lane","city":"Testville","state":"CA","zipCode":"94016"},"phoneNumber":"5551234567","ssn":"123-45-6789"}`
2. **login XML (Accept */*)** — `GET /parabank/services/bank/login/pb1h487730/***redacted***` → **200** (132 ms)
   `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><customer><id>14987</id><firstName>Hana</firstName><lastName>Probe</lastName><address><street>12 Heldout Lane</street><city>Testville</city><state>CA</state><zipCode>94016</zipCode></address><phoneNumber>5551234567</phoneNumber><ssn>123-45-6789<`
3. **login wrong password** — `GET /parabank/services/bank/login/pb1h487730/Wr0ngPw-hx71` → **400** (146 ms)
   `Invalid username and/or password`
4. **customer by id (no auth)** — `GET /parabank/services/bank/customers/14987` → **200** (386 ms)
   `{"id":14987,"firstName":"Hana","lastName":"Probe","address":{"street":"12 Heldout Lane","city":"Testville","state":"CA","zipCode":"94016"},"phoneNumber":"5551234567","ssn":"123-45-6789"}`
5. **accounts of customer (no auth)** — `GET /parabank/services/bank/customers/14987/accounts` → **200** (139 ms)
   `[{"id":16341,"customerId":14987,"type":"CHECKING","balance":500000.5}]`
6. **login unknown user** — `GET /parabank/services/bank/login/pb1h487730zz/***redacted***` → **400** (135 ms)
   `Invalid username and/or password`

All expectations held.
