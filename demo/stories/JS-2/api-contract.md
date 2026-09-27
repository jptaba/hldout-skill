# JS-2 API contract — registration, login, basket

All endpoints are on the shop's own origin. Request and response bodies are JSON
(`Content-Type: application/json`). Authenticated calls use `Authorization: Bearer <token>`.

## Register a customer
`POST /api/Users`

Request body:
```json
{
  "email": "<unique e-mail>",
  "password": "<password>",
  "passwordRepeat": "<password>",
  "securityQuestion": { "id": <one of the ids from GET /api/SecurityQuestions> },
  "securityAnswer": "<answer>"
}
```
Success: **HTTP 201**, body `{ "status"?: ..., "data": { "id": <n>, "email": "...", "role": "customer", ... } }`
(the response echoes the submitted e-mail and assigns `role` = `customer`).

Duplicate e-mail: **HTTP 400** with a validation error indicating the e-mail must be unique.

The list of valid security-question ids is available from `GET /api/SecurityQuestions`.

## Log in
`POST /rest/user/login`

Request body: `{ "email": "...", "password": "..." }`

Success: **HTTP 200**, body:
```json
{ "authentication": { "token": "<JWT>", "bid": <basket id>, "umail": "<e-mail>" } }
```
The `token` is used as a `Bearer` token for authenticated calls. `bid` is the caller's basket id.

## Add an item to a basket
`POST /api/BasketItems`  (requires `Authorization: Bearer <token>`)

Request body: `{ "BasketId": <bid>, "ProductId": <product id>, "quantity": <n> }`

Adds the product to that basket.

## Read a basket
`GET /rest/basket/{id}`  (requires `Authorization: Bearer <token>`)

Returns the basket identified by `{id}`, including its `Products` array and the owning `UserId`.
Valid product ids can be taken from `GET /api/Products`.
