# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DEMO-404\tests\demo-404.spec.ts >> DEMO-404 Practice portal — sign-in and interactive widgets >> SCN-009: One click on "Last Name" sorts the first table ascending
- Location: evaluations\DEMO-404\tests\demo-404.spec.ts:163:3

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - link "Fork me on GitHub":
      - /url: https://github.com/tourdedave/the-internet
      - img "Fork me on GitHub" [ref=e5] [cursor=pointer]
    - generic [ref=e7]:
      - heading "Data Tables" [level=3] [ref=e8]
      - paragraph [ref=e9]: Often times when you see a table it contains data which is sortable -- sometimes with actions that can be taken within each row (e.g. edit, delete). And it can be challenging to automate interaction with sets of data in a table depending on how it is constructed.
      - heading "Example 1" [level=4] [ref=e10]
      - paragraph [ref=e11]: No Class or ID attributes to signify groupings of rows and columns
      - table [ref=e12]:
        - rowgroup [ref=e13]:
          - row [ref=e14]:
            - columnheader "Last Name" [ref=e15]
            - columnheader "First Name" [ref=e16]
            - columnheader "Email" [ref=e17]
            - columnheader "Due" [ref=e18]
            - columnheader "Web Site" [ref=e19]
            - columnheader "Action" [ref=e20]
        - rowgroup [ref=e21]:
          - row [ref=e22]:
            - cell "Smith" [ref=e23]
            - cell "John" [ref=e24]
            - cell "jsmith@gmail.com" [ref=e25]
            - cell "$50.00" [ref=e26]
            - cell "http://www.jsmith.com" [ref=e27]
            - cell [ref=e28]:
              - link "edit" [ref=e29] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=e30] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=e31]:
            - cell "Bach" [ref=e32]
            - cell "Frank" [ref=e33]
            - cell "fbach@yahoo.com" [ref=e34]
            - cell "$51.00" [ref=e35]
            - cell "http://www.frank.com" [ref=e36]
            - cell [ref=e37]:
              - link "edit" [ref=e38] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=e39] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=e40]:
            - cell "Doe" [ref=e41]
            - cell "Jason" [ref=e42]
            - cell "jdoe@hotmail.com" [ref=e43]
            - cell "$100.00" [ref=e44]
            - cell "http://www.jdoe.com" [ref=e45]
            - cell [ref=e46]:
              - link "edit" [ref=e47] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=e48] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=e49]:
            - cell "Conway" [ref=e50]
            - cell "Tim" [ref=e51]
            - cell "tconway@earthlink.net" [ref=e52]
            - cell "$50.00" [ref=e53]
            - cell "http://www.timconway.com" [ref=e54]
            - cell [ref=e55]:
              - link "edit" [ref=e56] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=e57] [cursor=pointer]:
                - /url: "#delete"
      - heading "Example 2" [level=4] [ref=e58]
      - paragraph [ref=e59]: Class and ID attributes to signify groupings of rows and columns
      - table [ref=e60]:
        - rowgroup [ref=e61]:
          - row [ref=e62]:
            - columnheader "Last Name" [ref=e63]
            - columnheader "First Name" [ref=e64]
            - columnheader "Email" [ref=e65]
            - columnheader "Due" [ref=e66]
            - columnheader "Web Site" [ref=e67]
            - columnheader "Action" [ref=e68]
        - rowgroup [ref=e69]:
          - row [ref=e70]:
            - cell "Smith" [ref=e71]
            - cell "John" [ref=e72]
            - cell "jsmith@gmail.com" [ref=e73]
            - cell "$50.00" [ref=e74]
            - cell "http://www.jsmith.com" [ref=e75]
            - cell [ref=e76]:
              - link "edit" [ref=e77] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=e78] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=e79]:
            - cell "Bach" [ref=e80]
            - cell "Frank" [ref=e81]
            - cell "fbach@yahoo.com" [ref=e82]
            - cell "$51.00" [ref=e83]
            - cell "http://www.frank.com" [ref=e84]
            - cell [ref=e85]:
              - link "edit" [ref=e86] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=e87] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=e88]:
            - cell "Doe" [ref=e89]
            - cell "Jason" [ref=e90]
            - cell "jdoe@hotmail.com" [ref=e91]
            - cell "$100.00" [ref=e92]
            - cell "http://www.jdoe.com" [ref=e93]
            - cell [ref=e94]:
              - link "edit" [ref=e95] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=e96] [cursor=pointer]:
                - /url: "#delete"
          - row [ref=e97]:
            - cell "Conway" [ref=e98]
            - cell "Tim" [ref=e99]
            - cell "tconway@earthlink.net" [ref=e100]
            - cell "$50.00" [ref=e101]
            - cell "http://www.timconway.com" [ref=e102]
            - cell [ref=e103]:
              - link "edit" [ref=e104] [cursor=pointer]:
                - /url: "#edit"
              - link "delete" [ref=e105] [cursor=pointer]:
                - /url: "#delete"
  - generic [ref=e107]:
    - separator [ref=e108]
    - generic [ref=e109]:
      - text: Powered by
      - link "Elemental Selenium" [ref=e110] [cursor=pointer]:
        - /url: http://elementalselenium.com/
```