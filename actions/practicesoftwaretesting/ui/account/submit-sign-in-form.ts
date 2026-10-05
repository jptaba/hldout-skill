import { signInForm, type Page } from './_shared';

/**
 * On the open sign-in page, enter an e-mail address and a password and submit the form. Returns at once: the caller
 * waits for what the application does next (the page it lands on, a message, the sign-in request's answer).
 */
export async function submitSignInForm(page: Page, email: string, password: string): Promise<void> {
  const form = signInForm(page);
  await form.email.fill(email);
  await form.password.fill(password);
  await form.submit.click();
}
