# API probe — QUERY https://api.practicesoftwaretesting.com/products

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · captured 2026-09-29T22:00:42.620Z
- Status: **200**
- Time: 613 ms
- Content-Type: application/json

## Request body

```json
{
  "by_category": "01M3QFFYCECVCZZ9QS48X58CZ2"
}
```

## Response headers (redacted)

```json
{
  "accept-query": "application/json",
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "Content-Disposition",
  "cache-control": "no-cache, private",
  "connection": "Upgrade, close",
  "content-encoding": "gzip",
  "content-length": "87",
  "content-type": "application/json",
  "date": "Tue, 29 Sep 2026 22:00:42 GMT",
  "server": "Apache/2.4.52 (Ubuntu)",
  "upgrade": "h2",
  "vary": "Accept-Encoding"
}
```

## Response body (redacted)

```json
{
  "current_page": 1,
  "data": [],
  "from": null,
  "last_page": 1,
  "per_page": 9,
  "to": null,
  "total": 0
}
```

## Shape (types only)

```json
{
  "current_page": "number",
  "data": [],
  "from": "null",
  "last_page": "number",
  "per_page": "number",
  "to": "null",
  "total": "number"
}
```
