# AUT inspection (tier 3 — bundled inspector)

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — https://automationexercise.com
- URL: https://automationexercise.com/contact_us
- Title: Automation Exercise - Contact Us
- Captured: 2026-09-27T12:09:31.774Z
- testIdAttribute: `data-qa`

## Visible interactive / test-id elements (best unique locator)

| role | accessible name | test id | type | suggested locator |
| --- | --- | --- | --- | --- |
| link | - | - | - | `(no stable locator)` |
| link | Home | - | - | `getByRole('link', { name: 'Home', exact: true }) ⚠ matches 0` |
| link |  Products | - | - | `getByRole('link', { name: ' Products', exact: true })` |
| link | Cart | - | - | `getByRole('link', { name: 'Cart', exact: true }) ⚠ matches 0` |
| link | Signup / Login | - | - | `getByRole('link', { name: 'Signup / Login', exact: true }) ⚠ matches 0` |
| link | Test Cases | - | - | `getByRole('link', { name: 'Test Cases', exact: true }) ⚠ matches 0` |
| link | API Testing | - | - | `getByRole('link', { name: 'API Testing', exact: true }) ⚠ matches 0` |
| link | Video Tutorials | - | - | `getByRole('link', { name: 'Video Tutorials', exact: true }) ⚠ matches 0` |
| link | Contact us | - | - | `getByRole('link', { name: 'Contact us', exact: true }) ⚠ matches 0` |
| heading | Contact Us | - | - | `getByRole('heading', { name: 'Contact Us', exact: true })` |
| heading | Get In Touch | - | - | `getByRole('heading', { name: 'Get In Touch', exact: true })` |
| textbox | Name | name | text | `getByRole('textbox', { name: 'Name', exact: true })` |
| textbox | Email | email | email | `getByRole('textbox', { name: 'Email', exact: true })` |
| textbox | Subject | subject | text | `getByRole('textbox', { name: 'Subject', exact: true })` |
| textbox | Your Message Here | message | - | `getByRole('textbox', { name: 'Your Message Here', exact: true })` |
| input | - | - | file | `(no stable locator)` |
| button | Submit | submit-button | submit | `getByRole('button', { name: 'Submit', exact: true })` |
| heading | Feedback For Us | - | - | `getByRole('heading', { name: 'Feedback For Us', exact: true })` |
| link | feedback@automationexercise.com | - | - | `getByRole('link', { name: 'feedback@automationexercise.com', exact: true })` |
| heading | Subscription | - | - | `getByRole('heading', { name: 'Subscription', exact: true })` |
| textbox | Your email address | - | email | `getByRole('textbox', { name: 'Your email address', exact: true })` |
| button | - | - | submit | `locator('#subscribe')` |

## Locator probes

| expression | count | visible | text / value |
| --- | --- | --- | --- |
| `locator('#contact-page').getByText('Success! Your details have been submitted successfully.')` | 0 ✖ | false |  |
| `locator('#contact-page').getByRole('link', { name: 'Home' })` | 0 ✖ | false |  |
| `getByRole('heading', { name: 'Get In Touch', exact: true })` | 1 ✔ | true | GET IN TOUCH |
| `getByPlaceholder('Name', { exact: true })` | 1 ✔ | true |  |
| `getByPlaceholder('Email', { exact: true })` | 1 ✔ | true |  |
| `getByPlaceholder('Subject', { exact: true })` | 1 ✔ | true |  |
| `getByPlaceholder('Your Message Here', { exact: true })` | 1 ✔ | true |  |
| `getByRole('button', { name: 'Submit' })` | 1 ✔ | true | Submit |
