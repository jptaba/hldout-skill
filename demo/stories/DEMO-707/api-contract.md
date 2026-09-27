# Conduit API contract (RealWorld, v2 profile)

Base: the environment's API origin. JSON bodies use a **top-level envelope** named after the resource.
Authentication: `Authorization: Token <jwt>` (JWT from register/login).

| Method | Path | Auth | Request envelope | Success |
| --- | --- | --- | --- | --- |
| POST | /api/users | – | `{"user": {"username", "email", "password"}}` | 201 `{"user": {…, "token"}}` |
| POST | /api/users/login | – | `{"user": {"email", "password"}}` | 200 `{"user": {…, "token"}}` |
| GET | /api/user | required | – | 200 `{"user": {…}}` |
| GET | /api/articles | optional | query: `author`, `tag`, `favorited`, `limit` (1–100, default 20), `offset` (≥ 0) | 200 `{"articles": [...], "articlesCount"}` |
| GET | /api/articles/feed | required | query: `limit`, `offset` | 200 `{"articles": [...], "articlesCount"}` |
| POST | /api/articles | required | `{"article": {"title", "description", "body", "tagList"}}` | 201 `{"article": {…}}` |
| GET | /api/articles/{slug} | optional | – | 200 `{"article": {…}}` |
| PUT | /api/articles/{slug} | required (author) | `{"article": {…changed fields}}` | 200 `{"article": {…}}` |
| DELETE | /api/articles/{slug} | required (author) | – | 204 |
| POST | /api/articles/{slug}/comments | required | `{"comment": {"body"}}` | 200 `{"comment": {…}}` |
| GET | /api/articles/{slug}/comments | optional | – | 200 `{"comments": [...]}` |
| DELETE | /api/articles/{slug}/comments/{id} | required (comment author) | – | 200 |
| POST | /api/articles/{slug}/favorite | required | – | 200 `{"article": {…, "favorited", "favoritesCount"}}` |
| DELETE | /api/articles/{slug}/favorite | required | – | 200 `{"article": {…}}` |
| POST | /api/profiles/{username}/follow | required | – | 200 `{"profile": {…, "following": true}}` |

## Errors

| Case | Status | Body |
| --- | --- | --- |
| Validation / taken values | 422 | `{"errors": {"<field>": ["<message>", …]}}` |
| Missing / invalid token; wrong login credentials | 401 | error body |
| Authenticated but not permitted (not the owner) | 403 | error body |
| Resource not found | 404 | error body |
