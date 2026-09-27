# Requirement contract — DEMO-303: Partner booking API — authenticate, create, amend and cancel bookings

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-26T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | acceptance criteria AC-1..AC-12, API contract table, booking JSON shape (R7), Accept header for every call (R9), auth schemes, test-data pointer |
| attachments/booking-rules.csv | validation rules R1-R6 with valid/invalid examples (AC-6) |
| attachments/partner-accounts.csv | partner credentials for the test environment |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | POST /auth with valid partner credentials responds 200 with {"token": "<non-empty string>"}. | status 200; body has "token" as a non-empty string | story.md#L30 |
| AC-2 | api | POST /auth with invalid credentials responds 401 Unauthorized with {"reason": "Bad credentials"}. | status 401; body {"reason": "Bad credentials"} | story.md#L31 |
| AC-3 | api | POST /booking with a valid booking responds 200 with {"bookingid": <integer>, "booking": <the booking exactly as sent>}. | status 200; "bookingid" is an integer; "booking" equals the booking exactly as sent | story.md#L35 |
| AC-4 | api | GET /booking/{id} responds 200 with the stored booking, identical to what was created. An id that does not exist responds 404. | GET of a created booking's id → 200; body is identical to the booking that was created; GET of an id that does not exist → 404 | story.md#L36 |
| AC-5 | api | GET /booking?firstname=<f>&lastname=<l> responds 200 with a JSON array of {"bookingid"} objects that includes every booking with that name. | status 200; body is a JSON array of {"bookingid"} objects; the array includes the bookingid of every booking with that firstname and lastname | story.md#L37 |
| AC-6 | api | A booking that breaks any rule in booking-rules.csv is rejected with 400 Bad Request (never 5xx) and is not stored. A value exactly on a boundary is valid. | a booking breaking any one of R1-R6 → 400 Bad Request; each invalid_example of booking-rules.csv is rejected: missing firstname, missing lastname, totalprice -1, missing depositpaid, missing bookingdates.checkin, checkout = checkin - 4 days; never a 5xx response; the rejected booking is not stored (a search by its name does not return it); a value exactly on a boundary is valid and accepted (totalprice 0; checkout = checkin + 1 day) | story.md#L41 |
| AC-7 | api | PUT, PATCH and DELETE require authentication, either the cookie token=<token from /auth> or Authorization: Basic <base64 of partner credentials>. Without it they respond 403 Forbidden and change nothing. | PUT without authentication → 403 Forbidden; PATCH without authentication → 403 Forbidden; DELETE without authentication → 403 Forbidden; after each unauthenticated attempt the booking is unchanged (still readable with GET /booking/{id}, same content); authentication by the token cookie and by Basic credentials are both accepted | story.md#L45 |
| AC-8 | api | PUT /booking/{id} replaces the whole booking and responds 200 with the updated booking. Repeating the same PUT is idempotent: same response, same stored state. | status 200; body is the updated booking; the stored booking (GET /booking/{id}) is the whole replacement booking; repeating the same PUT gives the same response and the same stored state | story.md#L46 |
| AC-9 | api | PATCH /booking/{id} changes only the fields supplied. All other fields keep their values. | the supplied fields have the new values; all other fields keep their previous values (checked with GET /booking/{id}) | story.md#L47 |
| AC-10 | api | DELETE /booking/{id} with authentication responds 204 No Content. Afterwards GET /booking/{id} responds 404. | DELETE with authentication → 204 No Content; GET /booking/{id} afterwards → 404 | story.md#L48 |
| AC-11 | api | PUT, PATCH or DELETE of a booking id that does not exist responds 404 Not Found. | PUT of a non-existent id → 404 Not Found; PATCH of a non-existent id → 404 Not Found; DELETE of a non-existent id → 404 Not Found | story.md#L49 |
| AC-12 | api | GET /booking/{id} responds in under 3000 ms for each of 5 consecutive requests. | each of 5 consecutive GET /booking/{id} requests responds in under 3000 ms | story.md#L53 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /auth | none | 200 {"token": "<non-empty string>"} | story.md#L59 |
| POST /booking | none | 200 {"bookingid": <integer>, "booking": <as sent>} | story.md#L60 |
| GET /booking | none | 200 JSON array of {"bookingid"} | story.md#L61 |
| GET /booking/{id} | none | 200 stored booking | story.md#L62 |
| PUT /booking/{id} | required | 200 updated booking | story.md#L63 |
| PATCH /booking/{id} | required | not stated (G4) | story.md#L64 |
| DELETE /booking/{id} | required | 204 No Content | story.md#L65 |

## Rules and boundaries

- **R1** firstname: required non-empty string (valid: Ada; invalid: missing) _(attachments/booking-rules.csv#L2)_
- **R2** lastname: required non-empty string (valid: Lovelace; invalid: missing) _(attachments/booking-rules.csv#L3)_
- **R3** totalprice: required integer >= 0 (valid: 0; invalid: -1) _(attachments/booking-rules.csv#L4)_
- **R4** depositpaid: required boolean (valid: true; invalid: missing) _(attachments/booking-rules.csv#L5)_
- **R5** bookingdates.checkin: required date YYYY-MM-DD (valid: 2026-10-01; invalid: missing) _(attachments/booking-rules.csv#L6)_
- **R6** bookingdates.checkout: required date YYYY-MM-DD strictly after checkin (valid: checkin + 1 day; invalid: checkin - 4 days) _(attachments/booking-rules.csv#L7)_
- **R7** additionalneeds is an optional string; the other booking fields are firstname (string), lastname (string), totalprice (integer), depositpaid (boolean), bookingdates.checkin and bookingdates.checkout (YYYY-MM-DD) _(story.md#L67)_
- **R8** A value exactly on a boundary is valid _(story.md#L41)_
- **R9** Clients send Accept: application/json on every booking API call (general client instruction, not specific to one endpoint) _(story.md#L67)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | POST /auth with invalid credentials | 401 | {"reason": "Bad credentials"} | story.md#L31 |
| E2 | GET /booking/{id} for an id that does not exist | 404 |  | story.md#L36 |
| E3 | POST /booking with a booking that breaks any rule in booking-rules.csv (never 5xx; not stored) | 400 |  | story.md#L41 |
| E4 | PUT, PATCH or DELETE without authentication (nothing changes) | 403 |  | story.md#L45 |
| E5 | GET /booking/{id} after the booking was deleted | 404 |  | story.md#L48 |
| E6 | PUT, PATCH or DELETE of a booking id that does not exist | 404 |  | story.md#L49 |

## Authentication

PUT, PATCH and DELETE /booking/{id} require either the cookie `token=<token from POST /auth>` or `Authorization: Basic <base64 of partner credentials>` (username:password, G9). POST /auth takes the credentials as JSON {username, password} (G2). All other endpoints need no authentication. — credentials: attachments/partner-accounts.csv#L2 (role partner, public demo account of the test environment) _(story.md#L45)_

## Test data

Each test creates its own bookings with POST /booking (no authentication needed) and uses the bookingid from the response. Use a unique firstname/lastname per test so name searches (AC-5, AC-6 'not stored') are not disturbed by other users. Non-existent ids per G7.
- Shared public sandbox (AUT profile restful-booker): other people write to it and data resets periodically; never rely on pre-existing bookings
- Valid bookings must satisfy R1-R7; a valid baseline is firstname Ada, lastname Lovelace, totalprice 0 or more, depositpaid true, checkin 2026-10-01, checkout after checkin
- Cleanup: Best effort: DELETE /booking/{id} with authentication for bookings a test created; the sandbox also resets periodically.

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | API origin (base URL) of the booking service | mechanics | yes | * | story → attachments → config | found-in-config: https://restful-booker.herokuapp.com |
| G2 | request body field names of POST /auth | mechanics | yes | AC-1, AC-2, AC-7, AC-8, AC-9, AC-10, AC-11 | story → attachments → aut | discovered-in-aut: POST /auth JSON body {"username": <username>, "password": <password>} |
| G3 | request body encoding (Content-Type) for POST /auth, POST /booking, PUT and PATCH | mechanics | yes | AC-1, AC-2, AC-3, AC-6, AC-7, AC-8, AC-9, AC-11 | story → attachments → aut | discovered-in-aut: send JSON bodies with Content-Type: application/json |
| G4 | success status of PATCH /booking/{id} (AC-9 states only that supplied fields change and others keep their values) | oracle | no | AC-9 | story → attachments | open |
| G5 | is checkout equal to checkin valid? R6 says checkout strictly after checkin (equal would be invalid); AC-6 says a value exactly on a boundary is valid | oracle | no | AC-6 | story → attachments | open |
| G6 | precedence when an unauthenticated PUT/PATCH/DELETE targets an id that does not exist: 403 (AC-7) or 404 (AC-11)? | oracle | no | AC-7, AC-11 | story → attachments | open |
| G7 | how to obtain a booking id that does not exist (AC-4, AC-11) | mechanics | yes | AC-4, AC-11 | story → attachments | assumed: use a very large integer id that the sandbox does not hand out (e.g. 999999999); ids are integers per AC-3 |
| G8 | how to verify 'is not stored' (AC-6) and 'change nothing' (AC-7) | mechanics | yes | AC-6, AC-7 | story | found-in-requirement: AC-6: send the invalid booking with a unique firstname/lastname, then GET /booking?firstname=&lastname= must not list any bookingid for it. AC-7: GET /booking/{id} after the unauthenticated attempt returns the booking unchanged. |
| G9 | exact form of the Basic credentials ('base64 of partner credentials') | mechanics | yes | AC-7 | story → attachments → aut | discovered-in-aut: Authorization: Basic base64("<username>:<password>") (standard HTTP Basic) |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19 | context | API-only partner contract; no UI (out of scope); errors must be predictable (motivates AC-6 'never 5xx') |
| story.md#L23 | context | user story: partner obtains a token and manages bookings (AC-1..AC-11) |
| story.md#L24 | context | user story: invalid bookings rejected and never stored (AC-6) |
| story.md#L30 | AC-1 |  |
| story.md#L31 | AC-2, E1 |  |
| story.md#L35 | AC-3 |  |
| story.md#L36 | AC-4, E2 |  |
| story.md#L37 | AC-5 |  |
| story.md#L41 | AC-6, R8, E3 |  |
| story.md#L45 | AC-7, auth, E4 |  |
| story.md#L46 | AC-8 |  |
| story.md#L47 | AC-9 |  |
| story.md#L48 | AC-10, E5 |  |
| story.md#L49 | AC-11, E6 |  |
| story.md#L53 | AC-12 |  |
| story.md#L57 | endpoint | API contract table header |
| story.md#L59-L62 | endpoint |  |
| story.md#L63-L65 | endpoint, auth |  |
| story.md#L67 | endpoint, R7, R9 | booking JSON shape = request fields of POST/PUT/PATCH /booking (R7); "Clients send Accept: application/json" is a general instruction for every booking API call (R9), reflected in the request of every endpoint |
| story.md#L71 | test-data, auth |  |
| attachments/booking-rules.csv#L1 | context | CSV column header (rule_id, field, rule, valid_example, invalid_example) |
| attachments/booking-rules.csv#L2 | R1 |  |
| attachments/booking-rules.csv#L3 | R2 |  |
| attachments/booking-rules.csv#L4 | R3 |  |
| attachments/booking-rules.csv#L5 | R4 |  |
| attachments/booking-rules.csv#L6 | R5 |  |
| attachments/booking-rules.csv#L7 | R6, G5 |  |
| attachments/partner-accounts.csv#L1 | context | CSV column header (role, username, password, notes) |
| attachments/partner-accounts.csv#L2 | auth, test-data |  |
