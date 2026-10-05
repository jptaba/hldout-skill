import { type Api } from '../../../../heldout-support/fixtures';

/** A favourite as the favourites API answers it (only the fields the tests read). */
export interface Favourite {
  id?: string | number;
  product_id?: string;
  product?: { id?: string; name?: string };
}

/** The id of a favourite in an answer of the favourites API. */
export const favouriteIdOf = (f: unknown): string | undefined => {
  const id = (f as Favourite | undefined)?.id; // POST /favorites and each GET /favorites item carry it as `id`
  return id === undefined || id === null ? undefined : String(id);
};

/** The product id a favourite carries: its `product_id`, or the id of a nested `product`. */
export const productIdOf = (f: unknown): string | undefined => {
  const fav = f as Favourite | undefined;
  const id = fav?.product_id ?? fav?.product?.id; // `product_id` on POST and GET answers; GET also nests `product`
  return id === undefined || id === null ? undefined : String(id);
};

/** The favourites of a GET /favorites answer: the body itself when it is a list, or its `data` list. */
export const favouritesIn = (body: unknown): Favourite[] => {
  if (Array.isArray(body)) return body as Favourite[];
  const data = (body as { data?: unknown } | undefined)?.data; // GET /favorites answers a bare list today
  return Array.isArray(data) ? (data as Favourite[]) : [];
};

/**
 * Cleanup of a favourite: DELETE /favorites/{id} with the owner's headers. A favourite that is already gone (404, e.g.
 * the test removed it itself) counts as cleaned up; any other error answer throws, so the seed ledger shows it.
 */
export async function deleteFavourite(api: Api, headers: Record<string, string>, id: string): Promise<void> {
  const res = await api.delete(`/favorites/${id}`, { headers });
  if (!res.ok && res.status !== 404) throw new Error(`DELETE /favorites/${id} answered ${res.status}`);
}
