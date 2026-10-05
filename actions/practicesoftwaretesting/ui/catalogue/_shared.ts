import { type gotoPage } from '../../../../heldout-support/fixtures';

/** The Playwright page the catalogue actions work on. */
export type Page = Parameters<typeof gotoPage>[0];

/** The product cards of the catalogue page currently shown (links `a.card` with data-test="product-<id>"). */
export const productCards = (page: Page) => page.locator('a.card[data-test^="product-"]');

/** The name shown on one product card. */
export const cardName = (card: ReturnType<typeof productCards>) => card.getByTestId('product-name');

/** The price shown on one product card. */
export const cardPrice = (card: ReturnType<typeof productCards>) => card.getByTestId('product-price');

/** A shown price ("$14.15") as a number. */
export const parsePrice = (text: string): number => Number(text.replace(/[^0-9.,-]/g, '').replace(/,/g, ''));

/**
 * Wait for the catalogue's next product list answer (search, sort, filter or another page) to arrive. The web shop
 * asks the API with the HTTP method QUERY (filters in the request body), not GET, so any method matches; the path
 * must be exactly `path` (`/products`, or `/products/search` for a search).
 */
export const productListAnswer = (page: Page, path = '/products') =>
  page.waitForResponse((r) => {
    const type = r.request().resourceType();
    return (type === 'fetch' || type === 'xhr') && new URL(r.url()).pathname === path && r.request().method() !== 'OPTIONS';
  }, { timeout: 15_000 });
