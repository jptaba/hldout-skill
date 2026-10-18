# Copilot instructions

Follow `AGENTS.md` at the repository root: the project's build, test and rules, and what never to do. Procedures are
the skills in `.agents/skills/` (contract, implement, review, pr-packet); policy is `GOVERNANCE.md` and `SECURITY.md`.

## Code review expectations
- Judge the diff against its contract (the `Contract:` trailer, or the plan section or contract file the change names).
- Flag: changes beyond the contract, weakened or deleted tests, new dependencies, secrets, and any break of a rule in
  `AGENTS.md`.
- Every finding cites a file and a line.
