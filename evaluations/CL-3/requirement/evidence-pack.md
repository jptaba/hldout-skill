# Evidence pack — CL-3

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).

**Project configuration** (heldout.config.json: not requirement, nothing to cite or cover; a gap it answers is `found-in-config`):

- AUT profile `thinking-tester-contact-list` "Contact List App": web https://thinking-tester-contact-list.herokuapp.com/ (API on the same origin)


## story.md

```text
  L1   | ---
  L2   | key: CL-3
  L3   | summary: "Edit and delete a contact"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/CL-3
  L10  | fetchedAt: 2026-09-28T19:02:09.775Z
  L11  | ---
  L12  | 
  L13  | # CL-3: Edit and delete a contact
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | As a signed-in user I want to correct a contact's details or remove a contact I no longer need, in the web app and through the API.
  L18  | 
● L19  | In the web app the user opens a contact by clicking its row on the Contact List page; the **Contact Details** page has the buttons **Edit Contact**, **Delete Contact** and **Return to Contact List**. The Edit Contact page shows the same fields as the Add Contact page, with **Submit** and **Cancel** buttons. The API side is described in the attached `contacts-update-contract.md`.
  L20  | 
  L21  | ## Acceptance criteria
  L22  | 
  L23  | | ID | Criterion | Layer |
  L24  | | --- | --- | --- |
● L25  | | AC-1 | "Edit Contact" on the Contact Details page opens the Edit Contact page with every field pre-filled with the contact's current values. | UI |
● L26  | | AC-2 | Changing a value (for example the city) and pressing Submit saves the change and returns the user to the Contact Details page, which shows the new value. | UI |
● L27  | | AC-3 | After an edit in the web app, `GET /contacts/{id}` returns the new value. Emptying an optional field in the edit form (for example the phone) removes that value: the Contact Details page shows it empty and the API returns `null` for it. | End-to-end |
● L28  | | AC-4 | Submitting the edit form with an invalid e-mail address (for example `not-an-email`) keeps the user on the Edit Contact page with a message containing "Email is invalid", and the stored contact is not changed. | UI |
● L29  | | AC-5 | `PUT /contacts/{id}` replaces the contact as described in the contract: 200 with the full updated contact; optional fields that are not in the body are cleared (`null`). | API |
● L30  | | AC-6 | `PATCH /contacts/{id}` changes only the fields in the body: 200 with the updated contact, and all other fields keep their previous values. | API |
● L31  | | AC-7 | A `PUT` or `PATCH` that would leave the contact without a first name or last name (field missing from a PUT body, or sent as an empty string) is rejected with 400 and the stored contact stays exactly as it was. | API |
● L32  | | AC-8 | "Delete Contact" asks "Are you sure you want to delete this contact?". Cancelling keeps the contact and the user stays on the Contact Details page; confirming deletes it and returns the user to the Contact List page, where the contact is no longer listed. | UI |
● L33  | | AC-9 | `DELETE /contacts/{id}` answers 200 with the body `Contact deleted`. | API |
● L34  | | AC-10 | A deleted contact is gone for good: `GET /contacts/{id}` answers 404, it is not part of `GET /contacts`, and a second `DELETE`, a `PUT` or a `PATCH` on it also answer 404. | API |
● L35  | | AC-11 | A malformed contact id (for example `abc`) on `GET`, `PUT`, `PATCH` or `DELETE /contacts/{id}` is answered with 400 and the body `Invalid Contact ID`. | API |
  L36  | 
  L37  | ## Test data
  L38  | 
● L39  | Create your own user through sign-up with a unique e-mail address and the password from the environment variable `CL_USER_PASSWORD`, and create the contacts you need with `POST /contacts` or the Add Contact page. Remove the user afterwards with `DELETE /users/me` where possible.
  L40  | 
  L41  | ## Attachments
  L42  | 
  L43  | | File | MIME | Bytes | How to read | Local path |
  L44  | | --- | --- | --- | --- | --- |
  L45  | | contacts-update-contract.md | text/markdown | 2331 | text — read directly | attachments/contacts-update-contract.md |
  L46  | 
```

## attachments/contacts-update-contract.md

```text
  L1   | # Contacts API: update and delete (contract)
  L2   | 
● L3   | Base URL: the application's origin. All endpoints require `Authorization: Bearer <token>` (token from `POST /users` or `POST /users/login`). `{id}` is the contact's `_id`.
  L4   | 
  L5   | ## Contact resource
  L6   | 
  L7   | ```json
● L8   | {
● L9   |   "_id": "6ab8...",
● L10  |   "firstName": "Jane",
● L11  |   "lastName": "Doe",
● L12  |   "birthdate": "1985-07-14",
● L13  |   "email": "jane.doe@example.com",
● L14  |   "phone": "8005551234",
● L15  |   "street1": "1 Main St.",
● L16  |   "street2": "Apartment A",
● L17  |   "city": "Anytown",
● L18  |   "stateProvince": "KS",
● L19  |   "postalCode": "12345",
● L20  |   "country": "USA",
● L21  |   "owner": "<_id of the user the contact belongs to>",
● L22  |   "__v": 0
● L23  | }
  L24  | ```
  L25  | 
● L26  | An optional field without a value is either absent or `null`.
  L27  | 
  L28  | ## PUT /contacts/{id} — replace
  L29  | 
● L30  | Request body: a complete contact. `firstName` and `lastName` are required. Any optional field that is not in the body is cleared (set to `null`).
  L31  | 
  L32  | | Case | Status | Body |
  L33  | |------|--------|------|
● L34  | | Updated | 200 | the full updated contact |
● L35  | | Validation error (for example missing first or last name, invalid e-mail) | 400 | JSON, `message` describes the failed rule(s) |
● L36  | | Malformed id | 400 | text `Invalid Contact ID` |
● L37  | | No contact with this id for the signed-in user | 404 | empty |
● L38  | | Missing or invalid token | 401 | `{"error": "Please authenticate."}` |
  L39  | 
  L40  | ## PATCH /contacts/{id} — partial update
  L41  | 
● L42  | Request body: only the fields to change. Fields not in the body keep their values.
  L43  | 
  L44  | | Case | Status | Body |
  L45  | |------|--------|------|
● L46  | | Updated | 200 | the updated contact |
● L47  | | Validation error (for example empty first or last name, invalid e-mail) | 400 | JSON, `message` describes the failed rule(s) |
● L48  | | Malformed id | 400 | text `Invalid Contact ID` |
● L49  | | No contact with this id for the signed-in user | 404 | empty |
● L50  | | Missing or invalid token | 401 | `{"error": "Please authenticate."}` |
  L51  | 
  L52  | ## DELETE /contacts/{id}
  L53  | 
  L54  | | Case | Status | Body |
  L55  | |------|--------|------|
● L56  | | Deleted | 200 | text `Contact deleted` |
● L57  | | Malformed id | 400 | text `Invalid Contact ID` |
● L58  | | No contact with this id for the signed-in user (including one that was already deleted) | 404 | empty |
● L59  | | Missing or invalid token | 401 | `{"error": "Please authenticate."}` |
  L60  | 
  L61  | ## GET /contacts/{id}
  L62  | 
● L63  | 200 with the contact; 400 `Invalid Contact ID` for a malformed id; 404 (empty body) when there is no such contact for the signed-in user.
  L64  | 
```
