# Held-out Evaluation Verdict — PB-2

> **Verdict: ❌ FAIL** — 3 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-4, AC-6. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [PB-2](https://your-domain.atlassian.net/browse/PB-2) — Open a new CHECKING or SAVINGS account online |
| Application under test | ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) — UI https://parabank.parasoft.com/parabank/ · API https://parabank.parasoft.com/parabank/services/bank/ |
| Final run | `06-rerun` · 2026-09-27T12:20:54.551Z · 283s |
| Tests | 13 total · 9 passed · 4 failed · 0 flaky · 0 skipped (from 11 scenarios) |
| Held-out integrity | ✅ PRESERVED — 28 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 2 (Playwright MCP driven through heldout mcp-probe, register page snapshot) and tier 3 (heldout inspect for the register / open-account walk and locator… (see hardening log) |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-27T16:56:06.995Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Critical | AC-6 | boundary | An account is opened from a funding account holding less than 100.00 (R5 not enforced) | SCN-009.2, SCN-010.2 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Critical | AC-6 | security | POST /createAccount funds a new account from another customer's account (R4) | SCN-011 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-3 | Major | AC-4 | functional | POST /createAccount returns the new account with balance 0 instead of its opening balance 100.00 | SCN-004 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (3 root cause(s), 4 failing test(s))

### APP-1 · SCN-009.2, SCN-010.2 · AC-6 — An account is opened from a funding account holding less than 100.00 (R5 not enforced)

| | |
| --- | --- |
| Suggested severity | Critical |
| Requirement AC-6 | Opening an account follows the funding rules in account-rules.csv on the page and through the service. |
| Requirement source | account-rules.csv R5 (balance >= 100.00; channel: service) |
| Test type · layer | boundary · api |
| SCN-009.2: expected (requirement) → actual (AUT) | `2` → `3` |
| SCN-010.2: expected (requirement) → actual (AUT) | `visible` → `hidden` |
| SCN-009.2: also failed | [REQ AC-6] R5/R7: funding balance after is 99.99 — `9999` → `-1` |
| SCN-010.2: also failed | [REQ AC-6] R5: funding 99.99 → no "Account Opened!" — `hidden` → `visible` |
| SCN-010.2: also failed | [REQ AC-6] R5: accounts the same as before — `2` → `3` |
| Failing step | Then the new account is not opened |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxshzlt30`; recreate equivalent data before reproducing):

- new customer (register.htm): `{"username":"hxmujshzlux3ne","customerId":20870,"firstAccountId":33324}` · cleanup: none
- second account holding exactly 99.99: `33435` · cleanup: none
- number of accounts before: `2` · cleanup: none

**Manually (scenario steps):**

1. Given I registered a new customer who has a funding account holding exactly <funding balance>
2. When I POST /createAccount for a CHECKING account funded from that account
3. Then the new account is <outcome>
4. And the funding account's balance is <balance after>

**API pre-steps: SCN-009.2** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /parabank/services/bank/createAccount → 200`

   ```bash
   curl -i -X POST 'https://parabank.parasoft.com/parabank/services/bank/createAccount?customerId=20870&newAccountType=0&fromAccountId=33324'
   ```

P2. `GET /parabank/services/bank/accounts/33435 → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/accounts/33435'
   ```

P3. `POST /parabank/services/bank/transfer → 200`

   ```bash
   curl -i -X POST 'https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=33435&toAccountId=33324&amount=0.01'
   ```

P4. `GET /parabank/services/bank/accounts/33435 → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/accounts/33435'
   ```

P5. `GET /parabank/services/bank/customers/20870/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/20870/accounts'
   ```

**Via the API: SCN-009.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 3 (⟵) is the one that contradicts the requirement:

1. `POST /parabank/services/bank/createAccount → 200`

   ```bash
   curl -i -X POST 'https://parabank.parasoft.com/parabank/services/bank/createAccount?customerId=20870&newAccountType=0&fromAccountId=33435'
   ```

2. `GET /parabank/services/bank/customers/20870/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/20870/accounts'
   ```

3. `GET /parabank/services/bank/accounts/33435 → 200` ⟵

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/accounts/33435'
   ```

Observed response of request 3 (SCN-009.2):

```json
{"id":33435,"customerId":20870,"type":"CHECKING","balance":-0.01}
```

**API pre-steps: SCN-010.2** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /parabank/services/bank/createAccount → 200`

   ```bash
   curl -i -X POST 'https://parabank.parasoft.com/parabank/services/bank/createAccount?customerId=21647&newAccountType=0&fromAccountId=35322'
   ```

P2. `GET /parabank/services/bank/accounts/35433 → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/accounts/35433'
   ```

P3. `POST /parabank/services/bank/transfer → 200`

   ```bash
   curl -i -X POST 'https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=35433&toAccountId=35322&amount=0.01'
   ```

P4. `GET /parabank/services/bank/accounts/35433 → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/accounts/35433'
   ```

P5. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

**Via the API: SCN-010.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 11 (⟵) is the one that contradicts the requirement:

1. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

2. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

3. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

4. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

5. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

6. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

7. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

8. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

9. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

10. `GET /parabank/services/bank/customers/21647/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

11. `GET /parabank/services/bank/customers/21647/accounts → 200` ⟵

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/21647/accounts'
   ```

Observed response of request 11 (SCN-010.2):

```json
[{"id":35322,"customerId":21647,"type":"CHECKING","balance":415.51},{"id":35433,"customerId":21647,"type":"CHECKING","balance":-0.01},{"id":35544,"customerId":21647,"type":"SAVINGS","balance":100}]
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run PB-2 --label repro --grep "SCN-009\.2:"
npm run heldout -- run PB-2 --label repro --grep "SCN-010\.2:"
```

#### Evidence

- [Page/test context at failure](runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/PB-2/runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--4e633-ding-at-least-100-00-99-99--chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3, api-probe --chain, runs/05-eval/confirm/api-chain-confirm.md steps 2-5): account 18672 at 99.99 → POST createAccount → 200, new account 28107; account 18672 → -0.01.

**Evaluator's analysis:** Precondition verified: the funding account held exactly 99.99 (seed read-back). POST /createAccount from it opened a third account and left the funding account at -0.01; R5 says the account is not opened and nothing moves. Auto SCRIPT_DEFECT is a false alarm: GET /accounts/{accountId} is a declared endpoint (the matcher does not strip the API base path /parabank/services/bank).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-011 · AC-6 — POST /createAccount funds a new account from another customer's account (R4)

| | |
| --- | --- |
| Suggested severity | Critical |
| Requirement AC-6 | Opening an account follows the funding rules in account-rules.csv on the page and through the service. |
| Requirement source | account-rules.csv R4 ("one existing account of the same customer"); the expected outcome is G7 (open) |
| Test type · layer | security · api |
| SCN-011: expected (requirement) → actual (AUT) | `1` → `2` |
| SCN-011: also failed | [REQ AC-6] R4: another customer's account is not debited — `51550` → `41550` |
| Failing step | Then no new account is opened for customer A |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxskhgh70`; recreate equivalent data before reproducing):

- customer B (register.htm): `{"username":"hxmujskhgiwhsu","customerId":22424,"firstAccountId":36765}` · cleanup: none
- customer A (register.htm): `{"username":"hxmujskipn16g6","customerId":22535,"firstAccountId":36876}` · cleanup: none
- customer A account count: `1` · cleanup: none
- customer B balance: `515.5` · cleanup: none

**Manually (scenario steps):**

1. Given I registered customer A and customer B
2. And I noted the balance of customer B's account
3. When I POST /createAccount for customer A funded from customer B's account
4. Then no new account is opened for customer A
5. And customer B's account balance is unchanged

**API pre-steps: SCN-011** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /parabank/services/bank/customers/22535/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/22535/accounts'
   ```

P2. `GET /parabank/services/bank/accounts/36765 → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/accounts/36765'
   ```

**Via the API: SCN-011** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 3 (⟵) is the one that contradicts the requirement:

1. `POST /parabank/services/bank/createAccount → 200`

   ```bash
   curl -i -X POST 'https://parabank.parasoft.com/parabank/services/bank/createAccount?customerId=22535&newAccountType=0&fromAccountId=36765'
   ```

2. `GET /parabank/services/bank/customers/22535/accounts → 200`

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/customers/22535/accounts'
   ```

3. `GET /parabank/services/bank/accounts/36765 → 200` ⟵

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/accounts/36765'
   ```

Observed response of request 3 (SCN-011):

```json
{"id":36765,"customerId":22424,"type":"CHECKING","balance":415.5}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run PB-2 --label repro --grep "SCN-011:"
```

#### Evidence

- [Page/test context at failure](runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/PB-2/runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--fc1fe--another-customer-s-account-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3, api-probe --chain, evaluations/PB-2/runs/05-eval/confirm/api-chain-confirm.md steps 6-9): account 24444 belongs to customer 16652 (balance 100); POST createAccount?customerId=14099&fromAccountId=24444 → 200 new account 28218; account 24444 balance → 0; customer 14099 accounts 3 → 4.

**Evaluator's analysis:** R4: the opening deposit is moved from one existing account of the same customer. The service opened an account for customer A funded from customer B's account and debited B by 100.00. The exact refusal response is open (G7, @needs-clarification), but no reading of R4 allows debiting another customer's account. Auto SCRIPT_DEFECT (undeclared endpoint) was wrong: GET /accounts/{accountId} is declared. (Confirmed in run 05-eval; identical failure signature in 06-rerun.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-3 · SCN-004 · AC-4 — POST /createAccount returns the new account with balance 0 instead of its opening balance 100.00

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-4 | POST /createAccount for a CHECKING account answers 200 and returns the new account: its id, the customerId, type CHECKING and its opening balance (100.00). GET /accounts/{id} for the returned id answers 200 with the same values. |
| Requirement source | story AC-4, account-rules.csv R1 R6 |
| Test type · layer | functional · api |
| SCN-004: expected (requirement) → actual (AUT) | `10000` → `0` |
| SCN-004: also failed | [REQ AC-4] GET returns the same values — `{ "balance": 0, "customerId": 19427, "id": 30216, "type": "CHECKING" }` → `{ "balance": 10000, "customerId": 19427, "id": 30216, "type": "CHECKING" }` |
| Failing step | And the body is the new account with an id, the customer's customerId, type CHECKING and balance 100.00 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxsfy3r10`; recreate equivalent data before reproducing):

- new customer (register.htm): `{"username":"hxmujsfy3sw54d","customerId":19427,"firstAccountId":30105}` · cleanup: none

**Manually (scenario steps):**

1. Given I registered a new customer and know its customer id and first account id
2. When I POST /createAccount for a CHECKING account funded from the first account
3. Then the response status is 200
4. And the body is the new account with an id, the customer's customerId, type CHECKING and balance 100.00
5. When I GET /accounts/{id} for the returned id
6. Then the response status is 200
7. And it returns the same id, customerId, type and balance

**Via the API: SCN-004** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 2 (⟵) is the one that contradicts the requirement:

1. `POST /parabank/services/bank/createAccount → 200`

   ```bash
   curl -i -X POST 'https://parabank.parasoft.com/parabank/services/bank/createAccount?customerId=19427&newAccountType=0&fromAccountId=30105'
   ```

2. `GET /parabank/services/bank/accounts/30216 → 200` ⟵

   ```bash
   curl -i -X GET 'https://parabank.parasoft.com/parabank/services/bank/accounts/30216'
   ```

Observed response of request 2 (SCN-004):

```json
{"id":30216,"customerId":19427,"type":"CHECKING","balance":100}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run PB-2 --label repro --grep "SCN-004:"
```

#### Evidence

- [Page/test context at failure](runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/PB-2/runs/06-rerun/artifacts/PB-2-tests-pb-2-PB-2-Open--0e60c--GET-accounts-id-returns-it-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3, api-probe --chain, evaluations/PB-2/runs/05-eval/confirm/api-chain-confirm.md steps 3-4): POST createAccount → 200 {type CHECKING, balance 0}; GET /accounts/28107 → balance 100. Also hardening/api-chain-mechanics.md steps 3-4 (SAVINGS).

**Evaluator's analysis:** Auto-triage called this a SCRIPT_DEFECT because it matched GET /parabank/services/bank/accounts/{id} against the declared GET /accounts/{accountId} without the API base path; the endpoint is declared. The failing assertion is on the POST /createAccount body: balance 0 where AC-4/R6 require the opening balance 100.00. The account itself is funded: GET /accounts/{id} right after returns balance 100, so the 'same values' check fails from the same root cause. id, customerId and type are correct. (Confirmed in run 05-eval; identical failure signature in 06-rerun.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | The Open New Account page offers CHECKING and SAVINGS, the customer's accounts and the minimum deposit | AC-1 | functional | ✅ passed | - |
| SCN-002 | Opening a SAVINGS account on the page confirms it and links to its details | AC-2 | functional | ✅ passed | - |
| SCN-003 | After opening a CHECKING account on the page, Accounts Overview and the service show both balances | AC-3, AC-6 | integration | ✅ passed | - |
| SCN-004 | POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it | AC-4 | functional | ❌ failed | APPLICATION_DEFECT · APP-3 |
| SCN-005 | Opening through the service records the transfer on both accounts | AC-5 | functional | ✅ passed | - |
| SCN-006 | Opening on the page records the transfer on both accounts | AC-5 | integration | ✅ passed | - |
| SCN-007 | The service takes the opening deposit from the funding account the customer chose | AC-6 | functional | ✅ passed | - |
| SCN-008 | The page takes the opening deposit from the funding account the customer chose | AC-6 | functional | ✅ passed | - |
| SCN-009.1 | The service opens an account only from a funding account holding at least 100.00 (100.00) | AC-6 | boundary | ✅ passed | - |
| SCN-009.2 | The service opens an account only from a funding account holding at least 100.00 (99.99) | AC-6 | boundary | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-010.1 | The page opens an account only from a funding account holding at least 100.00 (100.00) | AC-6 | boundary | ✅ passed | - |
| SCN-010.2 | The page opens an account only from a funding account holding at least 100.00 (99.99) | AC-6 | boundary | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-011 | The service does not fund a new account from another customer's account | AC-6 | security | ❌ failed | APPLICATION_DEFECT · APP-2 |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | The Open New Account page offers exactly the account types CHECKING and SAVINGS, lists the customer's existing accounts as funding accounts, and tells the customer the minimum opening deposit from the rules ("A minimum of $100.00 must be deposited into this account at time of opening."). | SCN-001 | ✅ met |
| AC-2 | Opening a SAVINGS account funded from the customer's first account shows "Account Opened!", "Congratulations, your account is now open." and "Your new account number:" followed by the number as a link; the link opens the account's details page showing Account Type SAVINGS and a balance of $100.00. | SCN-002 | ✅ met |
| AC-3 | After opening, the new account is listed in Accounts Overview with a balance of $100.00, and the funding account's balance is lower by $100.00 than before; GET /customers/{customerId}/accounts returns the new account with the chosen type and a balance of 100.00, and the funding account with the reduced balance. | SCN-003 | ✅ met |
| AC-4 | POST /createAccount for a CHECKING account answers 200 and returns the new account: its id, the customerId, type CHECKING and its opening balance (100.00). GET /accounts/{id} for the returned id answers 200 with the same values. | SCN-004 | ❌ not met |
| AC-5 | The opening deposit is recorded as transactions per rules R8 and R9: the funding account shows a Debit of 100.00 "Funds Transfer Sent" and the new account a Credit of 100.00 "Funds Transfer Received". | SCN-005, SCN-006 | ✅ met |
| AC-6 | Opening an account follows the funding rules in account-rules.csv on the page and through the service. | SCN-003, SCN-007, SCN-008, SCN-009, SCN-010, SCN-011 (8 tests) | ❌ not met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story AC-1, account-rules.csv R1 R2 R3 | SCN-001 The Open New Account page offers CHECKING and SAVINGS, the customer's accounts and the minimum deposit | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-2** | story AC-2, account-rules.csv R2 R6 | SCN-002 Opening a SAVINGS account on the page confirms it and links to its details | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-3** | story AC-3, account-rules.csv R1 R6 R7 | SCN-003 After opening a CHECKING account on the page, Accounts Overview and the service show both balances | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-4** | story AC-4, account-rules.csv R1 R6 | SCN-004 POST /createAccount opens a CHECKING account and GET /accounts/{id} returns it | functional | api | 0/1 | ❌ fails requirement | APP-3 |
| **AC-5** | story AC-5, account-rules.csv R8 R9 (channel: service) | SCN-005 Opening through the service records the transfer on both accounts | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-5, account-rules.csv R8 R9 (channel: page) | SCN-006 Opening on the page records the transfer on both accounts | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-6** | story AC-3, account-rules.csv R1 R6 R7 | SCN-003 After opening a CHECKING account on the page, Accounts Overview and the service show both balances | integration | e2e | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-6, account-rules.csv R4 R7 (channel: service) | SCN-007 The service takes the opening deposit from the funding account the customer chose | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-6, account-rules.csv R4 R7 (channel: page) | SCN-008 The page takes the opening deposit from the funding account the customer chose | functional | e2e | 1/1 | ✅ meets requirement | - |
| ↳ | account-rules.csv R5 (balance >= 100.00; channel: service) | SCN-009 The service opens an account only from a funding account holding at least 100.00 | boundary | api | 1/2 | ❌ fails requirement | APP-1 |
| ↳ | account-rules.csv R5 (balance >= 100.00; channel: page). The error's form is G6. | SCN-010 The page opens an account only from a funding account holding at least 100.00 | boundary | e2e | 1/2 | ❌ fails requirement | APP-1 |
| ↳ | account-rules.csv R4 ("one existing account of the same customer"); the expected outcome is G7 (open) | SCN-011 The service does not fund a new account from another customer's account | security | api | 0/1 | ❌ fails requirement | APP-2 |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 2 | 4 | 2 | 2 | 0 | APP-1 |
| functional | 6 | 6 | 5 | 1 | 0 | APP-3 |
| integration | 2 | 2 | 2 | 0 | 0 | - |
| security | 1 | 1 | 0 | 1 | 0 | APP-2 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | request encoding for POST /createAccount (how customerId, newAccountType and fromAccountId are sent, and how the types CHECKING/SAVINGS are encoded in newAccountType), and confirmation that the read-back endpoints sit under the same service base /parabank/services/bank | how to exercise | AC-4, AC-5, AC-6 | discovered from the AUT (mechanics only): query parameters customerId, newAccountType (0 = CHECKING, 1 = SAVINGS), fromAccountId; base /parabank/services/bank for every endpoint |
| G2 | how a check obtains the customerId and the ids of the customer's existing accounts for the customer it registered on register.htm | how to exercise | AC-3, AC-4, AC-5, AC-6 | discovered from the AUT (mechanics only): customerId and first account id from the Accounts Overview page's own GET customers/{customerId}/accounts request after registration |
| G3 | authentication for the REST service calls (POST /createAccount and the GET read-backs): whether credentials are needed and how they are sent | how to exercise | AC-3, AC-4, AC-5, AC-6 | discovered from the AUT (mechanics only): no credentials are sent (the service accepts unauthenticated calls) |
| G4 | UI mechanics: how the registered customer is signed in, the controls on openaccount.htm (account type and funding account choices, the submit button label), the Accounts Overview route and how balances are shown, and the labels on the account details page | how to exercise | AC-1, AC-2, AC-3, AC-6 | discovered from the AUT (mechanics only): sign in by registering; #type/#fromAccountId/"Open New Account"; overview.htm table (account link, balance in column 2); activity.htm #accountType/#balance |
| G5 | how to get funding accounts with a known balance: at least 100.00 for the opening checks, and below 100.00 for the R5 rejection check (a new customer's CHECKING account has a positive balance of unstated amount) | how to exercise | AC-2, AC-3, AC-4, AC-5, AC-6 | discovered from the AUT (mechanics only): second account via POST /createAccount + POST /transfer of the difference; exact balance verified before the action |
| G6 | what "the customer gets an error" looks like when the funding account holds less than 100.00: the page message, and the service's HTTP status and body | expected behaviour | AC-6 | ❓ open |
| G7 | what must happen when the service is asked to fund the new account from an account that does not belong to the customer (R4: "one existing account of the same customer"): no outcome, status or message is stated | expected behaviour | AC-6 | ❓ open |
| G8 | how a transaction's Debit/Credit, amount and description ("Funds Transfer Sent" / "Funds Transfer Received") are represented in the GET /accounts/{accountId}/transactions response (field names) | how to exercise | AC-5 | discovered from the AUT (mechanics only): fields type (Debit/Credit), amount (number), description (string) |

**Open questions for the PO** (untested unless a scenario needing clarification below covers it):

- ❓ G6 — what "the customer gets an error" looks like when the funding account holds less than 100.00: the page message, and the service's HTTP status and body
- ❓ G7 — what must happen when the service is asked to fund the new account from an account that does not belong to the customer (R4: "one existing account of the same customer"): no outcome, status or message is stated

**Scenarios needing clarification:**

- SCN-010: The page opens an account only from a funding account holding at least 100.00
- SCN-011: The service does not fund a new account from another customer's account

**Assumptions the evaluation made:**

- "funded from the customer's first account" (AC-2) is the account created at registration, listed first among the funding accounts.
- the R5 refusal is checked through what the rule states (no new account, funding balance unchanged); on the page an error must be shown instead of the confirmation. The error's text and the service's status code are not asserted (G6).
- closing accounts is not available (story Notes), so opened accounts cannot be cleaned up; every check registers its own customer with a unique user name.

Full review: [requirement-review.md](requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 7 | 6 | 0 |
| `02-harden` (hardening dry-run) | - | - | - |
| `03-harden` (hardening dry-run) | - | - | - |
| `04-harden` (hardening dry-run) | 2 | 1 | 0 |
| `05-eval` | 9 | 4 | 0 |
| `06-rerun` (final) | 9 | 4 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/06-rerun/triage.md](runs/06-rerun/triage.md) · JUnit: runs/06-rerun/junit.xml
- HTML report: `npx playwright show-report evaluations/PB-2/runs/06-rerun/html`
