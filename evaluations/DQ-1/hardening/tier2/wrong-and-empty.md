# Tier-2 walk (Playwright MCP over stdio)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- Server: `npx -y @playwright/mcp@latest --isolated --output-dir C:\Users\Jptaba\AppData\Local\Temp\heldout-mcp-CK1n5t --headless` · 2026-09-27T05:49:13.636Z
- Result: ✔ all steps passed

| # | Step | OK | Detail |
| --- | --- | --- | --- |
| 1 | browser_navigate login | ✔ | `await page.goto('https://demoqa.com/login');` |
| 2 | browser_wait_for | ✔ | `await page.getByText("Login in Book Store").first().waitFor({ state: 'visible' });` |
| 3 | browser_click button "Login" | ✔ | `await page.getByRole('button', { name: 'Login' }).click();` |
| 4 | snapshot "after empty Login click" | ✔ | 44 lines |
| 5 | browser_type textbox "UserName" | ✔ | `await page.getByRole('textbox', { name: 'UserName' }).fill('qa-dq1-harden-1790487968');` |
| 6 | browser_type textbox "Password" | ✔ | `await page.getByRole('textbox', { name: 'Password' }).fill('Wrong-qa-dq1-harden-1790487968-9#');` |
| 7 | browser_click button "Login" | ✔ | `await page.getByRole('button', { name: 'Login' }).click();` |
| 8 | browser_wait_for | ✔ | `await page.getByText("Invalid username or password!").first().waitFor({ state: 'visible' });` |
| 9 | snapshot "after wrong password" | ✔ | 45 lines |

### Snapshot: after empty Login click

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
    - generic [ref=e103]:
      - heading "Login" [level=1] [ref=e104]
      - generic [ref=e105]:
        - generic [ref=e106]:
          - heading "Welcome," [level=2] [ref=e107]
          - heading "Login in Book Store" [level=5] [ref=e108]
        - generic [ref=e109]:
          - generic [ref=e110]: "UserName :"
          - textbox "UserName" [ref=e113]
        - generic [ref=e114]:
          - generic [ref=e115]: "Password :"
          - textbox "Password" [ref=e118]
        - generic [ref=e119]:
          - button "Login" [active] [ref=e121] [cursor=pointer]
          - button "New User" [ref=e123] [cursor=pointer]
  - contentinfo [ref=e130]:
    - generic [ref=e131]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
### Snapshot: after wrong password

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
    - generic [ref=e134]:
      - heading "Login" [level=1] [ref=e135]
      - generic [ref=e136]:
        - generic [ref=e137]:
          - heading "Welcome," [level=2] [ref=e138]
          - heading "Login in Book Store" [level=5] [ref=e139]
        - generic [ref=e140]:
          - generic [ref=e141]: "UserName :"
          - textbox "UserName" [ref=e144]: ***redacted***
        - generic [ref=e145]:
          - generic [ref=e146]: "Password :"
          - textbox "Password" [ref=e149]: ***redacted***
        - generic [ref=e150]:
          - button "Login" [ref=e152] [cursor=pointer]
          - button "New User" [ref=e154] [cursor=pointer]
        - paragraph [ref=e157]: Invalid username or password!
  - contentinfo [ref=e130]:
    - generic [ref=e131]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
