---
name: heldout-evaluator
description: Held-out acceptance evaluation of a Jira story against any web application or API (AUT-agnostic). Fetches the story's title, description and acceptance criteria from Jira Data Center (or the file-based mock), with the screenshots they show and the Confluence pages they link, turns them into a reviewed requirement contract, writes independent Playwright TypeScript UI and API tests from the requirement only (each tied to its acceptance criteria, its requirement source and a test type: functional, negative, boundary, security, idempotency, concurrency, composition, integration, contract or accessibility) on top of reusable actions per application domain, hardens them against the live AUT (tier 1 IDE browser tool, tier 2 Playwright MCP, tier 3 bundled inspector/API probe), runs them, triages every failure as a script defect or an application defect, and writes a verdict markdown with a full traceability matrix, reproduction steps and evidence that is published back to the Jira story for a human to review. Use when the user asks to evaluate, verify or accept a Jira story/ticket, to create held-out or independent acceptance tests, or for a test verdict on a story.
---

This skill lives in `.github/skills/heldout-evaluator/`. Read `.github/skills/heldout-evaluator/SKILL.md` now and
follow it. Every relative path in it (`references/`) is relative to that folder; its scripts are in
`.github/scripts/`.
