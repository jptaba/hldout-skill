# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-606\tests\demo-606.spec.ts >> DEMO-606 Practice portal — notification copy >> SCN-001: Every notification uses approved copy
- Location: evaluations\DEMO-606\tests\demo-606.spec.ts:41:3

# Error details

```
TimeoutError: locator.innerText: Timeout 10000ms exceeded.
Call log:
  - waiting for getByRole('alert').first()

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e4]:
    - text:  Action unsuccesful, please try again
    - link "×" [ref=f1e5] [cursor=pointer]:
      - /url: "#"
  - generic [ref=f1e6]:
    - link "Fork me on GitHub":
      - /url: https://github.com/tourdedave/the-internet
      - img "Fork me on GitHub" [ref=f1e7] [cursor=pointer]
    - generic [ref=f1e9]:
      - heading "Notification Message" [level=3] [ref=f1e10]
      - paragraph [ref=f1e11]:
        - text: The message displayed above the heading is a notification message. It is often used to convey information about an action previously taken by the user. Some rudimentary examples include 'Action successful', 'Action unsuccessful, please try again', etc.
        - link "Click here" [ref=f1e12] [cursor=pointer]:
          - /url: /notification_message
        - text: to load a new message.
  - generic [ref=f1e14]:
    - separator [ref=f1e15]
    - generic [ref=f1e16]:
      - text: Powered by
      - link "Elemental Selenium" [ref=f1e17] [cursor=pointer]:
        - /url: http://elementalselenium.com/
```

# Test source

```ts
  1  | /**
  2  |  * Held-out acceptance tests for DEMO-606 — "Practice portal — notification copy".
  3  |  * The server picks the outcome at random, so scenarios SAMPLE repeated clicks (see ASSUMPTION in scenarios.feature).
  4  |  */
  5  | import type { Page } from '@playwright/test';
  6  | import { test, expect, gotoPage } from '../../../heldout-support/fixtures';
  7  | 
  8  | // @req-constants-start — expected outcomes copied verbatim from DEMO-606 + ux-copy.md (never edit during hardening)
  9  | const REQ = {
  10 |   APPROVED: ['Action successful', 'Action unsuccessful, please try again'],
  11 |   SAMPLES: 12,
  12 |   NOTIFICATIONS_PER_CLICK: 1,
  13 |   OUTCOMES: ['success', 'failure'],
  14 | } as const;
  15 | // @req-constants-end
  16 | 
  17 | const PATH = { notification: '/notification_message_rendered' };
  18 | 
  19 | const ui = (page: Page) => ({
  20 |   clickHere: page.getByRole('link', { name: 'Click here' }), // TODO(harden)
  21 |   notification: page.getByRole('alert'), // TODO(harden)
  22 | });
  23 | 
  24 | /** Notification text without the close icon (ux-copy.md: the × is not part of the copy). */
  25 | const copyOf = (raw: string) => raw.replace(/×/g, '').replace(/\s+/g, ' ').trim();
  26 | /** Outcome by meaning, not by exact copy (ASSUMPTION in scenarios.feature). */
  27 | const outcomeOf = (text: string) => (/^action success/i.test(text) ? 'success' : /^action unsuc/i.test(text) ? 'failure' : 'unknown');
  28 | 
  29 | async function sample(page: Page, n: number): Promise<{ counts: number[]; texts: string[] }> {
  30 |   const counts: number[] = []; const texts: string[] = [];
  31 |   for (let i = 0; i < n; i++) {
  32 |     await ui(page).clickHere.click();
  33 |     await page.waitForLoadState('domcontentloaded');
  34 |     counts.push(await ui(page).notification.count());
> 35 |     texts.push(copyOf(await ui(page).notification.first().innerText()));
     |                                                           ^ TimeoutError: locator.innerText: Timeout 10000ms exceeded.
  36 |   }
  37 |   return { counts, texts };
  38 | }
  39 | 
  40 | test.describe('DEMO-606 Practice portal — notification copy', () => {
  41 |   test('SCN-001: Every notification uses approved copy', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  42 |     let s!: { counts: number[]; texts: string[] };
  43 |     await journey.step('Given I am on the Notification Message page', async () => { await gotoPage(page, PATH.notification); });
  44 |     await journey.step('When I click "Click here" 12 times, reading the notification after each click', async () => { s = await sample(page, REQ.SAMPLES); });
  45 |     await journey.step('Then each click showed exactly one notification', async () => {
  46 |       expect.soft(s.counts.filter((c) => c !== REQ.NOTIFICATIONS_PER_CLICK), '[REQ AC-1] exactly one notification per click').toEqual([]);
  47 |     });
  48 |     await journey.step('And every notification text is one of the approved messages', async () => {
  49 |       const offCopy = [...new Set(s.texts.filter((t) => !(REQ.APPROVED as readonly string[]).includes(t)))];
  50 |       expect.soft(offCopy, `[REQ AC-1] only approved copy (seen: ${[...new Set(s.texts)].join(' | ')})`).toEqual([]);
  51 |     });
  52 |   });
  53 | 
  54 |   test('SCN-002: Both outcomes occur across repeated clicks', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
  55 |     let outcomes: string[] = [];
  56 |     await journey.step('Given I am on the Notification Message page', async () => { await gotoPage(page, PATH.notification); });
  57 |     await journey.step('When I click "Click here" 12 times, noting each outcome', async () => { outcomes = (await sample(page, REQ.SAMPLES)).texts.map(outcomeOf); });
  58 |     await journey.step('Then both a success and a failure outcome were observed', async () => {
  59 |       expect([...new Set(outcomes)].filter((o) => o !== 'unknown').sort(), '[REQ AC-2] both outcomes occur').toEqual([...REQ.OUTCOMES].sort());
  60 |     });
  61 |   });
  62 | });
  63 | 
```