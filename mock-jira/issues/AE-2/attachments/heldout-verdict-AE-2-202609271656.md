# Held-out Evaluation Verdict — AE-2

> **Verdict: ❌ FAIL** — 3 application defect(s) reproduced by the evaluator: the AUT does not satisfy AC-3, AC-5, AC-7. Awaiting reviewer confirmation.

| | |
| --- | --- |
| Story | [AE-2](https://your-domain.atlassian.net/browse/AE-2) — Customer account lifecycle through the partner Account API, with shop sign-in |
| Application under test | Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — UI https://automationexercise.com |
| Final run | `03-eval` · 2026-09-27T06:07:58.555Z · 17s |
| Tests | 38 total · 32 passed · 6 failed · 0 flaky · 0 skipped (from 26 scenarios) |
| Held-out integrity | ✅ PRESERVED — 42 requirement assertions identical to the pre-hardening draft |
| Hardening | Tier 2 via heldout mcp-probe (bundled stdio client driving its own Playwright MCP server: login walk, hardening/tier2/login.md); Tier 3 (heldout inspect probes… (see hardening log) |
| Evaluator | Claude Code — heldout-evaluator skill |
| Generated | 2026-09-27T16:55:59.695Z |

> This verdict is the evaluator's **recommendation**. Each finding below has requirement traceability, reproduction steps and evidence, so a reviewer can confirm or reject it. Nothing has been raised in Jira; the only Jira activity is this report and a summary comment on the story.

## Findings summary

| ID | Suggested severity | Criteria | Test type | Finding | Tests | Reviewer decision |
| --- | --- | --- | --- | --- | --- | --- |
| APP-1 | Major | AC-3 | negative | E-mail uniqueness is case-sensitive: an address differing only in letter case creates a second account | SCN-004 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-2 | Major | AC-5 | negative, boundary | createAccount accepts invalid e-mail addresses and creates the account | SCN-006, SCN-007.1, SCN-007.2 | ☐ confirm · ☐ reject · ☐ clarify |
| APP-3 | Major | AC-7 | contract, functional | getUserDetailByEmail omits mobile_number from the user object | SCN-013, SCN-014 | ☐ confirm · ☐ reject · ☐ clarify |

## Findings: suspected application defects (3 root cause(s), 6 failing test(s))

### APP-1 · SCN-004 · AC-3 — E-mail uniqueness is case-sensitive: an address differing only in letter case creates a second account

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-3 | The system shall treat e-mail addresses case-insensitively for uniqueness: registering an address that differs from an existing account's address only in letter case shall be refused exactly as in AC-2. |
| Requirement source | story.md#L32 (AC-3), account-api-contract.md §2.1 (email: compared case-insensitively) |
| Test type · layer | negative · api |
| SCN-004: expected (requirement) → actual (AUT) | `400` → `201` |
| Failing step | Then the responseCode is 400 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxf39f540`; recreate equivalent data before reproducing):

- customer (POST /api/createAccount): `{"email":"hxf39f540.mujf39f6kjvh1@example.com","password":"***redacted***","name":"QA Customer jf39f6sv-1","form":{"name":"QA Customer jf39f6sv-1","email":"hxf3…` · cleanup: done
- customer (created by the scenario): `{"email":"HXF39F540.MUJF39F6KJVH1@EXAMPLE.COM","password":"***redacted***"}` · cleanup: done

**Manually (scenario steps):**

1. Given a customer exists with a unique lower-case e-mail address
2. When the partner calls createAccount with the same e-mail address in upper case
3. Then the responseCode is 400
4. And the message is "Email already exists!"

**API pre-steps: SCN-004** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/createAccount → 200`

   ```bash
   curl -i -X POST 'https://automationexercise.com/api/createAccount' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     --data 'name=QA%20Customer%20jf39f6sv-1&email=hxf39f540.mujf39f6kjvh1%40example.com&password=<secret from test-data.json / .env>&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme%20QA&address1=12%20MG%20Road&address2=Block%20B&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000000'
   ```

**Via the API: SCN-004** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /api/createAccount → 200` ⟵

   ```bash
   curl -i -X POST 'https://automationexercise.com/api/createAccount' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     --data 'name=QA%20Customer%20jf39u7ta-2&email=HXF39F540.MUJF39F6KJVH1%40EXAMPLE.COM&password=<secret from test-data.json / .env>&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme%20QA&address1=12%20MG%20Road&address2=Block%20B&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000000'
   ```

Observed response of request 1 (SCN-004):

```json
{"responseCode":201,"message":"User created!"}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run AE-2 --label repro --grep "SCN-004:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/AE-2-tests-ae-2-AE-2-Custo-b5c52-y-in-letter-case-is-refused-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/AE-2/runs/03-eval/artifacts/AE-2-tests-ae-2-AE-2-Custo-b5c52-y-in-letter-case-is-refused-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3, heldout api-probe --chain): evaluations/AE-2/runs/03-eval/confirm/case-and-email.md steps 1-4

**Evaluator's analysis:** AC-3 / contract §2.1 require e-mail uniqueness compared case-insensitively, refused with responseCode 400 'Email already exists!'. After creating hxconfirm.case.c1@example.com, createAccount with the upper-cased address answered responseCode 201 'User created!' and getUserDetailByEmail returns two distinct accounts (ids differ). Request well-formed (all required fields, declared endpoint); same behaviour in 3/3 hardening repeats and the eval run.

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-2 · SCN-006, SCN-007.1, SCN-007.2 · AC-5 — createAccount accepts invalid e-mail addresses and creates the account

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-5 | The system shall refuse createAccount when the e-mail address is not a valid e-mail address (for example it has no "@"), answering responseCode 400, and shall not create the account. |
| Requirement source | story.md#L34 (AC-5: "for example it has no @"), account-api-contract.md §2.1 |
| Test type · layer | negative, boundary · api |
| SCN-006: expected (requirement) → actual (AUT) | `400` → `201` |
| SCN-007.1: expected (requirement) → actual (AUT) | `400` → `201` |
| SCN-007.2: expected (requirement) → actual (AUT) | `400` → `201` |
| Failing step | Then the responseCode is 400 |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxf3bgk70`; recreate equivalent data before reproducing):

- customer (created by the scenario): `{"email":"hxf3bgk70.mujf3bgli2141.at.example.com","password":"***redacted***"}` · cleanup: done

**Manually (scenario steps):**

1. Given a unique address without "@"
2. When the partner calls createAccount with all required fields and that address
3. Then the responseCode is 400
4. And getUserDetailByEmail for that address answers responseCode 404

**Via the API: SCN-006** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /api/createAccount → 200` ⟵

   ```bash
   curl -i -X POST 'https://automationexercise.com/api/createAccount' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     --data 'name=QA%20Customer%20jf3bgmg7-1&email=hxf3bgk70.mujf3bgli2141.at.example.com&password=<secret from test-data.json / .env>&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme%20QA&address1=12%20MG%20Road&address2=Block%20B&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000000'
   ```

Observed response of request 1 (SCN-006):

```json
{"responseCode":201,"message":"User created!"}
```

**Via the API: SCN-007.1** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /api/createAccount → 200` ⟵

   ```bash
   curl -i -X POST 'https://automationexercise.com/api/createAccount' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     --data 'name=QA%20Customer%20jf3bgjk2-1&email=hxf3bgi80.mujf3bgjlrrm1%40&password=<secret from test-data.json / .env>&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme%20QA&address1=12%20MG%20Road&address2=Block%20B&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000000'
   ```

Observed response of request 1 (SCN-007.1):

```json
{"responseCode":201,"message":"User created!"}
```

**Via the API: SCN-007.2** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `POST /api/createAccount → 200` ⟵

   ```bash
   curl -i -X POST 'https://automationexercise.com/api/createAccount' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     --data 'name=QA%20Customer%20jf3bg9g4-1&email=%40hxf3bg760.mujf3bg9jpju1.example.com&password=<secret from test-data.json / .env>&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme%20QA&address1=12%20MG%20Road&address2=Block%20B&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000000'
   ```

Observed response of request 1 (SCN-007.2):

```json
{"responseCode":201,"message":"User created!"}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run AE-2 --label repro --grep "SCN-006:"
npm run heldout -- run AE-2 --label repro --grep "SCN-007\.1:"
npm run heldout -- run AE-2 --label repro --grep "SCN-007\.2:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/AE-2-tests-ae-2-AE-2-Custo-03816-refused-and-creates-nothing-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/AE-2/runs/03-eval/artifacts/AE-2-tests-ae-2-AE-2-Custo-03816-refused-and-creates-nothing-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3, heldout api-probe --chain): evaluations/AE-2/runs/03-eval/confirm/case-and-email.md steps 5-8

**Evaluator's analysis:** AC-5 / contract §2.1: an e-mail that is not a valid address (the AC's own example: no '@') must be refused with responseCode 400 and no account created. Live, createAccount answered responseCode 201 'User created!' for 'x.example.com' (no @), 'x@' (no domain) and '@x.example.com' (no local part), and getUserDetailByEmail finds the no-@ account. SCN-007 rows are @needs-clarification (shapes beyond the AC's example).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

### APP-3 · SCN-013, SCN-014 · AC-7 — getUserDetailByEmail omits mobile_number from the user object

| | |
| --- | --- |
| Suggested severity | Major |
| Requirement AC-7 | The system shall return the customer's profile from getUserDetailByEmail with every field listed in the contract, holding the values given at registration, and shall never return the password; an unknown e-mail gives responseCode 404 "Account not found with this email, try another email!". |
| Requirement source | story.md#L36 (AC-7), account-api-contract.md §2.3 (field list) |
| Test type · layer | contract, functional · api |
| SCN-013: expected (requirement) → actual (AUT) | `[Array []]` → `["user.mobile_number is missing"]` |
| SCN-014: expected (requirement) → actual (AUT) | `"9800000000"` → `"undefined"` |
| Failing step | And the user object has the fields id, name, email, title, birth_day, birth_month, birth_year, first_name, last_name, company, address1, address2, country, state, city, zipcode, mobile_number |
| Evaluator classification | APPLICATION_DEFECT (reproduced live) |

#### How to reproduce

**Preconditions the test seeded** (tag `hxf3ese130`; recreate equivalent data before reproducing):

- customer (POST /api/createAccount): `{"email":"hxf3ese130.mujf3esfk5kk1@example.com","password":"***redacted***","name":"QA Customer jf3esfqj-1","form":{"name":"QA Customer jf3esfqj-1","email":"hxf…` · cleanup: done

**Manually (scenario steps):**

1. Given a customer exists with every registration field filled
2. When the partner calls getUserDetailByEmail with that e-mail
3. Then the responseCode is 200
4. And the user object has the fields id, name, email, title, birth_day, birth_month, birth_year, first_name, last_name, company, address1, address2, country, state, city, zipcode, mobile_number

**API pre-steps: SCN-013** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/createAccount → 200`

   ```bash
   curl -i -X POST 'https://automationexercise.com/api/createAccount' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     --data 'name=QA%20Customer%20jf3esfqj-1&email=hxf3ese130.mujf3esfk5kk1%40example.com&password=<secret from test-data.json / .env>&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme%20QA&address1=12%20MG%20Road&address2=Block%20B&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000000'
   ```

**Via the API: SCN-013** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /api/getUserDetailByEmail → 200` ⟵

   ```bash
   curl -i -X GET 'https://automationexercise.com/api/getUserDetailByEmail?email=hxf3ese130.mujf3esfk5kk1%40example.com'
   ```

Observed response of request 1 (SCN-013):

```json
{"responseCode":200,"user":{"id":2937263,"name":"QA Customer jf3esfqj-1","email":"hxf3ese130.mujf3esfk5kk1@example.com","title":"Mrs","birth_day":"12","birth_month":"March","birth_year":"1991","first_name":"Asha","last_name":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","state":"Karnataka","city":"Bengaluru","zipcode":"560001"}}
```

**API pre-steps: SCN-014** (preconditions the test established through the API; run these first, then substitute the ids and tokens they return):

P1. `POST /api/createAccount → 200`

   ```bash
   curl -i -X POST 'https://automationexercise.com/api/createAccount' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     --data 'name=QA%20Customer%20jf3esh56-1&email=hxf3esg120.mujf3eshkm8k1%40example.com&password=<secret from test-data.json / .env>&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme%20QA&address1=12%20MG%20Road&address2=Block%20B&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000000'
   ```

**Via the API: SCN-014** (the exact requests the test sent, in order; secrets replaced by placeholders). Request 1 (⟵) is the one that contradicts the requirement:

1. `GET /api/getUserDetailByEmail → 200` ⟵

   ```bash
   curl -i -X GET 'https://automationexercise.com/api/getUserDetailByEmail?email=hxf3esg120.mujf3eshkm8k1%40example.com'
   ```

Observed response of request 1 (SCN-014):

```json
{"responseCode":200,"user":{"id":2937264,"name":"QA Customer jf3esh56-1","email":"hxf3esg120.mujf3eshkm8k1@example.com","title":"Mrs","birth_day":"12","birth_month":"March","birth_year":"1991","first_name":"Asha","last_name":"Rao","company":"Acme QA","address1":"12 MG Road","address2":"Block B","country":"India","state":"Karnataka","city":"Bengaluru","zipcode":"560001"}}
```

**Automated re-run of the failing test(s):**

```bash
npm run heldout -- run AE-2 --label repro --grep "SCN-013:"
npm run heldout -- run AE-2 --label repro --grep "SCN-014:"
```

#### Evidence

- [Page/test context at failure](runs/03-eval/artifacts/AE-2-tests-ae-2-AE-2-Custo-e3e65-every-field-of-the-contract-chromium-retry1/error-context.md)
- Step-by-step trace: `npx playwright show-trace evaluations/AE-2/runs/03-eval/artifacts/AE-2-tests-ae-2-AE-2-Custo-e3e65-every-field-of-the-contract-chromium-retry1/trace.zip`
- Live re-check by the evaluator: Replayed live 2026-09-27 (tier 3, heldout api-probe --chain): evaluations/AE-2/runs/03-eval/confirm/case-and-email.md step 4 (user.mobile_number = undefined); evaluations/AE-2/hardening/api-lifecycle.md step 2 (full user object)

**Evaluator's analysis:** AC-7 / contract §2.3 list mobile_number among the user object's fields, holding the registration value. The account was created with mobile_number=9800000000 (required field, accepted with 201), but the returned user object has no mobile_number key; all other 16 fields are present. SCN-014's failure is the same root cause (value read as undefined).

**Reviewer decision:** ☐ Confirm as defect · ☐ Not a defect (explain) · ☐ Requirement needs clarification

## Script defects found and repaired (0)

_None confirmed with triage (other mechanics fixed during hardening are in the hardening log)._

## Test results

| Test | Title | Criteria | Type | Result | Classification |
| --- | --- | --- | --- | --- | --- |
| SCN-001 | The partner creates a customer with all required fields and a new e-mail | AC-1 | functional | ✅ passed | - |
| SCN-002 | createAccount answers with the documented response envelope | AC-1 | contract | ✅ passed | - |
| SCN-003 | A second account for an already registered e-mail is refused | AC-2 | negative | ✅ passed | - |
| SCN-004 | An e-mail that differs from a registered one only in letter case is refused | AC-3 | negative | ❌ failed | APPLICATION_DEFECT · APP-1 |
| SCN-005.1 | createAccount without a required field is refused and creates nothing (name) | AC-4 | negative | ✅ passed | - |
| SCN-005.2 | createAccount without a required field is refused and creates nothing (email) | AC-4 | negative | ✅ passed | - |
| SCN-005.3 | createAccount without a required field is refused and creates nothing (password) | AC-4 | negative | ✅ passed | - |
| SCN-005.4 | createAccount without a required field is refused and creates nothing (firstname) | AC-4 | negative | ✅ passed | - |
| SCN-005.5 | createAccount without a required field is refused and creates nothing (lastname) | AC-4 | negative | ✅ passed | - |
| SCN-005.6 | createAccount without a required field is refused and creates nothing (address1) | AC-4 | negative | ✅ passed | - |
| SCN-005.7 | createAccount without a required field is refused and creates nothing (country) | AC-4 | negative | ✅ passed | - |
| SCN-005.8 | createAccount without a required field is refused and creates nothing (zipcode) | AC-4 | negative | ✅ passed | - |
| SCN-005.9 | createAccount without a required field is refused and creates nothing (state) | AC-4 | negative | ✅ passed | - |
| SCN-005.10 | createAccount without a required field is refused and creates nothing (city) | AC-4 | negative | ✅ passed | - |
| SCN-005.11 | createAccount without a required field is refused and creates nothing (mobile_number) | AC-4 | negative | ✅ passed | - |
| SCN-006 | createAccount with an e-mail that has no "@" is refused and creates nothing | AC-5 | negative | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.1 | createAccount with an e-mail that has an "@" but is still invalid is refused and creates nothing (no domain after the "@") | AC-5 | boundary | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-007.2 | createAccount with an e-mail that has an "@" but is still invalid is refused and creates nothing (no local part before the "@") | AC-5 | boundary | ❌ failed | APPLICATION_DEFECT · APP-2 |
| SCN-008 | verifyLogin with a valid e-mail and password confirms the customer | AC-6 | functional | ✅ passed | - |
| SCN-009 | verifyLogin with a wrong password is refused | AC-6 | negative | ✅ passed | - |
| SCN-010 | verifyLogin with an unknown e-mail is refused | AC-6 | negative | ✅ passed | - |
| SCN-011.1 | verifyLogin without the email parameter is refused | AC-6 | negative | ✅ passed | - |
| SCN-011.2 | verifyLogin without the password parameter is refused | AC-6 | negative | ✅ passed | - |
| SCN-012 | verifyLogin called with the DELETE method is not supported | AC-6 | contract | ✅ passed | - |
| SCN-013 | getUserDetailByEmail returns a user object with every field of the contract | AC-7 | contract | ❌ failed | APPLICATION_DEFECT · APP-3 |
| SCN-014 | getUserDetailByEmail returns the registration values of the same-named fields | AC-7 | functional | ❌ failed | APPLICATION_DEFECT · APP-3 |
| SCN-015 | getUserDetailByEmail returns the registration values of the renamed fields | AC-7 | functional | ✅ passed | - |
| SCN-016 | getUserDetailByEmail never returns the password | AC-7 | security | ✅ passed | - |
| SCN-017 | getUserDetailByEmail for an unknown e-mail is refused | AC-7 | negative | ✅ passed | - |
| SCN-018 | updateAccount changes only the fields sent | AC-8 | functional | ✅ passed | - |
| SCN-019 | updateAccount with a wrong password is refused and changes nothing | AC-8 | negative | ✅ passed | - |
| SCN-020 | deleteAccount with the correct credentials closes the account | AC-9 | functional | ✅ passed | - |
| SCN-021 | deleteAccount with a wrong password is refused | AC-9 | negative | ✅ passed | - |
| SCN-022 | After a refused deleteAccount the account remains usable | AC-9 | negative | ✅ passed | - |
| SCN-023 | A customer created through the API signs in on the shop and sees their name | AC-10 | integration | ✅ passed | - |
| SCN-024 | After a name change through updateAccount the shop header shows the new name | AC-10 | integration | ✅ passed | - |
| SCN-025 | Shop sign-in with a wrong password is refused on the login page | AC-11 | negative | ✅ passed | - |
| SCN-026 | Shop sign-in for an account closed through deleteAccount is refused | AC-12 | negative | ✅ passed | - |

## Requirement coverage

| Criterion | Requirement | Tests | Result |
| --- | --- | --- | --- |
| AC-1 | The system shall create a customer account when the partner calls createAccount with all required fields and an e-mail address not yet registered, answering responseCode 201 with the message "User created!". | SCN-001, SCN-002 | ✅ met |
| AC-2 | The system shall refuse to create a second account for an e-mail address that is already registered, answering responseCode 400 with the message "Email already exists!". | SCN-003 | ✅ met |
| AC-3 | The system shall treat e-mail addresses case-insensitively for uniqueness: registering an address that differs from an existing account's address only in letter case shall be refused exactly as in AC-2. | SCN-004 | ❌ not met |
| AC-4 | The system shall refuse createAccount when any required field of the contract is missing, answering responseCode 400 with the message naming the missing parameter, and shall not create the account. | SCN-005 (11 tests) | ✅ met |
| AC-5 | The system shall refuse createAccount when the e-mail address is not a valid e-mail address (for example it has no "@"), answering responseCode 400, and shall not create the account. | SCN-006, SCN-007.1, SCN-007.2 | ❌ not met |
| AC-6 | The system shall answer verifyLogin as the contract states: valid e-mail and password give responseCode 200 "User exists!"; a wrong password or an unknown e-mail give responseCode 404 "User not found!"; a missing e-mail or password gives responseCode 400 "Bad request, email or password parameter is missing in POST request."; the DELETE method gives responseCode 405 "This request method is not supported.". | SCN-008, SCN-009, SCN-010, SCN-011.1, SCN-011.2, SCN-012 | ✅ met |
| AC-7 | The system shall return the customer's profile from getUserDetailByEmail with every field listed in the contract, holding the values given at registration, and shall never return the password; an unknown e-mail gives responseCode 404 "Account not found with this email, try another email!". | SCN-013, SCN-014, SCN-015, SCN-016, SCN-017 | ❌ not met |
| AC-8 | The system shall apply updateAccount as a partial update: with the correct e-mail and password, only the fields sent change (responseCode 200 "User updated!") and the change is visible through getUserDetailByEmail; with a wrong password the answer is responseCode 404 "Account not found!" and nothing changes. | SCN-018, SCN-019 | ✅ met |
| AC-9 | The system shall close the account on deleteAccount with the correct e-mail and password (responseCode 200 "Account deleted!"), after which verifyLogin and getUserDetailByEmail answer 404 for that e-mail; with a wrong password the answer is responseCode 404 "Account not found!" and the account remains usable. | SCN-020, SCN-021, SCN-022 | ✅ met |
| AC-10 | The system shall let a customer created through the API sign in on the shop's login page with the same e-mail and password; after sign-in the header shows "Logged in as <name>", where <name> is the account's current name (including a name changed through updateAccount). | SCN-023, SCN-024 | ✅ met |
| AC-11 | The system shall refuse shop sign-in with a wrong password, staying on the login page and showing "Your email or password is incorrect!". | SCN-025 | ✅ met |
| AC-12 | The system shall refuse shop sign-in for an account closed through deleteAccount, showing the same message as AC-11. | SCN-026 | ✅ met |

## Traceability matrix

Each row links an acceptance criterion to the requirement source it came from, the scenario that proves it, that scenario's test type and layer, the executed tests, the result and any defect. Every test carries `@AC-n` and `@type:<t>` tags (enforced by the preflight lint).

| Criterion | Source | Scenario | Type | Layer | Tests passed | Result | Defects |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AC-1** | story.md#L30 (AC-1), account-api-contract.md §2.1 | SCN-001 The partner creates a customer with all required fields and a new e-mail | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | account-api-contract.md §1.1 (R1), example §3 | SCN-002 createAccount answers with the documented response envelope | contract | api | 1/1 | ✅ meets requirement | - |
| **AC-2** | story.md#L31 (AC-2), account-api-contract.md §2.1 | SCN-003 A second account for an already registered e-mail is refused | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-3** | story.md#L32 (AC-3), account-api-contract.md §2.1 (email: compared case-insensitively) | SCN-004 An e-mail that differs from a registered one only in letter case is refused | negative | api | 0/1 | ❌ fails requirement | APP-1 |
| **AC-4** | story.md#L33 (AC-4), account-api-contract.md §2.1 (required fields, missing-field message) | SCN-005 createAccount without a required field is refused and creates nothing | negative | api | 11/11 | ✅ meets requirement | - |
| **AC-5** | story.md#L34 (AC-5: "for example it has no @"), account-api-contract.md §2.1 | SCN-006 createAccount with an e-mail that has no "@" is refused and creates nothing | negative | api | 0/1 | ❌ fails requirement | APP-2 |
| ↳ | story.md#L34 (AC-5: "not a valid e-mail address"), account-api-contract.md §2.1 (email: must be a valid e-mail address) | SCN-007 createAccount with an e-mail that has an "@" but is still invalid is refused and creates nothing | boundary | api | 0/2 | ❌ fails requirement | APP-2 |
| **AC-6** | story.md#L35 (AC-6), account-api-contract.md §2.2 | SCN-008 verifyLogin with a valid e-mail and password confirms the customer | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L35 (AC-6), account-api-contract.md §2.2 | SCN-009 verifyLogin with a wrong password is refused | negative | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L35 (AC-6), account-api-contract.md §2.2 | SCN-010 verifyLogin with an unknown e-mail is refused | negative | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L35 (AC-6), account-api-contract.md §2.2 | SCN-011 verifyLogin without the <missing> parameter is refused | negative | api | 2/2 | ✅ meets requirement | - |
| ↳ | story.md#L35 (AC-6), account-api-contract.md §2.2 (Method DELETE used on /verifyLogin) | SCN-012 verifyLogin called with the DELETE method is not supported | contract | api | 1/1 | ✅ meets requirement | - |
| **AC-7** | story.md#L36 (AC-7), account-api-contract.md §2.3 (field list) | SCN-013 getUserDetailByEmail returns a user object with every field of the contract | contract | api | 0/1 | ❌ fails requirement | APP-3 |
| ↳ | story.md#L36 (AC-7: "holding the values given at registration"), account-api-contract.md §2.1, §2.3 | SCN-014 getUserDetailByEmail returns the registration values of the same-named fields | functional | api | 0/1 | ❌ fails requirement | APP-3 |
| ↳ | story.md#L36 (AC-7), account-api-contract.md §2.3 ("some response names differ from the request names"); mapping per G3 | SCN-015 getUserDetailByEmail returns the registration values of the renamed fields | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L36 (AC-7: "shall never return the password"), account-api-contract.md §2.3 | SCN-016 getUserDetailByEmail never returns the password | security | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L36 (AC-7), account-api-contract.md §2.3 | SCN-017 getUserDetailByEmail for an unknown e-mail is refused | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-8** | story.md#L37 (AC-8), account-api-contract.md §2.4 (partial update) | SCN-018 updateAccount changes only the fields sent | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L37 (AC-8), account-api-contract.md §2.4 | SCN-019 updateAccount with a wrong password is refused and changes nothing | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-9** | story.md#L38 (AC-9), account-api-contract.md §2.5, §2.2, §2.3 | SCN-020 deleteAccount with the correct credentials closes the account | functional | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L38 (AC-9), account-api-contract.md §2.5 | SCN-021 deleteAccount with a wrong password is refused | negative | api | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L38 (AC-9: "the account remains usable"); reading per G4 | SCN-022 After a refused deleteAccount the account remains usable | negative | api | 1/1 | ✅ meets requirement | - |
| **AC-10** | story.md#L17, #L25, #L39 (AC-10), account-api-contract.md §2.1 (name shown in the shop header) | SCN-023 A customer created through the API signs in on the shop and sees their name | integration | e2e | 1/1 | ✅ meets requirement | - |
| ↳ | story.md#L39 (AC-10: "including a name changed through updateAccount") | SCN-024 After a name change through updateAccount the shop header shows the new name | integration | e2e | 1/1 | ✅ meets requirement | - |
| **AC-11** | story.md#L25, #L40 (AC-11) | SCN-025 Shop sign-in with a wrong password is refused on the login page | negative | e2e | 1/1 | ✅ meets requirement | - |
| **AC-12** | story.md#L17, #L41 (AC-12) | SCN-026 Shop sign-in for an account closed through deleteAccount is refused | negative | e2e | 1/1 | ✅ meets requirement | - |

## Coverage by test type

| Test type | Scenarios | Tests | Passed | Failed | Flaky | Defects |
| --- | --- | --- | --- | --- | --- | --- |
| boundary | 1 | 2 | 0 | 2 | 0 | APP-2 |
| contract | 3 | 3 | 2 | 1 | 0 | APP-3 |
| functional | 6 | 6 | 5 | 1 | 0 | APP-3 |
| integration | 2 | 2 | 2 | 0 | 0 | - |
| negative | 13 | 24 | 22 | 2 | 0 | APP-1, APP-2 |
| security | 1 | 1 | 1 | 0 | 0 | - |

## Requirement gaps, assumptions and open questions

**Elements the story did not state, and how they were filled** ([requirement-contract.md](requirement-contract.md)):

| Gap | Missing element | Kind | Affects | Resolution |
| --- | --- | --- | --- | --- |
| G1 | full request paths of the Account API endpoints: the contract gives the base URL https://automationexercise.com/api and paths relative to it | how to exercise | * | found elsewhere in the requirement: /api/createAccount, /api/verifyLogin, /api/getUserDetailByEmail, /api/updateAccount, /api/deleteAccount (base URL path /api + contract endpoint path) |
| G2 | UI mechanics of the shop sign-in: e-mail and password inputs and submit button of the "Login to your account" form, where the "Logged in as <name>" header text and the error message appear | how to exercise | AC-10, AC-11, AC-12 | discovered from the AUT (mechanics only): login form = locator('form') holding getByRole('button', { name: 'Login', exact: true }); inputs by placeholder 'Email Address' and 'Password' within it; 'Logged in as <name>' is text inside the page <header>; the sign-in error is text inside the login form |
| G3 | which registration request field each getUserDetailByEmail response field must hold: the contract says "some response names differ from the request names" but gives no mapping (request birth_date/firstname/lastname vs response birth_day/first_name/last_name); id has no registration value | expected behaviour | AC-7 | assumed: response fields correspond to the same-named request fields, and birth_day = birth_date, first_name = firstname, last_name = lastname; id is checked for presence only; optional fields not sent are checked for presence only |
| G4 | what "the account remains usable" means after a deleteAccount with a wrong password | expected behaviour | AC-9 | assumed: the account still exists and still accepts its credentials: verifyLogin with the correct e-mail and password gives responseCode 200 "User exists!" and getUserDetailByEmail gives responseCode 200 |
| G5 | the contract states error answers that no acceptance criterion covers: getUserDetailByEmail without email (400 "Bad request, email parameter is missing in GET request."), updateAccount without password (400 "Bad request, password parameter is missing in PUT request."), deleteAccount without email or password (400 "Bad request, <field> parameter is missing in DELETE request."). Are they in scope for this story? | expected behaviour |  | ❓ open |

**For the owner's information** (about things no acceptance criterion requires; they don't affect the verdict):

- ℹ️ G5 — the contract states error answers that no acceptance criterion covers: getUserDetailByEmail without email (400 "Bad request, email parameter is missing in GET request."), updateAccount without password (400 "Bad request, password parameter is missing in PUT request."), deleteAccount without email or password (400 "Bad request, <field> parameter is missing in DELETE request."). Are they in scope for this story?

**Scenarios needing clarification:**

- SCN-007: createAccount with an e-mail that has an "@" but is still invalid is refused and creates nothing

**Assumptions the evaluation made:**

- G3 — which registration request field each getUserDetailByEmail response field must hold: the contract says "some response names differ from the request names" but gives no mapping (request birth_date/firstname/lastname vs response birth_day/first_name/last_name); id has no registration value: response fields correspond to the same-named request fields, and birth_day = birth_date, first_name = firstname, last_name = lastname; id is checked for presence only; optional fields not sent are checked for presence only
- G4 — what "the account remains usable" means after a deleteAccount with a wrong password: the account still exists and still accepts its credentials: verifyLogin with the correct e-mail and password gives responseCode 200 "User exists!" and getUserDetailByEmail gives responseCode 200
- Every API outcome is asserted on the body's responseCode and message (R1). The HTTP-200 envelope itself is asserted once (SCN-002), so an envelope deviation is one finding, not one per scenario.
- Test customers are created through POST /api/createAccount (the story's only data source) with a unique lower-case e-mail and the AE_USER_PASSWORD password, and closed through DELETE /api/deleteAccount in cleanup. Scenarios that seed that way depend on SCN-001.
- "The account is not created" (AC-4, AC-5) is observed as getUserDetailByEmail answering 404 for the address; for the AC-4 row without an e-mail there is no address to look up, so only the refusal is asserted.
- A "wrong password" is the customer's password with extra characters appended; an "unknown e-mail" is a unique address that was never registered.

Full review: [requirement-review.md](requirement-review.md)

## How this verdict was produced

1. The requirement and its attachments were fetched from Jira and reviewed ([requirement-review.md](requirement-review.md) when present), then converted into Gherkin scenarios (`scenarios.feature`). Each scenario is tagged with the acceptance criteria it proves, and API endpoints are declared.
2. Playwright TypeScript tests (UI and API) were written from the scenarios **only**, with no access to the AUT source or developer tests. Expected values were copied verbatim from the requirement.
3. The draft was frozen, then hardened against the live AUT: locators, waits, navigation and API plumbing only. Expected outcomes were never aligned with AUT behaviour (integrity check above).
4. Preflight gates (traceability lint and an AUT healthcheck) passed before the run. Every failure was triaged automatically, then re-investigated live before being classified as an application defect.
5. No script defect needed repairing after hardening. This verdict reflects the final run.

| Run | Passed | Failed | Flaky |
| --- | --- | --- | --- |
| `01-harden` (hardening dry-run) | 32 | 6 | 0 |
| `02-harden` (hardening dry-run) | 96 | 18 | 0 |
| `03-eval` (final) | 32 | 6 | 0 |

## Artifacts

- Requirement: [requirement/story.md](requirement/story.md)
- Requirement review: [requirement-review.md](requirement-review.md)
- Scenarios: [scenarios.feature](scenarios.feature)
- Tests: [tests/](tests/) · frozen draft: [draft/](draft/)
- Hardening log: [hardening/hardening-log.md](hardening/hardening-log.md)
- Triage: [runs/03-eval/triage.md](runs/03-eval/triage.md) · JUnit: runs/03-eval/junit.xml
- HTML report: `npx playwright show-report evaluations/AE-2/runs/03-eval/html`
