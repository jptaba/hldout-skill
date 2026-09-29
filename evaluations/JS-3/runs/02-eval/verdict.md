# Held-out Evaluation Verdict — JS-3

> **Verdict: ❌ FAIL** — 4 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-4, AC-5, AC-6, AC-8. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [JS-3](https://your-domain.atlassian.net/browse/JS-3) — Product reviews — write, like and edit |
| Application under test | OWASP Juice Shop (profile `owasp-juice-shop`) — UI http://localhost:3000/ |
| Final run | `02-eval` · 2026-09-29T12:45:39.837Z · 19s |
| Tests | 18 total · 14 passed · 4 failed · 0 flaky · 0 skipped (from 16 scenarios) |
| Held-out integrity | ✅ PRESERVED — 42 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 — heldout inspect (product dialog with locator probes) and heldout api-probe --chain (sign-up, sign-in, a review written; the live reproduction with… (see hardening log) |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-09-29T12:46:20.877Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Critical | AC-5 | security | Any signed-in customer can edit another customer's review | SCN-005 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Major | AC-4 | security | Anyone can write a review without signing in | SCN-004.1 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-3 | Major | AC-6 | audit | A review's author is taken from the request, not the session | SCN-006 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-4 | Major | AC-8 | concurrency | Simultaneous likes by one customer are all counted | SCN-009 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (4 root cause(s), 4 failing test(s))

### APP-1 · SCN-005 · AC-5 — Any signed-in customer can edit another customer's review

| | |
| --- | --- |
| Suggested severity | Critical |
| Requirement AC-5 | Only its author can edit a review: a PATCH /rest/products/reviews by another signed-in customer is refused with HTTP 403, and the review's message stays unchanged. |
| Requirement source | story.md#L39 |
| Test type · layer | security · api |
| SCN-005: expected (requirement) → actual (AUT) | `403` → `200` |
| SCN-005: also failed | [REQ AC-5] PATCH /rest/products/reviews by another customer leaves the message unchanged — `"hldout mo6e3pja-2"` → `"hldout mo6eb430-4"` |
| Failing step | Then the answer is HTTP 403 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldouto6dvz60`; recreate equivalent data before reproducing):

- customer A: `{"id":"128","username":"hldout-mo6dw0kn-1@example.com"}` · cleanup: none
- a review for product 1: `{"product":"1","message":"hldout mo6e3pja-2","author":"hldout-mo6dw0kn-1@example.com","likesCount":0,"likedBy":[],"_id":"LATStw3C8pGyBpZgH","liked":true}` · cleanup: none
- customer B: `{"id":"129","username":"hldout-mo6e51xt-3@example.com"}` · cleanup: none

**Manually (scenario steps):**

1. Given customer A has written a review for product 1
2. And customer B is signed in
3. When B sends PATCH /rest/products/reviews with A's review id and a new message
4. Then the answer is HTTP 403
5. And the review's message is still A's

**API pre-steps: SCN-005** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P2. `POST /api/Users → 201`

   ```bash
   curl -i -X POST 'http://localhost:3000/api/Users' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6dw0kn-1@example.com","password":"<secret from test-data.json / .env>","passwordRepeat":"<secret from test-data.json / .env>","securityQuestion":{"id":1},"securityAnswer":"hldout"}'
   ```

P3. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P4. `POST /rest/user/login → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/user/login' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6dw0kn-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

P5. `PUT /rest/products/1/reviews → 201`

   ```bash
   curl -i -X PUT 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"message":"hldout mo6e3pja-2","author":"hldout-mo6dw0kn-1@example.com"}'
   ```

P6. `GET /rest/products/1/reviews → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Cache-Control: no-cache'
   ```

P7. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P8. `POST /api/Users → 201`

   ```bash
   curl -i -X POST 'http://localhost:3000/api/Users' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6e51xt-3@example.com","password":"<secret from test-data.json / .env>","passwordRepeat":"<secret from test-data.json / .env>","securityQuestion":{"id":1},"securityAnswer":"hldout"}'
   ```

P9. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P10. `POST /rest/user/login → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/user/login' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6e51xt-3@example.com","password":"<secret from test-data.json / .env>"}'
   ```

**Via the API: SCN-005** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 2 (⟵) is the one that contradicts the requirement:

1. `PATCH /rest/products/reviews → 200`

   ```bash
   curl -i -X PATCH 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"LATStw3C8pGyBpZgH","message":"hldout mo6eb430-4"}'
   ```

2. `GET /rest/products/1/reviews → 200` ⟵

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews'
   ```

Observed response of request 2 (SCN-005):

```json
{"status":"success","data":[{"message":"One of my favorites!","author":"admin@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"fxGM4SEkpTknzzusH","liked":true},{"message":"Great! We'll have an apple party. Everyone brings an apple and - STUFFS IT DOWN EACH OTHER'S THROAT!","author":"basil@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"ShkAL9oZmQ8MTjNR9","liked":true},{"product":"1","message":"hldout probe mo33rpe09","author":"hldout-mo33rpe09@example.com","likesCount":0,"likedBy":[],"_id":"mnYoPajkSx6izYm4x","liked":true},{"product":"1","message":"hldout mo4biw1h-1","au…
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run JS-3 --label repro --grep "SCN-005:"
```

#### Evidence

- [Page/test context at failure](../../runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-fb7a9-tomer-cannot-edit-my-review-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/JS-3/runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-fb7a9-tomer-cannot-edit-my-review-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/JS-3/hardening/api-repro.md (step 10)

**Evaluator's analysis:** Reproduced live: B's PATCH /rest/products/reviews with A's review id answers 200 and replaces A's message; A stays named as author (step 10).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-004.1 · AC-4 — Anyone can write a review without signing in

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-4 | Writing, liking and editing reviews require a signed-in customer: PUT /rest/products/{id}/reviews, POST /rest/products/reviews and PATCH /rest/products/reviews without a token are refused with HTTP 401, and nothing is stored or changed. |
| Requirement source | story.md#L38 |
| Test type · layer | security · api |
| SCN-004.1: expected (requirement) → actual (AUT) | `401` → `201` |
| SCN-004.1: also failed | [REQ AC-4] PUT /rest/products/1/reviews without a token stores nothing — `{ Array [] }` → `{ "_id": "zKPtoodcdwyiH5FAQ", "author": "hldout-mo6cwkm9-2@example.com", "liked": true, "likedBy": Array [], "likesCount": 0, "message": "hldout mo6cwjer-1", "p…` |
| Failing step | Then the answer is HTTP 401 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldouto6cwi40`; recreate equivalent data before reproducing):

- account: `{"id":"126","username":"hldout-mo6cwkm9-2@example.com"}` · cleanup: none
- a review for product 1: `{"product":"1","message":"hldout mo6czovs-3","author":"hldout-mo6cwkm9-2@example.com","likesCount":0,"likedBy":[],"_id":"jaRNNrs7JnKYtfJRW","liked":true}` · cleanup: none
- a review the application may have stored (created by the scenario): `{"message":"hldout mo6cwjer-1"}` · cleanup: none

**Manually (scenario steps):**

1. Given a review written by a signed-in customer exists for product 1
2. When a client sends <call> without an Authorization header
3. Then the answer is HTTP 401
4. And <what stays>

**API pre-steps: SCN-004.1** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P2. `POST /api/Users → 201`

   ```bash
   curl -i -X POST 'http://localhost:3000/api/Users' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6cwkm9-2@example.com","password":"<secret from test-data.json / .env>","passwordRepeat":"<secret from test-data.json / .env>","securityQuestion":{"id":1},"securityAnswer":"hldout"}'
   ```

P3. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P4. `POST /rest/user/login → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/user/login' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6cwkm9-2@example.com","password":"<secret from test-data.json / .env>"}'
   ```

P5. `PUT /rest/products/1/reviews → 201`

   ```bash
   curl -i -X PUT 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"message":"hldout mo6czovs-3","author":"hldout-mo6cwkm9-2@example.com"}'
   ```

P6. `GET /rest/products/1/reviews → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-004.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `PUT /rest/products/1/reviews → 201` ⟵

   ```bash
   curl -i -X PUT 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Content-Type: application/json' \
     --data '{"message":"hldout mo6cwjer-1","author":"hldout-mo6cwkm9-2@example.com"}'
   ```

2. `GET /rest/products/1/reviews → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews'
   ```

Observed response of request 1 (SCN-004.1):

```json
{"status":"success"}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run JS-3 --label repro --grep "SCN-004\.1:"
```

#### Evidence

- [Page/test context at failure](../../runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-b782a-sed-and-change-nothing-PUT--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/JS-3/runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-b782a-sed-and-change-nothing-PUT--chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/JS-3/hardening/api-repro.md (steps 6, 12)

**Evaluator's analysis:** Reproduced live: PUT /rest/products/1/reviews with no Authorization header answers 201 and the review is stored and listed (steps 6, 12). Liking and editing without a token are refused with 401 (SCN-004.2/.3 pass).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-3 · SCN-006 · AC-6 — A review's author is taken from the request, not the session

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | Reviews and likes record who made them, from the session and not from the request: a review's author is the e-mail of the signed-in customer who wrote it, even when the request names someone else, and each like adds the liking customer's e-mail to the review's likedBy. likesCount always equals the number of entries in likedBy. |
| Requirement source | story.md#L40 |
| Test type · layer | audit · api |
| SCN-006: expected (requirement) → actual (AUT) | `["hldout-mo6dvee3-2@example.com"]` → `["hldout-mo6e1hjw-3@example.com"]` |
| Failing step | Then the stored review with my message names my e-mail as its author |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldouto6dvc50`; recreate equivalent data before reproducing):

- account: `{"id":"127","username":"hldout-mo6dvee3-2@example.com"}` · cleanup: none
- the review under test (created by the scenario): `{"message":"hldout mo6dvdl6-1"}` · cleanup: none

**Manually (scenario steps):**

1. Given I am a signed-in customer
2. When I PUT a new review message for product 1 whose author names another e-mail
3. Then the stored review with my message names my e-mail as its author

**API pre-steps: SCN-006** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P2. `POST /api/Users → 201`

   ```bash
   curl -i -X POST 'http://localhost:3000/api/Users' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6dvee3-2@example.com","password":"<secret from test-data.json / .env>","passwordRepeat":"<secret from test-data.json / .env>","securityQuestion":{"id":1},"securityAnswer":"hldout"}'
   ```

P3. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P4. `POST /rest/user/login → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/user/login' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6dvee3-2@example.com","password":"<secret from test-data.json / .env>"}'
   ```

**Via the API: SCN-006** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 2 (⟵) is the one that contradicts the requirement:

1. `PUT /rest/products/1/reviews → 201`

   ```bash
   curl -i -X PUT 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"message":"hldout mo6dvdl6-1","author":"hldout-mo6e1hjw-3@example.com"}'
   ```

2. `GET /rest/products/1/reviews → 200` ⟵

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews'
   ```

Observed response of request 2 (SCN-006):

```json
{"status":"success","data":[{"message":"One of my favorites!","author":"admin@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"fxGM4SEkpTknzzusH","liked":true},{"message":"Great! We'll have an apple party. Everyone brings an apple and - STUFFS IT DOWN EACH OTHER'S THROAT!","author":"basil@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"ShkAL9oZmQ8MTjNR9","liked":true},{"product":"1","message":"hldout probe mo33rpe09","author":"hldout-mo33rpe09@example.com","likesCount":0,"likedBy":[],"_id":"mnYoPajkSx6izYm4x","liked":true},{"product":"1","message":"hldout mo4biw1h-1","au…
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run JS-3 --label repro --grep "SCN-006:"
```

#### Evidence

- [Page/test context at failure](../../runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-e9f71-ession-not-from-the-request-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/JS-3/runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-e9f71-ession-not-from-the-request-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/JS-3/hardening/api-repro.md (steps 7, 12)

**Evaluator's analysis:** Reproduced live: A, signed in, wrote a review whose author names someone else; GET lists it under that other e-mail (steps 7, 12). The like half of AC-6 holds (SCN-007 passes).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-4 · SCN-009 · AC-8 — Simultaneous likes by one customer are all counted

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-8 | The like-once rule also holds when requests arrive at the same time: when one customer sends several likes for the same review simultaneously, exactly one is counted — likesCount rises by 1 and the customer's e-mail appears once in likedBy. |
| Requirement source | story.md#L42 |
| Test type · layer | concurrency · api |
| SCN-009: expected (requirement) → actual (AUT) | `[1, 1, 1]` → `[3, 3, 3]` |
| Failing step | Then the review's likesCount has risen by exactly 1 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldouto6hxy100`; recreate equivalent data before reproducing):

- customer A: `{"id":"140","username":"hldout-mo6hxzh3-1@example.com"}` · cleanup: none
- customer B: `{"id":"141","username":"hldout-mo6i19vc-2@example.com"}` · cleanup: none
- a fresh review for round 1: `{"product":"1","message":"hldout mo6i3zst-3","author":"hldout-mo6hxzh3-1@example.com","likesCount":0,"likedBy":[],"_id":"kZtX929Tu26yhBuwW","liked":true}` · cleanup: none
- a fresh review for round 2: `{"product":"1","message":"hldout mo6i523d-4","author":"hldout-mo6hxzh3-1@example.com","likesCount":0,"likedBy":[],"_id":"v3knwfFxvvtdXWJfL","liked":true}` · cleanup: none
- a fresh review for round 3: `{"product":"1","message":"hldout mo6i5wxm-5","author":"hldout-mo6hxzh3-1@example.com","likesCount":0,"likedBy":[],"_id":"rcqxoi4F8FjG6JEAZ","liked":true}` · cleanup: none

**Manually (scenario steps):**

1. Given customer A has written a review for product 1
2. When customer B sends three likes for it at the same time
3. Then the review's likesCount has risen by exactly 1
4. And B's e-mail appears once in its likedBy

**API pre-steps: SCN-009** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P2. `POST /api/Users → 201`

   ```bash
   curl -i -X POST 'http://localhost:3000/api/Users' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6hxzh3-1@example.com","password":"<secret from test-data.json / .env>","passwordRepeat":"<secret from test-data.json / .env>","securityQuestion":{"id":1},"securityAnswer":"hldout"}'
   ```

P3. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P4. `POST /rest/user/login → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/user/login' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6hxzh3-1@example.com","password":"<secret from test-data.json / .env>"}'
   ```

P5. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P6. `POST /api/Users → 201`

   ```bash
   curl -i -X POST 'http://localhost:3000/api/Users' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6i19vc-2@example.com","password":"<secret from test-data.json / .env>","passwordRepeat":"<secret from test-data.json / .env>","securityQuestion":{"id":1},"securityAnswer":"hldout"}'
   ```

P7. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

P8. `POST /rest/user/login → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/user/login' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"email":"hldout-mo6i19vc-2@example.com","password":"<secret from test-data.json / .env>"}'
   ```

P9. `PUT /rest/products/1/reviews → 201`

   ```bash
   curl -i -X PUT 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"message":"hldout mo6i3zst-3","author":"hldout-mo6hxzh3-1@example.com"}'
   ```

P10. `GET /rest/products/1/reviews → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Cache-Control: no-cache'
   ```

P11. `PUT /rest/products/1/reviews → 201`

   ```bash
   curl -i -X PUT 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"message":"hldout mo6i523d-4","author":"hldout-mo6hxzh3-1@example.com"}'
   ```

P12. `GET /rest/products/1/reviews → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Cache-Control: no-cache'
   ```

P13. `PUT /rest/products/1/reviews → 201`

   ```bash
   curl -i -X PUT 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"message":"hldout mo6i5wxm-5","author":"hldout-mo6hxzh3-1@example.com"}'
   ```

P14. `GET /rest/products/1/reviews → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-009** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 12 (⟵) is the one that contradicts the requirement:

1. `POST /rest/products/reviews → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"kZtX929Tu26yhBuwW"}'
   ```

2. `POST /rest/products/reviews → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"kZtX929Tu26yhBuwW"}'
   ```

3. `POST /rest/products/reviews → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"kZtX929Tu26yhBuwW"}'
   ```

4. `GET /rest/products/1/reviews → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews'
   ```

5. `POST /rest/products/reviews → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"v3knwfFxvvtdXWJfL"}'
   ```

6. `POST /rest/products/reviews → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"v3knwfFxvvtdXWJfL"}'
   ```

7. `POST /rest/products/reviews → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"v3knwfFxvvtdXWJfL"}'
   ```

8. `GET /rest/products/1/reviews → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews'
   ```

9. `POST /rest/products/reviews → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"rcqxoi4F8FjG6JEAZ"}'
   ```

10. `POST /rest/products/reviews → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"rcqxoi4F8FjG6JEAZ"}'
   ```

11. `POST /rest/products/reviews → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/products/reviews' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"id":"rcqxoi4F8FjG6JEAZ"}'
   ```

12. `GET /rest/products/1/reviews → 200` ⟵

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/products/1/reviews'
   ```

Observed response of request 12 (SCN-009):

```json
{"status":"success","data":[{"message":"One of my favorites!","author":"admin@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"fxGM4SEkpTknzzusH","liked":true},{"message":"Great! We'll have an apple party. Everyone brings an apple and - STUFFS IT DOWN EACH OTHER'S THROAT!","author":"basil@juice-sh.op","product":1,"likesCount":0,"likedBy":[],"_id":"ShkAL9oZmQ8MTjNR9","liked":true},{"product":"1","message":"hldout probe mo33rpe09","author":"hldout-mo33rpe09@example.com","likesCount":0,"likedBy":[],"_id":"mnYoPajkSx6izYm4x","liked":true},{"product":"1","message":"hldout mo4biw1h-1","au…
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run JS-3 --label repro --grep "SCN-009:"
```

#### Evidence

- [Page/test context at failure](../../runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-43fea--by-one-customer-count-once-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/JS-3/runs/02-eval/artifacts/JS-3-tests-js-3-JS-3-Produ-43fea--by-one-customer-count-once-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/JS-3/hardening/api-repro.md (steps 11, 12)

**Evaluator's analysis:** Reproduced live: three likes by B sent at once all answer 200; the review then has likesCount 3 and B three times in likedBy (steps 11, 12). A second like sent afterwards is refused (SCN-008 passes).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A signed-in customer writes a review in the product details dialog and sees it listed | AC-1 | functional | ✅ passed | - |
| SCN-002 | A review written through the API is stored with its message and author and no likes | AC-2 | functional | ✅ passed | - |
| SCN-003 | The reviews list has the stated envelope and review fields | AC-3 | contract | ✅ passed | - |
| SCN-004.1 | Writing, liking and editing without a token are refused and change nothing (PUT) | AC-4 | security | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-004.2 | Writing, liking and editing without a token are refused and change nothing (POST) | AC-4 | security | ✅ passed | - |
| SCN-004.3 | Writing, liking and editing without a token are refused and change nothing (PATCH) | AC-4 | security | ✅ passed | - |
| SCN-005 | Another customer cannot edit my review | AC-5 | security | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-006 | A review's author comes from the session, not from the request | AC-6 | audit | ❌ failed | APPLICATION_DEFECT · APP-3 |
| SCN-007 | A like records who gave it | AC-6 | audit | ✅ passed | - |
| SCN-008 | A second like by the same customer is refused and changes nothing | AC-7 | idempotency | ✅ passed | - |
| SCN-009 | Simultaneous likes by one customer count once | AC-8 | concurrency | ❌ failed | APPLICATION_DEFECT · APP-4 |
| SCN-010 | A like for a review that does not exist is refused | AC-9 | negative | ✅ passed | - |
| SCN-011 | Submit stays disabled while the review field is empty | AC-9 | negative | ✅ passed | - |
| SCN-012 | A review of exactly 160 characters is accepted and submitted | AC-10 | boundary | ✅ passed | - |
| SCN-013 | A 161st character is not accepted | AC-10 | boundary | ✅ passed | - |
| SCN-014 | The review field and the Submit button have accessible names and the field describes its limit | AC-11 | accessibility | ✅ passed | - |
| SCN-015 | Write, like and edit: the review keeps its author and its like | AC-12 | composition | ✅ passed | - |
| SCN-016 | A review written and liked through the API is shown in the dialog | AC-13 | integration | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | A signed-in customer can write a review from the product details dialog: after typing a message in the review field and pressing Submit, the review appears in the dialog's Reviews list with that message and the customer's e-mail as its author. | SCN-001 | ✅ met |
| AC-2 | Writing a review through the API (PUT /rest/products/{id}/reviews with the customer's token) answers HTTP 201 with {"status":"success"}. The review is then listed by GET /rest/products/{id}/reviews with the submitted message, the customer's e-mail as author, likesCount 0 and an empty likedBy. | SCN-002 | ✅ met |
| AC-3 | GET /rest/products/{id}/reviews answers HTTP 200 with the envelope and review fields described in api-contract.md, with the stated types. | SCN-003 | ✅ met |
| AC-4 | Writing, liking and editing reviews require a signed-in customer: PUT /rest/products/{id}/reviews, POST /rest/products/reviews and PATCH /rest/products/reviews without a token are refused with HTTP 401, and nothing is stored or changed. | SCN-004.1, SCN-004.2, SCN-004.3 | ❌ not met |
| AC-5 | Only its author can edit a review: a PATCH /rest/products/reviews by another signed-in customer is refused with HTTP 403, and the review's message stays unchanged. | SCN-005 | ❌ not met |
| AC-6 | Reviews and likes record who made them, from the session and not from the request: a review's author is the e-mail of the signed-in customer who wrote it, even when the request names someone else, and each like adds the liking customer's e-mail to the review's likedBy. likesCount always equals the number of entries in likedBy. | SCN-006, SCN-007 | ❌ not met |
| AC-7 | A customer can like a review only once: a second like by the same customer is refused with HTTP 403 and {"error":"Not allowed"}, and likesCount and likedBy stay as they were after the first like. | SCN-008 | ✅ met |
| AC-8 | The like-once rule also holds when requests arrive at the same time: when one customer sends several likes for the same review simultaneously, exactly one is counted — likesCount rises by 1 and the customer's e-mail appears once in likedBy. | SCN-009 | ❌ not met |
| AC-9 | Invalid requests are refused: a like for a review id that does not exist answers HTTP 404 with {"error":"Not found"}, and in the dialog the Submit button stays disabled while the review field is empty. | SCN-010, SCN-011 | ✅ met |
| AC-10 | A review message is at most 160 characters: the review field accepts 160 characters and a review of exactly 160 characters can be submitted; a 161st character is not accepted, and the field's counter shows 160/160. | SCN-012, SCN-013 | ✅ met |
| AC-11 | The review form is accessible: the review field has an accessible name, and its accessible description includes the hint "Max. 160 characters"; the Submit button has an accessible name. | SCN-014 | ✅ met |
| AC-12 | A review keeps its history through its lifecycle: a review written by customer A, liked by customer B and then edited by A shows A's edited message, still names A as its author, and keeps B's like (likesCount 1, likedBy containing B's e-mail). | SCN-015 | ✅ met |
| AC-13 | What the API stores is what the shop shows: a review written through the API appears in the dialog's Reviews list with its author and message, and after one like through the API the review shows 1 as its like count in the dialog. | SCN-016 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L35 | SCN-001 A signed-in customer writes a review in the product details dialog and sees it listed | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L36 | SCN-002 A review written through the API is stored with its message and author and no likes | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L37, attachments/api-contract.md#L6-L22 | SCN-003 The reviews list has the stated envelope and review fields | contract | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L38 | SCN-004 Writing, liking and editing without a token are refused and change nothing | security | api | 2/3 | ❌ fails requirement | APP-2 |
| **AC-5** | story.md#L39 | SCN-005 Another customer cannot edit my review | security | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-6** | story.md#L40 | SCN-006 A review's author comes from the session, not from the request | audit | api | 0/1 | ❌ fails requirement | APP-3 |
| ↳ | story.md#L40 | SCN-007 A like records who gave it | audit | api | 1/1 | ✅ meets requirement | - |
| **AC-7** | story.md#L41 | SCN-008 A second like by the same customer is refused and changes nothing | idempotency | api | 1/1 | ✅ meets requirement | - |
| **AC-8** | story.md#L42 | SCN-009 Simultaneous likes by one customer count once | concurrency | api | 0/1 | ❌ fails requirement | APP-4 |
| **AC-9** | story.md#L43 | SCN-010 A like for a review that does not exist is refused | negative | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L43 | SCN-011 Submit stays disabled while the review field is empty | negative | ui | 1/1 | ✅ meets requirement | - |
| **AC-10** | story.md#L44 | SCN-012 A review of exactly 160 characters is accepted and submitted | boundary | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L44 | SCN-013 A 161st character is not accepted | boundary | ui | 1/1 | ✅ meets requirement | - |
| **AC-11** | story.md#L45 | SCN-014 The review field and the Submit button have accessible names and the field describes its limit | accessibility | ui | 1/1 | ✅ meets requirement | - |
| **AC-12** | story.md#L46 | SCN-015 Write, like and edit: the review keeps its author and its like | composition | api | 1/1 | ✅ meets requirement | - |
| **AC-13** | story.md#L47 | SCN-016 A review written and liked through the API is shown in the dialog | integration | e2e | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| accessibility | 1 | 1 | 1 | 0 | 0 | - |
| audit | 2 | 2 | 1 | 1 | 0 | APP-3 |
| boundary | 2 | 2 | 2 | 0 | 0 | - |
| composition | 1 | 1 | 1 | 0 | 0 | - |
| concurrency | 1 | 1 | 0 | 1 | 0 | APP-4 |
| contract | 1 | 1 | 1 | 0 | 0 | - |
| functional | 2 | 2 | 2 | 0 | 0 | - |
| idempotency | 1 | 1 | 1 | 0 | 0 | - |
| integration | 1 | 1 | 1 | 0 | 0 | - |
| negative | 2 | 2 | 2 | 0 | 0 | - |
| security | 2 | 4 | 2 | 2 | 0 | APP-1, APP-2 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](../../requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | product details dialog: how to open the dialog of "Apple Juice (1000ml)" in the shop, and how its review field, Submit button, character counter, Reviews list (author, message) and a review's like count are found | how to exercise | AC-1, AC-9, AC-10, AC-11, AC-13 | discovered from the AUT (mechanics only): start page lists the products; the card opens role=dialog; field = its only textbox; Submit = button 'Send the review'; list = button 'Reviews (N)', entries '.comment' (author, message, like button with the count); counter 'N/160' |
| G2 | how a UI test is signed in to the shop as the customer (sign-in page, or the API token handed to the browser) | how to exercise | AC-1, AC-9, AC-10, AC-11 | discovered from the AUT (mechanics only): UI sign-in on #/login: e-mail and password text fields, button Login; done at url /search (recipe signIn) |
| G3 | how tests create their customers: story.md#L25 says tests create their own customers with a unique e-mail per run but names no registration call (method, path, request fields) | how to exercise | * | discovered from the AUT (mechanics only): GET /api/SecurityQuestions, then POST /api/Users {email, password, passwordRepeat, securityQuestion:{id}, securityAnswer} → 201; saved as the profile's accounts recipe |
| G4 | type of the review field `product`: api-contract.md#L13 gives '—' as its type, so AC-3's 'with the stated types' states none for it; checked for presence only. What type must it have? | expected behaviour | AC-3 | ❓ open |
| G5 | answer to the extra likes in a simultaneous burst (AC-8): the story states only that exactly one is counted, not what the other requests must answer (e.g. the 403 of AC-7). Judged on the count and likedBy only | expected behaviour | AC-8 | ❓ open |
| G6 | whether a customer may like their own review: story.md#L19 speaks of liking other customers' reviews; no source says what liking one's own review must do. Tests of liking use a review written by another customer | expected behaviour | AC-6, AC-7, AC-8, AC-13 | ❓ open |

**For the owner's information** (questions the criteria can be judged without, as the review confirmed; they don't affect the verdict):

- ℹ️ G4 — type of the review field `product`: api-contract.md#L13 gives '—' as its type, so AC-3's 'with the stated types' states none for it; checked for presence only. What type must it have?
- ℹ️ G5 — answer to the extra likes in a simultaneous burst (AC-8): the story states only that exactly one is counted, not what the other requests must answer (e.g. the 403 of AC-7). Judged on the count and likedBy only
- ℹ️ G6 — whether a customer may like their own review: story.md#L19 speaks of liking other customers' reviews; no source says what liking one's own review must do. Tests of liking use a review written by another customer

**Assumptions the evaluation made:**

- G4 — the product field is not type-checked; it must identify product 1 (number 1 or string "1") (not asserted as a type)
- G5 — the answers to the simultaneous likes are not judged, only what is counted (not asserted)
- G6 — the customer who likes a review is always a second customer, never its author
- AC-6 — the PUT whose author names someone else is not judged by its status (none is stated); what is judged is the author the stored review carries
- AC-8 — "several" is three likes sent together, repeated over three rounds on a fresh review each

Full review: [requirement-review.md](../../requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 42 | 12 | 0 |
| `02-eval` (final) | 14 | 4 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Requirement review: [requirement-review.md](../../requirement-review.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/02-eval/triage.md](../../runs/02-eval/triage.md) · JUnit: runs/02-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/JS-3/runs/02-eval/html`
