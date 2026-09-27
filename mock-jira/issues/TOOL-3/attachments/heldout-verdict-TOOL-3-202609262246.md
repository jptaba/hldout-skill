# Held-out Evaluation Verdict — TOOL-3

> **Verdict: ❌ FAIL** — 2 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-7, AC-8. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [TOOL-3](https://your-domain.atlassian.net/browse/TOOL-3) — Shopping cart for guests |
| Application under test | Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) — UI https://practicesoftwaretesting.com · API https://api.practicesoftwaretesting.com |
| Final run | `04-eval` · 2026-09-26T22:46:31.587Z · 19s |
| Tests | 14 total · 10 passed · 4 failed · 0 flaky · 0 skipped (from 9 scenarios) |
| Held-out integrity | ✅ PRESERVED — 21 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (`inspect.ts` for the product page — contract gap G5; `run.ts --label harden --capture`). |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-26T22:46:56.162Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Minor | AC-7 | idempotency | Deleting an already-deleted cart answers 404, not 204 | SCN-008 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Minor | AC-8 | negative | Missing-cart errors don't say "Cart not found" consistently | SCN-009.1, SCN-009.3, SCN-009.4 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (2 root cause(s), 4 failing test(s))

### APP-1 · SCN-008 · AC-7 — Deleting an already-deleted cart answers 404, not 204

| | |
| --- | --- |
| Suggested severity | Minor |
| Requirement AC-7 | Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. |
| Requirement source | story.md#L27 |
| Test type · layer | idempotency · api |
| SCN-008: expected (requirement) → actual (AUT) | `204` → `404` |
| Failing step | And deleting the same cart again responds 204 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxzbq9n40`; recreate equivalent data before reproducing):

- empty cart (POST /carts): `01m3fyc4k3r1kdbh69jf17zdxe` · cleanup: done

**Manually (scenario steps):**

1. Given a cart
2. When I delete the cart
3. Then the response status is 204
4. And deleting the same cart again responds 204

**API pre-steps: SCN-008** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /carts → 201`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/carts'
   ```

**Via the API: SCN-008** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 2 (⟵) is the one that contradicts the requirement:

1. `DELETE /carts/01m3fyc4k3r1kdbh69jf17zdxe → 204`

   ```bash
   curl -i -X DELETE 'https://api.practicesoftwaretesting.com/carts/01m3fyc4k3r1kdbh69jf17zdxe'
   ```

2. `DELETE /carts/01m3fyc4k3r1kdbh69jf17zdxe → 404` ⟵

   ```bash
   curl -i -X DELETE 'https://api.practicesoftwaretesting.com/carts/01m3fyc4k3r1kdbh69jf17zdxe'
   ```

Observed response of request 2 (SCN-008):

```json
{"message":"Cart doesnt exists"}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts TOOL-3 --label repro --grep "SCN-008:"
```

#### Evidence

- [Page/test context at failure](runs/04-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-c4f82-leting-a-cart-is-idempotent-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/TOOL-3/runs/04-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-c4f82-leting-a-cart-is-idempotent-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/TOOL-3/runs/03-eval/confirm/confirm.md

**Evaluator's analysis:** Reproduced live: first DELETE /carts/{id} → 204, the second → 404 "Cart doesnt exists". AC-7 requires the repeated delete to answer 204 (idempotent); the AC-7/AC-8 overlap is recorded as assumption G7 — the reviewer may want the PO to confirm AC-7's precedence. (Confirmed in run 03-eval; identical failure signature in 04-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-009.1, SCN-009.3, SCN-009.4 · AC-8 — Missing-cart errors don't say "Cart not found" consistently

| | |
| --- | --- |
| Suggested severity | Minor |
| Requirement AC-8 | Any request for a cart that does not exist responds 404 with the message "Cart not found". |
| Requirement source | story.md#L28 |
| Test type · layer | negative · api |
| SCN-009.1: expected (requirement) → actual (AUT) | `"Cart not found"` → `"Requested item not found"` |
| SCN-009.3: expected (requirement) → actual (AUT) | `"Cart not found"` → `"Cart doesnt exists"` |
| SCN-009.4: expected (requirement) → actual (AUT) | `"Cart not found"` → `"Cart doesnt exists"` |
| Failing step | Then the response status is 404 with the message "Cart not found" |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxzbq5o30`; recreate equivalent data before reproducing):

- find an in-stock product (GET /products/search): `{"id":"01M3FVQJG6E2QF0114BDA47REV","name":"Combination Pliers","description":"Versatile combination pliers designed for gripping, bending, and cutting wire with…` · cleanup: none

**Manually (scenario steps):**

1. Given a cart id that never existed
2. When I send <request> for it
3. Then the response status is 404 with the message "Cart not found"

**API pre-steps: SCN-009.1** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /products/search → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products/search?q=pliers'
   ```

**Via the API: SCN-009.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /carts/nxmuizbq5p7estfh → 404` ⟵

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/carts/nxmuizbq5p7estfh'
   ```

Observed response of request 1 (SCN-009.1):

```json
{"message":"Requested item not found"}
```

**API pre-steps: SCN-009.3** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /products/search → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products/search?q=pliers'
   ```

**Via the API: SCN-009.3** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `DELETE /carts/nxmuizbre90qv22l/product/01M3FVQJG6E2QF0114BDA47REV → 404` ⟵

   ```bash
   curl -i -X DELETE 'https://api.practicesoftwaretesting.com/carts/nxmuizbre90qv22l/product/01M3FVQJG6E2QF0114BDA47REV'
   ```

Observed response of request 1 (SCN-009.3):

```json
{"message":"Cart doesnt exists"}
```

**API pre-steps: SCN-009.4** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /products/search → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products/search?q=pliers'
   ```

**Via the API: SCN-009.4** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `DELETE /carts/nxmuizbty4wfx2ko → 404` ⟵

   ```bash
   curl -i -X DELETE 'https://api.practicesoftwaretesting.com/carts/nxmuizbty4wfx2ko'
   ```

Observed response of request 1 (SCN-009.4):

```json
{"message":"Cart doesnt exists"}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts TOOL-3 --label repro --grep "SCN-009\.1:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts TOOL-3 --label repro --grep "SCN-009\.3:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts TOOL-3 --label repro --grep "SCN-009\.4:"
```

#### Evidence

- [Page/test context at failure](runs/04-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-2c74d-r-a-cart-that-never-existed-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/TOOL-3/runs/04-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-2c74d-r-a-cart-that-never-existed-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/TOOL-3/runs/03-eval/confirm/confirm.md

**Evaluator's analysis:** Reproduced live for a cart id that never existed: all four requests answer 404 (status as required), but only add-product says "Cart not found"; read says "Requested item not found", remove-product and delete-cart say "Cart doesnt exists". AC-8 requires the message "Cart not found" for any request. (Confirmed in run 03-eval; identical failure signature in 04-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (2)

| Found in run | Test | Symptom | Diagnosis | Fix applied | Final run |
| --- | --- | --- | --- | --- | --- |
| `03-eval` | SCN-002.1 | [REQ AC-2] add quantity 1 → 200 | Replayed: the body the test sent ({productId, quantity}) gets 422 "The product id field is required."; with the contract's field name product_id the same call returns 200 and the cart holds the quantity (1 and 99 both accepted). | Send product_id (HOW only) and re-run. | ✅ passed |
| `03-eval` | SCN-002.2 | [REQ AC-2] add quantity 99 → 200 | Replayed: the body the test sent ({productId, quantity}) gets 422 "The product id field is required."; with the contract's field name product_id the same call returns 200 and the cart holds the quantity (1 and 99 both accepted). | Send product_id (HOW only) and re-run. | ✅ passed |

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | Creating a cart | AC-1 | functional | ✅ passed | - |
| SCN-002.1 | Adding a product with quantity 1 | AC-2 | boundary | ✅ passed | - |
| SCN-002.2 | Adding a product with quantity 99 | AC-2 | boundary | ✅ passed | - |
| SCN-003 | Adding a product already in the cart increases its quantity | AC-2 | functional | ✅ passed | - |
| SCN-004.1 | A quantity of 0 is rejected | AC-3 | boundary | ✅ passed | - |
| SCN-004.2 | A quantity of 100 is rejected | AC-3 | boundary | ✅ passed | - |
| SCN-005 | Adding to the cart from a product page | AC-4 | functional | ✅ passed | - |
| SCN-006 | The cart page lists quantity, unit price, line total and cart total | AC-5 | functional | ✅ passed | - |
| SCN-007 | Removing a product from the cart | AC-6 | functional | ✅ passed | - |
| SCN-008 | Deleting a cart is idempotent | AC-7 | idempotency | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-009.1 | a read for a cart that never existed | AC-8 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-009.2 | an add product for a cart that never existed | AC-8 | negative | ✅ passed | - |
| SCN-009.3 | a remove product for a cart that never existed | AC-8 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-009.4 | a delete cart for a cart that never existed | AC-8 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | POST /carts creates an empty cart and responds 201 with its id. | SCN-001 | ✅ met |
| AC-2 | POST /carts/{id} with product_id and a quantity from 1 to 99 adds the product (200); adding a product already in the cart increases its quantity by the amount added. | SCN-002.1, SCN-002.2, SCN-003 | ✅ met |
| AC-3 | A quantity outside 1–99 is rejected with 422 and an error for the quantity field; the cart is unchanged. | SCN-004.1, SCN-004.2 | ✅ met |
| AC-4 | On a product page, choosing a quantity and pressing "Add to cart" shows "Product added to shopping cart." and the cart icon in the navigation shows the total number of items. | SCN-005 | ✅ met |
| AC-5 | The cart page (checkout step 1) lists each product with its quantity, unit price and line total (price × quantity), and the cart total. | SCN-006 | ✅ met |
| AC-6 | DELETE /carts/{id}/product/{productId} removes the product (204); the cart no longer lists it. | SCN-007 | ✅ met |
| AC-7 | Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. | SCN-008 | ❌ not met |
| AC-8 | Any request for a cart that does not exist responds 404 with the message "Cart not found". | SCN-009.1, SCN-009.2, SCN-009.3, SCN-009.4 | ❌ not met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L21 | SCN-001 Creating a cart | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L22 | SCN-002 Adding a product with quantity <quantity> | boundary | api | 2/2 | ✅ meets requirement | - |
| ↳ | story.md#L22 | SCN-003 Adding a product already in the cart increases its quantity | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L23 | SCN-004 A quantity of <quantity> is rejected | boundary | api | 2/2 | ✅ meets requirement | - |
| **AC-4** | story.md#L24 | SCN-005 Adding to the cart from a product page | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L25 | SCN-006 The cart page lists quantity, unit price, line total and cart total | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L26 | SCN-007 Removing a product from the cart | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-7** | story.md#L27 | SCN-008 Deleting a cart is idempotent | idempotency | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-8** | story.md#L28 | SCN-009 <request> for a cart that never existed | negative | api | 1/4 | ❌ fails requirement | APP-2 |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 2 | 4 | 4 | 0 | 0 | - |
| functional | 5 | 5 | 5 | 0 | 0 | - |
| idempotency | 1 | 1 | 0 | 1 | 0 | APP-1 |
| negative | 1 | 4 | 1 | 3 | 0 | APP-2 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | API origin and web shop origin | how to exercise | * | project configuration: API https://api.practicesoftwaretesting.com ; web shop https://practicesoftwaretesting.com |
| G2 | endpoint for reading a cart (needed to check that a cart is empty, lists a product, is unchanged, or no longer lists a product) | how to exercise | AC-1, AC-2, AC-3, AC-6, AC-8 | discovered from the AUT (mechanics only): GET /carts/{id} |
| G3 | endpoint for deleting a cart | how to exercise | AC-7, AC-8 | discovered from the AUT (mechanics only): DELETE /carts/{id} |
| G4 | request header scheme for the API (how to get JSON error responses) | how to exercise | AC-1, AC-2, AC-3, AC-6, AC-7, AC-8 | discovered from the AUT (mechanics only): send Accept: application/json on every API request |
| G5 | web shop routes and controls: product page, quantity control, Add to cart button, confirmation toast, navigation cart badge, cart page | how to exercise | AC-4, AC-5 | discovered from the AUT (mechanics only): product page /product/<id>; quantity [data-test=quantity], [data-test=increase-quantity]; button [data-test=add-to-cart]; toast role=alert; nav badge [data-test=cart-quantity]; cart page /checkout |
| G6 | how to find an in-stock product to use as test data | how to exercise | AC-2, AC-3, AC-4, AC-5, AC-6, AC-8 | discovered from the AUT (mechanics only): GET /products/search, then pick a product that is in stock |
| G7 | conflict, limited to deleting a cart that was already deleted: AC-7 (L27) says the repeated delete responds 204, AC-8 (L28) says any request for a cart that does not exist responds 404 "Cart not found" | expected behaviour | AC-7, AC-8 | assumed: only for a cart that was already deleted: deleting it again responds 204 (AC-7, the more specific statement). Every other request for a cart that does not exist, including DELETE /carts/{id} on a cart id that never existed, responds 404 "Cart not found" (AC-8) |
| G8 | what "the total number of items" on the cart icon counts: the sum of the quantities, or the number of distinct products | expected behaviour | AC-4 | assumed: the cart icon shows the sum of the quantities of all products in the cart |
| G9 | how the cart total on the cart page is computed | expected behaviour | AC-5 | assumed: the cart total equals the sum of the line totals |
| G10 | what happens when adding a product already in the cart would take its quantity above 99 | expected behaviour | AC-2 | ❓ open |

**Open questions (not tested; need an answer from the PO):**

- ❓ G10 — what happens when adding a product already in the cart would take its quantity above 99

**Assumptions the evaluation made:**

- G7 — conflict, limited to deleting a cart that was already deleted: AC-7 (L27) says the repeated delete responds 204, AC-8 (L28) says any request for a cart that does not exist responds 404 "Cart not found": only for a cart that was already deleted: deleting it again responds 204 (AC-7, the more specific statement). Every other request for a cart that does not exist, including DELETE /carts/{id} on a cart id that never existed, responds 404 "Cart not found" (AC-8)
- G8 — what "the total number of items" on the cart icon counts: the sum of the quantities, or the number of distinct products: the cart icon shows the sum of the quantities of all products in the cart
- G9 — how the cart total on the cart page is computed: the cart total equals the sum of the line totals
- Each API scenario creates its own anonymous cart (POST /carts) and deletes it afterwards; the product is an in-stock product found via GET /products/search (contract G6).

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 2 | 0 | 0 |
| `02-harden` (hardening dry-run) | 8 | 6 | 0 |
| `03-eval` | 8 | 6 | 0 |
| `04-eval` (final) | 10 | 4 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/04-eval/triage.md](runs/04-eval/triage.md) · JUnit: runs/04-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/TOOL-3/runs/04-eval/html`
