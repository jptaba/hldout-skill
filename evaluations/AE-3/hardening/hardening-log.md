# Hardening log — AE-3
**Tiers used:** tier 2 (Playwright MCP driven through the bundled stdio client `heldout mcp-probe`: Contact Us form walk with Cancel on the confirmation) and tier 3 (`heldout inspect` probes and ARIA snapshots, `heldout api-probe` for every declared endpoint, `heldout run --label harden --capture`). Tier 1 was not available (no IDE browser tool in this session); the natively loaded `mcp__playwright__*` tools were deliberately not used because other evaluators share that browser in this session.
**AUT profile:** automation-exercise — https://automationexercise.com (UI and API) · **Date:** 2026-09-27 · **Draft frozen:** draft/ae-3.spec.ts

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-004, 005, 006 | Brands panel | `locator('.brands_products')` | unchanged | 1 match, visible | inspect-products.md |
| SCN-004, 005, 006 | brand entries | `.brands_products` → `getByRole('link')` | unchanged | 8 links, one per brand (text "(n) Brand") | inspect-products.md |
| SCN-006 | brand entry to click | `brandEntries.filter({ hasText: /^(\(n\))? <brand> (\(n\))?$/ })` | unchanged | 1 match (Mast & Harbour) | inspect-brand-page.md, tier3/brand-click.steps.json |
| SCN-006 | brand page heading | `getByRole('heading', { name: /^\s*Brand\b/i })` | unchanged | 1 match | inspect-brand-page.md |
| SCN-006 | products listed (G2) | `getByRole('link', { name: 'View Product' })` | `locator('.features_items').getByRole('link', { name: 'View Product' })` (scoped to the product listing) | 3 matches on the Mast & Harbour page, each `/product_details/{id}` | inspect-brand-page.md |
| SCN-007 | form heading | `getByRole('heading', { name: /get in touch/i })` | `getByRole('heading', { name: 'Get In Touch', exact: true })` | 1 match | inspect-contact.md, tier2/contact-cancel.md |
| SCN-007…012 | Name / Email / Subject / Message | `getByPlaceholder(<mock-up placeholder>, { exact: true })` | unchanged | 1 match each | inspect-contact.md |
| SCN-007…012 | Submit | `getByRole('button', { name: 'Submit' })` | unchanged | 1 match | inspect-contact.md, tier2/contact-cancel.md |
| SCN-008…012 | success message | `getByText(<REQ.SUCCESS_MESSAGE>)` | `locator('#contact-page').getByText(<REQ.SUCCESS_MESSAGE>)` — the page also holds a hidden newsletter banner with the same text (strict-mode violation in runs/02-harden) | 0 before submit; 1 after OK | inspect-contact.md, runs/02-harden, runs/03-harden |
| SCN-011 | "Home" button | `getByRole('link', { name: 'Home' }).last()` | `locator('#contact-page').getByRole('link', { name: 'Home' })` (the header also has a Home link) | 0 before submit; 1 after OK (link → `/`) | inspect-contact.md, runs/03-harden |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| GET /api/brandsList | path, no auth; HTTP 200; JSON body served as `text/html` → spec parses `res.text` when `body` is not an object (`jsonOf`) | api-brandsList-GET.md |
| PUT / POST / DELETE /api/brandsList | path, no auth, no body needed | api-brandsList-PUT.md, api-brandsList-POST.md, api-brandsList-DELETE.md |
| GET /api/productsList (G1) | `{ responseCode, products: [{ id, name, price, brand, category }] }`, `text/html` content type | api-productsList.md |

## Mechanics changed (non-locator)
- **Unique e-mail** (SCN-010, 011, 012): `unique()` returns a value with a space (`"qa jrxaaabz-1"`), so the drafted address `qa jrxaaabz-1@example.com` was not a valid e-mail and the browser refused to submit (runs/01-harden: "no dialog"). The local part now replaces non-alphanumerics with `.`. Test data only; no expectation changed.
- **Native confirm handling** (SCN-011): the draft left the confirm open while the next step asserted it; a native `confirm()` blocks the page, so `click()` never returned (runs/02-harden: `locator.click: Timeout 10000ms exceeded`). The dialog is now recorded when it opens and answered with OK at once; the "Then a browser confirmation … is shown" step asserts the recorded type and message, and "When I confirm with OK" checks the answer was given (precondition). `[REQ AC-7]` assertions and their expected values are unchanged.
- **Submit settle** (SCN-008…012): the draft waited (bounded, 5 s) for the form's POST request. A network log of a real submission (`node evaluations/AE-3/hardening/tier3/ae3-net.mjs`: click 0.96 s → confirm "Press OK to proceed!" 1.21 s → success shown 1.22 s, URL still /contact_us, no request other than a Cloudflare RUM beacon) showed the AUT makes **no** request when the form is sent. The helper now waits (bounded, 5 s) for the contact section's success message instead; negative scenarios therefore assert "no success message" only after the page has had 5 s to show it. Test mechanics only.
- **Gap G3** (home page): recognised by URL = base URL root `/` (the Home link's target); asserted with `toHaveURL(new URL('/', baseURL))`.

## Contract mechanics completed
- G1, G2, G3 → `discovered-in-aut` with value and evidence (above). No reviewed content changed.

## Stability
- `heldout run AE-3 --label harden --repeat-each 3 --workers 2` → runs/04-harden: 48 passed, 0 failed, 0 flaky; after the submit-settle change, runs/08-harden: 48 passed, 0 failed, 0 flaky.

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| — | none observed during hardening | — | runs/04-harden, runs/07-harden |

## Observations outside the acceptance criteria (not asserted; raised as an OPEN-QUESTION in scenarios.feature)
- Sending the Contact Us form makes no request to the server (see "Submit settle" above): the success banner and the "Home" button are rendered client-side. No AC requires delivery, so nothing is asserted; the story's goal ("anyone can reach us through the Contact Us form") makes it a question for the owner.
- Tier-3 `heldout inspect` ranked-locator table suggested `getByRole('link', { name: '(6)Polo', exact: true })` for the brand links and itself reported "⚠ matches 0" (the accessible name is "(6) Polo"); not used.
