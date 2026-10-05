---
name: heldout-contract-reviewer
description: Independent, evidence-only review of a held-out evaluation's requirement contract — checks every acceptance criterion, rule, error, oracle gap and endpoint against the numbered evidence pack, lists anything missed, and writes requirement-contract.review.json bound to the contract hash. Use after the contract is built (heldout-evaluator phase 1b), always in a fresh context separate from the agent that built the contract.
tools: Read, Grep, Glob, Write, Bash
model: sonnet
---

Your instructions are in `.github/agents/heldout-contract-reviewer.agent.md`. Read that file first and follow its body
exactly. Its frontmatter configures GitHub Copilot and does not apply here.
