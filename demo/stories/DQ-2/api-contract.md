# Book Store API - collection contract (v1)

Base URL: the Book Store origin (same host as the web site). All bodies are JSON (`Content-Type: application/json`).

## Authentication

Protected calls send `Authorization: Bearer <token>`. A token is obtained with:

`POST /Account/v1/GenerateToken`  body `{ "userName": "...", "password": "..." }`
-> 200 `{ "token": "<jwt>", "expires": "<ISO-8601>", "status": "Success", "result": "User authorized successfully." }`

Accounts: `POST /Account/v1/User` (create, 201, returns `userID`), `GET /Account/v1/User/{UUID}` (protected),
`DELETE /Account/v1/User/{UUID}` (protected, 204).

## Error envelope

All errors: `{ "code": "<string>", "message": "<string>" }`

| Error | HTTP | code | message |
|-------|------|------|---------|
| Not authorized | 401 | 1200 | User not authorized! |
| ISBN not in catalogue | 400 | 1205 | ISBN supplied is not available in Books Collection! |
| ISBN not in user's collection | 400 | 1206 | ISBN supplied is not available in User's Collection! |
| ISBN already in user's collection | 400 | 1210 | ISBN already present in the User's Collection! |

## Book object

| Field | Type | Example |
|-------|------|---------|
| isbn | string | "9781449325862" |
| title | string | "Git Pocket Guide" |
| subTitle | string | "A Working Introduction" |
| author | string | "Richard E. Silverman" |
| publish_date | string (ISO-8601) | "2020-06-04T08:48:39.000Z" |
| publisher | string | "O'Reilly Media" |
| pages | number | 234 |
| description | string | |
| website | string (URL) | |

## Endpoints

### GET /BookStore/v1/Books  (public)
200 `{ "books": [ <Book>, ... ] }` - the whole catalogue.

### GET /BookStore/v1/Book?ISBN={isbn}  (public)
200 `<Book>`. Unknown ISBN -> 400 / 1205.

### POST /BookStore/v1/Books  (protected)
Body `{ "userId": "<UUID>", "collectionOfIsbns": [ { "isbn": "..." }, ... ] }`
201 `{ "books": [ { "isbn": "..." }, ... ] }` - the ISBNs that were added.
Errors: unknown ISBN -> 400 / 1205; ISBN already in the collection -> 400 / 1210; no/invalid token or another user's `userId` -> 401 / 1200.

### DELETE /BookStore/v1/Book  (protected)
Body `{ "isbn": "...", "userId": "<UUID>" }`
204, empty body. ISBN not in the user's collection -> 400 / 1206; no/invalid token -> 401 / 1200.

### DELETE /BookStore/v1/Books?UserId={UUID}  (protected)
Removes all books of the user. 204, empty body.

### GET /Account/v1/User/{UUID}  (protected)
200 `{ "userId": "<UUID>", "username": "...", "books": [ <Book>, ... ] }`.
No/invalid token, or another user's UUID -> 401 / 1200.
