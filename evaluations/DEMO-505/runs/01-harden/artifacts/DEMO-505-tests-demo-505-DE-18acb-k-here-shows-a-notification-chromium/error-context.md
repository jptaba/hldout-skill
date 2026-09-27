# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-505\tests\demo-505.spec.ts >> DEMO-505 Practice portal — hovers, number input and notifications >> SCN-004: Clicking "Click here" shows a notification
- Location: evaluations\DEMO-505\tests\demo-505.spec.ts:54:3

# Error details

```
Error: [REQ AC-3] exactly one notification

expect(locator).toHaveCount(expected) failed

Locator:  getByRole('alert')
Expected: 1
Received: 0
Timeout:  5000ms

Call log:
  - [REQ AC-3] exactly one notification getByRole('alert') with timeout 5000ms
  - waiting for getByRole('alert')
    14 × locator resolved to 0 elements
       - unexpected value "0"

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
  2  |  * Held-out acceptance tests for DEMO-505 — "Practice portal — hovers, number input and notifications".
  3  |  * Generated from evaluations/DEMO-505/scenarios.feature (requirement only). UI only.
  4  |  */
  5  | import type { Page } from '@playwright/test';
  6  | import { test, expect, gotoPage } from '../../../heldout-support/fixtures';
  7  | 
  8  | // @req-constants-start — expected outcomes copied verbatim from DEMO-505 (never edit during hardening)
  9  | const REQ = {
  10 |   AVATARS: [1, 2, 3],
  11 |   CAPTION: (n: number) => `name: user${n}`,
  12 |   PROFILE_LINK: 'View profile',
  13 |   DIGITS: '42',
  14 |   LETTERS: 'abc',
  15 |   NOTIFICATION_COUNT: 1,
  16 | } as const;
  17 | // @req-constants-end
  18 | 
  19 | const PATH = { hovers: '/hovers', inputs: '/inputs', notification: '/notification_message_rendered' };
  20 | 
  21 | const ui = (page: Page) => ({
  22 |   avatar: (n: number) => page.getByRole('img', { name: 'User Avatar' }).nth(n - 1), // TODO(harden)
  23 |   caption: (n: number) => page.getByRole('heading', { name: REQ.CAPTION(n) }), // TODO(harden)
  24 |   profileLink: (n: number) => page.getByRole('link', { name: REQ.PROFILE_LINK }).nth(n - 1), // TODO(harden)
  25 |   numberField: page.getByRole('spinbutton'), // TODO(harden)
  26 |   clickHere: page.getByRole('link', { name: 'Click here' }), // TODO(harden)
  27 |   notification: page.getByRole('alert'), // TODO(harden)
  28 | });
  29 | 
  30 | test.describe('DEMO-505 Practice portal — hovers, number input and notifications', () => {
  31 |   REQ.AVATARS.forEach((n, i) => {
  32 |     test(`SCN-001.${i + 1}: Hovering an avatar reveals that user's caption (avatar ${n})`, { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  33 |       await journey.step('Given I am on the Hovers page', async () => { await gotoPage(page, PATH.hovers); });
  34 |       await journey.step(`When I hover over avatar ${n}`, async () => { await ui(page).avatar(n).hover(); });
  35 |       await journey.step(`Then I see "name: user${n}" and a "View profile" link`, async () => {
  36 |         await expect.soft(ui(page).caption(n), `[REQ AC-1] caption for avatar ${n}`).toBeVisible();
  37 |         await expect.soft(ui(page).profileLink(n), `[REQ AC-1] "View profile" link for avatar ${n}`).toBeVisible();
  38 |       });
  39 |     });
  40 |   });
  41 | 
  42 |   test('SCN-002: The number field accepts digits', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  43 |     await journey.step('Given I am on the Inputs page', async () => { await gotoPage(page, PATH.inputs); });
  44 |     await journey.step('When I type "42" into the number field', async () => { await ui(page).numberField.pressSequentially(REQ.DIGITS); });
  45 |     await journey.step('Then the field value is "42"', async () => { await expect(ui(page).numberField, '[REQ AC-2] digits accepted').toHaveValue(REQ.DIGITS); });
  46 |   });
  47 | 
  48 |   test('SCN-003: The number field rejects non-numeric characters', { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  49 |     await journey.step('Given I am on the Inputs page', async () => { await gotoPage(page, PATH.inputs); });
  50 |     await journey.step('When I type "abc" into the number field', async () => { await ui(page).numberField.pressSequentially(REQ.LETTERS); });
  51 |     await journey.step('Then the field is empty', async () => { await expect(ui(page).numberField, '[REQ AC-2] letters cannot be entered').toHaveValue(''); });
  52 |   });
  53 | 
  54 |   test('SCN-004: Clicking "Click here" shows a notification', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P3'] }, async ({ page, journey }) => {
  55 |     await journey.step('Given I am on the Notification Message page', async () => { await gotoPage(page, PATH.notification); });
  56 |     await journey.step('When I click "Click here"', async () => { await ui(page).clickHere.click(); });
  57 |     await journey.step('Then exactly one non-empty notification is shown', async () => {
> 58 |       await expect(ui(page).notification, '[REQ AC-3] exactly one notification').toHaveCount(REQ.NOTIFICATION_COUNT);
     |                                                                                  ^ Error: [REQ AC-3] exactly one notification
  59 |       await expect(ui(page).notification, '[REQ AC-3] notification is not empty').toHaveText(/\w{3,}/);
  60 |     });
  61 |   });
  62 | });
  63 | 
```