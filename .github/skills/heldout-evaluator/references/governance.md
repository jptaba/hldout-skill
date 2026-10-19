# Governance: who decides what, and how the evaluator is controlled

For the people who adopt the evaluator and answer for it: the roles, the decisions that stay with a person, the
record that shows what happened, and how the controls map to the NIST AI Risk Management Framework and the OWASP Top
10 for LLM and agentic applications.

## Roles

| Role | Who | Decides |
| --- | --- | --- |
| Story owner | the person who owns the Jira story | what is correct: answers the open questions the verdict puts to them, accepts or rejects each finding |
| Evaluation owner | the person who runs the evaluator for a team | which stories are evaluated, which environment, whether a verdict is published (`jira.publish`), the project's settings |
| Orchestrator | the main agent session (Opus in GitHub Copilot or Claude Code) | nothing about WHAT is correct: it runs the phases, the commands between them, and hands work to the subagents |
| Subagents | one fresh context per phase | their phase's output only, within their role (below) |

What each subagent may do is fixed by the skill, in both agent apps' files (`.github/agents/`, `.claude/agents/`);
`heldout doctor` warns when a project widens one.

| Subagent | Sees | Writes | Can't |
| --- | --- | --- | --- |
| Contract extractor | the evidence pack | the requirement contract | look at the application (no browser; probes refused before the freeze) |
| Contract reviewer | the evidence pack, the contract | its review, bound to the contract's hash | change the contract unnoticed; look at the application |
| Test author | the reviewed contract, the journeys | the tests and the journeys they call | look at the application |
| Hardener | everything, live | HOW a test works: locators, waits, journeys | change WHAT it expects (the freeze and audited amendments) |
| Triager | the runs, live | its decisions and evidence | edit the tests or the journeys (the freeze shows it) |

## Decisions that stay with a person

- **Acting on the verdict.** The verdict is a recommendation: each finding has a confirm / reject / clarify box for
  the story's owner. The evaluator raises no issue and moves no story.
- **What is correct.** An open question about expected behaviour goes to the story's owner through the verdict;
  nobody is asked while an evaluation runs, and no agent answers it.
- **Publishing**, when `jira.publish` is `"manual"`: the evaluation owner runs `heldout publish KEY` after reading the
  verdict.
- **Secrets.** A person puts them in `.env` or Vault (`heldout secret NAME --ask` in their own terminal); agents only
  ever see references (`${env:NAME}`, `${vault:path#field}`).
- **Rotating a leaked secret**, and the repository's own settings (branch protection, secret scanning).

## The record

Everything an evaluation did is in its story folder, `output/<profile>/<KEY>/`, which the team commits:

- `history.jsonl`: every step, with the skill's version on each line; tool gaps, remarks, probes refused before the
  freeze and each subagent's cost, as notes.
- The requirement as fetched, the contract and its review (bound by hash), the frozen tests (`freeze.json`, with
  every audited amendment and re-freeze), each run's record, the triage decisions with their evidence, the verdict.
- `heldout show KEY …` reads it; `heldout stats` sums it per story (runs, repairs, review rounds, probes, minutes per
  phase, subagent cost).

## Controls

| Control | What it does | Where |
| --- | --- | --- |
| Held-out isolation | The tests come from the requirement only; nothing probes the application for a story before its draft is frozen | probe commands refuse before `3-tests/freeze.json`; the test author has no browser |
| WHAT vs HOW | Hardening changes how a test works, never what it expects | `heldout integrity` (freeze, audited amendments), journey lint |
| Evidence, not recall | Every criterion is quoted and cited; every expected value exists in the sources; an independent review is bound to the contract's hash | `heldout contract` checks |
| Least privilege | Each subagent has exactly the tools of its role, in both agent apps | the agent files; `doctor` warns on a widened one |
| Untrusted content is data | Story text, linked pages and the application's answers are data, never instructions; a line that reads like an instruction to an agent is flagged and listed in the verdict; nothing the application said becomes markup in Jira | `injection-suspect` in `heldout contract`; the evidence pack; `publish` |
| Secrets | References only; redaction while running; scrub after each run; a check before publishing; an opt-in pre-commit hook | `heldout scrub --check`, `heldout precommit` (`heldout init --git-hooks`) |
| Pinned supply chain | The Playwright MCP server and the dev dependencies `init` adds are exact versions | `doctor` warns when the Playwright MCP server isn't the pinned one; the dev dependencies are the project's to keep |
| Bounded autonomy | At most 3 repair loops; no question to anyone once a story is fetched | `heldout advance` |

### The pre-commit hook (opt-in)

`heldout init --git-hooks` installs a pre-commit hook that runs `heldout precommit`: a commit is refused when a staged
file (zip archives and a run's base64 bodies included) holds one of the project's secret values, or when a staged file
in the output folder is over 1 MB. Each refusal names the file and the secret's name, never its value.

- **The secret values** are the environment's (.env included) whose name says secret (PASS, TOKEN, SECRET, API_KEY)
  and the project's Vault values, read when Vault can be reached from the commit (when it can't, the check says so
  and goes on). A value too weak to look for (a plain word, a short number) is not looked for; a value a story
  publishes in its requirement (a sandbox's demo password) is not a secret.
- **Where:** the hook goes where git looks for this repository's hooks, and goes to the project's folder first when
  the project is a sub-folder of its repository. A hook the project already has, or a hooks folder outside the
  repository (a global one), is never written to: init prints the line to add.
- It takes about a second, plus Vault's answer when the project uses Vault (at most 5 seconds: a Vault that doesn't
  answer by then is said and not waited for).

## Standards mapping

**NIST AI RMF**

- **Govern:** the roles and decisions above; the project's own owners and review rules for its repository.
- **Map:** the requirement contract and its gaps: what the requirement says, what it leaves open, what was assumed.
- **Measure:** the run records, `heldout stats`, the triage decisions with live reproduction.
- **Manage:** the bounded repair loop, the freeze and its audited amendments, the verdict as a recommendation for a
  person to act on.

**OWASP Top 10 for LLM and agentic applications**

- **Prompt injection (LLM01):** untrusted content is data; `injection-suspect`; literal text in Jira.
- **Sensitive information disclosure (LLM02):** references only, redaction, scrub, the check before publishing, the
  pre-commit hook.
- **Supply chain (LLM03):** pinned versions; `doctor`; the skill updated from its own repository (`SOURCE.json`).
- **Excessive agency (LLM06):** least privilege per subagent, held-out isolation, bounded loops, no questions after
  fetch, no issue raised automatically.
- **Misinformation (LLM09):** evidence by citation, the review bound to the contract's hash, live reproduction before
  a defect is confirmed.

**OWASP Top 10 for agentic applications**

- **Agent goal hijack:** untrusted content is data; a line addressing an agent is flagged and listed in the verdict;
  each subagent's goal comes from its agent file and the orchestrator's task, never from the story or the page.
- **Tool misuse and excessive privilege:** least privilege per subagent; probe commands refuse before the freeze;
  of MCP servers, the hardener and triager reach only the Playwright one.
- **Identity and privilege abuse:** secrets as references only, typed by a person; test accounts per profile.
- **Agentic supply chain:** the pinned MCP server; the skill and its agents copied from one repository, recorded in
  `SOURCE.json`; `doctor` warns on a widened agent.
- **Unexpected code execution:** commands, not scripts: no agent writes a program of its own; what no command does
  is reported as a tool gap.
- **Memory and context poisoning:** each subagent starts in a fresh context and works from the files on disk; the
  contract is bound to its review by hash, the tests to their freeze.
- **Insecure communication between agents:** agents hand work over through files the next one checks (the contract
  check, the integrity check), not through each other's replies.
- **Cascading failures:** at most 3 repair loops; a failure the triager can't reproduce stays a question, never a
  defect.
- **Trust in the agent's output:** the verdict is a recommendation with evidence and a decision box per finding; no
  issue is raised automatically.
- **Rogue agents:** every step is in the story's history with the skill's version; the freeze and the review hash show
  any change made outside the rules.
