AC-1 (API) Creating a user with `POST /Account/v1/User` and a JSON body `{ "userName", "password" }` whose password satisfies the policy returns **201 Created**. The body contains the new user's id (`userID`, a UUID), `username` equal to the requested user name, and an empty `books` list.

AC-2 (API) A password that does not satisfy the policy (too short, or missing an uppercase letter, a lowercase letter, a digit or a special character) is rejected with **400**, error `code` "1300" and the message "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer." No account is created (a token cannot be obtained for it).

AC-3 (API) Creating a user whose user name already exists is rejected with **406**, error `code` "1204" and the message "User exists!".

AC-4 (API) Creating a user without a user name or without a password is rejected with **400**, error `code` "1200" and the message "UserName and Password required."

AC-5 (API) `POST /Account/v1/GenerateToken` with the correct user name and password returns **200** with a non-empty `token`, `status` "Success", `result` "User authorized successfully." and an `expires` timestamp 7 days after the moment the token was issued.

AC-6 (API) `POST /Account/v1/GenerateToken` with a wrong password issues no token: `token` and `expires` are null, `status` is "Failed" and `result` is "User authorization failed."

AC-7 (API, security) The token must not disclose the user's password: decoding the token (a JWT) must not reveal the password in any part of it.

AC-8 (API) `POST /Account/v1/Authorized` with `{ "userName", "password" }` returns `false` for a newly created user who has not been issued a token yet, and `true` once a token has been generated for that user. With a wrong password it never returns `true`; it answers with the message "User not found!".

AC-9 (UI + API) On the login page (`/login`), signing in with an account created through the API opens the profile page (`/profile`), which shows "User Name :" followed by that user's name. After this sign-in, `POST /Account/v1/Authorized` returns `true` for the account.

AC-10 (UI) Signing in with a wrong password keeps the user on the login page and shows the message "Invalid username or password!" in red below the form.

AC-11 (UI) Clicking "Login" with an empty user name and an empty password does not sign in; both fields are highlighted as invalid.

AC-12 (UI) Clicking "Logout" on the profile page signs the user out and returns to the login page. Opening `/profile` afterwards no longer shows the user name and shows "Currently you are not logged into the Book Store application, please visit the login page to enter or register page to register yourself."

AC-13 (API) `DELETE /Account/v1/User/{UUID}`, authorized with the user's token, deletes the account and returns **204 No Content**. Afterwards `POST /Account/v1/GenerateToken` for that user name returns `status` "Failed".
