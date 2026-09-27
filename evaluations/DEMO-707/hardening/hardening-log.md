# Hardening log — DEMO-707

**Tiers used:** tier 3 (`inspect.ts` for the contract's mechanics gaps G2/G3; `run.ts --label harden-ui --capture` for the UI scenarios). No tier 1 or tier 2 tools were loaded in this session.

## Scope

- **API scenarios** (SCN-001…020) weren't dry-run before the evaluation run. Their mechanics (paths, the `{"<resource>": …}` envelope, the `Authorization: Token` header) come from the requirement contract, which quotes `api-contract.md`. The first full run is therefore also the first check of the API plumbing. Any plumbing mistake shows up in triage and is confirmed live (see run 02).
- **UI scenarios** (SCN-021…023) were hardened against the live web app.

## Changes (HOW only)

| Scenario | Change | Evidence |
| --- | --- | --- |
| SCN-021/022 | Sign-in route `/login`, placeholders `Email`/`Password`, button `Sign in` (contract gap G2) | hardening/inspect-login.md |
| SCN-022 | Editor opened from the "New Article" link, fields by placeholder, `Publish Article` (G3) | hardening/inspect-editor.md |
| SCN-022 | Confirmed the app navigates to `/article/<slug>` after publishing; `TODO(harden)` removed | runs/04-harden-ui/snapshots/SCN-022 |
| SCN-022 | Title locator narrowed to the level-1 heading. The expected title (`input.title`) is unchanged | same |

## Observed deviations

None were observed in the UI scenarios.

## Seed hygiene

In the harden runs, the article published through the UI was deleted by its owner at teardown (`[cleanup] DELETE … → 204`). Registered `qa…` users stay behind, because accounts can't be deleted through the API.

## Evidence hygiene: a password leak in snapshots (evaluator defect, fixed)

The first UI hardening run (`01-harden-ui`) captured ARIA snapshots in which the **password textbox showed its value**, so the throwaway test password was in plain text in the run's snapshot files and report attachments. That run was deleted. Snapshot redaction now runs in the fixture (`redactSnapshot`), in `inspect.ts` and in `mcp-probe.ts`. `04-harden-ui` repeats the same scenarios, and its snapshots show `textbox "Password": ***redacted***`. Nothing from run 01 was published.
