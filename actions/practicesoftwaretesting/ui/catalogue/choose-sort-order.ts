import { productListAnswer, type Page } from './_shared';

/** Choose a sort order by its label in the catalogue page's sort control and wait for the re-sorted list to load. */
export async function chooseSortOrder(page: Page, label: string): Promise<void> {
  const answer = productListAnswer(page);
  await page.getByTestId('sort').selectOption({ label });
  await answer;
}
