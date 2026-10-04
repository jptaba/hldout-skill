# Favourites API

The favourites endpoints of the shop API, used by the mobile app. Every call needs `Authorization: Bearer <token>`, the token from `POST /users/login`.

Excerpt of the service's OpenAPI definition (favourites only):

```yaml
paths:
  /favorites:
    get:
      summary: The signed-in customer's favourites
      security: [{ bearer: [] }]
      responses:
        "200": { description: The customer's own favourites }
        "401": { description: No valid token }
    post:
      summary: Add a product to the signed-in customer's favourites
      security: [{ bearer: [] }]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [product_id]
              properties:
                product_id: { type: string }
      responses:
        "201": { description: The favourite, with its id and the product id }
        "401": { description: No valid token }
        "409": { description: The product is already a favourite (a conflict) }
  /favorites/{favoriteId}:
    delete:
      summary: Remove a favourite
      security: [{ bearer: [] }]
      responses:
        "204": { description: Removed }
        "401": { description: No valid token }
```
