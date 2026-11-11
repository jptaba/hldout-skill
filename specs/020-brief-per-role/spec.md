# Feature Specification: A brief per role, printed by the tool; agent files written from one definition

**Feature Branch**: `master` (constitution VI) | **Created**: 2026-11-10 | **Status**: Draft

**Input**: the redesign's recommendations 1 and 5 (2026-11-10), which the owner asked to have built. Each subagent's
instructions exist three times (its GitHub Copilot file, its Claude Code bridge, its role in the code), and each
tells the agent which commands to run to learn where it stands. Rounds showed agents spending most of their budget
reading before their first real action.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One command says what a role needs now (Priority: P1)

1. **Given** a story, **When** a subagent runs `heldout brief KEY --role <its name>`, **Then** it prints, in this
   order: the story's record and scratch folders; where the story stands, phase by phase; what the application is
   (the overview, which every agent may read at any time, with its warning that it is never evidence); and the
   role's procedure, with the story's key in place of `KEY`.
2. **Given** a role's procedure, **Then** it is the text its agent file held, unchanged, kept once in the skill
   (`briefs/<role>.md`) and so the same in both agent apps.
3. **Given** `brief` without a role, with an unknown one, or for the coordinator, **Then** it is refused and the
   roles are named. `brief` prints nothing a role may not know before a freeze: no map entry and no rule.

### User Story 2 - An agent file is a role, its limits and that command (Priority: P1)

1. **Given** a subagent's file, **Then** it holds who the agent is, what it never does (its held-out limits stay
   in the file, so a brief that fails or is wrong removes no limit), and the `brief` command to start with. The
   Claude Code bridge has the same body instead of pointing at the Copilot file.
2. **Given** `core/agent-text.ts`, **Then** each subagent's Copilot file and Claude Code bridge are exactly what it
   writes from the role (`ROLES`), its description, its text and the model lists: a test compares every file on
   disk with it, and `npx tsx dev/agents.ts --write` writes them. The coordinator's file stays written by hand.

## Requirements *(mandatory)*

- **FR-001**: US1 and US2 as stated. No held-out rule changes: every sentence an agent was told is still told, in
  its file or its brief, and the tests that pinned sentences in the agent files pin them in file and brief together.
- **FR-002**: `brief` and the briefs ship with the skill; `dev/agents.ts` is maintainer-only.

## Success Criteria *(mandatory)*

- **SC-001**: Typecheck and the suite pass, with tests for US1.1 to US1.3 and US2.1 to US2.2.
- **SC-002**: Each subagent's generated file is at most 25 lines (the coordinator's, written by hand, is not counted).
- **SC-003**: A round of two stories shows agents following the printed brief as they followed the file, and what
  they read before their first real action (`dev/context.ts`).

## Assumptions

- A brief is as long as the file it came from: what is saved at first is the calls an agent made to find the
  folders, the story's state and the overview, and the bridge's extra read in Claude Code. Shortening the procedures
  themselves is for a round to guide.
- An agent that never runs `brief` has its limits and nothing else; a round shows whether that happens.
