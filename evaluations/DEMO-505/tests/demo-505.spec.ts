/**
 * Held-out acceptance tests for DEMO-505 — "Practice portal — hovers, number input and notifications".
 * Generated from evaluations/DEMO-505/scenarios.feature (requirement only). UI only.
 */
import type { Page } from '@playwright/test';
import { test, expect, gotoPage } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from DEMO-505 (never edit during hardening)
const REQ = {
  AVATARS: [1, 2, 3],
  CAPTION: (n: number) => `name: user${n}`,
  PROFILE_LINK: 'View profile',
  DIGITS: '42',
  LETTERS: 'abc',
  NOTIFICATION_COUNT: 1,
} as const;
// @req-constants-end

const PATH = { hovers: '/hovers', inputs: '/inputs', notification: '/notification_message_rendered' };

// Hardened (hardening/hardening-log.md). Captions/links of non-hovered figures are hidden, so scope to the figure.
const figure = (page: Page, n: number) => page.locator('.figure').nth(n - 1);
const ui = (page: Page) => ({
  avatar: (n: number) => figure(page, n).getByRole('img', { name: 'User Avatar' }),
  caption: (n: number) => page.getByRole('heading', { name: REQ.CAPTION(n) }),
  profileLink: (n: number) => figure(page, n).getByRole('link', { name: REQ.PROFILE_LINK }),
  numberField: page.getByRole('spinbutton'),
  clickHere: page.getByRole('link', { name: 'Click here' }),
  notification: page.locator('#flash'), // flash container, no alert role
});

test.describe('DEMO-505 Practice portal — hovers, number input and notifications', () => {
  REQ.AVATARS.forEach((n, i) => {
    test(`SCN-001.${i + 1}: Hovering an avatar reveals that user's caption (avatar ${n})`, { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
      await journey.step('Given I am on the Hovers page', async () => { await gotoPage(page, PATH.hovers); });
      await journey.step(`When I hover over avatar ${n}`, async () => { await ui(page).avatar(n).hover(); });
      await journey.step(`Then I see "name: user${n}" and a "View profile" link`, async () => {
        await expect.soft(ui(page).caption(n), `[REQ AC-1] caption for avatar ${n}`).toBeVisible();
        await expect.soft(ui(page).profileLink(n), `[REQ AC-1] "View profile" link for avatar ${n}`).toBeVisible();
      });
    });
  });

  test('SCN-002: The number field accepts digits', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Inputs page', async () => { await gotoPage(page, PATH.inputs); });
    await journey.step('When I type "42" into the number field', async () => { await ui(page).numberField.pressSequentially(REQ.DIGITS); });
    await journey.step('Then the field value is "42"', async () => { await expect(ui(page).numberField, '[REQ AC-2] digits accepted').toHaveValue(REQ.DIGITS); });
  });

  test('SCN-003: The number field rejects non-numeric characters', { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Inputs page', async () => { await gotoPage(page, PATH.inputs); });
    await journey.step('When I type "abc" into the number field', async () => { await ui(page).numberField.pressSequentially(REQ.LETTERS); });
    await journey.step('Then the field is empty', async () => { await expect(ui(page).numberField, '[REQ AC-2] letters cannot be entered').toHaveValue(''); });
  });

  test('SCN-004: Clicking "Click here" shows a notification', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Notification Message page', async () => { await gotoPage(page, PATH.notification); });
    await journey.step('When I click "Click here"', async () => { await ui(page).clickHere.click(); });
    await journey.step('Then exactly one non-empty notification is shown', async () => {
      await expect(ui(page).notification, '[REQ AC-3] exactly one notification').toHaveCount(REQ.NOTIFICATION_COUNT);
      await expect(ui(page).notification, '[REQ AC-3] notification is not empty').toHaveText(/\w{3,}/);
    });
  });
});
