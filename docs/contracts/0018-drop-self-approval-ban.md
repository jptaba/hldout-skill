# Contract 0018 — The self-approval ban dropped

The owner's request (2026-11-15): drop the ban on approving your own change; the gate is too strict to push through.

## Inputs
- The ban's wording in AGENTS.md ("Never"), GOVERNANCE.md (Implementer, OWASP LLM06), `.agents/policy/guardrails.md`
  and the `implement` skill (its Never line and description, in `.agents/skills/` and its `.claude/skills/` bridge).

## Outputs
- No file states the ban any more. Contract 0017 is removed with this change; ADR 0006 notes the ban as dropped.

## Proof
- The project's proof steps (`node .agents/scripts/agentctl.mjs verify --contract docs/contracts/0018-drop-self-approval-ban.md`):
  exit 0.

## Done when
- `git grep -i -E "own diff|own change|self-approv|approved yourself"` finds nothing outside ADRs.

## Bad result looks like
- Anything else relaxed: proof, the `Gate:` trailer, the contract and the veto of a dissenting review stay.
- Behaviour this contract does not name.
