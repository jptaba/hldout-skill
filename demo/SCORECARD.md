# Held-out evaluator — scorecard

Generated 2026-09-27T00:35:40.132Z by `demo/score.ts` from `demo/answer-keys/*.json` (written before each evaluation).

| Story | AUT | Expected verdict | Actual verdict | Defects found (recall) | False positives | Seeded script defects caught | Auto-triage vs confirmed decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DEMO-101 | swag-labs | FAIL | ✅ FAIL | 3/3 (100%) | 0 | 1/1 | 4/4 (100%) · abstained 0 · wrong 0 |
| DEMO-202 | shady-meadows | FAIL | ✅ FAIL | 9/9 (100%) | 0 | 1/1 | 12/12 (100%) · abstained 0 · wrong 0 |
| DEMO-303 | restful-booker | FAIL | ✅ FAIL | 6/6 (100%) | 0 | 1/1 | 12/13 (92%) · abstained 1 · wrong 0 |
| DEMO-404 | the-internet | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| DEMO-505 | the-internet | PASS_WITH_WARNINGS | ✅ PASS_WITH_WARNINGS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| DEMO-606 | the-internet | FAIL | ✅ FAIL | 1/1 (100%) | 0 | 0/0 | 1/1 (100%) · abstained 0 · wrong 0 |
| DEMO-707 | conduit | FAIL | ✅ FAIL | 7/7 (100%) | 0 | 1/1 | 12/12 (100%) · abstained 0 · wrong 0 |
| TOOL-1 | toolshop | FAIL | ✅ FAIL | 2/2 (100%) | 0 | 1/1 | 3/3 (100%) · abstained 0 · wrong 0 |
| TOOL-2 | toolshop | FAIL | ✅ FAIL | 1/1 (100%) | 0 | 0/0 | 1/1 (100%) · abstained 0 · wrong 0 |
| TOOL-3 | toolshop | FAIL | ✅ FAIL | 2/2 (100%) | 0 | 1/1 | 6/6 (100%) · abstained 0 · wrong 0 |
| TOOL-4 | toolshop | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| TOOLB-1 | toolshop-rc | FAIL | _not evaluated_ | | | | |
| TOOLB-2 | toolshop-rc | FAIL | _not evaluated_ | | | | |
| **Total** | | | 11/11 verdicts | 31/31 (100%) | 0 | 6/6 | 51/52 (98%) · wrong 0 |

Precision: 100% (31 of 31 confirmed findings are real).

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
