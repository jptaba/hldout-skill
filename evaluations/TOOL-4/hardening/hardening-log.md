# Hardening log — TOOL-4

**Tiers used:** tier 3 (heldout api-probe --chain, heldout inspect with probes and the page's own API calls, heldout accounts --from-chain / --sign-in-steps, dry run 01-harden with --repeat-each 2).

| Change | Why | Evidence |
| --- | --- | --- |
| Accounts recipe: register (users named hldout-…@example.com) + login + UI sign-in (G4); no delete: the chain's DELETE of the account only probed it and was answered 403, so accounts are kept, named by the prefix | each test signs in as its own customer | hardening/api-account.md |
| Product lookup, response fields, product page button, favourites page (G2, G3, G5, G6) | not stated | hardening/api-account.md, inspect-product.md |
| TODO(harden) markers removed; locators unchanged | every scenario passed twice in 01-harden | runs/01-harden (22/22) |
