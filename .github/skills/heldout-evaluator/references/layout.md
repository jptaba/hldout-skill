# Output layout

Where each file of an evaluation belongs. `H="npm run heldout --"`.

```
journeys/                                   ← shared by every story on the application (grows story by story)
  fixtures/<domain>.ts                      ← the journeys of one area, UI and API (phases 2–3)
  registry.yml                              ← ids, what each touches and requires, who proved it (phase 8)

application-map/<profile>/<domain>.jsonl    ← how the application works, as probes proved it (committed): read and
                                              written after a freeze only, through `heldout map` (phases 3 and 5)
application-map/<profile>/app.yml           ← what the application is (overview: read by every agent, written at
                                              setup only) and its business rules (required by judged stories,
                                              observed by probes: after a freeze only), through `heldout map`
                                              (setup, phases 3, 5 and 9)

output/<profile>/KEY/                       ← the record of one story (committed): one folder per phase, each holding
                                              only what that phase hands the later ones
  1-requirement/  story.md linked/ transcripts/ (CHANGES.md revisions/ after a revision)   ← fetch (phase 1)
  2-contract/     contract.json review.json                              ← extractor, reviewer (phase 1b)
  3-tests/        <key>.spec.ts test-data.json (the draft, as frozen) freeze.json (its hashes)   ← test author (phase 2)
  4-hardening/    <key>.spec.ts test-data.json (the copy that runs) hardening.md probes.jsonl Pn.md (the cited ones)
                                                                          ← hardener (phase 3)
  5-run/          NN-label.json, one record per run: how it ran, every test, each failure's evidence   ← run (phase 4)
  6-triage/       decisions.json probes.jsonl Pn.md (the cited ones)     ← triager (phase 5)
  7-verdict/      verdict.md verdict.json, the screenshots it shows       ← verdict (phase 6)
  history.jsonl                                                           ← every step that changed the story

.heldout/<profile>/KEY/                     ← scratch and views (git-ignored), the same folder names
  2-contract/evidence-pack.md contract.md   4-hardening/ (step files, probe reports)   6-triage/ (triage-NN-label.md,
  chains/<run>/, probe reports)   7-verdict/journeys-staged.json
  5-run/NN-label/ (the raw output: Playwright's JSON, the failures' traces and screenshots; JUnit and HTML report with
  --junit, --html; only the last two runs and any run still in triage)
  stray/                                    ← files that were in the record but are no part of it, moved by advance
```

The record holds only the files above. `$H lint KEY` and `$H status KEY` warn about any other file and say where it
belongs; `$H advance KEY` moves such files to the scratch area's `stray/` before the verdict (a `stray-moved` line in
the history) and checks the story's files for secret values before publishing. The scratch area is removed once the
story is complete, unless the config sets `"keepScratch": true`.

`$H status KEY` prints each phase beside its folder, and both roots. Everything the phases decide without leaving a file (the draft
marked finished, the verdict published, the journeys harvested), and every run, check and decision, is a line of
`history.jsonl`.
