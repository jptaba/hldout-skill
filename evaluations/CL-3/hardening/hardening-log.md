# Hardening log — CL-3

**Tiers used:** tier 3 (heldout api-probe --chain, heldout inspect with steps, probes and the page's own API calls, heldout accounts --from-chain / --sign-in-steps with a live check, dry run 01-harden with --repeat-each 2).

| Change | Why | Evidence |
| --- | --- | --- |
| Accounts recipe: sign-up (token in the answer), login, DELETE /users/me, UI sign-in (G4) | each test signs up its own user (story Test data) | hardening/api-account.md, inspect-login.md |
| Contact List row, details values, edit fields, #error, buttons by name (G1–G5) | not stated | hardening/inspect-details.md, inspect-edit.md, api-contact.md |
| openDetails waits for the contact to be shown, not only for the URL (the test guide now says so) | the page wires its buttons after loading the contact | hardening/inspect-details.md |

Stability: 01-harden ran every test twice with 4 workers: 40/40.
