# Authoring the held-out Playwright tests (phase 3)

Write `evaluations/<KEY>/tests/<key-lowercase>.spec.ts` from `scenarios.feature` **before** looking
at the AUT. The draft encodes the oracle; hardening (phase 4) only fixes the mechanics.

## Template

```ts
import type { Page } from '@playwright/test';
import { test, expect, unique, checkShape, type Api, type ShapeRule, type TestData } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from <KEY> (never edit during hardening)
const REQ = {
  AC2_LOCKED_MESSAGE: 'Your account has been locked…',
  STATUS: { CREATED: 201, BAD_REQUEST: 400, UNAUTHORIZED: 401 },
  BOUNDARIES: [{ field: 'name', value: 1, outcome: 'rejected' }, { field: 'name', value: 2, outcome: 'accepted' }],
} as const;
// @req-constants-end

const EP = { orders: '/api/orders', order: (id: number) => `/api/orders/${id}` };   // as declared (# ENDPOINT)

test.describe('<KEY> <summary>', () => {
  // UI scenario
  test('SCN-001: <title>', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey, data }) => {
    await journey.step('Given I am on the sign-in page', async () => { await page.goto('/'); });
    await journey.step('When I sign in as the standard user', async () => {
      await page.getByLabel('Username').fill(data.users.standard.username); // TODO(harden)
    });
    await journey.step('Then I see my dashboard', async () => {
      await expect(page.getByRole('heading', { name: 'Dashboard' }), '[REQ AC-1] lands on dashboard').toBeVisible(); // TODO(harden)
    });
  });

  // API scenario
  test('SCN-005: <title>', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
    let res!: Awaited<ReturnType<Api['post']>>;
    await journey.step('When I POST a valid order', async () => { res = await api.post(EP.orders, { data: { item: unique('QA') } }); });
    await journey.step('Then the response status is 201', async () => {
      expect(res.status, '[REQ AC-5] create → 201').toBe(REQ.STATUS.CREATED);
    });
  });

  // Boundary outline → one test per Examples row
  REQ.BOUNDARIES.forEach((row, i) => {
    test(`SCN-006.${i + 1}: <title> (${row.field} ${row.value})`, { tag: ['@AC-4', '@type:boundary', '@layer:api'] }, async ({ api, journey }) => { /* … */ });
  });
});
```

## Fixtures (`heldout-support/fixtures.ts`)

| Fixture / helper | Purpose |
| --- | --- |
| `page` | Playwright page; `baseURL` = the story's AUT profile |
| `journey.step(gherkinLine, fn)` | One Gherkin line = one step. Captures an ARIA snapshot on failure (and after every step with `--capture`) |
| `api.get/post/put/patch/delete(path, { data, headers, params, cookies })` | HTTP client on the profile's `apiBaseURL`. Returns `{ status, body, text, headers, durationMs }`. Every exchange is attached, redacted, as triage and verdict evidence (replayable as curl). A string `data` is sent raw (e.g. malformed JSON) |
| `data` | `test-data.json`, with `${env:NAME}` resolved |
| `unique(prefix)` | Collision-free values for shared AUTs (`"QA k3x9q2-1"`, with a space) |
| `uniqueId(prefix)` | The same without spaces, for e-mails, user names and slugs (`` `${uniqueId('qa')}@example.com` ``) |
| `checkShape(value, schema, label)` | Contract check returning readable violations: `expect(checkShape(body, ROOM), '[REQ AC-11] schema').toEqual([])` |

## Conventions (triage, integrity, lint and verdict depend on them)

| Convention | Why |
| --- | --- |
| Title starts with the scenario id (`'SCN-003: …'`, outline rows `SCN-006.${i + 1}`) | Traceability |
| Tags `@AC-n`, `@type:<t>`, `@layer:<l>` matching the scenario (`heldout lint KEY --fix-tags` syncs them) | Results trace to requirement and test type; lint enforces it |
| One `journey.step` per Gherkin line, with the Gherkin text verbatim | Failing step reported in requirement language |
| Every requirement check: `expect(x, '[REQ AC-n] <what>')` | Triage: a failing `[REQ]` on a located element or declared endpoint is an application-defect candidate |
| An API body check names its call: `'[REQ AC-4] POST /createAccount returns balance 100.00'` | Triage and the verdict's reproduction pick that call as the evidence, not the last call made |
| Money and other decimals compared as the requirement writes them (`expect(Number(body.balance)).toBeCloseTo(100, 2)`), not converted to cents | The verdict shows `100 → 0`, readable to the owner |
| `[REQ AC-n strict]` when the locator itself is the requirement (accessible name, role, alt text) | Integrity freezes subject + matcher, and triage treats "not found" as an application candidate |
| Expected values in `@req-constants` or literal in `[REQ]` matchers | Frozen by the integrity check |
| Endpoints exactly as declared in `# ENDPOINT:` lines (keep them in one `EP` map) | Triage flags calls to undeclared endpoints as script defects |
| Guessed locators end with `// TODO(harden)` | Lint and integrity block the official run until they are hardened |
| Preconditions use plain `expect(…, 'precondition …')` (no `[REQ]`) | A broken precondition is not reported as a requirement failure |
| `expect.soft` when one scenario checks several facts | The report shows every deviation, not only the first |

## Style

- Locator preference: `getByRole` (with `name`) → `getByLabel` → `getByPlaceholder` → `getByText`
  → `getByTestId` → CSS. Use `exact: true` when names overlap.
- Web-first assertions only; for eventual consistency use `expect.poll(fn, { message: '[REQ …]', timeout })`.
  Never `waitForTimeout`.
- Independent, parallel-safe tests. Each builds its own data (`unique()`).
- Assert at the precision the requirement states, nothing more. Extra assertions create false defects.
- `test.only`, `test.fixme` and `.skip` are forbidden (lint error). An unimplemented feature is a
  failing test, not a skipped one.
- **Native dialogs** (`alert`, `confirm`, `prompt`): the action that opens one does not return while it is open.
  Register a handler before the action that records the dialog and answers it, then assert the record:

  ```ts
  const dialogs: { type: string; message: string }[] = [];
  page.on('dialog', (d) => { dialogs.push({ type: d.type(), message: d.message() }); void d.accept(); }); // d.dismiss() for Cancel
  await journey.step('When I submit the form', () => page.getByRole('button', { name: 'Submit' }).click());
  expect(dialogs, '[REQ AC-7] confirmation shown').toEqual([{ type: 'confirm', message: 'Press OK to proceed!' }]);
  ```
- **Something must NOT happen after an action** ("the form is not sent", "no message appears"): an immediate
  `toHaveCount(0)` passes before the app has had time to react. First wait for a positive sign that the app
  handled the action (a validation message, a request, the form re-rendered) — or, when there is none, a bounded
  wait for the unwanted outcome (`await expect(success).toBeVisible({ timeout: 5_000 })` expected to fail, via
  `expect.poll` over the window) — and say which in the step title.

## Data seeding and entry points

Full strategy: [data-and-journeys.md](data-and-journeys.md).

| Helper | Use |
| --- | --- |
| `seed.create(label, make, cleanup?)` | Establish a precondition (Given) through the AUT, normally its API. A failure becomes `[SEED] …` → triage **BLOCKED**. Cleanup runs after the test. API calls made inside are tagged `[seed]` and kept out of the evidence. When the application offers no way to delete the data, omit `cleanup`: the ledger records `none`; use unique names so leftovers never collide |
| `seed.track(label, created, cleanup)` | Register cleanup for data the scenario itself created (the POST under test, or data the AUT wrongly accepted) |
| `seed.tag` | Per-test tag for naming seeded data (sweepable) |
| `gotoPage(page, path)` | Entry-point navigation: DOMContentLoaded + bounded `load` settle |

- Never read "whatever exists" (e.g. `list[0]`) as a precondition. Seed your own record.
- Seed assertions are plain preconditions (`expect(…, 'create booking (seed)')`), never `[REQ]`.
- Declare plumbing-only endpoints used for seeding or cleanup as `# SEED-ENDPOINT:` in `scenarios.feature`.

### API pre-steps

| Helper | Use |
| --- | --- |
| `seed.once(key, label, make, ttlMs?)` | Auth or other reusable context, once per worker (e.g. a token). Not for the scenario's own subject |
| `seed.step(label, run)` | Lookups, discovery, protocol values (ETag/CSRF), state checks. No cleanup |
| `seed.until(label, probe, ready, { timeoutMs, intervalMs })` | Readiness / eventual consistency. BLOCKED on timeout |
| `@depends:SCN-x` (scenario tag) | Declares that the scenario's pre-steps rely on another scenario's endpoint working |

Validate each pre-step's output (the token or id you need), not just its status. See [data-and-journeys.md](data-and-journeys.md) §5b.
