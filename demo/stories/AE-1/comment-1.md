Author: Priya Nair (Product Owner)

Clarification after refinement with the catalogue team — this replaces scenario AC-4 as written:

- Search matches the product **name or its category name** (the category under Women / Men / Kids, e.g. "Dress", "Tops", "Tops & Shirts", "Tshirts"). So searching "dress" must return every product whose name contains "dress" **plus** every product in a "Dress" category, even if the word is not in its name — e.g. "Sleeves Top and Short - Blue & Pink" (Kids > Dress) belongs in the "dress" results. Nothing else should come back.
- The **brand** is not a search field: searching "Polo" only finds products with "Polo" in the name or category. Browsing by brand is AE-3.
- Matching is a "contains" match, case-insensitive, as in AC-3.
