# API probe — GET https://api.practicesoftwaretesting.com/products?page=6

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · captured 2026-10-05T00:59:17.421Z
- Status: **200**
- Time: 544 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "Content-Disposition",
  "cache-control": "max-age=120, public",
  "connection": "Upgrade, close",
  "content-encoding": "gzip",
  "content-length": "3129",
  "content-type": "application/json",
  "date": "Mon, 05 Oct 2026 00:59:17 GMT",
  "etag": "\"9effd5c004b0dcc5862cf39f8a95a0a3-gzip\"",
  "server": "Apache/2.4.52 (Ubuntu)",
  "upgrade": "h2",
  "vary": "Accept-Encoding"
}
```

## Response body (redacted, first 4000 of 9553 chars; --body-limit N for more)

```json
{
  "current_page": 6,
  "data": [
    {
      "id": "01M44NSBAYDZH66D42V5ENHBYH",
      "name": "Random Orbit Sander",
      "description": "Electric random orbit sander combining 14,000 RPM pad rotation with an eccentric 2.5mm orbital action pattern that produces a completely swirl-free finish on wood, lacquer, paint, and primer surfaces. The 125mm hook-and-loop pad accepts standard multi-hole sanding discs from 60 to 400 grit for quick, tool-free abrasive changes between roughing and finishing passes. A responsive 300W motor delivers consistent sanding power at every speed setting, from aggressive stock removal at full speed to delicate final finishing at reduced RPM using the variable speed dial. The random orbital motion means no two particles of abrasive ever follow the same path twice, eliminating the visible scratch patterns that plague standard orbital and belt sanders. The integrated micro-filter dust collection system captures over 90% of airborne particles at the source. Low vibration levels and an ergonomic palm-grip body make this the preferred finishing tool for furniture makers, cabinet shops, and automotive paint preparation.",
      "price": 100.79,
      "is_location_offer": false,
      "is_rental": false,
      "co2_rating": "E",
      "in_stock": true,
      "is_eco_friendly": false,
      "product_image": {
        "id": "01M44NSB7MSREQ969Q9983BTA7",
        "by_name": "Adi Goldstein",
        "by_url": "https://unsplash.com/@adigold1",
        "source_name": "Unsplash",
        "source_url": "https://unsplash.com/photos/aO4c6o4H2MI",
        "file_name": "sander03.avif",
        "title": "Random orbit sander"
      },
      "category": {
        "id": "01M44NSB700A1N91T5WRW6YVJS",
        "name": "Sander",
        "slug": "sander"
      },
      "brand": {
        "id": "01M44NSATNJ25ZNH4NTDW47XYT",
        "name": "ForgeFlex Tools"
      }
    },
    {
      "id": "01M44NSBB05XJM49WW17RN569D",
      "name": "Cordless Drill 20V",
      "description": "Versatile 20V cordless drill and driver featuring a high-capacity 4.0Ah lithium-ion battery that delivers sustained power for a full day of demanding drilling and fastening tasks on a single charge. The heavy-duty 13mm single-sleeve keyless chuck accepts a comprehensive range of drill bits, spade bits, hole saws, and driver accessories without the need for a chuck key. A two-speed all-metal gearbox provides 450 RPM in low gear for maximum torque fastening and 1,800 RPM in high gear for rapid drilling in wood, metal, and masonry materials. Twenty-plus-one torque settings on the adjustable clutch collar allow precise control over fastening depth to prevent cam-out and screw damage in different materials. An integrated LED work light automatically illuminates the drilling area when the trigger is touched, providing visibility in dark cabinets, ceiling cavities, and crawl spaces. Ideal for contractors, remodelers, and serious DIY enthusiasts who need portable, professional-grade power without being tethered to an extension cord.",
      "price": 125.23,
      "is_location_offer": true,
      "is_rental": false,
      "co2_rating": "E",
      "in_stock": true,
      "is_eco_friendly": false,
      "product_image": {
        "id": "01M44NSB7MSREQ969Q9983BTA8",
        "by_name": "Syed Hussaini",
        "by_url": "https://unsplash.com/@syhussaini",
        "source_name": "Unsplash",
        "source_url": "https://unsplash.com/photos/MXeDE_yCdHQ",
        "file_name": "drill01.avif",
        "title": "Cordless Drill"
      },
      "category": {
        "id": "01M44NSB700A1N91T5WRW6YVJV",
        "name": "Drill",
        "slug": "drill"
      },
      "brand": {
        "id": "01M44NSATNJ25ZNH4NTDW47XYT",
        "name": "ForgeFlex Tools"
      }
    },
    {
      "id": "01M44NSBB1VP6YMKNZCJ2947A7",
      "name": "Cordless Drill 24V",
      "description": "Professional-grade 24V cordless drill delivering an impressive 80Nm of peak torque through a heavy-duty all
```

## Top-level values (the clipped body in brief)

- current_page: 6
- from: 46
- last_page: 6
- per_page: 9
- to: 50
- total: 50

## Shape (types only)

```json
{
  "current_page": "number",
  "data": [
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
        "slug": "string"
      },
      "brand": {
        "id": "string",
        "name": "string"
      }
    }
  ],
  "from": "number",
  "last_page": "number",
  "per_page": "number",
  "to": "number",
  "total": "number"
}
```
