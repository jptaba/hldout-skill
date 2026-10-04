# Writing the held-out tests (phase 2)

Write `output/<profile>/<KEY>/tests/<key-lowercase>.spec.ts` straight from the reviewed requirement contract
(`requirement-contract.json`), **before** anyone looks at the AUT. The draft encodes the oracle; hardening (phase 3)
only fixes the mechanics. Each test is one user journey, tied to the criteria it proves, one test type and the
requirement source it comes from. Its steps call the application's shared **journey fixtures**
([journeys.md](journeys.md)); every expectation stays in the test.

`heldout scaffold KEY` writes a head start: the imports, the `ASSUMPTION` / `OPEN-QUESTION` lines of the contract's
gaps, an empty `@req-constants` block, typed endpoint helpers and one stub per criterion (`TODO(test)`). Split a
criterion into as many tests as it needs (one `@type` each). `heldout journeys KEY` lists the fixtures you can call.

## Template

```ts
import { test, expect, expectResponse, unique, gotoPage, signIn, type Api, type Account } from '../../../../heldout-support/fixtures';
import { addFavourite, listFavourites } from '../../../../journeys/<profile>/api/favorites';   // journey fixtures (HOW)
import { openProduct } from '../../../../journeys/<profile>/ui/product';

// ASSUMPTION: G2 — status of a refused duplicate: 409 (the linked page shows it for the same API)
// OPEN-QUESTION: G3 — how many favourites may a customer keep?

// @req-constants-start — expected outcomes copied verbatim from <KEY> (never edit during hardening)
const REQ = {
  ADDED_MESSAGE: 'Product added to your favorites list.',
  STATUS: { CREATED: 201, UNAUTHORIZED: 401, CONFLICT: 409 },
  BOUNDARIES: [{ field: 'name', value: 1, outcome: 'rejected' }, { field: 'name', value: 2, outcome: 'accepted' }],
} as const;
// @req-constants-end

const EP = { favorites: '/favorites', favorite: (id: string) => `/favorites/${id}` };   // as the contract declares them

test.describe('<KEY> <summary>', () => {
  // from story AC-1
  test('SCN-001: A customer adds a product to favourites', { tag: ['@AC-1', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let res!: Awaited<ReturnType<Api['post']>>;
    await journey.step('Given I am a signed-in customer', async () => { me = await seed.account(); });
    await journey.step('When I POST /favorites with a product id', async () => { res = await api.post(EP.favorites, { headers: me.headers, data: { product_id: '…' } }); });
    await journey.step('Then the answer is 201', async () => {
      expectResponse(res, { status: REQ.STATUS.CREATED }, '[REQ AC-1] POST /favorites');
    });
  });

  // from story AC-5, linked/confluence-880001-favourites-api.md §Web shop
  test('SCN-005: Adding to favourites in the web shop', { tag: ['@AC-5', '@type:integration', '@layer:ui', '@P1'] }, async ({ page, journey, seed }) => {
    let me!: Account;
    await journey.step('Given I am a signed-in customer on a product page', async () => {
      me = await seed.account(); await signIn(page, me); await openProduct(page, '…');
    });
    await journey.step('When I click "Add to favourites"', async () => { await page.getByTestId('add-to-favorites').click(); }); // TODO(harden)
    await journey.step('Then I see "Product added to your favorites list."', async () => {
      await expect(page.getByText(REQ.ADDED_MESSAGE), '[REQ AC-5] the confirmation is shown').toBeVisible();
    });
  });

  // A table of cases: one test per row (SCN-006.1 … .n)
  // from linked/field-rules.csv
  REQ.BOUNDARIES.forEach((row, i) => {
    test(`SCN-006.${i + 1}: Name length limits (${row.field} ${row.value})`, { tag: ['@AC-4', '@type:boundary', '@layer:api'] }, async ({ api, journey }) => { /* … */ });
  });
});
```

## Tags and comment lines (the scripts read them)

| Element | Required | Meaning |
| --- | --- | --- |
| `test('SCN-nnn: <who does what, and the outcome>', …)` | yes | Unique test id. A table of cases is `` `SCN-nnn.${i + 1}: …` `` in a loop |
| `@AC-n` | yes (≥1) | The criteria the test proves (the contract's ids). An AC without a test downgrades the verdict |
| `@type:<t>` | yes (exactly 1) | Test type, from the taxonomy below |
| `// from …` right above the test | strongly recommended (lint warns) | The story section, linked page or image transcript it comes from, shown in the traceability matrix |
| `@layer:ui\|api\|e2e` | recommended | Which layer the test drives |
| `@P1`..`@P3` | recommended | P1: core journey / money / security; P3: cosmetic |
| `// ASSUMPTION:` / `// OPEN-QUESTION:` / `@needs-clarification` | when needed | Surfaced in the verdict. A `@needs-clarification` test checks the literal reading of an open question: a confirmed failure is a question for the owner (verdict at most PASS_WITH_WARNINGS), never a defect |
| `// OBSERVATION:` | when needed | Something seen during evaluation that the story's goal implies but no AC states. Listed for the owner; doesn't change the verdict. May be added after the freeze |
| `@NFR-<n>` | on a test that verifies one of the contract's non-functional requirements | One no test verifies is listed as not verified: at most PASS_WITH_WARNINGS |
| `@assumes:G<n>` | on every test whose expected value comes from an assumed oracle gap | A confirmed failure there is "an assumption the application contradicts" (a question for the owner), never a defect. Keep requirement-backed checks in other tests so they still count. An assumption that only leaves something unasserted: write `// ASSUMPTION: G<n> … (not asserted)` and tag nothing |
| `@depends:SCN-x` | when the test's pre-steps rely on another test's endpoint | A BLOCKED dependant names its cause |
| `// SEED-ENDPOINT: METHOD /path — why` | for plumbing calls in the spec | Endpoints the requirement doesn't declare, used only to seed or clean up. Calls the journey fixtures make count as plumbing too |

### Test-type taxonomy (`@type:`)

| Type | Use for | Aliases |
| --- | --- | --- |
| `functional` | the happy path does what the AC says | positive, happy |
| `negative` | invalid input, error handling, refusals | validation |
| `boundary` | values on and just outside limits (a table of cases) | |
| `security` | authentication, authorisation, data exposure | auth |
| `idempotency` | the same request sent again, one after the other: retries, repeated submits | |
| `concurrency` | different requests at the same moment on shared state: two buyers and the last item, a double booking | race, parallel |
| `audit` | an observable record of who did what and when: a history page, an activity endpoint | audit-trail, history |
| `composition` | several steps or ACs chained into one flow, one step's output the next one's input | workflow, chain |
| `integration` | cross-layer consistency: what the UI does is what the API returns, and back | e2e, cross-layer |
| `contract` | API schema / shape / status-code contract | schema |
| `accessibility` | accessible names, alt text, keyboard, WCAG criteria | a11y |

A requirement that fits none of them either has a concrete, observable outcome (then it is one of the types: a message
shown in red is `functional`), or it is a `nonFunctional` item the verdict lists as not verified. A slow environment is
never a defect: raise the config's `run` timeouts instead.

**What a throw-away environment can't show.** A `concurrency` test that passes shows the rule holds on one instance; a
race between replicas only shows on a multi-instance deployment (say so in an `// ASSUMPTION:` when the requirement is
about a scaled system). `security` tests check the application's own authentication and authorisation; platform
controls in front of it (TLS, gateway rate limits, a WAF) are `nonFunctional` unless the environment has them.

## Rules for what to test

1. **Cover every AC**, with the types the requirement implies: limits need `boundary`; "requires a token" needs
   `security`; "retries are safe" needs `idempotency`; "only one", a stock, a balance or a unique name under
   simultaneous use needs `concurrency`; "every change is recorded" with a place to read it needs `audit`; ACs that hand
   data to each other need one `composition` test; field labels or WCAG need `accessibility`; a schema needs
   `contract`. Add a type only when the requirement states or clearly implies it: an unstated expectation is a gap.
2. **Quote the requirement.** Expected texts, numbers, formulas and codes are copied verbatim from the contract (its
   quotes, outcomes, error model and answered gaps). Never "improve" them: a mismatch is what the evaluation finds.
3. **Black-box journeys.** Step titles describe what a user or client sees and does (`Given …`, `When …`, `Then …`),
   one observable action or outcome each. Locators are decided later.
4. **One root cause, one failure.** Don't assert the same rule in many tests (boundary rows assert "accepted", and one
   test asserts the exact success status). Record that choice as an `// ASSUMPTION:`.
5. **Ambiguity:** take the most literal reading and tag it `@needs-clarification`, or write an `// OPEN-QUESTION:` (not
   tested). Never ask the AUT which reading is right. Keep the tag on what the question decides only: what holds under
   **every** reading goes in a test of its own without the tag. When the readings share nothing, that test asserts the
   answer is one of them.
6. **Concurrency** (API layer): send the competing requests together (`Promise.all`), 2–5 at a time (respect the
   profile's `maxWorkers` and `minTestIntervalMs`), assert the invariant, never an order, and repeat the burst a few
   rounds inside the test.
7. **Audit:** assert the record through the UI or API that shows it. A trail kept only in server logs is a
   `nonFunctional` item.
8. **Composition:** tag every AC the flow chains and assert the hand-offs; single-AC tests keep their own checks.

## Journey fixtures: reuse, then add

The application's journey fixtures (`journeys/<profile>/ui/<domain>.ts`, `api/<domain>.ts`) hold the HOW every story
needs: open a page and wait until it is ready, fill a form, create and delete a record, find one. Call them for the
steps; they hold no expected value, so reading them can't leak the oracle. `heldout journeys KEY` lists them, the ones
the story concerns first, with what each calls and which stories proved it.

- **Reuse** a fixture whose doc comment says it does the step you need. A fixture marked `STALE` doesn't work any more:
  call it anyway if it's the right step (the hardener fixes it), or write the step in the test.
- **Add** a fixture when the step is something later stories will need too (signing in on a page, creating an order,
  opening the cart). Put it in the domain file it belongs to (create `journeys/<profile>/api/orders.ts` when there is
  none), exported, with a `/** doc comment */` saying what it does. Guessed routes, locators and fields get
  `// TODO(harden)`, as in the tests.
- **Keep in the test** what is only this story's: the action under test, and every assertion of what is expected.
- A fixture may check its own preconditions with a plain `expect(…, '… (precondition)')`. Never a `[REQ …]` message,
  never `expectResponse`, never a message or value the requirement says the application shows: return what the step
  produced and let the test assert it. The lint refuses anything else (`journeys/req-assertion`,
  `journeys/oracle-literal`).
- Fixtures take what they need as parameters (`api`, `seed`, `page`, the account) and import only from
  `heldout-support/fixtures` and other journey files, never from a story's folder.

## Fixtures (`heldout-support/fixtures.ts`)

| Fixture / helper | Purpose |
| --- | --- |
| `page` | Playwright page; `baseURL` = the story's AUT profile |
| `journey.step(title, fn)` | One Given / When / Then step. Captures an ARIA snapshot on failure (and after every step with `--capture`) |
| `api.get/post/put/patch/delete(path, { data, headers, params, cookies })` | HTTP client on the profile's `apiBaseURL`. Returns `{ status, body, text, headers, durationMs }`. Every exchange is attached, redacted, as triage and verdict evidence (replayable as curl). A string `data` is sent raw (e.g. malformed JSON) |
| `data` | `test-data.json`, with `${env:NAME}` resolved |
| `unique(prefix?)` | Collision-free values for shared AUTs, starting with the profile's data prefix (`"hldout k3x9q2-1"`, with a space); `unique('Guest')` for a name of your own |
| `uniqueId(prefix?)` | The same without spaces, for e-mails, user names and slugs |
| `expectResponse(res, { status, body? }, '[REQ AC-n] <call>')` | A requirement check of an API answer: status, and the exact body when given (soft). Frozen by integrity like any `[REQ]` assertion. Use it rather than a local helper, whose built messages integrity can't see |
| `checkShape(value, schema, label)` | Contract check returning readable violations: `expect(checkShape(body, ROOM), '[REQ AC-11] schema').toEqual([])` |

## Conventions (triage, integrity, lint and verdict depend on them)

| Convention | Why |
| --- | --- |
| Every requirement check: `expect(x, '[REQ AC-n] <what>')`, in the spec | Triage: a failing `[REQ]` on a located element or declared endpoint is an application-defect candidate |
| An API body check names its call: `'[REQ AC-4] POST /createAccount returns balance 100.00'` | Triage and the verdict's reproduction pick that call as the evidence |
| Money and other decimals compared as the requirement writes them (`toBeCloseTo(100, 2)`) | The verdict shows `100 → 0`, readable to the owner |
| `[REQ AC-n strict]` when the locator itself is the requirement (accessible name, role, alt text) | Integrity freezes subject + matcher, and triage treats "not found" as an application candidate |
| Expected values in `@req-constants` or literal in `[REQ]` matchers | Frozen by the integrity check |
| Endpoints exactly as the contract declares them (one `EP` map) | Triage flags calls to undeclared endpoints as script defects |
| Guessed locators, routes and fields end with `// TODO(harden)` (in the spec and in fixtures) | Lint and integrity block the official run until they are hardened |
| Preconditions use plain `expect(…, 'precondition …')` (no `[REQ]`) | A broken precondition is not reported as a requirement failure |
| `expect.soft` when one test checks several facts | The report shows every deviation, not only the first |

## Style

- Locator preference: `getByRole` (with `name`) → `getByLabel` → `getByPlaceholder` → `getByText`
  → `getByTestId` → CSS. Use `exact: true` when names overlap.
- Web-first assertions only; for eventual consistency use `expect.poll(fn, { message: '[REQ …]', timeout })`.
  Never `waitForTimeout`.
- Independent, parallel-safe tests. Each builds its own data (`unique()`).
- Assert at the precision the requirement states, nothing more. Extra assertions create false defects.
- `test.only`, `test.fixme` and `.skip` are forbidden (lint error). An unimplemented feature is a failing test, not a
  skipped one.
- **Native dialogs** (`alert`, `confirm`, `prompt`): the action that opens one does not return while it is open.
  Register a handler before the action that records the dialog and answers it, then assert the record:

  ```ts
  const dialogs: { type: string; message: string }[] = [];
  page.on('dialog', (d) => { dialogs.push({ type: d.type(), message: d.message() }); void d.accept(); }); // d.dismiss() for Cancel
  await journey.step('When I submit the form', () => page.getByRole('button', { name: 'Submit' }).click());
  expect(dialogs, '[REQ AC-7] confirmation shown').toEqual([{ type: 'confirm', message: 'Press OK to proceed!' }]);
  ```
- **Something must NOT happen after an action** ("the form is not sent", "no message appears"): an immediate
  `toHaveCount(0)` passes before the app has had time to react. First wait for a positive sign that the app handled
  the action (a validation message, a request, the form re-rendered) — or, when there is none, a bounded wait for the
  unwanted outcome — and say which in the step title.
- **A page that loads its record after it opens** (a details or edit page of a single-page app): before acting, wait
  for a value the page loads, not only for the URL. Otherwise a click can do nothing, now and then. A journey fixture
  that opens such a page waits for it.
- **Concurrency** (`@type:concurrency`, API): fire the competing calls together and check the invariant after each
  round. Keep the burst small and repeat it; the first round that breaks the rule fails the test:

  ```ts
  for (let round = 1; round <= 3; round++) {
    const target = await seed.create('a fresh review', () => createReview(api, author));
    const answers = await Promise.all([1, 2, 3].map(() => api.post(EP.like, { headers: liker.headers, data: { id: target.id } })));
    const after = await api.get(EP.reviews(target.product));
    expect.soft(answers.map((a) => a.status).filter((s) => s < 300).length, `[REQ AC-5] round ${round}: exactly one like is accepted`).toBe(1);
    expect(likesOf(after.body, target.id), `[REQ AC-5] round ${round}: GET /reviews counts one like`).toBe(1);
  }
  ```

  Never assert which request won or in what order they finished. Triage counts a concurrency test whose `[REQ]` check
  failed on any attempt as failed. To reproduce it live, give the `api-probe --chain` step `"parallel": 3`.
- **Audit** (`@type:audit`): read the record back from where the application shows it and check the fields the
  requirement lists: who (the signed-in account, not a value the request supplied), what, and when when stated.
- **Composition** (`@type:composition`): one test that chains the steps, passing each step's output (an id, a token) to
  the next. Tag every AC it chains and assert the hand-offs.
- **A length limit in a form field:** enter the over-long text with `fill`, which the field's `maxlength` applies to
  like typing.
- **"Not shown" is `toBeHidden()`, not `toHaveCount(0)`.** Pages often keep a message in the markup, hidden until it is
  needed.

## Data seeding and entry points

Full strategy: [data-and-journeys.md](data-and-journeys.md).

| Helper | Use |
| --- | --- |
| `seed.create(label, make, cleanup?)` | Establish a precondition (Given) through the AUT, normally its API. A failure becomes `[SEED] …` → triage **BLOCKED**. Cleanup runs after the test. API calls made inside are tagged `[seed]` and kept out of the evidence. A journey fixture that creates a record wraps it in `seed.create` |
| `seed.track(label, created, cleanup)` | Register cleanup for data the test itself created (the POST under test, or data the AUT wrongly accepted) |
| `seed.tag` | Per-test tag for naming seeded data (sweepable) |
| `seed.account()` · `signIn(page, account)` | A test user from the profile's accounts recipe and its UI sign-in. See [data-and-journeys.md](data-and-journeys.md) §4a |
| `gotoPage(page, path)` | Entry-point navigation: DOMContentLoaded + bounded `load` settle |

- Never read "whatever exists" (e.g. `list[0]`) as a precondition. Seed your own record.
- Seed assertions are plain preconditions (`expect(…, 'create booking (seed)')`), never `[REQ]`.
- Start where the AC starts: deep-link to the page it names, unless navigation is part of the requirement.

### API pre-steps

| Helper | Use |
| --- | --- |
| `seed.once(key, label, make, ttlMs?)` | Auth or other reusable context, once per worker (e.g. a token). Not for the test's own subject |
| `seed.step(label, run)` | Lookups, discovery, protocol values (ETag/CSRF), state checks. No cleanup |
| `seed.until(label, probe, ready, { timeoutMs, intervalMs })` | Readiness / eventual consistency. BLOCKED on timeout |
| `@depends:SCN-x` (test tag) | Declares that the test's pre-steps rely on another test's endpoint working |

Validate each pre-step's output (the token or id you need), not just its status. See [data-and-journeys.md](data-and-journeys.md) §5b.

## test-data.json

```json
{ "users": { "standard": { "username": "…", "password": "${env:AUT_PASSWORD}" } } }
```

Loaded by the `data` fixture, with `${env:NAME}` resolved from `.env`. Expected *outcomes* belong in the spec's
`@req-constants` block, not here: test data is plumbing, expected values are the oracle.
