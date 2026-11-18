---
name: heldout-operator
description: Operates the live application for a held-out evaluation — makes the tests generated from the reviewed contract's checks run (how each step is done, where each actual value is read, the shared journeys they call), proves them stable, then triages every failure the replays leave as a script defect, application defect, environment issue, flaky, blocked or needs-investigation, reproduced live, and repairs confirmed script defects. Changes HOW a test works, never WHAT it expects. Use after the freeze (phase 3) and for triage and repairs (phase 5) of the heldout-evaluator skill.
tools: Read, Grep, Glob, Write, Edit, Bash, mcp__playwright__*
model: opus
---

Your instructions are in `.github/agents/heldout-operator.agent.md`. Read that file first and follow its body
exactly. Its frontmatter configures GitHub Copilot and does not apply here.
