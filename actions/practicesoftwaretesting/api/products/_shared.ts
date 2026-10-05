/** A product as the catalogue API returns it (only the fields the tests read). */
export interface Product {
  id: string;
  name: string;
  price: number;
  category?: { id: string; name?: string; slug?: string };
}

/** A paginated catalogue answer (GET /products, GET /products/search). */
export interface ProductPage {
  current_page: number;
  data: Product[];
  per_page: number;
  total: number;
  last_page: number;
}

/** The category id of a product in the API data (its nested `category.id`). */
export const categoryIdOf = (p: Product): string | undefined => (p.category?.id ? String(p.category.id) : undefined);

/** The price of a product in the API data, as a number (the API sends a JSON number). */
export const priceOf = (p: Product): number => Number(p.price);
