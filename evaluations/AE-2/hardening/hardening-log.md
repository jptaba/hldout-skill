# Hardening log — AE-2
**Tiers used:** Tier 2 via `heldout mcp-probe` (bundled stdio client driving its own Playwright MCP server: login walk, `hardening/tier2/login.md`); Tier 3 (`heldout inspect` probes for every final locator, `heldout api-probe --chain` for every API mechanic). Tier 1 (IDE browser) not available in this session; the session's native `mcp__playwright__*` tools were deliberately not used because other evaluators share that browser.
**AUT profile:** automation-exercise — https://automationexercise.com (UI and API) · **Date:** 2026-09-27 · **Draft frozen:** draft/ae-2.spec.ts

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-023..026 | "Login to your account" form | `locator('form').filter({ has: getByPlaceholder('Email Address') }).filter({ hasNot: getByPlaceholder('Name') })` | `locator('form').filter({ has: getByRole('button', { name: 'Login', exact: true }) })` | 1 match, visible | inspect-login-form.md |
| SCN-023..026 | e-mail input | `form.getByPlaceholder('Email Address')` | unchanged (scoped to the login form; page has a second "Email Address" in the signup form) | 1 match | inspect-login-form.md, tier2/login.md |
| SCN-023..026 | password input | `form.getByPlaceholder('Password')` | unchanged | 1 match | inspect-login-form.md, tier2/login.md |
| SCN-023..026 | Login button | `form.getByRole('button', { name: 'Login' })` | `form.getByRole('button', { name: 'Login', exact: true })` | 1 match | inspect-login-form.md |
| SCN-023, SCN-024 | "Logged in as <name>" | `locator('header').getByText('Logged in as <name>')` | unchanged | 1 match, visible | inspect-logged-in.md, tier2/login.md |
| SCN-025, SCN-026 | "Your email or password is incorrect!" | `getByText('Your email or password is incorrect!')` | unchanged | 1 match, visible, URL stays /login | inspect-login-wrong.md |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| POST /api/createAccount, form-encoded body, HTTP 200 + `responseCode`/`message` envelope | ✔ | api-lifecycle.md step 1 |
| GET /api/getUserDetailByEmail?email= (query string), `user` object | ✔ | api-lifecycle.md steps 2, 5, 8 |
| POST /api/verifyLogin form body | ✔ | api-lifecycle.md step 3 |
| PUT /api/updateAccount form body (partial) | ✔ | api-lifecycle.md steps 4-5 |
| DELETE /api/verifyLogin form body | ✔ | api-lifecycle.md step 6 |
| DELETE /api/deleteAccount form body (used for cleanup too) | ✔ | api-lifecycle.md step 7, ui-cleanup.chain.json |
| Stability: `run AE-2 --label harden --repeat-each 3 --workers 2` | ✔ same 6 failures in all 3 repeats, 0 flaky; every cleanup `done` | runs/02-harden |

## Mechanics changed (non-locator)
- Login form scoping changed from "form with Email Address but no Name" to "form holding the exact Login button" (clearer, probed).
- Contract: G2 recorded as `discovered-in-aut` with evidence; `entryPoint` `/login` added to AC-10..AC-12.

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-013, SCN-014 | AC-7: user object has every contract field incl. `mobile_number`, holding the registration value | `user` has no `mobile_number` field | api-lifecycle.md step 2; runs/01-harden, 02-harden |
| SCN-004 | AC-3: address differing only in letter case → responseCode 400 "Email already exists!" | responseCode 201 (second account created) | runs/01-harden, 02-harden |
| SCN-006 | AC-5: e-mail without "@" → responseCode 400, not created | responseCode 201 | runs/01-harden, 02-harden |
| SCN-007.1, SCN-007.2 (@needs-clarification) | AC-5: invalid e-mail ("x@", "@x.example.com") → 400 | responseCode 201 | runs/01-harden, 02-harden |
