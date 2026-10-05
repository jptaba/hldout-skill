# API probe — GET https://api.practicesoftwaretesting.com/categories/tree

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · captured 2026-10-05T00:59:16.114Z
- Status: **200**
- Time: 566 ms
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
  "date": "Mon, 05 Oct 2026 00:59:16 GMT",
  "etag": "\"f522b2826f2167d5aca82770efd887c0-gzip\"",
  "server": "Apache/2.4.52 (Ubuntu)",
  "upgrade": "h2",
  "vary": "Accept-Encoding"
}
```

## Response body (redacted)

```json
[
  {
    "id": "01M44NSB6QZJFHB9139H3QKSJK",
    "name": "Hand Tools",
    "slug": "hand-tools",
    "parent_id": null,
    "sub_categories": [
      {
        "id": "01M44NSB700A1N91T5WRW6YVJH",
        "name": "Hammer",
        "slug": "hammer",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJK",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJJ",
        "name": "Hand Saw",
        "slug": "hand-saw",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJK",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJK",
        "name": "Wrench",
        "slug": "wrench",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJK",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJM",
        "name": "Screwdriver",
        "slug": "screwdriver",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJK",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJN",
        "name": "Pliers",
        "slug": "pliers",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJK",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJP",
        "name": "Chisels",
        "slug": "chisels",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJK",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJQ",
        "name": "Measures",
        "slug": "measures",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJK",
        "sub_categories": []
      }
    ]
  },
  {
    "id": "01M44NSB6QZJFHB9139H3QKSJM",
    "name": "Power Tools",
    "slug": "power-tools",
    "parent_id": null,
    "sub_categories": [
      {
        "id": "01M44NSB700A1N91T5WRW6YVJR",
        "name": "Grinder",
        "slug": "grinder",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJM",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJS",
        "name": "Sander",
        "slug": "sander",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJM",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJT",
        "name": "Saw",
        "slug": "saw",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJM",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJV",
        "name": "Drill",
        "slug": "drill",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJM",
        "sub_categories": []
      }
    ]
  },
  {
    "id": "01M44NSB6QZJFHB9139H3QKSJN",
    "name": "Other",
    "slug": "other",
    "parent_id": null,
    "sub_categories": [
      {
        "id": "01M44NSB700A1N91T5WRW6YVJW",
        "name": "Tool Belts",
        "slug": "tool-belts",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJN",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJX",
        "name": "Storage Solutions",
        "slug": "storage solutions",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJN",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJY",
        "name": "Workbench",
        "slug": "workbench",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJN",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVJZ",
        "name": "Safety Gear",
        "slug": "safety-gear",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJN",
        "sub_categories": []
      },
      {
        "id": "01M44NSB700A1N91T5WRW6YVK0",
        "name": "Fasteners",
        "slug": "fasteners",
        "parent_id": "01M44NSB6QZJFHB9139H3QKSJN",
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
