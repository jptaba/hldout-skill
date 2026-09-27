# Evidence pack — AE-1

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: AE-1
  L3   | summary: "Product search and catalogue on the shop and the public product API"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/AE-1
  L10  | fetchedAt: 2026-09-27T00:53:27.413Z
  L11  | ---
  L12  | 
  L13  | # AE-1: Product search and catalogue on the shop and the public product API
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | **As a** shopper on Automation Exercise (and as a partner app using our public product API)  
● L18  | **I want** to browse the full catalogue and search it by a free-text term  
● L19  | **So that** I can quickly find the clothes I'm looking for.
  L20  | 
  L21  | ## Context
  L22  | 
● L23  | - UI: the **Products** page (`/products`) shows the whole catalogue under the heading "All Products" and has a search box ("Search Product") with a search button.
● L24  | - API (same host, form-encoded requests):
● L25  |   - `GET /api/productsList` — the whole catalogue.
● L26  |   - `POST /api/searchProduct` with the parameter `search_product` — the products matching the term.
● L27  | - Search terms are plain words or phrases, for example `jean`, `top`, `dress`, `Men Tshirt`.
● L28  | - Out of scope for this story: punctuation and special characters in search terms (tracked separately), sorting, pagination, cart.
  L29  | 
  L30  | ## Acceptance criteria
  L31  | 
● L32  | ```gherkin
● L33  | Feature: Product catalogue and search
  L34  | 
● L35  |   Scenario: AC-1 Catalogue is available through the API
● L36  |     When a client calls GET /api/productsList
● L37  |     Then the response lists the products of the catalogue in a "products" array
● L38  |     And every product has an "id", a "name", a "price", a "brand" and a "category"
● L39  |     And the category holds the audience ("usertype", e.g. Women, Men, Kids) and the category name
● L40  |     And every price is written as "Rs. " followed by the amount, e.g. "Rs. 500"
  L41  | 
● L42  |   Scenario: AC-2 Search by a term through the API
● L43  |     When a client posts search_product = "jean" to /api/searchProduct
● L44  |     Then exactly these products are returned: "Soft Stretch Jeans", "Regular Fit Straight Jeans", "Grunt Blue Slim Fit Jeans"
  L45  | 
● L46  |   Scenario: AC-3 Search ignores letter case
● L47  |     When a client searches for "TOP" and for "top"
● L48  |     Then both searches return the same products
  L49  | 
● L50  |   Scenario: AC-4 Search matches product names
● L51  |     When a client searches for "dress"
● L52  |     Then every product returned has the term in its product name
● L53  |     And every catalogue product whose name contains "dress" is returned
  L54  | 
● L55  |   Scenario: AC-5 Nothing matches
● L56  |     When a client searches for "zzqxv"
● L57  |     Then an empty product list is returned, not an error
  L58  | 
● L59  |   Scenario: AC-6 Search without a term (empty value)
● L60  |     When a client posts search_product with an empty value
● L61  |     Then the whole catalogue is returned, the same products as GET /api/productsList
  L62  | 
● L63  |   Scenario: AC-7 Search without a term (parameter missing)
● L64  |     When a client posts to /api/searchProduct without the search_product parameter
● L65  |     Then the request is rejected with response code 400
● L66  |     And the message is "Bad request, search_product parameter is missing in POST request."
  L67  | 
● L68  |   Scenario: AC-8 Search from the Products page
● L69  |     Given a shopper on the Products page
● L70  |     When they type "jean" in the search box and press the search button
● L71  |     Then the product grid is headed "Searched Products"
● L72  |     And the search box still shows "jean"
● L73  |     And exactly the three jeans products listed in AC-2 are shown
  L74  | 
● L75  |   Scenario: AC-9 Searching from the Products page without a term
● L76  |     Given a shopper on the Products page
● L77  |     When they leave the search box empty and press the search button
● L78  |     Then the grid is headed "All Products"
● L79  |     And every product of the catalogue (GET /api/productsList) is shown
  L80  | 
● L81  |   Scenario Outline: AC-10 The shop and the API agree on search results
● L82  |     When a shopper searches for "<term>" on the Products page
● L83  |     Then the products shown are exactly the products POST /api/searchProduct returns for "<term>"
  L84  | 
● L85  |     Examples:
● L86  |       | term       |
● L87  |       | top        |
● L88  |       | dress      |
● L89  |       | Men Tshirt |
  L90  | 
● L91  |   Scenario: AC-11 No results on the Products page
● L92  |     When a shopper searches for "zzqxv" on the Products page
● L93  |     Then the grid is headed "Searched Products" and no product is shown
● L94  | ```
  L95  | 
  L96  | ## Comments (clarifications from the issue)
  L97  | 
  L98  | **Priya Nair (Product Owner)** — 2026-09-26:
  L99  | 
● L100 | Clarification after refinement with the catalogue team — this replaces scenario AC-4 as written:
  L101 | 
● L102 | - Search matches the product **name or its category name** (the category under Women / Men / Kids, e.g. "Dress", "Tops", "Tops & Shirts", "Tshirts"). So searching "dress" must return every product whose name contains "dress" **plus** every product in a "Dress" category, even if the word is not in its name — e.g. "Sleeves Top and Short - Blue & Pink" (Kids > Dress) belongs in the "dress" results. Nothing else should come back.
● L103 | - The **brand** is not a search field: searching "Polo" only finds products with "Polo" in the name or category. Browsing by brand is AE-3.
● L104 | - Matching is a "contains" match, case-insensitive, as in AC-3.
  L105 | 
  L106 | 
  L107 | ## Attachments
  L108 | 
  L109 | _None_
  L110 | 
```
