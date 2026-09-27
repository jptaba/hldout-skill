# Test data seeding and journey entry points

Held-out tests must be **independent, repeatable and correctly attributed**. Two decisions matter
most: where each scenario's data comes from, and where each journey starts.

## 1. Data seeding — principles

1. **Every test owns its data.** Never depend on records that happen to exist in the environment
   (for example "the first message in the list"). Create what the scenario needs, uniquely named.
2. **Preconditions are `Given`s, and `Given`s are seeded.** "Given a booking exists" / "Given I am
   signed in" is set up by `seed.create(…)`, not by assuming state, and not by clicking through the
   UI when an API exists.
3. **Seed through the black box.** Use the AUT's own interfaces (API first). Seeding is *mechanics*
   (HOW), so it may use endpoints the requirement doesn't cover, declared as `# SEED-ENDPOINT:`.
4. **Seed failures are not requirement failures.** `seed.create` re-throws as `[SEED] …`, and triage
   classifies it **BLOCKED** (scenario not evaluated), never APPLICATION_DEFECT for the AC under test.
5. **Clean up what you create** (reverse order, even when the test failed). Cleanup never fails a
   test; the outcome is recorded in the seed ledger, and `heldout run` lists every failed cleanup so the data
   can be removed. `HELDOUT_KEEP_DATA=1` keeps data for debugging. Many applications revoke earlier tokens when
   the user signs in again (a UI sign-in in the same test, another `GenerateToken`): a cleanup, or a later
   seed step, that reuses a token taken before that point gets 401. In the cleanup, try the token you have and take
   a fresh one only when the call answers 401. A fresh token on every cleanup costs one sign-in per record, which
   on applications with slow sign-in (password hashing) can double the suite's time.
6. **Tag everything.** Use `unique()` names and `seed.tag`, so leftovers are identifiable and sweepable
   on shared environments.
7. **Evidence.** The seed ledger (what was created, and whether it was cleaned up) is attached to each
   test and shown in the verdict's reproduction steps, so a reviewer can recreate the preconditions.

## 2. Where seed data comes from (preference order)

| # | Source | Use when | Notes |
| --- | --- | --- | --- |
| 1 | **The AUT's public API** (same contract real clients use) | an endpoint exists for the entity | Fastest and most deterministic. Declare non-requirement endpoints as `# SEED-ENDPOINT:` |
| 2 | **A test-data / seeding API** from the product team | the environment offers one | **Recommended to request** for evaluation environments: create, reset and sweep endpoints |
| 3 | **UI setup wrapped in `seed.create`** | no API exists (UI-only apps) | Slower, but still isolated, and a failure reads as BLOCKED, not as the AC failing |
| 4 | **Pre-provisioned reference data** (accounts in `test-accounts.csv`, catalogue items) | data is read-only by nature | Never mutate it. Reference it from `test-data.json` |
| 5 | Direct database / internal fixtures | **avoid** in held-out evaluation | Breaks black-box independence and couples tests to the implementation. Only with explicit approval, in a separate profile |

## 3. Strategy by data kind

| Kind | Example | Strategy |
| --- | --- | --- |
| Reference data | product catalogue, country list | Read-only; assert against the requirement, don't create |
| Per-test entity | a booking, an enquiry, a cart line | `seed.create` in the Given (+ cleanup), or `seed.track` when the When-step creates it |
| "Must not exist" id | unknown booking id for a 404 test | Seed it: create, then delete, and use that id. Never guess ids on shared environments |
| Signed-in state | "Given I am signed in" | API login + cookie/`storageState` when login isn't under test; UI sign-in inside `seed.create` otherwise |
| Expensive shared setup | a merchant account with configuration | Worker-scoped fixture (Playwright `{ scope: 'worker' }`), created once per worker, tagged, cleaned at worker end |

## 4. How it looks in a spec

```ts
import { test, expect, gotoPage, type Seed } from '../../../heldout-support/fixtures';

async function createBooking(seed: Seed, api: Api, data: TestData, b: Booking) {
  return seed.create('booking', async () => {
    const r = await api.post<{ bookingid: number }>('/booking', { data: b });
    expect(r.status, 'create booking (seed)').toBe(200);          // plain precondition, not [REQ]
    return r.body.bookingid;
  }, (id) => api.delete(`/booking/${id}`, { headers: auth(data) })); // cleanup after the test
}

test('SCN-004: …', { tag: ['@AC-4', '@type:functional', '@layer:api'] }, async ({ api, journey, data, seed }) => {
  let id = 0;
  await journey.step('Given I created a valid booking', async () => { id = await createBooking(seed, api, data, validBooking(data)); });
  await journey.step('When I GET /booking/{id}', async () => { /* the action under test */ });
});

// Data created by the scenario itself (the POST under test) is tracked for cleanup:
seed.track('booking', res.body.bookingid, (id) => api.delete(`/booking/${id}`, { headers: auth(data) }));
```

## 5b. API pre-steps (calls needed before the API under test)

API scenarios often need a chain of calls before the request under test. Each kind has one helper,
and **all of them** run in the `[seed]` phase. That means a ledger entry, BLOCKED on failure, the calls
kept out of requirement evidence, and the calls shown in the verdict as *API pre-steps* (P1, P2, …) for
the reviewer to run first.

| Pre-step kind | Example | Helper |
| --- | --- | --- |
| Auth context | staff/partner token, session cookie | `seed.once('staff-token', 'staff token (POST /login)', () => login())`: once per worker, reused while fresh (10 min default) |
| Data prerequisite | parent booking, an enquiry to read | `seed.create('booking', create, cleanup)` |
| State-transition chain | create → confirm → pay; create → delete (a "gone" id) | one `seed.create` whose `make` performs the whole chain |
| Lookup / discovery | find the id of the seeded record; read a server-issued ETag/CSRF value | `seed.step('look up …', lookup)` |
| Readiness / eventual consistency | wait until status = READY or the record is listed | `seed.until('visible to staff', probe, (v) => Boolean(v), { timeoutMs })` |
| Cross-scenario dependency | reading a booking depends on creating one working | `@depends:SCN-003` on the dependant scenario |

Example (a "reading a record without a token is refused" scenario):

```ts
const token = await seed.once('staff-token', 'staff token (POST /api/auth/login)', () => staffToken(api, data)); // P1 auth
await seed.create('enquiry', () => postEnquiry(e), (subject) => deleteEnquiries(api, data, subject));              // P2 data
const found = await seed.until('seeded enquiry visible to staff',                                                  // P3 readiness/lookup
  async () => (await staffMessages(api, token)).find((m) => m.subject === e.subject), (m) => Boolean(m));
res = await api.get(`/api/message/${found!.id}`);                                                                  // the action under test
```

Rules:

1. **Validate the pre-step's output, not just its status.** Some APIs answer bad credentials with
   200 and no token. Assert the token or id you need exists, so a broken pre-step is BLOCKED instead
   of pushing the failure onto the AC under test.
2. **Never reuse the scenario's subject as a cached pre-step.** Login may be `seed.once` for a read
   scenario, but not in the scenario that tests login (there, login is the action).
3. **Cleanup verifies its own result** (throw on unexpected status), so the ledger shows
   `cleanup: failed` and leftovers can be swept using the recorded ids.
4. **Declare dependencies.** If a pre-step uses an endpoint that another scenario tests, tag the
   dependant `@depends:SCN-x`. A BLOCKED dependant then names its cause, and if it ran anyway, its own
   failure stands (it is not blamed on the dependency).
5. **Keep pre-steps out of assertions.** Pre-step checks are plain preconditions
   (`expect(…, 'auth returned a token (precondition)')`), never `[REQ …]`.

Triage support:
- A failed auth pre-step triggers run-level correlation. Failures on the *same endpoint* are
  downgraded to NEEDS_INVESTIGATION (probably bad credentials), and all other failures get a
  "check the test credentials" warning (verified by a robustness run with deliberately wrong credentials:
  no false application defects).
- The relevant exchange for a status assertion is chosen by the failing status (including lists such
  as `[403, 403]` from repeated calls), not by position.

## 5. Journey entry points (where a scenario starts)

| Rule | Why |
| --- | --- |
| **Start where the AC starts.** If the AC says "On the Checkboxes page…", the Given deep-links there: `await gotoPage(page, '/checkboxes')` | Attribution: a broken menu must not fail the checkbox AC. Also speed and stability |
| **Start from the base URL only when navigation is part of the requirement** ("from the home page a guest can reach…") or the journey truly begins there | Otherwise navigation steps add unrelated failure points |
| **Seed state instead of walking to it.** Signed in, items in cart, an existing record: seed via the API (or UI setup in `seed.create`) | Keeps each scenario about its own AC |
| **When deep links are impossible** (SPA state, POST-only flows), take the shortest stable path and keep it in Given/setup steps | Failures there read as setup, not as the AC |
| **Test navigation once, explicitly**, if the requirement mentions it (menu items, links) as its own scenario | One clear signal instead of noise in every scenario |
| **Be explicit about negative preconditions** ("Given I am not signed in") rather than implying them | Readers and lint can see the state the scenario relies on |

`gotoPage(page, path)` waits for DOMContentLoaded, then gives `load` a bounded settle time. Some
AUTs never fire `load` (slow third-party assets), and page scripts may bind their handlers late.

The preflight lint warns when a UI/e2e scenario doesn't start with a Given (`no-entry-point`), and
when a spec has data preconditions but never uses `seed` (`no-seeding`).

## 6. Recommended next steps for teams adopting this

1. **Ask for a seeding and reset API** in evaluation environments: create entity, delete by tag, and
   full reset. It is the single biggest win for speed and determinism.
2. **Prefer dedicated or ephemeral environments** (per PR or per run) over shared sandboxes. On
   shared ones, keep `workers` low. This evaluation measured shared sandboxes dropping connections
   under 8 repeats × 4 workers.
3. **Use worker-scoped accounts plus `storageState`** for authenticated journeys when login isn't
   the subject.
4. **Keep data builders per entity**, derived from the requirement's schema (valid by default,
   overridable per test), as in `validBooking()` / `validEnquiry()`.
5. **Sweep leftovers by tag** after interrupted runs. The `hx…` seed tag and the `QA …` names make
   this safe.
