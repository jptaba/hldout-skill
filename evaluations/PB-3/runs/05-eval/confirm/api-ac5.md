# API chain — evaluations/PB-3/runs/05-eval/confirm/api-ac5.chain.json

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) · https://parabank.parasoft.com/parabank/services/bank/ · captured 2026-09-27T13:09:09.472Z

1. _(setup)_ **balance of A before** — `GET /parabank/services/bank/accounts/17673` → **200** (310 ms)
   `balance` = `415.5`
2. _(setup)_ **balance of B before** — `GET /parabank/services/bank/accounts/17784` → **200** (151 ms)
   `balance` = `100`
3. **transfer amount 0** — `POST /parabank/services/bank/transfer?fromAccountId=17673&toAccountId=17784&amount=0` → **200** (138 ms)
   `Successfully transferred $0 from account #17673 to account #17784`
4. **balance of A after 0** — `GET /parabank/services/bank/accounts/17673` → **200** (189 ms)
   `balance` = `415.5`
5. **balance of B after 0** — `GET /parabank/services/bank/accounts/17784` → **200** (137 ms)
   `balance` = `100`
6. **transfer amount -10.00** — `POST /parabank/services/bank/transfer?fromAccountId=17673&toAccountId=17784&amount=-10.00` → **200** (135 ms)
   `Successfully transferred $-10.00 from account #17673 to account #17784`
7. **balance of A after -10.00** — `GET /parabank/services/bank/accounts/17673` → **200** (134 ms)
   `balance` = `425.5`
8. **balance of B after -10.00** — `GET /parabank/services/bank/accounts/17784` → **200** (126 ms)
   `balance` = `90`

All expectations held.
