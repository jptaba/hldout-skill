# API chain — evaluations/PB-2/hardening/api-chain-mechanics.json

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) · https://parabank.parasoft.com/parabank/services/bank/ · captured 2026-09-27T12:03:58.586Z

1. **read the first account (no credentials)** — `GET /parabank/services/bank/accounts/18561` → **200** (334 ms)
   `id` = `18561` · `customerId` = `14099` · `type` = `"CHECKING"` · `balance` = `515.5`
2. **list the customer's accounts** — `GET /parabank/services/bank/customers/14099/accounts` → **200** (137 ms)
   `length` = `1`
3. **open SAVINGS with newAccountType=1** — `POST /parabank/services/bank/createAccount?customerId=14099&newAccountType=1&fromAccountId=18561` → **200** (131 ms)
   `id` = `18672` · `customerId` = `14099` · `type` = `"SAVINGS"` · `balance` = `0`
4. **read it back** — `GET /parabank/services/bank/accounts/18672` → **200** (143 ms)
   `id` = `18672` · `customerId` = `14099` · `type` = `"SAVINGS"` · `balance` = `100`
5. **funding account after** — `GET /parabank/services/bank/accounts/18561` → **200** (139 ms)
   `balance` = `415.5`
6. **transactions of new account** — `GET /parabank/services/bank/accounts/18672/transactions` → **200** (136 ms)
   `[{"id":24688,"accountId":18672,"type":"Credit","date":1790467200000,"amount":100,"description":"Funds Transfer Received"}]`
7. **transactions of funding account** — `GET /parabank/services/bank/accounts/18561/transactions` → **200** (195 ms)
   `[{"id":24577,"accountId":18561,"type":"Debit","date":1790467200000,"amount":100,"description":"Funds Transfer Sent"}]`
8. **transfer 0.01 back to funding (seed mechanic)** — `POST /parabank/services/bank/transfer?fromAccountId=18672&toAccountId=18561&amount=0.01` → **200** (156 ms)
   `Successfully transferred $0.01 from account #18672 to account #18561`
9. **new account after transfer** — `GET /parabank/services/bank/accounts/18672` → **200** (136 ms)
   `balance` = `99.99`

All expectations held.
