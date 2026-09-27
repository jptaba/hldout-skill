Author: Maya Lindqvist (Product Owner)

Clarification on AC-6 after the security review with the platform team: a refused token request has to be recognisable at the HTTP level too, not only from the body. So `POST /Account/v1/GenerateToken` with a wrong password (or an unknown user name) must answer **401 Unauthorized**; the body stays as described in AC-6 (`token`/`expires` null, `status` "Failed", `result` "User authorization failed.").

This applies to GenerateToken only - AC-8 (Authorized) stays as written.

Reminder: the registration form on the web site is not part of this story, accounts for sign-in are always created through the API.
