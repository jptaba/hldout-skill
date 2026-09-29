# AUT inspection (tier 3 — bundled inspector)

- AUT: OWASP Juice Shop (profile `owasp-juice-shop`) — http://localhost:3000/
- URL: http://localhost:3000/#/search
- Title: OWASP Juice Shop
- Captured: 2026-09-29T12:43:35.567Z
- testIdAttribute: `data-testid`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | fill | `getByRole('textbox', { name: 'Text field for the login email', exact: true })` | ✔ |
| 2 | fill | `getByRole('textbox', { name: 'Text field for the login password', exact: true })` | ✔ |
| 3 | click | `getByRole('button', { name: 'Login', exact: true })` | ✔ |
| 4 | wait | `url:/search` | ✔ |
| 5 | click | `getByText('Apple Juice (1000ml)').first()` | ✔ |
| 6 | wait | `getByRole('dialog')` | ✔ |

## API calls the page made (answers as types only)

| method | path | status | answer shape |
| --- | --- | --- | --- |
| GET ×2 | `/rest/admin/application-version` | 200 | `{"version":"string"}` |
| GET ×7 | `/rest/admin/application-configuration` | 200 | `{"config":{"server":{"port":"number","basePath":"string","baseUrl":"string"},"application":{"domain":"string","name":"string","logo":"string","favicon":"string","theme":"string","showVersionNumber":"boolean","showGitHubLinks":"boolean","localBackupEnabled":"boolean","numberOfRandomFakeUsers":"number` |
| GET | `/rest/languages` | 200 | `[{"key":"string","lang":"string","icons":["string"],"shortKey":"string","percentage":"number","gauge":"string"}]` |
| GET ×2 | `/api/Challenges/?…` | 200 | `{"status":"string","data":[{"id":"number","key":"string","name":"string","category":"string","tags":"string","description":"string","difficulty":"number","mitigationUrl":"null","solved":"boolean","disabledEnv":"null","tutorialOrder":"number","codingChallengeStatus":"number","hasCodingChallenge":"boo` |
| GET | `/rest/user/whoami?…` | 200 | `{"user":{}}` |
| GET | `/rest/user/whoami` | 200 | `{"user":{}}` |
| POST | `/rest/user/login` | 200 | `{"authentication":{"token":"string","bid":"number","umail":"string"}}` |
| GET ×2 | `/rest/user/whoami?…` | 200 | `{"user":{"email":"string"}}` |
| GET | `/rest/user/whoami` | 200 | `{"user":{"id":"number","email":"string","lastLoginIp":"string","profileImage":"string"}}` |
| GET | `/rest/basket/7` | 200 | `{"status":"string","data":{"id":"number","coupon":"null","UserId":"number","createdAt":"string","updatedAt":"string","Products":[]}}` |
| GET | `/rest/products/search?…` | 200 | `{"status":"string","data":[{"id":"number","name":"string","description":"string","price":"number","deluxePrice":"number","image":"string","createdAt":"string","updatedAt":"string","deletedAt":"null"}]}` |
| GET | `/api/Quantitys/` | 200 | `{"status":"string","data":[{"ProductId":"number","id":"number","quantity":"number","limitPerUser":"number","createdAt":"string","updatedAt":"string"}]}` |
| GET ×3 | `/rest/products/1/reviews` | 200 | `{"status":"string","data":[{"message":"string","author":"string","product":"number","likesCount":"number","likedBy":[],"_id":"string"}]}` |

## Accessibility snapshot

```yaml
- button "Open Sidenav"
- button "Back to homepage":
  - img "OWASP Juice Shop"
  - text: OWASP Juice Shop
- button "Open search"
- textbox
- button "Close search"
- button "Show/hide account menu": Account
- button "Show the shopping cart": Your Basket 0
- button "Language selection menu": EN
- main:
  - text: All Products
  - article:
    - button "Click for more information about the product":
      - img "Apple Juice (1000ml)"
      - text: Apple Juice (1000ml)
    - text: 1.99¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Apple Pomace"
      - text: Apple Pomace
    - text: 0.89¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Banana Juice (1000ml)"
      - text: Banana Juice (1000ml)
    - text: 1.99¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Basil Smoothie"
      - text: Basil Smoothie
    - text: 2.99¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Berry Juice (1000ml)"
      - text: Berry Juice (1000ml)
    - text: 3.49¤
    - button "Add to Basket"
  - article:
    - complementary: Only 1 left
    - button "Click for more information about the product":
      - img "Best Juice Shop Salesman Artwork"
      - text: Best Juice Shop Salesman Artwork
    - text: 5000¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Bragă (500ml)"
      - text: Bragă (500ml)
    - text: 2.49¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Carrot Juice (1000ml)"
      - text: Carrot Juice (1000ml)
    - text: 2.99¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Dragonfruit Juice (500ml)"
      - text: Dragonfruit Juice (500ml)
    - text: 3.99¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Eggfruit Juice (500ml)"
      - text: Eggfruit Juice (500ml)
    - text: 8.99¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Elderflower Cordial (500ml)"
      - text: Elderflower Cordial (500ml)
    - text: 3.29¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Fruit Press"
      - text: Fruit Press
    - text: 89.99¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Grape Juice (1000ml)"
      - text: Grape Juice (1000ml)
    - text: 2.99¤
    - button "Add to Basket"
  - article:
    - button "Click for more information about the product":
      - img "Green Smoothie"
      - text: Green Smoothie
    - text: 1.99¤
    - button "Add to Basket"
  - article:
    - complementary: Only 1 left
    - button "Click for more information about the product":
      - img "Juice Shop \"Permafrost\" 2020 Edition"
      - text: Juice Shop "Permafrost" 2020 Edition
    - text: 9999.99¤
    - button "Add to Basket"
  - group:
    - combobox "Items per page:": "15"
    - status: 1 – 15 of 46
    - button "Previous page" [disabled]
    - button "Next page"
- text: Language has been changed to English
- button "Force page reload"
- dialog:
  - img "Apple Juice (1000ml)"
  - heading "Apple Juice (1000ml)" [level=1]
  - text: The all-time classic.
  - paragraph: 1.99¤
  - separator
  - button
  - button "Reviews (3)"
  - separator
  - heading "Write a review" [level=4]
  - text: Review
  - textbox "Text field to review a product":
    - /placeholder: What did you like or dislike?
  - emphasis: Max. 160 characters
  - text: 0/160
  - button "Close Dialog": Close
  - button "Send the review" [disabled]: Submit
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| button | Open Sidenav | - | - | `getByRole('button', { name: 'Open Sidenav', exact: true })` |
| img | menu | - | - | `(no stable locator)` |
| button | Back to homepage | - | - | `getByRole('button', { name: 'Back to homepage', exact: true })` |
| button | Open search | - | - | `getByRole('button', { name: 'Open search', exact: true })` |
| img | search | - | - | `(no stable locator)` |
| textbox | - | - | text | `(no stable locator)` |
| button | Close search | - | - | `getByRole('button', { name: 'Close search', exact: true })` |
| img | close | - | - | `(no stable locator)` |
| button | Show/hide account menu | - | - | `getByRole('button', { name: 'Show/hide account menu', exact: true })` |
| img | account_circle | - | - | `(no stable locator)` |
| button | Show the shopping cart | - | - | `getByRole('button', { name: 'Show the shopping cart', exact: true })` |
| img | shopping_cart | - | - | `(no stable locator)` |
| button | Language selection menu | - | - | `getByRole('button', { name: 'Language selection menu', exact: true })` |
| img | language | - | - | `(no stable locator)` |
| button | Click for more information about the product | - | - | `getByRole('button', { name: 'Click for more information about the product' }) ⚠ matches 15: add .nth() or scope it` |
| button | Add to Basket | - | - | `getByRole('button', { name: 'Add to Basket' }) ⚠ matches 15: add .nth() or scope it` |
| img | add_shopping_cart | - | - | `(no stable locator)` |
| button | Click for more information about the product | - | - | `(no stable locator)` |
| button | Add to Basket | - | - | `(no stable locator)` |
| group | Items per page: 15 1 – 15 of 46 | - | - | `(no stable locator)` |
| combobox | Items per page: | - | - | `getByLabel('Items per page:', { exact: true })` |
| status | 1 – 15 of 46 | - | - | `(no stable locator)` |
| button | Previous page | - | button | `(no stable locator)` |
| button | Next page | - | button | `(no stable locator)` |
| button | Force page reload | - | - | `getByRole('button', { name: 'Force page reload', exact: true })` |
| dialog | Apple Juice (1000ml) The all-time classic. 1.99¤ Reviews (3) admin@juice-sh.op O | - | - | `locator('#mat-mdc-dialog-1')` |
| heading | Apple Juice (1000ml) | - | - | `getByRole('heading', { name: 'Apple Juice (1000ml)', exact: true })` |
| separator | - | - | - | `(no stable locator)` |
| button | Reviews (3) | - | - | `getByRole('button', { name: 'Reviews (3)', exact: true })` |
| textbox | Text field to review a product | - | - | `getByRole('textbox', { name: 'Text field to review a product', exact: true })` |
| img | - | - | - | `(no stable locator)` |
| button | Close Dialog | - | button | `getByRole('button', { name: 'Close Dialog', exact: true })` |
| button | Send the review | - | submit | `getByRole('button', { name: 'Send the review', exact: true })` |
| img | send | - | - | `(no stable locator)` |

## Text with a stable id (read-only values: details, totals, messages)

| locator | text |
| --- | --- |
| `locator('#homeButton')` | OWASP Juice Shop |
| `locator('#mat-paginator-page-size-label-0')` | Items per page: |
| `locator('#mat-select-value-0')` | 15 |
| `locator('#mat-mdc-hint-5')` | Max. 160 characters |
| `locator('#mat-mdc-hint-6')` | 0/160 |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('dialog').getByRole('textbox')` | 1 ✔ | true |  |
| `getByRole('dialog').getByRole('button', { name: 'Send the review' })` | 1 ✔ | true | send Submit |
| `getByRole('dialog').getByRole('button', { name: /Reviews/ })` | 1 ✔ | true | Reviews (3) |
| `getByRole('dialog').locator('button[type="submit"]')` | 1 ✔ | true | send Submit |
| `getByRole('dialog').getByText('0/160', { exact: true })` | 1 ✔ | true | 0/160 |
