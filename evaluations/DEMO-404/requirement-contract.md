# Requirement contract — DEMO-404: Practice portal — sign-in and interactive widgets

_Built by the evaluator from the story and its attachments. Every criterion is quoted from a cited line, every source line is accounted for, every expected value is grounded in the sources, and an independent reviewer checked it._

**Independent review:** ❌ open findings — heldout-contract-reviewer (Claude Sonnet 5), 2026-09-27T00:42

## Sources read

| Source | Contributes |
| --- | --- |
| story.md | context and pointer to the approved copy (L19); AC-1…AC-10 with the page routes (L25-L37). No comments. |
| attachments/test-accounts.csv | the training account used for sign-in: trainee tomsmith / SuperSecretPassword! (L1-L2) |
| attachments/ux-copy.md | approved copy for every message in AC-1, AC-2, AC-3, AC-6, AC-7, AC-10 (L3-L15), identical to the story; rule that a trailing close icon (×) is not part of the copy (L17) |

## Acceptance criteria

| AC | Layer | Criterion | Observable outcomes | Source |
| --- | --- | --- | --- | --- |
| AC-1 | ui | On the Login page (/login), signing in with the training account from test-accounts.csv opens the Secure Area (/secure), with the heading "Secure Area" and the message "You logged into a secure area!". | after signing in with the training account the Secure Area (/secure) is open; the heading "Secure Area" is shown; the message "You logged into a secure area!" is shown (a trailing × is not part of the copy, R2) | story.md#L25 |
| AC-2 | ui | An unknown username shows "Your username is invalid!"; a known username with a wrong password shows "Your password is invalid!". In both cases the user stays on the Login page. | an unknown username shows "Your username is invalid!"; a known username with a wrong password shows "Your password is invalid!"; in both cases the user stays on the Login page (/login) and does not reach the Secure Area | story.md#L26 |
| AC-3 | ui | Logging out returns to the Login page with "You logged out of the secure area!". Opening /secure while signed out shows the Login page with "You must login to view the secure area!". | logging out returns to the Login page (/login); after logging out the message "You logged out of the secure area!" is shown; opening /secure while signed out shows the Login page (/login); the message "You must login to view the secure area!" is shown | story.md#L27 |
| AC-4 | ui | On the Checkboxes page (/checkboxes), checkbox 1 is initially unchecked and checkbox 2 is initially checked. Clicking a checkbox toggles it. | on load checkbox 1 is unchecked; on load checkbox 2 is checked; clicking checkbox 1 checks it; clicking checkbox 2 unchecks it | story.md#L31 |
| AC-5 | ui | On the Dropdown page (/dropdown), the options are "Please select an option" (preselected and not selectable), "Option 1" and "Option 2". Choosing "Option 2" makes it the selected option. | the options are "Please select an option", "Option 1" and "Option 2" (no others); "Please select an option" is the selected option on load; "Please select an option" is not selectable (the user cannot choose it); after choosing "Option 2", "Option 2" is the selected option | story.md#L32 |
| AC-6 | ui | On Dynamic Loading example 2 (/dynamic_loading/2), after pressing "Start" the text "Hello World!" is rendered within 10 seconds. | after pressing "Start" the text "Hello World!" is rendered within 10 seconds | story.md#L33 |
| AC-7 | ui | On the JavaScript Alerts page (/javascript_alerts), accepting the JS Alert shows "You successfully clicked an alert". Dismissing the JS Confirm shows "You clicked: Cancel". Entering text in the JS Prompt and accepting it shows "You entered: <text>". | accepting the JS Alert shows "You successfully clicked an alert"; dismissing the JS Confirm shows "You clicked: Cancel"; entering text in the JS Prompt and accepting it shows "You entered: <text>", where <text> is the text entered | story.md#L34 |
| AC-8 | ui | On the Data Tables page (/tables), clicking the "Last Name" header of the first table once sorts its rows by last name, ascending. | after clicking the "Last Name" header of the first table once, the rows of the first table are in ascending order of last name | story.md#L35 |
| AC-9 | ui | On Add/Remove Elements (/add_remove_elements/), each press of "Add Element" adds one "Delete" button. Each press of a "Delete" button removes that button. | each press of "Add Element" adds exactly one "Delete" button (n presses give n "Delete" buttons); each press of a "Delete" button removes that button (one fewer "Delete" button each time) | story.md#L36 |
| AC-10 | ui | On Key Presses (/key_presses), pressing a key while the input is focused shows "You entered: <KEY>" (for example TAB for the Tab key, A for A). | pressing the Tab key while the input is focused shows "You entered: <KEY>" with <KEY> = TAB; pressing A while the input is focused shows "You entered: <KEY>" with <KEY> = A | story.md#L37 |

## Rules and boundaries

- **R1** Exact copy is in ux-copy.md: every message the criteria name must match the approved copy exactly _(story.md#L19)_
- **R2** Messages may be followed by a close icon (×), which is not part of the copy _(attachments/ux-copy.md#L17)_

## Authentication

form sign-in on the Login page (/login) with the training account; the browser session keeps the user signed in until logging out — credentials: trainee account tomsmith / SuperSecretPassword! (public training account) _(attachments/test-accounts.csv#L2)_

## Test data

None created. Sign-in uses the pre-existing public training account from test-accounts.csv (tomsmith / SuperSecretPassword!). AC-2's unknown username is a run-unique name that is not in test-accounts.csv; its wrong password is the training password with extra characters appended. AC-7's prompt text is a run-chosen string. Widget pages need no data.
- every test starts from a fresh browser context (signed out)
- AC-6 waits up to the stated 10 seconds for "Hello World!", not a shorter default expect timeout
- message comparisons ignore a trailing close icon × (R2) and surrounding whitespace, nothing else
- the AUT's load event can hang on third-party assets (AUT profile note): navigation waits for DOMContentLoaded
- Cleanup: none needed (nothing is created; sign-out is part of AC-3 only)

## Gaps

| Gap | Missing element | Kind | Required | Affects | Ladder tried | Resolution |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | origin (host) of the practice portal; the story gives page routes only | mechanics | yes | * | story → attachments → config | found-in-config: https://the-internet.herokuapp.com (UI only) |
| G2 | how to sign in and out and where the sign-in messages appear: sign-in form field labels and submit control, the logout control on the Secure Area, the element that carries the flash message | mechanics | yes | AC-1, AC-2, AC-3 | story → attachments → aut | discovered-in-aut: Login page textboxes "Username" / "Password" + button "Login"; Secure Area link "Logout"; flash message element #flash (plain text, not role=alert; trailing × link); Secure Area heading matched exactly (h2) |
| G3 | how the widget controls and result texts are identified on each widget page (checkbox order, dropdown control, Start button, JS dialog triggers and result line, first table and its header, key-press input and result line) | mechanics | yes | AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10 | story → attachments → aut | discovered-in-aut: checkboxes by page order; #dropdown combobox; button "Start"; buttons "Click for JS Alert" / "Click for JS Confirm" / "Click for JS Prompt" with result #result; first table #table1, columnheader "Last Name"; buttons "Add Element" / "Delete"; key input #target with result #result |
| G4 | how <KEY> is named for keys other than the two documented examples (TAB for the Tab key, A for A) | oracle | no | AC-10 | story → attachments | open: evaluate AC-10 only with the documented examples (Tab → TAB, A → A); naming for other keys is unspecified |

## Coverage ledger (every source line accounted for)

| Lines | Captured as | Note |
| --- | --- | --- |
| story.md#L19 | context R1 | purpose of the portal (context) and the pointer that exact copy is in ux-copy.md (R1) |
| story.md#L25 | AC-1 |  |
| story.md#L26 | AC-2 |  |
| story.md#L27 | AC-3 |  |
| story.md#L31 | AC-4 |  |
| story.md#L32 | AC-5 |  |
| story.md#L33 | AC-6 |  |
| story.md#L34 | AC-7 |  |
| story.md#L35 | AC-8 |  |
| story.md#L36 | AC-9 |  |
| story.md#L37 | AC-10 G4 | criterion; its examples (TAB, A) are the only key names given, other keys are G4 |
| attachments/test-accounts.csv#L1 | test-data | CSV header: role, username, password, notes |
| attachments/test-accounts.csv#L2 | test-data auth AC-1 | the training account (tomsmith / SuperSecretPassword!) that AC-1 signs in with; also the known username for AC-2's wrong-password case |
| attachments/ux-copy.md#L3 | context | table header (Where \| Copy) of the approved copy |
| attachments/ux-copy.md#L5-L6 | AC-1 | Secure Area heading and sign-in success copy, identical to story L25 |
| attachments/ux-copy.md#L7-L8 | AC-2 | unknown username / wrong password copy, identical to story L26 |
| attachments/ux-copy.md#L9-L10 | AC-3 | sign-out / signed-out Secure Area copy, identical to story L27 |
| attachments/ux-copy.md#L11 | AC-6 | dynamic loading result copy, identical to story L33 |
| attachments/ux-copy.md#L12-L14 | AC-7 | JS Alert / Confirm / Prompt copy, identical to story L34 |
| attachments/ux-copy.md#L15 | AC-10 | key press copy, identical to story L37 |
| attachments/ux-copy.md#L17 | R2 |  |
