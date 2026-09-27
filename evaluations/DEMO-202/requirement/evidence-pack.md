# Evidence pack — DEMO-202

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DEMO-202
  L3   | summary: "Guest enquiries — contact form, rooms catalogue and messages API"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: [guest-enquiries, api, ui]
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DEMO-202
  L10  | fetchedAt: 2026-09-26T15:41:18.206Z
  L11  | ---
  L12  | 
  L13  | # DEMO-202: Guest enquiries — contact form, rooms catalogue and messages API
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## Business context
  L18  | 
● L19  | Guests of the B&B currently phone or e-mail with questions, and enquiries get lost. This story delivers a self-service **contact form** on the public home page, backed by a **Messages API**. Staff read enquiries through an authenticated admin API. The public **rooms catalogue** (UI and API) must stay consistent, because guests often ask about a room they have just looked at.
  L20  | 
  L21  | ## User stories
  L22  | 
● L23  | - As a **guest**, I want to send the B&B a message from the home page, so that I can ask about my stay without phoning.
● L24  | - As a **guest**, I want to see which rooms exist and what they cost per night, so that I can ask about a specific room.
● L25  | - As a **staff member**, I want to read guest enquiries through an authenticated API, so that no personal data is exposed publicly.
  L26  | 
  L27  | ## Scope
  L28  | 
● L29  | **In scope:** the contact form (home page, section "Send Us a Message"), the rooms list on the home page ("Our Rooms"), and the endpoints listed under API contract.
  L30  | 
● L31  | **Out of scope:** room booking/reservation, the admin UI screens, e-mail notifications, payment, and CAPTCHA/rate limiting (tracked in DEMO-230).
  L32  | 
  L33  | ## Acceptance criteria
  L34  | 
  L35  | ### Contact form (UI)
  L36  | 
● L37  | - **AC-1**: The home page contains a "Send Us a Message" form with the fields Name, Email, Phone, Subject and Message and a "Submit" button. **Every field has a programmatically associated label** that screen readers announce (WCAG 2.2 SC 1.3.1 / 4.1.2).
● L38  | - **AC-2**: Submitting a valid form replaces it with the heading "Thanks for getting in touch <Name>!" followed by "We'll get back to you about <Subject> as soon as possible." (exact copy in `ux-copy.md`).
● L39  | - **AC-3**: Submitting the form with every field empty keeps the form on screen and shows validation errors that mention every one of the five fields. Nothing is sent to staff.
● L40  | - **AC-4**: Field rules and boundaries are defined in the attached `field-rules.csv`. The UI and the API enforce the same rules. A value exactly on a boundary is valid; one character outside it is invalid.
  L41  | 
  L42  | ### Messages API
  L43  | 
● L44  | - **AC-5**: `POST /api/message` with a body that satisfies every field rule creates the enquiry. The response is **201 Created** with the JSON body `{"success": true}`.
● L45  | - **AC-6**: `POST /api/message` with one or more invalid fields responds **400 Bad Request**. The body is a JSON array of human-readable error strings containing, for each violated length rule, the exact message from `field-rules.csv`. The enquiry is not stored.
● L46  | - **AC-7**: A request body that is not valid JSON is a client error. `POST /api/message` responds **400 Bad Request**, never a 5xx.
● L47  | - **AC-8**: `GET /api/message` (list) and `GET /api/message/{id}` (detail) contain guests' personal data and **require a valid staff token**. Without a token they respond **401 Unauthorized** and return no message data. With a valid token (cookie `token`, obtained from `POST /api/auth/login`) the list responds 200 with `{"messages": [{"id", "name", "subject", "read"}]}`.
● L48  | - **AC-9**: `POST /api/auth/login` with valid staff credentials responds 200 with `{"token": "<non-empty string>"}`. Invalid credentials respond **401** with `{"error": "Invalid credentials"}`.
● L49  | - **AC-10**: An enquiry submitted through the UI form can be read by staff: it appears in the authenticated `GET /api/message` list with the same name and subject.
  L50  | 
  L51  | ### Rooms catalogue
  L52  | 
● L53  | - **AC-11**: `GET /api/room` responds 200 with `{"rooms": [...]}`. Every room follows the Room schema in `api-contract.md`: `roomid` integer, `roomName` string, `type` one of Single, Twin, Double, Family, Suite, `accessible` boolean, `roomPrice` integer greater than 0, `features` array of strings, `image` string, `description` string.
● L54  | - **AC-12**: `GET /api/room/{id}` responds 200 with a single Room for an existing id, and **404 Not Found** for an id that does not exist.
● L55  | - **AC-13**: Every room returned by `GET /api/room` is shown in "Our Rooms" with its type and its price formatted as "£<roomPrice> per night".
● L56  | - **AC-14**: Each room card image has alternative text that names **that room's type**, e.g. "Double Room" (WCAG 2.2 SC 1.1.1).
  L57  | 
  L58  | ### Reliability (added in revision 2)
  L59  | 
● L60  | - **AC-16**: Retries are safe. (a) Repeating `POST /api/message` with the same `Idempotency-Key` request header, for example after a network retry or a double-click, stores the enquiry **only once**: every repeat answers 2xx and no duplicate appears in the staff list. (b) `GET` endpoints are idempotent: repeating `GET /api/room/{id}` returns an identical body.
  L61  | 
  L62  | ### Non-functional
  L63  | 
● L64  | - **NFR-1 (AC-15)**: `GET /api/room` responds in under 3000 ms for each of 5 consecutive requests from the test environment.
  L65  | 
  L66  | ## API contract
  L67  | 
● L68  | The full contract is in `api-contract.md`. Endpoints in scope:
  L69  | 
● L70  | | Method | Path | Auth | Purpose |
  L71  | | --- | --- | --- | --- |
● L72  | | POST | /api/message | none | Create a guest enquiry |
● L73  | | GET | /api/message | staff token | List enquiries |
● L74  | | GET | /api/message/{id} | staff token | Enquiry detail |
● L75  | | POST | /api/auth/login | none | Obtain a staff token |
● L76  | | GET | /api/room | none | List rooms |
● L77  | | GET | /api/room/{id} | none | Room detail |
  L78  | 
  L79  | ## Test data
  L80  | 
● L81  | Staff credentials for the test environment are in the attached `test-accounts.csv`. Test enquiries must use a recognisable name or subject (e.g. prefixed "QA") so staff can ignore them.
  L82  | 
  L83  | ## Open questions
  L84  | 
● L85  | - Should leading and trailing whitespace be trimmed before length validation (for example a Subject of "   abc   ")? **PO to confirm; do not test until answered.**
  L86  | 
  L87  | ## Revision history
  L88  | 
● L89  | - **Rev 2 (2026-09-26)**: added AC-16 (safe retries / idempotency) after a support ticket about duplicate enquiries caused by double-clicks. `api-contract.md` v1.5 documents the `Idempotency-Key` header.
  L90  | 
  L91  | ## Definition of done
  L92  | 
● L93  | Every acceptance criterion is verified by the held-out evaluation, with no open Critical or Major defects.
  L94  | 
  L95  | ## Attachments
  L96  | 
  L97  | | File | MIME | Bytes | How to read | Local path |
  L98  | | --- | --- | --- | --- | --- |
  L99  | | field-rules.csv | text/csv | 553 | text — read directly | attachments/field-rules.csv |
  L100 | | api-contract.md | text/markdown | 2732 | text — read directly | attachments/api-contract.md |
  L101 | | ux-copy.md | text/markdown | 736 | text — read directly | attachments/ux-copy.md |
  L102 | | test-accounts.csv | text/csv | 125 | text — read directly | attachments/test-accounts.csv |
  L103 | 
```

## attachments/api-contract.md

```text
  L1   | # Guest enquiries & rooms — API contract (v1.5)
  L2   | 
● L3   | Base URL: the environment's API origin. All bodies are JSON (`Content-Type: application/json`).
● L4   | Staff authentication: `POST /api/auth/login` returns a token; send it as the cookie `token=<value>`.
  L5   | 
  L6   | ## POST /api/message — create enquiry (public)
  L7   | 
● L8   | Request:
  L9   | 
● L10  | ```json
● L11  | { "name": "string", "email": "string", "phone": "string", "subject": "string", "description": "string" }
● L12  | ```
  L13  | 
● L14  | `description` is the Message field. Field rules: see `field-rules.csv`.
  L15  | 
● L16  | | Case | Status | Body |
  L17  | | --- | --- | --- |
● L18  | | All fields valid | **201 Created** | `{"success": true}` |
● L19  | | One or more fields invalid | 400 Bad Request | JSON array of error strings (one per violated rule) |
● L20  | | Body is not valid JSON | 400 Bad Request | any JSON error body — never 5xx |
  L21  | 
  L22  | ## GET /api/message — list enquiries (staff token required)
  L23  | 
● L24  | | Case | Status | Body |
  L25  | | --- | --- | --- |
● L26  | | Valid token | 200 | `{"messages": [{"id": int, "name": string, "subject": string, "read": boolean}]}` |
● L27  | | No / invalid token | **401 Unauthorized** | no message data |
  L28  | 
  L29  | ## GET /api/message/{id} — enquiry detail (staff token required)
  L30  | 
● L31  | | Case | Status | Body |
  L32  | | --- | --- | --- |
● L33  | | Valid token, existing id | 200 | `{"messageid", "name", "email", "phone", "subject", "description"}` |
● L34  | | No / invalid token | **401 Unauthorized** | no message data |
  L35  | 
  L36  | ## POST /api/auth/login — staff login (public)
  L37  | 
● L38  | Request `{"username": "string", "password": "string"}`.
  L39  | 
● L40  | | Case | Status | Body |
  L41  | | --- | --- | --- |
● L42  | | Valid credentials | 200 | `{"token": "<non-empty string>"}` |
● L43  | | Invalid credentials | 401 | `{"error": "Invalid credentials"}` |
  L44  | 
  L45  | ## GET /api/room — list rooms (public)
  L46  | 
● L47  | 200 → `{"rooms": [Room, …]}`
  L48  | 
  L49  | ## GET /api/room/{id} — room detail (public)
  L50  | 
● L51  | | Case | Status | Body |
  L52  | | --- | --- | --- |
● L53  | | Existing id | 200 | Room |
● L54  | | Unknown id | **404 Not Found** | error body |
  L55  | 
  L56  | ### Room schema
  L57  | 
● L58  | | Field | Type | Rule |
  L59  | | --- | --- | --- |
● L60  | | roomid | integer | unique |
● L61  | | roomName | string | non-empty |
● L62  | | type | string | one of Single, Twin, Double, Family, Suite |
● L63  | | accessible | boolean | |
● L64  | | roomPrice | integer | > 0, price per night in GBP |
● L65  | | features | array of string | may be empty |
● L66  | | image | string | image URL or path |
● L67  | | description | string | |
  L68  | 
  L69  | ## Idempotency (v1.5)
  L70  | 
● L71  | - `POST /api/message` accepts an optional `Idempotency-Key: <client-generated unique string>` header.
● L72  | - A repeat of the same request with the same key within 24 hours must not create a second enquiry. It answers 2xx, like the first call.
● L73  | - `GET` endpoints are safe and idempotent: repeating `GET /api/room/{id}` returns an identical body (no side effects).
  L74  | 
  L75  | ## Performance
  L76  | 
● L77  | `GET /api/room`: under 3000 ms per request (5 consecutive requests).
  L78  | 
```

## attachments/field-rules.csv

```text
● L1   | field,required,min_length,max_length,format,length_error_message
● L2   | Name,yes,2,50,any printable characters,Name must be between 2 and 50 characters.
● L3   | Email,yes,,,"local@domain.tld — must contain a domain AND a top-level domain (e.g. guest@example.com; guest@example is invalid)",
● L4   | Phone,yes,11,21,"digits, spaces and a leading +",Phone must be between 11 and 21 characters.
● L5   | Subject,yes,5,100,any printable characters,Subject must be between 5 and 100 characters.
● L6   | Message,yes,20,2000,any printable characters,Message must be between 20 and 2000 characters.
  L7   | 
```

## attachments/test-accounts.csv

```text
● L1   | role,username,password,notes
● L2   | staff,admin,password,Public demo staff account of the test environment (documented on the site)
  L3   | 
```

## attachments/ux-copy.md

```text
  L1   | # UX copy — Guest enquiries (approved by Content, v2)
  L2   | 
  L3   | ## Contact form
  L4   | 
● L5   | - Section heading: **Send Us a Message**
● L6   | - Field labels: **Name**, **Email**, **Phone**, **Subject**, **Message** (visible and programmatically associated)
● L7   | - Button: **Submit**
  L8   | 
  L9   | ## Confirmation (replaces the form after a successful submit)
  L10  | 
● L11  | - Heading: `Thanks for getting in touch <Name>!`  (the guest's name as typed, no comma)
● L12  | - Body: `We'll get back to you about` / `<Subject>` / `as soon as possible.` (may be shown on separate lines)
  L13  | 
  L14  | ## Rooms list ("Our Rooms")
  L15  | 
● L16  | - Each card shows the room **type** as its heading and the price as `£<roomPrice> per night`.
● L17  | - Card image alternative text: `<Type> Room` — e.g. `Single Room`, `Double Room`, `Suite Room`.
  L18  | 
```
