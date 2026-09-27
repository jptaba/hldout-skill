# Tier-2 walk (Playwright MCP over stdio)

- AUT: The Internet (UI test playground) (profile `the-internet`) — https://the-internet.herokuapp.com
- Server: `npx -y @playwright/mcp@latest --isolated --headless` · 2026-09-26T18:25:38.427Z
- Result: ✔ all steps passed

| # | Step | OK | Detail |
| --- | --- | --- | --- |
| 1 | browser_navigate login | ✔ | ```js |
| 2 | expect textbox "Username" | ✔ | found as [ref=e16] |
| 3 | expect textbox "Password" | ✔ | found as [ref=e20] |
| 4 | browser_type textbox "Username" | ✔ | ```js |
| 5 | browser_type textbox "Password" | ✔ | ```js |
| 6 | browser_click button "Login" | ✔ | ```js |
| 7 | expect heading "Secure Area" | ✔ | found as [ref=f1e10] |
| 8 | expect text "You logged into a secure area!" | ✔ | present in snapshot |
| 9 | expect absent alert | ✔ | not in the accessibility snapshot |
| 10 | browser_click link "Logout" | ✔ | ```js |
| 11 | expect text "You logged out of the secure area!" | ✔ | present in snapshot |
| 12 | snapshot "after logout" | ✔ | 32 lines |

### Snapshot: after logout

```yaml
- generic [active] [ref=f2e1]:
  - generic [ref=f2e4]:
    - text:  You logged out of the secure area!
    - link "×" [ref=f2e5] [cursor=pointer]:
      - /url: "#"
  - generic [ref=f2e6]:
    - link "Fork me on GitHub":
      - /url: https://github.com/tourdedave/the-internet
      - img "Fork me on GitHub" [ref=f2e7] [cursor=pointer]
    - generic [ref=f2e9]:
      - heading "Login Page" [level=2] [ref=f2e10]
      - heading [level=4] [ref=f2e11]:
        - text: This is where you can log into the secure area. Enter
        - emphasis [ref=f2e12]: tomsmith
        - text: for the username and
        - emphasis [ref=f2e13]: password
        - text: for the password. If the information is wrong you should see error messages.
      - generic [ref=f2e14]:
        - generic [ref=f2e16]:
          - generic [ref=f2e17] [cursor=pointer]: Username
          - textbox "Username" [ref=f2e18]
        - generic [ref=f2e20]:
          - generic [ref=f2e21] [cursor=pointer]: Password
          - textbox "Password" [ref=f2e22]
        - button " Login" [ref=f2e23] [cursor=pointer]
  - generic [ref=f2e26]:
    - separator [ref=f2e27]
    - generic [ref=f2e28]:
      - text: Powered by
      - link "Elemental Selenium" [ref=f2e29] [cursor=pointer]:
        - /url: http://elementalselenium.com/
```
