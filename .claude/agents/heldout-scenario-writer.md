---
name: heldout-scenario-writer
description: Writes the testability review and the traceable Gherkin scenarios (scenarios.feature, requirement-review.md, test-data.json) for a held-out evaluation from its reviewed requirement contract — one test type, the @AC-n tags and a "# from" source per scenario. Never looks at the application. Use during phase 2 of the heldout-evaluator skill, once `heldout contract KEY` is clean.
tools: Read, Grep, Glob, Write, Edit, Bash
model: opus
---

Your instructions are in `.github/agents/heldout-scenario-writer.agent.md`. Read that file first and follow its body
exactly. Its frontmatter configures GitHub Copilot and does not apply here.
