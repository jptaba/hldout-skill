/**
 * Held-out acceptance tests for DEMO-101 — "Shopper can sign in, build a cart and complete checkout".
 * Generated from evaluations/DEMO-101/scenarios.feature (requirement + attachments only).
 */
import { test, expect, type TestData } from '../../../heldout-support/fixtures';
import type { Page } from '@playwright/test';

// @req-constants-start — expected outcomes copied verbatim from DEMO-101 (never edit during hardening)
const REQ = {
  AC1_PAGE_TITLE: 'Products',
  AC1_CATALOGUE_SIZE: 6,
  AC2_LOCKED_MESSAGE: 'Your account has been locked. Please contact customer support.',
  AC3_BAD_PASSWORD_MESSAGE: 'Epic sadface: Username and password do not match any user in this service',
  AC4_SORT_OPTION: 'Price (low to high)',
  AC6_FIRST_NAME_MESSAGE: 'Error: First Name is required',
  AC7_TAX_RATE: 0.10, // pricing-rules.md §Tax — "Sales tax is 10% of the item total", rounded half-up to 2 dp
  AC8_CONFIRMATION: 'Thank you for your order!',
} as const;
// @req-constants-end

const money = (text: string) => Number(text.replace(/[^0-9.]/g, ''));
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// ---- page mechanics (hardened against the live AUT — see hardening/hardening-log.md) -------------
const ui = (page: Page) => ({
  username: page.getByRole('textbox', { name: 'Username', exact: true }),
  password: page.getByRole('textbox', { name: 'Password', exact: true }),
  signIn: page.getByRole('button', { name: 'Login', exact: true }),
  error: page.getByRole('alert'),
  pageTitle: page.getByTestId('title'),
  products: page.getByTestId('inventory-item'),
  productPrices: page.getByTestId('inventory-item-price'),
  sort: page.getByRole('combobox', { name: 'Sort products', exact: true }),
  cartBadge: page.getByTestId('shopping-cart-badge'),
  cartLink: page.getByTestId('shopping-cart-link'),
  checkout: page.getByRole('button', { name: 'Checkout' }),
  firstName: page.getByRole('textbox', { name: 'First Name', exact: true }),
  lastName: page.getByRole('textbox', { name: 'Last Name', exact: true }),
  postalCode: page.getByRole('textbox', { name: 'Zip/Postal Code', exact: true }),
  continue: page.getByRole('button', { name: 'Continue' }),
  itemTotal: page.getByTestId('subtotal-label'),
  tax: page.getByTestId('tax-label'),
  total: page.getByTestId('total-label'),
  finish: page.getByRole('button', { name: 'Finish' }),
  confirmation: page.getByRole('heading', { name: REQ.AC8_CONFIRMATION }),
  openMenu: page.getByRole('button', { name: 'Open Menu' }),
  logout: page.getByRole('button', { name: 'Logout', exact: true }),
});

const product = (page: Page, nth: number) => ui(page).products.nth(nth);
const addButton = (page: Page, nth: number) => product(page, nth).getByRole('button', { name: 'Add to cart' });
const removeButton = (page: Page, nth: number) => product(page, nth).getByRole('button', { name: 'Remove' });
const productPrice = (page: Page, nth: number) => product(page, nth).getByTestId('inventory-item-price');

async function signIn(page: Page, user: { username: string; password: string }, password = user.password) {
  const u = ui(page);
  await u.username.fill(user.username);
  await u.password.fill(password);
  await u.signIn.click();
}

async function signInAsStandard(page: Page, data: TestData) {
  await signIn(page, data.users.standard);
  await expect(ui(page).pageTitle).toBeVisible();
}

async function checkoutWith(page: Page, details: { firstName?: string; lastName?: string; postalCode?: string }) {
  const u = ui(page);
  await u.firstName.fill(details.firstName ?? '');
  await u.lastName.fill(details.lastName ?? '');
  await u.postalCode.fill(details.postalCode ?? '');
  await u.continue.click();
}

async function openCartAndCheckout(page: Page) {
  await ui(page).cartLink.click();
  await ui(page).checkout.click();
}

// ---- scenarios ---------------------------------------------------------------------------------
test.describe('DEMO-101 Shopper can sign in, build a cart and complete checkout', () => {
  test.beforeEach(async ({ page, journey }) => {
    await journey.step('Given I am on the sign-in page', async () => {
      await page.goto('/');
    });
  });

  test('SCN-001: Standard shopper signs in and sees the full catalogue', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    await journey.step('When I sign in as the "standard" shopper', async () => {
      await signIn(page, data.users.standard);
    });
    await journey.step('Then I am on the "Products" page', async () => {
      await expect(ui(page).pageTitle, '[REQ AC-1] lands on the "Products" page').toHaveText(REQ.AC1_PAGE_TITLE);
    });
    await journey.step('And the catalogue lists 6 products', async () => {
      await expect(ui(page).products, '[REQ AC-1] catalogue lists 6 products').toHaveCount(REQ.AC1_CATALOGUE_SIZE);
    });
  });

  test('SCN-002: Locked shopper cannot sign in and is told the account is locked', { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    await journey.step('When I sign in as the "locked" shopper', async () => {
      await signIn(page, data.users.locked);
    });
    await journey.step('Then I see the error "Your account has been locked. Please contact customer support."', async () => {
      await expect(ui(page).error, '[REQ AC-2] locked-account error message').toHaveText(REQ.AC2_LOCKED_MESSAGE);
    });
    await journey.step('And I am still on the sign-in page', async () => {
      await expect(ui(page).signIn, '[REQ AC-2] stays on the sign-in page').toBeVisible();
    });
  });

  test('SCN-003: Wrong password shows the credentials error', { tag: ['@AC-3', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey, data, seed }) => {
    await journey.step('When I sign in as the "standard" shopper with the password "wrong_password"', async () => {
      await signIn(page, data.users.standard, data.wrongPassword);
    });
    await journey.step('Then I see the error "Epic sadface: Username and password do not match any user in this service"', async () => {
      await expect(ui(page).error, '[REQ AC-3] wrong-password error message').toHaveText(REQ.AC3_BAD_PASSWORD_MESSAGE);
    });
  });

  test('SCN-004: Wrong password clears the credential fields for security', { tag: ['@AC-3', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey, data, seed }) => {
    await journey.step('When I sign in as the "standard" shopper with the password "wrong_password"', async () => {
      await signIn(page, data.users.standard, data.wrongPassword);
      await expect(ui(page).error).toBeVisible(); // sync: the failed attempt has been processed
    });
    await journey.step('Then the Username field is empty', async () => {
      await expect.soft(ui(page).username, '[REQ AC-3] Username field cleared').toHaveValue('');
    });
    await journey.step('And the Password field is empty', async () => {
      await expect.soft(ui(page).password, '[REQ AC-3] Password field cleared').toHaveValue('');
    });
  });

  test('SCN-005: Sorting by price low to high orders products by ascending price', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey, data, seed }) => {
    await journey.step('Given I am signed in as the "standard" shopper', async () => {
      await seed.create('signed-in session (UI setup: the AUT has no API)', () => signInAsStandard(page, data));
    });
    await journey.step('When I sort the products by "Price (low to high)"', async () => {
      await ui(page).sort.selectOption({ label: REQ.AC4_SORT_OPTION });
    });
    await journey.step('Then the product prices are displayed in ascending order', async () => {
      await expect(ui(page).productPrices.first()).toBeVisible();
      const prices = (await ui(page).productPrices.allInnerTexts()).map(money);
      expect(prices.length, 'prices were read from the catalogue').toBeGreaterThan(1);
      expect(prices, '[REQ AC-4] prices ascending after "Price (low to high)"').toEqual([...prices].sort((a, b) => a - b));
    });
  });

  test('SCN-006: Adding products increases the cart badge by one each time', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    await journey.step('Given I am signed in as the "standard" shopper', async () => {
      await seed.create('signed-in session (UI setup: the AUT has no API)', () => signInAsStandard(page, data));
    });
    await journey.step('And the cart badge is not shown', async () => {
      await expect(ui(page).cartBadge, '[REQ AC-5] no badge for an empty cart').toBeHidden();
    });
    await journey.step('When I add the 1st listed product to the cart', async () => {
      await addButton(page, 0).click();
    });
    await journey.step('Then the cart badge shows 1', async () => {
      await expect(ui(page).cartBadge, '[REQ AC-5] badge +1 after first add').toHaveText('1');
    });
    await journey.step('When I add the 2nd listed product to the cart', async () => {
      await addButton(page, 1).click();
    });
    await journey.step('Then the cart badge shows 2', async () => {
      await expect(ui(page).cartBadge, '[REQ AC-5] badge +1 after second add').toHaveText('2');
    });
  });

  test('SCN-007: Removing products decreases the cart badge and hides it when empty', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey, data, seed }) => {
    await journey.step('Given I am signed in as the "standard" shopper', async () => {
      await seed.create('signed-in session (UI setup: the AUT has no API)', () => signInAsStandard(page, data));
    });
    await journey.step('And I have added the 1st and 2nd listed products to the cart', async () => {
      await addButton(page, 0).click();
      await addButton(page, 1).click();
      await expect(ui(page).cartBadge).toHaveText('2');
    });
    await journey.step('When I remove the 2nd listed product', async () => {
      await removeButton(page, 1).click();
    });
    await journey.step('Then the cart badge shows 1', async () => {
      await expect(ui(page).cartBadge, '[REQ AC-5] badge -1 after remove').toHaveText('1');
    });
    await journey.step('When I remove the 1st listed product', async () => {
      await removeButton(page, 0).click();
    });
    await journey.step('Then the cart badge is not shown', async () => {
      await expect(ui(page).cartBadge, '[REQ AC-5] badge hidden when cart empty').toBeHidden();
    });
  });

  test('SCN-008: Checkout requires a First Name', { tag: ['@AC-6', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey, data, seed }) => {
    await journey.step('Given I am signed in as the "standard" shopper', async () => {
      await seed.create('signed-in session (UI setup: the AUT has no API)', () => signInAsStandard(page, data));
    });
    await journey.step('And I have added the 1st listed product to the cart', async () => {
      await addButton(page, 0).click();
    });
    await journey.step('When I open the cart and proceed to checkout', async () => {
      await openCartAndCheckout(page);
    });
    await journey.step('And I continue with Last Name and Postal Code but no First Name', async () => {
      await checkoutWith(page, { lastName: data.checkout.lastName, postalCode: data.checkout.postalCode });
    });
    await journey.step('Then I see the error "Error: First Name is required"', async () => {
      await expect(ui(page).error, '[REQ AC-6] First Name required message').toHaveText(REQ.AC6_FIRST_NAME_MESSAGE);
    });
  });

  test('SCN-009: Checkout requires a Last Name and a Postal Code', { tag: ['@AC-6', '@type:negative', '@layer:ui', '@P3'] }, async ({ page, journey, data, seed }) => {
    await journey.step('Given I am signed in as the "standard" shopper', async () => {
      await seed.create('signed-in session (UI setup: the AUT has no API)', () => signInAsStandard(page, data));
    });
    await journey.step('And I have added the 1st listed product to the cart', async () => {
      await addButton(page, 0).click();
    });
    await journey.step('When I open the cart and proceed to checkout', async () => {
      await openCartAndCheckout(page);
    });
    await journey.step('And I continue with First Name and Postal Code but no Last Name', async () => {
      await checkoutWith(page, { firstName: data.checkout.firstName, postalCode: data.checkout.postalCode });
    });
    await journey.step('Then I cannot continue and an error is shown', async () => {
      await expect(ui(page).error, '[REQ AC-6] Last Name is mandatory (error shown)').toBeVisible();
      await expect(ui(page).itemTotal, '[REQ AC-6] Last Name is mandatory (not on overview)').toBeHidden();
    });
    await journey.step('When I continue with First Name and Last Name but no Postal Code', async () => {
      await checkoutWith(page, { firstName: data.checkout.firstName, lastName: data.checkout.lastName });
    });
    await journey.step('Then I cannot continue and an error is shown', async () => {
      await expect(ui(page).error, '[REQ AC-6] Postal Code is mandatory (error shown)').toBeVisible();
      await expect(ui(page).itemTotal, '[REQ AC-6] Postal Code is mandatory (not on overview)').toBeHidden();
    });
  });

  test('SCN-010: Checkout overview totals follow the pricing rules', { tag: ['@AC-7', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    const noted: number[] = [];
    await journey.step('Given I am signed in as the "standard" shopper', async () => {
      await seed.create('signed-in session (UI setup: the AUT has no API)', () => signInAsStandard(page, data));
    });
    await journey.step('And I have added the 1st and 2nd listed products to the cart, noting their prices', async () => {
      for (const nth of [0, 1]) {
        noted.push(money(await productPrice(page, nth).innerText()));
        await addButton(page, nth).click();
      }
    });
    await journey.step('When I open the cart and proceed to checkout', async () => {
      await openCartAndCheckout(page);
    });
    await journey.step('And I continue with my First Name, Last Name and Postal Code', async () => {
      await checkoutWith(page, data.checkout);
      await expect(ui(page).itemTotal).toBeVisible();
    });
    const itemTotal = money(await ui(page).itemTotal.innerText());
    const tax = money(await ui(page).tax.innerText());
    const total = money(await ui(page).total.innerText());
    await journey.step('Then the Item total equals the sum of the noted prices', async () => {
      expect.soft(itemTotal, '[REQ AC-7] Item total = sum of item prices').toBeCloseTo(round2(noted.reduce((a, b) => a + b, 0)), 2);
    });
    await journey.step('And the Tax equals 10% of the Item total rounded half-up to 2 decimals', async () => {
      expect.soft(tax, '[REQ AC-7] Tax = 10% of Item total (pricing-rules.md)').toBeCloseTo(round2(itemTotal * REQ.AC7_TAX_RATE), 2);
    });
    await journey.step('And the Total equals the Item total plus the Tax', async () => {
      expect.soft(total, '[REQ AC-7] Total = Item total + Tax').toBeCloseTo(round2(itemTotal + tax), 2);
    });
  });

  test('SCN-011: Finishing the order confirms it and empties the cart', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    await journey.step('Given I am signed in as the "standard" shopper', async () => {
      await seed.create('signed-in session (UI setup: the AUT has no API)', () => signInAsStandard(page, data));
    });
    await journey.step('And I have added the 1st listed product to the cart', async () => {
      await addButton(page, 0).click();
    });
    await journey.step('When I open the cart and proceed to checkout', async () => {
      await openCartAndCheckout(page);
    });
    await journey.step('And I continue with my First Name, Last Name and Postal Code', async () => {
      await checkoutWith(page, data.checkout);
    });
    await journey.step('And I finish the order', async () => {
      await ui(page).finish.click();
    });
    await journey.step('Then I see the confirmation "Thank you for your order!"', async () => {
      await expect(ui(page).confirmation, '[REQ AC-8] order confirmation message').toHaveText(REQ.AC8_CONFIRMATION);
    });
    await journey.step('And the cart badge is not shown', async () => {
      await expect(ui(page).cartBadge, '[REQ AC-8] cart empty after order').toBeHidden();
    });
  });

  test('SCN-012: Logging out returns to sign-in and protects the Products page', { tag: ['@AC-9', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    let productsUrl = '';
    await journey.step('Given I am signed in as the "standard" shopper', async () => {
      await seed.create('signed-in session (UI setup: the AUT has no API)', () => signInAsStandard(page, data));
    });
    await journey.step('And I note the address of the Products page', async () => {
      productsUrl = page.url();
    });
    await journey.step('When I log out', async () => {
      await ui(page).openMenu.click();
      await ui(page).logout.click();
    });
    await journey.step('Then I am on the sign-in page', async () => {
      await expect(ui(page).signIn, '[REQ AC-9] back on the sign-in page after logout').toBeVisible();
    });
    await journey.step('When I open the noted Products page address directly', async () => {
      await page.goto(productsUrl);
    });
    await journey.step('Then I am not shown the Products page', async () => {
      await expect(ui(page).pageTitle, '[REQ AC-9] Products page not shown when signed out').toBeHidden();
    });
    await journey.step('And I am on the sign-in page', async () => {
      await expect(ui(page).signIn, '[REQ AC-9] redirected to sign-in when signed out').toBeVisible();
    });
  });
});
