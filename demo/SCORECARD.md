# Held-out evaluator — scorecard

Generated 2026-09-28T23:29:27.048Z by `demo/score.ts` from `demo/answer-keys/*.json` (written before each evaluation).

| Story | AUT | Expected verdict | Actual verdict | Defects found (recall) | False positives | Seeded script defects caught | Auto-triage vs confirmed decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AE-1 | automation-exercise | PASS_WITH_WARNINGS | _not evaluated_ | | | | |
| AE-2 | automation-exercise | FAIL | _not evaluated_ | | | | |
| AE-3 | automation-exercise | PASS | _not evaluated_ | | | | |
| CL-1 | contact-list | FAIL | _not evaluated_ | | | | |
| CL-2 | contact-list | FAIL | _not evaluated_ | | | | |
| CL-3 | contact-list | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| CL-4 | contact-list | FAIL | _not evaluated_ | | | | |
| DQ-1 | demoqa | FAIL | _not evaluated_ | | | | |
| DQ-2 | demoqa | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| DQ-3 | demoqa | FAIL | _not evaluated_ | | | | |
| JS-1 | juice-shop | FAIL | _not evaluated_ | | | | |
| JS-2 | juice-shop | FAIL | ✅ FAIL | 2/2 (100%) | 0 | 0/0 | 4/4 (100%) · abstained 0 · wrong 0 |
| PB-1 | parabank | FAIL | _not evaluated_ | | | | |
| PB-2 | parabank | FAIL | _not evaluated_ | | | | |
| PB-3 | parabank | FAIL | _not evaluated_ | | | | |
| PB-4 | parabank | PASS_WITH_WARNINGS | _not evaluated_ | | | | |
| TOOL-1 | toolshop | FAIL | _not evaluated_ | | | | |
| TOOL-2 | toolshop | FAIL | _not evaluated_ | | | | |
| TOOL-3 | toolshop | FAIL | _not evaluated_ | | | | |
| TOOL-4 | toolshop | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| TOOLB-1 | toolshop-rc | FAIL | _not evaluated_ | | | | |
| TOOLB-2 | toolshop-rc | FAIL | _not evaluated_ | | | | |
| **Total** | | | 4/4 verdicts | 2/2 (100%) | 0 | 0/0 | 4/4 (100%) · wrong 0 |

Precision: 100% (2 of 2 confirmed findings are real).

## CL-3 (contact-list)

Verdict: expected **PASS**, got **PASS** ✅ · tests 20/20 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _The Edit Contact form is pre-filled asynchronously (GET /contacts/{id} after page load). A script that fills a field before the pre-fill arrives gets its value overwritten; wait until e.g. #lastName has a non-empty value. A resulting 'edit not saved' failure is a script defect._; _The details/edit pages take the contact id from localStorage ('id'), set when a row on the Contact List is clicked; navigating straight to /contactDetails or /editContact without clicking a row shows nothing. Script defect, not an app defect._; _Delete uses a native confirm() dialog with text 'Are you sure you want to delete this contact?'; Playwright auto-dismisses dialogs unless a handler is registered, so an unhandled dialog looks like 'delete does nothing' (that is actually the correct cancel behaviour)._; _DELETE returns 200 with a plain-text body 'Contact deleted' (not JSON); 404 responses have an empty body; 'Invalid Contact ID' is plain text. Calling response.json() on these throws - script defect._; _PUT responses list omitted optional fields as null; PATCH responses may omit fields that are null. Both are allowed by the contract ('absent or null')._; _Validation error messages differ in prefix: PUT -> 'Validation failed: ...', PATCH/POST -> 'Contact validation failed: ...'; the UI edit form shows 'Validation failed: email: Email is invalid'. The story only asks for 'Email is invalid' to be contained._; _Emptying a field in the UI edit form works because the UI omits empty fields from its PUT body and PUT clears omitted fields -> phone becomes null (met)._; _Out of scope for this story (belongs to CL-2/CL-4 and must not be reported here): the AUT accepts birthdate '1985/07/14' and lets PATCH change 'owner'. The CL-3 story and contract state neither rule, so an evaluator that reports them against CL-3 is going beyond the requirement; at most an observation._; _No data-testid attributes; ids: #edit-contact, #delete, #return, #submit, #cancel, #error, field ids as on Add Contact; details values are spans with the field ids._

## DQ-2 (demoqa)

Verdict: expected **PASS**, got **PASS** ✅ · tests 21/21 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _Only the most recently issued token for a user is valid: signing in on the UI (which calls GenerateToken) invalidates the API token obtained earlier. Checking the collection through the API after a UI sign-in with the old token gives 401 - that is a script defect, not an app defect (regenerate the token or use Basic auth)._; _AC-4 no-match case: the AUT shows no rows and the pager reads 'Page 1 of 0'. The story only requires that no book rows are listed, so this is met; failing the story on 'Page 1 of 0' or on a missing 'No rows found' text would be a false positive (at most an observation)._; _The search box does NOT match ISBNs; the story never requires ISBN search - do not invent that expectation._; _AC-5: the detail page URL is /books?search=<isbn> (not ?book=<isbn>, which just shows the full list). The story leaves the URL to discovery; clicking the title link is the reliable path._; _AC-9: deletion confirms via a modal (#closeSmallModal-ok 'OK') followed by a native alert 'Book deleted.' that must be accepted._; _Profile rows: delete icon id is 'delete-record-<isbn>'; titles link to /books?search=<isbn>. No data-testid attributes; ids are used. Ads may cover parts of the page - block ad domains._; _DELETE /BookStore/v1/Book needs a JSON body {isbn, userId}; 204 with an empty body._; _Error codes are strings ('1205', not 1205)._; _GET /Account/v1/User/{UUID} returns 'userId' (lower-case d) whereas POST /Account/v1/User returns 'userID'._; _Do not assert a fixed catalogue size: compare /books with whatever GET /BookStore/v1/Books returns (currently 8 books, all on page 1)._

## JS-2 (juice-shop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 4/8 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 AC-3 (refined by the PO comment: minimum password length 5) requires the registration API to reject a too-short password with HTTP 400 and not create the account. The AUT does not enforce any password length on the API: registering with a 2- or 3-character password returns HTTP 201 and creates the customer. | AC-3 | genuine | ✅ APP-1: Registration accepts passwords shorter than 5 characters |
| D2 AC-6 requires a customer to read only their own basket. The AUT authorizes GET /rest/basket/{id} by valid JWT only, not by ownership: customer A's token can read customer B's basket id and receives B's basket (HTTP 200) instead of being refused. | AC-6 | genuine | ✅ APP-2: A customer can read another customer's basket |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-003.1 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-003.2 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-008 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _AC-1/AC-2/AC-4 are all MET and must not be false-flagged. Registration success is HTTP 201 (not 200); duplicate e-mail is HTTP 400 with body {"message":"Validation error","errors":[{"field":"email","message":"email must be unique"}]}._; _The registration body must nest the security question as securityQuestion:{id:<n>} and include securityAnswer; ids come from GET /api/SecurityQuestions (1..N). Sending a bare id or omitting the object shape can cause spurious failures unrelated to the ACs._; _AC-5 add-to-basket returns HTTP 200 (NOT 201) with {status:success,data:{...}}; the story does not specify a status for AC-5, so do not fail it on the 200-vs-201 point. The end-to-end check is that /#/basket lists the product+quantity after UI login._; _UI login state is set via the login FORM, not by injecting the token into localStorage (the SPA shows the basket as 'anonymous' if the token is only planted in storage without a real login). Register via API or UI, then log in through /#/login before asserting on /#/basket._; _Welcome banner and cookie dialog overlay /#/login and /#/basket on first load; dismiss them before UI interaction._; _AC-6 wording says the cross-account read must be 'refused' without naming a status code (a deliberate small gap). The deviation is unambiguous regardless: returning HTTP 200 WITH the other customer's basket contents violates the criterion. An evaluator may note the missing expected-status as an open question but should still judge AC-6 as not met._; _bid values and user ids shift on data reset; tests must create their own two customers and use the bid returned by their own logins rather than hard-coded ids._

## TOOL-4 (toolshop)

Verdict: expected **PASS**, got **PASS** ✅ · tests 11/11 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _ACs live in a Jira custom field, not the description_; _the description says duplicates → 422; a later PO comment clarifies 409 — the contract must record the comment as the source and the conflict as a resolved gap_; _false-positive resistance: the app meets every AC_
