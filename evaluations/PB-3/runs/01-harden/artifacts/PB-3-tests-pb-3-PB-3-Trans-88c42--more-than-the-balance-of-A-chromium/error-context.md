# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PB-3\tests\pb-3.spec.ts >> PB-3 Transfer funds between my own accounts >> SCN-008: The Transfer Funds page completes a transfer of 1000.00, more than the balance of A
- Location: evaluations\PB-3\tests\pb-3.spec.ts:324:3

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - generic [ref=f4e2]:
    - generic [ref=f4e3]:
      - link:
        - /url: admin.htm
        - img [ref=f4e4] [cursor=pointer]
      - link "ParaBank":
        - /url: index.htm
        - img "ParaBank" [ref=f4e5] [cursor=pointer]
      - paragraph [ref=f4e6]: Experience the difference
    - generic [ref=f4e7]:
      - list [ref=f4e8]:
        - listitem [ref=f4e9]: Solutions
        - listitem [ref=f4e10]:
          - link "About Us" [ref=f4e11] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f4e12]:
          - link "Services" [ref=f4e13] [cursor=pointer]:
            - /url: services.htm
        - listitem [ref=f4e14]:
          - link "Products" [ref=f4e15] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/products.jsp
        - listitem [ref=f4e16]:
          - link "Locations" [ref=f4e17] [cursor=pointer]:
            - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - listitem [ref=f4e18]:
          - link "Admin Page" [ref=f4e19] [cursor=pointer]:
            - /url: admin.htm
      - list [ref=f4e20]:
        - listitem [ref=f4e21]:
          - link "home" [ref=f4e22] [cursor=pointer]:
            - /url: index.htm
        - listitem [ref=f4e23]:
          - link "about" [ref=f4e24] [cursor=pointer]:
            - /url: about.htm
        - listitem [ref=f4e25]:
          - link "contact" [ref=f4e26] [cursor=pointer]:
            - /url: contact.htm
    - generic [ref=f4e27]:
      - generic [ref=f4e28]:
        - paragraph [ref=f4e29]: Welcome Heldout Tester
        - heading "Account Services" [level=2] [ref=f4e30]
        - list [ref=f4e31]:
          - listitem [ref=f4e32]:
            - link "Open New Account" [ref=f4e33] [cursor=pointer]:
              - /url: openaccount.htm
          - listitem [ref=f4e34]:
            - link "Accounts Overview" [ref=f4e35] [cursor=pointer]:
              - /url: overview.htm
          - listitem [ref=f4e36]:
            - link "Transfer Funds" [ref=f4e37] [cursor=pointer]:
              - /url: transfer.htm
          - listitem [ref=f4e38]:
            - link "Bill Pay" [ref=f4e39] [cursor=pointer]:
              - /url: billpay.htm
          - listitem [ref=f4e40]:
            - link "Find Transactions" [ref=f4e41] [cursor=pointer]:
              - /url: findtrans.htm
          - listitem [ref=f4e42]:
            - link "Update Contact Info" [ref=f4e43] [cursor=pointer]:
              - /url: updateprofile.htm
          - listitem [ref=f4e44]:
            - link "Request Loan" [ref=f4e45] [cursor=pointer]:
              - /url: requestloan.htm
          - listitem [ref=f4e46]:
            - link "Log Out" [ref=f4e47] [cursor=pointer]:
              - /url: logout.htm
      - generic [ref=f4e50]:
        - heading "Transfer Complete!" [level=1] [ref=f4e51]
        - paragraph [ref=f4e52]: "$1000.00 has been transferred from account #47421 to account #47532."
        - paragraph [ref=f4e53]: See Account Activity for more details.
  - generic [ref=f4e55]:
    - list [ref=f4e56]:
      - listitem [ref=f4e57]:
        - link "Home" [ref=f4e58] [cursor=pointer]:
          - /url: index.htm
        - text: "|"
      - listitem [ref=f4e59]:
        - link "About Us" [ref=f4e60] [cursor=pointer]:
          - /url: about.htm
        - text: "|"
      - listitem [ref=f4e61]:
        - link "Services" [ref=f4e62] [cursor=pointer]:
          - /url: services.htm
        - text: "|"
      - listitem [ref=f4e63]:
        - link "Products" [ref=f4e64] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/products.jsp
        - text: "|"
      - listitem [ref=f4e65]:
        - link "Locations" [ref=f4e66] [cursor=pointer]:
          - /url: http://www.parasoft.com/jsp/pr/contacts.jsp
        - text: "|"
      - listitem [ref=f4e67]:
        - link "Forum" [ref=f4e68] [cursor=pointer]:
          - /url: http://forums.parasoft.com/
        - text: "|"
      - listitem [ref=f4e69]:
        - link "Site Map" [ref=f4e70] [cursor=pointer]:
          - /url: sitemap.htm
        - text: "|"
      - listitem [ref=f4e71]:
        - link "Contact Us" [ref=f4e72] [cursor=pointer]:
          - /url: contact.htm
    - paragraph [ref=f4e73]: © Parasoft. All rights reserved.
    - list [ref=f4e74]:
      - listitem [ref=f4e75]: "Visit us at:"
      - listitem [ref=f4e76]:
        - link "www.parasoft.com" [ref=f4e77] [cursor=pointer]:
          - /url: http://www.parasoft.com/
```