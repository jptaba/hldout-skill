# Governance, guardrails, observability, security and separation of duties

A plan for two things:

1. **The product**, the evaluator that `setup.sh` installs into other people's projects. It gets controls that hold by
   construction, not by memory. Every control must stay AUT-agnostic, work the same in GitHub Copilot and Claude
   Code, and cost nothing a story would notice.
2. **The maintainer tooling** of this repository: how the skill itself is changed. Here
   [sample-agent-setup](https://github.com/jptaba/sample-agent-setup) (branch `main`) is adopted as tooling for
   maintainers only, never shipped by `init`. In this repository, the steps that setup gives a person (approve,
   restate, accept) are done by the maintainer agent. Anyone who clones this repository gets the same agents and
   skills, working with no changes, or one setting if they want a person at the gate.

Rules that apply to both:

- **Enforce in code, not in memory.** A rule that only an agent file states is a hope. Each control below names
  where it is enforced: a command, a hook, a test or a tool list.
- **Local and fast.** Nothing phones home, nothing waits for a service, and nothing goes on an evaluation's path
  unless it replaces something slower. Each control has a cost in section 7.
- **One owner per control**, recorded in the files that enforce it.
- **No back-compat shims**, as in the refactoring plan.

## 1. What already exists

The evaluator was built around separation and evidence. The plan starts from what is there:

| Concern | What exists | Enforced by |
| --- | --- | --- |
| Held-out isolation | Tests come from the requirement only; the test author has no browser | Agent tool lists (`tools:`), agent instructions |
| Separation of duties | Builder ≠ reviewer of the contract; author ≠ hardener ≠ triager; a fresh context each | Subagents; `contract --review-bind` binds the review to the contract's hash |
| WHAT vs HOW | The draft is frozen; hardening changes mechanics only | `integrity` (freeze, audited amendments); journey lint |
| Evidence, not recall | Every criterion is quoted and cited; every literal is grounded; every probe is `Pn` and cited by id | `contract` checks; probe log; `citeProbes` |
| Audit trail | `history.jsonl` per story, with the skill's hash on every event; one record per run; the freeze | `core/history.ts`, run records, `freeze.json` |
| Observability | `status`, `show`, `trace`; `demo/round.ts stats`; `demo/inflight.ts` | Commands |
| Secrets | `${env:…}`/`${vault:…}` references; redaction; scrub after each run; `scrub --check` before publishing | `core/redact.ts`, `core/secrets.ts`, `advance` |
| Human decision | The verdict is a recommendation; `jira.publish: "manual"` | Verdict wording, config |
| Layering of the code | Areas depend downwards only; commands don't import commands | `tests/layout.test.ts` |
| Agent rules | No scripts of their own; tool gaps reported; documented commands exist | `tests/agent-files.test.ts`, `demo/inflight.ts` |
| Bounded autonomy | At most 3 repair loops; no question to anyone after fetch | `advance` |

## 2. Gaps

| # | Gap | Why it matters |
| --- | --- | --- |
| G1 | The "no browser" rule for the extractor, the reviewer and the test author holds only through their tool lists. Each still has a shell, so it can run `heldout inspect` against the application. | The core held-out guarantee is one shell command from being broken, silently. |
| G2 | Story text, linked pages and the application's pages are untrusted input that agents read. Nothing marks them as data, flags text that reads like an instruction, or cleans what the application said before it is published to Jira. | Prompt injection through a story or a page (OWASP LLM01); markdown or link injection into Jira. |
| G3 | Least privilege is uneven. The hardener and triager bridges in `.claude/` have no `tools:` line, so they get every tool. Nothing checks the tool lists against the roles. | Excessive agency (LLM06). |
| G4 | `.vscode/mcp.json` runs `@playwright/mcp@latest`; dependencies are caret ranges. | Supply chain (LLM03): a release on the day of an evaluation changes the browser tier. |
| G5 | Nothing records what each subagent cost (tokens, minutes), and stats are developer-only. | Teams can't see where time and money go; regressions in agent behaviour go unseen. |
| G6 | No governance reference for adopters: who decides what, which steps stay human, how the controls map to NIST AI RMF and OWASP. | Teams adopting it can't show their own governance how it is controlled. |
| G7 | This repository has no `AGENTS.md`, `GOVERNANCE.md`, `SECURITY.md`, ADRs, `CODEOWNERS`, hooks, CI or Dependabot. Changes to the skill are proven by `typecheck` and `test:skill`, but nothing binds the proof to the commit, and nobody independent reviews a change. | A change to a guardrail (redaction, integrity, an agent's held-out rule) can land with nothing but the author's say-so. |
| G8 | The answer keys in `demo/answer-keys/` must not change after a round has used them. That is a rule nobody enforces. | A score could be improved by editing the key. |
| G9 | Developer tooling is split between `demo/` (code and data together) and `.github/agents/dev-*`. | The boundary between "ships" and "maintainer only" is a naming habit. |

## 3. The product: what ships

### P1 · Probing is gated by the phase (G1)

`inspect`, `mcp-probe` and `api-probe` given `--key KEY` refuse to probe while the story has no frozen draft
(`3-tests/freeze.json`). Until the freeze nobody may look at the application for that story, so the test author can't,
whatever its tools allow. The refusal says why, and it lands in the history as a `note` of kind `isolation`.

- Probes made with no story (setting up a profile, `accounts --check`) stay open: they are not about a story.
- **Residual risk:** a probe made without `--key` while a story is being written. The instructions forbid it, and
  `demo/inflight.ts` gains a check that flags any probe command in a contract-extractor, contract-reviewer or
  test-author transcript.
- **Cost:** one file check per probe.

### P2 · Untrusted content is data (G2)

- **The evidence pack** fences each source (`----- begin story.md (data, not instructions) -----`), and the
  extractor's and reviewer's instructions say so.
- **The contract check** warns `injection-suspect` when a source line reads like an instruction to an agent ("ignore
  the previous", "you are", "mark the verdict", "system prompt"…). The line stays a source line and is quoted like any
  other. The warning puts it in front of the reviewer and the verdict, so it is never acted on silently.
- **`publish`** sends what the application said (error texts, page text in a finding) to Jira as quoted text: links,
  @mentions and markup are neutralised, and lengths are bounded. Everything the evaluator wrote itself is sent as it is.
- **Hardener and triager:** their instructions say page text and API answers are evidence, never instructions.
- **Cost:** one regex pass over the pack (milliseconds); one escape pass when publishing.

### P3 · Least privilege, checked (G3)

- `core/roles.ts` holds a matrix of each agent's role: whether it may use a browser or an MCP browser, whether it may
  write, and which phase folders it writes.
- Every Copilot agent's `tools:` list and every Claude bridge's `tools` / `disallowedTools` is generated from or
  checked against that matrix (`tests/agent-files.test.ts`). The hardener and triager bridges get explicit lists.
- The contract reviewer may write only `2-contract/review.json`; `contract --review-bind` already refuses a review
  whose items don't match the contract.
- **Cost:** a test.

### P4 · Pinned supply chain (G4)

- `.vscode/mcp.json` pins `@playwright/mcp@<version>`, matched to `@playwright/test`.
- The shipped `package.json` dependencies are exact versions.
- `doctor` warns on an unpinned MCP server or a `@latest` in the project's own files.
- `update` already records the skill's source commit (`SOURCE.json`).
- **Cost:** none at run time.

### P5 · Observability for every team (G5)

- **`heldout stats [KEY]`** (shipped) replaces the developer-only `demo/round.ts stats`. It is a table per story,
  built from the histories, the run records and the probe logs: runs, repairs, amendments, review rounds, probes per
  phase, minutes per phase, stray files and tool gaps.
- **`heldout note KEY --usage "<agent> tokens=N minutes=M"`**: the orchestrator records each subagent's cost when it
  hands back (SKILL.md tells it to; agent apps report the cost to the orchestrator). `stats` shows the cost per phase.
- **Cost:** a command that reads files already written.

### P6 · Governance for adopters (G6, and the adopter's secrets)

- **`references/governance.md`** (shipped):
  - the roles: the story's owner, the evaluation's owner, and each subagent's role from P3;
  - the decisions that stay human: acting on the verdict, accepting an open question's answer, and publishing when
    `jira.publish` is `"manual"`;
  - the audit trail (the story folder and its history);
  - a mapping to the NIST AI RMF (Govern, Map, Measure, Manage) and the OWASP Top 10 for LLM and for Agentic
    applications.
- **`init --git-hooks`** (opt-in): a pre-commit hook in the adopter's project that runs the existing `findSecrets`
  scan (`core/redact.ts`) on the staged files, and refuses files over 1 MB in `output/`.
- **Cost:** under 1 s per commit.

## 4. The maintainer tooling: adopting sample-agent-setup

### What it is

sample-agent-setup has three layers:

- **Project rules:** `AGENTS.md`, always loaded.
- **Task procedures:** the `implement`, `review` and `pr-packet` skills.
- **An isolated, read-only reviewer:** `code-reviewer`, which has no Write or Edit tool.

Around them: a contract per change, whose SHA-256 is bound into the evidence; an append-only run ledger; a
pre-commit hook (no commits to `main`, a secret scan, no files over 1 MB); ADRs; `GOVERNANCE.md` and `SECURITY.md`
mapped to NIST AI RMF and OWASP; `CODEOWNERS`; and Dependabot.

### Take, adapt, drop

| From sample-agent-setup | Here | Why |
| --- | --- | --- |
| `AGENTS.md` (build, test, never-do) | **Take**, rewritten for this repository: `npm run verify`; the greenfield, AUT-agnostic, agent-agnostic and no-machine-paths rules; Edit/Write only. Plus `CLAUDE.md` (one line, `@AGENTS.md`) and `.github/copilot-instructions.md`, so both apps load the same rules. | Today these rules live only in one maintainer's agent memory. |
| `implement`, `review`, `pr-packet` skills | **Adapt** as `.github/skills/dev-implement`, `dev-review` and `dev-pr-packet`, with bridges in `.claude/skills/`. | Same folders and bridges as the product skill; `dev-` keeps them out of `init`. |
| `code-reviewer` (read-only) | **Adapt** as `dev-code-reviewer`, in both apps: Copilot `tools: ['read', 'search', 'execute']`; Claude `tools: Read, Grep, Glob, Bash`, `disallowedTools: Write, Edit`. | Independent review by construction, as `heldout-contract-reviewer` already does for contracts. |
| `references/contract.md` per change | **Adapt.** A change's contract is the plan section or round finding it implements. A small change gets a short file in `docs/contracts/NNNN-*.md` with the same headings (inputs, outputs, proof, done when, bad result). | The plans here already are contracts; no second copy. |
| `collect-evidence.sh`, `scan-secrets.sh` (bash) | **Adapt** as `dev/evidence.ts` and `dev/scan-secrets.ts`, in TypeScript. They reuse `core/redact.ts` and the repository's test runner, and they work on Windows. | One language, tested like the rest. |
| `.agents/runs/runs.jsonl` | **Adapt** as `dev/.ledger.jsonl` (git-ignored). Each line: the tree hash, the contract hash, the proof command, its exit code, and the time. | The local half of the audit trail. The commit carries the other half (see the gate below). |
| Pre-commit: secrets, files over 1 MB | **Take.** | Cheap, catches the costly mistakes. |
| Pre-commit: no commits to `main` | **Replace** with a proof gate: a commit is accepted only when the ledger shows `npm run verify` passed on exactly the staged tree. | The owner's workflow is small commits pushed to `master` once green. The proof gate keeps that speed and adds what the branch rule was for. |
| ADRs (`docs/adr/`) | **Take.** 0001 as in the sample, then short ADRs written after the fact for the decisions already made: the record layout, commands not scripts, unattended after fetch, greenfield. | The rationale is in chat transcripts today. |
| `GOVERNANCE.md`, `SECURITY.md`, `CODEOWNERS` | **Take** and fill in: owner `@jptaba`; the gate as below; secrets, dependencies, skills as a trust boundary, least privilege, prompt injection. | |
| `dependabot.yml` | **Adapt:** `npm` and `github-actions` (the repository is on GitHub). | |
| Python and Java demos, `textutils`, the sample packets | **Drop.** | They demonstrate the setup, not this project. |

### Where things go: maintainer-only by construction

```
AGENTS.md  CLAUDE.md  GOVERNANCE.md  SECURITY.md      maintainer rules and policy (repository root)
.github/CODEOWNERS  .github/copilot-instructions.md  .github/dependabot.yml
.github/workflows/dev-verify.yml                      this repository's CI (heldout.yml stays the shipped template)
.github/agents/dev-*.agent.md  .claude/agents/dev-*.md
.github/skills/dev-*/  .claude/skills/dev-*/
.githooks/                                            pre-commit, commit-msg (installed with npm run dev:hooks)
dev/                                                  maintainer tools: evidence, scan-secrets, gate, round, inflight, score
dev/policy.json                                       the gate's settings and the risk tiers
docs/adr/  docs/contracts/                            decisions, per-change contracts
demo/                                                 data only: the stories and their answer keys
```

`init` and `update` ship only the skill folder, `.github/scripts/`, the workspace files, the settings and the CI
templates. A test fails if any path above ever appears in what they ship. Developer code moves out of `demo/` into
`dev/` (round, inflight, score), so `demo/` holds data only (G9).

### The gate, and who does the human steps

Every change goes through the same sequence:

1. **Implement** under a contract (the `dev-implement` skill).
2. **`npm run verify`**: typecheck, `test:skill` and the agent-files checks. `dev/evidence.ts` writes the PR
   packet, from real output only, and a ledger line.
3. **Review** by `dev-code-reviewer` in a fresh context, read-only. Its verdict is APPROVE, REQUEST CHANGES or
   BLOCKED, with file and line per finding.
4. **Gate**: the commit message carries trailers, which the `commit-msg` hook checks:

   ```
   Contract: docs/refactor-plan.md#8 (sha256:…)
   Proof: npm run verify · exit 0 · tree 4b1e…
   Review: dev-code-reviewer · APPROVE · 0 findings
   Gate: <the change restated in the gatekeeper's own words, and what was not checked>
   ```

In sample-agent-setup the gate is a person who restates the packet in their own words before merge. **In this
repository the maintainer agent is the gatekeeper**, as the owner asked. It restates the change in its own words,
names what could not be checked, and the hook accepts the commit only with an independent review on record. So
the change is never approved by its author's say-so alone, even when the author is also the gatekeeper.

How much review a change needs depends on what it touches. The tiers are path globs in `dev/policy.json`:

| Tier | Paths | Review |
| --- | --- | --- |
| 0 · docs | `docs/**` (not the guide's guardrail sections), plan progress, `*.md` outside `.github/` | none; proof gate only |
| 1 · code | everything else | one `dev-code-reviewer` |
| 2 · guardrails | `core/redact.ts`, `core/secrets.ts`, `authoring/integrity*`, `requirement/contract-model.ts`, `requirement/evidence.ts`, the evaluation agents' held-out rules, `demo/answer-keys/**`, `dev/policy.json`, `.githooks/**` | two reviews, the second on a different model; an answer-key change also needs an ADR |

**Anyone else who clones this repository** gets the same agents, skills, hooks and gate, and they work unchanged,
with the agent as gatekeeper. A team that wants a person at the gate sets `"gate": "human"` in `dev/policy.json`.
The `commit-msg` hook then requires an `Approved-by:` trailer, and refuses one written by an agent run (the dev
skills tell agents never to write it). That is the one change.

**What stays with a person** whatever the setting, because an agent can't or mustn't do it:

- rotating a leaked credential;
- the repository's own settings on GitHub: branch protection, secret scanning and push protection;
- accepting a GitHub App or a token scope.

The maintainer agent prepares each of these (what, where, why) and stops; it never holds those credentials.

### Answer keys (G8)

`demo/answer-keys/HASHES` pins the SHA-256 of each key. `npm run verify` fails when a key changes without its pinned
hash being updated in the same commit, which is a tier-2 change: two reviews and an ADR. `dev/score.ts` prints each
key's hash in the scorecard, so a score always names the exact key it was measured against.

## 5. Separation of duties and isolation

| Role | Sees | Writes | Can't | Enforced by |
| --- | --- | --- | --- | --- |
| Contract extractor | the evidence pack | `2-contract/contract.json`, transcripts | probe the application; write the review | P1, P3, `review-bind` |
| Contract reviewer | the evidence pack and the contract | `2-contract/review.json` | change the contract; probe | P3, `review-bind` (hash) |
| Test author | the reviewed contract, the journeys | `3-tests/`, journey files | probe the application | P1 (freeze gate), P3 |
| Hardener | everything, live | HOW only: locators, journeys, gaps' mechanics | change WHAT | `integrity` (freeze, amendments), journey lint |
| Triager | runs, live | decisions in the run record, probes | edit tests or journeys | P3, `integrity` |
| Orchestrator | everything | nothing in a story's record directly | skip a phase or a gate | `advance`, phase checks |
| Maintainer implementer | the repository | code under a contract | approve its own change | the gate (`commit-msg` + independent review) |
| `dev-code-reviewer` | the diff, the packet | nothing | edit anything | its tool lists |

Other separations stay as they are:

- **Code:** the areas depend downwards only (`layout.test.ts`).
- **Data:** a kept record and a scratch area; secrets only as references; journeys per profile.
- **Environments:** an application started locally and thrown away after a round, where possible.

## 6. Standards mapping

- **NIST AI RMF:**
  - Govern: `GOVERNANCE.md`, CODEOWNERS, ADRs, `references/governance.md`.
  - Map: the requirement contract and its gaps, in the product; per-change contracts, for maintainers.
  - Measure: run records, `stats`, the scorecard, `inflight`.
  - Manage: the bounded repair loop, integrity, rollback by revert, an ADR per incident.
- **OWASP LLM / Agentic:**
  - LLM01 prompt injection: P2.
  - LLM02 sensitive information disclosure: redaction, scrub, scrub before publish, pre-commit scans.
  - LLM03 supply chain: P4, Dependabot, skills reviewed like packages.
  - LLM06 excessive agency: P1, P3, the read-only reviewers, bounded loops, no questions after fetch.
  - LLM09 misinformation: evidence by citation, the review bound to the contract's hash, live reproduction before a
    defect is confirmed.

## 7. Speed and quality budget

| Control | Where it runs | Cost |
| --- | --- | --- |
| P1 phase gate | each probe with `--key` | one file check |
| P2 injection check, publish escaping | `contract`, `publish` | milliseconds |
| P3, P4 tool-list and pin checks | `test:skill`, `doctor` | none at run time |
| P5 `stats`, `--usage` | on demand | reads existing files |
| P6 adopter hook | each commit in an adopter's project (opt-in) | under 1 s |
| Maintainer pre-commit | each commit here | under 1 s: secrets, size, ledger lookup by tree hash; `verify` runs before, not inside, the hook |
| Maintainer review | per commit, tier 1 or 2 | one read-only subagent, about 1–2 minutes, during which the next change can start |
| CI `dev-verify` | each push | the same `verify`, off the critical path |

Quality guard on the controls themselves: each package ships with tests. Its proof is a round, or a replay, that
shows the control caught what it is for, and that a story takes no longer than before.

## 8. Work packages

The product packages come first; they protect every adopter. All of them run after Round 37 of the refactoring
plan has finished.

| # | Package | Main files | Proof |
| --- | --- | --- | --- |
| GP1 | Phase-gated probing | `core/probe-log.ts` or a guard in `probe/*`, history `note` kind `isolation`, `demo/inflight.ts` check | a probe with `--key` before the freeze is refused; after, allowed; a test |
| GP2 | Untrusted content | `requirement/evidence.ts` (fences), `contract-model.ts` (`injection-suspect`), `report/publish.ts` (escaping), agent instructions | a story carrying an injected instruction: flagged, quoted, never obeyed; published text escaped; tests |
| GP3 | Least privilege | `core/roles.ts`, bridges, Copilot tool lists, `agent-files.test.ts` | the matrix test fails on any agent beyond its role |
| GP4 | Pinned supply chain | `.vscode/mcp.json`, `package.json`, `setup/doctor.ts` | `doctor` flags `@latest`; a fresh setup runs the pinned versions |
| GP5 | `stats` and `--usage` | `flow/stats.ts` (from `demo/round.ts stats`), `flow/note.ts`, SKILL.md | `stats` on round 37 matches the dev tool's numbers |
| GP6 | Governance reference, opt-in hook | `references/governance.md`, `setup/init.ts --git-hooks` | a staged secret is refused in a scratch project |
| GM1 | Maintainer rules and policy | `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `GOVERNANCE.md`, `SECURITY.md`, `CODEOWNERS`, `docs/adr/0001–0005` | both apps load the rules (a fresh session names them) |
| GM2 | Dev skills, the reviewer and evidence | `.github/skills/dev-*`, bridges, `dev-code-reviewer` (both apps), `dev/evidence.ts`, `dev/scan-secrets.ts`, `docs/contracts/` | a change goes implement → verify → review → gate, end to end |
| GM3 | Hooks, tiers and CI | `.githooks/pre-commit`, `.githooks/commit-msg`, `dev/policy.json`, `npm run dev:hooks`, `.github/workflows/dev-verify.yml`, `.github/dependabot.yml` | an unverified tree, a staged secret and a tier-2 change with one review are each refused; a verified tier-1 commit takes under 1 s |
| GM4 | `dev/` and `demo/` separated; answer keys pinned; the shipping boundary tested | `dev/round.ts`, `dev/inflight.ts`, `dev/score.ts`, `demo/answer-keys/HASHES`, a test on `update`'s shipped list | `init` into a scratch project ships none of the maintainer files; an edited key fails `verify` |
| Proof | Round 38 on the product packages, and the next fixes made under the maintainer gate | — | stories as fast as round 37; every gate fired where it should; nothing slower than section 7 says |

## 9. Progress

| # | Status | Commit | Notes |
| --- | --- | --- | --- |
| GP1 | to do | | |
| GP2 | to do | | |
| GP3 | to do | | |
| GP4 | to do | | |
| GP5 | to do | | |
| GP6 | to do | | |
| GM1 | to do | | |
| GM2 | to do | | |
| GM3 | to do | | |
| GM4 | to do | | |
| Proof | to do | | |

## 10. Risks

| Risk | Effect | Answer |
| --- | --- | --- |
| The phase gate blocks a legitimate probe | A hardener stuck before the freeze | There is no legitimate one: the draft is frozen before anyone looks at the application. Setup probes carry no `--key` and stay open. |
| `injection-suspect` warns on ordinary story text ("you must sign in") | Noise the reviewer learns to ignore | The patterns address an agent or a system, not a user. Measured on the 14 demo stories before it ships: zero hits there is the bar. |
| Reviews slow maintainers down | Fewer, bigger commits | Tier 0 needs none; tier 1 runs while the next change starts; the hook itself stays under 1 s. Measured in the Proof package. |
| The agent gatekeeper approves weak changes | Self-approval in another form | The gate requires an independent review on record; tier 2 requires two, on different models. The `Gate:` restatement and the review are in the commit for the owner to audit at any time. |
| Rules diverge between the two agent apps | One app runs looser | A single source (`AGENTS.md`, `core/roles.ts`) and tests that check the generated files against it. |
| Maintainer files leak into adopters' projects | Clutter, confusing rules | The shipping-boundary test (GM4). |
