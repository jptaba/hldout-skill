# Requirement review — PB-1: Customer registration and sign-in

Written from `requirement/story.md` and `requirement-contract.json` only (no attachments; no AUT access yet).

## Sources used

| Source | Contributes |
| --- | --- |
| requirement/story.md — Description | actor (prospective customer) and goal (register, sign in; partner apps authenticate via REST) |
| requirement/story.md — Context | entry points (`/parabank/`, `register.htm`, Customer Login panel on the home page), REST base `/parabank/services/bank`, XML vs JSON content negotiation, test-data rule (fresh unique user name per check, password from `PB_USER_PASSWORD`), registration field list (Phone # optional) |
| requirement/story.md — AC-1..AC-9 | every expected message, heading, status code and response field (copied verbatim into `@req-constants`) |
| requirement/story.md — Out of scope | lookup.htm, profile updates, password rules beyond required / must match: not tested |
| requirement-contract.json | gaps G1..G6 (G1–G4 mechanics, G5–G6 assumed oracle) |

## Testability decisions

| AC | Clause | How it is verified |
| --- | --- | --- |
| AC-1 | "keeps the customer on the form" | the registration form (its Username field and Register submit control) is still shown after submit, and no "Welcome" success text appears |
| AC-1 | "a message next to each required field" | each literal message is visible on the page; "next to" is checked as: the message is rendered in the same form row as its field (hardening decides the row locator). Phone # row shows no message |
| AC-2 | "no customer is created (the user name cannot sign in afterwards)" | separate scenario: `GET /login/{username}/{password}` with the attempted user name and password does not answer 200 with a customer (assumption G5 — no specific status or message) |
| AC-3 | heading "Welcome <username>", left panel "Welcome <first> <last>", Account Services menu | literal texts with the generated values substituted; "Account Services" menu is visible |
| AC-4 | "does not change the existing customer" | separate scenario: the duplicate attempt uses different first/last names; afterwards a REST login of the existing customer returns the original first and last name |
| AC-5 | two cases | two scenarios (wrong password; both fields empty), each from the home page's Customer Login panel |
| AC-6 | "lists at least one account", "Log Out returns to the home page with the Customer Login panel" | one journey: sign in → Accounts Overview heading + ≥ 1 account row → Log Out → Customer Login panel visible |
| AC-7 | JSON vs XML | two scenarios: JSON (status 200, JSON content, values equal the registration input) and XML (sent without `Accept: application/json`; body parses as XML with root element `customer`) |
| AC-8 | 400 + body text | status 400 and the body equals "Invalid username and/or password" |
| AC-9 | "returns the same customer", "returns the account(s) whose numbers are shown" | requirement-backed scenario: same `id`, first and last name, and every account number shown in Accounts Overview is returned; assumption-backed scenario (`@assumes:G6`): all AC-7 fields equal and the account sets are exactly equal |

Data: every scenario registers its own customer with a fresh, unique user name through the registration page
(the story names no REST registration endpoint — mechanics gap G1, confirmed or replaced during hardening).
The password is `${env:PB_USER_PASSWORD}`. ParaBank's story gives no way to delete a customer, so registered
customers cannot be cleaned up; their user names are unique and tagged (`pb1…`) so they are identifiable.

## Ambiguities / open questions

| Item | Handling |
| --- | --- |
| G5 — how "cannot sign in" is observed | ASSUMPTION (contract): REST login with that user name + password does not answer 200 with a customer; tagged `@assumes:G5` |
| G6 — what "same customer" / "the account(s)" compare | ASSUMPTION (contract); the strict comparison is tagged `@assumes:G6`, the requirement-backed minimum is a separate scenario |
| AC-7 "without it" (no `Accept: application/json`) | tested with `Accept: */*` (the test client always sends an Accept header); recorded as ASSUMPTION |
| AC-7 "phoneNumber equal to the value entered" | the registration used for AC-7 enters a Phone # so the comparison is meaningful |
| AC-1 "next to each required field" | tested as "rendered in the same form row as the field"; `@needs-clarification` is not needed because the literal messages are the primary oracle |

## Revisions

None.
