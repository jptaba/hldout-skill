# API probe — GET https://api.practicesoftwaretesting.com/categories/tree

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · captured 2026-09-29T21:58:00.186Z
- Status: **200**
- Time: 960 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "Content-Disposition",
  "cache-control": "max-age=120, public",
  "connection": "Upgrade, close",
  "content-encoding": "gzip",
  "content-length": "435",
  "content-type": "application/json",
  "date": "Tue, 29 Sep 2026 21:58:00 GMT",
  "etag": "\"b78cdbfc885a620e05a6a986cdd91c00-gzip\"",
  "server": "Apache/2.4.52 (Ubuntu)",
  "upgrade": "h2",
  "vary": "Accept-Encoding"
}
```

## Response body (redacted)

```json
[
  {
    "id": "01M3QFFYBX9GGPF87TYS4JAZWT",
    "name": "Hand Tools",
    "slug": "hand-tools",
    "parent_id": null,
    "sub_categories": [
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZ2",
        "name": "Hammer",
        "slug": "hammer",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWT",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZ3",
        "name": "Hand Saw",
        "slug": "hand-saw",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWT",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZ4",
        "name": "Wrench",
        "slug": "wrench",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWT",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZ5",
        "name": "Screwdriver",
        "slug": "screwdriver",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWT",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZ6",
        "name": "Pliers",
        "slug": "pliers",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWT",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZ7",
        "name": "Chisels",
        "slug": "chisels",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWT",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZ8",
        "name": "Measures",
        "slug": "measures",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWT",
        "sub_categories": []
      }
    ]
  },
  {
    "id": "01M3QFFYBX9GGPF87TYS4JAZWV",
    "name": "Power Tools",
    "slug": "power-tools",
    "parent_id": null,
    "sub_categories": [
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZ9",
        "name": "Grinder",
        "slug": "grinder",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWV",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZA",
        "name": "Sander",
        "slug": "sander",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWV",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZB",
        "name": "Saw",
        "slug": "saw",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWV",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZC",
        "name": "Drill",
        "slug": "drill",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWV",
        "sub_categories": []
      }
    ]
  },
  {
    "id": "01M3QFFYBX9GGPF87TYS4JAZWW",
    "name": "Other",
    "slug": "other",
    "parent_id": null,
    "sub_categories": [
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZD",
        "name": "Tool Belts",
        "slug": "tool-belts",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWW",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZE",
        "name": "Storage Solutions",
        "slug": "storage solutions",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWW",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZF",
        "name": "Workbench",
        "slug": "workbench",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWW",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZG",
        "name": "Safety Gear",
        "slug": "safety-gear",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWW",
        "sub_categories": []
      },
      {
        "id": "01M3QFFYCECVCZZ9QS48X58CZH",
        "name": "Fasteners",
        "slug": "fasteners",
        "parent_id": "01M3QFFYBX9GGPF87TYS4JAZWW",
        "sub_categories": []
      }
    ]
  }
]
```

## Shape (types only)

```json
[
  {
    "id": "string",
    "name": "string",
    "slug": "string",
    "parent_id": "null",
    "sub_categories": [
      {
        "id": "string",
        "name": "string",
        "slug": "string",
        "parent_id": "string",
        "sub_categories": []
      }
    ]
  }
]
```
