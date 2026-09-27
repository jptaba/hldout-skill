# Requirement changes

## Revision detected 2026-09-26T15:23:31.164Z

Previous revision archived at `requirement/history/2026-09-26T15-23-31-148Z/`.

**Attachments:** changed api-contract.md

**Added lines:**

+ ### Reliability (added in revision 2)
+ - **AC-16**: Retries are safe. (a) Repeating `POST /api/message` with the same `Idempotency-Key` request header, for example after a network retry or a double-click, stores the enquiry **only once**: every repeat answers 2xx and no duplicate appears in the staff list. (b) `GET` endpoints are idempotent: repeating `GET /api/room/{id}` returns an identical body.
+ ## Revision history
+ - **Rev 2 (2026-09-26)**: added AC-16 (safe retries / idempotency) after a support ticket about duplicate enquiries caused by double-clicks. `api-contract.md` v1.5 documents the `Idempotency-Key` header.
+ | api-contract.md | text/markdown | 2732 | text — read directly | attachments/api-contract.md |

**Removed lines:**

- | api-contract.md | text/markdown | 2351 | text — read directly | attachments/api-contract.md |

**Action:** update requirement-review.md and scenarios.feature. New/changed tests need a re-freeze (`integrity.ts KEY --snapshot --reason …`) before hardening.
