# ADR 0002 — The agent setup, with the maintainer agent as gatekeeper

- Status: accepted
- Date: 2026-10-18

## Context
Changes to the skill were proven by `typecheck` and `test:skill` and then committed on their author's say-so. Nothing
bound the proof to the commit, nobody independent reviewed a change, and guardrail code (redaction, integrity, the
held-out rules) had no stronger control than a typo fix. The owner asked for governance that costs no speed, built
from sample-agent-setup, with the steps that setup gives a person done by the maintainer agent in this repository,
and usable by anyone who clones it with minimal or no changes.

## Decision
- Adopt the three layers: `AGENTS.md`; the skills `contract`, `implement`, `review`, `pr-packet` in `.agents/skills/`;
  the read-only `code-reviewer` agent.
- One project-agnostic tool, `agentctl` (Node, no dependencies), records proof and reviews by the staged tree's hash
  and enforces them in git hooks; CI re-audits every pushed commit's trailers.
- Tiers by path: docs need nothing; code needs proof, one review and the gate; guardrails need proof, two reviews on
  two models and the gate.
- The gate is the maintainer agent (`"gate": "agent"`): a restatement in its own words, accepted only with the
  independent reviews on record. `"gate": "human"` switches to an `Approved-by:` naming one of the `approvers`.
- The sample's "no commits to main" is replaced by the proof gate (`"branchPolicy": "proof"`), keeping small commits
  pushed to `master` once green. `"no-direct-commits"` restores the sample's rule.
- Maintainer-only: none of it is shipped by `init`/`update` (`tests/agent-kit.test.ts`).

## Departures from the first draft (docs/governance-plan.md §4, as first written)
- Not `dev-*` skills, a `dev-code-reviewer`, `dev/evidence.ts`, `dev/policy.json` or `npm run verify`: the kit keeps
  the sample's names and layout (`.agents/`, `code-reviewer`, `agentctl verify`), so it is the same kit in any
  project. Project specifics are in two files only: `AGENTS.md` and `.agents/config.json`.
- An `Approved-by:` written by an agent can't be told apart from a person's: the human gate requires it to name one of
  the config's `approvers`, and agents are told never to write it.
- Deferred: moving developer code from `demo/` to `dev/`, pinning answer-key hashes in the scorecard, and ADRs for
  earlier decisions (written when those decisions are next touched).
- Added after the first review: a dissenting review vetoes; CI checks trailers against each commit's own tree and
  contract and scans what a push changed; the contract hash covers only the named section.

## Consequences
- Every commit says what was proven, on which tree, against which contract, and who reviewed it.
- A code change costs one reviewer run (a minute or two, overlapping the next change); hooks stay under a second.
- The owner audits at any time from the trailers; the irreducible human steps are listed in `GOVERNANCE.md`.
