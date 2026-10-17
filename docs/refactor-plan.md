# Refactoring plan: a smaller record, no scripts of the agents' own

Written 2026-10-17, after round 36. Greenfield: every change below is the target layout and the target commands. Old
layouts are not read, nothing is migrated, and no command or flag keeps an alias for what it replaces. A round project
made before this lands is re-run from a fresh onboarding, not converted. Everything stays application-agnostic: no
step, command or rule below names an application, a route or a value.

Two goals:

1. **Far fewer files per story**, while keeping what a person (or the round auditor) needs to review an evaluation
   and to find what to improve in the skill, months later.
2. **No scripts written on the fly.** Every `node -e`, `python -c`, `.mjs`/`.cjs` file and hand-built JSON an agent
   writes today exists because a `heldout` command doesn't do something yet. Each of those becomes a command or a flag
   that works for any application.

## 1. What a story produces today

Measured in the round projects of rounds 34 to 36:

| Story | Runs | Files | Size |
| --- | --- | --- | --- |
| PB-2 (57 failures) | 4 | 1,971 | 375 MB |
| PB-1 | 4 | 1,139 | 223 MB |
| TOOL-8 (round 34) | 3 | 716 | 195 MB |
| TOOL-8 (round 36, local Toolshop) | 4 | 339 | 70 MB |
| TOOL-10 (fast path, few failures) | 2 | 41 | 1.3 MB |

One evaluation run of PB-2 (`03-eval`): 624 files, 121 MB.

| Part of the run | Files | Size | Why it is that big |
| --- | --- | --- | --- |
| `html/` (Playwright report) | 255 | 61 MB | Copies every trace and screenshot of `artifacts/` a second time |
| `artifacts/` | 343 | 58 MB | A trace, a screenshot and an error context per failed **attempt**: retries double it |
| `results.json` | 1 | 3.9 MB | 1.5 MB of base64 attachment bodies (API exchanges, seed ledgers) for every test, passed ones included |
| `triage.json` | 1 | 1.0 MB | 440 KB of evidence copied from `results.json` |
| `junit.xml`, `console.log` | 2 | 1.2 MB | Same results again, in two more forms |
| `verdict.md` (copy of the story's) | 1 | 230 KB | A second copy with rewritten links |
| `snapshots/`, `confirm/` | 19 | 84 KB | Working files of `--capture` and of the triager |

Hardening runs keep the same set (`02-harden` of PB-2: 608 files, 121 MB) although nobody reads them after the
hardener is done. Only `trace.zip` and `html/` are git-ignored, so the rest of every run (screenshots, error contexts,
results, logs) is committed in the project.

Beside the runs, each story holds files with a single field or a single event (`evaluation.json`,
`draft-finished.json`, `publish-log.json`, `journeys-harvest.json`, `hardening/integrity.json`, `refreeze-log.json`,
`amendments.json`), views a command can render again (`requirement-contract.md`, `requirement/evidence-pack.md`),
an unused copy (`requirement/raw-issue.json`) and files agents named themselves (`hardening/gaps.json`,
`gaps-resolved.json`, `gaps.resolve.json`, `run-harden.out`, `api-chain.json`, 10 to 30 `tier3/*.steps.json`,
`tier3/*.md`, `api/*.chain.json`, `api/*.md` per story).

### Scripts the agents wrote

From the transcripts of this repository's sessions: 335 runs of the five evaluation subagents wrote 138 inline
scripts, and 43 general-purpose runs (orchestrating rounds) another 178. By purpose:

| What the script did | Seen in | Command it calls for |
| --- | --- | --- |
| Print part of the contract (some ACs, the gaps, the endpoints) | extractor, author, hardener, triager, orchestrator | `heldout show KEY contract …` |
| Print the profile (accounts, roles, workers, prefix), masking passwords by hand | author, hardener | `heldout show config` |
| Walk `results.json`, `triage.json`, `junit.xml`, error contexts for one test | triager, orchestrator, auditor | `heldout show KEY run/triage …` |
| Edit the contract or review JSON; stamp `contractHash` and `reviewedAt` | extractor, reviewer | the file tools; `contract KEY --review-bind` |
| `new Date().toISOString()` | reviewer | stamped by the tools |
| Build or slice an inspector step list (sign in first, keep steps 1–7, add a probe) | hardener | `inspect --sign-in`, `--from`, `--then` |
| Edit a chain's body field and re-run | hardener | `api-probe --chain … --set` |
| Fetch pages 1–6 of a list and filter the names | triager, hardener | `api-probe --pages`, `--pick`, `--where`, `--count` |
| Pipe `curl` into node or python to read a field | hardener, orchestrator | `api-probe --pick` |
| Read the network log out of a trace | hardener | `heldout trace` |
| Search the output for a password | hardener | `heldout scrub KEY --check` |
| Make a string of N characters for a boundary | hardener, triager | `${text:N}` in steps, chains and test data |
| Set up a fresh round project; count runs and failures for the audit | orchestrator, auditor (dev only) | `demo/round.ts` |

## 2. Principles

1. **Three kinds of output, and only one is kept.**
   - **Record**: what the evaluation was given, what it wrote and what it decided. Small, text, committed with the
     project, read by people, `verdict`, `score.ts` and the auditor.
   - **View**: anything a command can render again from the record (the contract as markdown, the evidence pack, the
     triage report). Written to the scratch area or printed, never committed.
   - **Scratch**: raw tool output (Playwright's JSON, traces, the HTML report, console output, step and chain files,
     confirm chains). Git-ignored, under one folder, removed when the story is complete.
2. **One file per kind of thing, not per event.** Events go into one append-only ledger; the frozen draft and its
   amendments into one file; every probe into one log.
3. **Evidence by reference.** A probe is `P7`, a run's failure is `04-rerun/SCN-012`. Decisions and logs name them;
   nothing copies a report into another file.
4. **A command for every recurring need.** When an agent needs something no command does, it says so (`Tool gap:` in
   its reply, `heldout note KEY --tool-gap`), and the gap becomes a command in the skill, never a script in a round.

## 3. Target layout

```
output/<profile>/KEY/                      ← the record (committed)
  requirement/story.md linked/ transcripts/ history/      ← history/ and CHANGES.md only after a revision
  requirement-contract.json
  requirement-contract.review.json
  tests/*.spec.ts  test-data.json
  freeze.json                                 ← frozen specs, contract oracle, journey hashes, re-freezes, amendments
  hardening-log.md                            ← the hardener's account, probes named P1…Pn
  probes.jsonl                                ← every inspect / api-probe / mcp-probe call with --key
  runs/NN-label.json                          ← one file per run (below)
  runs/NN-label.triage.json                   ← evaluation runs with failures: automatic class and decisions
  evidence/NN-label-SCN-x.png                 ← only the screenshots the verdict shows
  verdict.md  verdict.json
  ledger.jsonl                                ← every step that changed the story, in order

.heldout/<profile>/KEY/                     ← scratch and views (git-ignored, removed by prune)
  raw/NN-label/  results.json artifacts/ html/ junit.xml console.log shared-data/ snapshots/
  work/          evidence-pack.md requirement-contract.md triage-NN.md steps/ chains/ probes/
```

About 15 files plus two per triaged run and one per screenshot shown: PB-2 would keep about 30 files and a few MB
instead of 1,971 files and 375 MB.

### Disposition of every current file

| Today | Target | Kind |
| --- | --- | --- |
| `evaluation.json` | `fetched` event in the ledger (profile, date, revision hash) | Record |
| `requirement/raw-issue.json` | not written (nothing reads it) | — |
| `requirement/evidence-pack.md` | `.heldout/…/work/evidence-pack.md`, written by `contract --pack` | View |
| `requirement-contract.md` | `work/requirement-contract.md`, or `heldout show KEY contract --md` | View |
| `draft/*.spec.ts`, `draft/contract-oracle.json`, `draft/journeys.json` | `freeze.json` | Record |
| `draft-finished.json` | `draft-finished` event (specs hash) | Record |
| `hardening/integrity.json` | `integrity` event (status, changed assertions); recomputed by `integrity KEY` | Record |
| `hardening/amendments.json`, `refreeze-log.json`, `draft-history/` | `freeze.json` (`amendments`, `refreezes` with the previous specs) | Record |
| `hardening/hardening-log.md` | `hardening-log.md` at the story root | Record |
| `hardening/tier2/`, `tier3/`, `api/`, `inspect-*.md`, `api-*.md`, agents' own files | `probes.jsonl` (input + digest); full report in `work/probes/Pn.md` | Record + scratch |
| `hardening/gaps*.json` (`--resolve-from` input) | `work/` (scratch); the resolutions are in the contract and the ledger | Scratch |
| `hardening/journeys-staged.json` | `work/` | Scratch |
| `hardening/journeys-harvest.json` | `harvested` event | Record |
| `runs/NN/results.json` | `raw/NN/` | Scratch |
| `runs/NN/run-meta.json` + digest of `results.json` | `runs/NN-label.json` | Record |
| `runs/NN/junit.xml` | `raw/NN/`, only with `--junit` (the CI templates pass it) | Scratch |
| `runs/NN/html/` | `raw/NN/`, only with `--html` | Scratch |
| `runs/NN/console.log`, `snapshots/`, `shared-data.json`, `artifacts/` | `raw/NN/` | Scratch |
| `runs/NN/triage.json` | `runs/NN-label.triage.json`, evidence by reference | Record |
| `runs/NN/triage.md` | `work/triage-NN.md` | View |
| `runs/NN/confirm/*.chain.json`, `*.md` | chains in `work/chains/`; what they showed in `probes.jsonl` | Scratch + record |
| `runs/NN/verdict.md` | not written | — |
| screenshot linked by the verdict | `evidence/` | Record |
| `publish-log.json` | `published` event | Record |
| `mock-jira/outbox/*.http` (3 per publish) | `mock-jira/outbox.jsonl` | Record (mock) |

### The run record: `runs/NN-label.json`

Written by `run.ts` from Playwright's raw JSON, then the raw output stays in scratch:

- what `run-meta.json` has today: label, command, workers, grep, repeat, health before and after, skill fingerprint,
  times, stats;
- the seed summary (created, cleaned, kept by kind, left behind, accounts taken and reset);
- per test: id, title, tags, status, attempts, duration; for a test that did not pass, per attempt: the error's first
  lines, the failing `[REQ …]` step, the failure signature, the page's ARIA excerpt when there is one, the API
  exchanges it made (method, path, status, sent `as`, request and answer bodies redacted and cut to a limit), and the
  scratch paths of its screenshot and trace while they exist.

Passed tests are one line each. `classify`, `triage`, `verdict`, `phases`, `score.ts` and the new `show` read only
this file, never `raw/`. The trace and the screenshot are the only things in `raw/` a person opens.

### What happens to artifacts

- Playwright's `outputDir` and reporters write to `raw/NN-label/`. The JSON reporter always; `--junit` and `--html`
  on request (the CI templates pass `--junit`).
- Hardening runs record traces only with `--trace`: the hardener checks stability, and the inspector is its tool for
  looking.
- Of a retried test, only the last attempt's screenshot and trace are kept.
- `verdict` copies each screenshot it shows into `evidence/` and links that copy.
- `heldout prune KEY` removes the story's scratch folder. `advance` runs it when it prints `✔ KEY is complete`, unless
  the project sets `"keepScratch": true` (a person who wants the traces until they have read the verdict).
- Scrubbing secrets keeps running after every run, over the record and the scratch (traces included, as now).

### The ledger: `ledger.jsonl`

One JSON line per step that changed the story, written by the command that made the change, each with the time, the
skill fingerprint and the command line (secrets as references):

`fetched` · `revised` · `contract-checked` (errors, warnings, ACs, gaps by kind and resolution) · `review-bound`
(round, findings) · `draft-finished` (specs hash, tests, TODOs, journeys new and reused) · `frozen` · `refrozen` ·
`amended` · `hardened` (fast path or hardener; tiers, gaps resolved, guesses confirmed and corrected, journeys fixed)
· `integrity` · `run` (label, stats, duration) · `triaged` (automatic counts by class) · `decided` (test, class,
carried or confirmed, `--any-reading`) · `verdict` · `published` · `harvested` · `note` (tool gaps and questions the
subagents report) · `pruned`.

`phases.ts` reads the story's state from the ledger and the record files, so `status` and `advance` keep working from
the files alone. `heldout show KEY history` prints it as a table. It is also what the long-term review reads: how
many runs a story took and why, which probes the hardener needed, where the time went, which tool gaps came up.

## 4. New and changed commands

All of them work from the profile and the story; none knows an application.

| Command | Does | Replaces |
| --- | --- | --- |
| `heldout show KEY contract [--ac AC-1,AC-7] [--gaps open\|mechanics\|oracle] [--endpoints] [--rules] [--errors] [--variants] [--md] [--json]` | Prints part of the contract | contract reads |
| `heldout show config [--aut id] [--json]` | The profile, secrets shown as their references; accounts with roles, `shared`, `perTest`; workers, pacing, prefix | config reads with hand masking |
| `heldout show KEY run [NN] [--failed] [--test SCN-x] [--attempts] [--json]` | From the run record | walks of `results.json`, `junit.xml`, error contexts |
| `heldout show KEY triage [NN] [--pending] [--test SCN-x] [--json]` | Classes, decisions, groups | walks of `triage.json` |
| `heldout show KEY probes [--id P7] [--phase harden\|triage]` | The probe log | listing `hardening/` |
| `heldout show KEY history` | The ledger as a table | the auditor's and orchestrator's walks |
| `heldout trace KEY SCN-x [--run NN] [--network [--grep text]] [--console] [--steps]` | A redacted summary of the kept trace | unzipping traces, python on `trace.network` |
| `heldout scrub KEY --check` | Lists known secret values found in the record or the scratch; exit 1 when any | hand-written secret searches |
| `heldout prune KEY \| --all [--older-than 14d]` | Removes scratch | — |
| `heldout note KEY --tool-gap "…" \| --question "…"` | A `note` event; the verdict lists questions, the auditor tool gaps | gaps lost in a reply |
| `contract KEY --review-bind` | The reviewer's last step: binds the review to the contract's hash and stamps the time | reviewer scripts setting `contractHash`, `reviewedAt` |
| `contract KEY --pack` | Writes the pack to `work/` | — |
| `inspect` / `mcp-probe` `--sign-in <role or label>` | Starts the walk with the profile's recorded sign-in of an existing account | scripts prepending sign-in steps |
| `inspect` / `mcp-probe` `--from P7[:k]` | Starts from the steps of an earlier probe (the first k) | scripts slicing step files |
| `inspect` / `mcp-probe` `--then '<step>'` (repeatable) | Appends steps without a file | scripts appending steps |
| `api-probe --chain P7 \| file  --set <step>.<field>=<value>` | Changes one value of a chain for this call | scripts editing chain JSON |
| `api-probe --pages <param>[=from..to]` | Follows a paged list until it ends (or the range), items joined | page loops |
| `api-probe --pick <path>` (repeatable), `--where <path>~<regex>`, `--count` | Picks fields of the answer (`data.*.name`), filters, counts | `curl … \| node`, python |
| `${text:N}`, `${now}`, `${uid}` in steps, chains, `--var` and `test-data.json` | An N-character text starting with the data prefix; the time; a unique id | length and timestamp scripts |

Every probe run with `--key` gets the next id `Pn` and one line in `probes.jsonl`: phase (from the story's state),
tool and tier, the input (steps or chain, secrets as references), a digest (statuses, matches, what the page
announced, unexpected results) and where the full report is in `work/probes/`. `--out` is removed. `--evidence` in
`contract --resolve`, `triage --set` and `confirm` takes probe ids (and checks they exist); `hardening-log.md` cites
them. Step and chain files an agent still needs go in `work/steps/` and `work/chains/`, never in the record.

## 5. Keeping it that way

- **Agent files.** Each evaluation subagent gets the same rule: no scripts of your own (no `node -e`, `python`,
  `.mjs`/`.cjs`, no JSON built by code); read with `heldout show`, change files with the file tools, and when no
  command does what you need, do it by hand and report `Tool gap: …` (and `heldout note KEY --tool-gap`). The
  orchestrator lists the gaps in its closing summary.
- **`tests/agent-files.test.ts`** checks that every agent file has the rule, and that every `heldout <command> --flag`
  written in an agent file, `SKILL.md` or a reference exists (the dispatcher's `knownFlags`).
- **Lint `stray-file`.** `lint` and `status` warn about any file in a story's folder that the layout doesn't have, and
  say where it belongs; `advance` refuses to write the verdict while one is there.
- **`advance` runs `scrub KEY --check`** before it publishes.

## 6. Developer tooling (this repository only, never copied by `init`)

- `demo/round.ts new <name> [--stories PB-1,PB-2] [--from-local <url>]`: a fresh round project in
  `$HELDOUT_ROUNDS_DIR/<name>` (no machine path in the repository): clone of the skill, `setup`, the stories created
  in the mock Jira with `heldout new` from `demo/stories/`. `demo/round.ts stats <project> [KEY]`: runs, failures,
  script defects, amendments, review rounds, probes and tool gaps per story, from the ledgers.
- `demo/inflight.ts <transcripts folder>`: counts inline scripts per agent type: the measure of goal 2.
- `demo/score.ts` reads `verdict.json` and `runs/*.triage.json` of the new layout.
- `dev-round-auditor` reads the ledger, the run and triage records and `probes.jsonl` through `heldout show` and
  `demo/round.ts stats`, and reports tool gaps as skill defects.

## 7. Work packages

In this order. Each one updates the code, the self-tests and every document it affects, and is committed and pushed
once typecheck and `npm run test:skill` are green.

| # | Package | Main files | Tests |
| --- | --- | --- | --- |
| 1 | **Ledger and scratch area.** `ledger.ts` (append, read, last of a kind); `evalPaths` gains `scratch`, `work`, `raw`, `ledger`, `freeze`, `probes`, `evidence`; `init`/`update` add `.heldout/` to `.gitignore`; `fetch` stops writing `raw-issue.json` and `evaluation.json`; `draft-finished`, `published` and `harvested` become events; `phases.ts` reads them | `config.ts`, `jira-fetch.ts`, `phases.ts`, `jira-publish.ts`, `journeys.ts`, `init.ts`, `update.ts` | new `ledger.test.ts`; `advance.test.ts` |
| 2 | **Freeze in one file.** `freeze.json` replaces `draft/`, `integrity.json`, `amendments.json`, `refreeze-log.json`, `draft-history/` | `integrity.ts`, `integrity-check.ts`, `verdict.ts`, `fast-harden.ts`, `advance.ts` | `integrity.test.ts` |
| 3 | **Run record.** Playwright output to `raw/`; `run.ts` writes `runs/NN-label.json`; `--junit`, `--html`, `--trace`; last attempt only; `classify`, `triage`, `verdict`, `phases`, `score.ts` read the record | `playwright.config.ts`, `run.ts`, `triage-model.ts`, `classify.ts`, CI templates | new `run-record.test.ts` from a fixture `results.json`; `classify.test.ts` |
| 4 | **Triage and verdict.** `runs/NN-label.triage.json` with evidence by reference; `triage-NN.md` and confirm chains to `work/`; `evidence/` screenshots; no per-run verdict copy | `triage.ts`, `triage-report.ts`, `verdict.ts`, `repro.ts` | `triage-report.test.ts` |
| 5 | **Probe log.** `Pn` ids and `probes.jsonl` in `inspect`, `api-probe`, `mcp-probe`; `--out` removed; `--evidence Pn` validated; `hardening-log.md` at the story root; views to `work/` | `inspect.ts`, `api-probe.ts`, `mcp-probe.ts`, `contract.ts`, `confirm.ts`, `triage.ts`, `scaffold.ts` | new `probes.test.ts` |
| 6 | **Read commands.** `show` (contract, config, run, triage, probes, history), `trace`, `note`, `contract --review-bind`, `scrub --check`, `prune` | new `show.ts`, `trace.ts`, `prune.ts`, `note.ts`; `heldout.ts`, `contract.ts`, `scrub.ts`, `advance.ts` | `parsing.test.ts`, `secrets.test.ts`, new `show.test.ts` |
| 7 | **Probe composition.** `--sign-in`, `--from`, `--then`, `--set`, `--pages`, `--pick`, `--where`, `--count`, `${text:N}`, `${now}` | `inspect.ts`, `mcp-probe.ts`, `api-probe.ts`, `accounts-recipe.ts`, fixtures' data helpers | `parsing.test.ts` |
| 8 | **Rules and checks.** No-scripts rule and `Tool gap:` in the five agent files and the bridges; `stray-file` lint; `advance` checks scrub before publish; `SKILL.md` "Output layout" and the references rewritten for the new layout and commands | `.github/agents/*`, `.claude/agents/*`, `SKILL.md`, `references/*`, `preflight.ts`, `advance.ts` | `agent-files.test.ts` |
| 9 | **Developer tooling.** `demo/round.ts`, `demo/inflight.ts`, `score.ts` and the auditor on the new layout | `demo/*`, `.github/agents/dev-round-auditor.agent.md` | — |
| 10 | **Guide and README**, `docs/next-steps.md` | `docs/heldout-evaluator.html`, `README.md` | — |

## 8. Proof: round 37

One fresh onboarding, stories one at a time (fixing the skill between them), on locally started applications:
PB-2 (the most failures), TOOL-8 (deep, several roles) and TOOL-10 (the fast path). Then `demo/round.ts stats` and
`demo/inflight.ts` on the round's transcripts.

| Measure | Round 35/36 | Target |
| --- | --- | --- |
| Verdicts and defects against the answer keys | as keyed | the same |
| Files kept per story (PB-2) | 1,971 | ≤ 40 |
| Size kept per story (PB-2) | 375 MB | ≤ 10 MB |
| Files in a story folder not in the layout | up to 40 (agents' own names) | 0 (lint) |
| Inline scripts per evaluation subagent run | 0.4 | 0; each need met by hand instead is a reported tool gap |
| Auditor can answer "why did this story take N runs" | from many files | from `show KEY history` alone |

## 9. Removed outright

`draft/`, `draft-finished.json`, `evaluation.json`, `publish-log.json`, `requirement/raw-issue.json`,
`requirement/evidence-pack.md` and `requirement-contract.md` in the record, `hardening/` as a folder (its log moves
up, its probe files become the probe log), `integrity.json`, `amendments.json`, `refreeze-log.json`,
`journeys-staged.json`, `journeys-harvest.json`, `runs/NN/` folders, `run-meta.json`, the per-run `verdict.md`, the
default HTML report and JUnit file, the `--out` flag of the probes, path-based `--evidence`, and every mention of
these in the skill, the agents, the guide and the README.
