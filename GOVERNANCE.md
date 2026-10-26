# Governance

How changes stay safe without slowing down. Every control is local, fast and versioned: no service, no dashboard, no
waiting. This file is the same in every project that uses the agent setup; the project's facts are in
`.agents/config.json` (owner, proof, tiers, gate) and its rules in `AGENTS.md`. What is enforced where, and what it
costs: `.agents/policy/guardrails.md`.

## Roles
- **Owner:** the one person named by `owner` in `.agents/config.json` (mirrored in `.github/CODEOWNERS`).
- **Implementer:** an agent or a person working under a contract. Never approves its own change.
- **Reviewer:** the `code-reviewer` agent, in a fresh context, with no tool that writes files. Its only write is its
  verdict, recorded by `agentctl review` for the exact staged tree.
- **Gatekeeper:** set by `gate` in `.agents/config.json`.
  - `"agent"`: the maintainer agent, on the owner's behalf. It restates each change in its own words and names what
    was not checked (the `Gate:` trailer); the hook accepts that only with the independent reviews the change's tier
    needs on record, so no change passes on its author's word alone.
  - `"human"`: a person named in `approvers` reads the packet and approves (`Approved-by:`). Agents never write that
    trailer.
- **What is checked, and what is declared.** Locally, proof, contracts and reviews are recorded by the exact tree's
  hash, and the hooks check them. In CI, each pushed commit's trailers are checked for consistency with its own tree
  and contract, and the proof runs again on the final tree; trailers written by hand and consistent with the commit
  would pass. Who reviewed, on which model, and who approved are declared and recorded; nothing authenticates them.
  Separation therefore rests on reviews running in their own context and on the trail being audited, not on
  cryptography.

## Change control
- A change implements a **contract**: a spec (a project on Spec Kit: `specs/<feature>/spec.md`), a plan section, a
  finding, or a file in `docs/contracts/` (the `contract` skill). Its SHA-256 is bound into the evidence; a packet against another version of the contract is stale.
- **Tiers** (`tiers` in `.agents/config.json`) decide what a change needs, by the files it touches: whether it needs
  proof, how many independent reviews and from how many models, whether it passes the gate, whether it names a
  contract. The strictest tier any file falls in applies.
- **Proof** is `agentctl verify`: the project's `proof` steps on the staged tree, recorded with the tree's hash.

## Audit trail (per change)
1. The contract and its hash: what was asked, pinned.
2. The commit's trailers: `Tier`, `Contract` (the section's hash), `Proof` (steps and tree), one `Review` per review
   (reviewer, model, verdict, findings, tree), `Gate` or `Approved-by`. CI re-checks every pushed commit against its
   own tree and contract, and scans what the push changed (`agentctl ci --audit`).
3. `.agents/runs/ledger.jsonl` (local, not committed): every proof and review with its tree hash; the last packet.
4. Version control history: the change itself.

## Changes nobody gated
- **Automated dependency updates** (Dependabot and the like) open pull requests whose commits carry no trailers, so
  their CI audit fails, as it should. The maintainer applies the update through the gate (the same change, staged,
  verified, reviewed, committed with its trailers) and closes the automated pull request.
- **Merges:** a merge whose sides touched different files is not gated; the commits it brings are. A merge with files
  of its own (a conflict resolution, an edit made in the merge, or a file both sides changed that git combined) is new
  content and passes the gate at those files' tier: proof, reviews, the gatekeeper's restatement. A host's squash or
  rebase merge makes a tree nobody proved: merge with a merge commit, or commit the change through the gate.

## Decisions
Significant choices are short ADRs in `docs/adr/` (see ADR 0001): a new guardrail or a change of tier, a new
dependency, a change of who decides what.

## Incidents and rollback
- Revert the commit: its trailers say what was proven and who reviewed it.
- Record what happened as an ADR, and add the guardrail once, in code, rather than remembering it.

## What stays with a person
Whatever the gate setting: rotating a leaked credential; the repository host's own settings (branch protection,
secret scanning, push protection); granting an app or a token scope. An agent prepares each and stops.

## Standards mapping
- **NIST AI RMF:** Govern → this file, the owner, ADRs; Map → contracts and tiers; Measure → proof, reviews, the
  audit; Manage → rollback, incidents.
- **OWASP Top 10 for LLM and Agentic applications:** LLM01 prompt injection → external content is data, and every
  review claim cites a file, a line or an output; LLM02 sensitive information → the secret scan; LLM03 supply chain →
  pinned dependencies, skills reviewed like packages; LLM06 excessive agency → a read-only reviewer, no
  self-approval, tiered gates.
