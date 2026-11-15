# Product overview: price range, sorting and paging

As a shopper browsing the tool catalogue I want to narrow the overview to the prices I am willing to pay, put the results in a useful order and page through them, so that I find a suitable tool without scrolling through the whole catalogue.

The overview on the home page lists the catalogue's products (rentals have their own page). The shopper sets a minimum and a maximum price with the price-range slider and picks an order from the sort list above the results.

Other clients get the same listing from the products endpoint of the API: the range as `between=price,<min>,<max>`, the order as `sort=<field>,<asc|desc>` and the page as `page=<n>`. The answer is a page object with `data`, `current_page`, `last_page` and `total`.

What we expect:

- Only products whose list price lies within the chosen range are listed, and both limits belong to the range: a product that costs exactly the minimum or exactly the maximum is listed too.
- Nine products per page; `total` and the number of pages count only the matching products.
- Going to another page keeps the range and the order, and each page continues where the previous one stopped, so paging through all pages shows every matching product exactly once.
- Price low to high puts the cheapest product first, price high to low the most expensive first; name A–Z and Z–A order alphabetically. The order applies to the whole result, not just to the page on screen.
- Changing the range or the order starts again at the first page.
- A range in which no product falls gives an empty overview with a no-results note, not an error.

Out of scope: category, brand and eco-friendly filters, and the search box.
