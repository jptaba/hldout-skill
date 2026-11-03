# Feature Specification: A hardener that reads less

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-03 | **Status**: Draft

**Input**: round 43 showed sessions cost more than they save, because reading at the start is what fills a hardener: round
42's reached 114k of its 218k peak before its first real probe, the whole spec among it, and each of round 43's sessions
spent 60k to 80k the same way. The owner decided: remove the sessions (`specs/008-hardening-sessions`), keep the
application map, and work on what a hardener reads.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One session again, reading what its work needs (Priority: P1)

**Independent Test**: tests of the files; a round of PB-2 from scratch.

**Acceptance Scenarios**:

1. **Given** any story, **Then** hardening is one session; nothing of the plan, its view or its `probe` label's preflight
   exception is left; the sum per session in `dev/context.ts` stays.
2. **Given** a hardener, **Then** it opens a test only for a mark in it, when a run or a probe sends it there, or to tell a
   call under test from a precondition. What a test's text used to show it comes another way: a requirement's words from
   a search of the contract, tags from a search of the spec. After a repair the stability proof is the first run's passes
   plus re-runs, with the same flags, of what failed on a mechanic and what calls a changed journey.
3. **Given** a case only some stories meet (the Playwright MCP tier, a rate-limited host, an amendment, a revised
   requirement), **Then** it is in `hardening-cases.md`, which `hardening.md` points to by case; nothing of the old
   reference is lost.
4. **Given** a hardener that adds no journey, **Then** it has no reason to read `journeys.md`.

## Requirements *(mandatory)*

- **FR-001**: WHAT vs HOW and the rest of the held-out rules stay as they are: `hardening.md` keeps the deviations, the
  map's rule and the stability proof.

## Success Criteria *(mandatory)*

- **SC-001**: In a round of PB-2 from scratch, against round 42's one session: context before the first real probe at most
  70k (114k), peak at most 150k (218k), sum at most 5M (7.47M).
- **SC-002**: The verdict stays as keyed, integrity PRESERVED, no script defect after the evaluation run that reading a
  test earlier would have prevented.
- **SC-003**: Typecheck and the suite pass.

## Assumptions

- A round's tests differ from the last round's, so one round's figures are indicative. Rounds 42 and 43 varied by about 2
  in the number of tests.
