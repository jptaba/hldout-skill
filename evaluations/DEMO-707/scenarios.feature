# Source: DEMO-707 — Conduit — accounts, articles, comments, favourites and discovery
# Requirement contract: requirement-contract.json (ACs quoted from story.md; endpoints + error model from api-contract.md)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: `POST /api/users` with a new username, email and password responds 201 with the user (username, email, token).
# AC-2: Registering an email or username that is already taken responds 422 with a field-level `errors` object naming the taken field(s).
# AC-3: `POST /api/users/login` with valid credentials responds 200 with a token; with a wrong password it responds 401 Unauthorized with an `errors` object.
# AC-4: Endpoints that require authentication accept `Authorization: Token <jwt>` and respond 401 when the header is missing or the token is invalid.
# AC-5: An authenticated writer can create an article (title, description, body, tagList) → 201 with the article, including a `slug`, the author and the tags.
# AC-6: Titles need not be unique: a writer may publish a second article with the same title, which receives its own distinct slug (201).
# AC-7: A missing title, description or body is rejected with 422 and a field-level error.
# AC-8: Only the author may update or delete an article. Another signed-in user gets 403; the article is unchanged.
# AC-9: The author can update an article (200, changed fields returned) and delete it (204); afterwards `GET /api/articles/{slug}` responds 404.
# AC-10: Any reader filtering the article list by an author (`?author=<username>`) gets that author's published articles, including ones published moments ago.
# AC-11: The list supports pagination with `limit` (1–100) and `offset`. `limit` outside 1–100 is rejected with 422; values on the boundaries are accepted.
# AC-12: After following an author, that author's articles appear in the reader's feed (`GET /api/articles/feed`).
# AC-13: A signed-in reader can comment on any article (200, the comment is returned). An empty comment body is rejected with 422.
# AC-14: Comments are public: every reader of the article — the article's author, other users and anonymous visitors — sees all its comments in `GET /api/articles/{slug}/comments`.
# AC-15: Only a comment's author may delete it. Anyone else gets 403 and the comment remains.
# AC-16: Favouriting is idempotent: favouriting an article increases `favoritesCount` by one and sets `favorited: true`; favouriting it again (e.g. a double-click or retry) leaves the count unchanged; unfavouriting decreases it by one.
# AC-17: A registered user can sign in on the web app's Sign in page with email and password; afterwards the navigation shows their username and a "New Article" link.
# AC-18: A signed-in writer can publish an article from the editor ("New Article"); the article page then shows the title and body, and the article is available from the API under its slug.
# AC-19: An anonymous visitor sees "Sign in" and "Sign up" links in the navigation.
#
# ENDPOINT: POST /api/users — register
# ENDPOINT: POST /api/users/login — login
# ENDPOINT: GET /api/user — current user (auth)
# ENDPOINT: GET /api/articles — list / filter / paginate
# ENDPOINT: GET /api/articles/feed — feed (auth)
# ENDPOINT: POST /api/articles — create article (auth)
# ENDPOINT: GET /api/articles/{slug} — read article
# ENDPOINT: PUT /api/articles/{slug} — update (author)
# ENDPOINT: DELETE /api/articles/{slug} — delete (author)
# ENDPOINT: POST /api/articles/{slug}/comments — add comment (auth)
# ENDPOINT: GET /api/articles/{slug}/comments — list comments
# ENDPOINT: DELETE /api/articles/{slug}/comments/{id} — delete comment (comment author)
# ENDPOINT: POST /api/articles/{slug}/favorite — favourite (auth)
# ENDPOINT: DELETE /api/articles/{slug}/favorite — unfavourite (auth)
# ENDPOINT: POST /api/profiles/{username}/follow — follow (auth)
#
# ASSUMPTION: G4 — "published moments ago" is read as "discoverable within 10 s of the 201 response" (polled). The PO should confirm.
# ASSUMPTION: Users that are not the subject of a scenario (writer, readers) are registered once per worker and reused (seed.once); scenarios about registration/login register their own.
# ASSUMPTION: Scenarios that need an article create it through POST /api/articles (SCN-007's endpoint) as a pre-step — tagged @depends:SCN-007.
# OPEN-QUESTION: G5 — what status should an invalid offset (negative or non-numeric) return? The contract only says "offset (≥ 0)". Not tested.

@story:DEMO-707
Feature: Conduit platform core — accounts, articles, comments, favourites, discovery
  As a writer I publish and manage articles; as a reader I discover, comment on and favourite them;
  client apps get predictable errors and safe retries.

  # from story AC-1, api-contract.md (POST /api/users)
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: Registering a new user returns the user with a token
    When I POST a new unique username, email and password to /api/users
    Then the response status is 201
    And the body's user has the username, the email and a non-empty token

  # from story AC-2, api-contract.md §Errors (422)
  @SCN-002 @AC-2 @priority:P1 @type:negative @layer:api @depends:SCN-001
  Scenario Outline: Registering a taken <field> is rejected with a field-level error
    Given a registered user exists
    When I register a new user reusing that user's <field>
    Then the response status is 422
    And the errors object names "<field>"
    Examples:
      | field    |
      | email    |
      | username |

  # from story AC-3
  @SCN-003 @AC-3 @priority:P1 @type:functional @layer:api @depends:SCN-001
  Scenario: Logging in with valid credentials returns a token
    Given a registered user exists
    When I POST their email and password to /api/users/login
    Then the response status is 200
    And the body's user has a non-empty token

  # from story AC-3, api-contract.md §Errors (401 wrong login credentials)
  @SCN-004 @AC-3 @priority:P1 @type:security @layer:api @depends:SCN-001
  Scenario: A wrong password is refused with 401 and an errors object
    Given a registered user exists
    When I POST their email with a wrong password to /api/users/login
    Then the response status is 401
    And the body has an errors object

  # from story AC-4, api-contract.md (Authorization: Token <jwt>)
  @SCN-005 @AC-4 @priority:P1 @type:functional @layer:api
  Scenario: A valid Token header is accepted
    Given I am a registered user with a token
    When I GET /api/user with "Authorization: Token <jwt>"
    Then the response status is 200
    And the body's user is me

  # from story AC-4, api-contract.md §Errors (401 missing / invalid token)
  @SCN-006 @AC-4 @priority:P1 @type:security @layer:api
  Scenario Outline: A request to an authenticated endpoint with <credentials> is refused with 401
    When I GET /api/user with <credentials>
    Then the response status is 401
    Examples:
      | credentials       |
      | no header         |
      | an invalid token  |

  # from story AC-5, api-contract.md (POST /api/articles, article envelope)
  @SCN-007 @AC-5 @priority:P1 @type:functional @layer:api
  Scenario: A writer creates an article
    Given I am a signed-in writer
    When I POST a new article with title, description, body and two tags to /api/articles
    Then the response status is 201
    And the article has a slug, me as the author and the tags I sent

  # from story AC-6
  @SCN-008 @AC-6 @priority:P2 @type:functional @layer:api @depends:SCN-007
  Scenario: A second article with the same title gets its own slug
    Given I am a signed-in writer who published an article
    When I POST a second article with exactly the same title
    Then the response status is 201
    And its slug differs from the first article's slug

  # from story AC-7, api-contract.md §Errors (422)
  @SCN-009 @AC-7 @priority:P1 @type:negative @layer:api
  Scenario Outline: An article without a <field> is rejected with 422
    Given I am a signed-in writer
    When I POST an article without a <field>
    Then the response status is 422
    And the errors object names "<field>"
    Examples:
      | field       |
      | title       |
      | description |
      | body        |

  # from story AC-8, api-contract.md §Errors (403 not the owner)
  @SCN-010 @AC-8 @priority:P1 @type:security @layer:api @depends:SCN-007
  Scenario Outline: Another signed-in user cannot <action> someone else's article
    Given a writer published an article
    And I am a different signed-in user
    When I <action> that article
    Then the response status is 403
    And the article still exists with its original title
    Examples:
      | action |
      | update |
      | delete |

  # from story AC-9
  @SCN-011 @AC-9 @priority:P1 @type:functional @layer:api @depends:SCN-007
  Scenario: The author updates and then deletes an article
    Given I am a signed-in writer who published an article
    When I PUT a new body for the article
    Then the response status is 200 and the article has the new body
    When I DELETE the article
    Then the response status is 204
    And GET /api/articles/{slug} responds 404

  # from story AC-10, story §Context (all published content is public), gap G4
  @SCN-012 @AC-10 @priority:P1 @type:functional @layer:api @depends:SCN-007
  Scenario Outline: <reader> filtering by author finds an article published moments ago
    Given a writer published an article just now
    When <reader> lists articles with ?author=<the writer's username>
    Then within 10 seconds the list contains the new article
    Examples:
      | reader                    |
      | another signed-in reader  |
      | an anonymous visitor      |

  # from story AC-11, api-contract.md (limit 1–100)
  @SCN-013 @AC-11 @priority:P1 @type:boundary @layer:api
  Scenario Outline: limit=<limit> is <outcome>
    When I GET /api/articles?limit=<limit>
    Then the request is <outcome>
    Examples:
      | limit | outcome                                  |
      | 1     | accepted (200, at most 1 article)        |
      | 100   | accepted (200, at most 100 articles)     |
      | 0     | rejected with 422                        |
      | 101   | rejected with 422                        |

  # from story AC-11, api-contract.md (offset)
  @SCN-014 @AC-11 @priority:P2 @type:functional @layer:api
  Scenario: offset pages through the list
    When I GET /api/articles?limit=2 and /api/articles?limit=1&offset=1
    Then the article at offset 1 is the second article of the first page

  # from story AC-12
  @SCN-015 @AC-12 @priority:P2 @type:integration @layer:api @depends:SCN-007
  Scenario: A followed author's new article appears in the reader's feed
    Given a writer published an article
    And I am a signed-in reader who follows that writer
    When I GET /api/articles/feed
    Then the feed contains the writer's article

  # from story AC-13
  @SCN-016 @AC-13 @priority:P1 @type:functional @layer:api @depends:SCN-007
  Scenario: A signed-in reader comments on an article
    Given a writer published an article
    And I am a signed-in reader
    When I POST a comment to the article
    Then the response status is 200
    And the comment is returned with my text

  # from story AC-13, api-contract.md §Errors (422)
  @SCN-017 @AC-13 @priority:P2 @type:negative @layer:api @depends:SCN-007
  Scenario: An empty comment is rejected with 422
    Given a writer published an article
    And I am a signed-in reader
    When I POST a comment with an empty body
    Then the response status is 422

  # from story AC-14, story §Context
  @SCN-018 @AC-14 @priority:P1 @type:functional @layer:api @depends:SCN-016
  Scenario Outline: <viewer> sees a reader's comment on the article
    Given a writer published an article
    And a reader commented on it
    When <viewer> lists the article's comments
    Then the list contains the reader's comment
    Examples:
      | viewer                  |
      | the article's author    |
      | another signed-in user  |
      | an anonymous visitor    |

  # from story AC-15, api-contract.md §Errors (403 not the owner)
  @SCN-019 @AC-15 @priority:P1 @type:security @layer:api @depends:SCN-016
  Scenario: Someone other than the comment's author cannot delete it
    Given a writer published an article
    And a reader commented on it
    When the article's author (not the commenter) deletes the comment
    Then the response status is 403
    And the comment is still listed for the commenter

  # from story AC-16, story §User stories (safe retries)
  @SCN-020 @AC-16 @priority:P1 @type:idempotency @layer:api @depends:SCN-007
  Scenario: Favouriting twice counts once; unfavouriting decrements
    Given a writer published an article
    And I am a signed-in reader
    When I favourite the article
    Then favoritesCount is 1 and favorited is true
    When I favourite the article again
    Then favoritesCount is still 1
    When I unfavourite the article
    Then favoritesCount is 0

  # from story AC-17, gap G2 (Sign in page = /login)
  @SCN-021 @AC-17 @priority:P1 @type:functional @layer:e2e
  Scenario: A registered user signs in on the web app
    Given a registered user exists
    And I am on the Sign in page
    When I sign in with their email and password
    Then the navigation shows their username
    And the navigation shows a "New Article" link

  # from story AC-18, gap G3 (editor via "New Article")
  @SCN-022 @AC-18 @priority:P1 @type:integration @layer:e2e @depends:SCN-021
  Scenario: A writer publishes an article from the editor
    Given I am signed in on the web app as a registered writer
    And I open the editor from the "New Article" link
    When I fill in a unique title, a description and a body and publish
    Then the article page shows the title and the body
    And GET /api/articles/{slug} returns the article with that title

  # from story AC-19
  @SCN-023 @AC-19 @priority:P2 @type:functional @layer:ui
  Scenario: An anonymous visitor sees Sign in and Sign up
    Given I am an anonymous visitor on the home page
    Then the navigation shows a "Sign in" link
    And the navigation shows a "Sign up" link
