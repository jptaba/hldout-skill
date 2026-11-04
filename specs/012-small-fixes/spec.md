# Feature Specification: Small fixes from the next steps

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-04 | **Status**: Draft

**Input**: `docs/next-steps.md`. Two of its rows turned out to be out of date when checked: no subagent transcript of this project repeats a text block under one message id, and the demo holds no journeys. They go without a change.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The rows that remain (Priority: P1)

**Independent Test**: unit tests, and the references read.

**Acceptance Scenarios**:

1. **Given** a spec with a backtick in a string, a line comment, a one-line block comment or a block comment's starred line, **Then** the outline's ranges aren't misled by it.
2. **Given** a top-level declaration holding a multi-line literal, whatever its first line ends in, **Then** the outline gives it all its lines.
3. **Given** a walk with `--vars-from`, on `inspect` or `mcp-probe` as they share how a walk gets its values, **Then** a later walk `--from` it inherits those values too; `--var` wins over a chain's, a chain's over the walk's. `inspect --save` keeps no value that looks like a secret, by its name, its field or being a token, and neither does a chain; so none reaches a later walk's log. The match is wide on purpose: a value wrongly left out is said, for `inspect`, and can be given again.
4. **Given** a test author comparing a date with today, or a hardener reading an answer's date, **Then** the reference says which zone counts, so nobody moves a date helper by hand.
5. **Given** a regex with a backslash under Git Bash, **Then** `probes.md` says it goes in a step file.
6. **Given** `GOVERNANCE.md`, **Then** no line runs over 120 characters.

## Requirements *(mandatory)*

- **FR-001**: Each of US1.1 to 1.6 as stated; nothing else changes. No held-out rule is weakened: the date rule names no application and gives no expected value.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for US1.1 to 1.3; US1.4 is shown by a round.
