# Source: DQ-2 — Personal book collection - browse the catalogue and manage my books
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: GET /BookStore/v1/Books returns 200 with a books list; every entry carries all catalogue fields listed in the contract (isbn, title, subTitle, author, publish_date, publisher, pages, description, website).
# AC-2: Looking up one book with GET /BookStore/v1/Book?ISBN=<isbn> returns 200 with the same data as that book's entry in the catalogue.
# AC-3: The Book Store page /books lists every book returned by the catalogue API, each with its title, author and publisher.
# AC-4: The search box on /books (placeholder "Type to search") filters the list while typing, case-insensitively, on title, author or publisher. Examples: "javascript" shows exactly Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications and Eloquent JavaScript, Second Edition; "zakas" shows only Understanding ECMAScript 6; "No Starch" shows only Eloquent JavaScript, Second Edition and Understanding ECMAScript 6. A term that matches no book leaves no book rows in the list.
# AC-5: Clicking a book title on /books opens that book's detail page, showing its ISBN, title, sub title, author, publisher and total pages as in the catalogue.
# AC-6: Adding books to a user's collection with POST /BookStore/v1/Books returns 201 and echoes the added ISBNs; GET /Account/v1/User/{UUID} then lists those books in the user's books.
# AC-7: A book added through the API appears on the Profile page after the user signs in on /login, with its title, author and publisher.
# AC-8: Adding a book that is already in the user's collection is rejected with the "already present" error from the contract; the collection still contains that book exactly once.
# AC-9: On the Profile page, deleting one book (the row's delete icon, then confirming "Do you want to delete this book?" with OK) removes that row only; the other books remain. Afterwards the user's collection in the API no longer contains the deleted book and still contains the others.
# AC-10: DELETE /BookStore/v1/Book removes one book from the collection and returns 204; the other books remain. Removing a book that is not in the collection is rejected with the "not in user's collection" error from the contract.
# AC-11: An ISBN that is not in the catalogue is rejected with the "not available in Books Collection" error from the contract, both for the lookup (GET /BookStore/v1/Book) and when adding it to a collection; nothing is added.
# AC-12: Collection calls without a valid token are refused with the "not authorized" error from the contract: adding, deleting and reading a user's collection without a token, and reading or adding to another user's collection with one's own token.
#
# ENDPOINT: GET /BookStore/v1/Books — 200 { "books": [ <Book>, ... ] } - the whole catalogue (attachments/api-contract.md#L43)
# ENDPOINT: GET /BookStore/v1/Book — 200 <Book> (attachments/api-contract.md#L46)
# ENDPOINT: POST /BookStore/v1/Books — 201 { "books": [ { "isbn": "..." }, ... ] } - the ISBNs that were added (attachments/api-contract.md#L50)
# ENDPOINT: DELETE /BookStore/v1/Book — 204, empty body (attachments/api-contract.md#L55)
# ENDPOINT: GET /Account/v1/User/{UUID} — 200 { "userId": "<UUID>", "username": "...", "books": [ <Book>, ... ] } (attachments/api-contract.md#L61)
# ENDPOINT: POST /Account/v1/User — 201, returns userID (attachments/api-contract.md#L12)
# ENDPOINT: POST /Account/v1/GenerateToken — 200 { "token": "<jwt>", "expires": "<ISO-8601>", "status": "Success", "result": "User authorized successfully." } (attachments/api-contract.md#L10)
# ENDPOINT: DELETE /Account/v1/User/{UUID} — 204 (attachments/api-contract.md#L13)
#
# OPEN-QUESTION: G6 — no acceptance criterion covers DELETE /BookStore/v1/Books?UserId={UUID} (remove all books of the user); is it in scope, and what must it do beyond 204?

# ASSUMPTION: G1 — POST /Account/v1/User takes { "userName", "password" } like GenerateToken (mechanics, confirmed in hardening)
# ASSUMPTION: AC-4 "while typing" is exercised by typing the term character by character without pressing Enter; no latency is asserted (none is stated)
# ASSUMPTION: AC-12 "invalid token" is exercised with a malformed Bearer value; the story does not define invalid further
# ASSUMPTION: the exact success status of POST /BookStore/v1/Books (201) is asserted only in SCN-008; other scenarios add books as preconditions

@story:DQ-2
Feature: Personal book collection - browse the catalogue and manage my books
  As a signed-in reader
  I want to browse and search the Book Store catalogue and keep my own collection of books
  So that I can see the books I am interested in on my profile

  # from story AC-1, api-contract.md §Book object
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: The catalogue API returns every book with all catalogue fields
    When I GET /BookStore/v1/Books
    Then the response status is 200
    And the body has a books list
    And every entry in books carries isbn, title, subTitle, author, publish_date, publisher, pages, description and website

  # from story AC-1, api-contract.md#L28-L38 (R2 field types)
  @SCN-002 @AC-1 @priority:P2 @type:contract @layer:api
  Scenario: Every catalogue entry has the field types of the Book object
    When I GET /BookStore/v1/Books
    Then every entry's isbn, title, subTitle, author, publisher, description and website are strings, pages is a number and publish_date is an ISO-8601 string

  # from story AC-2, story.md#L31 (example ISBNs)
  @SCN-003 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario Outline: Looking up one book returns the same data as its catalogue entry
    Given I read the catalogue entry for <isbn> from GET /BookStore/v1/Books
    When I GET /BookStore/v1/Book?ISBN=<isbn>
    Then the response status is 200
    And the returned book equals the catalogue entry
    Examples:
      | isbn          |
      | 9781449325862 |
      | 9781593277574 |
      | 9781449331818 |

  # from story AC-3, story Context (/books)
  @SCN-004 @AC-3 @priority:P1 @type:integration @layer:e2e
  Scenario: The Book Store page lists every catalogue book with title, author and publisher
    Given I read the catalogue from GET /BookStore/v1/Books
    And I am on the Book Store page /books
    Then every catalogue book is listed on the page
    And each listed book shows its title, author and publisher

  # from story AC-4
  @SCN-005 @AC-4 @priority:P1 @type:functional @layer:ui
  Scenario Outline: Searching filters the list while typing, case-insensitively
    Given I am on the Book Store page /books
    When I type "<term>" into the search box with placeholder "Type to search" without submitting
    Then exactly the books <titles> are listed
    Examples:
      | term       | titles                                                                                                                             |
      | javascript | Learning JavaScript Design Patterns; Speaking JavaScript; Programming JavaScript Applications; Eloquent JavaScript, Second Edition |
      | zakas      | Understanding ECMAScript 6                                                                                                         |
      | No Starch  | Eloquent JavaScript, Second Edition; Understanding ECMAScript 6                                                                    |
      | JAVASCRIPT | Learning JavaScript Design Patterns; Speaking JavaScript; Programming JavaScript Applications; Eloquent JavaScript, Second Edition |

  # from story AC-4 (no-match term)
  @SCN-006 @AC-4 @priority:P2 @type:negative @layer:ui
  Scenario: A search term that matches no book leaves no book rows
    Given I am on the Book Store page /books
    When I type a term that matches no book into the search box with placeholder "Type to search"
    Then no book rows are listed

  # from story AC-5
  @SCN-007 @AC-5 @priority:P1 @type:functional @layer:ui
  Scenario: Clicking a book title opens its detail page with the catalogue values
    Given I read the catalogue entry for 9781449325862 from GET /BookStore/v1/Books
    And I am on the Book Store page /books
    When I click the title "Git Pocket Guide"
    Then the book's detail page shows its ISBN, title, sub title, author, publisher and total pages as in the catalogue

  # from story AC-6, api-contract.md §POST /BookStore/v1/Books
  @SCN-008 @AC-6 @priority:P1 @type:functional @layer:api
  Scenario: Adding books to my collection returns 201, echoes the ISBNs and lists them on my account
    Given I created my own user and obtained a token
    When I POST /BookStore/v1/Books with ISBNs 9781449325862 and 9781593277574
    Then the response status is 201
    And the response books list exactly the added ISBNs
    And GET /Account/v1/User/{UUID} lists both books in my books

  # from story AC-7
  @SCN-009 @AC-7 @priority:P1 @type:integration @layer:e2e
  Scenario: A book added through the API appears on the Profile page after signing in
    Given I created my own user and obtained a token
    And I added 9781449325862 to my collection through the API
    And I am on the sign-in page /login
    When I sign in with my user name and password
    Then the Profile page lists the book with its title, author and publisher

  # from story AC-8, api-contract.md#L24
  @SCN-010 @AC-8 @priority:P1 @type:idempotency @layer:api
  Scenario: Adding a book already in my collection is rejected and the book stays once
    Given I created my own user and obtained a token
    And I added 9781449325862 to my collection through the API
    When I POST /BookStore/v1/Books with 9781449325862 again
    Then the response status is 400
    And the error is code "1210" with message "ISBN already present in the User's Collection!"
    And GET /Account/v1/User/{UUID} lists 9781449325862 exactly once

  # from story AC-9
  @SCN-011 @AC-9 @priority:P1 @type:integration @layer:e2e
  Scenario: Deleting one book on the Profile page removes only that book
    Given I created my own user and obtained a token
    And I added 9781449325862 and 9781593277574 to my collection through the API
    And I signed in on /login and I am on the Profile page
    When I click the delete icon of the "Git Pocket Guide" row
    Then the confirmation "Do you want to delete this book?" is shown
    When I confirm with OK
    Then the "Git Pocket Guide" row is removed and "Understanding ECMAScript 6" remains
    And GET /Account/v1/User/{UUID} no longer lists 9781449325862 and still lists 9781593277574

  # from story AC-10, api-contract.md §DELETE /BookStore/v1/Book
  @SCN-012 @AC-10 @priority:P1 @type:functional @layer:api
  Scenario: Deleting one book through the API returns 204 and keeps the others
    Given I created my own user and obtained a token
    And I added 9781449325862 and 9781593277574 to my collection through the API
    When I DELETE /BookStore/v1/Book with 9781449325862
    Then the response status is 204
    And GET /Account/v1/User/{UUID} no longer lists 9781449325862 and still lists 9781593277574

  # from story AC-10, api-contract.md#L23
  @SCN-013 @AC-10 @priority:P2 @type:negative @layer:api
  Scenario: Deleting a book that is not in my collection is rejected
    Given I created my own user and obtained a token
    And I added 9781593277574 to my collection through the API
    When I DELETE /BookStore/v1/Book with 9781449325862, which is not in my collection
    Then the response status is 400
    And the error is code "1206" with message "ISBN supplied is not available in User's Collection!"

  # from story AC-11, api-contract.md#L22, #L46
  @SCN-014 @AC-11 @priority:P2 @type:negative @layer:api
  Scenario: Looking up an ISBN that is not in the catalogue is rejected
    Given an ISBN that is not in the catalogue returned by GET /BookStore/v1/Books
    When I GET /BookStore/v1/Book?ISBN=<that ISBN>
    Then the response status is 400
    And the error is code "1205" with message "ISBN supplied is not available in Books Collection!"

  # from story AC-11, api-contract.md#L51
  @SCN-015 @AC-11 @priority:P2 @type:negative @layer:api
  Scenario: Adding an ISBN that is not in the catalogue is rejected and nothing is added
    Given I created my own user and obtained a token
    And an ISBN that is not in the catalogue returned by GET /BookStore/v1/Books
    When I POST /BookStore/v1/Books with that ISBN
    Then the response status is 400
    And the error is code "1205" with message "ISBN supplied is not available in Books Collection!"
    And GET /Account/v1/User/{UUID} shows my collection is still empty

  # from story AC-12, api-contract.md#L21, #L51, #L55, #L62
  @SCN-016 @AC-12 @priority:P1 @type:security @layer:api
  Scenario Outline: Collection calls without a valid token are refused
    Given I created my own user and obtained a token
    And another user exists
    When I call <call> <auth>
    Then the response status is 401
    And the error is code "1200" with message "User not authorized!"
    Examples:
      | call                                          | auth                  |
      | POST /BookStore/v1/Books for my user          | without a token       |
      | DELETE /BookStore/v1/Book for my user         | without a token       |
      | GET /Account/v1/User/{my UUID}                | without a token       |
      | POST /BookStore/v1/Books for my user          | with an invalid token |
      | DELETE /BookStore/v1/Book for my user         | with an invalid token |
      | GET /Account/v1/User/{my UUID}                | with an invalid token |
      | GET /Account/v1/User/{other user's UUID}      | with my own token     |
      | POST /BookStore/v1/Books for the other userId | with my own token     |
