# Held-out Evaluation Verdict — DEMO-707

> **Verdict: ❌ FAIL** — 7 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-3, AC-6, AC-10, AC-11, AC-14, AC-15, AC-16. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [DEMO-707](https://your-domain.atlassian.net/browse/DEMO-707) — Conduit — accounts, articles, comments, favourites and discovery |
| Application under test | Conduit (RealWorld demo, Angular + JSON API) (profile `conduit`) — UI https://conduit.bondaracademy.com · API https://conduit-api.bondaracademy.com |
| Final run | `03-eval` · 2026-09-26T19:09:45.455Z · 65s |
| Tests | 34 total · 23 passed · 11 failed · 0 flaky · 0 skipped (from 23 scenarios) |
| Held-out integrity | ✅ PRESERVED — 46 requirement assertions identical to the pre-hardening draft |
| Hardening | tier 3 (`inspect.ts` for the contract's mechanics gaps G2/G3; `run.ts --label harden-ui --capture` for the UI scenarios). No tier 1 or tier 2 tools were loaded in this session. |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-26T19:12:02.591Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Critical | AC-10 | functional | Other readers cannot find an author's articles by ?author= | SCN-012.1, SCN-012.2 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Critical | AC-14 | functional | Comments are visible only to the commenter | SCN-018.1, SCN-018.2, SCN-018.3 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-3 | Major | AC-3 | security | Wrong password is answered 403 instead of 401 | SCN-004 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-4 | Major | AC-6 | functional | Second article with the same title is rejected (422 must be unique) | SCN-008 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-5 | Major | AC-16 | idempotency | Favouriting is not idempotent (second favourite counts again) | SCN-020 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-6 | Minor | AC-11 | boundary | limit outside 1–100 is accepted instead of 422 | SCN-013.3, SCN-013.4 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-7 | Minor | AC-15 | security | Deleting someone else's comment answers 404 instead of 403 | SCN-019 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (7 root cause(s), 11 failing test(s))

### APP-1 · SCN-012.1, SCN-012.2 · AC-10 — Other readers cannot find an author's articles by ?author=

| | |
| --- | --- |
| Suggested severity | Critical |
| Requirement AC-10 | Any reader filtering the article list by an author (`?author=<username>`) gets that author's published articles, including ones published moments ago. |
| Requirement source | story AC-10, story §Context (all published content is public), gap G4 |
| Test type · layer | functional · api |
| SCN-012.1: expected (requirement) → actual (AUT) | `"Heldout-irl8v63eb2-74248"` → `[]` |
| SCN-012.2: expected (requirement) → actual (AUT) | `"Heldout-irl8uzg3i2-74247"` → `[]` |
| Failing step | Then within 10 seconds the list contains the new article |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxrl8fy70`; recreate equivalent data before reproducing):

- registered writer (API): `{"username":"qairl8g00911","email":"qairl8g00911@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none
- article (API): `{"slug":"Heldout-irl8v63eb2-74248","title":"Heldout irl8v63eb2","description":"About irl8v63eb2","body":"Body of irl8v63eb2","tagList":["heldout","tirl8v63eb2"]…` · cleanup: done
- registered reader (API): `{"username":"qairl8zlj973","email":"qairl8zlj973@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none

**Manually (scenario steps):**

1. Given a writer published an article just now
2. When <reader> lists articles with ?author=<the writer's username>
3. Then within 10 seconds the list contains the new article

**API pre-steps: SCN-012.1** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairl8g00911","email":"qairl8g00911@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P2. `POST /api/articles → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"article":{"title":"Heldout irl8v63eb2","description":"About irl8v63eb2","body":"Body of irl8v63eb2","tagList":["heldout","tirl8v63eb2"]}}'
   ```

P3. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairl8zlj973","email":"qairl8zlj973@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

**Via the API: SCN-012.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 6 (⟵) is the one that contradicts the requirement:

1. `GET /api/articles → 200`

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles?author=qairl8g00911' \
     -H 'Authorization: <your Authorization value>'
   ```

2. `GET /api/articles → 200`

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles?author=qairl8g00911' \
     -H 'Authorization: <your Authorization value>'
   ```

3. `GET /api/articles → 200`

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles?author=qairl8g00911' \
     -H 'Authorization: <your Authorization value>'
   ```

4. `GET /api/articles → 200`

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles?author=qairl8g00911' \
     -H 'Authorization: <your Authorization value>'
   ```

5. `GET /api/articles → 200`

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles?author=qairl8g00911' \
     -H 'Authorization: <your Authorization value>'
   ```

6. `GET /api/articles → 200` ⟵

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles?author=qairl8g00911' \
     -H 'Authorization: <your Authorization value>'
   ```

Observed response of request 6 (SCN-012.1):

```json
{"articles":[],"articlesCount":0}
```

**API pre-steps: SCN-012.2** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairl8g0t4m1","email":"qairl8g0t4m1@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P2. `POST /api/articles → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"article":{"title":"Heldout irl8uzg3i2","description":"About irl8uzg3i2","body":"Body of irl8uzg3i2","tagList":["heldout","tirl8uzg3i2"]}}'
   ```

**Via the API: SCN-012.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /api/articles → 200` ⟵

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles?author=qairl8g0t4m1'
   ```

Observed response of request 1 (SCN-012.2):

```json
{"articles":[],"articlesCount":0}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-012\.1:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-012\.2:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-357ea-ticle-published-moments-ago-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-357ea-ticle-published-moments-ago-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/DEMO-707/runs/02-eval/confirm/SCN-012.md

**Evaluator's analysis:** Reproduced live: the author's ?author= query returns the new article; another signed-in reader and an anonymous visitor get [] — still after 13 s, so not a timing matter (independent of assumption G4). AC-10 + context: all published content is public to any reader. (Confirmed in run 02-eval; identical failure signature in 03-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-018.1, SCN-018.2, SCN-018.3 · AC-14 — Comments are visible only to the commenter

| | |
| --- | --- |
| Suggested severity | Critical |
| Requirement AC-14 | Comments are public: every reader of the article — the article's author, other users and anonymous visitors — sees all its comments in `GET /api/articles/{slug}/comments`. |
| Requirement source | story AC-14, story §Context |
| Test type · layer | functional · api |
| SCN-018.1: expected (requirement) → actual (AUT) | `106890` → `[]` |
| SCN-018.2: expected (requirement) → actual (AUT) | `106891` → `[]` |
| SCN-018.3: expected (requirement) → actual (AUT) | `106894` → `[]` |
| Failing step | Then the list contains the reader's comment |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxrlq2i140`; recreate equivalent data before reproducing):

- registered writer (API): `{"username":"qairlq2kahg1","email":"qairlq2kahg1@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none
- article (API): `{"slug":"Heldout-irlqh67zo2-74255","title":"Heldout irlqh67zo2","description":"About irlqh67zo2","body":"Body of irlqh67zo2","tagList":["heldout","tirlqh67zo2"]…` · cleanup: done
- registered reader (API): `{"username":"qairlqm458s3","email":"qairlqm458s3@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none
- comment (API; removed with the article): `{"id":106890,"createdAt":"2026-09-26T19:10:22.280Z","updatedAt":"2026-09-26T19:10:22.280Z","body":"Comment irlqv8p3s4","author":{"username":"qairlqm458s3","bio"…` · cleanup: none

**Manually (scenario steps):**

1. Given a writer published an article
2. And a reader commented on it
3. When <viewer> lists the article's comments
4. Then the list contains the reader's comment

**API pre-steps: SCN-018.1** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairlq2kahg1","email":"qairlq2kahg1@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P2. `POST /api/articles → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"article":{"title":"Heldout irlqh67zo2","description":"About irlqh67zo2","body":"Body of irlqh67zo2","tagList":["heldout","tirlqh67zo2"]}}'
   ```

P3. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairlqm458s3","email":"qairlqm458s3@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P4. `POST /api/articles/Heldout-irlqh67zo2-74255/comments → 200`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irlqh67zo2-74255/comments' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"comment":{"body":"Comment irlqv8p3s4"}}'
   ```

**Via the API: SCN-018.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /api/articles/Heldout-irlqh67zo2-74255/comments → 200` ⟵

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irlqh67zo2-74255/comments' \
     -H 'Authorization: <your Authorization value>'
   ```

Observed response of request 1 (SCN-018.1):

```json
{"comments":[]}
```

**API pre-steps: SCN-018.2** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairlq2kjuy1","email":"qairlq2kjuy1@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P2. `POST /api/articles → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"article":{"title":"Heldout irlqi6msp2","description":"About irlqi6msp2","body":"Body of irlqi6msp2","tagList":["heldout","tirlqi6msp2"]}}'
   ```

P3. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairlqmq9aj3","email":"qairlqmq9aj3@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P4. `POST /api/articles/Heldout-irlqi6msp2-74256/comments → 200`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irlqi6msp2-74256/comments' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"comment":{"body":"Comment irlqwr38o4"}}'
   ```

P5. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairlr0tfpu5","email":"qairlr0tfpu5@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

**Via the API: SCN-018.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /api/articles/Heldout-irlqi6msp2-74256/comments → 200` ⟵

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irlqi6msp2-74256/comments' \
     -H 'Authorization: <your Authorization value>'
   ```

Observed response of request 1 (SCN-018.2):

```json
{"comments":[]}
```

**API pre-steps: SCN-018.3** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairluwe8v21","email":"qairluwe8v21@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P2. `POST /api/articles → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"article":{"title":"Heldout irlvay6c92","description":"About irlvay6c92","body":"Body of irlvay6c92","tagList":["heldout","tirlvay6c92"]}}'
   ```

P3. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairlvfrwab3","email":"qairlvfrwab3@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P4. `POST /api/articles/Heldout-irlvay6c92-74264/comments → 200`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irlvay6c92-74264/comments' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"comment":{"body":"Comment irlvpi0w24"}}'
   ```

**Via the API: SCN-018.3** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /api/articles/Heldout-irlvay6c92-74264/comments → 200` ⟵

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irlvay6c92-74264/comments'
   ```

Observed response of request 1 (SCN-018.3):

```json
{"comments":[]}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-018\.1:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-018\.2:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-018\.3:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-b156e-er-s-comment-on-the-article-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-b156e-er-s-comment-on-the-article-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/DEMO-707/runs/02-eval/confirm/SCN-018.md

**Evaluator's analysis:** Reproduced live: the commenter lists the comment; the article's author, another signed-in user and an anonymous visitor all get comments: []. AC-14: every reader sees all comments. (Confirmed in run 02-eval; identical failure signature in 03-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-3 · SCN-004 · AC-3 — Wrong password is answered 403 instead of 401

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-3 | `POST /api/users/login` with valid credentials responds 200 with a token; with a wrong password it responds 401 Unauthorized with an `errors` object. |
| Requirement source | story AC-3, api-contract.md §Errors (401 wrong login credentials) |
| Test type · layer | security · api |
| SCN-004: expected (requirement) → actual (AUT) | `401` → `403` |
| Failing step | Then the response status is 401 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxrktzi20`; recreate equivalent data before reproducing):

- registered user (API; accounts cannot be deleted): `{"username":"qairktzjujb1","email":"qairktzjujb1@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none

**Manually (scenario steps):**

1. Given a registered user exists
2. When I POST their email with a wrong password to /api/users/login
3. Then the response status is 401
4. And the body has an errors object

**API pre-steps: SCN-004** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairktzjujb1","email":"qairktzjujb1@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

**Via the API: SCN-004** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /api/users/login → 403` ⟵

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users/login' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"email":"qairktzjujb1@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

Observed response of request 1 (SCN-004):

```json
{"errors":{"email or password":["is invalid"]}}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-004:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-15eb4-th-401-and-an-errors-object-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-15eb4-th-401-and-an-errors-object-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/DEMO-707/runs/02-eval/confirm/SCN-004.md

**Evaluator's analysis:** Reproduced live: POST /api/users/login with a wrong password → 403 with an errors object. AC-3 and the contract's error model say wrong login credentials → 401 (403 is reserved for authenticated-but-not-permitted). (Confirmed in run 02-eval; identical failure signature in 03-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-4 · SCN-008 · AC-6 — Second article with the same title is rejected (422 must be unique)

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | Titles need not be unique: a writer may publish a second article with the same title, which receives its own distinct slug (201). |
| Requirement source | story AC-6 |
| Test type · layer | functional · api |
| SCN-008: expected (requirement) → actual (AUT) | `201` → `422` |
| Failing step | Then the response status is 201 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxrkvln40`; recreate equivalent data before reproducing):

- registered writer (API): `{"username":"qairkvlp3e01","email":"qairkvlp3e01@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none
- article (API): `{"slug":"Heldout-irkw21m202-74241","title":"Heldout irkw21m202","description":"About irkw21m202","body":"Body of irkw21m202","tagList":["heldout","tirkw21m202"]…` · cleanup: done

**Manually (scenario steps):**

1. Given I am a signed-in writer who published an article
2. When I POST a second article with exactly the same title
3. Then the response status is 201
4. And its slug differs from the first article's slug

**API pre-steps: SCN-008** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairkvlp3e01","email":"qairkvlp3e01@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P2. `POST /api/articles → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"article":{"title":"Heldout irkw21m202","description":"About irkw21m202","body":"Body of irkw21m202","tagList":["heldout","tirkw21m202"]}}'
   ```

**Via the API: SCN-008** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /api/articles → 422` ⟵

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"article":{"title":"Heldout irkw21m202","description":"About irkw6gnhh3","body":"Body of irkw6gnhh3","tagList":["heldout","tirkw6gnhh3"]}}'
   ```

Observed response of request 1 (SCN-008):

```json
{"errors":{"title":["must be unique"]}}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-008:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-03494-ame-title-gets-its-own-slug-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-03494-ame-title-gets-its-own-slug-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/DEMO-707/runs/02-eval/confirm/SCN-008.md

**Evaluator's analysis:** Reproduced live: the second POST with an identical title → 422 {errors:{title:[must be unique]}}. AC-6: titles need not be unique; a second article gets its own slug (201). (Confirmed in run 02-eval; identical failure signature in 03-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-5 · SCN-020 · AC-16 — Favouriting is not idempotent (second favourite counts again)

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-16 | Favouriting is idempotent: favouriting an article increases `favoritesCount` by one and sets `favorited: true`; favouriting it again (e.g. a double-click or retry) leaves the count unchanged; unfavouriting decreases it by one. |
| Requirement source | story AC-16, story §User stories (safe retries) |
| Test type · layer | idempotency · api |
| SCN-020: expected (requirement) → actual (AUT) | `1` → `2` |
| SCN-020: also failed | [REQ AC-16] unfavourite decrements to 0 — `0` → `1` |
| Failing step | Then favoritesCount is still 1 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxrlzuo220`; recreate equivalent data before reproducing):

- registered writer (API): `{"username":"qairlzuq5o81","email":"qairlzuq5o81@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none
- article (API): `{"slug":"Heldout-irm06fm3p2-74272","title":"Heldout irm06fm3p2","description":"About irm06fm3p2","body":"Body of irm06fm3p2","tagList":["heldout","tirm06fm3p2"]…` · cleanup: done
- registered reader (API): `{"username":"qairm0b99uu3","email":"qairm0b99uu3@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none

**Manually (scenario steps):**

1. Given a writer published an article
2. And I am a signed-in reader
3. When I favourite the article
4. Then favoritesCount is 1 and favorited is true
5. When I favourite the article again
6. Then favoritesCount is still 1
7. When I unfavourite the article
8. Then favoritesCount is 0

**API pre-steps: SCN-020** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairlzuq5o81","email":"qairlzuq5o81@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P2. `POST /api/articles → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"article":{"title":"Heldout irm06fm3p2","description":"About irm06fm3p2","body":"Body of irm06fm3p2","tagList":["heldout","tirm06fm3p2"]}}'
   ```

P3. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairm0b99uu3","email":"qairm0b99uu3@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

**Via the API: SCN-020** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 3 (⟵) is the one that contradicts the requirement:

1. `POST /api/articles/Heldout-irm06fm3p2-74272/favorite → 200`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irm06fm3p2-74272/favorite' \
     -H 'Authorization: <your Authorization value>'
   ```

2. `POST /api/articles/Heldout-irm06fm3p2-74272/favorite → 200`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irm06fm3p2-74272/favorite' \
     -H 'Authorization: <your Authorization value>'
   ```

3. `DELETE /api/articles/Heldout-irm06fm3p2-74272/favorite → 200` ⟵

   ```bash
   curl -i -X DELETE 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irm06fm3p2-74272/favorite' \
     -H 'Authorization: <your Authorization value>'
   ```

Observed response of request 3 (SCN-020):

```json
{"article":{"id":503939,"slug":"Heldout-irm06fm3p2-74272","title":"Heldout irm06fm3p2","description":"About irm06fm3p2","body":"Body of irm06fm3p2","createdAt":"2026-09-26T19:10:34.339Z","updatedAt":"2026-09-26T19:10:34.339Z","favoritesCount":1,"tagList":["heldout","tirm06fm3p2"],"author":{"username":"qairlzuq5o81","bio":null,"image":"https://conduit-api.bondaracademy.com/images/smiley-cyrus.jpeg","following":false},"favorited":false}}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-020:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-7331d-ce-unfavouriting-decrements-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-7331d-ce-unfavouriting-decrements-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/DEMO-707/runs/02-eval/confirm/SCN-020.md

**Evaluator's analysis:** Reproduced live: favourite → 1, favourite again → 2, unfavourite → 1. AC-16: a repeated favourite leaves the count unchanged. The unfavourite assertion fails only as a consequence (count starts at 2). (Confirmed in run 02-eval; identical failure signature in 03-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-6 · SCN-013.3, SCN-013.4 · AC-11 — limit outside 1–100 is accepted instead of 422

| | |
| --- | --- |
| Suggested severity | Minor |
| Requirement AC-11 | The list supports pagination with `limit` (1–100) and `offset`. `limit` outside 1–100 is rejected with 422; values on the boundaries are accepted. |
| Requirement source | story AC-11, api-contract.md (limit 1–100) |
| Test type · layer | boundary · api |
| SCN-013.3: expected (requirement) → actual (AUT) | `422` → `200` |
| SCN-013.4: expected (requirement) → actual (AUT) | `422` → `200` |
| Failing step | Then the request is rejected with 422 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (scenario steps):**

1. When I GET /api/articles?limit=<limit>
2. Then the request is <outcome>

**Via the API: SCN-013.3** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /api/articles → 200` ⟵

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles?limit=0'
   ```

Observed response of request 1 (SCN-013.3):

```json
{"articles":[{"slug":"Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1","title":"Discover Bondar Academy: Your Gateway to Efficient Learning","description":"Discover Bondar Academy's unique place in the educational landscape, where value-focused and efficient learning approaches converge. Our goal is to rapidly enhance your professional technical skills, boosting your market competitiveness and paving the way for higher-paying job opportunities. The speed of your progress is in your hands – you set the pace, and we provide the solutions and support to help you achieve your desired…
```

**Via the API: SCN-013.4** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /api/articles → 200` ⟵

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles?limit=101'
   ```

Observed response of request 1 (SCN-013.4):

```json
{"articles":[{"slug":"Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1","title":"Discover Bondar Academy: Your Gateway to Efficient Learning","description":"Discover Bondar Academy's unique place in the educational landscape, where value-focused and efficient learning approaches converge. Our goal is to rapidly enhance your professional technical skills, boosting your market competitiveness and paving the way for higher-paying job opportunities. The speed of your progress is in your hands – you set the pace, and we provide the solutions and support to help you achieve your desired…
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-013\.3:"
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-013\.4:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-dd3d9-imit-0-is-rejected-with-422-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-dd3d9-imit-0-is-rejected-with-422-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/DEMO-707/runs/02-eval/confirm/SCN-013.md

**Evaluator's analysis:** Reproduced live: limit=0 and limit=101 → 200 with articles; AC-11 requires 422 outside 1–100 (1 and 100 accepted, as required). (Confirmed in run 02-eval; identical failure signature in 03-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-7 · SCN-019 · AC-15 — Deleting someone else's comment answers 404 instead of 403

| | |
| --- | --- |
| Suggested severity | Minor |
| Requirement AC-15 | Only a comment's author may delete it. Anyone else gets 403 and the comment remains. |
| Requirement source | story AC-15, api-contract.md §Errors (403 not the owner) |
| Test type · layer | security · api |
| SCN-019: expected (requirement) → actual (AUT) | `403` → `404` |
| Failing step | Then the response status is 403 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxrluwa190`; recreate equivalent data before reproducing):

- registered writer (API): `{"username":"qairluwc0y91","email":"qairluwc0y91@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none
- article (API): `{"slug":"Heldout-irlvc6snz2-74265","title":"Heldout irlvc6snz2","description":"About irlvc6snz2","body":"Body of irlvc6snz2","tagList":["heldout","tirlvc6snz2"]…` · cleanup: done
- registered reader (API): `{"username":"qairlvgvh9f3","email":"qairlvgvh9f3@example.com","password":"***redacted***","token":"***redacted***"}` · cleanup: none
- comment (API; removed with the article): `{"id":106895,"createdAt":"2026-09-26T19:10:28.557Z","updatedAt":"2026-09-26T19:10:28.557Z","body":"Comment irlvpsoyn4","author":{"username":"qairlvgvh9f3","bio"…` · cleanup: none

**Manually (scenario steps):**

1. Given a writer published an article
2. And a reader commented on it
3. When the article's author (not the commenter) deletes the comment
4. Then the response status is 403
5. And the comment is still listed for the commenter

**API pre-steps: SCN-019** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairluwc0y91","email":"qairluwc0y91@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P2. `POST /api/articles → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"article":{"title":"Heldout irlvc6snz2","description":"About irlvc6snz2","body":"Body of irlvc6snz2","tagList":["heldout","tirlvc6snz2"]}}'
   ```

P3. `POST /api/users → 201`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/users' \
     -H 'Content-Type: application/json' \
     --data '{"user":{"username":"qairlvgvh9f3","email":"qairlvgvh9f3@example.com","password":"<secret from test-data.json / .env>"}}'
   ```

P4. `POST /api/articles/Heldout-irlvc6snz2-74265/comments → 200`

   ```bash
   curl -i -X POST 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irlvc6snz2-74265/comments' \
     -H 'Authorization: <your Authorization value>' \
     -H 'Content-Type: application/json' \
     --data '{"comment":{"body":"Comment irlvpsoyn4"}}'
   ```

**Via the API: SCN-019** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `DELETE /api/articles/Heldout-irlvc6snz2-74265/comments/106895 → 404` ⟵

   ```bash
   curl -i -X DELETE 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irlvc6snz2-74265/comments/106895' \
     -H 'Authorization: <your Authorization value>'
   ```

2. `GET /api/articles/Heldout-irlvc6snz2-74265/comments → 200`

   ```bash
   curl -i -X GET 'https://conduit-api.bondaracademy.com/api/articles/Heldout-irlvc6snz2-74265/comments' \
     -H 'Authorization: <your Authorization value>'
   ```

Observed response of request 1 (SCN-019):

```json
{}
```

**Automated re-run of the failing test(s):**

```bash
npx tsx .claude/skills/heldout-evaluator/scripts/run.ts DEMO-707 --label repro --grep "SCN-019:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-dd44b-t-s-author-cannot-delete-it-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-dd44b-t-s-author-cannot-delete-it-chromium-retry1/trace.zip`
- Live re-check by the evaluator: evaluations/DEMO-707/runs/02-eval/confirm/SCN-019.md

**Evaluator's analysis:** Reproduced live: the article's author (not the commenter) DELETE → 404 {}; the comment remains (that half of AC-15 holds). AC-15 and the error model: not permitted → 403. (Confirmed in run 02-eval; identical failure signature in 03-eval.)

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (1)

| Found in run | Test | Symptom | Diagnosis | Fix applied | Final run |
| --- | --- | --- | --- | --- | --- |
| `02-eval` | SCN-007 | [REQ AC-5] create article → 201 | The test posted the article fields at top level. The contract (api-contract.md) declares {"article": {…}}. Replayed with the declared envelope → 201 with slug, author and tags. Separate observation outside the ACs: the API crashes with 500 on the malformed body instead of answering 4xx. | Wrap the payload in the declared envelope (HOW only) and re-run. | ✅ passed |

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | Registering a new user returns the user with a token | AC-1 | functional | ✅ passed | - |
| SCN-002.1 | Registering a taken email is rejected with a field-level error | AC-2 | negative | ✅ passed | - |
| SCN-002.2 | Registering a taken username is rejected with a field-level error | AC-2 | negative | ✅ passed | - |
| SCN-003 | Logging in with valid credentials returns a token | AC-3 | functional | ✅ passed | - |
| SCN-004 | A wrong password is refused with 401 and an errors object | AC-3 | security | ❌ failed | APPLICATION_DEFECT · APP-3 |
| SCN-005 | A valid Token header is accepted | AC-4 | functional | ✅ passed | - |
| SCN-006.1 | A request to an authenticated endpoint with no header is refused with 401 | AC-4 | security | ✅ passed | - |
| SCN-006.2 | A request to an authenticated endpoint with an invalid token is refused with 401 | AC-4 | security | ✅ passed | - |
| SCN-007 | A writer creates an article | AC-5 | functional | ✅ passed | - |
| SCN-008 | A second article with the same title gets its own slug | AC-6 | functional | ❌ failed | APPLICATION_DEFECT · APP-4 |
| SCN-009.1 | An article without a title is rejected with 422 | AC-7 | negative | ✅ passed | - |
| SCN-009.2 | An article without a description is rejected with 422 | AC-7 | negative | ✅ passed | - |
| SCN-009.3 | An article without a body is rejected with 422 | AC-7 | negative | ✅ passed | - |
| SCN-010.1 | Another signed-in user cannot update someone else's article | AC-8 | security | ✅ passed | - |
| SCN-010.2 | Another signed-in user cannot delete someone else's article | AC-8 | security | ✅ passed | - |
| SCN-011 | The author updates and then deletes an article | AC-9 | functional | ✅ passed | - |
| SCN-012.1 | another signed-in reader filtering by author finds an article published moments ago | AC-10 | functional | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-012.2 | an anonymous visitor filtering by author finds an article published moments ago | AC-10 | functional | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-013.1 | limit=1 is accepted | AC-11 | boundary | ✅ passed | - |
| SCN-013.2 | limit=100 is accepted | AC-11 | boundary | ✅ passed | - |
| SCN-013.3 | limit=0 is rejected with 422 | AC-11 | boundary | ❌ failed | APPLICATION_DEFECT · APP-6 |
| SCN-013.4 | limit=101 is rejected with 422 | AC-11 | boundary | ❌ failed | APPLICATION_DEFECT · APP-6 |
| SCN-014 | offset pages through the list | AC-11 | functional | ✅ passed | - |
| SCN-015 | A followed author's new article appears in the reader's feed | AC-12 | integration | ✅ passed | - |
| SCN-016 | A signed-in reader comments on an article | AC-13 | functional | ✅ passed | - |
| SCN-017 | An empty comment is rejected with 422 | AC-13 | negative | ✅ passed | - |
| SCN-018.1 | the article's author sees a reader's comment on the article | AC-14 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-018.2 | another signed-in user sees a reader's comment on the article | AC-14 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-018.3 | an anonymous visitor sees a reader's comment on the article | AC-14 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-019 | Someone other than the comment's author cannot delete it | AC-15 | security | ❌ failed | APPLICATION_DEFECT · APP-7 |
| SCN-020 | Favouriting twice counts once; unfavouriting decrements | AC-16 | idempotency | ❌ failed | APPLICATION_DEFECT · APP-5 |
| SCN-021 | A registered user signs in on the web app | AC-17 | functional | ✅ passed | - |
| SCN-022 | A writer publishes an article from the editor | AC-18 | integration | ✅ passed | - |
| SCN-023 | An anonymous visitor sees Sign in and Sign up | AC-19 | functional | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | `POST /api/users` with a new username, email and password responds 201 with the user (username, email, token). | SCN-001 | ✅ met |
| AC-2 | Registering an email or username that is already taken responds 422 with a field-level `errors` object naming the taken field(s). | SCN-002.1, SCN-002.2 | ✅ met |
| AC-3 | `POST /api/users/login` with valid credentials responds 200 with a token; with a wrong password it responds 401 Unauthorized with an `errors` object. | SCN-003, SCN-004 | ❌ not met |
| AC-4 | Endpoints that require authentication accept `Authorization: Token <jwt>` and respond 401 when the header is missing or the token is invalid. | SCN-005, SCN-006.1, SCN-006.2 | ✅ met |
| AC-5 | An authenticated writer can create an article (title, description, body, tagList) → 201 with the article, including a `slug`, the author and the tags. | SCN-007 | ✅ met |
| AC-6 | Titles need not be unique: a writer may publish a second article with the same title, which receives its own distinct slug (201). | SCN-008 | ❌ not met |
| AC-7 | A missing title, description or body is rejected with 422 and a field-level error. | SCN-009.1, SCN-009.2, SCN-009.3 | ✅ met |
| AC-8 | Only the author may update or delete an article. Another signed-in user gets 403; the article is unchanged. | SCN-010.1, SCN-010.2 | ✅ met |
| AC-9 | The author can update an article (200, changed fields returned) and delete it (204); afterwards `GET /api/articles/{slug}` responds 404. | SCN-011 | ✅ met |
| AC-10 | Any reader filtering the article list by an author (`?author=<username>`) gets that author's published articles, including ones published moments ago. | SCN-012.1, SCN-012.2 | ❌ not met |
| AC-11 | The list supports pagination with `limit` (1–100) and `offset`. `limit` outside 1–100 is rejected with 422; values on the boundaries are accepted. | SCN-013.1, SCN-013.2, SCN-013.3, SCN-013.4, SCN-014 | ❌ not met |
| AC-12 | After following an author, that author's articles appear in the reader's feed (`GET /api/articles/feed`). | SCN-015 | ✅ met |
| AC-13 | A signed-in reader can comment on any article (200, the comment is returned). An empty comment body is rejected with 422. | SCN-016, SCN-017 | ✅ met |
| AC-14 | Comments are public: every reader of the article — the article's author, other users and anonymous visitors — sees all its comments in `GET /api/articles/{slug}/comments`. | SCN-018.1, SCN-018.2, SCN-018.3 | ❌ not met |
| AC-15 | Only a comment's author may delete it. Anyone else gets 403 and the comment remains. | SCN-019 | ❌ not met |
| AC-16 | Favouriting is idempotent: favouriting an article increases `favoritesCount` by one and sets `favorited: true`; favouriting it again (e.g. a double-click or retry) leaves the count unchanged; unfavouriting decreases it by one. | SCN-020 | ❌ not met |
| AC-17 | A registered user can sign in on the web app's Sign in page with email and password; afterwards the navigation shows their username and a "New Article" link. | SCN-021 | ✅ met |
| AC-18 | A signed-in writer can publish an article from the editor ("New Article"); the article page then shows the title and body, and the article is available from the API under its slug. | SCN-022 | ✅ met |
| AC-19 | An anonymous visitor sees "Sign in" and "Sign up" links in the navigation. | SCN-023 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story AC-1, api-contract.md (POST /api/users) | SCN-001 Registering a new user returns the user with a token | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story AC-2, api-contract.md §Errors (422) | SCN-002 Registering a taken <field> is rejected with a field-level error | negative | api | 2/2 | ✅ meets requirement | - |
| **AC-3** | story AC-3 | SCN-003 Logging in with valid credentials returns a token | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-3, api-contract.md §Errors (401 wrong login credentials) | SCN-004 A wrong password is refused with 401 and an errors object | security | api | 0/1 | ❌ fails requirement | APP-3 |
| **AC-4** | story AC-4, api-contract.md (Authorization: Token <jwt>) | SCN-005 A valid Token header is accepted | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-4, api-contract.md §Errors (401 missing / invalid token) | SCN-006 A request to an authenticated endpoint with <credentials> is refused with 401 | security | api | 2/2 | ✅ meets requirement | - |
| **AC-5** | story AC-5, api-contract.md (POST /api/articles, article envelope) | SCN-007 A writer creates an article | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-6** | story AC-6 | SCN-008 A second article with the same title gets its own slug | functional | api | 0/1 | ❌ fails requirement | APP-4 |
| **AC-7** | story AC-7, api-contract.md §Errors (422) | SCN-009 An article without a <field> is rejected with 422 | negative | api | 3/3 | ✅ meets requirement | - |
| **AC-8** | story AC-8, api-contract.md §Errors (403 not the owner) | SCN-010 Another signed-in user cannot <action> someone else's article | security | api | 2/2 | ✅ meets requirement | - |
| **AC-9** | story AC-9 | SCN-011 The author updates and then deletes an article | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-10** | story AC-10, story §Context (all published content is public), gap G4 | SCN-012 <reader> filtering by author finds an article published moments ago | functional | api | 0/2 | ❌ fails requirement | APP-1 |
| **AC-11** | story AC-11, api-contract.md (limit 1–100) | SCN-013 limit=<limit> is <outcome> | boundary | api | 2/4 | ❌ fails requirement | APP-6 |
| ↳ | story AC-11, api-contract.md (offset) | SCN-014 offset pages through the list | functional | api | 1/1 | ✅ meets requirement | - |
| **AC-12** | story AC-12 | SCN-015 A followed author's new article appears in the reader's feed | integration | api | 1/1 | ✅ meets requirement | - |
| **AC-13** | story AC-13 | SCN-016 A signed-in reader comments on an article | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-13, api-contract.md §Errors (422) | SCN-017 An empty comment is rejected with 422 | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-14** | story AC-14, story §Context | SCN-018 <viewer> sees a reader's comment on the article | functional | api | 0/3 | ❌ fails requirement | APP-2 |
| **AC-15** | story AC-15, api-contract.md §Errors (403 not the owner) | SCN-019 Someone other than the comment's author cannot delete it | security | api | 0/1 | ❌ fails requirement | APP-7 |
| **AC-16** | story AC-16, story §User stories (safe retries) | SCN-020 Favouriting twice counts once; unfavouriting decrements | idempotency | api | 0/1 | ❌ fails requirement | APP-5 |
| **AC-17** | story AC-17, gap G2 (Sign in page = /login) | SCN-021 A registered user signs in on the web app | functional | e2e | 1/1 | ✅ meets requirement | - |
| **AC-18** | story AC-18, gap G3 (editor via "New Article") | SCN-022 A writer publishes an article from the editor | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-19** | story AC-19 | SCN-023 An anonymous visitor sees Sign in and Sign up | functional | ui | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 1 | 4 | 2 | 2 | 0 | APP-6 |
| functional | 12 | 15 | 9 | 6 | 0 | APP-1, APP-2, APP-4 |
| idempotency | 1 | 1 | 0 | 1 | 0 | APP-5 |
| integration | 2 | 2 | 2 | 0 | 0 | - |
| negative | 3 | 6 | 6 | 0 | 0 | - |
| security | 4 | 6 | 4 | 2 | 0 | APP-3, APP-7 |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | API origin ("the environment's API origin") | how to exercise | * | project configuration: https://conduit-api.bondaracademy.com |
| G2 | where the Sign in page lives and how its form is labelled (AC-17 entry point) | how to exercise | AC-17 | discovered from the AUT (mechanics only): /login — placeholder Email / Password, button "Sign in" |
| G3 | editor route and field labels (AC-18) | how to exercise | AC-18 | discovered from the AUT (mechanics only): /editor via the "New Article" link |
| G4 | how soon a just-published article must be discoverable ("moments ago") | expected behaviour | AC-10 | assumed: visible within 10 s of the 201 response (polled) |
| G5 | expected status for an invalid offset (negative / non-numeric) | expected behaviour | AC-11 | ❓ open |

**Open questions (not tested; need an answer from the PO):**

- ❓ G5 — what status should an invalid offset (negative or non-numeric) return? The contract only says "offset (≥ 0)". Not tested.

**Assumptions the evaluation made:**

- G4 — "published moments ago" is read as "discoverable within 10 s of the 201 response" (polled). The PO should confirm.
- Users that are not the subject of a scenario (writer, readers) are registered once per worker and reused (seed.once); scenarios about registration/login register their own.
- Scenarios that need an article create it through POST /api/articles (SCN-007's endpoint) as a pre-step — tagged @depends:SCN-007.

Full review: [requirement-review.md](requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden-ui` (hardening dry-run) | 3 | 0 | 0 |
| `02-eval` | 22 | 12 | 0 |
| `03-eval` (final) | 23 | 11 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/03-eval/triage.md](runs/03-eval/triage.md) · JUnit: runs/03-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/DEMO-707/runs/03-eval/html`
