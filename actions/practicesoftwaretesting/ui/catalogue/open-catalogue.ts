import { expect, gotoPage } from '../../../../heldout-support/fixtures';
import { productCards, productListAnswer, type Page } from './_shared';

/**
 * Open the web shop's catalogue page (the product overview, at the site root) and wait until its first product list
 * has arrived and is shown, so a search, sort or filter chosen next isn't overwritten by that late first answer.
 */
export async function openCatalogue(page: Page): Promise<void> {
  const firstList = productListAnswer(page);
  await gotoPage(page, '/');
  await firstList;
  await expect(productCards(page).first(), 'the catalogue shows its products (precondition)').toBeVisible({ timeout: 15_000 });
}
