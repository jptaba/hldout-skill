# AGENTS.md

The rules of this project for any agent: the held-out evaluator skill. Every agent app loads this file each session,
so it stays short. With `.agents/config.json` (owner, proof steps, tiers, gate) it is all that is project-specific in
the agent setup; the skills, the reviewer, `agentctl`, `GOVERNANCE.md` and `SECURITY.md` are the same in any project.

## Build and test
- Install: `npm ci` (Node 20.11+). Typecheck: `npm run typecheck`. Tests: `npm run test:skill`.
- Prove a change (both, bound to the staged tree): `node .agents/scripts/agentctl.mjs verify --contract <file>[#section]`.
- Hooks, once per clone: `git config core.hooksPath .githooks`.

## How a change is made
- `implement` → `agentctl verify` → the `code-reviewer` agent (a fresh context; two independent ones for guardrail files) →
  `pr-packet` (the commit carries the `Gate:` restatement; the hooks add the record). `agentctl status` says what the
  staged change still needs. Docs-only changes need neither proof nor review.
- Commit and push at each green point: small, focused commits on `master`.
- The plans in `docs/` are contracts: point `--contract` at the section or progress row a change implements.

## Models
- Every agent runs on Opus (Copilot lists start with Claude Opus; Claude Code bridges say `opus`). Sonnet is only a
  fallback, for when Opus is unavailable; an agent that only did basic work (just running a command) could run on it,
  and none of the current agents does. Independence between agents comes from separate contexts, not separate models
  (ADR 0003).

## Rules of this project
- **Greenfield:** no backward-compatibility shims, deprecated aliases or migration code.
- **AUT-agnostic:** the skill never names an application, its routes, fields or values. Demo applications appear only
  under `demo/` and in docs about rounds.
- **Agent-agnostic:** "Opus" for the model; GitHub Copilot and Claude Code named together where the app matters.
- **No machine paths** (`D:/…`, `C:/Users/…`) in any repository file.
- **File tools only:** change files with Edit/Write, never with `sed`, heredocs or scripts that patch files.
- **What ships** to adopters (`init`/`update`): `.github/skills/heldout-evaluator/`, `.github/scripts/` and the files
  `SHIPPED` in `setup/update.ts` lists. Everything else here, the agent setup included, is maintainer-only
  (`tests/agent-kit.test.ts`): the developer tools in `dev/`, the demo stories and answer keys in `demo/`.
- **Secrets:** probes and tests reference secrets as `${env:NAME}` or `${vault:path#field}`, never their values; the
  evaluator redacts and scrubs what it writes.

## Code (`.github/scripts/`, `tests/`)
- Builtins with the `node:` prefix; no new runtime dependency without a contract naming it.
- A command module exports `spec` and `run`, reads only the flags its spec declares and documents them in its leading
  comment (`tests/dispatcher.test.ts`).
- Imports follow the areas' order: core ← requirement ← authoring ← probe ← triage ← run ← report ← flow, setup
  (`tests/layout.test.ts`); type-only imports don't count. Story folder names come from `core/paths.ts` only.
- Comments say why, in the density of the code around them.

## Agent and skill files (`.github/agents/`, `.github/skills/`)
- They name commands, never script files, and folders by phase (`4-evidence/`), never paths built from a profile.
- Every `heldout <command> --flag` they write must exist (`tests/agent-files.test.ts`).
- A held-out rule (who may see what; WHAT vs HOW) is a guardrail: its change needs two reviews.

## Testing
- New behaviour ships with tests; a bug fix with a regression test. Never declare done on a red suite.
- A round (`dev/round.ts`) proves agent-facing changes; unit tests alone don't.

## Review flags (for any reviewer)
An application named inside the skill, an agent app named alone where both apply, a machine path, a weakened
held-out rule, a command or flag an agent file names that doesn't exist, an `agentctl-allow-secret` marker without a
convincing reason.

## Never
- Commit with `--no-verify`, approve your own diff, or write an `Approved-by:` trailer.
- Weaken, skip or delete a test to go green.
- Change an answer key in `demo/answer-keys/` without an ADR and its new pin (`npx tsx dev/answer-keys.ts --pin`, in
  the same commit; guardrail tier: two reviews).
- Add a dependency the contract doesn't name.
