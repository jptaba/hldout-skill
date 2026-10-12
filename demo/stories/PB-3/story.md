# PB-3: Signing up for online banking, signing in and signing out

As a new ParaBank customer I want to sign up for online banking myself and then sign in and out with my own username and password, so that I can reach my accounts online. The mobile app signs customers in through the bank services API.

Web: "Register" on the home page, the "Customer Login" box, "Log Out" in the Account Services menu.
API: the sign-in call of the bank services API under `/parabank/services/bank` (its description is linked from the site's pages), and the customer's list of accounts.

Sign-up asks for first name, last name, address, city, state, zip code, phone number, social security number, a username, and the password twice. The phone number is optional, everything else is required.

## Acceptance criteria

Scenario: Signing up creates the customer and signs them in
  Given a visitor on the registration page
  When they fill in their details with a username nobody uses yet and submit
  Then they see a confirmation that their account was created and that they are signed in
  And the Account Services menu is available and the page greets them by first and last name

Scenario: A new customer starts with a first account
  Given a customer who has just signed up
  When they open the Accounts Overview
  Then it lists one account with its opening balance
  And the API's list of accounts for that customer shows the same account with the same balance

Scenario: Required details are enforced
  Given a visitor on the registration page
  When they submit with a required detail left empty
  Then a message next to that field says it is required
  And no customer is created: signing in with that username is refused

Scenario: The two passwords must match
  Given a visitor on the registration page
  When the password and its confirmation differ
  Then a message says the passwords did not match and no customer is created

Scenario: A username can be registered only once
  Given a customer already signed up with a username
  When a visitor signs up with the same username
  Then a message says the username already exists
  And the first customer still signs in with their own password and the visitor's password does not work for that username

Scenario: Signing in on the web
  Given a registered customer who is signed out
  When they sign in with their username and password
  Then they land on the Accounts Overview with their accounts
  And the page greets them by first and last name

Scenario: Wrong credentials are refused
  Given a registered customer
  When somebody signs in with their username and a wrong password, or with a username that does not exist
  Then sign-in is refused with a message, the same message in both cases
  And the visitor stays signed out

Scenario: Signing out
  Given a signed-in customer
  When they choose "Log Out"
  Then they are back on the home page with the sign-in box
  And opening the Accounts Overview no longer shows their accounts until they sign in again

Scenario: Signing in through the API
  Given a registered customer
  When the API sign-in is called with their username and password
  Then it answers with the customer's id, name and address, and never with the password
  And that id is the same customer as on the web: the API's account list for it shows the account from their Accounts Overview

Scenario: The API refuses wrong credentials
  Given a registered customer
  When the API sign-in is called with a wrong password or an unknown username
  Then it answers with an error and no customer details

## Notes

Recovering a forgotten username or password ("Forgot login info?") and changing contact details are separate stories. Test customers are the ones the checks sign up themselves; don't use customers that already exist.
