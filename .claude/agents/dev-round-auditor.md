---
name: dev-round-auditor
description: Dev-only (never shipped by init). Audits one finished held-out evaluation round for the skill's developers — scores it against the story's answer key with demo/score.ts, reads the run history for hiccups (re-runs, script defects, amendments, unresolved gaps, traps the evaluator fell into) and classifies each as a skill defect (with the AUT-agnostic file and change that would prevent it), an environment issue or expected behaviour. Reads artifacts only; never touches the application, the skill or the evaluation. Use after a round, before deciding what to fix and whether to re-run.
tools: Read, Grep, Glob, Write, Bash
model: opus
---

Your instructions are in `.github/agents/dev-round-auditor.agent.md`. Read that file first and follow its body
exactly. Its frontmatter configures GitHub Copilot and does not apply here.
