# Handoff contract: what each agent reads

The agent files and the skill's references name only these inputs (checked by `tests/agent-files.test.ts`).

| Agent | Reads | Writes |
| --- | --- | --- |
| heldout-contract-extractor | the evidence pack (`heldout contract KEY --pack`) | `2-contract/contract.json` |
| heldout-contract-reviewer | the evidence pack, `2-contract/contract.json` | `2-contract/review.json` |
| heldout-test-author | `2-contract/contract.json`, the journeys registry | `3-tests/`, journeys |
| heldout-hardener | `2-contract/contract.json`, `4-hardening/` (its copy), journeys; for a repair, the triage decisions | `4-hardening/`, journeys, the contract's mechanics answers (`contract --resolve`) |
| heldout-triager | `5-run/` record, `4-hardening/<key>.spec.ts` and `hardening.md`, `2-contract/contract.json` | `6-triage/` |

Commands keep their names and flags; paths come from `core/paths.ts`.
