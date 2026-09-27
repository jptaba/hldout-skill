# Requirement review — PB-3: Transfer funds between my own accounts

Written from `requirement/story.md` and `requirement-contract.json` only, before any access to the AUT.

## Sources used

| Source | Contributes |
| --- | --- |
| story.md — description (L17–L21) | the journey (Transfer Funds page `transfer.htm`, REST `POST …/services/bank/transfer?fromAccountId&toAccountId&amount`), read-backs (Accounts Overview, Account Activity, `GET /accounts/{id}`, `GET /accounts/{id}/transactions`, `Accept: application/json`), test-data strategy (own customer per scenario, password from `PB_USER_PASSWORD`, A = first account, B = opened with "Open New Account") |
| story.md — Gherkin AC-1…AC-7 (L23–L78) | the acceptance criteria, literal messages, amounts and statuses |
| story.md — out of scope (L80) | transfers to other customers' accounts are not tested |
| story.md — PO comment 2026-09-26 (L86–L91) | replaces AC-6: an overdrawing transfer between own accounts **completes**; A goes negative by the difference, B is credited in full. AC-4 and AC-5 unchanged |
| attachments | none |

## Testability decisions

| Clause | How it is verified |
| --- | --- |
| "a newly registered customer who owns accounts A and B" | each test registers its own customer (unique user name, password `${env:PB_USER_PASSWORD}`) and opens B with "Open New Account" inside `seed.create` (BLOCKED if it fails). A = the customer's first account |
| "the balances of A and B are known" | read immediately before the action (API `GET /accounts/{id}` for API-checked ACs; Accounts Overview for AC-1) |
| AC-1 "Accounts Overview shows the balance … lower/higher by $25.50" and "total unchanged" | Accounts Overview is read before and after the transfer; differences compared to the cent |
| AC-2 / AC-6 / AC-7 balance deltas | `GET /accounts/{id}` before and after; numeric delta compared to the cent |
| AC-3 transactions | `GET /accounts/{id}/transactions` of A and B after a UI transfer; a matching entry must exist (type, amount, description); Account Activity of A shows the row with `$25.50` in the Debit (-) column |
| AC-4 "the form stays on screen with the message" + "no balance changes" | the message is visible, the amount field/Transfer button are still visible, "Transfer Complete!" is not shown; balances of A and B read via API before and after are equal |
| AC-5 "the transfer is refused" (G2: form of refusal unstated) | page: "Transfer Complete!" does not appear within a bounded wait after pressing Transfer; service: the answer is not the AC-2 success confirmation. In both cases the balances of A and B are unchanged (read via the API). No status code or message is asserted |
| AC-6 (replaced by PO) | precondition check: A's balance < 1000.00 (plain precondition). Through the service: 200 and the AC-2 confirmation for 1000.00; on the page: "Transfer Complete!" (the contract's outcome for the page). Then A = before − 1000.00 (negative) and B = before + 1000.00 |
| AC-7 | service answers 400 with the exact text; A's balance unchanged |

## Ambiguities / open questions

| # | Item | Handling |
| --- | --- | --- |
| G1 | AC-6 as written vs the PO comment | the PO comment is the later, explicit replacement → tested as replaced (overdraft completes). Recorded as ASSUMPTION in the feature |
| G2 | what "refused" looks like for 0 / −10.00 (message, status) | OPEN-QUESTION; only the requirement-backed outcomes are asserted (no success confirmation, balances unchanged) |
| AC-6 page | the contract says AC-6 applies "on the page or through the service" ("same confirmation on the page, 200 from the service") → one API and one UI scenario |
| confirmation text for AC-6 through the service | "same confirmation … as any other transfer" read as the AC-2 text for the amount 1000.00. The story gives no format for amounts ≥ 1000, so both `$1000.00` and `$1,000.00` are accepted (ASSUMPTION in the feature); everything else in the sentence is exact |
| G3–G8 | mechanics (REST base, auth, UI controls, account numbers, JSON fields, starting balance) | discovered during hardening, recorded in the contract as `discovered-in-aut` |

## Revisions

None (revision as fetched).
