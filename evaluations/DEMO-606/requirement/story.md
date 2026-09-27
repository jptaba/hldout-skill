---
key: DEMO-606
summary: "Practice portal — notification copy"
type: Story
status: Ready for QA
priority: High
labels: [training, ui]
source: mock-jira
url: https://your-domain.atlassian.net/browse/DEMO-606
fetchedAt: 2026-09-26T16:13:34.761Z
---

# DEMO-606: Practice portal — notification copy

## Description

## Context

Content has now approved the notification copy for the Notification Message page. The server picks one of the outcomes at random on each request, and **every** message shown must be approved copy.

## Acceptance criteria

- **AC-1**: On the Notification Message page (`/notification_message_rendered`), each click on "Click here" shows exactly one notification, and its text is one of the approved messages in `ux-copy.md`.
- **AC-2**: Across repeated clicks, both outcomes (success and failure) can occur.

## Attachments

| File | MIME | Bytes | How to read | Local path |
| --- | --- | --- | --- | --- |
| ux-copy.md | text/markdown | 238 | text — read directly | attachments/ux-copy.md |
