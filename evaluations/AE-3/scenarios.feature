# Source: AE-3 — Brands in the catalogue API and shop, and the Contact Us form
# Attachments used: contact-us-mockup.png (Contact Us fields, placeholders, mandatory/optional markers, submit/confirm/cancel flow, validation legend)
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: GET /api/brandsList returns responseCode 200 and a brands array; every entry has an id and a brand. For every entry, the product with that id in GET /api/productsList has exactly that brand.
# AC-2: PUT /api/brandsList is not supported: the HTTP status stays 200 and the JSON body is responseCode 405 with message "This request method is not supported.". POST and DELETE on /api/brandsList answer the same way.
# AC-3: The "Brands" panel on the Products page lists every brand exactly once, each followed by the number of its products in parentheses, e.g. "(6)".
# AC-4: The brands in the sidebar are exactly the distinct brand names in GET /api/brandsList, and the number shown next to each brand equals the number of brandsList entries with that brand.
# AC-5: Clicking a brand in the sidebar opens that brand's page headed "Brand - <brand> Products" (e.g. "Brand - Polo Products") that lists only that brand's products: exactly the products that GET /api/productsList gives that brand. Check at least Polo, H&M and Mast & Harbour.
# AC-6: The Contact Us form offers the fields shown in the mock-up (Name, Email, Subject, Message; the Attachment field is not part of this story); the mandatory field marked in the mock-up (Email) must be filled for the form to be sent, and an e-mail that is not a valid address stops the form from being sent. Fields marked optional (Name, Subject, Message) may be left empty.
# AC-7: Sending the form follows the mock-up: the customer is asked to confirm (browser confirmation "Press OK to proceed!"); after confirming, the message "Success! Your details have been submitted successfully." is shown and the form is replaced by a "Home" button that returns to the home page.
# AC-8: If the customer cancels the confirmation, no success message is shown and the form stays on the page with what they typed.
#
# ENDPOINT: GET /api/brandsList — HTTP 200, body responseCode 200 with a "brands" array of { id, brand } (story.md#L22, story.md#L31)
# ENDPOINT: PUT /api/brandsList
# ENDPOINT: POST /api/brandsList
# ENDPOINT: DELETE /api/brandsList
# ENDPOINT: GET /api/productsList
#
# OPEN-QUESTION: G4 — which e-mail values count as "not a valid address" (which malformed values must be refused). Only "not-an-email" (no "@"), invalid under any reading, is tested; other malformed values are not tested
# OPEN-QUESTION: G5 — what observably shows that the form was not sent: no browser confirmation, no success message, a validation message (its text is not stated), or several of these. Tested literally in SCN-008 and SCN-009 (@needs-clarification): after attempting to send (Submit, accepting any confirmation), no success message is shown and the form stays on the page
# OPEN-QUESTION: G6 — whether AC-6 requires the mock-up's labels and markers to appear literally ("Name"/"Subject"/"Message" followed by "(optional)", "Email" with a red "*", the legend) or only that the fields exist; the mock-up is marked "not to scale". Only the fields (by their mock-up placeholders) and the Submit button are asserted
# OPEN-QUESTION: found during hardening (not an acceptance criterion, not tested) — sending the Contact Us form makes no request to the server: after OK the success message and "Home" button are rendered in place and no form data leaves the browser (hardening/tier3/ae3-net.mjs, hardening/hardening-log.md). No AC states that the message must be delivered, but the story's goal is "anyone can reach us through the Contact Us form": must the form actually deliver the message, and how can that be observed?
#
# ASSUMPTION: A1 — "each followed by the number of its products in parentheses": each Brands-panel entry must carry a count "(n)"; the position of the count relative to the name in the page markup is not asserted (the mock-up does not cover the panel)
# ASSUMPTION: A2 — brand names are compared exactly as text (case-sensitive, surrounding whitespace trimmed); the brand page's heading uses the brand name as brandsList spells it
# ASSUMPTION: A3 — one root cause, one failure: the exact success message is the subject of SCN-011 (AC-7); SCN-010 (optional fields may be empty) uses the same message as its evidence that the form was sent
# ASSUMPTION: A4 — the AUT offers no way to delete a sent Contact Us message, so sent messages are not cleaned up; every typed value is unique (unique()) so leftovers are identifiable

@story:AE-3
Feature: Brands in the catalogue API and shop, and the Contact Us form
  As a shopper, a partner using the public API, or anyone who wants to reach the shop
  I want to browse and read the catalogue's brands and to send a Contact Us message
  So that I can find products by brand and get in touch

  # from story.md#L31, story.md#L21-L22 (AC-1, R1, R2)
  @SCN-001 @AC-1 @priority:P1 @type:contract @layer:api
  Scenario: The brands list has the agreed shape
    Given the public catalogue API is reachable
    When I request GET /api/brandsList
    Then the HTTP status is 200
    And the body responseCode is 200
    And the body has a "brands" array
    And every entry has an "id" and a "brand"

  # from story.md#L31, story.md#L21 (AC-1, R1)
  @SCN-002 @AC-1 @priority:P1 @type:integration @layer:api
  Scenario: Every brandsList entry names the brand of the product with that id
    Given I read the catalogue with GET /api/productsList
    When I request GET /api/brandsList
    Then for every entry, the product with that id in GET /api/productsList has exactly that brand
    And there is exactly one entry per catalogue product

  # from story.md#L32 (AC-2, E1)
  @SCN-003 @AC-2 @priority:P2 @type:negative @layer:api
  Scenario Outline: Unsupported methods on the brands list are refused in the body
    Given the public catalogue API is reachable
    When I send <method> /api/brandsList
    Then the HTTP status is 200
    And the body responseCode is 405 with message "This request method is not supported."
    Examples:
      | method |
      | PUT    |
      | POST   |
      | DELETE |

  # from story.md#L33, story.md#L23 (AC-3, R3)
  @SCN-004 @AC-3 @priority:P2 @type:functional @layer:ui
  Scenario: The Brands panel lists each brand once with its product count
    Given I am on the Products page
    When I read the "Brands" panel in the left-hand sidebar
    Then each brand entry shows the number of its products in parentheses, e.g. "(6)"
    And no brand is listed more than once

  # from story.md#L34, story.md#L21 (AC-4, R1)
  @SCN-005 @AC-4 @priority:P1 @type:integration @layer:e2e
  Scenario: The Brands panel matches the brands list of the API
    Given I read the brands with GET /api/brandsList
    And I am on the Products page
    When I read the "Brands" panel in the left-hand sidebar
    Then the brands in the panel are exactly the distinct brand names in brandsList
    And the number next to each brand equals the number of brandsList entries with that brand

  # from story.md#L35, story.md#L23 (AC-5, R3)
  @SCN-006 @AC-5 @priority:P1 @type:integration @layer:e2e
  Scenario Outline: A brand's page lists exactly that brand's products
    Given I read the catalogue with GET /api/productsList
    And I am on the Products page
    When I click "<brand>" in the "Brands" panel
    Then the page is headed "Brand - <brand> Products"
    And the page lists exactly the products that productsList gives "<brand>"
    Examples:
      | brand          |
      | Polo           |
      | H&M            |
      | Mast & Harbour |

  # from story.md#L36, contact-us-mockup.png (fields and placeholders)
  @SCN-007 @AC-6 @priority:P2 @type:functional @layer:ui
  Scenario: The Contact Us form offers the mock-up's fields
    Given I am on the Contact Us page
    When I look at the "Get In Touch" form
    Then it offers a Name field with placeholder "Name"
    And it offers an Email field with placeholder "Email"
    And it offers a Subject field with placeholder "Subject"
    And it offers a multi-line Message field with placeholder "Your Message Here"
    And it offers a "Submit" button

  # from story.md#L36, contact-us-mockup.png (Email marked mandatory; legend)
  @SCN-008 @AC-6 @priority:P1 @type:negative @layer:ui @needs-clarification
  Scenario: The form is not sent while the mandatory Email is empty
    Given I am on the Contact Us page
    And I filled Name, Subject and Message with unique values and left Email empty
    When I click "Submit" and accept any confirmation
    Then no success message is shown
    And the form is still on the page

  # from story.md#L36, contact-us-mockup.png (legend: "the e-mail is not a valid address")
  @SCN-009 @AC-6 @priority:P1 @type:negative @layer:ui @needs-clarification
  Scenario: The form is not sent with an e-mail that is not a valid address
    Given I am on the Contact Us page
    And I filled Name, Subject and Message with unique values and Email with "not-an-email"
    When I click "Submit" and accept any confirmation
    Then no success message is shown
    And the form is still on the page

  # from story.md#L36, contact-us-mockup.png (Name, Subject, Message marked "(optional)")
  @SCN-010 @AC-6 @priority:P2 @type:functional @layer:ui
  Scenario: The form can be sent with only a valid Email
    Given I am on the Contact Us page
    And I filled only Email with a unique valid address
    When I click "Submit" and confirm with OK
    Then the success message is shown

  # from story.md#L37, contact-us-mockup.png (submit flow note)
  @SCN-011 @AC-7 @priority:P1 @type:functional @layer:ui
  Scenario: Sending the form asks for confirmation, shows success and offers a Home button
    Given I am on the Contact Us page
    And I filled Name, Email, Subject and Message with unique valid values
    When I click "Submit"
    Then a browser confirmation "Press OK to proceed!" is shown
    When I confirm with OK
    Then the message "Success! Your details have been submitted successfully." is shown
    And the form is replaced by a "Home" button
    When I click "Home"
    Then I am on the home page

  # from story.md#L38, contact-us-mockup.png (submit flow note: "Cancel keeps the form as filled, no banner")
  @SCN-012 @AC-8 @priority:P2 @type:negative @layer:ui
  Scenario: Cancelling the confirmation keeps the form as filled
    Given I am on the Contact Us page
    And I filled Name, Email, Subject and Message with unique valid values
    When I click "Submit" and cancel the confirmation
    Then no success message is shown
    And the form is still on the page
    And every field still holds what I typed
