# Requirement review — AE-2: Customer account lifecycle through the partner Account API, with shop sign-in

Written from `requirement/story.md`, `requirement/attachments/account-api-contract.md` and the reviewed
`requirement-contract.json`, before any access to the application.

## Sources used

| Source | Contributes |
| --- | --- |
| story.md (description, team notes) | the partner use case; seeding rule (customers created through `POST /api/createAccount`, unique e-mail, always deleted); password from `AE_USER_PASSWORD`; shop sign-in entry point `/login`, "Login to your account" form; out of scope (UI sign-up, password change, cart, checkout) |
| story.md (Acceptance criteria field) | AC-1 … AC-12, the exact responseCodes and messages |
| attachments/account-api-contract.md | base URL `/api`; form-encoded request body for every method (query string only for GET); HTTP 200 envelope with `responseCode` + `message` (R1, R2); required/optional createAccount fields (R3); response field list of getUserDetailByEmail (R6); partial update rule (R7); every outcome message |

## Testability decisions

| Clause | How it is verified |
| --- | --- |
| "answering responseCode N" (all API ACs) | `responseCode` in the JSON body, never the HTTP status (R1). The HTTP-200 envelope itself is checked once, in one contract scenario (SCN-002), so a single envelope deviation is reported once |
| "creates a customer account" (AC-1) | responseCode 201 + "User created!"; the created account is closed in cleanup |
| "e-mail already registered" (AC-2), "differs only in letter case" (AC-3) | seed an account with a lower-case unique address, then call createAccount with the same address / the same address upper-cased |
| "any required field missing … names the missing parameter … not created" (AC-4) | Scenario Outline, one row per required field (11 rows). For every row but `email`, "not created" = getUserDetailByEmail for the address answers 404. For the `email` row there is no address to look up: only the refusal is asserted |
| "not a valid e-mail address (for example it has no @)" (AC-5) | the literal example (no "@") in a functional-negative scenario; two further clearly invalid shapes (no domain, no local part) in a separate `@needs-clarification` boundary scenario, because the contract does not define "valid" |
| AC-6 verifyLogin outcomes | one scenario per outcome class (valid, wrong password, unknown e-mail, missing parameter outline, DELETE method) |
| "every field listed in the contract … values given at registration … never the password" (AC-7) | split: field presence (contract); same-named fields hold registration values (functional); renamed fields birth_day/first_name/last_name (`@assumes:G3`); no password key or value in the response (security); unknown e-mail (negative) |
| "only the fields sent change" (AC-8) | update `name` and `city` only; then every other registration field is compared with its registration value |
| "nothing changes" (AC-8 wrong password) | the full profile before and after the refused update is identical |
| "the account remains usable" (AC-9) | per G4 (assumed): verifyLogin with the right password → 200 "User exists!" and getUserDetailByEmail → 200; kept in its own `@assumes:G4` scenario, separate from the requirement-backed 404 "Account not found!" check |
| "Logged in as <name>" (AC-10) | the header text after UI sign-in of an API-created customer; a second scenario renames the customer through updateAccount first |
| "staying on the login page" (AC-11) | the URL path is still `/login` after the refused sign-in and the message is visible |

## Ambiguities / open questions

| # | Item | Handling |
| --- | --- | --- |
| G3 | request→response field mapping for getUserDetailByEmail | ASSUMPTION (contract): birth_day = birth_date, first_name = firstname, last_name = lastname; `id` presence only. Only the renamed-field check carries `@assumes:G3` |
| G4 | meaning of "the account remains usable" | ASSUMPTION (contract), tested in its own `@assumes:G4` scenario |
| G5 | contract error answers not covered by any AC (missing email on GET, missing password on PUT, missing field on deleteAccount) | OPEN-QUESTION, deliberately not tested |
| — | what counts as an invalid e-mail beyond "no @" | the extra shapes are tested literally and tagged `@needs-clarification` |
| — | AC-10 "header shows Logged in as <name>" — exact whitespace/markup | assert the visible text "Logged in as <name>" (whitespace-normalised), nothing more |

## Revisions

None (revision 1).
