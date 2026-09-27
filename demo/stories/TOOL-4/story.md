# TOOL-4: Favourites for signed-in customers

Signed-in customers can keep a personal list of favourite products, from the product page (web shop) and through the API (mobile app).

**Technical notes:** endpoints `POST /favorites` (body `{"product_id"}`), `GET /favorites`, `DELETE /favorites/{favoriteId}`; all require `Authorization: Bearer <token>` from `POST /users/login`. Duplicate favourites are rejected with 422.
