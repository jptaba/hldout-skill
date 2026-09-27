# CL-2: Add a contact to my contact list

Signed-in users need to record new contacts, either in the web app or through the REST API used by our integration partners. A contact has a first and last name and, optionally, a date of birth, e-mail, phone and a postal address. We want to stop bad data at the door, so every field has an agreed rule; the rules are in the attached `contact-field-rules.csv` and the page layout is in the attached `add-contact-mockup.png`.

## Requirements

The system shall offer an "Add a New Contact" button on the Contact List page that opens the Add Contact page, with the fields, labels and placeholder texts shown in panel 1 of the mock-up, and with First Name and Last Name marked as required with "*".

The system shall, when the Add Contact form is submitted with valid values, save the contact and return the user to the Contact List page, where the new contact is shown as a row laid out as in panel 2 of the mock-up.

The system shall, when the Add Contact form is submitted with a value that breaks a rule, keep the user on the Add Contact page and show the reason above the form; the reason contains the error text given for that field in the rules file (for example "Birthdate is invalid"). No contact is saved.

The system shall accept `POST /contacts` from a signed-in API client (`Authorization: Bearer <token>`) with a valid body and answer 201 with the saved contact: its `_id`, every value that was sent, and `owner` set to the `_id` of the signed-in user.

The system shall enforce every rule in the rules file on `POST /contacts`: each value in the "accepted examples" column is saved (201) and each value in the "rejected examples" column is refused with 400 and a JSON body whose `message` contains the error text for that field. A refused request saves nothing.

The system shall store text values without leading or trailing spaces (a first name sent as "  Jane  " is saved as "Jane").

The system shall keep the web app and the API consistent: a contact added on the Add Contact page is returned by `GET /contacts` with the same values that were typed, and a contact created with `POST /contacts` appears in the Contact List page after a reload.

## Out of scope

Editing and deleting contacts (CL-3), duplicate detection, importing contacts.

## Test data

Contacts belong to the signed-in user. Create your own user through sign-up (`POST /users` or the Sign up page) with a unique e-mail address and the password from the environment variable `CL_USER_PASSWORD`; remove the user afterwards with `DELETE /users/me` where possible.
