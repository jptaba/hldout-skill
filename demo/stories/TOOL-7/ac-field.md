1. After signing in on the web shop, a customer lands on "My account" (/account) and an administrator lands on the admin dashboard (/admin/dashboard). A guest who opens /account is sent to the sign-in page.
2. GET /users/me returns the signed-in user's own profile, with their own email address. A guest gets 401.
3. The user list GET /users is for administrators only: an administrator gets 200, a customer 403 and a guest 401.
4. GET /invoices lists only the caller's own invoices for a customer, and the invoices of every customer for an administrator. A guest gets 401.
5. Reading one invoice that belongs to another customer, GET /invoices/{invoiceId}, is refused with 403 for a customer. An administrator can read it (200). A guest gets 401.
6. The catalogue is the same for every user type: GET /products?by_category={categoryId} returns only products of that category. Data sets: the categories Hammer, Hand Saw and Wrench.
