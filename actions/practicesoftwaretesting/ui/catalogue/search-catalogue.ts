import { productListAnswer, type Page } from './_shared';

/** Search the catalogue page for a term (type it in the search field and submit) and wait for the results to load. */
export async function searchCatalogue(page: Page, term: string): Promise<void> {
  await page.getByTestId('search-query').fill(term);
  const answer = productListAnswer(page, '/products/search');
  await page.getByTestId('search-submit').click();
  await answer;
}
