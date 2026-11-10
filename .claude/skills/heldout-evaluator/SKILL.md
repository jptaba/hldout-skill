---
name: heldout-evaluator
description: Held-out acceptance evaluation of a Jira story against any web application or API (AUT-agnostic). Fetches the story from Jira Data Center (or the file-based mock) with the screenshots it shows and the Confluence pages it links, turns it into a reviewed requirement contract, writes independent Playwright TypeScript UI and API tests from the requirement only (each tied to its acceptance criteria, its source and a test type) on reusable journeys per application domain, hardens them against the live application (IDE browser tool, Playwright MCP, or the bundled inspector and API probe), runs them, triages every failure as a script defect or an application defect, and writes a verdict with a traceability matrix, reproduction steps and evidence, published back to the Jira story for a person to review. Use when the user asks to evaluate, verify or accept a Jira story or ticket, to create held-out or independent acceptance tests, or for a test verdict on a story.
---

This skill lives in `.github/skills/heldout-evaluator/`. Read `.github/skills/heldout-evaluator/SKILL.md` now and
follow it. Every relative path in it (`references/`) is relative to that folder; its scripts are in
`.github/scripts/`.
