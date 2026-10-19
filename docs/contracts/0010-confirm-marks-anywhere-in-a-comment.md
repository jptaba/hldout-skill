# Contract 0010 — `heldout confirm` removes a mark wherever it sits in a comment

## Inputs
- Round 38, TOOL-3 (tool gap noted by the hardener): `heldout confirm` removed only TODO(harden) marks that start a
  comment; one in the middle of a comment line was left and had to be removed by hand. Every other command counts a
  mark anywhere in the file, so `confirm` left the draft looking unhardened.

## Outputs
- `withoutMarks()` (authoring/confirm.ts): every mark in a line comment or a block comment goes, with the rest of its
  comment line; a `//` with nothing left goes too, a block comment keeps its `*/`, an emptied `/* */` goes, and a line
  that held only the mark goes. A mark outside a comment (in code or a string) is left and named, for a hand edit.
  The code itself never changes.

## Proof
- `tests/confirm.test.ts`: a mark on its own line, after code, mid-comment, in a JSDoc line and in an inline block
  comment; a mark in a string left and counted.
- The project's proof steps (`agentctl verify --contract docs/contracts/0010-confirm-marks-anywhere-in-a-comment.md`).

## Done when
- No TODO(harden) in a comment survives `heldout confirm`.

## Bad result looks like
- Any code changed; a comment's other text lost before the mark.
