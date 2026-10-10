# TOOL-7: Account area and invoices for every user type

As the shop owner I want each kind of visitor to see exactly what they are allowed to see in the account area and the invoices, so that no customer ever sees another customer's data.

**Validate every acceptance criterion for each user type:**

| User type | Who |
| --- | --- |
| Guest | not signed in |
| Customer | a signed-in customer account |
| Administrator | a signed-in administrator account |

Where a criterion names data sets, validate it for every data set as well, for each user type. Every criterion states what each user type must get.

The account API takes a bearer token from `POST /users/login` (`{ "email", "password" }` → `access_token`) in the `Authorization: Bearer <token>` header.
