# Requirement contract — DEMO-202: Guest enquiries — contact form, rooms catalogue and messages API

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ⚠️ not reviewed

## Sources read

| Source | Contributes |
| --- | --- |
| story.md |  |
| attachments/api-contract.md |  |
| attachments/field-rules.csv |  |
| attachments/test-accounts.csv |  |
| attachments/ux-copy.md |  |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | The home page contains a "Send Us a Message" form with the fields Name, Email, Phone, Subject and Message and a "Submit" button. Every field has a programmatically associated label that screen readers announce (WCAG 2.2 SC 1.3.1 / 4.1.2). | the home page shows a section with the heading "Send Us a Message" (ux-copy.md#L5); the form has the fields Name, Email, Phone, Subject and Message; the form has a "Submit" button; each of Name, Email, Phone, Subject and Message is reachable by its accessible name (a programmatically associated label), e.g. getByLabel("Name"); the labels are also visible (ux-copy.md#L6: "visible and programmatically associated") | story.md#L37 |
| AC-2 | ui | Submitting a valid form replaces it with the heading "Thanks for getting in touch <Name>!" followed by "We'll get back to you about <Subject> as soon as possible." (exact copy in ux-copy.md). | after submitting a valid form the form is no longer shown; a heading "Thanks for getting in touch <Name>!" is shown, with the guest's name as typed and no comma (ux-copy.md#L11); the text "We'll get back to you about" / "<Subject>" / "as soon as possible." follows, possibly on separate lines (ux-copy.md#L12) | story.md#L38 |
| AC-3 | e2e | Submitting the form with every field empty keeps the form on screen and shows validation errors that mention every one of the five fields. Nothing is sent to staff. | after submitting with every field empty the form is still on screen (no confirmation); validation errors are shown that mention each of Name, Email, Phone, Subject and Message; the authenticated staff list GET /api/message gains no new enquiry | story.md#L39 |
| AC-4 | e2e | Field rules and boundaries are defined in the attached field-rules.csv. The UI and the API enforce the same rules. A value exactly on a boundary is valid; one character outside it is invalid. | Name of 2 and of 50 characters is valid; 1 and 51 characters are invalid (R1); Email guest@example.com is valid; guest@example (no top-level domain) is invalid (R2); Phone of 11 and of 21 characters (digits, spaces and a leading +) is valid; 10 and 22 characters are invalid (R3); Subject of 5 and of 100 characters is valid; 4 and 101 characters are invalid (R4); Message of 20 and of 2000 characters is valid; 19 and 2001 characters are invalid (R5); each field is required: an empty value is invalid (R6); API: a valid value is accepted with 201, an invalid value is rejected with 400 (AC-5, AC-6); UI: the same values give the same valid/invalid result as the API (see G3 for how invalid shows in the UI) | story.md#L40 |
| AC-5 | api | POST /api/message with a body that satisfies every field rule creates the enquiry. The response is 201 Created with the JSON body {"success": true}. | 201; body {"success": true}; the enquiry is created: it appears in the authenticated GET /api/message list with the same name and subject | story.md#L44 |
| AC-6 | api | POST /api/message with one or more invalid fields responds 400 Bad Request. The body is a JSON array of human-readable error strings containing, for each violated length rule, the exact message from field-rules.csv. The enquiry is not stored. | 400; body is a JSON array of strings; Name length violated → array contains "Name must be between 2 and 50 characters."; Phone length violated → array contains "Phone must be between 11 and 21 characters."; Subject length violated → array contains "Subject must be between 5 and 100 characters."; Message (description) length violated → array contains "Message must be between 20 and 2000 characters."; several length rules violated at once → the array contains the message for each of them; the enquiry is not stored: it does not appear in the authenticated GET /api/message list | story.md#L45 |
| AC-7 | api | A request body that is not valid JSON is a client error. POST /api/message responds 400 Bad Request, never a 5xx. | malformed JSON body → 400; never a 5xx; the error body is JSON (api-contract.md#L20: "any JSON error body") | story.md#L46 |
| AC-8 | api | GET /api/message (list) and GET /api/message/{id} (detail) contain guests' personal data and require a valid staff token. Without a token they respond 401 Unauthorized and return no message data. With a valid token (cookie token, obtained from POST /api/auth/login) the list responds 200 with {"messages": [{"id", "name", "subject", "read"}]}. | GET /api/message without a token → 401 and no message data; GET /api/message/{id} without a token → 401 and no message data; with an invalid token both respond 401 with no message data (api-contract.md#L27, #L34); GET /api/message with a valid token (cookie token) → 200 with {"messages": [...]}, each item having id (int), name (string), subject (string), read (boolean) (api-contract.md#L26); GET /api/message/{id} with a valid token and an existing id → 200 with messageid, name, email, phone, subject, description (api-contract.md#L33) | story.md#L47 |
| AC-9 | api | POST /api/auth/login with valid staff credentials responds 200 with {"token": "<non-empty string>"}. Invalid credentials respond 401 with {"error": "Invalid credentials"}. | valid staff credentials (test-accounts.csv) → 200 with a non-empty string token; invalid credentials → 401; body {"error": "Invalid credentials"} | story.md#L48 |
| AC-10 | e2e | An enquiry submitted through the UI form can be read by staff: it appears in the authenticated GET /api/message list with the same name and subject. | after a valid UI submission, the authenticated GET /api/message list contains an item with the same name and subject as typed | story.md#L49 |
| AC-11 | api | GET /api/room responds 200 with {"rooms": [...]}. Every room follows the Room schema in api-contract.md: roomid integer, roomName string, type one of Single, Twin, Double, Family, Suite, accessible boolean, roomPrice integer greater than 0, features array of strings, image string, description string. | 200 with {"rooms": [...]}; every room: roomid integer, unique across rooms (api-contract.md#L60); every room: roomName non-empty string (api-contract.md#L61); every room: type one of Single, Twin, Double, Family, Suite; every room: accessible boolean; every room: roomPrice integer greater than 0; every room: features array of strings (may be empty); every room: image string; every room: description string | story.md#L53 |
| AC-12 | api | GET /api/room/{id} responds 200 with a single Room for an existing id, and 404 Not Found for an id that does not exist. | existing id (taken from GET /api/room) → 200 with a single Room following the Room schema; id that does not exist → 404 | story.md#L54 |
| AC-13 | e2e | Every room returned by GET /api/room is shown in "Our Rooms" with its type and its price formatted as "£<roomPrice> per night". | for every room returned by GET /api/room, the "Our Rooms" section has a card; the card shows the room's type as its heading (ux-copy.md#L16); the card shows the price as "£<roomPrice> per night" | story.md#L55 |
| AC-14 | e2e | Each room card image has alternative text that names that room's type, e.g. "Double Room" (WCAG 2.2 SC 1.1.1). | each room card image has alt text "<Type> Room" for that room's own type, e.g. "Single Room", "Double Room", "Suite Room" (ux-copy.md#L17) | story.md#L56 |
| AC-15 | api | NFR-1 (AC-15): GET /api/room responds in under 3000 ms for each of 5 consecutive requests from the test environment. | each of 5 consecutive GET /api/room requests responds in under 3000 ms | story.md#L64 |
| AC-16 | api | Retries are safe. (a) Repeating POST /api/message with the same Idempotency-Key request header, for example after a network retry or a double-click, stores the enquiry only once: every repeat answers 2xx and no duplicate appears in the staff list. (b) GET endpoints are idempotent: repeating GET /api/room/{id} returns an identical body. | (a) the first POST /api/message with an Idempotency-Key answers 2xx; (a) every repeat of the same request with the same Idempotency-Key (within 24 hours) answers 2xx; (a) the authenticated staff list GET /api/message contains that enquiry only once; (b) repeating GET /api/room/{id} for an existing id returns an identical body | story.md#L60 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| POST /api/message | none |  | story.md#L72 |
| GET /api/message | staff token (cookie token=<value>) |  | story.md#L73 |
| GET /api/message/{id} | staff token (cookie token=<value>) |  | story.md#L74 |
| POST /api/auth/login | none |  | story.md#L75 |
| GET /api/room | none |  | story.md#L76 |
| GET /api/room/{id} | none |  | story.md#L77 |

## Rules and boundaries

- **R1** Name: required, 2 to 50 characters, any printable characters; length error message "Name must be between 2 and 50 characters." _(attachments/field-rules.csv#L2)_
- **R2** Email: required, format local@domain.tld — must contain a domain AND a top-level domain (e.g. guest@example.com; guest@example is invalid); no length rule and no length error message _(attachments/field-rules.csv#L3)_
- **R3** Phone: required, 11 to 21 characters, digits, spaces and a leading +; length error message "Phone must be between 11 and 21 characters." _(attachments/field-rules.csv#L4)_
- **R4** Subject: required, 5 to 100 characters, any printable characters; length error message "Subject must be between 5 and 100 characters." _(attachments/field-rules.csv#L5)_
- **R5** Message (API field description): required, 20 to 2000 characters, any printable characters; length error message "Message must be between 20 and 2000 characters." _(attachments/field-rules.csv#L6)_
- **R6** All five fields (Name, Email, Phone, Subject, Message) are required (field-rules.csv column "required" = yes) _(attachments/field-rules.csv#L1)_
- **R7** A repeat of the same POST /api/message with the same Idempotency-Key within 24 hours must not create a second enquiry and answers 2xx, like the first call _(attachments/api-contract.md#L72)_
- **R8** All bodies are JSON (Content-Type: application/json) _(attachments/api-contract.md#L3)_
- **R9** Test enquiries must use a recognisable name or subject (e.g. prefixed "QA") so staff can ignore them _(story.md#L81)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | undefined | 400 | JSON array of error strings (one per violated rule) | attachments/api-contract.md#L19 |
| E2 | undefined | 400 | any JSON error body — never 5xx | attachments/api-contract.md#L20 |
| E3 | undefined | 401 | no message data | attachments/api-contract.md#L27 |
| E4 | undefined | 401 | Invalid credentials | attachments/api-contract.md#L43 |
| E5 | undefined | 404 | error body | attachments/api-contract.md#L54 |

## Test data

Enquiries are created through POST /api/message (or the UI form) with a recognisable "QA"-prefixed, run-unique name/subject (story.md#L81); staff login uses the staff account in test-accounts.csv (admin); rooms are read from GET /api/room (no room creation needed; room booking and admin UI are out of scope). A non-existent room id is chosen as one not present in the GET /api/room list.

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | whether leading and trailing whitespace is trimmed before length validation (e.g. a Subject of "   abc   ") | oracle | no | AC-4 | story → attachments → user | open |
| G2 | exact text of validation errors that are not length errors (empty/required fields, invalid email format, invalid phone characters), and what "mention" a field means in AC-3 | oracle | no | AC-3, AC-6 | story → attachments → user | assumed: An error "mentions" a field if its text contains the field's name (Name, Email, Phone, Subject, Message; case-insensitive). No exact text is asserted for non-length errors; only the length messages from field-rules.csv are asserted verbatim. |
| G3 | how an invalid (one character outside a boundary) or valid (on a boundary) value is observable in the UI for AC-4 | oracle | yes | AC-4 | story → attachments → user | assumed: UI valid: a form whose values are all valid (including values exactly on a boundary) is replaced by the AC-2 confirmation. UI invalid: a form with one value one character outside a boundary is not replaced by the confirmation, stays on screen and shows a validation error, as AC-3 describes for empty fields. The exact UI error text is not asserted. |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19 | context | business context; no testable constraint beyond the ACs |
| story.md#L23-L25 | context | user stories; realised by AC-1..AC-16 |
| story.md#L29 | context | in-scope areas: "Send Us a Message" (AC-1), "Our Rooms" (AC-13), API endpoints (endpoint table) |
| story.md#L31 | out-of-scope | booking, admin UI, e-mail notifications, payment, CAPTCHA/rate limiting (DEMO-230) |
| story.md#L37 | AC-1 |  |
| story.md#L38 | AC-2 |  |
| story.md#L39 | AC-3 |  |
| story.md#L40 | AC-4 |  |
| story.md#L44 | AC-5 |  |
| story.md#L45 | AC-6 |  |
| story.md#L46 | AC-7 |  |
| story.md#L47 | AC-8 |  |
| story.md#L48 | AC-9 |  |
| story.md#L49 | AC-10 |  |
| story.md#L53 | AC-11 |  |
| story.md#L54 | AC-12 |  |
| story.md#L55 | AC-13 |  |
| story.md#L56 | AC-14 |  |
| story.md#L60 | AC-16 |  |
| story.md#L64 | AC-15 |  |
| story.md#L68 | context | points to api-contract.md, which is covered line by line |
| story.md#L70-L77 | endpoint |  |
| story.md#L81 | test-data | staff credentials in test-accounts.csv; test enquiries prefixed "QA" (R9) |
| story.md#L85 | G1 |  |
| story.md#L89 | context | revision history: AC-16 added in rev 2; Idempotency-Key documented in api-contract.md v1.5 (L71-L73) |
| story.md#L93 | not-a-requirement | definition of done describes the evaluation process itself, not application behaviour |
| attachments/api-contract.md#L3 | R8 |  |
| attachments/api-contract.md#L4 | auth | token from POST /api/auth/login sent as cookie token=<value> (AC-8) |
| attachments/api-contract.md#L8-L12 | endpoint | POST /api/message request fields |
| attachments/api-contract.md#L14 | endpoint | description is the Message field; rules in field-rules.csv |
| attachments/api-contract.md#L16-L18 | AC-5 |  |
| attachments/api-contract.md#L19 | AC-6 |  |
| attachments/api-contract.md#L20 | AC-7 |  |
| attachments/api-contract.md#L24-L27 | AC-8 |  |
| attachments/api-contract.md#L31-L34 | AC-8 |  |
| attachments/api-contract.md#L38 | endpoint | POST /api/auth/login request fields |
| attachments/api-contract.md#L40-L43 | AC-9 |  |
| attachments/api-contract.md#L47 | AC-11 |  |
| attachments/api-contract.md#L51-L54 | AC-12 |  |
| attachments/api-contract.md#L58-L67 | AC-11 |  |
| attachments/api-contract.md#L71 | AC-16 |  |
| attachments/api-contract.md#L72 | R7 |  |
| attachments/api-contract.md#L73 | AC-16 |  |
| attachments/api-contract.md#L77 | AC-15 |  |
| attachments/field-rules.csv#L1 | R6 |  |
| attachments/field-rules.csv#L2 | R1 |  |
| attachments/field-rules.csv#L3 | R2 |  |
| attachments/field-rules.csv#L4 | R3 |  |
| attachments/field-rules.csv#L5 | R4 |  |
| attachments/field-rules.csv#L6 | R5 |  |
| attachments/test-accounts.csv#L1-L2 | test-data | staff account for login (AC-8, AC-9 and staff-list checks) |
| attachments/ux-copy.md#L5-L7 | AC-1 |  |
| attachments/ux-copy.md#L11-L12 | AC-2 |  |
| attachments/ux-copy.md#L16 | AC-13 |  |
| attachments/ux-copy.md#L17 | AC-14 |  |
