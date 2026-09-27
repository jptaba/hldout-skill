# Triage — DQ-3 / run 03-eval

Generated 2026-09-27T16:55:49.712Z

**24/32 passed**, 8 failed, 0 flaky, 0 skipped.

| Test | Type | Criteria | Status | Auto classification | Confidence | Confirmed |
| --- | --- | --- | --- | --- | --- | --- |
| SCN-001 | functional | AC-1 | passed | - | - | - |
| SCN-002 | functional | AC-2 | passed | - | - | - |
| SCN-003 | functional | AC-3 | passed | - | - | - |
| SCN-004.1 | contract | AC-4 | passed | - | - | - |
| SCN-004.2 | contract | AC-4 | passed | - | - | - |
| SCN-004.3 | contract | AC-4 | passed | - | - | - |
| SCN-004.4 | contract | AC-4 | passed | - | - | - |
| SCN-004.5 | contract | AC-4 | passed | - | - | - |
| SCN-004.6 | contract | AC-4 | passed | - | - | - |
| SCN-004.7 | contract | AC-4 | passed | - | - | - |
| SCN-005.1 | contract | AC-5 | passed | - | - | - |
| SCN-005.2 | contract | AC-5 | passed | - | - | - |
| SCN-005.3 | contract | AC-5 | passed | - | - | - |
| SCN-005.4 | contract | AC-5 | passed | - | - | - |
| SCN-005.5 | contract | AC-5 | passed | - | - | - |
| SCN-005.6 | contract | AC-5 | passed | - | - | - |
| SCN-006 | contract | AC-6 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.1 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.2 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.3 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.4 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.5 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.6 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-007.7 | functional | AC-7 | failed | APPLICATION_DEFECT | high | **APPLICATION_DEFECT** |
| SCN-008.1 | integration | AC-8 | passed | - | - | - |
| SCN-008.2 | integration | AC-8 | passed | - | - | - |
| SCN-008.3 | integration | AC-8 | passed | - | - | - |
| SCN-008.4 | integration | AC-8 | passed | - | - | - |
| SCN-008.5 | integration | AC-8 | passed | - | - | - |
| SCN-008.6 | integration | AC-8 | passed | - | - | - |
| SCN-008.7 | integration | AC-8 | passed | - | - | - |
| SCN-009 | functional | AC-9 | passed | - | - | - |

## SCN-006: GET /moved answers 301 with a Location header pointing to the home page

- Requirement refs: AC-6 · type: contract · layer: api
- Failing step: And the response carries a Location header that points to the site home page https://demoqa.com/
- Error: `[REQ AC-6] Location header present`
- Received: `undefined`
- Relevant API exchange (#1 of 1): `GET https://demoqa.com/moved` → **301**
  - request body: ``
  - response body: `{"url":"demoqa.com"}`
- Evidence: [screenshot](artifacts/DQ-3-tests-dq-3-DQ-3-Links-58e94-r-pointing-to-the-home-page-chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-58e94-r-pointing-to-the-home-page-chromium-retry1/trace.zip` · [error-context](artifacts/DQ-3-tests-dq-3-DQ-3-Links-58e94-r-pointing-to-the-home-page-chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Last API exchange: GET /moved → 301
- Requirement assertion [REQ AC-6] failed.
- Expected: ?
- Received: undefined

Next: Confirm live in the AUT (replay with api-probe.ts, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Major** — AC-6 requires the 301 response to carry a Location header pointing to the site home page. The endpoint answers 301 Moved Permanently with no Location header at all (headers: connection, content-length, content-type, date, etag, server, x-powered-by); the target is only in a JSON body {"url":"demoqa.com"}. Status 301 itself matches AC-4/AC-6. G3 (relative vs absolute) is moot: no header exists.

## SCN-007.1: Clicking a diagnostic link reports its result on the page (Created)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Then the message "Link has responded with status 201 and status text Created" is shown
- Error: `[REQ AC-7] message after clicking Created`
- Locator: `getByText('Link has responded')`
- Expected: `"Link has responded with status 201 and status text Created"`
- Received: `"Link has responded with staus 201 and status text Created"`
- Evidence: [screenshot](artifacts/DQ-3-tests-dq-3-DQ-3-Links-d2d48-result-on-the-page-Created--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-d2d48-result-on-the-page-Created--chromium-retry1/trace.zip` · [error-context](artifacts/DQ-3-tests-dq-3-DQ-3-Links-d2d48-result-on-the-page-Created--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: "Link has responded with status 201 and status text Created"
- Received: "Link has responded with staus 201 and status text Created"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-7 requires the exact message 'Link has responded with status <code> and status text <text>'. The page shows 'Link has responded with staus <code> and status text <text>' — code and text are correct, the word 'status' is misspelled. Same root cause for all seven links.

## SCN-007.2: Clicking a diagnostic link reports its result on the page (No Content)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Then the message "Link has responded with status 204 and status text No Content" is shown
- Error: `[REQ AC-7] message after clicking No Content`
- Locator: `getByText('Link has responded')`
- Expected: `"Link has responded with status 204 and status text No Content"`
- Received: `"Link has responded with staus 204 and status text No Content"`
- Evidence: [screenshot](artifacts/DQ-3-tests-dq-3-DQ-3-Links-8e9f3-ult-on-the-page-No-Content--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-8e9f3-ult-on-the-page-No-Content--chromium-retry1/trace.zip` · [error-context](artifacts/DQ-3-tests-dq-3-DQ-3-Links-8e9f3-ult-on-the-page-No-Content--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: "Link has responded with status 204 and status text No Content"
- Received: "Link has responded with staus 204 and status text No Content"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-7 requires the exact message 'Link has responded with status <code> and status text <text>'. The page shows 'Link has responded with staus <code> and status text <text>' — code and text are correct, the word 'status' is misspelled. Same root cause for all seven links.

## SCN-007.3: Clicking a diagnostic link reports its result on the page (Moved)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Then the message "Link has responded with status 301 and status text Moved Permanently" is shown
- Error: `[REQ AC-7] message after clicking Moved`
- Locator: `getByText('Link has responded')`
- Expected: `"Link has responded with status 301 and status text Moved Permanently"`
- Received: `"Link has responded with staus 301 and status text Moved Permanently"`
- Evidence: [screenshot](artifacts/DQ-3-tests-dq-3-DQ-3-Links-05110-s-result-on-the-page-Moved--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-05110-s-result-on-the-page-Moved--chromium-retry1/trace.zip` · [error-context](artifacts/DQ-3-tests-dq-3-DQ-3-Links-05110-s-result-on-the-page-Moved--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: "Link has responded with status 301 and status text Moved Permanently"
- Received: "Link has responded with staus 301 and status text Moved Permanently"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-7 requires the exact message 'Link has responded with status <code> and status text <text>'. The page shows 'Link has responded with staus <code> and status text <text>' — code and text are correct, the word 'status' is misspelled. Same root cause for all seven links.

## SCN-007.4: Clicking a diagnostic link reports its result on the page (Bad Request)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Then the message "Link has responded with status 400 and status text Bad Request" is shown
- Error: `[REQ AC-7] message after clicking Bad Request`
- Locator: `getByText('Link has responded')`
- Expected: `"Link has responded with status 400 and status text Bad Request"`
- Received: `"Link has responded with staus 400 and status text Bad Request"`
- Evidence: [screenshot](artifacts/DQ-3-tests-dq-3-DQ-3-Links-50d81-lt-on-the-page-Bad-Request--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-50d81-lt-on-the-page-Bad-Request--chromium-retry1/trace.zip` · [error-context](artifacts/DQ-3-tests-dq-3-DQ-3-Links-50d81-lt-on-the-page-Bad-Request--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: "Link has responded with status 400 and status text Bad Request"
- Received: "Link has responded with staus 400 and status text Bad Request"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-7 requires the exact message 'Link has responded with status <code> and status text <text>'. The page shows 'Link has responded with staus <code> and status text <text>' — code and text are correct, the word 'status' is misspelled. Same root cause for all seven links.

## SCN-007.5: Clicking a diagnostic link reports its result on the page (Unauthorized)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Then the message "Link has responded with status 401 and status text Unauthorized" is shown
- Error: `[REQ AC-7] message after clicking Unauthorized`
- Locator: `getByText('Link has responded')`
- Expected: `"Link has responded with status 401 and status text Unauthorized"`
- Received: `"Link has responded with staus 401 and status text Unauthorized"`
- Evidence: [screenshot](artifacts/DQ-3-tests-dq-3-DQ-3-Links-d6427-t-on-the-page-Unauthorized--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-d6427-t-on-the-page-Unauthorized--chromium-retry1/trace.zip` · [error-context](artifacts/DQ-3-tests-dq-3-DQ-3-Links-d6427-t-on-the-page-Unauthorized--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: "Link has responded with status 401 and status text Unauthorized"
- Received: "Link has responded with staus 401 and status text Unauthorized"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-7 requires the exact message 'Link has responded with status <code> and status text <text>'. The page shows 'Link has responded with staus <code> and status text <text>' — code and text are correct, the word 'status' is misspelled. Same root cause for all seven links.

## SCN-007.6: Clicking a diagnostic link reports its result on the page (Forbidden)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Then the message "Link has responded with status 403 and status text Forbidden" is shown
- Error: `[REQ AC-7] message after clicking Forbidden`
- Locator: `getByText('Link has responded')`
- Expected: `"Link has responded with status 403 and status text Forbidden"`
- Received: `"Link has responded with staus 403 and status text Forbidden"`
- Evidence: [screenshot](artifacts/DQ-3-tests-dq-3-DQ-3-Links-79185-sult-on-the-page-Forbidden--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-79185-sult-on-the-page-Forbidden--chromium-retry1/trace.zip` · [error-context](artifacts/DQ-3-tests-dq-3-DQ-3-Links-79185-sult-on-the-page-Forbidden--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: "Link has responded with status 403 and status text Forbidden"
- Received: "Link has responded with staus 403 and status text Forbidden"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-7 requires the exact message 'Link has responded with status <code> and status text <text>'. The page shows 'Link has responded with staus <code> and status text <text>' — code and text are correct, the word 'status' is misspelled. Same root cause for all seven links.

## SCN-007.7: Clicking a diagnostic link reports its result on the page (Not Found)

- Requirement refs: AC-7 · type: functional · layer: ui
- Failing step: Then the message "Link has responded with status 404 and status text Not Found" is shown
- Error: `[REQ AC-7] message after clicking Not Found`
- Locator: `getByText('Link has responded')`
- Expected: `"Link has responded with status 404 and status text Not Found"`
- Received: `"Link has responded with staus 404 and status text Not Found"`
- Evidence: [screenshot](artifacts/DQ-3-tests-dq-3-DQ-3-Links-d91e6-sult-on-the-page-Not-Found--chromium-retry1/test-failed-1.png) · trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-d91e6-sult-on-the-page-Not-Found--chromium-retry1/trace.zip` · [error-context](artifacts/DQ-3-tests-dq-3-DQ-3-Links-d91e6-sult-on-the-page-Not-Found--chromium-retry1/error-context.md)

**Auto: APPLICATION_DEFECT (high)**

- Requirement assertion [REQ AC-7] failed on a located element.
- Expected: "Link has responded with status 404 and status text Not Found"
- Received: "Link has responded with staus 404 and status text Not Found"

Next: Confirm live in the AUT (reproduce the steps, observe the actual value), then record with --set.

**Confirmed: APPLICATION_DEFECT / Minor** — AC-7 requires the exact message 'Link has responded with status <code> and status text <text>'. The page shows 'Link has responded with staus <code> and status text <text>' — code and text are correct, the word 'status' is misspelled. Same root cause for all seven links.
