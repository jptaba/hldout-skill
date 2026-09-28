# Requirement review — CL-3

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | user story, UI navigation (L19), AC-1..AC-11 (L25-L35), test data (L39) |
| attachments/contacts-update-contract.md | Bearer auth and base URL (L3), contact resource (L8-L23), PUT/PATCH/DELETE/GET /contacts/{id} status tables and error cases (L26-L63) |

## Testability decisions

_How each criterion is verified (write the decision after the arrow)._

- **AC-1** (ui) "Edit Contact" on the Contact Details page opens the Edit Contact page with every field pre-filled with the contact's current values. →
- **AC-2** (ui) Changing a value (for example the city) and pressing Submit saves the change and returns the user to the Contact Details page, which show… →
- **AC-3** (e2e) After an edit in the web app, GET /contacts/{id} returns the new value. Emptying an optional field in the edit form (for example the phon… →
- **AC-4** (ui) Submitting the edit form with an invalid e-mail address (for example not-an-email) keeps the user on the Edit Contact page with a message… →
- **AC-5** (api) PUT /contacts/{id} replaces the contact as described in the contract: 200 with the full updated contact; optional fields that are not in … →
- **AC-6** (api) PATCH /contacts/{id} changes only the fields in the body: 200 with the updated contact, and all other fields keep their previous values. →
- **AC-7** (api) A PUT or PATCH that would leave the contact without a first name or last name (field missing from a PUT body, or sent as an empty string)… →
- **AC-8** (ui) "Delete Contact" asks "Are you sure you want to delete this contact?". Cancelling keeps the contact and the user stays on the Contact Det… →
- **AC-9** (api) DELETE /contacts/{id} answers 200 with the body Contact deleted. →
- **AC-10** (api) A deleted contact is gone for good: GET /contacts/{id} answers 404, it is not part of GET /contacts, and a second DELETE, a PUT or a PATC… →
- **AC-11** (api) A malformed contact id (for example abc) on GET, PUT, PATCH or DELETE /contacts/{id} is answered with 400 and the body Invalid Contact ID. →

## Ambiguities / open questions

- G1 (mechanics, required): Contact List page: route, how a contact's row is found and clicked, and how to tell a contact is no longer listed — open
- G2 (mechanics, required): Contact Details page: route, how the field values are read, the Edit Contact and Delete Contact buttons, and how the delete confirmation is shown and answered (browser dialog or in-page) — open
- G3 (mechanics, required): Edit Contact page: route, field labels/locators, Submit button, and where the validation message appears — open
- G4 (mechanics, required): Creating and removing test data: POST /contacts request body, success status and auth header (or the Add Contact page's route and fields); auth for DELETE /users/me — open
- G5 (mechanics, required): GET /contacts: auth header and where the contacts are in the response — open
- G6 (oracle): An emptied optional field: AC-3 says the API returns null for it; the contract attachment says an optional field without a value is either absent or null. Must the field be null, or is absent also acceptable? — open
- G7 (oracle): No acceptance criterion covers the Return to Contact List button on the Contact Details page or the Cancel button on the Edit Contact page; are they in scope, and what must they do? — open
- G8 (oracle): No acceptance criterion covers these stated error cases: 401 {"error": "Please authenticate."} for a missing or invalid token, 404 for a contact that belongs to another user, and 400 with a JSON message for an invalid e-mail on PUT or PATCH; are they in scope? — open
