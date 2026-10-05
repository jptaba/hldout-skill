import { expect, gotoPage } from '../../../../heldout-support/fixtures';

type Page = Parameters<typeof gotoPage>[0];

/** Open a product's page in the web shop by the product's id and wait until the page shows the product's name. */
export async function openProductPage(page: Page, productId: string): Promise<void> {
  await gotoPage(page, `/product/${productId}`);
  // The product's name is the page's heading data-test="product-name" (one match; related products carry none).
  await expect(page.getByTestId('product-name'), 'the product page shows its product (precondition)').toBeVisible({ timeout: 15_000 });
}
