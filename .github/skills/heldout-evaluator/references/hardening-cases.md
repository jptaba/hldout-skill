# Hardening: what only some stories need

Read a section when you meet its case; [hardening.md](hardening.md) is the procedure.

## Tier notes

Third-party ads, analytics or consent banners that inject text or overlays make tests flaky and are not the AUT: list
their hosts in the profile's `blockHosts` (`heldout.config.json`). The fixtures and `heldout inspect` abort those
requests. A `--repeat-each` run exposes this kind of noise.

The application's own banners and dialogs (a cookie consent, a welcome dialog, a newsletter pop-up) can't be blocked:
list the button that closes each in the profile's `overlays`, e.g.
`["getByRole('button', { name: 'dismiss cookie message' })"]`. The tests, the UI sign-in and `heldout inspect` click it
whenever it appears (Playwright's `addLocatorHandler`), so no step has to dismiss it.

A shared sandbox that answers 429 (rate limited) is the environment, not the application: triage says so, and `heldout run`
prints the command that paces the tests on that host, e.g.
`npm run heldout -- init --profile <id> --max-workers 1 --min-test-interval-ms 10000`. A shared host
that answers 429 is rate-limiting you: the `api` fixture waits and retries (twice, as `Retry-After` says) and
the preflight refuses to run while it happens. Page loads answered with 429 are retried the same way. For a host that
bans bursts, set the profile's `maxWorkers` (e.g. 1) and `minTestIntervalMs` (e.g. 12000: tests start at least that
far apart), and pace your probes.

A journey that walks through the pages of a list is proven on the last page as well as the first: probe the "next"
control there and read how the page marks the end (a `disabled` attribute, `aria-disabled`, or only a class on an
element around it). A link styled as disabled still counts as enabled, and a walk that asks `isEnabled()` never stops.

The Playwright MCP server is one browser per agent session. When several agents evaluate stories in parallel,
they would drive the same page: use `heldout mcp-probe` (its own server per call) or tier 3 instead.

## Tier 2 in practice (Playwright MCP)

- **Loaded natively** (tools `mcp__playwright__browser_*` in your list): `browser_navigate` → `browser_wait_for`
  (a readiness anchor) → `browser_snapshot` → act with `browser_click` / `browser_type` / `browser_select_option`
  / `browser_handle_dialog`, using the `target` ref from the snapshot.
  Before a step that clicks by role and name, wait for that text (the button's label). The server saves its snapshots wherever the
  app started it, not in the story's folder: the walk is not evidence until you replay the steps that matter with
  `heldout mcp-probe --key KEY` (below) or prove them with `heldout inspect --key KEY`: each is logged as the story's
  next probe (`Pn`), the id you cite as evidence.
- **Not loaded** (pending approval, CI, other hosts): drive the same server through the bundled stdio client.
  Same tools, same snapshots, recorded as evidence:

  ```bash
  npm run heldout -- mcp-probe --key KEY --steps .heldout/<profile>/KEY/4-hardening/<walk>.steps.json
  ```

  Steps resolve elements by **role + accessible name** from the live MCP snapshot (`{"find": {"role": "button", "name": "Login"}}`),
  and support `expect` / `expectAbsent` / `expectText` checks. Secrets come from `${env:NAME}` and are redacted
  everywhere in the report; per-run data (a user created a moment ago) comes from `--var name=value` as
  `${var:name}` and stays readable as evidence.
- **Every MCP action returns the Playwright code it ran**, which is a free locator suggestion (e.g.
  `page.locator('#table1').getByRole('columnheader', { name: 'Last Name' })`). Still verify it with a probe.
- **SPAs:** after `browser_navigate`, always `browser_wait_for` a text that proves the page rendered. MCP can
  snapshot before hydration and return an almost empty tree.
- `heldout mcp-probe` enforces that absence needs a ready page ([hardening.md](hardening.md), section 2): `expectAbsent`
  fails unless a wait anchor was seen or the snapshot has substantial content.
- Native MCP writes its snapshots under the agent app's working folder (`.playwright-mcp/`). When that is not the
  project (a session opened in another folder), use `heldout mcp-probe`: its snapshots stay in a temporary folder of
  its own and its report is the probe's (`Pn`).
- Large snapshots are written to files (`[Snapshot](….yml)`). `heldout mcp-probe` reads them, keeps MCP output
  in its own temp directory and deletes it when the walk ends. When MCP runs natively, add `.playwright-mcp/` to `.gitignore`.

## Values the application takes as codes

When a field you find is sent as a code (0, 1, 2: an account type, a status, a category), search the tests for the
values they pass to that journey. A test's "unknown" or "not allowed" value must be sent the way
the valid ones are: a code outside the set, not the word passed through. An application often answers a value of the
wrong form at once (a 404, a parsing error) and fails only on a value of the right form that it doesn't know. Map
the test's unknown value to such a code in the journey, and say so in the log.

## Assertion-implementation bugs: audited amendment

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

## Requirement revision: audited re-freeze

When `jira-fetch` reports a revision, rebuild and re-review the contract, draft the new tests
(before touching the AUT), then:

```bash
npm run heldout -- integrity KEY --snapshot --reason "Requirement revision N: <what changed>"
```

The hashes of the draft it replaces and the changes it absorbed are kept in `3-tests/freeze.json` and shown in the
verdict. The hardened copy is written over with the revised draft: harden it again.
