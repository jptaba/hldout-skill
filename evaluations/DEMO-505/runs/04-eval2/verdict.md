# Held-out Evaluation Verdict — DEMO-505

> **Verdict: ⚠️ PASS WITH WARNINGS** — All scenarios passed, with warnings: 1 scenario(s) needing clarification, 1 open question(s) not tested.

| | |
| --- | --- |
| Story | [DEMO-505](https://your-domain.atlassian.net/browse/DEMO-505) — Practice portal — hovers, number input and notifications |
| Application under test | The Internet (UI test playground) (profile `the-internet`) — UI https://the-internet.herokuapp.com |
| Final run | `04-eval2` · 2026-09-26T18:11:03.587Z · 5s |
| Tests | 6 total · 6 passed · 0 failed · 0 flaky · 0 skipped (from 4 scenarios) |
| Held-out integrity | ✅ PRESERVED — 5 requirement assertions identical to the pre-hardening draft |
| Hardening | Tier 3 (`inspect.ts` probes, `run.ts --capture` dry-run, `--repeat-each` stability run). Tier 1/2 browser tools were not loaded in this session. |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-26T19:20:45.279Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings: suspected application defects (0 root cause(s), 0 failing test(s))

_None — the application behaved as the requirement specifies in every executed scenario._

## Script defects found and repaired (0)

_None in the evaluation runs (mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001.1 | Hovering an avatar reveals that user's caption (avatar 1) | AC-1 | functional | ✅ passed | - |
| SCN-001.2 | Hovering an avatar reveals that user's caption (avatar 2) | AC-1 | functional | ✅ passed | - |
| SCN-001.3 | Hovering an avatar reveals that user's caption (avatar 3) | AC-1 | functional | ✅ passed | - |
| SCN-002 | The number field accepts digits | AC-2 | functional | ✅ passed | - |
| SCN-003 | The number field rejects non-numeric characters | AC-2 | negative | ✅ passed | - |
| SCN-004 | Clicking "Click here" shows a notification | AC-3 | functional | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | On the Hovers page (/hovers), hovering over a user's avatar reveals that user's caption, "name: user<N>" for the N-th avatar, and a "View profile" link. | SCN-001.1, SCN-001.2, SCN-001.3 | ✅ met |
| AC-2 | On the Inputs page (/inputs), the number field accepts digits (typing 42 leaves the value 42), and non-numeric characters cannot be entered (typing abc leaves the field empty). | SCN-002, SCN-003 | ✅ met |
| AC-3 | On the Notification Message page (/notification_message_rendered), clicking "Click here" shows an appropriate notification to the user. | SCN-004 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story AC-1 | SCN-001 Hovering an avatar reveals that user's caption | functional | ui | 3/3 | ✅ meets requirement | - |
| **AC-2** | story AC-2 | SCN-002 The number field accepts digits | functional | ui | 1/1 | ✅ meets requirement | - |
| ↳ | story AC-2 | SCN-003 The number field rejects non-numeric characters | negative | ui | 1/1 | ✅ meets requirement | - |
| **AC-3** | story AC-3 | SCN-004 Clicking "Click here" shows a notification | functional | ui | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| functional | 3 | 5 | 5 | 0 | 0 | - |
| negative | 1 | 1 | 1 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Open questions (not tested; need an answer from the PO):**

- ❓ Should notifications dismiss themselves automatically after a few seconds? (story "Open questions": Content/PO to decide; not tested.)

**Scenarios needing clarification:**

- SCN-004: Clicking "Click here" shows a notification

**Assumptions the evaluation made:**

- AC-3 "appropriate" is not defined anywhere (no approved copy for this story). Tested literally: exactly one non-empty notification appears. Tagged @needs-clarification.

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](../../requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. Script defects were repaired (mechanics only) and the full suite re-run. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 3 | 3 | 0 |
| `02-harden-check` (hardening dry-run) | 6 | 0 | 0 |
| `03-harden-stability` (hardening dry-run) | 18 | 0 | 0 |
| `04-eval2` (final) | 6 | 0 | 0 |

## Artifacts

- Requirement: [requirement/story.md](../../requirement/story.md)
- Scenarios: [scenarios.feature](../../scenarios.feature)
- Tests: [tests/](../../tests/) · frozen draft: [draft/](../../draft/)
- Hardening log: [hardening/hardening-log.md](../../hardening/hardening-log.md)
- Triage: [runs/04-eval2/triage.md](../../runs/04-eval2/triage.md) · JUnit: runs/04-eval2/junit.xml
- HTML report: `npx playwright show-report evaluations/DEMO-505/runs/04-eval2/html`
