# Contact messages and their follow-up by customer service

As a visitor or customer I want to send the shop a question and, with an account, follow what happens to it. As an administrator I want to answer incoming messages and record how far each has been handled.

**Sending.** Visitors who are not signed in fill in first name, last name, e-mail address, a subject and the message. Signed-in customers only choose the subject and type the message, because we already know who they are. The subjects are Customer service, Webmaster, Return, Payments, Warranty and Status of my order. A message may be up to 255 characters. After sending, the page says "Thanks for your message! We will contact you shortly." Every new message starts with status NEW.

**Following up.** Signed-in customers find the messages they sent under My messages in their account, with the status of each and, when they open one, the replies from customer service.

**Handling.** Administrators see all messages under Messages in the admin area. They open a message, reply to it and move it through the statuses NEW, IN_PROGRESS and RESOLVED.

API: POST /messages (no sign-in needed), GET /messages, GET /messages/{id}, POST /messages/{id}/reply, PUT /messages/{id}/status.
