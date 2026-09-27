# Hardening log — PB-3
**Tiers used:** tier 2 via `heldout mcp-probe` (register page walk, hardening/tier2/register.md) and tier 3 (`heldout inspect` walks with setup steps + locator probes, `heldout api-probe` for the REST mechanics and the published OpenAPI document, `heldout run --label harden --capture`). Tier 1 is not available in this host; the session's native Playwright MCP tools were not used because other evaluators share that browser (the brief forbids it).
**AUT profile:** parabank — https://parabank.parasoft.com/parabank/ (API https://parabank.parasoft.com/parabank/services/bank/) · **Date:** 2026-09-27 · **Draft frozen:** draft/pb-3.spec.ts

## UI locators

| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| all (seed) | registration fields | `getByLabel('First Name')` … `getByLabel('Confirm')` (fields have no accessible names) | `locator('[id="customer.firstName"]')` … `locator('[id="customer.password"]')`, `locator('#repeatedPassword')` | 1 match each | tier3/inspect-register.md, tier2/register.md |
| all (seed) | Register button | `getByRole('button', { name: 'Register' })` | `+ exact: true` | 1 match | tier3/inspect-register.md |
| all (seed) | registration done | `getByText('Welcome <username>')` (0 matches) | `getByText('Your account was created successfully')` | seen after submit | tier3/inspect-overview.md (setup step 14) |
| all (seed) | account A | first link of `getByRole('table')` | first link of `locator('#accountTable')`, waited until it reads digits | 1 table | tier3/inspect-overview.md |
| all (seed) | Open New Account | button click, `#newAccountId` read immediately | wait for `#fromAccountId option[value=A]` (loaded async), click `getByRole('button', { name: 'Open New Account', exact: true })`, wait for `#newAccountId` to hold digits | 1 match each | tier3/inspect-openaccount-result.md |
| SCN-001,003,004,005,008 | Transfer Funds form | `getByLabel('Amount')`, `getByLabel('From account')`, `getByLabel('to account')` (no labels) | `#amount`, `#fromAccountId`, `#toAccountId` (wait until the option for B is attached; lists load async), `getByRole('button', { name: 'Transfer', exact: true })` | 1 match each | tier3/inspect-transfer.md |
| SCN-001,003,005,008 | "Transfer Complete!" | `getByText(…, { exact: true })` | `getByRole('heading', { name: 'Transfer Complete!', exact: true })` | 1 match | tier3/inspect-transfer-result.md |
| SCN-001 | confirmation sentence | `getByText(sentence, { exact: true })` | unchanged | 1 match | tier3/inspect-transfer-result.md |
| SCN-001 | Accounts Overview balances / total | `getByRole('table')` rows | `locator('#accountTable')` rows; wait for the `Total` row | 1 table | tier3/inspect-overview.md |
| SCN-003 | Account Activity table | `getByRole('table')`, row filtered by "Funds Transfer Sent" | `locator('#transactionTable')`; row filtered by "Funds Transfer Sent" **and** a `$25.50` cell (A also carries the "Funds Transfer Sent" $100.00 from opening B) | row unique | tier3/inspect-activity.md |
| SCN-004 | AC-4 messages | `getByText(message, { exact: true })` | unchanged — the AUT shows an error page instead (see deviations) | n/a | runs/01-harden snapshots |

## API mechanics

| Item | Verified | Evidence |
| --- | --- | --- |
| REST base: /transfer, /accounts/{id}, /accounts/{id}/transactions all under /parabank/services/bank (G3) | ✔ OpenAPI `servers` + probes | tier3/api-openapi.md |
| transfer parameters as query string (G3) | ✔ POST transfer?fromAccountId&toAccountId&amount → 200 | tier3/api-transfer.md |
| no authentication needed (G4) | ✔ all three endpoints answer 200 without credentials; no securitySchemes in OpenAPI | tier3/api-get-account.md, api-transactions.md, api-transfer.md |
| JSON fields (G7): `balance`; transactions `type`, `amount`, `description` | ✔ | tier3/api-get-account.md, api-transactions.md |
| transfer answers a plain-text body (content-type application/json) → the test compares `res.text` | ✔ | tier3/api-transfer.md |

## Mechanics changed (non-locator)

- Seed: waits for the asynchronously loaded account selects before submitting (Open New Account, Transfer Funds).
- Seed: image requests are aborted (not part of any criterion) to keep traffic below the CDN rate limit (Cloudflare Error 1015 hit during the first harden run, blocking SCN-008/SCN-009 seeds).
- "Transfer Complete!" is located as the heading of that name (the only element with the text).
- Bounded "must not appear" wait for AC-5 uses the same heading locator.

## Observed deviations (assertions intentionally left unchanged)

| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-004.1 / .2 (AC-4) | empty / "abc" amount: form stays on screen with "The amount cannot be empty." / "Please enter a valid amount." | the page is replaced by "Error! An internal error has occurred and has been logged."; the form and message are gone | runs/01-harden/snapshots/SCN-004.*/retry0/05-*.yml |
| SCN-005.1 / .2 (AC-5, page) | 0 and -10.00 are refused | "Transfer Complete!" shown; for -10.00 A goes up by 10.00 and B down by 10.00 | runs/01-harden/triage.md |
| SCN-006.1 / .2 (AC-5, service) | 0 and -10.00 are refused | 200 "Successfully transferred $0 …" / "Successfully transferred $-10.00 …"; balances move in reverse for -10.00 | runs/01-harden/triage.md |

## Harden runs

| Run | What | Result |
| --- | --- | --- |
| 01-harden (`--capture`) | full suite, first pass | 4 passed; 6 failures = the observed deviations above; SCN-008/SCN-009 BLOCKED by Cloudflare Error 1015 (rate limit) during registration |
| 02-harden (`--grep SCN-00[89] --retries 0`) | re-check the two rate-limited seeds after the ban lifted | 2 passed |
| 03-harden-stability (`--repeat-each 2 --retries 0`) | stability | repeat 0 identical to 01; repeat 1 hit Error 1015 from test 15 on (no pacing yet) → added the pacing hook |
| 04-harden-stability (`--repeat-each 2 --retries 0`, paced 12 s) | stability | both repeats identical: 6 tests pass, the same 6 deviations fail; no rate limiting |

`--repeat-each 2` (not 3) and `--retries 0`: one worker is the profile's cap, and the CDN rate limit makes a 36-test burst impractical; two identical repeats plus run 01 give three observations of every test.
