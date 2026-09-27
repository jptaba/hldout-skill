# AE-2: Customer account lifecycle through the partner Account API, with shop sign-in

Our partner integration (a loyalty/CRM partner) needs to manage Automation Exercise customer accounts from their side: create a customer, check credentials, read the profile, update it and close the account. Customers created by the partner must be able to sign in to the shop straight away with the same e-mail and password, and a closed account must no longer be able to sign in.

The partner-integration team has agreed the API contract with the partner; it is attached as **account-api-contract.md** and is the reference for parameter names, required fields, response codes and messages. The acceptance criteria are in the Acceptance Criteria field.

Notes for the team:
- Customers are created through the API itself (`POST /api/createAccount`); there is no pre-provisioned account. Use a fresh, unique e-mail address for every customer, and close (delete) every customer you create.
- The password to use for customers created for acceptance is provided in the environment variable `AE_USER_PASSWORD`. Never hard-code it.
- Shop sign-in happens on the **Signup / Login** page (`/login`), in the "Login to your account" form.
- Out of scope: sign-up through the shop UI, password change, the shopping cart and checkout.
