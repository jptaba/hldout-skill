# Hardening log — TOOL-2

**Tiers used:** tier 3 only (bundled `heldout inspect` for the sign-in and "My account" pages, `heldout api-probe --chain` for every API mechanic, plus a read of the published API document). No IDE browser tool (tier 1) exists in this session; the Playwright MCP tools (tier 2) were listed as deferred tools but not loaded or used, because the tier-3 reports are written straight into the evaluation as evidence.
**AUT profile:** practicesoftwaretesting — https://practicesoftwaretesting.com/ · API https://api.practicesoftwaretesting.com/ · **Date:** 2026-09-29 · **Draft frozen:** draft/tool-2.spec.ts

**App knowledge consulted after the freeze** (`heldout knowledge TOOL-2`): page:/auth/login (route + "Login" heading anchor — verified, inspect-login.md), api:POST /users/register (fields — verified against the API document; only first_name, last_name, email, password are required), api:POST /users/login (fields email, password — verified, api-identity.md), api:GET /users/me and api:GET /users/logout (auth required — verified), app:api-docs (used to read the UserRequest schema). The TOOL-1 catalogue entries were not relevant.

## UI locators

| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-005, SCN-006 | sign-in page | `gotoPage('/auth/login')` + `getByLabel(/e-?mail/i)` | `gotoPage('/auth/login')` + `getByRole('heading', { name: 'Login', exact: true })` | 1 match, visible | inspect-login.md |
| SCN-005, SCN-006 | e-mail field | `getByLabel(/e-?mail/i)` | `getByTestId('email')` | 1 match (fill ✔) | inspect-my-account.md steps |
| SCN-005, SCN-006 | password field | `getByLabel(/password/i)` | `getByTestId('password')` | 1 match (fill ✔) | inspect-my-account.md steps |
| SCN-005, SCN-006 | Login button | `getByRole('button', { name: /login\|sign in/i })` | `getByTestId('login-submit')` | 1 match (click ✔) | inspect-my-account.md steps |
| SCN-005 | "My account" heading | `getByRole('heading', { name: 'My account' })` | unchanged | 1 match, visible | inspect-my-account.md |
| SCN-005 | navigation | `getByRole('navigation')` | unchanged | 1 match, text contains the customer's name | inspect-my-account.md |
| SCN-006 | "Invalid email or password" | `getByText(REQ.AC5_WEB_MESSAGE)` | unchanged (the requirement's literal) | passed in 01-harden and 02-harden | runs/02-harden |

## API mechanics

| Item | Verified | Evidence |
| --- | --- | --- |
| POST /users/register body: JSON `{first_name, last_name, email, password}` (required fields per the API document's UserRequest) | ✔ 201 | api-identity.md, API document |
| POST /users/login body: JSON `{email, password}`; token at `access_token` | ✔ | api-identity.md |
| GET /users/me, GET /users/logout: `Authorization: Bearer <access_token>` | ✔ | api-identity.md |
| G3: 422 password errors are a string list at the top-level key `password` | ✔ | api-identity.md step 6 |
| The web shop's sign-in calls POST https://api.practicesoftwaretesting.com/users/login (SCN-006 waits for that answer) | ✔ | inspect-my-account.md (API calls table) |
| Customers cannot delete themselves (DELETE /users/{id} with their own token is refused): test customers are kept, e-mails `hldout-…@example.com` | ✔ | api-accounts.md |
| Accounts recipe saved (`heldout accounts --from-chain`, create + API token + UI sign-in, no delete); `accounts --check --create` passed | ✔ | heldout.config.json, api-accounts.md |

## Mechanics changed (non-locator)

- SCN-009's precondition customer now comes from `seed.account()` (the new accounts recipe) instead of the local register + sign-in helper; the helper `signedIn` was removed. The scenarios whose subject is the customer itself (registration, sign-in, lock) keep calling the endpoints in the test.
- Contract: G1, G2, G3 resolved `discovered-in-aut`; `requestFields` added to POST /users/register and POST /users/login (review hash unchanged).

## Observed deviations (assertions intentionally left unchanged)

| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-007 (AC-6) | attempts one to five with a wrong password respond 401; the sixth responds 423 | attempts 1–3 respond 401; attempt 4 and 5 already respond 423 `{"error":"Account locked, too many failed attempts. Please contact the administrator."}`; the sixth (correct password) 423 | api-lockout.md; runs 01-harden, 02-harden (3/3 repeats) |
| SCN-008 (AC-6) | four failures do not lock the account (one step inside the limit of five) | after four failures the correct password is refused with 423 and no access_token | runs 01-harden, 02-harden (3/3 repeats) |

A control customer registered right after the locked one gets 401 on its first wrong attempt (api-lockout.md steps 8–9): the lock is per account, not a client/IP rate limit.

## Stability

`run TOOL-2 --label harden --repeat-each 3 --workers 2` (02-harden): 24 passed, 6 failed (SCN-007 ×3, SCN-008 ×3, the observed deviation above), 0 flaky. No 429 seen.
