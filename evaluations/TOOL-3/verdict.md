# Held-out Evaluation Verdict — TOOL-3

> **Verdict: ❌ FAIL** — 1 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-8. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [TOOL-3](https://your-domain.atlassian.net/browse/TOOL-3) — Shopping cart for guests |
| Application under test | Practice Software Testing (profile `practicesoftwaretesting`) — UI https://practicesoftwaretesting.com/ · API https://api.practicesoftwaretesting.com/ |
| Final run | `05-eval` · 2026-09-29T23:04:28.196Z · 131s |
| Tests | 18 total · 14 passed · 4 failed · 0 flaky · 0 skipped (from 14 scenarios) |
| Held-out integrity | ✅ PRESERVED — 29 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 2 Playwright MCP (loaded natively: guest cart storage, the /checkout table and its data-test ids, putting an API cart into the browser) and tier 3 bundled… (see hardening log) |
| App knowledge | tests written blind; consulted after the freeze: 14 entries for the story (8 proven, 6 seen, 0 stale), and the full listing once · 20 recorded for later stories |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-09-29T23:07:29.560Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Minor | AC-8 | negative | Requests for a missing cart answer 404 with other messages than "Cart not found" | SCN-012.2, SCN-012.3 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (1 root cause(s), 2 failing test(s))

### APP-1 · SCN-012.2, SCN-012.3 · AC-8 — Requests for a missing cart answer 404 with other messages than "Cart not found"

| | |
| --- | --- |
| Suggested severity | Minor |
| Requirement AC-8 | Any request for a cart that does not exist responds 404 with the message "Cart not found". |
| Requirement source | story.md#L28 |
| Test type · layer | negative · api |
| SCN-012.2: expected (requirement) → actual (AUT) | `"Cart not found"` → `"Cart doesnt exists"` |
| SCN-012.3: expected (requirement) → actual (AUT) | `"Cart not found"` → `"Requested item not found"` |
| Failing step | And the message is "Cart not found" |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldoutac5i030`; recreate equivalent data before reproducing):

- a cart id that does not exist (create a cart, then delete it): `01m3qpp3pkhnhqgg6kj605ery5` · cleanup: none
- find 1 in-stock product(s) (GET /products): `[{"id":"01M3QPBHTFMBJC30PJAKM8MHVZ","name":"Combination Pliers","price":14.15}]` · cleanup: none

**Manually (scenario steps):**

1. Given a cart id that does not exist (a cart I created and deleted)
2. And a product that is in stock
3. When I <request> for that cart
4. Then the response status is 404
5. And the message is "Cart not found"

**API pre-steps: SCN-012.2** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /carts → 201`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/carts' \
     -H 'Cache-Control: no-cache'
   ```

P2. `DELETE /carts/01m3qpp3pkhnhqgg6kj605ery5 → 204`

   ```bash
   curl -i -X DELETE 'https://api.practicesoftwaretesting.com/carts/01m3qpp3pkhnhqgg6kj605ery5' \
     -H 'Cache-Control: no-cache'
   ```

P3. `GET /products → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-012.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `DELETE /carts/01m3qpp3pkhnhqgg6kj605ery5/product/01M3QPBHTFMBJC30PJAKM8MHVZ → 404` ⟵

   ```bash
   curl -i -X DELETE 'https://api.practicesoftwaretesting.com/carts/01m3qpp3pkhnhqgg6kj605ery5/product/01M3QPBHTFMBJC30PJAKM8MHVZ'
   ```

Observed response of request 1 (SCN-012.2):

```json
{"message":"Cart doesnt exists"}
```

**API pre-steps: SCN-012.3** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /carts → 201`

   ```bash
   curl -i -X POST 'https://api.practicesoftwaretesting.com/carts' \
     -H 'Cache-Control: no-cache'
   ```

P2. `DELETE /carts/01m3qppfe1mvkm5mt22ec92y6a → 204`

   ```bash
   curl -i -X DELETE 'https://api.practicesoftwaretesting.com/carts/01m3qppfe1mvkm5mt22ec92y6a' \
     -H 'Cache-Control: no-cache'
   ```

P3. `GET /products → 200`

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/products' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-012.3** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /carts/01m3qppfe1mvkm5mt22ec92y6a → 404` ⟵

   ```bash
   curl -i -X GET 'https://api.practicesoftwaretesting.com/carts/01m3qppfe1mvkm5mt22ec92y6a'
   ```

Observed response of request 1 (SCN-012.3):

```json
{"message":"Requested item not found"}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run TOOL-3 --label repro --grep "SCN-012\.2:"
npm run heldout -- run TOOL-3 --label repro --grep "SCN-012\.3:"
```

#### Evidence

- [Page/test context at failure](runs/05-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-30d2d-carts-id-product-productId--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/TOOL-3/runs/05-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-30d2d-carts-id-product-productId--chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-29 (tier 3, api-probe chain): runs/05-eval/confirm/missing-cart.md; same answers in hardening/api-cart-chain.md and runs 01/02 step 6

**Evaluator's analysis:** DELETE /carts/{id}/product/{productId} on a deleted cart → 404 as required, but the message is 'Cart doesnt exists', not 'Cart not found' (AC-8).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A guest creates an empty cart | AC-1 | functional | ✅ passed | - |
| SCN-002.1 | Adding a product with a quantity on the limits of 1–99 (quantity 1) | AC-2 | boundary | ✅ passed | - |
| SCN-002.2 | Adding a product with a quantity on the limits of 1–99 (quantity 99) | AC-2 | boundary | ✅ passed | - |
| SCN-003 | Adding a product already in the cart increases its quantity by the amount added | AC-2 | functional | ✅ passed | - |
| SCN-004.1 | A quantity just outside 1–99 is rejected and the cart is unchanged (quantity 0) | AC-3 | boundary | ✅ passed | - |
| SCN-004.2 | A quantity just outside 1–99 is rejected and the cart is unchanged (quantity 100) | AC-3 | boundary | ✅ passed | - |
| SCN-005 | Adding a product from its product page shows the confirmation | AC-4 | functional | ✅ passed | - |
| SCN-006 | The cart icon shows the total number of items after adding from the product page | AC-4 | functional | ✅ passed | - |
| SCN-007 | The cart page lists each product with quantity, unit price and line total | AC-5 | functional | ✅ passed | - |
| SCN-008 | The cart total equals the sum of the line totals | AC-5 | functional | ✅ passed | - |
| SCN-009 | Removing a product from the cart | AC-6 | functional | ✅ passed | - |
| SCN-010 | Deleting a cart | AC-7 | functional | ✅ passed | - |
| SCN-011 | Deleting a cart that was already deleted | AC-7 | idempotency | ❌ failed | APPLICATION_DEFECT |
| SCN-012.1 | A request for a cart that does not exist is answered 404 "Cart not found" (add the product (POST /carts/{id})) | AC-8 | negative | ✅ passed | - |
| SCN-012.2 | A request for a cart that does not exist is answered 404 "Cart not found" (remove the product (DELETE /carts/{id}/product/{productId})) | AC-8 | negative | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-012.3 | A request for a cart that does not exist is answered 404 "Cart not found" (read the cart) | AC-8 | negative | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-013 | Deleting a cart that does not exist is answered 404 "Cart not found" | AC-8 | negative | ❌ failed | APPLICATION_DEFECT |
| SCN-014 | A guest cart from creation to deletion | AC-1, AC-2, AC-6, AC-7 | composition | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | POST /carts creates an empty cart and responds 201 with its id. | SCN-001, SCN-014 | ✅ met |
| AC-2 | POST /carts/{id} with product_id and a quantity from 1 to 99 adds the product (200); adding a product already in the cart increases its quantity by the amount added. | SCN-002.1, SCN-002.2, SCN-003, SCN-014 | ✅ met |
| AC-3 | A quantity outside 1–99 is rejected with 422 and an error for the quantity field; the cart is unchanged. | SCN-004.1, SCN-004.2 | ✅ met |
| AC-4 | On a product page, choosing a quantity and pressing "Add to cart" shows "Product added to shopping cart." and the cart icon in the navigation shows the total number of items. | SCN-005, SCN-006 | ✅ met |
| AC-5 | The cart page (checkout step 1) lists each product with its quantity, unit price and line total (price × quantity), and the cart total. | SCN-007, SCN-008 | ✅ met |
| AC-6 | DELETE /carts/{id}/product/{productId} removes the product (204); the cart no longer lists it. | SCN-009, SCN-014 | ✅ met |
| AC-7 | Deleting a cart responds 204 and is idempotent: deleting a cart that was already deleted also responds 204. | SCN-010, SCN-011, SCN-014 | ❔ reading contradicted (the owner decides) |
| AC-8 | Any request for a cart that does not exist responds 404 with the message "Cart not found". | SCN-012.1, SCN-012.2, SCN-012.3, SCN-013 | ❌ not met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L21 | SCN-001 A guest creates an empty cart | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L21, story.md#L22, story.md#L26, story.md#L27 | SCN-014 A guest cart from creation to deletion | composition | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L22 | SCN-002 Adding a product with a quantity on the limits of 1–99 | boundary | api | 2/2 | ✅ meets requirement | - |
| ↳ | story.md#L22 | SCN-003 Adding a product already in the cart increases its quantity by the amount added | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L21, story.md#L22, story.md#L26, story.md#L27 | SCN-014 A guest cart from creation to deletion | composition | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L23 | SCN-004 A quantity just outside 1–99 is rejected and the cart is unchanged | boundary | api | 2/2 | ✅ meets requirement | - |
| **AC-4** | story.md#L24 | SCN-005 Adding a product from its product page shows the confirmation | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L24 | SCN-006 The cart icon shows the total number of items after adding from the product page | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md#L25 | SCN-007 The cart page lists each product with quantity, unit price and line total | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L25 | SCN-008 The cart total equals the sum of the line totals | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md#L26 | SCN-009 Removing a product from the cart | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L21, story.md#L22, story.md#L26, story.md#L27 | SCN-014 A guest cart from creation to deletion | composition | api | 1/1 | ✅ meets requirement | - |
| **AC-7** | story.md#L27 | SCN-010 Deleting a cart | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L27 | SCN-011 Deleting a cart that was already deleted | idempotency | api | 0/1 | ❔ reading contradicted | - |
| ↳ | story.md#L21, story.md#L22, story.md#L26, story.md#L27 | SCN-014 A guest cart from creation to deletion | composition | api | 1/1 | ✅ meets requirement | - |
| **AC-8** | story.md#L28 | SCN-012 A request for a cart that does not exist is answered 404 "Cart not found" | negative | api | 1/3 | ❌ fails requirement | APP-1 |
| ↳ | story.md#L28 | SCN-013 Deleting a cart that does not exist is answered 404 "Cart not found" | negative | api | 0/1 | ❔ reading contradicted | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 2 | 4 | 4 | 0 | 0 | - |
| composition | 1 | 1 | 1 | 0 | 0 | - |
| functional | 8 | 8 | 8 | 0 | 0 | - |
| idempotency | 1 | 1 | 0 | 1 | 0 | - |
| negative | 2 | 4 | 1 | 3 | 0 | APP-1 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | endpoint for reading a cart and where its products and quantities are in the answer (to check a cart is empty, lists a product with its quantity, is unchanged, no longer lists a product) | how to exercise | AC-1, AC-2, AC-3, AC-6, AC-8 | discovered from the AUT (mechanics only): GET /carts/{id} → 200 {id, cart_items: [{product_id, quantity, product{…}}]} |
| G2 | endpoint for deleting a cart (method and path) | how to exercise | AC-7, AC-8 | discovered from the AUT (mechanics only): DELETE /carts/{id} (no body, no auth) |
| G3 | how a test finds a product that is in stock (its product_id, and its product page) | how to exercise | AC-2, AC-3, AC-4, AC-5, AC-6, AC-8 | discovered from the AUT (mechanics only): GET /products (first page, envelope data[]) items carry id, name, price and in_stock; product page is /product/{id} |
| G4 | product page: route, and how the quantity control, the "Add to cart" button, the confirmation and the cart icon in the navigation are found | how to exercise | AC-4 | discovered from the AUT (mechanics only): route /product/{id}; ready: heading level 1 = product name; quantity getByRole('spinbutton', { name: 'Quantity', exact: true }); button getByTestId('add-to-cart'); confirmation toast text; cart icon getByTestId('nav-cart') (count in getByTestId('cart-quantity')) |
| G5 | cart page (checkout step 1): route, and how each product row, its quantity, unit price and line total, and the cart total are found | how to exercise | AC-5 | discovered from the AUT (mechanics only): route /checkout (step 1 'Cart'); row = table row with getByTestId('product-title'); cells getByTestId('product-quantity') (input), 'product-price', 'line-price'; total getByTestId('cart-total') |
| G6 | how a UI test gets a guest cart with products into the web shop (adding through product pages, or linking a cart created through the API to the browser) | how to exercise | AC-5 | discovered from the AUT (mechanics only): the web shop keeps the guest cart id in sessionStorage 'cart_id'; set it to a cart made through the API, then open /checkout |
| G7 | an id for a cart that does not exist (the id format the cart endpoints accept) | how to exercise | AC-8 | discovered from the AUT (mechanics only): cart ids are lowercase ULIDs from POST /carts; a missing id = a cart created then deleted |
| G8 | status for deleting a cart that was already deleted: AC-7 says 204 (idempotent), AC-8 says any request for a cart that does not exist responds 404 with the message "Cart not found" | expected behaviour | AC-7, AC-8 | ❓ open |
| G9 | what "the total number of items" on the cart icon counts: the sum of the quantities, or the number of different products | expected behaviour | AC-4 | ❓ open |
| G10 | what the cart total on the cart page must equal (the sum of the line totals, or with anything else such as shipping, tax or discounts) | expected behaviour | AC-5 | ❓ open |
| G11 | whether the 1–99 limit applies to the amount added or to the resulting quantity of a product already in the cart (adding to an existing line so the total goes past 99) | expected behaviour | AC-2, AC-3 | ❓ open |

**Open questions for the PO:**

- ❓ G8 — status for deleting a cart that was already deleted: AC-7 says 204 (idempotent), AC-8 says any request for a cart that does not exist responds 404 with the message "Cart not found". Both literal readings are tested (SCN-011, SCN-013) and tagged @needs-clarification. _(its literal reading is tested: see the scenarios needing clarification)_

**For the owner's information** (questions the criteria can be judged without, as the review confirmed; they don't affect the verdict):

- ℹ️ G9 — what "the total number of items" on the cart icon counts: the sum of the quantities, or the number of different products. SCN-006 tests the sum of the quantities (@needs-clarification).
- ℹ️ G10 — what the cart total on the cart page must equal (the sum of the line totals, or with anything else such as shipping, tax or discounts). SCN-008 tests the sum of the line totals (@needs-clarification).
- ℹ️ G11 — whether the 1–99 limit applies to the amount added or to the resulting quantity of a product already in the cart (adding to an existing line so the total goes past 99). Not tested.

**Scenarios needing clarification** (each tests the literal reading of an open question):

- SCN-006: The cart icon shows the total number of items after adding from the product page — passed: the application meets the literal reading
- SCN-008: The cart total equals the sum of the line totals — passed: the application meets the literal reading
- SCN-011: Deleting a cart that was already deleted — did not pass: the application contradicts the literal reading (see "Readings the application contradicts")
- SCN-013: Deleting a cart that does not exist is answered 404 "Cart not found" — did not pass: the application contradicts the literal reading (see "Readings the application contradicts")

**Assumptions the evaluation made:**

- rule 5 — only SCN-002 asserts the exact 200 of adding a product; SCN-003 and the composition assert the resulting cart contents.
- a cart "that does not exist" is seeded by creating a cart and deleting it (G7); never a guessed id.
- the cart and its reads are anonymous (story: "carts are anonymous"); no scenario sends a token.

**Readings the application contradicts** (the requirement does not settle these: an assumed value, or the literal reading of an open question; not reported as defects, the owner decides):

| Test | Rests on | Expected (by that reading) | Actual |
| --- | --- | --- | --- |
| SCN-011 | G8 (literal reading) | 204 | 404 |
| SCN-013 | G8 (literal reading) | "Cart not found" | "Cart doesnt exists" |

Full review: [requirement-review.md](requirement-review.md)

## Observations outside the acceptance criteria

Seen while evaluating; no criterion states them, so they do not affect the verdict. The owner decides whether they matter:

- 🔎 the in-stock product "Thor Hammer" refuses a quantity of 2 (and a second add of 1) with 400 "You can only have one Thor Hammer in the cart." (hardening/api-thor-hammer.md; also seen on its product page). AC-2 states 1–99 for adding a product and the test data line allows "any product that is in stock"; the story names no per-product limit. The tests use other in-stock products; the owner should say whether per-product limits are intended.

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above). App knowledge from earlier stories (how to reach pages and call endpoints, never what the application answers) is available only after the freeze.
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 12 | 5 | 1 |
| `02-harden` (hardening dry-run) | 14 | 4 | 0 |
| `03-harden-stability` (hardening dry-run) | 11 | 2 | 1 |
| `04-harden-stability` (hardening dry-run) | 14 | 0 | 0 |
| `05-eval` (final) | 14 | 4 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/05-eval/triage.md](runs/05-eval/triage.md) · JUnit: runs/05-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/TOOL-3/runs/05-eval/html`
