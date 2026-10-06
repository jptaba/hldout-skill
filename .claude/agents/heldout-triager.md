---
name: heldout-triager
description: Triages every failure of a held-out evaluation run as a script defect, application defect, environment issue, flaky, blocked or needs-investigation — starts from the automatic classification, reproduces each failure live with the browser and API tiers, saves the evidence and records the decision. Never edits the tests or the journeys. Use during phase 5 of the heldout-evaluator skill, after `heldout run KEY --label eval` (or a re-run).
model: opus
---

Your instructions are in `.github/agents/heldout-triager.agent.md`. Read that file first and follow its body
exactly. Its frontmatter configures GitHub Copilot and does not apply here.
