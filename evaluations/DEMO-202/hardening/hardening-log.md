# Hardening log — DEMO-202

**Tiers used:** Tier 2 cross-check (Playwright MCP driven through the bundled stdio client `mcp-probe.ts`; walks in `hardening/tier2/`) + Tier 3 (bundled inspector `inspect.ts` for UI, `api-probe.ts` for API, `run.ts --capture` dry-run). Tier 1 (IDE browser) was not available, and the Playwright MCP tools were not loaded natively in the session (pending approval), so the real Playwright MCP server was driven over stdio instead.
**AUT profile:** `shady-meadows` — https://automationintesting.online (UI and API) · **Date:** 2026-09-26
**Draft frozen:** `draft/demo-202.spec.ts` (before any AUT contact)

The first dry-run (`runs/01-harden`) failed 16 tests. Triage separated 6 script-mechanics failures (fixed below) from 10 requirement deviations (left unchanged).

## UI locators

| Scenario(s) | Element | Draft locator (guess) | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| 001 | Form heading | `getByRole('heading', { name: 'Send Us a Message' })` | unchanged | 1 ✔ | inspect-01 |
| 002 004 014 | Name / Email / Phone / Subject inputs | `getByLabel(field, { exact: true })` | `getByRole('textbox', { name: field, exact: true })` | 1 ✔ each | inspect-01 |
| 002 004 014 | Message input | `getByLabel('Message')` ✖ 0 (no accessible name) | `getByTestId('ContactDescription')` | 1 ✔ | inspect-01 |
| all UI | Submit | `getByRole('button', { name: 'Submit' })` | unchanged | 1 ✔ | inspect-01 |
| 003 004 | Validation errors | `getByRole('alert')` ⚠ matched an **empty** live region | `locator('.alert-danger')` | 1 ✔ (lists every error) | inspect-02 |
| 002 014 | Confirmation heading | `getByRole('heading', { name: /Thanks for getting in touch/ })` | unchanged | 1 ✔ | inspect-03 |
| 002 | Confirmation body | `locator('section, div').filter(…).last()` (fragile) | `locator('.card-body').filter({ has: confirmation heading })` | 1 ✔ | inspect-03 |
| 018 019 | Room card by type | `locator('.room-card').filter({ has: heading type })` | unchanged | 3 cards, 1 per type ✔ | inspect-01 |

The strict accessible-name assertions in SCN-001 (`[REQ AC-1 strict]`) are requirement assertions, not mechanics, so they were **not** touched.

## API mechanics

| Item | Verified | Evidence |
| --- | --- | --- |
| Endpoint paths exactly as declared (`/api/message`, `/api/message/{id}`, `/api/auth/login`, `/api/room`, `/api/room/{id}`) | ✔ all respond | api-04 … api-09 |
| Staff auth = cookie `token` from `POST /api/auth/login` → `token` field | ✔ authenticated list returns 200 | api-07 |
| Error body of `POST /api/message` = JSON array of strings | ✔ | earlier dry-run exchanges (`runs/01-harden`) |

## Mechanics changed (non-locator)

- Message field is filled via its test id (the field is not exposed by accessible name).
- The error container is `.alert-danger`. The page also has an always-empty `role=alert` live region, which the draft matched by mistake.

## Observed deviations (assertions intentionally left unchanged)

| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-001 (AC-1) | Message field has an associated, announced label | textarea has no accessible name (label not associated) | inspect-01 probes |
| SCN-005 (AC-5) | 201 Created | 200 | api-04 |
| SCN-006.1 / .4 (AC-4/6) | Name 2–50 characters | 1 and 51 characters accepted (200) | dry-run exchanges |
| SCN-006.17 (AC-4/6) | `guest@example` (no TLD) invalid | accepted (200) | dry-run exchanges |
| SCN-008 (AC-7) | Malformed JSON → 400, never 5xx | 500 `{"error":"Failed to create message"}` | api-05 |
| SCN-009 / 010 (AC-8) | List/detail need a staff token → 401 | 200 with full data, no token needed | api-06 |
| SCN-017 (AC-12) | Unknown room → 404 | 500 Internal Server Error | api-08 |
| SCN-019 (AC-14) | Image alt = "<Type> Room" per card | every card image is "Single Room" | dry-run failure |
