---
key: DEMO-404
summary: "Practice portal — sign-in and interactive widgets"
type: Story
status: Ready for QA
priority: High
labels: [training, ui]
source: mock-jira
url: https://your-domain.atlassian.net/browse/DEMO-404
fetchedAt: 2026-09-26T16:14:00.996Z
---

# DEMO-404: Practice portal — sign-in and interactive widgets

## Description

## Context

The practice portal is a catalogue of small interactive pages that our support staff use for training. This story defines how the sign-in flow and the most-used widgets behave. Exact copy is in `ux-copy.md`.

## Acceptance criteria

### Secure area

- **AC-1**: On the Login page (`/login`), signing in with the training account from `test-accounts.csv` opens the Secure Area (`/secure`), with the heading "Secure Area" and the message "You logged into a secure area!".
- **AC-2**: An unknown username shows "Your username is invalid!"; a known username with a wrong password shows "Your password is invalid!". In both cases the user stays on the Login page.
- **AC-3**: Logging out returns to the Login page with "You logged out of the secure area!". Opening `/secure` while signed out shows the Login page with "You must login to view the secure area!".

### Widgets

- **AC-4**: On the Checkboxes page (`/checkboxes`), checkbox 1 is initially unchecked and checkbox 2 is initially checked. Clicking a checkbox toggles it.
- **AC-5**: On the Dropdown page (`/dropdown`), the options are "Please select an option" (preselected and not selectable), "Option 1" and "Option 2". Choosing "Option 2" makes it the selected option.
- **AC-6**: On Dynamic Loading example 2 (`/dynamic_loading/2`), after pressing "Start" the text "Hello World!" is rendered within 10 seconds.
- **AC-7**: On the JavaScript Alerts page (`/javascript_alerts`), accepting the JS Alert shows "You successfully clicked an alert". Dismissing the JS Confirm shows "You clicked: Cancel". Entering text in the JS Prompt and accepting it shows "You entered: <text>".
- **AC-8**: On the Data Tables page (`/tables`), clicking the "Last Name" header of the first table once sorts its rows by last name, ascending.
- **AC-9**: On Add/Remove Elements (`/add_remove_elements/`), each press of "Add Element" adds one "Delete" button. Each press of a "Delete" button removes that button.
- **AC-10**: On Key Presses (`/key_presses`), pressing a key while the input is focused shows "You entered: <KEY>" (for example `TAB` for the Tab key, `A` for A).

## Attachments

| File | MIME | Bytes | How to read | Local path |
| --- | --- | --- | --- | --- |
| ux-copy.md | text/markdown | 686 | text — read directly | attachments/ux-copy.md |
| test-accounts.csv | text/csv | 115 | text — read directly | attachments/test-accounts.csv |
