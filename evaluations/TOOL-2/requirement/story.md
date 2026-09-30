---
key: TOOL-2
summary: "Customer registration, sign-in and account protection"
type: Story
status: Ready for QA
priority: High
labels: []
source: mock-jira
url: https://your-domain.atlassian.net/browse/TOOL-2
fetchedAt: 2026-09-29T22:16:11.316Z
---

# TOOL-2: Customer registration, sign-in and account protection

## Description

As a customer I want to register and sign in, and I want my account protected against password guessing.

Identity API: `POST /users/register`, `POST /users/login` (returns `{ "access_token", "token_type", "expires_in" }`), `GET /users/me` and `GET /users/logout` (both need `Authorization: Bearer <access_token>`). Web shop sign-in page: "Sign in" in the navigation.

## Acceptance criteria

Scenario: Registration creates the customer without echoing the password  
Given a new customer with a unique e-mail address  
When their details are posted to POST /users/register  
Then the API responds 201 with the customer's details and an id  
And the response does not contain the password

Scenario: A registered e-mail address cannot register twice  
Given a customer already registered with an e-mail address  
When the same e-mail address is registered again  
Then the API responds 409 with the message "A customer with this email address already exists."

Scenario: Weak passwords are rejected with every broken rule listed  
Given a new customer whose password is "abc"  
When they register  
Then the API responds 422 and the password errors state all four rules: at least 8 characters, upper and lower case letters, a symbol, a number

Scenario: Signing in on the web shop  
Given a registered customer on the web shop's sign-in page  
When they sign in with their e-mail address and password  
Then they land on the "My account" page  
And the navigation shows their first and last name

Scenario: A wrong password is refused  
Given a registered customer  
When they sign in with a wrong password  
Then POST /users/login responds 401  
And the web shop shows "Invalid email or password"

Scenario: The account locks after five failed attempts  
Given a registered customer  
When five sign-in attempts with a wrong password are made  
Then attempts one to five respond 401  
And the sixth attempt, even with the correct password, responds 423 with a message that the account is locked

Scenario: Signing out invalidates the token  
Given a signed-in customer with an access token  
When they sign out with GET /users/logout  
Then GET /users/me with the same token responds 401

## Attachments

_None_
