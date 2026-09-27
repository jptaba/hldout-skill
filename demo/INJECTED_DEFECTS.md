# Demo answer key — intentionally injected defects

> This file is the **answer key** for the DEMO-101 demonstration. The evaluator must not read it
> while evaluating (it would break the held-out property). It exists so a human can check that the
> skill classified each failure correctly.

The AUT is the public demo shop https://www.saucedemo.com (Swag Labs). Its behaviour is fixed, so
"application defects" are created by writing requirements the shop does not satisfy.

## Application defects injected into the requirement (expected verdict: FAIL)

| ID | Where | Requirement says | The AUT actually does | Expected classification |
| --- | --- | --- | --- | --- |
| D1 | Story AC-2 | Locked-out message is "Your account has been locked. Please contact customer support." | "Epic sadface: Sorry, this user has been locked out." | APPLICATION_DEFECT |
| D2 | Attachment `pricing-rules.md` (via AC-7) | Sales tax is 10% of item total | Charges 8% | APPLICATION_DEFECT — only detectable by reading the attachment |
| D3 | Story AC-3 | Username and Password are cleared after a failed sign-in | Both fields keep their values | APPLICATION_DEFECT |

Everything else in DEMO-101 (AC-1, AC-4, AC-5, AC-6, AC-8, AC-9 and the AC-3 message text) matches
the real shop and should pass.

## Script defect seeded into the hardened spec (expected: detected, repaired, re-run passes)

| ID | Where | What | Expected classification |
| --- | --- | --- | --- |
| S1 | SCN-011 (order confirmation) — after hardening | Checkout control located as `getByRole('link', { name: 'Checkout' })`; the AUT renders it as a **button** | SCRIPT_DEFECT (element exists with a different role) → repaired → passes on re-run |

S1 simulates a selector regression slipping past hardening, to prove triage can tell a broken test
from a broken application.

---

# DEMO-202 — Guest enquiries (UI + API), AUT profile `shady-meadows`

AUT: the public Restful Booker Platform demo at https://automationintesting.online. Some findings
were **embedded** by writing requirements the site does not satisfy. Others are **genuine defects
of the demo site** that a well-written requirement exposes. Both are valid held-out findings.

## Application findings (expected verdict: FAIL, 9 root causes / 11 failing tests)

| ID in verdict | Origin | Where | Requirement says | AUT actually does | Test type |
| --- | --- | --- | --- | --- | --- |
| APP-1 | genuine | AC-8 | message list/detail need a staff token → 401 | 200 with personal data, no token needed | security |
| APP-2 | genuine | AC-1 | every field has an associated label | Message `<label for="message">` vs textarea `id="description"` | accessibility |
| APP-3 | embedded | field-rules.csv (AC-4/6) | Name 2–50 characters | 1 and 51 characters accepted | boundary |
| APP-4 | genuine | AC-7 | malformed JSON → 400 | 500 | negative |
| APP-5 | genuine | AC-12 | unknown room → 404 | 500 | negative |
| APP-6 | genuine | AC-14 / ux-copy.md | image alt names that room's type | every card says "Single Room" | accessibility |
| APP-7 | embedded (rev 2) | AC-16 / api-contract.md v1.5 | same Idempotency-Key stored once | stored twice | idempotency |
| APP-8 | embedded | AC-5 / api-contract.md | create → 201 Created | 200 | functional |
| APP-9 | embedded | field-rules.csv | `guest@example` (no TLD) invalid | accepted | boundary |

Everything else passes: AC-2, AC-3, AC-9, AC-10, AC-11, AC-13, AC-15, AC-16(b) and all other boundary rows.

## Script defect seeded after hardening (expected: detected, repaired, re-run passes)

| ID | Where | What | Expected classification |
| --- | --- | --- | --- |
| S2 | SCN-011 | the test calls `GET /api/messages` (plural), which is not a declared endpoint | SCRIPT_DEFECT (high) via the undeclared-endpoint rule → repaired → passes |

## Script defects found naturally during hardening (not seeded)

| Where | What | How it was handled |
| --- | --- | --- |
| SCN-003 | `getByRole('alert')` matched an always-empty live region | Locator hardened to the real error container. Led to the "empty text → NEEDS_INVESTIGATION" classifier rule |
| SCN-003 | `\bEmail\b` regex couldn't match the separator-less error list | Audited amendment. Led to the "loose regex → SCRIPT_DEFECT" classifier rule |

## Requirement revision (demonstrates change detection)

Revision 2 added AC-16 (idempotency). `jira-fetch` detected the change (`requirement/CHANGES.md`);
the scenarios, review and tests were extended and the draft was re-frozen with a logged reason.

---

# Machine-readable answer keys and the scorecard

From DEMO-303 onwards, each story's answer key is **machine-readable** and was written *before* the evaluation:
[demo/answer-keys/](answer-keys/). `npx tsx demo/score.ts` compares every verdict and triage against them and writes
[demo/SCORECARD.md](SCORECARD.md): verdict match, defect recall and precision (false positives), seeded
script defects caught, and how often the automatic triage agreed, abstained or was wrong.

| Story | AUT | Designed to test | Expected verdict |
| --- | --- | --- | --- |
| DEMO-303 | restful-booker (pure API) | API-only flow, cookie + Basic auth, PUT/PATCH/DELETE, validation, a seeded auth-plumbing script defect that **masks** a real defect | FAIL (6 root causes) |
| DEMO-404 | the-internet (UI) | **False-positive resistance**: the app meets every AC, but the mechanics are traps (hanging `load`, table-sorter race, JS dialogs, delayed render) | PASS |
| DEMO-505 | the-internet (UI) | Ambiguity: `@needs-clarification` + open question, no defects | PASS_WITH_WARNINGS |
| DEMO-606 | the-internet (UI) | Nondeterminism: an intermittent copy typo ("unsuccesful") must be found by sampling, not dismissed as flaky | FAIL (1) |
| DEMO-707 | Conduit (UI + API, JWT) | **Requirement contract** intake (ACs quoted from the story, API contract in an attachment, 5 gaps incl. an assumed and an open oracle gap); per-user visibility traps; a seeded script defect the AUT answers with **500** | FAIL (7) |

## DEMO-707 — Conduit (answer key: [answer-keys/DEMO-707.json](answer-keys/DEMO-707.json))

| # | AC | Origin | Defect |
| --- | --- | --- | --- |
| D1 | AC-3 | genuine | wrong password → 403 instead of 401 |
| D2 | AC-6 | embedded (the story says titles need not be unique) | a second article with the same title → 422 "must be unique" |
| D3 | AC-10 | genuine (sandbox scoping) | other readers and anonymous visitors don't see an author's new article through `?author=` |
| D4 | AC-11 | embedded (the story says limit is 1–100) | limit=0 and limit=101 accepted with 200 |
| D5 | AC-14 | genuine (sandbox scoping) | comments are visible only to the commenter |
| D6 | AC-15 | genuine | deleting someone else's comment → 404 instead of 403 |
| D7 | AC-16 | genuine | favouriting twice counts twice |

| Seeded | Scenario | Script defect | Expected handling |
| --- | --- | --- | --- |
| S5 | SCN-007 | the create-article test omits the `{"article": …}` envelope. The AUT **crashes with 500**, which the "5xx → application" rule reads as an app defect | SCRIPT_DEFECT through the contract's request envelope → repaired → passes. The 500 on malformed input is reported as an observation outside the ACs |
