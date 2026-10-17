/**
 * Reading Playwright's JSON results of a run.
 */

interface PwSpec { title: string; tests: { status: string; results: { error?: { message?: string } }[] }[] }
interface PwSuite { suites?: PwSuite[]; specs?: PwSpec[] }

/** Failed and flaky tests with the first line of their (last) error, for the compact run digest. */
export function failedTests(results: unknown): { title: string; error: string; flaky: boolean }[] {
  const specs = (s: PwSuite): PwSpec[] => [...(s.specs ?? []), ...(s.suites ?? []).flatMap(specs)];
  // eslint-disable-next-line no-control-regex
  const plain = (m = '') => m.replace(/\x1b\[[0-9;]*m/g, '').split('\n').find((l) => l.trim())?.trim().slice(0, 300) ?? '';
  return specs(results as PwSuite).flatMap((sp) => sp.tests.filter((t) => t.status === 'unexpected' || t.status === 'flaky').map((t) => ({
    title: sp.title,
    error: plain([...t.results].reverse().find((r) => r.error)?.error?.message),
    flaky: t.status === 'flaky',
  })));
}
