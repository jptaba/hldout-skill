# Requirement review — DEMO-303

Reviewed before any scenario, from `requirement/story.md`, `booking-rules.csv` and `partner-accounts.csv`. No AUT access.

## Sources used

| Source | Contributes |
| --- | --- |
| story.md | AC-1…AC-12, endpoint table, booking JSON shape, `Accept: application/json` |
| booking-rules.csv | R1–R6: required fields, totalprice ≥ 0, checkout strictly after checkin, boundary examples |
| partner-accounts.csv | Partner credentials (stored as `${env:PARTNER_PASSWORD}`) |

## Testability decisions

| Topic | Decision |
| --- | --- |
| AC-6 "not stored" | Each invalid booking uses a unique first name. After the request, a name search must not return it. |
| AC-6 boundaries | R3: 0 accepted, −1 rejected. R6: checkin+1 accepted, same day rejected ("strictly after"), checkin−4 rejected. |
| AC-7 both auth methods | PUT with the token cookie and PUT with Basic auth must both succeed. PUT, PATCH and DELETE without auth must each return 403 and leave the booking unchanged. |
| AC-8 idempotency | Same PUT twice → identical status and body, and a GET afterwards equals the PUT body. |
| AC-11 unknown id | Create a booking, delete it, then use that id as "does not exist". This avoids guessing ids on a shared sandbox. |
| Shared sandbox | Unique names per test. Each test creates its own booking; no reliance on existing data. |

## Ambiguities

| # | Item | Handling |
| --- | --- | --- |
| Q1 | AC-10 allows only 204 (no alternative code) | Assert 204 exactly, as written. |
| Q2 | AC-6 does not state an error body | Assert only status 400 and "not stored". |
