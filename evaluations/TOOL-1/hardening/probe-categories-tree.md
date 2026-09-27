# API probe — GET https://api.practicesoftwaretesting.com/categories/tree

- AUT: Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) · captured 2026-09-26T22:27:14.304Z
- Status: **200**
- Time: 534 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "Content-Disposition",
  "cache-control": "max-age=120, public",
  "connection": "Upgrade, close",
  "content-encoding": "gzip",
  "content-length": "436",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 22:27:00 GMT",
  "etag": "\"a2efacde43462767fd72f99dc3ca5cfa-gzip\"",
  "server": "Apache/2.4.52 (Ubuntu)",
  "upgrade": "h2",
  "vary": "Accept-Encoding"
}
```

## Response body (redacted, first 4000 chars)

```json
[
  {
    "id": "01M3FVQJEJY55HP50FJD58SX8N",
    "name": "Hand Tools",
    "slug": "hand-tools",
    "parent_id": null,
    "sub_categories": [
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P92S",
        "name": "Hammer",
        "slug": "hammer",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8N",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P92T",
        "name": "Hand Saw",
        "slug": "hand-saw",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8N",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P92V",
        "name": "Wrench",
        "slug": "wrench",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8N",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P92W",
        "name": "Screwdriver",
        "slug": "screwdriver",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8N",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P92X",
        "name": "Pliers",
        "slug": "pliers",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8N",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P92Y",
        "name": "Chisels",
        "slug": "chisels",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8N",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P92Z",
        "name": "Measures",
        "slug": "measures",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8N",
        "sub_categories": []
      }
    ]
  },
  {
    "id": "01M3FVQJEJY55HP50FJD58SX8P",
    "name": "Power Tools",
    "slug": "power-tools",
    "parent_id": null,
    "sub_categories": [
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P930",
        "name": "Grinder",
        "slug": "grinder",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8P",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P931",
        "name": "Sander",
        "slug": "sander",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8P",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P932",
        "name": "Saw",
        "slug": "saw",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8P",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P933",
        "name": "Drill",
        "slug": "drill",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8P",
        "sub_categories": []
      }
    ]
  },
  {
    "id": "01M3FVQJEJY55HP50FJD58SX8Q",
    "name": "Other",
    "slug": "other",
    "parent_id": null,
    "sub_categories": [
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P934",
        "name": "Tool Belts",
        "slug": "tool-belts",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8Q",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P935",
        "name": "Storage Solutions",
        "slug": "storage solutions",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8Q",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P936",
        "name": "Workbench",
        "slug": "workbench",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8Q",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P937",
        "name": "Safety Gear",
        "slug": "safety-gear",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8Q",
        "sub_categories": []
      },
      {
        "id": "01M3FVQJF35CXZSV0KWKN4P938",
        "name": "Fasteners",
        "slug": "fasteners",
        "parent_id": "01M3FVQJEJY55HP50FJD58SX8Q",
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
