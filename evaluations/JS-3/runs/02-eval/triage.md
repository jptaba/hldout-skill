# Triage — JS-3 / run 02-eval

Generated 2026-09-29T12:46:03.491Z

**14/18 passed**, 4 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | contract | AC-3 | passed | - | - | - |
| SCN-004.1 | security | AC-4 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-004.2 | security | AC-4 | passed | - | - | - |
| SCN-004.3 | security | AC-4 | passed | - | - | - |
| SCN-005 | security | AC-5 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-006 | audit | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007 | audit | AC-6 | passed | - | - | - |
| SCN-008 | idempotency | AC-7 | passed | - | - | - |
| SCN-009 | concurrency | AC-8 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-010 | negative | AC-9 | passed | - | - | - |
| SCN-011 | negative | AC-9 | passed | - | - | - |
| SCN-012 | boundary | AC-10 | passed | - | - | - |
| SCN-013 | boundary | AC-10 | passed | - | - | - |
| SCN-014 | accessibility | AC-11 | passed | - | - | - |
| SCN-015 | composition | AC-12 | passed | - | - | - |
| SCN-016 | integration | AC-13 | passed | - | - | - |

## SCN-004.1: Writing, liking and editing without a token are refused and change nothing (PUT)

- Requirement refs: AC-4 · type: security · layer: api
- Failing step: Then the answer is HTTP 401
- Error: `[REQ AC-4] PUT /rest/products/1/reviews without a token → 401`
- Expected: `401`
- Received: `201`
- Relevant API exchange (#1 of 2): `PUT http://localhost:3000/rest/products/1/reviews` → **201**
  - request body: `{"message":"hldout mo6cwjer-1","author":"hldout-mo6cwkm9-2@example.com"}`
  - response body: `{"status":"success"}`
- Evidence: [screenshot](artifacts/JS-3-tests-js-3-JS-3-Produ-b782a-sed-and-change-nothing-PUT--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/JS-3/runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-b782a-sed-and-change-nothing-PUT--chromium-retry1/trace.zip` · [error-context](artifacts/JS-3-tests-js-3-JS-3-Produ-b782a-sed-and-change-nothing-PUT--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: PUT /rest/products/1/reviews → 201
- Requirement assertion [REQ AC-4] failed.
- Expected: 401
- Received: 201
- Also failed: [REQ AC-4] PUT /rest/products/1/reviews without a token stores nothing — expected { Array [] }, received { "_id": "zKPtoodcdwyiH5FAQ", "author": "hldout-mo6cwkm9-2@example.com", "liked": true, "likedBy": Array [], "likesCount": 0, "message": "hldout mo6cwjer-1", "product": "1" }

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: PUT /rest/products/1/reviews with no Authorization header answers 201 and the review is stored and listed (steps 6, 12). Liking and editing without a token are refused with 401 (SCN-004.2/.3 pass).

## SCN-005: Another customer cannot edit my review

- Requirement refs: AC-5 · type: security · layer: api
- Failing step: Then the answer is HTTP 403
- Error: `[REQ AC-5] PATCH /rest/products/reviews by another customer → 403`
- Expected: `403`
- Received: `200`
- Relevant API exchange (#2 of 2): `GET http://localhost:3000/rest/products/1/reviews` → **200**
  - request body: ``
  - response body: `{"status":"success","data":[{"message":"One of my favorites!","author":"admin@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"fxGM4SEkpTknzzusH","liked":true},{"message":"Great! We'll have an apple party. Everyone brings an apple and - STUFFS IT DOWN EACH OTHER'S THROAT!","author":"basil@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"ShkAL9oZmQ8MTjNR9","liked":true},{"product":"1","message":"hldout probe mo33rpe09","author":"hldout-mo33rpe09@example.com","likesCount":0,"likedBy":[],"_id":"mnYoPajkSx6izYm4x","liked":true},{"product":"1","message":"hldout mo4biw1h-1","au…`
- Evidence: [screenshot](artifacts/JS-3-tests-js-3-JS-3-Produ-fb7a9-tomer-cannot-edit-my-review-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/JS-3/runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-fb7a9-tomer-cannot-edit-my-review-chromium-retry1/trace.zip` · [error-context](artifacts/JS-3-tests-js-3-JS-3-Produ-fb7a9-tomer-cannot-edit-my-review-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /rest/products/1/reviews → 200
- Requirement assertion [REQ AC-5] failed.
- Expected: 403
- Received: 200
- Also failed: [REQ AC-5] PATCH /rest/products/reviews by another customer leaves the message unchanged — expected "hldout mo6e3pja-2", received "hldout mo6eb430-4"

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: B's PATCH /rest/products/reviews with A's review id answers 200 and replaces A's message; A stays named as author (step 10).

## SCN-006: A review's author comes from the session, not from the request

- Requirement refs: AC-6 · type: audit · layer: api
- Failing step: Then the stored review with my message names my e-mail as its author
- Error: `[REQ AC-6] GET /rest/products/1/reviews the review's author is my e-mail`
- Expected: `["hldout-mo6dvee3-2@example.com"]`
- Received: `["hldout-mo6e1hjw-3@example.com"]`
- Relevant API exchange (#2 of 2): `GET http://localhost:3000/rest/products/1/reviews` → **200**
  - request body: ``
  - response body: `{"status":"success","data":[{"message":"One of my favorites!","author":"admin@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"fxGM4SEkpTknzzusH","liked":true},{"message":"Great! We'll have an apple party. Everyone brings an apple and - STUFFS IT DOWN EACH OTHER'S THROAT!","author":"basil@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"ShkAL9oZmQ8MTjNR9","liked":true},{"product":"1","message":"hldout probe mo33rpe09","author":"hldout-mo33rpe09@example.com","likesCount":0,"likedBy":[],"_id":"mnYoPajkSx6izYm4x","liked":true},{"product":"1","message":"hldout mo4biw1h-1","au…`
- Evidence: [screenshot](artifacts/JS-3-tests-js-3-JS-3-Produ-e9f71-ession-not-from-the-request-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/JS-3/runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-e9f71-ession-not-from-the-request-chromium-retry1/trace.zip` · [error-context](artifacts/JS-3-tests-js-3-JS-3-Produ-e9f71-ession-not-from-the-request-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /rest/products/1/reviews → 200
- Requirement assertion [REQ AC-6] failed.
- Expected: ["hldout-mo6dvee3-2@example.com"]
- Received: ["hldout-mo6e1hjw-3@example.com"]

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: A, signed in, wrote a review whose author names someone else; GET lists it under that other e-mail (steps 7, 12). The like half of AC-6 holds (SCN-007 passes).

## SCN-009: Simultaneous likes by one customer count once

- Requirement refs: AC-8 · type: concurrency · layer: api
- Failing step: Then the review's likesCount has risen by exactly 1
- Error: `[REQ AC-8] GET /rest/products/1/reviews likesCount rose by exactly 1 in every round`
- Expected: `[1, 1, 1]`
- Received: `[3, 3, 3]`
- Relevant API exchange (#12 of 12): `GET http://localhost:3000/rest/products/1/reviews` → **200**
  - request body: ``
  - response body: `{"status":"success","data":[{"message":"One of my favorites!","author":"admin@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"fxGM4SEkpTknzzusH","liked":true},{"message":"Great! We'll have an apple party. Everyone brings an apple and - STUFFS IT DOWN EACH OTHER'S THROAT!","author":"basil@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"ShkAL9oZmQ8MTjNR9","liked":true},{"product":"1","message":"hldout probe mo33rpe09","author":"hldout-mo33rpe09@example.com","likesCount":0,"likedBy":[],"_id":"mnYoPajkSx6izYm4x","liked":true},{"product":"1","message":"hldout mo4biw1h-1","au…`
- Evidence: [screenshot](artifacts/JS-3-tests-js-3-JS-3-Produ-43fea--by-one-customer-count-once-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/JS-3/runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-43fea--by-one-customer-count-once-chromium-retry1/trace.zip` · [error-context](artifacts/JS-3-tests-js-3-JS-3-Produ-43fea--by-one-customer-count-once-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /rest/products/1/reviews → 200
- Requirement assertion [REQ AC-8] failed.
- Expected: [1, 1, 1]
- Received: [3, 3, 3]

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: three likes by B sent at once all answer 200; the review then has likesCount 3 and B three times in likedBy (steps 11, 12). A second like sent afterwards is refused (SCN-008 passes).
