# Tasks: Phase separation of a story's evaluation

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md),
[contracts/handoffs.md](contracts/handoffs.md). Tests are part of each story (constitution IV). Each user story is
one gated commit (guardrail tier: agent files and the skill's references).

## Phase 1: Foundation

- [x] T001 [US1] Seven phase folders in `.github/scripts/core/paths.ts`: `PHASE_FOLDERS` = 1-requirement, 2-contract,
  3-tests, 4-hardening, 5-run, 6-triage, 7-verdict; `evalPaths` gains `hardening`, `hardened` (the hardener's tests),
  `hardeningLog`, `run`, `triage`, `decisions`, and `work.<phase>`; `RECORD_LAYOUT` and `homeOf` follow data-model.md
- [x] T002 [US1] `tests/` updated for the new names (paths, stray files, phases)

## Phase 2: User Story 1 — one folder per phase, agents read only their inputs (P1)

- [x] T003 [US1] Freeze keeps hashes: `authoring/integrity-check.ts` (`FrozenDraft` → file hashes and per-scenario
  assertion map; `checkIntegrity(draftDir, hardenedDir, …)` compares the kept draft with the hardened copy and
  refuses a draft whose hash moved); `authoring/integrity.ts --snapshot` copies the draft to `4-hardening/`
- [x] T004 [US1] Everything that runs or edits the tests after the freeze uses the hardened copy: `run/run.ts`,
  `run/fast-harden.ts`, `authoring/confirm.ts`, `authoring/lint.ts`, `authoring/preflight.ts`,
  `authoring/journeys/*`, `triage/record.ts`, `probe/trace.ts`, `flow/phases.ts`, `flow/advance.ts`, `report/verdict.ts`
- [x] T005 [US1] Probe log per phase: `core/probe-log.ts` writes to `4-hardening/` before the evaluation run and to
  `6-triage/` after; ids unique across both; `citeProbes` keeps a report in its own phase's folder
- [x] T006 [US1] Triage decisions in `6-triage/decisions.json`: `triage/triage.ts` writes them, the run record stays
  as run wrote it; `report/verdict.ts`, `flow/*` and `dev/score.ts` read the decisions
- [x] T007 [US1] Agent files and references name only their inputs (contracts/handoffs.md):
  `.github/agents/heldout-*.agent.md`, `.github/skills/heldout-evaluator/SKILL.md`, `references/*.md`
- [x] T008 [US1] Test: each agent file names only folders of its inputs and outputs (`tests/agent-files.test.ts`);
  tests for the copy, the integrity comparison, the per-phase probe log and the decisions file

## Phase 3: User Story 2 — lean handoffs, no leftovers (P2)

- [ ] T009 [US2] Slim run record (research D5): `triage/record.ts`, `triage/triage-model.ts`; `heldout show` reads
  the scratch raw output for the rest
- [ ] T010 [US2] Only the final evaluation run kept: hardening runs in scratch, their stability result in the log;
  a superseded evaluation run dropped (`flow/advance.ts`, `run/run.ts`)
- [ ] T011 [US2] Uncited probe reports and screenshots never reach the record; the kept index lists cited probes only
- [ ] T012 [US2] Per-phase scratch cleared at handoff (`flow/advance.ts`, `flow/prune.ts`)
- [ ] T013 [US2] Tests: a finished story's record holds only data-model.md's files
- [ ] T013b [US2] The guide (`docs/heldout-evaluator.html`): its layout tree and the paths it explains, once the
  layout is final (docs only)

## Phase 4: User Story 3 — scripts by phase (P3)

- [ ] T014 [US3] Move modules per plan.md (fetch/, contract/, hardening/, verdict/; probe/ shared) with their tests'
  imports; `heldout.ts` dispatcher table
- [ ] T015 [US3] `tests/layout.test.ts`: areas core, probe, fetch, contract, authoring, hardening, run, triage,
  verdict, flow, setup; AGENTS.md's import-order line

## Phase 5: Proof

- [ ] T016 A round from scratch on a keyed story when the owner allows tests (quickstart.md); record the numbers
