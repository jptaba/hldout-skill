# Tasks: Lean agent context

**Input**: [spec.md](spec.md). One gated commit (guardrail: two reviews), then a round.

## Phase 1: The report

- [x] T001 FR-001: `dev/context.ts`, with `tests/context.test.ts`
- [x] T002 The baseline of rounds 38 and 40 from the report, in `docs/next-steps.md`

## Phase 2: The views

- [x] T003 FR-002: `heldout show KEY spec [--test]` (`authoring/spec-model.ts`, `flow/show.ts`), with tests
- [x] T004 FR-003: `heldout show KEY triage --group N`, the group in `heldout triage`'s output
  (`triage/triage-report.ts`, `triage/triage.ts`, `flow/show.ts`), with tests

## Phase 3: The instructions

- [x] T005 FR-005: `references/probes.md` and `references/accounts.md`; every mention moved
- [x] T006 FR-004: the three agents and `references/triage.md`, `hardening.md` name the views

## Phase 4: Screenshots

- [x] T007 FR-007: the failure screenshot in the fixtures, with `tests/record-trim.test.ts`
- [x] T008 FR-008: the verdict keeps it (`verdict/verdict.ts`)

## Phase 5: Round 41's fixes, before its next story

- [x] T010 The report counts a call written twice once (`dev/context.ts`): the baseline was double-counted
- [x] T011 The hardener starts from the outline, as a step: it read the file though its inputs said not to
- [x] T012 A journey's path with no leading slash is a declared endpoint (`matchEndpoint`): 42 of PB-2's automatic classes
  were false script defects

## Phase 6: Proof

- [x] T009 A round from scratch on PB-2, TOOL-8 and PB-1; the report and the sizes against round 38's (round 41: SC-001
  and SC-002 missed, SC-003 and SC-005 in part; see `docs/next-steps.md`)
