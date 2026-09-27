# Tier-2 walk (Playwright MCP over stdio)

- AUT: DemoQA Book Store (React UI + JSON API) (profile `demoqa`) — https://demoqa.com
- Server: `npx -y @playwright/mcp@latest --isolated --output-dir C:\Users\Jptaba\AppData\Local\Temp\heldout-mcp-msRjk9 --headless` · 2026-09-27T12:30:20.290Z
- Result: ✖ 1 step(s) failed

| # | Step | OK | Detail |
| --- | --- | --- | --- |
| 1 | browser_navigate links | ✔ | `await page.goto('https://demoqa.com/links');` |
| 2 | browser_wait_for | ✔ | `await page.getByText("Following links will send an api call").first().waitFor({ state: 'visible' });` |
| 3 | snapshot "initial" | ✔ | 77 lines |
| 4 | browser_click link "Forbidden" | ✔ | `await page.getByRole('link', { name: 'Forbidden' }).click();` |
| 5 | browser_wait_for | ✔ | `await page.getByText("Link has responded").first().waitFor({ state: 'visible' });` |
| 6 | snapshot "after-forbidden" | ✔ | 78 lines |
| 7 | browser_click link "Moved" | ✔ | `await page.getByRole('link', { name: 'Moved' }).click();` |
| 8 | browser_wait_for | ✖ | ### Error TimeoutError: Timeout 5000ms exceeded. Call log: [2m  - waiting for getByText('status 301').first() to be visible[22m  |
| 9 | snapshot "after-moved" | ✔ | 78 lines |
| 10 | browser_network_requests | ✔ | ok |

### Snapshot: initial

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link:
      - /url: https://demoqa.com
  - generic [ref=e6]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11] [cursor=pointer]: Elements
        - list [ref=e23]:
          - listitem [ref=e24] [cursor=pointer]:
            - link "Text Box" [ref=e25]:
              - /url: /text-box
          - listitem [ref=e28] [cursor=pointer]:
            - link "Check Box" [ref=e29]:
              - /url: /checkbox
          - listitem [ref=e32] [cursor=pointer]:
            - link "Radio Button" [ref=e33]:
              - /url: /radio-button
          - listitem [ref=e36] [cursor=pointer]:
            - link "Web Tables" [ref=e37]:
              - /url: /webtables
          - listitem [ref=e40] [cursor=pointer]:
            - link "Buttons" [ref=e41]:
              - /url: /buttons
          - listitem [ref=e44] [cursor=pointer]:
            - link "Links" [ref=e45]:
              - /url: /links
          - listitem [ref=e48] [cursor=pointer]:
            - link "Broken Links - Images" [ref=e49]:
              - /url: /broken
          - listitem [ref=e52] [cursor=pointer]:
            - link "Upload and Download" [ref=e53]:
              - /url: /upload-download
          - listitem [ref=e56] [cursor=pointer]:
            - link "Dynamic Properties" [ref=e57]:
              - /url: /dynamic-properties
      - generic [ref=e60]: Forms
      - generic [ref=e73]: Alerts, Frame & Windows
      - generic [ref=e85]: Widgets
      - generic [ref=e98]: Interactions
      - generic [ref=e110]: Book Store Application
    - generic [ref=e123]:
      - heading "Links" [level=1] [ref=e124]
      - heading [level=5] [ref=e125]:
        - strong [ref=e126]: Following links will open new tab
      - paragraph [ref=e127]:
        - link "Home" [ref=e128] [cursor=pointer]:
          - /url: https://demoqa.com
      - paragraph [ref=e129]:
        - link "Home6k28V" [ref=e130] [cursor=pointer]:
          - /url: https://demoqa.com
      - heading [level=5] [ref=e131]:
        - strong [ref=e132]: Following links will send an api call
      - paragraph [ref=e133]:
        - link "Created" [ref=e134] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e135]:
        - link "No Content" [ref=e136] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e137]:
        - link "Moved" [ref=e138] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e139]:
        - link "Bad Request" [ref=e140] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e141]:
        - link "Unauthorized" [ref=e142] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e143]:
        - link "Forbidden" [ref=e144] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e145]:
        - link "Not Found" [ref=e146] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
  - contentinfo [ref=e153]:
    - generic [ref=e154]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
### Snapshot: after-forbidden

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link [ref=e155] [cursor=pointer]:
      - /url: https://demoqa.com
  - generic [ref=e6]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11] [cursor=pointer]: Elements
        - list [ref=e23]:
          - listitem [ref=e24] [cursor=pointer]:
            - link "Text Box" [ref=e25]:
              - /url: /text-box
          - listitem [ref=e28] [cursor=pointer]:
            - link "Check Box" [ref=e29]:
              - /url: /checkbox
          - listitem [ref=e32] [cursor=pointer]:
            - link "Radio Button" [ref=e33]:
              - /url: /radio-button
          - listitem [ref=e36] [cursor=pointer]:
            - link "Web Tables" [ref=e37]:
              - /url: /webtables
          - listitem [ref=e40] [cursor=pointer]:
            - link "Buttons" [ref=e41]:
              - /url: /buttons
          - listitem [ref=e44] [cursor=pointer]:
            - link "Links" [ref=e45]:
              - /url: /links
          - listitem [ref=e48] [cursor=pointer]:
            - link "Broken Links - Images" [ref=e49]:
              - /url: /broken
          - listitem [ref=e52] [cursor=pointer]:
            - link "Upload and Download" [ref=e53]:
              - /url: /upload-download
          - listitem [ref=e56] [cursor=pointer]:
            - link "Dynamic Properties" [ref=e57]:
              - /url: /dynamic-properties
      - generic [ref=e60]: Forms
      - generic [ref=e73]: Alerts, Frame & Windows
      - generic [ref=e85]: Widgets
      - generic [ref=e98]: Interactions
      - generic [ref=e110]: Book Store Application
    - generic [ref=e123]:
      - heading "Links" [level=1] [ref=e124]
      - heading [level=5] [ref=e125]:
        - strong [ref=e126]: Following links will open new tab
      - paragraph [ref=e127]:
        - link "Home" [ref=e128] [cursor=pointer]:
          - /url: https://demoqa.com
      - paragraph [ref=e129]:
        - link "Home6k28V" [ref=e130] [cursor=pointer]:
          - /url: https://demoqa.com
      - heading [level=5] [ref=e131]:
        - strong [ref=e132]: Following links will send an api call
      - paragraph [ref=e133]:
        - link "Created" [ref=e134] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e135]:
        - link "No Content" [ref=e136] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e137]:
        - link "Moved" [ref=e138] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e139]:
        - link "Bad Request" [ref=e140] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e141]:
        - link "Unauthorized" [ref=e142] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e143]:
        - link "Forbidden" [active] [ref=e144] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e145]:
        - link "Not Found" [ref=e146] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e157]: Link has responded with staus 403 and status text Forbidden
  - contentinfo [ref=e153]:
    - generic [ref=e154]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
### Snapshot: after-moved

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link [ref=e155] [cursor=pointer]:
      - /url: https://demoqa.com
  - generic [ref=e6]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11] [cursor=pointer]: Elements
        - list [ref=e23]:
          - listitem [ref=e24] [cursor=pointer]:
            - link "Text Box" [ref=e25]:
              - /url: /text-box
          - listitem [ref=e28] [cursor=pointer]:
            - link "Check Box" [ref=e29]:
              - /url: /checkbox
          - listitem [ref=e32] [cursor=pointer]:
            - link "Radio Button" [ref=e33]:
              - /url: /radio-button
          - listitem [ref=e36] [cursor=pointer]:
            - link "Web Tables" [ref=e37]:
              - /url: /webtables
          - listitem [ref=e40] [cursor=pointer]:
            - link "Buttons" [ref=e41]:
              - /url: /buttons
          - listitem [ref=e44] [cursor=pointer]:
            - link "Links" [ref=e45]:
              - /url: /links
          - listitem [ref=e48] [cursor=pointer]:
            - link "Broken Links - Images" [ref=e49]:
              - /url: /broken
          - listitem [ref=e52] [cursor=pointer]:
            - link "Upload and Download" [ref=e53]:
              - /url: /upload-download
          - listitem [ref=e56] [cursor=pointer]:
            - link "Dynamic Properties" [ref=e57]:
              - /url: /dynamic-properties
      - generic [ref=e60]: Forms
      - generic [ref=e73]: Alerts, Frame & Windows
      - generic [ref=e85]: Widgets
      - generic [ref=e98]: Interactions
      - generic [ref=e110]: Book Store Application
    - generic [ref=e123]:
      - heading "Links" [level=1] [ref=e124]
      - heading [level=5] [ref=e125]:
        - strong [ref=e126]: Following links will open new tab
      - paragraph [ref=e127]:
        - link "Home" [ref=e128] [cursor=pointer]:
          - /url: https://demoqa.com
      - paragraph [ref=e129]:
        - link "Home6k28V" [ref=e130] [cursor=pointer]:
          - /url: https://demoqa.com
      - heading [level=5] [ref=e131]:
        - strong [ref=e132]: Following links will send an api call
      - paragraph [ref=e133]:
        - link "Created" [ref=e134] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e135]:
        - link "No Content" [ref=e136] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e137]:
        - link "Moved" [active] [ref=e138] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e139]:
        - link "Bad Request" [ref=e140] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e141]:
        - link "Unauthorized" [ref=e142] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e143]:
        - link "Forbidden" [ref=e144] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e145]:
        - link "Not Found" [ref=e146] [cursor=pointer]:
          - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      - paragraph [ref=e157]: Link has responded with staus 301 and status text Moved Permanently
  - contentinfo [ref=e153]:
    - generic [ref=e154]: © 2013-2026 TOOLSQA.COM | ALL RIGHTS RESERVED.
```
### Step 10: browser_network_requests

```text
### Result
9. [GET] https://demoqa.com/forbidden => [403] Forbidden
13. [GET] https://ep1.adtrafficquality.google/getconfig/sodar?sv=200&tid=gpt&tv=m202609180101&st=env&sjk=4868504373407258 => [200] 
20. [GET] https://securepubads.g.doubleclick.net/gampad/ads?pvsid=4868504373407258&correlator=4411431595917879&eid=122881118%2C122881143&output=ldjh&gdfp_req=1&vrg=202609180101&ptt=17&impl=fifs&iu_parts=21849154601%3A22343295815%2CAd.Plus-300x250-2&enc_prev_ius=%2F0%2F1&prev_iu_szs=300x250%7C250x250&ifi=1&dids=Ad.Plus-300x250-2&adfs=4276440510&sfv=1-0-45&sc=1&cookie_enabled=1&abxe=1&dt=1790512208138&lmt=1771756431&adxs=981&adys=189&biw=1280&bih=720&scr_x=0&scr_y=0&btvi=0&ucis=1&oid=2&u_his=2&u_h=720&u_w=1280&u_ah=720&u_aw=1280&u_cd=24&u_sd=1&u_tz=-240&dmc=32&bc=31&nvt=1&uach=WyJXaW5kb3dzIiwiMTkuMC4wIiwieDg2IiwiIiwiMTUzLjAuODAxMC41NCIsbnVsbCwwLG51bGwsIjY0IixbWyJHb29nbGUgQ2hyb21lIiwiMTUzLjAuODAxMC41NCJdLFsiTm90X0EgQnJhbmQiLCI4LjAuMC4wIl0sWyJDaHJvbWl1bSIsIjE1My4wLjgwMTAuNTQiXV0sMF0.&uas=3&url=https%3A%2F%2Fdemoqa.com%2Flinks&vis=1&psz=259x50&msz=259x0&fws=0&ohw=0&a3p=EhkKCnB1YmNpZC5vcmcY_7Hglo40SABSAghkEhwKDWNyd2RjbnRybC5uZXQY_7Hglo40SABSAghkEhQKBW9wZW54GP-x4JaONEgAUgIIZBIbCgxpZDUtc3luYy5jb20Y_7Hglo40SABSAghkEh0KDmVzcC5jcml0ZW8uY29tGP-x4JaONEgAUgIIZBIXCghydGJob3VzZRj_seCWjjRIAFICCGQ.&dlt=1790512206026&idt=2050&cust_params=site%3Ddemoqa.com&adks=14561083&frm=20&cpu=4&eoidce=1&pgls=CAk. => [200] 
21. [GET] https://securepubads.g.doubleclick.net/gampad/ads?pvsid=4868504373407258&correlator=4411431595917879&eid=122881118%2C122881143&output=ldjh&gdfp_req=1&vrg=202609180101&ptt=17&impl=fifs&iu_parts=21849154601%3A22343295815%2CAd.Plus-970x250-2&enc_prev_ius=%2F0%2F1&prev_iu_szs=970x250%7C970x90%7C960x90%7C950x90%7C930x180&ifi=2&dids=Ad.Plus-970x250-2&adfs=1761184483&sfv=1-0-45&sc=1&cookie_enabled=1&abxe=1&dt=1790512208144&lmt=1771756431&adxs=235&adys=722&biw=1280&bih=720&scr_x=0&scr_y=0&btvi=1&ucis=2&oid=2&u_his=2&u_h=720&u_w=1280&u_ah=720&u_aw=1280&u_cd=24&u_sd=1&u_tz=-240&dmc=32&bc=31&nvt=1&uach=WyJXaW5kb3dzIiwiMTkuMC4wIiwieDg2IiwiIiwiMTUzLjAuODAxMC41NCIsbnVsbCwwLG51bGwsIjY0IixbWyJHb29nbGUgQ2hyb21lIiwiMTUzLjAuODAxMC41NCJdLFsiTm90X0EgQnJhbmQiLCI4LjAuMC4wIl0sWyJDaHJvbWl1bSIsIjE1My4wLjgwMTAuNTQiXV0sMF0.&uas=3&url=https%3A%2F%2Fdemoqa.com%2Flinks&vis=1&psz=707x52&msz=705x0&fws=0&ohw=0&a3p=EhkKCnB1YmNpZC5vcmcY_7Hglo40SABSAghkEhwKDWNyd2RjbnRybC5uZXQY_7Hglo40SABSAghkEhQKBW9wZW54GP-x4JaONEgAUgIIZBIbCgxpZDUtc3luYy5jb20Y_7Hglo40SABSAghkEh0KDmVzcC5jcml0ZW8uY29tGP-x4JaONEgAUgIIZBIXCghydGJob3VzZRj_seCWjjRIAFICCGQ.&dlt=1790512206026&idt=2050&cust_params=site%3Ddemoqa.com&adks=4035069602&frm=20&cpu=4&eoidce=1&pgls=CAk. => [200] 
22. [GET] https://securepubads.g.doubleclick.net/gampad/ads?pvsid=4868504373407258&correlator=4411431595917879&eid=122881118%2C122881143&output=ldjh&gdfp_req=1&vrg=202609180101&ptt=17&impl=fifs&iu_parts=21849154601%3A22343295815%2CAd.Plus-300x250-1&enc_prev_ius=%2F0%2F1&prev_iu_szs=300x250%7C250x250&ifi=3&dids=Ad.Plus-300x250-1&adfs=1779753723&sfv
…
```
