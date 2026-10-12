# Held-out evaluator — scorecard

Generated 2026-10-11T10:33:02.912Z by `demo/score.ts` from `demo/answer-keys/*.json` (written before each evaluation), for the evaluations of round 32: one onboarding, then the nine stories one at a time in the same project. The scorecards of round 34 (the two deep stories again) and round 35 (a second application, with keys by an independent author) follow at the end.

This is the first pass. A second pass of the same nine stories in the same project gave the same nine verdicts and 11 of 13 defects with 2 raised as owner questions (TOOL-1's empty-search defect joined TOOL-3's, because that contract recorded "all products" as an assumption and every test of the criterion carried it; the lint now warns about that), again with no false positive.

One key changed after its evaluation: TOOLB-1 listed one defect when it was written (2026-09-26). The release-candidate environment has moved to another build since, and round 32 found two more defects there (the reversed price sort and the no-match message). Both were checked against the live application and added to the key, so they count as found, not as false positives. Against the key as first written, TOOLB-1 scores 1/1 with 2 false positives.

| Story | AUT | Expected verdict | Actual verdict | Defects found (recall) | False positives | Auto-triage vs confirmed decision |
| --- | --- | --- | --- | --- | --- | --- |
| TOOL-1 | toolshop | FAIL | ✅ FAIL | 2/2 (100%) | 0 | 8/8 (100%) · abstained 0 · wrong 0 |
| TOOL-2 | toolshop | FAIL | ✅ FAIL | 1/1 (100%) | 0 | 2/2 (100%) · abstained 0 · wrong 0 |
| TOOL-3 | toolshop | FAIL | ✅ FAIL | 1/2 (50%) + 1 as owner question | 0 | 3/3 (100%) · abstained 0 · wrong 0 |
| TOOL-4 | toolshop | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| TOOL-5 | toolshop | FAIL | ✅ FAIL | 1/1 (100%) | 0 | 2/2 (100%) · abstained 0 · wrong 0 |
| TOOL-6 | toolshop | PASS_WITH_WARNINGS | ✅ PASS_WITH_WARNINGS | 0/0 (n/a) | 0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| TOOL-7 | toolshop | FAIL | ✅ FAIL | 1/1 (100%) | 0 | 1/1 (100%) · abstained 0 · wrong 0 |
| TOOLB-1 | toolshop-rc | FAIL | ✅ FAIL | 3/3 (100%) | 0 | 8/9 (89%) · abstained 1 · wrong 0 |
| TOOLB-2 | toolshop-rc | FAIL | ✅ FAIL | 3/3 (100%) | 0 | 14/15 (93%) · abstained 1 · wrong 0 |
| **Total** | | | 9/9 verdicts | 12/13 (92%) + 1 as owner question | 0 | 38/40 (95%) · wrong 0 |

Precision: 100% (12 of 12 confirmed findings are real).

## TOOL-1 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 12/20 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 9 products per page, not 12 (web shop and API) | AC-6 | embedded | ✅ APP-1: Catalogue is paginated with 9 products per page instead of 12 (web shop and API) |
| D2 empty search returns no products instead of all | AC-7 | embedded | ✅ APP-2: An empty search returns no products instead of all products |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-009 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-010 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-011 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-016 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-017 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-019 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _shared sandbox: other users create brands/products; tests must not rely on counts beyond the search term_

## TOOL-2 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 17/19 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 account locks after 3 failed attempts (4th gets 423), not after 5 | AC-6 | embedded | ✅ APP-1: Account locks after three failed sign-in attempts instead of five |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-006 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-012 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _Gherkin scenarios in the story: the contract must quote each Scenario block_; _lockout test must use its own fresh account (it locks it)_

## TOOL-3 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 17/20 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 deleting an already deleted cart responds 404, not 204 | AC-7 | embedded | ❔ surfaced as a reading the app contradicts (SCN-014, rests on G6): a question for the owner, not a defect |
| D2 DELETE of a missing cart says "Cart doesnt exists" instead of "Cart not found" | AC-8 | genuine | ✅ APP-1: 404 for a missing cart carries a message other than "Cart not found" |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-014 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-016 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-017 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _Laravel answers validation errors with a 302 redirect unless Accept: application/json is sent_

## TOOL-4 (toolshop)

Verdict: expected **PASS**, got **PASS** ✅ · tests 14/14 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _ACs live in a Jira custom field, not the description_; _the endpoints, auth and the duplicate status (409) are only on the linked Confluence page, as an OpenAPI excerpt in a YAML code block — the contract must cite that page (linked/confluence-880001-…md) and must not assume any other API document_; _false-positive resistance: the app meets every AC_

## TOOL-5 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 12/14 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 GET /brands/search matches only from the start of a word: "craft" finds nothing instead of MightyCraft Hardware | AC-4, AC-5, AC-6 | genuine | ✅ APP-1: Brand search for "craft" does not find MightyCraft Hardware |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-005.1 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-011 | `02-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _shared demo: other users create brands (names ending in 'editado'); tests must not expect an exact list or count of brands_; _the search examples are the oracle: 'FORGE' finds ForgeFlex Tools (passes), 'craft' finds MightyCraft Hardware (fails)_

## TOOL-6 (toolshop)

Verdict: expected **PASS_WITH_WARNINGS**, got **PASS_WITH_WARNINGS** ✅ · tests 13/13 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _documented-but-unused endpoint GET /categories/{categoryId} (405 on the app)_; _the invoices section's 401/403 statuses and the 60 requests/minute rate limit belong to other parts of the API_; _the API portal link must not be fetched or assumed_

## TOOL-7 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 24/25 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 a customer reading another customer's invoice gets 404, not the required 403 (administrator 200 and guest 401 are as required) | AC-5 | genuine | ✅ APP-1: GET /invoices/{invoiceId} of another customer answers 404 instead of 403 |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-014 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _the framework's accounts are one pool of interchangeable users: a test asking for 'a customer' may be handed the administrator_; _AC-5 needs a second customer who owns an invoice_; _the defect shows only for the customer variant of AC-5_

## TOOLB-1 (toolshop-rc)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 12/21 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 9 products per page, not 12 | AC-6 | embedded | ✅ APP-2: Results are paginated with 9 products per page, not 12 |
| D2 the web shop's "Price (Low - High)" option carries the value price,desc and lists the products by descending price (the API sorts correctly) | AC-4 | genuine (found by round 32) | ✅ APP-1: The web shop's "Price (Low - High)" sorts by descending price |
| D3 a web-shop search without matches shows "0 products found for '<term>'" instead of "There are no products found." | AC-3 | genuine (found by round 32) | ✅ APP-3: A web-shop search without matches does not show "There are no products found." |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-004 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-006 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-010 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-011 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-012 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-013.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-013.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _same criteria as TOOL-1 but a different build: the empty search (AC-7) returns products here, where it returns none on stable; it returns 29 against 26 for GET /products (it includes rentals), which is a question for the owner about what "all products" means, not a defect_; _the environment is a separate application profile with its own journeys: nothing proven on the stable shop counts as proven here_

## TOOLB-2 (toolshop-rc)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 1/16 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 the cart API is not deployed on the RC (POST /carts → 404 Resource not found) | AC-1, AC-2, AC-3, AC-6, AC-7, AC-8 | genuine (environment build) | ✅ APP-1: The cart API is missing: POST /carts and every other /carts route answer 404 "Resource not found" |
| D2 Add to cart shows "Oeps, something went wrong." | AC-4 | genuine | ✅ APP-2: Adding a product on its page shows "Oeps, something went wrong." instead of "Product added to shopping cart." |
| D3 cart page can't list items without the cart API (predicted) | AC-5 | genuine (predicted) | ✅ APP-3: The cart page shows every line total as $00.00 instead of price × quantity |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-001 | `04-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-002 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-003.1 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-003.2 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-004.1 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-004.2 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-005 | `04-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-007 | `04-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-008 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-009 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-010 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-011.1 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-011.2 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-011.3 | `04-eval` | BLOCKED | BLOCKED | ✅ |
| SCN-012 | `04-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _a missing endpoint on a declared contract is not an environment outage (the AUT is healthy): 404 on every cart call is evidence about the build_; _API pre-steps that create carts will fail → scenarios must be BLOCKED or fail on the AC that owns POST /carts, not scattered_


# Round 34: TOOL-8 and TOOL-9 again, from a fresh setup

Scored 2026-10-12. Both answer keys were corrected after earlier runs (see each key's `writtenAt`), so this round is a regression check, not a blind one.

| Story | AUT | Expected verdict | Actual verdict | Defects found (recall) | False positives | Auto-triage vs confirmed decision |
| --- | --- | --- | --- | --- | --- | --- |
| TOOL-8 | toolshop | FAIL | ✅ FAIL | 4/4 (100%) | 0 | 14/18 (78%) · abstained 4 · wrong 0 |
| TOOL-9 | toolshop | FAIL | ✅ FAIL | 4/4 (100%) | 0 | 4/4 (100%) · abstained 0 · wrong 0 |
| **Total** | | | 2/2 verdicts | 8/8 (100%) | 0 | 18/22 (82%) · wrong 0 |

Precision: 100% (8 of 8 confirmed findings are real).

## TOOL-8 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 23/41 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 the catalogue is not protected: a visitor who is not signed in and a customer can create brands, categories and products (201) and change them (PUT 200); only deleting is refused (401 for a visitor, 403 for a customer) | AC-5 | genuine | ✅ APP-1: Customers and visitors can create and change categories, brands and products through the API |
| D2 creating a product under a brand that does not exist answers 500 "Something went wrong" instead of a refusal that says what is wrong | AC-2 | genuine | ✅ APP-2: A product that names a brand or category that does not exist is answered with a server error and no message that says what is wrong |
| D3 the search does not find a product by its whole name when the name holds a hyphen followed by a digit ("zq7tri-9": 0 results, "zq7tri": 1; "Cordless Drill 24V" is found), in the web shop and in GET /products/search | AC-3 | genuine (found by round 33) | ✅ APP-3: The web shop search does not find a product by its name when the name contains a hyphen |
| D4 the admin area's product form sends nothing and shows no message when the brand or the category is not chosen: the product is not created, but nothing says what is wrong | AC-2 | genuine (found by round 33, second evaluation) | ✅ APP-2: A product that names a brand or category that does not exist is answered with a server error and no message that says what is wrong |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-008.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-008.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-009.1 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-009.2 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-010 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-015.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.5 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.7 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.8 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.10 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.11 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.13 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.14 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.16 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.17 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-022 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |

Traps in this AUT: _data dependencies: a product can't be removed while it is in a cart, nor a brand or category while a product uses it, so cleanup must run in reverse order (cart, product, sub-category, category, brand)_; _the tests that show D1 create records without an administrator: those records must be removed with the administrator's token_; _a cart accepts more than the stock (8 of 7): no criterion covers that, so it is not a finding_; _records the tests create are visible to everyone on the shared demo while a run lasts_; _D2 is a 5xx answer where the story asks for a refusal: a test that only asserts "not a success" passes on it_; _the administrator's token lasts five minutes: a cleanup at the end of a long run needs a fresh sign-in_

## TOOL-9 (toolshop)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 27/31 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 questions are not private: another customer can answer a question by its id (201), and the answer lands in the owner's conversation. | AC-6 | genuine | ✅ APP-2: Another customer can answer a customer's question through the API |
| D4 reading another customer's question by its id is not refused: it answers 200 with an empty body, so nothing of the question is disclosed, but the answer does not say the request was refused (a minor defect) | AC-6 | genuine (part of D1 until round 34 reported it as a finding of its own) | ✅ APP-4: Reading another customer's question answers 200 with an empty body instead of a refusal |
| D2 the customer who asked can change the status of their question (PUT /messages/{id}/status answers 200) | AC-5 | genuine | ✅ APP-1: A customer can change a question's status through the API |
| D3 the API accepts a message shorter than 50 characters (49 characters: 200) | AC-1 | genuine | ✅ APP-3: The API accepts a question whose message is shorter than 50 characters |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-002.1 | `03-rerun` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018.1 | `03-rerun` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-020 | `03-rerun` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-022 | `03-rerun` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _a question can't be deleted: every run leaves its questions on the shared demo_; _a new question answers 200, not 201: the story states no status, so that is not a finding_; _an administrator's answer moves the question to IN_PROGRESS as required; so does the customer's own reply after RESOLVED, which no criterion covers_; _the status list is NEW, IN_PROGRESS, RESOLVED: any other value is refused with 422_; _a subject that is not in the form's list is accepted by the API: the story says "a subject from the list" without saying the API must refuse others, so that is a question for the owner_; _account lists show 15 questions a page and cut the message off after 50 characters_


# Round 35: a second application (ParaBank), keys by an independent author

Scored 2026-10-12. The three stories and their keys were written before the runs by an author who saw nothing of the evaluator, and the keys are as that author left them. The automatic-triage column is from the reports as rendered after the round's fix to endpoint matching; during the round, two of PB-2's failures were classified as script defects and the triager overruled them. PB-1's figures are from its second evaluation run (the same failures, triaged again from nothing).

| Story | AUT | Expected verdict | Actual verdict | Defects found (recall) | False positives | Auto-triage vs confirmed decision |
| --- | --- | --- | --- | --- | --- | --- |
| PB-1 | parabank | FAIL | ✅ FAIL | 5/6 (83%) + 1 as owner question | 0 | 20/22 (91%) · abstained 2 · wrong 0 |
| PB-2 | parabank | FAIL | ✅ FAIL | 11/11 (100%) | 2 | 46/57 (81%) · abstained 11 · wrong 0 |
| PB-3 | parabank | PASS_WITH_WARNINGS | ❌ PASS | 0/0 (n/a) | 0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| **Total** | | | 2/3 verdicts | 16/17 (94%) + 1 as owner question | 2 | 66/79 (84%) · wrong 0 |

Precision: 89% (16 of 18 confirmed findings are real).

## PB-1 (parabank)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 19/41 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 an account is opened although the funding account does not hold the minimum opening deposit, and the funding account goes below zero. API: a customer's first account holds 515.50 and the deposit is 100.00; the sixth POST /services/bank/createAccount?customerId={c}&newAccountType=1&fromAccountId={first} still answers 200 with a new account and the funding account reads -84.50 (the first five are the control: 515.50 down to 15.50). Web: Open New Account with a funding account that holds $0.00 shows "Account Opened!" and the overview then lists the funding account at -$100.00, a second time at -$200.00. The story requires a refusal with a reason and no balance change, and no account below zero | AC-5 | genuine | ✅ APP-1: An account opens from a funding account that does not hold the minimum opening deposit, which is taken below zero; nothing is refused or said |
| D2 the API opens a loan account on request: POST /services/bank/createAccount?customerId={c}&newAccountType=2&fromAccountId={a} answers 200 with {"type":"LOAN"} and the account is listed for the customer with the deposit moved (reproduced for two customers; control: types 0 and 1 give CHECKING and SAVINGS, and the web page offers only those two). The story allows only checking and savings and reserves loan accounts for approved loan requests | AC-6 | genuine | ✅ APP-3: A loan account can be opened like a checking or savings account (the page's request and the API): nothing is refused |
| D3 an account type that does not exist is not refused with a reason: POST /services/bank/createAccount with newAccountType=5, 7 or -1 answers 500 with the site's HTML page "An internal error has occurred and has been logged." (no account is created; control: an unknown funding account or an unknown customer answers 400 with a plain message "Could not create new account for customer ... from account ..."). A text value such as newAccountType=SAVINGS answers 404 with an empty body. The story requires a refusal with a clear reason | AC-6 | genuine | ❔ surfaced as a reading the app contradicts (SCN-017.2, rests on G7): a question for the owner, not a defect |
| D4 the API's answer to opening an account shows the new account with "balance":0, while the account holds the opening deposit: POST /services/bank/createAccount answers {"id":N,"customerId":c,"type":"SAVINGS","balance":0}, and GET /services/bank/accounts/N and GET /services/bank/customers/{c}/accounts straight afterwards show "balance":100.00 (every opening call made during probing, more than ten; the two GETs are the control and agree with the web pages). The story requires the answer to be the new account as it stands after opening, opening balance included | AC-7 | genuine | ✅ APP-4: The API's answer to opening an account says balance 0 while the account holds the opening deposit |
| D5 a customer can fund a new account from another customer's account, and open accounts in another customer's name. Signed in as customer B (session cookie, through the pages' own /services_proxy/bank): POST createAccount?customerId={B}&newAccountType=0&fromAccountId={an account of A} answers 200, B gets a new account holding 100.00 and A's account is 100.00 lower (reproduced with two pairs of customers, also directly under /services/bank). Signed in as A: createAccount?customerId={B}&... with A's account opens an account owned by B. Control: an account number that does not exist answers 400. B can also read A's accounts: GET customers/{A}/accounts and accounts/{A's account} answer 200 with the balances under B's session. The story requires that a customer opens accounts only for themselves and only from their own accounts | AC-8 | genuine | ✅ APP-2: Anybody can open an account in a customer's name or fund one with a customer's money: the API asks for no proof of who is calling, and the page's request takes another customer's account |
| D6 the API opens accounts for anybody who is not signed in at all: POST /services/bank/createAccount?customerId={c}&newAccountType=1&fromAccountId={a} with no cookie, no header and no credentials answers 200 and moves the deposit (every direct call during probing was made this way), and GET /services/bank/customers/{c}/accounts answers 200 the same way. Control: the same calls through /services_proxy/bank without a session cookie answer 401 {"message":"User login required"}, and with the customer's session cookie 200. The story requires that nobody who is not signed in can open an account in a customer's name or use a customer's money, on the pages and in the API | AC-8 | genuine | ✅ APP-2: Anybody can open an account in a customer's name or fund one with a customer's money: the API asks for no proof of who is calling, and the page's request takes another customer's account |

False positives: none ✅

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-007 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-008 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-009.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-010 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-011 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-012 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-014.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-015.1 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-016.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-017.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-017.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-021.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-021.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-021.3 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-021.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-022.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-022.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-022.3 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-022.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-024 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _the API takes the account type as a number (0 checking, 1 savings); the web page's select sends the same numbers. A text name (newAccountType=SAVINGS) answers 404 with an empty body, which is a mechanics fact a test must discover, not by itself the finding of D3 (the 500 on an unknown number is)_; _all API parameters are query parameters on a POST with no body; without "Accept: application/json" the API answers XML; refusals are plain text (400), not JSON, even when JSON is asked for_; _the pages are shells that load their data with calls to /parabank/services_proxy/bank/... carrying the session cookie (401 without one); the same resources under /parabank/services/bank/... need no credentials at all. A test that only uses the proxy path without a cookie sees a correct 401 and would miss D6; a test that only uses the direct path cannot tell a signed-in call from an anonymous one_; _a new customer starts with one checking account holding 515.50 and the minimum opening deposit is 100.00; both are settings of this installation (the page states the deposit), so a test should read them, not assume them. Five openings empty the first account to 15.50; the sixth is the one that shows D1_; _leaving the account type out opens a checking account (200): the story does not say whether the type is mandatory in the API; a question for the owner, not a defect_; _an unknown funding account or an unknown customer is refused with 400 and a message: that is correct behaviour (the control for D3)_; _the opening deposit is recorded as "Funds Transfer Sent" on the funding account and "Funds Transfer Received" on the new one, both 100.00: AC-9 is met. The Account Activity page shows the entry's date one day early in a browser whose time zone is west of UTC (the API stores midnight UTC); this story states nothing about dates, so it is not a finding here_; _when not signed in, Accounts Overview and Open New Account answer HTTP 500 with "An internal error has occurred and has been logged." instead of a sign-in prompt: no data is shown, and the story does not say what a signed-out visitor sees, so it is at most a remark_; _accounts cannot be closed or deleted, and the tests must not use the admin page or the clean/initialize database functions: every run leaves its customers and accounts behind, so each run must register fresh customers with unique usernames_; _the tests that show D5 and D6 really move 100.00 out of another test customer's account: use customers registered for that test only, and do not assert that customer's balances in another test_; _the Open New Account page fills its funding-account list with a call made after the page has loaded: a test has to wait for the options before choosing one_

## PB-2 (parabank)

Verdict: expected **FAIL**, got **FAIL** ✅ · tests 46/103 passed

| Expected defect | Criteria | Origin | Matched finding |
| --- | --- | --- | --- |
| D1 bullet 4 (never more than the account holds), transfers: a transfer larger than the sending account's balance is carried out. API: with 115.75 on the account, POST /services/bank/transfer?fromAccountId={b}&toAccountId={a}&amount=500 answers 200 "Successfully transferred $500 ..." and the account reads -384.25; a second time with amount=115.76 (one cent too much). Web: Transfer Funds of 9000 from an account holding $113.20 shows "Transfer Complete!" and the overview lists -$8886.80. Control: 15.75 from an account holding 415.50 moves exactly 15.75. The story requires a refusal and unchanged balances | AC-4 | genuine | ✅ APP-3: Transfers and bill payments of more than the account holds are made: accounts go below zero |
| D2 bullet 3 (a valid amount), transfers: a negative amount is accepted and moves the money the other way. API: POST transfer?fromAccountId={a}&toAccountId={b}&amount=-20 answers 200 "Successfully transferred $-20", a goes up by 20.00 and b down by 20.00, and both histories get an entry with amount -20.00 (again with -0.01). Web: amount -7 shows "Transfer Complete! -$7.00 has been transferred" and the balances move the wrong way. Control: 15.75 moves 15.75 from a to b. The story requires that no money moves, no entry is written and the customer is told what is wrong | AC-3 | genuine | ✅ APP-1: Zero and negative amounts are accepted: a transfer or bill payment is made and recorded, and a negative amount moves money the other way |
| D3 bullet 3, transfers: a transfer of zero is accepted. POST transfer?...&amount=0 (and amount=0.00) answers 200 "Successfully transferred $0" and writes a "Funds Transfer Sent" 0.00 entry on the sending account and a "Funds Transfer Received" 0.00 entry on the receiving one; balances are unchanged. The story requires a refusal with no entry in the history | AC-3 | genuine | ✅ APP-1: Zero and negative amounts are accepted: a transfer or bill payment is made and recorded, and a negative amount moves money the other way |
| D4 bullet 5 (two different accounts): a transfer from an account to the same account is accepted. API: POST transfer?fromAccountId={a}&toAccountId={a}&amount=10 answers 200 and the account gets two entries (10.00 sent, 10.00 received), balance unchanged; repeated on a second account. Web: choosing the same account in both lists shows "Transfer Complete! $3.00 has been transferred from account #X to account #X". The story requires two different accounts | AC-5 | genuine | ✅ APP-8: A transfer from an account to itself is made and confirmed |
| D5 bullet 3, fractions of a cent: an amount with three decimals is accepted, and afterwards both accounts can no longer be read. POST transfer?fromAccountId={a}&toAccountId={b}&amount=2.345 answers 200 "Successfully transferred $2.345"; from then on GET accounts/{a}, accounts/{b}, accounts/{a}/transactions and customers/{c}/accounts answer 500 with the site's HTML error page (server log: ArithmeticException "Rounding necessary"), the customer's Accounts Overview shows "An internal error has occurred", and any further transfer from these accounts answers 500. Reproduced with two customers (1.005 and 2.345); control: 1.05 on the same accounts just before is carried out and read back correctly, and a third account of the same customer stays readable. The story requires that such an amount moves no money | AC-3 | genuine | ✅ APP-2: An amount with fractions of a cent is accepted, and afterwards the accounts involved can no longer be read (500) and the customer's pages fail |
| D6 bullet 3, the customer is told what is wrong: on the Transfer Funds page, submitting with the amount left empty, or with text ("abc"), shows the page "Error! An internal error has occurred and has been logged." and nothing about the amount (the page holds the texts "The amount cannot be empty." and "Please enter a valid amount." but never shows them). No money moves. In the API the same inputs answer 500 with the HTML error page (amount empty or missing) and 404 with an empty body (amount=abc). Control: the Bill Pay page shows "The amount cannot be empty." and "Please enter a valid amount." next to the field for the same inputs | AC-3 | genuine | ✅ APP-1: Zero and negative amounts are accepted: a transfer or bill payment is made and recorded, and a negative amount moves money the other way |
| D7 bullet 4, bill payments: a payment larger than the account's balance is made. API: with 455.10 on the account, POST /services/bank/billpay?accountId={a}&amount=600 with a complete payee answers 200 and the account reads -144.90 (also 5000 from 325.49). Web: Bill Pay of 5000 from an account holding $100.00 shows "Bill Payment Complete" and the overview lists -$4900.00; again 150 from $100.00 gives -$50.00. Control: 60.40 from 515.50 leaves 455.10. The story requires a refusal and unchanged balances | AC-4 | genuine | ✅ APP-3: Transfers and bill payments of more than the account holds are made: accounts go below zero |
| D8 bullet 3, bill payments: a negative or zero payment amount is accepted. API: billpay?accountId={a}&amount=-30 answers 200 {"amount":-30} and the account goes UP by 30.00, with a "Bill Payment to ..." entry of -30.00; amount=0 answers 200 and writes a 0.00 entry. Web: amount -12 shows "Bill Payment Complete ... in the amount of $-12.00" and the account rises by 12.00; amount 0 shows "Bill Payment Complete". Control: text in the amount is refused on the page with "Please enter a valid amount." | AC-3 | genuine | ✅ APP-1: Zero and negative amounts are accepted: a transfer or bill payment is made and recorded, and a negative amount moves money the other way |
| D9 bullet 6 (all payee details are required): the API makes a payment without them. POST billpay?accountId={a}&amount=1 with the body {} answers 200 {"payeeName":null,...}, debits 1.00 and writes the entry "Bill Payment to null"; with empty strings in every payee field it writes "Bill Payment to "; with only a name it pays as well. Control: the Bill Pay page refuses the empty form with a message at each field ("Payee name is required." and so on) and a mismatch of the two account numbers with "The account numbers do not match." | AC-6 | genuine | ✅ APP-9: The API makes a bill payment without payee details |
| D10 bullet 2 (the date the transfer was made): the Account Activity page and the Find Transactions results show an entry one day too early. A transfer made on 10-12-2026 is listed as 10-11-2026 on activity.htm and in every Find Transactions result, while the Transaction Details page of the same entry shows 10-12-2026, the API gives 2026-10-12 00:00 UTC, and searching by the date 10-12-2026 finds the entry (shown as 10-11-2026) while 10-11-2026 finds nothing. Cause: the pages format the API's midnight-UTC date in the browser's local time. Seen on every entry in a browser in America/New_York; it shows in any browser whose time zone is west of UTC, at the times of day when the local date equals the server's (UTC) date, and does not show in a browser at UTC or east of it. An evaluation whose browser runs at UTC or east cannot see it | AC-2 | genuine | ✅ APP-6: The account activity and Find Transactions show an entry's date one day early in a browser west of UTC |
| D11 bullet 8 (only one's own accounts): a customer can move money out of another customer's account and read its history, and so can somebody who is not signed in. Signed in as customer B (session cookie, through /services_proxy/bank): POST transfer?fromAccountId={account of A}&toAccountId={account of B}&amount=50 answers 200, A is 50.00 lower and B 50.00 higher; POST billpay?accountId={account of A}&amount=11 pays from A's account; GET accounts/{account of A} and accounts/{account of A}/transactions/amount/50 answer 200 with A's data. Directly under /services/bank the same calls answer 200 with no cookie and no credentials at all (transfer of 25 out of A's account). Control: through /services_proxy/bank without a session cookie the transfer answers 401 {"message":"User login required"}. The Transaction Details page (transaction.htm?id=N) also shows any customer's entry to a visitor who is not signed in | AC-8 | genuine | ✅ APP-4: Anyone, signed in or not, can move money out of another customer's account |

**False positives (confirmed findings not in the answer key):**

- ❌ APP-5: Anyone, signed in or not, can read the history of another customer's account (AC-8)
- ❌ APP-7: A transfer or bill payment request without an amount is answered with a server error (500) (AC-3)

| Test | Run | Auto triage | Confirmed | |
| --- | --- | --- | --- | --- |
| SCN-004 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-007.3 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-007.4 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-007.5 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-008.3 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-008.4 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-008.5 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-009.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-009.3 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-009.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-009.5 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-010.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-010.3 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-010.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-010.5 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-011 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-012 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-013 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-014 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-016.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-016.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-017.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-017.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-018.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-019.1 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-019.2 | `03-eval` | NEEDS_INVESTIGATION | APPLICATION_DEFECT | ➖ abstained (needed investigation) |
| SCN-020.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-021 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-022 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-024 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-025 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-029.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-029.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-029.3 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-029.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-029.5 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-029.6 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-029.7 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-030 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-032.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-040.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-040.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-040.3 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-040.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-041 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-042.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-042.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-043.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-043.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-043.3 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-043.4 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-043.5 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-043.6 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-044 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-045.1 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |
| SCN-045.2 | `03-eval` | APPLICATION_DEFECT | APPLICATION_DEFECT | ✅ |

Traps in this AUT: _D5 destroys the accounts it touches: after a three-decimal transfer both accounts, the customer's account list and their overview answer 500 for good (nothing in the application repairs it, and the admin page and the clean/initialize functions are off limits). The test for it needs its own freshly registered customer, and must be the last thing done with those accounts_; _the tests for D1, D2, D7, D8 and D11 leave balances changed or negative: every test that asserts balances needs customers and accounts of its own, registered in that test_; _D10 depends on the time zone of the browser (and the hour): see its description. The search by date itself is correct on the server; only the date shown is shifted_; _Find Transactions works as the story asks: by id, by date (MM-DD-YYYY), by date range (both ends included) and by exact amount, the matching entries and no others, and an empty table for no match. An unknown transaction id answers 400 "Could not find transaction #N" in the API and an empty result on the page. No finding there_; _the page's search by transaction id ignores the chosen account (it asks for the transaction alone): with an id of another account of the same customer it shows that entry. The story does not say the id search is limited to the selected account; ids of another customer's entries fall under D11_; _the API accepts a transfer whose receiving account belongs to another customer; the page offers only the customer's own accounts as destination. The story is about transfers between one's own accounts and does not say whether paying into someone else's account is forbidden: a question for the owner. Moving money OUT of someone else's account is D11_; _the payee's account number is not checked against anything (the payee is outside the bank): not a defect. The page requires the phone number, as the story does_; _an account that does not exist is refused correctly: transfer answers 400 "Could not find account number X and/or Y", GET accounts/{id} and its transactions answer 400 with a message; bill payment from an account that does not exist answers 500 with the HTML error page, which the story does not cover (no criterion on unknown accounts)_; _an amount with one decimal (12.5) is valid and is stored as 12.50; the API's confirmation text echoes the amount as typed ("$12.5", "$-20")_; _the transfer API answers plain text, the bill payment API answers JSON and wants the payee as a JSON body with accountId and amount as query parameters; without "Accept: application/json" answers are XML; dates in the API are epoch milliseconds at midnight UTC_; _the pages are shells that load and send through /parabank/services_proxy/bank/... with the session cookie (401 without one), while /parabank/services/bank/... needs no credentials: a test that only tries the proxy path without a cookie sees a correct 401 and misses the anonymous half of D11_; _a second account for the chain comes from Open New Account and costs 100.00 of the first account's 515.50 (both figures are settings of this installation); the opening itself writes a "Funds Transfer Sent"/"Funds Transfer Received" entry of 100.00 on the two accounts, which a search by amount or date will also return_; _the Transfer Funds page fills both account lists with a call made after the page has loaded; a test must wait for the options_

## PB-3 (parabank)

Verdict: expected **PASS_WITH_WARNINGS**, got **PASS** ❌ · tests 31/31 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _false-positive resistance: the application meets every scenario as written. Messages seen: "Your account was created successfully. You are now logged in.", "<Field> is required." next to each empty required field ("Social Security Number is required.", "Password confirmation is required."), "Passwords did not match.", "This username already exists.", "The username and password could not be verified." for a wrong password and for an unknown username alike, "Please enter a username and password." when one of the two is empty; the API sign-in answers 400 "Invalid username and/or password" (plain text) for both wrong cases_; _the warning the verdict should carry (things the story leaves open, questions for the owner, not violations): (a) when signed out, the Accounts Overview answers HTTP 500 with "Error! An internal error has occurred and has been logged." instead of leading to sign-in: the scenario only requires that the accounts are no longer shown, which holds; (b) the Transaction Details page (transaction.htm?id=N) shows an entry to a visitor who is not signed in, and the API's customer and account resources under /services/bank answer without any credentials: the story is about signing up, in and out, and states no rule for those resources; (c) the API sign-in carries the password in the URL path and its answer includes the social security number; (d) no rule on password strength: a two-character password is accepted_; _the heading after sign-up greets by username ("Welcome <username>"); the greeting by first and last name the story asks for is in the left panel ("Welcome <First> <Last>"). Both are on the page, so the scenario holds_; _the phone number is optional on sign-up, as the story says; an empty phone number is not a finding_; _usernames are case-sensitive: "abc" and "ABC" are two customers. The story says a username can be registered only once and does not say case is ignored: a question for the owner, not a defect_; _the social security number is not checked for format or uniqueness, and the same person can sign up twice under two usernames: not stated in the story_; _a failed sign-in answers HTTP 200 with the error message on the page (not a 4xx): the story names no status for the web_; _after a successful sign-in the browser is redirected to overview.htm, sometimes with ;jsessionid=... in the URL when the client sent no cookie yet; links on signed-out pages carry ;jsessionid as well. A test should compare the path, not the whole URL_; _"Log Out" leads to index.htm?ConnType=JDBC, which is the home page_; _the Accounts Overview fills its table with a call made after the page has loaded (to /parabank/services_proxy/bank/customers/{id}/accounts with the session cookie): a test must wait for the rows. The customer's id is only in that call and in the API sign-in's answer_; _a new customer's first account is a checking account with 515.50; the amount is a setting of this installation, so compare the page with the API instead of asserting the figure_; _the API has no call to sign a customer up: sign-up exists on the web only, and the story asks for nothing else. Without "Accept: application/json" the API answers XML_; _"Forgot login info?" is out of scope by the story's note (the lookup answered an internal error during probing; not part of this story)_; _customers cannot be deleted, and the admin page and the clean/initialize database functions are off limits: every run must use fresh unique usernames_

