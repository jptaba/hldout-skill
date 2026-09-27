# Held-out evaluator — scorecard

Generated 2026-09-27T16:56:19.146Z by `demo/score.ts` from `demo/answer-keys/*.json` (written before each evaluation).

| Story | AUT | Expected verdict | Actual verdict | Defects found (recall) | False positives | Seeded script defects caught | Auto-triage vs confirmed decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AE-1 | automation-exercise | PASS_WITH_WARNINGS | ✅ PASS_WITH_WARNINGS | 0/0 (n/a) | 0 | 0/0 | 1/1 (100%) · abstained 0 · wrong 0 |
| AE-2 | automation-exercise | FAIL | ✅ FAIL | 3/3 (100%) | 0 | 0/0 | 6/6 (100%) · abstained 0 · wrong 0 |
| AE-3 | automation-exercise | PASS | ❌ PASS_WITH_WARNINGS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| CL-1 | contact-list | FAIL | _not evaluated_ | | | | |
| CL-2 | contact-list | FAIL | _not evaluated_ | | | | |
| CL-3 | contact-list | PASS | _not evaluated_ | | | | |
| CL-4 | contact-list | FAIL | _not evaluated_ | | | | |
| DEMO-101 | swag-labs | FAIL | ✅ FAIL | 3/3 (100%) | 0 | 1/1 | 4/4 (100%) · abstained 0 · wrong 0 |
| DEMO-202 | shady-meadows | FAIL | ✅ FAIL | 9/9 (100%) | 0 | 1/1 | 12/12 (100%) · abstained 0 · wrong 0 |
| DEMO-303 | restful-booker | FAIL | ✅ FAIL | 6/6 (100%) | 0 | 1/1 | 12/13 (92%) · abstained 1 · wrong 0 |
| DEMO-404 | the-internet | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| DEMO-505 | the-internet | PASS_WITH_WARNINGS | ✅ PASS_WITH_WARNINGS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| DEMO-606 | the-internet | FAIL | ✅ FAIL | 1/1 (100%) | 0 | 0/0 | 1/1 (100%) · abstained 0 · wrong 0 |
| DEMO-707 | conduit | FAIL | ✅ FAIL | 7/7 (100%) | 0 | 1/1 | 12/12 (100%) · abstained 0 · wrong 0 |
| DQ-1 | demoqa | FAIL | ✅ FAIL | 2/2 (100%) | 0 | 0/0 | 3/3 (100%) · abstained 0 · wrong 0 |
| DQ-2 | demoqa | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 | 0/1 (0%) · abstained 0 · wrong 1 |
| DQ-3 | demoqa | FAIL | ✅ FAIL | 2/2 (100%) | 0 | 0/0 | 8/8 (100%) · abstained 0 · wrong 0 |
| JS-1 | juice-shop | FAIL | _not evaluated_ | | | | |
| JS-2 | juice-shop | FAIL | _not evaluated_ | | | | |
| PB-1 | parabank | FAIL | ✅ FAIL | 1/1 (100%) | 0 | 0/0 | 0/1 (0%) · abstained 1 · wrong 0 |
| PB-2 | parabank | FAIL | ✅ FAIL | 2/2 (100%) | 1 | 0/0 | 1/5 (20%) · abstained 1 · wrong 3 |
| PB-3 | parabank | FAIL | ✅ FAIL | 2/2 (100%) | 0 | 0/0 | 6/6 (100%) · abstained 0 · wrong 0 |
| PB-4 | parabank | PASS_WITH_WARNINGS | _not evaluated_ | | | | |
| TOOL-1 | toolshop | FAIL | ✅ FAIL | 2/2 (100%) | 0 | 1/1 | 3/3 (100%) · abstained 0 · wrong 0 |
| TOOL-2 | toolshop | FAIL | ✅ FAIL | 1/1 (100%) | 0 | 0/0 | 1/1 (100%) · abstained 0 · wrong 0 |
| TOOL-3 | toolshop | FAIL | ✅ FAIL | 2/2 (100%) | 0 | 1/1 | 6/6 (100%) · abstained 0 · wrong 0 |
| TOOL-4 | toolshop | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| TOOLB-1 | toolshop-rc | FAIL | _not evaluated_ | | | | |
| TOOLB-2 | toolshop-rc | FAIL | _not evaluated_ | | | | |
| **Total** | | | 19/20 verdicts | 43/43 (100%) | 1 | 6/6 | 76/83 (92%) · wrong 4 |

Precision: 98% (43 of 44 confirmed findings are real).

## AE-1 (automation-exercise)

Verdict: expected **PASS_WITH_WARNINGS**, got **PASS_WITH_WARNINGS** ✅ · tests 19/20 passed

_No defects expected._

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-012 | `04-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _AC-7 ambiguity: HTTP status is 200, body responseCode is 400. Reporting it as a confirmed defect (HTTP 200 != 400) is wrong; silently passing it without surfacing the ambiguity is also wrong. Expected: a gap / open question -> PASS_WITH_WARNINGS._; _comment-1 (PO) replaces AC-4: search matches name OR category. 'dress' returns 'Sleeves Top and Short - Blue & Pink' (id 16, Kids > Dress) and 'Sleeveless Unicorn Patch Gown - Pink' (id 19, Kids > Dress) whose names lack 'dress'. An evaluator that applies the original AC-4 text reports a false defect._; _comment-1: brand is not searched. 'Polo' returns only 'Premium Polo T-Shirts' (id 30), not the 6 Polo-brand products. Expecting brand matches is a false positive._; _Headings are CSS text-transform: uppercase. innerText gives 'SEARCHED PRODUCTS' / 'ALL PRODUCTS', textContent gives 'Searched Products' / 'All Products'. Case-sensitive innerText assertions against the story text fail falsely (script defect)._; _Every product card appears twice in the DOM (productinfo + overlay); counting raw 'Add to cart' links or name elements double-counts. Dedupe by data-product-id._; _All API responses are HTTP 200 with the outcome in responseCode, and Content-Type is text/html even though the body is JSON; parse the body as JSON regardless of the header._; _searchProduct only reads form-encoded fields (application/x-www-form-urlencoded); a JSON request body gets responseCode 400 'parameter is missing'. Sending JSON and then reporting AC-2/AC-5/AC-6 failures is a script defect._; _The UI search only triggers on the search button (#submit_search) — pressing Enter in the box does nothing (it is not inside a form). The button navigates to /products?search=<term>._; _The UI search box builds the URL without encoding; a term with '&' is truncated (e.g. 'Fit & Flare' shows 3 products in the UI vs 1 via the API). This is a real AUT issue but explicitly out of scope ('punctuation and special characters ... tracked separately'); it must not fail AC-10 (whose examples are 'top', 'dress', 'Men Tshirt'). At most an observation._; _The home page (/) has no search box; the search is on /products._; _Third-party ads / Google consent / vignette overlays may appear; block googlesyndication/doubleclick/fundingchoices requests or dismiss them; they are not part of any AC._

## AE-2 (automation-exercise)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 32/38 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 Story/contract: e-mail uniqueness is case-insensitive; registering an address differing only in letter case must be refused with responseCode 400 'Email already exists!'. The AUT creates a second account (responseCode 201 'User created!') for the upper-cased address. | AC-3 | genuine | ✅ APP-1: E-mail uniqueness is case-sensitive: an address differing only in letter case creates a second account |
| D2 Story/contract: createAccount with an e-mail that is not a valid address (e.g. no '@') is refused with responseCode 400 and no account is created. The AUT accepts it: responseCode 201 'User created!' and the account exists. | AC-5 | genuine | ✅ APP-2: createAccount accepts invalid e-mail addresses and creates the account |
| D3 Contract §2.3 lists mobile_number among the user fields returned by getUserDetailByEmail (AC-7: every listed field, holding the registration values). The AUT's user object has no mobile_number (all other listed fields are present, with values matching registration). | AC-7 | embedded | ✅ APP-3: getUserDetailByEmail omits mobile_number from the user object |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-004 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-006 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-013 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-014 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _Envelope: every listed call answers HTTP 200; the codes in the story/contract are the body's responseCode (stated explicitly in contract §1.1). Asserting HTTP 201/400/404/405 is a script defect, not an AUT defect. Content-Type is text/html although the body is JSON._; _Parameters must be form-encoded in the request body, including for DELETE /deleteAccount and PUT /updateAccount. Sending DELETE params in the query string gives responseCode 400 'Bad request, email parameter is missing in DELETE request.'; sending JSON gives 'parameter is missing' answers. Reporting those as AUT failures is wrong._; _Response field names differ from request names (birth_date -> birth_day, firstname -> first_name, lastname -> last_name); the contract lists the response names. Only mobile_number is actually missing._; _createAccount checks required fields in a fixed order and reports the first missing one; when testing AC-4, drop one field at a time. Required: name, email, password, firstname, lastname, address1, country, zipcode, state, city, mobile_number (all verified to give 400 'Bad request, <field> parameter is missing in POST request.' and no account). title, birth_*, company, address2 are optional (verified 201)._; _Wrong-method probes outside the contract answer differently: POST /updateAccount, POST /deleteAccount and GET /createAccount return a real HTTP 405 with {"detail": "Method \"POST\" not allowed."}. The contract only fixes DELETE /verifyLogin (body 405, HTTP 200) — met. Do not generalise._; _Cleanup: D1 and D2 probes create extra accounts (upper-case and invalid e-mail) — they can and should be deleted with deleteAccount using that exact address._; _verifyLogin with the e-mail in a different letter case answers 404 'User not found!' — this is NOT the AC-3 finding (AC-3 is about registration uniqueness); do not conflate._; _UI: header text is 'Logged in as <name>' in the nav bar; login form fields use data-qa attributes (login-email, login-password, login-button). Wrong password error text: 'Your email or password is incorrect!'. Ads/consent overlays may appear; block ad domains._; _AE_USER_PASSWORD contains special characters (e.g. '!', '#'); it must be URL-encoded in form bodies (Playwright form: {} does this)._

## AE-3 (automation-exercise)

Verdict: expected **PASS**, got **PASS_WITH_WARNINGS** ❌ · tests 16/16 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _brandsList returns 34 entries with repeated brand names (one per product, id = product id). The story states this explicitly; reporting 'duplicate brands' as a defect is a false positive._; _AC-2 is explicit: HTTP 200 with body responseCode 405 'This request method is not supported.' for PUT/POST/DELETE. Asserting HTTP 405 is a script defect._; _Content-Type of the API is text/html although the body is JSON; parse the body regardless._; _The mandatory fields are only in the image attachment contact-us-mockup.png: only Email is marked mandatory (*); Name, Subject, Message are optional, attachment out of scope. An evaluator that assumes all fields are mandatory will report a false defect (the AUT sends the form with only Email filled)._; _Submitting the Contact Us form opens a native confirm() dialog 'Press OK to proceed!'. Tests must register a dialog handler (accept for AC-7, dismiss for AC-8); Playwright auto-dismisses dialogs by default, which looks like 'no success message' — a script defect, not an AUT defect._; _The form submission is handled client-side (no network request is sent on confirm); AC-7 only requires the success message and the Home button, so do not require a server call._; _Empty Email / invalid Email are blocked by native HTML5 validation (validationMessage 'Please fill out this field.' / 'Please include an '@' ...'), no custom error text on the page; the story does not specify an error text, so asserting one is a script defect._; _Headings are CSS uppercased: innerText 'BRAND - POLO PRODUCTS', textContent 'Brand - Polo Products'. Case-sensitive innerText assertions fail falsely._; _Brand sidebar items render as '(6)Polo' in textContent (count span floats right). Product cards appear twice in the DOM (dedupe by data-product-id)._; _Brand links contain raw '&' and spaces: /brand_products/H&M and /brand_products/Mast & Harbour both work; click the sidebar link rather than hand-building URLs._; _Ads/consent overlays (Google) can cover elements; block ad domains. The file upload field is out of scope._

## DEMO-101 (swag-labs)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 9/12 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 locked-account message wording | AC-2 | embedded | ✅ APP-3: Locked-account error message does not match the required wording |
| D2 credential fields not cleared | AC-3 | embedded | ✅ APP-2: Credential fields are not cleared after a failed sign-in |
| D3 10% tax rule vs 8% charged | AC-7 | embedded (attachment) | ✅ APP-1: Sales tax charged at 8% instead of the 10% in pricing-rules.md |

False positives: none ✅

| Seeded script defect | Detected |
| --- | --- |
| S1 Checkout located as a link instead of a button | ✅ SCN-011 in `02-eval` |

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-002 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-004 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-010 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-011 | `02-eval` | SCRIPT_DEFECT | SCRIPT_DEFECT | ✅ |

## DEMO-202 (shady-meadows)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 30/41 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 messages readable without auth | AC-8 | genuine | ✅ APP-1: Messages API exposes guest enquiries without authentication |
| D2 Message label not associated | AC-1 | genuine | ✅ APP-2: Message field label is not associated with its textarea |
| D3 name length rule not enforced | AC-4, AC-6 | embedded | ✅ APP-3: Name length rule (2–50 characters) is not enforced |
| D4 malformed JSON → 500 | AC-7 | genuine | ✅ APP-4: Malformed JSON returns 500 instead of 400 |
| D5 unknown room → 500 | AC-12 | genuine | ✅ APP-5: Unknown room id returns 500 instead of 404 |
| D6 all images alt 'Single Room' | AC-14 | genuine | ✅ APP-6: Every room image has the alt text 'Single Room' |
| D7 Idempotency-Key ignored | AC-16 | embedded | ✅ APP-7: Idempotency-Key is ignored: a retried enquiry is stored twice |
| D8 create returns 200 not 201 | AC-5 | embedded | ✅ APP-8: Create enquiry returns 200 OK instead of 201 Created |
| D9 email without TLD accepted | AC-4, AC-6 | embedded | ✅ APP-9: E-mail without a top-level domain is accepted |

False positives: none ✅

| Seeded script defect | Detected |
| --- | --- |
| S2 undeclared endpoint /api/messages | ✅ SCN-011 in `03-eval` |

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-001 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-005 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-006.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-006.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-006.17 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-008 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-009 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-010 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-011 | `03-eval` | SCRIPT_DEFECT | SCRIPT_DEFECT | ✅ |
| SCN-017 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-019 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-021 | `04-rerun` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

## DEMO-303 (restful-booker)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 15/27 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 bad credentials answered 200 {reason} | AC-2 | genuine | ✅ APP-1: Invalid credentials return 200 instead of 401 |
| D2 missing required field → 500 | AC-6 | genuine | ✅ APP-2: A booking missing a required field causes 500 instead of 400 |
| D3 negative totalprice accepted | AC-6 | embedded | ✅ APP-3: A negative totalprice is accepted |
| D4 checkout before checkin accepted | AC-6 | embedded | ✅ APP-4: Check-out on or before check-in is accepted |
| D5 DELETE returns 201 Created instead of 204 | AC-10 | genuine (quirk) | ✅ APP-5: Cancelling a booking returns 201 Created instead of 204 No Content |
| D6 PUT/PATCH/DELETE of unknown id → 405 not 404 | AC-11 | genuine | ✅ APP-6: Writes to a booking id that does not exist return 405 instead of 404 |

False positives: none ✅

| Seeded script defect | Detected |
| --- | --- |
| S3 DELETE test sends 'Authorisation' (misspelled) header → 403, masking D5 | ✅ SCN-013 in `02-eval` |

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-002 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.1 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.2 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.3 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.4 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-008.2 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-008.4 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-008.5 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-013 | `02-eval` | NEEDS_INVESTIGATION | SCRIPT_DEFECT | ➖ abstained (needed investigation) |
| SCN-014.1 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-014.2 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-014.3 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-013 | `03-rerun` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _intermittent slow/hanging responses from the shared herokuapp sandbox_

## DEMO-404 (the-internet)

Verdict: expected **PASS**, got **PASS** ✅ · tests 15/15 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _page 'load' event can hang on third-party assets (waitForURL/goto with default waitUntil may time out) → script defect, not app_; _table sorter attaches after DOMContentLoaded; an early click is ignored → race/script defect, not app_; _JS dialogs need handlers registered before the click_; _dynamic loading renders after ~5 s → needs web-first waiting_; _flash messages include a trailing × close icon_

## DEMO-505 (the-internet)

Verdict: expected **PASS_WITH_WARNINGS**, got **PASS_WITH_WARNINGS** ✅ · tests 6/6 passed

_No defects expected._

False positives: none ✅

## DEMO-606 (the-internet)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 1/2 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 failure message shows 'unsuccesful' (typo) ~50% of the time | AC-1 | genuine (intermittent) | ✅ APP-1: Failure notification is misspelled ('unsuccesful') |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-001 | `04-eval2` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _nondeterministic server outcome: a single-sample test would be flaky; the evaluator must not dismiss it as FLAKY_

## DEMO-707 (conduit)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 23/34 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 wrong password answered 403 instead of 401 | AC-3 | genuine | ✅ APP-3: Wrong password is answered 403 instead of 401 |
| D2 second article with the same title rejected (422) | AC-6 | embedded | ✅ APP-4: Second article with the same title is rejected (422 must be unique) |
| D3 other readers filtering by author don't see the author's new article | AC-10 | genuine (sandbox scoping) | ✅ APP-1: Other readers cannot find an author's articles by ?author= |
| D4 limit outside 1–100 accepted (200) | AC-11 | embedded | ✅ APP-6: limit outside 1–100 is accepted instead of 422 |
| D5 comments visible only to the commenter | AC-14 | genuine (sandbox scoping) | ✅ APP-2: Comments are visible only to the commenter |
| D6 deleting someone else's comment answers 404 instead of 403 | AC-15 | genuine | ✅ APP-7: Deleting someone else's comment answers 404 instead of 403 |
| D7 favouriting twice increments the count twice | AC-16 | genuine | ✅ APP-5: Favouriting is not idempotent (second favourite counts again) |

False positives: none ✅

| Seeded script defect | Detected |
| --- | --- |
| S5 create-article test (AC-5) sends the fields without the required {"article": …} envelope → 422 'can't be blank', which looks like an application validation defect | ✅ SCN-007 in `02-eval` |

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-004 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007 | `02-eval` | SCRIPT_DEFECT | SCRIPT_DEFECT | ✅ |
| SCN-008 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-012.1 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-012.2 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-013.3 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-013.4 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018.1 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018.2 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018.3 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-019 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-020 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _422 on a create looks like an app validation defect but is the test's payload (S5): the classifier's 'expected 2xx, got 400/422' rule must lead to investigation_; _users cannot be deleted via the API (seed cleanup not possible) — ledger must say so_; _per-user visibility: a check made as the author passes, the same check as another reader fails — tests must use a second user_

## DQ-1 (demoqa)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 24/27 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 PO comment-1 requires POST /Account/v1/GenerateToken with a wrong password (or unknown user) to answer 401 Unauthorized; the AUT answers 200 OK (the body itself matches AC-6: token/expires null, status Failed, result 'User authorization failed.'). | AC-6 | embedded | ✅ APP-2: GenerateToken refusal answers 200 instead of 401 Unauthorized |
| D2 AC-7 says the token must not disclose the user's password; the JWT payload issued by GenerateToken contains the password in clear text. | AC-7 | genuine | ✅ APP-1: Access token (JWT) contains the user's cleartext password |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-006.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-006.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _Comment-1 overrides AC-6 only for the HTTP status (401); the body part of AC-6 is met. An evaluator that ignores the comment will wrongly pass AC-6._; _Comment-1 explicitly says AC-8 (Authorized) stays as written: Authorized with a wrong password answers 404 'User not found!' - that is NOT a deviation (AC-8 names only the message and 'never true'). The HTTP status for that case is unspecified in the story: an open question/gap to surface, not a failure._; _Only the most recently issued token for a user is valid: every GenerateToken call (including the one the UI makes on sign-in) invalidates earlier tokens (401 'User not authorized!'). Tests that sign in on the UI and then reuse an older API token for DELETE /Account/v1/User/{UUID} get 401 - a script defect, not an app defect. Basic auth (user:password) is also accepted by protected endpoints._; _POST /Account/v1/User returns 'userID' while GET /Account/v1/User/{UUID} returns 'userId' - AC-1 names 'userID' for the create response, which matches._; _Authorized returns a bare JSON boolean (false/true) with HTTP 200, not an object._; _Sign-in page and profile use id attributes (#userName, #password, #login, #userName-value); no data-testid. Profile button label is 'Logout' (the book detail page uses 'Log out'). Ads can overlay the page; block ad domains._; _AC-11: the inputs get the Bootstrap 'is-invalid' class (red border) and the URL stays /login; there is no text message._; _AC-5: expires is exactly 7 days after issue (e.g. issued 2026-09-27T00:40:24Z -> expires 2026-10-04T00:40:24.642Z)._; _AC-2 'no account is created' is checkable via GenerateToken for the rejected user name returning status 'Failed' (HTTP 200 - the D1 status deviation belongs to AC-6; do not double-count it under AC-2)._; _Do not use the /register page (out of scope per story and comment)._

## DQ-2 (demoqa)

Verdict: expected **PASS**, got **PASS** ✅ · tests 28/28 passed

_No defects expected._

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-011 | `03-eval` | FLAKY | SCRIPT_DEFECT | ❌ wrong |

Traps in this AUT: _Only the most recently issued token for a user is valid: signing in on the UI (which calls GenerateToken) invalidates the API token obtained earlier. Checking the collection through the API after a UI sign-in with the old token gives 401 - that is a script defect, not an app defect (regenerate the token or use Basic auth)._; _AC-4 no-match case: the AUT shows no rows and the pager reads 'Page 1 of 0'. The story only requires that no book rows are listed, so this is met; failing the story on 'Page 1 of 0' or on a missing 'No rows found' text would be a false positive (at most an observation)._; _The search box does NOT match ISBNs; the story never requires ISBN search - do not invent that expectation._; _AC-5: the detail page URL is /books?search=<isbn> (not ?book=<isbn>, which just shows the full list). The story leaves the URL to discovery; clicking the title link is the reliable path._; _AC-9: deletion confirms via a modal (#closeSmallModal-ok 'OK') followed by a native alert 'Book deleted.' that must be accepted._; _Profile rows: delete icon id is 'delete-record-<isbn>'; titles link to /books?search=<isbn>. No data-testid attributes; ids are used. Ads may cover parts of the page - block ad domains._; _DELETE /BookStore/v1/Book needs a JSON body {isbn, userId}; 204 with an empty body._; _Error codes are strings ('1205', not 1205)._; _GET /Account/v1/User/{UUID} returns 'userId' (lower-case d) whereas POST /Account/v1/User returns 'userID'._; _Do not assert a fixed catalogue size: compare /books with whatever GET /BookStore/v1/Books returns (currently 8 books, all on page 1)._

## DQ-3 (demoqa)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 24/32 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 Story requires the message 'Link has responded with status <code> and status text <text>'; the page shows 'Link has responded with staus <code> and status text <text>' (misspelt 'staus') for every diagnostic link. | AC-7 | genuine | ✅ APP-2: Diagnostic response message misspells "status" as "staus" |
| D2 Story requires GET /moved to answer 301 with a Location header pointing to the home page; the AUT answers 301 Moved Permanently with no Location header at all (body is JSON {"url":"demoqa.com"}). | AC-6 | genuine | ✅ APP-1: GET /moved answers 301 without a Location header |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-006 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.3 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.5 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.6 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.7 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _The PO comment overrides the AC-4 table: the Not Found endpoint is /invalid-url (404). GET /not-found answers 200 (SPA fallback HTML); an evaluator that ignores the comment will report a false 404 deviation on AC-4._; _AC-6 status part is met (301) - only the Location header is missing; the finding must be about the header, not the status._; _HTTP clients follow redirects by default; without a Location header nothing is followed, but tests should use maxRedirects: 0 to assert the raw 301 and headers._; _/moved has a 20-byte JSON body; AC-5 explicitly excludes /moved, so this is not a deviation._; _The diagnostic anchors' href is a React-blocked javascript: URL; the click handler issues fetch GET requests - tests must observe the network (page.waitForResponse) rather than follow hrefs. Console errors about the blocked javascript: URL are noise, not a finding._; _The dynamic link label is 'Home' + 5 random letters (e.g. HomeukIBq, HomeSYtHQ); assert a prefix/regex, not exact text._; _The new-tab links have target=_blank and no rel=noopener; the story does not require rel, so it must not be reported as a failure (at most an observation)._; _401 has no WWW-Authenticate header; the story does not require one - not a deviation._; _Ads/third-party scripts on demoqa.com can overlay or slow the page; block ad hosts. Stable element ids exist (#simpleLink, #dynamicLink, #created, #no-content, #moved, #bad-request, #unauthorized, #forbidden, #invalid-url, #linkResponse)._

## PB-1 (parabank)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 13/14 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 Signing in with a wrong password shows "An internal error has occurred and has been logged." instead of AC-5 message "The username and password could not be verified." (the demo app changed after the key was written; see revisions). | AC-5 | aut-drift | ✅ APP-1: Wrong-password sign-in shows an internal-error message instead of 'The username and password could not be verified.' |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-007 | `04-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |

Traps in this AUT: _User-name length: ParaBank answers 'This username already exists.' for ANY user name longer than 20 characters (probed: qa-author-kkkkkk0051 = 20 chars registers, qa-author-kkkkkkk0051 = 21 chars is refused as 'already exists'). A test that builds a long unique name (e.g. prefix + full timestamp + random) will see AC-3/AC-4/AC-6 break; that is a script/test-data problem for this story (the story sets no length rule), not a deviation of AC-4. Keep generated user names <= 20 characters._; _Posting the registration form without the customer.phoneNumber parameter at all (e.g. a raw HTTP post that omits the optional field) also yields 'This username already exists.'; the browser always sends the field (empty), so this does not affect the UI criteria._; _The password must be URL-encoded in the REST login path (/login/{username}/{password}); characters such as '#', '/', '?', '%' break the path. PB_USER_PASSWORD should be encoded with encodeURIComponent._; _The REST login error is 400 with a text/plain body 'Invalid username and/or password' (not JSON even with Accept: application/json). AC-8 is met; a test must not JSON.parse it._; _Phone # is optional: no message appears for it (AC-1 is met). The empty-form submit is a server-side round trip (page reloads with span.error messages, ids like customer.firstName.errors)._; _The login response also contains the customer's full 'ssn' and the REST service needs no authentication; the story does not ask about these, so they must not be reported as deviations of AC-7 (at most an out-of-scope observation)._; _No data-testid attributes exist; locate by id/name (e.g. #customer\.firstName with an escaped dot, or [id='customer.firstName']) and by button value 'Register' / 'Log In'._; _App lives under /parabank: page.goto('/register.htm') goes to the host root and 404s; use relative 'register.htm' against a baseURL ending in '/parabank/' or the absolute '/parabank/register.htm'._; _Accounts Overview rows are loaded by XHR after page load; wait for #accountTable tbody tr before reading._; _Customers cannot be deleted (no API/UI); tests should not attempt cleanup of registered customers._

## PB-2 (parabank)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 9/13 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 account-rules.csv R5 says the funding account must hold at least the 100.00 minimum opening deposit, otherwise the account is not opened and the customer gets an error; ParaBank opens the account anyway (page shows 'Account Opened!', service answers 200) and the funding account goes negative. | AC-6 | genuine | ✅ APP-1: An account is opened from a funding account holding less than 100.00 (R5 not enforced) |
| D2 AC-4 says POST /createAccount returns the new account with its opening balance (100.00); the response always carries balance 0 although the account really holds 100.00 (GET /accounts/{id} and /customers/{id}/accounts show 100.00). | AC-4 | genuine | ✅ APP-3: POST /createAccount returns the new account with balance 0 instead of its opening balance 100.00 |

**False positives (confirmed findings not in the answer key):**

- ❌ APP-2: POST /createAccount funds a new account from another customer's account (R4) (AC-6)

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-004 | `05-eval` | SCRIPT_DEFECT | APPLICATION_DEFECT | ❌ wrong |
| SCN-009.2 | `05-eval` | BLOCKED | ENVIRONMENT_ISSUE | ➖ abstained (needed investigation) |
| SCN-010.2 | `05-eval` | SCRIPT_DEFECT | APPLICATION_DEFECT | ❌ wrong |
| SCN-011 | `05-eval` | SCRIPT_DEFECT | APPLICATION_DEFECT | ❌ wrong |
| SCN-009.2 | `06-rerun` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _D1 needs a funding account below 100.00: a new customer starts with 515.50 (admin default), so the test must first move money out (e.g. transfer 450 to a second account, or open several accounts). A test that just opens one account from a fresh customer never exercises R5._; _The expected error status/text for R5 is not specified in the story ('the customer gets an error'); the evaluator should note this gap but it does not change D1: the AUT reports success (200 / 'Account Opened!')._; _newAccountType is an integer code, not the enum name: 0 = CHECKING, 1 = SAVINGS (discoverable from the page's <select id='type'> option values; the OpenAPI text only says 'Account type (CHECKING, SAVINGS, LOAN)'). Sending 'SAVINGS' is a script defect._; _createAccount is a POST with query parameters and no body._; _D2 is about the createAccount response only; GET /accounts/{id} and the Accounts Overview show the correct 100.00, so AC-2, AC-3 and the second half of AC-4 must not be reported as deviations._; _The Open New Account page fills the funding-account <select id='fromAccountId'> by XHR; clicking 'Open New Account' before the options load fails. Wait for the options / network idle._; _Accounts Overview shows a negative balance as '-$34.50' and its 'Available Amount' as '$0.00'._; _Opening deposit 100.00 and the initial 515.50 come from the admin 'Min. Balance' / 'Init. Balance' settings (defaults); a shared-sandbox user could change them — if the page text shows a different minimum, that is environment drift, not a deviation._; _Account ids are not consecutive (other users create accounts concurrently); never predict an id._

## PB-3 (parabank)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 6/12 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 AC-5 says zero and negative amounts are refused and balances do not change; ParaBank accepts both on the page ('Transfer Complete! -$10.00 has been transferred ...' / '$0.00 has been transferred ...') and through the service (200 'Successfully transferred $-10.00 ...'); a negative transfer moves money from B back to A and 0.00 transactions are recorded. | AC-5 | genuine | ✅ APP-1: Zero and negative amounts are accepted; a negative transfer moves money from B to A |
| D2 AC-4 says an empty amount shows 'The amount cannot be empty.' and 'abc' shows 'Please enter a valid amount.' with the form still on screen; ParaBank sends the request anyway (400 from the service) and replaces the form with 'Error! An internal error has occurred and has been logged.' — the two messages exist hidden in the page but are never shown. | AC-4 | genuine | ✅ APP-2: Transfer Funds page shows an internal error instead of the amount validation messages |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-004.1 | `05-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-004.2 | `05-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-005.1 | `05-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-005.2 | `05-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-006.1 | `05-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-006.2 | `05-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _The PO comment (comment-1) REPLACES AC-6: a transfer larger than the balance must complete and the source may go negative. ParaBank does exactly that (1000.00 from A with 403.16 -> 200, A -596.84, B credited 1000.00). Reporting AC-6 as failing (following the original description) is a false positive._; _AC-4 is 'no balance changes' + message: balances do not change (the service rejects), so the deviation is only the message/form behaviour; don't count it twice._; _D1 has two amounts (0 and -10.00) and two layers; it is one deviation, not four._; _The REST transfer answers with a plain sentence but Content-Type application/xml; do not parse it as XML/JSON. The amount in the message echoes the input string ($12.34 for 12.34, $1000.00 for 1000.00, $-10.00 for -10.00)._; _Transfer page account selects are filled by XHR; wait for options before selecting, or the submit posts the wrong ids (both selects default to the first account = A to A, which ParaBank also accepts)._; _A negative transfer makes B lower and A higher; tests comparing 'no change' must read both balances._; _Accounts Overview shows negative balances as '-$596.84' with Available Amount '$0.00'._; _AC-3 transaction dates are epoch-ms at UTC midnight; the page renders them in browser local time (may show the previous day) — don't assert dates._; _The AC-7 message lists the source first: 'Could not find account number <A> and/or 99999999'. 99999999 must not exist; it does not on this sandbox._; _Open the second account with newAccountType=1 (SAVINGS) or 0 (CHECKING) — integer code, not the name._

## TOOL-1 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 6/8 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 9 products per page, not 12 (web shop and API) | AC-6 | embedded | ✅ APP-2: Catalogue pages hold 9 products, not 12 |
| D2 empty search returns no products instead of all | AC-7 | embedded | ✅ APP-1: An empty search returns no products instead of all |

False positives: none ✅

| Seeded script defect | Detected |
| --- | --- |
| S6 caption assertion uses a wrong test id (search-title); element not found must not be reported as the app missing the caption | ✅ SCN-001 in `03-eval` |

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-001 | `03-eval` | SCRIPT_DEFECT | SCRIPT_DEFECT | ✅ |
| SCN-007 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-008 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _shared sandbox: other users create brands/products; tests must not rely on counts beyond the search term_

## TOOL-2 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 7/8 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 account locks after 3 failed attempts (4th gets 423), not after 5 | AC-6 | embedded | ✅ APP-1: The account locks after 3 failed attempts, not 5 |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-007 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _Gherkin scenarios in the story: the contract must quote each Scenario block_; _lockout test must use its own fresh account (it locks it)_

## TOOL-3 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 10/14 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 deleting an already deleted cart responds 404, not 204 | AC-7 | embedded | ✅ APP-1: Deleting an already-deleted cart answers 404, not 204 |
| D2 DELETE of a missing cart says "Cart doesnt exists" instead of "Cart not found" | AC-8 | genuine | ✅ APP-2: Missing-cart errors don't say "Cart not found" consistently |

False positives: none ✅

| Seeded script defect | Detected |
| --- | --- |
| S7 the add-to-cart test (AC-2) sends productId instead of the declared product_id → 422, which looks like an app validation defect | ✅ SCN-002.1 in `03-eval` |

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-002.1 | `03-eval` | SCRIPT_DEFECT | SCRIPT_DEFECT | ✅ |
| SCN-002.2 | `03-eval` | SCRIPT_DEFECT | SCRIPT_DEFECT | ✅ |
| SCN-008 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-009.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-009.3 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-009.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _Laravel answers validation errors with a 302 redirect unless Accept: application/json is sent_

## TOOL-4 (toolshop)

Verdict: expected **PASS**, got **PASS** ✅ · tests 11/11 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _ACs live in a Jira custom field, not the description_; _the description says duplicates → 422; a later PO comment clarifies 409 — the contract must record the comment as the source and the conflict as a resolved gap_; _false-positive resistance: the app meets every AC_
