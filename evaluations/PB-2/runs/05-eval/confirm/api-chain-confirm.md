# API chain — evaluations/PB-2/runs/05-eval/confirm/chain.json

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) · https://parabank.parasoft.com/parabank/services/bank/ · captured 2026-09-27T12:20:11.418Z

1. _(setup)_ **customer 14099 accounts before** — `GET /parabank/services/bank/customers/14099/accounts` → **200** (329 ms)
   `length` = `2`
2. _(setup)_ **funding account 18672 balance (99.99 expected)** — `GET /parabank/services/bank/accounts/18672` → **200** (132 ms)
   `customerId` = `14099` · `balance` = `99.99`
3. **SCN-004/R5: open CHECKING from the 99.99 account** — `POST /parabank/services/bank/createAccount?customerId=14099&newAccountType=0&fromAccountId=18672` → **200** (132 ms)
   `id` = `28107` · `customerId` = `14099` · `type` = `"CHECKING"` · `balance` = `0`
4. **read the new account back** — `GET /parabank/services/bank/accounts/28107` → **200** (124 ms)
   `id` = `28107` · `customerId` = `14099` · `type` = `"CHECKING"` · `balance` = `100`
5. **R5: funding account after** — `GET /parabank/services/bank/accounts/18672` → **200** (140 ms)
   `balance` = `-0.01`
6. _(setup)_ **account 24444 owner and balance (another customer)** — `GET /parabank/services/bank/accounts/24444` → **200** (142 ms)
   `customerId` = `16652` · `balance` = `100`
7. **R4: open for customer 14099 funded from another customer's account** — `POST /parabank/services/bank/createAccount?customerId=14099&newAccountType=0&fromAccountId=24444` → **200** (140 ms)
   `id` = `28218` · `customerId` = `14099` · `type` = `"CHECKING"` · `balance` = `0`
8. **R4: other customer's account after** — `GET /parabank/services/bank/accounts/24444` → **200** (131 ms)
   `customerId` = `16652` · `balance` = `0`
9. **customer 14099 accounts after** — `GET /parabank/services/bank/customers/14099/accounts` → **200** (124 ms)
   `length` = `4`

All expectations held.
