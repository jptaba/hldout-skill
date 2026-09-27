# Triage — DEMO-707 / run 03-eval

Generated 2026-09-26T19:11:55.526Z

**23/34 passed**, 11 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002.1 | negative | AC-2 | passed | - | - | - |
| SCN-002.2 | negative | AC-2 | passed | - | - | - |
| SCN-003 | functional | AC-3 | passed | - | - | - |
| SCN-004 | security | AC-3 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-005 | functional | AC-4 | passed | - | - | - |
| SCN-006.1 | security | AC-4 | passed | - | - | - |
| SCN-006.2 | security | AC-4 | passed | - | - | - |
| SCN-007 | functional | AC-5 | passed | - | - | - |
| SCN-008 | functional | AC-6 | failed | APPLICATION_DEFECT | medium | **APPLICATION_DEFECT** |
| SCN-009.1 | negative | AC-7 | passed | - | - | - |
| SCN-009.2 | negative | AC-7 | passed | - | - | - |
| SCN-009.3 | negative | AC-7 | passed | - | - | - |
| SCN-010.1 | security | AC-8 | passed | - | - | - |
| SCN-010.2 | security | AC-8 | passed | - | - | - |
| SCN-011 | functional | AC-9 | passed | - | - | - |
| SCN-012.1 | functional | AC-10 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-012.2 | functional | AC-10 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-013.1 | boundary | AC-11 | passed | - | - | - |
| SCN-013.2 | boundary | AC-11 | passed | - | - | - |
| SCN-013.3 | boundary | AC-11 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-013.4 | boundary | AC-11 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-014 | functional | AC-11 | passed | - | - | - |
| SCN-015 | integration | AC-12 | passed | - | - | - |
| SCN-016 | functional | AC-13 | passed | - | - | - |
| SCN-017 | negative | AC-13 | passed | - | - | - |
| SCN-018.1 | functional | AC-14 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-018.2 | functional | AC-14 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-018.3 | functional | AC-14 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-019 | security | AC-15 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-020 | idempotency | AC-16 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-021 | functional | AC-17 | passed | - | - | - |
| SCN-022 | integration | AC-18 | passed | - | - | - |
| SCN-023 | functional | AC-19 | passed | - | - | - |

## SCN-004: A wrong password is refused with 401 and an errors object

- Requirement refs: AC-3 · type: security · layer: api
- Failing step: Then the response status is 401
- Error: `[REQ AC-3] wrong password → 401`
- Expected: `401`
- Received: `403`
- Relevant API exchange (#1 of 1): `POST https://conduit-api.bondaracademy.com/api/users/login` → **403**
  - request body: `{"user":{"email":"qairktzjujb1@example.com","password":"***redacted***"}}`
  - response body: `{"errors":{"email or password":["is invalid"]}}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-15eb4-th-401-and-an-errors-object-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-15eb4-th-401-and-an-errors-object-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-15eb4-th-401-and-an-errors-object-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/users/login → 403
- Requirement assertion [REQ AC-3] failed.
- Expected: 401
- Received: 403

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: POST /api/users/login with a wrong password → 403 with an errors object. AC-3 and the contract's error model say wrong login credentials → 401 (403 is reserved for authenticated-but-not-permitted). (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-008: A second article with the same title gets its own slug

- Requirement refs: AC-6 · type: functional · layer: api
- Failing step: Then the response status is 201
- Error: `[REQ AC-6] same title → 201`
- Expected: `201`
- Received: `422`
- Relevant API exchange (#1 of 1): `POST https://conduit-api.bondaracademy.com/api/articles` → **422**
  - request body: `{"article":{"title":"Heldout irkw21m202","description":"About irkw6gnhh3","body":"Body of irkw6gnhh3","tagList":["heldout","tirkw6gnhh3"]}}`
  - response body: `{"errors":{"title":["must be unique"]}}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-03494-ame-title-gets-its-own-slug-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-03494-ame-title-gets-its-own-slug-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-03494-ame-title-gets-its-own-slug-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (medium)**

- Last API exchange: POST /api/articles → 422
- AUT rejected the request as invalid although the scenario sends a valid payload — verify the payload matches the requirement contract.

Next: Compare the logged request body to the requirement field rules. Payload violates them → SCRIPT; payload conforms → APPLICATION (over-strict validation).

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: the second POST with an identical title → 422 {errors:{title:[must be unique]}}. AC-6: titles need not be unique; a second article gets its own slug (201). (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-012.1: another signed-in reader filtering by author finds an article published moments ago

- Requirement refs: AC-10 · type: functional · layer: api
- Failing step: Then within 10 seconds the list contains the new article
- Error: `[REQ AC-10] another signed-in reader finds the new article by author`
- Expected: `"Heldout-irl8v63eb2-74248"`
- Received: `[]`
- Relevant API exchange (#6 of 6): `GET https://conduit-api.bondaracademy.com/api/articles?author=qairl8g00911` → **200**
  - request body: ``
  - response body: `{"articles":[],"articlesCount":0}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-357ea-ticle-published-moments-ago-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-357ea-ticle-published-moments-ago-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-357ea-ticle-published-moments-ago-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles → 200
- Requirement assertion [REQ AC-10] failed.
- Expected: "Heldout-irl8v63eb2-74248"
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the author's ?author= query returns the new article; another signed-in reader and an anonymous visitor get [] — still after 13 s, so not a timing matter (independent of assumption G4). AC-10 + context: all published content is public to any reader. (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-012.2: an anonymous visitor filtering by author finds an article published moments ago

- Requirement refs: AC-10 · type: functional · layer: api
- Failing step: Then within 10 seconds the list contains the new article
- Error: `[REQ AC-10] an anonymous visitor finds the new article by author`
- Expected: `"Heldout-irl8uzg3i2-74247"`
- Received: `[]`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles?author=qairl8g0t4m1` → **200**
  - request body: ``
  - response body: `{"articles":[],"articlesCount":0}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-d6610-ticle-published-moments-ago-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-d6610-ticle-published-moments-ago-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-d6610-ticle-published-moments-ago-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles → 200
- Requirement assertion [REQ AC-10] failed.
- Expected: "Heldout-irl8uzg3i2-74247"
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the author's ?author= query returns the new article; another signed-in reader and an anonymous visitor get [] — still after 13 s, so not a timing matter (independent of assumption G4). AC-10 + context: all published content is public to any reader. (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-013.3: limit=0 is rejected with 422

- Requirement refs: AC-11 · type: boundary · layer: api
- Failing step: Then the request is rejected with 422
- Error: `[REQ AC-11] limit=0 → 422`
- Expected: `422`
- Received: `200`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles?limit=0` → **200**
  - request body: ``
  - response body: `{"articles":[{"slug":"Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1","title":"Discover Bondar Academy: Your Gateway to Efficient Learning","description":"Discover Bondar Academy's unique place in the educational landscape, where value-focused and efficient learning approaches converge. Our goal is to rapidly enhance your professional technical skills, boosting your market competitiveness and paving the way for higher-paying job opportunities. The speed of your progress is in your hands – you set the pace, and we provide the solutions and support to help you achieve your desired…`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-dd3d9-imit-0-is-rejected-with-422-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-dd3d9-imit-0-is-rejected-with-422-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-dd3d9-imit-0-is-rejected-with-422-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles → 200
- Requirement assertion [REQ AC-11] failed.
- Expected: 422
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — Reproduced live: limit=0 and limit=101 → 200 with articles; AC-11 requires 422 outside 1–100 (1 and 100 accepted, as required). (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-013.4: limit=101 is rejected with 422

- Requirement refs: AC-11 · type: boundary · layer: api
- Failing step: Then the request is rejected with 422
- Error: `[REQ AC-11] limit=101 → 422`
- Expected: `422`
- Received: `200`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles?limit=101` → **200**
  - request body: ``
  - response body: `{"articles":[{"slug":"Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1","title":"Discover Bondar Academy: Your Gateway to Efficient Learning","description":"Discover Bondar Academy's unique place in the educational landscape, where value-focused and efficient learning approaches converge. Our goal is to rapidly enhance your professional technical skills, boosting your market competitiveness and paving the way for higher-paying job opportunities. The speed of your progress is in your hands – you set the pace, and we provide the solutions and support to help you achieve your desired…`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-222aa-it-101-is-rejected-with-422-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-222aa-it-101-is-rejected-with-422-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-222aa-it-101-is-rejected-with-422-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles → 200
- Requirement assertion [REQ AC-11] failed.
- Expected: 422
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — Reproduced live: limit=0 and limit=101 → 200 with articles; AC-11 requires 422 outside 1–100 (1 and 100 accepted, as required). (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-018.1: the article's author sees a reader's comment on the article

- Requirement refs: AC-14 · type: functional · layer: api
- Failing step: Then the list contains the reader's comment
- Error: `[REQ AC-14] the article's author sees the comment`
- Expected: `106890`
- Received: `[]`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles/Heldout-irlqh67zo2-74255/comments` → **200**
  - request body: ``
  - response body: `{"comments":[]}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-b156e-er-s-comment-on-the-article-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-b156e-er-s-comment-on-the-article-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-b156e-er-s-comment-on-the-article-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles/Heldout-irlqh67zo2-74255/comments → 200
- Requirement assertion [REQ AC-14] failed.
- Expected: 106890
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the commenter lists the comment; the article's author, another signed-in user and an anonymous visitor all get comments: []. AC-14: every reader sees all comments. (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-018.2: another signed-in user sees a reader's comment on the article

- Requirement refs: AC-14 · type: functional · layer: api
- Failing step: Then the list contains the reader's comment
- Error: `[REQ AC-14] another signed-in user sees the comment`
- Expected: `106891`
- Received: `[]`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles/Heldout-irlqi6msp2-74256/comments` → **200**
  - request body: ``
  - response body: `{"comments":[]}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-f43b5-er-s-comment-on-the-article-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-f43b5-er-s-comment-on-the-article-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-f43b5-er-s-comment-on-the-article-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles/Heldout-irlqi6msp2-74256/comments → 200
- Requirement assertion [REQ AC-14] failed.
- Expected: 106891
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the commenter lists the comment; the article's author, another signed-in user and an anonymous visitor all get comments: []. AC-14: every reader sees all comments. (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-018.3: an anonymous visitor sees a reader's comment on the article

- Requirement refs: AC-14 · type: functional · layer: api
- Failing step: Then the list contains the reader's comment
- Error: `[REQ AC-14] an anonymous visitor sees the comment`
- Expected: `106894`
- Received: `[]`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles/Heldout-irlvay6c92-74264/comments` → **200**
  - request body: ``
  - response body: `{"comments":[]}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-6dd13-er-s-comment-on-the-article-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-6dd13-er-s-comment-on-the-article-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-6dd13-er-s-comment-on-the-article-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles/Heldout-irlvay6c92-74264/comments → 200
- Requirement assertion [REQ AC-14] failed.
- Expected: 106894
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the commenter lists the comment; the article's author, another signed-in user and an anonymous visitor all get comments: []. AC-14: every reader sees all comments. (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-019: Someone other than the comment's author cannot delete it

- Requirement refs: AC-15 · type: security · layer: api
- Failing step: Then the response status is 403
- Error: `[REQ AC-15] non-author delete comment → 403`
- Expected: `403`
- Received: `404`
- Relevant API exchange (#1 of 2): `DELETE https://conduit-api.bondaracademy.com/api/articles/Heldout-irlvc6snz2-74265/comments/106895` → **404**
  - request body: ``
  - response body: `{}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-dd44b-t-s-author-cannot-delete-it-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-dd44b-t-s-author-cannot-delete-it-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-dd44b-t-s-author-cannot-delete-it-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: DELETE /api/articles/Heldout-irlvc6snz2-74265/comments/106895 → 404
- Requirement assertion [REQ AC-15] failed.
- Expected: 403
- Received: 404

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — Reproduced live: the article's author (not the commenter) DELETE → 404 {}; the comment remains (that half of AC-15 holds). AC-15 and the error model: not permitted → 403. (Confirmed in run 02-eval; identical failure signature in 03-eval.)

## SCN-020: Favouriting twice counts once; unfavouriting decrements

- Requirement refs: AC-16 · type: idempotency · layer: api
- Failing step: Then favoritesCount is still 1
- Error: `[REQ AC-16] second favourite leaves the count unchanged`
- Expected: `1`
- Received: `2`
- Relevant API exchange (#3 of 3): `DELETE https://conduit-api.bondaracademy.com/api/articles/Heldout-irm06fm3p2-74272/favorite` → **200**
  - request body: ``
  - response body: `{"article":{"id":503939,"slug":"Heldout-irm06fm3p2-74272","title":"Heldout irm06fm3p2","description":"About irm06fm3p2","body":"Body of irm06fm3p2","createdAt":"2026-09-26T19:10:34.339Z","updatedAt":"2026-09-26T19:10:34.339Z","favoritesCount":1,"tagList":["heldout","tirm06fm3p2"],"author":{"username":"qairlzuq5o81","bio":null,"image":"https://conduit-api.bondaracademy.com/images/smiley-cyrus.jpeg","following":false},"favorited":false}}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-7331d-ce-unfavouriting-decrements-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/03-eval/artifacts/DEMO-707-tests-demo-707-DE-7331d-ce-unfavouriting-decrements-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-7331d-ce-unfavouriting-decrements-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: DELETE /api/articles/Heldout-irm06fm3p2-74272/favorite → 200
- Requirement assertion [REQ AC-16] failed.
- Expected: 1
- Received: 2
- Also failed: [REQ AC-16] unfavourite decrements to 0 — expected 0, received 1

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: favourite → 1, favourite again → 2, unfavourite → 1. AC-16: a repeated favourite leaves the count unchanged. The unfavourite assertion fails only as a consequence (count starts at 2). (Confirmed in run 02-eval; identical failure signature in 03-eval.)
