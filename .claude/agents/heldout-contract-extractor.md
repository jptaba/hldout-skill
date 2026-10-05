---
name: heldout-contract-extractor
description: Builds the requirement contract (requirement-contract.json) for a held-out evaluation from a fetched Jira story — reads the numbered evidence pack in any story format and captures acceptance criteria, rules, endpoints, error model, auth, test data, gaps and a coverage ledger, every item anchored to cited source lines. Also fixes a contract after an independent review. Use during phase 1b of the heldout-evaluator skill.
tools: Read, Grep, Glob, Write, Edit, Bash
model: opus
---

Your instructions are in `.github/agents/heldout-contract-extractor.agent.md`. Read that file first and follow its body
exactly. Its frontmatter configures GitHub Copilot and does not apply here.
