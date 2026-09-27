# AUT inspection (tier 3 — bundled inspector)

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — https://automationexercise.com
- URL: https://automationexercise.com/brand_products/Mast%20&%20Harbour
- Title: Automation Exercise - Mast & Harbour Products
- Captured: 2026-09-27T12:06:24.313Z
- testIdAttribute: `data-qa`

## Setup steps

| # | action | target | result |
| --- | --- | --- | --- |
| 1 | click | `locator('.brands_products').getByRole('link').filter({ hasText: /^\s*(\(\d+\)\s*)?Mast & Harbour\s*(\(\d+\)\s*)?$/ })` | ✔ |

## Accessibility snapshot

```yaml
- banner:
  - link "Website for automation practice":
    - /url: /
    - img "Website for automation practice"
  - list:
    - listitem:
      - link " Home":
        - /url: /
    - listitem:
      - link " Products":
        - /url: /products
    - listitem:
      - link " Cart":
        - /url: /view_cart
    - listitem:
      - link " Signup / Login":
        - /url: /login
    - listitem:
      - link " Test Cases":
        - /url: /test_cases
    - listitem:
      - link " API Testing":
        - /url: /api_list
    - listitem:
      - link " Video Tutorials":
        - /url: https://www.youtube.com/c/AutomationExercise
    - listitem:
      - link " Contact us":
        - /url: /contact_us
- list:
  - listitem:
    - link "Products":
      - /url: /products
  - listitem: Mast & Harbour
- heading "Category" [level=2]
- heading " Women" [level=4]:
  - link " Women":
    - /url: "#Women"
- heading " Men" [level=4]:
  - link " Men":
    - /url: "#Men"
- heading " Kids" [level=4]:
  - link " Kids":
    - /url: "#Kids"
- heading "Brands" [level=2]
- list:
  - listitem:
    - link "(6) Polo":
      - /url: /brand_products/Polo
  - listitem:
    - link "(5) H&M":
      - /url: /brand_products/H&M
  - listitem:
    - link "(5) Madame":
      - /url: /brand_products/Madame
  - listitem:
    - link "(3) Mast & Harbour":
      - /url: /brand_products/Mast & Harbour
  - listitem:
    - link "(4) Babyhug":
      - /url: /brand_products/Babyhug
  - listitem:
    - link "(3) Allen Solly Junior":
      - /url: /brand_products/Allen Solly Junior
  - listitem:
    - link "(3) Kookie Kids":
      - /url: /brand_products/Kookie Kids
  - listitem:
    - link "(5) Biba":
      - /url: /brand_products/Biba
- heading "Brand - Mast & Harbour Products" [level=2]
- img "ecommerce website products"
- heading "Rs. 600" [level=2]
- paragraph: Winter Top
- link " Add to cart":
  - /url: javascript:void();
- heading "Rs. 600" [level=2]
- paragraph: Winter Top
- link " Add to cart":
  - /url: javascript:void();
- list:
  - listitem:
    - link " View Product":
      - /url: /product_details/5
- img "ecommerce website products"
- heading "Rs. 1400" [level=2]
- paragraph: Lace Top For Women
- link " Add to cart":
  - /url: javascript:void();
- heading "Rs. 1400" [level=2]
- paragraph: Lace Top For Women
- link " Add to cart":
  - /url: javascript:void();
- list:
  - listitem:
    - link " View Product":
      - /url: /product_details/42
- img "ecommerce website products"
- heading "Rs. 1389" [level=2]
- paragraph: GRAPHIC DESIGN MEN T SHIRT - BLUE
- link " Add to cart":
  - /url: javascript:void();
- heading "Rs. 1389" [level=2]
- paragraph: GRAPHIC DESIGN MEN T SHIRT - BLUE
- link " Add to cart":
  - /url: javascript:void();
- list:
  - listitem:
    - link " View Product":
      - /url: /product_details/43
- contentinfo:
  - heading "Subscription" [level=2]
  - textbox "Your email address"
  - button ""
  - paragraph: Get the most recent updates from our site and be updated your self...
  - paragraph: Copyright © 2021 All rights reserved
```

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | - | - | - | `(no stable locator)` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true }) ⚠ matches 0` |
| link |  Products | - | - | `getByRole('link', { name: ' Products', exact: true })` |
| link | Cart | - | - | `getByRole('link', { name: 'Cart', exact: true }) ⚠ matches 0` |
| link | Signup / Login | - | - | `getByRole('link', { name: 'Signup / Login', exact: true }) ⚠ matches 0` |
| link | Test Cases | - | - | `getByRole('link', { name: 'Test Cases', exact: true }) ⚠ matches 0` |
| link | API Testing | - | - | `getByRole('link', { name: 'API Testing', exact: true }) ⚠ matches 0` |
| link | Video Tutorials | - | - | `getByRole('link', { name: 'Video Tutorials', exact: true }) ⚠ matches 0` |
| link | Contact us | - | - | `getByRole('link', { name: 'Contact us', exact: true }) ⚠ matches 0` |
| link | Products | - | - | `getByRole('link', { name: 'Products', exact: true })` |
| heading | Category | - | - | `getByRole('heading', { name: 'Category', exact: true })` |
| link | Women | - | - | `getByRole('link', { name: 'Women', exact: true }) ⚠ matches 0` |
| link | Men | - | - | `getByRole('link', { name: 'Men', exact: true }) ⚠ matches 0` |
| link | Kids | - | - | `getByRole('link', { name: 'Kids', exact: true }) ⚠ matches 0` |
| heading | Brands | - | - | `getByRole('heading', { name: 'Brands', exact: true })` |
| link | (6)Polo | - | - | `getByRole('link', { name: '(6)Polo', exact: true }) ⚠ matches 0` |
| link | (5)H&M | - | - | `getByRole('link', { name: '(5)H&M', exact: true }) ⚠ matches 0` |
| link | (5)Madame | - | - | `getByRole('link', { name: '(5)Madame', exact: true }) ⚠ matches 0` |
| link | (3)Mast & Harbour | - | - | `getByRole('link', { name: '(3)Mast & Harbour', exact: true }) ⚠ matches 0` |
| link | (4)Babyhug | - | - | `getByRole('link', { name: '(4)Babyhug', exact: true }) ⚠ matches 0` |
| link | (3)Allen Solly Junior | - | - | `getByRole('link', { name: '(3)Allen Solly Junior', exact: true }) ⚠ matches 0` |
| link | (3)Kookie Kids | - | - | `getByRole('link', { name: '(3)Kookie Kids', exact: true }) ⚠ matches 0` |
| link | (5)Biba | - | - | `getByRole('link', { name: '(5)Biba', exact: true }) ⚠ matches 0` |
| heading | Brand - Mast & Harbour Products | - | - | `getByRole('heading', { name: 'Brand - Mast & Harbour Products', exact: true })` |
| heading | Rs. 600 | - | - | `getByRole('heading', { name: 'Rs. 600', exact: true }) ⚠ matches 2` |
| link | Add to cart | - | - | `getByRole('link', { name: 'Add to cart', exact: true }) ⚠ matches 0` |
| link | View Product | - | - | `getByRole('link', { name: 'View Product', exact: true }) ⚠ matches 0` |
| heading | Rs. 1400 | - | - | `getByRole('heading', { name: 'Rs. 1400', exact: true }) ⚠ matches 2` |
| heading | Rs. 1389 | - | - | `getByRole('heading', { name: 'Rs. 1389', exact: true }) ⚠ matches 2` |
| heading | Subscription | - | - | `getByRole('heading', { name: 'Subscription', exact: true })` |
| textbox | Your email address | - | email | `getByRole('textbox', { name: 'Your email address', exact: true })` |
| button | - | - | submit | `locator('#subscribe')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `getByRole('heading', { name: /^\s*Brand\b/i })` | 1 ✔ | true | BRAND - MAST & HARBOUR PRODUCTS |
| `getByRole('link', { name: 'View Product' })` | 3 ⚠ not unique | true | View Product |
