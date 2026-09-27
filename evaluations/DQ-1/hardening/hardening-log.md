# Hardening log — DQ-1
**Tiers used:** tier 2 (Playwright MCP driven through `heldout mcp-probe`, its own stdio server — the session's shared `mcp__playwright__*` browser was deliberately not used because other evaluators run in parallel) for the UI walks; tier 3 (`heldout inspect` for locator probes, `heldout api-probe` single/chain calls, `heldout run --label harden --capture`) for locators and every API mechanic; plus a small black-box script (`confirm-ac7.ts`) to decode the JWT, which `api-probe` cannot do. Tier 1 (IDE browser tool): not available in this session.
**AUT profile:** demoqa — https://demoqa.com (UI and API) · **Date:** 2026-09-27 · **Draft frozen:** draft/dq-1.spec.ts

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-009/010/011/012/018/019 | user name field | `getByRole('textbox', { name: /user ?name/i })` | `getByRole('textbox', { name: 'UserName', exact: true })` | 1 match, visible | inspect-login.md, tier2/signin-logout.md |
| SCN-009/010/011/012/018/019 | password field | `getByLabel(/password/i)` (0 matches: the label is not associated) | `getByRole('textbox', { name: 'Password', exact: true })` | 1 match, visible | inspect-login.md, tier2/signin-logout.md |
| SCN-009/010/011/012/018/019 | Login button | `getByRole('button', { name: 'Login' })` | `getByRole('button', { name: 'Login', exact: true })` (exact: avoids the "Login" nav link / future overlaps) | 1 match | inspect-login.md |
| SCN-012 | Logout button | `getByRole('button', { name: 'Logout' })` | `getByRole('button', { name: 'Logout', exact: true })` | present in profile snapshot | tier2/signin-logout.md step 8 |
| SCN-009 | "User Name :" + name | body text regex (no locator guess) | unchanged | profile snapshot shows `"User Name :"` followed by the name element | tier2/signin-logout.md |
| SCN-010/018 | error message | `getByText('Invalid username or password!', { exact: true })` | unchanged | paragraph rendered in the form below the buttons | tier2/wrong-and-empty.md |
| SCN-019 | invalid marking | class/aria-invalid check | unchanged | passed in runs 01-harden and 02-harden (×3) | runs/02-harden |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| G6 GenerateToken body `{ userName, password }` → `{ token, expires, status, result }` | ✔ | api-mechanics.md step 3 |
| G2 error body `{ code, message }` (message field = `message`) | ✔ | api-mechanics.md step 2 |
| G9 DELETE `/Account/v1/User/{UUID}` with `Authorization: Bearer <token>` → 204 | ✔ | api-mechanics.md step 5, cleanup.chain.json |
| Authorized answers a bare JSON boolean | ✔ | api-mechanics.md step 4 |
| Seeding/cleanup (create → token → DELETE) | ✔ | runs/01-harden, runs/02-harden seed ledgers |

Contract: G2, G5, G6, G9 recorded as `discovered-in-aut` with this evidence; `requestFields: ["userName","password"]` added to POST /Account/v1/User, /GenerateToken, /Authorized. `heldout contract DQ-1` stays clean and reviewed.

## Mechanics changed (non-locator)
- None beyond the locators and removing the `TODO(harden)` markers on the confirmed API mechanics (G2/G6/G9 were drafted correctly).

## Stability
- `run --label harden --capture` (01-harden): 24 passed, 3 failed (all `[REQ]` deviations below).
- `run --label harden --repeat-each 3 --workers 2` (02-harden): 72 passed, 9 failed = the same 3 tests × 3, 0 flaky.

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-006.1 | GenerateToken with a wrong password → **401** (PO clarification, story.md#L75) | **200** with `{"token":null,"expires":null,"status":"Failed","result":"User authorization failed."}` (body as required) | confirm-ac6.md step 2 |
| SCN-006.2 | GenerateToken with an unknown user name → **401** (story.md#L75) | **200**, same body | confirm-ac6.md step 3 |
| SCN-007 | the token must not reveal the password in any part (AC-7) | the JWT payload has the claims `userName`, `password`, `iat`; `password` holds the user's cleartext password | confirm-ac7.md (script confirm-ac7.ts; the password itself is never printed) |
