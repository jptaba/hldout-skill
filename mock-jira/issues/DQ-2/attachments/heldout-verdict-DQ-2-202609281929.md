# Held-out Evaluation Verdict — DQ-2

> **Verdict: ✅ PASS** — Every scenario passed and every acceptance criterion is covered.

| | |
| --- | --- |
| Story | [DQ-2](https://your-domain.atlassian.net/browse/DQ-2) — Personal book collection - browse the catalogue and manage my books |
| Application under test | demosite (profile `demoqa`) — UI https://demoqa.com/ |
| Final run | `02-eval` · 2026-09-28T19:27:47.911Z · 106s |
| Tests | 21 total · 21 passed · 0 failed · 0 flaky · 0 skipped (from 14 scenarios) |
| Held-out integrity | ✅ PRESERVED — 29 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (heldout inspect with steps, probes and the page's own API calls; heldout api-probe --chain; heldout accounts --from-chain / --sign-in-steps / --reset;… (see hardening log) |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-09-28T19:29:40.837Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | The catalogue lists every book with all its fields | AC-1 | contract | ✅ passed | - |
| SCN-002 | Looking one book up returns its catalogue entry | AC-2 | functional | ✅ passed | - |
| SCN-003 | The Book Store page lists every catalogue book | AC-3 | integration | ✅ passed | - |
| SCN-004.1 | The search box filters by title, author or publisher ("javascript") | AC-4 | functional | ✅ passed | - |
| SCN-004.2 | The search box filters by title, author or publisher ("zakas") | AC-4 | functional | ✅ passed | - |
| SCN-004.3 | The search box filters by title, author or publisher ("No Starch") | AC-4 | functional | ✅ passed | - |
| SCN-005 | A search term that matches no book leaves no book rows | AC-4 | negative | ✅ passed | - |
| SCN-006 | A book's detail page shows its catalogue data | AC-5 | functional | ✅ passed | - |
| SCN-007 | Adding books to my collection | AC-6 | functional | ✅ passed | - |
| SCN-008 | A book added through the API appears on my Profile page | AC-7 | integration | ✅ passed | - |
| SCN-009 | Adding a book that is already in my collection is refused | AC-8 | idempotency | ✅ passed | - |
| SCN-010 | Deleting one book on the Profile page | AC-9 | integration | ✅ passed | - |
| SCN-011 | Removing one book through the API | AC-10 | functional | ✅ passed | - |
| SCN-012 | Removing a book that is not in my collection is refused | AC-10 | negative | ✅ passed | - |
| SCN-013.1 | An ISBN that is not in the catalogue is refused (look it up with GET /BookStore/v1/Book) | AC-11 | negative | ✅ passed | - |
| SCN-013.2 | An ISBN that is not in the catalogue is refused (add it with POST /BookStore/v1/Books) | AC-11 | negative | ✅ passed | - |
| SCN-014.1 | Collection calls without a valid token are refused (adds a book to A's collection without a token) | AC-12 | security | ✅ passed | - |
| SCN-014.2 | Collection calls without a valid token are refused (deletes a book from A's collection without a token) | AC-12 | security | ✅ passed | - |
| SCN-014.3 | Collection calls without a valid token are refused (reads A's collection without a token) | AC-12 | security | ✅ passed | - |
| SCN-014.4 | Collection calls without a valid token are refused (reads B's collection with A's token) | AC-12 | security | ✅ passed | - |
| SCN-014.5 | Collection calls without a valid token are refused (adds a book to B's collection with A's token) | AC-12 | security | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | GET /BookStore/v1/Books returns 200 with a books list; every entry carries all catalogue fields listed in the contract (isbn, title, subTitle, author, publish_date, publisher, pages, description, website). | SCN-001 | ✅ met |
| AC-2 | Looking up one book with GET /BookStore/v1/Book?ISBN=<isbn> returns 200 with the same data as that book's entry in the catalogue. | SCN-002 | ✅ met |
| AC-3 | The Book Store page /books lists every book returned by the catalogue API, each with its title, author and publisher. | SCN-003 | ✅ met |
| AC-4 | The search box on /books (placeholder "Type to search") filters the list while typing, case-insensitively, on title, author or publisher. Examples: "javascript" shows exactly Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications and Eloquent JavaScript, Second Edition; "zakas" shows only Understanding ECMAScript 6; "No Starch" shows only Eloquent JavaScript, Second Edition and Understanding ECMAScript 6. A term that matches no book leaves no book rows in the list. | SCN-004.1, SCN-004.2, SCN-004.3, SCN-005 | ✅ met |
| AC-5 | Clicking a book title on /books opens that book's detail page, showing its ISBN, title, sub title, author, publisher and total pages as in the catalogue. | SCN-006 | ✅ met |
| AC-6 | Adding books to a user's collection with POST /BookStore/v1/Books returns 201 and echoes the added ISBNs; GET /Account/v1/User/{UUID} then lists those books in the user's books. | SCN-007 | ✅ met |
| AC-7 | A book added through the API appears on the Profile page after the user signs in on /login, with its title, author and publisher. | SCN-008 | ✅ met |
| AC-8 | Adding a book that is already in the user's collection is rejected with the "already present" error from the contract; the collection still contains that book exactly once. | SCN-009 | ✅ met |
| AC-9 | On the Profile page, deleting one book (the row's delete icon, then confirming "Do you want to delete this book?" with OK) removes that row only; the other books remain. Afterwards the user's collection in the API no longer contains the deleted book and still contains the others. | SCN-010 | ✅ met |
| AC-10 | DELETE /BookStore/v1/Book removes one book from the collection and returns 204; the other books remain. Removing a book that is not in the collection is rejected with the "not in user's collection" error from the contract. | SCN-011, SCN-012 | ✅ met |
| AC-11 | An ISBN that is not in the catalogue is rejected with the "not available in Books Collection" error from the contract, both for the lookup (GET /BookStore/v1/Book) and when adding it to a collection; nothing is added. | SCN-013.1, SCN-013.2 | ✅ met |
| AC-12 | Collection calls without a valid token are refused with the "not authorized" error from the contract: adding, deleting and reading a user's collection without a token, and reading or adding to another user's collection with one's own token. | SCN-014.1, SCN-014.2, SCN-014.3, SCN-014.4, SCN-014.5 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md AC-1 | SCN-001 The catalogue lists every book with all its fields | contract | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md AC-2 | SCN-002 Looking one book up returns its catalogue entry | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md AC-3 | SCN-003 The Book Store page lists every catalogue book | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md AC-4 | SCN-004 The search box filters by title, author or publisher ("<term>") | functional | ui | 3/3 | ✅ meets requirement | - |
| ↳ | story.md AC-4 | SCN-005 A search term that matches no book leaves no book rows | negative | ui | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md AC-5 | SCN-006 A book's detail page shows its catalogue data | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md AC-6 | SCN-007 Adding books to my collection | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-7** | story.md AC-7 | SCN-008 A book added through the API appears on my Profile page | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-8** | story.md AC-8 | SCN-009 Adding a book that is already in my collection is refused | idempotency | api | 1/1 | ✅ meets requirement | - |
| **AC-9** | story.md AC-9 | SCN-010 Deleting one book on the Profile page | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-10** | story.md AC-10 | SCN-011 Removing one book through the API | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md AC-10 | SCN-012 Removing a book that is not in my collection is refused | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-11** | story.md AC-11 | SCN-013 An ISBN that is not in the catalogue is refused (<call>) | negative | api | 2/2 | ✅ meets requirement | - |
| **AC-12** | story.md AC-12 | SCN-014 Collection calls without a valid token are refused (<call>) | security | api | 5/5 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| contract | 1 | 1 | 1 | 0 | 0 | - |
| functional | 5 | 7 | 7 | 0 | 0 | - |
| idempotency | 1 | 1 | 1 | 0 | 0 | - |
| integration | 3 | 3 | 3 | 0 | 0 | - |
| negative | 3 | 4 | 4 | 0 | 0 | - |
| security | 1 | 5 | 5 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | how a test obtains the UUID (userId) of a pre-provisioned test user, needed in POST /BookStore/v1/Books, DELETE /BookStore/v1/Book and GET /Account/v1/User/{UUID} | how to exercise | AC-6, AC-7, AC-8, AC-9, AC-10, AC-11, AC-12 | discovered from the AUT (mechanics only): POST /Account/v1/Login (what the login page calls) answers userId; saved as the accounts recipe lookup |
| G2 | Book Store page /books: how the book rows, each row's title (link), author and publisher, and the search box are found | how to exercise | AC-3, AC-4, AC-5 | discovered from the AUT (mechanics only): rows: getByRole('row') with a title link (8, one per catalogue book); author and publisher are cells of the row; search: getByPlaceholder('Type to search') |
| G3 | book detail page: its route and how the ISBN, title, sub title, author, publisher and total pages are found | how to exercise | AC-5 | discovered from the AUT (mechanics only): clicking the title opens /books?search=<isbn>; values in #ISBN-wrapper, #title-wrapper, #subtitle-wrapper, #author-wrapper, #publisher-wrapper, #pages-wrapper |
| G4 | sign-in page /login: how the user name and password fields and the sign-in action are found | how to exercise | AC-7, AC-9 | discovered from the AUT (mechanics only): UserName and Password textboxes, Login button; lands on /profile (saved as the profile's UI sign-in) |
| G5 | Profile page /profile: how the book rows (title, author, publisher), a row's delete icon and the confirmation "Do you want to delete this book?" with its OK are found (browser dialog or in-page modal) | how to exercise | AC-7, AC-9 | discovered from the AUT (mechanics only): rows as on /books; delete icon #delete-record-<isbn>; in-page dialog 'Do you want to delete this book?' with OK #closeSmallModal-ok, then a native 'Book deleted.' alert |

**Assumptions the evaluation made:**

- tests use the pre-provisioned test users (seed.account() hands each test its own); every collection a test used is left empty afterwards (story: Accounts and data)

Full review: [requirement-review.md](requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 42 | 0 | 0 |
| `02-eval` (final) | 21 | 0 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/02-eval/triage.md](runs/02-eval/triage.md) · JUnit: runs/02-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/DQ-2/runs/02-eval/html`
