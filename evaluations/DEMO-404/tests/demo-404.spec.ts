/**
 * Held-out acceptance tests for DEMO-404 — "Practice portal — sign-in and interactive widgets".
 * Generated from evaluations/DEMO-404/scenarios.feature (requirement + attachments only). UI only.
 */
import type { Page } from '@playwright/test';
import { test, expect, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from DEMO-404 + ux-copy.md (never edit during hardening)
const REQ = {
  SECURE_HEADING: 'Secure Area',
  MSG: {
    SIGNED_IN: 'You logged into a secure area!',
    BAD_USER: 'Your username is invalid!',
    BAD_PASSWORD: 'Your password is invalid!',
    SIGNED_OUT: 'You logged out of the secure area!',
    MUST_LOGIN: 'You must login to view the secure area!',
  },
  DROPDOWN_OPTIONS: ['Please select an option', 'Option 1', 'Option 2'],
  DYNAMIC_TEXT: 'Hello World!',
  DYNAMIC_MAX_MS: 10_000,
  DIALOGS: [
    { kind: 'alert', button: 'Click for JS Alert', accept: true, result: 'You successfully clicked an alert' },
    { kind: 'confirm', button: 'Click for JS Confirm', accept: false, result: 'You clicked: Cancel' },
    { kind: 'prompt', button: 'Click for JS Prompt', accept: true, result: 'You entered: held out' },
  ],
  KEYS: [{ key: 'Tab', shown: 'You entered: TAB' }, { key: 'A', shown: 'You entered: A' }],
  ADD_TIMES: 3,
} as const;
// @req-constants-end

const PATH = { login: '/login', secure: '/secure', checkboxes: '/checkboxes', dropdown: '/dropdown', dynamic: '/dynamic_loading/2', alerts: '/javascript_alerts', tables: '/tables', addRemove: '/add_remove_elements/', keys: '/key_presses' };

// ---- UI mechanics (hardened against the live AUT — see hardening/hardening-log.md) --------------
const ui = (page: Page) => ({
  username: page.getByLabel('Username'),
  password: page.getByLabel('Password'),
  login: page.getByRole('button', { name: 'Login' }),
  message: page.locator('#flash'), // messages are plain text in a flash container (no alert role)
  heading: (name: string) => page.getByRole('heading', { name, exact: true }),
  logout: page.getByRole('link', { name: 'Logout' }),
  checkbox: (n: number) => page.getByRole('checkbox').nth(n),
  dropdown: page.getByRole('combobox'),
  start: page.getByRole('button', { name: 'Start' }),
  dynamicResult: page.getByText(REQ.DYNAMIC_TEXT),
  dialogButton: (name: string) => page.getByRole('button', { name }),
  result: page.locator('#result'),
  firstTable: page.getByRole('table').first(),
  addElement: page.getByRole('button', { name: 'Add Element' }),
  deleteButtons: page.getByRole('button', { name: 'Delete' }),
  keyInput: page.getByRole('textbox'),
});

/**
 * Navigation: the AUT's 'load' event can hang on slow third-party assets, and some page scripts
 * (e.g. the table sorter) bind their handlers around DOMContentLoaded. Wait for DOMContentLoaded,
 * then give 'load' up to 10 s to settle without failing when it never fires.
 */
async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load', { timeout: 10_000 }).catch(() => undefined);
}
async function signIn(page: Page, username: string, password: string) {
  const u = ui(page);
  await u.username.fill(username);
  await u.password.fill(password);
  await u.login.click();
}
async function lastNames(page: Page): Promise<string[]> {
  const table = ui(page).firstTable;
  const headers = await table.getByRole('columnheader').allInnerTexts();
  const col = headers.findIndex((h) => /last name/i.test(h));
  return table.locator('tbody tr').evaluateAll((rows, c) => rows.map((r) => (r.children[c] as HTMLElement).innerText.trim()), col);
}

test.describe('DEMO-404 Practice portal — sign-in and interactive widgets', () => {
  test('SCN-001: The trainee signs in to the Secure Area', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
    await journey.step('Given I am on the Login page', async () => { await open(page, PATH.login); });
    await journey.step('When I sign in with the training account', async () => { await signIn(page, data.trainee.username, data.trainee.password); });
    await journey.step('Then I am on the Secure Area with the heading "Secure Area"', async () => {
      await expect(page, '[REQ AC-1] Secure Area URL').toHaveURL(/\/secure$/);
      await expect(ui(page).heading(REQ.SECURE_HEADING), '[REQ AC-1] "Secure Area" heading').toBeVisible();
    });
    await journey.step('And I see "You logged into a secure area!"', async () => {
      await expect(ui(page).message, '[REQ AC-1] sign-in message').toContainText(REQ.MSG.SIGNED_IN);
    });
  });

  ([['an unknown username', 'unknown', REQ.MSG.BAD_USER], ['the trainee with a wrong password', 'wrongpw', REQ.MSG.BAD_PASSWORD]] as const).forEach(([label, kind, msg], i) => {
    test(`SCN-002.${i + 1}: Wrong credentials are refused with a specific message (${label})`, { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
      await journey.step('Given I am on the Login page', async () => { await open(page, PATH.login); });
      await journey.step(`When I sign in with ${label}`, async () => {
        await signIn(page, kind === 'unknown' ? data.unknownUsername : data.trainee.username, kind === 'unknown' ? data.trainee.password : data.wrongPassword);
      });
      await journey.step(`Then I see "${msg}"`, async () => { await expect(ui(page).message, `[REQ AC-2] ${label} message`).toContainText(msg); });
      await journey.step('And I am still on the Login page', async () => { await expect(page, '[REQ AC-2] stays on the Login page').toHaveURL(/\/login$/); });
    });
  });

  test('SCN-003: Logging out returns to the Login page', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
    await journey.step('Given I am signed in as the trainee', async () => {
      await seed.create('signed-in session (UI setup: the AUT has no API)', async () => {
        await open(page, PATH.login);
        await signIn(page, data.trainee.username, data.trainee.password);
        await page.waitForURL(/[/]secure$/, { waitUntil: 'domcontentloaded' });
      });
    });
    await journey.step('When I log out', async () => { await ui(page).logout.click(); await page.waitForURL(/\/login$/, { waitUntil: 'domcontentloaded' }); });
    await journey.step('Then I am on the Login page', async () => { await expect(page, '[REQ AC-3] back on the Login page').toHaveURL(/\/login$/); });
    await journey.step('And I see "You logged out of the secure area!"', async () => { await expect(ui(page).message, '[REQ AC-3] signed-out message').toContainText(REQ.MSG.SIGNED_OUT); });
  });

  test('SCN-004: The Secure Area is not reachable while signed out', { tag: ['@AC-3', '@type:security', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
    await journey.step('Given I am not signed in', async () => { await page.context().clearCookies(); });
    await journey.step('When I open /secure', async () => { await open(page, PATH.secure); });
    await journey.step('Then I am on the Login page', async () => { await expect(page, '[REQ AC-3] redirected to the Login page').toHaveURL(/\/login$/); });
    await journey.step('And I see "You must login to view the secure area!"', async () => { await expect(ui(page).message, '[REQ AC-3] must-login message').toContainText(REQ.MSG.MUST_LOGIN); });
  });

  test('SCN-005: Checkboxes start in the documented state and toggle', { tag: ['@AC-4', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Checkboxes page', async () => { await open(page, PATH.checkboxes); });
    await journey.step('Then checkbox 1 is unchecked and checkbox 2 is checked', async () => {
      await expect.soft(ui(page).checkbox(0), '[REQ AC-4] checkbox 1 initially unchecked').not.toBeChecked();
      await expect.soft(ui(page).checkbox(1), '[REQ AC-4] checkbox 2 initially checked').toBeChecked();
    });
    await journey.step('When I click both checkboxes', async () => { await ui(page).checkbox(0).click(); await ui(page).checkbox(1).click(); });
    await journey.step('Then checkbox 1 is checked and checkbox 2 is unchecked', async () => {
      await expect.soft(ui(page).checkbox(0), '[REQ AC-4] checkbox 1 toggled on').toBeChecked();
      await expect.soft(ui(page).checkbox(1), '[REQ AC-4] checkbox 2 toggled off').not.toBeChecked();
    });
  });

  test('SCN-006: The dropdown offers the documented options', { tag: ['@AC-5', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Dropdown page', async () => { await open(page, PATH.dropdown); });
    await journey.step('Then the options are "Please select an option", "Option 1" and "Option 2"', async () => {
      await expect(ui(page).dropdown.locator('option'), '[REQ AC-5] dropdown options').toHaveText([...REQ.DROPDOWN_OPTIONS]);
    });
    await journey.step('And "Please select an option" is preselected and cannot be selected', async () => {
      await expect.soft(ui(page).dropdown.locator('option:checked'), '[REQ AC-5] placeholder preselected').toHaveText(REQ.DROPDOWN_OPTIONS[0]);
      await expect.soft(ui(page).dropdown.locator('option').first(), '[REQ AC-5] placeholder not selectable').toBeDisabled();
    });
    await journey.step('When I choose "Option 2"', async () => { await ui(page).dropdown.selectOption({ label: REQ.DROPDOWN_OPTIONS[2] }); });
    await journey.step('Then "Option 2" is the selected option', async () => {
      await expect(ui(page).dropdown.locator('option:checked'), '[REQ AC-5] Option 2 selected').toHaveText(REQ.DROPDOWN_OPTIONS[2]);
    });
  });

  test('SCN-007: Dynamically loaded content appears within 10 seconds', { tag: ['@AC-6', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on Dynamic Loading example 2', async () => { await open(page, PATH.dynamic); });
    await journey.step('When I press "Start"', async () => { await ui(page).start.click(); });
    await journey.step('Then "Hello World!" is rendered within 10 seconds', async () => {
      await expect(ui(page).dynamicResult, '[REQ AC-6] "Hello World!" within 10 s').toBeVisible({ timeout: REQ.DYNAMIC_MAX_MS });
    });
  });

  REQ.DIALOGS.forEach((d, i) => {
    test(`SCN-008.${i + 1}: JavaScript dialogs report the user's choice (${d.kind})`, { tag: ['@AC-7', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey, data }) => {
      await journey.step('Given I am on the JavaScript Alerts page', async () => { await open(page, PATH.alerts); });
      await journey.step(`When I ${d.accept ? 'accept' : 'dismiss'} the JS ${d.kind}`, async () => {
        page.once('dialog', (dialog) => (d.accept ? dialog.accept(d.kind === 'prompt' ? data.promptText : undefined) : dialog.dismiss()));
        await ui(page).dialogButton(d.button).click();
      });
      await journey.step(`Then I see "${d.result}"`, async () => { await expect(ui(page).result, `[REQ AC-7] ${d.kind} result`).toHaveText(d.result); });
    });
  });

  test('SCN-009: One click on "Last Name" sorts the first table ascending', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Data Tables page', async () => { await open(page, PATH.tables); });
    await journey.step('When I click the "Last Name" header of the first table once', async () => {
      await ui(page).firstTable.getByRole('columnheader', { name: 'Last Name' }).click();
    });
    await journey.step('Then its rows are sorted by last name, ascending', async () => {
      const names = await lastNames(page);
      expect(names.length, 'table has rows (precondition)').toBeGreaterThan(1);
      expect(names, '[REQ AC-8] sorted by last name ascending').toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });
  });

  test('SCN-010: Elements are added and removed one at a time', { tag: ['@AC-9', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Add/Remove Elements page', async () => { await open(page, PATH.addRemove); });
    await journey.step('When I press "Add Element" 3 times', async () => { for (let n = 0; n < REQ.ADD_TIMES; n++) await ui(page).addElement.click(); });
    await journey.step('Then there are 3 "Delete" buttons', async () => { await expect(ui(page).deleteButtons, '[REQ AC-9] one Delete button per Add').toHaveCount(REQ.ADD_TIMES); });
    await journey.step('When I press one "Delete" button', async () => { await ui(page).deleteButtons.first().click(); });
    await journey.step('Then there are 2 "Delete" buttons', async () => { await expect(ui(page).deleteButtons, '[REQ AC-9] Delete removes one button').toHaveCount(REQ.ADD_TIMES - 1); });
  });

  REQ.KEYS.forEach((k, i) => {
    test(`SCN-011.${i + 1}: Key presses are reported (${k.key})`, { tag: ['@AC-10', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
      await journey.step('Given I am on the Key Presses page', async () => { await open(page, PATH.keys); });
      await journey.step(`When I press ${k.key} in the input`, async () => { await ui(page).keyInput.press(k.key); });
      await journey.step(`Then I see "${k.shown}"`, async () => { await expect(ui(page).result, `[REQ AC-10] ${k.key} reported`).toHaveText(k.shown); });
    });
  });
});
