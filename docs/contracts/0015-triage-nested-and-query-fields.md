# Contract 0015 — Automatic triage reads nested and query-string request fields

## Inputs
- Round 38, PB-2: the contract declares a bill payment's fields as `accountId`, `amount` (query parameters) and a
  payee object (`name`, `address.street`, `address.city`, …). The automatic triage's field check read only a body's
  top-level keys, so 14 conforming bill payment calls were classed SCRIPT_DEFECT ("sends an undeclared 'address',
  lacks 'address.street'"); the triager corrected each one and noted the tool gap.

## Outputs
- `triage/classify.ts`, the declared-field check: what a request sent is every path into its body (objects
  included: `address`, `address.street`) and every query parameter. A body path is declared when it is a declared
  field, an object on the way to one (a plain value there is not), or inside one; an undeclared object is named once.
  A query parameter fills a declared field; one the contract doesn't list counts only when it looks like a missing
  field renamed (contracts name query parameters in prose). The check still runs only on a JSON-object body.

## Proof
- `tests/classify.test.ts`: a request with nested and query fields as declared is not a script defect; a renamed
  object (`adress`) still is, named once; a renamed query parameter is caught, an undeclared one in a negative test
  is not; a plain value where an object is declared is caught; a field declared flat may be sent as an object.
- The project's proof steps (`agentctl verify --contract docs/contracts/0015-triage-nested-and-query-fields.md`).

## Done when
- PB-2's bill payment calls would no longer be classed SCRIPT_DEFECT by the field check.

## Bad result looks like
- A renamed or missing field the old check caught going unflagged; any other classification changed.
