# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-404\tests\demo-404.spec.ts >> DEMO-404 Practice portal — sign-in and interactive widgets >> SCN-011.1: Key presses are reported (Tab)
- Location: evaluations\DEMO-404\tests\demo-404.spec.ts:184:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: [REQ AC-10] Tab reported

expect(locator).toHaveText(expected) failed

Locator:  locator('#result')
Expected: "You entered: TAB"
Received: ""

Call log:
  - [REQ AC-10] Tab reported locator('#result') with timeout 5000ms
  - waiting for locator('#result')
    4 × locator resolved to <p id="result"></p>
      - unexpected value ""
  - Test timeout of 60000ms exceeded.

```

```yaml
- link "Fork me on GitHub":
  - /url: https://github.com/tourdedave/the-internet
  - img "Fork me on GitHub"
- heading "Key Presses" [level=3]
- paragraph: Key presses are often used to interact with a website (e.g., tab order, enter, escape, etc.). Press a key and see what you inputted.
- textbox
- paragraph
- separator
- text: Powered by
- link "Elemental Selenium":
  - /url: http://elementalselenium.com/
```

# Test source

```ts
  87  | 
  88  |   ([['an unknown username', 'unknown', REQ.MSG.BAD_USER], ['the trainee with a wrong password', 'wrongpw', REQ.MSG.BAD_PASSWORD]] as const).forEach(([label, kind, msg], i) => {
  89  |     test(`SCN-002.${i + 1}: Wrong credentials are refused with a specific message (${label})`, { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
  90  |       await journey.step('Given I am on the Login page', async () => { await open(page, PATH.login); });
  91  |       await journey.step(`When I sign in with ${label}`, async () => {
  92  |         await signIn(page, kind === 'unknown' ? data.unknownUsername : data.trainee.username, kind === 'unknown' ? data.trainee.password : data.wrongPassword);
  93  |       });
  94  |       await journey.step(`Then I see "${msg}"`, async () => { await expect(ui(page).message, `[REQ AC-2] ${label} message`).toContainText(msg); });
  95  |       await journey.step('And I am still on the Login page', async () => { await expect(page, '[REQ AC-2] stays on the Login page').toHaveURL(/\/login$/); });
  96  |     });
  97  |   });
  98  | 
  99  |   test('SCN-003: Logging out returns to the Login page', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
  100 |     await journey.step('Given I am signed in as the trainee', async () => {
  101 |       await open(page, PATH.login);
  102 |       await signIn(page, data.trainee.username, data.trainee.password);
  103 |       await page.waitForURL(/\/secure$/, { waitUntil: 'domcontentloaded' });
  104 |     });
  105 |     await journey.step('When I log out', async () => { await ui(page).logout.click(); await page.waitForURL(/\/login$/, { waitUntil: 'domcontentloaded' }); });
  106 |     await journey.step('Then I am on the Login page', async () => { await expect(page, '[REQ AC-3] back on the Login page').toHaveURL(/\/login$/); });
  107 |     await journey.step('And I see "You logged out of the secure area!"', async () => { await expect(ui(page).message, '[REQ AC-3] signed-out message').toContainText(REQ.MSG.SIGNED_OUT); });
  108 |   });
  109 | 
  110 |   test('SCN-004: The Secure Area is not reachable while signed out', { tag: ['@AC-3', '@type:security', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  111 |     await journey.step('When I open /secure without signing in', async () => { await open(page, PATH.secure); });
  112 |     await journey.step('Then I am on the Login page', async () => { await expect(page, '[REQ AC-3] redirected to the Login page').toHaveURL(/\/login$/); });
  113 |     await journey.step('And I see "You must login to view the secure area!"', async () => { await expect(ui(page).message, '[REQ AC-3] must-login message').toContainText(REQ.MSG.MUST_LOGIN); });
  114 |   });
  115 | 
  116 |   test('SCN-005: Checkboxes start in the documented state and toggle', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  117 |     await journey.step('Given I am on the Checkboxes page', async () => { await open(page, PATH.checkboxes); });
  118 |     await journey.step('Then checkbox 1 is unchecked and checkbox 2 is checked', async () => {
  119 |       await expect.soft(ui(page).checkbox(0), '[REQ AC-4] checkbox 1 initially unchecked').not.toBeChecked();
  120 |       await expect.soft(ui(page).checkbox(1), '[REQ AC-4] checkbox 2 initially checked').toBeChecked();
  121 |     });
  122 |     await journey.step('When I click both checkboxes', async () => { await ui(page).checkbox(0).click(); await ui(page).checkbox(1).click(); });
  123 |     await journey.step('Then checkbox 1 is checked and checkbox 2 is unchecked', async () => {
  124 |       await expect.soft(ui(page).checkbox(0), '[REQ AC-4] checkbox 1 toggled on').toBeChecked();
  125 |       await expect.soft(ui(page).checkbox(1), '[REQ AC-4] checkbox 2 toggled off').not.toBeChecked();
  126 |     });
  127 |   });
  128 | 
  129 |   test('SCN-006: The dropdown offers the documented options', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  130 |     await journey.step('Given I am on the Dropdown page', async () => { await open(page, PATH.dropdown); });
  131 |     await journey.step('Then the options are "Please select an option", "Option 1" and "Option 2"', async () => {
  132 |       await expect(ui(page).dropdown.locator('option'), '[REQ AC-5] dropdown options').toHaveText([...REQ.DROPDOWN_OPTIONS]);
  133 |     });
  134 |     await journey.step('And "Please select an option" is preselected and cannot be selected', async () => {
  135 |       await expect.soft(ui(page).dropdown.locator('option:checked'), '[REQ AC-5] placeholder preselected').toHaveText(REQ.DROPDOWN_OPTIONS[0]);
  136 |       await expect.soft(ui(page).dropdown.locator('option').first(), '[REQ AC-5] placeholder not selectable').toBeDisabled();
  137 |     });
  138 |     await journey.step('When I choose "Option 2"', async () => { await ui(page).dropdown.selectOption({ label: REQ.DROPDOWN_OPTIONS[2] }); });
  139 |     await journey.step('Then "Option 2" is the selected option', async () => {
  140 |       await expect(ui(page).dropdown.locator('option:checked'), '[REQ AC-5] Option 2 selected').toHaveText(REQ.DROPDOWN_OPTIONS[2]);
  141 |     });
  142 |   });
  143 | 
  144 |   test('SCN-007: Dynamically loaded content appears within 10 seconds', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  145 |     await journey.step('Given I am on Dynamic Loading example 2', async () => { await open(page, PATH.dynamic); });
  146 |     await journey.step('When I press "Start"', async () => { await ui(page).start.click(); });
  147 |     await journey.step('Then "Hello World!" is rendered within 10 seconds', async () => {
  148 |       await expect(ui(page).dynamicResult, '[REQ AC-6] "Hello World!" within 10 s').toBeVisible({ timeout: REQ.DYNAMIC_MAX_MS });
  149 |     });
  150 |   });
  151 | 
  152 |   REQ.DIALOGS.forEach((d, i) => {
  153 |     test(`SCN-008.${i + 1}: JavaScript dialogs report the user's choice (${d.kind})`, { tag: ['@AC-7', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
  154 |       await journey.step('Given I am on the JavaScript Alerts page', async () => { await open(page, PATH.alerts); });
  155 |       await journey.step(`When I ${d.accept ? 'accept' : 'dismiss'} the JS ${d.kind}`, async () => {
  156 |         page.once('dialog', (dialog) => (d.accept ? dialog.accept(d.kind === 'prompt' ? data.promptText : undefined) : dialog.dismiss()));
  157 |         await ui(page).dialogButton(d.button).click();
  158 |       });
  159 |       await journey.step(`Then I see "${d.result}"`, async () => { await expect(ui(page).result, `[REQ AC-7] ${d.kind} result`).toHaveText(d.result); });
  160 |     });
  161 |   });
  162 | 
  163 |   test('SCN-009: One click on "Last Name" sorts the first table ascending', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  164 |     await journey.step('Given I am on the Data Tables page', async () => { await open(page, PATH.tables); });
  165 |     await journey.step('When I click the "Last Name" header of the first table once', async () => {
  166 |       await ui(page).firstTable.getByRole('columnheader', { name: 'Last Name' }).click();
  167 |     });
  168 |     await journey.step('Then its rows are sorted by last name, ascending', async () => {
  169 |       const names = await lastNames(page);
  170 |       expect(names.length, 'table has rows (precondition)').toBeGreaterThan(1);
  171 |       expect(names, '[REQ AC-8] sorted by last name ascending').toEqual([...names].sort((a, b) => a.localeCompare(b)));
  172 |     });
  173 |   });
  174 | 
  175 |   test('SCN-010: Elements are added and removed one at a time', { tag: ['@AC-9', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
  176 |     await journey.step('Given I am on the Add/Remove Elements page', async () => { await open(page, PATH.addRemove); });
  177 |     await journey.step('When I press "Add Element" 3 times', async () => { for (let n = 0; n < REQ.ADD_TIMES; n++) await ui(page).addElement.click(); });
  178 |     await journey.step('Then there are 3 "Delete" buttons', async () => { await expect(ui(page).deleteButtons, '[REQ AC-9] one Delete button per Add').toHaveCount(REQ.ADD_TIMES); });
  179 |     await journey.step('When I press one "Delete" button', async () => { await ui(page).deleteButtons.first().click(); });
  180 |     await journey.step('Then there are 2 "Delete" buttons', async () => { await expect(ui(page).deleteButtons, '[REQ AC-9] Delete removes one button').toHaveCount(REQ.ADD_TIMES - 1); });
  181 |   });
  182 | 
  183 |   REQ.KEYS.forEach((k, i) => {
  184 |     test(`SCN-011.${i + 1}: Key presses are reported (${k.key})`, { tag: ['@AC-10', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
  185 |       await journey.step('Given I am on the Key Presses page', async () => { await open(page, PATH.keys); });
  186 |       await journey.step(`When I press ${k.key} in the input`, async () => { await ui(page).keyInput.press(k.key); });
> 187 |       await journey.step(`Then I see "${k.shown}"`, async () => { await expect(ui(page).result, `[REQ AC-10] ${k.key} reported`).toHaveText(k.shown); });
      |                                                                                                                                  ^ Error: [REQ AC-10] Tab reported
  188 |     });
  189 |   });
  190 | });
  191 | 
```