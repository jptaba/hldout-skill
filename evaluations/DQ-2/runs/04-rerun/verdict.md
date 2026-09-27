# Held-out Evaluation Verdict — DQ-2

> **Verdict: ✅ PASS** — Every scenario passed and every acceptance criterion is covered.

| | |
| --- | --- |
| Story | [DQ-2](https://your-domain.atlassian.net/browse/DQ-2) — Personal book collection - browse the catalogue and manage my books |
| Application under test | DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — UI https://demoqa.com |
| Final run | `04-rerun` · 2026-09-27T12:29:23.306Z · 94s |
| Tests | 28 total · 28 passed · 0 failed · 0 flaky · 0 skipped (from 16 scenarios) |
| Held-out integrity | ✅ PRESERVED — 35 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 2 (Playwright MCP driven through heldout mcp-probe, its own stdio server: /books, search, detail page, /login → /profile walks) and tier 3 (heldout… (see hardening log) |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-27T16:56:14.253Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (2)

| Found in run | Test | Symptom | Diagnosis | Fix applied | Final run |
| --- | --- | --- | --- | --- | --- |
| `01-harden` | SCN-011 | read my collection (GET /Account/v1/User/{UUID}) | The UI sign-in issued a new token and revoked the one the test got from GenerateToken in the seed; the follow-up GET /Account/v1/User/{UUID} used the revoked token (401). Mechanics, not the AC: confirmed with hardening/token-rotation.md (token A → 401 once token B is issued, B → 200). | Take a fresh token (seed.step) after the UI sign-in and in user cleanup; integrity PRESERVED; 02-harden 84/84. | ✅ passed |
| `03-eval` | SCN-011 | signed in and on the Profile page (precondition) | Failed in the Given (plain precondition, not [REQ]): after clicking Login the page still showed 'Loading...' at the 5 s expect timeout (screenshot), then the retry passed. The sign-in simply answers slowly (GenerateToken takes ~1.5 s, see hardening/api-mechanics.md); the test's wait for /profile was too short. Mechanics, not AC-9. | Precondition waits for /profile up to 20 s (SCN-009 and SCN-011); integrity PRESERVED; full re-run. | ✅ passed |

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | The catalogue API returns every book with all catalogue fields | AC-1 | functional | ✅ passed | - |
| SCN-002 | Every catalogue entry has the field types of the Book object | AC-1 | contract | ✅ passed | - |
| SCN-003.1 | Looking up one book returns the same data as its catalogue entry (9781449325862) | AC-2 | functional | ✅ passed | - |
| SCN-003.2 | Looking up one book returns the same data as its catalogue entry (9781593277574) | AC-2 | functional | ✅ passed | - |
| SCN-003.3 | Looking up one book returns the same data as its catalogue entry (9781449331818) | AC-2 | functional | ✅ passed | - |
| SCN-004 | The Book Store page lists every catalogue book with title, author and publisher | AC-3 | integration | ✅ passed | - |
| SCN-005.1 | Searching filters the list while typing, case-insensitively (javascript) | AC-4 | functional | ✅ passed | - |
| SCN-005.2 | Searching filters the list while typing, case-insensitively (zakas) | AC-4 | functional | ✅ passed | - |
| SCN-005.3 | Searching filters the list while typing, case-insensitively (No Starch) | AC-4 | functional | ✅ passed | - |
| SCN-005.4 | Searching filters the list while typing, case-insensitively (JAVASCRIPT) | AC-4 | functional | ✅ passed | - |
| SCN-006 | A search term that matches no book leaves no book rows | AC-4 | negative | ✅ passed | - |
| SCN-007 | Clicking a book title opens its detail page with the catalogue values | AC-5 | functional | ✅ passed | - |
| SCN-008 | Adding books to my collection returns 201, echoes the ISBNs and lists them on my account | AC-6 | functional | ✅ passed | - |
| SCN-009 | A book added through the API appears on the Profile page after signing in | AC-7 | integration | ✅ passed | - |
| SCN-010 | Adding a book already in my collection is rejected and the book stays once | AC-8 | idempotency | ✅ passed | - |
| SCN-011 | Deleting one book on the Profile page removes only that book | AC-9 | integration | ✅ passed | - |
| SCN-012 | Deleting one book through the API returns 204 and keeps the others | AC-10 | functional | ✅ passed | - |
| SCN-013 | Deleting a book that is not in my collection is rejected | AC-10 | negative | ✅ passed | - |
| SCN-014 | Looking up an ISBN that is not in the catalogue is rejected | AC-11 | negative | ✅ passed | - |
| SCN-015 | Adding an ISBN that is not in the catalogue is rejected and nothing is added | AC-11 | negative | ✅ passed | - |
| SCN-016.1 | Collection calls without a valid token are refused (POST /BookStore/v1/Books for my user without a token) | AC-12 | security | ✅ passed | - |
| SCN-016.2 | Collection calls without a valid token are refused (DELETE /BookStore/v1/Book for my user without a token) | AC-12 | security | ✅ passed | - |
| SCN-016.3 | Collection calls without a valid token are refused (GET /Account/v1/User/{my UUID} without a token) | AC-12 | security | ✅ passed | - |
| SCN-016.4 | Collection calls without a valid token are refused (POST /BookStore/v1/Books for my user with an invalid token) | AC-12 | security | ✅ passed | - |
| SCN-016.5 | Collection calls without a valid token are refused (DELETE /BookStore/v1/Book for my user with an invalid token) | AC-12 | security | ✅ passed | - |
| SCN-016.6 | Collection calls without a valid token are refused (GET /Account/v1/User/{my UUID} with an invalid token) | AC-12 | security | ✅ passed | - |
| SCN-016.7 | Collection calls without a valid token are refused (GET /Account/v1/User/{other user's UUID} with my own token) | AC-12 | security | ✅ passed | - |
| SCN-016.8 | Collection calls without a valid token are refused (POST /BookStore/v1/Books for the other userId with my own token) | AC-12 | security | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | GET /BookStore/v1/Books returns 200 with a books list; every entry carries all catalogue fields listed in the contract (isbn, title, subTitle, author, publish_date, publisher, pages, description, website). | SCN-001, SCN-002 | ✅ met |
| AC-2 | Looking up one book with GET /BookStore/v1/Book?ISBN=<isbn> returns 200 with the same data as that book's entry in the catalogue. | SCN-003.1, SCN-003.2, SCN-003.3 | ✅ met |
| AC-3 | The Book Store page /books lists every book returned by the catalogue API, each with its title, author and publisher. | SCN-004 | ✅ met |
| AC-4 | The search box on /books (placeholder "Type to search") filters the list while typing, case-insensitively, on title, author or publisher. Examples: "javascript" shows exactly Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications and Eloquent JavaScript, Second Edition; "zakas" shows only Understanding ECMAScript 6; "No Starch" shows only Eloquent JavaScript, Second Edition and Understanding ECMAScript 6. A term that matches no book leaves no book rows in the list. | SCN-005.1, SCN-005.2, SCN-005.3, SCN-005.4, SCN-006 | ✅ met |
| AC-5 | Clicking a book title on /books opens that book's detail page, showing its ISBN, title, sub title, author, publisher and total pages as in the catalogue. | SCN-007 | ✅ met |
| AC-6 | Adding books to a user's collection with POST /BookStore/v1/Books returns 201 and echoes the added ISBNs; GET /Account/v1/User/{UUID} then lists those books in the user's books. | SCN-008 | ✅ met |
| AC-7 | A book added through the API appears on the Profile page after the user signs in on /login, with its title, author and publisher. | SCN-009 | ✅ met |
| AC-8 | Adding a book that is already in the user's collection is rejected with the "already present" error from the contract; the collection still contains that book exactly once. | SCN-010 | ✅ met |
| AC-9 | On the Profile page, deleting one book (the row's delete icon, then confirming "Do you want to delete this book?" with OK) removes that row only; the other books remain. Afterwards the user's collection in the API no longer contains the deleted book and still contains the others. | SCN-011 | ✅ met |
| AC-10 | DELETE /BookStore/v1/Book removes one book from the collection and returns 204; the other books remain. Removing a book that is not in the collection is rejected with the "not in user's collection" error from the contract. | SCN-012, SCN-013 | ✅ met |
| AC-11 | An ISBN that is not in the catalogue is rejected with the "not available in Books Collection" error from the contract, both for the lookup (GET /BookStore/v1/Book) and when adding it to a collection; nothing is added. | SCN-014, SCN-015 | ✅ met |
| AC-12 | Collection calls without a valid token are refused with the "not authorized" error from the contract: adding, deleting and reading a user's collection without a token, and reading or adding to another user's collection with one's own token. | SCN-016 (8 tests) | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story AC-1, api-contract.md §Book object | SCN-001 The catalogue API returns every book with all catalogue fields | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-1, api-contract.md#L28-L38 (R2 field types) | SCN-002 Every catalogue entry has the field types of the Book object | contract | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story AC-2, story.md#L31 (example ISBNs) | SCN-003 Looking up one book returns the same data as its catalogue entry | functional | api | 3/3 | ✅ meets requirement | - |
| **AC-3** | story AC-3, story Context (/books) | SCN-004 The Book Store page lists every catalogue book with title, author and publisher | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-4** | story AC-4 | SCN-005 Searching filters the list while typing, case-insensitively | functional | ui | 4/4 | ✅ meets requirement | - |
| ↳ | story AC-4 (no-match term) | SCN-006 A search term that matches no book leaves no book rows | negative | ui | 1/1 | ✅ meets requirement | - |
| **AC-5** | story AC-5 | SCN-007 Clicking a book title opens its detail page with the catalogue values | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-6** | story AC-6, api-contract.md §POST /BookStore/v1/Books | SCN-008 Adding books to my collection returns 201, echoes the ISBNs and lists them on my account | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-7** | story AC-7 | SCN-009 A book added through the API appears on the Profile page after signing in | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-8** | story AC-8, api-contract.md#L24 | SCN-010 Adding a book already in my collection is rejected and the book stays once | idempotency | api | 1/1 | ✅ meets requirement | - |
| **AC-9** | story AC-9 | SCN-011 Deleting one book on the Profile page removes only that book | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-10** | story AC-10, api-contract.md §DELETE /BookStore/v1/Book | SCN-012 Deleting one book through the API returns 204 and keeps the others | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-10, api-contract.md#L23 | SCN-013 Deleting a book that is not in my collection is rejected | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-11** | story AC-11, api-contract.md#L22, #L46 | SCN-014 Looking up an ISBN that is not in the catalogue is rejected | negative | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-11, api-contract.md#L51 | SCN-015 Adding an ISBN that is not in the catalogue is rejected and nothing is added | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-12** | story AC-12, api-contract.md#L21, #L51, #L55, #L62 | SCN-016 Collection calls without a valid token are refused | security | api | 8/8 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| contract | 1 | 1 | 1 | 0 | 0 | - |
| functional | 6 | 11 | 11 | 0 | 0 | - |
| idempotency | 1 | 1 | 1 | 0 | 0 | - |
| integration | 3 | 3 | 3 | 0 | 0 | - |
| negative | 4 | 4 | 4 | 0 | 0 | - |
| security | 1 | 8 | 8 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | request body field names for creating a user with POST /Account/v1/User (the story says a user name and a password; neither source names the fields) | how to exercise | AC-6, AC-7, AC-8, AC-9, AC-10, AC-11, AC-12 | discovered from the AUT (mechanics only): POST /Account/v1/User takes JSON { "userName": "<name>", "password": "<password>" } and answers 201 with { "userID", "username", "books": [] } |
| G2 | how the catalogue list on /books is rendered (book rows, title/author/publisher cells, title link, search box locator) | how to exercise | AC-3, AC-4, AC-5 | discovered from the AUT (mechanics only): /books renders an ARIA table; each book is a row with a link named by the title (opens the detail page) and cells for author and publisher; the header row (Image, Title, Author, Publisher) has no link; the search box is textbox "Type to search" |
| G3 | route and field labels of a book's detail page (how ISBN, title, sub title, author, publisher and total pages are shown) | how to exercise | AC-5 | discovered from the AUT (mechanics only): clicking a title opens /books?search=<isbn>; the detail page shows label/value pairs in wrappers #ISBN-wrapper, #title-wrapper, #subtitle-wrapper, #author-wrapper, #publisher-wrapper, #pages-wrapper |
| G4 | sign-in form on /login (field labels, submit control) and how the Profile page is reached after sign-in | how to exercise | AC-7, AC-9 | discovered from the AUT (mechanics only): /login has textboxes "UserName" and "Password" and button "Login"; a successful sign-in lands on /profile. Note: a sign-in issues a new token and revokes previously issued tokens for that user |
| G5 | Profile page book rows (title/author/publisher cells), the row's delete icon, and how the "Do you want to delete this book?" confirmation is presented and confirmed with OK | how to exercise | AC-7, AC-9 | discovered from the AUT (mechanics only): Profile page lists the collection as table rows (title link, author, publisher cells) with a per-row "Delete" icon (title="Delete"); clicking it opens modal dialog "Delete Book" with the text "Do you want to delete this book?" and buttons OK / Cancel |
| G6 | no acceptance criterion covers DELETE /BookStore/v1/Books?UserId={UUID} (remove all books of the user); is it in scope, and what must it do beyond 204? | expected behaviour |  | ❓ open |

**For the owner's information** (about things no acceptance criterion requires; they don't affect the verdict):

- ℹ️ G6 — no acceptance criterion covers DELETE /BookStore/v1/Books?UserId={UUID} (remove all books of the user); is it in scope, and what must it do beyond 204?

**Assumptions the evaluation made:**

- G1 — POST /Account/v1/User takes { "userName", "password" } like GenerateToken (mechanics, confirmed in hardening)
- AC-4 "while typing" is exercised by typing the term character by character without pressing Enter; no latency is asserted (none is stated)
- AC-12 "invalid token" is exercised with a malformed Bearer value; the story does not define invalid further
- the exact success status of POST /BookStore/v1/Books (201) is asserted only in SCN-008; other scenarios add books as preconditions

Full review: [requirement-review.md](../../requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 27 | 1 | 0 |
| `02-harden` (hardening dry-run) | 84 | 0 | 0 |
| `03-eval` | 27 | 0 | 1 |
| `04-rerun` (final) | 28 | 0 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Requirement review: [requirement-review.md](../../requirement-review.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/04-rerun/triage.md](../../runs/04-rerun/triage.md) · JUnit: runs/04-rerun/junit.xml
- HTML report: `npx playwright show-report evaluations/DQ-2/runs/04-rerun/html`
