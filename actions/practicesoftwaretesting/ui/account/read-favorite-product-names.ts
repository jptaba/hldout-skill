import { type Page } from './_shared';

/** Read the names of the products the open "Favorites" page of the account lists now, in the order shown. */
export async function readFavoriteProductNames(page: Page): Promise<string[]> {
  // Each listed favourite is a card data-test="favorite-<favourite id>" with its product's name in data-test="product-name".
  const names = await page.locator('[data-test^="favorite-"]').getByTestId('product-name').allInnerTexts();
  return names.map((n) => n.trim()).filter(Boolean);
}
