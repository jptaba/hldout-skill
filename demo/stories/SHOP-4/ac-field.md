Acceptance Criteria

1. Sending a message with POST /messages (a subject and a message, plus name and email when not signed in) answers 200 with the stored message, its id and status "NEW".
2. A message without a subject is refused with 422 and `{"subject": ["The subject field is required."]}`; without a message text with `{"message": ["The message field is required."]}`; an e-mail address that is not valid with "The email field must be a valid email address.".
3. A message text of 250 characters is accepted; a longer one is refused with "The message field must not be greater than 250 characters.".
4. GET /messages for a signed-in customer lists only the messages that customer sent, newest first, 15 per page; for an administrator it lists all messages. Without signing in the list is refused with 401 and "Unauthorized".
5. An administrator's reply (POST /messages/{id}/reply with a message) answers 201. The message's status becomes IN_PROGRESS, and the reply is shown with the message: in the `replies` of GET /messages/{id} and on the customer's My messages.
6. An administrator changes the status with PUT /messages/{id}/status and one of NEW, IN_PROGRESS or RESOLVED, and gets `{"success": true}`. From then on the message shows the new status, in the admin area and on the customer's My messages. Any other status is refused with 422 and "The selected status is invalid.".
7. In the admin message detail the status list only offers statuses that come after the current one.
