# Tier-2 walk (Playwright MCP over stdio)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- Server: `npx -y @playwright/mcp@latest --isolated --output-dir C:\Users\Jptaba\AppData\Local\Temp\heldout-mcp-XNaFWE --headless` · 2026-09-27T12:14:30.462Z
- Result: ✔ all steps passed

| # | Step | OK | Detail |
| --- | --- | --- | --- |
| 1 | browser_navigate books | ✔ | `await page.goto('https://demoqa.com/books');` |
| 2 | browser_wait_for | ✔ | `await page.getByText("Git Pocket Guide").first().waitFor({ state: 'visible' });` |
| 3 | snapshot "books page" | ✔ | 112 lines |
| 4 | browser_type textbox "Type to search" | ✔ | `await page.getByRole('textbox', { name: 'Type to search' }).fill('zakas');` |
| 5 | snapshot "after zakas" | ✔ | 56 lines |
| 6 | browser_click link "Understanding ECMAScript 6" | ✔ | `await page.getByRole('link', { name: 'Understanding ECMAScript' }).click();` |
| 7 | browser_wait_for | ✔ | `await page.getByText("ISBN").first().waitFor({ state: 'visible' });` |
| 8 | snapshot "detail page" | ✔ | 58 lines |

### Snapshot: books page

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link [ref=e115] [cursor=pointer]:
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
    - generic [ref=e117]:
      - generic [ref=e118]:
        - generic [ref=e120]:
          - textbox "Type to search" [ref=e121]
          - button [ref=e122] [cursor=pointer]
        - button "Login" [ref=e126] [cursor=pointer]
      - generic [ref=e127]:
        - table [ref=e128]:
          - rowgroup [ref=e129]:
            - row [ref=e130]:
              - columnheader "Image" [ref=e131]
              - columnheader "Title" [ref=e133] [cursor=pointer]
              - columnheader "Author" [ref=e135] [cursor=pointer]
              - columnheader "Publisher" [ref=e137] [cursor=pointer]
          - rowgroup [ref=e139]:
            - row [ref=e140]:
              - cell [ref=e141]:
                - img "book-image" [ref=e142]
              - cell [ref=e143]:
                - link "Git Pocket Guide" [ref=e146] [cursor=pointer]:
                  - /url: /books?search=9781449325862
              - cell "Richard E. Silverman" [ref=e147]
              - cell "O'Reilly Media" [ref=e148]
            - row [ref=e149]:
              - cell [ref=e150]:
                - img "book-image" [ref=e151]
              - cell [ref=e152]:
                - link "Learning JavaScript Design Patterns" [ref=e155] [cursor=pointer]:
                  - /url: /books?search=9781449331818
              - cell "Addy Osmani" [ref=e156]
              - cell "O'Reilly Media" [ref=e157]
            - row [ref=e158]:
              - cell [ref=e159]:
                - img "book-image" [ref=e160]
              - cell [ref=e161]:
                - link "Designing Evolvable Web APIs with ASP.NET" [ref=e164] [cursor=pointer]:
                  - /url: /books?search=9781449337711
              - cell "Glenn Block et al." [ref=e165]
              - cell "O'Reilly Media" [ref=e166]
            - row [ref=e167]:
              - cell [ref=e168]:
                - img "book-image" [ref=e169]
              - cell [ref=e170]:
                - link "Speaking JavaScript" [ref=e173] [cursor=pointer]:
                  - /url: /books?search=9781449365035
              - cell "Axel Rauschmayer" [ref=e174]
              - cell "O'Reilly Media" [ref=e175]
            - row [ref=e176]:
              - cell [ref=e177]:
                - img "book-image" [ref=e178]
              - cell [ref=e179]:
                - link "You Don't Know JS" [ref=e182] [cursor=pointer]:
                  - /url: /books?search=9781491904244
              - cell "Kyle Simpson" [ref=e183]
              - cell "O'Reilly Media" [ref=e184]
            - row [ref=e185]:
              - cell [ref=e186]:
                - img "book-image" [ref=e187]
              - cell [ref=e188]:
                - link "Programming JavaScript Applications" [ref=e191] [cursor=pointer]:
                  - /url: /books?search=9781491950296
              - cell "Eric Elliott" [ref=e192]
              - cell "O'Reilly Media" [ref=e193]
            - row [ref=e194]:
              - cell [ref=e195]:
                - img "book-image" [ref=e196]
              - cell [ref=e197]:
                - link "Eloquent JavaScript, Second Edition" [ref=e200] [cursor=pointer]:
                  - /url: /books?search=9781593275846
              - cell "Marijn Haverbeke" [ref=e201]
              - cell "No Starch Press" [ref=e202]
            - row [ref=e203]:
              - cell [ref=e204]:
                - img "book-image" [ref=e205]
              - cell [ref=e206]:
                - link "Understanding ECMAScript 6" [ref=e209] [cursor=pointer]:
                  - /url: /books?search=9781593277574
              - cell "Nicholas C. Zakas" [ref=e210]
              - cell "No Starch Press" [ref=e211]
        - generic [ref=e213]:
          - button "Previous" [disabled]
          - generic [ref=e214]: Page 1 of 1
          - button "Next" [disabled]
  - contentinfo [ref=e113]:
    - generic [ref=e114]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
### Snapshot: after zakas

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link [ref=e115] [cursor=pointer]:
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
    - generic [ref=e117]:
      - generic [ref=e118]:
        - generic [ref=e120]:
          - textbox "Type to search" [active] [ref=e121]: zakas
          - button [ref=e122] [cursor=pointer]
        - button "Login" [ref=e126] [cursor=pointer]
      - generic [ref=e127]:
        - table [ref=e128]:
          - rowgroup [ref=e129]:
            - row [ref=e130]:
              - columnheader "Image" [ref=e131]
              - columnheader "Title" [ref=e133] [cursor=pointer]
              - columnheader "Author" [ref=e135] [cursor=pointer]
              - columnheader "Publisher" [ref=e137] [cursor=pointer]
          - rowgroup [ref=e139]:
            - row [ref=e215]:
              - cell [ref=e141]:
                - img "book-image" [ref=e142]
              - cell [ref=e216]:
                - link "Understanding ECMAScript 6" [ref=e217] [cursor=pointer]:
                  - /url: /books?search=9781593277574
              - cell "Nicholas C. Zakas" [ref=e218]
              - cell "No Starch Press" [ref=e219]
        - generic [ref=e213]:
          - button "Previous" [disabled]
          - generic [ref=e214]: Page 1 of 1
          - button "Next" [disabled]
  - contentinfo [ref=e113]:
    - generic [ref=e114]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
### Snapshot: detail page

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link [ref=e115] [cursor=pointer]:
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
    - generic [ref=e220]:
      - heading "Book Store" [level=1] [ref=e221]
      - button "Login" [ref=e224] [cursor=pointer]
      - generic [ref=e225]:
        - generic [ref=e226]:
          - generic [ref=e227]: "ISBN:"
          - generic [ref=e229]: "9781593277574"
        - generic [ref=e231]:
          - generic [ref=e232]: "Title :"
          - generic [ref=e234]: Understanding ECMAScript 6
        - generic [ref=e236]:
          - generic [ref=e237]: "Sub Title :"
          - generic [ref=e239]: The Definitive Guide for JavaScript Developers
        - generic [ref=e241]:
          - generic [ref=e242]: "Author :"
          - generic [ref=e244]: Nicholas C. Zakas
        - generic [ref=e246]:
          - generic [ref=e247]: "Publisher :"
          - generic [ref=e249]: No Starch Press
        - generic [ref=e251]:
          - generic [ref=e252]: "Total Pages :"
          - generic [ref=e254]: "352"
        - generic [ref=e256]:
          - generic [ref=e257]: "Description :"
          - generic [ref=e259]: ECMAScript 6 represents the biggest update to the core of JavaScript in the history of the language. In Understanding ECMAScript 6, expert developer Nicholas C. Zakas provides a complete guide to the object types, syntax, and other exciting changes that E
        - generic [ref=e261]:
          - generic [ref=e262]: "Website :"
          - generic [ref=e264]: https://leanpub.com/understandinges6/read
        - button "Back To Book Store" [ref=e268] [cursor=pointer]
  - contentinfo [ref=e113]:
    - generic [ref=e114]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
