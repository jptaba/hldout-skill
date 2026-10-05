# Actions: the reusable HOW of an application

Every story on the same application needs the same mechanics: where the sign-in page is, what shows that a page has
loaded, which locator reaches a button, how to create and delete a record, which fields an endpoint takes. **Actions**
keep them as code, per AUT profile, in the project's `actions/` folder, so the tests of a later story call what earlier
stories proved instead of discovering it again.

```
actions/<profile>/
  ui/<domain>/<action>.ts      one UI action per file: ui/product/open-product.ts, ui/cart/read-cart-total.ts…
  api/<domain>/<action>.ts     one API action per file: api/favorites/add-favourite.ts, api/carts/create-cart.ts…
  <kind>/<domain>/_shared.ts   helpers and types the actions of one domain share (optional; not actions themselves)
  map/ui/<time>-<story>-<random>.json    the UI map: which action opens which route and uses which locators; the
                                         stories whose passing tests proved it
  map/api/<time>-<story>-<random>.json   the API map: which action calls which endpoints; the stories that proved it
  map/ui|api/snapshot-….json             a compaction of the map files (see below)
```

A **domain** is an area of the application as its users see it, named by what it is about (`cart`, `favorites`,
`account`), not by the story that first needed it. An action goes in the folder of the area it works on, in a file
named after it (`addToFavouritesOnProductPage` → `add-to-favourites-on-product-page.ts`).

## What an action is, and what it never is

```ts
// actions/<profile>/api/favorites/add-favourite.ts
import { expect, type Account, type Api, type Seed } from '../../../../heldout-support/fixtures';

/** Add a product to a customer's favourites; removed after the test. */
export async function addFavourite(api: Api, seed: Seed, me: Account, productId: string) {
  return seed.create('favourite', async () => {
    const res = await api.post<{ id: string }>('/favorites', { headers: me.headers, data: { product_id: productId } });
    expect(res.ok, 'add favourite (precondition)').toBe(true);
    return res.body;
  }, (f) => api.delete(`/favorites/${f.id}`, { headers: me.headers }));
}

// actions/<profile>/ui/product/open-product.ts
import { expect, gotoPage, type Page } from '../../../../heldout-support/fixtures';

/** Open a product's page and wait until it shows the product. */
export async function openProduct(page: Page, id: string) {
  await gotoPage(page, `/product/${id}`);
  await expect(page.getByTestId('product-name'), 'the product page is ready (precondition)').toBeVisible();
}
```

- One exported function per file, with a `/** doc comment */` that says what it does (the map shows it to the next
  test author). Helpers several actions of a domain need go in that domain's `_shared.ts`.
- Mechanics only: routes, readiness anchors, locators, calls and their fields, seeding and cleanup. An action may check
  its own preconditions with a plain `expect(…, '… (precondition)')`.
- **Never** what a story expects: no `[REQ …]` assertion, no `expectResponse`, no `@req-constants`, no message or value
  the requirement says the application shows. An action returns what its step produced (an answer, a record, a
  locator); the test asserts it. `heldout lint` refuses an action that breaks this, and `heldout integrity` marks a
  `[REQ …]` assertion inside one as a violation (it would escape the freeze).
- It takes what it needs as parameters and imports only `heldout-support/fixtures`, other actions and its domain's
  `_shared.ts`. Tests import each action file directly; there is no index file.

## Isolation

The tests stay an independent oracle because the actions hold no oracle. That is why the test author may read and call
them while drafting, before the freeze:

- The expected values come from the requirement contract alone and stay in the story's spec (`@req-constants`,
  `[REQ …]` messages), which the freeze protects.
- An action is mechanics to verify, never evidence: one not proven in its current form is probed like any locator or
  call the hardener found itself; a proven one is checked by the first hardening run.
- Actions are not frozen. Hardening may fix HOW one works (a locator, a wait, a field); `integrity --snapshot` records
  the hashes of the action files the draft uses, and the verdict lists the ones that changed after the freeze.
- An action is shared: a change must keep the stories that use it working. Change what it does only for a reason that
  holds for every caller (the application changed); otherwise add a new action.

## Lifecycle

1. **Writing the tests (phase 2):** `heldout actions KEY` lists the profile's actions, the ones the story concerns
   first (it calls the story's resources, opens a route it starts on, or its domain is a word of the story), with what
   each calls and opens and its map status. The test author calls them for the steps and adds the missing ones, each a
   new file in its domain's folder, with `// TODO(harden)` on what it guessed.
2. **Hardening (phase 3):** the hardener makes every action the tests call work against the live application, like the
   tests themselves. An action that no longer works and is replaced: `heldout actions KEY --stale "<key>" --evidence "…"`
   (`--unstage` takes it back).
3. **After the verdict (phase 8):** `heldout actions KEY --harvest` previews what the story proved; `--harvest --apply`
   writes it into the maps as new files. Kept: each action a passing test called (directly, through the spec's own
   helpers, another action or a shared helper), with what its code calls, opens and uses now, and the story as its
   proof; and the stale marks. Left out: actions only failing tests called (they may work around a defect), and files
   that break the rules. Commit the action files, the new map files and the story's output together.
4. **Later:** an action whose code changed since it was proven is shown as *changed since proven* until a passing story
   proves the new code.

## Many people on the same application

Several people (or teams) evaluate their own stories against the same application, on their own branches, and each
adds the actions their stories need. The folder is laid out so that their work merges without conflicts:

| What people do on their branches | What happens when the branches merge |
| --- | --- |
| Add new actions | Each is a new file: git merges them on its own, nothing to resolve |
| Harvest their stories | Each harvest is new map files, never an edit: git merges them on its own |
| Use, and so re-prove, an existing action | Only new map files again; the action file is untouched |
| Fix the same action, both of them | A real conflict, in that one small file: the two fixes have to be reconciled anyway |
| Add the same action twice, under two names | No conflict, but a duplicate: `heldout actions --check` and `doctor` report actions that make the same calls or open the same page the same way |
| Add the same action under the same name | Both create the same file: git shows it as one conflict to resolve, instead of two copies |

What makes this work:

- **One action per file, named after it, in its domain's folder.** The lint warns about a file with several actions, a
  file not named after its action, a file outside a domain folder and an index file (which every new action would
  have to edit).
- **Maps that are only ever added to.** What the maps say is computed when they are read, by folding every file of a
  kind: one record per action and value (its file, doc comment, parameters, calls, routes and locators), each with the
  latest time it was proven and found stale and the stories that proved it. Folding keeps the latest of each time and
  the union of the stories, so the order of the files does not matter and a file folded twice changes nothing. An
  action is `stale` when its latest stale mark is newer than its latest proof; its best value is the one proven most
  recently, and an older proven value stays as an alternative.
- **A check after merging.** `heldout actions --aut <id> --check` (run it after merging, or in CI) lints every action
  file, lists possible duplicates, the actions not in the map yet and the map entries whose action is gone from the
  code. `doctor` reports the same in one line.
- **Compaction from one place.** `heldout actions --aut <id> --compact` folds each kind's map files into one
  `snapshot-….json` and deletes the files it folded; run it from one place (a scheduled CI job, or its owner), and
  commit the snapshots with the deletions. Snapshots fold like the other files, so a second compaction elsewhere loses
  nothing. `doctor` suggests compacting past 200 files. `heldout actions --aut <id> --log` prints what the maps
  learned, when and from which story.

## Commands

```bash
npm run heldout -- actions KEY [--all]                               # the actions for this story (all of them)
npm run heldout -- actions KEY --stale "<key>" --evidence "…"        # e.g. --stale "ui:product.openProduct"
npm run heldout -- actions KEY --unstage "<key>"
npm run heldout -- actions KEY --harvest [--apply]
npm run heldout -- actions --aut <id> [--check | --log | --compact]
```

Keys are `ui:<domain>.<action>` and `api:<domain>.<action>`.
