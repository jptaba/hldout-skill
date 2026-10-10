# TOOL-5: Shop by brand

hey team 👋 marketing wants people to be able to shop by brand. Rough notes below, ping me if anything is unclear.

What we need:
* the shop page has a "By brand" filter listing the brands; ticking one shows only that brand's products
* the catalogue API supports the same: GET /products?by_brand=<brand id> → only products of that brand
* GET /brands → all brands, each with its id, name and slug
* GET /brands/{id} → that brand. Unknown id → 404
* brand search for the mobile app: GET /brands/search?q=<text> finds brands whose name contains the text anywhere in the name, ignoring case (e.g. "craft" finds MightyCraft Hardware, "FORGE" finds ForgeFlex Tools)
* no match → empty list, still 200

nice to have (not this sprint): brand logos, brand landing pages
Design mockups: https://www.figma.com/file/k3Lx9Qe2/shop-by-brand (not final)
FYI brand create/edit for admins is TOOL-12, don't test that here.
