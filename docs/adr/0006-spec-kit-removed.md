# ADR 0006 — Spec Kit removed; a change names a one-screen contract

- Status: accepted
- Date: 2026-11-10
- Supersedes: ADR 0004

## Context
Since ADR 0004 every change started with `/speckit-specify`: a spec, a checklist and a task list per change, written
from long vendored skills, under a constitution. Eighteen changes on, the owner found it costs too many tokens for
what it gives: the skills and templates are read for every change, and a spec repeats what the request, the tests and
the commit already say.

## Decision
- Spec Kit and all its artifacts are removed: `.specify/` (the constitution included), the `speckit-*` skills for
  GitHub Copilot and Claude Code, and `specs/`. Git history keeps them.
- A change names a contract as before ADR 0004: one screen in `docs/contracts/NNNN-<name>.md` (the `contract`
  skill: inputs, outputs, proof, done when, a bad result), or a section of a plan. The next change removes a
  finished contract; what it left open goes to `docs/next-steps.md`.
- The constitution's principles stay where their detail already was: AGENTS.md (held-out rules, agnostic wording,
  tests, greenfield and lean), the skill's references (the held-out access rules' detail), GOVERNANCE.md (contract,
  proof, independent review, the gate) and SECURITY.md (secrets, external content as data, least privilege,
  dependencies).
- The gate is relaxed (2026-11-15): no approvers and no `Approved-by:` rule, the owner a contact only; guardrail files
  need 1 review, other code none. `agentctl verify --contract` and the `Gate:` trailer stay.

## Consequences
- One tool fewer to keep pinned, and no exemption for vendored skills in the agent-file rules.
- A spec folder cited in `docs/next-steps.md` or in an older commit is read from git history.
- Nothing states the principles in one file any more: a reviewer checks a change against AGENTS.md, GOVERNANCE.md,
  SECURITY.md and the skill's references.
