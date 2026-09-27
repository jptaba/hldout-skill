# Hardening the draft against the live AUT (phase 4)

Goal: every locator, wait, navigation step and API mechanic works against the real AUT, **without
changing what the test expects**.

## 0. Freeze

```bash
npm run heldout -- integrity KEY --snapshot     # copies tests/*.spec.ts → draft/
```

## 1. Choose the tier

| Tier | When | UI inspection | API inspection | Verification |
| --- | --- | --- | --- | --- |
| 1 IDE browser tool | host IDE exposes browser tools | navigate / read page / act step by step | the tool's network view, if any | tier-3 probe |
| 2 Playwright MCP | `mcp__playwright__*` present | `browser_navigate` → `browser_snapshot` → `browser_click`/`browser_type` | `browser_network_requests` | tier-3 probe |
| 3 bundled | always | `heldout inspect --key KEY [--url path] [--steps steps.json] [--wait-for "<loc>"] [--out report.md]`, `heldout run KEY --label harden --capture` | `heldout api-probe --key KEY METHOD path [--data …] [--login …]` | `heldout inspect --probe "<expr>"` (exactly 1 match); `heldout api-probe` status/shape |

## 1a. Complete the contract's mechanics

`heldout contract KEY` lists the open **mechanics** gaps ("to discover from the application"): a route, a label, an
endpoint or request field the story doesn't name. Discover each one with the tiers below or the published API docs,
then record it:

```bash
npm run heldout -- contract KEY --resolve G1 --value "JSON body {userName, password}" --evidence hardening/api-user.md
```

This sets `"resolution": "discovered-in-aut"`, `value` and `evidence`, and adds `{ "where": "aut" }` to `tried`. It refuses
oracle gaps. It's mechanics only, so the review stays valid. Then add what the gap unlocks by hand, if anything: the
endpoint with `"source": "G<n>"`, the AC's `endpoints`, `requestFields`, `envelope`, `entryPoint`. For example, on the
endpoint: `{ "method": "POST", "path": "/Account/v1/User", "source": "story.md#L42", "requestFields": ["userName", "password"] }`;
on an AC: `"entryPoint": "/login"`. If what you find contradicts the requirement (the story's endpoint doesn't
exist, a stated label is different), don't adapt the contract: keep the expectation and log an observed deviation.

## 1b. Tier notes

Third-party ads, analytics or consent banners that inject text or overlays make tests flaky and are not the AUT: list
their hosts in the profile's `blockHosts` (`heldout.config.json`). The fixtures and `heldout inspect` abort those
requests. A `--repeat-each` run exposes this kind of noise.

The Playwright MCP server is one browser per Claude Code session. When several agents evaluate stories in parallel,
they would drive the same page: use `heldout mcp-probe` (its own server per call) or tier 3 instead.

If a tier's tools are missing or fail, fall to the next one and say so in the log. Never report a
tier you did not use. Under Git Bash, pass paths without a leading `/` (`--url cart`, `api/room`):
MSYS rewrites `/…` arguments into Windows paths.

### Tier 2 in practice (Playwright MCP)

- **Loaded natively** (tools `mcp__playwright__browser_*` in your list): `browser_navigate` → `browser_wait_for`
  (a readiness anchor) → `browser_snapshot` → act with `browser_click` / `browser_type` / `browser_select_option`
  / `browser_handle_dialog`, using the `target` ref from the snapshot.
- **Not loaded** (pending approval, CI, other hosts): drive the same server through the bundled stdio client.
  Same tools, same snapshots, recorded as evidence:

  ```bash
  npm run heldout -- mcp-probe --key KEY --steps evaluations/KEY/hardening/tier2/<walk>.steps.json --out evaluations/KEY/hardening/tier2/<walk>.md
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
- Large snapshots are written to files (`[Snapshot](….yml)`). `heldout mcp-probe` reads them, keeps MCP output
  in its own temp directory and deletes it when the walk ends. When MCP runs natively, add `.playwright-mcp/` to `.gitignore`.

## 2. Walk each scenario

UI: perform the Gherkin steps live, in order. At each step, snapshot the page, pick the most
resilient **unique** locator, probe it, replace the draft locator and remove `// TODO(harden)`.
Fix mechanics the draft couldn't know: menus that must be opened first, asynchronous UI, iframes,
dialogs, empty live regions that shadow `role=alert`, and so on.

API: probe each declared endpoint with `heldout api-probe`. Verify the path, the auth mechanism (cookie
vs header, token field), content type, and the body *shape* (`## Shape`). Fix plumbing only. Status
codes and values come from the requirement, never from the probe. When the application publishes an OpenAPI or
Swagger document, read it for request mechanics (parameter names, encodings) with
`api-probe … --body-limit 200000 --out …`: the report clips bodies at 4000 characters by default. A shared host
that answers 429 is rate-limiting you: the `api` fixture waits and retries (twice, as `Retry-After` says) and
the preflight refuses to run while it happens. Page loads answered with 429 are retried the same way. For a host that
bans bursts, set the profile's `maxWorkers` (e.g. 1) and `minTestIntervalMs` (e.g. 12000: tests start at least that
far apart), and pace your probes.

```bash
# steps in a file (write it with your file tool: shell quoting mangles locators and regexes)
npm run heldout -- inspect --key KEY --steps evaluations/KEY/hardening/tier3/login.steps.json --probe "getByRole('heading', { name: 'Dashboard' })" --out evaluations/KEY/hardening/tier3/login.md
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

Fix only failures that triage calls SCRIPT_DEFECT (after checking). `[REQ]` failures matching an
observed deviation are expected; leave them for the official run.

### Assertion-implementation bugs → audited amendment

Sometimes the *assertion code* is wrong even though the requirement is right, for example a `\b`
regex against text rendered without separators. Fix it so it still requires exactly what the
requirement says, then record it:

```bash
npm run heldout -- integrity KEY --amend "<file>: [REQ AC-3] <message>" --reason "<why the implementation was wrong; why the requirement is unchanged>"
```

Integrity becomes AMENDED and the verdict lists the amendment. Never use an amendment to align
with AUT behaviour.

The test: after the amendment, does the assertion still fail for every application that violates **its own**
criterion, and pass for every one that meets it? Then it is an implementation fix. Typical cases: a regex stricter than
the wording; one AC's assertion re-checking another AC's oracle (AC-9 "one message remains" asserting AC-7's exact
message text — the text stays AC-7's check, AC-9 asserts only what AC-9 states). Loosening an assertion because the
application answers differently is never one. Say in `--reason` if you noticed it while looking at the live app.

### Requirement revision → audited re-freeze

When `jira-fetch` reports a revision, update the review and scenarios, draft the new tests
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
| Scenario(s) | Element | Draft locator | Hardened locator | Verified (probe) | Evidence |
## API mechanics
| Item | Verified | Evidence |
## Mechanics changed (non-locator)
## Observed deviations (assertions intentionally left unchanged)
| Scenario | Requirement says | AUT shows | Evidence |
```
