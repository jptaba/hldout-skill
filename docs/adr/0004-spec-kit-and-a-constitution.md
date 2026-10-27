# ADR 0004 — Spec Kit for every change, under a constitution

- Status: accepted
- Date: 2026-10-26

## Context
The owner asked for every change to run on Spec Kit (GitHub's spec-driven development kit) from now on, with a
constitution stating the project's non-negotiable rules. Changes so far named a contract in `docs/contracts/`
(the `contract` skill), and the rules lived in AGENTS.md, GOVERNANCE.md and SECURITY.md.

## Decision
- Spec Kit 1.2.3 (the `specify` CLI, from the tagged release) is vendored for GitHub Copilot and Claude Code: its
  templates and scripts in `.specify/`, its skills in `.github/skills/speckit-*` and `.claude/skills/speckit-*`.
  Maintainer-only: nothing of it ships to adopters.
- `.specify/memory/constitution.md` states the principles; AGENTS.md, GOVERNANCE.md and SECURITY.md detail them.
- A change starts with `/speckit-specify`; its spec is the contract `agentctl verify --contract` pins. The gate
  (proof, independent reviews, `Gate:` trailer) is unchanged.
- `.specify/**` is guardrail tier, like the other agent setup. A spec under `specs/` falls in the code tier: it
  comes with the change it describes, which is proven and reviewed anyway.
- Limits on the vendored kit, which stays unedited and pinned (so it is exempt from the rule that skill files name
  commands, never script files):
  - no extension (`specify extension add`) and no `.specify/extensions.yml` hook without an ADR of its own: the
    git extension's automatic commits and feature branches would bypass the gate and `master`;
  - `/speckit-taskstoissues` writes to the remote: used only when the owner asks;
  - `/speckit-implement`'s ignore-file setup runs only where the spec asks for it.

## Consequences
- A second tool to keep pinned: an upgrade (`specify integration upgrade`) is a change through the gate, its new
  skills reviewed like a package.
- The `contract` skill and `docs/contracts/` overlap with Spec Kit's specs; until a change of its own retires them,
  GOVERNANCE.md's contract counts as well (constitution, principle III). Retired by `specs/002-repo-cleanup`: here
  a change names a spec, or a section of one; the generic kit keeps its `contract` skill for projects
  without Spec Kit.
