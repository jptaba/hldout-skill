# Evidence pack — AE-2

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: AE-2
  L3   | summary: "Customer account lifecycle through the partner Account API, with shop sign-in"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/AE-2
  L10  | fetchedAt: 2026-09-27T00:53:29.005Z
  L11  | ---
  L12  | 
  L13  | # AE-2: Customer account lifecycle through the partner Account API, with shop sign-in
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | Our partner integration (a loyalty/CRM partner) needs to manage Automation Exercise customer accounts from their side: create a customer, check credentials, read the profile, update it and close the account. Customers created by the partner must be able to sign in to the shop straight away with the same e-mail and password, and a closed account must no longer be able to sign in.
  L18  | 
● L19  | The partner-integration team has agreed the API contract with the partner; it is attached as **account-api-contract.md** and is the reference for parameter names, required fields, response codes and messages. The acceptance criteria are in the Acceptance Criteria field.
  L20  | 
● L21  | Notes for the team:
  L22  | 
● L23  | - Customers are created through the API itself (`POST /api/createAccount`); there is no pre-provisioned account. Use a fresh, unique e-mail address for every customer, and close (delete) every customer you create.
● L24  | - The password to use for customers created for acceptance is provided in the environment variable `AE_USER_PASSWORD`. Never hard-code it.
● L25  | - Shop sign-in happens on the **Signup / Login** page (`/login`), in the "Login to your account" form.
● L26  | - Out of scope: sign-up through the shop UI, password change, the shopping cart and checkout.
  L27  | 
  L28  | ## Acceptance criteria (custom field)
  L29  | 
● L30  | AC-1: The system shall create a customer account when the partner calls createAccount with all required fields and an e-mail address not yet registered, answering responseCode 201 with the message "User created!".  
● L31  | AC-2: The system shall refuse to create a second account for an e-mail address that is already registered, answering responseCode 400 with the message "Email already exists!".  
● L32  | AC-3: The system shall treat e-mail addresses case-insensitively for uniqueness: registering an address that differs from an existing account's address only in letter case shall be refused exactly as in AC-2.  
● L33  | AC-4: The system shall refuse createAccount when any required field of the contract is missing, answering responseCode 400 with the message naming the missing parameter, and shall not create the account.  
● L34  | AC-5: The system shall refuse createAccount when the e-mail address is not a valid e-mail address (for example it has no "@"), answering responseCode 400, and shall not create the account.  
● L35  | AC-6: The system shall answer verifyLogin as the contract states: valid e-mail and password give responseCode 200 "User exists!"; a wrong password or an unknown e-mail give responseCode 404 "User not found!"; a missing e-mail or password gives responseCode 400 "Bad request, email or password parameter is missing in POST request."; the DELETE method gives responseCode 405 "This request method is not supported.".  
● L36  | AC-7: The system shall return the customer's profile from getUserDetailByEmail with every field listed in the contract, holding the values given at registration, and shall never return the password; an unknown e-mail gives responseCode 404 "Account not found with this email, try another email!".  
● L37  | AC-8: The system shall apply updateAccount as a partial update: with the correct e-mail and password, only the fields sent change (responseCode 200 "User updated!") and the change is visible through getUserDetailByEmail; with a wrong password the answer is responseCode 404 "Account not found!" and nothing changes.  
● L38  | AC-9: The system shall close the account on deleteAccount with the correct e-mail and password (responseCode 200 "Account deleted!"), after which verifyLogin and getUserDetailByEmail answer 404 for that e-mail; with a wrong password the answer is responseCode 404 "Account not found!" and the account remains usable.  
● L39  | AC-10: The system shall let a customer created through the API sign in on the shop's login page with the same e-mail and password; after sign-in the header shows "Logged in as <name>", where <name> is the account's current name (including a name changed through updateAccount).  
● L40  | AC-11: The system shall refuse shop sign-in with a wrong password, staying on the login page and showing "Your email or password is incorrect!".  
● L41  | AC-12: The system shall refuse shop sign-in for an account closed through deleteAccount, showing the same message as AC-11.
  L42  | 
  L43  | ## Attachments
  L44  | 
  L45  | | File | MIME | Bytes | How to read | Local path |
  L46  | | --- | --- | --- | --- | --- |
  L47  | | account-api-contract.md | text/markdown | 4800 | text — read directly | attachments/account-api-contract.md |
  L48  | 
```

## attachments/account-api-contract.md

```text
  L1   | # Account API — partner integration contract (v1.2)
  L2   | 
● L3   | Owner: Partner Integration team · Consumer: loyalty/CRM partner · Status: agreed
  L4   | 
  L5   | ## 1. General
  L6   | 
● L7   | | Item | Value |
  L8   | |---|---|
● L9   | | Base URL | `https://automationexercise.com/api` |
● L10  | | Request encoding | `application/x-www-form-urlencoded` form fields, **in the request body for every method** (POST, PUT and DELETE alike). Query-string parameters are only used by `GET`. |
● L11  | | Authentication | None at transport level. Account operations are authorised by the customer's `email` + `password` pair sent with the request. |
● L12  | | Response body | A JSON object. |
  L13  | 
  L14  | ### 1.1 Response envelope
  L15  | 
● L16  | Every response of these endpoints is delivered with **HTTP status 200**. The business outcome is carried in the JSON body:
  L17  | 
● L18  | ```json
● L19  | { "responseCode": 201, "message": "User created!" }
● L20  | ```
  L21  | 
● L22  | - `responseCode` (integer) — the outcome code. **All codes in this contract refer to `responseCode`**, never to the HTTP status.
● L23  | - `message` (string) — a human-readable outcome, present on every non-data answer. Messages below are exact.
● L24  | - Data answers carry their payload next to `responseCode` (e.g. `user`).
  L25  | 
● L26  | Partners must branch on `responseCode`, not on the HTTP status.
  L27  | 
  L28  | ## 2. Endpoints
  L29  | 
  L30  | ### 2.1 `POST /createAccount` — register a customer
  L31  | 
● L32  | | Field | Required | Notes |
  L33  | |---|---|---|
● L34  | | `name` | yes | Display name; shown in the shop header after sign-in |
● L35  | | `email` | yes | Must be a valid e-mail address. Unique across customers, **compared case-insensitively** |
● L36  | | `password` | yes | |
● L37  | | `title` | no | `Mr`, `Mrs` or `Miss` |
● L38  | | `birth_date` | no | Day of month, e.g. `10` |
● L39  | | `birth_month` | no | Month name, e.g. `May` |
● L40  | | `birth_year` | no | e.g. `1990` |
● L41  | | `firstname` | yes | |
● L42  | | `lastname` | yes | |
● L43  | | `company` | no | |
● L44  | | `address1` | yes | |
● L45  | | `address2` | no | |
● L46  | | `country` | yes | e.g. `India`, `Canada` |
● L47  | | `zipcode` | yes | |
● L48  | | `state` | yes | |
● L49  | | `city` | yes | |
● L50  | | `mobile_number` | yes | |
  L51  | 
● L52  | | Outcome | responseCode | message |
  L53  | |---|---|---|
● L54  | | Created | 201 | `User created!` |
● L55  | | E-mail already registered (any letter case) | 400 | `Email already exists!` |
● L56  | | Required field missing | 400 | `Bad request, <field> parameter is missing in POST request.` (e.g. `Bad request, city parameter is missing in POST request.`) |
● L57  | | E-mail not a valid address | 400 | (message not fixed) |
  L58  | 
  L59  | ### 2.2 `POST /verifyLogin` — check credentials
  L60  | 
● L61  | Fields: `email`, `password` (both required).
  L62  | 
● L63  | | Outcome | responseCode | message |
  L64  | |---|---|---|
● L65  | | Credentials match | 200 | `User exists!` |
● L66  | | Unknown e-mail or wrong password | 404 | `User not found!` |
● L67  | | `email` or `password` missing | 400 | `Bad request, email or password parameter is missing in POST request.` |
● L68  | | Method `DELETE` used on `/verifyLogin` | 405 | `This request method is not supported.` |
  L69  | 
  L70  | ### 2.3 `GET /getUserDetailByEmail?email=<email>` — read a profile
  L71  | 
● L72  | Success: `responseCode` 200 and a `user` object with these fields (some response names differ from the request names):
  L73  | 
● L74  | `id`, `name`, `email`, `title`, `birth_day`, `birth_month`, `birth_year`, `first_name`, `last_name`, `company`, `address1`, `address2`, `country`, `state`, `city`, `zipcode`, `mobile_number`
  L75  | 
● L76  | The password is never returned.
  L77  | 
● L78  | | Outcome | responseCode | message |
  L79  | |---|---|---|
● L80  | | Found | 200 | (data answer, `user` object) |
● L81  | | No account for that e-mail | 404 | `Account not found with this email, try another email!` |
● L82  | | `email` missing | 400 | `Bad request, email parameter is missing in GET request.` |
  L83  | 
  L84  | ### 2.4 `PUT /updateAccount` — update a profile
  L85  | 
● L86  | Fields: `email` and `password` (required, identify and authorise the customer) plus any of the registration fields to change. Fields not sent keep their value (partial update).
  L87  | 
● L88  | | Outcome | responseCode | message |
  L89  | |---|---|---|
● L90  | | Updated | 200 | `User updated!` |
● L91  | | E-mail/password pair does not match an account | 404 | `Account not found!` |
● L92  | | `password` missing | 400 | `Bad request, password parameter is missing in PUT request.` |
  L93  | 
  L94  | ### 2.5 `DELETE /deleteAccount` — close an account
  L95  | 
● L96  | Fields (form body): `email`, `password`.
  L97  | 
● L98  | | Outcome | responseCode | message |
  L99  | |---|---|---|
● L100 | | Deleted | 200 | `Account deleted!` |
● L101 | | E-mail/password pair does not match an account | 404 | `Account not found!` |
● L102 | | `email` or `password` missing | 400 | `Bad request, <field> parameter is missing in DELETE request.` |
  L103 | 
  L104 | ## 3. Example
  L105 | 
● L106 | ```
● L107 | POST /api/createAccount
● L108 | Content-Type: application/x-www-form-urlencoded
  L109 | 
● L110 | name=Asha%20Rao&email=asha.rao%2B1001%40example.com&password=<secret>&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme&address1=12%20MG%20Road&address2=&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000000
  L111 | 
● L112 | HTTP/1.1 200 OK
● L113 | {"responseCode": 201, "message": "User created!"}
● L114 | ```
  L115 | 
```
