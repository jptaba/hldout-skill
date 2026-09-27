# Requirement contract — AE-3: Brands in the catalogue API and shop, and the Contact Us form

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ⚠️ not reviewed

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | goal, background rules for brandsList and the shop, out of scope, AC-1..AC-8 |
| attachments/contact-us-mockup.png | Contact Us fields, which are mandatory/optional, the submit/confirm/cancel flow (read through transcripts/contact-us-mockup.png.md) |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | GET /api/brandsList returns responseCode 200 and a brands array; every entry has an id and a brand. For every entry, the product with that id in GET /api/productsList has exactly that brand. | HTTP status 200 (R2); body field responseCode is 200; body contains a brands array; every brands entry has an id and a brand; for every brands entry, the product with that id in GET /api/productsList has exactly that brand | story.md#L31 |
| AC-2 | api | PUT /api/brandsList is not supported: the HTTP status stays 200 and the JSON body is responseCode 405 with message "This request method is not supported.". POST and DELETE on /api/brandsList answer the same way. | PUT /api/brandsList: HTTP status 200; PUT /api/brandsList: body responseCode 405; PUT /api/brandsList: body message "This request method is not supported."; POST /api/brandsList: HTTP status 200, body responseCode 405, message "This request method is not supported."; DELETE /api/brandsList: HTTP status 200, body responseCode 405, message "This request method is not supported." | story.md#L32 |
| AC-3 | ui | The "Brands" panel on the Products page lists every brand exactly once, each followed by the number of its products in parentheses, e.g. "(6)". | no brand appears more than once in the "Brands" panel; each brand is followed by its product count in parentheses, e.g. "(6)" | story.md#L33 |
| AC-4 | e2e | The brands in the sidebar are exactly the distinct brand names in GET /api/brandsList, and the number shown next to each brand equals the number of brandsList entries with that brand. | the set of brands in the sidebar equals the set of distinct brand names in GET /api/brandsList (none missing, none extra); for each brand, the number shown next to it equals the number of brandsList entries with that brand | story.md#L34 |
| AC-5 | e2e | Clicking a brand in the sidebar opens that brand's page headed "Brand - <brand> Products" (e.g. "Brand - Polo Products") that lists only that brand's products: exactly the products that GET /api/productsList gives that brand. Check at least Polo, H&M and Mast & Harbour. | clicking brand Polo opens a page headed "Brand - Polo Products"; the page heading has the form Brand - <brand> Products for each checked brand (at least Polo, H&M, Mast & Harbour); the brand page lists exactly the products that GET /api/productsList gives that brand: none missing, none of another brand; checked for at least Polo, H&M and Mast & Harbour | story.md#L35 |
| AC-6 | ui | The Contact Us form offers the fields shown in the mock-up; the mandatory field(s) marked in the mock-up must be filled for the form to be sent, and an e-mail that is not a valid address stops the form from being sent. Fields marked optional may be left empty. | the form offers the fields Name, Email, Subject and Message shown in the mock-up (Attachment is out of scope); with Email empty the form is not sent; with an Email that is not a valid address the form is not sent; with a valid Email and Name, Subject and Message left empty the form can be sent | story.md#L36 |
| AC-7 | ui | Sending the form follows the mock-up: the customer is asked to confirm; after confirming, the message "Success! Your details have been submitted successfully." is shown and the form is replaced by a "Home" button that returns to the home page. | clicking "Submit" on a validly filled form opens a browser confirmation "Press OK to proceed!"; after OK, the message "Success! Your details have been submitted successfully." is shown (mock-up: green success banner above the form); after OK, the form is replaced by a "Home" button; clicking "Home" returns to the home page | story.md#L37 |
| AC-8 | ui | If the customer cancels the confirmation, no success message is shown and the form stays on the page with what they typed. | after Cancel on the "Press OK to proceed!" confirmation, the message "Success! Your details have been submitted successfully." is not shown; after Cancel, the form is still on the page and every field keeps the text that was typed | story.md#L38 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /api/brandsList | none | HTTP 200, body responseCode 200 and a brands array of { id, brand } entries, one per catalogue product | story.md#L21 |
| PUT /api/brandsList |  |  | story.md#L32 |
| POST /api/brandsList |  |  | story.md#L32 |
| DELETE /api/brandsList |  |  | story.md#L32 |
| GET /api/productsList |  |  | story.md#L31 |

## Rules and boundaries

- **R1** GET /api/brandsList returns the brand of every catalogue product, one entry per product: entry id is the product id and brand is that product's brand. A brand appears once per product it has; the distinct brand names are our brands. _(story.md#L21)_
- **R2** Like the rest of the public catalogue API, brandsList always answers with HTTP status 200 and reports the outcome in the responseCode field of its JSON body. _(story.md#L22)_
- **R3** Contact Us form fields (mock-up): Name (optional), Email (mandatory, marked *), Subject (optional), Message (optional), Attachment (optional, not part of this story). _(transcripts/contact-us-mockup.png.md#L5-L9)_
- **R4** The form must not be sent while a mandatory field is empty or the e-mail is not a valid address. _(transcripts/contact-us-mockup.png.md#L12)_
- **R5** Submit flow (mock-up): Submit -> browser confirmation "Press OK to proceed!" -> OK shows the green success banner above the form and replaces the form with a "Home" button. Cancel keeps the form as filled, no banner. _(transcripts/contact-us-mockup.png.md#L11)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | Unsupported method (PUT, POST or DELETE) on /api/brandsList | 200 | responseCode 405 with message "This request method is not supported." | story.md#L32 |

## Authentication

none: GET /api/brandsList is a public endpoint _(story.md#L21)_

## Test data

No seeding: brand checks read the existing catalogue through GET /api/brandsList and GET /api/productsList (brand data comes from the same catalogue as the products); Contact Us tests type their own input into the form.

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | response shape of GET /api/productsList: key of the product array and the fields holding a product's id and brand | mechanics | yes | AC-1, AC-5 | story → attachments | open |
| G2 | how a product listed on a brand page is matched to its GET /api/productsList entry (e.g. product name or id in the product link) | mechanics | yes | AC-5 | story → attachments | open |
| G3 | what counts as a valid e-mail address (which inputs must stop the form) | oracle | no | AC-6 | story → attachments | open |
| G4 | observable sign that the form was not sent when Email is empty or invalid (no validation message is specified) | oracle | no | AC-6 | story → attachments | open |
| G5 | route or recognisable marker of the home page that the "Home" button returns to | mechanics | yes | AC-7 | story → attachments | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context | story goal; each part is captured by AC-1..AC-8 |
| story.md#L21 | R1, endpoint, auth, test-data |  |
| story.md#L22 | R2 |  |
| story.md#L23 | context, AC-3, AC-5 | Products page route /products and the "Brands" panel are the entry point of AC-3..AC-5; brand links are exercised by AC-5 |
| story.md#L24 | context, AC-6 | Contact Us page route /contact_us and the pointer to the mock-up, which is transcribed and captured in R3..R5 |
| story.md#L25 | out-of-scope |  |
| story.md#L29 | not-a-requirement | header row of the acceptance-criteria table |
| story.md#L31 | AC-1 |  |
| story.md#L32 | AC-2, E1 |  |
| story.md#L33 | AC-3 |  |
| story.md#L34 | AC-4 |  |
| story.md#L35 | AC-5 |  |
| story.md#L36 | AC-6 |  |
| story.md#L37 | AC-7 |  |
| story.md#L38 | AC-8 |  |
| transcripts/contact-us-mockup.png.md#L3 | context | mock-up caption: identifies the page (/contact_us) and the "Get In Touch" form; not to scale |
| transcripts/contact-us-mockup.png.md#L4 | context | form heading "GET IN TOUCH"; identifies the form named in story L24, no criterion attached to it |
| transcripts/contact-us-mockup.png.md#L5-L8 | AC-6, R3 |  |
| transcripts/contact-us-mockup.png.md#L9 | R3, out-of-scope | Attachment field is marked not part of this story (also story L25) |
| transcripts/contact-us-mockup.png.md#L10 | AC-7 | "Submit" button that starts the flow |
| transcripts/contact-us-mockup.png.md#L11 | AC-7, AC-8, R5 |  |
| transcripts/contact-us-mockup.png.md#L12 | AC-6, R4, G3, G4 |  |
