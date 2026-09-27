# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DQ-3\tests\dq-3.spec.ts >> DQ-3 Links page - new-tab links and HTTP status diagnostic links >> SCN-007.3: Clicking a diagnostic link reports its result on the page (Moved)
- Location: evaluations\DQ-3\tests\dq-3.spec.ts:174:5

# Error details

```
Error: [REQ AC-7] message after clicking Moved

expect(locator).toHaveText(expected) failed

Locator:  getByText('Link has responded')
Expected: "Link has responded with status 301 and status text Moved Permanently"
Received: "Link has responded with staus 301 and status text Moved Permanently"
Timeout:  5000ms

Call log:
  - [REQ AC-7] message after clicking Moved getByText('Link has responded') with timeout 5000ms
  - waiting for getByText('Link has responded')
    11 × locator resolved to <p id="linkResponse">…</p>
       - unexpected value "Link has responded with staus 301 and status text Moved Permanently"

```

```yaml
- paragraph: Link has responded with staus 301 and status text Moved Permanently
```

# Test source

```ts
  78  |   test('SCN-001: The Links page shows its heading, both sections and the api-call links in order', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  79  |     await journey.step('Given I am on the Links page', () => openLinksPage(page));
  80  |     await journey.step('Then the page heading reads "Links"', async () => {
  81  |       await expect.soft(page.getByRole('heading', { name: REQ.HEADING, exact: true }), '[REQ AC-1] heading "Links"').toBeVisible();
  82  |     });
  83  |     await journey.step('And a section captioned "Following links will open new tab" is shown', async () => {
  84  |       await expect.soft(page.getByText(REQ.NEW_TAB_CAPTION, { exact: true }), '[REQ AC-1] new-tab caption').toBeVisible();
  85  |     });
  86  |     await journey.step('And a section captioned "Following links will send an api call" is shown', async () => {
  87  |       await expect.soft(page.getByText(REQ.API_CAPTION, { exact: true }), '[REQ AC-1] api-call caption').toBeVisible();
  88  |     });
  89  |     await journey.step('And the api-call section contains exactly the links Created, No Content, Moved, Bad Request, Unauthorized, Forbidden, Not Found, in this order', async () => {
  90  |       const labels = (await apiLinks(page).allInnerTexts()).map((s) => s.trim());
  91  |       expect.soft(labels, '[REQ AC-1] api-call links, exact and in order').toEqual([...REQ.API_LINKS]);
  92  |     });
  93  |     await journey.step('And no response message is shown before any api-call link has been clicked (page ready: api-call links visible)', async () => {
  94  |       await expect(responseMessages(page), '[REQ AC-1] no response message before a click').toHaveCount(0);
  95  |     });
  96  |   });
  97  | 
  98  |   test('SCN-002: The static Home link opens the home page in a new tab', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  99  |     let popup!: Page;
  100 |     await journey.step('Given I am on the Links page', () => openLinksPage(page));
  101 |     await journey.step('When I click the link labelled "Home"', async () => {
  102 |       const popupP = page.waitForEvent('popup');
  103 |       await page.getByRole('link', { name: REQ.HOME_LABEL, exact: true }).click();
  104 |       popup = await popupP;
  105 |     });
  106 |     await journey.step('Then the site home page https://demoqa.com/ opens in a new browser tab', async () => {
  107 |       await expect(popup, '[REQ AC-2] new tab shows the home page').toHaveURL(REQ.HOME_URL);
  108 |     });
  109 |     await journey.step('And the original tab stays on the Links page', async () => {
  110 |       await expect(page, '[REQ AC-2] original tab stays on /links').toHaveURL(new RegExp(`${REQ.PAGE_PATH}$`));
  111 |     });
  112 |   });
  113 | 
  114 |   test('SCN-003: The dynamic Home link has a random suffix and opens the home page in a new tab', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  115 |     let first = '';
  116 |     let popup!: Page;
  117 |     const secondLink = () => newTabLinks(page).nth(1);
  118 |     await journey.step('Given I am on the Links page', () => openLinksPage(page));
  119 |     await journey.step('Then the second link in the new-tab section has a label that starts with "Home" followed by a suffix', async () => {
  120 |       first = (await secondLink().innerText()).trim();
  121 |       expect(first, '[REQ AC-3] label starts with "Home" followed by a suffix').toMatch(/^Home.+$/s);
  122 |     });
  123 |     await journey.step('And the suffix is different after the page is reloaded', async () => {
  124 |       await page.reload();
  125 |       await expect(apiLink(page, 'Created'), 'precondition: Links page re-rendered').toBeVisible();
  126 |       const second = (await secondLink().innerText()).trim();
  127 |       expect(second, '[REQ AC-3] label starts with "Home" after reload').toMatch(/^Home.+$/s);
  128 |       expect(second.slice(REQ.HOME_LABEL.length), '[REQ AC-3] suffix differs after reload').not.toBe(first.slice(REQ.HOME_LABEL.length));
  129 |     });
  130 |     await journey.step('When I click that link', async () => {
  131 |       const popupP = page.waitForEvent('popup');
  132 |       await secondLink().click();
  133 |       popup = await popupP;
  134 |     });
  135 |     await journey.step('Then the site home page https://demoqa.com/ opens in a new browser tab', async () => {
  136 |       await expect(popup, '[REQ AC-3] new tab shows the home page').toHaveURL(REQ.HOME_URL);
  137 |     });
  138 |   });
  139 | 
  140 |   REQ.DIAGNOSTIC.forEach((row, i) => {
  141 |     test(`SCN-004.${i + 1}: Each diagnostic endpoint answers with its status code (${row.link}: GET ${row.path})`, { tag: ['@AC-4', '@type:contract', '@layer:api', '@P1'] }, async ({ apiContext, journey }) => {
  142 |       let res!: ApiResponse<string>;
  143 |       await journey.step(`When a client sends GET ${row.path} without following redirects`, async () => { res = await getNoRedirect(apiContext, row.path); });
  144 |       await journey.step(`Then the response status is ${row.code}`, async () => {
  145 |         expect(res.status, `[REQ AC-4] GET ${row.path} → ${row.code}`).toBe(row.code);
  146 |       });
  147 |     });
  148 |   });
  149 | 
  150 |   REQ.EMPTY_BODY_PATHS.forEach((path, i) => {
  151 |     test(`SCN-005.${i + 1}: Diagnostic responses other than /moved carry no body (GET ${path})`, { tag: ['@AC-5', '@type:contract', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  152 |       let res!: ApiResponse;
  153 |       await journey.step(`When a client sends GET ${path}`, async () => { res = await api.get(path); });
  154 |       await journey.step('Then the response body is empty', async () => {
  155 |         expect(res.text, `[REQ AC-5] GET ${path} body is empty`).toBe('');
  156 |       });
  157 |     });
  158 |   });
  159 | 
  160 |   test('SCN-006: GET /moved answers 301 with a Location header pointing to the home page', { tag: ['@AC-6', '@type:contract', '@layer:api', '@P2'] }, async ({ apiContext, journey }) => {
  161 |     let res!: ApiResponse<string>;
  162 |     await journey.step('When a client sends GET /moved without following redirects', async () => { res = await getNoRedirect(apiContext, EP.moved); });
  163 |     await journey.step('Then the response status is 301', async () => {
  164 |       expect(res.status, '[REQ AC-6] GET /moved → 301').toBe(REQ.MOVED_STATUS);
  165 |     });
  166 |     await journey.step('And the response carries a Location header that points to the site home page https://demoqa.com/', async () => {
  167 |       const location = res.headers['location'];
  168 |       expect(location, '[REQ AC-6] Location header present').toBeTruthy();
  169 |       expect(new URL(location ?? '', res.url).href, '[REQ AC-6] Location points to the home page').toBe(REQ.HOME_URL);
  170 |     });
  171 |   });
  172 | 
  173 |   REQ.DIAGNOSTIC.forEach((row, i) => {
  174 |     test(`SCN-007.${i + 1}: Clicking a diagnostic link reports its result on the page (${row.link})`, { tag: ['@AC-7', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  175 |       await journey.step('Given I am on the Links page', () => openLinksPage(page));
  176 |       await journey.step(`When I click the "${row.link}" link`, () => apiLink(page, row.link).click());
  177 |       await journey.step(`Then the message "${REQ.message(row.code, row.text)}" is shown`, async () => {
> 178 |         await expect(responseMessages(page), `[REQ AC-7] message after clicking ${row.link}`).toHaveText(REQ.message(row.code, row.text));
      |                                                                                               ^ Error: [REQ AC-7] message after clicking Moved
  179 |       });
  180 |     });
  181 |   });
  182 | 
  183 |   REQ.DIAGNOSTIC.forEach((row, i) => {
  184 |     test(`SCN-008.${i + 1}: The page reports the status its own GET request really received (${row.link})`, { tag: ['@AC-8', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, journey }) => {
  185 |       const calls: Request[] = [];
  186 |       let popups = 0;
  187 |       await journey.step('Given I am on the Links page', async () => {
  188 |         await openLinksPage(page);
  189 |         page.on('request', (r) => { if (new URL(r.url()).pathname === row.path) calls.push(r); });
  190 |         page.context().on('page', () => { popups++; });
  191 |       });
  192 |       await journey.step(`When I click the "${row.link}" link`, async () => {
  193 |         await apiLink(page, row.link).click();
  194 |         await expect(responseMessages(page), 'precondition: a response message appeared').toBeVisible();
  195 |       });
  196 |       await journey.step(`Then the browser sends exactly one GET request to ${row.path}`, async () => {
  197 |         expect(calls.map((r) => r.method()), `[REQ AC-8] exactly one GET to ${row.path}`).toEqual(['GET']);
  198 |       });
  199 |       await journey.step('And the status code shown in the message equals the HTTP status of that request', async () => {
  200 |         const status = (await calls[0]?.response())?.status();
  201 |         const shown = Number((await responseMessages(page).innerText()).match(/(\d{3})/)?.[1]); // the first 3-digit number in the message
  202 |         expect(shown, `[REQ AC-8] shown code equals the HTTP status of GET ${row.path}`).toBe(status);
  203 |       });
  204 |       await journey.step('And the browser stays on the Links page with no new tab', async () => {
  205 |         await expect(page, '[REQ AC-8] stays on /links').toHaveURL(new RegExp(`${REQ.PAGE_PATH}$`));
  206 |         expect(popups, '[REQ AC-8] no new tab').toBe(0);
  207 |       });
  208 |     });
  209 |   });
  210 | 
  211 |   test('SCN-009: Only the latest diagnostic result is shown', { tag: ['@AC-9', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  212 |     const forbidden = REQ.DIAGNOSTIC[5];
  213 |     const created = REQ.DIAGNOSTIC[0];
  214 |     await journey.step('Given I am on the Links page', () => openLinksPage(page));
  215 |     await journey.step('And I have clicked the "Forbidden" link and its message is shown', async () => {
  216 |       await apiLink(page, forbidden.link).click();
  217 |       await expect(responseMessages(page), 'precondition: Forbidden message shown').toContainText(String(forbidden.code));
  218 |     });
  219 |     await journey.step('When I click the "Created" link', () => apiLink(page, created.link).click());
  220 |     await journey.step('Then only one response message is shown, and it reports 201 Created', async () => {
  221 |       await expect(page.getByText(REQ.message(created.code, created.text)), '[REQ AC-9] 201 Created message shown').toBeVisible();
  222 |       await expect(responseMessages(page), '[REQ AC-9] only one response message').toHaveCount(1);
  223 |     });
  224 |   });
  225 | });
  226 | 
```