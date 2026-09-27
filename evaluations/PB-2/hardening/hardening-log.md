# Hardening log — PB-2
**Tiers used:** tier 2 (Playwright MCP driven through `heldout mcp-probe`, register page snapshot) and tier 3 (`heldout inspect` for the register / open-account walk and locator probes, `heldout api-probe` single calls and `--chain`, `heldout run --label harden --capture` snapshots). Tier 1 (IDE browser tool) is not available in this session; the natively loaded Playwright MCP tools were not used because other evaluators share that browser (brief rule).
**AUT profile:** parabank — https://parabank.parasoft.com/parabank/ (UI), https://parabank.parasoft.com/parabank/services/bank/ (API) · **Date:** 2026-09-27 · **Draft frozen:** draft/pb-2.spec.ts

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| all (seed) | register form fields | `[id="customer.<field>"]`, `#repeatedPassword` | unchanged (inputs have no accessible name; the labels are table cells) | inspect steps filled them and registered a customer | hardening/tier2/register-page.md, hardening/inspect-register.steps.json |
| all (seed) | Register button | `getByRole('button', { name: 'Register' })` | `+ exact: true` | inspect click ✔ | hardening/inspect-register.steps.json |
| all (seed) | registration success | `getByText(/account was created successfully/i)` | `getByText('Welcome <first> <last>')` (the signed-in customer panel) + a rate-limit page check | runs/01-harden snapshots (`paragraph: Welcome Heldout Tester`) | runs/01-harden/snapshots/SCN-002/retry0/01-*.yml |
| SCN-001, 002, 003, 006, 008, 010 | account type choice | `#type` | unchanged | 1 match, options CHECKING, SAVINGS | hardening/inspect-openaccount.md |
| SCN-001, 002, 003, 006, 008, 010 | funding account choice | `#fromAccountId` | unchanged; wait for each seeded account's option (options report hidden, so wait on count) | 1 match | hardening/inspect-openaccount.md |
| SCN-002, 003, 006, 008, 010 | submit | `getByRole('button', { name: 'Open New Account' })` | `+ exact: true` | 1 match, visible | hardening/inspect-openaccount.md |
| SCN-001 | minimum deposit text | `getByText(REQ.MIN_DEPOSIT_TEXT, { exact: false })` | unchanged | 1 match, visible | hardening/inspect-openaccount.md |
| SCN-002 | "Your new account number:" line | `getByText(label, { exact: false })` | `getByRole('paragraph').filter({ hasText: label })` (the number link is a sibling of the text node, inside the paragraph) | SCN-002 passed in 04-harden | runs/01-harden/snapshots/SCN-002/retry0/06-*.yml, runs/04-harden |
| SCN-002 | details page Account Type / Balance | `#accountType`, `#balance` | unchanged | SCN-002 passed in 04-harden | runs/04-harden |
| SCN-010.2 | "an error" on the page (G6: wording unstated) | `getByText(/error/i).first()` | unchanged: the page showed the success confirmation and no error at all, so there is no element to harden against | - | runs/04-harden/snapshots/SCN-010.2 |
| SCN-002, 003, 006 | new account number link | `#newAccountId` | unchanged | SCN-003 passed in 01-harden | runs/01-harden |
| SCN-003 | Accounts Overview row / balance cell | row with the account link, cell 2 | unchanged | SCN-003 passed in 01-harden | runs/01-harden |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| G1 POST /createAccount: query params customerId, newAccountType (int: 0 CHECKING, 1 SAVINGS), fromAccountId | ✔ newAccountType=1 → SAVINGS | hardening/api-openapi.md, hardening/api-chain-mechanics.md |
| G3 no credentials needed for any service call | ✔ 200 without cookies/headers | hardening/api-chain-mechanics.md |
| G2 customerId + first account id from the overview page's own `customers/{id}/accounts` request | ✔ | runs/01-harden (all seeds that were not rate-limited) |
| G5 exact funding balances via POST /transfer | ✔ 100.00 → 99.99 | hardening/api-chain-mechanics.md |
| G8 transaction fields type/amount/description | ✔ | hardening/api-openapi.md, hardening/api-chain-mechanics.md |

## Mechanics changed (non-locator)
- Cloudflare in front of the shared demo rate-limits bursts (HTTP 429 / "Error 1015 You are being rate limited", `retry_after: 30`); 01-harden lost 4 scenarios to it (BLOCKED at seeding). Added pacing plumbing: every service call is resent after the advertised `retry_after` when it gets a 429 (a 429 means the request was not processed), entry-point navigation waits out a rate-limit page, decorative images are not loaded (fewer requests per page view), and the per-test timeout is 300 s to allow for the waits. After 05-eval lost SCN-009.2 to a longer ban, navigation waits up to 5 × 40 s and each test is followed by a 10 s pause to spread the suite's traffic. No expectation changed.
- Stability: not proven with `--repeat-each 3 --workers 2` as the skill suggests: the profile caps workers at 1 and the sandbox rate-limits (each test registers a customer), so repeats would have produced mostly rate-limit noise. Instead the suite ran end to end twice (05-eval, 06-rerun) with identical results for every scenario that was not rate-limited.
- `TYPE_PARAM` set to the documented integer encoding (G1).

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-004 | AC-4: POST /createAccount returns the new account with its opening balance (100.00); GET /accounts/{id} returns the same values | the POST body has `"balance": 0`; GET /accounts/{id} right after returns `"balance": 100` | hardening/api-chain-mechanics.md step 3–4, runs/01-harden SCN-004 |
| SCN-009.2, SCN-010.2 | R5: a funding account below 100.00 → not opened, error | 99.99 funding: account opened (page shows "Account Opened!"; service 200), funding balance -0.01 | runs/04-harden snapshots SCN-010.2, runs/05-eval/confirm/api-chain-confirm.md |
| SCN-011 | R4: funding from one of the same customer's accounts | the service opens an account for customer A funded from customer B's account and debits B | runs/05-eval/confirm/api-chain-confirm.md steps 6–9 |
