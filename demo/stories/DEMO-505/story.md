# DEMO-505: Practice portal — hovers, number input and notifications

## Context

Three more training pages. Content has not finalised the notification copy yet.

## Acceptance criteria

- **AC-1**: On the Hovers page (`/hovers`), hovering over a user's avatar reveals that user's caption, "name: user<N>" for the N-th avatar, and a "View profile" link.
- **AC-2**: On the Inputs page (`/inputs`), the number field accepts digits (typing `42` leaves the value 42), and non-numeric characters cannot be entered (typing `abc` leaves the field empty).
- **AC-3**: On the Notification Message page (`/notification_message_rendered`), clicking "Click here" shows an appropriate notification to the user.

## Open questions

- Should notifications dismiss themselves automatically after a few seconds? **Content/PO to decide; not in scope for testing yet.**
