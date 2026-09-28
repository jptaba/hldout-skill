# Held-out Evaluation Verdict — JS-2

> **Verdict: ❌ FAIL** — 2 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-3, AC-6. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [JS-2](https://your-domain.atlassian.net/browse/JS-2) — Customer registration, login and basket |
| Application under test | OWASP Juice Shop (profile `owasp-juice-shop`) — UI http://localhost:3000/ |
| Final run | `02-eval` · 2026-09-28T23:03:11.865Z · 8s |
| Tests | 8 total · 4 passed · 4 failed · 0 flaky · 0 skipped (from 7 scenarios) |
| Held-out integrity | ✅ PRESERVED — 18 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (heldout api-probe --chain, heldout accounts --from-chain / --sign-in-steps / --check --create, dry run 01-harden with --repeat-each 2). |
| Evaluator | Opus — heldout-evaluator skill |
| Generated | 2026-09-28T23:03:37.471Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | TBD | AC-3 | boundary | Registration accepts passwords shorter than 5 characters | SCN-003.1, SCN-003.2 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | TBD | AC-6 | security | A customer can read another customer's basket | SCN-007 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (2 root cause(s), 3 failing test(s))

### APP-1 · SCN-003.1, SCN-003.2 · AC-3 — Registration accepts passwords shorter than 5 characters

| | |
| --- | --- |
| Suggested severity | TBD |
| Requirement AC-3 | Registration enforces the password rules in the PO comment: a password shorter than the minimum length is rejected with HTTP 400 and the customer is not created (a follow-up login with that e-mail/password fails). |
| Requirement source | story.md AC-3 and the PO comment (story.md#L50, L53) |
| Test type · layer | boundary · api |
| SCN-003.1: expected (requirement) → actual (AUT) | `400` → `201` |
| SCN-003.2: expected (requirement) → actual (AUT) | `400` → `201` |
| SCN-003.1: also failed | [REQ AC-3] POST /rest/user/login after a 4-character registration fails (no customer was created) — `false` → `true` |
| SCN-003.2: also failed | [REQ AC-3] POST /rest/user/login after a 3-character registration fails (no customer was created) — `false` → `true` |
| Failing step | Then registering with a 4-character password → HTTP 400 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldoutusnrx40`; recreate equivalent data before reproducing):

- a security question id: `1` · cleanup: none
- customer registered by the scenario (created by the scenario): `{"id":145,"email":"hldout-lusnrxtg-1@example.com"}` · cleanup: none

**Manually (scenario steps):**

1. Given I know a valid security question id from GET /api/SecurityQuestions
2. When I POST /api/Users with a unique e-mail and a <length>-character password
3. Then registering with a <length>-character password → HTTP 400
4. And the customer is not created: a follow-up login with that e-mail and password fails

**API pre-steps: SCN-003.1** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-003.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /api/Users → 201` ⟵

   ```bash
   curl -i -X POST 'http://localhost:3000/api/Users' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-lusnrxtg-1@example.com","password":"Qx9!","passwordRepeat":"Qx9!","securityQuestion":{"id":1},"securityAnswer":"heldout"}'
   ```

2. `POST /rest/user/login → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/user/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-lusnrxtg-1@example.com","password":"Qx9!"}'
   ```

Observed response of request 1 (SCN-003.1):

```json
{"status":"success","data":{"username":"","role":"customer","deluxeToken":"***redacted***","lastLoginIp":"0.0.0.0","profileImage":"/assets/public/images/uploads/default.svg","isActive":true,"id":145,"email":"hldout-lusnrxtg-1@example.com","updatedAt":"2026-09-28T23:03:15.657Z","createdAt":"2026-09-28T23:03:15.657Z","deletedAt":null}}
```

**API pre-steps: SCN-003.2** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `GET /api/SecurityQuestions → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/SecurityQuestions' \
     -H 'Cache-Control: no-cache'
   ```

**Via the API: SCN-003.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /api/Users → 201` ⟵

   ```bash
   curl -i -X POST 'http://localhost:3000/api/Users' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-lusnrzii-1@example.com","password":"Qx9","passwordRepeat":"Qx9","securityQuestion":{"id":1},"securityAnswer":"heldout"}'
   ```

2. `POST /rest/user/login → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/rest/user/login' \
     -H 'Content-Type: application/json' \
     --data '{"email":"hldout-lusnrzii-1@example.com","password":"Qx9"}'
   ```

Observed response of request 1 (SCN-003.2):

```json
{"status":"success","data":{"username":"","role":"customer","deluxeToken":"***redacted***","lastLoginIp":"0.0.0.0","profileImage":"/assets/public/images/uploads/default.svg","isActive":true,"id":144,"email":"hldout-lusnrzii-1@example.com","updatedAt":"2026-09-28T23:03:15.652Z","createdAt":"2026-09-28T23:03:15.652Z","deletedAt":null}}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run JS-2 --label repro --grep "SCN-003\.1:"
npm run heldout -- run JS-2 --label repro --grep "SCN-003\.2:"
```

#### Evidence

- [Page/test context at failure](runs/02-eval/artifacts/JS-2-tests-js-2-JS-2-Custo-37f44-er-is-created-4-characters--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/JS-2/runs/02-eval/artifacts/JS-2-tests-js-2-JS-2-Custo-37f44-er-is-created-4-characters--chromium-retry1/trace.zip`
- Live re-check by the evaluator: runs/02-eval/confirm/short-password.md

**Evaluator's analysis:** AC-3 with the PO comment requires a password shorter than 5 characters to be rejected with 400 and no customer created. Live: a 4- and a 3-character password are answered 201 and the customer can log in.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-007 · AC-6 — A customer can read another customer's basket

| | |
| --- | --- |
| Suggested severity | TBD |
| Requirement AC-6 | Basket contents are private to their owner: a customer must be able to read only their own basket. A request to GET /rest/basket/{id} authenticated as customer A but targeting customer B's basket id must be refused and must not return B's basket. Verify with two customers you create. |
| Requirement source | story.md AC-6 |
| Test type · layer | security · api |
| SCN-007: expected (requirement) → actual (AUT) | `not 115` → `115` |
| Failing step | And the request for B's basket does not return B's basket |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hldoutusosu60`; recreate equivalent data before reproducing):

- customer A: `{"id":"146","username":"hldout-lusoswc3-1@example.com"}` · cleanup: none
- customer B: `{"id":"147","username":"hldout-lusowm5v-2@example.com"}` · cleanup: none
- an existing product: `{"id":1,"name":"Apple Juice (1000ml)","description":"The all-time classic.","price":1.99,"deluxePrice":0.99,"image":"apple_juice.jpg","createdAt":"2026-09-28T20…` · cleanup: none
- a product in B's basket: `{"id":43,"ProductId":1,"BasketId":115,"quantity":1,"updatedAt":"2026-09-28T23:03:17.156Z","createdAt":"2026-09-28T23:03:17.156Z"}` · cleanup: done

**Manually (scenario steps):**

1. Given customers A and B, and B has a product in their basket
2. When A requests GET /rest/basket/{id} with A's token for A's basket id
3. And A requests GET /rest/basket/{id} with A's token for B's basket id
4. Then A reading their own basket gets it
5. And the request for B's basket does not return B's basket

**API pre-steps: SCN-007** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

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
     --data '{"email":"hldout-lusoswc3-1@example.com","password":"<secret from test-data.json / .env>","passwordRepeat":"<secret from test-data.json / .env>","securityQuestion":{"id":1},"securityAnswer":"heldout"}'
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
     --data '{"email":"hldout-lusoswc3-1@example.com","password":"<secret from test-data.json / .env>"}'
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
     --data '{"email":"hldout-lusowm5v-2@example.com","password":"<secret from test-data.json / .env>","passwordRepeat":"<secret from test-data.json / .env>","securityQuestion":{"id":1},"securityAnswer":"heldout"}'
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
     --data '{"email":"hldout-lusowm5v-2@example.com","password":"<secret from test-data.json / .env>"}'
   ```

P9. `GET /api/Products → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/api/Products' \
     -H 'Cache-Control: no-cache'
   ```

P10. `POST /api/BasketItems → 200`

   ```bash
   curl -i -X POST 'http://localhost:3000/api/BasketItems' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     -H 'Cache-Control: no-cache' \
     --data '{"BasketId":115,"ProductId":1,"quantity":1}'
   ```

**Via the API: SCN-007** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 2 (⟵) is the one that contradicts the requirement:

1. `GET /rest/basket/114 → 200`

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/basket/114' \
     -H 'Authorization: <your Authorization value>'
   ```

2. `GET /rest/basket/115 → 200` ⟵

   ```bash
   curl -i -X GET 'http://localhost:3000/rest/basket/115' \
     -H 'Authorization: <your Authorization value>'
   ```

Observed response of request 2 (SCN-007):

```json
{"status":"success","data":{"id":115,"coupon":null,"UserId":147,"createdAt":"2026-09-28T23:03:17.101Z","updatedAt":"2026-09-28T23:03:17.101Z","Products":[{"id":1,"name":"Apple Juice (1000ml)","description":"The all-time classic.","price":1.99,"deluxePrice":0.99,"image":"apple_juice.jpg","createdAt":"2026-09-28T20:32:12.935Z","updatedAt":"2026-09-28T20:32:12.935Z","deletedAt":null,"BasketItem":{"ProductId":1,"BasketId":115,"id":43,"quantity":1,"createdAt":"2026-09-28T23:03:17.156Z","updatedAt":"2026-09-28T23:03:17.156Z"}}]}}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run JS-2 --label repro --grep "SCN-007:"
```

#### Evidence

- [Page/test context at failure](runs/02-eval/artifacts/JS-2-tests-js-2-JS-2-Custo-1ac60-ut-never-another-customer-s-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/JS-2/runs/02-eval/artifacts/JS-2-tests-js-2-JS-2-Custo-1ac60-ut-never-another-customer-s-chromium-retry1/trace.zip`
- Live re-check by the evaluator: runs/02-eval/confirm/other-basket.md

**Evaluator's analysis:** AC-6: a request authenticated as A for B's basket must be refused and must not return B's basket. Live: A's token on B's basket id answers 200 with B's basket (its UserId is B's).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | A visitor registers with a unique e-mail and a rule-compliant password | AC-1 | functional | ✅ passed | - |
| SCN-002 | Registering an e-mail that already belongs to a customer is rejected | AC-2 | negative | ✅ passed | - |
| SCN-003.1 | A password shorter than 5 characters is rejected and no customer is created (4 characters) | AC-3 | boundary | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-003.2 | A password shorter than 5 characters is rejected and no customer is created (3 characters) | AC-3 | boundary | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-005 | A registered customer logs in and receives a JWT and their basket id | AC-4 | functional | ✅ passed | - |
| SCN-006 | A product added to one's own basket through the API is listed on the basket page after a UI login | AC-5 | integration | ✅ passed | - |
| SCN-007 | A customer reads their own basket but never another customer's | AC-6 | security | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-008 | A request for another customer's basket is refused | AC-6 | security | ❌ failed | APPLICATION_DEFECT |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Registering with a unique e-mail, a rule-compliant password (sent as both password and passwordRepeat), and a security question id + security answer creates the customer: the response is HTTP 201 and its body describes the new user with the submitted email and role = customer. | SCN-001 | ✅ met |
| AC-2 | Registering with an e-mail that already belongs to a customer is rejected with HTTP 400 and a validation error whose message states the e-mail must be unique. No second account is created. | SCN-002 | ✅ met |
| AC-3 | Registration enforces the password rules in the PO comment: a password shorter than the minimum length is rejected with HTTP 400 and the customer is not created (a follow-up login with that e-mail/password fails). | SCN-003.1, SCN-003.2 | ❌ not met |
| AC-4 | Logging in via POST /rest/user/login with a registered customer's correct e-mail and password returns HTTP 200 and a body containing an authentication token (a JWT used as a Bearer token) and the customer's basket id (bid). | SCN-005 | ✅ met |
| AC-5 | Using their own token, a customer can add a product to their own basket via POST /api/BasketItems; after that customer logs in through the UI, the basket page at /#/basket lists that product with the quantity that was added. | SCN-006 | ✅ met |
| AC-6 | Basket contents are private to their owner: a customer must be able to read only their own basket. A request to GET /rest/basket/{id} authenticated as customer A but targeting customer B's basket id must be refused and must not return B's basket. Verify with two customers you create. | SCN-007, SCN-008 | ❌ not met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md AC-1 | SCN-001 A visitor registers with a unique e-mail and a rule-compliant password | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md AC-2 | SCN-002 Registering an e-mail that already belongs to a customer is rejected | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md AC-3 and the PO comment (story.md#L50, L53) | SCN-003 A password shorter than 5 characters is rejected and no customer is created (<length> characters) | boundary | api | 0/2 | ❌ fails requirement | APP-1 |
| **AC-4** | story.md AC-4 and attachments/api-contract.md#L31-L33 | SCN-005 A registered customer logs in and receives a JWT and their basket id | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-5** | story.md AC-5 | SCN-006 A product added to one's own basket through the API is listed on the basket page after a UI login | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-6** | story.md AC-6 | SCN-007 A customer reads their own basket but never another customer's | security | api | 0/1 | ❌ fails requirement | APP-2 |
| ↳ | story.md AC-6, "must be refused" (G4 assumed: not 2xx) | SCN-008 A request for another customer's basket is refused | security | api | 0/1 | ❔ inconclusive | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 1 | 2 | 0 | 2 | 0 | APP-1 |
| functional | 2 | 2 | 2 | 0 | 0 | - |
| integration | 1 | 1 | 1 | 0 | 0 | - |
| negative | 1 | 1 | 1 | 0 | 0 | - |
| security | 2 | 2 | 0 | 2 | 0 | APP-2 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | UI login page: its route and how the e-mail, password and log-in controls are found | how to exercise | AC-5 | discovered from the AUT (mechanics only): #/login: #email, #password, #loginButton; lands on #/search (the profile's UI sign-in; its overlays close the welcome and cookie banners) |
| G2 | basket page /#/basket: how the listed products and their quantities are found | how to exercise | AC-5 | discovered from the AUT (mechanics only): #/basket: a row per product (role row with its name), quantity in mat-cell.mat-column-quantity |
| G3 | how to observe that no second account was created for an already registered e-mail | how to exercise | AC-2 | discovered from the AUT (mechanics only): logging in with the e-mail still signs in the first customer (same user id): no second account |
| G4 | what answer counts as 'refused' when customer A requests customer B's basket: no status or error body is stated (401, 403, 404, or an error in a 200 body?). The outcome is judged as written: the request is refused and B's basket is not returned | expected behaviour | AC-6 | ❓ open |
| G5 | success status of POST /api/BasketItems is not stated; AC-5 is judged by the basket page listing the product | expected behaviour | AC-5 | ❓ open |

**For the owner's information** (questions the criteria can be judged without, as the review confirmed; they don't affect the verdict):

- ℹ️ G4 — what answer counts as 'refused' when customer A requests customer B's basket: no status or error body is stated (401, 403, 404, or an error in a 200 body?). The outcome is judged as written: the request is refused and B's basket is not returned
- ℹ️ G5 — success status of POST /api/BasketItems is not stated; AC-5 is judged by the basket page listing the product

**Assumptions the evaluation made:**

- a follow-up login "fails" when it does not answer 200 with a token (AC-4 defines a successful login); no particular status is asserted
- G4 — "refused" means an answer that is not 2xx; that part is tested separately (@assumes:G4), while "must not return B's basket" is tested literally
- customers the tests register are kept when the application doesn't let tests delete them, named hldout-…@example.com

**Readings the application contradicts** (the requirement does not settle these: an assumed value, or the literal reading of an open question; not reported as defects, the owner decides):

| Test | Rests on | Expected (by that reading) | Actual |
| --- | --- | --- | --- |
| SCN-008 | G4 | not /^2\d\d$/ | "200" |

Full review: [requirement-review.md](requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 8 | 8 | 0 |
| `02-eval` (final) | 4 | 4 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/02-eval/triage.md](runs/02-eval/triage.md) · JUnit: runs/02-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/JS-2/runs/02-eval/html`
