# Requirement contract — CL-3: Edit and delete a contact

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, and every expected value is grounded in the sources; an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-28T19:10

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | user story, UI navigation (L19), AC-1..AC-11 (L25-L35), test data (L39) |
| attachments/contacts-update-contract.md | Bearer auth and base URL (L3), contact resource (L8-L23), PUT/PATCH/DELETE/GET /contacts/{id} status tables and error cases (L26-L63) |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | "Edit Contact" on the Contact Details page opens the Edit Contact page with every field pre-filled with the contact's current values. | pressing "Edit Contact" on the Contact Details page opens the Edit Contact page; every field on the Edit Contact page is pre-filled with the contact's current value | story.md#L25 |
| AC-2 | ui | Changing a value (for example the city) and pressing Submit saves the change and returns the user to the Contact Details page, which shows the new value. | after changing a value (for example the city) and pressing Submit, the user is back on the Contact Details page; the Contact Details page shows the new value; the change is saved (still shown when the contact is opened again) | story.md#L26 |
| AC-3 | e2e | After an edit in the web app, GET /contacts/{id} returns the new value. Emptying an optional field in the edit form (for example the phone) removes that value: the Contact Details page shows it empty and the API returns null for it. | after an edit in the web app, GET /contacts/{id} returns the new value; after emptying an optional field (for example the phone) in the edit form, the Contact Details page shows that field empty; after emptying an optional field (for example the phone) in the edit form, GET /contacts/{id} returns null for it | story.md#L27 |
| AC-4 | ui | Submitting the edit form with an invalid e-mail address (for example not-an-email) keeps the user on the Edit Contact page with a message containing "Email is invalid", and the stored contact is not changed. | submitting the edit form with an invalid e-mail address (for example not-an-email) keeps the user on the Edit Contact page; a message containing "Email is invalid" is shown; the stored contact is not changed | story.md#L28 |
| AC-5 | api | PUT /contacts/{id} replaces the contact as described in the contract: 200 with the full updated contact; optional fields that are not in the body are cleared (null). | PUT /contacts/{id} with a complete contact answers 200; the response body is the full updated contact; optional fields that are not in the body are cleared (null) | story.md#L29 |
| AC-6 | api | PATCH /contacts/{id} changes only the fields in the body: 200 with the updated contact, and all other fields keep their previous values. | PATCH /contacts/{id} answers 200 with the updated contact; the fields in the body have their new values; all other fields keep their previous values | story.md#L30 |
| AC-7 | api | A PUT or PATCH that would leave the contact without a first name or last name (field missing from a PUT body, or sent as an empty string) is rejected with 400 and the stored contact stays exactly as it was. | PUT with firstName missing from the body → 400; PUT with lastName missing from the body → 400; PUT or PATCH with firstName sent as an empty string → 400; PUT or PATCH with lastName sent as an empty string → 400; after each rejected request the stored contact stays exactly as it was | story.md#L31 |
| AC-8 | ui | "Delete Contact" asks "Are you sure you want to delete this contact?". Cancelling keeps the contact and the user stays on the Contact Details page; confirming deletes it and returns the user to the Contact List page, where the contact is no longer listed. | pressing "Delete Contact" asks "Are you sure you want to delete this contact?"; cancelling keeps the contact and the user stays on the Contact Details page; confirming deletes the contact and returns the user to the Contact List page; the deleted contact is no longer listed on the Contact List page | story.md#L32 |
| AC-9 | api | DELETE /contacts/{id} answers 200 with the body Contact deleted. | DELETE /contacts/{id} answers 200; body "Contact deleted" | story.md#L33 |
| AC-10 | api | A deleted contact is gone for good: GET /contacts/{id} answers 404, it is not part of GET /contacts, and a second DELETE, a PUT or a PATCH on it also answer 404. | after the contact is deleted, GET /contacts/{id} answers 404; the deleted contact is not part of GET /contacts; a second DELETE on it answers 404; a PUT on it answers 404; a PATCH on it answers 404 | story.md#L34 |
| AC-11 | api | A malformed contact id (for example abc) on GET, PUT, PATCH or DELETE /contacts/{id} is answered with 400 and the body Invalid Contact ID. | GET with a malformed id (for example abc) → 400 and body "Invalid Contact ID"; PUT with a malformed id (for example abc) → 400 and body "Invalid Contact ID"; PATCH with a malformed id (for example abc) → 400 and body "Invalid Contact ID"; DELETE with a malformed id (for example abc) → 400 and body "Invalid Contact ID" | story.md#L35 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /contacts/{id} | required | 200 with the contact | attachments/contacts-update-contract.md#L61 |
| PUT /contacts/{id} | required | 200 the full updated contact | attachments/contacts-update-contract.md#L28 |
| PATCH /contacts/{id} | required | 200 the updated contact | attachments/contacts-update-contract.md#L40 |
| DELETE /contacts/{id} | required | 200 text Contact deleted | attachments/contacts-update-contract.md#L52 |
| GET /contacts |  |  | story.md#L34 |
| POST /contacts |  |  | story.md#L39 |
| DELETE /users/me |  |  | story.md#L39 |

## Rules and boundaries

- **R1** A contact has the fields _id, firstName, lastName, birthdate, email, phone, street1, street2, city, stateProvince, postalCode, country, owner (the _id of the user the contact belongs to) and __v; {id} in the paths is the contact's _id. _(attachments/contacts-update-contract.md#L8-L23, attachments/contacts-update-contract.md#L3)_
- **R2** An optional field without a value is either absent or null. _(attachments/contacts-update-contract.md#L26)_
- **R3** PUT /contacts/{id} takes a complete contact; firstName and lastName are required; any optional field that is not in the body is cleared (set to null). _(attachments/contacts-update-contract.md#L30, story.md#L29, story.md#L31)_
- **R4** PATCH /contacts/{id} takes only the fields to change; fields not in the body keep their values. _(attachments/contacts-update-contract.md#L42, story.md#L30)_
- **R5** In the web app a contact is opened by clicking its row on the Contact List page; the Contact Details page has the buttons Edit Contact, Delete Contact and Return to Contact List; the Edit Contact page shows the same fields as the Add Contact page, with Submit and Cancel buttons. _(story.md#L19)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | Validation error on PUT (for example missing first or last name, invalid e-mail) or PATCH (for example empty first or last name, invalid e-mail) | 400 | JSON, `message` describes the failed rule(s) | attachments/contacts-update-contract.md#L35, attachments/contacts-update-contract.md#L47 |
| E2 | Malformed id on GET, PUT, PATCH or DELETE /contacts/{id} | 400 | text `Invalid Contact ID` | attachments/contacts-update-contract.md#L36, attachments/contacts-update-contract.md#L48, attachments/contacts-update-contract.md#L57, attachments/contacts-update-contract.md#L63 |
| E3 | No contact with this id for the signed-in user on GET, PUT, PATCH or DELETE /contacts/{id} (for DELETE, including one that was already deleted) | 404 | empty | attachments/contacts-update-contract.md#L37, attachments/contacts-update-contract.md#L49, attachments/contacts-update-contract.md#L58, attachments/contacts-update-contract.md#L63 |
| E4 | Missing or invalid token on PUT, PATCH or DELETE /contacts/{id} | 401 | {"error": "Please authenticate."} | attachments/contacts-update-contract.md#L38, attachments/contacts-update-contract.md#L50, attachments/contacts-update-contract.md#L59 |

## Authentication

Authorization: Bearer <token> on every endpoint of the contract attachment — credentials: token from POST /users or POST /users/login; the test user is created through sign-up with a unique e-mail address and the password from the environment variable CL_USER_PASSWORD _(attachments/contacts-update-contract.md#L3, story.md#L39)_

## Test data

Tests create their own user through sign-up with a unique e-mail address and the password from the environment variable CL_USER_PASSWORD, and create the contacts they need with POST /contacts or the Add Contact page.
- Cleanup: Remove the user afterwards with DELETE /users/me where possible.

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | Contact List page: route, how a contact's row is found and clicked, and how to tell a contact is no longer listed | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-8 | story → aut | discovered-in-aut: /contactList; a contact's row is the table row with its first and last name; clicking it opens /contactDetails; a deleted contact has no row |
| G2 | Contact Details page: route, how the field values are read, the Edit Contact and Delete Contact buttons, and how the delete confirmation is shown and answered (browser dialog or in-page) | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-8 | story → aut | discovered-in-aut: /contactDetails; values in elements with the field ids; buttons by name; loads the contact after it opens; Delete asks with a native confirm() |
| G3 | Edit Contact page: route, field labels/locators, Submit button, and where the validation message appears | mechanics | yes | AC-1, AC-2, AC-3, AC-4 | story → aut | discovered-in-aut: /editContact; inputs with the field ids, pre-filled after load; Submit; message in #error |
| G4 | Creating and removing test data: POST /contacts request body, success status and auth header (or the Add Contact page's route and fields); auth for DELETE /users/me | mechanics | yes | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10 | story → attachments → aut | discovered-in-aut: POST /contacts with the contact fields and Authorization: Bearer <token> → 201 with _id; DELETE /users/me with the Bearer token (the accounts recipe's delete) |
| G5 | GET /contacts: auth header and where the contacts are in the response | mechanics | yes | AC-10 | story → attachments → aut | discovered-in-aut: GET /contacts with Authorization: Bearer <token> → array of contacts with _id |
| G6 | An emptied optional field: AC-3 says the API returns null for it; the contract attachment says an optional field without a value is either absent or null. Must the field be null, or is absent also acceptable? | oracle | no | AC-3 | story → attachments | open |
| G7 | No acceptance criterion covers the Return to Contact List button on the Contact Details page or the Cancel button on the Edit Contact page; are they in scope, and what must they do? | oracle | no |  | story | open |
| G8 | No acceptance criterion covers these stated error cases: 401 {"error": "Please authenticate."} for a missing or invalid token, 404 for a contact that belongs to another user, and 400 with a JSON message for an invalid e-mail on PUT or PATCH; are they in scope? | oracle | no |  | attachments → story | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context |  |
| story.md#L19 | R5, G1, G2, G3, G7, context |  |
| story.md#L25 | AC-1 |  |
| story.md#L26 | AC-2 |  |
| story.md#L27 | AC-3, G6 |  |
| story.md#L28 | AC-4 |  |
| story.md#L29 | AC-5, R3 |  |
| story.md#L30 | AC-6, R4 |  |
| story.md#L31 | AC-7, R3 |  |
| story.md#L32 | AC-8 |  |
| story.md#L33 | AC-9 |  |
| story.md#L34 | AC-10, endpoint |  |
| story.md#L35 | AC-11 |  |
| story.md#L39 | test-data, endpoint, auth, G4 |  |
| attachments/contacts-update-contract.md#L3 | auth, endpoint, R1 |  |
| attachments/contacts-update-contract.md#L8-L23 | R1, endpoint |  |
| attachments/contacts-update-contract.md#L26 | R2, G6 |  |
| attachments/contacts-update-contract.md#L30 | R3, AC-5, AC-7, endpoint |  |
| attachments/contacts-update-contract.md#L34 | AC-5, endpoint |  |
| attachments/contacts-update-contract.md#L35 | E1, AC-7, G8 |  |
| attachments/contacts-update-contract.md#L36 | E2, AC-11 |  |
| attachments/contacts-update-contract.md#L37 | E3, AC-10, G8 |  |
| attachments/contacts-update-contract.md#L38 | E4, G8 |  |
| attachments/contacts-update-contract.md#L42 | R4, AC-6, endpoint |  |
| attachments/contacts-update-contract.md#L46 | AC-6, endpoint |  |
| attachments/contacts-update-contract.md#L47 | E1, AC-7, G8 |  |
| attachments/contacts-update-contract.md#L48 | E2, AC-11 |  |
| attachments/contacts-update-contract.md#L49 | E3, AC-10, G8 |  |
| attachments/contacts-update-contract.md#L50 | E4, G8 |  |
| attachments/contacts-update-contract.md#L56 | AC-9, endpoint |  |
| attachments/contacts-update-contract.md#L57 | E2, AC-11 |  |
| attachments/contacts-update-contract.md#L58 | E3, AC-10 |  |
| attachments/contacts-update-contract.md#L59 | E4, G8 |  |
| attachments/contacts-update-contract.md#L63 | endpoint, E2, E3, AC-10, AC-11 |  |
