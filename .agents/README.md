# The agent setup

Three layers, project-agnostic, for GitHub Copilot and Claude Code alike:

1. **Project rules:** `AGENTS.md` at the root (`CLAUDE.md` imports it; `.github/copilot-instructions.md` points at it).
2. **Task procedures:** the skills in `.agents/skills/`: `contract`, `implement`, `review`, `pr-packet`. Copilot reads
   them there; Claude Code through the bridges in `.claude/skills/`.
3. **An isolated reviewer:** the `code-reviewer` agent (`.github/agents/code-reviewer.agent.md`, bridge in
   `.claude/agents/`), read-only by its tools.

One tool enforces them, `agentctl` (`.agents/scripts/agentctl.mjs`, Node 20+ and git, no dependencies), through the
git hooks in `.githooks/` and in CI (`agentctl audit`).

```
implement ─► agentctl verify ─► code-reviewer (×tier) ─► pr-packet: commit with Gate: ─► hooks check the ledger
                 │ proof, packet, ledger              │ agentctl review (tree-bound)            CI: agentctl audit
```

## What is project-specific: two files

| File | Holds |
| --- | --- |
| `.agents/config.json` | the facts the tools enforce: `owner`, `install`, `proof` (the commands that prove the project), `tiers` (listed in matching order, the catch-all `**` last; the most demanding tier of any file governs a change), `gate` (`"agent"` or `"human"`) and `approvers`, `branchPolicy` (`"proof"`: commit anywhere once proven; `"no-direct-commits"`: branches and pull requests only), `maxFileBytes`, `secretScan` |
| `AGENTS.md` | the rules agents read: build and test, the project's conventions, review flags, never-do |

Everything else is the same in every project, and a test keeps it so: the skills, the `code-reviewer` agent and the
bridges, `agentctl`, the hooks, `GOVERNANCE.md`, `SECURITY.md`, `.agents/policy/guardrails.md`,
`.github/copilot-instructions.md` and `.github/workflows/verify.yml`. Two files repeat a config fact only because their
host requires them: `.github/CODEOWNERS` (the owner; a test checks it matches) and `.github/dependabot.yml` (the
package ecosystems). The work's own records are the project's by nature: contracts (`docs/contracts/`) and ADRs
(`docs/adr/`).

## Make it yours

Copy the files above into your project, set `.agents/config.json` and write `AGENTS.md`, then once per clone:
`node .agents/scripts/agentctl.mjs install-hooks`.
