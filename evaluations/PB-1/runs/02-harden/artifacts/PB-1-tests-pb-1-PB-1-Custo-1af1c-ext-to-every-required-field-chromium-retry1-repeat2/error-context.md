# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-1\tests\pb-1.spec.ts >> PB-1 Customer registration and sign-in >> SCN-001: Submitting an empty registration form shows a required message next to every required field
- Location: evaluations\PB-1\tests\pb-1.spec.ts:181:3

# Error details

```
Error: registration form shown (precondition)

expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Register', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - registration form shown (precondition) getByRole('button', { name: 'Register', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Register', exact: true })

```

```yaml
- banner:
  - heading "Error 1015" [level=1]
  - text: "Ray ID: a4183949cb10606a • 2026-09-27 05:49:12 UTC"
  - heading "You are being rate limited" [level=2]
- heading "What happened?" [level=2]
- paragraph: The owner of this website (parabank.parasoft.com) has banned you temporarily from accessing this website.
- paragraph:
  - text: Please see
  - link "https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/":
    - /url: https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/
  - text: for more details.
- text: Was this page helpful?
- button "Yes"
- button "No"
- paragraph:
  - text: "Cloudflare Ray ID:"
  - strong: a4183949cb10606a
  - text: "• Your IP:"
  - button "Click to reveal"
  - text: • Performance & security by
  - link "Cloudflare":
    - /url: https://www.cloudflare.com/5xx-error-landing
```

# Test source

```ts
  84  | /** A fresh, unique user name (letters + digits only, so it is safe in the REST path). */
  85  | function freshUsername(seed: Seed): string {
  86  |   serial += 1;
  87  |   return `pb1${seed.tag}${serial}${Math.random().toString(36).slice(2, 5)}`;
  88  | }
  89  | 
  90  | function validCustomer(data: TestData, seed: Seed, overrides: Partial<Customer> = {}): Customer {
  91  |   const c = data.customer;
  92  |   return {
  93  |     firstName: 'Hana', lastName: `Heldout${seed.tag.slice(-4)}`,
  94  |     street: c.address.street, city: c.address.city, state: c.address.state, zipCode: c.address.zipCode,
  95  |     phoneNumber: c.phoneNumber, ssn: c.ssn, username: freshUsername(seed), password: c.password,
  96  |     ...overrides,
  97  |   };
  98  | }
  99  | 
  100 | // ---- registration page (register.htm) -----------------------------------------------------------
  101 | 
  102 | /** Registration inputs have no accessible names (labels are separate table cells), so they are located by id. */
  103 | const FIELD: Record<string, (p: Page) => Locator> = {
  104 |   'First Name': (p) => p.locator('[id="customer.firstName"]'),
  105 |   'Last Name': (p) => p.locator('[id="customer.lastName"]'),
  106 |   Address: (p) => p.locator('[id="customer.address.street"]'),
  107 |   City: (p) => p.locator('[id="customer.address.city"]'),
  108 |   State: (p) => p.locator('[id="customer.address.state"]'),
  109 |   'Zip Code': (p) => p.locator('[id="customer.address.zipCode"]'),
  110 |   'Phone #': (p) => p.locator('[id="customer.phoneNumber"]'),
  111 |   SSN: (p) => p.locator('[id="customer.ssn"]'),
  112 |   Username: (p) => p.locator('[id="customer.username"]'),
  113 |   Password: (p) => p.locator('[id="customer.password"]'),
  114 |   Confirm: (p) => p.locator('[id="repeatedPassword"]'),
  115 | };
  116 | /** The form row that holds a field and its message ("next to" the field). */
  117 | const fieldRow = (p: Page, field: string): Locator => p.locator('tr').filter({ has: FIELD[field](p) });
  118 | const registerButton = (p: Page) => p.getByRole('button', { name: 'Register', exact: true });
  119 | 
  120 | async function fillRegistration(page: Page, c: Customer, confirm = c.password): Promise<void> {
  121 |   await FIELD['First Name'](page).fill(c.firstName);
  122 |   await FIELD['Last Name'](page).fill(c.lastName);
  123 |   await FIELD.Address(page).fill(c.street);
  124 |   await FIELD.City(page).fill(c.city);
  125 |   await FIELD.State(page).fill(c.state);
  126 |   await FIELD['Zip Code'](page).fill(c.zipCode);
  127 |   await FIELD['Phone #'](page).fill(c.phoneNumber);
  128 |   await FIELD.SSN(page).fill(c.ssn);
  129 |   await FIELD.Username(page).fill(c.username);
  130 |   await FIELD.Password(page).fill(c.password);
  131 |   await FIELD.Confirm(page).fill(confirm);
  132 | }
  133 | 
  134 | /** Sign the browser out (fresh visitor) without depending on the Log Out link under test in AC-6. */
  135 | async function signedOutVisitor(page: Page): Promise<void> {
  136 |   await page.context().clearCookies();
  137 | }
  138 | 
  139 | /** Precondition: register a customer through register.htm (gap G1: no REST registration endpoint in the story). */
  140 | async function registerCustomer(seed: Seed, page: Page, c: Customer, label = 'customer registered via register.htm'): Promise<Customer> {
  141 |   return seed.create(label, async () => {
  142 |     await signedOutVisitor(page);
  143 |     await open(page, PAGES.register);
  144 |     await fillRegistration(page, c);
  145 |     await registerButton(page).click(); await passBotCheck(page);
  146 |     await expect(page.getByText(REQ.AC3_CREATED), 'registration succeeded (precondition)').toBeVisible();
  147 |     return c;
  148 |   });
  149 | }
  150 | 
  151 | // ---- Customer Login panel (home page) ------------------------------------------------------------
  152 | 
  153 | const loginUsername = (p: Page) => p.locator('input[name="username"]');
  154 | const loginPassword = (p: Page) => p.locator('input[name="password"]');
  155 | const loginButton = (p: Page) => p.getByRole('button', { name: 'Log In', exact: true });
  156 | const loginPanelHeading = (p: Page) => p.getByRole('heading', { name: REQ.AC6_LOGIN_PANEL, exact: true });
  157 | 
  158 | async function signIn(page: Page, username: string, password: string): Promise<void> {
  159 |   await loginUsername(page).fill(username);
  160 |   await loginPassword(page).fill(password);
  161 |   await loginButton(page).click(); await passBotCheck(page);
  162 | }
  163 | 
  164 | // ---- Accounts Overview ----------------------------------------------------------------------------
  165 | 
  166 | /** Account numbers shown in the Accounts Overview (gap G2: how they are shown). */
  167 | const accountNumberLinks = (p: Page) => p.locator('#accountTable tbody a');
  168 | 
  169 | async function shownAccountNumbers(page: Page): Promise<string[]> {
  170 |   await expect(accountNumberLinks(page).first(), 'account numbers rendered (precondition)').toBeVisible();
  171 |   return (await accountNumberLinks(page).allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  172 | }
  173 | 
  174 | // ---- REST helpers ---------------------------------------------------------------------------------
  175 | 
  176 | async function restLogin(api: Api, username: string, password: string) {
  177 |   return api.get<RestCustomer>(EP.loginByUsernameAndPassword(username, password), { headers: { Accept: 'application/json' } });
  178 | }
  179 | 
  180 | test.describe('PB-1 Customer registration and sign-in', () => {
  181 |   test('SCN-001: Submitting an empty registration form shows a required message next to every required field', { tag: ['@AC-1', '@type:negative', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  182 |     await journey.step('Given I am on the registration page register.htm', async () => {
  183 |       await open(page, PAGES.register);
> 184 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
      |                                                                                    ^ Error: registration form shown (precondition)
  185 |     });
  186 |     await journey.step('When I submit the registration form with every field empty', async () => {
  187 |       await registerButton(page).click(); await passBotCheck(page);
  188 |     });
  189 |     await journey.step('Then I am still on the registration form', async () => {
  190 |       await expect(registerButton(page), '[REQ AC-1] still on the registration form').toBeVisible();
  191 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-1] no customer created').toHaveCount(0);
  192 |     });
  193 |     for (const { field, message } of REQ.AC1_REQUIRED) {
  194 |       await journey.step(`And "${message}" is shown next to ${field}`, async () => {
  195 |         await expect.soft(fieldRow(page, field), `[REQ AC-1] "${message}" next to ${field}`).toContainText(message);
  196 |       });
  197 |     }
  198 |     await journey.step('And no message is shown for Phone #', async () => {
  199 |       await expect(fieldRow(page, REQ.AC1_OPTIONAL_FIELD), '[REQ AC-1] no message for Phone #').not.toContainText(/required/i);
  200 |     });
  201 |   });
  202 | 
  203 |   test('SCN-002: Registering with a Confirm that differs from Password shows "Passwords did not match."', { tag: ['@AC-2', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  204 |     const c = validCustomer(data, seed);
  205 |     await journey.step('Given I am on the registration page register.htm', async () => {
  206 |       await open(page, PAGES.register);
  207 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  208 |     });
  209 |     await journey.step('When I submit a complete registration with a fresh user name whose Confirm differs from Password', async () => {
  210 |       await fillRegistration(page, c, `${c.password}x9`);
  211 |       await registerButton(page).click(); await passBotCheck(page);
  212 |     });
  213 |     await journey.step('Then the form shows "Passwords did not match."', async () => {
  214 |       await expect(page.getByText(REQ.AC2_MISMATCH), '[REQ AC-2] "Passwords did not match." shown').toBeVisible();
  215 |     });
  216 |   });
  217 | 
  218 |   test('SCN-003: A registration rejected for mismatched passwords creates no customer', { tag: ['@AC-2', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  219 |     const c = validCustomer(data, seed);
  220 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  221 |     await journey.step('Given I submitted a complete registration with a fresh user name whose Confirm differs from Password', async () => {
  222 |       await seed.step('registration with mismatched Confirm submitted via register.htm', async () => {
  223 |         await open(page, PAGES.register);
  224 |         await fillRegistration(page, c, `${c.password}x9`);
  225 |         await registerButton(page).click(); await passBotCheck(page);
  226 |         await expect(registerButton(page), 'form re-shown after the rejected registration (precondition)').toBeVisible();
  227 |       });
  228 |     });
  229 |     await journey.step('When I call GET /login/{username}/{password} with that user name and the Password I entered', async () => {
  230 |       res = await restLogin(api, c.username, c.password);
  231 |     });
  232 |     await journey.step('Then the call does not answer 200 with a customer', async () => {
  233 |       const gotCustomer = res.status === REQ.STATUS.OK && typeof res.body === 'object' && res.body !== null && 'id' in (res.body as object);
  234 |       expect(gotCustomer, `[REQ AC-2] user name cannot sign in (got ${res.status})`).toBe(false);
  235 |     });
  236 |   });
  237 | 
  238 |   test('SCN-004: A complete, valid registration welcomes the new customer and signs them in', { tag: ['@AC-3', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  239 |     const c = validCustomer(data, seed);
  240 |     await journey.step('Given I am on the registration page register.htm', async () => {
  241 |       await open(page, PAGES.register);
  242 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  243 |     });
  244 |     await journey.step('When I submit a complete, valid registration with a fresh user name', async () => {
  245 |       await fillRegistration(page, c);
  246 |       await registerButton(page).click(); await passBotCheck(page);
  247 |     });
  248 |     await journey.step('Then the page shows the heading "Welcome <username>"', async () => {
  249 |       await expect(page.getByRole('heading', { name: REQ.AC3_HEADING(c.username) }), '[REQ AC-3] heading Welcome <username>').toBeVisible();
  250 |     });
  251 |     await journey.step('And the page shows "Your account was created successfully. You are now logged in."', async () => {
  252 |       await expect(page.getByText(REQ.AC3_CREATED), '[REQ AC-3] account created text').toBeVisible();
  253 |     });
  254 |     await journey.step('And the left panel greets me with "Welcome <first name> <last name>"', async () => {
  255 |       await expect(page.getByText(REQ.AC3_GREETING(c.firstName, c.lastName)), '[REQ AC-3] left panel greeting').toBeVisible();
  256 |     });
  257 |     await journey.step('And the left panel shows the Account Services menu', async () => {
  258 |       await expect(page.getByRole('heading', { name: REQ.AC3_MENU }), '[REQ AC-3] Account Services menu').toBeVisible();
  259 |     });
  260 |   });
  261 | 
  262 |   test('SCN-005: Registering with a user name that is already taken shows "This username already exists."', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, journey, data, seed }) => {
  263 |     const existing = validCustomer(data, seed);
  264 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
  265 |       await registerCustomer(seed, page, existing);
  266 |     });
  267 |     await journey.step('And I am on the registration page register.htm as a new visitor', async () => {
  268 |       await signedOutVisitor(page);
  269 |       await open(page, PAGES.register);
  270 |       await expect(registerButton(page), 'registration form shown (precondition)').toBeVisible();
  271 |     });
  272 |     await journey.step('When I submit a complete registration with the same user name and a different first and last name', async () => {
  273 |       await fillRegistration(page, { ...existing, firstName: 'Other', lastName: `Dup${seed.tag.slice(-4)}` });
  274 |       await registerButton(page).click(); await passBotCheck(page);
  275 |     });
  276 |     await journey.step('Then "This username already exists." is shown next to Username', async () => {
  277 |       await expect(fieldRow(page, 'Username'), '[REQ AC-4] "This username already exists." next to Username').toContainText(REQ.AC4_DUPLICATE);
  278 |     });
  279 |   });
  280 | 
  281 |   test('SCN-006: A duplicate registration does not change the existing customer', { tag: ['@AC-4', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, data, seed }) => {
  282 |     const existing = validCustomer(data, seed);
  283 |     let res!: Awaited<ReturnType<typeof restLogin>>;
  284 |     await journey.step('Given a customer is registered with a fresh user name', async () => {
```