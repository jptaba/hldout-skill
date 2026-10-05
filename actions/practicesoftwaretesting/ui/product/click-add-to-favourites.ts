import { gotoPage } from '../../../../heldout-support/fixtures';

type Page = Parameters<typeof gotoPage>[0];

/**
 * On an open product page of the web shop, click its "Add to favourites" button (needs a signed-in customer). Does not
 * wait for the shop's answer: the caller checks what the shop shows next (its confirmation, the Favorites page).
 */
export async function clickAddToFavourites(page: Page): Promise<void> {
  // The product page's only button of that name (data-test="add-to-favorites").
  await page.getByRole('button', { name: 'Add to favourites', exact: true }).click();
}
