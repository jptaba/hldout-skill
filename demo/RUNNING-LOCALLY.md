# Running the demo applications locally

The demo stories can be evaluated against the applications' public demos, or against an instance started on your own
machine for the round and thrown away after it. A local instance has no other visitors, keeps its data until you
reset it, and takes no leftovers from your tests: prefer it for anything but a first look.

Both need Docker. Neither is part of this repository: the commands below fetch the applications from their owners.

## Toolshop (Practice Software Testing)

```bash
git clone --depth 1 https://github.com/testsmith-io/practice-software-testing.git toolshop
cd toolshop
# the prebuilt images; without the "cron" service, so nothing resets the data in the middle of a round
SPRINT=sprint5 DISABLE_LOGGING=false docker compose -p pst -f docker-compose.prod.yml up -d laravel-api angular-ui web mariadb
# once the database answers (a few seconds): create the tables and the demo data
docker exec pst-laravel-api-1 php artisan migrate:fresh --seed --force
```

| | Address |
| --- | --- |
| Web shop | `http://localhost:4200/` (the first page load takes up to a few minutes while the application compiles) |
| API | `http://localhost:8091` |

Set the project up on it, or point an existing project's profile at it:

```bash
"$HOME/heldout-skill/setup.sh" --base-url http://localhost:4200/ --api-base-url http://localhost:8091
```

- **Accounts.** The seed creates the same demo accounts as the public demo (two customers and an administrator,
  listed in the application's own README with their passwords). Put the passwords in the project's `.env` and add the
  accounts as there (`npm run heldout -- accounts --add-existing … --role customer`, the administrator with
  `--role admin --shared`).
- **A fresh state.** Run the `migrate:fresh --seed` line again: every record the tests left is gone.
- **Another build than the public demo.** The images follow the application's source; the public demo may be a
  release behind or ahead. When round 34's project was pointed at a local instance, two controls on the conversation
  pages had lost their labels: four tests failed on a journey's precondition, triage confirmed them as script defects,
  the hardener repaired two locators, and the re-run gave the verdict of the public demo. That is the repair loop
  doing its work, not a fault of the local instance.
- **The release-candidate stories** (TOOLB-1, TOOLB-2) run against the build with seeded bugs: the same commands
  with `SPRINT=sprint5-with-bugs`, as a second profile (`npm run heldout -- add-aut toolshop-rc --base-url …`).
- **Stop and remove:** `docker compose -p pst -f docker-compose.prod.yml down -v`.

## ParaBank

```bash
docker run -d --name parabank -p 3080:8080 parasoft/parabank
```

| | Address |
| --- | --- |
| Web pages | `http://localhost:3080/parabank/` |
| API | `http://localhost:3080/parabank/services/bank` |

```bash
"$HOME/heldout-skill/setup.sh" --base-url http://localhost:3080/parabank/ --api-base-url http://localhost:3080/parabank/services/bank --name ParaBank --profile parabank
```

- **Accounts.** The tests register their own customers on the sign-up page; the first story's hardening finds out how
  and saves it in the profile.
- **One worker.** Sign-ups sent at the same moment are refused: set `maxWorkers` to 1 in the profile
  (`npm run heldout -- init --profile parabank --max-workers 1`).
- **Nothing can be deleted**, and some checks leave the accounts they touch unreadable. Throw the container away
  between rounds: `docker rm -f parabank`, then the `docker run` line again.

## A round, and what it cost

A round runs in a project of its own, made from this clone, with the demo stories in its mock Jira. Set
`HELDOUT_ROUNDS_DIR` to the folder the round projects go in, then:

```bash
npx tsx demo/round.ts new r37 --base-url http://localhost:4200/ --api-base-url http://localhost:8091 --stories TOOL-1,TOOL-4
cd "$HELDOUT_ROUNDS_DIR/r37" && npm run heldout -- advance TOOL-1      # then each story, one at a time
```

After the round, from this repository:

```bash
npx tsx demo/score.ts TOOL-1 --from "$HELDOUT_ROUNDS_DIR/r37"           # against the answer key
npx tsx demo/inflight.ts ~/.claude/projects/<the round's folder> --list   # scripts the agents wrote on the fly (Claude Code rounds)
```

and in the round project, `npm run heldout -- stats` (runs, repairs, probes, minutes, stray files, tool gaps, subagent
cost).

The `dev-round-auditor` subagent does all three and classifies what went wrong.
