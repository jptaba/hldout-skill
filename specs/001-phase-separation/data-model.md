# Data model: a story's record

`output/<profile>/<KEY>/` (kept) and `.heldout/<profile>/<KEY>/<phase>/` (scratch, same phase names).

| Folder | Kept files | Producer |
| --- | --- | --- |
| `1-requirement/` | `story.md`, `linked/`, `transcripts/`, `revisions/`, `CHANGES.md` | fetch |
| `2-contract/` | `contract.json`, `review.json` | extractor, reviewer |
| `3-tests/` | `<key>.spec.ts` (the frozen draft), `test-data.json`, `freeze.json` (hashes, amendments) | test author; snapshot |
| `4-hardening/` | `<key>.spec.ts` (hardened), `hardening.md`, `probes.jsonl` (cited only), `P<n>.md` cited | hardener |
| `5-run/` | `<NN>-eval.json` (the final evaluation run) | run |
| `6-triage/` | `decisions.json`, `probes.jsonl` (cited only), `P<n>.md` cited | triager |
| `7-verdict/` | `verdict.md`, `verdict.json`, the screenshot of each failure it reports | verdict |

A probe belongs to the phase it is made in: hardening before the evaluation run, and again for a repair (every
failure decided, some script defects) or after a re-freeze; triage otherwise. The hardener's mechanics answers are
recorded in the contract (`contract --resolve`): the one exception to "a phase writes only its folder", since the
contract is the record later phases read for what was discovered.
| (root) | `history.jsonl` | every step |

Probe ids stay unique per story (P1, P2 … across phases), so a citation names one report.

## decisions.json

`{ [run]: { [scenario]: { category, rationale, title?, severity?, evidence?, action?, anyReading?, confirmedAt } } }`

## freeze.json

`{ frozenAt, specs: { [file]: sha256 }, assertions: { [file]: { req: { [assertion]: sha256 }, constants: sha256 } },
journeys: { [id]: sha256 }, contractOracle, amendments: [...], refreezes: [{ at, reason, previous, absorbed }] }`

A re-freeze is audited against the previous freeze's assertion hashes, and writes the hardened copy over with the
revised draft: hardening starts again from it.

## Run record entry

`{ scenario, title, status, criteria, testType, layer, failure?: { step, assertion, error, auto, evidence: {
screenshot?, trace?, api?, snapshot? } } }`

## State transitions

Each phase's scratch folder is cleared when its handoff is written (`advance` moves on), and the whole scratch area
when the verdict is written, unless `keepScratch`.
