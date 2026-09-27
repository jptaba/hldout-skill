AC-1 (UI) From the login page, the "Sign up" button opens the Add User page. Submitting the form with a valid first name, last name, unused e-mail and password creates the account and lands the user on the Contact List page (heading "Contact List").

AC-2 (UI) Submitting the sign-up form with invalid data keeps the user on the Add User page and shows the reason above the form. Submitting the empty form shows one message that mentions every missing or invalid field (first name, last name, e-mail and password).

AC-3 (API) `POST /users` with valid data returns 201 with the created user (`_id`, `firstName`, `lastName`, `email`) and a `token`. The password is never returned.

AC-4 (API) The account rules are enforced by `POST /users`. A request that breaks a rule is rejected with 400 and a `message` that identifies the problem: a missing or empty first name, last name or password is reported as required; a missing, empty or malformed e-mail is reported with a message containing "Email is invalid"; a value that is too long or too short is reported with the allowed length. The limits themselves are accepted (e.g. a 20-character first name, a 100-character password).

AC-5 (UI + API) Signing up with an e-mail address that already has an account is rejected: the API answers 400 with the message "Email address is already in use", and the Add User page shows the same text. No second account is created.

AC-6 (API) `POST /users/login` with the correct e-mail and password returns 200 with the user and a `token`, and that token gives access to `GET /users/me`.

AC-7 (API) A sign-in with a wrong password, or with an e-mail that has no account, returns 401 with a JSON body whose `error` field says that the e-mail or password is incorrect. Both cases return the same status and body, so the response does not reveal whether the e-mail is registered.

AC-8 (UI) Signing in on the login page with a wrong password shows "Incorrect username or password" and the user stays on the login page. With the correct password the user is taken to the Contact List page.

AC-9 (end-to-end) An account created through the Add User page can sign in through the API, and `GET /users/me` returns the first name, last name and e-mail address that were entered in the form.
