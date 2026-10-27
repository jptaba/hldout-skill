# Feature Specification: Phase separation of a story's evaluation

**Feature Branch**: `master` (no feature branches: constitution VI)

**Created**: 2026-10-26

**Status**: Draft

**Input**: User description: "(1) each phase produces only the file(s) the next agent or step uses; (2) each phase
keeps as few files as possible, with no noise, so no agent reads unnecessary context; (3) scripts and output
subfolders are separated by phase."

## Phases and their handoffs

A story's evaluation is a chain of phases. Each phase has one producer and hands the next ones a small, fixed set of
files; nothing else it made outlives it.

| # | Phase | Producer | Hands off | Read by |
| --- | --- | --- | --- | --- |
| 1 | Requirement | fetch (script) | the evidence pack: the story, its criteria, linked pages and image transcripts, numbered | contract extractor, contract reviewer |
| 2 | Contract | extractor, then reviewer | the contract; the review record (read by the checks, never by an agent) | test author, hardener, triager, verdict |
| 3 | Tests | test author | the draft tests and their data; the freeze record (script) | hardener, integrity check |
| 4 | Hardening | hardener | the hardened tests; the hardening log (resolved gaps, observed deviations, stability); the probe reports the log cites | run, triager, verdict |
| 5 | Run | run (script) | the evaluation run's record | triager, verdict |
| 6 | Triage | triager | the decisions; the probe reports they cite | verdict |
| 7 | Verdict | verdict (script) | the verdict | the owner, Jira |

The story's history (one line per step, for `status` and `stats`) stays beside the phases.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Each phase writes one folder, each agent reads only its inputs (Priority: P1)

A maintainer (or the evaluator) runs a story end to end. Every phase writes into its own folder, and each agent is
pointed at exactly the handoff files of the phases before it that it needs, as the table says.

**Why this priority**: it is the separation itself; the other stories trim and reorganise around it.

**Independent Test**: evaluate one keyed story; check that each phase folder holds only that phase's handoff, that
each agent's instructions name no file outside its inputs, and that the verdict scores as before.

**Acceptance Scenarios**:

1. **Given** a story after hardening, **When** its folders are listed, **Then** the hardener's output (tests it
   changed, its log, its probe reports) sits in the hardening phase, and the test author's draft is unchanged in the
   tests phase.
2. **Given** a story after triage, **When** its folders are listed, **Then** the triager's decisions and probe
   reports sit in the triage phase, apart from the hardening phase's.
3. **Given** any agent's instructions, **When** the files they tell it to read are listed, **Then** each is a handoff
   of an earlier phase from the table, and the held-out rules still hold (the test author never sees the
   application, the hardener's run results, the triage or an answer key).

---

### User Story 2 - Lean handoffs and no leftovers (Priority: P2)

Each handoff holds what its readers use and nothing else, and a phase's working files (raw tool output, rendered
views, probe reports nobody cites, superseded runs) are gone once the phase hands off.

**Why this priority**: the token cost of every later agent and of the kept record is set by these files.

**Independent Test**: evaluate a story the size of round 38's PB-2 and compare the kept record and each agent's input
with round 38's.

**Acceptance Scenarios**:

1. **Given** a finished story, **When** its record is listed, **Then** it holds only the handoff files of the table
   and the history.
2. **Given** a probe report no decision or log cites, **When** its phase hands off, **Then** it is not kept.
3. **Given** the run record, **When** the triager reads it, **Then** each failure carries what triage uses (the
   failing step and assertion, the error, the evidence locations) and a passing test carries no evidence.

---

### User Story 3 - Scripts arranged by phase (Priority: P3)

A maintainer looking for what a phase does finds its scripts in one place named after the phase; the scripts every
phase uses (paths, configuration, history, the probe tools) sit apart as shared.

**Why this priority**: it eases maintenance; it changes no behaviour.

**Independent Test**: list the scripts folder and the import graph; every command still runs with the same flags.

**Acceptance Scenarios**:

1. **Given** the scripts folder, **When** listed, **Then** there is one folder per phase plus shared and setup ones.
2. **Given** a phase's scripts, **When** their imports are checked, **Then** they import shared code and earlier
   phases only, never a later phase.

### Edge Cases

- A story re-fetched after a requirement change: the later phases' handoffs are marked stale, as today.
- A repair after triage (script defect): the hardener changes the hardening phase's tests; the earlier evaluation
  run's record is superseded and not kept.
- An audited amendment of a frozen assertion: recorded with the freeze record, still checkable.
- A story stopped part-way: the phases finished so far keep their handoffs; working files stay until the phase
  completes or is pruned.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A story's record MUST have one folder per phase of the table, holding only that phase's handoff files.
- **FR-002**: A phase MUST NOT write into another phase's folder; the hardener's and triager's output MUST be kept
  apart, and the test author's draft MUST stay as frozen.
- **FR-003**: Each agent's instructions MUST name only the handoffs of the table it reads; tests MUST check this.
- **FR-004**: Working files MUST live in a per-phase scratch area and MUST be removed when the phase hands off (or
  when the story completes), unless the project keeps scratch on purpose.
- **FR-005**: A probe report MUST be kept only when a kept log or decision cites it.
- **FR-006**: The run record MUST carry evidence only for failing tests, and only what triage and the verdict use.
- **FR-007**: Superseded runs (hardening runs, an evaluation run replaced by a later one) MUST NOT be kept; the
  hardening log MUST state the stability proof.
- **FR-008**: The freeze record MUST hold only what the integrity check needs beside the kept draft.
- **FR-009**: Scripts MUST be grouped by phase, with shared code apart; a phase MUST NOT import a later phase.
- **FR-010**: Every command, flag and held-out rule MUST keep working; folder names stay in one place (the paths
  module) as today.

### Key Entities

- **Phase**: a step of the chain with one producer, its own record folder and scratch area.
- **Handoff file**: a kept file a later phase or the owner reads.
- **Working file**: anything else a phase makes; never kept past the phase.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A finished story the size of round 38's PB-2 keeps at most 40% of that story's bytes (about 2.1 MB) and
  only the handoff files of the table.
- **SC-002**: The triager and hardener read at least 50% fewer bytes of handoff input than in round 38.
- **SC-003**: Every agent instruction file names no file outside its inputs (a test, zero exceptions).
- **SC-004**: A re-evaluation of a keyed story scores as before: the same verdict, recall and false positives.

## Assumptions

- Greenfield: existing round projects are not migrated; a story evaluated before this change is re-evaluated.
- The verdict keeps a machine-readable form, since publishing and scoring read it.
- The journeys registry stays per application, outside a story's phases.
- Proof of agent-facing changes is a round (constitution IV); it runs when the owner allows tests again.
