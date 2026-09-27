# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-404\tests\demo-404.spec.ts >> DEMO-404 Practice portal — sign-in and interactive widgets >> SCN-002.1: Wrong credentials are refused with a specific message (an unknown username)
- Location: evaluations\DEMO-404\tests\demo-404.spec.ts:89:5

# Error details

```
TimeoutError: locator.fill: Timeout 10000ms exceeded.
Call log:
  - waiting for getByLabel('Username')

```

# Page snapshot

```yaml
- iframe [ref=e2]:
  - generic [ref=f1e1]:
    - generic [ref=f1e2]:
      - generic [ref=f1e5]: Application error
      - paragraph [ref=f1e6]:
        - text: An error occurred in the application and your page could not be served. If you are the application owner,
        - link "check your logs for details" [ref=f1e7] [cursor=pointer]:
          - /url: https://devcenter.heroku.com/articles/logging#view-logs?utm_source=error-pages&utm_content=application-error
        - text: . You can do this from the Heroku CLI with the command
        - code [ref=f1e8]: heroku logs --tail
    - link [ref=f1e15] [cursor=pointer]:
      - /url: https://devcenter.heroku.com/articles/logging#view-logs?utm_source=error-pages&utm_content=application-error
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
  33  | // ---- UI mechanics (hardened against the live AUT — see hardening/hardening-log.md) --------------
  34  | const ui = (page: Page) => ({
  35  |   username: page.getByLabel('Username'),
  36  |   password: page.getByLabel('Password'),
  37  |   login: page.getByRole('button', { name: 'Login' }),
  38  |   message: page.locator('#flash'), // messages are plain text in a flash container (no alert role)
  39  |   heading: (name: string) => page.getByRole('heading', { name, exact: true }),
  40  |   logout: page.getByRole('link', { name: 'Logout' }),
  41  |   checkbox: (n: number) => page.getByRole('checkbox').nth(n),
  42  |   dropdown: page.getByRole('combobox'),
  43  |   start: page.getByRole('button', { name: 'Start' }),
  44  |   dynamicResult: page.getByText(REQ.DYNAMIC_TEXT),
  45  |   dialogButton: (name: string) => page.getByRole('button', { name }),
  46  |   result: page.locator('#result'),
  47  |   firstTable: page.getByRole('table').first(),
  48  |   addElement: page.getByRole('button', { name: 'Add Element' }),
  49  |   deleteButtons: page.getByRole('button', { name: 'Delete' }),
  50  |   keyInput: page.getByRole('textbox'),
  51  | });
  52  | 
  53  | /**
  54  |  * Navigation: the AUT's 'load' event can hang on slow third-party assets, and some page scripts
  55  |  * (e.g. the table sorter) bind their handlers around DOMContentLoaded. Wait for DOMContentLoaded,
  56  |  * then give 'load' up to 10 s to settle without failing when it never fires.
  57  |  */
  58  | async function open(page: Page, path: string) {
  59  |   await page.goto(path, { waitUntil: 'domcontentloaded' });
  60  |   await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => undefined);
  61  | }
  62  | async function signIn(page: Page, username: string, password: string) {
  63  |   const u = ui(page);
> 64  |   await u.username.fill(username);
      |                    ^ TimeoutError: locator.fill: Timeout 10000ms exceeded.
  65  |   await u.password.fill(password);
  66  |   await u.login.click();
  67  | }
  68  | async function lastNames(page: Page): Promise<string[]> {
  69  |   const table = ui(page).firstTable;
  70  |   const headers = await table.getByRole('columnheader').allInnerTexts();
  71  |   const col = headers.findIndex((h) => /last name/i.test(h));
  72  |   return table.locator('tbody tr').evaluateAll((rows, c) => rows.map((r) => (r.children[c] as HTMLElement).innerText.trim()), col);
  73  | }
  74  | 
  75  | test.describe('DEMO-404 Practice portal — sign-in and interactive widgets', () => {
  76  |   test('SCN-001: The trainee signs in to the Secure Area', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
  77  |     await journey.step('Given I am on the Login page', async () => { await open(page, PATH.login); });
  78  |     await journey.step('When I sign in with the training account', async () => { await signIn(page, data.trainee.username, data.trainee.password); });
  79  |     await journey.step('Then I am on the Secure Area with the heading "Secure Area"', async () => {
  80  |       await expect(page, '[REQ AC-1] Secure Area URL').toHaveURL(/\/secure$/);
  81  |       await expect(ui(page).heading(REQ.SECURE_HEADING), '[REQ AC-1] "Secure Area" heading').toBeVisible();
  82  |     });
  83  |     await journey.step('And I see "You logged into a secure area!"', async () => {
  84  |       await expect(ui(page).message, '[REQ AC-1] sign-in message').toContainText(REQ.MSG.SIGNED_IN);
  85  |     });
  86  |   });
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
```