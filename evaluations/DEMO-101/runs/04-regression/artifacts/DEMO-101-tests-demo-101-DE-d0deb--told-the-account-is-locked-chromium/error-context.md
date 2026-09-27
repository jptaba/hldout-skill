# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-101\tests\demo-101.spec.ts >> DEMO-101 Shopper can sign in, build a cart and complete checkout >> SCN-002: Locked shopper cannot sign in and is told the account is locked
- Location: evaluations\DEMO-101\tests\demo-101.spec.ts:100:3

# Error details

```
Error: [REQ AC-2] locked-account error message

expect(locator).toHaveText(expected) failed

Locator:  getByRole('alert')
Expected: "Your account has been locked. Please contact customer support."
Received: "Epic sadface: Sorry, this user has been locked out."
Timeout:  5000ms

Call log:
  - [REQ AC-2] locked-account error message getByRole('alert') with timeout 5000ms
  - waiting for getByRole('alert')
    14 × locator resolved to <h3 role="alert" data-test="error">…</h3>
       - unexpected value "Epic sadface: Sorry, this user has been locked out."

```

```yaml
- alert:
  - button "Dismiss error"
  - text: "Epic sadface: Sorry, this user has been locked out."
```

# Test source

```ts
  5   | import { test, expect, type TestData } from '../../../heldout-support/fixtures';
  6   | import type { Page } from '@playwright/test';
  7   | 
  8   | // @req-constants-start — expected outcomes copied verbatim from DEMO-101 (never edit during hardening)
  9   | const REQ = {
  10  |   AC1_PAGE_TITLE: 'Products',
  11  |   AC1_CATALOGUE_SIZE: 6,
  12  |   AC2_LOCKED_MESSAGE: 'Your account has been locked. Please contact customer support.',
  13  |   AC3_BAD_PASSWORD_MESSAGE: 'Epic sadface: Username and password do not match any user in this service',
  14  |   AC4_SORT_OPTION: 'Price (low to high)',
  15  |   AC6_FIRST_NAME_MESSAGE: 'Error: First Name is required',
  16  |   AC7_TAX_RATE: 0.10, // pricing-rules.md §Tax — "Sales tax is 10% of the item total", rounded half-up to 2 dp
  17  |   AC8_CONFIRMATION: 'Thank you for your order!',
  18  | } as const;
  19  | // @req-constants-end
  20  | 
  21  | const money = (text: string) => Number(text.replace(/[^0-9.]/g, ''));
  22  | const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
  23  | 
  24  | // ---- page mechanics (hardened against the live AUT — see hardening/hardening-log.md) -------------
  25  | const ui = (page: Page) => ({
  26  |   username: page.getByRole('textbox', { name: 'Username', exact: true }),
  27  |   password: page.getByRole('textbox', { name: 'Password', exact: true }),
  28  |   signIn: page.getByRole('button', { name: 'Login', exact: true }),
  29  |   error: page.getByRole('alert'),
  30  |   pageTitle: page.getByTestId('title'),
  31  |   products: page.getByTestId('inventory-item'),
  32  |   productPrices: page.getByTestId('inventory-item-price'),
  33  |   sort: page.getByRole('combobox', { name: 'Sort products', exact: true }),
  34  |   cartBadge: page.getByTestId('shopping-cart-badge'),
  35  |   cartLink: page.getByTestId('shopping-cart-link'),
  36  |   checkout: page.getByRole('button', { name: 'Checkout' }),
  37  |   firstName: page.getByRole('textbox', { name: 'First Name', exact: true }),
  38  |   lastName: page.getByRole('textbox', { name: 'Last Name', exact: true }),
  39  |   postalCode: page.getByRole('textbox', { name: 'Zip/Postal Code', exact: true }),
  40  |   continue: page.getByRole('button', { name: 'Continue' }),
  41  |   itemTotal: page.getByTestId('subtotal-label'),
  42  |   tax: page.getByTestId('tax-label'),
  43  |   total: page.getByTestId('total-label'),
  44  |   finish: page.getByRole('button', { name: 'Finish' }),
  45  |   confirmation: page.getByRole('heading', { name: REQ.AC8_CONFIRMATION }),
  46  |   openMenu: page.getByRole('button', { name: 'Open Menu' }),
  47  |   logout: page.getByRole('button', { name: 'Logout', exact: true }),
  48  | });
  49  | 
  50  | const product = (page: Page, nth: number) => ui(page).products.nth(nth);
  51  | const addButton = (page: Page, nth: number) => product(page, nth).getByRole('button', { name: 'Add to cart' });
  52  | const removeButton = (page: Page, nth: number) => product(page, nth).getByRole('button', { name: 'Remove' });
  53  | const productPrice = (page: Page, nth: number) => product(page, nth).getByTestId('inventory-item-price');
  54  | 
  55  | async function signIn(page: Page, user: { username: string; password: string }, password = user.password) {
  56  |   const u = ui(page);
  57  |   await u.username.fill(user.username);
  58  |   await u.password.fill(password);
  59  |   await u.signIn.click();
  60  | }
  61  | 
  62  | async function signInAsStandard(page: Page, data: TestData) {
  63  |   await signIn(page, data.users.standard);
  64  |   await expect(ui(page).pageTitle).toBeVisible();
  65  | }
  66  | 
  67  | async function checkoutWith(page: Page, details: { firstName?: string; lastName?: string; postalCode?: string }) {
  68  |   const u = ui(page);
  69  |   await u.firstName.fill(details.firstName ?? '');
  70  |   await u.lastName.fill(details.lastName ?? '');
  71  |   await u.postalCode.fill(details.postalCode ?? '');
  72  |   await u.continue.click();
  73  | }
  74  | 
  75  | async function openCartAndCheckout(page: Page) {
  76  |   await ui(page).cartLink.click();
  77  |   await ui(page).checkout.click();
  78  | }
  79  | 
  80  | // ---- scenarios ---------------------------------------------------------------------------------
  81  | test.describe('DEMO-101 Shopper can sign in, build a cart and complete checkout', () => {
  82  |   test.beforeEach(async ({ page, journey }) => {
  83  |     await journey.step('Given I am on the sign-in page', async () => {
  84  |       await page.goto('/');
  85  |     });
  86  |   });
  87  | 
  88  |   test('SCN-001: Standard shopper signs in and sees the full catalogue', { tag: ['@AC-1', '@type:functional', '@P1'] }, async ({ page, journey, data }) => {
  89  |     await journey.step('When I sign in as the "standard" shopper', async () => {
  90  |       await signIn(page, data.users.standard);
  91  |     });
  92  |     await journey.step('Then I am on the "Products" page', async () => {
  93  |       await expect(ui(page).pageTitle, '[REQ AC-1] lands on the "Products" page').toHaveText(REQ.AC1_PAGE_TITLE);
  94  |     });
  95  |     await journey.step('And the catalogue lists 6 products', async () => {
  96  |       await expect(ui(page).products, '[REQ AC-1] catalogue lists 6 products').toHaveCount(REQ.AC1_CATALOGUE_SIZE);
  97  |     });
  98  |   });
  99  | 
  100 |   test('SCN-002: Locked shopper cannot sign in and is told the account is locked', { tag: ['@AC-2', '@type:negative', '@P1'] }, async ({ page, journey, data }) => {
  101 |     await journey.step('When I sign in as the "locked" shopper', async () => {
  102 |       await signIn(page, data.users.locked);
  103 |     });
  104 |     await journey.step('Then I see the error "Your account has been locked. Please contact customer support."', async () => {
> 105 |       await expect(ui(page).error, '[REQ AC-2] locked-account error message').toHaveText(REQ.AC2_LOCKED_MESSAGE);
      |                                                                               ^ Error: [REQ AC-2] locked-account error message
  106 |     });
  107 |     await journey.step('And I am still on the sign-in page', async () => {
  108 |       await expect(ui(page).signIn, '[REQ AC-2] stays on the sign-in page').toBeVisible();
  109 |     });
  110 |   });
  111 | 
  112 |   test('SCN-003: Wrong password shows the credentials error', { tag: ['@AC-3', '@type:negative', '@P2'] }, async ({ page, journey, data }) => {
  113 |     await journey.step('When I sign in as the "standard" shopper with the password "wrong_password"', async () => {
  114 |       await signIn(page, data.users.standard, data.wrongPassword);
  115 |     });
  116 |     await journey.step('Then I see the error "Epic sadface: Username and password do not match any user in this service"', async () => {
  117 |       await expect(ui(page).error, '[REQ AC-3] wrong-password error message').toHaveText(REQ.AC3_BAD_PASSWORD_MESSAGE);
  118 |     });
  119 |   });
  120 | 
  121 |   test('SCN-004: Wrong password clears the credential fields for security', { tag: ['@AC-3', '@type:negative', '@P2'] }, async ({ page, journey, data }) => {
  122 |     await journey.step('When I sign in as the "standard" shopper with the password "wrong_password"', async () => {
  123 |       await signIn(page, data.users.standard, data.wrongPassword);
  124 |       await expect(ui(page).error).toBeVisible(); // sync: the failed attempt has been processed
  125 |     });
  126 |     await journey.step('Then the Username field is empty', async () => {
  127 |       await expect.soft(ui(page).username, '[REQ AC-3] Username field cleared').toHaveValue('');
  128 |     });
  129 |     await journey.step('And the Password field is empty', async () => {
  130 |       await expect.soft(ui(page).password, '[REQ AC-3] Password field cleared').toHaveValue('');
  131 |     });
  132 |   });
  133 | 
  134 |   test('SCN-005: Sorting by price low to high orders products by ascending price', { tag: ['@AC-4', '@type:functional', '@P2'] }, async ({ page, journey, data }) => {
  135 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  136 |       await signInAsStandard(page, data);
  137 |     });
  138 |     await journey.step('When I sort the products by "Price (low to high)"', async () => {
  139 |       await ui(page).sort.selectOption({ label: REQ.AC4_SORT_OPTION });
  140 |     });
  141 |     await journey.step('Then the product prices are displayed in ascending order', async () => {
  142 |       await expect(ui(page).productPrices.first()).toBeVisible();
  143 |       const prices = (await ui(page).productPrices.allInnerTexts()).map(money);
  144 |       expect(prices.length, 'prices were read from the catalogue').toBeGreaterThan(1);
  145 |       expect(prices, '[REQ AC-4] prices ascending after "Price (low to high)"').toEqual([...prices].sort((a, b) => a - b));
  146 |     });
  147 |   });
  148 | 
  149 |   test('SCN-006: Adding products increases the cart badge by one each time', { tag: ['@AC-5', '@type:functional', '@P1'] }, async ({ page, journey, data }) => {
  150 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  151 |       await signInAsStandard(page, data);
  152 |     });
  153 |     await journey.step('And the cart badge is not shown', async () => {
  154 |       await expect(ui(page).cartBadge, '[REQ AC-5] no badge for an empty cart').toBeHidden();
  155 |     });
  156 |     await journey.step('When I add the 1st listed product to the cart', async () => {
  157 |       await addButton(page, 0).click();
  158 |     });
  159 |     await journey.step('Then the cart badge shows 1', async () => {
  160 |       await expect(ui(page).cartBadge, '[REQ AC-5] badge +1 after first add').toHaveText('1');
  161 |     });
  162 |     await journey.step('When I add the 2nd listed product to the cart', async () => {
  163 |       await addButton(page, 1).click();
  164 |     });
  165 |     await journey.step('Then the cart badge shows 2', async () => {
  166 |       await expect(ui(page).cartBadge, '[REQ AC-5] badge +1 after second add').toHaveText('2');
  167 |     });
  168 |   });
  169 | 
  170 |   test('SCN-007: Removing products decreases the cart badge and hides it when empty', { tag: ['@AC-5', '@type:functional', '@P2'] }, async ({ page, journey, data }) => {
  171 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  172 |       await signInAsStandard(page, data);
  173 |     });
  174 |     await journey.step('And I have added the 1st and 2nd listed products to the cart', async () => {
  175 |       await addButton(page, 0).click();
  176 |       await addButton(page, 1).click();
  177 |       await expect(ui(page).cartBadge).toHaveText('2');
  178 |     });
  179 |     await journey.step('When I remove the 2nd listed product', async () => {
  180 |       await removeButton(page, 1).click();
  181 |     });
  182 |     await journey.step('Then the cart badge shows 1', async () => {
  183 |       await expect(ui(page).cartBadge, '[REQ AC-5] badge -1 after remove').toHaveText('1');
  184 |     });
  185 |     await journey.step('When I remove the 1st listed product', async () => {
  186 |       await removeButton(page, 0).click();
  187 |     });
  188 |     await journey.step('Then the cart badge is not shown', async () => {
  189 |       await expect(ui(page).cartBadge, '[REQ AC-5] badge hidden when cart empty').toBeHidden();
  190 |     });
  191 |   });
  192 | 
  193 |   test('SCN-008: Checkout requires a First Name', { tag: ['@AC-6', '@type:negative', '@P2'] }, async ({ page, journey, data }) => {
  194 |     await journey.step('Given I am signed in as the "standard" shopper', async () => {
  195 |       await signInAsStandard(page, data);
  196 |     });
  197 |     await journey.step('And I have added the 1st listed product to the cart', async () => {
  198 |       await addButton(page, 0).click();
  199 |     });
  200 |     await journey.step('When I open the cart and proceed to checkout', async () => {
  201 |       await openCartAndCheckout(page);
  202 |     });
  203 |     await journey.step('And I continue with Last Name and Postal Code but no First Name', async () => {
  204 |       await checkoutWith(page, { lastName: data.checkout.lastName, postalCode: data.checkout.postalCode });
  205 |     });
```