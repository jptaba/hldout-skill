# Feature Specification: A fresh triager decides an amendment the hardener proposes

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-10 | **Status**: Draft

**Input**: the owner (2026-11-08, confirmed 2026-11-10): the coordinator decides nothing about WHAT is correct, so the
audited amendment (`integrity --amend`: an assertion's implementation was wrong, its expected value right) is no
longer its decision. Built and reviewed on a branch that predates specs 017 and 018; this is that flow alone, on top
of them. `hardening-cases.md` also told the hardener to run `--amend`, which its agent file forbids.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Whoever fixes an assertion never approves the fix (Priority: P1)

1. **Given** the hardener has fixed an assertion's implementation, **When** it runs
   `heldout integrity KEY --propose "<assertion>" --reason "…"`, **Then** the proposal is recorded in the history
   with the assertion's draft and current text, and only for an assertion integrity lists as changed.
2. **Given** a pending proposal, **When** `advance` finds integrity not preserved (after the first hardening,
   before the evaluation run, or before a re-run), **Then** it hands the triager "Review the proposed amendment(s)
   for KEY: …"; the triager judges the change against the contract and runs `--amend` or `--reject`. A rejected
   proposal sends the hardener to restore the assertion; a change nobody proposed sends the hardener as before. During
   a repair the hand-over keeps `--rerun`.
3. **Given** no pending proposal for an assertion's current text, **Then** `--amend` and `--reject` refuse it. A
   rejection stands for the text it judged: `--propose` refuses the same change again.
4. **Given** a re-freeze (a requirement revision), **Then** the review starts anew: proposals, rejections and the
   "rejected before" list count only the history since the last freeze.
5. **Given** a changed assertion with earlier rejected changes, **Then** `heldout integrity KEY` lists them with their
   reasons ("rejected before"), and the triager weighs them.

### User Story 2 - The files say who decides (Priority: P1)

1. **Given** SKILL.md, `references/phases.md` and the coordinator agent, **Then** none tells the coordinator to
   decide or record an amendment. The hardener's file says propose, never `--amend`, `--reject` or `--snapshot`; the
   triager's says how it reviews one; governance.md's roles follow; `hardening-cases.md` and `triage.md` agree.

## Requirements *(mandatory)*

- **FR-001**: US1 and US2 as stated. No other part of SKILL.md, the setup or the phases changes.
- **FR-002**: The repair loop's bound is unchanged (`repairDue`: three repairs in a row allow one more, four end it).

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for US1.1 to US1.5 (`tests/amendment-review.test.ts`) and
  US2.1 (`tests/agent-files.test.ts`).
- **SC-002**: A round in which an amendment comes up shows it going hardener → triager.

## Assumptions

- A subagent's identity is not checked by the commands: who runs `--amend` is fixed by the agent files.
- The proposal lives in `history.jsonl` (`amend-proposed`, `amend-rejected`); `freeze.json` is unchanged, so an
  amendment already approved still survives a re-freeze and applies again to the same texts (a follow-up).
- `advance`'s wiring is checked by matching its source; no fixture runs `advance` end to end.
