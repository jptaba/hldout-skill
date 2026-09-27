/**
 * Held-out acceptance tests for DQ-3 — "Links page - new-tab links and HTTP status diagnostic links".
 * Written from evaluations/DQ-3/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { APIRequestContext, Page, Request } from '@playwright/test';
import { test, expect, gotoPage, type ApiResponse } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from DQ-3 (never edit during hardening)
const REQ = {
  PAGE_PATH: '/links',
  HOME_URL: 'https://demoqa.com/',
  HEADING: 'Links',
  NEW_TAB_CAPTION: 'Following links will open new tab',
  API_CAPTION: 'Following links will send an api call',
  HOME_LABEL: 'Home',
  API_LINKS: ['Created', 'No Content', 'Moved', 'Bad Request', 'Unauthorized', 'Forbidden', 'Not Found'],
  MESSAGE_PREFIX: 'Link has responded',
  message: (code: number, text: string) => `Link has responded with status ${code} and status text ${text}`,
  DIAGNOSTIC: [
    { link: 'Created', path: '/created', code: 201, text: 'Created' },
    { link: 'No Content', path: '/no-content', code: 204, text: 'No Content' },
    { link: 'Moved', path: '/moved', code: 301, text: 'Moved Permanently' },
    { link: 'Bad Request', path: '/bad-request', code: 400, text: 'Bad Request' },
    { link: 'Unauthorized', path: '/unauthorized', code: 401, text: 'Unauthorized' },
    { link: 'Forbidden', path: '/forbidden', code: 403, text: 'Forbidden' },
    { link: 'Not Found', path: '/invalid-url', code: 404, text: 'Not Found' },
  ],
  EMPTY_BODY_PATHS: ['/created', '/no-content', '/bad-request', '/unauthorized', '/forbidden', '/invalid-url'],
  MOVED_STATUS: 301,
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = {
  /** GET /created */ created: '/created',
  /** GET /no-content */ nocontent: '/no-content',
  /** GET /moved */ moved: '/moved',
  /** GET /bad-request */ badrequest: '/bad-request',
  /** GET /unauthorized */ unauthorized: '/unauthorized',
  /** GET /forbidden */ forbidden: '/forbidden',
  /** GET /invalid-url */ invalidurl: '/invalid-url',
};
void EP;

/**
 * GET without following redirects. The `api` fixture has no redirect option (it follows 3xx), so this uses the
 * fixture's `apiContext` directly and attaches the exchange in the same "api-exchange" format for triage/evidence.
 */
let exchangeNo = 0;
async function getNoRedirect(ctx: APIRequestContext, path: string): Promise<ApiResponse<string>> {
  const started = Date.now();
  const res = await ctx.fetch(path, { method: 'GET', maxRedirects: 0, failOnStatusCode: false });
  const durationMs = Date.now() - started;
  const text = await res.text();
  exchangeNo++;
  const exchange = {
    request: { method: 'GET', url: res.url(), headers: {}, body: undefined, note: 'redirects not followed' },
    response: { status: res.status(), durationMs, headers: res.headers(), body: text },
  };
  await test.info().attach(`api-exchange ${String(exchangeNo).padStart(2, '0')} GET ${new URL(res.url()).pathname} → ${res.status()}`,
    { body: JSON.stringify(exchange, null, 2), contentType: 'application/json' });
  return { status: res.status(), ok: res.ok(), headers: res.headers(), body: text, text, durationMs, url: res.url() };
}

// Locators (mechanics).
const newTabSection = (page: Page) => page.locator('div').filter({ has: page.getByText(REQ.NEW_TAB_CAPTION, { exact: true }) }).last(); // TODO(harden)
const apiSection = (page: Page) => page.locator('div').filter({ has: page.getByText(REQ.API_CAPTION, { exact: true }) }).last(); // TODO(harden)
const apiLink = (page: Page, label: string) => page.getByRole('link', { name: label, exact: true }); // TODO(harden)
const responseMessages = (page: Page) => page.getByText(REQ.MESSAGE_PREFIX); // TODO(harden)

async function openLinksPage(page: Page) {
  await gotoPage(page, REQ.PAGE_PATH);
  await expect(apiLink(page, 'Created'), 'precondition: Links page rendered').toBeVisible();
}

test.describe('DQ-3 Links page - new-tab links and HTTP status diagnostic links', () => {
  test('SCN-001: The Links page shows its heading, both sections and the api-call links in order', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    await journey.step('Given I am on the Links page', () => openLinksPage(page));
    await journey.step('Then the page heading reads "Links"', async () => {
      await expect.soft(page.getByRole('heading', { name: REQ.HEADING, exact: true }), '[REQ AC-1] heading "Links"').toBeVisible(); // TODO(harden)
    });
    await journey.step('And a section captioned "Following links will open new tab" is shown', async () => {
      await expect.soft(page.getByText(REQ.NEW_TAB_CAPTION, { exact: true }), '[REQ AC-1] new-tab caption').toBeVisible(); // TODO(harden)
    });
    await journey.step('And a section captioned "Following links will send an api call" is shown', async () => {
      await expect.soft(page.getByText(REQ.API_CAPTION, { exact: true }), '[REQ AC-1] api-call caption').toBeVisible(); // TODO(harden)
    });
    await journey.step('And the api-call section contains exactly the links Created, No Content, Moved, Bad Request, Unauthorized, Forbidden, Not Found, in this order', async () => {
      const labels = (await apiSection(page).getByRole('link').allInnerTexts()).map((s) => s.trim());
      expect.soft(labels, '[REQ AC-1] api-call links, exact and in order').toEqual([...REQ.API_LINKS]);
    });
    await journey.step('And no response message is shown before any api-call link has been clicked (page ready: api-call links visible)', async () => {
      await expect(responseMessages(page), '[REQ AC-1] no response message before a click').toHaveCount(0);
    });
  });

  test('SCN-002: The static Home link opens the home page in a new tab', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
    let popup!: Page;
    await journey.step('Given I am on the Links page', () => openLinksPage(page));
    await journey.step('When I click the link labelled "Home"', async () => {
      const popupP = page.waitForEvent('popup');
      await page.getByRole('link', { name: REQ.HOME_LABEL, exact: true }).click(); // TODO(harden)
      popup = await popupP;
    });
    await journey.step('Then the site home page https://demoqa.com/ opens in a new browser tab', async () => {
      await expect(popup, '[REQ AC-2] new tab shows the home page').toHaveURL(REQ.HOME_URL);
    });
    await journey.step('And the original tab stays on the Links page', async () => {
      await expect(page, '[REQ AC-2] original tab stays on /links').toHaveURL(new RegExp(`${REQ.PAGE_PATH}$`));
    });
  });

  test('SCN-003: The dynamic Home link has a random suffix and opens the home page in a new tab', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    let first = '';
    let popup!: Page;
    const secondLink = () => newTabSection(page).getByRole('link').nth(1); // TODO(harden)
    await journey.step('Given I am on the Links page', () => openLinksPage(page));
    await journey.step('Then the second link in the new-tab section has a label that starts with "Home" followed by a suffix', async () => {
      first = (await secondLink().innerText()).trim();
      expect(first, '[REQ AC-3] label starts with "Home" followed by a suffix').toMatch(/^Home.+$/s);
    });
    await journey.step('And the suffix is different after the page is reloaded', async () => {
      await page.reload();
      await expect(apiLink(page, 'Created'), 'precondition: Links page re-rendered').toBeVisible();
      const second = (await secondLink().innerText()).trim();
      expect(second, '[REQ AC-3] label starts with "Home" after reload').toMatch(/^Home.+$/s);
      expect(second.slice(REQ.HOME_LABEL.length), '[REQ AC-3] suffix differs after reload').not.toBe(first.slice(REQ.HOME_LABEL.length));
    });
    await journey.step('When I click that link', async () => {
      const popupP = page.waitForEvent('popup');
      await secondLink().click();
      popup = await popupP;
    });
    await journey.step('Then the site home page https://demoqa.com/ opens in a new browser tab', async () => {
      await expect(popup, '[REQ AC-3] new tab shows the home page').toHaveURL(REQ.HOME_URL);
    });
  });

  REQ.DIAGNOSTIC.forEach((row, i) => {
    test(`SCN-004.${i + 1}: Each diagnostic endpoint answers with its status code (${row.link}: GET ${row.path})`, { tag: ['@AC-4', '@type:contract', '@layer:api', '@P1'] }, async ({ apiContext, journey }) => {
      let res!: ApiResponse<string>;
      await journey.step(`When a client sends GET ${row.path} without following redirects`, async () => { res = await getNoRedirect(apiContext, row.path); });
      await journey.step(`Then the response status is ${row.code}`, async () => {
        expect(res.status, `[REQ AC-4] GET ${row.path} → ${row.code}`).toBe(row.code);
      });
    });
  });

  REQ.EMPTY_BODY_PATHS.forEach((path, i) => {
    test(`SCN-005.${i + 1}: Diagnostic responses other than /moved carry no body (GET ${path})`, { tag: ['@AC-5', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
      let res!: ApiResponse;
      await journey.step(`When a client sends GET ${path}`, async () => { res = await api.get(path); });
      await journey.step('Then the response body is empty', async () => {
        expect(res.text, `[REQ AC-5] GET ${path} body is empty`).toBe('');
      });
    });
  });

  test('SCN-006: GET /moved answers 301 with a Location header pointing to the home page', { tag: ['@AC-6', '@type:contract', '@layer:api', '@P2'] }, async ({ apiContext, journey }) => {
    let res!: ApiResponse<string>;
    await journey.step('When a client sends GET /moved without following redirects', async () => { res = await getNoRedirect(apiContext, EP.moved); });
    await journey.step('Then the response status is 301', async () => {
      expect(res.status, '[REQ AC-6] GET /moved → 301').toBe(REQ.MOVED_STATUS);
    });
    await journey.step('And the response carries a Location header that points to the site home page https://demoqa.com/', async () => {
      const location = res.headers['location'];
      expect(location, '[REQ AC-6] Location header present').toBeTruthy();
      expect(new URL(location ?? '', res.url).href, '[REQ AC-6] Location points to the home page').toBe(REQ.HOME_URL);
    });
  });

  REQ.DIAGNOSTIC.forEach((row, i) => {
    test(`SCN-007.${i + 1}: Clicking a diagnostic link reports its result on the page (${row.link})`, { tag: ['@AC-7', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
      await journey.step('Given I am on the Links page', () => openLinksPage(page));
      await journey.step(`When I click the "${row.link}" link`, () => apiLink(page, row.link).click());
      await journey.step(`Then the message "${REQ.message(row.code, row.text)}" is shown`, async () => {
        await expect(responseMessages(page), `[REQ AC-7] message after clicking ${row.link}`).toHaveText(REQ.message(row.code, row.text));
      });
    });
  });

  REQ.DIAGNOSTIC.forEach((row, i) => {
    test(`SCN-008.${i + 1}: The page reports the status its own GET request really received (${row.link})`, { tag: ['@AC-8', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, journey }) => {
      const calls: Request[] = [];
      let popups = 0;
      await journey.step('Given I am on the Links page', async () => {
        await openLinksPage(page);
        page.on('request', (r) => { if (new URL(r.url()).pathname === row.path) calls.push(r); });
        page.context().on('page', () => { popups++; });
      });
      await journey.step(`When I click the "${row.link}" link`, async () => {
        await apiLink(page, row.link).click();
        await expect(responseMessages(page), 'precondition: a response message appeared').toBeVisible();
      });
      await journey.step(`Then the browser sends exactly one GET request to ${row.path}`, async () => {
        expect(calls.map((r) => r.method()), `[REQ AC-8] exactly one GET to ${row.path}`).toEqual(['GET']);
      });
      await journey.step('And the status code shown in the message equals the HTTP status of that request', async () => {
        const status = (await calls[0]?.response())?.status();
        const shown = Number((await responseMessages(page).innerText()).match(/status (\d{3})/)?.[1]);
        expect(shown, `[REQ AC-8] shown code equals the HTTP status of GET ${row.path}`).toBe(status);
      });
      await journey.step('And the browser stays on the Links page with no new tab', async () => {
        await expect(page, '[REQ AC-8] stays on /links').toHaveURL(new RegExp(`${REQ.PAGE_PATH}$`));
        expect(popups, '[REQ AC-8] no new tab').toBe(0);
      });
    });
  });

  test('SCN-009: Only the latest diagnostic result is shown', { tag: ['@AC-9', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
    const forbidden = REQ.DIAGNOSTIC[5];
    const created = REQ.DIAGNOSTIC[0];
    await journey.step('Given I am on the Links page', () => openLinksPage(page));
    await journey.step('And I have clicked the "Forbidden" link and its message is shown', async () => {
      await apiLink(page, forbidden.link).click();
      await expect(responseMessages(page), 'precondition: Forbidden message shown').toHaveText(REQ.message(forbidden.code, forbidden.text));
    });
    await journey.step('When I click the "Created" link', () => apiLink(page, created.link).click());
    await journey.step('Then only one response message is shown, and it reports 201 Created', async () => {
      await expect(page.getByText(REQ.message(created.code, created.text)), '[REQ AC-9] 201 Created message shown').toBeVisible();
      await expect(responseMessages(page), '[REQ AC-9] only one response message').toHaveCount(1);
    });
  });
});
