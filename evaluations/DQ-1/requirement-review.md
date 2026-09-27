# Requirement review — DQ-1: Book Store accounts - create a user, get a token, sign in and sign out

Written from `requirement/story.md` and `requirement-contract.json` only (no AUT access). The story has no attachments.

## Sources used

| Source | Contributes |
| --- | --- |
| story.md — Description / Context (L17-L28) | actor and goal; routes `/login`, `/profile`; API base `/Account/v1`; wrong credentials handled on web and API; policy enforced at creation |
| story.md — Accounts and data (L32-L34) | seeding rule (create via `POST /Account/v1/User` with a unique user name, delete via `DELETE /Account/v1/User/{UUID}`); password from `DQ_USER_PASSWORD`; password policy R1 |
| story.md — Out of scope (L40-L41) | registration form and password change/reset are not tested |
| story.md — Acceptance criteria AC-1..AC-13 (L45-L69) | every expected status, code, message and UI text |
| story.md — PO comment (L75-L79) | GenerateToken refusal (wrong password or unknown user name) must answer **401**; AC-8 unchanged; accounts always created through the API |
| requirement-contract.json (reviewed) | gaps G1-G9 and their resolutions |

## Testability decisions

| AC | How it is verified |
| --- | --- |
| AC-1 | POST a unique user with `DQ_USER_PASSWORD` → 201; `userID` matches a UUID regex; `username` equals the requested name; `books` is an array of length 0. The created user is tracked for cleanup |
| AC-2 | One row per policy violation (too short with all classes present; no uppercase; no lowercase; no digit; no special) → 400, `code` "1300", the verbatim message. "No account is created" becomes: GenerateToken for that user name + password yields no token. The 7-/8-character boundary of R1 is a separate `boundary` outline (7 → rejected, 8 → accepted) |
| AC-3 | Seed a user, POST the same user name again → 406, `code` "1204", "User exists!" |
| AC-4 | Two requirement-backed rows (userName field absent; password field absent) → 400 / "1200" / "UserName and Password required.". The empty-string reading is a separate scenario tagged `@assumes:G7` |
| AC-5 | Seed a user; GenerateToken → 200, non-empty `token`, `status` "Success", `result` "User authorized successfully.". The `expires` = issue moment + 7 days check is its own scenario tagged `@assumes:G3` (tolerance of 5 minutes around the request window, ISO-8601, UTC if no offset) |
| AC-6 | Wrong password and unknown user name (PO comment) → 401 and body `token` null, `expires` null, `status` "Failed", `result` "User authorization failed." |
| AC-7 | Split the token on `.`, base64url-decode header, payload and signature; neither the raw token nor any decoded part contains the password |
| AC-8 | Seed a user without a token → Authorized `false`; generate a token → Authorized `true`. Wrong password (separate negative scenario) → response is not `true` and carries "User not found!" (no status asserted, G4) |
| AC-9 | Seed a user via the API; deep-link `/login`; sign in; URL is `/profile`; "User Name :" followed by the name is visible; then Authorized → `true` |
| AC-10 | Seed a user; sign in with a wrong password; URL stays `/login`; "Invalid username or password!" visible and positioned below the form's fields. The "in red" rendering is a separate scenario tagged `@assumes:G8` (computed colour: red channel clearly dominant) |
| AC-11 | Click "Login" with both fields empty → still on `/login`. The "highlighted as invalid" marking is a separate scenario tagged `@assumes:G8` (field carries an invalid-state marker) |
| AC-12 | Seed a user and sign in (Given); click "Logout" → `/login`; open `/profile` → the user name is absent and the verbatim "Currently you are not logged into…" text is shown |
| AC-13 | Seed a user and a token; DELETE `/Account/v1/User/{UUID}` with the token → 204; GenerateToken for that user name → `status` "Failed" |

## Ambiguities / open questions

| # | Item | Handling |
| --- | --- | --- |
| G1 | 401 for refused GenerateToken (PO comment) | found in requirement; asserted in SCN-006 (both rows). In AC-13 only `status` "Failed" is asserted (as written), the 401 is covered by SCN-006.2 (unknown user name) |
| G2 | JSON field of the error message | mechanics — discovered during hardening |
| G3 | "7 days after the moment the token was issued" tolerance / format | ASSUMPTION, tested in its own scenario `@assumes:G3` |
| G4 | status of Authorized with a wrong password | ASSUMPTION: no status asserted |
| G5 | login/profile page mechanics | mechanics — discovered during hardening |
| G6 | GenerateToken body shape | mechanics — drafted as `{ userName, password }` (same as the create body), confirmed during hardening |
| G7 | "without" = absent vs empty string | requirement-backed rows use absent fields; the empty-string reading is a separate `@assumes:G7` scenario |
| G8 | "in red" / "highlighted as invalid" | ASSUMPTION, separate `@assumes:G8` scenarios |
| G9 | token transport for DELETE | mechanics — drafted as `Authorization: Bearer <token>`, confirmed during hardening |
| OQ-1 | DELETE without a token or with another user's token: the story does not state the outcome | OPEN-QUESTION, not tested |
| OQ-2 | Password values for negative tests are literal invalid strings (they cannot create an account); the 8-character valid boundary password is derived at runtime from `DQ_USER_PASSWORD` so no valid password is hard-coded | ASSUMPTION |

## Revisions

None (no `requirement/CHANGES.md`).
