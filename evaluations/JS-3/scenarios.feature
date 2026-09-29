# Source: JS-3 — Product reviews — write, like and edit
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: A signed-in customer can write a review from the product details dialog: after typing a message in the review field and pressing Submit, the review appears in the dialog's Reviews list with that message and the customer's e-mail as its author.
# AC-2: Writing a review through the API (PUT /rest/products/{id}/reviews with the customer's token) answers HTTP 201 with {"status":"success"}. The review is then listed by GET /rest/products/{id}/reviews with the submitted message, the customer's e-mail as author, likesCount 0 and an empty likedBy.
# AC-3: GET /rest/products/{id}/reviews answers HTTP 200 with the envelope and review fields described in api-contract.md, with the stated types.
# AC-4: Writing, liking and editing reviews require a signed-in customer: PUT /rest/products/{id}/reviews, POST /rest/products/reviews and PATCH /rest/products/reviews without a token are refused with HTTP 401, and nothing is stored or changed.
# AC-5: Only its author can edit a review: a PATCH /rest/products/reviews by another signed-in customer is refused with HTTP 403, and the review's message stays unchanged.
# AC-6: Reviews and likes record who made them, from the session and not from the request: a review's author is the e-mail of the signed-in customer who wrote it, even when the request names someone else, and each like adds the liking customer's e-mail to the review's likedBy. likesCount always equals the number of entries in likedBy.
# AC-7: A customer can like a review only once: a second like by the same customer is refused with HTTP 403 and {"error":"Not allowed"}, and likesCount and likedBy stay as they were after the first like.
# AC-8: The like-once rule also holds when requests arrive at the same time: when one customer sends several likes for the same review simultaneously, exactly one is counted — likesCount rises by 1 and the customer's e-mail appears once in likedBy.
# AC-9: Invalid requests are refused: a like for a review id that does not exist answers HTTP 404 with {"error":"Not found"}, and in the dialog the Submit button stays disabled while the review field is empty.
# AC-10: A review message is at most 160 characters: the review field accepts 160 characters and a review of exactly 160 characters can be submitted; a 161st character is not accepted, and the field's counter shows 160/160.
# AC-11: The review form is accessible: the review field has an accessible name, and its accessible description includes the hint "Max. 160 characters"; the Submit button has an accessible name.
# AC-12: A review keeps its history through its lifecycle: a review written by customer A, liked by customer B and then edited by A shows A's edited message, still names A as its author, and keeps B's like (likesCount 1, likedBy containing B's e-mail).
# AC-13: What the API stores is what the shop shows: a review written through the API appears in the dialog's Reviews list with its author and message, and after one like through the API the review shows 1 as its like count in the dialog.
#
# ENDPOINT: GET /rest/products/{id}/reviews — 200 {"status": "success", "data": [ <review>, ... ]}
# ENDPOINT: PUT /rest/products/{id}/reviews — 201 {"status": "success"}
# ENDPOINT: POST /rest/products/reviews — 200 an object whose `updated` array holds the review after the like
# ENDPOINT: PATCH /rest/products/reviews — 200 an object whose `updated` array holds the review after the edit
#
# OPEN-QUESTION: G4 — type of the review field `product`: api-contract.md#L13 gives '—' as its type, so AC-3's 'with the stated types' states none for it; checked for presence only. What type must it have?
# OPEN-QUESTION: G5 — answer to the extra likes in a simultaneous burst (AC-8): the story states only that exactly one is counted, not what the other requests must answer (e.g. the 403 of AC-7). Judged on the count and likedBy only
# OPEN-QUESTION: G6 — whether a customer may like their own review: story.md#L19 speaks of liking other customers' reviews; no source says what liking one's own review must do. Tests of liking use a review written by another customer
# ASSUMPTION: G4 — the product field is not type-checked; it must identify product 1 (number 1 or string "1") (not asserted as a type)
# ASSUMPTION: G5 — the answers to the simultaneous likes are not judged, only what is counted (not asserted)
# ASSUMPTION: G6 — the customer who likes a review is always a second customer, never its author
# ASSUMPTION: AC-6 — the PUT whose author names someone else is not judged by its status (none is stated); what is judged is the author the stored review carries
# ASSUMPTION: AC-8 — "several" is three likes sent together, repeated over three rounds on a fresh review each

@story:JS-3
Feature: Product reviews — write, like and edit

  # from story.md#L35
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:ui
  Scenario: A signed-in customer writes a review in the product details dialog and sees it listed
    Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"
    When I type a new review message and press Submit
    Then the dialog's Reviews list shows my message
    And that review names my e-mail as its author

  # from story.md#L36
  @SCN-002 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario: A review written through the API is stored with its message and author and no likes
    Given I am a signed-in customer
    When I PUT a new review message for product 1 with my token
    Then the answer is HTTP 201 with {"status":"success"}
    And GET /rest/products/1/reviews lists a review with my message
    And its author is my e-mail, its likesCount is 0 and its likedBy is empty

  # from story.md#L37, attachments/api-contract.md#L6-L22
  @SCN-003 @AC-3 @priority:P2 @type:contract @layer:api
  Scenario: The reviews list has the stated envelope and review fields
    Given a review of mine exists for product 1
    When I GET /rest/products/1/reviews
    Then the answer is HTTP 200 with status "success" and data an array
    And every review has _id, message and author as strings, likesCount as a number and likedBy as an array of strings
    And every review's product identifies product 1

  # from story.md#L38
  @SCN-004 @AC-4 @priority:P1 @type:security @layer:api
  Scenario Outline: Writing, liking and editing without a token are refused and change nothing
    Given a review written by a signed-in customer exists for product 1
    When a client sends <call> without an Authorization header
    Then the answer is HTTP 401
    And <what stays>

    Examples:
      | call                                            | what stays                                        |
      | PUT /rest/products/1/reviews with a new message | no review with that message is listed             |
      | POST /rest/products/reviews for the review      | the review's likesCount and likedBy are unchanged |
      | PATCH /rest/products/reviews for the review     | the review's message is unchanged                 |

  # from story.md#L39
  @SCN-005 @AC-5 @priority:P1 @type:security @layer:api
  Scenario: Another customer cannot edit my review
    Given customer A has written a review for product 1
    And customer B is signed in
    When B sends PATCH /rest/products/reviews with A's review id and a new message
    Then the answer is HTTP 403
    And the review's message is still A's

  # from story.md#L40
  @SCN-006 @AC-6 @priority:P1 @type:audit @layer:api
  Scenario: A review's author comes from the session, not from the request
    Given I am a signed-in customer
    When I PUT a new review message for product 1 whose author names another e-mail
    Then the stored review with my message names my e-mail as its author

  # from story.md#L40
  @SCN-007 @AC-6 @priority:P1 @type:audit @layer:api
  Scenario: A like records who gave it
    Given customer A has written a review for product 1
    When customer B likes it
    Then the review's likedBy contains B's e-mail
    And its likesCount equals the number of entries in likedBy

  # from story.md#L41
  @SCN-008 @AC-7 @priority:P1 @type:idempotency @layer:api
  Scenario: A second like by the same customer is refused and changes nothing
    Given customer A has written a review for product 1
    And customer B has liked it once
    When B likes it again
    Then the answer is HTTP 403 with {"error":"Not allowed"}
    And the review's likesCount and likedBy are as they were after the first like

  # from story.md#L42
  @SCN-009 @AC-8 @priority:P1 @type:concurrency @layer:api
  Scenario: Simultaneous likes by one customer count once
    Given customer A has written a review for product 1
    When customer B sends three likes for it at the same time
    Then the review's likesCount has risen by exactly 1
    And B's e-mail appears once in its likedBy

  # from story.md#L43
  @SCN-010 @AC-9 @priority:P2 @type:negative @layer:api
  Scenario: A like for a review that does not exist is refused
    Given I am a signed-in customer
    When I like a review id that does not exist
    Then the answer is HTTP 404 with {"error":"Not found"}

  # from story.md#L43
  @SCN-011 @AC-9 @priority:P2 @type:negative @layer:ui
  Scenario: Submit stays disabled while the review field is empty
    Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"
    When the review field is empty
    Then the Submit button is disabled

  # from story.md#L44
  @SCN-012 @AC-10 @priority:P2 @type:boundary @layer:ui
  Scenario: A review of exactly 160 characters is accepted and submitted
    Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"
    When I type a message of exactly 160 characters and press Submit
    Then the field held all 160 characters before submitting
    And GET /rest/products/1/reviews lists the 160-character review

  # from story.md#L44
  @SCN-013 @AC-10 @priority:P2 @type:boundary @layer:ui
  Scenario: A 161st character is not accepted
    Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"
    When I type a message of 161 characters
    Then the review field holds 160 characters
    And the field's counter shows 160/160

  # from story.md#L45
  @SCN-014 @AC-11 @priority:P2 @type:accessibility @layer:ui
  Scenario: The review field and the Submit button have accessible names and the field describes its limit
    Given I am a signed-in customer on the details dialog of "Apple Juice (1000ml)"
    Then the review field has an accessible name
    And the review field's accessible description includes "Max. 160 characters"
    And the Submit button has an accessible name

  # from story.md#L46
  @SCN-015 @AC-12 @priority:P1 @type:composition @layer:api
  Scenario: Write, like and edit: the review keeps its author and its like
    Given customers A and B are signed in
    When A writes a review for product 1
    And B likes that review
    And A edits that review's message
    Then the review shows A's edited message
    And it still names A's e-mail as its author
    And its likesCount is 1 and its likedBy contains B's e-mail

  # from story.md#L47
  @SCN-016 @AC-13 @priority:P1 @type:integration @layer:e2e
  Scenario: A review written and liked through the API is shown in the dialog
    Given customer A has written a review for product 1 through the API
    And customer B has liked it through the API
    When I open the details dialog of "Apple Juice (1000ml)" and its Reviews list
    Then the list shows the review's message with A's e-mail as its author
    And the review shows 1 as its like count
