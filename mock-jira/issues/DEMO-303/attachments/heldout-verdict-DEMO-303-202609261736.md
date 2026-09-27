# Held-out Evaluation Verdict — DEMO-303

> **Verdict: ❌ FAIL** — 6 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-2, AC-6, AC-10, AC-11. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [DEMO-303](https://your-domain.atlassian.net/browse/DEMO-303) — Partner booking API — authenticate, create, amend and cancel bookings |
| Application under test | Restful Booker (booking API demo) (profile `restful-booker`) — UI https://restful-booker.herokuapp.com |
| Final run | `05-seeded` · 2026-09-26T17:20:17.063Z · 18s |
| Tests | 27 total · 15 passed · 12 failed · 0 flaky · 0 skipped (from 15 scenarios) |
| Held-out integrity | ✅ PRESERVED — 30 requirement assertions identical to the pre-hardening draft |
| Hardening | Tier 3 (`run.ts --label harden` dry-run with API exchange capture; `api-probe.ts` for live re-checks). API-only story, so no browser tier was needed. Tier 1 and tier 2 were not loaded in this session. |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-26T17:29:34.336Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-2 | security | Invalid credentials return 200 instead of 401 | SCN-002 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Major | AC-6 | negative | A booking missing a required field causes 500 instead of 400 | SCN-007.1, SCN-007.2, SCN-007.3, SCN-007.4 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-3 | Major | AC-6 | boundary | A negative totalprice is accepted | SCN-008.2 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-4 | Major | AC-6 | boundary | Check-out on or before check-in is accepted | SCN-008.4, SCN-008.5 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-5 | Minor | AC-10 | functional | Cancelling a booking returns 201 Created instead of 204 No Content | SCN-013 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-6 | Minor | AC-11 | negative | Writes to a booking id that does not exist return 405 instead of 404 | SCN-014.1, SCN-014.2, SCN-014.3 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (6 root cause(s), 12 failing test(s))

### APP-1 · SCN-002 · AC-2 — Invalid credentials return 200 instead of 401

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-2 | POST /auth with invalid credentials responds 401 Unauthorized with {"reason": "Bad credentials"}. |
| Requirement source | story AC-2 |
| Test type · layer | security · api |
| SCN-002: expected (requirement) → actual (AUT) | `401` → `200` |
| Failing step | Then the response status is 401 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (scenario steps):**

1. When I POST the partner username with a wrong password to /auth
2. Then the response status is 401
3. And the body is {"reason": "Bad credentials"}

**Via the API: SCN-002** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /auth → 200` ⟵

   ```bash
   curl -i -X POST 'https://restful-booker.herokuapp.com/auth' \
     -H 'Content-Type: application/json' \
     --data '{"username":"admin","password":"<secret from test-data.json / .env>"}'
   ```

Observed response of request 1 (SCN-002):

```json
{"reason":"Bad credentials"}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-002:"
```

#### Evidence

- [Page/test context at failure](runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-422b9-ntials-are-refused-with-401-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-422b9-ntials-are-refused-with-401-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live on 2026-09-26 (tier 3, api-probe): POST /auth with a wrong password → 200 (runs/02-eval/confirm/SCN-002.md)

**Evaluator's analysis:** AC-2 requires 401 Unauthorized for bad credentials. The API answers 200 OK with {"reason":"Bad credentials"} (the body matches; the status does not). Partner systems keying on the status would treat a failed login as success. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-007.1, SCN-007.2, SCN-007.3, SCN-007.4 · AC-6 — A booking missing a required field causes 500 instead of 400

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | A booking that breaks any rule in booking-rules.csv is rejected with 400 Bad Request (never 5xx) and is not stored. A value exactly on a boundary is valid. |
| Requirement source | story AC-6, booking-rules.csv R1 R2 R4 R5 |
| Test type · layer | negative · api |
| SCN-007.1: expected (requirement) → actual (AUT) | `400` → `500` |
| SCN-007.2: expected (requirement) → actual (AUT) | `400` → `500` |
| SCN-007.3: expected (requirement) → actual (AUT) | `400` → `500` |
| SCN-007.4: expected (requirement) → actual (AUT) | `400` → `500` |
| Failing step | Then the response status is 400 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (scenario steps):**

1. When I POST a valid booking without <field>
2. Then the response status is 400
3. And the booking is not stored

**Via the API: SCN-007.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /booking → 500` ⟵

   ```bash
   curl -i -X POST 'https://restful-booker.herokuapp.com/booking' \
     -H 'Content-Type: application/json' \
     --data '{"lastname":"Heldout ino0axg3-2","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}'
   ```

Observed response of request 1 (SCN-007.1):

```json
Internal Server Error
```

**Via the API: SCN-007.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /booking → 500` ⟵

   ```bash
   curl -i -X POST 'https://restful-booker.herokuapp.com/booking' \
     -H 'Content-Type: application/json' \
     --data '{"firstname":"QA ino18nyt-1","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}'
   ```

Observed response of request 1 (SCN-007.2):

```json
Internal Server Error
```

**Via the API: SCN-007.3** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /booking → 500` ⟵

   ```bash
   curl -i -X POST 'https://restful-booker.herokuapp.com/booking' \
     -H 'Content-Type: application/json' \
     --data '{"firstname":"QA ino17wdj-1","lastname":"Heldout ino17wqy-2","totalprice":150,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}'
   ```

2. `GET /booking → 200`

   ```bash
   curl -i -X GET 'https://restful-booker.herokuapp.com/booking?firstname=QA+ino17wdj-1&lastname=Heldout+ino17wqy-2'
   ```

Observed response of request 1 (SCN-007.3):

```json
Internal Server Error
```

**Via the API: SCN-007.4** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /booking → 500` ⟵

   ```bash
   curl -i -X POST 'https://restful-booker.herokuapp.com/booking' \
     -H 'Content-Type: application/json' \
     --data '{"firstname":"QA ino383nh-1","lastname":"Heldout ino383xd-2","totalprice":150,"depositpaid":true,"bookingdates":{"checkout":"2026-11-14"},"additionalneeds":"Breakfast"}'
   ```

2. `GET /booking → 200`

   ```bash
   curl -i -X GET 'https://restful-booker.herokuapp.com/booking?firstname=QA+ino383nh-1&lastname=Heldout+ino383xd-2'
   ```

Observed response of request 1 (SCN-007.4):

```json
Internal Server Error
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-007\.1:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-007\.2:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-007\.3:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-007\.4:"
```

#### Evidence

- [Page/test context at failure](runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-71608-ejected-with-400-firstname--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-71608-ejected-with-400-firstname--chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live on 2026-09-26 (tier 3, api-probe): POST /booking without lastname → 500 (runs/02-eval/confirm/SCN-007-missing-lastname.md)

**Evaluator's analysis:** AC-6 / booking-rules.csv R1 R2 R4 R5: a missing required field must be rejected with 400, never 5xx. Every missing-field variant returns 500 Internal Server Error, so input validation is absent and the server fails on client input. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-3 · SCN-008.2 · AC-6 — A negative totalprice is accepted

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | A booking that breaks any rule in booking-rules.csv is rejected with 400 Bad Request (never 5xx) and is not stored. A value exactly on a boundary is valid. |
| Requirement source | story AC-6, booking-rules.csv R3 R6 |
| Test type · layer | boundary · api |
| SCN-008.2: expected (requirement) → actual (AUT) | `400` → `200` |
| SCN-008.2: also failed | [REQ AC-6] totalprice -1 not stored |
| Failing step | Then the booking is rejected |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxno4eb140`; recreate equivalent data before reproducing):

- booking (created by the scenario): `4966` · cleanup: done

**Manually (scenario steps):**

1. When I POST a valid booking with <change>
2. Then the booking is <outcome>

**Via the API: SCN-008.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 2 (⟵) is the one that contradicts the requirement:

1. `POST /booking → 200`

   ```bash
   curl -i -X POST 'https://restful-booker.herokuapp.com/booking' \
     -H 'Content-Type: application/json' \
     --data '{"firstname":"QA ino4ecs0-1","lastname":"Heldout ino4ecqg-2","totalprice":-1,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}'
   ```

2. `GET /booking → 200` ⟵

   ```bash
   curl -i -X GET 'https://restful-booker.herokuapp.com/booking?firstname=QA+ino4ecs0-1&lastname=Heldout+ino4ecqg-2'
   ```

Observed response of request 2 (SCN-008.2):

```json
[{"bookingid":4966}]
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-008\.2:"
```

#### Evidence

- [Page/test context at failure](runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-56d82-d-totalprice--1-→-rejected--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-56d82-d-totalprice--1-→-rejected--chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live on 2026-09-26 (tier 3, api-probe): POST /booking with totalprice −1 → 200 (runs/02-eval/confirm/SCN-008.2.md)

**Evaluator's analysis:** booking-rules.csv R3: totalprice must be an integer ≥ 0 (0 is valid and passes). totalprice −1 is accepted with 200 and stored, where AC-6 requires 400 and not stored. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-4 · SCN-008.4, SCN-008.5 · AC-6 — Check-out on or before check-in is accepted

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | A booking that breaks any rule in booking-rules.csv is rejected with 400 Bad Request (never 5xx) and is not stored. A value exactly on a boundary is valid. |
| Requirement source | story AC-6, booking-rules.csv R3 R6 |
| Test type · layer | boundary · api |
| SCN-008.4: expected (requirement) → actual (AUT) | `400` → `200` |
| SCN-008.5: expected (requirement) → actual (AUT) | `400` → `200` |
| SCN-008.4: also failed | [REQ AC-6] checkout = checkin (same day) not stored |
| SCN-008.5: also failed | [REQ AC-6] checkout = checkin - 4 days not stored |
| Failing step | Then the booking is rejected |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxno45t130`; recreate equivalent data before reproducing):

- booking (created by the scenario): `4963` · cleanup: done

**Manually (scenario steps):**

1. When I POST a valid booking with <change>
2. Then the booking is <outcome>

**Via the API: SCN-008.4** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 2 (⟵) is the one that contradicts the requirement:

1. `POST /booking → 200`

   ```bash
   curl -i -X POST 'https://restful-booker.herokuapp.com/booking' \
     -H 'Content-Type: application/json' \
     --data '{"firstname":"QA ino45tpy-1","lastname":"Heldout ino45tpf-2","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-10"},"additionalneeds":"Breakfast"}'
   ```

2. `GET /booking → 200` ⟵

   ```bash
   curl -i -X GET 'https://restful-booker.herokuapp.com/booking?firstname=QA+ino45tpy-1&lastname=Heldout+ino45tpf-2'
   ```

Observed response of request 2 (SCN-008.4):

```json
[{"bookingid":4963}]
```

**Via the API: SCN-008.5** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 2 (⟵) is the one that contradicts the requirement:

1. `POST /booking → 200`

   ```bash
   curl -i -X POST 'https://restful-booker.herokuapp.com/booking' \
     -H 'Content-Type: application/json' \
     --data '{"firstname":"QA ino4phlb-1","lastname":"Heldout ino4phqa-2","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-06"},"additionalneeds":"Breakfast"}'
   ```

2. `GET /booking → 200` ⟵

   ```bash
   curl -i -X GET 'https://restful-booker.herokuapp.com/booking?firstname=QA+ino4phlb-1&lastname=Heldout+ino4phqa-2'
   ```

Observed response of request 2 (SCN-008.5):

```json
[{"bookingid":4972}]
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-008\.4:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-008\.5:"
```

#### Evidence

- [Page/test context at failure](runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-6f55b-heckin-same-day-→-rejected--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-6f55b-heckin-same-day-→-rejected--chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live on 2026-09-26 (tier 3, api-probe): checkin 2026-11-10, checkout 2026-11-06 → 200 (runs/02-eval/confirm/SCN-008.5.md)

**Evaluator's analysis:** booking-rules.csv R6: checkout must be strictly after checkin (checkin+1 is valid and passes). Same-day and earlier check-outs are accepted with 200 and stored, where AC-6 requires 400. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-5 · SCN-013 · AC-10 — Cancelling a booking returns 201 Created instead of 204 No Content

| | |
| --- | --- |
| Suggested severity | Minor |
| Requirement AC-10 | DELETE /booking/{id} with authentication responds 204 No Content. Afterwards GET /booking/{id} responds 404. |
| Requirement source | story AC-10 |
| Test type · layer | functional · api |
| SCN-013: expected (requirement) → actual (AUT) | `204` → `201` |
| Failing step | Then the response status is 204 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxno7ti200`; recreate equivalent data before reproducing):

- booking: `5026` · cleanup: done

**Manually (scenario steps):**

1. Given I created a valid booking
2. When I DELETE /booking/{id} with Basic authentication
3. Then the response status is 204
4. And GET /booking/{id} responds 404

**Via the API: SCN-013** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `DELETE /booking/5026 → 201` ⟵

   ```bash
   curl -i -X DELETE 'https://restful-booker.herokuapp.com/booking/5026' \
     -H 'Authorization: <your Authorization value>'
   ```

2. `GET /booking/5026 → 404`

   ```bash
   curl -i -X GET 'https://restful-booker.herokuapp.com/booking/5026'
   ```

Observed response of request 1 (SCN-013):

```json
Created
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-013:"
```

#### Evidence

- [Page/test context at failure](runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-83bf2--returns-204-and-removes-it-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-83bf2--returns-204-and-removes-it-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live on 2026-09-26 (tier 3, api-probe): DELETE with the declared Authorization header → 201; GET afterwards → 404 (runs/02-eval/confirm/SCN-013-correct-header.md, SCN-013-get-after-delete.md)

**Evaluator's analysis:** AC-10 requires 204 No Content for an authenticated DELETE. The cancellation works (a GET afterwards returns 404, which passes), but the API answers 201 Created, a status that means a resource was created. This finding was hidden in run 02 behind a test auth-plumbing defect and surfaced after the repair. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-6 · SCN-014.1, SCN-014.2, SCN-014.3 · AC-11 — Writes to a booking id that does not exist return 405 instead of 404

| | |
| --- | --- |
| Suggested severity | Minor |
| Requirement AC-11 | PUT, PATCH or DELETE of a booking id that does not exist responds 404 Not Found. |
| Requirement source | story AC-11 |
| Test type · layer | negative · api |
| SCN-014.1: expected (requirement) → actual (AUT) | `404` → `405` |
| SCN-014.2: expected (requirement) → actual (AUT) | `404` → `405` |
| SCN-014.3: expected (requirement) → actual (AUT) | `404` → `405` |
| Failing step | Then the response status is 404 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxno7th210`; recreate equivalent data before reproducing):

- booking id that no longer exists: `5025` · cleanup: none

**Manually (scenario steps):**

1. Given the id of a booking that no longer exists
2. When I <method> /booking/{id} with authentication
3. Then the response status is 404

**Via the API: SCN-014.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `PUT /booking/5025 → 405` ⟵

   ```bash
   curl -i -X PUT 'https://restful-booker.herokuapp.com/booking/5025' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"firstname":"QA ino8493d-3","lastname":"Heldout ino84989-4","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-11-10","checkout":"2026-11-14"},"additionalneeds":"Breakfast"}'
   ```

Observed response of request 1 (SCN-014.1):

```json
Method Not Allowed
```

**Via the API: SCN-014.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `PATCH /booking/5036 → 405` ⟵

   ```bash
   curl -i -X PATCH 'https://restful-booker.herokuapp.com/booking/5036' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"firstname":"Ghost"}'
   ```

Observed response of request 1 (SCN-014.2):

```json
Method Not Allowed
```

**Via the API: SCN-014.3** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `DELETE /booking/5038 → 405` ⟵

   ```bash
   curl -i -X DELETE 'https://restful-booker.herokuapp.com/booking/5038' \
     -H 'Authorization: <your Authorization value>'
   ```

Observed response of request 1 (SCN-014.3):

```json
Method Not Allowed
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-014\.1:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-014\.2:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-303 --label repro --grep "SCN-014\.3:"
```

#### Evidence

- [Page/test context at failure](runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-11cd6--not-exist-returns-404-PUT--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-303/runs/05-seeded/artifacts/DEMO-303-tests-demo-303-DE-11cd6--not-exist-returns-404-PUT--chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live on 2026-09-26 (tier 3, api-probe): authenticated PUT to a deleted booking id → 405 (runs/02-eval/confirm/SCN-014-put-unknown.md)

**Evaluator's analysis:** AC-11: PUT, PATCH or DELETE of a non-existent booking must answer 404. The API answers 405 Method Not Allowed, which wrongly tells partners the method is unsupported rather than that the booking is gone. (Confirmed in run 03-rerun; identical failure signature in 05-seeded.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (1)

| Found in run | Test | Symptom | Diagnosis | Fix applied | Final run |
| --- | --- | --- | --- | --- | --- |
| `02-eval` | SCN-013 | [REQ AC-10] DELETE → 204 | The test sent the credentials in a misspelled 'Authorisation' header, so the AUT correctly refused with 403 (no authentication per AC-7). With the declared 'Authorization' header the same DELETE is accepted. Auth plumbing bug in the test, not the app. | Header name corrected to Authorization (the shared basic() helper); replayed live: DELETE → 201 with the correct header. Full re-run required: the real AC-10 outcome was masked. | failed |

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | Valid partner credentials return a token | AC-1 | functional | ✅ passed | - |
| SCN-002 | Invalid credentials are refused with 401 | AC-2 | security | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-003 | Creating a valid booking echoes it with an id | AC-3 | functional | ✅ passed | - |
| SCN-004 | A created booking can be read back unchanged | AC-4 | functional | ✅ passed | - |
| SCN-005 | Reading a booking that does not exist returns 404 | AC-4 | negative | ✅ passed | - |
| SCN-006 | Searching by name finds the booking | AC-5 | functional | ✅ passed | - |
| SCN-007.1 | A booking missing a required field is rejected with 400 (firstname) | AC-6 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.2 | A booking missing a required field is rejected with 400 (lastname) | AC-6 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.3 | A booking missing a required field is rejected with 400 (depositpaid) | AC-6 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.4 | A booking missing a required field is rejected with 400 (bookingdates.checkin) | AC-6 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-008.1 | Price and date boundaries are enforced (totalprice 0 → accepted) | AC-6 | boundary | ✅ passed | - |
| SCN-008.2 | Price and date boundaries are enforced (totalprice -1 → rejected) | AC-6 | boundary | ❌ failed | APPLICATION_DEFECT · APP-3 |
| SCN-008.3 | Price and date boundaries are enforced (checkout = checkin + 1 day → accepted) | AC-6 | boundary | ✅ passed | - |
| SCN-008.4 | Price and date boundaries are enforced (checkout = checkin (same day) → rejected) | AC-6 | boundary | ❌ failed | APPLICATION_DEFECT · APP-4 |
| SCN-008.5 | Price and date boundaries are enforced (checkout = checkin - 4 days → rejected) | AC-6 | boundary | ❌ failed | APPLICATION_DEFECT · APP-4 |
| SCN-009.1 | Writes without authentication are refused and change nothing (PUT) | AC-7 | security | ✅ passed | - |
| SCN-009.2 | Writes without authentication are refused and change nothing (PATCH) | AC-7 | security | ✅ passed | - |
| SCN-009.3 | Writes without authentication are refused and change nothing (DELETE) | AC-7 | security | ✅ passed | - |
| SCN-010.1 | A full update succeeds with either authentication method (token cookie) | AC-7, AC-8 | functional | ✅ passed | - |
| SCN-010.2 | A full update succeeds with either authentication method (Basic auth) | AC-7, AC-8 | functional | ✅ passed | - |
| SCN-011 | Repeating the same PUT is idempotent | AC-8 | idempotency | ✅ passed | - |
| SCN-012 | PATCH changes only the supplied fields | AC-9 | functional | ✅ passed | - |
| SCN-013 | Cancelling a booking returns 204 and removes it | AC-10 | functional | ❌ failed | APPLICATION_DEFECT · APP-5 |
| SCN-014.1 | Writing to a booking that does not exist returns 404 (PUT) | AC-11 | negative | ❌ failed | APPLICATION_DEFECT · APP-6 |
| SCN-014.2 | Writing to a booking that does not exist returns 404 (PATCH) | AC-11 | negative | ❌ failed | APPLICATION_DEFECT · APP-6 |
| SCN-014.3 | Writing to a booking that does not exist returns 404 (DELETE) | AC-11 | negative | ❌ failed | APPLICATION_DEFECT · APP-6 |
| SCN-015 | Reading a booking is fast | AC-12 | performance | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | POST /auth with valid partner credentials responds 200 with {"token": "<non-empty string>"}. | SCN-001 | ✅ met |
| AC-2 | POST /auth with invalid credentials responds 401 Unauthorized with {"reason": "Bad credentials"}. | SCN-002 | ❌ not met |
| AC-3 | POST /booking with a valid booking responds 200 with {"bookingid": <integer>, "booking": <the booking exactly as sent>}. | SCN-003 | ✅ met |
| AC-4 | GET /booking/{id} responds 200 with the stored booking, identical to what was created. An id that does not exist responds 404. | SCN-004, SCN-005 | ✅ met |
| AC-5 | GET /booking?firstname=<f>&lastname=<l> responds 200 with a JSON array of {"bookingid"} objects that includes every booking with that name. | SCN-006 | ✅ met |
| AC-6 | A booking that breaks any rule in booking-rules.csv is rejected with 400 Bad Request (never 5xx) and is not stored. A value exactly on a boundary is valid. | SCN-007, SCN-008 (9 tests) | ❌ not met |
| AC-7 | PUT, PATCH and DELETE require authentication, either the cookie token=<token from /auth> or Authorization: Basic <base64 of partner credentials>. Without it they respond 403 Forbidden and change nothing. | SCN-009.1, SCN-009.2, SCN-009.3, SCN-010.1, SCN-010.2 | ✅ met |
| AC-8 | PUT /booking/{id} replaces the whole booking and responds 200 with the updated booking. Repeating the same PUT is idempotent: same response, same stored state. | SCN-010.1, SCN-010.2, SCN-011 | ✅ met |
| AC-9 | PATCH /booking/{id} changes only the fields supplied. All other fields keep their values. | SCN-012 | ✅ met |
| AC-10 | DELETE /booking/{id} with authentication responds 204 No Content. Afterwards GET /booking/{id} responds 404. | SCN-013 | ❌ not met |
| AC-11 | PUT, PATCH or DELETE of a booking id that does not exist responds 404 Not Found. | SCN-014.1, SCN-014.2, SCN-014.3 | ❌ not met |
| AC-12 | GET /booking/{id} responds in under 3000 ms for each of 5 consecutive requests. | SCN-015 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story AC-1, partner-accounts.csv | SCN-001 Valid partner credentials return a token | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story AC-2 | SCN-002 Invalid credentials are refused with 401 | security | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-3** | story AC-3, story §API contract (booking JSON) | SCN-003 Creating a valid booking echoes it with an id | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-4** | story AC-4 | SCN-004 A created booking can be read back unchanged | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-4 | SCN-005 Reading a booking that does not exist returns 404 | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-5** | story AC-5 | SCN-006 Searching by name finds the booking | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-6** | story AC-6, booking-rules.csv R1 R2 R4 R5 | SCN-007 A booking missing a required field is rejected with 400 | negative | api | 0/4 | ❌ fails requirement | APP-2 |
| ↳ | story AC-6, booking-rules.csv R3 R6 | SCN-008 Price and date boundaries are enforced | boundary | api | 2/5 | ❌ fails requirement | APP-3, APP-4 |
| **AC-7** | story AC-7 | SCN-009 Writes without authentication are refused and change nothing | security | api | 3/3 | ✅ meets requirement | - |
| ↳ | story AC-7, AC-8 | SCN-010 A full update succeeds with either authentication method | functional | api | 2/2 | ✅ meets requirement | - |
| **AC-8** | story AC-7, AC-8 | SCN-010 A full update succeeds with either authentication method | functional | api | 2/2 | ✅ meets requirement | - |
| ↳ | story AC-8 | SCN-011 Repeating the same PUT is idempotent | idempotency | api | 1/1 | ✅ meets requirement | - |
| **AC-9** | story AC-9 | SCN-012 PATCH changes only the supplied fields | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-10** | story AC-10 | SCN-013 Cancelling a booking returns 204 and removes it | functional | api | 0/1 | ❌ fails requirement | APP-5 |
| **AC-11** | story AC-11 | SCN-014 Writing to a booking that does not exist returns 404 | negative | api | 0/3 | ❌ fails requirement | APP-6 |
| **AC-12** | story AC-12 | SCN-015 Reading a booking is fast | performance | api | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 1 | 5 | 2 | 3 | 0 | APP-3, APP-4 |
| functional | 7 | 8 | 7 | 1 | 0 | APP-5 |
| idempotency | 1 | 1 | 1 | 0 | 0 | - |
| negative | 3 | 8 | 1 | 7 | 0 | APP-2, APP-6 |
| performance | 1 | 1 | 1 | 0 | 0 | - |
| security | 2 | 4 | 3 | 1 | 0 | APP-1 |

## Requirement gaps, assumptions and open questions

**Assumptions the evaluation made:**

- "does not exist" ids are obtained by creating then deleting a booking (no guessing on a shared sandbox).
- AC-6 states no error body, so only the status and "not stored" are asserted.

Full review: [requirement-review.md](requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 15 | 12 | 0 |
| `02-eval` | 15 | 12 | 0 |
| `03-rerun` | 15 | 12 | 0 |
| `04-seeded` | 15 | 12 | 0 |
| `05-seeded` (final) | 15 | 12 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/05-seeded/triage.md](runs/05-seeded/triage.md) · JUnit: runs/05-seeded/junit.xml
- HTML report: `npx playwright show-report evaluations/DEMO-303/runs/05-seeded/html`
