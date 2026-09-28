# API chain — evaluations/CL-3/hardening/chain-contact.json

- AUT: Contact List App (profile `thinking-tester-contact-list`) · https://thinking-tester-contact-list.herokuapp.com/ · captured 2026-09-28T19:12:06.209Z

1. **sign up** — `POST /users` body `{"firstName":"QA","lastName":"Heldout","email":"qa-probe-lmje4hn3s@example.com","password":"***redacted***"}` → **201** ✔ (399 ms)
   `user.email` = `"qa-probe-lmje4hn3s@example.com"`
2. **add a contact** — `POST /contacts` body `{"firstName":"Jane","lastName":"Doe","birthdate":"1985-07-14","email":"jane.doe@example.com","phone":"8005551234","street1":"1 Main St.","street2":"Apartment A","city":"Anytown","stateProvince":"KS","` → **201** ✔ (221 ms)
   `{"_id":"6ababc06d80def00157da6a3","firstName":"Jane","lastName":"Doe","birthdate":"1985-07-14","email":"jane.doe@example.com","phone":"8005551234","street1":"1 Main St.","street2":"Apartment A","city":"Anytown","stateProvince":"KS","postalCode":"12345","country":"USA","owner":"6ababc06d80def00157da6`

All expectations held.
