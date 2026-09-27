# Verdict and publishing (phases 7–8)

## Render

```bash
npm run heldout -- verdict KEY [--run NN-label] [--evaluator "name"] [--exit-code]
```

The verdict uses the latest run whose label doesn't start with `harden` (override with `--run`).
`--exit-code` returns 0 for PASS / PASS_WITH_WARNINGS, 1 for FAIL and 2 for INCONCLUSIVE (CI gate).

| Verdict (recommendation) | Rule (first match wins) |
| --- | --- |
| `INCONCLUSIVE` | integrity VIOLATED (the oracle changed without an amendment or re-freeze) |
| `FAIL` | ≥ 1 application defect reproduced by the evaluator |
| `INCONCLUSIVE` | failures remain that are unconfirmed, script, environment or needs-investigation |
| `PASS_WITH_WARNINGS` | all passed, but flaky tests, uncovered ACs, clarifications or open questions remain |
| `PASS` | all passed and every AC is covered |

## What `verdict.md` contains (written for a reviewer)

1. **Header**: verdict and reason, story, AUT profile, final run, counts, integrity (with amendment
   and re-freeze counts), tiers used.
2. **Findings summary**: ID, suggested severity, criteria, **test type**, finding, tests, and a
   reviewer-decision checkbox.
3. **Each finding** (grouped by root cause):
   - requirement text and **source**
   - test type and layer
   - expected → actual per failing test
   - **how to reproduce**:
     - manual Gherkin steps
     - a **curl sequence** of the exact API requests (secrets as placeholders)
     - the single-test re-run command
   - **evidence**: inline screenshot for UI, failure context, trace, the evaluator's live re-check
   - the evaluator's analysis
   - reviewer decision: ☐ confirm · ☐ reject · ☐ clarify
4. Script defects found and repaired, audited assertion amendments, audited draft re-freezes.
5. **Test results** (test, criteria, type, result, classification).
6. **Requirement coverage** (AC → tests → met / not met).
7. **Traceability matrix**: AC → source → scenario → type → layer → tests passed → result → finding.
8. **Coverage by test type**.
9. Requirement gaps: open questions, clarifications, assumptions, link to the review.
10. Method, run history, and artifact links.

`verdict.json` has the same content in machine-readable form, including `traceability[]`,
`coverageByType[]` and each finding's `apiSequence` and `reproduce` commands.

Read the rendered file before publishing. If a rationale is thin or a title unclear, fix it with
`heldout triage --set …` and re-render. Don't hand-edit `verdict.md`; it is regenerated.

## Publish

```bash
npm run heldout -- publish KEY --dry-run   # preview the ADF comment
npm run heldout -- publish KEY
```

1. Attaches `verdict.md` as `heldout-verdict-KEY-<yyyymmddhhmm>.md`.
2. Posts an ADF summary comment: verdict (recommendation), counts, integrity, coverage by test type,
   findings table, and open questions.
3. Sets the label `heldout-<verdict>` (previous `heldout-*` labels are removed).

That is all it does. It creates no issues and changes no status or assignee: the reviewer reads
the evidence and decides. `jira-fetch` ignores the evaluator's own `heldout-verdict-*` attachments
on later fetches.

In mock mode the result is in `mock-jira/issues/KEY/ISSUE_VIEW.md` (rendered like the issue page),
`issue.json`, and `mock-jira/outbox/*.http` (the exact REST requests Jira Cloud would have
received). Publishing to a real Jira is outward-facing: confirm with the user before running it in
cloud mode.
