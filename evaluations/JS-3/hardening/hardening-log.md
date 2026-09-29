# Hardening log — JS-3

**Tiers used:** tier 3 — `heldout inspect` (product dialog with locator probes) and `heldout api-probe --chain` (sign-up, sign-in, a review written; the live reproduction with simultaneous likes). The Playwright MCP tools were not loaded in this session.

| Change | Why | Evidence |
| --- | --- | --- |
| Accounts recipe saved: GET /api/SecurityQuestions → POST /api/Users → POST /rest/user/login; UI sign-in on `#/login` | G3, G2: the story names no registration call | hardening/api-account.md; `accounts --check --create` all ✔ |
| Product dialog opened from the start page's product card; `getByRole('dialog')` | G1 | hardening/inspect-dialog.md (probes 1 ✔) |
| Submit located by its accessible name "Send the review" (its visible text is "Submit") | the draft's guessed name `Submit` matches nothing | inspect-dialog.md |
| Review entries: `.comment` filtered by message; the like count read from the entry's button | G1; the message itself holds digits | the same locators as the first run (reviews-qa, inspect-entry.md) |
| SCN-013 enters the 161 characters with `fill` | key-by-key typing drops characters while the dialog settles (seen in the first run) | references/test-authoring.md |
