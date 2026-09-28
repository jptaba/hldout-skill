# Contacts API: update and delete (contract)

Base URL: the application's origin. All endpoints require `Authorization: Bearer <token>` (token from `POST /users` or `POST /users/login`). `{id}` is the contact's `_id`.

## Contact resource

```json
{
  "_id": "6ab8...",
  "firstName": "Jane",
  "lastName": "Doe",
  "birthdate": "1985-07-14",
  "email": "jane.doe@example.com",
  "phone": "8005551234",
  "street1": "1 Main St.",
  "street2": "Apartment A",
  "city": "Anytown",
  "stateProvince": "KS",
  "postalCode": "12345",
  "country": "USA",
  "owner": "<_id of the user the contact belongs to>",
  "__v": 0
}
```

An optional field without a value is either absent or `null`.

## PUT /contacts/{id} — replace

Request body: a complete contact. `firstName` and `lastName` are required. Any optional field that is not in the body is cleared (set to `null`).

| Case | Status | Body |
|------|--------|------|
| Updated | 200 | the full updated contact |
| Validation error (for example missing first or last name, invalid e-mail) | 400 | JSON, `message` describes the failed rule(s) |
| Malformed id | 400 | text `Invalid Contact ID` |
| No contact with this id for the signed-in user | 404 | empty |
| Missing or invalid token | 401 | `{"error": "Please authenticate."}` |

## PATCH /contacts/{id} — partial update

Request body: only the fields to change. Fields not in the body keep their values.

| Case | Status | Body |
|------|--------|------|
| Updated | 200 | the updated contact |
| Validation error (for example empty first or last name, invalid e-mail) | 400 | JSON, `message` describes the failed rule(s) |
| Malformed id | 400 | text `Invalid Contact ID` |
| No contact with this id for the signed-in user | 404 | empty |
| Missing or invalid token | 401 | `{"error": "Please authenticate."}` |

## DELETE /contacts/{id}

| Case | Status | Body |
|------|--------|------|
| Deleted | 200 | text `Contact deleted` |
| Malformed id | 400 | text `Invalid Contact ID` |
| No contact with this id for the signed-in user (including one that was already deleted) | 404 | empty |
| Missing or invalid token | 401 | `{"error": "Please authenticate."}` |

## GET /contacts/{id}

200 with the contact; 400 `Invalid Contact ID` for a malformed id; 404 (empty body) when there is no such contact for the signed-in user.
