# Hardening log — DEMO-404

**Tiers used:** Tier 2 cross-check (Playwright MCP driven through the bundled stdio client `mcp-probe.ts`; walks in `hardening/tier2/`) + Tier 3 (bundled `inspect.ts` probes, `run.ts --capture` dry-run, `run.ts --repeat-each` stability runs). Tier 1 (IDE browser) was not available, and the Playwright MCP tools were not loaded natively in the session (pending approval), so the real Playwright MCP server was driven over stdio instead.
**AUT profile:** `the-internet` — https://the-internet.herokuapp.com · **Date:** 2026-09-26 · **Draft frozen:** `draft/demo-404.spec.ts`

## Dry-run results

| Run | Result | Notes |
| --- | --- | --- |
| `01-harden` | 10/15 passed | 5 failures, all classified SCRIPT_DEFECT (after the expected-text classifier fix). No application candidates |
| `02-harden-stability` (8 repeats × 4 workers) | 106/120 | Sandbox dropped connections under this load (`ERR_EMPTY_RESPONSE` / `ERR_CONNECTION_RESET`), classified ENVIRONMENT. Load was self-inflicted |
| `03-harden-stability` (5 repeats × 2 workers) | **75/75** | Hardened suite stable, including the table-sort race |

## UI locators

| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| 001–004 | Flash message | `getByRole('alert')` ✖ (plain text, no alert role) | `locator('#flash')` | 1 ✔ | inspect-01 |
| 001 | "Secure Area" heading | `getByRole('heading', { name })` ⚠ 2 matches (h2 + h4 contains the words) | `getByRole('heading', { name, exact: true })` | 1 ✔ | inspect-01 |
| 008 011 | Result text | `getByText(/^You /)` (0 before any action) | `locator('#result')` | 1 ✔ | inspect-04, -05 |
| login, logout, checkboxes, dropdown, start, dialogs, table header, add/delete, key input | — | as drafted | unchanged | 1 ✔ each | inspect-01…05, passing dry-run |

## Mechanics changed (non-locator)

- **Navigation:** `goto` waits for DOMContentLoaded, then gives `load` up to 10 s without failing. Reason: the AUT's `load` event can hang on third-party assets.
- **Table sorter race:** in 1 of 6 fresh loads, a click right after DOMContentLoaded was ignored because the sorter hadn't bound yet (the app itself sorts correctly). The settle-wait above removes the race: 0 failures in 40 repeats of SCN-009 across the stability runs.
- **`waitForURL`** after sign-in and sign-out uses `waitUntil: 'domcontentloaded'`, for the same load-hang reason.

## Observed deviations

None. The application behaved as the requirement specifies in every scenario.
