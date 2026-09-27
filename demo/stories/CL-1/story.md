# CL-1: Sign up and sign in to the Contact List App

As a new visitor I want to create my own account and sign in with it, so that I can keep a private list of my contacts.

## Background

The login page (`/`) has a **Sign up** button that opens the **Add User** page. The sign-up form asks for First Name, Last Name, Email and Password. After a successful sign-up the user is signed in straight away and taken to their (empty) **Contact List**. Returning users sign in on the login page with their e-mail and password.

The same features are available to API clients:

- `POST /users` creates an account (body: `firstName`, `lastName`, `email`, `password`) and returns the created user together with a session token.
- `POST /users/login` signs in (body: `email`, `password`) and returns the user and a session token.
- `GET /users/me` returns the signed-in user's profile (`Authorization: Bearer <token>`).

## Account rules

- First name and last name are required, at most 20 characters each.
- The e-mail address is required, must be a valid address and can only be used by one account.
- The password is required and must be 8 to 100 characters long.

The acceptance criteria are in the "Acceptance Criteria" field of this issue.

## Test data

There is no shared account for this feature: every account is created through sign-up with a unique e-mail address (for example with a timestamp in the local part). Use the password from the environment variable `CL_USER_PASSWORD` for accounts you create; delete them afterwards (`DELETE /users/me`) where possible.
