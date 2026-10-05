import { expect, type Api, type Seed } from '../../../../heldout-support/fixtures';
import { newCustomer, type NewCustomer, type RegisteredCustomer } from './_shared';

/**
 * Register a new customer through POST /users/register (a precondition: "given a registered customer") and return
 * its details with the id the registration answered. `details` replaces any field of a fresh unique customer.
 * The application offers no known way to delete a customer, so the account is kept (named with the data prefix).
 */
export async function registerCustomer(api: Api, seed: Seed, details: Partial<NewCustomer> = {}): Promise<RegisteredCustomer> {
  const customer = newCustomer(details);
  return seed.create(`registered customer ${customer.email}`, async () => {
    const res = await api.post<{ id?: string | number }>('/users/register', { data: customer });
    expect(res.ok, `register ${customer.email} (precondition): ${res.status} ${res.text.slice(0, 300)}`).toBe(true);
    const id = res.body?.id; // the 201 answer carries the new customer's id at its top level
    expect(id, 'the registration answered an id (precondition)').toBeTruthy();
    return { ...customer, id: String(id) };
  });
}
