# Research: Phase separation

Measured on round 38's PB-2 (158 tests): kept record about 2.1 MB: `5-runs/` 868 KB (7 runs; the evaluation run's
evidence 403 KB, of which API sequences and pre-sequences 195 KB), `4-evidence/` 992 KB (screenshots, 30 probe
reports, a 66 KB probe index), `3-tests/` 233 KB (spec 104 KB, freeze record 119 KB holding the draft), verdict 300 KB.

## D1 — Seven phases, one producer each
- Decision: 1-requirement, 2-contract, 3-tests, 4-hardening, 5-run, 6-triage, 7-verdict (spec table).
- Rationale: today `3-tests/` holds the author's draft and the hardener's log, `4-evidence/` mixes hardener and
  triager probes, `5-runs/` mixes hardening runs and evaluation runs with the triager's decisions written into them.
- Alternatives: keep six folders with subfolders per producer (still one folder per two producers).

## D2 — The hardener works on a copy
- Decision: `integrity --snapshot` freezes `3-tests/` and copies the draft to `4-hardening/`; the hardener edits
  only that copy; runs use it; integrity compares the two. The freeze record keeps hashes and amendments only.
- Rationale: the draft is the freeze; storing it twice (spec plus freeze record) is what made 3-tests 233 KB.
- Alternatives: edit in place and keep the draft inside the freeze record (today).

## D3 — The review stays a separate file
- Decision: `2-contract/review.json` stays (bound to the contract hash, read by scripts only); agents read
  `contract.json` alone. The spec's "review inside it" is met in substance: no agent reads the review.
- Rationale: folding it in would change what the hash covers for no reader's gain.

## D4 — Triage decisions in their own file
- Decision: `6-triage/decisions.json` (scenario → category, rationale, title, severity, readings, evidence cited);
  the run record is never rewritten by triage.
- Rationale: one producer per file; the verdict joins run and decisions.

## D5 — What the run record keeps
- Decision: per test: id, title, status, criteria, type, layer. Per failure: failing step, assertion, error head,
  the automatic class, and the evidence locations (screenshot, trace, the API call that failed, a bounded snapshot
  excerpt). Pre-sequences and full API sequences stay in the scratch raw output, read through `heldout show`.
- Rationale: the triager reads the failure and replays it live; the verdict cites locations.

## D6 — What a phase keeps of its probes
- Decision: `4-hardening/` and `6-triage/` each keep the probe reports their log or decisions cite, and an index of
  those only; uncited reports and screenshots stay in scratch and go at handoff.
- Rationale: 30 kept reports in PB-2; the verdict cited 9.

## D7 — Runs kept
- Decision: only the final evaluation run in `5-run/`; hardening runs stay in scratch, their stability result goes
  in the hardening log; an evaluation run replaced by a re-run after repair is dropped.

## D8 — Scripts by phase
- Decision: the structure in plan.md; `probe/` stays shared (hardening and triage both use it).
- Rationale: moves only; the import-order test enforces the phases' order.

## D9 — Order of the increments
- Decision: layout, then lean, then scripts; each through the gate on its own, guardrail tier (agent files).
