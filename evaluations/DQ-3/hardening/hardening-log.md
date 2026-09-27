# Hardening log — DQ-3
**Tiers used:** tier 2 (Playwright MCP driven through `heldout mcp-probe`, walk in `tier2/links.md`) and tier 3 (`heldout inspect` probes in `tier3/links.md`, `heldout api-probe` in `api/api-*.md`, `heldout run --label harden --capture`). Tier 1 (IDE browser) is not available in this session; the natively loaded `mcp__playwright__*` tools were deliberately not used because parallel evaluators share that browser.
**AUT profile:** demoqa — https://demoqa.com (UI and API) · **Date:** 2026-09-27 · **Draft frozen:** draft/dq-3.spec.ts

## UI locators
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | heading "Links" | `getByRole('heading', { name: 'Links', exact: true })` | unchanged | 1 ✔ visible | tier3/links.md |
| SCN-001 | new-tab caption | `getByText('Following links will open new tab', { exact: true })` | unchanged | 1 ✔ | tier3/links.md |
| SCN-001 | api-call caption | `getByText('Following links will send an api call', { exact: true })` | unchanged | 1 ✔ | tier3/links.md |
| SCN-001 | links of the api-call section | `div` filtered by caption `.last()` → `getByRole('link')` (would include the new-tab links: the caption and both sections share one container) | `xpath=//h5[caption]/following-sibling::p//a` | 7 (intended list) | tier3/links.md, tier2/links.md snapshot (h5 caption + sibling paragraphs) |
| SCN-003 | links of the new-tab section | `div` filtered by caption `.last()` | `xpath=//h5[new-tab caption]/following-sibling::p[following-sibling::h5[api caption]]//a`, `.nth(1)` = second link | 2 (intended list) | tier3/links.md |
| SCN-002 | "Home" link | `getByRole('link', { name: 'Home', exact: true })` | unchanged | 1 ✔ | tier3/links.md |
| SCN-007/008/009 | diagnostic links | `getByRole('link', { name: <label>, exact: true })` | unchanged | each 1 ✔ | tier3/links.md (suggested-locator table) |
| SCN-001/007/008/009 | response message | `getByText('Link has responded')` | unchanged | 1 ✔ after a click | tier3/links.md |

## API mechanics
| Item | Verified | Evidence |
| --- | --- | --- |
| GET /created, /no-content, /bad-request, /unauthorized, /forbidden, /invalid-url (no auth, no params) | answered 201/204/400/401/403/404 | api/api-*.md |
| GET /moved without following redirects | the `api` fixture has no redirect option; the spec uses the fixture's `apiContext` with `maxRedirects: 0` and attaches the exchange in the fixture's `api-exchange` format | runs/01-harden SCN-004.3, SCN-006 |

## Mechanics changed (non-locator)
- SCN-008: the displayed code is read as the first 3-digit number of the message (draft regex `status (\d{3})` depended on the message wording, which is AC-7's oracle, not AC-8's). Not a `[REQ]` expression; integrity PRESERVED.
- SCN-009: precondition "Forbidden message shown" checks the message contains 403 (precondition, not `[REQ]`).
- SCN-009 `[REQ AC-9] 201 Created message shown`: audited amendment (see amendments.json) — the draft asserted AC-7's exact wording.

## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
| --- | --- | --- | --- |
| SCN-007.1–.7 (AC-7) | "Link has responded with **status** <code> and status text <text>" | "Link has responded with **staus** <code> and status text <text>" (typo) | tier2/links.md (403, 301), tier3/links.md (204), runs/01-harden |
| SCN-006 (AC-6) | GET /moved → 301 with a Location header pointing to the home page | 301 with **no Location header**; body `{"url":"demoqa.com"}` | api/api-moved.md, runs/01-harden SCN-006 |

## Other notes
- Tier 2 (`mcp-probe`) loaded third-party ad requests (doubleclick etc.): the profile's `blockHosts` is not applied by the MCP walk.
- The dynamic Home link label renders as "Home6k28V" in the MCP snapshot and "Home EGziD" in the inspector (suffix present, differs per load).
