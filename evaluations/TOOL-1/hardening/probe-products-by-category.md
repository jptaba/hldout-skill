# API probe — GET https://api.practicesoftwaretesting.com/products?by_category=01M3FVQJF35CXZSV0KWKN4P92S

- AUT: Toolshop (practicesoftwaretesting.com, Angular + Laravel API) (profile `toolshop`) · captured 2026-09-26T22:27:27.036Z
- Status: **200**
- Time: 604 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "Content-Disposition",
  "cache-control": "max-age=120, public",
  "connection": "Upgrade, close",
  "content-encoding": "gzip",
  "content-length": "3486",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 22:27:13 GMT",
  "etag": "\"50bd96307e93506c4ff4e61c3d253529-gzip\"",
  "server": "Apache/2.4.52 (Ubuntu)",
  "upgrade": "h2",
  "vary": "Accept-Encoding"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "current_page": 1,
  "data": [
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
        "slug": "hammer"
      },
      "brand": {
        "id": "01M3FVQJ4FMSC42TYW9PNY8GQ0",
        "name": "ForgeFlex Tools"
      }
    },
    {
      "id": "01M3FVQJH4C2M0ZRHSQ4EK2BKF",
      "name": "Hammer",
      "description": "A dependable standard claw hammer suitable for driving and removing nails in everyday construction, carpentry, and home improvement projects. The 350g carbon steel head is drop-forged and heat-treated for maximum hardness, then fitted to a traditional wooden handle that provides natural shock absorption with each strike. Well-balanced weight distribution between the head and handle ensures accurate strikes with minimal wrist effort, reducing fatigue during repetitive nailing tasks. The polished face resists rust and provides a smooth surface that drives nails cleanly without leaving marks on finish materials. A gently curved claw provides reliable nail extraction leverage without excessive force. This versatile hammer belongs in every toolbox, from professional carpentry workshops to home garages and apartment maintenance kits.",
      "price": 12.58,
      "is_location_offer": false,
      "is_rental": false,
      "co2_rating": "D",
      "in_stock": true,
      "is_eco_friendly": false,
      "product_image": {
        "id": "01M3FVQJFGPZ50PR394DJ56G56",
        "by_name": "Jozsef Hocza",
        "by_url": "https://unsplash.com/@hocza",
        "source_name": "Unsplash",
        "source_url": "https://unsplash.com/photos/D3nouOYbALc",
        "file_name": "hammer02.avif",
        "title": "Hammer"
      },
      "category": {
        "id": "01M3FVQJF35CXZSV0KWKN4P92S",
        "name": "Hammer",
        "slug": "hammer"
      },
      "brand": {
        "id": "01M3FVQJ4FMSC42TYW9PNY8GQ0",
        "name": "ForgeFlex Tools"
      }
    },
    {
      "id": "01M3FVQJH703254T4MM3Q4829K",
      "name": "Claw Hammer",
      "description": "Traditional claw hammer with a polished carbon steel head engineered for driving and removing nails with precision and confidence. The rubber-wrapped handle provides a secure, comfortable grip even in wet, dusty, or cold conditions where bare metal or wood handles would slip. At 500g, it offers the ideal balance between striking power and maneuverability for general carpentry, framing, and construction tasks. The curved claw design allows 
```

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
