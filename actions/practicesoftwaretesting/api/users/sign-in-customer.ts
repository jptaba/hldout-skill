import { expect, type Api, type Seed } from '../../../../heldout-support/fixtures';
import { type SignInAnswer } from './_shared';

/**
 * Sign a customer in over the API (POST /users/login with e-mail address and password) as a precondition and return
 * the access token with the Authorization header that authenticates as the customer.
 */
export async function signInCustomer(api: Api, seed: Seed, email: string, password: string): Promise<{ token: string; headers: Record<string, string> }> {
  return seed.step(`sign in ${email} (POST /users/login)`, async () => {
    const res = await api.post<SignInAnswer>('/users/login', { data: { email, password } });
    expect(res.ok, `sign in ${email} (precondition): ${res.status}`).toBe(true);
    const token = res.body?.access_token;
    expect(typeof token === 'string' && token.length > 0, 'the sign-in answered an access token (precondition)').toBe(true);
    return { token, headers: { Authorization: `Bearer ${token}` } };
  });
}
