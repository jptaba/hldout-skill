# Requirement contract — DQ-2: Personal book collection - browse the catalogue and manage my books

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T12:08

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, context (/books, /profile, API contract pointer), accounts and test data, AC-1..AC-12 (table) |
| attachments/api-contract.md | base URL and JSON bodies, Bearer auth, GenerateToken, account endpoints, error envelope and error table (1200/1205/1206/1210), Book object fields, BookStore endpoints with bodies, statuses and errors |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | GET /BookStore/v1/Books returns 200 with a books list; every entry carries all catalogue fields listed in the contract (isbn, title, subTitle, author, publish_date, publisher, pages, description, website). | 200; body has a `books` list; every entry in `books` carries isbn, title, subTitle, author, publish_date, publisher, pages, description and website | story.md#L37 |
| AC-2 | api | Looking up one book with GET /BookStore/v1/Book?ISBN=<isbn> returns 200 with the same data as that book's entry in the catalogue. | 200; the returned book has the same data as that book's entry in GET /BookStore/v1/Books | story.md#L38 |
| AC-3 | e2e | The Book Store page /books lists every book returned by the catalogue API, each with its title, author and publisher. | every book returned by GET /BookStore/v1/Books is listed on /books; each listed book shows its title, author and publisher | story.md#L39 |
| AC-4 | ui | The search box on /books (placeholder "Type to search") filters the list while typing, case-insensitively, on title, author or publisher. Examples: "javascript" shows exactly Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications and Eloquent JavaScript, Second Edition; "zakas" shows only Understanding ECMAScript 6; "No Starch" shows only Eloquent JavaScript, Second Edition and Understanding ECMAScript 6. A term that matches no book leaves no book rows in the list. | the search box has the placeholder "Type to search"; the list filters while typing, without submitting; "javascript" shows exactly Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications and Eloquent JavaScript, Second Edition; "zakas" shows only Understanding ECMAScript 6; "No Starch" shows only Eloquent JavaScript, Second Edition and Understanding ECMAScript 6; a term that matches no book leaves no book rows in the list | story.md#L40 |
| AC-5 | ui | Clicking a book title on /books opens that book's detail page, showing its ISBN, title, sub title, author, publisher and total pages as in the catalogue. | clicking a book title opens that book's detail page; the detail page shows ISBN, title, sub title, author, publisher and total pages equal to that book's catalogue entry (isbn, title, subTitle, author, publisher, pages; the catalogue values are only reference data) | story.md#L41 |
| AC-6 | api | Adding books to a user's collection with POST /BookStore/v1/Books returns 201 and echoes the added ISBNs; GET /Account/v1/User/{UUID} then lists those books in the user's books. | 201; the response `books` lists the added ISBNs; GET /Account/v1/User/{UUID} then lists those books in the user's `books` | story.md#L42 |
| AC-7 | e2e | A book added through the API appears on the Profile page after the user signs in on /login, with its title, author and publisher. | after signing in on /login, the Profile page (/profile) lists the book added through the API; the listed book shows its title, author and publisher | story.md#L43 |
| AC-8 | api | Adding a book that is already in the user's collection is rejected with the "already present" error from the contract; the collection still contains that book exactly once. | adding the same ISBN again → 400; error `code` "1210" and `message` "ISBN already present in the User's Collection!" (E4); GET /Account/v1/User/{UUID} lists that book exactly once | story.md#L44 |
| AC-9 | e2e | On the Profile page, deleting one book (the row's delete icon, then confirming "Do you want to delete this book?" with OK) removes that row only; the other books remain. Afterwards the user's collection in the API no longer contains the deleted book and still contains the others. | the confirmation "Do you want to delete this book?" is shown after clicking the row's delete icon; after confirming with OK, that row is removed and the other books remain on the Profile page; GET /Account/v1/User/{UUID} no longer lists the deleted book and still lists the others | story.md#L45 |
| AC-10 | api | DELETE /BookStore/v1/Book removes one book from the collection and returns 204; the other books remain. Removing a book that is not in the collection is rejected with the "not in user's collection" error from the contract. | deleting a book in the collection → 204; GET /Account/v1/User/{UUID} no longer lists that book and still lists the other books; deleting a book not in the collection → 400; error `code` "1206" and `message` "ISBN supplied is not available in User's Collection!" (E3) | story.md#L46 |
| AC-11 | api | An ISBN that is not in the catalogue is rejected with the "not available in Books Collection" error from the contract, both for the lookup (GET /BookStore/v1/Book) and when adding it to a collection; nothing is added. | GET /BookStore/v1/Book with an ISBN not in the catalogue → 400; adding an ISBN not in the catalogue with POST /BookStore/v1/Books → 400; both answer error `code` "1205" and `message` "ISBN supplied is not available in Books Collection!" (E2); GET /Account/v1/User/{UUID} shows nothing was added to the collection | story.md#L47 |
| AC-12 | api | Collection calls without a valid token are refused with the "not authorized" error from the contract: adding, deleting and reading a user's collection without a token, and reading or adding to another user's collection with one's own token. | POST /BookStore/v1/Books without a token → 401; DELETE /BookStore/v1/Book without a token → 401; GET /Account/v1/User/{UUID} without a token → 401; POST /BookStore/v1/Books, DELETE /BookStore/v1/Book and GET /Account/v1/User/{UUID} with an invalid token → 401 ("no/invalid token", attachments/api-contract.md#L51, #L55, #L62); GET /Account/v1/User/{UUID} for another user's UUID with one's own token → 401; POST /BookStore/v1/Books with another user's `userId` and one's own token → 401; each answers error `code` "1200" and `message` "User not authorized!" (E1) | story.md#L48 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /BookStore/v1/Books | none | 200 { "books": [ <Book>, ... ] } - the whole catalogue (attachments/api-contract.md#L43) | attachments/api-contract.md#L42 |
| GET /BookStore/v1/Book | none | 200 <Book> (attachments/api-contract.md#L46) | attachments/api-contract.md#L45 |
| POST /BookStore/v1/Books | required | 201 { "books": [ { "isbn": "..." }, ... ] } - the ISBNs that were added (attachments/api-contract.md#L50) | attachments/api-contract.md#L48 |
| DELETE /BookStore/v1/Book | required | 204, empty body (attachments/api-contract.md#L55) | attachments/api-contract.md#L53 |
| DELETE /BookStore/v1/Books | required | 204, empty body (attachments/api-contract.md#L58) | attachments/api-contract.md#L57 |
| GET /Account/v1/User/{UUID} | required | 200 { "userId": "<UUID>", "username": "...", "books": [ <Book>, ... ] } (attachments/api-contract.md#L61) | attachments/api-contract.md#L60 |
| POST /Account/v1/User |  | 201, returns userID (attachments/api-contract.md#L12) | attachments/api-contract.md#L12 |
| POST /Account/v1/GenerateToken |  | 200 { "token": "<jwt>", "expires": "<ISO-8601>", "status": "Success", "result": "User authorized successfully." } (attachments/api-contract.md#L10) | attachments/api-contract.md#L9 |
| DELETE /Account/v1/User/{UUID} | required | 204 (attachments/api-contract.md#L13) | attachments/api-contract.md#L13 |

## Rules and boundaries

- **R1** All errors have the body { "code": "<string>", "message": "<string>" }; the error code is a string. _(attachments/api-contract.md#L17)_
- **R2** Book object fields: isbn (string), title (string), subTitle (string), author (string), publish_date (string, ISO-8601), publisher (string), pages (number), description (string), website (string, URL). Example: isbn "9781449325862", title "Git Pocket Guide", subTitle "A Working Introduction", author "Richard E. Silverman", publish_date "2020-06-04T08:48:39.000Z", publisher "O'Reilly Media", pages 234. _(attachments/api-contract.md#L28-L38)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | Not authorized: no/invalid token, another user's userId on POST /BookStore/v1/Books, or another user's UUID on GET /Account/v1/User/{UUID} | 401 | { "code": "1200", "message": "User not authorized!" } | attachments/api-contract.md#L21, attachments/api-contract.md#L51, attachments/api-contract.md#L55, attachments/api-contract.md#L62 |
| E2 | ISBN not in catalogue (GET /BookStore/v1/Book, POST /BookStore/v1/Books) | 400 | { "code": "1205", "message": "ISBN supplied is not available in Books Collection!" } | attachments/api-contract.md#L22, attachments/api-contract.md#L46, attachments/api-contract.md#L51 |
| E3 | ISBN not in user's collection (DELETE /BookStore/v1/Book) | 400 | { "code": "1206", "message": "ISBN supplied is not available in User's Collection!" } | attachments/api-contract.md#L23, attachments/api-contract.md#L55 |
| E4 | ISBN already in user's collection (POST /BookStore/v1/Books) | 400 | { "code": "1210", "message": "ISBN already present in the User's Collection!" } | attachments/api-contract.md#L24, attachments/api-contract.md#L51 |

## Authentication

protected calls send Authorization: Bearer <token>; the token is obtained with POST /Account/v1/GenerateToken and body { "userName", "password" } — credentials: the run's own user (unique user name, e.g. qa-<timestamp>) with the password from environment variable DQ_USER_PASSWORD (story.md#L29) _(attachments/api-contract.md#L7, attachments/api-contract.md#L9-L10, story.md#L30)_

## Test data

each run creates its own user through POST /Account/v1/User with a unique user name (for example qa-<timestamp>) and the password from environment variable DQ_USER_PASSWORD, and a token with POST /Account/v1/GenerateToken (story.md#L29-L30); books are added to that user's collection through POST /BookStore/v1/Books (AC-6, story.md#L42); AC-12's "another user's collection" cases (story.md#L48) need a second such user
- books used in the examples are part of the standard catalogue, e.g. 9781449325862 "Git Pocket Guide", 9781593277574 "Understanding ECMAScript 6", 9781449331818 "Learning JavaScript Design Patterns" (story.md#L31)
- the password comes from the environment variable DQ_USER_PASSWORD (story.md#L29)
- Cleanup: delete each created user at the end with DELETE /Account/v1/User/{UUID}

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | request body field names for creating a user with POST /Account/v1/User (the story says a user name and a password; neither source names the fields) | mechanics | yes | AC-6, AC-7, AC-8, AC-9, AC-10, AC-11, AC-12 | story → attachments → aut | discovered-in-aut: POST /Account/v1/User takes JSON { "userName": "<name>", "password": "<password>" } and answers 201 with { "userID", "username", "books": [] } |
| G2 | how the catalogue list on /books is rendered (book rows, title/author/publisher cells, title link, search box locator) | mechanics | yes | AC-3, AC-4, AC-5 | story → aut | discovered-in-aut: /books renders an ARIA table; each book is a row with a link named by the title (opens the detail page) and cells for author and publisher; the header row (Image, Title, Author, Publisher) has no link; the search box is textbox "Type to search" |
| G3 | route and field labels of a book's detail page (how ISBN, title, sub title, author, publisher and total pages are shown) | mechanics | yes | AC-5 | story → aut | discovered-in-aut: clicking a title opens /books?search=<isbn>; the detail page shows label/value pairs in wrappers #ISBN-wrapper, #title-wrapper, #subtitle-wrapper, #author-wrapper, #publisher-wrapper, #pages-wrapper |
| G4 | sign-in form on /login (field labels, submit control) and how the Profile page is reached after sign-in | mechanics | yes | AC-7, AC-9 | story → aut | discovered-in-aut: /login has textboxes "UserName" and "Password" and button "Login"; a successful sign-in lands on /profile. Note: a sign-in issues a new token and revokes previously issued tokens for that user |
| G5 | Profile page book rows (title/author/publisher cells), the row's delete icon, and how the "Do you want to delete this book?" confirmation is presented and confirmed with OK | mechanics | yes | AC-7, AC-9 | story → aut | discovered-in-aut: Profile page lists the collection as table rows (title link, author, publisher cells) with a per-row "Delete" icon (title="Delete"); clicking it opens modal dialog "Delete Book" with the text "Do you want to delete this book?" and buttons OK / Cancel |
| G6 | no acceptance criterion covers DELETE /BookStore/v1/Books?UserId={UUID} (remove all books of the user); is it in scope, and what must it do beyond 204? | oracle | no |  | story → attachments | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17-L19 | context | user story; the capabilities it names are covered by AC-1..AC-12 |
| story.md#L23-L25 | context | routes /books and /profile (entry points of AC-3..AC-5, AC-7, AC-9) and the pointer to api-contract.md, which is attached and captured |
| story.md#L29 | test-data, endpoint, G1 |  |
| story.md#L30 | auth, endpoint |  |
| story.md#L31 | test-data |  |
| story.md#L35 | not-a-requirement | header row of the acceptance-criteria table |
| story.md#L37 | AC-1 |  |
| story.md#L38 | AC-2 |  |
| story.md#L39 | AC-3 |  |
| story.md#L40 | AC-4 |  |
| story.md#L41 | AC-5 |  |
| story.md#L42 | AC-6 |  |
| story.md#L43 | AC-7 |  |
| story.md#L44 | AC-8 |  |
| story.md#L45 | AC-9 |  |
| story.md#L46 | AC-10 |  |
| story.md#L47 | AC-11 |  |
| story.md#L48 | AC-12 |  |
| attachments/api-contract.md#L3 | endpoint, context | API on the web site's host (apiBaseURL); Content-Type: application/json noted in each endpoint's request |
| attachments/api-contract.md#L7 | auth |  |
| attachments/api-contract.md#L9-L10 | auth, endpoint |  |
| attachments/api-contract.md#L12-L13 | endpoint, test-data |  |
| attachments/api-contract.md#L17 | R1, error-model |  |
| attachments/api-contract.md#L19 | error-model | header row of the error table |
| attachments/api-contract.md#L21 | E1 |  |
| attachments/api-contract.md#L22 | E2 |  |
| attachments/api-contract.md#L23 | E3 |  |
| attachments/api-contract.md#L24 | E4 |  |
| attachments/api-contract.md#L28-L38 | R2, AC-1 |  |
| attachments/api-contract.md#L43 | endpoint, AC-1 |  |
| attachments/api-contract.md#L46 | endpoint, AC-2, AC-11, E2 |  |
| attachments/api-contract.md#L49-L50 | endpoint, AC-6 |  |
| attachments/api-contract.md#L51 | endpoint, AC-8, AC-11, AC-12, E1, E2, E4 |  |
| attachments/api-contract.md#L54-L55 | endpoint, AC-10, AC-12, E1, E3 |  |
| attachments/api-contract.md#L58 | endpoint, G6 |  |
| attachments/api-contract.md#L61 | endpoint, AC-6 |  |
| attachments/api-contract.md#L62 | AC-12, E1 |  |
