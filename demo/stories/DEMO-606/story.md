# DEMO-606: Practice portal — notification copy

## Context

Content has now approved the notification copy for the Notification Message page. The server picks one of the outcomes at random on each request, and **every** message shown must be approved copy.

## Acceptance criteria

- **AC-1**: On the Notification Message page (`/notification_message_rendered`), each click on "Click here" shows exactly one notification, and its text is one of the approved messages in `ux-copy.md`.
- **AC-2**: Across repeated clicks, both outcomes (success and failure) can occur.
