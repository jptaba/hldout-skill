# Tier-2 walk (Playwright MCP over stdio)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- Server: `npx -y @playwright/mcp@latest --isolated --output-dir C:\Users\Jptaba\AppData\Local\Temp\heldout-mcp-V0fyf6 --headless` · 2026-09-27T05:49:01.422Z
- Result: ✔ all steps passed

| # | Step | OK | Detail |
| --- | --- | --- | --- |
| 1 | browser_navigate login | ✔ | `await page.goto('https://demoqa.com/login');` |
| 2 | browser_wait_for | ✔ | `await page.getByText("Login in Book Store").first().waitFor({ state: 'visible' });` |
| 3 | browser_type textbox "UserName" | ✔ | `await page.getByRole('textbox', { name: 'UserName' }).fill('qa-dq1-harden-1790487968');` |
| 4 | browser_type textbox "Password" | ✔ | `await page.getByRole('textbox', { name: 'Password' }).fill('***redacted***');` |
| 5 | browser_click button "Login" | ✔ | `await page.getByRole('button', { name: 'Login' }).click();` |
| 6 | browser_wait_for | ✔ | `await page.getByText("User Name :").first().waitFor({ state: 'visible' });` |
| 7 | snapshot "profile after sign-in" | ✔ | 57 lines |
| 8 | browser_click button "Logout" | ✔ | `await page.getByRole('button', { name: 'Logout' }).click();` |
| 9 | browser_wait_for | ✔ | `await page.getByText("Login in Book Store").first().waitFor({ state: 'visible' });` |
| 10 | snapshot "after logout" | ✔ | 44 lines |
| 11 | browser_navigate profile | ✔ | `await page.goto('https://demoqa.com/profile');` |
| 12 | browser_wait_for | ✔ | `await page.getByText("Currently you are not logged into").first().waitFor({ state: 'visible' });` |
| 13 | snapshot "profile after logout" | ✔ | 37 lines |

### Snapshot: profile after sign-in

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link [ref=e132] [cursor=pointer]:
      - /url: https://demoqa.com
  - generic [ref=e6]:
    - generic [ref=e9]:
      - generic [ref=e10]: Elements
      - generic [ref=e22]: Forms
      - generic [ref=e35]: Alerts, Frame & Windows
      - generic [ref=e47]: Widgets
      - generic [ref=e60]: Interactions
      - generic [ref=e72]:
        - generic [ref=e73] [cursor=pointer]: Book Store Application
        - list [ref=e85]:
          - listitem [ref=e86] [cursor=pointer]:
            - link "Login" [ref=e87]:
              - /url: /login
          - listitem [ref=e90] [cursor=pointer]:
            - link "Book Store" [ref=e91]:
              - /url: /books
          - listitem [ref=e94] [cursor=pointer]:
            - link "Profile" [ref=e95]:
              - /url: /profile
          - listitem [ref=e98] [cursor=pointer]:
            - link "Book Store API" [ref=e99]:
              - /url: /swagger
    - generic [ref=e138]:
      - generic [ref=e139]:
        - generic [ref=e140]: "Books :"
        - generic [ref=e142]:
          - generic [ref=e143]: "User Name :"
          - generic [ref=e144]: ***redacted***
          - button "Logout" [ref=e145] [cursor=pointer]
        - generic [ref=e147]:
          - textbox "Type to search" [ref=e148]
          - button [ref=e149] [cursor=pointer]
      - generic [ref=e152]:
        - table [ref=e153]:
          - rowgroup [ref=e154]:
            - row [ref=e155]:
              - columnheader "Image" [ref=e156]
              - columnheader "Title" [ref=e158] [cursor=pointer]
              - columnheader "Author" [ref=e160] [cursor=pointer]
              - columnheader "Publisher" [ref=e162] [cursor=pointer]
              - columnheader "Action" [ref=e164]
          - rowgroup
        - generic [ref=e167]:
          - button "Previous" [disabled]
          - generic [ref=e168]: Page 1 of 0
          - button "Next" [disabled]
      - generic [ref=e169]:
        - button "Go To Book Store" [ref=e171] [cursor=pointer]
        - button "Delete Account" [ref=e173] [cursor=pointer]
        - button "Delete All Books" [ref=e175] [cursor=pointer]
  - contentinfo [ref=e130]:
    - generic [ref=e131]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
### Snapshot: after logout

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link [ref=e132] [cursor=pointer]:
      - /url: https://demoqa.com
  - generic [ref=e6]:
    - generic [ref=e9]:
      - generic [ref=e10]: Elements
      - generic [ref=e22]: Forms
      - generic [ref=e35]: Alerts, Frame & Windows
      - generic [ref=e47]: Widgets
      - generic [ref=e60]: Interactions
      - generic [ref=e72]:
        - generic [ref=e73] [cursor=pointer]: Book Store Application
        - list [ref=e85]:
          - listitem [ref=e86] [cursor=pointer]:
            - link "Login" [ref=e87]:
              - /url: /login
          - listitem [ref=e90] [cursor=pointer]:
            - link "Book Store" [ref=e91]:
              - /url: /books
          - listitem [ref=e94] [cursor=pointer]:
            - link "Profile" [ref=e95]:
              - /url: /profile
          - listitem [ref=e98] [cursor=pointer]:
            - link "Book Store API" [ref=e99]:
              - /url: /swagger
    - generic [ref=e176]:
      - heading "Login" [level=1] [ref=e177]
      - generic [ref=e178]:
        - generic [ref=e179]:
          - heading "Welcome," [level=2] [ref=e180]
          - heading "Login in Book Store" [level=5] [ref=e181]
        - generic [ref=e182]:
          - generic [ref=e183]: "UserName :"
          - textbox "UserName" [ref=e186]
        - generic [ref=e187]:
          - generic [ref=e188]: "Password :"
          - textbox "Password" [ref=e191]
        - generic [ref=e192]:
          - button "Login" [ref=e194] [cursor=pointer]
          - button "New User" [ref=e196] [cursor=pointer]
  - contentinfo [ref=e130]:
    - generic [ref=e131]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
### Snapshot: profile after logout

```yaml
- generic [ref=f8e2]:
  - banner [ref=f8e3]:
    - link [ref=f8e4] [cursor=pointer]:
      - /url: https://demoqa.com
  - generic [ref=f8e8]:
    - generic [ref=f8e11]:
      - generic [ref=f8e12]: Elements
      - generic [ref=f8e24]: Forms
      - generic [ref=f8e37]: Alerts, Frame & Windows
      - generic [ref=f8e49]: Widgets
      - generic [ref=f8e62]: Interactions
      - generic [ref=f8e74]:
        - generic [ref=f8e75] [cursor=pointer]: Book Store Application
        - list [ref=f8e87]:
          - listitem [ref=f8e88] [cursor=pointer]:
            - link "Login" [ref=f8e89]:
              - /url: /login
          - listitem [ref=f8e92] [cursor=pointer]:
            - link "Book Store" [ref=f8e93]:
              - /url: /books
          - listitem [ref=f8e96] [cursor=pointer]:
            - link "Profile" [ref=f8e97]:
              - /url: /profile
          - listitem [ref=f8e100] [cursor=pointer]:
            - link "Book Store API" [ref=f8e101]:
              - /url: /swagger
    - generic [ref=f8e108]:
      - text: Currently you are not logged into the Book Store application, please visit the
      - link "login" [ref=f8e109] [cursor=pointer]:
        - /url: /login
      - text: page to enter or
      - link "register" [ref=f8e110] [cursor=pointer]:
        - /url: /register
      - text: page to register yourself.
  - contentinfo [ref=f8e117]:
    - generic [ref=f8e118]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
