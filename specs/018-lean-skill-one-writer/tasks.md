# Tasks: A lean skill for both apps, and an overview with one writer

**Input**: [spec.md](spec.md). Guardrail (`.github/agents/`, `.github/skills/`, `probe/app-knowledge.ts`, `probe/map.ts`,
`update.ts`, the agent files' and knowledge tests): two reviews.

- [x] T001 US3, US4.1: `addOverview` takes no story and restores a stale entry; a required rule needs a reviewed contract
- [x] T002 US5.1: `map KEY` prints the overview, the entries and the rules
- [x] T003 US1, US2: SKILL.md's description and size; `references/setup.md`, `phases.md`, `layout.md`
- [x] T004 US3.2, US4.2, US5.2: the hardener's, triager's and coordinator's files; `hardening.md`, `triage.md`
- [x] T005 FR-002, README and the settings' descriptions
- [x] T008 Left from the reviews: US1.3 names the permission levels in `setup.md`; US4.1 has a test for a contract
  changed after its review
- [ ] T006 SC-002: a fresh round of two stories
- [ ] T007 SC-003: one story in GitHub Copilot
