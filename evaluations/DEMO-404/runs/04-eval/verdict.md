# Held-out Evaluation Verdict — DEMO-404

> **Verdict: ❔ INCONCLUSIVE** — 7 failure(s) not attributable to the application yet (unconfirmed, script, environment or needs investigation).

| | |
| --- | --- |
| Story | [DEMO-404](https://your-domain.atlassian.net/browse/DEMO-404) — Practice portal — sign-in and interactive widgets |
| Application under test | The Internet (UI test playground) (profile `the-internet`) — UI https://the-internet.herokuapp.com |
| Final run | `04-eval` · 2026-09-26T16:29:08.260Z · 252s |
| Tests | 15 total · 8 passed · 7 failed · 0 flaky · 0 skipped (from 11 scenarios) |
| Held-out integrity | ✅ PRESERVED — 21 requirement assertions identical to the pre-hardening draft |
| Hardening | Tier 3 (bundled `inspect.ts` probes, `run.ts --capture` dry-run, `run.ts --repeat-each` stability runs). Tier 1/2 browser tools were not loaded in this session. |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-26T16:33:24.738Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (0)

_None in the evaluation runs (mechanics fixed during hardening are in the hardening log)._

## Other findings (7)

| Test | Status | Classification | Detail |
| --- | --- | --- | --- |
| SCN-002.2 | failed | NEEDS_INVESTIGATION (unconfirmed) | Open the trace; find the last completed step; re-inspect live. |
| SCN-007 | failed | NEEDS_INVESTIGATION (unconfirmed) | Open the trace; find the last completed step; re-inspect live. |
| SCN-008.1 | failed | NEEDS_INVESTIGATION (unconfirmed) | Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION. |
| SCN-009 | failed | NEEDS_INVESTIGATION (unconfirmed) | Replay the journey live to this step. If the page is in the expected state but the element is simply named/structured differently → SCRIPT. If the app never reached the state or the required element/feature is absent → APPLICATION. |
| SCN-010 | failed | NEEDS_INVESTIGATION (unconfirmed) | Open the trace; find the last completed step; re-inspect live. |
| SCN-011.1 | failed | NEEDS_INVESTIGATION (unconfirmed) | Probe the locator at this step: if it matches an empty/unrelated element while the expected text is elsewhere → SCRIPT; if the expected text is truly absent → APPLICATION. |
| SCN-011.2 | failed | NEEDS_INVESTIGATION (unconfirmed) | Probe the locator at this step: if it matches an empty/unrelated element while the expected text is elsewhere → SCRIPT; if the expected text is truly absent → APPLICATION. |

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | The trainee signs in to the Secure Area | AC-1 | functional | ✅ passed | - |
| SCN-002.1 | Wrong credentials are refused with a specific message (an unknown username) | AC-2 | negative | ✅ passed | - |
| SCN-002.2 | Wrong credentials are refused with a specific message (the trainee with a wrong password) | AC-2 | negative | ❌ failed | NEEDS_INVESTIGATION (auto) |
| SCN-003 | Logging out returns to the Login page | AC-3 | functional | ✅ passed | - |
| SCN-004 | The Secure Area is not reachable while signed out | AC-3 | security | ✅ passed | - |
| SCN-005 | Checkboxes start in the documented state and toggle | AC-4 | functional | ✅ passed | - |
| SCN-006 | The dropdown offers the documented options | AC-5 | functional | ✅ passed | - |
| SCN-007 | Dynamically loaded content appears within 10 seconds | AC-6 | functional | ❌ failed | NEEDS_INVESTIGATION (auto) |
| SCN-008.1 | JavaScript dialogs report the user's choice (alert) | AC-7 | functional | ❌ failed | NEEDS_INVESTIGATION (auto) |
| SCN-008.2 | JavaScript dialogs report the user's choice (confirm) | AC-7 | functional | ✅ passed | - |
| SCN-008.3 | JavaScript dialogs report the user's choice (prompt) | AC-7 | functional | ✅ passed | - |
| SCN-009 | One click on "Last Name" sorts the first table ascending | AC-8 | functional | ❌ failed | NEEDS_INVESTIGATION (auto) |
| SCN-010 | Elements are added and removed one at a time | AC-9 | functional | ❌ failed | NEEDS_INVESTIGATION (auto) |
| SCN-011.1 | Key presses are reported (Tab) | AC-10 | functional | ❌ failed | NEEDS_INVESTIGATION (auto) |
| SCN-011.2 | Key presses are reported (A) | AC-10 | functional | ❌ failed | NEEDS_INVESTIGATION (auto) |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | On the Login page (/login), signing in with the training account from test-accounts.csv opens the Secure Area (/secure), with the heading "Secure Area" and the message "You logged into a secure area!". | SCN-001 | ✅ met |
| AC-2 | An unknown username shows "Your username is invalid!"; a known username with a wrong password shows "Your password is invalid!". In both cases the user stays on the Login page. | SCN-002.1, SCN-002.2 | ❔ inconclusive |
| AC-3 | Logging out returns to the Login page with "You logged out of the secure area!". Opening /secure while signed out shows the Login page with "You must login to view the secure area!". | SCN-003, SCN-004 | ✅ met |
| AC-4 | On the Checkboxes page (/checkboxes), checkbox 1 is initially unchecked and checkbox 2 is initially checked. Clicking a checkbox toggles it. | SCN-005 | ✅ met |
| AC-5 | On the Dropdown page (/dropdown), the options are "Please select an option" (preselected and not selectable), "Option 1" and "Option 2". Choosing "Option 2" makes it the selected option. | SCN-006 | ✅ met |
| AC-6 | On Dynamic Loading example 2 (/dynamic_loading/2), after pressing "Start" the text "Hello World!" is rendered within 10 seconds. | SCN-007 | ❔ inconclusive |
| AC-7 | On the JavaScript Alerts page (/javascript_alerts), accepting the JS Alert shows "You successfully clicked an alert". Dismissing the JS Confirm shows "You clicked: Cancel". Entering text in the JS Prompt and accepting it shows "You entered: <text>". | SCN-008.1, SCN-008.2, SCN-008.3 | ❔ inconclusive |
| AC-8 | On the Data Tables page (/tables), clicking the "Last Name" header of the first table once sorts its rows by last name, ascending. | SCN-009 | ❔ inconclusive |
| AC-9 | On Add/Remove Elements (/add_remove_elements/), each press of "Add Element" adds one "Delete" button. Each press of a "Delete" button removes that button. | SCN-010 | ❔ inconclusive |
| AC-10 | On Key Presses (/key_presses), pressing a key while the input is focused shows "You entered: <KEY>" (for example TAB for the Tab key, A for A). | SCN-011.1, SCN-011.2 | ❔ inconclusive |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story AC-1, ux-copy.md, test-accounts.csv | SCN-001 The trainee signs in to the Secure Area | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-2** | story AC-2, ux-copy.md | SCN-002 Wrong credentials are refused with a specific message | negative | ui | 1/2 | ❔ inconclusive | - |
| **AC-3** | story AC-3, ux-copy.md | SCN-003 Logging out returns to the Login page | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-3, ux-copy.md | SCN-004 The Secure Area is not reachable while signed out | security | ui | 1/1 | ✅ meets requirement | - |
| **AC-4** | story AC-4 | SCN-005 Checkboxes start in the documented state and toggle | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-5** | story AC-5 | SCN-006 The dropdown offers the documented options | functional | ui | 1/1 | ✅ meets requirement | - |
| **AC-6** | story AC-6, ux-copy.md | SCN-007 Dynamically loaded content appears within 10 seconds | functional | ui | 0/1 | ❔ inconclusive | - |
| **AC-7** | story AC-7, ux-copy.md | SCN-008 JavaScript dialogs report the user's choice | functional | ui | 2/3 | ❔ inconclusive | - |
| **AC-8** | story AC-8 | SCN-009 One click on "Last Name" sorts the first table ascending | functional | ui | 0/1 | ❔ inconclusive | - |
| **AC-9** | story AC-9 | SCN-010 Elements are added and removed one at a time | functional | ui | 0/1 | ❔ inconclusive | - |
| **AC-10** | story AC-10, ux-copy.md | SCN-011 Key presses are reported | functional | ui | 0/2 | ❔ inconclusive | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| functional | 9 | 12 | 6 | 6 | 0 | - |
| negative | 1 | 2 | 1 | 1 | 0 | - |
| security | 1 | 1 | 1 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Assumptions the evaluation made:**

- Messages may carry a trailing close icon (ux-copy.md), so messages are asserted with "contains".

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 10 | 5 | 0 |
| `02-harden-stability` (hardening dry-run) | 106 | 14 | 0 |
| `03-harden-stability` (hardening dry-run) | 75 | 0 | 0 |
| `04-eval` (final) | 8 | 7 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/04-eval/triage.md](../../runs/04-eval/triage.md) · JUnit: runs/04-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/DEMO-404/runs/04-eval/html`
