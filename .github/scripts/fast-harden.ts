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
