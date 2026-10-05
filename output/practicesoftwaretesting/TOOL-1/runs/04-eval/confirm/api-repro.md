# API chain — output/practicesoftwaretesting/TOOL-1/runs/04-eval/confirm/chain.json

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · https://api.practicesoftwaretesting.com · captured 2026-10-05T01:10:29.004Z

1. **products page 1** — `GET /products` → **200** (809 ms)
   `per_page` = `9` · `total` = `50` · `last_page` = `6` · `current_page` = `1`
2. **products page 4** — `GET /products?page=4` → **200** (464 ms)
   `per_page` = `9` · `total` = `50` · `last_page` = `6` · `current_page` = `4`
3. **products page 6 (last)** — `GET /products?page=6` → **200** (495 ms)
   `per_page` = `9` · `total` = `50` · `last_page` = `6` · `current_page` = `6` · `to` = `50` · `from` = `46`
4. **search pliers** — `GET /products/search?q=pliers` → **200** (473 ms)
   `per_page` = `9` · `total` = `4` · `last_page` = `1`
5. **empty search q=** — `GET /products/search?q=` → **200** (528 ms)
   `per_page` = `9` · `total` = `0` · `last_page` = `1` · `data` = `[]`
6. **search q omitted** — `GET /products/search` → **200** (472 ms)
   `per_page` = `9` · `total` = `0` · `last_page` = `1`

All expectations held.
