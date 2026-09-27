# Hardening log — TOOL-1

**Tiers used:** tier 3 (`inspect.ts` for the catalogue controls — contract gap G2; `run.ts --label harden --capture --repeat-each 2`).

| Scenario | Change (HOW only) | Evidence |
| --- | --- | --- |
| SCN-001, SCN-004 | Wait for the result list to re-render after the search caption appears (the first read raced the old list) | runs/01-harden |
| SCN-007 (and all card reads) | Product cards = links that contain a `product-name`; `getByTestId(/^product-/)` also matched product-name/-price (27 elements) | runs/01-harden, runs/02-harden |

Stability: `--repeat-each 2 --workers 3` — the same 3 scenarios failed on every repeat (SCN-001 seeded script defect S6, SCN-007/008 requirement failures); no flakiness.
