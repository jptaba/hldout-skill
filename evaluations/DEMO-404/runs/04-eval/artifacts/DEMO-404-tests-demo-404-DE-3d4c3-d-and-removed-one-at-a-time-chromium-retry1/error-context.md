# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-404\tests\demo-404.spec.ts >> DEMO-404 Practice portal — sign-in and interactive widgets >> SCN-010: Elements are added and removed one at a time
- Location: evaluations\DEMO-404\tests\demo-404.spec.ts:175:3

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
    - generic [ref=e4]:
      - heading "Add/Remove Elements" [level=3] [ref=e5]
      - generic [ref=e6]:
        - button "Add Element" [ref=e7]
        - separator [ref=e8]
  - generic [ref=e10]:
    - separator [ref=e11]
    - generic [ref=e12]:
      - text: Powered by
      - link "Elemental Selenium" [ref=e13] [cursor=pointer]:
        - /url: http://elementalselenium.com/
```