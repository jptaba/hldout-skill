# Hardening log — CL-4

**Tiers used:** tier 3 (heldout api-probe --chain, heldout accounts --from-chain / --sign-in-steps with a live check, dry run 01-harden with --repeat-each 2).

| Change | Why | Evidence |
| --- | --- | --- |
| Accounts recipe: sign-up (users named hldout-…@example.com, token in the answer), login, DELETE /users/me, UI sign-in | users "A" and "B" are made per test (story Test data) | hardening/api-account.md |
| Contact body {firstName, lastName}, `_id`, `owner`; the list as an array; the Contact List rows (G1, G2) | not stated | runs/01-harden |
| TODO(harden) markers removed; nothing else changed | every scenario ran twice with 4 workers; the only failure is SCN-007.2 (PATCH changes the owner), both times, on its `[REQ]` assertion | runs/01-harden (32 passed, 2 failed) |

After signing out (SCN-003) the account's token no longer works; the fixture takes a new one for the cleanup (DELETE /users/me).
