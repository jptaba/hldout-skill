# Journeys: the reusable HOW of an application

Every story on the same application needs the same mechanics: where the sign-in page is, what shows that a page has
loaded, which locator reaches a button, how to create and delete a record, which fields an endpoint takes. **Journeys**
keep them as code in the project's `journeys/` folder, so the tests of a later story call what earlier stories proved
instead of discovering it again. A registry next to them says what each journey touches, what must run before it and
which stories proved it.

```
journeys/
  fixtures/<domain>.ts   the journeys of one area of the application, UI and API: fixtures/products.ts,
                         fixtures/cart.ts, fixtures/favorites.ts…
  registry.yml           the mapping, written by the tools: every journey's id, where it is, what it calls, opens and
                         uses, what must run before it, and the stories that proved it
```

A **domain** is an area of the application as its users see it, named by what it is about (`cart`, `favorites`,
`account`), not by the story that first needed it. Its file holds every journey of that area, UI and API. A project
with a second application gives that profile its own folder (`auts.<id>.journeysDir`, e.g. `journeys-admin`).

Before adding a journey, look for one that makes the same calls or opens the same page (`heldout journeys KEY --all`).
Reuse it, or give it an optional parameter that leaves its other callers as they are (a page limit, a count): a second
journey on the same calls is reported by `journeys --check` and `doctor` as a possible duplicate until someone merges
the two.

Test users are not journeys: when the profile has an accounts recipe (`auts.<id>.accounts`), a test that needs a user
takes one from `seed.account()` and signs it in with `signIn()`. Write a journey that creates users only for a story
that tests the creation itself, or needs fields the recipe doesn't send.

## What a journey is, and what it never is

```ts
// journeys/fixtures/favorites.ts
import { expect, type Account, type Api, type Seed } from '../../heldout-support/fixtures';

/** Add a product to a customer's favourites; removed after the test. */
export async function addFavourite(api: Api, seed: Seed, me: Account, productId: string) {
  return seed.create('favourite', async () => {
    const res = await api.post<{ id: string }>('/favorites', { headers: me.headers, data: { product_id: productId } });
    expect(res.ok, 'add favourite (precondition)').toBe(true);
    return res.body;
  }, (f) => api.delete(`/favorites/${f.id}`, { headers: me.headers }));
}

// journeys/fixtures/product.ts
import { expect, gotoPage, type Page } from '../../heldout-support/fixtures';

/** Open a product's page and wait until it shows the product. */
export async function openProduct(page: Page, id: string) {
  await gotoPage(page, `/product/${id}`);
  await expect(page.getByTestId('product-name'), 'the product page is ready (precondition)').toBeVisible();
}
```

- Every exported function of a domain file is a journey, with a `/** doc comment */` that says what it does (the
  registry shows it to the next test author). Helpers its journeys share stay in the file, not exported.
- Its id is `<kind>.<domain>.<name>`: `api.favorites.add-favourite`, `ui.product.open-product`. A journey is `ui` when
  it drives a page (takes a `Page`), `api` otherwise.
- Mechanics only: routes, readiness anchors, locators, calls and their fields, seeding and cleanup. A journey may check
  its own preconditions with a plain `expect(…, '… (precondition)')`.
- **Never** what a story expects: no `[REQ …]` assertion, no `expectResponse`, no `@req-constants`, no message or value
  the requirement says the application shows. A journey returns what its step produced (an answer, a record, a
  locator); the test asserts it. `heldout lint` refuses a journey file that breaks this, and `heldout integrity` marks
  a `[REQ …]` assertion inside one as a violation (it would escape the freeze).
- It takes what it needs as parameters and imports only `heldout-support/fixtures` and other domains' journeys. Tests
  import the domain file: `import { addFavourite } from '../../../../journeys/fixtures/favorites'`.

## The registry

`journeys/registry.yml` is the map of the application's journeys, one entry per journey, sorted by id:

```yaml
journeys:
  ui.favorites.open-favourites:
    fixture: "fixtures/favorites.ts#openFavourites"
    kind: ui
    summary: "Open the customer's Favorites page and wait until it lists them."
    params: "page: Page"
    routes: ["/account/favorites"]
    locators: ["getByTestId('favorites-list')"]
    requires: ["support.account", "support.sign-in", "api.favorites.add-favourite"]
    status: proven
    proven:
      at: "2026-10-05T14:02:11.000Z"
      by: ["TOOL-4"]
      evidence: "05-eval: SCN-005 passed"
      hash: "3f2a9c1e04b7"
```

- `fixture`: the file and the exported name. `endpoints`, `routes`, `locators`: what its code (with its file's helpers)
  calls, opens and uses. `calls`: the journeys it calls itself.
- `requires`: what ran before it in every passing test that called it, learned by the harvest; other journeys, and
  `support.account` / `support.sign-in` for the fixtures' `seed.account()` and `signIn()`. Each story keeps only what
  its own passing tests agree on, so the list holds what the journey needs, not what one test happened to do first.
- `status`: `proven` (a passing story used it as its code is now), `changed` (its code changed since), `stale` (marked
  as no longer working after its last proof), `unproven` (no passing story used it yet).

The tools write it; don't edit it by hand. `heldout journeys --sync` brings it in line with the code (new journeys,
moved ones, gone ones); the harvest records what a story proved. When two branches change it, git may report a
conflict in it: `heldout journeys --resolve` keeps both sides (every proof, the later date, the prerequisites both
agree on), brings it in line with the code, and leaves it ready to `git add`.

## Isolation

The tests stay an independent oracle because the journeys hold no oracle. That is why the test author may read and
call them while drafting, before the freeze:

- The expected values come from the requirement contract alone and stay in the story's spec (`@req-constants`,
  `[REQ …]` messages), which the freeze protects.
- A journey is mechanics to verify, never evidence: one not proven in its current form is probed like any locator or
  call the hardener found itself; a proven one is checked by the first hardening run.
- Journeys are not frozen. Hardening may fix HOW one works (a locator, a wait, a field); `integrity --snapshot`
  records a hash of every journey in the files the draft uses, and the verdict lists the journeys that changed after
  the freeze.
- A journey is shared: a change must keep the stories that use it working. Change what it does only for a reason that
  holds for every caller (the application changed); otherwise add a new journey.

## Lifecycle

1. **Writing the tests (phase 2):** `heldout journeys KEY` lists the application's journeys, the ones the story
   concerns first (it calls the story's resources, opens a route it starts on, or its domain is a word of the story),
   with what each calls and opens, what it requires and its registry status. The test author calls them for the steps
   and adds the missing ones to their domain's file, with `// TODO(harden)` on what it guessed.
2. **Hardening (phase 3):** the hardener makes every journey the tests call work against the live application, like
   the tests themselves. A journey that no longer works and is replaced:
   `heldout journeys KEY --stale "<id>" --evidence "…"` (`--unstage` takes it back).
3. **After the verdict (phase 8):** `heldout journeys KEY --harvest` previews what the story proved; `--harvest
   --apply` writes it into `registry.yml`. Kept: each journey a passing test used (directly, through the spec's own
   helpers or another journey), with the story as its proof and what ran before it; and the stale marks. Left out:
   journeys only failing tests used (they may work around a defect), and files that break the rules. Commit the
   journey files, `registry.yml` and the story's output together.
4. **Later:** a journey whose code changed since it was proven is `changed` until a passing story proves the new code.

## Many people on the same application

Several people evaluate their own stories against the same application, on their own branches, and each adds the
journeys their stories need:

| What people do on their branches | What happens when the branches merge |
| --- | --- |
| Add journeys to different domains | Different files: git merges them on its own |
| Add journeys to the same domain | Usually merged on its own (different places in the file); a conflict only where both edited the same lines |
| Harvest their stories | Both change `registry.yml`: a conflict where their entries meet — `heldout journeys --resolve` |
| Fix the same journey, both of them | A real conflict in its domain file: the two fixes have to be reconciled anyway |
| Add the same journey twice, under two names | No conflict, but a duplicate: `journeys --check` and `doctor` report journeys that make the same calls or open the same page the same way |

After merging, `heldout journeys --check` (or CI) lints every journey file, lists possible duplicates and says when
the registry is behind the code; `doctor` reports the same in one line.

## Commands

```bash
npm run heldout -- journeys KEY [--all]                            # the journeys for this story (all of them)
npm run heldout -- journeys KEY --stale "<id>" --evidence "…"      # e.g. --stale "ui.product.open-product"
npm run heldout -- journeys KEY --unstage "<id>"
npm run heldout -- journeys KEY --harvest [--apply]
npm run heldout -- journeys [--aut <id>] [--check | --sync | --resolve]
```
