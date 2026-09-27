# Hardening log — PB-1
**Tiers used:** tier 2 (Playwright MCP through the bundled stdio client `heldout mcp-probe`, own server; the session's native `mcp__playwright__*` tools were deliberately not used because parallel evaluators share that browser) and tier 3 (`heldout inspect` with `--steps-json`/`--probe`, `heldout api-probe --chain`, `heldout run --label harden --capture`). Tier 1 (IDE browser tool) is not available in this session. Tier 2 could only drive named controls: every ParaBank text input is unnamed (labels are separate table cells), so form filling was done with tier 3.
**AUT profile:** parabank — https://parabank.parasoft.com/parabank/ (REST https://parabank.parasoft.com/parabank/services/bank/) · **Date:** 2026-09-27 · **Draft frozen:** draft/pb-1.spec.ts

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| all registering scenarios | registration inputs (First Name … Confirm) | `getByLabel('<label>')` | `locator('[id="customer.firstName"]')` … `locator('[id="customer.password"]')`, `locator('[id="repeatedPassword"]')` (inputs have no accessible name) | 1 match each | inspect-register-empty.md, inspect-register-valid.md |
| SCN-001, SCN-005 | form row of a field ("next to") | `locator('tr').filter({ has: <field> })` | unchanged (field locator hardened) | 1 match, text "First Name: First name is required." | inspect-register-empty.md, inspect-register-duplicate.md |
| all registering scenarios | Register submit | `getByRole('button', { name: 'Register' })` | `getByRole('button', { name: 'Register', exact: true })` (the home page also has a "Register" link) | 1 | inspect-register-empty.md, tier2/empty-forms.md |
| SCN-004 | heading, success text, greeting, Account Services | as drafted | unchanged | 1 each | inspect-register-valid.md |
| SCN-007..SCN-009 | Customer Login user name / password | `getByLabel('Username')` / `getByLabel('Password')` | `locator('input[name="username"]')` / `locator('input[name="password"]')` (unnamed textboxes) | 1 each | inspect-login-wrong.md |
| SCN-007..SCN-009 | Log In button, Customer Login heading | `getByRole(…)` | `exact: true` added | 1 each | inspect-login-empty.md, tier2/empty-forms.md |
| SCN-009, SCN-013/14 | account numbers in Accounts Overview | `locator('table a')` | `locator('#accountTable tbody a')` | 1 (new customer has one account) | inspect-login-valid.md |
| SCN-009 | Log Out | `getByRole('link', { name: 'Log Out' })` | unchanged | 1 | inspect-register-valid.md |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| GET login/{username}/{password} with Accept: application/json → JSON customer (id, firstName, lastName, address{street,city,state,zipCode}, phoneNumber, ssn) | yes | api-chain-login.md step 1 |
| same call with Accept: */* → XML `<customer>` root | yes | api-chain-login.md step 2 |
| GET customers/{id}, customers/{id}/accounts need no credentials (G4) | yes | api-chain-login.md steps 4–5 |
| no REST customer-creation endpoint exists (G1) → registration seeded through register.htm; no delete endpoint → no cleanup possible | yes | openapi.yaml |
| password in the path is URL-encoded (`encodeURIComponent`) | yes | api-chain-login.md |

## Mechanics changed (non-locator)
- `passBotCheck` / `open`: the shared demo sits behind Cloudflare. Under load it shows a "Performing security verification" interstitial; the helper waits (bounded, 30 s) for it to clear after every navigation and submit. It changes no expectation.
- Cloudflare also rate-limits the IP (Error 1015, HTTP 429) when several evaluators hit the demo in parallel (02-harden with `--repeat-each 3 --workers 2`: 24 failures, all rate-limit pages). Runs after that use fewer workers.
- 03-harden (`--repeat-each 3 --workers 1`): 36 passed, 5 failed, 1 flaky. Every failure except SCN-007 was the Cloudflare interstitial after the registration POST (headless Chromium does not pass it); SCN-007 failed in every repeat (observed deviation below). Mechanics otherwise stable.
- Repair (after 04-eval/05/06, environment): the interstitial can swallow the registration POST in the seed, so `registerCustomer` now retries (at most twice) with a fresh user name when the interstitial is shown; otherwise the seed stays BLOCKED. A first attempt (signing in to confirm the customer existed) was replaced because the swallowed POST never created the customer. Test images/fonts are aborted (`page.route`) to reduce traffic. None of this changes an expectation; integrity stayed PRESERVED.
- Contract: G1–G4 recorded as `discovered-in-aut` with evidence; entry points set for AC-1..AC-6.

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-007 (AC-5) | wrong password → "Error!" page with "The username and password could not be verified." | "Error!" page with "An internal error has occurred and has been logged." | inspect-login-wrong.md; runs/01-harden, runs/02-harden SCN-007 |
