# Evidence pack — DEMO-303

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DEMO-303
  L3   | summary: "Partner booking API — authenticate, create, amend and cancel bookings"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: [partner-api, api]
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DEMO-303
  L10  | fetchedAt: 2026-09-26T16:04:49.436Z
  L11  | ---
  L12  | 
  L13  | # DEMO-303: Partner booking API — authenticate, create, amend and cancel bookings
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## Context
  L18  | 
● L19  | Travel partners integrate with our booking service over HTTP. This story defines the partner-facing contract. There is no UI: partners call the API directly. Errors must be predictable, because partner systems retry and reconcile automatically.
  L20  | 
  L21  | ## User stories
  L22  | 
● L23  | - As a **partner system**, I want to obtain a token and manage bookings, so that I can sell rooms on my own channel.
● L24  | - As **operations**, I want invalid bookings rejected at the door, so that we never store bookings we cannot honour.
  L25  | 
  L26  | ## Acceptance criteria
  L27  | 
  L28  | ### Authentication
  L29  | 
● L30  | - **AC-1**: `POST /auth` with valid partner credentials responds **200** with `{"token": "<non-empty string>"}`.
● L31  | - **AC-2**: `POST /auth` with invalid credentials responds **401 Unauthorized** with `{"reason": "Bad credentials"}`.
  L32  | 
  L33  | ### Create and read
  L34  | 
● L35  | - **AC-3**: `POST /booking` with a valid booking responds **200** with `{"bookingid": <integer>, "booking": <the booking exactly as sent>}`.
● L36  | - **AC-4**: `GET /booking/{id}` responds 200 with the stored booking, identical to what was created. An id that does not exist responds **404**.
● L37  | - **AC-5**: `GET /booking?firstname=<f>&lastname=<l>` responds 200 with a JSON array of `{"bookingid"}` objects that includes every booking with that name.
  L38  | 
  L39  | ### Validation (see `booking-rules.csv`)
  L40  | 
● L41  | - **AC-6**: A booking that breaks any rule in `booking-rules.csv` is rejected with **400 Bad Request** (never 5xx) and is not stored. A value exactly on a boundary is valid.
  L42  | 
  L43  | ### Amend and cancel
  L44  | 
● L45  | - **AC-7**: `PUT`, `PATCH` and `DELETE` require authentication, either the cookie `token=<token from /auth>` or `Authorization: Basic <base64 of partner credentials>`. Without it they respond **403 Forbidden** and change nothing.
● L46  | - **AC-8**: `PUT /booking/{id}` replaces the whole booking and responds 200 with the updated booking. Repeating the same PUT is **idempotent**: same response, same stored state.
● L47  | - **AC-9**: `PATCH /booking/{id}` changes only the fields supplied. All other fields keep their values.
● L48  | - **AC-10**: `DELETE /booking/{id}` with authentication responds **204 No Content**. Afterwards `GET /booking/{id}` responds 404.
● L49  | - **AC-11**: `PUT`, `PATCH` or `DELETE` of a booking id that does not exist responds **404 Not Found**.
  L50  | 
  L51  | ### Non-functional
  L52  | 
● L53  | - **AC-12**: `GET /booking/{id}` responds in under 3000 ms for each of 5 consecutive requests.
  L54  | 
  L55  | ## API contract
  L56  | 
● L57  | | Method | Path | Auth | Purpose |
  L58  | | --- | --- | --- | --- |
● L59  | | POST | /auth | none | obtain a token |
● L60  | | POST | /booking | none | create a booking |
● L61  | | GET | /booking | none | search bookings by name |
● L62  | | GET | /booking/{id} | none | read a booking |
● L63  | | PUT | /booking/{id} | token cookie or Basic | replace a booking |
● L64  | | PATCH | /booking/{id} | token cookie or Basic | partially update a booking |
● L65  | | DELETE | /booking/{id} | token cookie or Basic | cancel a booking |
  L66  | 
● L67  | Booking JSON: `{"firstname": string, "lastname": string, "totalprice": integer, "depositpaid": boolean, "bookingdates": {"checkin": "YYYY-MM-DD", "checkout": "YYYY-MM-DD"}, "additionalneeds": string (optional)}`. Clients send `Accept: application/json`.
  L68  | 
  L69  | ## Test data
  L70  | 
● L71  | Partner credentials for the test environment are in `partner-accounts.csv`.
  L72  | 
  L73  | ## Attachments
  L74  | 
  L75  | | File | MIME | Bytes | How to read | Local path |
  L76  | | --- | --- | --- | --- | --- |
  L77  | | booking-rules.csv | text/csv | 423 | text — read directly | attachments/booking-rules.csv |
  L78  | | partner-accounts.csv | text/csv | 107 | text — read directly | attachments/partner-accounts.csv |
  L79  | 
```

## attachments/booking-rules.csv

```text
● L1   | rule_id,field,rule,valid_example,invalid_example
● L2   | R1,firstname,required non-empty string,Ada,(missing)
● L3   | R2,lastname,required non-empty string,Lovelace,(missing)
● L4   | R3,totalprice,required integer >= 0,0,-1
● L5   | R4,depositpaid,required boolean,true,(missing)
● L6   | R5,bookingdates.checkin,required date YYYY-MM-DD,2026-10-01,(missing)
● L7   | R6,bookingdates.checkout,required date YYYY-MM-DD strictly after checkin,checkin + 1 day,checkin - 4 days
  L8   | 
```

## attachments/partner-accounts.csv

```text
● L1   | role,username,password,notes
● L2   | partner,admin,password123,Public demo partner account of the test environment
  L3   | 
```
