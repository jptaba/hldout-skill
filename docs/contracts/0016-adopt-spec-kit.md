# Contract 0016 — Adopt Spec Kit and ratify the constitution

The last change named here: from now on a change's contract is its Spec Kit spec (ADR 0004).

## Inputs
- The owner: install Spec Kit, run every change on it, and write a constitution from the project's standards and
  non-negotiable rules.

## Outputs
- Spec Kit 1.2.3 initialised for GitHub Copilot (default) and Claude Code, `sh` scripts: `.specify/`,
  `.github/skills/speckit-*`, `.claude/skills/speckit-*`, as the CLI wrote them (vendored, unedited).
- `.specify/memory/constitution.md` 1.0.0: six principles drawn from AGENTS.md, GOVERNANCE.md, SECURITY.md,
  `.agents/config.json` and the ADRs, nothing new beyond Spec Kit itself and lean context.
- `.specify/**` in the guardrail tier; ADR 0004 (with the vendored kit's limits and its exemption from the
  script-file rule); AGENTS.md and GOVERNANCE.md name the constitution and the spec as a contract.
- The constitution states each principle once and names the file holding its detail, so nothing is copied.

## Proof
- `tests/agent-kit.test.ts`: the constitution and a Spec Kit skill are guardrail tier; nothing of Spec Kit ships.
- The project's proof steps (`agentctl verify --contract docs/contracts/0016-adopt-spec-kit.md`).

## Done when
- `/speckit-specify` is available in both apps and the constitution states the rules the project already enforces.

## Bad result looks like
- A rule the project enforces missing from or weakened in the constitution; Spec Kit files shipped to adopters or
  edited by hand; a machine path in a vendored file.
