# Tier-2 walk (Playwright MCP over stdio)

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) — https://automationintesting.online
- Server: `npx -y @playwright/mcp@latest --isolated --output-dir C:\Users\Jptaba\AppData\Local\Temp\heldout-mcp-3371CH --headless` · 2026-09-26T18:29:02.913Z
- Result: ✔ all steps passed

| # | Step | OK | Detail |
| --- | --- | --- | --- |
| 1 | browser_navigate | ✔ | `await page.goto('https://automationintesting.online/');` |
| 2 | browser_wait_for | ✔ | `await page.getByText("Send Us a Message").first().waitFor({ state: 'visible' });` |
| 3 | expect heading "Send Us a Message" | ✔ | found: - heading "Send Us a Message" [level=3] [ref=e111] |
| 4 | expect textbox "Name" | ✔ | found: - textbox "Name" [ref=e115] |
| 5 | expect textbox "Email" | ✔ | found: - textbox "Email" [ref=e118] |
| 6 | expect textbox "Phone" | ✔ | found: - textbox "Phone" [ref=e121] |
| 7 | expect textbox "Subject" | ✔ | found: - textbox "Subject" [ref=e124] |
| 8 | expect absent textbox "Message" | ✔ | not exposed in the (ready) accessibility snapshot |
| 9 | expect img "Single Room" | ✔ | found: - img "Single Room" [ref=e174] |
| 10 | expect absent img "Double Room" | ✔ | not exposed in the (ready) accessibility snapshot |
| 11 | expect absent img "Suite Room" | ✔ | not exposed in the (ready) accessibility snapshot |
| 12 | expect heading "Double" | ✔ | found: - heading "Double" [level=5] [ref=e194] |
| 13 | expect heading "Suite" | ✔ | found: - heading "Suite" [level=5] [ref=e212] |
| 14 | browser_click button "Submit" | ✔ | `await page.getByRole('button', { name: 'Submit' }).click();` |
| 15 | browser_wait_for | ✔ | `await page.getByText("may not be blank").first().waitFor({ state: 'visible' });` |
| 16 | expect text "Name may not be blank" | ✔ | present in snapshot |
| 17 | expect text "Message may not be blank" | ✔ | present in snapshot |

