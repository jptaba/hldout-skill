# Refactoring plan: a smaller record that is easy to follow, no scripts of the agents' own, scripts in areas

Written 2026-10-17, after round 36. Fourth version: the second added the scripts layout, the third the layout of a
story's folder (section 3), the fourth a last critique (section 11), a definition of done and a progress table
(section 8). The plan is updated after each work package; the progress table says where the work is.

Greenfield: everything below is the target layout and the target commands. Old layouts are not read, nothing is
migrated, and no command, flag, path or import keeps an alias for what it replaces. A round project made before this
lands is re-run from a fresh onboarding, not converted. Everything stays application-agnostic: no step, command or
rule below names an application, a route or a value.

Four goals:

1. **Far fewer files per story**, while keeping what a person, or the round auditor, needs to review an evaluation and
   to find what to improve in the skill, months later.
2. **A story's folder that reads like the pipeline.** One folder per phase, numbered in the order the phases run, the
   same names in the kept record and in the scratch area, and the same names `heldout status` prints.
3. **No scripts written on the fly.** Every `node -e`, `python -c`, `.mjs`/`.cjs` file and JSON built by code that an
   agent writes today exists because a `heldout` command doesn't do something yet. Each one becomes a command or a
   flag that works for any application.
4. **Scripts grouped by area.** `.github/scripts/` is 51 files in one folder (plus `mock/`), and this plan alone would
   add eight more. They move into a few area folders with a rule for where a new file goes, and a self-test that holds
   the rule.

## 1. Where things stand

### Files a story produces

Measured in the round projects of rounds 34 to 36:

| Story | Runs | Files | Size |
| --- | --- | --- | --- |
| PB-2 (57 failures) | 4 | 1,971 | 375 MB |
| PB-1 | 4 | 1,139 | 223 MB |
| TOOL-8 (round 34, public demo) | 3 | 716 | 195 MB |
| TOOL-8 (round 36, local Toolshop) | 4 | 339 | 70 MB |
| TOOL-10 (fast path, few failures) | 2 | 41 | 1.3 MB |

One evaluation run of PB-2 (`03-eval`) is 624 files and 121 MB:

| Part of the run | Files | Size | Why it is that big |
| --- | --- | --- | --- |
| `html/` (Playwright report) | 255 | 61 MB | A second copy of every trace and screenshot in `artifacts/` |
| `artifacts/` | 343 | 58 MB | A trace, a screenshot and an error context per failed **attempt**: retries double it |
| `results.json` | 1 | 3.9 MB | 1.5 MB of base64 attachments: the fixtures attach every API exchange of every test, passed ones included |
| `triage.json` | 1 | 1.0 MB | 440 KB of evidence copied from `results.json` |
| `junit.xml`, `console.log` | 2 | 1.2 MB | The same results again, in two more forms |
| `verdict.md` (copy of the story's) | 1 | 230 KB | A second copy with rewritten links |
| `snapshots/`, `confirm/` | 19 | 84 KB | Working files of `--capture` and of the triager |

Hardening runs keep the same set (`02-harden` of PB-2: 608 files, 121 MB), although nobody reads them once the
hardener is done. Only `trace.zip` and `html/` are git-ignored, so the rest of every run is committed in the project.

Beside the runs, a story holds:
- files that carry a single field or a single event (`evaluation.json`, `draft-finished.json`, `publish-log.json`,
  `journeys-harvest.json`, `hardening/integrity.json`, `refreeze-log.json`, `amendments.json`);
- views a command can render again (`requirement-contract.md`, `requirement/evidence-pack.md`);
- a copy nothing reads (`requirement/raw-issue.json`);
- files the agents named themselves: `hardening/gaps.json`, `gaps-resolved.json`, `gaps.resolve.json`,
  `run-harden.out`, `api-chain.json`, and 10 to 30 `tier3/*.steps.json`, `tier3/*.md`, `api/*.chain.json`, `api/*.md`
  per story.

### How the folder reads today

Opened in a file browser, a story's folder lists about 15 entries in alphabetical order:

```
draft/  draft-finished.json  evaluation.json  hardening/  publish-log.json  requirement/
requirement-contract.json  requirement-contract.md  requirement-contract.review.json  runs/  test-data.json
tests/  verdict.json  verdict.md
```

That order is not the order of the work. The contract's three files sit beside the requirement folder, not in it.
`test-data.json` is apart from the tests that read it, and the frozen draft is apart from the spec it freezes.
`hardening/` holds integrity results and journey-harvest output as well as the hardener's work. The triage of a run
is inside the run, but the verdict that judges the runs sits at the top, next to bookkeeping files. To follow a story,
you have to know the pipeline already.

### Scripts the agents wrote

From the transcripts of this repository's sessions, 335 runs of the five evaluation subagents wrote 138 inline
scripts (0.4 per run), and 43 general-purpose runs that orchestrated rounds wrote 178 more. By purpose:

| What the script did | Seen in | What replaces it |
| --- | --- | --- |
| Print part of the contract (some ACs, the gaps, the endpoints) | extractor, author, hardener, triager, orchestrator | `heldout show KEY contract …` |
| Print the profile (accounts, roles, workers, prefix), masking passwords by hand | author, hardener | `heldout show config` |
| Walk `results.json`, `triage.json`, `junit.xml` or error contexts for one test | triager, orchestrator, auditor | `heldout show KEY run …`, `show KEY triage …` |
| Edit the contract or review JSON | extractor, reviewer | the file tools (no command needed) |
| Stamp `contractHash` and `reviewedAt` in the review | reviewer | `contract KEY --review-bind` |
| `new Date().toISOString()` | reviewer | stamped by the tools |
| Build or slice an inspector step list (sign in first, keep steps 1–7, add a probe) | hardener | `inspect --sign-in`, `--from`, `--then`, several `--steps` |
| Change one body field of a chain and call again | hardener | `api-probe --chain … --set` |
| Fetch pages 1–6 of a list and filter the names | triager, hardener | `api-probe --pages`, `--pick`, `--where`, `--count` |
| Pipe `curl` into node or python to read a field | hardener, orchestrator | `api-probe --pick` |
| Read the network log out of a trace | hardener | `heldout trace` |
| Search the output for a password | hardener | `heldout scrub KEY --check` |
| Make a text of N characters for a boundary | hardener, triager | `${text:N}` in probe steps, chains and `--var` |
| Set up a fresh round project; count runs and failures for the audit | orchestrator, auditor (development only) | `demo/round.ts` |

### The scripts folder

All 51 command and library files sit side by side; only the dispatcher's table says which ones are commands. Some
of what makes that hard to work in:

- `config.ts` (535 lines) holds the profile types, config loading and validation, story paths, argument parsing, file
  helpers, run listing, `.gitignore` handling and the process wrapper. 47 exports; nearly every file imports it.
- Commands import commands: `verdict.ts` imports `triage.ts`.
- There is an import cycle: `contract-model.ts` ⇄ `evidence.ts`.
- The dispatcher learns a command's flags with a regular expression over its source (`knownFlags`) and its help from
  its leading comment, and the command table repeats each command's usage a second time.
- Five files are over 400 lines (`journeys-store`, `config`, `contract-model`, `verdict`, `inspect`).
- `tests/` is flat as well, and names no area.

## 2. Principles

1. **Three kinds of output, and only one is kept.**
   - **Record**: what the evaluation was given, what it wrote, what it decided and the evidence its decisions cite.
     Small, text (and the screenshots it shows), committed with the project. People, `verdict`, `score.ts` and the
     auditor read it.
   - **View**: anything a command can render again from the record (the contract as markdown, the evidence pack, the
     triage report). Written to the scratch area or printed, never committed.
   - **Scratch**: raw tool output (Playwright's JSON, traces, the HTML report, console output) and agents' working
     inputs (step files, chain files). Git-ignored, under one folder, removed when the story is complete.
2. **One folder per question, in pipeline order.** A file lives in the folder of the question it answers (what was
   asked, what it means, how it is tested, what was seen, what ran, what we recommend), whichever command writes it:
   a screenshot the verdict copies is evidence, so it goes in `4-evidence/`. The folders are numbered so any file
   browser lists them in the order of the work, and the scratch area uses the same folder names.
3. **One file per kind of thing, not per event.** Events go into one append-only history, the frozen draft and its
   amendments into one file, every probe into one log.
4. **Evidence by reference, kept when cited.** A probe is `P7` and a failure is `04-rerun/SCN-012`. Decisions and logs
   name them, and nothing copies a report into another file. A probe or screenshot that a decision, a resolved gap or
   the verdict cites is kept in full; the rest goes with the scratch.
5. **Files the user can see stay authoritative; the history only holds what no file shows.** Whether a contract or a
   spec exists is read from the file, never from the history. The history holds events that leave no file behind (the
   draft marked finished, published, harvested) and the record for review.
6. **A command for every recurring need.** When an agent needs something no command does, it does it by hand with the
   file tools and says so (`Tool gap:` in its reply). The gap becomes a command in the skill, never a script in a
   round.
7. **One area per concern, thin commands.** A command parses its flags, calls its area's code and prints. A new file
   goes into the area of the concern it serves, and the dependency direction between areas is fixed.

## 3. Target layout of a story

```
output/<profile>/KEY/                         ← the record (committed)
  1-requirement/   story.md  linked/  transcripts/          what the story says (+ revisions/, CHANGES.md after a revision)
  2-contract/      contract.json  review.json               what the requirement means, and its independent review
  3-tests/         <key>.spec.ts  test-data.json  freeze.json  hardening.md   the tests, their data, the frozen draft, how they were made to work
  4-evidence/      probes.jsonl  P7.md  05-eval-SCN-012.png  everything observed live: every probe; cited reports and screenshots
  5-runs/          01-harden.json  02-eval.json             one record per run: its tests, their evidence, the decisions
  6-verdict/       verdict.md  verdict.json                 the recommendation
  history.jsonl                                              every step that changed the story, in order

.heldout/<profile>/KEY/                       ← scratch and views (git-ignored), the same folder names
  2-contract/      evidence-pack.md  contract.md
  4-evidence/      probes/Pn.md  steps/  chains/
  5-runs/          NN-label/ (results.json artifacts/ html/ junit.xml console.log shared-data/ snapshots/)  triage-NN-label.md
  stray/
```

**Why these six folders.** Each one answers one question a reviewer asks, in the order they ask it:
1. What was asked? (`1-requirement`)
2. What did we take it to mean? (`2-contract`)
3. How was it tested? (`3-tests`)
4. What did we see in the application? (`4-evidence`)
5. What happened when the tests ran? (`5-runs`)
6. What do we recommend? (`6-verdict`)

`history.jsonl` sits at the top because it spans every phase.

**Choices behind it**

- **Evidence is one folder, not a part of hardening and a part of triage.** The hardener's probes, the triager's
  live reproductions, the probes that resolved a contract gap and the screenshots the verdict shows are all
  observations of the application. One log and one folder hold them, numbered in the order they were made, whoever
  made them. Probes come before the runs (`4-` before `5-`) because most of them are made while hardening, before the
  evaluation runs. The few made while triaging are still listed there, with their phase in the log.
- **The tests' whole story is in `3-tests/`.** The spec, its data, the frozen draft it is compared with
  (`freeze.json`, with re-freezes and amendments) and the hardener's account of what changed in its mechanics and why
  (`hardening.md`, citing probes by id). Whatever integrity compares, and why it changed, is in one folder.
- **No prefixes inside a folder.** The folder already says what a file is: `2-contract/review.json`, not
  `requirement-contract.review.json`. The exceptions are `<key>.spec.ts` (Playwright needs the suffix) and
  `verdict.md`, which keeps its name because it is published.
- **A run is one file.** `05-eval.json` holds how the run was made, every test, the evidence of each failure, its
  automatic class and, once confirmed, the triager's decision: the triage writes into the run's record instead of a
  second file. The rule "runs are
  history" applies to these records: they are never renamed, renumbered or deleted. Only a run's raw output in the
  scratch is rotated away.
- **The scratch mirrors the record.** The evidence pack is in `.heldout/…/2-contract/`, the raw output of run 05 in
  `.heldout/…/5-runs/05-eval/`, the full report of probe 7 in `.heldout/…/4-evidence/probes/P7.md`. The folder name of
  a phase finds a file in either place.
- **The profile level stays as it is.** `output/<profile>/` holds only story folders; the journeys keep their own
  `journeys/` folder outside `output/`, because they belong to the application, not to a story.
- **`heldout status KEY` prints the folder of each phase** next to its state, so the pipeline and the folder are the
  same list:

```
1-requirement  fetch      ✔ story + 2 linked
2-contract     contract   ✔ 7 AC · 4 gaps · reviewed
3-tests        tests      ✔ 1 spec · 23 tests · frozen
4-evidence     probes     ✔ 14 (11 harden, 3 triage) · 4 cited
5-runs         run        ✔ 05-eval: 20 passed, 3 failed
               triage     ✔ 3 decided
6-verdict      verdict    ✔ FAIL · published
```

Citations keep working without change. The contract cites `story.md#L34`, relative to `1-requirement/`. The verdict
links `../4-evidence/P7.md` and `../5-runs/05-eval.json`; the copy published to Jira keeps them as text, as
today. Playwright finds the tests by `**/3-tests/*.spec.ts`.

What is kept: about 10 files, plus the linked pages and transcripts, one or two files per run, and the evidence
that is cited. For PB-2 that is roughly 10 + 4 runs + 2 triage files + about 10 cited items, so about 30 files and a
few MB, instead of 1,971 files and 375 MB. `.gitattributes` (written by `init`) merges `*.jsonl` under `output/` with
the union driver, so two branches that each appended to a story's history or probe log merge without a conflict. If
both branches made a probe of the same number, `lint` reports the duplicate id (`probe-id-twice`) and `advance`
gives the later one (by time) the next free id, with a `note` in the history. Citations are not rewritten: a citation
can't say which of the two it meant, so it keeps meaning the earlier one, and the note tells a reviewer to check.

### What happens to every current file

| Today | Target | Kind |
| --- | --- | --- |
| `requirement/story.md`, `linked/`, `transcripts/`, `history/`, `CHANGES.md` | `1-requirement/` (same names, except `history/` → `revisions/`, so it can't be mistaken for `history.jsonl`) | Record |
| `requirement/raw-issue.json` | not written | — |
| `evaluation.json` | `fetched` event in `history.jsonl` (profile, date, revision hash) | Record |
| `requirement/evidence-pack.md` | scratch `2-contract/evidence-pack.md`, written by `contract --pack` | View |
| `requirement-contract.json` | `2-contract/contract.json` | Record |
| `requirement-contract.review.json` | `2-contract/review.json` | Record |
| `requirement-contract.md` | scratch `2-contract/contract.md`, or `heldout show KEY contract --md` | View |
| `tests/*.spec.ts`, `test-data.json` | `3-tests/` | Record |
| `draft/*.spec.ts`, `draft/contract-oracle.json`, `draft/journeys.json` | `3-tests/freeze.json` | Record |
| `hardening/amendments.json`, `refreeze-log.json`, `draft-history/` | `3-tests/freeze.json` (`amendments`; `refreezes` with the previous specs) | Record |
| `draft-finished.json` | `draft-finished` event | Record |
| `hardening/integrity.json` | `integrity` event; `integrity KEY` recomputes it | Record |
| `hardening/tier2/`, `tier3/`, `api/`, `inspect-*.md`, `api-*.md` | one line each in `4-evidence/probes.jsonl`; full report in scratch, or `4-evidence/Pn.md` once cited | Record + scratch |
| `runs/NN/confirm/*.chain.json`, `*.md` | chains in scratch `4-evidence/chains/`; what they showed in `probes.jsonl` | Scratch + record |
| a screenshot the verdict shows | `4-evidence/NN-label-SCN-x.png` | Record |
| files the agents named (`gaps*.json`, `*.out`, step and chain files) | scratch `4-evidence/steps/`, `chains/`; anything else in `stray/` | Scratch |
| `runs/NN/run-meta.json` and a digest of `results.json` | `5-runs/NN-label.json` | Record |
| `runs/NN/triage.json` | the decisions go into `5-runs/NN-label.json`; its evidence is the record's own | Record |
| `runs/NN/triage.md` | scratch `5-runs/triage-NN-label.md` | View |
| `runs/NN/results.json`, `console.log`, `snapshots/`, `shared-data.json`, `artifacts/` | scratch `5-runs/NN-label/` | Scratch |
| `runs/NN/junit.xml`, `html/` | scratch `5-runs/NN-label/`, only with `--junit` / `--html` | Scratch |
| `runs/NN/verdict.md` | not written | — |
| `verdict.md`, `verdict.json` | `6-verdict/` | Record |
| `hardening/hardening-log.md` | `3-tests/hardening.md` | Record |
| `publish-log.json` | `published` event | Record |
| `hardening/journeys-harvest.json` | `harvested` event | Record |
| `hardening/journeys-staged.json` (the harvest's preview) | scratch `6-verdict/journeys-staged.json` | Scratch |
| `mock-jira/outbox/<time>__KEY__<action>.http` (3 per publish) | `mock-jira/outbox/KEY.http`, each request appended | Record (mock) |

### The run record: `5-runs/NN-label.json`

Written by `run` from Playwright's raw JSON. Its fields are **whatever the record's readers use today, and nothing
more**. The first task of work package 4 lists every read of `results.json`, `run-meta.json`, `error-context.md`,
`console.log` and `junit.xml`: classify, triage, the fast path in `advance`, the harvest, the seed summary, the
rate-limit check, `status` and `score.ts`. The record is designed from that list. What is known to be needed:

- from `run-meta.json`: label, command, workers, grep, repeat, health before and after, skill fingerprint, times, stats;
- the seed summary: records created, cleaned and kept by kind, records left behind, accounts taken and reset;
- per test: id, title, tags, status, attempts, duration (one line for a test that passed);
- per failed attempt: the error's first lines, the failing `[REQ …]` step and its line, the failure signature, the
  page's ARIA excerpt, the API exchanges (method, path, status, the `as` user, request and answer bodies redacted and
  cut to a limit) and the scratch paths of its screenshot and trace while they exist.

Everything that reads results reads this file, never the raw output. The fixtures keep each test's API exchanges in
memory and attach them only when the test fails, which takes most of the 1.5 MB out of the raw JSON as well. The seed
ledger is still attached for every test, because the seed summary counts records made by passing tests too.

### Artifacts and scratch

- Playwright's `outputDir` and reporters write to scratch `5-runs/NN-label/`. JSON always; JUnit with `--junit` and
  HTML with `--html`. The CI templates pass `--junit`, point the JUnit report at the scratch folder and upload the
  story's record and its raw output as job artifacts.
- Traces are kept for failures (`retain-on-failure`) in every run, hardening runs included: the hardener reads them
  with `heldout trace`. Of a retried test, only the last attempt's artifacts are kept.
- When a run starts, the raw output of the story's older runs is removed, except the last two runs and any evaluation
  run whose failures are not all decided yet. Disk use stays bounded while the story is in progress.
- `verdict` copies each screenshot it shows into `4-evidence/` and links that copy. `triage --set --evidence Pn`,
  `contract --resolve … --evidence Pn` and `confirm --evidence Pn` copy the probe's full report into
  `4-evidence/Pn.md`. That is how the live reproduction behind each confirmed application defect stays in the record
  after the scratch is gone.
- `heldout prune KEY` removes the story's scratch folder. `advance` runs it when it prints `✔ KEY is complete`, unless
  the project sets `"keepScratch": true`. `prune --all --older-than 14d` cleans up after stories that were left
  unfinished.
- Secrets are scrubbed after every run, over the record and the scratch, traces included, as now.

### The history: `history.jsonl`

One JSON line per step that changed the story, written by the command that made the change. Each line has the time,
the skill fingerprint, the phase folder it concerns and the command line, redacted (secrets appear as their
references). The events:

| Event | Phase | Carries |
| --- | --- | --- |
| `fetched`, `revised` | 1-requirement | profile, revision hash, sources |
| `contract-checked`, `review-bound` | 2-contract | errors, warnings, ACs, gaps by kind and resolution; review round and findings |
| `draft-finished`, `frozen`, `refrozen`, `amended`, `integrity` | 3-tests | specs hash, tests, TODO marks, journeys new and reused; reasons; integrity status |
| `hardened` | 3-tests | fast path or hardener; tiers, gaps resolved, guesses confirmed and corrected, journeys fixed, probes made |
| `run`, `triaged`, `decided` | 5-runs | label, stats, duration; automatic counts by class; test, class, carried or confirmed, `--any-reading`, evidence ids |
| `verdict`, `published`, `harvested` | 6-verdict | the outcome of each |
| `note`, `stray-moved`, `pruned` | any | a tool gap or remark an agent recorded; the files concerned |

`phases.ts` reads the events that leave no file (principle 5). `heldout show KEY history` prints the history as a
table, one section per phase folder. It is what the long-term review reads: how many runs a story took and why, which
probes were needed in which phase, how long each phase took, which tool gaps came up.

## 4. New and changed commands

All of them work from the profile and the story; none of them knows an application.

| Command | Does | Replaces |
| --- | --- | --- |
| `heldout show KEY contract [--ac AC-1,AC-7] [--gaps open\|mechanics\|oracle] [--endpoints] [--rules] [--errors] [--variants] [--md] [--json]` | Prints part of the contract | contract reads |
| `heldout show config [--aut id] [--json]` | The profile, secrets shown as their references; accounts with roles, `shared`, `perTest`; workers, pacing, prefix | config reads with masking by hand |
| `heldout show KEY run [NN] [--failed] [--test SCN-x] [--attempts] [--json]` | Reads the run record | walks of `results.json`, `junit.xml`, error contexts |
| `heldout show KEY triage [NN] [--pending] [--test SCN-x] [--json]` | Classes, decisions, groups | walks of `triage.json` |
| `heldout show KEY probes [--id P7] [--phase harden\|triage]` | The probe log | listing `hardening/` |
| `heldout show KEY history` | The history as a table, by phase folder | the auditor's and orchestrator's walks |
| `heldout trace KEY SCN-x [--run NN] [--network [--grep text]] [--console] [--steps]` | A redacted summary of a kept trace | unzipping traces; python on `trace.network` |
| `heldout scrub KEY --check` | Lists known secret values found in the record or the scratch; exit 1 when it finds one | secret searches by hand |
| `heldout prune KEY \| --all [--older-than 14d]` | Removes scratch | — |
| `heldout note KEY --tool-gap "…" \| --remark "…"` | A `note` event | gaps lost in a reply |
| `contract KEY --review-bind` | The reviewer's last step: binds the review to the contract hash and stamps the time | reviewer scripts |
| `contract KEY --pack` | Writes the pack to scratch `2-contract/` | — |
| `inspect` / `mcp-probe` `--sign-in <role or label>` | Starts the walk with the profile's recorded sign-in of an existing account | scripts that prepend sign-in steps |
| `inspect` / `mcp-probe` `--from P7[:k]` | Starts from the steps of an earlier probe (its first k) | scripts that slice step files |
| `inspect` / `mcp-probe` `--steps a.json --steps b.json` | Joins step files in order | scripts that join step lists |
| `inspect` / `mcp-probe` `--then '<step>'` (repeatable) | Appends one step without a file (in bash; in PowerShell, write the step file with the file tools) | scripts that append steps |
| `api-probe --chain P7\|file --set <step>.<field>=<value>` | Changes one value of a chain for this call | scripts that edit chain JSON |
| `api-probe --pages <param>[=from..to]` | Follows a paged list until it ends, or over the range, items joined | page loops |
| `api-probe --pick <path>` (repeatable), `--where <path>~<regex>`, `--count` | Picks fields of the answer (`data.*.name`), filters, counts | `curl … \| node`, python |
| `accounts --from-chain P7` | Takes the chain of a probe | a path in the story folder |
| `${text:N}`, `${now}` (with `${uid}`) in probe steps, chains and `--var` | An N-character text starting with the data prefix; the time | scripts for lengths and timestamps |

Tests don't get `${text:N}`: a length a test uses comes from the requirement and lives in its `@req-constants`.

**Probe log.** Every probe run with `--key` gets the next id `Pn` and one line in `4-evidence/probes.jsonl`: the
phase (from the story's state), the tool and tier, the input (steps or chain, secrets as references), a digest
(statuses, matches, what the page announced, anything unexpected) and the path of its full report in scratch
`4-evidence/probes/`. The digest has to make sense alone, because the report is removed with the scratch unless
something cites it. `--out` is removed, and `--evidence` takes probe ids, checks that they exist and keeps their
reports. Step and chain files an agent still writes go in scratch `4-evidence/steps/` and `4-evidence/chains/`, never
in the record. Lines are appended one at a time, so two probes started at once can't mix their lines.

## 5. Scripts grouped by area

### Target tree

```
.github/scripts/
  heldout.ts                 the dispatcher: the command table, help, flag checks (the only file at the top)
  heldout.config.schema.json
  core/         profile.ts (types) config.ts (load, validate) paths.ts (story folders, journeys, scratch) cli.ts
                (arguments, command contract, main) files.ts (JSON, write, rel, hashes) secrets.ts redact.ts zip.ts
                + history.ts (package 2)
  requirement/  fetch.ts contract.ts contract-model.ts evidence.ts
    jira/       client.ts datacenter.ts confluence.ts adf.ts types.ts
    mock/       jira-client.ts confluence-client.ts storage-format.ts new.ts
  authoring/    scaffold.ts spec-model.ts lint.ts preflight.ts integrity.ts integrity-check.ts confirm.ts draft.ts
    journeys/   journeys.ts registry.ts
  probe/        inspect.ts api-probe.ts mcp-probe.ts mcp-client.ts page.ts detect.ts accounts-recipe.ts
                + trace.ts (package 7); the probe log is core/probe-log.ts, since `contract` (requirement area) cites probes
  run/          run.ts results.ts fast-harden.ts
                (the digest of a run's raw results is triage/record.ts: the run command writes the record with it,
                which is why `triage` sits below `run`)
  triage/       triage.ts classify.ts triage-model.ts triage-report.ts repro.ts
  report/       verdict.ts verdict-rules.ts publish.ts scrub.ts
  flow/         advance.ts phases.ts status.ts  + show.ts, note.ts, prune.ts (package 7)
  setup/        init.ts update.ts doctor.ts mcp-config.ts secret.ts accounts.ts
```

This is the tree package 1a built. `core/paths.ts` is the one place that knows the story layout of section 3 (from
package 2). Every other file asks it for a phase folder and never writes a folder name of its own. What 1a decided:
- `config.ts` split into `core/profile`, `core/config`, `core/paths`, `core/cli` and `core/files`.
- `detect` and `accounts-recipe` are in `probe/`, not `setup/`: the inspector, `run`, `scrub` and the probes use them,
  and an area may only import downwards.
- `failedTests` moved from `triage-model` to `run/results.ts` (the run reads it, and `run` is below `triage`), and the
  draft's "finished" mark from `flow/phases` to `authoring/draft.ts` (`lint` writes it, and `authoring` is below
  `flow`).
- `verdict` takes its triage types from `triage-model`, not from the `triage` command.
- `requirement/jira/client.ts` no longer re-exports the Jira types and `confluenceLinks`: importers name the module
  that defines them.
- `contract-model` ⇄ `evidence` was a cycle of types only (`evidence` imports nothing of `contract-model` at runtime),
  so `evidence.ts` stays whole. The layout rules count runtime imports: type-only imports are erased when the
  scripts run and can't create a load-order problem.
- Files over 400 lines (`journeys/registry`, `contract-model`, `verdict`, `inspect`) are split when a package next
  changes them, not in 1a, which changes no behaviour.

### Rules

1. **Areas depend downwards only:** `core` ← `requirement` ← `authoring` ← `probe` ← `triage` ← `run` ← `report` ←
   `flow`, `setup` (`flow` and `setup` don't import each other). `core` imports nothing of the skill. No runtime import
   cycles. Type-only imports don't count.
2. **Commands don't import commands.** Code two commands share (what `verdict` takes from `triage` today) moves into
   the area's model file.
3. **The command contract.** A command module exports `spec` (name, group, one-line about, short usage, and the
   names of every flag it reads) and `run({ _, flags, argv })`. Importing it runs nothing. The dispatcher's table maps
   each command to its module. It imports just the requested module, rejects any flag not in `spec.flags`, and builds
   `heldout help` from the specs. `--help` prints the module's leading comment, which stays the one place a command's
   full usage is written: agents read it, and a second copy in `spec` would drift. `tests/dispatcher.test.ts` holds
   the three together: every flag the module (or a helper of its own area) reads is declared, every declared flag is
   read, and every flag the comment documents is declared. This removes `knownFlags` (the regular expression over
   source code at runtime), commands that run on import, `process.argv` read inside commands, and usage strings
   written twice.
4. **Paths come from `core/paths.ts`.** No other file joins a story folder or file name by hand; `layout.test.ts`
   looks for literal phase-folder names outside `core/paths.ts`.
5. **Where a new file goes:** into the area of its concern. A file over 400 lines is split at a seam when it is next
   changed. A new area needs a line in rule 1, and `SKILL.md` says nothing about the internal layout.
6. **Tests stay in one folder, named after what they cover** (`tests/<module or concern>.test.ts`). Most test files
   cover several areas (`parsing.test.ts` checks a dozen modules), so area folders would split them for no gain; at
   about fifteen files the folder doesn't need them.
7. **`tests/layout.test.ts`** checks rules 1 to 4: only `heldout.ts` at the top and every other script in a known
   area; every import resolves; every import within the allowed direction; no cycles; no command module importing
   another; from package 1b, every module in the dispatcher's table exports `spec` and `run`; from package 2, no
   phase-folder name outside `core/paths.ts`.

### What moves with it

- `heldout-support/fixtures.ts` imports `probe/page` and `core/redact`; `update` replaces the template as usual.
- `update` replaces only the files it installed before and removes the ones no longer shipped, so a project's flat
  copy of the scripts is replaced by the tree in one update. A project's own scripts in that folder are still left
  alone.
- `tsconfig.json` already includes `.github/scripts/**/*.ts`.
- The agent files, `SKILL.md` and the references name commands, never script files; the guide's few script names are
  updated.

## 6. Keeping it that way

- **Agent files.** Each evaluation subagent gets the same rule: no scripts of your own (no `node -e`, `python`,
  `.mjs`/`.cjs`, no JSON built by code). Read with `heldout show`, change files with the file tools, and when no
  command does what you need, do it by hand, then report `Tool gap: …` in the reply and with `heldout note KEY
  --tool-gap`. The orchestrator lists the gaps in its closing summary.
- **Agents name folders, not paths.** The agent files and references describe where a subagent writes by phase
  folder ("your steps go in `4-evidence/steps/` of the scratch"); `heldout status KEY` prints both roots for the
  story, so no agent builds a path from a profile name and a key by hand.
- **`tests/agent-files.test.ts`** checks that every agent file has the rule, and that every `heldout <command>
  --flag` written in an agent file, `SKILL.md` or a reference exists in that command's `spec`.
- **Stray files.** `lint` and `status` warn about any file in a story's folder that the layout doesn't have, and say
  which phase folder it belongs in. `advance` never stops for one (the pipeline is unattended): before the verdict it
  moves stray files to the scratch `stray/` folder and records a `stray-moved` event, which the auditor counts.
- **Secrets.** `advance` runs `scrub KEY --check` before it publishes; a finding is scrubbed, then checked again.
- No agent-app hooks: the rules hold the same way in GitHub Copilot and in Claude Code.

## 7. Developer tooling (this repository only, never copied by `init`)

- `demo/round.ts new <name> [--stories PB-1,PB-2]` makes a fresh round project in `$HELDOUT_ROUNDS_DIR/<name>`: a
  clone of the skill, `setup`, and the stories created in the mock Jira from `demo/stories/` with `heldout new`. The
  folder comes from the environment variable, so the repository holds no machine path.
- `demo/round.ts stats <project> [KEY]` lists runs, failures, script defects, amendments, review rounds, probes per
  phase, phase times, stray files and tool gaps per story, from the histories.
- `demo/inflight.ts <transcripts folder>` counts inline scripts per agent type: the measure of goal 3. It reads Claude
  Code transcripts, so rounds run in Claude Code are what it measures.
- `demo/score.ts` reads `6-verdict/verdict.json` and the run records `5-runs/*.json` (done with package 4).
- `dev-round-auditor` works from `heldout show` and `demo/round.ts stats`, and reports tool gaps and stray files as
  skill defects. Its instructions walk the story folder in its numbered order.

## 8. Work packages

In this order. No round project is updated while a package is half done.

**Definition of done, for every package:**
1. The code, the self-tests and every document the package affects are changed together: the agent files,
   `SKILL.md` and the references. The guide and the README wait for package 11.
2. `npm run typecheck` and `npm run test:skill` are green.
3. The dispatcher smoke test passes: `heldout help`, and `--help` on every command.
4. The repository holds no machine path (a grep for drive letters and user folders finds none).
5. The progress table below is updated with what was done, what was learned and anything that moved to a later
   package.
6. Committed and pushed.

| # | Package | Main files | Tests |
| --- | --- | --- | --- |
| 1a | **Areas.** Move the scripts into the tree (`git mv`, so history follows); split `config.ts`; remove the command-to-command import and the upward imports; fixtures' imports. Behaviour unchanged, so the existing self-tests prove the move | all of `.github/scripts/`, `heldout-support/fixtures.ts`, `tests/` | all existing tests; new `layout.test.ts` (rules 1, 2) |
| 1b | **The command contract.** `spec`/`run` in every command module; the dispatcher built on the specs; `knownFlags` and leading-comment help removed | every command module, `heldout.ts`, `core/cli.ts` | new `dispatcher.test.ts` (the smoke test); `layout.test.ts` (rule 3) |
| 2 | **Story folders, history and scratch.** `core/paths.ts` defines the whole layout of section 3 at once, record and scratch, so every later package writes straight into its final place; every reader and writer of a story path goes through it; `testMatch` becomes `**/3-tests/*.spec.ts`; `core/history.ts`; `init`/`update` add `.heldout/` to `.gitignore` and the union merge to `.gitattributes`; `fetch` stops writing `raw-issue.json` and `evaluation.json`; `draft-finished`, `published` and `harvested` become events; `phases` and `status` read them and print the phase folders; the mock outbox becomes one file per story | `core/*`, `playwright.config.ts`, `requirement/fetch.ts`, `flow/phases.ts`, `flow/status.ts`, `report/publish.ts`, `authoring/journeys/*`, `setup/init.ts`, `setup/update.ts` | new `paths.test.ts`, `history.test.ts`; `advance.test.ts` |
| 3 | **Freeze in one file.** `3-tests/freeze.json` replaces `draft/`, `integrity.json`, `amendments.json`, `refreeze-log.json` and `draft-history/` | `authoring/integrity.ts`, `authoring/freeze.ts`, `report/verdict*`, `run/fast-harden.ts`, `flow/advance.ts` | `integrity.test.ts` |
| 4 | **Run record.** First, the inventory of every read of run output; then Playwright output to scratch, `run-record.ts`, `--junit` and `--html`, last attempt only, raw-output rotation, the fixtures attaching exchanges on failure only; every reader moved to the record; CI templates | `playwright.config.ts`, `heldout-support/fixtures.ts`, `run/*`, `triage/classify.ts`, `triage/triage-model.ts`, `flow/phases.ts`, `.gitlab/`, `.github/workflows/` | new `run-record.test.ts` from a recorded raw JSON; `classify.test.ts` |
| 5 | **Triage and verdict.** `5-runs/NN-label.triage.json` with evidence by reference; the triage report and the confirm chains to scratch; cited screenshots to `4-evidence/`; no copy of the verdict per run | `triage/*`, `report/verdict*` | `triage-report.test.ts` |
| 6 | **Probe log.** `Pn` ids and `4-evidence/probes.jsonl`; `--out` removed; `--evidence Pn` checked and its report kept; the hardening log at `3-tests/hardening.md`; views to scratch | `probe/*`, `requirement/contract.ts`, `authoring/confirm.ts`, `triage/triage.ts`, `authoring/scaffold.ts`, `setup/accounts.ts` | new `probe-log.test.ts` |
| 7 | **Read commands.** `show`, `trace`, `note`, `prune`, `contract --review-bind`, `scrub --check` | `flow/*`, `probe/trace.ts`, `requirement/contract.ts`, `report/scrub.ts` | new `show.test.ts`; `secrets.test.ts` |
| 8 | **Probe composition.** `--sign-in`, `--from`, several `--steps`, `--then`, `--set`, `--pages`, `--pick`, `--where`, `--count`, `${text:N}`, `${now}` | `probe/*`, `setup/accounts-recipe.ts` | `parsing.test.ts` |
| 9 | **Rules and checks.** The no-scripts rule and `Tool gap:` in the five agent files and their bridges; agents told folders, not paths; stray files moved by `advance`; `scrub --check` before publishing; `SKILL.md` "Output layout" and the references rewritten for the layout and the commands | `.github/agents/*`, `.claude/agents/*`, `SKILL.md`, `references/*`, `authoring/preflight.ts`, `flow/advance.ts` | `agent-files.test.ts` |
| 10 | **Developer tooling.** `demo/round.ts`, `demo/inflight.ts`, `score.ts` and the auditor | `demo/*`, `.github/agents/dev-round-auditor.agent.md` | — |
| 11 | **Guide, README and `docs/next-steps.md`**, with the story folder drawn as section 3 draws it | `docs/heldout-evaluator.html`, `README.md` | — |

**A check before any live round.** In packages 4 and 5, the new `triage` and `verdict` run on raw results kept from
rounds 35 and 36 (PB-2, TOOL-8), on this machine and not committed. The automatic classes and the verdict must match
what those rounds produced, links and file names aside. It is cheaper to find a lost field there than in a live round.

### Progress

| # | State | Commit | Notes |
| --- | --- | --- | --- |
| 1a | done | d7747cd | 51 scripts in 9 areas, only `heldout.ts` at the top; 235 self-tests green (230 + 5 layout). Found on the way: the typecheck was already red at the start (a test fixture missing `attempts`, fixed first); the `contract-model` ⇄ `evidence` "cycle" was type-only; `detect` and `accounts-recipe` belong to `probe/`; two functions moved to break upward imports (section 5). Tests stay in one folder (rule 6) |
| 1b | done | a0758d2 | 24 commands on the contract; 239 self-tests green. `add-aut` became its own module (`setup/add-aut.ts`), with `init` and it sharing `setup/profile-setup.ts`, instead of `init` reading a `--add-aut` flag the dispatcher slipped in. `init` started from the skill's clone runs `update` and the project's `init` through the dispatcher, not by script path; `add-aut` runs in a set-up project only. Flags are declared by name: their help stays in the module's leading comment (rule 3). Checked live: `init` from a clone into an empty project, `add-aut`, `status`, `lint` |
| 2 + 3 | done | aa470a4 | Done as one package: in `3-tests/`, the old `draft/` folder of spec files would have sat inside the tests folder, where spec discovery is recursive, so the freeze had to become `freeze.json` in the same step. Built: `core/paths.ts` with the six phase folders and the scratch area (`PHASE_FOLDERS`, `SCRATCH_DIR`); `core/history.ts` (`recordEvent`, `recordChange` (only when the outcome changed), `lastEvent`, the skill fingerprint moved here from `run`); events written by `fetch` (fetched, revised), `contract` (contract-checked), `lint --draft-finished`, `integrity` (frozen, refrozen, amended, integrity), `run`, `triage` (triaged, decided), `verdict`, `publish`, the harvest; `phases`/`status` read them and print each phase beside its folder; `readContract`/`readReview` take the file; the evidence pack and the readable contract go to the scratch area (and `advance` rebuilds a missing pack without handing the story back to the extractor); `raw-issue.json`, `evaluation.json`, `draft-finished.json`, `publish-log.json`, `journeys-harvest.json`, `integrity.json`, `amendments.json`, `refreeze-log.json`, `draft-history/` and the per-run verdict copy are gone; the mock outbox is one `.http` file per story; `init`/`update` add `.heldout/` and the union merge; verdict links are relative to `6-verdict/`; a `doctor` check that still looked for `test-data.json` at the story's root fixed. Probe reports go to `4-evidence/` (record) and working files to the scratch `4-evidence/` until package 6 brings probe ids. Tests: `history.test.ts`, layout rule 4 (no phase-folder name outside `core/paths.ts`), integrity tests on `freeze.json`; 246 green. Checked live: `init`, `new`, `fetch`, `contract --pack`, `status` in an empty project |
| 4 + 5 | done | 9b428f7 | Done as one package, and simpler than planned: the run's record is the one file per run, and triage writes its decisions into it, so there is no second `.triage.json`. Inventory of readers first (classify and triage read the raw JSON's attachments, `phases`/`verdict`/`advance` read `run-meta.json` and `triage.json`, the rate-limit check reads `console.log` and error contexts, `score.ts` reads `triage.json`); then: `triage/record.ts` (the digest that `triage` used to build on demand, now built by `run`, with long answers cut to 8 000 characters for the exchange a failure is about, 2 000 for the rest of its calls and 1 000 for precondition calls — after the classification has read them whole); `RunRecord`/`RunMeta`/`SeedSummary` in `triage-model`; `triage` moved below `run` in the area order (the run command writes the record with triage's digest); Playwright's output to the scratch area, JSON always, JUnit and HTML only with `--junit` / `--html`; only the failing attempt's artifacts kept; raw output rotated (the last two runs, and any evaluation run still in triage); a run that produced nothing is recorded all the same; the fixtures attach a test's API exchanges only when it failed; the triage report (`triage-<run>.md`) and the replay chains (`4-evidence/chains/<run>/`) in the scratch area; the verdict copies the screenshot a finding shows into `4-evidence/` and links the run records; the CI templates pass `--junit` and upload the record and the raw output; `score.ts` reads the run records. **Replay check** on round 36's TOOL-8 (four runs, raw results kept): the automatic classes of both evaluation runs match the round's, the verdict, its three defects and their tests match, and `score.ts` scores it as before. Size: 344 KB per run record against 436 KB of `triage.json` + 1.85 MB of `results.json` + 182 KB of JUnit before. Live check: three runs of a two-test story (retries, `--junit`), record, raw output, pruned retry artifacts, triage, status. Tests: `run-record.test.ts`; 248 green |
| 6 | done | 652d1be | `core/probe-log.ts` (in core, not probe: `contract`, which is below `probe`, cites probes): `inspect`, `api-probe` (a call or a chain) and `mcp-probe` with `--key` log the next `Pn` in `4-evidence/probes.jsonl` (phase, tool, tier, input with secrets as references, a digest of table rows or calls) and write the full report to the scratch area; `--out` removed (without `--key` the report is printed); `--evidence` of `contract --resolve` / `--resolve-from`, `triage --set` and `confirm` checks every `Pn` it names and keeps that probe's report as `4-evidence/Pn.md` (text without a probe id, such as a run, is still accepted); `accounts --from-chain Pn` takes a probe's chain; the triage report's replay lines say to cite the id. Docs: hardener, triager, `hardening.md`, `triage.md`, `requirement-contract.md`, SKILL. The repository's own `.gitignore` gains `.heldout/`. Tests: `probe-log.test.ts`; 253 green. Live check: a probe against a local server logged as P1, cited by a decision (report kept), an unknown P5 refused. Not done here, moved to package 9: the `probe-id-twice` lint and renumbering after a union merge |
| 7 | done | c0daf0f | New commands: `show` (contract parts or `--md`, config with secrets as references, a run, the decisions, the probes, the history; `--json`), `trace` (a failed test's kept trace as text: steps, calls with bodies, console; secrets masked; reads the zip with the bundled reader), `note` (`--tool-gap`, `--remark` into the history), `prune` (one story or `--all --older-than`), `scrub --check` (lists files still holding a secret, inside trace archives and base64 attachments too; exit 1), `contract --review-bind` (stamps the review's contract hash, time and item hashes; a `review-bound` history event with the round and the findings). The review prompt no longer tells the reviewer to run `node -p` for the time, nor to copy the hash. `advance` removes a complete story's scratch area unless `"keepScratch": true` (new, in the schema). The contract's markdown moved to `requirement/contract-render.ts` (shared by `contract` and `show`); `removeDir` in `core/files`. Tests: `show.test.ts`; 257 green. Live check: every new command in a scratch project |
| 8 | done | (this commit) | `probe/compose.ts` puts a walk together: `--sign-in <role or user name>` (the profile's recorded UI sign-in of an existing account; inspect only, since MCP steps resolve by role and name, so an MCP walk starts `--from` one that signed in), `--from Pn[:k]`, `--steps` repeatable, `--steps-json`, `--then` repeatable, in that order; used by `inspect` and `mcp-probe`. `api-probe`: `--chain Pn` (the chain the probe ran), `--set <step>.<field>=<value>` (temporary chain, removed after; the log keeps the chain that ran), `--pages <param>[=from..to]` (stops at an empty page, `last_page`, the range end or 50 pages), `--where <field>~<regex>`, `--pick <field>`, `--count`; results in a "Picked" section and the digest. `${text:N}` and `${now}` (`core/secrets.expandGenerated`; the prefix is the profile's data prefix, set as `AUT_DATA_PREFIX` by `loadConfig`). No change was needed in `setup/accounts-recipe.ts`. Docs: hardening reference "Compose probes" table, hardener, triager, triage reference, SKILL.md. Tests: `compose.test.ts`; 263 green. Live check: `--chain P2 --set`, `--pages --where --pick` against a local paged API |
| 9 | done | (this commit) | The no-scripts rule and `Tool gap:` (with `note KEY --tool-gap`) in the five evaluation agents (the Claude Code bridges only point at them, so they carry it too); the agents already named folders and `status KEY` for both roots. `core/paths.ts`: `RECORD_LAYOUT` (what each phase folder may hold), `strayFiles` (each with where it belongs) and `moveStrayFiles` (to scratch `stray/`, emptied folders removed). `lint` warns `stray-file` and `probe-id-twice`; `status KEY` lists stray files. `advance`, before the verdict: moves stray files (`stray-moved` event) and renumbers a duplicated probe id (`core/probe-log.renumberDuplicateProbes`: the later by time gets the next free id, a `note` event; citations are not rewritten, see section 3); before publishing (and in the not-evaluable path): `scrub --check`, scrub on a finding, check again, stop if still found. SKILL.md: "Commands, not scripts" guardrail, runs are records not folders, stray files and `keepScratch` under Output layout, tool gaps in the closing summary. `agent-files.test.ts`: the rule in every evaluation agent; every `heldout <command> --flag` in the agents, SKILL.md and the references exists in that command's spec (with a guard that over 100 commands were checked; a planted bad flag is caught). Tests: strays and the move in `layout.test.ts`, renumbering in `probe-log.test.ts`; 267 green. Live check: `status` and `lint` on a planted stray in the scratch project |
| 10 | done | (this commit) | `demo/round.ts new <name> --base-url … [--stories …]` makes `$HELDOUT_ROUNDS_DIR/<name>` with `setup.sh --no-pull` from this clone (the project's skill is this clone's, not a second clone), then `heldout new` per story with `ac-field.md` as `--ac-from` and every other page as `--page <id>=…`, the id read from the story's `[<page title>\|…pageId=<id>]` link. `demo/round.ts stats <project> [KEY]`: a table per story from `history.jsonl`, the run records and the probe log (runs, failed in the last eval, script defects, amendments / re-freezes, review rounds, probes per phase, minutes per phase, stray files, tool gaps; with KEY, the gap and remark texts). `demo/inflight.ts <transcripts> [--since] [--list]`: inline programs, heredoc files, `sed -i` and script files per agent type (from each subagent's `.meta.json`), per 100 tool calls; a baseline on this repository's transcripts since 2026-10-10 shows the contract reviewer at 17.5 per 100 calls (the review's hash and time, which `--review-bind` now does) and the other evaluation agents at 0 to 1.7. The `dev-round-auditor` gets the stats, reads with `heldout show`, counts in-flight scripts, and lists tool gaps, stray files and in-flight scripts as skill defects. `tsconfig.json` typechecks `demo/` and loses the old layout's excludes. `demo/RUNNING-LOCALLY.md`: "A round, and what it cost". Live check: `round.ts new smoke --stories TOOL-4` (criteria field and linked page) and `fetch` there; `stats` on two projects; 267 green |
| 11 | to do | | |
| Round 37 | to do | | |

## 9. Proof: round 37

One fresh onboarding made with `demo/round.ts new`, the stories one at a time on locally started applications, and
the skill fixed between stories. The stories: PB-2 (the most failures), TOOL-8 (deep, several roles) and TOOL-10 (the
fast path). Then `demo/round.ts stats` and `demo/inflight.ts` on the round's transcripts.

| Measure | Rounds 35–36 | Target |
| --- | --- | --- |
| Verdicts and defects against the answer keys | as keyed | the same |
| Files kept per story (PB-2) | 1,971 | ≤ 40 |
| Size kept per story (PB-2) | 375 MB | ≤ 10 MB |
| Entries at the top of a story's folder | about 15, alphabetical | 7: six phase folders and the history |
| Scratch left after a completed story | — | none |
| Stray files in a story folder | up to 40 | 0 moved by `advance` |
| Inline scripts per evaluation subagent run | 0.4 | 0; every need met by hand instead is a reported tool gap |
| Why did a story take N runs? | answered from many files | answered from `show KEY history` alone |
| Files at the top of `.github/scripts/` | 51 | 1 |

These baselines come from round projects made before this change; `score.ts` won't read them once package 10 lands.
That is why the numbers are written here.

## 10. Risks

| Risk | Handling |
| --- | --- |
| A path written by hand somewhere (a script, an agent file, the guide) still points at the old layout | `core/paths.ts` is the only place with folder names, checked by `layout.test.ts`; `agent-files.test.ts` checks the documents; package 2 lands the whole layout at once |
| Numbered folders read as a fixed sequence, while triage probes come after the runs | The numbers order folders by what a reviewer reads first, not by when each file was written; the probe log says the phase of every probe, and `show KEY probes --phase triage` lists them |
| A run record that misses a field a reader needs | Inventory first; replay on kept rounds before any live round |
| A half-moved skill in a round project | No round project is updated while a package is half done |

## 11. Critique log

What each critique of this plan found, and what changed. The latest round comes first.

**Fourth version**

| Flaw | Consequence | Now |
| --- | --- | --- |
| The hardener's account sat in `6-verdict/` | It is written in phase 3, before any verdict exists, in a folder named after a later phase | `3-tests/hardening.md`, next to the spec and the freeze it explains |
| "A file lives in the folder of the phase that writes it" contradicted the layout | The verdict writes screenshots into `4-evidence/`; the rule and the tree disagreed | The rule is "the folder of the question the file answers" |
| "Runs are history" read against raw-output rotation | It looked like the plan deleted runs | The rule covers the run records; only scratch is rotated |
| Probe ids from two branches could collide after a union merge | Two different `P7`s, citations pointing at the wrong one | `lint` reports `probe-id-twice`; `advance` renumbers the later one |
| Package 1 was the biggest change in one step | A failure would be hard to locate between "moved" and "rewired" | Split: 1a moves files with behaviour unchanged; 1b changes the command contract |
| No definition of done, no place for progress | Packages could land half-documented, and a resumed session couldn't tell where the work stood | Definition of done and a progress table in section 8 |
| No check that every command still starts | A broken import in a command no test loads shows up only in a round | Dispatcher smoke test: `help` and `--help` on every command |

**Second and third versions**

| Flaw | Consequence | Now |
| --- | --- | --- |
| Probe reports went with the scratch | The live reproduction behind a confirmed application defect would be gone once the story completed, and the rule "no application defect without live reproduction" could no longer be checked afterwards | Cited probes and screenshots are kept in `4-evidence/` |
| Hardening runs kept no traces | The hardener reads traces to diagnose its own runs: it would have gone back to scripts | Traces on failure in every run; older raw output rotated |
| Scratch grew without bound until completion | Four runs of PB-2 would still be about 375 MB on disk mid-story | Only the last two runs' raw output (and runs still in triage) are kept |
| `advance` refused a verdict over a stray file | An unattended pipeline would stop and wait for a person | Stray files are moved to scratch and recorded |
| The run record's fields were guessed | A reader that lost a field (the fast path, the harvest, rate-limit detection) would fail in a live round | Inventory of readers first; replay on kept rounds before any live round |
| `--then` with inline JSON | PowerShell breaks the quoting, which is why step files exist in the first place | `--then` for bash; PowerShell writes the step file with the file tools; `--steps` repeatable |
| `${text:N}` in `test-data.json` | Would put a requirement value outside `@req-constants` | Probes only |
| The ledger as the source of state | It could disagree with files a person edited | Files stay authoritative; the history holds what no file shows |
| Appended files committed by two branches | Merge conflicts on every shared story | Union merge for `*.jsonl` |
| The bloat inside `results.json` was not traced to its source | Only the copy would shrink | Fixtures attach exchanges on failure only |
| The CI templates were not considered | CI artifacts and the JUnit report would point at paths that no longer exist | Package 4 updates both templates |
| Scripts were left flat, and new commands were added to the pile | The folder was heading for 59 files | Areas, the command contract and a layout test, as package 1, so later packages land in the tree |
| The mock outbox became JSON lines | Loses the readable HTTP form that makes the mock look like Data Center | One `.http` file per story, requests appended |
| No account of the baselines | Old rounds can't be scored once the layout changes | Baselines recorded in section 9 |
| The story folder was only made smaller, not easier to follow | Fewer files, still in alphabetical order with no relation to the work, and the scratch named differently from the record | Six numbered phase folders, mirrored in the scratch and printed by `status` (section 3) |

## 12. Removed outright

`draft/`, `draft-finished.json`, `evaluation.json`, `publish-log.json`, `requirement/raw-issue.json`; the
`requirement/`, `tests/`, `hardening/` and `runs/NN/` folders and the story-root contract and verdict files, all
replaced by the six phase folders; `requirement/evidence-pack.md` and `requirement-contract.md` in the record;
`integrity.json`, `amendments.json`, `refreeze-log.json`, `journeys-staged.json`, `journeys-harvest.json`;
`run-meta.json` and the copy of the verdict per run; the HTML report and JUnit file by default; one outbox file per
request; the probes' `--out` flag and path-based `--evidence`; `knownFlags`, help from leading comments and the usage
strings in the command table; the flat scripts folder and flat `tests/`; folder and file names written outside
`core/paths.ts`; and every mention of these in the skill, the agents, the guide and the README.
