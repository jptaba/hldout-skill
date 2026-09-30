# Triage — TOOL-3 / run 05-eval

Generated 2026-09-29T23:07:24.637Z

**14/18 passed**, 4 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002.1 | boundary | AC-2 | passed | - | - | - |
| SCN-002.2 | boundary | AC-2 | passed | - | - | - |
| SCN-003 | functional | AC-2 | passed | - | - | - |
| SCN-004.1 | boundary | AC-3 | passed | - | - | - |
| SCN-004.2 | boundary | AC-3 | passed | - | - | - |
| SCN-005 | functional | AC-4 | passed | - | - | - |
| SCN-006 | functional | AC-4 | passed | - | - | - |
| SCN-007 | functional | AC-5 | passed | - | - | - |
| SCN-008 | functional | AC-5 | passed | - | - | - |
| SCN-009 | functional | AC-6 | passed | - | - | - |
| SCN-010 | functional | AC-7 | passed | - | - | - |
| SCN-011 | idempotency | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-012.1 | negative | AC-8 | passed | - | - | - |
| SCN-012.2 | negative | AC-8 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-012.3 | negative | AC-8 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-013 | negative | AC-8 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-014 | composition | AC-1, AC-2, AC-6, AC-7 | passed | - | - | - |

## SCN-011: Deleting a cart that was already deleted

- Requirement refs: AC-7 · type: idempotency · layer: api
- Failing step: Then the response status is 204
- Error: `[REQ AC-7] DELETE /carts/{id} of an already-deleted cart responds 204 → 204`
- Expected: `204`
- Received: `404`
- Relevant API exchange (#1 of 1): `DELETE https://api.practicesoftwaretesting.com/carts/01m3qpnj5d5dzw1mk8khd1r8d1` → **404**
  - request body: ``
  - response body: `{"message":"Cart doesnt exists"}`
- Evidence: [screenshot](artifacts/TOOL-3-tests-tool-3-TOOL-3-62fdf-rt-that-was-already-deleted-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-3/runs/05-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-62fdf-rt-that-was-already-deleted-chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-3-tests-tool-3-TOOL-3-62fdf-rt-that-was-already-deleted-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: DELETE /carts/01m3qpnj5d5dzw1mk8khd1r8d1 → 404
- Requirement assertion [REQ AC-7] failed.
- Expected: 204
- Received: 404
- SCN-011 rests on an unsettled reading (@needs-clarification: the literal reading of an open question). Confirm what the application does as usual; the verdict then lists it as a question for the owner, not as a defect.

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Cart created, DELETE /carts/{id} → 204, the same DELETE again → 404 {"message":"Cart doesnt exists"}. AC-7 says 204. The scenario is @needs-clarification (G8: AC-8 says any request for a missing cart is 404 'Cart not found'), so this is a reading the application contradicts, for the owner.

## SCN-012.2: A request for a cart that does not exist is answered 404 "Cart not found" (remove the product (DELETE /carts/{id}/product/{productId}))

- Requirement refs: AC-8 · type: negative · layer: api
- Failing step: And the message is "Cart not found"
- Error: `[REQ AC-8] remove the product (DELETE /carts/{id}/product/{productId}) of a missing cart says "Cart not found"`
- Expected: `"Cart not found"`
- Received: `"Cart doesnt exists"`
- Relevant API exchange (#1 of 1): `DELETE https://api.practicesoftwaretesting.com/carts/01m3qpp3pkhnhqgg6kj605ery5/product/01M3QPBHTFMBJC30PJAKM8MHVZ` → **404**
  - request body: ``
  - response body: `{"message":"Cart doesnt exists"}`
- Evidence: [screenshot](artifacts/TOOL-3-tests-tool-3-TOOL-3-30d2d-carts-id-product-productId--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-3/runs/05-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-30d2d-carts-id-product-productId--chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-3-tests-tool-3-TOOL-3-30d2d-carts-id-product-productId--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: DELETE /carts/01m3qpp3pkhnhqgg6kj605ery5/product/01M3QPBHTFMBJC30PJAKM8MHVZ → 404
- Requirement assertion [REQ AC-8] failed.
- Expected: "Cart not found"
- Received: "Cart doesnt exists"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — DELETE /carts/{id}/product/{productId} on a deleted cart → 404 as required, but the message is 'Cart doesnt exists', not 'Cart not found' (AC-8).

## SCN-012.3: A request for a cart that does not exist is answered 404 "Cart not found" (read the cart)

- Requirement refs: AC-8 · type: negative · layer: api
- Failing step: And the message is "Cart not found"
- Error: `[REQ AC-8] read the cart of a missing cart says "Cart not found"`
- Expected: `"Cart not found"`
- Received: `"Requested item not found"`
- Relevant API exchange (#1 of 1): `GET https://api.practicesoftwaretesting.com/carts/01m3qppfe1mvkm5mt22ec92y6a` → **404**
  - request body: ``
  - response body: `{"message":"Requested item not found"}`
- Evidence: [screenshot](artifacts/TOOL-3-tests-tool-3-TOOL-3-e19fd-rt-not-found-read-the-cart--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-3/runs/05-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-e19fd-rt-not-found-read-the-cart--chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-3-tests-tool-3-TOOL-3-e19fd-rt-not-found-read-the-cart--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /carts/01m3qppfe1mvkm5mt22ec92y6a → 404
- Requirement assertion [REQ AC-8] failed.
- Expected: "Cart not found"
- Received: "Requested item not found"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — GET /carts/{id} on a deleted cart → 404 as required, but the message is 'Requested item not found', not 'Cart not found' (AC-8).

## SCN-013: Deleting a cart that does not exist is answered 404 "Cart not found"

- Requirement refs: AC-8 · type: negative · layer: api
- Failing step: And the message is "Cart not found"
- Error: `[REQ AC-8] DELETE /carts/{id} of a missing cart says "Cart not found"`
- Expected: `"Cart not found"`
- Received: `"Cart doesnt exists"`
- Relevant API exchange (#1 of 1): `DELETE https://api.practicesoftwaretesting.com/carts/01m3qppv5kb6mc5cfgs8ptgs4c` → **404**
  - request body: ``
  - response body: `{"message":"Cart doesnt exists"}`
- Evidence: [screenshot](artifacts/TOOL-3-tests-tool-3-TOOL-3-7ae1b-nswered-404-Cart-not-found--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/TOOL-3/runs/05-eval/artifacts/TOOL-3-tests-tool-3-TOOL-3-7ae1b-nswered-404-Cart-not-found--chromium-retry1/trace.zip` · [error-context](artifacts/TOOL-3-tests-tool-3-TOOL-3-7ae1b-nswered-404-Cart-not-found--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: DELETE /carts/01m3qppv5kb6mc5cfgs8ptgs4c → 404
- Requirement assertion [REQ AC-8] failed.
- Expected: "Cart not found"
- Received: "Cart doesnt exists"
- SCN-013 rests on an unsettled reading (@needs-clarification: the literal reading of an open question). Confirm what the application does as usual; the verdict then lists it as a question for the owner, not as a defect.

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — DELETE /carts/{id} on a deleted cart → 404, message 'Cart doesnt exists', not 'Cart not found'. The scenario is @needs-clarification (G8 conflicts with AC-7's 204): whichever reading the owner picks, the message does not match AC-8.
