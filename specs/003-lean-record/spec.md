# Feature Specification: A leaner story record

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-10-28 | **Status**: Draft

**Input**: Round 39 missed `specs/001-phase-separation` SC-001 (a record at most 40% of round 38's): PB-2 59%, TOOL-8
53%, PB-1 93%. What is left is screenshots nobody shows, response headers nobody reads, and probe digests repeated
beside the reports they summarise.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The record keeps only what its readers use (Priority: P1)

A reviewer, or the next agent, opens a story's record and finds only files and fields something reads.

**Independent Test**: a round from scratch on PB-2, TOOL-8 and PB-1; each record's size against round 38's.

**Acceptance Scenarios**:

1. **Given** a finding about an API call, **When** the verdict is written, **Then** no screenshot of it is kept:
   `verdict.md` shows screenshots of page findings only, and `verdict.json` names the same ones. A screenshot left
   from an earlier rendering of the verdict is removed.
2. **Given** a failed test's API calls, **When** the run record is written, **Then** every call other than the one
   the failure is about keeps only the response headers that say what the answer is (`content-type`, `location`).
3. **Given** a probe whose report the record keeps, **When** the record is tidied before the verdict, **Then** its log
   line keeps the first line of its digest (the report has the rest) and its input (for probes built on it).

### Edge Cases

- A finding with no screenshot (an API finding) still renders; `verdict.json` says `null`.
- The call a failure is about keeps all its headers: it is the evidence.

## Requirements *(mandatory)*

- **FR-001**: Screenshots kept with the verdict are those `verdict.md` shows (`verdict/verdict.ts`).
- **FR-002**: Calls other than the failure's keep `content-type` and `location` of their response headers
  (`run/record.ts`).
- **FR-003**: A cited probe's log line keeps one digest line (`core/probe-log.ts`, `trimProbeLogs`).

## Success Criteria *(mandatory)*

- **SC-001**: In a round from scratch, PB-2, TOOL-8 and PB-1 each keep a record at most 50% of round 38's (3,582,
  3,045 and 1,346 KB), with the same verdicts and defects found.
- **SC-002**: Typecheck and the suite pass; each change has a test.

## Assumptions

- Screenshot format and size are Playwright's; changing them is a separate decision.
- What agents read (their context) is a separate spec; this one is about what is kept.
