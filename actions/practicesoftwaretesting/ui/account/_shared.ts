import { type gotoPage } from '../../../../heldout-support/fixtures';

/** The Playwright page the account actions work on. */
export type Page = Parameters<typeof gotoPage>[0];

/** The web shop sign-in form's fields and its submit button. */
export const signInForm = (page: Page) => ({
  email: page.getByTestId('email'),
  // the field's label reads "Password *" (and the field has a show-password button next to it): the test id is unique
  password: page.getByTestId('password'),
  submit: page.getByTestId('login-submit'),
});
