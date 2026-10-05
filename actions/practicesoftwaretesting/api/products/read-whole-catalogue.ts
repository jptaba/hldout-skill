import { expect, type Api, type Seed } from '../../../../heldout-support/fixtures';
import { type Product, type ProductPage } from './_shared';

/** Read every product of the catalogue, page by page through GET /products (a lookup pre-step, no cleanup). */
export async function readWholeCatalogue(api: Api, seed: Seed): Promise<Product[]> {
  return seed.step('read the whole catalogue (GET /products, every page)', async () => {
    const all: Product[] = [];
    for (let page = 1; page <= 50; page++) {
      const res = await api.get<ProductPage>('/products', { params: { page } });
      expect(res.ok && Array.isArray(res.body?.data), `GET /products page ${page} lists products (precondition)`).toBe(true);
      all.push(...res.body.data);
      if (page >= (res.body.last_page ?? 1)) break;
    }
    expect(all.length, 'the catalogue has products (precondition)').toBeGreaterThan(0);
    return all;
  });
}
