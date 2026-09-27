# Guest enquiries & rooms — API contract (v1.4)

Base URL: the environment's API origin. All bodies are JSON (`Content-Type: application/json`).
Staff authentication: `POST /api/auth/login` returns a token; send it as the cookie `token=<value>`.

## POST /api/message — create enquiry (public)

Request:

```json
{ "name": "string", "email": "string", "phone": "string", "subject": "string", "description": "string" }
```

`description` is the Message field. Field rules: see `field-rules.csv`.

| Case | Status | Body |
| --- | --- | --- |
| All fields valid | **201 Created** | `{"success": true}` |
| One or more fields invalid | 400 Bad Request | JSON array of error strings (one per violated rule) |
| Body is not valid JSON | 400 Bad Request | any JSON error body — never 5xx |

## GET /api/message — list enquiries (staff token required)

| Case | Status | Body |
| --- | --- | --- |
| Valid token | 200 | `{"messages": [{"id": int, "name": string, "subject": string, "read": boolean}]}` |
| No / invalid token | **401 Unauthorized** | no message data |

## GET /api/message/{id} — enquiry detail (staff token required)

| Case | Status | Body |
| --- | --- | --- |
| Valid token, existing id | 200 | `{"messageid", "name", "email", "phone", "subject", "description"}` |
| No / invalid token | **401 Unauthorized** | no message data |

## POST /api/auth/login — staff login (public)

Request `{"username": "string", "password": "string"}`.

| Case | Status | Body |
| --- | --- | --- |
| Valid credentials | 200 | `{"token": "<non-empty string>"}` |
| Invalid credentials | 401 | `{"error": "Invalid credentials"}` |

## GET /api/room — list rooms (public)

200 → `{"rooms": [Room, …]}`

## GET /api/room/{id} — room detail (public)

| Case | Status | Body |
| --- | --- | --- |
| Existing id | 200 | Room |
| Unknown id | **404 Not Found** | error body |

### Room schema

| Field | Type | Rule |
| --- | --- | --- |
| roomid | integer | unique |
| roomName | string | non-empty |
| type | string | one of Single, Twin, Double, Family, Suite |
| accessible | boolean | |
| roomPrice | integer | > 0, price per night in GBP |
| features | array of string | may be empty |
| image | string | image URL or path |
| description | string | |

## Performance

`GET /api/room`: under 3000 ms per request (5 consecutive requests).
