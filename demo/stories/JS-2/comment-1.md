Author: Dana Ortiz (Product Owner)

Clarifying the password rules for AC-1 and AC-3, since the description just said "rule-compliant":

- The password must be **at least 5 characters** long (and at most 40). Anything shorter than 5 characters
  must be rejected at registration — the account should not be created.
- Treat the password as case-sensitive and store it hashed (not our concern to test here beyond that a
  too-short password is refused).

So for AC-3, a 3- or 4-character password is a clear reject case. The `JS_USER_PASSWORD` value the tests use
is well above the minimum, so the happy-path AC-1 should not be affected.
