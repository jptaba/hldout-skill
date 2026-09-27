# Hardening log — DEMO-505

**Tiers used:** Tier 3 (`inspect.ts` probes, `run.ts --capture` dry-run, `--repeat-each` stability run). Tier 1/2 browser tools were not loaded in this session.
**AUT profile:** `the-internet` · **Date:** 2026-09-26 · **Draft frozen:** `draft/demo-505.spec.ts`

| Run | Result | Notes |
| --- | --- | --- |
| `01-harden` | 3/6 | The 3 failures were locator mechanics: 2 NEEDS_INVESTIGATION, and 1 initially auto-classified APPLICATION. That false positive led to the `toHaveCount → 0 = element not found` classifier fix; it is now NEEDS_INVESTIGATION |
| `02-harden-check` | 6/6 | after hardening |
| `03-harden-stability` (3 repeats) | 18/18 | stable |

## UI locators

| Scenario | Element | Draft locator | Hardened locator | Verified | Evidence |
| --- | --- | --- | --- | --- | --- |
| 001 | Avatar N | `getByRole('img', { name: 'User Avatar' }).nth(N-1)` | scoped to its figure: `locator('.figure').nth(N-1).getByRole('img', …)` | 1 ✔ | inspect-01 |
| 001 | "View profile" of avatar N | global `getByRole('link', …).nth(N-1)` ✖ (links of non-hovered figures are hidden, so only 1 is exposed) | `locator('.figure').nth(N-1).getByRole('link', { name: 'View profile' })` | 1 ✔ | inspect-01 |
| 004 | Notification | `getByRole('alert')` ✖ 0 | `locator('#flash')` | 1 ✔ | DEMO-606 inspect-01 (same page) |

## Observed deviations

None. AC-3 is ambiguous ("appropriate"), so it was tested literally and tagged `@needs-clarification`. The open question (auto-dismiss) was not tested.
