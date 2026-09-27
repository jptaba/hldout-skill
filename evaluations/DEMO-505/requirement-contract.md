# Requirement contract — DEMO-505: Practice portal — hovers, number input and notifications

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:42

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | context (L19), AC-1..AC-3 (L23-L25), open question on auto-dismiss (L29); no attachments (L33) |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | On the Hovers page (/hovers), hovering over a user's avatar reveals that user's caption, "name: user<N>" for the N-th avatar, and a "View profile" link. | hovering over the N-th avatar reveals the caption "name: user<N>" for that avatar; hovering over the N-th avatar reveals a "View profile" link for that avatar; the caption and the "View profile" link are revealed by the hover (not shown for that avatar before it is hovered) | story.md#L23 |
| AC-2 | ui | On the Inputs page (/inputs), the number field accepts digits (typing 42 leaves the value 42), and non-numeric characters cannot be entered (typing abc leaves the field empty). | typing 42 into the number field leaves the value 42; typing abc into the number field leaves the field empty | story.md#L24 |
| AC-3 | ui | On the Notification Message page (/notification_message_rendered), clicking "Click here" shows an appropriate notification to the user. | after clicking "Click here" a notification is shown to the user | story.md#L25 |

## Test data

none needed — the three pages are static public pages of the AUT; no accounts or seeded data

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | What counts as "an appropriate notification" in AC-3 (its text/copy, type or tone): the story gives no expected content, and L19 says Content has not finalised the notification copy yet. Only the literal part of AC-3 (a notification is shown after the click) is testable; the "appropriate" part cannot be judged, so AC-3 must be @needs-clarification. Marked non-blocking because the literal part can still be evaluated; it is the first question for the user/PO. | oracle | no | AC-3 | story → attachments → user | open |
| G2 | Which characters count as "non-numeric" in AC-2 beyond the stated example `abc` (e.g. sign "-"/"+", decimal point ".", exponent "e", mixed input such as "4a2"), and what "accepts digits" means for such mixed input. The story only fixes the two examples (42 → 42, abc → empty); only those are asserted. | oracle | no | AC-2 | story → attachments → user | open |
| G3 | Whether the AC-3 notification dismisses itself automatically after a few seconds — an open question in the story, explicitly "not in scope for testing yet" (Content/PO to decide). Not tested; nothing is asserted about the notification persisting or disappearing. | oracle | no | AC-3 | story → attachments | open |
| G4 | Origin of the practice portal (the story gives only relative page paths /hovers, /inputs, /notification_message_rendered) | mechanics | yes | AC-1, AC-2, AC-3 | story → attachments → config | found-in-config: https://the-internet.herokuapp.com |
| G5 | Which avatars exist on /hovers (the range of N for "the N-th avatar") and how an avatar and its own caption / link are located | mechanics | yes | AC-1 | story → attachments → aut | discovered-in-aut: 3 avatars, each in its own .figure container (img 'User Avatar'); hover the N-th figure's image and look for the caption and 'View profile' link inside that same figure (N = 1..3). The count is a test-data mechanic only, not an expected value. |
| G6 | Where the notification of AC-3 appears on the page (how to locate it) | mechanics | yes | AC-3 | story → attachments → aut | discovered-in-aut: the notification is the #flash element (no ARIA alert role) |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19 | context G1 | "Three more training pages" is context; "Content has not finalised the notification copy yet" is why AC-3's "appropriate notification" has no oracle (G1) |
| story.md#L23 | AC-1 |  |
| story.md#L24 | AC-2 |  |
| story.md#L25 | AC-3 |  |
| story.md#L29 | out-of-scope G3 | open question on auto-dismiss, explicitly not in scope for testing yet |
