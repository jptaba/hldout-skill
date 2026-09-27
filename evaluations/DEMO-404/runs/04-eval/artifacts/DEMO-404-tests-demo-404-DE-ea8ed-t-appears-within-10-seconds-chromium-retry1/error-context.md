# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-404\tests\demo-404.spec.ts >> DEMO-404 Practice portal — sign-in and interactive widgets >> SCN-007: Dynamically loaded content appears within 10 seconds
- Location: evaluations\DEMO-404\tests\demo-404.spec.ts:144:3

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
      - heading "Dynamically Loaded Page Elements" [level=3] [ref=e6]
      - 'heading "Example 2: Element rendered after the fact" [level=4] [ref=e7]'
      - button "Start" [ref=e9]
  - generic [ref=e11]:
    - separator [ref=e12]
    - generic [ref=e13]:
      - text: Powered by
      - link "Elemental Selenium" [ref=e14] [cursor=pointer]:
        - /url: http://elementalselenium.com/
```