# Feature Specification: The small gaps rounds 42 and 43 found

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-03 | **Status**: Draft

**Input**: `docs/next-steps.md`: what agents had to work around in rounds 42 and 43.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fewer workarounds (Priority: P1)

**Independent Test**: unit tests; the next round reads the rest.

**Acceptance Scenarios**:

1. **Given** a mechanic about a step ("a walk goes on with no login step"), **Then** the map takes it; what a call lets
   through ("needs no sign-in") is still refused.
2. **Given** a run whose failures make more than 40 distinct calls, **Then** triage still writes the replay chain, the first
   40 with how many it left out, instead of nothing.
3. **Given** a `heldout run` of a story still running, **When** another starts, **Then** it is refused and names the
   other's process; a lock whose process is gone is taken over.
4. **Given** a test of a refusal's reason, **Then** the test-authoring reference says the check needs the refusal first, so
   a word in a successful answer can't pass it.
5. **Given** a planned story, **Then** the reference carries the last session's rule, and a session told integrity is
   violated may also report an assertion whose implementation is wrong.

## Requirements *(mandatory)*

- **FR-001**: Each of US1.1 to 1.5 as stated; nothing else changes.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with a test for US1.1 to 1.3.

## Assumptions

- That more than 40 calls is why rounds 42 and 43 got no chain is read from the code: the scratch areas are gone. The next
  large story shows it.
