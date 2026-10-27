# Data model: a story's record

`output/<profile>/<KEY>/` (kept) and `.heldout/<profile>/<KEY>/<phase>/` (scratch, same phase names).

| Folder | Kept files | Producer |
| --- | --- | --- |
| `1-requirement/` | `story.md`, `linked/`, `transcripts/`, `revisions/`, `CHANGES.md` | fetch |
| `2-contract/` | `contract.json`, `review.json` | extractor, reviewer |
| `3-tests/` | `<key>.spec.ts` (the frozen draft), `test-data.json`, `freeze.json` (hashes, amendments) | test author; snapshot |
| `4-hardening/` | `<key>.spec.ts`, `test-data.json` (hardened), `hardening.md`, `probes.jsonl`, `P<n>.md` cited | hardener |
| `5-run/` | `<NN>-<label>.json` (the final evaluation run, once the verdict is due) | run |
| `6-triage/` | `decisions.json`, `probes.jsonl`, `P<n>.md` cited | triager |
| `7-verdict/` | `verdict.md`, `verdict.json`, the screenshot of each failure it reports | verdict |
| (root) | `history.jsonl` (every step, each run's result) | every step |

A probe belongs to the phase it is made in: hardening before the evaluation run, and again for a repair (every
failure decided, some script defects) or after a re-freeze; triage otherwise. Probe ids stay unique per story (P1, P2
… across phases), so a citation names one report. Before the verdict a probe log keeps in full only the probes
something cites; the others keep their id, tool and first digest line.

The hardener's mechanics answers are recorded in the contract (`contract --resolve`): the one exception to "a phase
writes only its folder", since the contract is the record later phases read for what was discovered.

## decisions.json

`{ [run]: { [scenario]: { category, rationale, title?, severity?, evidence?, action?, anyReading?, failure?, confirmedAt } } }`

`failure` is the failure's headline, so a decision on a run whose record is no longer kept still reads alone.

## freeze.json

`{ frozenAt, specs: { [file]: sha256 }, assertions: { [file]: { req: { [assertion]: sha256 }, constants: sha256 } },
journeys: { [id]: sha256 }, contractOracle, amendments: [...], refreezes: [{ at, reason, previous, absorbed }] }`

A re-freeze is audited against the previous freeze's assertion hashes, and writes the hardened copy over with the
revised draft: hardening starts again from it.

## Run record

Compact JSON; the decisions are not in it; the exchange a failure is about is kept once, as its place among the
failure's own calls. Per test: id, title, status, criteria, tags, type, layer; per failure: the failing step, the
error, the automatic class and the evidence (locations of the screenshot and trace, a bounded page snapshot, the calls
with their answers cut to a bounded length).

## State transitions

Before the verdict, `advance` moves the earlier runs' records to the scratch area and trims the uncited probes; the
whole scratch area goes when the story completes, unless `keepScratch`. No agent reads another phase's scratch.
