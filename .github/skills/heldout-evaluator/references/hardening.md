# Hardening the draft against the live AUT (phase 3)

Goal: every locator, wait, navigation step and API mechanic works against the real AUT, in the tests and in the
journeys they call, **without changing what the test expects**.

[hardening-cases.md](hardening-cases.md) holds what only some stories need: read its section when you meet the case.

| You meet | Section |
| --- | --- |
| `mcp__playwright__*` tools, or `heldout mcp-probe` | Tier 2 in practice |
| Ads or banners in the way, a 429, a list you walk through, several agents at once | Tier notes |
| A field sent as a code (0, 1, 2) | Values the application takes as codes |
| An assertion whose code is wrong, or a revised requirement | Assertion-implementation bugs, Requirement revision |

## 0. Freeze

```bash
npm run heldout -- integrity KEY --snapshot     # freezes the draft (3-tests/freeze.json: its hashes, a hash of each journey it uses)
```

The draft stays in `3-tests/` as frozen. Hardening works on its own copy, `4-hardening/<key>.spec.ts` and
`test-data.json`, the tests that run; everything hardening keeps (the log, the probes it cites) is in `4-hardening/`.

## 0b. The journeys the tests call

```bash
npm run heldout -- journeys KEY         # the journeys this story concerns, with their registry status (--all: every one)
```

The tests call shared journeys in `journeys/fixtures/<domain>.ts` ([journeys.md](journeys.md)). Harden them like the
tests: a `proven` journey worked for a passing test of an earlier story, `changed` or `not proven yet` ones haven't been
shown to work in their current form, a `STALE` one stopped working. Spend the probes where they are needed: a `proven`
journey is checked by the first harden run (`--label harden`), and probed only if that run fails in it; `changed`,
`not proven yet` and `STALE` ones are probed like any mechanic you found yourself. That is where the journeys save
work: the more of a story's steps earlier stories proved, the less there is to discover. A journey's `requires` (in
`journeys/registry.yml`) says what earlier stories ran before it: a test that calls it without them is a likely script
defect. Replace the `// TODO(harden)` marks the test author left in journeys as in the tests.

A journey is shared by every story that calls it. Fix HOW it works when the application changed (a new locator, a new
field) so every caller gets the fix; never bend it to one story's need (add a journey, or keep that step in the test).
Never move an expectation into a journey: no `[REQ …]`, no `expectResponse`, no expected message. A journey you
replace with another: `npm run heldout -- journeys KEY --stale "<id>" --evidence "<probe report>"`. What you discover
that later stories will need (opening a page and waiting for it, creating and deleting a record) becomes a new journey:
an exported function with a `/** doc comment */` in its domain's file, called from the test. The harvest after the
verdict records in `journeys/registry.yml` what the passing tests proved; never edit that file yourself.

What you learned that no journey can hold (an answer's shape, the call a page makes, a wait it needs) goes in the
application map: `npm run heldout -- map KEY --domain <domain> --add "<how it works>" --evidence P7`. Write it so it holds
in another environment and for another story: `{id}` for a record, no value a run made, no secret. It says how to reach
and read the application (a route, a call, an answer's format, a wait), never what it accepts, refuses or computes, nor
who may call it: a requirement could judge those, so they belong in your log or the triager's decision, and a reader of the map would take
them as settled. Nobody reads the map before a freeze, or today's behaviour would become the oracle. It is a starting
point, so a guess confirmed or a gap resolved still cites this story's probe or run; `--evidence` that names an entry
alone is refused.

What the application was seen to accept, refuse or compute is an observed rule, kept apart from the mechanics:
`npm run heldout -- map KEY --rule "<what it did>" --domain <domain> --evidence P7`. It says what happened, never that
it is right or wrong, and it is read after a freeze only (`--rules`, beside the rules earlier stories' requirements
gave). A required rule this story's contract replaces (its rule or the owner's answer says the rule changes) is
marked stale citing that item: `--stale <id> --evidence R2`; one it only contradicts stays beside it, for the verdict
to put to the owner. The overview (`--overview`) is what every agent reads, the test author too: add to it only what the application
is (an area, a kind of user, a word and its meaning: `--about area|user|term --add "…" --evidence P7`), never a
figure, a quote or a rule.

## 1. Choose the tier

| Tier | When | UI inspection | API inspection | Verification |
| --- | --- | --- | --- | --- |
| 1 IDE browser tool | host IDE exposes browser tools | navigate / read page / act step by step | the tool's network view, if any | tier-3 probe |
| 2 Playwright MCP | `mcp__playwright__*` present | `browser_navigate` → `browser_snapshot` → `browser_click`/`browser_type` | `browser_network_requests` | tier-3 probe |
| 3 bundled | always | `heldout inspect --key KEY [--url path] [--steps steps.json] [--wait-for "<loc>"]` (logged as the story's next probe, `Pn`), `heldout run KEY --label harden --capture` | `heldout api-probe --key KEY METHOD path [--data …] [--login …]` | `heldout inspect --probe "<expr>"` (exactly 1 match); `heldout api-probe` status/shape |

If a tier's tools are missing or fail, fall to the next one and say so in the log. Never report a
tier you did not use.

## 1a. Complete the contract's mechanics

`heldout contract KEY` lists the open **mechanics** gaps ("to discover from the application"): a route, a label, an
endpoint or request field the story doesn't name. Discover each one with the tiers above (the page, and the API calls
it makes), then record it. Don't go looking for an API document on the application: the only API definition the
evaluation knows is one the requirement contains (e.g. an excerpt on a linked Confluence page).

```bash
npm run heldout -- contract KEY --resolve G1 --value "JSON body {userName, password}" --evidence P3     # P3: the api-probe that showed it
```

This sets `"resolution": "discovered-in-aut"`, `value` and `evidence`, and adds `{ "where": "aut" }` to `tried`.
When the gap is how to make a test account (create, sign in, delete, the sign-in form), also write it as the profile's
accounts recipe ([accounts.md](accounts.md)) and switch the spec to `seed.account()`: every later
story on this application reuses it. Search the tests for the journey's calls, with a few lines around each. Calls the story
itself tests (its registration, its sign-in) stay direct; a step that only needs "a registered user" switches to
`seed.account()`. A journey that only repeats the recipe's create
call is then removed, or kept for tests that need other fields, with its summary saying so. `contract --resolve` refuses
oracle gaps. It's mechanics only, so the review stays valid. Then add what the gap unlocks by hand, if anything: the
endpoint with `"source": "G<n>"`, the AC's `endpoints`, `requestFields`, `envelope`, `entryPoint`. These fields are
mechanics too: they are outside what the reviewer signed, so adding them keeps the review and the freeze valid
(`heldout contract KEY` still says reviewed; if it says `review-stale`, you changed something else, so undo it). For example, on the
endpoint: `{ "method": "POST", "path": "/Account/v1/User", "source": "story.md#L42", "requestFields": ["userName", "password"] }`;
on an AC: `"entryPoint": "/login"`. If what you find contradicts the requirement (the story's endpoint doesn't
exist, a stated label is different), don't adapt the contract: keep the expectation and log an observed deviation.
A label the requirement names is found by its words: punctuation the page puts around it (a trailing colon, an
asterisk on a required field) and letter case that comes from styling are mechanics. Other words are a deviation.
A journey that finds a record through the application's own search or filter ("find the products named …", used by
assertions such as "none exists" and by cleanups) is proven with a name of the shape the tests make (`unique()`, with
its digits and hyphen) and a control that must not be found: a search that misses such names makes "none exists" pass
for the wrong reason and leaves records behind. Where the search can't be trusted, page through the list.
The inspector's step table notes what the page announces after each step (alerts, status and live regions, toasts):
`click … ✔ · the page announced: "Product added to shopping cart."`. That is usually all a message needs.
A message that disappears again (a toast after a click) is gone when the inspector's `--probe` runs, at the end of the
walk: to count the matches of your own locator, probe it where it appears, with a step `{ "do": "probe", "target": "getByText('Product added to your favorites list.')" }`
right after the click. The step table then shows its count and text.
Guesses the probe shows were right keep their code: only the `// TODO(harden)` mark goes. Correct the wrong ones by
hand first, then remove what is left in one command per file:
`heldout confirm KEY --file journeys/fixtures/<domain>.ts --evidence "<probe report>"` (it notes the count in the log).
A draft guess written as "A, or B" where the probe shows A: delete the B branch, then confirm. Journeys copied from a
related profile (`journeys --copy-from`) carry the mark on every journey: each is a guess here until probed.
A mechanics gap the application gives no answer to (the endpoint a criterion needs does not exist on this build, every
route of it answers 404) stays open: don't record "nothing found" as its answer. Log it as an observed deviation, with
the probe; the tests that depend on it end BLOCKED or fail on the criterion that owns the missing piece.

## 2. Work from the marks

Most guesses are in the journeys, and a journey says what it needs. Open a test only for a mark in it, when a run or
probe sends you there, or to tell a call under test from a precondition (1a): `npm run heldout -- show KEY spec --test SCN-n`
prints one, and `show KEY spec` lists where each test and declaration is, for a mark in a declaration. A session pays on every turn for all it has read, and a large
spec is most of what a hardener can afford.

A journey doesn't say which of its words the requirement names, so **before you change the words of a guessed label or
value, search `2-contract/contract.json` for them** with your search tool. Words the requirement names stay, and the difference is an
observed deviation: a test that passes after you changed them would hide it.

UI: walk the journey's steps live, in order. At each step, snapshot the page, pick the most
resilient **unique** locator, probe it, replace the draft locator (in the test or the journey it calls) and remove
`// TODO(harden)`.
Fix mechanics the draft couldn't know: menus that must be opened first, asynchronous UI, iframes,
dialogs, empty live regions that shadow `role=alert`, and so on. Wait for what you will act on, not only for the
page: a heading can be there while the buttons still have no names, and a snapshot taken then shows them unnamed.
On a page that shows one record (a detail page with a form on it), wait for something the page loaded (the
record's text), not for the form: a form can be usable before its record has arrived, and a click made then sends
no call. A step that should have sent a call and sent none is a sign of this before it is a sign of a defect; the
same holds for an `inspect` walk and for the journey you write.

**Absence needs a ready page.** Never conclude "element X is not exposed" (e.g. an accessibility defect) from a snapshot
that may not have rendered. Pair every absence check with a positive control on the same page (e.g. the other form
fields *are* exposed).

API: probe each declared endpoint with `heldout api-probe`. Verify the path, the auth mechanism (cookie
vs header, token field), content type, and the body *shape* (`## Shape`). Fix plumbing only. Status
codes and values come from the requirement, never from the probe. For a large answer, use
`api-probe … --body-limit 200000`: the report clips bodies at 4000 characters by default. A journey reads a date in the
zone the answer gives it in: one that a probe shows is midnight UTC is read in UTC, not the test's zone. When the tests
create their users (a sign-up recipe you have just saved), make the first hardening run with `--workers 1`: some applications refuse
sign-ups sent at the same moment, and a run lost to that leaves its records behind all the same. Go to more workers once
two sign-ups sent together are shown to work.

```bash
# steps in a file (write it with your file tool: shell quoting mangles locators and regexes)
npm run heldout -- inspect --key KEY --steps .heldout/<profile>/KEY/4-hardening/login.steps.json --probe "getByRole('heading', { name: 'Dashboard' })"
npm run heldout -- api-probe --key KEY GET api/orders --login '{"path":"api/auth/login","data":{"username":"u","password":"${env:PW}"},"extract":"token","as":"header:Authorization:Bearer"}'
```

Compose probes instead of writing scripts: [probes.md](probes.md) lists the options, and what the inspector shows and
can do.

## 3. Observed deviations: do NOT "fix" these

If the AUT contradicts the requirement (different text, status code, total, missing control or
label, unauthenticated access…), **leave the assertion exactly as drafted** and log it under
*Observed deviations*. A requirement-named element that is missing is also a deviation: keep the
step, use the most literal locator, and use `strict` when the locator is the requirement. A deviation goes in the log
only: never in a journey's comments, which the next story's test author reads before writing its tests.

## 4. Dry run, triage, integrity

```bash
npm run heldout -- run KEY --label harden --capture   # a dry run, not when the tests create records the application can't delete; TODO(harden) allowed for harden* labels
npm run heldout -- triage KEY                          # separates mechanics from deviations
npm run heldout -- integrity KEY                       # PRESERVED (or AMENDED) and no TODO(harden)
```

For the stability proof (`--repeat-each 3 --workers 2`), use `--repeat-each 2` and one worker on a host that
rate-limits, or when the tests create records the application can't delete (registered customers, placed orders):
every repeat leaves another set behind on a shared environment, and keep every test that changes the application for good tagged `@irreversible`: it runs once, never
retried or repeated. Narrow a dry run with `--grep "SCN-00[1-4]"` (a test tagged `@depends:` on them is not picked).

The stability run is also where a mechanic no mark showed comes to light. After a repair, run again, with the same
`--repeat-each` and `--workers`, the tests that failed on a mechanic and the tests that call a journey you changed
(search for its name). The proof is the first run's passes plus these re-runs, as with a run made in parts. Where the
records can't be deleted, that is instead of the whole suite, which would leave another set behind; and when too many tests
call a changed journey to re-run them all, the evaluation run is their check, and the log says so.

Fix only failures that triage calls SCRIPT_DEFECT (after checking). `[REQ]` failures matching an
observed deviation are expected; leave them for the official run.

## 5. Hardening log — `4-hardening/hardening.md`

```markdown
# Hardening log — KEY
**Tiers used:** <one sentence: the tiers actually used (the verdict shows it)>. <then why others were not>
**AUT profile:** <id> — <urls> · **Date:** <iso>

## UI locators
| Test(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
## API mechanics
| Item | Verified | Evidence |
## Journeys (reused, fixed, added)
| Journey | Change | Why | Evidence |
## Mechanics changed (non-locator)
## Observed deviations (assertions intentionally left unchanged)
| Test | Requirement says | AUT shows | Evidence |
```
