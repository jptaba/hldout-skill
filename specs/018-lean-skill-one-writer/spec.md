# Feature Specification: A lean skill for both apps, and an overview with one writer

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-09 | **Status**: Draft

**Input**: the owner's request (2026-11-09) to redesign the skill, its subagents and the application knowledge so
they are effective and work in GitHub Copilot as well as Claude Code in VS Code, and what the reviews of
`specs/017-application-knowledge` left open. Read against the apps' current documentation: the skill's description is
longer than a skill's description may be, SKILL.md says GitHub Copilot reads only `.github/`, and nothing tells a
Copilot user which agent, model and permission level an evaluation needs. Read against the rounds: the coordinator
takes in the whole of SKILL.md (about 35 KB) to drive a loop a command already drives, a hardener or triager makes
three or four calls to learn what earlier stories kept, and an overview every agent reads before a freeze can be
written by a story's agents while another story is drafted.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The skill loads and runs in GitHub Copilot and in Claude Code (Priority: P1)

**Independent Test**: the agent files' tests.

**Acceptance Scenarios**:

1. **Given** the skill and its Claude Code bridge, **Then** each has the folder's name as its `name` and one
   description of at most 1024 characters, the same in both.
2. **Given** an agent file of the skill, **Then** its body is at most 30,000 characters.
3. **Given** a project being set up, **Then** the setup reference says, for GitHub Copilot, which agent to pick, that
   the session's model is Opus (a subagent's model must fit the session's), which permission level lets an
   evaluation run unattended, and where each app reads the Playwright MCP server from; SKILL.md no longer says an
   app reads one folder only.

### User Story 2 - The coordinator reads what it needs to coordinate (Priority: P1)

**Independent Test**: the agent files' tests (SKILL.md's size and the references it names).

**Acceptance Scenarios**:

1. **Given** SKILL.md, **Then** it holds who coordinates, the `advance` loop, what happens unattended, the tiers, the
   guardrails and the closing summary, in at most 24,000 bytes; the setup, the phases step by step and the output
   layout are references it names and the coordinator reads when it gets there (setup once per project; a phase by
   hand; where a file belongs).
2. **Given** the move, **Then** no rule is lost: every guardrail of SKILL.md stays in it, and the moved sections say
   what they said.

### User Story 3 - One writer of the overview (Priority: P1)

**Independent Test**: the knowledge tests and the agent files' tests.

**Acceptance Scenarios**:

1. **Given** a story, frozen or not, **Then** `map KEY --about … --add` is refused: the overview is written at setup,
   before a story or between stories, and cites nothing.
2. **Given** a hardener or a triager whose probe contradicts an overview entry, **Then** it marks the entry stale with
   that probe, as before; what the overview lacks it says in its reply, and the coordinator's closing summary lists
   it for a person to add between stories. Their files name no way to add to the overview.
3. **Given** a stale overview entry that holds after all, **Then** adding the same text again at setup restores it.

### User Story 4 - A required rule is retired by a reviewed requirement only (Priority: P1)

**Acceptance Scenarios**:

1. **Given** a story whose contract is not reviewed clean as it is now, **Then** `map KEY --stale <rule> --evidence R2`
   is refused for a required rule, as its harvest keeps nothing of such a contract.
2. **Given** the hardener's and the triager's files, **Then** each says that a probe which contradicts a required rule
   leaves it as it is.

### User Story 5 - What earlier stories kept, in one call (Priority: P2)

**Acceptance Scenarios**:

1. **Given** a frozen story and at most 40 map entries and rules together, **Then** `map KEY` prints the overview,
   every domain's entries and the rules, each under its own framing; **Given** more, **Then** the overview, the
   domains with their counts and the number of rules, with the commands that read one.
2. **Given** the hardener's and the triager's files, **Then** each reads the application's knowledge with that one
   command, and a domain or the rules alone only when it says so.

## Requirements *(mandatory)*

- **FR-001**: US1 to US5 as stated. A held-out rule changes (who writes what every agent reads before a freeze):
  guardrail tier, two reviews.
- **FR-002**: Left from the reviews of spec 017 and closed here: US3.3, US4; `plan.md` of spec 017 no longer lists
  `app.yml` in the contract check; its tasks T001 to T005 are ticked.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for US1.1, US1.2, US2.1, US3.1, US3.3, US4.1, US4.2, US5.1 and
  the agent files' side of US3.2 and US5.2.
- **SC-002**: A fresh round of two stories of one application, in a session started in the round project, reaches
  both verdicts as keyed: the second story's hardener and triager read the knowledge in one call, and neither adds
  to the overview. Open until rounds resume.
- **SC-003**: One story run end to end in GitHub Copilot with the shipped settings. Open: Copilot is not run here.

## Assumptions

- GitHub Copilot and VS Code, as their documentation said on 2026-11-09: a skill's `description` has at most 1024
  characters and its `name` is its folder's; an agent file's body at most 30,000 characters; a tool name an app
  doesn't know is ignored; a subagent whose model is above the session model's tier doesn't run; a Copilot session
  reads the root `.mcp.json` and VS Code passes `.vscode/mcp.json` on; a session's permission level is Manual by
  default (`chat.permissions.default`); Allow all runs every call without asking; Assisted lets a model judge each
  call, asks for the ones it doesn't approve and is not offered in every kind of session; an organization's policy
  can disable a level (the last three read again on 2026-11-10).
- Not confirmed from the documentation, and left as they are: the model names in the agents' `model` lists, the
  `browser` entry in their `tools`, whether `chat.tools.edits.autoApprove` applies in every Copilot session kind, and
  what an app does with two agents or skills of one name when it reads both `.github/` and `.claude/`.
- The form without a story can't tell who calls it: an agent of a frozen story that ran it would pass the same checks
  on the text, and no agent file names the form. It stays refused while a story is between its fetch and its freeze.
  What a story's agent runs for its story (`map KEY …`, `status KEY`, the refusal of `map KEY --about`) never shows
  the form; the command's own usage and `status` without a story do, marked as setup's: they are the person's.
- The 40 of US5 is about 2k tokens of output, the size round 42's whole map had.
