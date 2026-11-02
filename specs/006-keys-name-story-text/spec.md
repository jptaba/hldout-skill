# Feature Specification: Answer keys that name the story's text

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-02 | **Status**: Draft

**Input**: `specs/005-scorer-by-meaning` left the cause open: a key says which criterion a defect breaks by number, and each
contract numbers an unnumbered story its own way. Round 41's counts are wrong because of it (PB-2 9/11 with 4 false
positives, TOOL-8 1/4 with 3), and so are its pairings (TOOL-8's D1 beside the search finding). ADR 0005 records the
decision.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A score that doesn't depend on a contract's numbering (Priority: P1)

**Independent Test**: the scorer on the kept rounds 39, 40 and 41; each pairing read against the story.

**Acceptance Scenarios**:

1. **Given** a keyed defect, **Then** it names verbatim words of its story (`storyText`), and a test holds them to the story.
2. **Given** a contract, **When** the scorer pairs a defect, **Then** it compares this contract's criteria that quote those
   words, or else those whose cited line holds them.
3. **Given** a finding and a keyword, **Then** matching stays as before, with its tests' titles as they ran among the
   finding's words.
4. **Given** a contract that cites no criterion for that part of the story, **Then** the defect is reported missed and says
   why.
5. **Given** a defect still missed, **Then** the scorecard names the finding to read (`specs/005-scorer-by-meaning`).

## Requirements *(mandatory)*

- **FR-001**: Every keyed defect has `storyText`; nothing else in a key changes; new pins in the same commit, with ADR 0005.
- **FR-002**: `dev/score-match.ts` and `dev/score.ts` do US1.2 to 1.4.

## Success Criteria *(mandatory)*

- **SC-001**: On rounds 39, 40 and 41 every keyed defect pairs with a finding that, read by hand, describes it, and
  verdicts stay as keyed.
- **SC-002**: With every finding that really describes a defect removed (labelled by hand), the share still reported
  found is no higher than under the matcher of `specs/005-scorer-by-meaning`, and scored against another story's key no
  defect is found (a release candidate that repeats a story's text, TOOLB-1 and TOOLB-2, is the same story). The share
  over the defects each scorer reports, as the counts differ: 20 of 57 before.
- **SC-003**: Typecheck and the suite pass; no existing matcher test is changed.

## Assumptions

- `storyText` was written after those rounds; ADR 0005 says so, and the reviews check each against the story.
- A second finding on the same part of the story with no keyword still shows as a false positive: read by hand it may be a
  split of one defect.
