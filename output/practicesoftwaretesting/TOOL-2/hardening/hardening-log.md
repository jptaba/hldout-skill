# Hardening log — TOOL-2

**Tiers used:** tier 2 (Playwright MCP, loaded natively) to walk the sign-in page and the wrong-password message, and tier 3 (`heldout inspect` probes, `heldout api-probe --chain`) for every recorded proof. No IDE browser tool (tier 1) is available in this host. The tier-2 walk is not evidence on its own: each step that matters was replayed with `heldout inspect` (reports under `hardening/tier3/`).
**AUT profile:** practicesoftwaretesting — https://practicesoftwaretesting.com/ (UI), https://api.practicesoftwaretesting.com (API) · **Date:** 2026-10-05 · **Draft frozen:** draft/tool-2.spec.ts

## UI locators
| Test(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-004, SCN-012 (via actions) | sign-in page route | `/auth/login` (guess) | `/auth/login` (the navigation's "Sign in" link) | heading "Login" 1 match | tier3/sign-in-form.md |
| SCN-004, SCN-012 (via actions) | e-mail field | `getByLabel('Email address')` | `getByTestId('email')` | 1 match, visible | tier3/sign-in-form.md |
| SCN-004, SCN-012 (via actions) | password field | `getByLabel('Password', { exact: true })` | `getByTestId('password')` | draft 0 matches (label is "Password *"); new 1 match | tier3/sign-in-form.md |
| SCN-004, SCN-012 (via actions) | submit | `getByRole('button', { name: 'Login' })` | `getByTestId('login-submit')` | 1 match | tier3/sign-in-form.md |
| SCN-004 | "My account" page | `getByRole('heading', { name: 'My account' })` | unchanged | 1 match after sign-in (lands on /account) | tier3/sign-in.md |
| SCN-004 | navigation with the name | `getByRole('navigation').first()` | unchanged | 1 navigation landmark; shows "Hldout Tester" | tier3/sign-in.md |
| SCN-012 | "Invalid email or password" | `getByText(…)` | unchanged | 1 match (in test id login-error) | tier3/sign-in-wrong.md |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| POST /users/register body | JSON `{first_name, last_name, email, password, dob, phone, address{street, city, state, country, postal_code}}` → 201; answer carries the details and `id` at top level | tier3/account-chain.md |
| POST /users/login body | JSON `{email, password}` → 200 `{access_token, token_type, expires_in}` | tier3/account-chain.md |
| Auth | `Authorization: Bearer <access_token>`; GET /users/me → 200 | tier3/account-chain.md |
| 409 / 422 / 423 shapes (G3) | 409 `{"email": [msg]}`; 422 `{"password": [msg per rule]}`; 423 `{"error": msg}`; 401 `{"error": "Unauthorized"}` | tier3/errors-chain.md |
| GET /users/logout, then /users/me | 200 `{"message": …}`, then 401 | tier3/logout-chain.md |

## Actions (reused, fixed, added)
| Action | Change | Why | Evidence |
| --- | --- | --- | --- |
| ui:account (signInForm in `_shared.ts`) | locators → test ids `email`, `password`, `login-submit` | the draft password label locator matched nothing (label "Password *") | tier3/sign-in-form.md |
| ui:account.openSignInPage | TODO removed, route confirmed | `/auth/login` is the navigation's "Sign in" target | tier3/sign-in-form.md |
| ui:account.submitSignInForm | none (uses the fixed `signInForm`) | — | runs 01/02-harden |
| api:users.registerCustomer | TODOs removed, fields and id confirmed | — | tier3/account-chain.md |
| api:users.signInCustomer | TODO removed, fields confirmed | — | tier3/account-chain.md |
| api:users (`_shared.ts` newCustomer) | TODO removed, extra fields confirmed | — | tier3/account-chain.md |

No action added or marked stale.

## Accounts recipe
Saved to `auts.practicesoftwaretesting.accounts` from `tier3/account-chain.json` (`heldout accounts --from-chain`): tests create accounts (POST /users/register, id at `id`), password `${env:PST_CUSTOMER_PASSWORD}` (generated into .env), no delete (the application offers customers none: accounts stay, named `hldout-…@example.com`), API token from POST /users/login `access_token`, lookup GET /users/me, UI sign-in on /auth/login with the test ids above, done at `url:/account`. TOOL-2's own tests keep calling the registration and sign-in endpoints directly (the account is the story's subject); the recipe is for later stories.

## Mechanics changed (non-locator)
- Removed the `TODO(harden)` marks on request fields and G3 (the `passwordErrors` helper already reads `body.password`, which is where the 422 lists them).
- One mark is left: `tool-2.spec.ts:98`, a `// TODO(harden)` comment inside the `[REQ AC-1]` details assertion. Integrity compares the assertion text including comments, so removing it reads as a changed assertion (VIOLATED). The field names it asks about are confirmed (`first_name`, `last_name`, `email`). Removing the comment needs an audited amendment (main agent).

## Observed deviations (assertions intentionally left unchanged)
| Test | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-006 (AC-6) | attempts one to five with a wrong password respond 401; the sixth (correct password) responds 423 | attempts 1–3 respond 401; attempt 4 already responds 423 "Account locked, too many failed attempts. Please contact the administrator." (the account locks after three failures, not five) | tier3/errors-chain.md, runs/01-harden, runs/02-harden |

## Stability
- 01-harden (`--capture`): 16 passed, 1 failed (SCN-006, the deviation above).
- 02-harden (`--repeat-each 3 --workers 2`, SCN-006 `@irreversible` once): 48 passed, 1 failed (SCN-006, same), 0 flaky.
- Integrity: PRESERVED, with the one unhardened mark above.
