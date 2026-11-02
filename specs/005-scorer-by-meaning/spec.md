# Feature Specification: A scorecard that says what it can't match

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-02 | **Status**: Draft

**Input**: Round 41's scorecard said PB-2 9/11 with 4 false positives, TOOL-8 1/4 with 3 and PB-1 5/6, though by hand every
keyed defect was found. A key numbers a story's criteria its own way and a contract its own, and the matcher needs a
shared number. Matching on keywords alone was tried and rejected: two reviews showed it reports defects found by
findings about something else (22 of 63 more with their real finding removed, 22 of 60 more against another story's
key). Also, two scripts that enforce held-out rules are reviewed once only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The score never flatters, and a numbering miss is visible (Priority: P1)

A maintainer reads a round's scorecard: what it counts is matched on the key's criteria, and a defect it can't match
names the finding to read by hand.

**Independent Test**: the scorer on the kept rounds 39, 40 and 41.

**Acceptance Scenarios**:

1. **Given** any round, **Then** the counts of defects found and false positives are what the existing matcher gives.
2. **Given** a defect reported missed, **When** a finding names one of its keywords in what it is about (its title, its
   tests' titles as they ran), **Then** the row names the finding most about it, and the summary says how many missed
   defects to read by hand.
3. **Given** a false positive named so, **Then** its line says so.
4. **Given** a keyword inside another ("bill pay" in "bill payment"), or inside a longer word ("date" in "validated"),
   **Then** it doesn't count towards the finding to read.
5. **Given** an answer key, **Then** it isn't changed.

### User Story 2 - What enforces a held-out rule takes two reviews (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a change to `hardening/confirm.ts` or `core/probe-log.ts`, **Then** `agentctl` tiers it as guardrail.

## Requirements *(mandatory)*

- **FR-001**: `matchDefects` is unchanged; `toCheck` in `dev/score-match.ts` and the scorecard do US1.2 to 1.4.
- **FR-002**: The two scripts are in the guardrail tier (`.agents/config.json`).
- **FR-003**: `specs/004-lean-context/tasks.md` ticks its finished tasks, stating what round 41 missed, and
  `docs/next-steps.md` holds the figures it points to.

## Success Criteria *(mandatory)*

- **SC-001**: On rounds 39, 40 and 41 the counts equal those of the matcher at HEAD; on round 41 every missed defect names
  a finding that, read by hand, is that defect or says it needs another look.
- **SC-002**: Typecheck and the suite pass; no existing matcher test is changed.

## Assumptions

- The cause stays: a key can't say which criterion of a contract a defect belongs to. Anchoring keys to the story's lines
  would remove it, and needs an ADR and new pins (`docs/next-steps.md`).
- Round 41's report gives hand counts beside the scorecard's.
