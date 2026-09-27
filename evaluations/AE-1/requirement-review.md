# Requirement review — AE-1: Product search and catalogue on the shop and the public product API

_Written from `requirement/story.md` and `requirement-contract.json` only, before any access to the AUT._

## Sources used

| Source | Contributes |
| --- | --- |
| requirement/story.md — Description | Actors (shopper, partner app using the public product API) and goal |
| requirement/story.md — Context | Products page route (`/products`), heading "All Products", search box "Search Product" + search button; API endpoints `GET /api/productsList`, `POST /api/searchProduct` (form-encoded, parameter `search_product`); example terms; out of scope (punctuation/special characters, sorting, pagination, cart) |
| requirement/story.md — Acceptance criteria | AC-1 … AC-11 (Gherkin), expected product names for "jean", error status + message for a missing parameter, headings "Searched Products" / "All Products" |
| requirement/story.md — PO comment (2026-09-26) | Replaces AC-4: search matches name **or category name**; brand is not searched ("Polo" example); contains + case-insensitive matching; example "Sleeves Top and Short - Blue & Pink" (Kids > Dress) |
| requirement-contract.json (reviewed) | Gap resolutions G1–G7, rules R1–R4, error model E1 |

No attachments.

## Testability decisions

| Clause | How it is verified |
| --- | --- |
| AC-1 "lists the products of the catalogue in a products array" | the body has a non-empty `products` array (a catalogue with no product is not "the catalogue") |
| AC-1 "every product has id, name, price, brand, category" / category holds usertype + category name | schema check on **every** product (`checkShape`); the category's name field is mechanics (G3), discovered in hardening |
| AC-1 price format | every `price` matches `^Rs\. <amount>$`; "amount" is read as a whole number or decimal (`\d+(\.\d+)?`), the example is "Rs. 500" |
| AC-2 "exactly these products" | the set of returned product names equals the three names, compared as sorted lists (no extra, none missing, no duplicate) |
| AC-3 "return the same products" | the product identities (id) returned for "TOP" and "top" are the same sorted list |
| AC-4 "every product whose name contains dress plus every product in a Dress category, and nothing else" | the oracle is computed from the catalogue (`GET /api/productsList`, AC-1): expected = products whose name or category name contains "dress" (case-insensitive); the returned id set must equal it. Split into: (a) nothing expected is missing (incl. the named example "Sleeves Top and Short - Blue & Pink"), (b) nothing unexpected comes back. Same approach for "Polo" (brand not searched) |
| AC-5 "empty product list, not an error" | the product list is present and empty (requirement-backed); "not an error" = no error status (4xx/5xx) and no error message — assumed (G5), separate scenario tagged `@assumes:G5` |
| AC-6 "the same products as GET /api/productsList" | the id lists of both responses are equal (sorted) |
| AC-7 "response code 400" | HTTP status 400 — assumed reading (G2), own scenario tagged `@assumes:G2`; the message is checked verbatim in a separate, requirement-backed scenario (where it is carried is mechanics, G6) |
| AC-8 / AC-11 grid heading, search box value, products shown | UI assertions on the heading text, the input's value and the names on the product cards |
| AC-9 / AC-10 "every product of the catalogue is shown" / "exactly the products the API returns" | the product names shown on the page are compared, as sorted lists, with the names returned by the API in the same test |

## Ambiguities / open questions

| Item | Handling |
| --- | --- |
| G1 AC-4 as written vs PO clarification | The clarification explicitly replaces AC-4 → tested as clarified (found in requirement) |
| G2 "response code 400" — HTTP status or a body field? | Tested literally as the HTTP status (assumption), scenario tagged `@assumes:G2`; the message is tested separately so a status mismatch doesn't hide the message result |
| G5 what "not an error" means for the no-match search | Assumed: no 4xx/5xx status and no error message; tagged `@assumes:G5` |
| AC-10 terms "top" and "Men Tshirt" | Tested as outline rows exactly as given; "Men Tshirt" is a phrase and is sent unchanged |
| Product identity when comparing UI with the API | UI cards show names; comparison is by name (multiset). API-to-API comparisons use `id` (G4 mechanics) |
| Punctuation/special characters in terms | Out of scope (R4) — not tested |

## Revisions

None (single fetch, no `CHANGES.md`).
