# DQ-1: Book Store accounts - create a user, get a token, sign in and sign out

**As a** reader of the Book Store
**I want** an account I can create through the Book Store API and use to sign in on the web site
**so that** I can keep a personal book collection.

## Context

The Book Store (web site at `/login` and `/profile`, API under `/Account/v1`, documented in the Swagger UI at `/swagger/`)
lets a client create a user account, request an access token for it and check whether the account is authorized.
The same account is used to sign in on the web site, where the profile page greets the user by name.

Wrong credentials must be handled cleanly on both the web site and the API, and the password policy must be enforced
when an account is created.

## Accounts and data

- Accounts are created through the API (`POST /Account/v1/User`) with a unique user name per run
  (for example `qa-<timestamp>`), and removed afterwards with `DELETE /Account/v1/User/{UUID}`.
- The password for these accounts is taken from the environment variable `DQ_USER_PASSWORD`
  (it satisfies the password policy below). Never hard-code a password.
- Password policy: at least 8 characters, with at least one uppercase letter, one lowercase letter, one digit and
  one special (non-alphanumeric) character.

The acceptance criteria are maintained in the **Acceptance Criteria** field of this ticket.

## Out of scope

- The "New User" registration form on the web site.
- Password change / reset.
