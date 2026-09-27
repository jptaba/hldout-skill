---
key: AE-2
summary: "Customer account lifecycle through the partner Account API, with shop sign-in"
type: Story
status: Ready for QA
priority: High
labels: []
source: mock-jira
url: https://your-domain.atlassian.net/browse/AE-2
fetchedAt: 2026-09-27T00:53:29.005Z
---

# AE-2: Customer account lifecycle through the partner Account API, with shop sign-in

## Description

Our partner integration (a loyalty/CRM partner) needs to manage Automation Exercise customer accounts from their side: create a customer, check credentials, read the profile, update it and close the account. Customers created by the partner must be able to sign in to the shop straight away with the same e-mail and password, and a closed account must no longer be able to sign in.

The partner-integration team has agreed the API contract with the partner; it is attached as **account-api-contract.md** and is the reference for parameter names, required fields, response codes and messages. The acceptance criteria are in the Acceptance Criteria field.

Notes for the team:

- Customers are created through the API itself (`POST /api/createAccount`); there is no pre-provisioned account. Use a fresh, unique e-mail address for every customer, and close (delete) every customer you create.
- The password to use for customers created for acceptance is provided in the environment variable `AE_USER_PASSWORD`. Never hard-code it.
- Shop sign-in happens on the **Signup / Login** page (`/login`), in the "Login to your account" form.
- Out of scope: sign-up through the shop UI, password change, the shopping cart and checkout.

## Acceptance criteria (custom field)

AC-1: The system shall create a customer account when the partner calls createAccount with all required fields and an e-mail address not yet registered, answering responseCode 201 with the message "User created!".  
AC-2: The system shall refuse to create a second account for an e-mail address that is already registered, answering responseCode 400 with the message "Email already exists!".  
AC-3: The system shall treat e-mail addresses case-insensitively for uniqueness: registering an address that differs from an existing account's address only in letter case shall be refused exactly as in AC-2.  
AC-4: The system shall refuse createAccount when any required field of the contract is missing, answering responseCode 400 with the message naming the missing parameter, and shall not create the account.  
AC-5: The system shall refuse createAccount when the e-mail address is not a valid e-mail address (for example it has no "@"), answering responseCode 400, and shall not create the account.  
AC-6: The system shall answer verifyLogin as the contract states: valid e-mail and password give responseCode 200 "User exists!"; a wrong password or an unknown e-mail give responseCode 404 "User not found!"; a missing e-mail or password gives responseCode 400 "Bad request, email or password parameter is missing in POST request."; the DELETE method gives responseCode 405 "This request method is not supported.".  
AC-7: The system shall return the customer's profile from getUserDetailByEmail with every field listed in the contract, holding the values given at registration, and shall never return the password; an unknown e-mail gives responseCode 404 "Account not found with this email, try another email!".  
AC-8: The system shall apply updateAccount as a partial update: with the correct e-mail and password, only the fields sent change (responseCode 200 "User updated!") and the change is visible through getUserDetailByEmail; with a wrong password the answer is responseCode 404 "Account not found!" and nothing changes.  
AC-9: The system shall close the account on deleteAccount with the correct e-mail and password (responseCode 200 "Account deleted!"), after which verifyLogin and getUserDetailByEmail answer 404 for that e-mail; with a wrong password the answer is responseCode 404 "Account not found!" and the account remains usable.  
AC-10: The system shall let a customer created through the API sign in on the shop's login page with the same e-mail and password; after sign-in the header shows "Logged in as <name>", where <name> is the account's current name (including a name changed through updateAccount).  
AC-11: The system shall refuse shop sign-in with a wrong password, staying on the login page and showing "Your email or password is incorrect!".  
AC-12: The system shall refuse shop sign-in for an account closed through deleteAccount, showing the same message as AC-11.

## Attachments

| File | MIME | Bytes | How to read | Local path |
| --- | --- | --- | --- | --- |
| account-api-contract.md | text/markdown | 4800 | text — read directly | attachments/account-api-contract.md |
