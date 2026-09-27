# Tier-2 walk (Playwright MCP over stdio)

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) — https://automationexercise.com
- Server: `npx -y @playwright/mcp@latest --isolated --output-dir C:\Users\Jptaba\AppData\Local\Temp\heldout-mcp-wIxaMS --headless` · 2026-09-27T12:13:35.060Z
- Result: ✔ all steps passed

| # | Step | OK | Detail |
| --- | --- | --- | --- |
| 1 | browser_navigate contact_us | ✔ | `await page.goto('https://automationexercise.com/contact_us');` |
| 2 | browser_wait_for | ✔ | `await page.getByText("Get In Touch").first().waitFor({ state: 'visible' });` |
| 3 | browser_type textbox "Email" | ✔ | `await page.getByRole('textbox', { name: 'Email', exact: true }).fill('qa.t2send.1790511209@example.com');` |
| 4 | browser_click button "Submit" | ✔ | `await page.getByRole('button', { name: 'Submit' }).click();` |
| 5 | browser_handle_dialog | ✔ | ok |
| 6 | browser_wait_for | ✔ | `await page.getByText("Success! Your details have been submitted successfully.").first().waitFor({ state: 'visible' });` |
| 7 | browser_network_requests | ✔ | ok |
| 8 | snapshot "after OK" | ✔ | 97 lines |

### Snapshot: after OK

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e5]:
      - link [ref=e8] [cursor=pointer]:
        - /url: /
        - img "Website for automation practice" [ref=e9]
      - list [ref=e12]:
        - listitem [ref=e13]:
          - link " Home" [ref=e14] [cursor=pointer]:
            - /url: /
            - generic [ref=e15]: 
            - text: Home
        - listitem [ref=e16]:
          - link " Products" [ref=e17] [cursor=pointer]:
            - /url: /products
            - generic [ref=e18]: 
            - text: Products
        - listitem [ref=e19]:
          - link " Cart" [ref=e20] [cursor=pointer]:
            - /url: /view_cart
            - generic [ref=e21]: 
            - text: Cart
        - listitem [ref=e22]:
          - link " Signup / Login" [ref=e23] [cursor=pointer]:
            - /url: /login
            - generic [ref=e24]: 
            - text: Signup / Login
        - listitem [ref=e25]:
          - link " Test Cases" [ref=e26] [cursor=pointer]:
            - /url: /test_cases
            - generic [ref=e27]: 
            - text: Test Cases
        - listitem [ref=e28]:
          - link " API Testing" [ref=e29] [cursor=pointer]:
            - /url: /api_list
            - generic [ref=e30]: 
            - text: API Testing
        - listitem [ref=e31]:
          - link " Video Tutorials" [ref=e32] [cursor=pointer]:
            - /url: https://www.youtube.com/c/AutomationExercise
            - generic [ref=e33]: 
            - text: Video Tutorials
        - listitem [ref=e34]:
          - link " Contact us" [ref=e35] [cursor=pointer]:
            - /url: /contact_us
            - generic [ref=e36]: 
            - text: Contact us
  - generic [ref=e37]:
    - heading [level=2] [ref=e41]:
      - text: Contact
      - strong [ref=e42]: Us
    - generic [ref=e43]:
      - generic [ref=e45]:
        - generic [ref=e46]:
          - text: "Note: Below contact form is for testing purpose."
          - link "Test case management" [ref=e47] [cursor=pointer]
        - heading "Get In Touch" [level=2] [ref=e51]
        - generic [ref=e97]: Success! Your details have been submitted successfully.
        - link " Home" [ref=e98] [cursor=pointer]:
          - /url: /
          - generic [ref=e99]:
            - generic [ref=e100]: 
            - text: Home
      - generic [ref=e67]:
        - heading "Feedback For Us" [level=2] [ref=e68]
        - generic [ref=e69]:
          - paragraph [ref=e70]: We really appreciate your response to our website.
          - paragraph [ref=e71]:
            - text: Kindly share your feedback with us at
            - link "feedback@automationexercise.com" [ref=e72] [cursor=pointer]:
              - /url: mailto:feedback@automationexercise.com
            - text: .
          - paragraph [ref=e73]: If you have any suggestion areas or improvements, do let us know. We will definitely work on it.
          - paragraph [ref=e74]: Thank you
  - contentinfo [ref=e75]:
    - insertion [ref=e77]:
      - generic [ref=e102]:
        - heading "These are topics related to the article that might interest you" [level=2] [ref=e104]: Discover more
        - link "Learn Coding Online" [ref=e105] [cursor=pointer]
        - link "Website automation tutorials" [ref=e110] [cursor=pointer]
        - link "API test automation" [ref=e115] [cursor=pointer]
    - generic [ref=e83]:
      - heading "Subscription" [level=2] [ref=e84]
      - generic [ref=e85]:
        - textbox "Your email address" [ref=e86]
        - button "" [ref=e87] [cursor=pointer]
        - paragraph [ref=e89]: Get the most recent updates from our site and be updated your self...
    - generic [ref=e90]:
      - insertion [ref=e92]:
        - generic [ref=e121]:
          - heading "These are topics related to the article that might interest you" [level=2] [ref=e123]: Discover more
          - link "Install Firewall Software" [ref=e124] [cursor=pointer]
          - link "Test case examples" [ref=e129] [cursor=pointer]
          - link "Switch Broadband Providers" [ref=e134] [cursor=pointer]
      - paragraph [ref=e96]: Copyright © 2021 All rights reserved
  - text: 
```
