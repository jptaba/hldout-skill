/**
 * Held-out acceptance tests for DEMO-606 — "Practice portal — notification copy".
 * The server picks the outcome at random, so scenarios SAMPLE repeated clicks (see ASSUMPTION in scenarios.feature).
 */
import type { Page } from '@playwright/test';
import { test, expect, gotoPage } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from DEMO-606 + ux-copy.md (never edit during hardening)
const REQ = {
  APPROVED: ['Action successful', 'Action unsuccessful, please try again'],
  SAMPLES: 12,
  NOTIFICATIONS_PER_CLICK: 1,
  OUTCOMES: ['success', 'failure'],
} as const;
// @req-constants-end

const PATH = { notification: '/notification_message_rendered' };

const ui = (page: Page) => ({
  clickHere: page.getByRole('link', { name: 'Click here' }), // TODO(harden)
  notification: page.getByRole('alert'), // TODO(harden)
});

/** Notification text without the close icon (ux-copy.md: the × is not part of the copy). */
const copyOf = (raw: string) => raw.replace(/×/g, '').replace(/\s+/g, ' ').trim();
/** Outcome by meaning, not by exact copy (ASSUMPTION in scenarios.feature). */
const outcomeOf = (text: string) => (/^action success/i.test(text) ? 'success' : /^action unsuc/i.test(text) ? 'failure' : 'unknown');

async function sample(page: Page, n: number): Promise<{ counts: number[]; texts: string[] }> {
  const counts: number[] = []; const texts: string[] = [];
  for (let i = 0; i < n; i++) {
    await ui(page).clickHere.click();
    await page.waitForLoadState('domcontentloaded');
    counts.push(await ui(page).notification.count());
    texts.push(copyOf(await ui(page).notification.first().innerText()));
  }
  return { counts, texts };
}

test.describe('DEMO-606 Practice portal — notification copy', () => {
  test('SCN-001: Every notification uses approved copy', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    let s!: { counts: number[]; texts: string[] };
    await journey.step('Given I am on the Notification Message page', async () => { await gotoPage(page, PATH.notification); });
    await journey.step('When I click "Click here" 12 times, reading the notification after each click', async () => { s = await sample(page, REQ.SAMPLES); });
    await journey.step('Then each click showed exactly one notification', async () => {
      expect.soft(s.counts.filter((c) => c !== REQ.NOTIFICATIONS_PER_CLICK), '[REQ AC-1] exactly one notification per click').toEqual([]);
    });
    await journey.step('And every notification text is one of the approved messages', async () => {
      const offCopy = [...new Set(s.texts.filter((t) => !(REQ.APPROVED as readonly string[]).includes(t)))];
      expect.soft(offCopy, `[REQ AC-1] only approved copy (seen: ${[...new Set(s.texts)].join(' | ')})`).toEqual([]);
    });
  });

  test('SCN-002: Both outcomes occur across repeated clicks', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
    let outcomes: string[] = [];
    await journey.step('Given I am on the Notification Message page', async () => { await gotoPage(page, PATH.notification); });
    await journey.step('When I click "Click here" 12 times, noting each outcome', async () => { outcomes = (await sample(page, REQ.SAMPLES)).texts.map(outcomeOf); });
    await journey.step('Then both a success and a failure outcome were observed', async () => {
      expect([...new Set(outcomes)].filter((o) => o !== 'unknown').sort(), '[REQ AC-2] both outcomes occur').toEqual([...REQ.OUTCOMES].sort());
    });
  });
});
