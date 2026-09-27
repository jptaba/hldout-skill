# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-404\tests\demo-404.spec.ts >> DEMO-404 Practice portal — sign-in and interactive widgets >> SCN-002.2: Wrong credentials are refused with a specific message (the trainee with a wrong password)
- Location: evaluations\DEMO-404\tests\demo-404.spec.ts:89:5

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Fork me on GitHub":
      - /url: https://github.com/tourdedave/the-internet
      - img "Fork me on GitHub" [ref=e3] [cursor=pointer]
    - generic [ref=e5]:
      - heading "Login Page" [level=2] [ref=e6]
      - heading [level=4] [ref=e7]:
        - text: This is where you can log into the secure area. Enter
        - emphasis [ref=e8]: tomsmith
        - text: for the username and
        - emphasis [ref=e9]: password
        - text: for the password. If the information is wrong you should see error messages.
      - generic [ref=e10]:
        - generic [ref=e12]:
          - text: Username
          - textbox "Username" [ref=e13]
        - generic [ref=e15]:
          - text: Password
          - textbox "Password" [ref=e16]
        - button " Login" [ref=e17]
  - generic [ref=e20]:
    - separator [ref=e21]
    - generic [ref=e22]:
      - text: Powered by
      - link "Elemental Selenium" [ref=e23] [cursor=pointer]:
        - /url: http://elementalselenium.com/
```