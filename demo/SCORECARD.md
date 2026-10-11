# Held-out evaluator — scorecard

Generated 2026-10-11T10:33:02.912Z by `demo/score.ts` from `demo/answer-keys/*.json` (written before each evaluation), for the evaluations of round 32: one onboarding, then the nine stories one at a time in the same project.

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

