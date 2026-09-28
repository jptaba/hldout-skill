# Hardening log — JS-2

**Tiers used:** tier 3 (heldout api-probe --chain, heldout accounts --from-chain / --sign-in-steps / --check --create, dry run 01-harden with --repeat-each 2).

| Change | Why | Evidence |
| --- | --- | --- |
| Profile overlays found by `init` (the cookie message and the welcome banner) | they cover the login and basket pages | init output |
| Accounts recipe: security question first (`before`), register (users named hldout-…@example.com), login, UI sign-in (G1); no delete: the chain's DELETE of the user only probed it and was answered 401 | each test registers its own customer | hardening/api-account.md |
| Basket page rows and quantity (G2); a duplicate is checked by logging in again (G3) | not stated | runs/01-harden |

Stability: 01-harden ran every test twice with 2 workers. 8 passed; the 8 failures are 4 scenarios twice each, all on `[REQ]` assertions of AC-3 (short passwords accepted) and AC-6 (another customer's basket returned): application-defect candidates, confirmed in triage.
