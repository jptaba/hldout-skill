# Evidence pack — PB-1

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: PB-1
  L3   | summary: "Customer registration and sign-in"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/PB-1
  L10  | fetchedAt: 2026-09-27T05:31:47.428Z
  L11  | ---
  L12  | 
  L13  | # PB-1: Customer registration and sign-in
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | **As a** prospective ParaBank customer  
● L18  | **I want** to register for online banking and sign in with my own user name and password  
● L19  | **so that** I can manage my accounts online, and our partner apps can authenticate me through the banking REST service.
  L20  | 
  L21  | ## Context
  L22  | 
● L23  | - Web app: ParaBank (`/parabank/`). Registration page: `register.htm` (linked as "Register" under the Customer Login panel). Sign-in uses the Customer Login panel on the home page.
● L24  | - REST service base: `/parabank/services/bank`. Responses are XML unless the client sends `Accept: application/json`.
● L25  | - The shared demo database can be reset at any time, so every check starts by registering its own customer with a fresh, unique user name. The password for these customers comes from the environment variable `PB_USER_PASSWORD` (never hard-coded).
● L26  | - Registration form fields: First Name, Last Name, Address, City, State, Zip Code, Phone #, SSN, Username, Password, Confirm. Phone # is optional; all other fields are required.
  L27  | 
  L28  | ## Acceptance criteria
  L29  | 
● L30  | | ID | Criterion | Layer |
  L31  | | --- | --- | --- |
● L32  | | AC-1 | Submitting the registration form with every field empty keeps the customer on the form and shows a message next to each required field: "First name is required.", "Last name is required.", "Address is required.", "City is required.", "State is required.", "Zip Code is required.", "Social Security Number is required.", "Username is required.", "Password is required.", "Password confirmation is required.". No message is shown for Phone #. | UI |
● L33  | | AC-2 | When Password and Confirm differ, the form shows "Passwords did not match." and no customer is created (the user name cannot sign in afterwards). | UI + API |
● L34  | | AC-3 | A complete, valid registration opens a page with the heading "Welcome _&lt;username&gt;_" and the text "Your account was created successfully. You are now logged in." The customer is signed in: the left panel greets them with "Welcome _&lt;first name&gt; &lt;last name&gt;_" and shows the Account Services menu. | UI |
● L35  | | AC-4 | Registering again with a user name that is already taken shows "This username already exists." next to Username and does not change the existing customer (a REST login of the existing customer still returns their original first and last name). | UI + API |
● L36  | | AC-5 | On the Customer Login panel, signing in with a wrong password shows an "Error!" page with "The username and password could not be verified."; signing in with both fields empty shows "Please enter a username and password." | UI |
● L37  | | AC-6 | Signing in with the registered user name and password opens the Accounts Overview page, which lists at least one account for the new customer. "Log Out" returns to the home page with the Customer Login panel. | UI |
● L38  | | AC-7 | `GET /login/{username}/{password}` with valid credentials answers 200 and returns the customer: `id`, `firstName`, `lastName`, `address` (`street`, `city`, `state`, `zipCode`) and `phoneNumber`, equal to the values entered at registration. With `Accept: application/json` the body is JSON; without it, XML with a `customer` root element. | API |
● L39  | | AC-8 | `GET /login/{username}/{password}` with a wrong password answers 400 with the body "Invalid username and/or password". | API |
● L40  | | AC-9 | End to end: for a customer registered through the page, `GET /customers/{id}` (id from the login response) returns the same customer, and `GET /customers/{id}/accounts` returns the account(s) whose numbers are shown in the Accounts Overview. | UI + API |
  L41  | 
  L42  | ## Out of scope
  L43  | 
● L44  | Forgotten login lookup (`lookup.htm`), profile updates, and password rules beyond "required" and "must match".
  L45  | 
  L46  | ## Attachments
  L47  | 
  L48  | _None_
  L49  | 
```
