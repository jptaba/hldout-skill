# Triage — DEMO-707 / run 02-eval

Generated 2026-09-26T19:09:29.342Z

**22/34 passed**, 12 failed, 0 flaky, 0 skipped.

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
| SCN-007 | functional | AC-5 | failed | SCRIPT_DEFECT | high | **SCRIPT_DEFECT** |
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
  - request body: `{"user":{"email":"qairf3pfmlo1@example.com","password":"***redacted***"}}`
  - response body: `{"errors":{"email or password":["is invalid"]}}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-15eb4-th-401-and-an-errors-object-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-15eb4-th-401-and-an-errors-object-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-15eb4-th-401-and-an-errors-object-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: POST /api/users/login → 403
- Requirement assertion [REQ AC-3] failed.
- Expected: 401
- Received: 403

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: POST /api/users/login with a wrong password → 403 with an errors object. AC-3 and the contract's error model say wrong login credentials → 401 (403 is reserved for authenticated-but-not-permitted).

## SCN-007: A writer creates an article

- Requirement refs: AC-5 · type: functional · layer: api
- Failing step: Then the response status is 201
- Error: `[REQ AC-5] create article → 201`
- Expected: `201`
- Received: `500`
- Relevant API exchange (#1 of 1): `POST https://conduit-api.bondaracademy.com/api/articles` → **500**
  - request body: `{"title":"Heldout irf4ppuwx1","description":"About irf4ppuwx1","body":"Body of irf4ppuwx1","tagList":["heldout","tirf4ppuwx1"]}`
  - response body: `Cannot destructure property 'title' of 'article' as it is undefined.`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-29868-A-writer-creates-an-article-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-29868-A-writer-creates-an-article-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-29868-A-writer-creates-an-article-chromium-retry1/error-context.md)

**Auto: SCRIPT_DEFECT (high)**

- Last API exchange: POST /api/articles → 500
- The request body lacks the "article" envelope the requirement contract declares for POST /api/articles (top-level keys sent: title, description, body, tagList).
- The AUT answered the non-conforming request with 500. That is outside this AC; record it as a robustness observation (malformed input should get a 4xx), not as this finding.

Next: Send the payload in the declared envelope (HOW only), confirm with api-probe.ts, re-run. The AC is evaluated only once the request conforms.

**Confirmed: SCRIPT_DEFECT / Minor** — The test posted the article fields at top level. The contract (api-contract.md) declares {"article": {…}}. Replayed with the declared envelope → 201 with slug, author and tags. Separate observation outside the ACs: the API crashes with 500 on the malformed body instead of answering 4xx.

Action: Wrap the payload in the declared envelope (HOW only) and re-run.

## SCN-008: A second article with the same title gets its own slug

- Requirement refs: AC-6 · type: functional · layer: api
- Failing step: Then the response status is 201
- Error: `[REQ AC-6] same title → 201`
- Expected: `201`
- Received: `422`
- Relevant API exchange (#1 of 1): `POST https://conduit-api.bondaracademy.com/api/articles` → **422**
  - request body: `{"article":{"title":"Heldout irf7tgppr2","description":"About irf7y5ntj3","body":"Body of irf7y5ntj3","tagList":["heldout","tirf7y5ntj3"]}}`
  - response body: `{"errors":{"title":["must be unique"]}}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-03494-ame-title-gets-its-own-slug-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-03494-ame-title-gets-its-own-slug-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-03494-ame-title-gets-its-own-slug-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (medium)**

- Note: depends on SCN-007 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: POST /api/articles → 422
- AUT rejected the request as invalid although the scenario sends a valid payload — verify the payload matches the requirement contract.

Next: Compare the logged request body to the requirement field rules. Payload violates them → SCRIPT; payload conforms → APPLICATION (over-strict validation).

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: the second POST with an identical title → 422 {errors:{title:[must be unique]}}. AC-6: titles need not be unique; a second article gets its own slug (201).

## SCN-012.1: another signed-in reader filtering by author finds an article published moments ago

- Requirement refs: AC-10 · type: functional · layer: api
- Failing step: Then within 10 seconds the list contains the new article
- Error: `[REQ AC-10] another signed-in reader finds the new article by author`
- Expected: `"Heldout-irfjpb0om2-74203"`
- Received: `[]`
- Relevant API exchange (#6 of 6): `GET https://conduit-api.bondaracademy.com/api/articles?author=qairfjc8gqv1` → **200**
  - request body: ``
  - response body: `{"articles":[],"articlesCount":0}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-357ea-ticle-published-moments-ago-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-357ea-ticle-published-moments-ago-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-357ea-ticle-published-moments-ago-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-007 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /api/articles → 200
- Requirement assertion [REQ AC-10] failed.
- Expected: "Heldout-irfjpb0om2-74203"
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the author's ?author= query returns the new article; another signed-in reader and an anonymous visitor get [] — still after 13 s, so not a timing matter (independent of assumption G4). AC-10 + context: all published content is public to any reader.

## SCN-012.2: an anonymous visitor filtering by author finds an article published moments ago

- Requirement refs: AC-10 · type: functional · layer: api
- Failing step: Then within 10 seconds the list contains the new article
- Error: `[REQ AC-10] an anonymous visitor finds the new article by author`
- Expected: `"Heldout-irfjpz8fg2-74204"`
- Received: `[]`
- Relevant API exchange (#6 of 6): `GET https://conduit-api.bondaracademy.com/api/articles?author=qairfjbm2lz1` → **200**
  - request body: ``
  - response body: `{"articles":[],"articlesCount":0}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-d6610-ticle-published-moments-ago-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-d6610-ticle-published-moments-ago-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-d6610-ticle-published-moments-ago-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-007 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: GET /api/articles → 200
- Requirement assertion [REQ AC-10] failed.
- Expected: "Heldout-irfjpz8fg2-74204"
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the author's ?author= query returns the new article; another signed-in reader and an anonymous visitor get [] — still after 13 s, so not a timing matter (independent of assumption G4). AC-10 + context: all published content is public to any reader.

## SCN-013.3: limit=0 is rejected with 422

- Requirement refs: AC-11 · type: boundary · layer: api
- Failing step: Then the request is rejected with 422
- Error: `[REQ AC-11] limit=0 → 422`
- Expected: `422`
- Received: `200`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles?limit=0` → **200**
  - request body: ``
  - response body: `{"articles":[{"slug":"Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1","title":"Discover Bondar Academy: Your Gateway to Efficient Learning","description":"Discover Bondar Academy's unique place in the educational landscape, where value-focused and efficient learning approaches converge. Our goal is to rapidly enhance your professional technical skills, boosting your market competitiveness and paving the way for higher-paying job opportunities. The speed of your progress is in your hands – you set the pace, and we provide the solutions and support to help you achieve your desired…`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-dd3d9-imit-0-is-rejected-with-422-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-dd3d9-imit-0-is-rejected-with-422-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-dd3d9-imit-0-is-rejected-with-422-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles → 200
- Requirement assertion [REQ AC-11] failed.
- Expected: 422
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — Reproduced live: limit=0 and limit=101 → 200 with articles; AC-11 requires 422 outside 1–100 (1 and 100 accepted, as required).

## SCN-013.4: limit=101 is rejected with 422

- Requirement refs: AC-11 · type: boundary · layer: api
- Failing step: Then the request is rejected with 422
- Error: `[REQ AC-11] limit=101 → 422`
- Expected: `422`
- Received: `200`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles?limit=101` → **200**
  - request body: ``
  - response body: `{"articles":[{"slug":"Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1","title":"Discover Bondar Academy: Your Gateway to Efficient Learning","description":"Discover Bondar Academy's unique place in the educational landscape, where value-focused and efficient learning approaches converge. Our goal is to rapidly enhance your professional technical skills, boosting your market competitiveness and paving the way for higher-paying job opportunities. The speed of your progress is in your hands – you set the pace, and we provide the solutions and support to help you achieve your desired…`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-222aa-it-101-is-rejected-with-422-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-222aa-it-101-is-rejected-with-422-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-222aa-it-101-is-rejected-with-422-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles → 200
- Requirement assertion [REQ AC-11] failed.
- Expected: 422
- Received: 200

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — Reproduced live: limit=0 and limit=101 → 200 with articles; AC-11 requires 422 outside 1–100 (1 and 100 accepted, as required).

## SCN-018.1: the article's author sees a reader's comment on the article

- Requirement refs: AC-14 · type: functional · layer: api
- Failing step: Then the list contains the reader's comment
- Error: `[REQ AC-14] the article's author sees the comment`
- Expected: `106880`
- Received: `[]`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles/Heldout-irg1ya85l2-74211/comments` → **200**
  - request body: ``
  - response body: `{"comments":[]}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-b156e-er-s-comment-on-the-article-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-b156e-er-s-comment-on-the-article-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-b156e-er-s-comment-on-the-article-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles/Heldout-irg1ya85l2-74211/comments → 200
- Requirement assertion [REQ AC-14] failed.
- Expected: 106880
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the commenter lists the comment; the article's author, another signed-in user and an anonymous visitor all get comments: []. AC-14: every reader sees all comments.

## SCN-018.2: another signed-in user sees a reader's comment on the article

- Requirement refs: AC-14 · type: functional · layer: api
- Failing step: Then the list contains the reader's comment
- Error: `[REQ AC-14] another signed-in user sees the comment`
- Expected: `106881`
- Received: `[]`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles/Heldout-irg1y95ta2-74212/comments` → **200**
  - request body: ``
  - response body: `{"comments":[]}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-f43b5-er-s-comment-on-the-article-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-f43b5-er-s-comment-on-the-article-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-f43b5-er-s-comment-on-the-article-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles/Heldout-irg1y95ta2-74212/comments → 200
- Requirement assertion [REQ AC-14] failed.
- Expected: 106881
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the commenter lists the comment; the article's author, another signed-in user and an anonymous visitor all get comments: []. AC-14: every reader sees all comments.

## SCN-018.3: an anonymous visitor sees a reader's comment on the article

- Requirement refs: AC-14 · type: functional · layer: api
- Failing step: Then the list contains the reader's comment
- Error: `[REQ AC-14] an anonymous visitor sees the comment`
- Expected: `106884`
- Received: `[]`
- Relevant API exchange (#1 of 1): `GET https://conduit-api.bondaracademy.com/api/articles/Heldout-irg6r2mp22-74220/comments` → **200**
  - request body: ``
  - response body: `{"comments":[]}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-6dd13-er-s-comment-on-the-article-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-6dd13-er-s-comment-on-the-article-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-6dd13-er-s-comment-on-the-article-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /api/articles/Heldout-irg6r2mp22-74220/comments → 200
- Requirement assertion [REQ AC-14] failed.
- Expected: 106884
- Received: []

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Critical** — Reproduced live: the commenter lists the comment; the article's author, another signed-in user and an anonymous visitor all get comments: []. AC-14: every reader sees all comments.

## SCN-019: Someone other than the comment's author cannot delete it

- Requirement refs: AC-15 · type: security · layer: api
- Failing step: Then the response status is 403
- Error: `[REQ AC-15] non-author delete comment → 403`
- Expected: `403`
- Received: `404`
- Relevant API exchange (#1 of 2): `DELETE https://conduit-api.bondaracademy.com/api/articles/Heldout-irg6rvxr32-74221/comments/106885` → **404**
  - request body: ``
  - response body: `{}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-dd44b-t-s-author-cannot-delete-it-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-dd44b-t-s-author-cannot-delete-it-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-dd44b-t-s-author-cannot-delete-it-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: DELETE /api/articles/Heldout-irg6rvxr32-74221/comments/106885 → 404
- Requirement assertion [REQ AC-15] failed.
- Expected: 403
- Received: 404

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — Reproduced live: the article's author (not the commenter) DELETE → 404 {}; the comment remains (that half of AC-15 holds). AC-15 and the error model: not permitted → 403.

## SCN-020: Favouriting twice counts once; unfavouriting decrements

- Requirement refs: AC-16 · type: idempotency · layer: api
- Failing step: Then favoritesCount is still 1
- Error: `[REQ AC-16] second favourite leaves the count unchanged`
- Expected: `1`
- Received: `2`
- Relevant API exchange (#3 of 3): `DELETE https://conduit-api.bondaracademy.com/api/articles/Heldout-irgbk6gmp2-74228/favorite` → **200**
  - request body: ``
  - response body: `{"article":{"id":503908,"slug":"Heldout-irgbk6gmp2-74228","title":"Heldout irgbk6gmp2","description":"About irgbk6gmp2","body":"Body of irgbk6gmp2","createdAt":"2026-09-26T19:06:09.170Z","updatedAt":"2026-09-26T19:06:09.170Z","favoritesCount":1,"tagList":["heldout","tirgbk6gmp2"],"author":{"username":"qairgb7ldu31","bio":null,"image":"https://conduit-api.bondaracademy.com/images/smiley-cyrus.jpeg","following":false},"favorited":false}}`
- Evidence: [screenshot](artifacts/DEMO-707-tests-demo-707-DE-7331d-ce-unfavouriting-decrements-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DEMO-707/runs/02-eval/artifacts/DEMO-707-tests-demo-707-DE-7331d-ce-unfavouriting-decrements-chromium-retry1/trace.zip` · [error-context](artifacts/DEMO-707-tests-demo-707-DE-7331d-ce-unfavouriting-decrements-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Note: depends on SCN-007 (failed), but this scenario's preconditions succeeded and its own action ran — its failure stands on its own.
- Last API exchange: DELETE /api/articles/Heldout-irgbk6gmp2-74228/favorite → 200
- Requirement assertion [REQ AC-16] failed.
- Expected: 1
- Received: 2
- Also failed: [REQ AC-16] unfavourite decrements to 0 — expected 0, received 1

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — Reproduced live: favourite → 1, favourite again → 2, unfavourite → 1. AC-16: a repeated favourite leaves the count unchanged. The unfavourite assertion fails only as a consequence (count starts at 2).
