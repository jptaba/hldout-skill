# Tasks: Repository cleanup

**Input**: [spec.md](spec.md). One gated commit (guardrail tier: AGENTS.md, the constitution).

- [x] T001 Remove `docs/refactor-plan.md`, `docs/governance-plan.md`, `docs/contracts/` and the tracked `mock-jira/`;
  ignore `mock-jira/` and `output/`
- [x] T002 `docs/next-steps.md`: the open items only
- [x] T003 AGENTS.md and the constitution (principle III, version 1.0.1): a spec, or a section of one, is the
  contract; ADR 0004's consequence marked retired
- [x] T004 Test headers in `tests/` without the removed plans
- [x] T005 Proof: `agentctl verify --contract specs/002-repo-cleanup/spec.md`, two reviews, gate commit
