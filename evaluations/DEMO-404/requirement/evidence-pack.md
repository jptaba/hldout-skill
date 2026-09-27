# Evidence pack — DEMO-404

Cite sources as `<file>#L<n>` or `<file>#L<n>-L<m>`. Every line marked ● must be accounted for in the contract's `coverage` ledger
(captured as a criterion / rule / endpoint / error / auth / test data / context, or dismissed as not a requirement, with a reason).


## story.md

```text
  L1   | ---
  L2   | key: DEMO-404
  L3   | summary: "Practice portal — sign-in and interactive widgets"
  L4   | type: Story
  L5   | status: Ready for QA
  L6   | priority: High
  L7   | labels: [training, ui]
  L8   | source: mock-jira
  L9   | url: https://your-domain.atlassian.net/browse/DEMO-404
  L10  | fetchedAt: 2026-09-26T16:14:00.996Z
  L11  | ---
  L12  | 
  L13  | # DEMO-404: Practice portal — sign-in and interactive widgets
  L14  | 
  L15  | ## Description
  L16  | 
  L17  | ## Context
  L18  | 
● L19  | The practice portal is a catalogue of small interactive pages that our support staff use for training. This story defines how the sign-in flow and the most-used widgets behave. Exact copy is in `ux-copy.md`.
  L20  | 
  L21  | ## Acceptance criteria
  L22  | 
  L23  | ### Secure area
  L24  | 
● L25  | - **AC-1**: On the Login page (`/login`), signing in with the training account from `test-accounts.csv` opens the Secure Area (`/secure`), with the heading "Secure Area" and the message "You logged into a secure area!".
● L26  | - **AC-2**: An unknown username shows "Your username is invalid!"; a known username with a wrong password shows "Your password is invalid!". In both cases the user stays on the Login page.
● L27  | - **AC-3**: Logging out returns to the Login page with "You logged out of the secure area!". Opening `/secure` while signed out shows the Login page with "You must login to view the secure area!".
  L28  | 
  L29  | ### Widgets
  L30  | 
● L31  | - **AC-4**: On the Checkboxes page (`/checkboxes`), checkbox 1 is initially unchecked and checkbox 2 is initially checked. Clicking a checkbox toggles it.
● L32  | - **AC-5**: On the Dropdown page (`/dropdown`), the options are "Please select an option" (preselected and not selectable), "Option 1" and "Option 2". Choosing "Option 2" makes it the selected option.
● L33  | - **AC-6**: On Dynamic Loading example 2 (`/dynamic_loading/2`), after pressing "Start" the text "Hello World!" is rendered within 10 seconds.
● L34  | - **AC-7**: On the JavaScript Alerts page (`/javascript_alerts`), accepting the JS Alert shows "You successfully clicked an alert". Dismissing the JS Confirm shows "You clicked: Cancel". Entering text in the JS Prompt and accepting it shows "You entered: <text>".
● L35  | - **AC-8**: On the Data Tables page (`/tables`), clicking the "Last Name" header of the first table once sorts its rows by last name, ascending.
● L36  | - **AC-9**: On Add/Remove Elements (`/add_remove_elements/`), each press of "Add Element" adds one "Delete" button. Each press of a "Delete" button removes that button.
● L37  | - **AC-10**: On Key Presses (`/key_presses`), pressing a key while the input is focused shows "You entered: <KEY>" (for example `TAB` for the Tab key, `A` for A).
  L38  | 
  L39  | ## Attachments
  L40  | 
  L41  | | File | MIME | Bytes | How to read | Local path |
  L42  | | --- | --- | --- | --- | --- |
  L43  | | ux-copy.md | text/markdown | 686 | text — read directly | attachments/ux-copy.md |
  L44  | | test-accounts.csv | text/csv | 115 | text — read directly | attachments/test-accounts.csv |
  L45  | 
```

## attachments/test-accounts.csv

```text
● L1   | role,username,password,notes
● L2   | trainee,tomsmith,SuperSecretPassword!,Public training account shown on the login page
  L3   | 
```

## attachments/ux-copy.md

```text
  L1   | # Practice portal — approved copy
  L2   | 
● L3   | | Where | Copy |
  L4   | | --- | --- |
● L5   | | Secure Area heading | Secure Area |
● L6   | | Sign-in success | You logged into a secure area! |
● L7   | | Unknown username | Your username is invalid! |
● L8   | | Wrong password | Your password is invalid! |
● L9   | | Sign-out | You logged out of the secure area! |
● L10  | | Secure area while signed out | You must login to view the secure area! |
● L11  | | Dynamic loading result | Hello World! |
● L12  | | JS Alert accepted | You successfully clicked an alert |
● L13  | | JS Confirm dismissed | You clicked: Cancel |
● L14  | | JS Prompt accepted | You entered: <text> |
● L15  | | Key press | You entered: <KEY> |
  L16  | 
● L17  | Messages may be followed by a close icon (×), which is not part of the copy.
  L18  | 
```
