# Requirement review — AE-3: Brands in the catalogue API and shop, and the Contact Us form

Written from `requirement/story.md`, the attachment `contact-us-mockup.png` (viewed directly and via its transcript) and
`requirement-contract.json`, before any access to the AUT.

## Sources used

| Source | Contributes |
| --- | --- |
| requirement/story.md — Description / Background | brandsList semantics (one entry per product, `id` = product id, `brand` = that product's brand); the HTTP-200 + `responseCode` convention; Brands panel on `/products` linking to a per-brand page; Contact Us page `/contact_us`; out of scope (file attachment, newsletter, categories) |
| requirement/story.md — Acceptance criteria table | AC-1 … AC-8 (verbatim in the contract and the feature header) |
| attachments/contact-us-mockup.png | the four in-scope fields and their placeholders (Name, Email, Subject, "Your Message Here"); Email is the only mandatory field (red `*`), the others "(optional)"; the Submit → "Press OK to proceed!" → OK / Cancel flow; the legend ("must not be sent while a mandatory field is empty or the e-mail is not a valid address") |
| requirement-contract.json (reviewed) | rules R1–R5, error model E1, gaps G1–G6 |

## Testability decisions

| AC | Clause | How it is verified |
| --- | --- | --- |
| AC-1 | "returns responseCode 200 and a brands array; every entry has an id and a brand" | contract test: HTTP status 200, `responseCode` 200, `brands` is an array, each entry has `id` and `brand` (shape check listing every violating entry) |
| AC-1 | "the product with that id in GET /api/productsList has exactly that brand" | integration test: build id → brand from productsList; list every brandsList entry whose id is missing from productsList or whose brand differs. R1 ("one entry per product") is checked in the same scenario as a separate soft assertion: the set of brandsList ids equals the set of productsList ids, with no id repeated |
| AC-2 | PUT, POST and DELETE "answer the same way" | one outline, one row per method: HTTP 200, body `responseCode` 405, `message` "This request method is not supported." |
| AC-3 | "lists every brand exactly once, each followed by the number of its products in parentheses" | UI: read every entry of the Brands panel; each must carry a count "(n)" (n a whole number); no brand name appears twice. "Followed by" is read visually (the count belongs to the brand's entry); the DOM order of name and count is not asserted — see ASSUMPTION A1 |
| AC-3/AC-4 | "every brand" / "exactly the distinct brand names" | AC-3 checks the panel's own form (unique, counted); what "every brand" means is taken from AC-4: the distinct brands of brandsList, compared as sets (none missing, none extra) plus count per brand |
| AC-5 | "opens that brand's page headed 'Brand - <brand> Products' that lists … exactly the products that productsList gives that brand" | E2E outline for Polo, H&M, Mast & Harbour: click the brand in the sidebar of `/products`, check the heading text, then compare the set of products on the page with the set of productsList products whose brand is that brand (none missing, none extra). How page products are matched to API products is mechanics (G2, discovered in hardening) |
| AC-6 | "offers the fields shown in the mock-up" | the Name, Email, Subject, Message (multi-line) fields and the Submit button are present, identified by the mock-up's placeholders. Literal labels / "(optional)" / red `*` are not asserted (G6, open question) |
| AC-6 | "must be filled … stops the form from being sent" | attempt to send (click Submit, accept any confirmation that appears): the form is "not sent" when no success message appears and the form stays on the page (literal reading of G5, `@needs-clarification`) |
| AC-6 | "an e-mail that is not a valid address" | one unambiguous invalid value without an "@" (`not-an-email`). Which other malformed values must be refused is G4 (open question, not tested) |
| AC-6 | "Fields marked optional may be left empty" | only a valid Email filled, Submit, OK → the success message is shown (the form was sent) |
| AC-7 | confirmation, success message, Home button, home page | the browser dialog is a `confirm` whose message is "Press OK to proceed!"; after OK the success text is shown, the form fields are gone and a "Home" button is shown; clicking it lands on the home page (how the home page is recognised: G3, discovered in hardening) |
| AC-8 | Cancel keeps everything | dismiss the dialog; no success message, form fields still visible and each still holds the typed value |

Test data: none seeded. The brand checks read the existing catalogue (reference data, read-only). The Contact Us tests
type unique values (`unique()`); the AUT offers no way to delete a sent contact message, so nothing is cleaned up
(unique names keep leftovers identifiable). Sending is kept to the few scenarios that need it.

## Ambiguities / open questions

| Gap | Question | Handling |
| --- | --- | --- |
| G4 (oracle) | which e-mail values count as "not a valid address" | OPEN-QUESTION; only `not-an-email` (no "@") is tested, which is invalid under any reading |
| G5 (oracle) | what shows the form was not sent | tested literally: no success message after attempting to send, form still on the page (no validation text asserted); `@needs-clarification` |
| G6 (oracle) | must the mock-up's labels/markers appear literally | OPEN-QUESTION; only the fields (by placeholder) and the Submit button are asserted |
| A1 (assumption) | "each followed by the number … in parentheses" | a count "(n)" must be part of each brand entry; its DOM position relative to the name is not asserted (the mock-up does not cover the panel) |

## Revisions

None (single fetch).
