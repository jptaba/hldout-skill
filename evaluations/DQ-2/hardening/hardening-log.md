# Hardening log — DQ-2
**Tiers used:** tier 2 (Playwright MCP driven through `heldout mcp-probe`, its own stdio server: /books, search, detail page, /login → /profile walks) and tier 3 (`heldout inspect` probes for the detail page and the delete dialog, `heldout api-probe --chain` for every API mechanic, `heldout run --capture`). Tier 1 (IDE browser tool) is not available in this session; the session's native `mcp__playwright__*` tools were deliberately not used because parallel evaluators share that browser.
**AUT profile:** demoqa — https://demoqa.com (UI and API) · **Date:** 2026-09-27 · **Draft frozen:** draft/dq-2.spec.ts

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-004..007, 009, 011 | book rows | `getByRole('row').filter({ has: getByRole('link') })` | unchanged (header row has no link) | 8 rows on /books = 8 catalogue books | tier2/books.md, inspect-books.md |
| SCN-004, 009, 011 | row of a title | `bookRows.filter({ has: link {name, exact} })` | unchanged | `getByRole('link', { name: 'Git Pocket Guide', exact: true })` 1 match | inspect-books.md |
| SCN-005, 006 | search box | `getByPlaceholder('Type to search')` (strict: the placeholder is the requirement) | unchanged | textbox "Type to search" | tier2/books.md |
| SCN-007 | title link | `getByRole('link', { name: 'Git Pocket Guide', exact: true })` | unchanged | 1 match | inspect-books.md |
| SCN-007 | detail values | `getByText(value, { exact: true }).first()` | `getByTestId('<field>-wrapper').getByText(value, { exact: true })` (ISBN, title, subtitle, author, publisher, pages) | each wrapper 1 match | inspect-detail.md |
| SCN-009, 011 | sign-in fields | `getByLabel('UserName')` / `getByLabel('Password')` | `getByRole('textbox', { name: 'UserName' / 'Password' })` | textboxes in MCP snapshot | tier2/profile.md |
| SCN-009, 011 | sign-in button | `getByRole('button', { name: 'Login' })` | `getByRole('button', { name: 'Login', exact: true })` | 1 match | tier2/profile.md, inspect-delete.md |
| SCN-011 | row delete icon | `row.getByRole('button', { name: /delete/i })` | `row.getByTitle('Delete')` (element exposed as generic "Delete", not a button) | click succeeded, dialog opened | inspect-delete.md |
| SCN-011 | confirmation | `getByText('Do you want to delete this book?')` | `getByRole('dialog').getByText(...)` | 1 match | inspect-delete.md |
| SCN-011 | OK | `getByRole('button', { name: 'OK', exact: true })` | `getByRole('dialog').getByRole('button', { name: 'OK', exact: true })` | 1 match | inspect-delete.md |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| G1: `POST /Account/v1/User` body `{ userName, password }` → 201 with `userID` | yes | api-mechanics.md |
| GenerateToken → token; Bearer header accepted by POST/DELETE BookStore and GET/DELETE Account user | yes | api-mechanics.md |
| DELETE /BookStore/v1/Book takes a JSON body `{ isbn, userId }` | yes | api-mechanics.md |
| A new sign-in (GenerateToken or UI login) revokes earlier tokens of that user | yes (token A → 401 after token B issued) | token-rotation.md |

## Mechanics changed (non-locator)
- SCN-011: after the UI sign-in, the test takes a fresh API token (`seed.step`) before re-reading the collection; the token from the seed was revoked by the UI login (run 01-harden: 401 on the pre-read, triaged as script defect).
- User cleanup takes a fresh token before `DELETE /Account/v1/User/{UUID}` for the same reason (run 01-harden left 3 users; swept with sweep-01.chain.json → all 204).
- SCN-009/SCN-011 (repair cycle 1, after 03-eval): the precondition that the sign-in lands on /profile waits up to 20 s; in 03-eval the page still showed "Loading..." after 5 s once (passed on retry). Re-run 04-rerun: 28/28.
- Stability: `run --label harden --repeat-each 3 --workers 2` (02-harden) → 84/84 passed, 69 seed cleanups done, 0 failed.

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| — | none observed during hardening | | 02-harden |
