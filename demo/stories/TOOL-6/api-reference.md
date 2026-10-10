# Toolshop API reference (v5)

Owner: platform team. This page covers the public catalogue API and some of the account API. For everything else see the API portal.

## Base URL and versioning

| Environment | Base URL |
| --- | --- |
| Production | https://api.practicesoftwaretesting.com |
| Staging | https://api-staging.example.com (VPN only) |

All answers are JSON. Ids are ULIDs (26 characters).

## Authentication

Account endpoints take a bearer token from `POST /users/login` in the `Authorization` header. Catalogue endpoints (brands, categories, products) are public and need no token.

## Rate limits (production only)

60 requests per minute per IP address; above that the API answers 429 with a `Retry-After` header. Staging has no limit.

## Brands

```yaml
/brands:
  get:
    summary: All brands
    responses:
      "200": { description: A list of brands }
  post:
    summary: Create a brand (admin)
    responses:
      "201": { description: The new brand }
      "422": { description: Validation failed }
/brands/{brandId}:
  get:
    responses:
      "200": { description: The brand }
      "404": { description: No such brand }
```

## Categories

```yaml
/categories:
  get:
    summary: All categories as a flat list (no sub_categories)
    responses:
      "200": { description: A list of categories }
/categories/{categoryId}:
  get:
    summary: One category, without its sub-categories
    responses:
      "200": { description: The category }
/categories/tree:
  get:
    summary: The top-level categories, each with sub_categories (nested categories)
    parameters:
      - name: by_category_slug
        in: query
        required: false
    responses:
      "200": { description: A list of top-level categories with sub_categories }
/categories/tree/{categoryId}:
  get:
    summary: One category with its sub_categories
    responses:
      "200": { description: The category with sub_categories }
/categories/search:
  get:
    parameters:
      - name: q
        in: query
        required: true
    responses:
      "200": { description: The categories whose name matches q }
```

A category has `id`, `name`, `slug`, `parent_id` (null for a top-level category) and, in the tree endpoints, `sub_categories`.

## Products

```yaml
/products:
  get:
    parameters:
      - { name: by_category, in: query }
      - { name: by_brand, in: query }
      - { name: sort, in: query }
      - { name: page, in: query }
    responses:
      "200": { description: A page of products }
```

## Invoices

```yaml
/invoices:
  get:
    security: [ bearerAuth: [] ]
    responses:
      "200": { description: The caller's invoices }
      "401": { description: No valid token }
/invoices/{invoiceId}:
  get:
    security: [ bearerAuth: [] ]
    responses:
      "200": { description: The invoice }
      "403": { description: Not the caller's invoice }
```

## Changelog

- v5 (2026-08): categories tree endpoint gained `by_category_slug`.
- v4 (2026-05): brands search moved to `/brands/search`.
- v3: first public version.

## Deployment notes

Deployed by the platform pipeline on every merge to `main`. Rollback: re-run the previous pipeline. On-call: #platform-oncall.
