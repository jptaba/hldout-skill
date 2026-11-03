# Feature Specification: More small gaps agents worked around

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-03 | **Status**: Draft

**Input**: `docs/next-steps.md`: tool gaps from rounds 39 to 44 and the reviews' notes on `specs/009-round-43-gaps`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fewer workarounds (Priority: P1)

**Independent Test**: unit and command tests.

**Acceptance Scenarios**:

1. **Given** `show KEY contract` with `--ac` twice, **Then** it shows both criteria.
2. **Given** `inspect --probe` with `${var:name}`, **Then** it is filled as in a step; a secret's reference is not, as a
   locator's text can come back in the report.
3. **Given** `contract --resolve-from` with a refused citation in any gap, **Then** no report is kept and nothing is written, and each gap's evidence is judged on its own.
4. **Given** a refused `heldout run`, **Then** the refusal says how to clear the lock; of several runs taking over a dead run's lock, one wins.
5. **Given** a replay chain that leaves calls out, **Then** its note names them.
6. **Given** a parallel step of a chain, **Then** the report lists each answer that differs from the first.

## Requirements *(mandatory)*

- **FR-001**: Each of US1.1 to 1.6 as stated; nothing else changes.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with a test for each; US1.2 only as far as a source check, as a live walk needs a browser.
