import { expect, gotoPage } from '../../../../heldout-support/fixtures';
import { signInForm, type Page } from './_shared';

/** Open the web shop's sign-in page (the one "Sign in" in the navigation leads to) and wait until its form is shown. */
export async function openSignInPage(page: Page): Promise<void> {
  await gotoPage(page, '/auth/login'); // where "Sign in" in the navigation leads
  await expect(signInForm(page).email, 'the sign-in form is shown (precondition)').toBeVisible({ timeout: 15_000 });
}
