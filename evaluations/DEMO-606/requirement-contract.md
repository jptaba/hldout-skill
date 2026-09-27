# Requirement contract — DEMO-606: Practice portal — notification copy

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-26T00:00

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | context and rule R1 (L19), AC-1 (L23), AC-2 (L24) |
| attachments/ux-copy.md | approved copy table (header L3; R2 values at L5-L6) and the close-icon rule (R3, L8) |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | On the Notification Message page (/notification_message_rendered), each click on "Click here" shows exactly one notification, and its text is one of the approved messages in ux-copy.md. | each click on "Click here" shows exactly one notification; on every click, the notification text (close icon × excluded) is one of the approved messages: "Action successful" or "Action unsuccessful, please try again" | story.md#L23 |
| AC-2 | ui | Across repeated clicks, both outcomes (success and failure) can occur. | across repeated clicks on "Click here", the success outcome ("Action successful") occurs at least once; across repeated clicks on "Click here", the failure outcome ("Action unsuccessful, please try again") occurs at least once | story.md#L24 |

## Rules and boundaries

- **R1** The server picks one of the outcomes at random on each request, and every message shown must be approved copy. _(story.md#L19)_
- **R2** Approved notification copy: Success → "Action successful"; Failure → "Action unsuccessful, please try again". _(attachments/ux-copy.md#L5-L6)_
- **R3** A close icon (×) may follow the message; it is not part of the copy. _(attachments/ux-copy.md#L8)_

## Test data

no data setup is stated in the sources and no AC needs pre-existing data: the server picks one of the outcomes at random on each request, so each click on "Click here" yields a fresh outcome

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | locator of the notification element and of its close icon on the Notification Message page | mechanics | yes | AC-1, AC-2 | story → attachments → aut | discovered-in-aut: notification = locator('#flash') (one element); close icon = link '×' inside it, stripped before comparing text; trigger = getByRole('link', { name: 'Click here' }) |
| G2 | how to wait for the outcome after each click | mechanics | yes | AC-1, AC-2 | story → attachments → aut → config | discovered-in-aut: each click triggers a full page reload; wait for DOMContentLoaded (not the load event) before reading the notification |
| G3 | origin (base URL) of the application under test | mechanics | yes | AC-1, AC-2 | story → attachments → config | found-in-config: https://the-internet.herokuapp.com (page: https://the-internet.herokuapp.com/notification_message_rendered) |
| G4 | how many clicks to sample for "each click" (AC-1) and "repeated clicks" (AC-2): the outcome is random and the story gives no number | oracle | yes | AC-1, AC-2 | story → attachments → config → user | assumed: sample 12 clicks per test; AC-1 is checked on every one of the 12, AC-2 passes if each outcome appears at least once within the 12 (evaluator's sampling choice, not a requirement value) |
| G5 | how an outcome (success / failure) is recognised for AC-2, and whether a notification whose text matches no approved message counts as an occurrence of either outcome | oracle | yes | AC-2 | story → attachments → config → user | assumed: an outcome is recognised by its approved message from ux-copy.md: success = "Action successful", failure = "Action unsuccessful, please try again" (close icon × excluded); a notification matching neither message counts as neither outcome (it is an AC-1 failure) |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19 | R1 | also context: random outcome per request |
| story.md#L23 | AC-1 |  |
| story.md#L24 | AC-2 |  |
| attachments/ux-copy.md#L3-L6 | R2 | approved copy table: L3 is the Outcome/Message header, L5 the Success row, L6 the Failure row (the values of R2) |
| attachments/ux-copy.md#L8 | R3 |  |
