# Feature Specification: One hardening session per domain

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-03 | **Status**: Removed by `specs/010-hardener-reads-less`: round 43 missed SC-001 (largest peak 143k against 109k, sum 9.62M against 7.47M)

**Input**: round 42's PB-2 hardener reached 114k of its 218k peak before its first real probe, by reading: the references,
every journey file and the whole of the 96,000-character spec. Its output over the whole session is 51k tokens, so the earlier reading ("about 116k is thinking", `docs/next-steps.md`) was wrong: characters
underestimate tokens in code. One session holds all of a story, and every turn pays for all it has read.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A large story is hardened a domain at a time (Priority: P1)

**Independent Test**: unit tests of the plan and the view; a round of PB-2 from scratch.

**Acceptance Scenarios**:

1. **Given** a frozen story whose guesses sit in two or more journey domains and which holds at least 20 of them, **When**
   `advance` reaches hardening, **Then** it names one session per domain holding guesses, those most tests use first,
   and a last session once none are left, and records the plan.
2. **Given** any other story, **Then** hardening is one session, as before.
3. **Given** a domain session, **Then** `heldout show KEY spec --domain D` lists only the tests that use that domain's
   journeys, directly or through other journeys.
4. **Given** a domain whose guesses were not all settled, **Then** `advance` names that domain again.
5. **Given** a planned story, **When** a session fills in the log's tiers before a stability run (a harden run with repeats
   and a result), **Then** hardening is not done; a trial run labelled `probe` passes the preflight with guesses left
   and is no such run.
6. **Given** a session's end, **Then** the next one learns what it found from the application map, the probe log and the
   hardening log, not from a message.

## Requirements *(mandatory)*

- **FR-001**: The plan comes from the files on disk, so a session can pick the story up anywhere.
- **FR-002**: A domain session works on that domain only and proves no stability. The last session resolves what gaps are
  left and the spec's own marks, proves stability, and finishes the log.
- **FR-003**: The repair loop after triage stays as it is; the path with no hardener stays too, and never takes a planned
  story over.
- **FR-004**: `dev/context.ts` also reports the sum of a session's context over its turns, what the turns pay for.

## Success Criteria *(mandatory)*

- **SC-001**: In a round of PB-2 from scratch, every session's peak is at most half of round 42's 218k, and the sum of
  all its sessions' context over their turns is lower than that single session's 7.47M.
- **SC-002**: The verdict stays as keyed, integrity PRESERVED, the same defects are found, and script defects after the
  evaluation run are no more than round 42's 0.
- **SC-003**: Typecheck and the suite pass.

## Assumptions

- Each session starts cold (estimated at about 36k: instructions, its references and the tools). 20 guesses is a first
  guess at where that starts to pay; the round reports what it costs.
- A guess a session can't settle (a test blocked for a missing account) names its domain again without limit, as one
  session would have stayed open before; whoever runs `advance` sees it.
- A domain is a file of `journeys/fixtures/`, as the rest of the skill has it.
