# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-606\tests\demo-606.spec.ts >> DEMO-606 Practice portal — notification copy >> SCN-001: Every notification uses approved copy
- Location: evaluations\DEMO-606\tests\demo-606.spec.ts:42:3

# Error details

```
Error: [REQ AC-1] only approved copy (seen: Action successful | Action unsuccesful, please try again)

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Action unsuccesful, please try again",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f12e1]:
  - generic [ref=f12e4]:
    - text:  Action unsuccesful, please try again
    - link "×" [ref=f12e5] [cursor=pointer]:
      - /url: "#"
  - generic [ref=f12e6]:
    - link "Fork me on GitHub":
      - /url: https://github.com/tourdedave/the-internet
      - img "Fork me on GitHub" [ref=f12e7] [cursor=pointer]
    - generic [ref=f12e9]:
      - heading "Notification Message" [level=3] [ref=f12e10]
      - paragraph [ref=f12e11]:
        - text: The message displayed above the heading is a notification message. It is often used to convey information about an action previously taken by the user. Some rudimentary examples include 'Action successful', 'Action unsuccessful, please try again', etc.
        - link "Click here" [ref=f12e12] [cursor=pointer]:
          - /url: /notification_message
        - text: to load a new message.
  - generic [ref=f12e14]:
    - separator [ref=f12e15]
    - generic [ref=f12e16]:
      - text: Powered by
      - link "Elemental Selenium" [ref=f12e17] [cursor=pointer]:
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
  19 | // Hardened (hardening/hardening-log.md): the notification is a flash container without an alert role.
  20 | const ui = (page: Page) => ({
  21 |   clickHere: page.getByRole('link', { name: 'Click here' }),
  22 |   notification: page.locator('#flash'),
  23 | });
  24 | 
  25 | /** Notification text without the close icon (ux-copy.md: the × is not part of the copy). */
  26 | const copyOf = (raw: string) => raw.replace(/×/g, '').replace(/\s+/g, ' ').trim();
  27 | /** Outcome by meaning, not by exact copy (ASSUMPTION in scenarios.feature). */
  28 | const outcomeOf = (text: string) => (/^action success/i.test(text) ? 'success' : /^action unsuc/i.test(text) ? 'failure' : 'unknown');
  29 | 
  30 | async function sample(page: Page, n: number): Promise<{ counts: number[]; texts: string[] }> {
  31 |   const counts: number[] = []; const texts: string[] = [];
  32 |   for (let i = 0; i < n; i++) {
  33 |     await ui(page).clickHere.click();
  34 |     await page.waitForLoadState('domcontentloaded');
  35 |     counts.push(await ui(page).notification.count());
  36 |     texts.push(copyOf(await ui(page).notification.first().innerText()));
  37 |   }
  38 |   return { counts, texts };
  39 | }
  40 | 
  41 | test.describe('DEMO-606 Practice portal — notification copy', () => {
  42 |   test('SCN-001: Every notification uses approved copy', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  43 |     let s!: { counts: number[]; texts: string[] };
  44 |     await journey.step('Given I am on the Notification Message page', async () => { await gotoPage(page, PATH.notification); });
  45 |     await journey.step('When I click "Click here" 12 times, reading the notification after each click', async () => { s = await sample(page, REQ.SAMPLES); });
  46 |     await journey.step('Then each click showed exactly one notification', async () => {
  47 |       expect.soft(s.counts.filter((c) => c !== REQ.NOTIFICATIONS_PER_CLICK), '[REQ AC-1] exactly one notification per click').toEqual([]);
  48 |     });
  49 |     await journey.step('And every notification text is one of the approved messages', async () => {
  50 |       const offCopy = [...new Set(s.texts.filter((t) => !(REQ.APPROVED as readonly string[]).includes(t)))];
> 51 |       expect.soft(offCopy, `[REQ AC-1] only approved copy (seen: ${[...new Set(s.texts)].join(' | ')})`).toEqual([]);
     |                                                                                                          ^ Error: [REQ AC-1] only approved copy (seen: Action successful | Action unsuccesful, please try again)
  52 |     });
  53 |   });
  54 | 
  55 |   test('SCN-002: Both outcomes occur across repeated clicks', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
  56 |     let outcomes: string[] = [];
  57 |     await journey.step('Given I am on the Notification Message page', async () => { await gotoPage(page, PATH.notification); });
  58 |     await journey.step('When I click "Click here" 12 times, noting each outcome', async () => { outcomes = (await sample(page, REQ.SAMPLES)).texts.map(outcomeOf); });
  59 |     await journey.step('Then both a success and a failure outcome were observed', async () => {
  60 |       expect([...new Set(outcomes)].filter((o) => o !== 'unknown').sort(), '[REQ AC-2] both outcomes occur').toEqual([...REQ.OUTCOMES].sort());
  61 |     });
  62 |   });
  63 | });
  64 | 
```