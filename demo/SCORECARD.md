# Held-out evaluator — scorecard

Generated 2026-10-04T08:58:52.563Z by `demo/score.ts` from `demo/answer-keys/*.json` (written before each evaluation).

| Story | AUT | Expected verdict | Actual verdict | Defects found (recall) | False positives | Seeded script defects caught | Auto-triage vs confirmed decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TOOL-1 | toolshop | FAIL | _not evaluated_ | | | | |
| TOOL-2 | toolshop | FAIL | _not evaluated_ | | | | |
| TOOL-3 | toolshop | FAIL | _not evaluated_ | | | | |
| TOOL-4 | toolshop | PASS | ✅ PASS | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · abstained 0 · wrong 0 |
| TOOLB-1 | toolshop-rc | FAIL | _not evaluated_ | | | | |
| TOOLB-2 | toolshop-rc | FAIL | _not evaluated_ | | | | |
| **Total** | | | 1/1 verdicts | 0/0 (n/a) | 0 | 0/0 | 0/0 (n/a) · wrong 0 |

Precision: n/a (0 of 0 confirmed findings are real).

## TOOL-4 (toolshop)

Verdict: expected **PASS**, got **PASS** ✅ · tests 11/11 passed

_No defects expected._

False positives: none ✅

Traps in this AUT: _ACs live in a Jira custom field, not the description_; _the description says duplicates → 422; a later PO comment clarifies 409 — the contract must record the comment as the source and the conflict as a resolved gap_; _false-positive resistance: the app meets every AC_
