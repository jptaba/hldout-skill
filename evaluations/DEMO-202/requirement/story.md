---
key: DEMO-202
summary: "Guest enquiries — contact form, rooms catalogue and messages API"
type: Story
status: Ready for QA
priority: High
labels: [guest-enquiries, api, ui]
source: mock-jira
url: https://your-domain.atlassian.net/browse/DEMO-202
fetchedAt: 2026-09-26T15:41:18.206Z
---

# DEMO-202: Guest enquiries — contact form, rooms catalogue and messages API

## Description

## Business context

Guests of the B&B currently phone or e-mail with questions, and enquiries get lost. This story delivers a self-service **contact form** on the public home page, backed by a **Messages API**. Staff read enquiries through an authenticated admin API. The public **rooms catalogue** (UI and API) must stay consistent, because guests often ask about a room they have just looked at.

## User stories

- As a **guest**, I want to send the B&B a message from the home page, so that I can ask about my stay without phoning.
- As a **guest**, I want to see which rooms exist and what they cost per night, so that I can ask about a specific room.
- As a **staff member**, I want to read guest enquiries through an authenticated API, so that no personal data is exposed publicly.

## Scope

**In scope:** the contact form (home page, section "Send Us a Message"), the rooms list on the home page ("Our Rooms"), and the endpoints listed under API contract.

**Out of scope:** room booking/reservation, the admin UI screens, e-mail notifications, payment, and CAPTCHA/rate limiting (tracked in DEMO-230).

## Acceptance criteria

### Contact form (UI)

- **AC-1**: The home page contains a "Send Us a Message" form with the fields Name, Email, Phone, Subject and Message and a "Submit" button. **Every field has a programmatically associated label** that screen readers announce (WCAG 2.2 SC 1.3.1 / 4.1.2).
- **AC-2**: Submitting a valid form replaces it with the heading "Thanks for getting in touch <Name>!" followed by "We'll get back to you about <Subject> as soon as possible." (exact copy in `ux-copy.md`).
- **AC-3**: Submitting the form with every field empty keeps the form on screen and shows validation errors that mention every one of the five fields. Nothing is sent to staff.
- **AC-4**: Field rules and boundaries are defined in the attached `field-rules.csv`. The UI and the API enforce the same rules. A value exactly on a boundary is valid; one character outside it is invalid.

### Messages API

- **AC-5**: `POST /api/message` with a body that satisfies every field rule creates the enquiry. The response is **201 Created** with the JSON body `{"success": true}`.
- **AC-6**: `POST /api/message` with one or more invalid fields responds **400 Bad Request**. The body is a JSON array of human-readable error strings containing, for each violated length rule, the exact message from `field-rules.csv`. The enquiry is not stored.
- **AC-7**: A request body that is not valid JSON is a client error. `POST /api/message` responds **400 Bad Request**, never a 5xx.
- **AC-8**: `GET /api/message` (list) and `GET /api/message/{id}` (detail) contain guests' personal data and **require a valid staff token**. Without a token they respond **401 Unauthorized** and return no message data. With a valid token (cookie `token`, obtained from `POST /api/auth/login`) the list responds 200 with `{"messages": [{"id", "name", "subject", "read"}]}`.
- **AC-9**: `POST /api/auth/login` with valid staff credentials responds 200 with `{"token": "<non-empty string>"}`. Invalid credentials respond **401** with `{"error": "Invalid credentials"}`.
- **AC-10**: An enquiry submitted through the UI form can be read by staff: it appears in the authenticated `GET /api/message` list with the same name and subject.

### Rooms catalogue

- **AC-11**: `GET /api/room` responds 200 with `{"rooms": [...]}`. Every room follows the Room schema in `api-contract.md`: `roomid` integer, `roomName` string, `type` one of Single, Twin, Double, Family, Suite, `accessible` boolean, `roomPrice` integer greater than 0, `features` array of strings, `image` string, `description` string.
- **AC-12**: `GET /api/room/{id}` responds 200 with a single Room for an existing id, and **404 Not Found** for an id that does not exist.
- **AC-13**: Every room returned by `GET /api/room` is shown in "Our Rooms" with its type and its price formatted as "£<roomPrice> per night".
- **AC-14**: Each room card image has alternative text that names **that room's type**, e.g. "Double Room" (WCAG 2.2 SC 1.1.1).

### Reliability (added in revision 2)

- **AC-16**: Retries are safe. (a) Repeating `POST /api/message` with the same `Idempotency-Key` request header, for example after a network retry or a double-click, stores the enquiry **only once**: every repeat answers 2xx and no duplicate appears in the staff list. (b) `GET` endpoints are idempotent: repeating `GET /api/room/{id}` returns an identical body.

### Non-functional

- **NFR-1 (AC-15)**: `GET /api/room` responds in under 3000 ms for each of 5 consecutive requests from the test environment.

## API contract

The full contract is in `api-contract.md`. Endpoints in scope:

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | /api/message | none | Create a guest enquiry |
| GET | /api/message | staff token | List enquiries |
| GET | /api/message/{id} | staff token | Enquiry detail |
| POST | /api/auth/login | none | Obtain a staff token |
| GET | /api/room | none | List rooms |
| GET | /api/room/{id} | none | Room detail |

## Test data

Staff credentials for the test environment are in the attached `test-accounts.csv`. Test enquiries must use a recognisable name or subject (e.g. prefixed "QA") so staff can ignore them.

## Open questions

- Should leading and trailing whitespace be trimmed before length validation (for example a Subject of "   abc   ")? **PO to confirm; do not test until answered.**

## Revision history

- **Rev 2 (2026-09-26)**: added AC-16 (safe retries / idempotency) after a support ticket about duplicate enquiries caused by double-clicks. `api-contract.md` v1.5 documents the `Idempotency-Key` header.

## Definition of done

Every acceptance criterion is verified by the held-out evaluation, with no open Critical or Major defects.

## Attachments

| File | MIME | Bytes | How to read | Local path |
| --- | --- | --- | --- | --- |
| field-rules.csv | text/csv | 553 | text — read directly | attachments/field-rules.csv |
| api-contract.md | text/markdown | 2732 | text — read directly | attachments/api-contract.md |
| ux-copy.md | text/markdown | 736 | text — read directly | attachments/ux-copy.md |
| test-accounts.csv | text/csv | 125 | text — read directly | attachments/test-accounts.csv |
