# The benchmark: the application on your machine, with faults to switch on

The benchmark's application is Practice Software Testing (Toolshop), from its owner's prebuilt images
([bench/docker-compose.yml](bench/docker-compose.yml)); nothing of it is in this repository. Its API is reached
through a proxy ([dev/bench/proxy.ts](../dev/bench/proxy.ts)) that changes a request or an answer while a fault is
switched on ([dev/bench/faults.ts](../dev/bench/faults.ts)). With every fault off it is the application as its owner
built it, and the stories in [stories/](stories/) describe exactly that.

It needs Docker, the Claude Code command line (`claude`), and two environment variables: `HELDOUT_ROUNDS_DIR`, the
folder the run projects go in, and `BENCH_APP_PASSWORD`, the password of the application's demo accounts (its own
README lists it).

```bash
npx tsx dev/bench.ts up                       # the application, fresh data, the proxy; the first start takes minutes
npx tsx dev/bench.ts new b1 --stories SHOP-1  # a project of its own: setup, the accounts, the story, the overview
npx tsx dev/bench.ts eval b1 SHOP-1           # the story's faults on, then the evaluation, nobody watching
npx tsx dev/bench.ts score b1 SHOP-1          # the tests again with no fault and with each fault alone
npx tsx dev/bench.ts report                   # every scored run, and how far unchanged runs differ
npx tsx dev/bench.ts reset                    # fresh data between runs
npx tsx dev/bench.ts down
```

| | Address |
| --- | --- |
| Web shop | `http://localhost:4200/` |
| API, through the proxy | `http://localhost:8091` |
| API, untouched | `http://localhost:8092` |

- **One evaluation or score at a time.** The faults are switched for the whole application, and a score switches
  them.
- **A usage limit in the middle** ends the run with an error; `eval` again goes on from where the story stands, with
  the same faults, and the costs of both runs are added.
- **What the score is.** A fault is found when a test of a finding fails with only that fault on and passes with
  none on. A finding whose tests fail with no fault on is a false positive. `<project>/.bench/` keeps the faults that
  were on, how often each changed a call, each run's cost and the score.
- **In the project, by hand:** `npm run heldout -- stats` (runs, repairs, probes, minutes per phase), and
  `npx tsx dev/inflight.ts <the app's transcripts folder for the project> --list` for scripts the agents wrote on
  the fly. The `dev-round-auditor` subagent reads a finished run and classifies what went wrong.
- **GitHub Copilot:** [docs/copilot-checklist.md](../docs/copilot-checklist.md).
