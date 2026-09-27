# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AE-1\tests\ae-1.spec.ts >> AE-1 Product search and catalogue on the shop and the public product API >> SCN-015: A shopper searches without a term on the Products page and sees the whole catalogue
- Location: evaluations\AE-1\tests\ae-1.spec.ts:264:3

# Error details

```
Error: [REQ AC-9] every catalogue product is shown

[REQ AC-9] every catalogue product is shown

expect(received).toEqual(expected) // deep equality

- Expected  - 7
+ Received  + 7

@@ -5,31 +5,31 @@
    "Colour Blocked Shirt – Sky Blue",
    "Cotton Mull Embroidered Dress",
    "Cotton Silk Hand Block Print Saree",
    "Fancy Green Top",
    "Frozen Tops For Kids",
-   "Full Sleeves Top Cherry - Pink",
-   "GRAPHIC DESIGN MEN T SHIRT - BLUE",
+   "Full Sleeves Top Cherry - PinkClothing",
+   "GRAPHIC DESIGN MEN T SHIRT - BLUEApparel",
    "Green Side Placket Detail T-Shirt",
    "Grunt Blue Slim Fit Jeans",
-   "Half Sleeves Top Schiffli Detailing - Pink",
+   "Half Sleeves Top Schiffli Detailing - PinkT-Shirts",
    "Lace Top For Women",
    "Little Girls Mr. Panda Shirt",
-   "Long Maxi Tulle Fancy Dress Up Outfits -Pink",
+   "Long Maxi Tulle Fancy Dress Up Outfits -PinkTextiles & Nonwovens",
    "Madame Top For Women",
    "Men Tshirt",
    "Premium Polo T-Shirts",
    "Printed Off Shoulder Top - White",
    "Pure Cotton Neon Green Tshirt",
    "Pure Cotton V-Neck T-Shirt",
    "Regular Fit Straight Jeans",
    "Rose Pink Embroidered Maxi Dress",
    "Rust Red Linen Saree",
    "Sleeveless Dress",
-   "Sleeveless Unicorn Patch Gown - Pink",
-   "Sleeveless Unicorn Print Fit & Flare Net Dress - Multi",
-   "Sleeves Printed Top - White",
+   "Sleeveless Unicorn Patch Gown - PinkApparel",
+   "Sleeveless Unicorn Print Fit & Flare Net Dress - MultiClothing",
+   "Sleeves Printed Top - WhiteManufacturing",
    "Sleeves Top and Short - Blue & Pink",
    "Soft Stretch Jeans",
    "Stylish Dress",
    "Summer White Top",
    "Winter Top",

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=f16e1]:
  - banner [ref=f16e2]:
    - generic [ref=f16e5]:
      - link [ref=f16e8] [cursor=pointer]:
        - /url: /
        - img "Website for automation practice" [ref=f16e9]
      - list [ref=f16e12]:
        - listitem [ref=f16e13]:
          - link " Home" [ref=f16e14] [cursor=pointer]:
            - /url: /
            - generic [ref=f16e15]: 
            - text: Home
        - listitem [ref=f16e16]:
          - link " Products" [ref=f16e17] [cursor=pointer]:
            - /url: /products
            - generic [ref=f16e18]: 
            - text: Products
        - listitem [ref=f16e19]:
          - link " Cart" [ref=f16e20] [cursor=pointer]:
            - /url: /view_cart
            - generic [ref=f16e21]: 
            - text: Cart
        - listitem [ref=f16e22]:
          - link " Signup / Login" [ref=f16e23] [cursor=pointer]:
            - /url: /login
            - generic [ref=f16e24]: 
            - text: Signup / Login
        - listitem [ref=f16e25]:
          - link " Test Cases" [ref=f16e26] [cursor=pointer]:
            - /url: /test_cases
            - generic [ref=f16e27]: 
            - text: Test Cases
        - listitem [ref=f16e28]:
          - link " API Testing" [ref=f16e29] [cursor=pointer]:
            - /url: /api_list
            - generic [ref=f16e30]: 
            - text: API Testing
        - listitem [ref=f16e31]:
          - link " Video Tutorials" [ref=f16e32] [cursor=pointer]:
            - /url: https://www.youtube.com/c/AutomationExercise
            - generic [ref=f16e33]: 
            - text: Video Tutorials
        - listitem [ref=f16e34]:
          - link " Contact us" [ref=f16e35] [cursor=pointer]:
            - /url: /contact_us
            - generic [ref=f16e36]: 
            - text: Contact us
  - generic [ref=f16e38]:
    - img "Website for practice" [ref=f16e39]
    - textbox "Search Product" [ref=f16e40]
    - button "" [ref=f16e41] [cursor=pointer]
  - generic [ref=f16e45]:
    - generic [ref=f16e47]:
      - heading "Category" [level=2] [ref=f16e48]
      - generic [ref=f16e49]:
        - heading [level=4] [ref=f16e52]:
          - link " Women" [ref=f16e53] [cursor=pointer]:
            - /url: "#Women"
            - generic [ref=f16e54]: 
            - text: Women
        - heading [level=4] [ref=f16e58]:
          - link " Men" [ref=f16e59] [cursor=pointer]:
            - /url: "#Men"
            - generic [ref=f16e60]: 
            - text: Men
        - heading [level=4] [ref=f16e64]:
          - link " Kids" [ref=f16e65] [cursor=pointer]:
            - /url: "#Kids"
            - generic [ref=f16e66]: 
            - text: Kids
      - insertion [ref=f16e69]:
        - generic [ref=f16e72]:
          - heading "These are topics related to the article that might interest you" [level=2] [ref=f16e74]: Discover more
          - link "Flora & Fauna" [ref=f16e75] [cursor=pointer]
          - link "Development Tools" [ref=f16e80] [cursor=pointer]
          - link "T SHIRT" [ref=f16e85] [cursor=pointer]
          - link "Economics" [ref=f16e90] [cursor=pointer]
          - link "T-Shirt" [ref=f16e95] [cursor=pointer]
          - link "Industrial & Product Design" [ref=f16e100] [cursor=pointer]
          - link "Sarees" [ref=f16e105] [cursor=pointer]
          - link "South Asians & Diaspora" [ref=f16e110] [cursor=pointer]
      - generic [ref=f16e115]:
        - heading "Brands" [level=2] [ref=f16e116]
        - list [ref=f16e118]:
          - listitem [ref=f16e119]:
            - link "(6) Polo" [ref=f16e120] [cursor=pointer]:
              - /url: /brand_products/Polo
              - generic [ref=f16e121]: (6)
              - text: Polo
          - listitem [ref=f16e122]:
            - link "(5) H&M" [ref=f16e123] [cursor=pointer]:
              - /url: /brand_products/H&M
              - generic [ref=f16e124]: (5)
              - text: H&M
          - listitem [ref=f16e125]:
            - link "(5) Madame" [ref=f16e126] [cursor=pointer]:
              - /url: /brand_products/Madame
              - generic [ref=f16e127]: (5)
              - text: Madame
          - listitem [ref=f16e128]:
            - link "(3) Mast & Harbour" [ref=f16e129] [cursor=pointer]:
              - /url: /brand_products/Mast & Harbour
              - generic [ref=f16e130]: (3)
              - text: Mast & Harbour
          - listitem [ref=f16e131]:
            - link "(4) Babyhug" [ref=f16e132] [cursor=pointer]:
              - /url: /brand_products/Babyhug
              - generic [ref=f16e133]: (4)
              - text: Babyhug
          - listitem [ref=f16e134]:
            - link "(3) Allen Solly Junior" [ref=f16e135] [cursor=pointer]:
              - /url: /brand_products/Allen Solly Junior
              - generic [ref=f16e136]: (3)
              - text: Allen Solly Junior
          - listitem [ref=f16e137]:
            - link "(3) Kookie Kids" [ref=f16e138] [cursor=pointer]:
              - /url: /brand_products/Kookie Kids
              - generic [ref=f16e139]: (3)
              - text: Kookie Kids
          - listitem [ref=f16e140]:
            - link "(5) Biba" [ref=f16e141] [cursor=pointer]:
              - /url: /brand_products/Biba
              - generic [ref=f16e142]: (5)
              - text: Biba
    - generic [ref=f16e144]:
      - heading "All Products" [level=2] [ref=f16e145]
      - generic [ref=f16e147]:
        - generic [ref=f16e148]:
          - generic [ref=f16e149]:
            - img "ecommerce website products" [ref=f16e150]
            - heading "Rs. 500" [level=2] [ref=f16e151]
            - paragraph [ref=f16e152]: Blue Top
            - generic [ref=f16e153] [cursor=pointer]:
              - generic [ref=f16e154]: 
              - text: Add to cart
          - generic [ref=f16e155]:
            - heading "Rs. 500" [level=2] [ref=f16e156]
            - paragraph [ref=f16e157]: Blue Top
            - generic [ref=f16e158] [cursor=pointer]:
              - generic [ref=f16e159]: 
              - text: Add to cart
        - list [ref=f16e161]:
          - listitem [ref=f16e162]:
            - link " View Product" [ref=f16e163] [cursor=pointer]:
              - /url: /product_details/1
              - generic [ref=f16e164]: 
              - text: View Product
      - generic [ref=f16e166]:
        - generic [ref=f16e167]:
          - generic [ref=f16e168]:
            - img "ecommerce website products" [ref=f16e169]
            - heading "Rs. 400" [level=2] [ref=f16e170]
            - paragraph [ref=f16e171]:
              - link "Men" [ref=f16e172] [cursor=pointer]:
                - /url: "#"
              - link "Tshirt" [ref=f16e175] [cursor=pointer]:
                - /url: "#"
            - generic [ref=f16e178] [cursor=pointer]:
              - generic [ref=f16e179]: 
              - text: Add to cart
          - generic [ref=f16e180]:
            - heading "Rs. 400" [level=2] [ref=f16e181]
            - paragraph [ref=f16e182]: Men Tshirt
            - generic [ref=f16e183] [cursor=pointer]:
              - generic [ref=f16e184]: 
              - text: Add to cart
        - list [ref=f16e186]:
          - listitem [ref=f16e187]:
            - link " View Product" [ref=f16e188] [cursor=pointer]:
              - /url: /product_details/2
              - generic [ref=f16e189]: 
              - text: View Product
      - generic [ref=f16e191]:
        - generic [ref=f16e192]:
          - generic [ref=f16e193]:
            - img "ecommerce website products" [ref=f16e194]
            - heading "Rs. 1000" [level=2] [ref=f16e195]
            - paragraph [ref=f16e196]:
              - text: Sleeveless
              - link "Dress" [ref=f16e197] [cursor=pointer]:
                - /url: "#"
            - generic [ref=f16e200] [cursor=pointer]:
              - generic [ref=f16e201]: 
              - text: Add to cart
          - generic [ref=f16e202]:
            - heading "Rs. 1000" [level=2] [ref=f16e203]
            - paragraph [ref=f16e204]: Sleeveless Dress
            - generic [ref=f16e205] [cursor=pointer]:
              - generic [ref=f16e206]: 
              - text: Add to cart
        - list [ref=f16e208]:
          - listitem [ref=f16e209]:
            - link " View Product" [ref=f16e210] [cursor=pointer]:
              - /url: /product_details/3
              - generic [ref=f16e211]: 
              - text: View Product
      - generic [ref=f16e213]:
        - generic [ref=f16e214]:
          - generic [ref=f16e215]:
            - img "ecommerce website products" [ref=f16e216]
            - heading "Rs. 1500" [level=2] [ref=f16e217]
            - paragraph [ref=f16e218]: Stylish Dress
            - generic [ref=f16e219] [cursor=pointer]:
              - generic [ref=f16e220]: 
              - text: Add to cart
          - generic [ref=f16e221]:
            - heading "Rs. 1500" [level=2] [ref=f16e222]
            - paragraph [ref=f16e223]: Stylish Dress
            - generic [ref=f16e224] [cursor=pointer]:
              - generic [ref=f16e225]: 
              - text: Add to cart
        - list [ref=f16e227]:
          - listitem [ref=f16e228]:
            - link " View Product" [ref=f16e229] [cursor=pointer]:
              - /url: /product_details/4
              - generic [ref=f16e230]: 
              - text: View Product
      - generic [ref=f16e232]:
        - generic [ref=f16e233]:
          - generic [ref=f16e234]:
            - img "ecommerce website products" [ref=f16e235]
            - heading "Rs. 600" [level=2] [ref=f16e236]
            - paragraph [ref=f16e237]: Winter Top
            - generic [ref=f16e238] [cursor=pointer]:
              - generic [ref=f16e239]: 
              - text: Add to cart
          - generic [ref=f16e240]:
            - heading "Rs. 600" [level=2] [ref=f16e241]
            - paragraph [ref=f16e242]: Winter Top
            - generic [ref=f16e243] [cursor=pointer]:
              - generic [ref=f16e244]: 
              - text: Add to cart
        - list [ref=f16e246]:
          - listitem [ref=f16e247]:
            - link " View Product" [ref=f16e248] [cursor=pointer]:
              - /url: /product_details/5
              - generic [ref=f16e249]: 
              - text: View Product
      - generic [ref=f16e251]:
        - generic [ref=f16e252]:
          - generic [ref=f16e253]:
            - img "ecommerce website products" [ref=f16e254]
            - heading "Rs. 400" [level=2] [ref=f16e255]
            - paragraph [ref=f16e256]: Summer White Top
            - generic [ref=f16e257] [cursor=pointer]:
              - generic [ref=f16e258]: 
              - text: Add to cart
          - generic [ref=f16e259]:
            - heading "Rs. 400" [level=2] [ref=f16e260]
            - paragraph [ref=f16e261]: Summer White Top
            - generic [ref=f16e262] [cursor=pointer]:
              - generic [ref=f16e263]: 
              - text: Add to cart
        - list [ref=f16e265]:
          - listitem [ref=f16e266]:
            - link " View Product" [ref=f16e267] [cursor=pointer]:
              - /url: /product_details/6
              - generic [ref=f16e268]: 
              - text: View Product
      - generic [ref=f16e270]:
        - generic [ref=f16e271]:
          - generic [ref=f16e272]:
            - img "ecommerce website products" [ref=f16e273]
            - heading "Rs. 1000" [level=2] [ref=f16e274]
            - paragraph [ref=f16e275]: Madame Top For Women
            - generic [ref=f16e276] [cursor=pointer]:
              - generic [ref=f16e277]: 
              - text: Add to cart
          - generic [ref=f16e278]:
            - heading "Rs. 1000" [level=2] [ref=f16e279]
            - paragraph [ref=f16e280]: Madame Top For Women
            - generic [ref=f16e281] [cursor=pointer]:
              - generic [ref=f16e282]: 
              - text: Add to cart
        - list [ref=f16e284]:
          - listitem [ref=f16e285]:
            - link " View Product" [ref=f16e286] [cursor=pointer]:
              - /url: /product_details/7
              - generic [ref=f16e287]: 
              - text: View Product
      - generic [ref=f16e289]:
        - generic [ref=f16e290]:
          - generic [ref=f16e291]:
            - img "ecommerce website products" [ref=f16e292]
            - heading "Rs. 700" [level=2] [ref=f16e293]
            - paragraph [ref=f16e294]: Fancy Green Top
            - generic [ref=f16e295] [cursor=pointer]:
              - generic [ref=f16e296]: 
              - text: Add to cart
          - generic [ref=f16e297]:
            - heading "Rs. 700" [level=2] [ref=f16e298]
            - paragraph [ref=f16e299]: Fancy Green Top
            - generic [ref=f16e300] [cursor=pointer]:
              - generic [ref=f16e301]: 
              - text: Add to cart
        - list [ref=f16e303]:
          - listitem [ref=f16e304]:
            - link " View Product" [ref=f16e305] [cursor=pointer]:
              - /url: /product_details/8
              - generic [ref=f16e306]: 
              - text: View Product
      - generic [ref=f16e308]:
        - generic [ref=f16e309]:
          - generic [ref=f16e310]:
            - img "ecommerce website products" [ref=f16e311]
            - heading "Rs. 499" [level=2] [ref=f16e312]
            - paragraph [ref=f16e313]:
              - text: Sleeves Printed Top - White
              - link "Manufacturing" [ref=f16e314] [cursor=pointer]
            - generic [ref=f16e318] [cursor=pointer]:
              - generic [ref=f16e319]: 
              - text: Add to cart
          - generic [ref=f16e320]:
            - heading "Rs. 499" [level=2] [ref=f16e321]
            - paragraph [ref=f16e322]: Sleeves Printed Top - White
            - generic [ref=f16e323] [cursor=pointer]:
              - generic [ref=f16e324]: 
              - text: Add to cart
        - list [ref=f16e326]:
          - listitem [ref=f16e327]:
            - link " View Product" [ref=f16e328] [cursor=pointer]:
              - /url: /product_details/11
              - generic [ref=f16e329]: 
              - text: View Product
      - generic [ref=f16e331]:
        - generic [ref=f16e332]:
          - generic [ref=f16e333]:
            - img "ecommerce website products" [ref=f16e334]
            - heading "Rs. 359" [level=2] [ref=f16e335]
            - paragraph [ref=f16e336]:
              - text: Half Sleeves Top Schiffli Detailing - Pink
              - link "T-Shirts" [ref=f16e337] [cursor=pointer]
            - generic [ref=f16e341] [cursor=pointer]:
              - generic [ref=f16e342]: 
              - text: Add to cart
          - generic [ref=f16e343]:
            - heading "Rs. 359" [level=2] [ref=f16e344]
            - paragraph [ref=f16e345]: Half Sleeves Top Schiffli Detailing - Pink
            - generic [ref=f16e346] [cursor=pointer]:
              - generic [ref=f16e347]: 
              - text: Add to cart
        - list [ref=f16e349]:
          - listitem [ref=f16e350]:
            - link " View Product" [ref=f16e351] [cursor=pointer]:
              - /url: /product_details/12
              - generic [ref=f16e352]: 
              - text: View Product
      - generic [ref=f16e354]:
        - generic [ref=f16e355]:
          - generic [ref=f16e356]:
            - img "ecommerce website products" [ref=f16e357]
            - heading "Rs. 278" [level=2] [ref=f16e358]
            - paragraph [ref=f16e359]: Frozen Tops For Kids
            - generic [ref=f16e360] [cursor=pointer]:
              - generic [ref=f16e361]: 
              - text: Add to cart
          - generic [ref=f16e362]:
            - heading "Rs. 278" [level=2] [ref=f16e363]
            - paragraph [ref=f16e364]: Frozen Tops For Kids
            - generic [ref=f16e365] [cursor=pointer]:
              - generic [ref=f16e366]: 
              - text: Add to cart
        - list [ref=f16e368]:
          - listitem [ref=f16e369]:
            - link " View Product" [ref=f16e370] [cursor=pointer]:
              - /url: /product_details/13
              - generic [ref=f16e371]: 
              - text: View Product
      - generic [ref=f16e373]:
        - generic [ref=f16e374]:
          - generic [ref=f16e375]:
            - img "ecommerce website products" [ref=f16e376]
            - heading "Rs. 679" [level=2] [ref=f16e377]
            - paragraph [ref=f16e378]:
              - text: Full Sleeves Top Cherry - Pink
              - link "Clothing" [ref=f16e379] [cursor=pointer]
            - generic [ref=f16e383] [cursor=pointer]:
              - generic [ref=f16e384]: 
              - text: Add to cart
          - generic [ref=f16e385]:
            - heading "Rs. 679" [level=2] [ref=f16e386]
            - paragraph [ref=f16e387]: Full Sleeves Top Cherry - Pink
            - generic [ref=f16e388] [cursor=pointer]:
              - generic [ref=f16e389]: 
              - text: Add to cart
        - list [ref=f16e391]:
          - listitem [ref=f16e392]:
            - link " View Product" [ref=f16e393] [cursor=pointer]:
              - /url: /product_details/14
              - generic [ref=f16e394]: 
              - text: View Product
      - generic [ref=f16e396]:
        - generic [ref=f16e397]:
          - generic [ref=f16e398]:
            - img "ecommerce website products" [ref=f16e399]
            - heading "Rs. 315" [level=2] [ref=f16e400]
            - paragraph [ref=f16e401]: Printed Off Shoulder Top - White
            - generic [ref=f16e402] [cursor=pointer]:
              - generic [ref=f16e403]: 
              - text: Add to cart
          - generic [ref=f16e404]:
            - heading "Rs. 315" [level=2] [ref=f16e405]
            - paragraph [ref=f16e406]: Printed Off Shoulder Top - White
            - generic [ref=f16e407] [cursor=pointer]:
              - generic [ref=f16e408]: 
              - text: Add to cart
        - list [ref=f16e410]:
          - listitem [ref=f16e411]:
            - link " View Product" [ref=f16e412] [cursor=pointer]:
              - /url: /product_details/15
              - generic [ref=f16e413]: 
              - text: View Product
      - generic [ref=f16e415]:
        - generic [ref=f16e416]:
          - generic [ref=f16e417]:
            - img "ecommerce website products" [ref=f16e418]
            - heading "Rs. 478" [level=2] [ref=f16e419]
            - paragraph [ref=f16e420]: Sleeves Top and Short - Blue & Pink
            - generic [ref=f16e421] [cursor=pointer]:
              - generic [ref=f16e422]: 
              - text: Add to cart
          - generic [ref=f16e423]:
            - heading "Rs. 478" [level=2] [ref=f16e424]
            - paragraph [ref=f16e425]: Sleeves Top and Short - Blue & Pink
            - generic [ref=f16e426] [cursor=pointer]:
              - generic [ref=f16e427]: 
              - text: Add to cart
        - list [ref=f16e429]:
          - listitem [ref=f16e430]:
            - link " View Product" [ref=f16e431] [cursor=pointer]:
              - /url: /product_details/16
              - generic [ref=f16e432]: 
              - text: View Product
      - generic [ref=f16e434]:
        - generic [ref=f16e435]:
          - generic [ref=f16e436]:
            - img "ecommerce website products" [ref=f16e437]
            - heading "Rs. 1200" [level=2] [ref=f16e438]
            - paragraph [ref=f16e439]: Little Girls Mr. Panda Shirt
            - generic [ref=f16e440] [cursor=pointer]:
              - generic [ref=f16e441]: 
              - text: Add to cart
          - generic [ref=f16e442]:
            - heading "Rs. 1200" [level=2] [ref=f16e443]
            - paragraph [ref=f16e444]: Little Girls Mr. Panda Shirt
            - generic [ref=f16e445] [cursor=pointer]:
              - generic [ref=f16e446]: 
              - text: Add to cart
        - list [ref=f16e448]:
          - listitem [ref=f16e449]:
            - link " View Product" [ref=f16e450] [cursor=pointer]:
              - /url: /product_details/18
              - generic [ref=f16e451]: 
              - text: View Product
      - generic [ref=f16e453]:
        - generic [ref=f16e454]:
          - generic [ref=f16e455]:
            - img "ecommerce website products" [ref=f16e456]
            - heading "Rs. 1050" [level=2] [ref=f16e457]
            - paragraph [ref=f16e458]:
              - text: Sleeveless Unicorn Patch Gown - Pink
              - link "Apparel" [ref=f16e459] [cursor=pointer]
            - generic [ref=f16e463] [cursor=pointer]:
              - generic [ref=f16e464]: 
              - text: Add to cart
          - generic [ref=f16e465]:
            - heading "Rs. 1050" [level=2] [ref=f16e466]
            - paragraph [ref=f16e467]: Sleeveless Unicorn Patch Gown - Pink
            - generic [ref=f16e468] [cursor=pointer]:
              - generic [ref=f16e469]: 
              - text: Add to cart
        - list [ref=f16e471]:
          - listitem [ref=f16e472]:
            - link " View Product" [ref=f16e473] [cursor=pointer]:
              - /url: /product_details/19
              - generic [ref=f16e474]: 
              - text: View Product
      - generic [ref=f16e476]:
        - generic [ref=f16e477]:
          - generic [ref=f16e478]:
            - img "ecommerce website products" [ref=f16e479]
            - heading "Rs. 1190" [level=2] [ref=f16e480]
            - paragraph [ref=f16e481]: Cotton Mull Embroidered Dress
            - generic [ref=f16e482] [cursor=pointer]:
              - generic [ref=f16e483]: 
              - text: Add to cart
          - generic [ref=f16e484]:
            - heading "Rs. 1190" [level=2] [ref=f16e485]
            - paragraph [ref=f16e486]: Cotton Mull Embroidered Dress
            - generic [ref=f16e487] [cursor=pointer]:
              - generic [ref=f16e488]: 
              - text: Add to cart
        - list [ref=f16e490]:
          - listitem [ref=f16e491]:
            - link " View Product" [ref=f16e492] [cursor=pointer]:
              - /url: /product_details/20
              - generic [ref=f16e493]: 
              - text: View Product
      - generic [ref=f16e495]:
        - generic [ref=f16e496]:
          - generic [ref=f16e497]:
            - img "ecommerce website products" [ref=f16e498]
            - heading "Rs. 1530" [level=2] [ref=f16e499]
            - paragraph [ref=f16e500]: Blue Cotton Indie Mickey Dress
            - generic [ref=f16e501] [cursor=pointer]:
              - generic [ref=f16e502]: 
              - text: Add to cart
          - generic [ref=f16e503]:
            - heading "Rs. 1530" [level=2] [ref=f16e504]
            - paragraph [ref=f16e505]: Blue Cotton Indie Mickey Dress
            - generic [ref=f16e506] [cursor=pointer]:
              - generic [ref=f16e507]: 
              - text: Add to cart
        - list [ref=f16e509]:
          - listitem [ref=f16e510]:
            - link " View Product" [ref=f16e511] [cursor=pointer]:
              - /url: /product_details/21
              - generic [ref=f16e512]: 
              - text: View Product
      - generic [ref=f16e514]:
        - generic [ref=f16e515]:
          - generic [ref=f16e516]:
            - img "ecommerce website products" [ref=f16e517]
            - heading "Rs. 1600" [level=2] [ref=f16e518]
            - paragraph [ref=f16e519]:
              - text: Long Maxi Tulle Fancy Dress Up Outfits -Pink
              - link "Textiles & Nonwovens" [ref=f16e520] [cursor=pointer]
            - generic [ref=f16e524] [cursor=pointer]:
              - generic [ref=f16e525]: 
              - text: Add to cart
          - generic [ref=f16e526]:
            - heading "Rs. 1600" [level=2] [ref=f16e527]
            - paragraph [ref=f16e528]: Long Maxi Tulle Fancy Dress Up Outfits -Pink
            - generic [ref=f16e529] [cursor=pointer]:
              - generic [ref=f16e530]: 
              - text: Add to cart
        - list [ref=f16e532]:
          - listitem [ref=f16e533]:
            - link " View Product" [ref=f16e534] [cursor=pointer]:
              - /url: /product_details/22
              - generic [ref=f16e535]: 
              - text: View Product
      - generic [ref=f16e537]:
        - generic [ref=f16e538]:
          - generic [ref=f16e539]:
            - img "ecommerce website products" [ref=f16e540]
            - heading "Rs. 1100" [level=2] [ref=f16e541]
            - paragraph [ref=f16e542]:
              - text: Sleeveless Unicorn Print Fit & Flare Net Dress - Multi
              - link "Clothing" [ref=f16e543] [cursor=pointer]
            - generic [ref=f16e547] [cursor=pointer]:
              - generic [ref=f16e548]: 
              - text: Add to cart
          - generic [ref=f16e549]:
            - heading "Rs. 1100" [level=2] [ref=f16e550]
            - paragraph [ref=f16e551]: Sleeveless Unicorn Print Fit & Flare Net Dress - Multi
            - generic [ref=f16e552] [cursor=pointer]:
              - generic [ref=f16e553]: 
              - text: Add to cart
        - list [ref=f16e555]:
          - listitem [ref=f16e556]:
            - link " View Product" [ref=f16e557] [cursor=pointer]:
              - /url: /product_details/23
              - generic [ref=f16e558]: 
              - text: View Product
      - generic [ref=f16e560]:
        - generic [ref=f16e561]:
          - generic [ref=f16e562]:
            - img "ecommerce website products" [ref=f16e563]
            - heading "Rs. 849" [level=2] [ref=f16e564]
            - paragraph [ref=f16e565]: Colour Blocked Shirt – Sky Blue
            - generic [ref=f16e566] [cursor=pointer]:
              - generic [ref=f16e567]: 
              - text: Add to cart
          - generic [ref=f16e568]:
            - heading "Rs. 849" [level=2] [ref=f16e569]
            - paragraph [ref=f16e570]: Colour Blocked Shirt – Sky Blue
            - generic [ref=f16e571] [cursor=pointer]:
              - generic [ref=f16e572]: 
              - text: Add to cart
        - list [ref=f16e574]:
          - listitem [ref=f16e575]:
            - link " View Product" [ref=f16e576] [cursor=pointer]:
              - /url: /product_details/24
              - generic [ref=f16e577]: 
              - text: View Product
      - generic [ref=f16e579]:
        - generic [ref=f16e580]:
          - generic [ref=f16e581]:
            - img "ecommerce website products" [ref=f16e582]
            - heading "Rs. 1299" [level=2] [ref=f16e583]
            - paragraph [ref=f16e584]: Pure Cotton V-Neck T-Shirt
            - generic [ref=f16e585] [cursor=pointer]:
              - generic [ref=f16e586]: 
              - text: Add to cart
          - generic [ref=f16e587]:
            - heading "Rs. 1299" [level=2] [ref=f16e588]
            - paragraph [ref=f16e589]: Pure Cotton V-Neck T-Shirt
            - generic [ref=f16e590] [cursor=pointer]:
              - generic [ref=f16e591]: 
              - text: Add to cart
        - list [ref=f16e593]:
          - listitem [ref=f16e594]:
            - link " View Product" [ref=f16e595] [cursor=pointer]:
              - /url: /product_details/28
              - generic [ref=f16e596]: 
              - text: View Product
      - generic [ref=f16e598]:
        - generic [ref=f16e599]:
          - generic [ref=f16e600]:
            - img "ecommerce website products" [ref=f16e601]
            - heading "Rs. 1000" [level=2] [ref=f16e602]
            - paragraph [ref=f16e603]: Green Side Placket Detail T-Shirt
            - generic [ref=f16e604] [cursor=pointer]:
              - generic [ref=f16e605]: 
              - text: Add to cart
          - generic [ref=f16e606]:
            - heading "Rs. 1000" [level=2] [ref=f16e607]
            - paragraph [ref=f16e608]: Green Side Placket Detail T-Shirt
            - generic [ref=f16e609] [cursor=pointer]:
              - generic [ref=f16e610]: 
              - text: Add to cart
        - list [ref=f16e612]:
          - listitem [ref=f16e613]:
            - link " View Product" [ref=f16e614] [cursor=pointer]:
              - /url: /product_details/29
              - generic [ref=f16e615]: 
              - text: View Product
      - generic [ref=f16e617]:
        - generic [ref=f16e618]:
          - generic [ref=f16e619]:
            - img "ecommerce website products" [ref=f16e620]
            - heading "Rs. 1500" [level=2] [ref=f16e621]
            - paragraph [ref=f16e622]: Premium Polo T-Shirts
            - generic [ref=f16e623] [cursor=pointer]:
              - generic [ref=f16e624]: 
              - text: Add to cart
          - generic [ref=f16e625]:
            - heading "Rs. 1500" [level=2] [ref=f16e626]
            - paragraph [ref=f16e627]: Premium Polo T-Shirts
            - generic [ref=f16e628] [cursor=pointer]:
              - generic [ref=f16e629]: 
              - text: Add to cart
        - list [ref=f16e631]:
          - listitem [ref=f16e632]:
            - link " View Product" [ref=f16e633] [cursor=pointer]:
              - /url: /product_details/30
              - generic [ref=f16e634]: 
              - text: View Product
      - generic [ref=f16e636]:
        - generic [ref=f16e637]:
          - generic [ref=f16e638]:
            - img "ecommerce website products" [ref=f16e639]
            - heading "Rs. 850" [level=2] [ref=f16e640]
            - paragraph [ref=f16e641]: Pure Cotton Neon Green Tshirt
            - generic [ref=f16e642] [cursor=pointer]:
              - generic [ref=f16e643]: 
              - text: Add to cart
          - generic [ref=f16e644]:
            - heading "Rs. 850" [level=2] [ref=f16e645]
            - paragraph [ref=f16e646]: Pure Cotton Neon Green Tshirt
            - generic [ref=f16e647] [cursor=pointer]:
              - generic [ref=f16e648]: 
              - text: Add to cart
        - list [ref=f16e650]:
          - listitem [ref=f16e651]:
            - link " View Product" [ref=f16e652] [cursor=pointer]:
              - /url: /product_details/31
              - generic [ref=f16e653]: 
              - text: View Product
      - generic [ref=f16e655]:
        - generic [ref=f16e656]:
          - generic [ref=f16e657]:
            - img "ecommerce website products" [ref=f16e658]
            - heading "Rs. 799" [level=2] [ref=f16e659]
            - paragraph [ref=f16e660]: Soft Stretch Jeans
            - generic [ref=f16e661] [cursor=pointer]:
              - generic [ref=f16e662]: 
              - text: Add to cart
          - generic [ref=f16e663]:
            - heading "Rs. 799" [level=2] [ref=f16e664]
            - paragraph [ref=f16e665]: Soft Stretch Jeans
            - generic [ref=f16e666] [cursor=pointer]:
              - generic [ref=f16e667]: 
              - text: Add to cart
        - list [ref=f16e669]:
          - listitem [ref=f16e670]:
            - link " View Product" [ref=f16e671] [cursor=pointer]:
              - /url: /product_details/33
              - generic [ref=f16e672]: 
              - text: View Product
      - generic [ref=f16e674]:
        - generic [ref=f16e675]:
          - generic [ref=f16e676]:
            - img "ecommerce website products" [ref=f16e677]
            - heading "Rs. 1200" [level=2] [ref=f16e678]
            - paragraph [ref=f16e679]: Regular Fit Straight Jeans
            - generic [ref=f16e680] [cursor=pointer]:
              - generic [ref=f16e681]: 
              - text: Add to cart
          - generic [ref=f16e682]:
            - heading "Rs. 1200" [level=2] [ref=f16e683]
            - paragraph [ref=f16e684]: Regular Fit Straight Jeans
            - generic [ref=f16e685] [cursor=pointer]:
              - generic [ref=f16e686]: 
              - text: Add to cart
        - list [ref=f16e688]:
          - listitem [ref=f16e689]:
            - link " View Product" [ref=f16e690] [cursor=pointer]:
              - /url: /product_details/35
              - generic [ref=f16e691]: 
              - text: View Product
      - generic [ref=f16e693]:
        - generic [ref=f16e694]:
          - generic [ref=f16e695]:
            - img "ecommerce website products" [ref=f16e696]
            - heading "Rs. 1400" [level=2] [ref=f16e697]
            - paragraph [ref=f16e698]: Grunt Blue Slim Fit Jeans
            - generic [ref=f16e699] [cursor=pointer]:
              - generic [ref=f16e700]: 
              - text: Add to cart
          - generic [ref=f16e701]:
            - heading "Rs. 1400" [level=2] [ref=f16e702]
            - paragraph [ref=f16e703]: Grunt Blue Slim Fit Jeans
            - generic [ref=f16e704] [cursor=pointer]:
              - generic [ref=f16e705]: 
              - text: Add to cart
        - list [ref=f16e707]:
          - listitem [ref=f16e708]:
            - link " View Product" [ref=f16e709] [cursor=pointer]:
              - /url: /product_details/37
              - generic [ref=f16e710]: 
              - text: View Product
      - generic [ref=f16e712]:
        - generic [ref=f16e713]:
          - generic [ref=f16e714]:
            - img "ecommerce website products" [ref=f16e715]
            - heading "Rs. 2300" [level=2] [ref=f16e716]
            - paragraph [ref=f16e717]: Rose Pink Embroidered Maxi Dress
            - generic [ref=f16e718] [cursor=pointer]:
              - generic [ref=f16e719]: 
              - text: Add to cart
          - generic [ref=f16e720]:
            - heading "Rs. 2300" [level=2] [ref=f16e721]
            - paragraph [ref=f16e722]: Rose Pink Embroidered Maxi Dress
            - generic [ref=f16e723] [cursor=pointer]:
              - generic [ref=f16e724]: 
              - text: Add to cart
        - list [ref=f16e726]:
          - listitem [ref=f16e727]:
            - link " View Product" [ref=f16e728] [cursor=pointer]:
              - /url: /product_details/38
              - generic [ref=f16e729]: 
              - text: View Product
      - generic [ref=f16e731]:
        - generic [ref=f16e732]:
          - generic [ref=f16e733]:
            - img "ecommerce website products" [ref=f16e734]
            - heading "Rs. 3000" [level=2] [ref=f16e735]
            - paragraph [ref=f16e736]: Cotton Silk Hand Block Print Saree
            - generic [ref=f16e737] [cursor=pointer]:
              - generic [ref=f16e738]: 
              - text: Add to cart
          - generic [ref=f16e739]:
            - heading "Rs. 3000" [level=2] [ref=f16e740]
            - paragraph [ref=f16e741]: Cotton Silk Hand Block Print Saree
            - generic [ref=f16e742] [cursor=pointer]:
              - generic [ref=f16e743]: 
              - text: Add to cart
        - list [ref=f16e745]:
          - listitem [ref=f16e746]:
            - link " View Product" [ref=f16e747] [cursor=pointer]:
              - /url: /product_details/39
              - generic [ref=f16e748]: 
              - text: View Product
      - generic [ref=f16e750]:
        - generic [ref=f16e751]:
          - generic [ref=f16e752]:
            - img "ecommerce website products" [ref=f16e753]
            - heading "Rs. 3500" [level=2] [ref=f16e754]
            - paragraph [ref=f16e755]: Rust Red Linen Saree
            - generic [ref=f16e756] [cursor=pointer]:
              - generic [ref=f16e757]: 
              - text: Add to cart
          - generic [ref=f16e758]:
            - heading "Rs. 3500" [level=2] [ref=f16e759]
            - paragraph [ref=f16e760]: Rust Red Linen Saree
            - generic [ref=f16e761] [cursor=pointer]:
              - generic [ref=f16e762]: 
              - text: Add to cart
        - list [ref=f16e764]:
          - listitem [ref=f16e765]:
            - link " View Product" [ref=f16e766] [cursor=pointer]:
              - /url: /product_details/40
              - generic [ref=f16e767]: 
              - text: View Product
      - generic [ref=f16e769]:
        - generic [ref=f16e770]:
          - generic [ref=f16e771]:
            - img "ecommerce website products" [ref=f16e772]
            - heading "Rs. 5000" [level=2] [ref=f16e773]
            - paragraph [ref=f16e774]: Beautiful Peacock Blue Cotton Linen Saree
            - generic [ref=f16e775] [cursor=pointer]:
              - generic [ref=f16e776]: 
              - text: Add to cart
          - generic [ref=f16e777]:
            - heading "Rs. 5000" [level=2] [ref=f16e778]
            - paragraph [ref=f16e779]: Beautiful Peacock Blue Cotton Linen Saree
            - generic [ref=f16e780] [cursor=pointer]:
              - generic [ref=f16e781]: 
              - text: Add to cart
        - list [ref=f16e783]:
          - listitem [ref=f16e784]:
            - link " View Product" [ref=f16e785] [cursor=pointer]:
              - /url: /product_details/41
              - generic [ref=f16e786]: 
              - text: View Product
      - generic [ref=f16e788]:
        - generic [ref=f16e789]:
          - generic [ref=f16e790]:
            - img "ecommerce website products" [ref=f16e791]
            - heading "Rs. 1400" [level=2] [ref=f16e792]
            - paragraph [ref=f16e793]: Lace Top For Women
            - generic [ref=f16e794] [cursor=pointer]:
              - generic [ref=f16e795]: 
              - text: Add to cart
          - generic [ref=f16e796]:
            - heading "Rs. 1400" [level=2] [ref=f16e797]
            - paragraph [ref=f16e798]: Lace Top For Women
            - generic [ref=f16e799] [cursor=pointer]:
              - generic [ref=f16e800]: 
              - text: Add to cart
        - list [ref=f16e802]:
          - listitem [ref=f16e803]:
            - link " View Product" [ref=f16e804] [cursor=pointer]:
              - /url: /product_details/42
              - generic [ref=f16e805]: 
              - text: View Product
      - generic [ref=f16e807]:
        - generic [ref=f16e808]:
          - generic [ref=f16e809]:
            - img "ecommerce website products" [ref=f16e810]
            - heading "Rs. 1389" [level=2] [ref=f16e811]
            - paragraph [ref=f16e812]:
              - text: GRAPHIC DESIGN MEN T SHIRT - BLUE
              - link "Apparel" [ref=f16e813] [cursor=pointer]
            - generic [ref=f16e817] [cursor=pointer]:
              - generic [ref=f16e818]: 
              - text: Add to cart
          - generic [ref=f16e819]:
            - heading "Rs. 1389" [level=2] [ref=f16e820]
            - paragraph [ref=f16e821]: GRAPHIC DESIGN MEN T SHIRT - BLUE
            - generic [ref=f16e822] [cursor=pointer]:
              - generic [ref=f16e823]: 
              - text: Add to cart
        - list [ref=f16e825]:
          - listitem [ref=f16e826]:
            - link " View Product" [ref=f16e827] [cursor=pointer]:
              - /url: /product_details/43
              - generic [ref=f16e828]: 
              - text: View Product
  - insertion [ref=f16e830]
  - contentinfo [ref=f16e832]:
    - generic [ref=f16e837]:
      - heading "Subscription" [level=2] [ref=f16e838]
      - generic [ref=f16e839]:
        - textbox "Your email address" [ref=f16e840]
        - button "" [ref=f16e841] [cursor=pointer]
        - paragraph [ref=f16e843]: Get the most recent updates from our site and be updated your self...
    - paragraph [ref=f16e847]: Copyright © 2021 All rights reserved
  - text: 
```

# Test source

```ts
  173 |       const byId = new Map(catalogue.map((p) => [String(p.id), p]));
  174 |       const extra = found.filter((p) => {
  175 |         const c = byId.get(String(p.id)) ?? p;
  176 |         return !contains(c.name, REQ.AC4_TERM) && !contains(categoryNameOf(c), REQ.AC4_TERM);
  177 |       }).map((p) => `${p.id} ${p.name} (${categoryNameOf(byId.get(String(p.id)) ?? p)})`);
  178 |       expect(extra, '[REQ AC-4] nothing without "dress" in its name or category name comes back').toEqual([]);
  179 |     });
  180 |   });
  181 | 
  182 |   test('SCN-008: The brand is not a search field', { tag: ['@AC-4', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey, seed }) => {
  183 |     let catalogue: Product[] = []; let found: Product[] = [];
  184 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  185 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  186 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  187 |     });
  188 |     await journey.step('When a client searches for "Polo"', async () => { found = productsOf(await search(api, REQ.AC4_BRAND_TERM)) ?? []; });
  189 |     await journey.step('Then exactly the products with "Polo" in their name or category name are returned', async () => {
  190 |       const expected = catalogue.filter((p) => contains(p.name, REQ.AC4_BRAND_TERM) || contains(categoryNameOf(p), REQ.AC4_BRAND_TERM));
  191 |       expect(ids(found), '[REQ AC-4] "Polo" finds only products with "Polo" in the name or category (brand not searched)').toEqual(ids(expected));
  192 |     });
  193 |   });
  194 | 
  195 |   test('SCN-009: A search that matches nothing returns an empty product list', { tag: ['@AC-5', '@type:functional', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  196 |     let res!: ApiResponse;
  197 |     await journey.step('Given the public product API (no authentication)', async () => {});
  198 |     await journey.step('When a client searches for "zzqxv"', async () => { res = await search(api, REQ.AC5_NO_MATCH); });
  199 |     await journey.step('Then an empty product list is returned', async () => {
  200 |       const list = productsOf(res);
  201 |       expect(Array.isArray(list), '[REQ AC-5] a product list is returned').toBe(true);
  202 |       expect(list, '[REQ AC-5] the product list is empty').toEqual([]);
  203 |     });
  204 |   });
  205 | 
  206 |   test('SCN-010: A search that matches nothing is not an error', { tag: ['@AC-5', '@type:negative', '@layer:api', '@P2'] }, async ({ api, journey }) => {
  207 |     let res!: ApiResponse;
  208 |     await journey.step('Given the public product API (no authentication)', async () => {});
  209 |     await journey.step('When a client searches for "zzqxv"', async () => { res = await search(api, REQ.AC5_NO_MATCH); });
  210 |     await journey.step('Then the response is not an error: no error status and no error message', async () => {
  211 |       expect.soft(res.status, '[REQ AC-5] no error status (4xx/5xx)').toBeLessThan(400);
  212 |       expect.soft(messageOf(res), '[REQ AC-5] no error message').toBeUndefined();
  213 |     });
  214 |   });
  215 | 
  216 |   test('SCN-011: Searching with an empty value returns the whole catalogue', { tag: ['@AC-6', '@type:boundary', '@layer:api', '@P1'] }, async ({ api, journey, seed }) => {
  217 |     let catalogue: Product[] = []; let res!: ApiResponse;
  218 |     await journey.step('Given the catalogue from GET /api/productsList', async () => {
  219 |       catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  220 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
  221 |     });
  222 |     await journey.step('When a client posts search_product with an empty value', async () => { res = await search(api, ''); });
  223 |     await journey.step('Then the whole catalogue is returned, the same products as GET /api/productsList', async () => {
  224 |       expect(ids(productsOf(res)), '[REQ AC-6] an empty term returns the same products as GET /api/productsList').toEqual(ids(catalogue));
  225 |     });
  226 |   });
  227 | 
  228 |   test('SCN-012: A search without the search_product parameter is rejected with response code 400', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  229 |     let res!: ApiResponse;
  230 |     await journey.step('Given the public product API (no authentication)', async () => {});
  231 |     await journey.step('When a client posts to /api/searchProduct without the search_product parameter', async () => {
  232 |       res = await api.post(EP.searchProduct); // no body at all
  233 |     });
  234 |     await journey.step('Then the request is rejected with response code 400', async () => {
  235 |       expect(res.status, '[REQ AC-7] response code 400').toBe(REQ.STATUS.BAD_REQUEST);
  236 |     });
  237 |   });
  238 | 
  239 |   test('SCN-013: A search without the search_product parameter explains what is missing', { tag: ['@AC-7', '@type:negative', '@layer:api', '@P1'] }, async ({ api, journey }) => {
  240 |     let res!: ApiResponse;
  241 |     await journey.step('Given the public product API (no authentication)', async () => {});
  242 |     await journey.step('When a client posts to /api/searchProduct without the search_product parameter', async () => {
  243 |       res = await api.post(EP.searchProduct); // no body at all
  244 |     });
  245 |     await journey.step('Then the message is "Bad request, search_product parameter is missing in POST request."', async () => {
  246 |       expect(messageOf(res), '[REQ AC-7] message').toBe(REQ.AC7_MESSAGE);
  247 |     });
  248 |   });
  249 | 
  250 |   test('SCN-014: A shopper searches "jean" on the Products page', { tag: ['@AC-8', '@type:functional', '@layer:ui', '@P1'] }, async ({ page, journey }) => {
  251 |     await journey.step('Given a shopper on the Products page', async () => { await gotoPage(page, PRODUCTS_PAGE); });
  252 |     await journey.step('When they type "jean" in the search box and press the search button', async () => { await searchOnPage(page, REQ.AC2_TERM); });
  253 |     await journey.step('Then the product grid is headed "Searched Products"', async () => {
  254 |       await expect.soft(gridHeading(page), '[REQ AC-8] grid heading').toHaveText(REQ.HEADING_SEARCHED, { ignoreCase: true });
  255 |     });
  256 |     await journey.step('And the search box still shows "jean"', async () => {
  257 |       await expect.soft(searchBox(page), '[REQ AC-8] search box keeps the term').toHaveValue(REQ.AC2_TERM);
  258 |     });
  259 |     await journey.step('And exactly the three jeans products listed in AC-2 are shown', async () => {
  260 |       await expect.poll(() => shownNames(page), { message: '[REQ AC-8] exactly the three jeans are shown' }).toEqual([...REQ.AC2_JEANS].sort());
  261 |     });
  262 |   });
  263 | 
  264 |   test('SCN-015: A shopper searches without a term on the Products page and sees the whole catalogue', { tag: ['@AC-9', '@type:integration', '@layer:e2e', '@P2'] }, async ({ page, api, journey, seed }) => {
  265 |     await journey.step('Given a shopper on the Products page', async () => { await gotoPage(page, PRODUCTS_PAGE); });
  266 |     await journey.step('When they leave the search box empty and press the search button', async () => { await searchOnPage(page, ''); });
  267 |     await journey.step('Then the grid is headed "All Products"', async () => {
  268 |       await expect.soft(gridHeading(page), '[REQ AC-9] grid heading').toHaveText(REQ.HEADING_ALL, { ignoreCase: true });
  269 |     });
  270 |     await journey.step('And every product of the catalogue (GET /api/productsList) is shown', async () => {
  271 |       const catalogue = await seed.step('catalogue (GET /api/productsList)', async () => productsOf(await listCatalogue(api)) ?? []);
  272 |       expect(catalogue.length, 'catalogue listed (precondition)').toBeGreaterThan(0);
> 273 |       await expect.poll(() => shownNames(page), { message: '[REQ AC-9] every catalogue product is shown' }).toEqual(names(catalogue));
      |                                                                                                             ^ Error: [REQ AC-9] every catalogue product is shown
  274 |     });
  275 |   });
  276 | 
  277 |   REQ.AC10_TERMS.forEach((term, i) => {
  278 |     test(`SCN-016.${i + 1}: The shop and the API agree on search results (${term})`, { tag: ['@AC-10', '@type:integration', '@layer:e2e', '@P1'] }, async ({ page, api, journey }) => {
  279 |       await journey.step('Given a shopper on the Products page', async () => { await gotoPage(page, PRODUCTS_PAGE); });
  280 |       await journey.step(`When a shopper searches for "${term}" on the Products page`, async () => { await searchOnPage(page, term); });
  281 |       await journey.step(`Then the products shown are exactly the products POST /api/searchProduct returns for "${term}"`, async () => {
  282 |         const fromApi = productsOf(await search(api, term));
  283 |         expect(Array.isArray(fromApi), 'search API returned a product list (precondition)').toBe(true);
  284 |         await expect.poll(() => shownNames(page), { message: `[REQ AC-10] the page shows exactly what the API returns for "${term}"` }).toEqual(names(fromApi));
  285 |       });
  286 |     });
  287 |   });
  288 | 
  289 |   test('SCN-017: A search on the Products page that matches nothing shows no product', { tag: ['@AC-11', '@type:functional', '@layer:ui', '@P2'] }, async ({ page, journey }) => {
  290 |     await journey.step('Given a shopper on the Products page', async () => { await gotoPage(page, PRODUCTS_PAGE); });
  291 |     await journey.step('When a shopper searches for "zzqxv" on the Products page', async () => { await searchOnPage(page, REQ.AC5_NO_MATCH); });
  292 |     await journey.step('Then the grid is headed "Searched Products"', async () => {
  293 |       await expect.soft(gridHeading(page), '[REQ AC-11] grid heading').toHaveText(REQ.HEADING_SEARCHED, { ignoreCase: true });
  294 |     });
  295 |     await journey.step('And no product is shown', async () => {
  296 |       await expect(cardNames(page), '[REQ AC-11] no product is shown').toHaveCount(0);
  297 |     });
  298 |   });
  299 | });
  300 | 
```