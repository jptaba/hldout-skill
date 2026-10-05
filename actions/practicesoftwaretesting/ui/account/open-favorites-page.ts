import { gotoPage } from '../../../../heldout-support/fixtures';
import { type Page } from './_shared';

/**
 * Open the "Favorites" page of the signed-in customer's account and wait until it has loaded the favourites list (the
 * page's request for the customer's favourites has been answered). Needs a signed-in page.
 */
export async function openFavoritesPage(page: Page): Promise<void> {
  const loaded = page.waitForResponse((r) => {
    const type = r.request().resourceType();
    // The page loads the list with GET <api>/favorites.
    return (type === 'fetch' || type === 'xhr') && new URL(r.url()).pathname.endsWith('/favorites') && r.request().method() === 'GET';
  }, { timeout: 15_000 });
  await gotoPage(page, '/account/favorites'); // "My favorites" in the account menu leads here
  await loaded;
}
