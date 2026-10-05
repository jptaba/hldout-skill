import { cardName, cardPrice, parsePrice, productCards, type Page } from './_shared';

/** Read the name and price of every product card the catalogue page shows now, in the order shown. */
export async function readProductCards(page: Page): Promise<{ name: string; price: number }[]> {
  const cards = await productCards(page).all();
  const out: { name: string; price: number }[] = [];
  for (const card of cards) {
    const name = (await cardName(card).innerText()).trim();
    const price = parsePrice(await cardPrice(card).innerText());
    out.push({ name, price });
  }
  return out;
}
