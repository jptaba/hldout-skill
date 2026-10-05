# API probe — GET https://api.practicesoftwaretesting.com/products/search?q=

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · captured 2026-10-05T00:59:18.724Z
- Status: **200**
- Time: 543 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "Content-Disposition",
  "cache-control": "max-age=120, public",
  "connection": "Upgrade, close",
  "content-encoding": "gzip",
  "content-length": "87",
  "content-type": "application/json",
  "date": "Mon, 05 Oct 2026 00:59:18 GMT",
  "etag": "\"e8af5371f5301cfa540111399410ceb4-gzip\"",
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
