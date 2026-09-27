# CL-3: Edit and delete a contact

As a signed-in user I want to correct a contact's details or remove a contact I no longer need, in the web app and through the API.

In the web app the user opens a contact by clicking its row on the Contact List page; the **Contact Details** page has the buttons **Edit Contact**, **Delete Contact** and **Return to Contact List**. The Edit Contact page shows the same fields as the Add Contact page, with **Submit** and **Cancel** buttons. The API side is described in the attached `contacts-update-contract.md`.

## Acceptance criteria

| ID | Criterion | Layer |
|----|-----------|-------|
| AC-1 | "Edit Contact" on the Contact Details page opens the Edit Contact page with every field pre-filled with the contact's current values. | UI |
| AC-2 | Changing a value (for example the city) and pressing Submit saves the change and returns the user to the Contact Details page, which shows the new value. | UI |
| AC-3 | After an edit in the web app, `GET /contacts/{id}` returns the new value. Emptying an optional field in the edit form (for example the phone) removes that value: the Contact Details page shows it empty and the API returns `null` for it. | End-to-end |
| AC-4 | Submitting the edit form with an invalid e-mail address (for example `not-an-email`) keeps the user on the Edit Contact page with a message containing "Email is invalid", and the stored contact is not changed. | UI |
| AC-5 | `PUT /contacts/{id}` replaces the contact as described in the contract: 200 with the full updated contact; optional fields that are not in the body are cleared (`null`). | API |
| AC-6 | `PATCH /contacts/{id}` changes only the fields in the body: 200 with the updated contact, and all other fields keep their previous values. | API |
| AC-7 | A `PUT` or `PATCH` that would leave the contact without a first name or last name (field missing from a PUT body, or sent as an empty string) is rejected with 400 and the stored contact stays exactly as it was. | API |
| AC-8 | "Delete Contact" asks "Are you sure you want to delete this contact?". Cancelling keeps the contact and the user stays on the Contact Details page; confirming deletes it and returns the user to the Contact List page, where the contact is no longer listed. | UI |
| AC-9 | `DELETE /contacts/{id}` answers 200 with the body `Contact deleted`. | API |
| AC-10 | A deleted contact is gone for good: `GET /contacts/{id}` answers 404, it is not part of `GET /contacts`, and a second `DELETE`, a `PUT` or a `PATCH` on it also answer 404. | API |
| AC-11 | A malformed contact id (for example `abc`) on `GET`, `PUT`, `PATCH` or `DELETE /contacts/{id}` is answered with 400 and the body `Invalid Contact ID`. | API |

## Test data

Create your own user through sign-up with a unique e-mail address and the password from the environment variable `CL_USER_PASSWORD`, and create the contacts you need with `POST /contacts` or the Add Contact page. Remove the user afterwards with `DELETE /users/me` where possible.
