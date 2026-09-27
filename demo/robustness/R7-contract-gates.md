# R7 — Requirement-contract gates (DEMO-707)

Each tamper was made to the real DEMO-707 files, checked, then restored. After the restore the contract check reports 0 errors and integrity reports PRESERVED.

| # | Tamper | Gate | Result |
| --- | --- | --- | --- |
| T1a | `scenarios.feature` paraphrases AC-6 ("Duplicate titles are allowed.") | lint → `ac-text-drift` | ✖ rejected |
| T1b | `scenarios.feature` declares an endpoint the requirement doesn't have (`DELETE /api/users/{username}`) | lint → `endpoint-not-in-contract` | ✖ rejected |
| T2a | Contract AC-4 quote replaced with an invented criterion ("Tokens expire after 24 hours") | `contract.ts` → `quote-not-found` | ✖ rejected |
| T2b | Oracle gap G5 (invalid-offset status) "resolved" from what the AUT returns | `contract.ts` → `oracle-from-aut` | ✖ rejected |
| T2c | Same change after the freeze | `integrity.ts` → contract oracle changed → **VIOLATED** | ✖ rejected (the verdict would be INCONCLUSIVE) |
| T3 | Attachment edited after the contract was built (requirement revision) | `contract.ts` → `contract-stale` | ✖ rejected until the contract is rebuilt |

Unit coverage: `tests/contract.test.ts` (9 tests).
