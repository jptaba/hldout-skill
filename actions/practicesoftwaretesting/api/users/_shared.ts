import { uniqueId } from '../../../../heldout-support/fixtures';

/** A new customer's registration details, as POST /users/register takes them. */
export interface NewCustomer {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob: string;
  phone: string;
  address: { street: string; city: string; state: string; country: string; postal_code: string };
}

/** A registered customer: the details it was registered with, and the id the registration answered. */
export interface RegisteredCustomer extends NewCustomer {
  id: string;
}

/** The sign-in answer of POST /users/login. */
export interface SignInAnswer {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!#$%&*+?@';
const pick = (set: string, n: number) => Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join('');

/** Random letters only (names on many applications refuse digits and dashes). */
export const randomLetters = (n: number): string => pick(LOWER, n);

/**
 * A random password of `length` characters (at least 4) with an upper and a lower case letter, a number and a symbol,
 * random enough not to appear in any list of leaked passwords.
 */
export function strongPassword(length = 14): string {
  const n = Math.max(length, 4) - 3;
  return `${pick(UPPER, 1)}${pick(LOWER, n)}${pick(DIGITS, 1)}${pick(SYMBOLS, 1)}`;
}

/**
 * Registration details for a new customer with a unique e-mail address (the profile's data prefix, so leftovers can
 * be found) and a strong random password. `overrides` replaces any field.
 */
export function newCustomer(overrides: Partial<NewCustomer> = {}): NewCustomer {
  return {
    first_name: 'Hldout',
    last_name: `Tester${randomLetters(6)}`,
    email: `${uniqueId()}@example.com`.toLowerCase(),
    password: strongPassword(),
    // accepted by POST /users/register besides name, e-mail and password (the address as a nested object)
    dob: '1990-01-01',
    phone: '0612345678',
    address: { street: 'Test Street 1', city: 'Utrecht', state: 'Utrecht', country: 'NL', postal_code: '3511AA' },
    ...overrides,
  };
}
