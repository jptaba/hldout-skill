# Feature Specification: Say what was left out

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-04 | **Status**: Draft

**Input**: the reviews of `specs/012-small-fixes`: the secret check is wide on purpose, so a value it wrongly leaves out must be said, and a value nobody gave must not be typed into a page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - No silent loss (Priority: P1)

**Independent Test**: a chain against a local server; unit tests.

**Acceptance Scenarios**:

1. **Given** a chain that saves a value that looks like a secret, **Then** its report has a line naming it, and that line holds no value. What the rest of a report shows of an answer is unchanged (`docs/next-steps.md`).
2. **Given** an `inspect` step holding `${var:name}` with no value, **Then** the step fails saying so, as `mcp-probe` does, instead of typing the text into the page.

## Requirements *(mandatory)*

- **FR-001**: US1.1 and US1.2 as stated; nothing else changes.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for both; US1.2's wiring by a source check, as a live walk needs a browser.
