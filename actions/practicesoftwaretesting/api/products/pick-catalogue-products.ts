import { expect, type Api, type Seed } from '../../../../heldout-support/fixtures';
import { type Product, type ProductPage } from './_shared';

/**
 * Pick `count` different products of the catalogue (the first ones of GET /products, page 1): a lookup pre-step for a
 * test that needs existing products to act on (catalogue products are reference data, never changed). No cleanup.
 */
export async function pickCatalogueProducts(api: Api, seed: Seed, count = 1): Promise<Product[]> {
  return seed.step(`pick ${count} catalogue product(s) (GET /products)`, async () => {
    const res = await api.get<ProductPage>('/products', { params: { page: 1 } });
    expect(res.ok && Array.isArray(res.body?.data), 'GET /products lists products (precondition)').toBe(true);
    const picked = res.body.data.filter((p) => p.id).slice(0, count);
    expect(picked.length, `the catalogue has ${count} product(s) (precondition)`).toBe(count);
    return picked.map((p) => ({ ...p, id: String(p.id) }));
  });
}
