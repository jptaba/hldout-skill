# AGENTS.md

The rules of this project for any agent: the held-out evaluator skill. Every agent app loads this file each session,
so it stays short. Security rules are in `SECURITY.md`.

## Build and test
- Install: `npm ci` (Node 20.11+). Typecheck: `npm run typecheck`. Tests: `npm run test:skill`.

## How a change is made
- Make the change, run typecheck and the tests, then commit (the `pr-packet` skill) and push: small, focused commits
  on `master`. Nothing else stands between a green tree and a push: no hooks, no reviews, no trailers.
- What is still open is in `docs/next-steps.md`; git history has what is finished.

## Models
- Every agent runs on Opus (Copilot lists start with Claude Opus; Claude Code bridges say `opus`). Sonnet is only a
  fallback, for when Opus is unavailable; an agent that only did basic work (just running a command) could run on it,
  and none of the current agents does. Independence between agents comes from separate contexts, not separate models.

## Rules of this project
- **Greenfield:** no backward-compatibility shims, deprecated aliases or migration code.
- **Lean:** plans, prompts and instruction files carry only what the change needs; one fact lives in one place and is
  referenced, not copied.
- **AUT-agnostic:** the skill never names an application, its routes, fields or values. Demo applications appear only
  under `demo/` and in docs about rounds.
- **Agent-agnostic:** "Opus" for the model; GitHub Copilot and Claude Code named together where the app matters.
- **No machine paths** (`D:/…`, `C:/Users/…`) in any repository file.
- **File tools only:** change files with Edit/Write, never with `sed`, heredocs or scripts that patch files.
- **What ships** to adopters (`init`/`update`): `.github/skills/heldout-evaluator/`, `.github/scripts/` and the files
  `SHIPPED` in `setup/update.ts` lists. Everything else here is maintainer-only (`tests/repo-boundary.test.ts`): the
  developer tools in `dev/`, the demo stories and answer keys in `demo/`.
- **Secrets:** probes and tests reference secrets as `${env:NAME}` or `${vault:path#field}`, never their values; the
  evaluator redacts and scrubs what it writes.

## Code (`.github/scripts/`, `tests/`)
- Builtins with the `node:` prefix; no new runtime dependency without a reason given in the commit.
- A command module exports `spec` and `run`, reads only the flags its spec declares and documents them in its leading
  comment (`tests/dispatcher.test.ts`).
- Scripts are grouped by phase, and imports follow the phases' order: core ← fetch ← contract ← authoring ← probe
  (shared by hardening and triage) ← hardening ← run ← triage ← verdict ← flow, setup (`tests/layout.test.ts`); a
  phase never imports a later one; type-only imports don't count. Story folder names come from `core/paths.ts` only.
- Comments say why, in the density of the code around them.

## Agent and skill files (`.github/agents/`, `.github/skills/`)
- They name commands, never script files, and folders by phase (`4-hardening/`), never paths built from a profile.
- Every `heldout <command> --flag` they write must exist (`tests/agent-files.test.ts`).
- The held-out rules (who may see what: the test author never sees the application, the evaluator never reads an
  answer key; WHAT vs HOW) are not weakened. Their detail is in the skill's references; answer keys are
  maintainer-only (`demo/`).

## Testing
- New behaviour ships with tests; a bug fix with a regression test that fails without the fix.
  Never declare done on a red suite.
- A round (`dev/round.ts`) proves agent-facing changes; unit tests alone don't.

## Never
- Weaken, skip or delete a test to go green.
- Change an answer key in `demo/answer-keys/` without its new pin (`npx tsx dev/answer-keys.ts --pin`, in the same
  commit).
