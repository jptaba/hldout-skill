# DEMO-303: Partner booking API — authenticate, create, amend and cancel bookings

## Context

Travel partners integrate with our booking service over HTTP. This story defines the partner-facing contract. There is no UI: partners call the API directly. Errors must be predictable, because partner systems retry and reconcile automatically.

## User stories

- As a **partner system**, I want to obtain a token and manage bookings, so that I can sell rooms on my own channel.
- As **operations**, I want invalid bookings rejected at the door, so that we never store bookings we cannot honour.

## Acceptance criteria

### Authentication

- **AC-1**: `POST /auth` with valid partner credentials responds **200** with `{"token": "<non-empty string>"}`.
- **AC-2**: `POST /auth` with invalid credentials responds **401 Unauthorized** with `{"reason": "Bad credentials"}`.

### Create and read

- **AC-3**: `POST /booking` with a valid booking responds **200** with `{"bookingid": <integer>, "booking": <the booking exactly as sent>}`.
- **AC-4**: `GET /booking/{id}` responds 200 with the stored booking, identical to what was created. An id that does not exist responds **404**.
- **AC-5**: `GET /booking?firstname=<f>&lastname=<l>` responds 200 with a JSON array of `{"bookingid"}` objects that includes every booking with that name.

### Validation (see `booking-rules.csv`)

- **AC-6**: A booking that breaks any rule in `booking-rules.csv` is rejected with **400 Bad Request** (never 5xx) and is not stored. A value exactly on a boundary is valid.

### Amend and cancel

- **AC-7**: `PUT`, `PATCH` and `DELETE` require authentication, either the cookie `token=<token from /auth>` or `Authorization: Basic <base64 of partner credentials>`. Without it they respond **403 Forbidden** and change nothing.
- **AC-8**: `PUT /booking/{id}` replaces the whole booking and responds 200 with the updated booking. Repeating the same PUT is **idempotent**: same response, same stored state.
- **AC-9**: `PATCH /booking/{id}` changes only the fields supplied. All other fields keep their values.
- **AC-10**: `DELETE /booking/{id}` with authentication responds **204 No Content**. Afterwards `GET /booking/{id}` responds 404.
- **AC-11**: `PUT`, `PATCH` or `DELETE` of a booking id that does not exist responds **404 Not Found**.

### Non-functional

- **AC-12**: `GET /booking/{id}` responds in under 3000 ms for each of 5 consecutive requests.

## API contract

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | /auth | none | obtain a token |
| POST | /booking | none | create a booking |
| GET | /booking | none | search bookings by name |
| GET | /booking/{id} | none | read a booking |
| PUT | /booking/{id} | token cookie or Basic | replace a booking |
| PATCH | /booking/{id} | token cookie or Basic | partially update a booking |
| DELETE | /booking/{id} | token cookie or Basic | cancel a booking |

Booking JSON: `{"firstname": string, "lastname": string, "totalprice": integer, "depositpaid": boolean, "bookingdates": {"checkin": "YYYY-MM-DD", "checkout": "YYYY-MM-DD"}, "additionalneeds": string (optional)}`. Clients send `Accept: application/json`.

## Test data

Partner credentials for the test environment are in `partner-accounts.csv`.
