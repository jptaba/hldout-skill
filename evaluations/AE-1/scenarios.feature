# Source: AE-1 — Product search and catalogue on the shop and the public product API
# Requirement contract: requirement-contract.json (ACs quoted from their sources)
# Requirement review: requirement-review.md
#
# Acceptance criteria (verbatim from the contract):
# AC-1: Catalogue is available through the API: GET /api/productsList lists the products of the catalogue in a "products" array; every product has an "id", a "name", a "price", a "brand" and a "category"; the category holds the audience ("usertype", e.g. Women, Men, Kids) and the category name; every price is written as "Rs. " followed by the amount, e.g. "Rs. 500".
# AC-2: Search by a term through the API: posting search_product = "jean" to /api/searchProduct returns exactly these products: "Soft Stretch Jeans", "Regular Fit Straight Jeans", "Grunt Blue Slim Fit Jeans".
# AC-3: Search ignores letter case: searching for "TOP" and for "top" returns the same products.
# AC-4: Search matches the product name or its category name (AC-4 as replaced by the Product Owner clarification of 2026-09-26): searching "dress" returns every product whose name contains "dress" plus every product in a "Dress" category, even if the word is not in its name, and nothing else; the brand is not a search field.
# AC-5: Nothing matches: searching for "zzqxv" returns an empty product list, not an error.
# AC-6: Search without a term (empty value): posting search_product with an empty value returns the whole catalogue, the same products as GET /api/productsList.
# AC-7: Search without a term (parameter missing): posting to /api/searchProduct without the search_product parameter is rejected with response code 400 and the message "Bad request, search_product parameter is missing in POST request."
# AC-8: Search from the Products page: a shopper on the Products page types "jean" in the search box and presses the search button; the product grid is headed "Searched Products", the search box still shows "jean", and exactly the three jeans products listed in AC-2 are shown.
# AC-9: Searching from the Products page without a term: a shopper on the Products page leaves the search box empty and presses the search button; the grid is headed "All Products" and every product of the catalogue (GET /api/productsList) is shown.
# AC-10: The shop and the API agree on search results: when a shopper searches for "<term>" on the Products page, the products shown are exactly the products POST /api/searchProduct returns for "<term>", for the terms top, dress and Men Tshirt.
# AC-11: No results on the Products page: when a shopper searches for "zzqxv" on the Products page, the grid is headed "Searched Products" and no product is shown.
#
# ENDPOINT: GET /api/productsList — lists the products of the catalogue in a "products" array (story.md#L37)
# ENDPOINT: POST /api/searchProduct
#
# ASSUMPTION: G2 — what "response code 400" refers to: the HTTP status of the response, or a response-code value carried in the response body: the HTTP status of the response is 400 (the usual meaning of "response code"). Alternative reading, not assumed: HTTP status is not constrained and a response-code value of 400 is carried in the body. Confirm with the Product Owner
# ASSUMPTION: G5 — what makes the no-match response "not an error": no status code or body is stated for a successful search: the response is a successful one carrying an empty product list: no error status and no error message (as in the AC-7 error case) is returned. No specific status code is asserted
# ASSUMPTION: Comparisons between the page and the API use the product names shown on the product cards (what a shopper sees), compared as sorted lists; API-to-API comparisons use the product "id".
# ASSUMPTION: "Rs. followed by the amount" means "Rs. " then a number (digits, optionally with decimals), nothing else.
# ASSUMPTION: The exact success status of a search is asserted nowhere (not stated); successful searches are checked by their product lists only (one root cause, one failure).

@story:AE-1
Feature: Product search and catalogue on the shop and the public product API
  As a shopper on Automation Exercise (and as a partner app using the public product API)
  I want to browse the full catalogue and search it by a free-text term
  So that I can quickly find the clothes I'm looking for

  # from story AC-1 (story.md#L35-L37)
  @SCN-001 @AC-1 @priority:P1 @type:functional @layer:api
  Scenario: A client lists the catalogue through the API
    Given the public product API (no authentication)
    When a client calls GET /api/productsList
    Then the response lists the products of the catalogue in a "products" array

  # from story AC-1 (story.md#L38-L39)
  @SCN-002 @AC-1 @priority:P1 @type:contract @layer:api
  Scenario: Every catalogue product carries id, name, price, brand and category with audience and category name
    Given the public product API (no authentication)
    When a client calls GET /api/productsList
    Then every product has an "id", a "name", a "price", a "brand" and a "category"
    And every category holds the audience "usertype" and the category name

  # from story AC-1 (story.md#L40)
  @SCN-003 @AC-1 @priority:P2 @type:contract @layer:api
  Scenario: Every catalogue price is written as "Rs. " followed by the amount
    Given the public product API (no authentication)
    When a client calls GET /api/productsList
    Then every price is written as "Rs. " followed by the amount, e.g. "Rs. 500"

  # from story AC-2 (story.md#L42-L44)
  @SCN-004 @AC-2 @priority:P1 @type:functional @layer:api
  Scenario: Searching "jean" through the API returns exactly the three jeans
    Given the public product API (no authentication)
    When a client posts search_product = "jean" to /api/searchProduct
    Then exactly these products are returned: "Soft Stretch Jeans", "Regular Fit Straight Jeans", "Grunt Blue Slim Fit Jeans"

  # from story AC-3 (story.md#L46-L48), PO comment (story.md#L104)
  @SCN-005 @AC-3 @priority:P1 @type:functional @layer:api
  Scenario Outline: Search ignores letter case
    Given the public product API (no authentication)
    When a client searches for "<upper>" and for "<lower>"
    Then both searches return the same products
    Examples:
      | upper | lower |
      | TOP   | top   |
      | Top   | top   |

  # from story PO comment replacing AC-4 (story.md#L100-L102, L104)
  @SCN-006 @AC-4 @priority:P1 @type:functional @layer:api
  Scenario: Searching "dress" returns every product with "dress" in its name or in a Dress category
    Given the catalogue from GET /api/productsList
    When a client searches for "dress"
    Then every catalogue product whose name contains "dress" is returned
    And every product in a "Dress" category is returned, including "Sleeves Top and Short - Blue & Pink" (Kids > Dress)

  # from story PO comment replacing AC-4 (story.md#L100-L102)
  @SCN-007 @AC-4 @priority:P1 @type:negative @layer:api
  Scenario: Searching "dress" returns nothing else
    Given the catalogue from GET /api/productsList
    When a client searches for "dress"
    Then every product returned has "dress" in its name or its category name

  # from story PO comment (story.md#L103)
  @SCN-008 @AC-4 @priority:P2 @type:negative @layer:api
  Scenario: The brand is not a search field
    Given the catalogue from GET /api/productsList
    When a client searches for "Polo"
    Then exactly the products with "Polo" in their name or category name are returned

  # from story AC-5 (story.md#L55-L57)
  @SCN-009 @AC-5 @priority:P1 @type:functional @layer:api
  Scenario: A search that matches nothing returns an empty product list
    Given the public product API (no authentication)
    When a client searches for "zzqxv"
    Then an empty product list is returned

  # from story AC-5 (story.md#L57); contract G5 (assumed)
  @SCN-010 @AC-5 @priority:P2 @type:negative @layer:api @assumes:G5
  Scenario: A search that matches nothing is not an error
    Given the public product API (no authentication)
    When a client searches for "zzqxv"
    Then the response is not an error: no error status and no error message

  # from story AC-6 (story.md#L59-L61)
  @SCN-011 @AC-6 @priority:P1 @type:boundary @layer:api
  Scenario: Searching with an empty value returns the whole catalogue
    Given the catalogue from GET /api/productsList
    When a client posts search_product with an empty value
    Then the whole catalogue is returned, the same products as GET /api/productsList

  # from story AC-7 (story.md#L63-L65); contract G2 (assumed)
  @SCN-012 @AC-7 @priority:P1 @type:negative @layer:api @assumes:G2
  Scenario: A search without the search_product parameter is rejected with response code 400
    Given the public product API (no authentication)
    When a client posts to /api/searchProduct without the search_product parameter
    Then the request is rejected with response code 400

  # from story AC-7 (story.md#L66)
  @SCN-013 @AC-7 @priority:P1 @type:negative @layer:api
  Scenario: A search without the search_product parameter explains what is missing
    Given the public product API (no authentication)
    When a client posts to /api/searchProduct without the search_product parameter
    Then the message is "Bad request, search_product parameter is missing in POST request."

  # from story AC-8 (story.md#L68-L73)
  @SCN-014 @AC-8 @priority:P1 @type:functional @layer:ui
  Scenario: A shopper searches "jean" on the Products page
    Given a shopper on the Products page
    When they type "jean" in the search box and press the search button
    Then the product grid is headed "Searched Products"
    And the search box still shows "jean"
    And exactly the three jeans products listed in AC-2 are shown

  # from story AC-9 (story.md#L75-L79)
  @SCN-015 @AC-9 @priority:P2 @type:integration @layer:e2e
  Scenario: A shopper searches without a term on the Products page and sees the whole catalogue
    Given a shopper on the Products page
    When they leave the search box empty and press the search button
    Then the grid is headed "All Products"
    And every product of the catalogue (GET /api/productsList) is shown

  # from story AC-10 (story.md#L81-L89)
  @SCN-016 @AC-10 @priority:P1 @type:integration @layer:e2e
  Scenario Outline: The shop and the API agree on search results
    Given a shopper on the Products page
    When a shopper searches for "<term>" on the Products page
    Then the products shown are exactly the products POST /api/searchProduct returns for "<term>"
    Examples:
      | term       |
      | top        |
      | dress      |
      | Men Tshirt |

  # from story AC-11 (story.md#L91-L93)
  @SCN-017 @AC-11 @priority:P2 @type:functional @layer:ui
  Scenario: A search on the Products page that matches nothing shows no product
    Given a shopper on the Products page
    When a shopper searches for "zzqxv" on the Products page
    Then the grid is headed "Searched Products"
    And no product is shown
