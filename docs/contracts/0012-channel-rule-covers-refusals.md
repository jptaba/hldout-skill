# Contract 0012 — A rule naming channels covers a feature's refusals too

## Inputs
- Round 38, TOOL-8 (scored 3 of 4 defects): the story says adding a product line works "in the admin area and
  through the API" (a rule, R1), and that a product without a brand or category is refused with a message saying which
  one. The test author tested the refusals through the API only, reading R1 as covering the successes. The missed
  defect (D4, found by round 33's second evaluation) is in the admin area: the product form sends nothing and says
  nothing when the brand or the category is not chosen.

## Outputs
- `references/test-authoring.md`, rule 1: a rule or criterion that names the channels a feature works in governs every
  criterion it reaches, its refusals included, with a test per channel in the matching `@layer`. A criterion giving
  only one channel's form of a refusal does not confine it; only a rule or criterion saying so does. A stated refusal
  message is asserted untagged in each channel on the requirement's own words; only an unstated wording or place
  stays an open question.

## Proof
- The project's proof steps (`agentctl verify --contract docs/contracts/0012-channel-rule-covers-refusals.md`).
- Round 38's TOOL-9, a story whose defects did not shape this change and whose criteria are stated for the web shop
  and the API both: its tests check each refusal in both channels.
- A later re-run of TOOL-8 shows the admin-area refusal tested.

## Done when
- The reference says so, and no command or flag it names is new.

## Bad result looks like
- A test author told to test what the requirement doesn't imply; any other rule changed.
