import { expect, type Api, type Seed } from '../../../../heldout-support/fixtures';
import { deleteFavourite, favouriteIdOf } from './_shared';

/**
 * Add a product to a signed-in customer's favourites through POST /favorites as a precondition ("given the product is
 * one of my favourites") and return the new favourite's id with the product id. Removed after the test (a favourite
 * the test already removed counts as cleaned up).
 */
export async function addFavourite(api: Api, seed: Seed, owner: { headers: Record<string, string> }, productId: string): Promise<{ id: string; productId: string }> {
  return seed.create(`favourite of product ${productId}`, async () => {
    const res = await api.post('/favorites', { headers: owner.headers, data: { product_id: productId } });
    expect(res.ok, `add product ${productId} to favourites (precondition): ${res.status} ${res.text.slice(0, 300)}`).toBe(true);
    const id = favouriteIdOf(res.body);
    expect(id, 'the new favourite has an id (precondition)').toBeTruthy();
    return { id: id!, productId };
  }, (f) => deleteFavourite(api, owner.headers, f.id));
}
