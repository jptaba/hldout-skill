# Contract 0017 — Spec Kit removed

The owner's request (2026-11-10): remove Spec Kit and all its artifacts; it costs too many tokens for what it gives.

## Inputs
- Spec Kit as ADR 0004 vendored it: `.specify/` (templates, scripts, the constitution), the `speckit-*` skills in
  `.github/skills/` and `.claude/skills/`, the specs in `specs/`.
- What names it: AGENTS.md, `.agents/config.json`, `tests/agent-kit.test.ts`, comments and test names that cite a
  spec folder, `docs/next-steps.md`.

## Outputs
- None of those folders is in the repository. Git history keeps them.
- A change names its contract as before ADR 0004: one screen in `docs/contracts/NNNN-<name>.md` (the `contract`
  skill), or a section of a plan (`--contract "docs/next-steps.md#<row>"`). AGENTS.md says so, and that a finished
  contract is removed by the next change.
- ADR 0006 records the decision and what replaces the constitution (AGENTS.md, GOVERNANCE.md and SECURITY.md, which
  held its detail already); ADR 0004 is marked superseded.
- No comment or test name points at a spec folder; `docs/next-steps.md` says once where the specs it cites are.
- The gate is relaxed at the owner's request (2026-11-15), as too strict to push: no `approvers` and no
  `Approved-by:` rule, the owner a contact only; guardrail files need 1 review (was 2), other code none (was 1). Proof,
  the `Gate:` trailer and the contract stay for both, and so do the ban on approving your own change and the veto of
  a review that requests changes (in tiers that need reviews). `.agents/config.json`, AGENTS.md, GOVERNANCE.md and SECURITY.md
  say so (CLAUDE.md only imports AGENTS.md).

## Proof
- `tests/agent-kit.test.ts`: the agent setup's boundary test no longer expects Spec Kit; the strictest tier still
  holds the gate's files, what defines the proof and the held-out rules.
- The project's proof steps (`node .agents/scripts/agentctl.mjs verify --contract docs/contracts/0017-remove-spec-kit.md`):
  exit 0.

## Done when
- `git grep -i -E "speckit|\.specify"` finds only ADR 0004, ADR 0006 and this contract.
- Typecheck and the suite pass.

## Bad result looks like
- A rule of the constitution that no remaining file states.
- A gate weakened beyond the line above: proof, the `Gate:` trailer or the contract no longer required.
- A test deleted for anything but Spec Kit's own presence.
- A changed behaviour of the skill: this change touches comments and names only in `.github/scripts/`.
- Behaviour this contract does not name.
