# Tier-2 walk (Playwright MCP over stdio)

- AUT: The Internet (UI test playground) (profile `the-internet`) — https://the-internet.herokuapp.com
- Server: `npx -y @playwright/mcp@latest --isolated --headless` · 2026-09-26T18:26:56.559Z
- Result: ✔ all steps passed

| # | Step | OK | Detail |
| --- | --- | --- | --- |
| 1 | browser_navigate checkboxes | ✔ | `await page.goto('https://the-internet.herokuapp.com/checkboxes');` |
| 2 | browser_click checkbox "" | ✔ | `await page.getByRole('checkbox').first().click();` |
| 3 | snapshot "checkboxes after clicking the first" | ✔ | 19 lines |
| 4 | browser_navigate dropdown | ✔ | `await page.goto('https://the-internet.herokuapp.com/dropdown');` |
| 5 | browser_select_option combobox | ✔ | `await page.locator('#dropdown').selectOption('Option 2');` |
| 6 | expect option "Option 2" | ✔ | found: - option "Option 2" [selected] |
| 7 | browser_navigate dynamic_loading/2 | ✔ | `await page.goto('https://the-internet.herokuapp.com/dynamic_loading/2');` |
| 8 | browser_click button "Start" | ✔ | `await page.getByRole('button', { name: 'Start' }).click();` |
| 9 | browser_wait_for | ✔ | `await page.getByText("Hello World!").first().waitFor({ state: 'visible' });` |
| 10 | expect text "Hello World!" | ✔ | present in snapshot |
| 11 | browser_navigate javascript_alerts | ✔ | `await page.goto('https://the-internet.herokuapp.com/javascript_alerts');` |
| 12 | browser_click button "Click for JS Prompt" | ✔ | `await page.getByRole('button', { name: 'Click for JS Prompt' }).click();` |
| 13 | browser_handle_dialog | ✔ | ok |
| 14 | expect text "You entered: held out" | ✔ | present in snapshot |
| 15 | browser_navigate tables | ✔ | `await page.goto('https://the-internet.herokuapp.com/tables');` |
| 16 | browser_click columnheader "Last Name" | ✔ | `await page.locator('#table1').getByRole('columnheader', { name: 'Last Name' }).click();` |
| 17 | snapshot "table after one click on Last Name" | ✔ | 127 lines |
| 18 | browser_navigate key_presses | ✔ | `await page.goto('https://the-internet.herokuapp.com/key_presses');` |
| 19 | browser_click textbox | ✔ | `await page.locator('#target').click();` |
| 20 | browser_press_key | ✔ | `// Press A ; await page.keyboard.press('A');` |
| 21 | expect text "You entered: A" | ✔ | present in snapshot |

### Snapshot: checkboxes after clicking the first

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - link "Fork me on GitHub":
      - /url: https://github.com/tourdedave/the-internet
      - img "Fork me on GitHub" [ref=e5] [cursor=pointer]
    - generic [ref=e7]:
      - heading "Checkboxes" [level=3] [ref=e8]
      - generic [ref=e9]:
        - checkbox [checked] [active] [ref=e10]
        - text: checkbox 1
        - checkbox [checked] [ref=e11]
        - text: checkbox 2
  - generic [ref=e13]:
    - separator [ref=e14]
    - generic [ref=e15]:
      - text: Powered by
      - link "Elemental Selenium" [ref=e16] [cursor=pointer]:
        - /url: http://elementalselenium.com/
```
### Snapshot: table after one click on Last Name

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e4]:
    - link "Fork me on GitHub":
      - /url: https://github.com/tourdedave/the-internet
      - img "Fork me on GitHub" [ref=f4e5] [cursor=pointer]
    - generic [ref=f4e7]:
      - heading "Data Tables" [level=3] [ref=f4e8]
      - paragraph [ref=f4e9]: Often times when you see a table it contains data which is sortable -- sometimes with actions that can be taken within each row (e.g. edit, delete). And it can be challenging to automate interaction with sets of data in a table depending on how it is constructed.
      - heading "Example 1" [level=4] [ref=f4e10]
      - paragraph [ref=f4e11]: No Class or ID attributes to signify groupings of rows and columns
      - table [ref=f4e12]:
        - rowgroup [ref=f4e13]:
          - row [ref=f4e14]:
            - columnheader "Last Name" [ref=f4e15]
            - columnheader "First Name" [ref=f4e16]
            - columnheader "Email" [ref=f4e17]
            - columnheader "Due" [ref=f4e18]
            - columnheader "Web Site" [ref=f4e19]
            - columnheader "Action" [ref=f4e20]
        - rowgroup [ref=f4e21]:
          - row [ref=f4e31]:
            - cell "Bach" [ref=f4e32]
            - cell "Frank" [ref=f4e33]
            - cell "fbach@yahoo.com" [ref=f4e34]
            - cell "$51.00" [ref=f4e35]
            - cell "http://www.frank.com" [ref=f4e36]
            - cell [ref=f4e37]:
              - link "edit" [ref=f4e38] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=f4e39] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=f4e49]:
            - cell "Conway" [ref=f4e50]
            - cell "Tim" [ref=f4e51]
            - cell "tconway@earthlink.net" [ref=f4e52]
            - cell "$50.00" [ref=f4e53]
            - cell "http://www.timconway.com" [ref=f4e54]
            - cell [ref=f4e55]:
              - link "edit" [ref=f4e56] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=f4e57] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=f4e40]:
            - cell "Doe" [ref=f4e41]
            - cell "Jason" [ref=f4e42]
            - cell "jdoe@hotmail.com" [ref=f4e43]
            - cell "$100.00" [ref=f4e44]
            - cell "http://www.jdoe.com" [ref=f4e45]
            - cell [ref=f4e46]:
              - link "edit" [ref=f4e47] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=f4e48] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=f4e22]:
            - cell "Smith" [ref=f4e23]
            - cell "John" [ref=f4e24]
            - cell "jsmith@gmail.com" [ref=f4e25]
            - cell "$50.00" [ref=f4e26]
            - cell "http://www.jsmith.com" [ref=f4e27]
            - cell [ref=f4e28]:
              - link "edit" [ref=f4e29] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=f4e30] [cursor=pointer]:
                - /url: "#delete"
      - heading "Example 2" [level=4] [ref=f4e58]
      - paragraph [ref=f4e59]: Class and ID attributes to signify groupings of rows and columns
      - table [ref=f4e60]:
        - rowgroup [ref=f4e61]:
          - row [ref=f4e62]:
            - columnheader "Last Name" [ref=f4e63]
            - columnheader "First Name" [ref=f4e64]
            - columnheader "Email" [ref=f4e65]
            - columnheader "Due" [ref=f4e66]
            - columnheader "Web Site" [ref=f4e67]
            - columnheader "Action" [ref=f4e68]
        - rowgroup [ref=f4e69]:
          - row [ref=f4e70]:
            - cell "Smith" [ref=f4e71]
            - cell "John" [ref=f4e72]
            - cell "jsmith@gmail.com" [ref=f4e73]
            - cell "$50.00" [ref=f4e74]
            - cell "http://www.jsmith.com" [ref=f4e75]
            - cell [ref=f4e76]:
              - link "edit" [ref=f4e77] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=f4e78] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=f4e79]:
            - cell "Bach" [ref=f4e80]
            - cell "Frank" [ref=f4e81]
            - cell "fbach@yahoo.com" [ref=f4e82]
            - cell "$51.00" [ref=f4e83]
            - cell "http://www.frank.com" [ref=f4e84]
            - cell [ref=f4e85]:
              - link "edit" [ref=f4e86] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=f4e87] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=f4e88]:
            - cell "Doe" [ref=f4e89]
            - cell "Jason" [ref=f4e90]
            - cell "jdoe@hotmail.com" [ref=f4e91]
            - cell "$100.00" [ref=f4e92]
            - cell "http://www.jdoe.com" [ref=f4e93]
            - cell [ref=f4e94]:
              - link "edit" [ref=f4e95] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=f4e96] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=f4e97]:
            - cell "Conway" [ref=f4e98]
            - cell "Tim" [ref=f4e99]
            - cell "tconway@earthlink.net" [ref=f4e100]
            - cell "$50.00" [ref=f4e101]
            - cell "http://www.timconway.com" [ref=f4e102]
            - cell [ref=f4e103]:
              - link "edit" [ref=f4e104] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=f4e105] [cursor=pointer]:
                - /url: "#delete"
  - generic [ref=f4e107]:
    - separator [ref=f4e108]
    - generic [ref=f4e109]:
      - text: Powered by
      - link "Elemental Selenium" [ref=f4e110] [cursor=pointer]:
        - /url: http://elementalselenium.com/
```
