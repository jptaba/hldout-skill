# Evidence pack — AE-3

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).

**Non-text attachments** — open each with the Read tool and transcribe what it states into `requirement/transcripts/<file>.md`
(first line `transcribedFrom: attachments/<file>`); then re-run `contract KEY --pack` so the transcript is numbered here:

- attachments/contact-us-mockup.png (transcribed)


## story.md

```text
  L1   | ---
  L2   | key: AE-3
  L3   | summary: "Brands in the catalogue API and shop, and the Contact Us form"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: []
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/AE-3
  L10  | fetchedAt: 2026-09-27T00:53:30.593Z
  L11  | ---
  L12  | 
  L13  | # AE-3: Brands in the catalogue API and shop, and the Contact Us form
  L14  | 
  L15  | ## Description
  L16  | 
● L17  | **Goal:** shoppers can browse the catalogue by brand, partners can read our brands through the public API, and anyone can reach us through the Contact Us form.
  L18  | 
  L19  | ## Background
  L20  | 
● L21  | - Brand data comes from the same catalogue as the products. The public endpoint `GET /api/brandsList` (same host as the shop) returns the brand of every catalogue product: **one entry per product**, where the entry `id` is the product id and `brand` is that product's brand. A brand therefore appears once per product it has; the distinct brand names are our brands.
● L22  | - Like the rest of the public catalogue API, `brandsList` always answers with HTTP status 200 and reports the outcome in the `responseCode` field of its JSON body.
● L23  | - In the shop, the left-hand sidebar of the **Products** page (`/products`) has a "Brands" panel; each brand links to a page listing that brand's products.
● L24  | - The **Contact Us** page (`/contact_us`) has a "Get In Touch" form. The attached mock-up **contact-us-mockup.png** shows the agreed fields, which of them are mandatory, and the submit flow.
● L25  | - Out of scope: the file attachment on the Contact Us form, the newsletter subscription box, categories.
  L26  | 
  L27  | ## Acceptance criteria
  L28  | 
● L29  | | ID | Criterion | Layer |
  L30  | | --- | --- | --- |
● L31  | | AC-1 | `GET /api/brandsList` returns `responseCode` 200 and a `brands` array; every entry has an `id` and a `brand`. For every entry, the product with that `id` in `GET /api/productsList` has exactly that brand. | API |
● L32  | | AC-2 | `PUT /api/brandsList` is not supported: the HTTP status stays 200 and the JSON body is `responseCode` 405 with `message` "This request method is not supported.". POST and DELETE on `/api/brandsList` answer the same way. | API |
● L33  | | AC-3 | The "Brands" panel on the Products page lists every brand exactly once, each followed by the number of its products in parentheses, e.g. "(6)". | UI |
● L34  | | AC-4 | The brands in the sidebar are exactly the distinct brand names in `GET /api/brandsList`, and the number shown next to each brand equals the number of `brandsList` entries with that brand. | E2E (UI + API) |
● L35  | | AC-5 | Clicking a brand in the sidebar opens that brand's page headed "Brand - &lt;brand&gt; Products" (e.g. "Brand - Polo Products") that lists only that brand's products: exactly the products that `GET /api/productsList` gives that brand. Check at least Polo, H&M and Mast & Harbour. | E2E (UI + API) |
● L36  | | AC-6 | The Contact Us form offers the fields shown in the mock-up; the mandatory field(s) marked in the mock-up must be filled for the form to be sent, and an e-mail that is not a valid address stops the form from being sent. Fields marked optional may be left empty. | UI |
● L37  | | AC-7 | Sending the form follows the mock-up: the customer is asked to confirm; after confirming, the message "Success! Your details have been submitted successfully." is shown and the form is replaced by a "Home" button that returns to the home page. | UI |
● L38  | | AC-8 | If the customer cancels the confirmation, no success message is shown and the form stays on the page with what they typed. | UI |
  L39  | 
  L40  | ## Attachments
  L41  | 
  L42  | | File | MIME | Bytes | How to read | Local path |
  L43  | | --- | --- | --- | --- | --- |
  L44  | | contact-us-mockup.png | image/png | 27971 | image — open with the Read tool (vision) | attachments/contact-us-mockup.png |
  L45  | 
```

## transcripts/contact-us-mockup.png.md

```text
  L1   | transcribedFrom: attachments/contact-us-mockup.png
  L2   | 
● L3   | Caption (small grey text, top left): "Mock-up — Contact Us page (/contact_us), "Get In Touch" form — not to scale"
● L4   | Heading (orange, centred): "GET IN TOUCH"
● L5   | Field: label "Name" followed by "(optional)"; single-line text input, placeholder "Name"; left of the first row.
● L6   | Field: label "Email" followed by a red asterisk "*"; single-line text input, placeholder "Email"; right of the first row.
● L7   | Field: label "Subject" followed by "(optional)"; single-line text input, placeholder "Subject"; full width.
● L8   | Field: label "Message" followed by "(optional)"; multi-line text area, placeholder "Your Message Here"; full width.
● L9   | Field: label "Attachment" followed by "(optional — not part of this story)"; file input showing "Choose file"; full width.
● L10  | Button (orange, white text): "Submit"
● L11  | Note (yellow box below the button): "Submit → browser confirmation "Press OK to proceed!" → OK shows the green success banner above the form and replaces the form with a "Home" button. Cancel keeps the form as filled, no banner."
● L12  | Legend (bottom, below a separator line): "* mandatory — the form must not be sent while a mandatory field is empty or the e-mail is not a valid address."
  L13  | 
```
