# API probe — GET https://api.practicesoftwaretesting.com/products/01M3FVQJH1ENAMZYGWMYY5GC4R

- AUT: Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) · captured 2026-09-26T22:27:40.179Z
- Status: **200**
- Time: 517 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "Content-Disposition",
  "cache-control": "max-age=120, public",
  "connection": "Upgrade, close",
  "content-encoding": "gzip",
  "content-length": "1078",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 22:27:26 GMT",
  "etag": "\"d96ffe9033c765970326e575f2404b02-gzip\"",
  "server": "Apache/2.4.52 (Ubuntu)",
  "upgrade": "h2",
  "vary": "Accept-Encoding"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "id": "01M3FVQJH1ENAMZYGWMYY5GC4R",
  "name": "Claw Hammer with Shock Reduction Grip",
  "description": "Ergonomic claw hammer featuring an advanced shock reduction grip system that absorbs up to 70% of impact vibrations, protecting your wrist, elbow, and shoulder during prolonged nailing sessions. The 450g carbon steel head is precision-balanced and heat-treated for maximum hardness, ensuring accurate nail driving with minimal effort on every swing. The curved claw design effortlessly removes nails without damaging surrounding wood surfaces, making it equally useful for construction and renovation work. A fiberglass-reinforced handle combines lightweight strength with exceptional durability that far outlasts traditional wooden handles. The overmolded soft-grip zone conforms to your hand shape for a custom-feeling, fatigue-free hold throughout long working days. Recommended for professional framing, carpentry, and renovation projects where operator comfort matters as much as striking performance.",
  "price": 13.41,
  "is_location_offer": true,
  "is_rental": false,
  "co2_rating": "D",
  "in_stock": true,
  "is_eco_friendly": false,
  "product_image": {
    "id": "01M3FVQJFGPZ50PR394DJ56G55",
    "by_name": "iMattSmart",
    "by_url": "https://unsplash.com/@imattsmart",
    "source_name": "Unsplash",
    "source_url": "https://unsplash.com/photos/jaLaLQdkBOE",
    "file_name": "hammer01.avif",
    "title": "Claw Hammer"
  },
  "category": {
    "id": "01M3FVQJF35CXZSV0KWKN4P92S",
    "name": "Hammer",
    "slug": "hammer",
    "parent_id": "01M3FVQJEJY55HP50FJD58SX8N"
  },
  "brand": {
    "id": "01M3FVQJ4FMSC42TYW9PNY8GQ0",
    "name": "ForgeFlex Tools"
  },
  "specs": [
    {
      "id": "01M3FVQK37KCRQD2SGE0E53A38",
      "product_id": "01M3FVQJH1ENAMZYGWMYY5GC4R",
      "spec_name": "Handle Material",
      "spec_value": "Fiberglass",
      "spec_unit": null
    },
    {
      "id": "01M3FVQK37KCRQD2SGE0E53A35",
      "product_id": "01M3FVQJH1ENAMZYGWMYY5GC4R",
      "spec_name": "Head Weight",
      "spec_value": "450",
      "spec_unit": "g"
    },
    {
      "id": "01M3FVQK37KCRQD2SGE0E53A36",
      "product_id": "01M3FVQJH1ENAMZYGWMYY5GC4R",
      "spec_name": "Length",
      "spec_value": "330",
      "spec_unit": "mm"
    },
    {
      "id": "01M3FVQK37KCRQD2SGE0E53A37",
      "product_id": "01M3FVQJH1ENAMZYGWMYY5GC4R",
      "spec_name": "Material",
      "spec_value": "Carbon Steel",
      "spec_unit": null
    },
    {
      "id": "01M3FVQK37KCRQD2SGE0E53A39",
      "product_id": "01M3FVQJH1ENAMZYGWMYY5GC4R",
      "spec_name": "Warranty",
      "spec_value": "5",
      "spec_unit": "years"
    },
    {
      "id": "01M3FVQK37KCRQD2SGE0E53A34",
      "product_id": "01M3FVQJH1ENAMZYGWMYY5GC4R",
      "spec_name": "Weight",
      "spec_value": "567",
      "spec_unit": "g"
    }
  ]
}
```

## Shape (types only)

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "is_location_offer": "boolean",
  "is_rental": "boolean",
  "co2_rating": "string",
  "in_stock": "boolean",
  "is_eco_friendly": "boolean",
  "product_image": {
    "id": "string",
    "by_name": "string",
    "by_url": "string",
    "source_name": "string",
    "source_url": "string",
    "file_name": "string",
    "title": "string"
  },
  "category": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "parent_id": "string"
  },
  "brand": {
    "id": "string",
    "name": "string"
  },
  "specs": [
    {
      "id": "string",
      "product_id": "string",
      "spec_name": "string",
      "spec_value": "string",
      "spec_unit": "null"
    }
  ]
}
```
