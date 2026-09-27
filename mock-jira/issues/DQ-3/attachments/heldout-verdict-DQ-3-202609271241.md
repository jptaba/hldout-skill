# Held-out Evaluation Verdict — DQ-3

> **Verdict: ❌ FAIL** — 2 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-6, AC-7. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [DQ-3](https://your-domain.atlassian.net/browse/DQ-3) — Links page - new-tab links and HTTP status diagnostic links |
| Application under test | DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — UI https://demoqa.com |
| Final run | `03-eval` · 2026-09-27T12:39:45.313Z · 55s |
| Tests | 32 total · 24 passed · 8 failed · 0 flaky · 0 skipped (from 9 scenarios) |
| Held-out integrity | ✅ PRESERVED WITH 1 AUDITED AMENDMENT(S) — 20 requirement assertions; see "Assertion amendments" |
| Hardening | tier 2 (Playwright MCP driven through heldout mcp-probe, walk in tier2/links.md) and tier 3 (heldout inspect probes in tier3/links.md, heldout api-probe in… (see hardening log) |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-27T12:41:28.732Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-6 | contract | GET /moved answers 301 without a Location header | SCN-006 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Minor | AC-7 | functional | Diagnostic response message misspells "status" as "staus" | SCN-007.1, SCN-007.2, SCN-007.3, SCN-007.4, SCN-007.5, SCN-007.6, SCN-007.7 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (2 root cause(s), 8 failing test(s))

### APP-1 · SCN-006 · AC-6 — GET /moved answers 301 without a Location header

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-6 | Moved endpoint tells the client where to go: GET /moved responds 301 with a Location header that points to the site home page |
| Requirement source | story.md#L69-L72 (AC-6) |
| Test type · layer | contract · api |
| SCN-006: expected (requirement) → actual (AUT) | `-` → `undefined` |
| Failing step | And the response carries a Location header that points to the site home page https://demoqa.com/ |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (scenario steps):**

1. When a client sends GET /moved without following redirects
2. Then the response status is 301
3. And the response carries a Location header that points to the site home page https://demoqa.com/

**Via the API: SCN-006** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /moved → 301` ⟵

   ```bash
   curl -i -X GET 'https://demoqa.com/moved'
   ```

Observed response of request 1 (SCN-006):

```json
{"url":"demoqa.com"}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run DQ-3 --label repro --grep "SCN-006:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-58e94-r-pointing-to-the-home-page-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-58e94-r-pointing-to-the-home-page-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3, api-probe GET moved → 301, no location header): runs/03-eval/confirm/api-moved.md; also hardening/api/api-moved.md

**Evaluator's analysis:** AC-6 requires the 301 response to carry a Location header pointing to the site home page. The endpoint answers 301 Moved Permanently with no Location header at all (headers: connection, content-length, content-type, date, etag, server, x-powered-by); the target is only in a JSON body {"url":"demoqa.com"}. Status 301 itself matches AC-4/AC-6. G3 (relative vs absolute) is moot: no header exists.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-007.1, SCN-007.2, SCN-007.3, SCN-007.4, SCN-007.5, SCN-007.6, SCN-007.7 · AC-7 — Diagnostic response message misspells "status" as "staus"

| | |
| --- | --- |
| Suggested severity | Minor |
| Requirement AC-7 | Clicking a diagnostic link reports the result on the page: clicking the "<link>" link shows the message "Link has responded with status <code> and status text <text>" below the links, for Created 201 Created, No Content 204 No Content, Moved 301 Moved Permanently, Bad Request 400 Bad Request, Unauthorized 401 Unauthorized, Forbidden 403 Forbidden, Not Found 404 Not Found |
| Requirement source | story.md#L74-L87 (AC-7) |
| Test type · layer | functional · ui |
| SCN-007.1: expected (requirement) → actual (AUT) | `"Link has responded with status 201 and status text Created"` → `"Link has responded with staus 201 and status text Created"` |
| SCN-007.2: expected (requirement) → actual (AUT) | `"Link has responded with status 204 and status text No Content"` → `"Link has responded with staus 204 and status text No Content"` |
| SCN-007.3: expected (requirement) → actual (AUT) | `"Link has responded with status 301 and status text Moved Permanently"` → `"Link has responded with staus 301 and status text Moved Permanently"` |
| SCN-007.4: expected (requirement) → actual (AUT) | `"Link has responded with status 400 and status text Bad Request"` → `"Link has responded with staus 400 and status text Bad Request"` |
| SCN-007.5: expected (requirement) → actual (AUT) | `"Link has responded with status 401 and status text Unauthorized"` → `"Link has responded with staus 401 and status text Unauthorized"` |
| SCN-007.6: expected (requirement) → actual (AUT) | `"Link has responded with status 403 and status text Forbidden"` → `"Link has responded with staus 403 and status text Forbidden"` |
| SCN-007.7: expected (requirement) → actual (AUT) | `"Link has responded with status 404 and status text Not Found"` → `"Link has responded with staus 404 and status text Not Found"` |
| Failing step | Then the message "Link has responded with status 201 and status text Created" is shown |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Manually (scenario steps):**

1. Given I am on the Links page
2. When I click the "<link>" link
3. Then the message "Link has responded with status <code> and status text <text>" is shown

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run DQ-3 --label repro --grep "SCN-007\.1:"
npm run heldout -- run DQ-3 --label repro --grep "SCN-007\.2:"
npm run heldout -- run DQ-3 --label repro --grep "SCN-007\.3:"
npm run heldout -- run DQ-3 --label repro --grep "SCN-007\.4:"
npm run heldout -- run DQ-3 --label repro --grep "SCN-007\.5:"
npm run heldout -- run DQ-3 --label repro --grep "SCN-007\.6:"
npm run heldout -- run DQ-3 --label repro --grep "SCN-007\.7:"
```

#### Evidence

![SCN-007.1 at the moment of failure](runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-d2d48-result-on-the-page-Created--chromium-retry1/test-failed-1.png)

- [Page/test context at failure](runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-d2d48-result-on-the-page-Created--chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/DQ-3/runs/03-eval/artifacts/DQ-3-tests-dq-3-DQ-3-Links-d2d48-result-on-the-page-Created--chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3 inspect): Created → 'Link has responded with staus 201 and status text Created' (runs/03-eval/confirm/inspect-created.md), Not Found → 'staus 404 … Not Found' (confirm/inspect-notfound.md); tier 2 mcp-probe: 403 and 301 (hardening/tier2/links.md); tier 3 hardening: 204 (hardening/tier3/links.md)

**Evaluator's analysis:** AC-7 requires the exact message 'Link has responded with status <code> and status text <text>'. The page shows 'Link has responded with staus <code> and status text <text>' — code and text are correct, the word 'status' is misspelled. Same root cause for all seven links.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Assertion amendments (audited)

Fixes to how a requirement assertion was *implemented*. What it requires is unchanged. Each was approved with a reason before the official run.

| Assertion | Draft | Amended | Reason |
| --- | --- | --- | --- |
| dq-3.spec.ts: [REQ AC-9] 201 Created message shown | `.toBeVisible()` | `.toContainText(new RegExp(`\\b${created.code}\\b.*\\b${created.text}$`))` | Over-strict implementation: AC-9 requires only that the single remaining message reports 201 Created; the draft matched AC-7's full sentence wording, duplicating AC-7's oracle (scenario-format rule 5, one root cause one failure) and hiding AC-9's own check. The amended assertion still requires the one message to report code 201 and text Created; AC-7's wording remains asserted verbatim in SCN-007.x. |

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | The Links page shows its heading, both sections and the api-call links in order | AC-1 | functional | ✅ passed | - |
| SCN-002 | The static Home link opens the home page in a new tab | AC-2 | functional | ✅ passed | - |
| SCN-003 | The dynamic Home link has a random suffix and opens the home page in a new tab | AC-3 | functional | ✅ passed | - |
| SCN-004.1 | Each diagnostic endpoint answers with its status code (Created: GET /created) | AC-4 | contract | ✅ passed | - |
| SCN-004.2 | Each diagnostic endpoint answers with its status code (No Content: GET /no-content) | AC-4 | contract | ✅ passed | - |
| SCN-004.3 | Each diagnostic endpoint answers with its status code (Moved: GET /moved) | AC-4 | contract | ✅ passed | - |
| SCN-004.4 | Each diagnostic endpoint answers with its status code (Bad Request: GET /bad-request) | AC-4 | contract | ✅ passed | - |
| SCN-004.5 | Each diagnostic endpoint answers with its status code (Unauthorized: GET /unauthorized) | AC-4 | contract | ✅ passed | - |
| SCN-004.6 | Each diagnostic endpoint answers with its status code (Forbidden: GET /forbidden) | AC-4 | contract | ✅ passed | - |
| SCN-004.7 | Each diagnostic endpoint answers with its status code (Not Found: GET /invalid-url) | AC-4 | contract | ✅ passed | - |
| SCN-005.1 | Diagnostic responses other than /moved carry no body (GET /created) | AC-5 | contract | ✅ passed | - |
| SCN-005.2 | Diagnostic responses other than /moved carry no body (GET /no-content) | AC-5 | contract | ✅ passed | - |
| SCN-005.3 | Diagnostic responses other than /moved carry no body (GET /bad-request) | AC-5 | contract | ✅ passed | - |
| SCN-005.4 | Diagnostic responses other than /moved carry no body (GET /unauthorized) | AC-5 | contract | ✅ passed | - |
| SCN-005.5 | Diagnostic responses other than /moved carry no body (GET /forbidden) | AC-5 | contract | ✅ passed | - |
| SCN-005.6 | Diagnostic responses other than /moved carry no body (GET /invalid-url) | AC-5 | contract | ✅ passed | - |
| SCN-006 | GET /moved answers 301 with a Location header pointing to the home page | AC-6 | contract | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-007.1 | Clicking a diagnostic link reports its result on the page (Created) | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.2 | Clicking a diagnostic link reports its result on the page (No Content) | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.3 | Clicking a diagnostic link reports its result on the page (Moved) | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.4 | Clicking a diagnostic link reports its result on the page (Bad Request) | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.5 | Clicking a diagnostic link reports its result on the page (Unauthorized) | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.6 | Clicking a diagnostic link reports its result on the page (Forbidden) | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.7 | Clicking a diagnostic link reports its result on the page (Not Found) | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-008.1 | The page reports the status its own GET request really received (Created) | AC-8 | integration | ✅ passed | - |
| SCN-008.2 | The page reports the status its own GET request really received (No Content) | AC-8 | integration | ✅ passed | - |
| SCN-008.3 | The page reports the status its own GET request really received (Moved) | AC-8 | integration | ✅ passed | - |
| SCN-008.4 | The page reports the status its own GET request really received (Bad Request) | AC-8 | integration | ✅ passed | - |
| SCN-008.5 | The page reports the status its own GET request really received (Unauthorized) | AC-8 | integration | ✅ passed | - |
| SCN-008.6 | The page reports the status its own GET request really received (Forbidden) | AC-8 | integration | ✅ passed | - |
| SCN-008.7 | The page reports the status its own GET request really received (Not Found) | AC-8 | integration | ✅ passed | - |
| SCN-009 | Only the latest diagnostic result is shown | AC-9 | functional | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | Page layout: the Links page shows the heading "Links", a section captioned "Following links will open new tab", a section captioned "Following links will send an api call" containing exactly the links Created, No Content, Moved, Bad Request, Unauthorized, Forbidden, Not Found in this order, and no response message before any api-call link has been clicked | SCN-001 | ✅ met |
| AC-2 | Static home link opens in a new tab: clicking the link labelled "Home" on the Links page opens the site home page (https://demoqa.com/) in a new browser tab and the original tab stays on the Links page | SCN-002 | ✅ met |
| AC-3 | Dynamic home link: the second link in the new-tab section has a label that starts with "Home" followed by a random suffix, the suffix is different after the page is reloaded, and clicking that link opens the site home page in a new browser tab | SCN-003 | ✅ met |
| AC-4 | Diagnostic endpoints answer with their status code: GET /created -> 201 Created, GET /no-content -> 204 No Content, GET /moved -> 301 Moved Permanently, GET /bad-request -> 400 Bad Request, GET /unauthorized -> 401 Unauthorized, GET /forbidden -> 403 Forbidden, GET /invalid-url -> 404 Not Found (the PO comment replaces /not-found with /invalid-url) | SCN-004 (7 tests) | ✅ met |
| AC-5 | Diagnostic responses carry no body: GET to any of the diagnostic endpoints except /moved returns an empty response body (this applies to /invalid-url as well) | SCN-005.1, SCN-005.2, SCN-005.3, SCN-005.4, SCN-005.5, SCN-005.6 | ✅ met |
| AC-6 | Moved endpoint tells the client where to go: GET /moved responds 301 with a Location header that points to the site home page | SCN-006 | ❌ not met |
| AC-7 | Clicking a diagnostic link reports the result on the page: clicking the "<link>" link shows the message "Link has responded with status <code> and status text <text>" below the links, for Created 201 Created, No Content 204 No Content, Moved 301 Moved Permanently, Bad Request 400 Bad Request, Unauthorized 401 Unauthorized, Forbidden 403 Forbidden, Not Found 404 Not Found | SCN-007 (7 tests) | ❌ not met |
| AC-8 | The page reports what the endpoint really answered: clicking any diagnostic link makes the browser send one GET request to that link's endpoint, the status code shown in the message equals the HTTP status of that request, and the browser stays on the Links page (no navigation, no new tab) | SCN-008 (7 tests) | ✅ met |
| AC-9 | Only the latest result is shown: after clicking the "Forbidden" link and seeing its message, clicking the "Created" link leaves only one response message, reporting 201 Created | SCN-009 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L29-L36 (AC-1) | SCN-001 The Links page shows its heading, both sections and the api-call links in order | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L38-L42 (AC-2) | SCN-002 The static Home link opens the home page in a new tab | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L44-L49 (AC-3) | SCN-003 The dynamic Home link has a random suffix and opens the home page in a new tab | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-4** | story.md#L51-L63 (AC-4), story.md#L110-L112 (PO correction: /invalid-url) | SCN-004 Each diagnostic endpoint answers with its status code | contract | api | 7/7 | ✅ meets requirement | - |
| **AC-5** | story.md#L65-L67 (AC-5), story.md#L110-L112 | SCN-005 Diagnostic responses other than /moved carry no body | contract | api | 6/6 | ✅ meets requirement | - |
| **AC-6** | story.md#L69-L72 (AC-6) | SCN-006 GET /moved answers 301 with a Location header pointing to the home page | contract | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-7** | story.md#L74-L87 (AC-7) | SCN-007 Clicking a diagnostic link reports its result on the page | functional | ui | 0/7 | ❌ fails requirement | APP-2 |
| **AC-8** | story.md#L89-L94 (AC-8), story.md#L56-L63 and story.md#L110-L112 (R1 link -> endpoint) | SCN-008 The page reports the status its own GET request really received | integration | e2e | 7/7 | ✅ meets requirement | - |
| **AC-9** | story.md#L96-L99 (AC-9) | SCN-009 Only the latest diagnostic result is shown | functional | ui | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| contract | 3 | 14 | 13 | 1 | 0 | APP-1 |
| functional | 5 | 11 | 4 | 7 | 0 | APP-2 |
| integration | 1 | 7 | 7 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | endpoint behind the Not Found link: the AC-4 table says /not-found, the PO comment says /invalid-url | expected behaviour | AC-4, AC-5, AC-8 | found elsewhere in the requirement: /invalid-url (GET /invalid-url -> 404 Not Found; AC-5 and AC-8 apply to it) |
| G2 | AC-4 "the response status is <code> <text>": must the HTTP reason phrase of the response equal <text> (a reason phrase is not transmitted at all over HTTP/2), or is <text> only the standard name of <code> so that the status code alone is checked? | expected behaviour | AC-4 | ❓ open |
| G3 | AC-6 Location header "points to the site home page": does a relative reference to the site root satisfy it, or must the header hold the absolute home page URL? | expected behaviour | AC-6 | ❓ open |

**Open questions for the PO** (untested unless a scenario needing clarification below covers it):

- ❓ G2 — AC-4 "the response status is <code> <text>": must the HTTP reason phrase of the response equal <text> (a reason phrase is not transmitted at all over HTTP/2), or is <text> only the standard name of <code> so that the status code alone is checked?
- ❓ G3 — AC-6 Location header "points to the site home page": does a relative reference to the site root satisfy it, or must the header hold the absolute home page URL?

**Scenarios needing clarification:**

- SCN-006: GET /moved answers 301 with a Location header pointing to the home page

**Assumptions the evaluation made:**

- "shown below the links" (AC-7) is a layout statement; the message is checked for presence and exact text, not pixel position.
- G2 — the HTTP reason phrase of the endpoints is not asserted (not asserted); the status code is. The UI message text (AC-7) is asserted verbatim.
- GET /moved is requested without following redirects, so the client sees the endpoint's own answer (AC-4, AC-6).
- "the site home page" is https://demoqa.com/ (stated in AC-2); a new tab "opens the home page" when its URL is that page.

Full review: [requirement-review.md](requirement-review.md)

## Observations outside the acceptance criteria

Seen while evaluating; no criterion states them, so they do not affect the verdict. The owner decides whether they matter:

- 🔎 GET /moved names its target only in a JSON body {"url":"demoqa.com"} (a bare host, no scheme), not in a Location header; browsers and HTTP clients will not follow it.

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 23 | 9 | 0 |
| `02-harden` (hardening dry-run) | 72 | 24 | 0 |
| `03-eval` (final) | 24 | 8 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/03-eval/triage.md](runs/03-eval/triage.md) · JUnit: runs/03-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/DQ-3/runs/03-eval/html`
