import { productListAnswer, type Page } from './_shared';

/** Tick a category by its name in the catalogue page's category filter and wait for the filtered list to load. */
export async function filterCatalogueByCategory(page: Page, category: string): Promise<void> {
  const answer = productListAnswer(page);
  await page.getByRole('checkbox', { name: category, exact: true }).check();
  await answer;
}
