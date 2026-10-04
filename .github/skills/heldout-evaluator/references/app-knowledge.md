# App knowledge: what the evaluator learns about an application

Every story on the same application needs the same mechanics: where the sign-in page is, what shows that a page has
loaded, which locator reaches a button, how to create and delete a record, which fields an endpoint takes. App knowledge
keeps them per AUT profile in `aut-knowledge/<profile>/`, so hardening a later story starts from what earlier ones
proved instead of discovering it again.

## What it holds, and what it never holds

| Kind | Key | Holds |
| --- | --- | --- |
| `page` | `page:/route` | route, name, readiness anchor, how to reach it, whether it needs a sign-in, sign-in / sign-up purpose |
| `locator` | `locator:/route element` | a proven locator of an element on that page |
| `endpoint` | `api:METHOD /path` | method, path, auth, auth header, query parameters, envelope, request fields and the required ones (`--add` keeps what was known of the endpoint and adds yours on top) |
| `seed` | `seed:entity` | create call, where the id is, fields, cleanup call |
| `note` | `note:topic` | plumbing: pacing, a sign-in detail, a response *shape*, the mechanics gaps found in the application |

Never: a status code, a message, a limit or a value the application answers. That is the oracle, and it comes from
the requirement alone. `--add` and the harvest refuse a note that states an answer ("returns 409") or carries an
expected message of the story, and a locator that looks for one (`getByText('<the expected message>')`: locate the
element by its role, test id or position instead).

## Isolation

- `heldout knowledge KEY` shows and records nothing before the freeze (`integrity --snapshot`). The contract,
  scenarios, tests and expected values are written blind, exactly as without it.
- An entry is a hint to verify, never evidence: probe it like any locator or call you found yourself.
- Each read is logged (`hardening/knowledge-used.json`) and the verdict says what was consulted: *"tests written blind;
  consulted after the freeze: 9 entries (6 proven, 3 seen)"*.

## Lifecycle

1. **Onboarding:** `heldout doctor --learn` visits the start page and the pages its navigation links to (read-only), and
   records each page's route, name, a heading that is on it once (readiness anchor) and whether it is a sign-in or
   sign-up page; and the API calls those pages make (method and path). It looks for no API document. Status: `seen`.
2. **Hardening a story:** `heldout knowledge KEY` lists the entries the story needs: the endpoints its contract names or
   its gaps and criteria mention, the read and delete calls of the records it works on, a list call of what its test
   data needs; the pages its criteria start on and their locators; seed recipes for what it talks about; notes about
   those endpoints and pages (or recorded `--app-wide`: pacing, data that regenerates); and the start, sign-in and
   sign-up pages. `--all` lists everything. An entry you verified
   and your tests rely on: `--confirm <key> --for SCN-n` (it becomes `proven`; this also clears a stale mark that turned
   out wrong). What you found: `--add … --for SCN-n`. What no longer works: `--stale <key> --evidence …`. All three are
   staged with the story in `hardening/knowledge-staged.json`.
3. **After the verdict:** `heldout knowledge KEY --harvest` previews what the story proved; `--harvest --apply` writes it.
   Kept: staged entries whose scenarios include one that passed in the final run (a locator or readiness anchor must
   also be in the final tests), the endpoints of criteria a passing scenario exercised, and the stale marks. Left out:
   anything only failing scenarios used (it may work around a defect, so a locator reached only after a failing step is
   dropped too) and anything that states an answer. Status: `proven`. The story's mechanics gaps are not copied: record
   with `--add` what of them holds for the whole application, never this story's own data (ids, names), which change.
4. **Later:** `doctor --learn` again re-checks known pages that need no sign-in and marks the ones that no longer load,
   or whose anchor doesn't show up within 10 seconds, `stale`. What only an earlier doctor visit saw, and this visit sees
   differently (a fuller endpoint), is replaced, and reported as replaced rather than stale. A later story that proves a
   new value replaces the old one.

## Many people, no merge conflicts

Every write is a new file, `aut-knowledge/<profile>/facts/<time>-<by>-<random>.json`; no file is ever edited. Two
people harvesting on two branches add two files, and git merges them without a conflict. What the knowledge says is
computed when it is read, by folding every file:

- one record per key and value; each keeps the latest time it was seen, proven and found stale, and the stories that
  proved it. Folding keeps the latest of each time and the union of the stories, so the order of the files does not
  matter and a file folded twice changes nothing;
- a value is `stale` when its latest stale mark is newer than its latest sighting or proof;
- the best value of a key is the proven one used most recently; two different proven values (two stories, the same
  week) are both shown until a later story settles which one works.

`heldout knowledge --aut <id> --compact` folds every file into one `snapshot-….json` and deletes the files it folded;
run it from one place (a scheduled CI job, or its owner), and commit the snapshot with the deletions. Snapshots fold
like fact files, so a second compaction elsewhere loses nothing. `doctor` suggests compacting past 200 files.

`heldout knowledge --aut <id> --log` prints what was learned, when and from which story (generated, never committed).

## Commands

```bash
npm run heldout -- doctor --learn [--aut <id>]
npm run heldout -- knowledge KEY [--all]
npm run heldout -- knowledge KEY --add page     --route <route> [--name …] [--ready "<locator>"] [--reach "…"] [--signed-in] --for SCN-n
npm run heldout -- knowledge KEY --add locator  --route <route> --element "…" --locator "<locator>" --for SCN-n
npm run heldout -- knowledge KEY --confirm "<key>" --for SCN-n
npm run heldout -- knowledge KEY --add endpoint --endpoint "METHOD /path" [--auth required] [--auth-header "…"] [--query a,b] [--envelope x] [--fields a,b] [--required a,b] --for SCN-n
npm run heldout -- knowledge KEY --add seed     --entity <name> --create "METHOD /path" [--id <dotted path>] [--fields a,b] [--cleanup "METHOD /path/{id}"] --for SCN-n
npm run heldout -- knowledge KEY --add note     --topic "…" --text "…" [--app-wide] --for SCN-n
npm run heldout -- knowledge KEY --stale "<key>" --evidence "…"
npm run heldout -- knowledge KEY --unstage "<key>"        # take back what you recorded for a key
npm run heldout -- knowledge KEY --harvest [--apply]
npm run heldout -- knowledge --aut <id> [--log | --compact]
```

A route may be given with or without its leading `/` (`--route orders`, `--route "#/login"`); the start page is
`--route /`. Git Bash's rewriting of `/…` arguments into Windows paths is undone.
