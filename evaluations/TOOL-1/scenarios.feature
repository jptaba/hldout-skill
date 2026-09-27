# Source: TOOL-1 — Catalogue search, sorting and category filter
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
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
# ENDPOINT: GET /products — 200 { current_page, data, per_page, total, last_page }
# ENDPOINT: GET /products/search — 200 { current_page, data, per_page, total, last_page }
# ENDPOINT: GET /categories/tree — 200 [categories with sub_categories]
#
# ASSUMPTION: G5 — "an empty search (no term)" is sent as GET /products/search?q= (q present, empty).
# ASSUMPTION: G6 — "returns all products" means the empty search's total equals the total of the unfiltered GET /products in the same run.
# ASSUMPTION: The category id for "Hammer" is looked up from GET /categories/tree at run time (pre-step, contract G3); "only hammers" on the web shop is checked against the API's Hammer products.

@story:TOOL-1
Feature: Catalogue search, sorting and category filter
  As a shopper I want to search, sort and filter the tool catalogue; the web shop and the catalogue API behave the same way.

  # from story.md#L23
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:ui
  Scenario: Searching the web shop shows only matching products and a caption
    Given I am on the web shop catalogue
    When I search for "pliers"
    Then every product shown has "pliers" in its name
    And the caption reads "Searched for: pliers"

  # from story.md#L24
  @SCN-002 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario: The search API returns only matching products
    When I GET /products/search?q=pliers
    Then the response status is 200
    And every product in data has "pliers" in its name

  # from story.md#L24
  @SCN-003 @AC-2 @priority:P2 @type:functional @layer:api
  Scenario: The search API ignores letter case
    When I GET /products/search with q=PLIERS and with q=pliers
    Then both return the same products

  # from story.md#L25
  @SCN-004 @AC-3 @priority:P2 @type:negative @layer:e2e
  Scenario: A search without matches says so on the web shop and in the API
    Given I am on the web shop catalogue
    When I search for a term that matches nothing
    Then the web shop shows "There are no products found."
    And GET /products/search for that term returns 200 with an empty data list and total 0

  # from story.md#L26
  @SCN-005 @AC-4 @priority:P1 @type:functional @layer:e2e
  Scenario: Sorting by price, low to high
    Given I am on the web shop catalogue
    When I choose "Price (Low - High)"
    Then the prices shown are in ascending order
    And GET /products?sort=price,asc returns prices in ascending order

  # from story.md#L27
  @SCN-006 @AC-5 @priority:P1 @type:functional @layer:e2e
  Scenario: Filtering by the category "Hammer"
    Given I know the id of the category "Hammer"
    And I am on the web shop catalogue
    When I tick the category "Hammer"
    Then every product shown is a Hammer product
    And GET /products?by_category=<Hammer id> returns only products in the category Hammer

  # from story.md#L28
  @SCN-007 @AC-6 @priority:P2 @type:boundary @layer:e2e
  Scenario: Pages hold 12 products
    Given I am on the web shop catalogue
    Then the first page shows 12 products
    And GET /products reports per_page 12

  # from story.md#L29
  @SCN-008 @AC-7 @priority:P2 @type:functional @layer:api
  Scenario: An empty search returns all products
    When I GET /products/search with an empty q
    Then its total equals the total of GET /products
