# Feature Specification: Repository cleanup

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-10-27 | **Status**: Draft

**Input**: User description: "Clean up the folders and files, including old plan md files that are not being used
by our current implementation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Only current files in the repository (Priority: P1)

A maintainer or an agent opening the repository finds only what the current implementation uses: no finished plans,
no implemented one-off contracts, no output of an old evaluation, and no rule that points at them.

**Independent Test**: no tracked file names a removed file; the suite and typecheck pass.

**Acceptance Scenarios**:

1. **Given** the finished refactoring and governance plans, **When** the cleanup lands, **Then** they are gone and
   what they left open is listed in the one backlog, `docs/next-steps.md`.
2. **Given** the implemented contracts in `docs/contracts/`, **When** the cleanup lands, **Then** they are gone, and
   the project's rules (AGENTS.md, the constitution) say a change names a spec, or a section of one (a heading or
   table row, what `agentctl verify --contract` can pin).
3. **Given** the mock tracker's tracked story and outbox from an old evaluation, **When** the cleanup lands, **Then**
   they are gone; the demo stories stay in `demo/stories/`.

### Edge Cases

- Commits gated on a removed contract still audit: `agentctl audit` reads a contract at its own commit.
- ADRs are records: one that names a removed plan "as first written" stays as it is.
- The generic agent kit (its `contract` skill, template and README) stays unchanged: it serves projects without
  Spec Kit, and a test keeps it the same in every project.

## Requirements *(mandatory)*

- **FR-001**: `docs/refactor-plan.md`, `docs/governance-plan.md` and `docs/contracts/` are removed.
- **FR-002**: `docs/next-steps.md` becomes a short backlog of what is still open, and nothing finished.
- **FR-003**: AGENTS.md and the constitution (principle III) name a spec, or a section of one, as the only
  contract; ADR 0004 records that the overlap it foresaw is retired. The constitution goes to 1.0.1: the retirement
  was decided in ADR 0004 and principle III keeps its meaning (every change is spec-driven), so no principle is
  added, removed or redefined.
- **FR-004**: Test headers that cite a removed plan say what they check without it.
- **FR-005**: `mock-jira/` is no longer tracked; it and `output/`, which only an evaluation run here would write,
  are git-ignored (rounds run in projects of their own).

## Success Criteria *(mandatory)*

- **SC-001**: No tracked file outside `docs/adr/`, `specs/` and recordings in the guide names a removed file; the
  generic kit still names `docs/contracts/` as where its `contract` skill writes.
- **SC-002**: Typecheck and the suite pass with no test removed or weakened.

## Assumptions

- Git history keeps every removed file; nothing is migrated (greenfield).
- Untracked local leftovers (`.playwright-mcp/`, an empty `.heldout/`) are removed outside the commit.
