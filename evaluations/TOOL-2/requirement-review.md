# Requirement review — TOOL-2

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | description (identity API endpoints, token shape, Bearer header, web shop sign-in entry) and seven Gherkin scenarios |

## Testability decisions

- **AC-1** (api) Registration creates the customer without echoing the password → SCN-001 registers a unique customer and checks 201, the posted e-mail address, first and last name, and an id; SCN-002 (security) checks that neither the password value nor a password field is in the answer. SCN-010 chains the registered customer into sign-in and sign-out.
- **AC-2** (api) A registered e-mail address cannot register twice → SCN-003 registers a customer as a precondition, registers another customer with the same e-mail address, checks 409 and the quoted message.
- **AC-3** (api) Weak passwords are rejected with every broken rule listed → SCN-004 registers with password "abc"; 422, and the password errors must mention each of the four rules (the story states them as meanings, so each rule is checked by what it mentions, not by exact wording).
- **AC-4** (ui) Signing in on the web shop → SCN-005 registers a customer through the API, opens the sign-in page, signs in, and checks the "My account" page and that the navigation shows "first last".
- **AC-5** (e2e) A wrong password is refused → SCN-006 signs in on the web shop with a wrong password; the POST /users/login answer the page receives must be 401 and the page must show "Invalid email or password".
- **AC-6** (api) The account locks after five failed attempts → SCN-007 (security): five wrong attempts, each 401; the sixth with the correct password is 423 and mentions the lock. SCN-008 (boundary, one step inside the limit): after four failures the correct password still signs in.
- **AC-7** (api) Signing out invalidates the token → SCN-009: token works before (precondition), GET /users/logout, then GET /users/me with the same token is 401.

## Ambiguities / open questions

- G1 (mechanics, required): web shop sign-in page route and form elements — discovered while hardening.
- G2 (mechanics, required): how the "My account" page is recognised and where the navigation shows the name — discovered while hardening.
- G3 (mechanics, required): where the password errors are in the 422 answer — discovered while hardening.
- G4 (oracle): whether and when a locked account unlocks — open; not tested (# OPEN-QUESTION). Each lock scenario uses a fresh customer, so a lock that never lifts affects nothing else. No user was available to ask.
- The application offers no stated way to delete a customer: registered test customers are kept, tagged `hldout-…` in the e-mail address (live shared demo side effect).
