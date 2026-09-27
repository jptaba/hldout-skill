# Hardening log — DEMO-101

**Tiers used:** Tier 3 (bundled inspector `inspect.ts` + `--capture` run). Tier 1 (IDE browser tool) and tier 2 (Playwright MCP) were not loaded in this session; `.mcp.json` now registers Playwright MCP for later sessions.
**AUT:** Swag Labs (saucedemo.com demo shop), https://www.saucedemo.com · **Date:** 2026-09-26
**Draft frozen:** `draft/demo-101.spec.ts` (before any AUT contact)

Inspection evidence: `inspect-01` … `inspect-11` in this folder (ARIA snapshot + ranked locators + probes per state).

## Locators

| Scenario(s) | Element | Draft locator (guess) | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| all | Username field | `getByLabel('Username')` | `getByRole('textbox', { name: 'Username', exact: true })` | 1 ✔ | inspect-01 |
| all | Password field | `getByLabel('Password')` | `getByRole('textbox', { name: 'Password', exact: true })` | 1 ✔ | inspect-01 |
| all | Sign-in button | `getByRole('button', { name: 'Sign in' })` ✖ 0 matches | `getByRole('button', { name: 'Login', exact: true })` | 1 ✔ | inspect-01 |
| 002 003 004 008 009 | Error message | `getByRole('alert')` | unchanged | 1 ✔ | inspect-02, -10, -11 |
| 001 005 012 | Page title | `getByRole('heading', { name: 'Products' })` ✖ 0 (it is a span) | `getByTestId('title')` | 1 ✔ | inspect-03 |
| 001 006 007 010 | Product cards | `getByRole('listitem')` ⚠ matched **3 footer links** | `getByTestId('inventory-item')` | 6 ✔ (collection) | inspect-03 |
| 005 | Product prices | `getByText(/^\$\d+\.\d{2}$/)` | `getByTestId('inventory-item-price')` | 6 ✔ (collection) | inspect-03 |
| 005 | Sort control | `getByRole('combobox', { name: 'Sort' })` (substring) | `getByRole('combobox', { name: 'Sort products', exact: true })` | 1 ✔ | inspect-03 |
| 006 007 011 | Cart badge | `locator('.cart-badge')` ✖ 0 | `getByTestId('shopping-cart-badge')` | 1 ✔ | inspect-04 |
| 008–011 | Cart entry | `getByRole('link', { name: /cart/i })` ✖ 0 (a button whose name changes: "Cart, empty" / "Cart, 2 items") | `getByTestId('shopping-cart-link')` | 1 ✔ | inspect-03/-04 |
| 006 007 010 | Add / Remove per card | card-scoped `getByRole('button', …)` | unchanged, scoped to `inventory-item` | 1 ✔ | inspect-04 |
| 010 | Card price | card-scoped `getByText(price regex)` | card-scoped `getByTestId('inventory-item-price')` | 1 ✔ | inspect-04 |
| 008–011 | Checkout button | `getByRole('button', { name: 'Checkout' })` | unchanged | 1 ✔ | inspect-05 (step 7) |
| 008–011 | First / Last name | `getByLabel(...)` | `getByRole('textbox', { name: 'First Name' / 'Last Name', exact: true })` | 1 ✔ | inspect-05 |
| 008–011 | Postal code | `getByLabel('Postal Code')` (substring) | `getByRole('textbox', { name: 'Zip/Postal Code', exact: true })` | 1 ✔ | inspect-05 |
| 008–011 | Continue | `getByRole('button', { name: 'Continue' })` | unchanged | 1 ✔ | inspect-05 |
| 009 010 | Item total / Tax / Total | `getByText(/Item total/)`, `/^Tax/`, `/^Total/` | `getByTestId('subtotal-label' / 'tax-label' / 'total-label')` | 1 ✔ each | inspect-06 |
| 011 | Finish | `getByRole('button', { name: 'Finish' })` | unchanged | 1 ✔ | inspect-06 |
| 011 | Confirmation | `getByRole('heading', { name: REQ.AC8_CONFIRMATION })` | unchanged | 1 ✔ | inspect-07 |
| 012 | Menu | `getByRole('button', { name: 'Open Menu' })` | unchanged | 1 ✔ | inspect-03 |
| 012 | Logout | `getByRole('link', { name: 'Logout' })` ✖ 0 (a button) | `getByRole('button', { name: 'Logout', exact: true })` | 1 ✔ | inspect-08 |

## Mechanics changed (non-locator)

- None required. Logging out needs the menu opened first; the draft already did that. The protected-URL check in SCN-012 navigates to the URL recorded after sign-in, which works as drafted (inspect-09).

## Observed deviations (assertions intentionally left unchanged)

| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-002 (AC-2) | "Your account has been locked. Please contact customer support." | "Epic sadface: Sorry, this user has been locked out." | inspect-11 |
| SCN-004 (AC-3) | Username and Password are cleared after a failed sign-in | Both fields keep `standard_user` / `wrong_password` | inspect-02 (snapshot shows the values still in the textboxes) |
| SCN-010 (AC-7) | Tax = 10% of item total (pricing-rules.md) | Item total $39.98 → Tax $3.20 (8%) | inspect-06 |

These are application-defect candidates for triage; the draft's expected values were not touched (see `integrity.json`).
