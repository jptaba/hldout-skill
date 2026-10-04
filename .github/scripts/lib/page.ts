/**
 * Page helpers shared by the scripts (inspect, the accounts check) and the tests' fixtures (heldout-support/fixtures.ts
 * imports them from the installed skill). Structural types only: nothing here loads Playwright, so the scripts that
 * import it run where Playwright isn't installed yet.
 */

/** The page methods a locator expression may start with, e.g. "getByRole('button', { name: 'Log in' })". */
const HELPERS = ['getByRole', 'getByTestId', 'getByText', 'getByLabel', 'getByPlaceholder', 'getByAltText', 'getByTitle', 'locator'] as const;

/**
 * A page-locator expression from config or inspect steps, evaluated against the page. Nested locators inside it
 * (filter({ has: getByTestId('x') })) resolve against the page too. The expressions are written by the evaluator or the
 * team (trusted input), never taken from the application.
 */
export function locateOn<L>(page: object, expr: string): L {
  const p = page as Record<string, (...a: unknown[]) => unknown>;
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function('page', ...HELPERS, `return page.${expr.replace(/^page\./, '')};`)(page, ...HELPERS.map((h) => p[h].bind(page))) as L;
}

interface ClickableLocator { click(o: object): Promise<void>; dispatchEvent(type: string): Promise<void> }

/**
 * Close the profile's overlays (cookie consent, welcome dialogs) whenever they appear, before any action or check
 * (Playwright's addLocatorHandler). One overlay can cover another's button (a welcome dialog over the cookie banner):
 * then the click is dispatched to it.
 */
export async function closeOverlays<L extends ClickableLocator>(page: { addLocatorHandler(l: L, h: (l: L) => Promise<unknown>): Promise<unknown> }, overlays: string[] = []): Promise<void> {
  for (const expr of overlays) {
    await page.addLocatorHandler(locateOn<L>(page, expr), async (l) => { await l.click({ timeout: 2_000 }).catch(() => l.dispatchEvent('click')).catch(() => undefined); });
  }
}
