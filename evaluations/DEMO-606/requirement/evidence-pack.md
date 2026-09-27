# Evidence pack — DEMO-606

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DEMO-606
  L3   | summary: "Practice portal — notification copy"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: [training, ui]
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DEMO-606
  L10  | fetchedAt: 2026-09-26T16:13:34.761Z
  L11  | ---
  L12  | 
  L13  | # DEMO-606: Practice portal — notification copy
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## Context
  L18  | 
● L19  | Content has now approved the notification copy for the Notification Message page. The server picks one of the outcomes at random on each request, and **every** message shown must be approved copy.
  L20  | 
  L21  | ## Acceptance criteria
  L22  | 
● L23  | - **AC-1**: On the Notification Message page (`/notification_message_rendered`), each click on "Click here" shows exactly one notification, and its text is one of the approved messages in `ux-copy.md`.
● L24  | - **AC-2**: Across repeated clicks, both outcomes (success and failure) can occur.
  L25  | 
  L26  | ## Attachments
  L27  | 
  L28  | | File | MIME | Bytes | How to read | Local path |
  L29  | | --- | --- | --- | --- | --- |
  L30  | | ux-copy.md | text/markdown | 238 | text — read directly | attachments/ux-copy.md |
  L31  | 
```

## attachments/ux-copy.md

```text
  L1   | # Notification copy (approved by Content, v1)
  L2   | 
● L3   | | Outcome | Message |
  L4   | | --- | --- |
● L5   | | Success | Action successful |
● L6   | | Failure | Action unsuccessful, please try again |
  L7   | 
● L8   | A close icon (×) may follow the message; it is not part of the copy.
  L9   | 
```
