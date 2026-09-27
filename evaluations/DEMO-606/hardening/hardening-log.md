# Hardening log — DEMO-606

**Tiers used:** Tier 3 (`inspect.ts` probes, `run.ts --capture` dry-run, `--repeat-each` stability run). Tier 1/2 browser tools were not loaded in this session.
**AUT profile:** `the-internet` · **Date:** 2026-09-26 · **Draft frozen:** `draft/demo-606.spec.ts`

| Run | Result | Notes |
| --- | --- | --- |
| `01-harden` | 0/2 | Notification locator guessed as `getByRole('alert')`: timeouts → NEEDS_INVESTIGATION (correct) |
| `02-harden-check` | 1/2 | SCN-001 fails on off-copy text, SCN-002 passes |
| `03-harden-stability` (3 repeats) | SCN-001 failed 3/3, SCN-002 passed 3/3 | Sampling 12 clicks makes the intermittent outcome deterministic |

## UI locators

| Element | Draft locator | Hardened locator | Verified | Evidence |
| --- | --- | --- | --- | --- |
| Notification | `getByRole('alert')` ✖ 0 | `locator('#flash')` | 1 ✔ | inspect-01 |
| "Click here" | `getByRole('link', { name: 'Click here' })` | unchanged | 1 ✔ | inspect-01 |

## Mechanics

- The page is reloaded on every click, so each sample waits for DOMContentLoaded before reading the notification.
- The close icon "×" is stripped before comparison (ux-copy.md: it is not part of the copy).

## Observed deviations (assertion left unchanged)

| Scenario | Requirement says | AUT shows |
| --- | --- | --- |
| SCN-001 (AC-1) | Failure copy "Action unsuccessful, please try again" | "Action unsuc**c**esful, please try again" (missing "c") in about half the clicks |
