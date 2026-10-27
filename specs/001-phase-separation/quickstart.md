# Quickstart: proving phase separation

1. `npm run typecheck && npm run test:skill` — layout, agent-input, import-order and record tests pass.
2. When the owner allows tests, from scratch (a new round, fresh onboarding and freshly started applications):
   `npx tsx dev/round.ts new r39 --base-url <app> --stories PB-2`, evaluate PB-2, then:
   - `find output/parabank/PB-2 -type f` lists only the files of [data-model.md](data-model.md);
   - `du -sb output/parabank/PB-2` is at most 40% of round 38's (about 2.1 MB);
   - `npx tsx dev/score.ts PB-2 --from <round>` scores 11/11 with no false positive, as round 38.
