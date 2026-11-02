# ADR 0005 — Answer keys name the story's text, not a criterion's number

- Status: accepted
- Date: 2026-11-02

## Context
A key lists each defect with the criteria it breaks, by number. For a story with no numbering of its own, the contract
does the numbering, and one contract numbers it differently from another. Round 41's contracts split PB-2's eight bullets
into ten criteria and TOOL-8's six into nine, so the scorecard reported defects missed that were found, and paired one
defect with a finding about something else. Matching on keywords alone was tried and rejected: two reviews measured it
reporting defects found by unrelated findings.

## Decision
- Each keyed defect gains `storyText`: words of the story, verbatim, naming the part it breaks. The scorer finds this
  contract's criteria through it: those that quote the words, else those whose cited line holds them.
- Nothing else in a key changes: defects, keywords, `criteria` and expected verdicts stay as written, and `criteria` is
  kept as the record of what the key said then. The scorer no longer reads it.
- A contract that cites no criterion for that part of the story has no match for the defect: it is reported missed, and
  says why.

## Consequences
- The score no longer depends on a contract's numbering. It still depends on how a contract splits the story: a defect
  names every sentence it breaks, so a contract that splits a line by sentence finds the criteria it belongs to.
- A keyed defect found is not proof of its finding: about one defect in three stays "found" with every finding that
  describes it removed, on one generic keyword under the right criterion, as it did before this change. The scorecard
  is a maintainer's aid; a round's report reads the pairings.
- `storyText` was written after rounds 39 to 41 had run, from each defect's description and the story, by the same
  author who read those rounds' scorecards. It can only change which criteria a defect is compared on, never what the
  defect is; the reviews of this change check each one against the story.
- A story's text changing breaks its key's `storyText`: a test says so.
