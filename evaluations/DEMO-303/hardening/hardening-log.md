# Hardening log — DEMO-303

**Tiers used:** Tier 3 (`run.ts --label harden` dry-run with API exchange capture; `api-probe.ts` for live re-checks). API-only story, so no browser tier was needed. Tier 1 and tier 2 were not loaded in this session.
**AUT profile:** `restful-booker` — https://restful-booker.herokuapp.com · **Date:** 2026-09-26 · **Draft frozen:** `draft/demo-303.spec.ts`

## API mechanics

| Item | Verified | Evidence |
| --- | --- | --- |
| All 7 declared endpoints respond at the declared paths | ✔ | `runs/01-harden` exchanges |
| Token cookie auth (`Cookie: token=…` from `POST /auth`) | ✔ PUT → 200 (SCN-010.1 passed) | `runs/01-harden` |
| Basic auth (`Authorization: Basic …`) | ✔ PUT/PATCH → 200 (SCN-010.2, SCN-012 passed) | `runs/01-harden` |
| `Accept: application/json` sent by the api fixture | ✔ JSON bodies returned | `runs/01-harden` |
| Name search with query params | ✔ SCN-006 passed | `runs/01-harden` |

No mechanics needed changing: 15/27 passed on the first dry-run, and all 12 failures are requirement deviations.

## Observed deviations (assertions intentionally left unchanged)

| Scenario | Requirement says | AUT shows |
| --- | --- | --- |
| SCN-002 (AC-2) | invalid credentials → 401 | 200 `{"reason":"Bad credentials"}` |
| SCN-007.1–.4 (AC-6) | missing required field → 400 | 500 Internal Server Error |
| SCN-008.2 (AC-6) | totalprice −1 → 400 | 200, booking stored |
| SCN-008.4 / .5 (AC-6) | checkout must be strictly after checkin → 400 | 200, booking stored |
| SCN-013 (AC-10) | DELETE → 204 | 201 Created |
| SCN-014.1–.3 (AC-11) | PUT/PATCH/DELETE of unknown id → 404 | 405 Method Not Allowed |
