# Journey fixtures: the reusable HOW of an application

Every story on the same application needs the same mechanics: where the sign-in page is, what shows that a page has
loaded, which locator reaches a button, how to create and delete a record, which fields an endpoint takes. Journey
fixtures keep them as code, per AUT profile, in the project's `journeys/` folder, so the tests of a later story call
what earlier stories proved instead of discovering it again.

```
journeys/<profile>/
  ui/<domain>.ts          UI fixtures of one area of the application: auth.ts, catalogue.ts, cart.ts, checkout.ts…
  api/<domain>.ts         API fixtures of one area: favorites.ts, orders.ts, users.ts…
  map/ui/<time>-<story>-<random>.json    the UI map: which fixture opens which route, waits on which anchor, uses
                                         which locators; the stories whose passing tests proved it
  map/api/<time>-<story>-<random>.json   the API map: which fixture calls which endpoints; the stories that proved it
  map/ui|api/snapshot-….json             a compaction of the map files (see below)
```

A **domain** is an area of the application as its users see it, named by what it is about (`cart`, `favorites`,
`account`), not by the story that first needed it. One file per domain and layer; a fixture goes in the file of the
area it works on.

## What a fixture is, and what it never is

```ts
// journeys/<profile>/api/favorites.ts
import { expect, type Account, type Api, type Seed } from '../../../heldout-support/fixtures';

/** Add a product to a customer's favourites; removed after the test. */
export async function addFavourite(api: Api, seed: Seed, me: Account, productId: string) {
  return seed.create('favourite', async () => {
    const res = await api.post<{ id: string }>('/favorites', { headers: me.headers, data: { product_id: productId } });
    expect(res.ok, 'add favourite (precondition)').toBe(true);
    return res.body;
  }, (f) => api.delete(`/favorites/${f.id}`, { headers: me.headers }));
}

// journeys/<profile>/ui/product.ts
import { expect, gotoPage, type Page } from '../../../heldout-support/fixtures';

/** Open a product's page and wait until it shows the product. */
export async function openProduct(page: Page, id: string) {
  await gotoPage(page, `/product/${id}`);
  await expect(page.getByTestId('product-name'), 'the product page is ready (precondition)').toBeVisible();
}
```

- An exported function with a `/** doc comment */` that says what it does (the map shows it to the next test author).
- Mechanics only: routes, readiness anchors, locators, calls and their fields, seeding and cleanup. A fixture may check
  its own preconditions with a plain `expect(…, '… (precondition)')`.
- **Never** what a story expects: no `[REQ …]` assertion, no `expectResponse`, no `@req-constants`, no message or value
  the requirement says the application shows. A fixture returns what its step produced (an answer, a record, a
  locator); the test asserts it. `heldout lint` refuses a fixture that breaks this, and `heldout integrity` marks a
  `[REQ …]` assertion inside one as a violation (it would escape the freeze).
- It takes what it needs as parameters and imports only `heldout-support/fixtures` and other journey files.

## Isolation

The tests stay an independent oracle because the fixtures hold no oracle. That is why the test author may read and call
them while drafting, before the freeze:

- The expected values come from the requirement contract alone and stay in the story's spec (`@req-constants`,
  `[REQ …]` messages), which the freeze protects.
- A fixture is mechanics to verify, never evidence: the hardener probes it like any locator or call it found itself.
- Fixtures are not frozen. Hardening may fix HOW one works (a locator, a wait, a field); `integrity --snapshot` records
  the hashes of the journey files the draft uses, and the verdict lists the ones that changed after the freeze.
- A fixture is shared: a change must keep the stories that use it working. Change what it does only for a reason that
  holds for every caller (the application changed); otherwise add a new fixture.

## Lifecycle

1. **Writing the tests (phase 2):** `heldout journeys KEY` lists the profile's fixtures, the ones the story concerns
   first (it calls the story's resources, opens a route it starts on, or its domain is a word of the story), with what
   each calls and opens and its map status. The test author calls them for the steps and adds the missing ones to the
   right domain file, with `// TODO(harden)` on what it guessed.
2. **Hardening (phase 3):** the hardener makes every fixture the tests call work against the live application, like the
   tests themselves. A fixture that no longer works and is replaced: `heldout journeys KEY --stale "<key>" --evidence "…"`
   (`--unstage` takes it back).
3. **After the verdict (phase 8):** `heldout journeys KEY --harvest` previews what the story proved; `--harvest --apply`
   writes it into the maps as new files. Kept: each fixture a passing test called (directly, through the spec's own
   helpers or through another fixture), with what its code calls, opens and uses now, and the story as its proof; and
   the stale marks. Left out: fixtures only failing tests called (they may work around a defect), and the fixtures of a
   file that breaks the rules. Commit the fixture code, the new map files and the story's output together.
4. **Later:** a fixture whose code changed since it was proven is shown as *changed since proven* until a passing story
   proves the new code. `heldout journeys --aut <id> --check` lints every journey file of the profile and lists the
   fixtures not in the map yet and the map entries whose fixture is gone from the code.

## Many people, no merge conflicts

The maps never conflict: every harvest writes new files, one per layer (`map/ui/…json`, `map/api/…json`), named by time,
story and a random part, and no map file is ever edited. Two people harvesting on two branches add two files, and git
merges them without a conflict. What the map says is computed when it is read, by folding every file of a layer:

- one record per fixture and value (its file, doc comment, parameters, calls, routes and locators); each keeps the
  latest time it was proven and found stale, and the stories that proved it. Folding keeps the latest of each time and
  the union of the stories, so the order of the files does not matter and a file folded twice changes nothing;
- a fixture is `stale` when its latest stale mark is newer than its latest proof;
- the best value of a fixture is the one proven most recently; an older proven value stays as an alternative.

The fixture code is one file per domain and layer. Two people adding fixtures to the same domain file at the same time
merge like any code (different places in the file merge on their own); keep fixtures small and in the domain they
belong to, so most work touches different files.

`heldout journeys --aut <id> --compact` folds each layer's files into one `snapshot-….json` and deletes the files it
folded; run it from one place (a scheduled CI job, or its owner), and commit the snapshots with the deletions.
Snapshots fold like the other files, so a second compaction elsewhere loses nothing. `doctor` suggests compacting past
200 files. `heldout journeys --aut <id> --log` prints what the maps learned, when and from which story.

## Commands

```bash
npm run heldout -- journeys KEY [--all]                               # the fixtures for this story (all of them)
npm run heldout -- journeys KEY --stale "<key>" --evidence "…"        # e.g. --stale "ui:product.openProduct"
npm run heldout -- journeys KEY --unstage "<key>"
npm run heldout -- journeys KEY --harvest [--apply]
npm run heldout -- journeys --aut <id> [--check | --log | --compact]
```

Keys are `ui:<domain>.<fixture>` and `api:<domain>.<fixture>`.
