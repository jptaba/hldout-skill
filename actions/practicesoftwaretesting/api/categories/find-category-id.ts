import { expect, type Api, type Seed } from '../../../../heldout-support/fixtures';

/** A node of GET /categories/tree: top-level categories carry their children in `sub_categories`. */
interface CategoryNode { id: string; name: string; slug?: string; parent_id?: string | null; sub_categories?: CategoryNode[] }

/** Look up a category's id by its name in GET /categories/tree (searched at every level of the tree). */
export async function findCategoryId(api: Api, seed: Seed, name: string): Promise<string> {
  return seed.step(`look up the id of category "${name}" (GET /categories/tree)`, async () => {
    const res = await api.get<CategoryNode[]>('/categories/tree');
    expect(res.ok && Array.isArray(res.body), 'GET /categories/tree lists categories (precondition)').toBe(true);
    const find = (nodes: CategoryNode[]): CategoryNode | undefined => {
      for (const n of nodes) {
        if (n.name === name) return n;
        const sub = find(n.sub_categories ?? []);
        if (sub) return sub;
      }
      return undefined;
    };
    const found = find(res.body);
    expect(found?.id, `category "${name}" is in the tree (precondition)`).toBeTruthy();
    return String(found!.id);
  });
}
