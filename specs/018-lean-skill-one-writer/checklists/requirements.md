# Specification Quality Checklist: A lean skill for both apps, and an overview with one writer

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-11-09
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- House style (as specs 007, 016 and 017): the spec names the project's own commands and files (`heldout map`,
  SKILL.md), since they are what the users of this skill see; code is left to the change.
- Who writes the overview was recommended to the owner on 2026-11-09 and not confirmed: the spec takes the
  recommendation (setup only; a story's agents mark stale), and says what it gives up in its assumptions and the
  design document.
- SC-002 and SC-003 are open by design: rounds are paused, and GitHub Copilot is not run here.
