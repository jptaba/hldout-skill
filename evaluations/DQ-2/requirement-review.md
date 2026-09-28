# Requirement review — DQ-2

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | user story, context (routes /books and /profile), accounts and data constraints, AC-1 to AC-12 |
| attachments/api-contract.md | base URL and JSON bodies, Bearer authentication and token endpoint, error envelope and error table, Book object fields, endpoints with bodies, statuses and errors |

## Testability decisions

_How each criterion is verified (write the decision after the arrow)._

- **AC-1** (api) GET /BookStore/v1/Books returns 200 with a books list; every entry carries all catalogue fields listed in the contract (isbn, title, subT… →
- **AC-2** (api) Looking up one book with GET /BookStore/v1/Book?ISBN=<isbn> returns 200 with the same data as that book's entry in the catalogue. →
- **AC-3** (e2e) The Book Store page /books lists every book returned by the catalogue API, each with its title, author and publisher. →
- **AC-4** (ui) The search box on /books (placeholder "Type to search") filters the list while typing, case-insensitively, on title, author or publisher.… →
- **AC-5** (ui) Clicking a book title on /books opens that book's detail page, showing its ISBN, title, sub title, author, publisher and total pages as i… →
- **AC-6** (api) Adding books to a user's collection with POST /BookStore/v1/Books returns 201 and echoes the added ISBNs; GET /Account/v1/User/{UUID} the… →
- **AC-7** (e2e) A book added through the API appears on the Profile page after the user signs in on /login, with its title, author and publisher. →
- **AC-8** (api) Adding a book that is already in the user's collection is rejected with the "already present" error from the contract; the collection sti… →
- **AC-9** (e2e) On the Profile page, deleting one book (the row's delete icon, then confirming "Do you want to delete this book?" with OK) removes that r… →
- **AC-10** (api) DELETE /BookStore/v1/Book removes one book from the collection and returns 204; the other books remain. Removing a book that is not in th… →
- **AC-11** (api) An ISBN that is not in the catalogue is rejected with the "not available in Books Collection" error from the contract, both for the looku… →
- **AC-12** (api) Collection calls without a valid token are refused with the "not authorized" error from the contract: adding, deleting and reading a user… →

## Ambiguities / open questions

- G1 (mechanics, required): how a test obtains the UUID (userId) of a pre-provisioned test user, needed in POST /BookStore/v1/Books, DELETE /BookStore/v1/Book and GET /Account/v1/User/{UUID} — open
- G2 (mechanics, required): Book Store page /books: how the book rows, each row's title (link), author and publisher, and the search box are found — open
- G3 (mechanics, required): book detail page: its route and how the ISBN, title, sub title, author, publisher and total pages are found — open
- G4 (mechanics, required): sign-in page /login: how the user name and password fields and the sign-in action are found — open
- G5 (mechanics, required): Profile page /profile: how the book rows (title, author, publisher), a row's delete icon and the confirmation "Do you want to delete this book?" with its OK are found (browser dialog or in-page modal) — open
