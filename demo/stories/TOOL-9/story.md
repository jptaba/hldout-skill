# TOOL-9: Customer questions, from the contact form to an answer

As a customer I want to ask the shop a question and follow the answer in my account, so that I don't have to phone. Support staff answer from the admin area. Web shop and API both: the mobile app will use the same endpoints.

- A signed-in customer sends a question from the contact form: a subject from the list and a message of at least 50 characters. Shorter messages are refused. A new question starts with the status NEW.
- The customer finds the question under "Messages" in their account, newest first, and can open it to read the whole conversation.
- An administrator sees all questions and can answer one. The answer appears in the customer's conversation, and the question moves to IN_PROGRESS.
- The customer can write back in the same conversation.
- An administrator can mark a question RESOLVED. Only administrators change the status.
- Questions are private: another customer must not be able to read or answer them, and visitors who are not signed in see nothing.

API: POST /messages, GET /messages, GET /messages/{id}, POST /messages/{id}/reply, PUT /messages/{id}/status. Out of scope: e-mail notifications, attachments, and questions from visitors who aren't signed in.
