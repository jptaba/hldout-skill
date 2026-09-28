/**
 * Held-out acceptance tests for CL-3 — "Edit and delete a contact".
 * Written from evaluations/CL-3/scenarios.feature (requirement + attachments only; never from the AUT's code).
 */
import type { Page } from '@playwright/test';
import { test, expect, expectResponse, signIn, type Account, type Api, type ApiResponse, type Seed } from '../../../heldout-support/fixtures';

// @req-constants-start — expected outcomes copied verbatim from CL-3 (never edit during hardening)
const REQ = {
  STATUS: { OK: 200, BAD_REQUEST: 400, NOT_FOUND: 404 },
  DELETED: 'Contact deleted',
  INVALID_ID: 'Invalid Contact ID',
  EMAIL_INVALID: 'Email is invalid',
  CONFIRM_DELETE: 'Are you sure you want to delete this contact?',
  OPTIONAL: ['birthdate', 'email', 'phone', 'street1', 'street2', 'city', 'stateProvince', 'postalCode', 'country'],
  MALFORMED_ID: 'abc',
} as const;
// @req-constants-end

// Endpoints exactly as declared in the requirement.
const EP = { contacts: '/contacts', contact: (id: string) => `/contacts/${id}` };

interface Contact { _id: string; firstName: string; lastName: string; birthdate?: string | null; email?: string | null; phone?: string | null; street1?: string | null; street2?: string | null; city?: string | null; stateProvince?: string | null; postalCode?: string | null; country?: string | null }
const FULL = { firstName: 'Jane', lastName: 'Doe', birthdate: '1985-07-14', email: 'jane.doe@example.com', phone: '8005551234', street1: '1 Main St.', street2: 'Apartment A', city: 'Anytown', stateProvince: 'KS', postalCode: '12345', country: 'USA' };
const FIELDS = ['firstName', 'lastName', 'birthdate', 'email', 'phone', 'street1', 'street2', 'city', 'stateProvince', 'postalCode', 'country'] as const;

/** A contact of this test's user, deleted after the test. */
async function newContact(api: Api, seed: Seed, me: Account, data: Partial<typeof FULL> = FULL): Promise<Contact> {
  return seed.create('contact', async () => {
    const res = await api.post<Contact>(EP.contacts, { headers: me.headers, data });
    expect(res.status, 'create contact (seed)').toBe(201);
    return res.body;
  }, (c) => api.delete(EP.contact(c._id), { headers: me.headers }));
}
async function stored(api: Api, me: Account, id: string): Promise<Contact> {
  const res = await api.get<Contact>(EP.contact(id), { headers: me.headers });
  expect(res.status, 'read the stored contact').toBe(REQ.STATUS.OK);
  return res.body;
}
const pick = (c: Partial<Contact>) => Object.fromEntries(FIELDS.map((f) => [f, c[f] ?? null]));

async function openDetails(page: Page, me: Account, c: Contact): Promise<void> {
  await signIn(page, me);
  await page.getByRole('row').filter({ hasText: `${c.firstName} ${c.lastName}` }).first().click();
  await expect(page, 'on the Contact Details page (precondition)').toHaveURL(/contactDetails/);
  // The page loads the contact after it opens; its buttons act only once it is shown.
  await expect(page.locator('#lastName'), 'the contact is shown (precondition)').toHaveText(c.lastName);
}
async function openEdit(page: Page, me: Account, c: Contact): Promise<void> {
  await openDetails(page, me, c);
  await page.getByRole('button', { name: 'Edit Contact' }).click();
  await expect(page.locator('#firstName'), 'the edit form is loaded (precondition)').toHaveValue(c.firstName);
}
const editField = (page: Page, f: string) => page.locator(`#${f}`);

test.describe('CL-3 Edit and delete a contact', () => {
  test('SCN-001: The edit form is pre-filled with the contact\'s current values', { tag: ['@AC-1', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let c!: Contact;
    await journey.step('Given I am signed in and have a contact with every field filled', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
    await journey.step('And I opened that contact\'s Contact Details page from the Contact List', async () => { await openDetails(page, me, c); });
    await journey.step('When I press "Edit Contact"', async () => { await page.getByRole('button', { name: 'Edit Contact' }).click(); });
    await journey.step('Then the Edit Contact page shows every field with the contact\'s current value', async () => {
      for (const f of FIELDS) await expect.soft(editField(page, f), `[REQ AC-1] "${f}" is pre-filled`).toHaveValue(String(FULL[f]));
    });
  });

  test('SCN-002: Editing the city saves it and shows it on the Contact Details page', { tag: ['@AC-2', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let c!: Contact;
    await journey.step('Given I am signed in and have a contact in Anytown', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
    await journey.step('And I am on that contact\'s Edit Contact page', async () => { await openEdit(page, me, c); });
    await journey.step('When I change the city to a new value and press Submit', async () => {
      await editField(page, 'city').fill('Springfield');
      await page.getByRole('button', { name: 'Submit' }).click();
    });
    await journey.step('Then I am on the Contact Details page', async () => {
      await expect(page, '[REQ AC-2] back on the Contact Details page').toHaveURL(/contactDetails/);
    });
    await journey.step('And it shows the new city', async () => {
      await expect(page.locator('#city'), '[REQ AC-2] the Contact Details page shows the new city').toHaveText('Springfield');
    });
  });

  test('SCN-003: An edit in the web app is what the API returns', { tag: ['@AC-3', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let c!: Contact;
    await journey.step('Given I am signed in and have a contact in Anytown', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
    await journey.step('And I am on that contact\'s Edit Contact page', async () => { await openEdit(page, me, c); });
    await journey.step('When I change the city to a new value and press Submit', async () => {
      await editField(page, 'city').fill('Springfield');
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page, 'the edit was submitted (precondition)').toHaveURL(/contactDetails/);
    });
    await journey.step('Then GET /contacts/{id} returns 200 with the new city', async () => {
      await me.refresh();
      const res = await api.get<Contact>(EP.contact(c._id), { headers: me.headers });
      expect.soft(res.status, '[REQ AC-3] GET /contacts/{id} → 200').toBe(REQ.STATUS.OK);
      expect.soft(res.body.city, '[REQ AC-3] GET /contacts/{id} returns the new city').toBe('Springfield');
    });
  });

  test('SCN-004: Emptying the phone in the web app clears it', { tag: ['@AC-3', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let c!: Contact;
    await journey.step('Given I am signed in and have a contact with a phone number', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
    await journey.step('And I am on that contact\'s Edit Contact page', async () => { await openEdit(page, me, c); });
    await journey.step('When I empty the phone and press Submit', async () => {
      await editField(page, 'phone').fill('');
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page, 'the edit was submitted (precondition)').toHaveURL(/contactDetails/);
    });
    await journey.step('Then the Contact Details page shows no phone', async () => {
      await expect(page.locator('#phone'), '[REQ AC-3] the Contact Details page shows the phone empty').toHaveText('');
    });
    await journey.step('And GET /contacts/{id} returns null for the phone', async () => {
      await me.refresh();
      const res = await api.get<Contact>(EP.contact(c._id), { headers: me.headers });
      expect(res.body.phone, '[REQ AC-3] GET /contacts/{id} returns null for the emptied phone').toBeNull();
    });
  });

  test('SCN-005: An invalid e-mail is refused and nothing is stored', { tag: ['@AC-4', '@type:negative', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let c!: Contact;
    await journey.step('Given I am signed in and have a contact', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
    await journey.step('And I am on that contact\'s Edit Contact page', async () => { await openEdit(page, me, c); });
    await journey.step('When I enter the e-mail "not-an-email" and press Submit', async () => {
      await editField(page, 'email').fill('not-an-email');
      await page.getByRole('button', { name: 'Submit' }).click();
    });
    await journey.step('Then I stay on the Edit Contact page', async () => {
      await expect(page.locator('#error'), 'the form answered (precondition)').toBeVisible();
      await expect(page, '[REQ AC-4] still on the Edit Contact page').toHaveURL(/editContact/);
    });
    await journey.step('And a message containing "Email is invalid" is shown', async () => {
      await expect(page.locator('#error'), '[REQ AC-4] message contains "Email is invalid"').toContainText(REQ.EMAIL_INVALID);
    });
    await journey.step('And GET /contacts/{id} returns the contact unchanged', async () => {
      await me.refresh();
      expect(pick(await stored(api, me, c._id)), '[REQ AC-4] GET /contacts/{id} is unchanged').toEqual(pick(FULL));
    });
  });

  test('SCN-006: PUT replaces the contact', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let c!: Contact; let res!: ApiResponse<Contact>;
    const next = { ...FULL, firstName: 'Janet', city: 'Springfield', phone: '8005559999' };
    await journey.step('Given I have a contact with every field filled', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
    await journey.step('When I PUT a complete contact with new values to /contacts/{id}', async () => { res = await api.put(EP.contact(c._id), { headers: me.headers, data: next }); });
    await journey.step('Then the answer is 200 with the full updated contact', async () => {
      expect.soft(res.status, '[REQ AC-5] PUT /contacts/{id} → 200').toBe(REQ.STATUS.OK);
      expect.soft(pick(res.body), '[REQ AC-5] PUT /contacts/{id} answers the full updated contact').toEqual(pick(next));
    });
  });

  test('SCN-007: PUT clears the optional fields it does not send', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
    let me!: Account; let c!: Contact; let res!: ApiResponse<Contact>;
    await journey.step('Given I have a contact with every field filled', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
    await journey.step('When I PUT only a first and a last name to /contacts/{id}', async () => { res = await api.put(EP.contact(c._id), { headers: me.headers, data: { firstName: 'Jane', lastName: 'Doe' } }); });
    await journey.step('Then the answer is 200 and every optional field is null', async () => {
      expect.soft(res.status, '[REQ AC-5] PUT /contacts/{id} with names only → 200').toBe(REQ.STATUS.OK);
      const notNull = REQ.OPTIONAL.filter((f) => (res.body as unknown as Record<string, unknown>)[f] !== null).map((f) => `${f}: ${JSON.stringify((res.body as unknown as Record<string, unknown>)[f])}`);
      expect.soft(notNull, '[REQ AC-5] PUT /contacts/{id} clears the optional fields it does not send to null').toEqual([]);
    });
  });

  test('SCN-008: PATCH changes only the fields it sends', { tag: ['@AC-6', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let c!: Contact; let res!: ApiResponse<Contact>;
    await journey.step('Given I have a contact with every field filled', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
    await journey.step('When I PATCH a new city to /contacts/{id}', async () => { res = await api.patch(EP.contact(c._id), { headers: me.headers, data: { city: 'Springfield' } }); });
    await journey.step('Then the answer is 200 with the new city', async () => {
      expect.soft(res.status, '[REQ AC-6] PATCH /contacts/{id} → 200').toBe(REQ.STATUS.OK);
      expect.soft(res.body.city, '[REQ AC-6] PATCH /contacts/{id} answers the new city').toBe('Springfield');
    });
    await journey.step('And every other field keeps its previous value', async () => {
      expect(pick(await stored(api, me, c._id)), '[REQ AC-6] PATCH /contacts/{id} keeps every other field').toEqual(pick({ ...FULL, city: 'Springfield' }));
    });
  });

  const REFUSED: { request: string; method: 'PUT' | 'PATCH'; body: Record<string, string> }[] = [
    { request: 'PUT without firstName', method: 'PUT', body: (({ firstName, ...rest }) => (void firstName, rest))(FULL) },
    { request: 'PUT without lastName', method: 'PUT', body: (({ lastName, ...rest }) => (void lastName, rest))(FULL) },
    { request: 'PUT with firstName ""', method: 'PUT', body: { ...FULL, firstName: '' } },
    { request: 'PATCH with lastName ""', method: 'PATCH', body: { lastName: '' } },
  ];
  REFUSED.forEach((row, i) => {
    test(`SCN-009.${i + 1}: An update that would lose the first or last name is refused (${row.request})`, { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
      let me!: Account; let c!: Contact; let res!: ApiResponse;
      await journey.step('Given I have a contact with every field filled', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
      await journey.step(`When I send ${row.request}`, async () => { res = await api.call(row.method, EP.contact(c._id), { headers: me.headers, data: row.body }); });
      await journey.step('Then the answer is 400 with a JSON message', async () => {
        expect.soft(res.status, `[REQ AC-7] ${row.method} /contacts/{id} (${row.request}) → 400`).toBe(REQ.STATUS.BAD_REQUEST);
        expect.soft(typeof (res.body as { message?: unknown })?.message, `[REQ AC-7] ${row.method} /contacts/{id} (${row.request}) answers a JSON message`).toBe('string');
      });
      await journey.step('And the stored contact is exactly as it was', async () => {
        expect(pick(await stored(api, me, c._id)), `[REQ AC-7] after ${row.request} the contact is unchanged`).toEqual(pick(FULL));
      });
    });
  });

  test('SCN-010: Cancelling the delete keeps the contact', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let c!: Contact;
    const dialogs: string[] = [];
    await journey.step('Given I am signed in and on a contact\'s Contact Details page', async () => { me = await seed.account(); c = await newContact(api, seed, me); await openDetails(page, me, c); });
    await journey.step('When I press "Delete Contact" and cancel "Are you sure you want to delete this contact?"', async () => {
      page.once('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
      await page.getByRole('button', { name: 'Delete Contact' }).click();
      await expect.poll(() => dialogs, { message: '[REQ AC-8] asks "Are you sure you want to delete this contact?"' }).toEqual([REQ.CONFIRM_DELETE]);
    });
    await journey.step('Then I stay on the Contact Details page', async () => {
      await expect(page, '[REQ AC-8] after Cancel still on the Contact Details page').toHaveURL(/contactDetails/);
    });
    await journey.step('And the contact still exists', async () => {
      await me.refresh();
      const res = await api.get(EP.contact(c._id), { headers: me.headers });
      expect(res.status, '[REQ AC-8] after Cancel GET /contacts/{id} still finds the contact').toBe(REQ.STATUS.OK);
    });
  });

  test('SCN-011: Confirming the delete removes the contact', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, api, journey, seed }) => {
    let me!: Account; let c!: Contact;
    const dialogs: string[] = [];
    await journey.step('Given I am signed in and on a contact\'s Contact Details page', async () => { me = await seed.account(); c = await newContact(api, seed, me); await openDetails(page, me, c); });
    await journey.step('When I press "Delete Contact" and confirm "Are you sure you want to delete this contact?"', async () => {
      page.once('dialog', (d) => { dialogs.push(d.message()); void d.accept(); });
      await page.getByRole('button', { name: 'Delete Contact' }).click();
      await expect.poll(() => dialogs, { message: '[REQ AC-8] asks "Are you sure you want to delete this contact?"' }).toEqual([REQ.CONFIRM_DELETE]);
    });
    await journey.step('Then I am on the Contact List page', async () => {
      await expect(page, '[REQ AC-8] after OK on the Contact List page').toHaveURL(/contactList/);
    });
    await journey.step('And the contact is no longer listed', async () => {
      await expect(page.getByRole('row').filter({ hasText: `${c.firstName} ${c.lastName}` }), '[REQ AC-8] the deleted contact is not listed').toHaveCount(0);
    });
  });

  test('SCN-012: DELETE answers "Contact deleted"', { tag: ['@AC-9', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let c!: Contact; let res!: ApiResponse;
    await journey.step('Given I have a contact', async () => { me = await seed.account(); c = await newContact(api, seed, me); });
    await journey.step('When I send DELETE /contacts/{id}', async () => { res = await api.delete(EP.contact(c._id), { headers: me.headers }); });
    await journey.step('Then the answer is 200 with the body "Contact deleted"', async () => {
      expectResponse(res, { status: REQ.STATUS.OK, body: REQ.DELETED }, '[REQ AC-9] DELETE /contacts/{id}');
    });
  });

  test('SCN-013: A deleted contact is gone for good', { tag: ['@AC-10', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
    let me!: Account; let c!: Contact;
    await journey.step('Given I had a contact and deleted it with DELETE /contacts/{id}', async () => {
      me = await seed.account(); c = await newContact(api, seed, me);
      const del = await api.delete(EP.contact(c._id), { headers: me.headers });
      expect(del.status, 'delete the contact (precondition)').toBe(REQ.STATUS.OK);
    });
    await journey.step('Then GET /contacts/{id} answers 404 with an empty body', async () => {
      expectResponse(await api.get(EP.contact(c._id), { headers: me.headers }), { status: REQ.STATUS.NOT_FOUND, body: '' }, '[REQ AC-10] GET /contacts/{id} after deletion');
    });
    await journey.step('And GET /contacts does not list it', async () => {
      const list = await api.get<Contact[]>(EP.contacts, { headers: me.headers });
      expect((list.body ?? []).map((x) => x._id), '[REQ AC-10] GET /contacts does not list the deleted contact').not.toContain(c._id);
    });
    await journey.step('And a second DELETE, a PUT and a PATCH on it answer 404 with an empty body', async () => {
      expectResponse(await api.delete(EP.contact(c._id), { headers: me.headers }), { status: REQ.STATUS.NOT_FOUND, body: '' }, '[REQ AC-10] second DELETE /contacts/{id}');
      expectResponse(await api.put(EP.contact(c._id), { headers: me.headers, data: FULL }), { status: REQ.STATUS.NOT_FOUND, body: '' }, '[REQ AC-10] PUT /contacts/{id} after deletion');
      expectResponse(await api.patch(EP.contact(c._id), { headers: me.headers, data: { city: 'X' } }), { status: REQ.STATUS.NOT_FOUND, body: '' }, '[REQ AC-10] PATCH /contacts/{id} after deletion');
    });
  });

  (['GET', 'PUT', 'PATCH', 'DELETE'] as const).forEach((method, i) => {
    test(`SCN-014.${i + 1}: A malformed contact id is refused (${method})`, { tag: ['@AC-11', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
      let me!: Account; let res!: ApiResponse;
      await journey.step(`When I send ${method} /contacts/abc`, async () => {
        me = await seed.account();
        res = await api.call(method, EP.contact(REQ.MALFORMED_ID), { headers: me.headers, ...(method === 'PUT' || method === 'PATCH' ? { data: FULL } : {}) });
      });
      await journey.step('Then the answer is 400 with the body "Invalid Contact ID"', async () => {
        expectResponse(res, { status: REQ.STATUS.BAD_REQUEST, body: REQ.INVALID_ID }, `[REQ AC-11] ${method} /contacts/abc`);
      });
    });
  });
});
