# Source: TOOL-1 — Catalogue search, sorting and category filter
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
# Attachments used: none (the story has none)
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Searching the web shop for a term shows only products whose name contains the term, and a caption "Searched for: <term>".
# AC-2: GET /products/search?q=<term> returns 200 with only products whose name contains the term, regardless of letter case (searching "PLIERS" finds the same products as "pliers").
# AC-3: A search without matches shows "There are no products found." on the web shop, and the API returns 200 with an empty data list and total 0.
# AC-4: Choosing "Price (Low - High)" on the web shop lists the products by ascending price; GET /products?sort=price,asc returns the products in ascending price order.
# AC-5: Filtering the web shop by the category "Hammer" shows only hammers; GET /products?by_category=<id of Hammer> returns only products in that category.
# AC-6: Results are paginated with 12 products per page (per_page 12) on the web shop and in the API.
# AC-7: An empty search (no term) returns all products, so the mobile app can reuse the search endpoint for its "All tools" screen.
#
# ENDPOINT: GET /products — { current_page, data: [products], per_page, total, last_page }
# ENDPOINT: GET /products/search — 200 { current_page, data: [products], per_page, total, last_page }
# ENDPOINT: GET /categories/tree
#
# ASSUMPTION: The catalogue is reference data (products and categories are read-only for a shopper): the tests create nothing and read the existing catalogue. The story's own example term "pliers" is taken to match at least one product (checked as a precondition, not a requirement).
# ASSUMPTION: "name contains the term" on the web shop is compared ignoring letter case, like the API (AC-2), because R1 says the web shop and the API must behave the same way.
# ASSUMPTION: "only products whose name contains the term" and "only products in that category" are checked on every page of the API answer (all pages up to last_page); on the web shop, on the first page of results.
# ASSUMPTION: "ascending price order" is checked within page 1 and across the page 1 / page 2 boundary (non-decreasing prices; equal prices allowed).
# ASSUMPTION: "shows only hammers" on the web shop is judged by each shown product's category, read from the unfiltered GET /products listing (every page), so the web shop check does not rely on the by_category filter under test.
# ASSUMPTION: AC-6 "12 products per page" is checked on a listing with more than 12 results (the unfiltered catalogue): page 1 holds exactly 12 products and a further page exists.
# OPEN-QUESTION: G4 — AC-7 empty search: does "no term" mean q omitted, q empty, or both; what status is expected (not stated); and is "all products" judged as total equal to the unfiltered GET /products total? Tested literally below (@needs-clarification): both readings, "all products" as the same total as unfiltered GET /products; no status is asserted.

@story:TOOL-1
Feature: Catalogue search, sorting and category filter
  As a shopper
  I want to search, sort and filter the tool catalogue
  So that I find the right tool quickly

  # from story.md#L24 (AC-1)
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:ui
  Scenario: A shopper searches the web shop for "pliers" and sees only matching products with the caption
    Given I am on the web shop catalogue
    When I search for "pliers"
    Then the caption "Searched for: pliers" is shown
    And every product shown has a name that contains "pliers"

  # from story.md#L25 (AC-2)
  @SCN-002 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario: The search API returns only products whose name contains the term
    When I call GET /products/search?q=pliers
    Then the response status is 200
    And every product in data, on every page, has a name that contains "pliers" ignoring letter case

  # from story.md#L25 (AC-2, "searching "PLIERS" finds the same products as "pliers"")
  @SCN-003 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario: The search API ignores letter case
    When I call GET /products/search?q=PLIERS and GET /products/search?q=pliers
    Then both responses have status 200
    And both find the same products

  # from story.md#L26 (AC-3, web shop)
  @SCN-004 @AC-3 @priority:P1 @type:negative @layer:ui
  Scenario: A web shop search without matches says there are no products
    Given I am on the web shop catalogue
    When I search for a term no product name contains
    Then "There are no products found." is shown
    And no product is shown

  # from story.md#L26 (AC-3, API)
  @SCN-005 @AC-3 @priority:P1 @type:negative @layer:api
  Scenario: The search API answers a search without matches with an empty list
    When I call GET /products/search with a term no product name contains
    Then the response status is 200
    And data is an empty list
    And total is 0

  # from story.md#L27 (AC-4, web shop)
  @SCN-006 @AC-4 @priority:P1 @type:functional @layer:ui
  Scenario: Sorting the web shop by "Price (Low - High)" lists products by ascending price
    Given I am on the web shop catalogue
    When I choose the sort "Price (Low - High)"
    Then the products shown are listed by ascending price

  # from story.md#L27 (AC-4, API)
  @SCN-007 @AC-4 @priority:P1 @type:functional @layer:api
  Scenario: GET /products?sort=price,asc returns products in ascending price order
    When I call GET /products?sort=price,asc for pages 1 and 2
    Then the products are in ascending price order within page 1 and across the page boundary

  # from story.md#L28 (AC-5, web shop), story.md#L34 (R3)
  @SCN-008 @AC-5 @priority:P1 @type:functional @layer:ui
  Scenario: Filtering the web shop by the category "Hammer" shows only hammers
    Given I know the category of every product from the unfiltered catalogue
    And I am on the web shop catalogue
    When I filter by the category "Hammer"
    Then every product shown is in the category "Hammer"

  # from story.md#L28 (AC-5, API), story.md#L34 (R3)
  @SCN-009 @AC-5 @priority:P1 @type:functional @layer:api
  Scenario: GET /products?by_category=<id of Hammer> returns only hammers
    Given I read the id of the category "Hammer" from GET /categories/tree
    When I call GET /products?by_category=<id of Hammer>
    Then every product in data, on every page, is in the category "Hammer"

  # from story.md#L29 (AC-6, web shop)
  @SCN-010 @AC-6 @priority:P2 @type:functional @layer:ui
  Scenario: The web shop shows 12 products per page
    Given I am on the web shop catalogue
    Then page 1 shows 12 products
    And a further page of results can be opened

  # from story.md#L29 (AC-6, API), story.md#L20 (R2)
  @SCN-011 @AC-6 @priority:P2 @type:contract @layer:api
  Scenario: The catalogue API pages its answers with 12 products per page
    When I call GET /products and GET /products/search?q=pliers
    Then each answer has current_page, data, per_page, total and last_page
    And each answer has per_page 12
    And GET /products page 1 holds 12 products

  # from story.md#L30 (AC-7) — literal reading of the open question G4
  @SCN-012 @AC-7 @priority:P2 @type:functional @layer:api @needs-clarification
  Scenario Outline: An empty search returns all products
    Given I read the total of the unfiltered GET /products
    When I call GET /products/search with <term>
    Then its total equals the total of the unfiltered GET /products
    Examples:
      | term           |
      | q omitted      |
      | q empty ("")   |

  # from story.md#L18 (R1), story.md#L24-L25 (AC-1, AC-2)
  @SCN-013 @AC-1 @AC-2 @priority:P2 @type:integration @layer:e2e
  Scenario: The web shop and the search API find the same products
    Given I call GET /products/search?q=pliers
    And I am on the web shop catalogue
    When I search the web shop for "pliers"
    Then the web shop shows the same products as the first page of the API answer
