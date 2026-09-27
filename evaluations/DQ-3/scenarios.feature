# Source: DQ-3 — Links page - new-tab links and HTTP status diagnostic links
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Page layout: the Links page shows the heading "Links", a section captioned "Following links will open new tab", a section captioned "Following links will send an api call" containing exactly the links Created, No Content, Moved, Bad Request, Unauthorized, Forbidden, Not Found in this order, and no response message before any api-call link has been clicked
# AC-2: Static home link opens in a new tab: clicking the link labelled "Home" on the Links page opens the site home page (https://demoqa.com/) in a new browser tab and the original tab stays on the Links page
# AC-3: Dynamic home link: the second link in the new-tab section has a label that starts with "Home" followed by a random suffix, the suffix is different after the page is reloaded, and clicking that link opens the site home page in a new browser tab
# AC-4: Diagnostic endpoints answer with their status code: GET /created -> 201 Created, GET /no-content -> 204 No Content, GET /moved -> 301 Moved Permanently, GET /bad-request -> 400 Bad Request, GET /unauthorized -> 401 Unauthorized, GET /forbidden -> 403 Forbidden, GET /invalid-url -> 404 Not Found (the PO comment replaces /not-found with /invalid-url)
# AC-5: Diagnostic responses carry no body: GET to any of the diagnostic endpoints except /moved returns an empty response body (this applies to /invalid-url as well)
# AC-6: Moved endpoint tells the client where to go: GET /moved responds 301 with a Location header that points to the site home page
# AC-7: Clicking a diagnostic link reports the result on the page: clicking the "<link>" link shows the message "Link has responded with status <code> and status text <text>" below the links, for Created 201 Created, No Content 204 No Content, Moved 301 Moved Permanently, Bad Request 400 Bad Request, Unauthorized 401 Unauthorized, Forbidden 403 Forbidden, Not Found 404 Not Found
# AC-8: The page reports what the endpoint really answered: clicking any diagnostic link makes the browser send one GET request to that link's endpoint, the status code shown in the message equals the HTTP status of that request, and the browser stays on the Links page (no navigation, no new tab)
# AC-9: Only the latest result is shown: after clicking the "Forbidden" link and seeing its message, clicking the "Created" link leaves only one response message, reporting 201 Created
#
# ENDPOINT: GET /created — 201 Created, empty body
# ENDPOINT: GET /no-content — 204 No Content, empty body
# ENDPOINT: GET /moved — 301 Moved Permanently with a Location header pointing to the site home page
# ENDPOINT: GET /bad-request — 400 Bad Request, empty body (the intended diagnostic answer)
# ENDPOINT: GET /unauthorized — 401 Unauthorized, empty body (the intended diagnostic answer)
# ENDPOINT: GET /forbidden — 403 Forbidden, empty body (the intended diagnostic answer)
# ENDPOINT: GET /invalid-url — 404 Not Found, empty body (the intended diagnostic answer)
#
# OPEN-QUESTION: G2 — AC-4 "the response status is <code> <text>": must the HTTP reason phrase of the response equal <text> (a reason phrase is not transmitted at all over HTTP/2), or is <text> only the standard name of <code> so that the status code alone is checked?
# OPEN-QUESTION: G3 — AC-6 Location header "points to the site home page": does a relative reference to the site root satisfy it, or must the header hold the absolute home page URL?

# ASSUMPTION: "shown below the links" (AC-7) is a layout statement; the message is checked for presence and exact text, not pixel position.
# ASSUMPTION: G2 — the HTTP reason phrase of the endpoints is not asserted (not asserted); the status code is. The UI message text (AC-7) is asserted verbatim.
# ASSUMPTION: GET /moved is requested without following redirects, so the client sees the endpoint's own answer (AC-4, AC-6).
# OBSERVATION: GET /moved names its target only in a JSON body {"url":"demoqa.com"} (a bare host, no scheme), not in a Location header; browsers and HTTP clients will not follow it.
# ASSUMPTION: "the site home page" is https://demoqa.com/ (stated in AC-2); a new tab "opens the home page" when its URL is that page.

@story:DQ-3
Feature: Links page - new-tab links and HTTP status diagnostic links
  As a QA trainee practising on the Elements section of the site
  I want a Links page with new-tab links and HTTP status diagnostic links
  So that I can learn how link behaviour and HTTP status codes look from the browser and from the API

  # from story.md#L29-L36 (AC-1)
  @SCN-001 @AC-1 @priority:P2 @type:functional @layer:ui
  Scenario: The Links page shows its heading, both sections and the api-call links in order
    Given I am on the Links page
    Then the page heading reads "Links"
    And a section captioned "Following links will open new tab" is shown
    And a section captioned "Following links will send an api call" is shown
    And the api-call section contains exactly the links Created, No Content, Moved, Bad Request, Unauthorized, Forbidden, Not Found, in this order
    And no response message is shown before any api-call link has been clicked

  # from story.md#L38-L42 (AC-2)
  @SCN-002 @AC-2 @priority:P1 @type:functional @layer:ui
  Scenario: The static Home link opens the home page in a new tab
    Given I am on the Links page
    When I click the link labelled "Home"
    Then the site home page https://demoqa.com/ opens in a new browser tab
    And the original tab stays on the Links page

  # from story.md#L44-L49 (AC-3)
  @SCN-003 @AC-3 @priority:P2 @type:functional @layer:ui
  Scenario: The dynamic Home link has a random suffix and opens the home page in a new tab
    Given I am on the Links page
    Then the second link in the new-tab section has a label that starts with "Home" followed by a suffix
    And the suffix is different after the page is reloaded
    When I click that link
    Then the site home page https://demoqa.com/ opens in a new browser tab

  # from story.md#L51-L63 (AC-4), story.md#L110-L112 (PO correction: /invalid-url)
  @SCN-004 @AC-4 @priority:P1 @type:contract @layer:api
  Scenario Outline: Each diagnostic endpoint answers with its status code
    When a client sends GET <path> without following redirects
    Then the response status is <code>

    Examples:
      | link         | path          | code |
      | Created      | /created      | 201  |
      | No Content   | /no-content   | 204  |
      | Moved        | /moved        | 301  |
      | Bad Request  | /bad-request  | 400  |
      | Unauthorized | /unauthorized | 401  |
      | Forbidden    | /forbidden    | 403  |
      | Not Found    | /invalid-url  | 404  |

  # from story.md#L65-L67 (AC-5), story.md#L110-L112
  @SCN-005 @AC-5 @priority:P2 @type:contract @layer:api
  Scenario Outline: Diagnostic responses other than /moved carry no body
    When a client sends GET <path>
    Then the response body is empty

    Examples:
      | path          |
      | /created      |
      | /no-content   |
      | /bad-request  |
      | /unauthorized |
      | /forbidden    |
      | /invalid-url  |

  # from story.md#L69-L72 (AC-6)
  @SCN-006 @AC-6 @priority:P2 @type:contract @layer:api @needs-clarification
  Scenario: GET /moved answers 301 with a Location header pointing to the home page
    When a client sends GET /moved without following redirects
    Then the response status is 301
    And the response carries a Location header that points to the site home page https://demoqa.com/

  # from story.md#L74-L87 (AC-7)
  @SCN-007 @AC-7 @priority:P1 @type:functional @layer:ui
  Scenario Outline: Clicking a diagnostic link reports its result on the page
    Given I am on the Links page
    When I click the "<link>" link
    Then the message "Link has responded with status <code> and status text <text>" is shown

    Examples:
      | link         | code | text              |
      | Created      | 201  | Created           |
      | No Content   | 204  | No Content        |
      | Moved        | 301  | Moved Permanently |
      | Bad Request  | 400  | Bad Request       |
      | Unauthorized | 401  | Unauthorized      |
      | Forbidden    | 403  | Forbidden         |
      | Not Found    | 404  | Not Found         |

  # from story.md#L89-L94 (AC-8), story.md#L56-L63 and story.md#L110-L112 (R1 link -> endpoint)
  @SCN-008 @AC-8 @priority:P1 @type:integration @layer:e2e
  Scenario Outline: The page reports the status its own GET request really received
    Given I am on the Links page
    When I click the "<link>" link
    Then the browser sends exactly one GET request to <path>
    And the status code shown in the message equals the HTTP status of that request
    And the browser stays on the Links page with no new tab

    Examples:
      | link         | path          |
      | Created      | /created      |
      | No Content   | /no-content   |
      | Moved        | /moved        |
      | Bad Request  | /bad-request  |
      | Unauthorized | /unauthorized |
      | Forbidden    | /forbidden    |
      | Not Found    | /invalid-url  |

  # from story.md#L96-L99 (AC-9)
  @SCN-009 @AC-9 @priority:P2 @type:functional @layer:ui
  Scenario: Only the latest diagnostic result is shown
    Given I am on the Links page
    And I have clicked the "Forbidden" link and its message is shown
    When I click the "Created" link
    Then only one response message is shown, and it reports 201 Created
