# Product reviews API

Base: the shop's own origin. Authentication: `Authorization: Bearer <token>`, where the token is
`authentication.token` from `POST /rest/user/login` (body `{"email": "...", "password": "..."}`).

## Review object

| Field | Type | Meaning |
| --- | --- | --- |
| `_id` | string | the review's id |
| `message` | string | the review text |
| `author` | string | e-mail of the customer who wrote the review |
| `product` | — | the id of the product the review belongs to |
| `likesCount` | number | how many likes the review has |
| `likedBy` | array of strings | e-mails of the customers who liked the review |

Other fields may be present and are not part of this contract.

## Endpoints

### `GET /rest/products/{id}/reviews` — public
`200` → `{"status": "success", "data": [ <review>, ... ]}`

### `PUT /rest/products/{id}/reviews` — signed-in customer
Body: `{"message": "<text>", "author": "<e-mail of the signed-in customer>"}`
`201` → `{"status": "success"}`

### `POST /rest/products/reviews` — like a review — signed-in customer
Body: `{"id": "<review _id>"}`
`200` → an object whose `updated` array holds the review after the like.
A second like by the same customer → `403` `{"error": "Not allowed"}`. An unknown id → `404` `{"error": "Not found"}`.

### `PATCH /rest/products/reviews` — edit a review — its author
Body: `{"id": "<review _id>", "message": "<new text>"}`
`200` → an object whose `updated` array holds the review after the edit.
