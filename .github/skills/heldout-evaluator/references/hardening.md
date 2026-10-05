# Hardening the draft against the live AUT (phase 3)

Goal: every locator, wait, navigation step and API mechanic works against the real AUT, in the tests and in the
actions they call, **without changing what the test expects**.

## 0. Freeze

```bash
npm run heldout -- integrity KEY --snapshot     # copies tests/*.spec.ts → draft/, records the action files they use
```

## 0b. The actions the tests call

```bash
npm run heldout -- actions KEY          # the actions this story concerns, with their map status (--all: every one)
```

The tests call shared actions in `actions/<profile>/ui|api/<domain>/<action>.ts` ([actions.md](actions.md)). Harden
them like the tests: a `proven` action worked for a passing test of an earlier story, *changed since proven* or
*not proven yet* ones haven't been shown to work in their current form, a `STALE` one stopped working. Spend the
probes where they are needed: a `proven` action is checked by the first harden run (`--label harden`), and probed only
if that run fails in it; *changed since proven*, *not proven yet* and `STALE` ones are probed like any mechanic you
found yourself. That is where the actions save work: the more of a story's steps earlier stories proved, the less
there is to discover. Replace the `// TODO(harden)` marks the test author left in actions as in the tests.

An action is shared by every story that calls it. Fix HOW it works when the application changed (a new locator, a new
field) so every caller gets the fix; never bend it to one story's need (add an action, or keep that step in the test).
Never move an expectation into an action: no `[REQ …]`, no `expectResponse`, no expected message. An action you
replace with another: `npm run heldout -- actions KEY --stale "<key>" --evidence "<probe report>"`. What you discover
that later stories will need (opening a page and waiting for it, creating and deleting a record) becomes a new action:
one file, named after it, in its domain's folder, with a `/** doc comment */`, called from the test. The harvest after
the verdict records in the UI and API maps what the passing tests proved.

## 1. Choose the tier

| Tier | When | UI inspection | API inspection | Verification |
| --- | --- | --- | --- | --- |
| 1 IDE browser tool | host IDE exposes browser tools | navigate / read page / act step by step | the tool's network view, if any | tier-3 probe |
| 2 Playwright MCP | `mcp__playwright__*` present | `browser_navigate` → `browser_snapshot` → `browser_click`/`browser_type` | `browser_network_requests` | tier-3 probe |
| 3 bundled | always | `heldout inspect --key KEY [--url path] [--steps steps.json] [--wait-for "<loc>"] [--out report.md]`, `heldout run KEY --label harden --capture` | `heldout api-probe --key KEY METHOD path [--data …] [--login …]` | `heldout inspect --probe "<expr>"` (exactly 1 match); `heldout api-probe` status/shape |

## 1a. Complete the contract's mechanics

`heldout contract KEY` lists the open **mechanics** gaps ("to discover from the application"): a route, a label, an
endpoint or request field the story doesn't name. Discover each one with the tiers below (the page, and the API calls
it makes), then record it. Don't go looking for an API document on the application: the only API definition the
evaluation knows is one the requirement contains (e.g. an excerpt on a linked Confluence page).

```bash
npm run heldout -- contract KEY --resolve G1 --value "JSON body {userName, password}" --evidence hardening/api-user.md
```

This sets `"resolution": "discovered-in-aut"`, `value` and `evidence`, and adds `{ "where": "aut" }` to `tried`.
When the gap is how to make a test account (create, sign in, delete, the sign-in form), also write it as the profile's
accounts recipe ([data-and-journeys.md](data-and-journeys.md) §4a) and switch the spec to `seed.account()`: every later
story on this application reuses it. It refuses
oracle gaps. It's mechanics only, so the review stays valid. Then add what the gap unlocks by hand, if anything: the
endpoint with `"source": "G<n>"`, the AC's `endpoints`, `requestFields`, `envelope`, `entryPoint`. For example, on the
endpoint: `{ "method": "POST", "path": "/Account/v1/User", "source": "story.md#L42", "requestFields": ["userName", "password"] }`;
on an AC: `"entryPoint": "/login"`. If what you find contradicts the requirement (the story's endpoint doesn't
exist, a stated label is different), don't adapt the contract: keep the expectation and log an observed deviation.

## 1b. Tier notes

Third-party ads, analytics or consent banners that inject text or overlays make tests flaky and are not the AUT: list
their hosts in the profile's `blockHosts` (`heldout.config.json`). The fixtures and `heldout inspect` abort those
requests. A `--repeat-each` run exposes this kind of noise.

The application's own banners and dialogs (a cookie consent, a welcome dialog, a newsletter pop-up) can't be blocked:
list the button that closes each in the profile's `overlays`, e.g.
`["getByRole('button', { name: 'dismiss cookie message' })"]`. The tests, the UI sign-in and `heldout inspect` click it
whenever it appears (Playwright's `addLocatorHandler`), so no step has to dismiss it.

`heldout inspect` suggests, in order: role and name, label, placeholder, test id, a stable id, then the field's `name`
attribute. An id that looks generated (a UUID, a long number) changes on every page load: it is offered last, flagged. Read-only
text with a stable id (a detail page's fields, a total, a message) is listed in a table of its own. The report also lists
the API calls the page made on the app's site (method, path, status and the answer's shape, types only): how the UI
does what it does, e.g. which call returns the signed-in user's id when the documented sign-in call doesn't. And it
lists what the page keeps in `localStorage` and `sessionStorage` (a guest's cart id, a flag): where a UI action finds
or sets the page's state, without a script of your own.

A shared sandbox that answers 429 (rate limited) is the environment, not the application: triage says so, and `heldout run`
prints the command that paces the tests on that host, e.g.
`npm run heldout -- init --profile <id> --max-workers 1 --min-test-interval-ms 10000`.

`heldout inspect` steps wait for an address with `{ "do": "wait", "target": "url:/search" }`, the same form as an accounts
recipe's `done`. Hash routes work as `--url "#/login"`, also under Git Bash.

The Playwright MCP server is one browser per agent session. When several agents evaluate stories in parallel,
they would drive the same page: use `heldout mcp-probe` (its own server per call) or tier 3 instead.

If a tier's tools are missing or fail, fall to the next one and say so in the log. Never report a
tier you did not use. Under Git Bash, pass paths without a leading `/` (`--url cart`, `api/room`):
MSYS rewrites `/…` arguments into Windows paths.

### Tier 2 in practice (Playwright MCP)

- **Loaded natively** (tools `mcp__playwright__browser_*` in your list): `browser_navigate` → `browser_wait_for`
  (a readiness anchor) → `browser_snapshot` → act with `browser_click` / `browser_type` / `browser_select_option`
  / `browser_handle_dialog`, using the `target` ref from the snapshot. The server saves its snapshots wherever the
  app started it, not in the story's folder: the walk is not evidence until you replay the steps that matter with
  `mcp-probe … --out output/<profile>/KEY/hardening/tier2/<walk>.md` (below) or prove them with `heldout inspect`.
- **Not loaded** (pending approval, CI, other hosts): drive the same server through the bundled stdio client.
  Same tools, same snapshots, recorded as evidence:

  ```bash
  npm run heldout -- mcp-probe --key KEY --steps output/<profile>/KEY/hardening/tier2/<walk>.steps.json --out output/<profile>/KEY/hardening/tier2/<walk>.md
  ```

  Steps resolve elements by **role + accessible name** from the live MCP snapshot (`{"find": {"role": "button", "name": "Login"}}`),
  and support `expect` / `expectAbsent` / `expectText` checks. Secrets come from `${env:NAME}` and are redacted
  everywhere in the report; per-run data (a user created a moment ago) comes from `--var name=value` as
  `${var:name}` and stays readable as evidence.
- **Every MCP action returns the Playwright code it ran**, which is a free locator suggestion (e.g.
  `page.locator('#table1').getByRole('columnheader', { name: 'Last Name' })`). Still verify it with a probe.
- **SPAs:** after `browser_navigate`, always `browser_wait_for` a text that proves the page rendered. MCP can
  snapshot before hydration and return an almost empty tree.
- **Absence needs a ready page.** Never conclude "element X is not exposed" (e.g. an accessibility defect)
  from a snapshot that may not have rendered. `heldout mcp-probe` enforces this: `expectAbsent` fails unless a wait
  anchor was seen or the snapshot has substantial content. Pair every absence check with a positive control
  on the same page (e.g. the other form fields *are* exposed).
- Native MCP writes its snapshots under the agent app's working folder (`.playwright-mcp/`). When that is not the
  project (a session opened in another folder), use `heldout mcp-probe`: its snapshots stay in a temporary folder of
  its own and its report goes where `--out` says.
- Large snapshots are written to files (`[Snapshot](….yml)`). `heldout mcp-probe` reads them, keeps MCP output
  in its own temp directory and deletes it when the walk ends. When MCP runs natively, add `.playwright-mcp/` to `.gitignore`.

## 2. Walk each test

UI: perform the test's journey steps live, in order. At each step, snapshot the page, pick the most
resilient **unique** locator, probe it, replace the draft locator (in the test or the action it calls) and remove
`// TODO(harden)`.
Fix mechanics the draft couldn't know: menus that must be opened first, asynchronous UI, iframes,
dialogs, empty live regions that shadow `role=alert`, and so on.

API: probe each declared endpoint with `heldout api-probe`. Verify the path, the auth mechanism (cookie
vs header, token field), content type, and the body *shape* (`## Shape`). Fix plumbing only. Status
codes and values come from the requirement, never from the probe. For a large answer, use
`api-probe … --body-limit 200000 --out …`: the report clips bodies at 4000 characters by default. A shared host
that answers 429 is rate-limiting you: the `api` fixture waits and retries (twice, as `Retry-After` says) and
the preflight refuses to run while it happens. Page loads answered with 429 are retried the same way. For a host that
bans bursts, set the profile's `maxWorkers` (e.g. 1) and `minTestIntervalMs` (e.g. 12000: tests start at least that
far apart), and pace your probes.

```bash
# steps in a file (write it with your file tool: shell quoting mangles locators and regexes)
npm run heldout -- inspect --key KEY --steps output/<profile>/KEY/hardening/tier3/login.steps.json --probe "getByRole('heading', { name: 'Dashboard' })" --out output/<profile>/KEY/hardening/tier3/login.md
npm run heldout -- api-probe --key KEY GET api/orders --login '{"path":"api/auth/login","data":{"username":"u","password":"${env:PW}"},"extract":"token","as":"header:Authorization:Bearer"}'
```

## 3. Observed deviations: do NOT "fix" these

If the AUT contradicts the requirement (different text, status code, total, missing control or
label, unauthenticated access…), **leave the assertion exactly as drafted** and log it under
*Observed deviations*. A requirement-named element that is missing is also a deviation: keep the
step, use the most literal locator, and use `strict` when the locator is the requirement.

## 4. Dry run, triage, integrity

```bash
npm run heldout -- run KEY --label harden --capture   # TODO(harden) allowed for harden* labels
npm run heldout -- triage KEY                          # separates mechanics from deviations
npm run heldout -- integrity KEY                       # PRESERVED (or AMENDED) and no TODO(harden)
```

For the stability proof (`--repeat-each 3 --workers 2`), use `--repeat-each 2` and one worker on a host that
rate-limits, and keep every test that changes the application for good tagged `@irreversible`: it runs once, never
retried or repeated. Narrow a dry run with `--grep "SCN-00[1-4]"` (a test tagged `@depends:` on them is not picked).

Fix only failures that triage calls SCRIPT_DEFECT (after checking). `[REQ]` failures matching an
observed deviation are expected; leave them for the official run.

### Assertion-implementation bugs → audited amendment

Sometimes the *assertion code* is wrong even though the requirement is right, for example a `\b`
regex against text rendered without separators. Fix it so it still requires exactly what the
requirement says, then record it:

```bash
npm run heldout -- integrity KEY --amend "<file>: [REQ AC-3] <message>" --reason "<why the implementation was wrong; why the requirement is unchanged>"
```

The message alone is enough when only one spec has it. When the fix also changes what the assertion reads (another
page, another call), say so in the reason: integrity tracks the assertion, not the request before it.
Integrity becomes AMENDED and the verdict lists the amendment. Never use an amendment to align
with AUT behaviour. An expected value computed from what the application answers about the property under test
(its `last_page` when pages are checked) is such a bug: derive it from the requirement.

The test: after the amendment, does the assertion still fail for every application that violates **its own**
criterion, and pass for every one that meets it? Then it is an implementation fix. Typical cases: a regex stricter than
the wording; one AC's assertion re-checking another AC's oracle (AC-9 "one message remains" asserting AC-7's exact
message text — the text stays AC-7's check, AC-9 asserts only what AC-9 states). Loosening an assertion because the
application answers differently is never one. Say in `--reason` if you noticed it while looking at the live app.

### Requirement revision → audited re-freeze

When `jira-fetch` reports a revision, rebuild and re-review the contract, draft the new tests
(before touching the AUT), then:

```bash
npm run heldout -- integrity KEY --snapshot --reason "Requirement revision N: <what changed>"
```

The old draft is archived under `hardening/draft-history/`, and the absorbed changes are logged in
`refreeze-log.json` and shown in the verdict.

## 5. Hardening log — `hardening/hardening-log.md`

```markdown
# Hardening log — KEY
**Tiers used:** <one sentence: the tiers actually used (the verdict shows it)>. <then why others were not>
**AUT profile:** <id> — <urls> · **Date:** <iso> · **Draft frozen:** draft/<file>

## UI locators
| Test(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
## API mechanics
| Item | Verified | Evidence |
## Actions (reused, fixed, added)
| Action | Change | Why | Evidence |
## Mechanics changed (non-locator)
## Observed deviations (assertions intentionally left unchanged)
| Test | Requirement says | AUT shows | Evidence |
```
