# Requirement contract — AE-3: Brands in the catalogue API and shop, and the Contact Us form

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ✅ all items supported — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | goal, background (brandsList semantics, HTTP 200 + responseCode convention, Brands panel on /products, Contact Us page /contact_us, out of scope), AC table AC-1..AC-8 |
| attachments/contact-us-mockup.png | via transcripts/contact-us-mockup.png.md: Contact Us fields, which are optional / mandatory, confirmation text "Press OK to proceed!", OK / Cancel flow, validation legend |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | api | GET /api/brandsList returns responseCode 200 and a brands array; every entry has an id and a brand. For every entry, the product with that id in GET /api/productsList has exactly that brand. | HTTP status 200 (R2); body responseCode 200; body has a "brands" array; every entry has an "id" and a "brand"; for every entry, the product with that id in GET /api/productsList has exactly that brand; one entry per catalogue product (R1, story.md#L21) | story.md#L31 |
| AC-2 | api | PUT /api/brandsList is not supported: the HTTP status stays 200 and the JSON body is responseCode 405 with message "This request method is not supported.". POST and DELETE on /api/brandsList answer the same way. | PUT /api/brandsList: HTTP status 200, body responseCode 405 and message "This request method is not supported."; POST /api/brandsList: HTTP status 200, body responseCode 405 and message "This request method is not supported."; DELETE /api/brandsList: HTTP status 200, body responseCode 405 and message "This request method is not supported." | story.md#L32 |
| AC-3 | ui | The "Brands" panel on the Products page lists every brand exactly once, each followed by the number of its products in parentheses, e.g. "(6)". | the "Brands" panel in the left-hand sidebar of /products lists every brand; no brand is listed more than once; each brand is followed by the number of its products in parentheses, e.g. "(6)" | story.md#L33 |
| AC-4 | e2e | The brands in the sidebar are exactly the distinct brand names in GET /api/brandsList, and the number shown next to each brand equals the number of brandsList entries with that brand. | the set of brands in the sidebar equals the set of distinct brand names in GET /api/brandsList (none missing, none extra); the number shown next to each brand equals the number of brandsList entries with that brand | story.md#L34 |
| AC-5 | e2e | Clicking a brand in the sidebar opens that brand's page headed "Brand - <brand> Products" (e.g. "Brand - Polo Products") that lists only that brand's products: exactly the products that GET /api/productsList gives that brand. Check at least Polo, H&M and Mast & Harbour. | clicking a brand in the sidebar opens a page headed "Brand - <brand> Products" (e.g. "Brand - Polo Products"); the page lists exactly the products that GET /api/productsList gives that brand (none missing, none extra); checked for at least Polo, H&M and Mast & Harbour | story.md#L35 |
| AC-6 | ui | The Contact Us form offers the fields shown in the mock-up (Name, Email, Subject, Message; the Attachment field is not part of this story); the mandatory field marked in the mock-up (Email) must be filled for the form to be sent, and an e-mail that is not a valid address stops the form from being sent. Fields marked optional (Name, Subject, Message) may be left empty. | the form offers the fields Name (placeholder "Name"), Email (placeholder "Email"), Subject (placeholder "Subject") and Message (multi-line, placeholder "Your Message Here"), and a "Submit" button; with Email empty, the form is not sent; with an e-mail that is not a valid address, the form is not sent; with a valid Email and Name, Subject and Message left empty, the form can be sent | story.md#L36 |
| AC-7 | ui | Sending the form follows the mock-up: the customer is asked to confirm (browser confirmation "Press OK to proceed!"); after confirming, the message "Success! Your details have been submitted successfully." is shown and the form is replaced by a "Home" button that returns to the home page. | clicking "Submit" on a valid form opens a browser confirmation "Press OK to proceed!"; after OK, the message "Success! Your details have been submitted successfully." is shown (mock-up: green banner above the form); after OK, the form is replaced by a "Home" button; clicking "Home" returns to the home page | story.md#L37 |
| AC-8 | ui | If the customer cancels the confirmation, no success message is shown and the form stays on the page with what they typed. | after Cancel on the "Press OK to proceed!" confirmation, no success message is shown; the form stays on the page; every field still holds what was typed | story.md#L38 |

## Endpoints

| Endpoint | Auth | Success | Source |
| --- | --- | --- | --- |
| GET /api/brandsList | none | HTTP 200, body responseCode 200 with a "brands" array of { id, brand } (story.md#L22, story.md#L31) | story.md#L21 |
| PUT /api/brandsList | none |  | story.md#L32 |
| POST /api/brandsList | none |  | story.md#L32 |
| DELETE /api/brandsList | none |  | story.md#L32 |
| GET /api/productsList | none |  | story.md#L31 |

## Rules and boundaries

- **R1** GET /api/brandsList returns one entry per catalogue product: the entry id is the product id and brand is that product's brand. A brand appears once per product it has; the distinct brand names are our brands. _(story.md#L21)_
- **R2** The public catalogue API, brandsList included, always answers with HTTP status 200 and reports the outcome in the responseCode field of its JSON body. _(story.md#L22)_
- **R3** In the Brands panel of the Products page sidebar, each brand links to a page listing that brand's products. _(story.md#L23)_
- **R4** Contact Us form: Email is mandatory (red asterisk); Name, Subject and Message are optional. The form must not be sent while a mandatory field is empty or the e-mail is not a valid address. _(transcripts/contact-us-mockup.png.md#L5-L8, transcripts/contact-us-mockup.png.md#L12, story.md#L36)_
- **R5** Submit flow: Submit → browser confirmation "Press OK to proceed!" → OK shows the green success banner above the form and replaces the form with a "Home" button; Cancel keeps the form as filled, no banner. _(transcripts/contact-us-mockup.png.md#L10-L11, story.md#L37-L38)_

## Error model

| # | Case | Status | Body | Source |
| --- | --- | --- | --- | --- |
| E1 | PUT, POST or DELETE on /api/brandsList (method not supported) | 200 | responseCode 405 with message "This request method is not supported." | story.md#L32 |

## Test data

none seeded: the brand checks read the existing catalogue (read-only); the Contact Us tests type their own values into the form
- the catalogue must contain the brands Polo, H&M and Mast & Harbour (story.md#L35)
- brand data comes from the same catalogue as the products (story.md#L21)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | shape of the GET /api/productsList response: where the product list, each product's id and its brand are found | mechanics | yes | AC-1, AC-5 | story → attachments → aut | discovered-in-aut: body.products[] — each product has id and brand |
| G2 | how to match the products listed on a brand page to products in GET /api/productsList (e.g. by name or by product link / id) | mechanics | yes | AC-5 | story → aut | discovered-in-aut: match by product id taken from the "View Product" link /product_details/{id} |
| G3 | how to recognise the home page reached through the "Home" button (route or landmark) | mechanics | yes | AC-7 | story → attachments → config → aut | discovered-in-aut: home page = URL https://automationexercise.com/ (path /) |
| G4 | which e-mail values count as "not a valid address" (which malformed values must be refused) | oracle | no | AC-6 | story → attachments | open |
| G5 | what observably shows that the form was not sent: no browser confirmation, no success message, a validation message (its text is not stated), or several of these | oracle | no | AC-6 | story → attachments | open |
| G6 | whether AC-6 requires the mock-up's labels and markers to appear literally ("Name"/"Subject"/"Message" followed by "(optional)", "Email" with a red "*", the legend) or only that the fields exist; the mock-up is marked "not to scale" | oracle | no | AC-6 | story → attachments | open |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L17 | context | goal statement; actors captured in actors[] |
| story.md#L21 | R1, endpoint, test-data, AC-1 |  |
| story.md#L22 | R2, AC-1, AC-2 |  |
| story.md#L23 | R3, context, AC-3, AC-5 |  |
| story.md#L24 | context, AC-6 | Contact Us page route and pointer to the mock-up, which is transcribed and captured |
| story.md#L25 | out-of-scope |  |
| story.md#L29 | not-a-requirement | header row of the acceptance-criteria table |
| story.md#L31 | AC-1, G1 |  |
| story.md#L32 | AC-2, E1 |  |
| story.md#L33 | AC-3 |  |
| story.md#L34 | AC-4 |  |
| story.md#L35 | AC-5, G1, G2, test-data |  |
| story.md#L36 | AC-6, R4, G4, G5, G6 |  |
| story.md#L37 | AC-7, R5, G3 |  |
| story.md#L38 | AC-8, R5 |  |
| transcripts/contact-us-mockup.png.md#L3 | context, G6 | caption: page /contact_us, "Get In Touch" form, mock-up not to scale |
| transcripts/contact-us-mockup.png.md#L4 | context | form heading "GET IN TOUCH"; no criterion asserts it, it identifies the form named in story.md#L24 |
| transcripts/contact-us-mockup.png.md#L5-L8 | AC-6, R4, G6 |  |
| transcripts/contact-us-mockup.png.md#L9 | out-of-scope | Attachment field, marked "not part of this story"; also out of scope per story.md#L25 |
| transcripts/contact-us-mockup.png.md#L10 | AC-6, AC-7, R5 |  |
| transcripts/contact-us-mockup.png.md#L11 | AC-7, AC-8, R5 |  |
| transcripts/contact-us-mockup.png.md#L12 | AC-6, R4, G4, G5 |  |
