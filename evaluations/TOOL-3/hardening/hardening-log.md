# Hardening log — TOOL-3

**Tiers used:** tier 3 (`inspect.ts` for the product page — contract gap G5; `run.ts --label harden --capture`).

| Scenario | Change (HOW only) | Evidence |
| --- | --- | --- |
| SCN-006 | Confirmed the cart-page row test ids (product-title, product-quantity, product-price, line-price, cart-total); TODO(harden) removed | runs/01-harden |

API mechanics needed no changes (Accept: application/json is always sent by the api fixture — gap G4).
