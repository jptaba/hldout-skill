# Feature Specification: Lean agent context

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-01 | **Status**: Draft

**Input**: `specs/001-phase-separation` SC-002 is still unmet: the triager and hardener read about as much as in round
38 (peaks of 160k–260k tokens in round 40). In round 40 a triager read the whole spec file (20–28k tokens), the whole
triage report up to four times (15–26k), the whole `contract.json` (13k), the whole `probes.jsonl` (14k) and the
hardening reference for one table (up to 11k). The commands that give a part of these exist or are close, but the
agents' instructions name the whole files. Nothing measures this except a throwaway script.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A maintainer sees what each agent took in (Priority: P1)

After a round, a maintainer gets per agent: context at start and at peak, turns, and what filled it, by kind and by the
largest items.

**Independent Test**: run the report on a fixture transcript and on rounds 38 and 40.

**Acceptance Scenarios**:

1. **Given** a session's subagent transcripts, **When** the report runs, **Then** each agent has a row (start, peak,
   turns) and its input split into instructions, handoffs, journeys and support, live probes, its own writing, and
   images (counted, not measured as text), with the largest items and how many times each was read.
2. **Given** an agent app whose transcripts it can't read, **Then** it says so and does nothing else.

### User Story 2 - Agents read one test and one failure group at a time (Priority: P1)

The triager and the hardener read the part of a handoff they are working on.

**Independent Test**: a round from scratch on PB-2, TOOL-8 and PB-1, with the report against round 38's.

**Acceptance Scenarios**:

1. **Given** a story's tests, **When** `heldout show KEY spec` runs, **Then** it prints each test's id, tags, title and
   line range, and the file's top-level declarations with theirs, from the hardened copy, or the draft before there is
   one.
2. **Given** a test id (or a table's case id), **When** `heldout show KEY spec --test SCN-n` runs, **Then** it prints
   that test's numbered lines and where the declarations it uses are.
3. **Given** a run with failures, **When** `heldout show KEY triage --group N` runs, **Then** it prints that group of
   "Failures that look alike" as the report has it, and `heldout triage` prints which group each failure is in.
4. **Given** the agent instructions, **Then** the triager goes through groups, tests, contract parts and probes with
   these views, the hardener works from the outline and reads ranges, and neither is told to read a whole handoff.

### User Story 3 - References load only what the agent needs (Priority: P2)

**Acceptance Scenarios**:

1. **Given** the triager, **Then** it reads `triage.md` and a new `probes.md` (how to compose probes, the inspector's
   steps), not `hardening.md`.
2. **Given** the test author, **Then** it doesn't read the accounts setup: that is a new `accounts.md`, for the hardener
   and onboarding. It looks up the fixtures in the reference's table rather than reading their source.

### User Story 4 - A failed page test's picture is small and still readable (Priority: P3)

`specs/003-lean-record` SC-001 is met by TOOL-8 only (PB-2 53%, PB-1 82%). The screenshots a verdict shows are the
largest part left of a record, 418–570 KB a story; they are lossless where a compressed picture reads the same. Agents
that open a screenshot gain too, so it ships with this spec, measured by the same round.

**Acceptance Scenarios**:

1. **Given** a test that used a page and failed, **When** the run ends, **Then** its evidence holds a compressed
   screenshot of the page at the failure, under the same name in the record as before.
2. **Given** a passing test, or a test that never opened a page, **Then** no screenshot is taken.
3. **Given** a finding about a page, **When** the verdict is written, **Then** its folder keeps the picture in its own
   format, `verdict.md` shows it, and an earlier rendering's picture it no longer shows is removed.

### Edge Cases

- A page that has crashed or closed: no screenshot, and the test's own failure stays what the run reports.
- A table's cases share one block: `SCN-7.2` shows the block of `SCN-7`, with its rows and loop.
- A test id or group that doesn't exist: the error lists the ones that do.
- A report with no group of two still numbers its groups.
- A transcript line that isn't JSON, or a subagent with no metadata, is skipped, not fatal.

## Requirements *(mandatory)*

- **FR-001**: `dev/context.ts` reports per agent as in US1, on a session's transcripts (the latest by default),
  filtered by description. Maintainer-only; it needs no new dependency.
- **FR-002**: `heldout show KEY spec [--test SCN-n]` as in US2.1–2.
- **FR-003**: `heldout show KEY triage --group N`, and the group of each failure in `heldout triage`'s output. Both use
  the report's grouping; its links read from the project's folder.
- **FR-004**: The hardener's, triager's and test author's instructions, and the references, name these views as in
  US2.4 and US3. Every command they name exists (`tests/agent-files.test.ts`).
- **FR-005**: `references/probes.md` and `references/accounts.md` hold what moved, with no text left twice; every
  mention elsewhere points to the new place.
- **FR-006**: Who may see what doesn't change: each agent's views show only what it could already read.
- **FR-007**: The test fixtures take the failure screenshot, compressed, attached as `screenshot`; Playwright's own is
  off (`heldout-support/fixtures.ts`, `playwright.config.ts`). No image library: the browser that holds the page writes
  it.
- **FR-008**: The verdict keeps a screenshot under its source's extension and removes unshown ones of any image kind
  (`verdict/verdict.ts`).

## Success Criteria *(mandatory)*

- **SC-001**: In a round from scratch, the triagers and hardeners of PB-2, TOOL-8 and PB-1 take in at least 50% less
  of the handoff kind than in round 38, with the same verdicts and defects found, and no more false positives.
- **SC-002**: Their peak context falls by at least 20%. Their own writing and live probes are the work and stay.
- **SC-003**: The test authors take in at least 30% less of instructions and support.
- **SC-004**: Typecheck and the suite pass; each change has a test.
- **SC-005**: PB-2 and TOOL-8 keep a record at most 50% of round 38's, and PB-1 at most 70% (its round 38 had 33 tests
  against 50 now), and the screenshots the verdicts show are readable.

## Assumptions

- The report reads Claude Code's transcripts. GitHub Copilot's cost reporting is already an open item in
  `docs/next-steps.md`; the views and instructions serve both apps.
- A test's numbered lines are enough to edit it: an agent's file tool reads a range before changing it.
- Peak context also holds the model's thinking, which the transcripts don't show.
