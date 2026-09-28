# Requirement contract — DQ-2: Personal book collection - browse the catalogue and manage my books

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-28T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, context (routes /books and /profile), accounts and data constraints, AC-1 to AC-12 |
| attachments/api-contract.md | base URL and JSON bodies, Bearer authentication and token endpoint, error envelope and error table, Book object fields, endpoints with bodies, statuses and errors |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | GET /BookStore/v1/Books returns 200 with a books list; every entry carries all catalogue fields listed in the contract (isbn, title, subTitle, author, publish_date, publisher, pages, description, website). | 200; the body has a `books` list; every entry carries isbn, title, subTitle, author, publish_date, publisher, pages, description and website | story.md#L38 |
| AC-2 | api | Looking up one book with GET /BookStore/v1/Book?ISBN=<isbn> returns 200 with the same data as that book's entry in the catalogue. | 200; the returned book has the same data as that book's entry in GET /BookStore/v1/Books | story.md#L39 |
| AC-3 | e2e | The Book Store page /books lists every book returned by the catalogue API, each with its title, author and publisher. | every book returned by GET /BookStore/v1/Books is listed on /books; each listed book shows its title, author and publisher | story.md#L40 |
| AC-4 | ui | The search box on /books (placeholder "Type to search") filters the list while typing, case-insensitively, on title, author or publisher. Examples: "javascript" shows exactly Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications and Eloquent JavaScript, Second Edition; "zakas" shows only Understanding ECMAScript 6; "No Starch" shows only Eloquent JavaScript, Second Edition and Understanding ECMAScript 6. A term that matches no book leaves no book rows in the list. | the search box has the placeholder "Type to search"; the list is filtered while typing, without a separate submit; matching is case-insensitive, on title, author or publisher; "javascript" shows exactly Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications and Eloquent JavaScript, Second Edition; "zakas" shows only Understanding ECMAScript 6; "No Starch" shows only Eloquent JavaScript, Second Edition and Understanding ECMAScript 6; a term that matches no book leaves no book rows in the list | story.md#L41 |
| AC-5 | ui | Clicking a book title on /books opens that book's detail page, showing its ISBN, title, sub title, author, publisher and total pages as in the catalogue. | clicking a book title on /books opens that book's detail page; the detail page shows the book's ISBN, title, sub title, author, publisher and total pages; each shown value equals the book's entry in the catalogue (isbn, title, subTitle, author, publisher, pages) | story.md#L42 |
| AC-6 | api | Adding books to a user's collection with POST /BookStore/v1/Books returns 201 and echoes the added ISBNs; GET /Account/v1/User/{UUID} then lists those books in the user's books. | 201; the response echoes the added ISBNs; GET /Account/v1/User/{UUID} then lists those books in the user's `books` | story.md#L43 |
| AC-7 | e2e | A book added through the API appears on the Profile page after the user signs in on /login, with its title, author and publisher. | after the user signs in on /login, the Profile page (/profile) shows the book added through the API; the book is shown with its title, author and publisher | story.md#L44 |
| AC-8 | api | Adding a book that is already in the user's collection is rejected with the "already present" error from the contract; the collection still contains that book exactly once. | adding the book again is rejected with the E4 error: 400, code 1210, message "ISBN already present in the User's Collection!"; the collection still contains that book exactly once | story.md#L45 |
| AC-9 | e2e | On the Profile page, deleting one book (the row's delete icon, then confirming "Do you want to delete this book?" with OK) removes that row only; the other books remain. Afterwards the user's collection in the API no longer contains the deleted book and still contains the others. | the row's delete icon asks "Do you want to delete this book?"; after confirming with OK, that row is removed; the other books' rows remain; the user's collection in the API no longer contains the deleted book; the user's collection in the API still contains the others | story.md#L46 |
| AC-10 | api | DELETE /BookStore/v1/Book removes one book from the collection and returns 204; the other books remain. Removing a book that is not in the collection is rejected with the "not in user's collection" error from the contract. | 204; the removed book is no longer in the collection; the other books remain in the collection; removing a book that is not in the collection is rejected with the E3 error: 400, code 1206, message "ISBN supplied is not available in User's Collection!" | story.md#L47 |
| AC-11 | api | An ISBN that is not in the catalogue is rejected with the "not available in Books Collection" error from the contract, both for the lookup (GET /BookStore/v1/Book) and when adding it to a collection; nothing is added. | GET /BookStore/v1/Book with an ISBN not in the catalogue is rejected with the E2 error: 400, code 1205, message "ISBN supplied is not available in Books Collection!"; POST /BookStore/v1/Books with that ISBN is rejected with the E2 error: 400, code 1205, message "ISBN supplied is not available in Books Collection!"; nothing is added to the collection | story.md#L48 |
| AC-12 | api | Collection calls without a valid token are refused with the "not authorized" error from the contract: adding, deleting and reading a user's collection without a token, and reading or adding to another user's collection with one's own token. | adding (POST /BookStore/v1/Books) without a token is refused with the E1 error: 401, code 1200, message "User not authorized!"; deleting (DELETE /BookStore/v1/Book) without a token is refused with the E1 error: 401, code 1200, message "User not authorized!"; reading a user's collection (GET /Account/v1/User/{UUID}) without a token is refused with the E1 error: 401, code 1200, message "User not authorized!"; reading another user's collection (GET /Account/v1/User/{UUID}) with one's own token is refused with the E1 error: 401, code 1200, message "User not authorized!"; adding to another user's collection (POST /BookStore/v1/Books with the other user's userId) with one's own token is refused with the E1 error: 401, code 1200, message "User not authorized!" | story.md#L49 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /Account/v1/GenerateToken |  | 200 { "token": "<jwt>", "expires": "<ISO-8601>", "status": "Success", "result": "User authorized successfully." } | attachments/api-contract.md#L9 |
| GET /BookStore/v1/Books | none | 200 { "books": [ <Book>, ... ] } - the whole catalogue | attachments/api-contract.md#L42 |
| GET /BookStore/v1/Book | none | 200 <Book> | attachments/api-contract.md#L45 |
| POST /BookStore/v1/Books | required | 201 { "books": [ { "isbn": "..." }, ... ] } - the ISBNs that were added | attachments/api-contract.md#L48 |
| DELETE /BookStore/v1/Book | required | 204, empty body | attachments/api-contract.md#L53 |
| DELETE /BookStore/v1/Books | required | 204, empty body - removes all books of the user | attachments/api-contract.md#L57 |
| GET /Account/v1/User/{UUID} | required | 200 { "userId": "<UUID>", "username": "...", "books": [ <Book>, ... ] } | attachments/api-contract.md#L60 |

## Rules and boundaries

- **R1** A Book object has the fields isbn (string), title (string), subTitle (string), author (string), publish_date (string, ISO-8601), publisher (string), pages (number), description (string) and website (string, URL). _(attachments/api-contract.md#L30-L38)_
- **R2** All errors have the body { "code": "<string>", "message": "<string>" }. _(attachments/api-contract.md#L17)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | Not authorized: a protected call with no or an invalid token (POST /BookStore/v1/Books, DELETE /BookStore/v1/Book, GET /Account/v1/User/{UUID}), or with another user's userId (POST /BookStore/v1/Books) or UUID (GET /Account/v1/User/{UUID}) | 401 | { "code": "1200", "message": "User not authorized!" } | attachments/api-contract.md#L21, attachments/api-contract.md#L17, attachments/api-contract.md#L51, attachments/api-contract.md#L55, attachments/api-contract.md#L62 |
| E2 | ISBN not in catalogue: GET /BookStore/v1/Book with an unknown ISBN, or POST /BookStore/v1/Books with an unknown ISBN | 400 | { "code": "1205", "message": "ISBN supplied is not available in Books Collection!" } | attachments/api-contract.md#L22, attachments/api-contract.md#L17, attachments/api-contract.md#L46, attachments/api-contract.md#L51 |
| E3 | ISBN not in user's collection: DELETE /BookStore/v1/Book for an ISBN that is not in the user's collection | 400 | { "code": "1206", "message": "ISBN supplied is not available in User's Collection!" } | attachments/api-contract.md#L23, attachments/api-contract.md#L17, attachments/api-contract.md#L55 |
| E4 | ISBN already in user's collection: POST /BookStore/v1/Books with an ISBN already in the collection | 400 | { "code": "1210", "message": "ISBN already present in the User's Collection!" } | attachments/api-contract.md#L24, attachments/api-contract.md#L17, attachments/api-contract.md#L51 |

## Authentication

Protected calls send Authorization: Bearer <token>; the token is obtained with POST /Account/v1/GenerateToken, body { "userName": "...", "password": "..." } — credentials: the QA team's pre-provisioned test users; user names and passwords are kept in the team's secret store, never in the test code _(attachments/api-contract.md#L7-L10, story.md#L29, story.md#L31)_

## Test data

Tests use the QA team's pre-provisioned test users (credentials from the team's secret store); user creation is switched off, so no user is created or deleted. Books come from the standard catalogue.
- User creation is switched off in the QA environment; do not create or delete users (story.md#L29)
- The test users are shared by every run (story.md#L30)
- Catalogue books used in the examples: 9781449325862 "Git Pocket Guide", 9781593277574 "Understanding ECMAScript 6", 9781449331818 "Learning JavaScript Design Patterns" (story.md#L32)
- Cleanup: Each test leaves the collection of every user it used empty (story.md#L30); DELETE /BookStore/v1/Books?UserId={UUID} removes all books of the user (api-contract.md#L58)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | how a test obtains the UUID (userId) of a pre-provisioned test user, needed in POST /BookStore/v1/Books, DELETE /BookStore/v1/Book and GET /Account/v1/User/{UUID} | mechanics | yes | AC-6, AC-7, AC-8, AC-9, AC-10, AC-11, AC-12 | story → attachments → config → aut | discovered-in-aut: POST /Account/v1/Login (what the login page calls) answers userId; saved as the accounts recipe lookup |
| G2 | Book Store page /books: how the book rows, each row's title (link), author and publisher, and the search box are found | mechanics | yes | AC-3, AC-4, AC-5 | story → aut | discovered-in-aut: rows: getByRole('row') with a title link (8, one per catalogue book); author and publisher are cells of the row; search: getByPlaceholder('Type to search') |
| G3 | book detail page: its route and how the ISBN, title, sub title, author, publisher and total pages are found | mechanics | yes | AC-5 | story → aut | discovered-in-aut: clicking the title opens /books?search=<isbn>; values in #ISBN-wrapper, #title-wrapper, #subtitle-wrapper, #author-wrapper, #publisher-wrapper, #pages-wrapper |
| G4 | sign-in page /login: how the user name and password fields and the sign-in action are found | mechanics | yes | AC-7, AC-9 | story → aut | discovered-in-aut: UserName and Password textboxes, Login button; lands on /profile (saved as the profile's UI sign-in) |
| G5 | Profile page /profile: how the book rows (title, author, publisher), a row's delete icon and the confirmation "Do you want to delete this book?" with its OK are found (browser dialog or in-page modal) | mechanics | yes | AC-7, AC-9 | story → aut | discovered-in-aut: rows as on /books; delete icon #delete-record-<isbn>; in-page dialog 'Do you want to delete this book?' with OK #closeSmallModal-ok, then a native 'Book deleted.' alert |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17-L19 | context | user story: a signed-in reader browses/searches the catalogue and keeps a collection shown on the profile; captured in actors and context, and by AC-1 to AC-12 |
| story.md#L23-L24 | context, AC-3, AC-4, AC-5, AC-7, AC-9 | routes /books and /profile, used as entry points |
| story.md#L25 | context | points to the attached api-contract.md, which is part of this story's sources |
| story.md#L29 | test-data, auth, out-of-scope, G1 |  |
| story.md#L30 | test-data |  |
| story.md#L31 | endpoint, auth |  |
| story.md#L32 | test-data |  |
| story.md#L38 | AC-1 |  |
| story.md#L39 | AC-2 |  |
| story.md#L40 | AC-3 |  |
| story.md#L41 | AC-4 |  |
| story.md#L42 | AC-5 |  |
| story.md#L43 | AC-6 |  |
| story.md#L44 | AC-7 |  |
| story.md#L45 | AC-8 |  |
| story.md#L46 | AC-9 |  |
| story.md#L47 | AC-10 |  |
| story.md#L48 | AC-11 |  |
| story.md#L49 | AC-12 |  |
| attachments/api-contract.md#L3 | endpoint | API on the web site's origin (config apiBaseURL); JSON bodies with Content-Type: application/json, noted in each endpoint's request |
| attachments/api-contract.md#L7 | auth |  |
| attachments/api-contract.md#L9-L10 | endpoint, auth, G1 |  |
| attachments/api-contract.md#L12 | endpoint, out-of-scope, G1 | GET /Account/v1/User/{UUID} is an endpoint; POST /Account/v1/User is out of scope (story.md#L29) |
| attachments/api-contract.md#L13 | out-of-scope | DELETE /Account/v1/User/{UUID}: tests must not delete users (story.md#L29) |
| attachments/api-contract.md#L17 | R2, error-model |  |
| attachments/api-contract.md#L21 | E1 |  |
| attachments/api-contract.md#L22 | E2 |  |
| attachments/api-contract.md#L23 | E3 |  |
| attachments/api-contract.md#L24 | E4 |  |
| attachments/api-contract.md#L30-L38 | R1, AC-1, example | field list checked by AC-1; the Example column (Git Pocket Guide) is an example |
| attachments/api-contract.md#L43 | endpoint, AC-1 |  |
| attachments/api-contract.md#L46 | endpoint, AC-2, E2 |  |
| attachments/api-contract.md#L49-L50 | endpoint, AC-6 |  |
| attachments/api-contract.md#L51 | E1, E2, E4 |  |
| attachments/api-contract.md#L54 | endpoint |  |
| attachments/api-contract.md#L55 | endpoint, AC-10, E1, E3 |  |
| attachments/api-contract.md#L58 | endpoint, test-data |  |
| attachments/api-contract.md#L61 | endpoint, AC-6 |  |
| attachments/api-contract.md#L62 | E1 |  |
