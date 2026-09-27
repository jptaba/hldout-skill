# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-404\tests\demo-404.spec.ts >> DEMO-404 Practice portal — sign-in and interactive widgets >> SCN-002.2: Wrong credentials are refused with a specific message (the trainee with a wrong password)
- Location: evaluations\DEMO-404\tests\demo-404.spec.ts:83:5

# Error details

```
Error: [REQ AC-2] the trainee with a wrong password message

expect(locator).toContainText(expected) failed

Locator: getByRole('alert')
Expected substring: "Your password is invalid!"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - [REQ AC-2] the trainee with a wrong password message getByRole('alert') with timeout 5000ms
  - waiting for getByRole('alert')

```

```yaml
- text:  Your password is invalid!
- link "×":
  - /url: "#"
- link "Fork me on GitHub":
  - /url: https://github.com/tourdedave/the-internet
  - img "Fork me on GitHub"
- heading "Login Page" [level=2]
- heading "This is where you can log into the secure area. Enter tomsmith for the username and password for the password. If the information is wrong you should see error messages." [level=4]:
  - text: This is where you can log into the secure area. Enter
  - emphasis: tomsmith
  - text: for the username and
  - emphasis: password
  - text: for the password. If the information is wrong you should see error messages.
- text: Username
- textbox "Username"
- text: Password
- textbox "Password"
- button " Login"
- separator
- text: Powered by
- link "Elemental Selenium":
  - /url: http://elementalselenium.com/
```

# Test source

```ts
  1   | /**
  2   |  * Held-out acceptance tests for DEMO-404 — "Practice portal — sign-in and interactive widgets".
  3   |  * Generated from evaluations/DEMO-404/scenarios.feature (requirement + attachments only). UI only.
  4   |  */
  5   | import type { Page } from '@playwright/test';
  6   | import { test, expect, type TestData } from '../../../heldout-support/fixtures';
  7   | 
  8   | // @req-constants-start — expected outcomes copied verbatim from DEMO-404 + ux-copy.md (never edit during hardening)
  9   | const REQ = {
  10  |   SECURE_HEADING: 'Secure Area',
  11  |   MSG: {
  12  |     SIGNED_IN: 'You logged into a secure area!',
  13  |     BAD_USER: 'Your username is invalid!',
  14  |     BAD_PASSWORD: 'Your password is invalid!',
  15  |     SIGNED_OUT: 'You logged out of the secure area!',
  16  |     MUST_LOGIN: 'You must login to view the secure area!',
  17  |   },
  18  |   DROPDOWN_OPTIONS: ['Please select an option', 'Option 1', 'Option 2'],
  19  |   DYNAMIC_TEXT: 'Hello World!',
  20  |   DYNAMIC_MAX_MS: 10_000,
  21  |   DIALOGS: [
  22  |     { kind: 'alert', button: 'Click for JS Alert', accept: true, result: 'You successfully clicked an alert' },
  23  |     { kind: 'confirm', button: 'Click for JS Confirm', accept: false, result: 'You clicked: Cancel' },
  24  |     { kind: 'prompt', button: 'Click for JS Prompt', accept: true, result: 'You entered: held out' },
  25  |   ],
  26  |   KEYS: [{ key: 'Tab', shown: 'You entered: TAB' }, { key: 'A', shown: 'You entered: A' }],
  27  |   ADD_TIMES: 3,
  28  | } as const;
  29  | // @req-constants-end
  30  | 
  31  | const PATH = { login: '/login', secure: '/secure', checkboxes: '/checkboxes', dropdown: '/dropdown', dynamic: '/dynamic_loading/2', alerts: '/javascript_alerts', tables: '/tables', addRemove: '/add_remove_elements/', keys: '/key_presses' };
  32  | 
  33  | // ---- UI mechanics (locators are hardened in phase 4) -------------------------------------------
  34  | const ui = (page: Page) => ({
  35  |   username: page.getByLabel('Username'), // TODO(harden)
  36  |   password: page.getByLabel('Password'), // TODO(harden)
  37  |   login: page.getByRole('button', { name: 'Login' }), // TODO(harden)
  38  |   message: page.getByRole('alert'), // TODO(harden)
  39  |   heading: (name: string) => page.getByRole('heading', { name }), // TODO(harden)
  40  |   logout: page.getByRole('link', { name: 'Logout' }), // TODO(harden)
  41  |   checkbox: (n: number) => page.getByRole('checkbox').nth(n), // TODO(harden)
  42  |   dropdown: page.getByRole('combobox'), // TODO(harden)
  43  |   start: page.getByRole('button', { name: 'Start' }), // TODO(harden)
  44  |   dynamicResult: page.getByText(REQ.DYNAMIC_TEXT), // TODO(harden)
  45  |   dialogButton: (name: string) => page.getByRole('button', { name }), // TODO(harden)
  46  |   result: page.getByText(/^You /), // TODO(harden)
  47  |   firstTable: page.getByRole('table').first(), // TODO(harden)
  48  |   addElement: page.getByRole('button', { name: 'Add Element' }), // TODO(harden)
  49  |   deleteButtons: page.getByRole('button', { name: 'Delete' }), // TODO(harden)
  50  |   keyInput: page.getByRole('textbox'), // TODO(harden)
  51  | });
  52  | 
  53  | async function open(page: Page, path: string) {
  54  |   await page.goto(path);
  55  | }
  56  | async function signIn(page: Page, username: string, password: string) {
  57  |   const u = ui(page);
  58  |   await u.username.fill(username);
  59  |   await u.password.fill(password);
  60  |   await u.login.click();
  61  | }
  62  | async function lastNames(page: Page): Promise<string[]> {
  63  |   const table = ui(page).firstTable;
  64  |   const headers = await table.getByRole('columnheader').allInnerTexts(); // TODO(harden)
  65  |   const col = headers.findIndex((h) => /last name/i.test(h));
  66  |   return table.locator('tbody tr').evaluateAll((rows, c) => rows.map((r) => (r.children[c] as HTMLElement).innerText.trim()), col);
  67  | }
  68  | 
  69  | test.describe('DEMO-404 Practice portal — sign-in and interactive widgets', () => {
  70  |   test('SCN-001: The trainee signs in to the Secure Area', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
  71  |     await journey.step('Given I am on the Login page', async () => { await open(page, PATH.login); });
  72  |     await journey.step('When I sign in with the training account', async () => { await signIn(page, data.trainee.username, data.trainee.password); });
  73  |     await journey.step('Then I am on the Secure Area with the heading "Secure Area"', async () => {
  74  |       await expect(page, '[REQ AC-1] Secure Area URL').toHaveURL(/\/secure$/);
  75  |       await expect(ui(page).heading(REQ.SECURE_HEADING), '[REQ AC-1] "Secure Area" heading').toBeVisible();
  76  |     });
  77  |     await journey.step('And I see "You logged into a secure area!"', async () => {
  78  |       await expect(ui(page).message, '[REQ AC-1] sign-in message').toContainText(REQ.MSG.SIGNED_IN);
  79  |     });
  80  |   });
  81  | 
  82  |   ([['an unknown username', 'unknown', REQ.MSG.BAD_USER], ['the trainee with a wrong password', 'wrongpw', REQ.MSG.BAD_PASSWORD]] as const).forEach(([label, kind, msg], i) => {
  83  |     test(`SCN-002.${i + 1}: Wrong credentials are refused with a specific message (${label})`, { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
  84  |       await journey.step('Given I am on the Login page', async () => { await open(page, PATH.login); });
  85  |       await journey.step(`When I sign in with ${label}`, async () => {
  86  |         await signIn(page, kind === 'unknown' ? data.unknownUsername : data.trainee.username, kind === 'unknown' ? data.trainee.password : data.wrongPassword);
  87  |       });
> 88  |       await journey.step(`Then I see "${msg}"`, async () => { await expect(ui(page).message, `[REQ AC-2] ${label} message`).toContainText(msg); });
      |                                                                                                                             ^ Error: [REQ AC-2] the trainee with a wrong password message
  89  |       await journey.step('And I am still on the Login page', async () => { await expect(page, '[REQ AC-2] stays on the Login page').toHaveURL(/\/login$/); });
  90  |     });
  91  |   });
  92  | 
  93  |   test('SCN-003: Logging out returns to the Login page', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
  94  |     await journey.step('Given I am signed in as the trainee', async () => {
  95  |       await open(page, PATH.login);
  96  |       await signIn(page, data.trainee.username, data.trainee.password);
  97  |       await page.waitForURL(/\/secure$/);
  98  |     });
  99  |     await journey.step('When I log out', async () => { await ui(page).logout.click(); await page.waitForURL(/\/login$/); });
  100 |     await journey.step('Then I am on the Login page', async () => { await expect(page, '[REQ AC-3] back on the Login page').toHaveURL(/\/login$/); });
  101 |     await journey.step('And I see "You logged out of the secure area!"', async () => { await expect(ui(page).message, '[REQ AC-3] signed-out message').toContainText(REQ.MSG.SIGNED_OUT); });
  102 |   });
  103 | 
  104 |   test('SCN-004: The Secure Area is not reachable while signed out', { tag: ['@AC-3', '@type:security', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  105 |     await journey.step('When I open /secure without signing in', async () => { await open(page, PATH.secure); });
  106 |     await journey.step('Then I am on the Login page', async () => { await expect(page, '[REQ AC-3] redirected to the Login page').toHaveURL(/\/login$/); });
  107 |     await journey.step('And I see "You must login to view the secure area!"', async () => { await expect(ui(page).message, '[REQ AC-3] must-login message').toContainText(REQ.MSG.MUST_LOGIN); });
  108 |   });
  109 | 
  110 |   test('SCN-005: Checkboxes start in the documented state and toggle', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  111 |     await journey.step('Given I am on the Checkboxes page', async () => { await open(page, PATH.checkboxes); });
  112 |     await journey.step('Then checkbox 1 is unchecked and checkbox 2 is checked', async () => {
  113 |       await expect.soft(ui(page).checkbox(0), '[REQ AC-4] checkbox 1 initially unchecked').not.toBeChecked();
  114 |       await expect.soft(ui(page).checkbox(1), '[REQ AC-4] checkbox 2 initially checked').toBeChecked();
  115 |     });
  116 |     await journey.step('When I click both checkboxes', async () => { await ui(page).checkbox(0).click(); await ui(page).checkbox(1).click(); });
  117 |     await journey.step('Then checkbox 1 is checked and checkbox 2 is unchecked', async () => {
  118 |       await expect.soft(ui(page).checkbox(0), '[REQ AC-4] checkbox 1 toggled on').toBeChecked();
  119 |       await expect.soft(ui(page).checkbox(1), '[REQ AC-4] checkbox 2 toggled off').not.toBeChecked();
  120 |     });
  121 |   });
  122 | 
  123 |   test('SCN-006: The dropdown offers the documented options', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  124 |     await journey.step('Given I am on the Dropdown page', async () => { await open(page, PATH.dropdown); });
  125 |     await journey.step('Then the options are "Please select an option", "Option 1" and "Option 2"', async () => {
  126 |       await expect(ui(page).dropdown.locator('option'), '[REQ AC-5] dropdown options').toHaveText([...REQ.DROPDOWN_OPTIONS]);
  127 |     });
  128 |     await journey.step('And "Please select an option" is preselected and cannot be selected', async () => {
  129 |       await expect.soft(ui(page).dropdown.locator('option:checked'), '[REQ AC-5] placeholder preselected').toHaveText(REQ.DROPDOWN_OPTIONS[0]);
  130 |       await expect.soft(ui(page).dropdown.locator('option').first(), '[REQ AC-5] placeholder not selectable').toBeDisabled();
  131 |     });
  132 |     await journey.step('When I choose "Option 2"', async () => { await ui(page).dropdown.selectOption({ label: REQ.DROPDOWN_OPTIONS[2] }); });
  133 |     await journey.step('Then "Option 2" is the selected option', async () => {
  134 |       await expect(ui(page).dropdown.locator('option:checked'), '[REQ AC-5] Option 2 selected').toHaveText(REQ.DROPDOWN_OPTIONS[2]);
  135 |     });
  136 |   });
  137 | 
  138 |   test('SCN-007: Dynamically loaded content appears within 10 seconds', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  139 |     await journey.step('Given I am on Dynamic Loading example 2', async () => { await open(page, PATH.dynamic); });
  140 |     await journey.step('When I press "Start"', async () => { await ui(page).start.click(); });
  141 |     await journey.step('Then "Hello World!" is rendered within 10 seconds', async () => {
  142 |       await expect(ui(page).dynamicResult, '[REQ AC-6] "Hello World!" within 10 s').toBeVisible({ timeout: REQ.DYNAMIC_MAX_MS });
  143 |     });
  144 |   });
  145 | 
  146 |   REQ.DIALOGS.forEach((d, i) => {
  147 |     test(`SCN-008.${i + 1}: JavaScript dialogs report the user's choice (${d.kind})`, { tag: ['@AC-7', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
  148 |       await journey.step('Given I am on the JavaScript Alerts page', async () => { await open(page, PATH.alerts); });
  149 |       await journey.step(`When I ${d.accept ? 'accept' : 'dismiss'} the JS ${d.kind}`, async () => {
  150 |         page.once('dialog', (dialog) => (d.accept ? dialog.accept(d.kind === 'prompt' ? data.promptText : undefined) : dialog.dismiss()));
  151 |         await ui(page).dialogButton(d.button).click();
  152 |       });
  153 |       await journey.step(`Then I see "${d.result}"`, async () => { await expect(ui(page).result, `[REQ AC-7] ${d.kind} result`).toHaveText(d.result); });
  154 |     });
  155 |   });
  156 | 
  157 |   test('SCN-009: One click on "Last Name" sorts the first table ascending', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  158 |     await journey.step('Given I am on the Data Tables page', async () => { await open(page, PATH.tables); });
  159 |     await journey.step('When I click the "Last Name" header of the first table once', async () => {
  160 |       await ui(page).firstTable.getByRole('columnheader', { name: 'Last Name' }).click(); // TODO(harden)
  161 |     });
  162 |     await journey.step('Then its rows are sorted by last name, ascending', async () => {
  163 |       const names = await lastNames(page);
  164 |       expect(names.length, 'table has rows (precondition)').toBeGreaterThan(1);
  165 |       expect(names, '[REQ AC-8] sorted by last name ascending').toEqual([...names].sort((a, b) => a.localeCompare(b)));
  166 |     });
  167 |   });
  168 | 
  169 |   test('SCN-010: Elements are added and removed one at a time', { tag: ['@AC-9', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
  170 |     await journey.step('Given I am on the Add/Remove Elements page', async () => { await open(page, PATH.addRemove); });
  171 |     await journey.step('When I press "Add Element" 3 times', async () => { for (let n = 0; n < REQ.ADD_TIMES; n++) await ui(page).addElement.click(); });
  172 |     await journey.step('Then there are 3 "Delete" buttons', async () => { await expect(ui(page).deleteButtons, '[REQ AC-9] one Delete button per Add').toHaveCount(REQ.ADD_TIMES); });
  173 |     await journey.step('When I press one "Delete" button', async () => { await ui(page).deleteButtons.first().click(); });
  174 |     await journey.step('Then there are 2 "Delete" buttons', async () => { await expect(ui(page).deleteButtons, '[REQ AC-9] Delete removes one button').toHaveCount(REQ.ADD_TIMES - 1); });
  175 |   });
  176 | 
  177 |   REQ.KEYS.forEach((k, i) => {
  178 |     test(`SCN-011.${i + 1}: Key presses are reported (${k.key})`, { tag: ['@AC-10', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
  179 |       await journey.step('Given I am on the Key Presses page', async () => { await open(page, PATH.keys); });
  180 |       await journey.step(`When I press ${k.key} in the input`, async () => { await ui(page).keyInput.press(k.key); });
  181 |       await journey.step(`Then I see "${k.shown}"`, async () => { await expect(ui(page).result, `[REQ AC-10] ${k.key} reported`).toHaveText(k.shown); });
  182 |     });
  183 |   });
  184 | });
  185 | 
```