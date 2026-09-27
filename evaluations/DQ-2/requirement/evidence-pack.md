# Evidence pack — DQ-2

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DQ-2
  L3   | summary: "Personal book collection - browse the catalogue and manage my books"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DQ-2
  L10  | fetchedAt: 2026-09-27T05:31:50.259Z
  L11  | ---
  L12  | 
  L13  | # DQ-2: Personal book collection - browse the catalogue and manage my books
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | **As a** signed-in reader  
● L18  | **I want** to browse and search the Book Store catalogue and keep my own collection of books  
● L19  | **so that** I can see the books I am interested in on my profile.
  L20  | 
  L21  | ## Context
  L22  | 
● L23  | The catalogue is shown on the Book Store page (`/books`); a signed-in user sees their own collection on the  
● L24  | Profile page (`/profile`). Clients manage the collection through the Book Store API; the endpoints, payloads and  
● L25  | error responses are specified in the attached **api-contract.md**.
  L26  | 
  L27  | ## Accounts and data
  L28  | 
● L29  | - Each run creates its own user through `POST /Account/v1/User` with a unique user name (for example `qa-<timestamp>`) and the password from the environment variable `DQ_USER_PASSWORD`, and deletes it at the end with `DELETE /Account/v1/User/{UUID}`.
● L30  | - A token for API calls is obtained with `POST /Account/v1/GenerateToken` (see the contract).
● L31  | - Books used in the examples are part of the standard catalogue, e.g. 9781449325862 "Git Pocket Guide", 9781593277574 "Understanding ECMAScript 6", 9781449331818 "Learning JavaScript Design Patterns".
  L32  | 
  L33  | ## Acceptance criteria
  L34  | 
● L35  | | ID | Criterion | Layer |
  L36  | | --- | --- | --- |
● L37  | | AC-1 | `GET /BookStore/v1/Books` returns **200** with a `books` list; every entry carries all catalogue fields listed in the contract (isbn, title, subTitle, author, publish_date, publisher, pages, description, website). | API |
● L38  | | AC-2 | Looking up one book with `GET /BookStore/v1/Book?ISBN=<isbn>` returns **200** with the same data as that book's entry in the catalogue. | API |
● L39  | | AC-3 | The Book Store page `/books` lists every book returned by the catalogue API, each with its title, author and publisher. | UI + API |
● L40  | | AC-4 | The search box on `/books` (placeholder "Type to search") filters the list while typing, case-insensitively, on title, author or publisher. Examples: "javascript" shows exactly Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications and Eloquent JavaScript, Second Edition; "zakas" shows only Understanding ECMAScript 6; "No Starch" shows only Eloquent JavaScript, Second Edition and Understanding ECMAScript 6. A term that matches no book leaves no book rows in the list. | UI |
● L41  | | AC-5 | Clicking a book title on `/books` opens that book's detail page, showing its ISBN, title, sub title, author, publisher and total pages as in the catalogue. | UI |
● L42  | | AC-6 | Adding books to a user's collection with `POST /BookStore/v1/Books` returns **201** and echoes the added ISBNs; `GET /Account/v1/User/{UUID}` then lists those books in the user's `books`. | API |
● L43  | | AC-7 | A book added through the API appears on the Profile page after the user signs in on `/login`, with its title, author and publisher. | UI + API |
● L44  | | AC-8 | Adding a book that is already in the user's collection is rejected with the "already present" error from the contract; the collection still contains that book exactly once. | API |
● L45  | | AC-9 | On the Profile page, deleting one book (the row's delete icon, then confirming "Do you want to delete this book?" with OK) removes that row only; the other books remain. Afterwards the user's collection in the API no longer contains the deleted book and still contains the others. | UI + API |
● L46  | | AC-10 | `DELETE /BookStore/v1/Book` removes one book from the collection and returns **204**; the other books remain. Removing a book that is not in the collection is rejected with the "not in user's collection" error from the contract. | API |
● L47  | | AC-11 | An ISBN that is not in the catalogue is rejected with the "not available in Books Collection" error from the contract, both for the lookup (`GET /BookStore/v1/Book`) and when adding it to a collection; nothing is added. | API |
● L48  | | AC-12 | Collection calls without a valid token are refused with the "not authorized" error from the contract: adding, deleting and reading a user's collection without a token, and reading or adding to another user's collection with one's own token. | API |
  L49  | 
  L50  | ## Attachments
  L51  | 
  L52  | | File | MIME | Bytes | How to read | Local path |
  L53  | | --- | --- | --- | --- | --- |
  L54  | | api-contract.md | text/markdown | 2567 | text — read directly | attachments/api-contract.md |
  L55  | 
```

## attachments/api-contract.md

```text
  L1   | # Book Store API - collection contract (v1)
  L2   | 
● L3   | Base URL: the Book Store origin (same host as the web site). All bodies are JSON (`Content-Type: application/json`).
  L4   | 
  L5   | ## Authentication
  L6   | 
● L7   | Protected calls send `Authorization: Bearer <token>`. A token is obtained with:
  L8   | 
● L9   | `POST /Account/v1/GenerateToken`  body `{ "userName": "...", "password": "..." }`
● L10  | -> 200 `{ "token": "<jwt>", "expires": "<ISO-8601>", "status": "Success", "result": "User authorized successfully." }`
  L11  | 
● L12  | Accounts: `POST /Account/v1/User` (create, 201, returns `userID`), `GET /Account/v1/User/{UUID}` (protected),
● L13  | `DELETE /Account/v1/User/{UUID}` (protected, 204).
  L14  | 
  L15  | ## Error envelope
  L16  | 
● L17  | All errors: `{ "code": "<string>", "message": "<string>" }`
  L18  | 
● L19  | | Error | HTTP | code | message |
  L20  | |-------|------|------|---------|
● L21  | | Not authorized | 401 | 1200 | User not authorized! |
● L22  | | ISBN not in catalogue | 400 | 1205 | ISBN supplied is not available in Books Collection! |
● L23  | | ISBN not in user's collection | 400 | 1206 | ISBN supplied is not available in User's Collection! |
● L24  | | ISBN already in user's collection | 400 | 1210 | ISBN already present in the User's Collection! |
  L25  | 
  L26  | ## Book object
  L27  | 
● L28  | | Field | Type | Example |
  L29  | |-------|------|---------|
● L30  | | isbn | string | "9781449325862" |
● L31  | | title | string | "Git Pocket Guide" |
● L32  | | subTitle | string | "A Working Introduction" |
● L33  | | author | string | "Richard E. Silverman" |
● L34  | | publish_date | string (ISO-8601) | "2020-06-04T08:48:39.000Z" |
● L35  | | publisher | string | "O'Reilly Media" |
● L36  | | pages | number | 234 |
● L37  | | description | string | |
● L38  | | website | string (URL) | |
  L39  | 
  L40  | ## Endpoints
  L41  | 
  L42  | ### GET /BookStore/v1/Books  (public)
● L43  | 200 `{ "books": [ <Book>, ... ] }` - the whole catalogue.
  L44  | 
  L45  | ### GET /BookStore/v1/Book?ISBN={isbn}  (public)
● L46  | 200 `<Book>`. Unknown ISBN -> 400 / 1205.
  L47  | 
  L48  | ### POST /BookStore/v1/Books  (protected)
● L49  | Body `{ "userId": "<UUID>", "collectionOfIsbns": [ { "isbn": "..." }, ... ] }`
● L50  | 201 `{ "books": [ { "isbn": "..." }, ... ] }` - the ISBNs that were added.
● L51  | Errors: unknown ISBN -> 400 / 1205; ISBN already in the collection -> 400 / 1210; no/invalid token or another user's `userId` -> 401 / 1200.
  L52  | 
  L53  | ### DELETE /BookStore/v1/Book  (protected)
● L54  | Body `{ "isbn": "...", "userId": "<UUID>" }`
● L55  | 204, empty body. ISBN not in the user's collection -> 400 / 1206; no/invalid token -> 401 / 1200.
  L56  | 
  L57  | ### DELETE /BookStore/v1/Books?UserId={UUID}  (protected)
● L58  | Removes all books of the user. 204, empty body.
  L59  | 
  L60  | ### GET /Account/v1/User/{UUID}  (protected)
● L61  | 200 `{ "userId": "<UUID>", "username": "...", "books": [ <Book>, ... ] }`.
● L62  | No/invalid token, or another user's UUID -> 401 / 1200.
  L63  | 
```
