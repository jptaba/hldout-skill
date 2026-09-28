# Hardening log — DQ-2

**Tiers used:** tier 3 (heldout inspect with steps, probes and the page's own API calls; heldout api-probe --chain; heldout accounts --from-chain / --sign-in-steps / --reset; dry run 01-harden with --repeat-each 2).

| Change | Why | Evidence |
| --- | --- | --- |
| Test users: the four pre-provisioned accounts (two with passwords in .env, two entirely in Vault); `seed.account()` signs in with POST /Account/v1/GenerateToken and reads the id with POST /Account/v1/Login (G1) | the story forbids creating users; the token answer has no id, the login page's own call does | hardening/inspect-signin.md, hardening/api-account.md |
| The accounts recipe resets a user's collection (DELETE /BookStore/v1/Books?UserId=${id}) when a test takes it and after it | the story: every collection a test used is left empty | runs/01-harden (42/42) |
| UI sign-in saved in the profile (G4) | not stated | hardening/inspect-signin.md |
| /books rows, search box, detail wrappers (G2, G3); profile delete icon, confirmation dialog and OK (G5) | not stated | hardening/inspect-books.md, inspect-detail.md, runs/01-harden |

Observed, outside the requirement: POST /Account/v1/Login answers the account's password in its body (shape in hardening/inspect-signin.md).

Stability: 01-harden ran every test twice with 2 workers: 42/42.
