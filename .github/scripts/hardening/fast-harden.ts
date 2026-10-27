/**
 * Hardening without the hardener: what a run of the tests may settle by itself. Pure logic, used by `heldout advance`.
 */

/** A test as the suite model reads it: its id and its code. */
export interface TestCode { id: string; code: string }
/** One result of a run: the test (a table row is "SCN-005.2") and how it ended. */
export interface RunResult { scenario: string; status: string }

const MARK = /TODO\(harden\)/g;
/** A check that something is absent passes on a wrong locator too. */
const ABSENCE = /\.not\.|toBeHidden|toHaveCount\(\s*0\s*\)|waitFor\(\{\s*state:\s*'(hidden|detached)'/;
/** A line that acts on what it locates, or expects it: a locator that matched nothing fails here. */
const EXERCISED = /\.(click|fill|press|check|uncheck|selectOption|hover|type)\(|expect(\.soft)?\(|waitFor\(/;

const passedEveryTime = (scenario: string, results: RunResult[]) => {
  const runs = results.filter((r) => r.scenario === scenario || r.scenario.replace(/\.\d+$/, '') === scenario);
  return runs.length > 0 && runs.every((r) => r.status === 'passed');
};

/** A journey of the story's files: its id and its own code (no helper of the file). */
export interface JourneyOwnCode { id: string; code: string }

/**
 * The guesses a draft left in journeys that are new with this story, judged by the run, under the rule for guesses in
 * tests and two more, because a journey has branches a run may never take and callers the run doesn't know: the
 * guess is a statement of the journey itself (not inside an `if`, a loop or a `try`), and every test of the story
 * that uses the journey passed every time. So a locator the journey clicks, fills or waits for is settled; a path of
 * an API call, a value it returns or compares, a guess in a helper or a constant of the file is the hardener's.
 * Without `results`, only what the code shows is judged (before the run is made). Returns why not, or undefined.
 */
export function journeyGuessesNotSettled(journeys: JourneyOwnCode[], marksInFiles: number, fresh: Set<string>, use: Map<string, Set<string>>, results?: RunResult[]): string | undefined {
  const inJourneys = journeys.reduce((n, j) => n + (j.code.match(MARK) ?? []).length, 0);
  if (inJourneys < marksInFiles) return 'a guess marked outside any journey (a constant or a helper of the file) is not settled by a run';
  for (const j of journeys.filter((x) => x.code.includes('TODO(harden)'))) {
    if (!fresh.has(j.id)) return `${j.id} holds a guess and is not new with this story`;
    const users = [...(use.get(j.id) ?? [])];
    if (!users.length) return `${j.id} holds a guess and no test of the story uses it`;
    const lines = j.code.split('\n');
    // The statements of the journey itself are the least indented lines after its first one.
    const indent = (l: string) => l.match(/^\s*/)![0].length;
    const top = Math.min(...lines.slice(1).filter((l) => l.trim() && !/^\s*[})\]]/.test(l)).map(indent));
    for (const [i, line] of lines.entries()) {
      if (!line.includes('TODO(harden)')) continue;
      const code = /^\s*\/\//.test(line) ? lines[i + 1] ?? '' : line;
      if (i === 0 || indent(code) !== top) return `${j.id} holds a guess in a branch, which a run may never take`;
      if (ABSENCE.test(code)) return `${j.id} guesses a locator in a check that something is absent, which passes on a wrong locator too`;
      if (!EXERCISED.test(code)) return `${j.id} holds a guess the run does not exercise on its own line (a path, a field, a value it returns)`;
    }
    const failed = results && users.find((s) => !passedEveryTime(s, results));
    if (failed) return `${j.id} holds a guess and ${failed}, which uses it, did not pass every time`;
  }
  return undefined;
}

/**
 * The guesses a draft left in its tests (a locator built from a text the requirement gives), judged by the run. Each
 * must sit in a test that passed every time, on a line that acts on or positively expects what it locates. A guess in
 * a failing test, in a check that something is absent, on a line the run doesn't exercise, or outside any test (a
 * helper of the spec) is not settled by a run. Returns why not, or undefined when every guess held.
 */
export function guessesNotSettled(tests: TestCode[], marksInSpecFiles: number, results: RunResult[]): string | undefined {
  const inTests = tests.reduce((n, t) => n + (t.code.match(MARK) ?? []).length, 0);
  if (inTests < marksInSpecFiles) return 'a guess marked outside any test (a helper of the spec) is not settled by a run';
  for (const t of tests.filter((x) => x.code.includes('TODO(harden)'))) {
    const runs = results.filter((r) => r.scenario === t.id || r.scenario.replace(/\.\d+$/, '') === t.id);
    if (!runs.length || runs.some((r) => r.status !== 'passed')) return `${t.id} holds a guess and did not pass every time`;
    const lines = t.code.split('\n');
    for (const [i, line] of lines.entries()) {
      if (!line.includes('TODO(harden)')) continue;
      // The mark sits on the guessed line, or alone on the line above it.
      const code = /^\s*\/\//.test(line) ? lines[i + 1] ?? '' : line;
      if (ABSENCE.test(code)) return `${t.id} guesses a locator in a check that something is absent, which passes on a wrong locator too`;
      if (!EXERCISED.test(code)) return `${t.id} holds a guess the run does not exercise on its own line`;
    }
  }
  return undefined;
}
