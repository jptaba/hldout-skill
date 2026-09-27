# Evidence pack — DEMO-505

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DEMO-505
  L3   | summary: "Practice portal — hovers, number input and notifications"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: [training, ui]
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DEMO-505
  L10  | fetchedAt: 2026-09-26T16:13:33.463Z
  L11  | ---
  L12  | 
  L13  | # DEMO-505: Practice portal — hovers, number input and notifications
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## Context
  L18  | 
● L19  | Three more training pages. Content has not finalised the notification copy yet.
  L20  | 
  L21  | ## Acceptance criteria
  L22  | 
● L23  | - **AC-1**: On the Hovers page (`/hovers`), hovering over a user's avatar reveals that user's caption, "name: user<N>" for the N-th avatar, and a "View profile" link.
● L24  | - **AC-2**: On the Inputs page (`/inputs`), the number field accepts digits (typing `42` leaves the value 42), and non-numeric characters cannot be entered (typing `abc` leaves the field empty).
● L25  | - **AC-3**: On the Notification Message page (`/notification_message_rendered`), clicking "Click here" shows an appropriate notification to the user.
  L26  | 
  L27  | ## Open questions
  L28  | 
● L29  | - Should notifications dismiss themselves automatically after a few seconds? **Content/PO to decide; not in scope for testing yet.**
  L30  | 
  L31  | ## Attachments
  L32  | 
  L33  | _None_
  L34  | 
```
