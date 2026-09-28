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
# ENDPOINT: GET /BookStore/v1/Books — 200 { "books": [ <Book>, ... ] } - the whole catalogue
# ENDPOINT: GET /BookStore/v1/Book — 200 <Book>
# ENDPOINT: POST /BookStore/v1/Books — 201 { "books": [ { "isbn": "..." }, ... ] } - the ISBNs that were added
# ENDPOINT: DELETE /BookStore/v1/Book — 204, empty body
# ENDPOINT: GET /Account/v1/User/{UUID} — 200 { "userId": "<UUID>", "username": "...", "books": [ <Book>, ... ] }
#

# ASSUMPTION: tests use the pre-provisioned test users (seed.account() hands each test its own); every collection a test used is left empty afterwards (story: Accounts and data)

@story:DQ-2
Feature: Personal book collection - browse the catalogue and manage my books

  # from story.md AC-1
  @SCN-001 @AC-1 @priority:P1 @type:contract @layer:api
  Scenario: The catalogue lists every book with all its fields
    When a client requests GET /BookStore/v1/Books
    Then the answer is 200 with a books list
    And every entry has isbn, title, subTitle, author, publish_date, publisher, pages, description and website

  # from story.md AC-2
  @SCN-002 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario: Looking one book up returns its catalogue entry
    Given the catalogue entry of 9781449325862
    When a client requests GET /BookStore/v1/Book?ISBN=9781449325862
    Then the answer is 200 with the same data as the catalogue entry

  # from story.md AC-3
  @SCN-003 @AC-3 @priority:P1 @type:integration @layer:e2e
  Scenario: The Book Store page lists every catalogue book
    Given the books GET /BookStore/v1/Books returns
    When I open the Book Store page
    Then every one of them is listed with its title, author and publisher

  # from story.md AC-4
  @SCN-004 @AC-4 @priority:P1 @type:functional @layer:ui
  Scenario Outline: The search box filters by title, author or publisher ("<term>")
    Given I am on the Book Store page
    When I type "<term>" in the "Type to search" box
    Then exactly these books are listed: <titles>

    Examples:
      | term       | titles                                                                                                                    |
      | javascript | Learning JavaScript Design Patterns, Speaking JavaScript, Programming JavaScript Applications, Eloquent JavaScript, Second Edition |
      | zakas      | Understanding ECMAScript 6                                                                                                |
      | No Starch  | Eloquent JavaScript, Second Edition, Understanding ECMAScript 6                                                           |

  # from story.md AC-4
  @SCN-005 @AC-4 @priority:P2 @type:negative @layer:ui
  Scenario: A search term that matches no book leaves no book rows
    Given I am on the Book Store page
    When I type a term that matches no book
    Then no book rows are listed

  # from story.md AC-5
  @SCN-006 @AC-5 @priority:P1 @type:functional @layer:ui
  Scenario: A book's detail page shows its catalogue data
    Given I am on the Book Store page
    When I click the title "Git Pocket Guide"
    Then the detail page shows its ISBN, title, sub title, author, publisher and total pages as in the catalogue

  # from story.md AC-6
  @SCN-007 @AC-6 @priority:P1 @type:functional @layer:api
  Scenario: Adding books to my collection
    Given I am a test user with an empty collection
    When I POST /BookStore/v1/Books with two catalogue ISBNs
    Then the answer is 201 and echoes the two ISBNs
    And GET /Account/v1/User/{UUID} lists both books

  # from story.md AC-7
  @SCN-008 @AC-7 @priority:P1 @type:integration @layer:e2e
  Scenario: A book added through the API appears on my Profile page
    Given I am a test user with "Git Pocket Guide" added through the API
    When I sign in on /login and open my Profile
    Then "Git Pocket Guide" is listed with its title, author and publisher

  # from story.md AC-8
  @SCN-009 @AC-8 @priority:P1 @type:idempotency @layer:api
  Scenario: Adding a book that is already in my collection is refused
    Given I am a test user with "Git Pocket Guide" in my collection
    When I POST /BookStore/v1/Books with it again
    Then the answer is 400 with code "1210" and "ISBN already present in the User's Collection!"
    And my collection contains it exactly once

  # from story.md AC-9
  @SCN-010 @AC-9 @priority:P1 @type:integration @layer:e2e
  Scenario: Deleting one book on the Profile page
    Given I am a test user with "Git Pocket Guide" and "Understanding ECMAScript 6" in my collection, signed in on /login
    When I press the delete icon of "Git Pocket Guide" and confirm "Do you want to delete this book?" with OK
    Then its row is gone and "Understanding ECMAScript 6" remains
    And GET /Account/v1/User/{UUID} no longer lists "Git Pocket Guide" and still lists "Understanding ECMAScript 6"

  # from story.md AC-10
  @SCN-011 @AC-10 @priority:P1 @type:functional @layer:api
  Scenario: Removing one book through the API
    Given I am a test user with two books in my collection
    When I DELETE /BookStore/v1/Book for one of them
    Then the answer is 204
    And the other book remains in my collection

  # from story.md AC-10
  @SCN-012 @AC-10 @priority:P2 @type:negative @layer:api
  Scenario: Removing a book that is not in my collection is refused
    Given I am a test user with an empty collection
    When I DELETE /BookStore/v1/Book for a catalogue book
    Then the answer is 400 with code "1206" and "ISBN supplied is not available in User's Collection!"

  # from story.md AC-11
  @SCN-013 @AC-11 @priority:P1 @type:negative @layer:api
  Scenario Outline: An ISBN that is not in the catalogue is refused (<call>)
    Given I am a test user with an empty collection
    When I <call> with an ISBN that is not in the catalogue
    Then the answer is 400 with code "1205" and "ISBN supplied is not available in Books Collection!"
    And nothing is added to my collection

    Examples:
      | call                                   |
      | look it up with GET /BookStore/v1/Book |
      | add it with POST /BookStore/v1/Books   |

  # from story.md AC-12
  @SCN-014 @AC-12 @priority:P1 @type:security @layer:api
  Scenario Outline: Collection calls without a valid token are refused (<call>)
    Given two test users, A and B
    When a client <call>
    Then the answer is 401 with code "1200" and "User not authorized!"

    Examples:
      | call                                                    |
      | adds a book to A's collection without a token           |
      | deletes a book from A's collection without a token      |
      | reads A's collection without a token                    |
      | reads B's collection with A's token                     |
      | adds a book to B's collection with A's token            |
