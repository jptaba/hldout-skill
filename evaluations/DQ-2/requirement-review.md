# Requirement review — DQ-2: Personal book collection - browse the catalogue and manage my books

Written from `requirement/story.md`, `requirement/attachments/api-contract.md` and `requirement-contract.json`
only, before any access to the application.

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | user story; routes `/books`, `/profile`, `/login`; per-run user creation/deletion and the `DQ_USER_PASSWORD` secret; example ISBNs; AC-1..AC-12 |
| attachments/api-contract.md | Bearer auth and GenerateToken; account endpoints; error envelope and error table (1200/1205/1206/1210); Book object fields and types; BookStore endpoints, request bodies, success statuses and error cases |
| requirement-contract.json | reviewed contract (ACs verbatim, E1..E4, R1..R2, gaps G1..G6) |

## Testability decisions

| AC | Decision |
| --- | --- |
| AC-1 | "carries all catalogue fields" is checked as *presence* of the nine fields on every entry (functional). The field types in R2 (api-contract.md#L28-L38) are checked in a separate `contract` scenario so a type mismatch is its own finding. |
| AC-2 | "same data as that book's entry in the catalogue" = deep equality of the lookup body with the matching `books[]` entry. Run for the three example ISBNs of story.md#L31. |
| AC-3 | Oracle = the live catalogue API response: every returned title appears on `/books`, and each row shows that book's author and publisher. |
| AC-4 | The search box is located by its required placeholder "Type to search" (strict: the placeholder is the requirement). "While typing" = characters are typed one by one and **no** submit/Enter is sent. The three example terms are asserted as *exact* sets of visible titles; a no-match term must leave zero book rows. Case-insensitivity is exercised by the examples themselves ("javascript" vs "JavaScript", "zakas" vs "Zakas") plus one upper-case variant of a stated example ("JAVASCRIPT" → the same four titles), which follows directly from "case-insensitively". |
| AC-5 | Uses 9781449325862 "Git Pocket Guide" (story example). The detail values are compared with that book's catalogue entry from the API (ISBN, title, sub title, author, publisher, total pages). |
| AC-6 | Two example books are added in one call; response `books` must echo exactly the added ISBNs; `GET /Account/v1/User/{UUID}` must list both. |
| AC-7 | Book seeded through the API; the user signs in through the `/login` UI; the Profile page must list the book with title, author and publisher (values from the catalogue API). |
| AC-8 | Re-adding the same ISBN → 400 / 1210 / "ISBN already present in the User's Collection!"; the collection must contain it exactly once. Typed as `idempotency` (repeated submit). |
| AC-9 | Two books seeded; the dialog text "Do you want to delete this book?" is asserted verbatim; after OK only that row disappears; the API collection is re-read. |
| AC-10 | Split: functional (204 + remaining books) and negative (book not in collection → 400 / 1206). The "not in collection" book is a catalogue book that was never added to this fresh user's collection. |
| AC-11 | Split: lookup of an unknown ISBN (400 / 1205) and adding an unknown ISBN (400 / 1205 + collection still empty). The unknown ISBN is verified absent from the catalogue as a precondition (never guessed blindly). |
| AC-12 | Scenario Outline, one row per refused call (no token ×3, invalid token ×3, other user's UUID / userId ×2). Each asserts 401 + code "1200" + "User not authorized!". A second user is seeded for the cross-user rows. |

"Nothing is added" / "other books remain" are verified by re-reading the user's collection through
`GET /Account/v1/User/{UUID}` with the owner's token.

## Ambiguities / open questions

| Item | Handling |
| --- | --- |
| G1 — body fields of `POST /Account/v1/User` not stated | mechanics: drafted as `{ userName, password }` (mirrors GenerateToken, api-contract.md#L9); to be confirmed in hardening. |
| G2..G5 — UI rendering of lists, detail page, login form, profile rows, delete confirmation | mechanics: discovered during hardening. |
| G6 — `DELETE /BookStore/v1/Books?UserId=` (remove all) has no AC | `# OPEN-QUESTION:` — not tested. |
| Error bodies: whether `code` is compared as string | R1 says the code is a string; the error scenarios assert `code` as the string literal from the table (e.g. "1200"). |
| AC-4 "filters the list while typing" — timing | Asserted as: after typing (no submit), the visible list equals the expected set. No latency threshold is stated, so none is asserted. |
| AC-12 invalid token | An obviously malformed Bearer value is used; the requirement says "no/invalid token" without defining invalid. |

## Revisions

None.
