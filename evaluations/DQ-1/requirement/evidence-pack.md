# Evidence pack — DQ-1

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DQ-1
  L3   | summary: "Book Store accounts - create a user, get a token, sign in and sign out"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DQ-1
  L10  | fetchedAt: 2026-09-27T05:31:49.558Z
  L11  | ---
  L12  | 
  L13  | # DQ-1: Book Store accounts - create a user, get a token, sign in and sign out
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | **As a** reader of the Book Store  
● L18  | **I want** an account I can create through the Book Store API and use to sign in on the web site  
● L19  | **so that** I can keep a personal book collection.
  L20  | 
  L21  | ## Context
  L22  | 
● L23  | The Book Store (web site at `/login` and `/profile`, API under `/Account/v1`, documented in the Swagger UI at `/swagger/`)  
● L24  | lets a client create a user account, request an access token for it and check whether the account is authorized.  
● L25  | The same account is used to sign in on the web site, where the profile page greets the user by name.
  L26  | 
● L27  | Wrong credentials must be handled cleanly on both the web site and the API, and the password policy must be enforced  
● L28  | when an account is created.
  L29  | 
  L30  | ## Accounts and data
  L31  | 
● L32  | - Accounts are created through the API (`POST /Account/v1/User`) with a unique user name per run (for example `qa-<timestamp>`), and removed afterwards with `DELETE /Account/v1/User/{UUID}`.
● L33  | - The password for these accounts is taken from the environment variable `DQ_USER_PASSWORD` (it satisfies the password policy below). Never hard-code a password.
● L34  | - Password policy: at least 8 characters, with at least one uppercase letter, one lowercase letter, one digit and one special (non-alphanumeric) character.
  L35  | 
● L36  | The acceptance criteria are maintained in the **Acceptance Criteria** field of this ticket.
  L37  | 
  L38  | ## Out of scope
  L39  | 
● L40  | - The "New User" registration form on the web site.
● L41  | - Password change / reset.
  L42  | 
  L43  | ## Acceptance criteria (custom field)
  L44  | 
● L45  | AC-1 (API) Creating a user with `POST /Account/v1/User` and a JSON body `{ "userName", "password" }` whose password satisfies the policy returns **201 Created**. The body contains the new user's id (`userID`, a UUID), `username` equal to the requested user name, and an empty `books` list.
  L46  | 
● L47  | AC-2 (API) A password that does not satisfy the policy (too short, or missing an uppercase letter, a lowercase letter, a digit or a special character) is rejected with **400**, error `code` "1300" and the message "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer." No account is created (a token cannot be obtained for it).
  L48  | 
● L49  | AC-3 (API) Creating a user whose user name already exists is rejected with **406**, error `code` "1204" and the message "User exists!".
  L50  | 
● L51  | AC-4 (API) Creating a user without a user name or without a password is rejected with **400**, error `code` "1200" and the message "UserName and Password required."
  L52  | 
● L53  | AC-5 (API) `POST /Account/v1/GenerateToken` with the correct user name and password returns **200** with a non-empty `token`, `status` "Success", `result` "User authorized successfully." and an `expires` timestamp 7 days after the moment the token was issued.
  L54  | 
● L55  | AC-6 (API) `POST /Account/v1/GenerateToken` with a wrong password issues no token: `token` and `expires` are null, `status` is "Failed" and `result` is "User authorization failed."
  L56  | 
● L57  | AC-7 (API, security) The token must not disclose the user's password: decoding the token (a JWT) must not reveal the password in any part of it.
  L58  | 
● L59  | AC-8 (API) `POST /Account/v1/Authorized` with `{ "userName", "password" }` returns `false` for a newly created user who has not been issued a token yet, and `true` once a token has been generated for that user. With a wrong password it never returns `true`; it answers with the message "User not found!".
  L60  | 
● L61  | AC-9 (UI + API) On the login page (`/login`), signing in with an account created through the API opens the profile page (`/profile`), which shows "User Name :" followed by that user's name. After this sign-in, `POST /Account/v1/Authorized` returns `true` for the account.
  L62  | 
● L63  | AC-10 (UI) Signing in with a wrong password keeps the user on the login page and shows the message "Invalid username or password!" in red below the form.
  L64  | 
● L65  | AC-11 (UI) Clicking "Login" with an empty user name and an empty password does not sign in; both fields are highlighted as invalid.
  L66  | 
● L67  | AC-12 (UI) Clicking "Logout" on the profile page signs the user out and returns to the login page. Opening `/profile` afterwards no longer shows the user name and shows "Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself."
  L68  | 
● L69  | AC-13 (API) `DELETE /Account/v1/User/{UUID}`, authorized with the user's token, deletes the account and returns **204 No Content**. Afterwards `POST /Account/v1/GenerateToken` for that user name returns `status` "Failed".
  L70  | 
  L71  | ## Comments (clarifications from the issue)
  L72  | 
  L73  | **Maya Lindqvist (Product Owner)** — 2026-09-26:
  L74  | 
● L75  | Clarification on AC-6 after the security review with the platform team: a refused token request has to be recognisable at the HTTP level too, not only from the body. So `POST /Account/v1/GenerateToken` with a wrong password (or an unknown user name) must answer **401 Unauthorized**; the body stays as described in AC-6 (`token`/`expires` null, `status` "Failed", `result` "User authorization failed.").
  L76  | 
● L77  | This applies to GenerateToken only - AC-8 (Authorized) stays as written.
  L78  | 
● L79  | Reminder: the registration form on the web site is not part of this story, accounts for sign-in are always created through the API.
  L80  | 
  L81  | 
  L82  | ## Attachments
  L83  | 
  L84  | _None_
  L85  | 
```
