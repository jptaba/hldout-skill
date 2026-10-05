# API probe — GET https://api.practicesoftwaretesting.com/products?sort=price,asc&page=2

- AUT: Practice Software Testing (profile `practicesoftwaretesting`) · captured 2026-10-05T00:59:21.344Z
- Status: **200**
- Time: 551 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "access-control-allow-origin": "*",
  "access-control-expose-headers": "Content-Disposition",
  "cache-control": "max-age=120, public",
  "connection": "Upgrade, close",
  "content-encoding": "gzip",
  "content-length": "4626",
  "content-type": "application/json",
  "date": "Mon, 05 Oct 2026 00:59:21 GMT",
  "etag": "\"4e8fe4a23e372708a54215bc9f06e9eb-gzip\"",
  "server": "Apache/2.4.52 (Ubuntu)",
  "upgrade": "h2",
  "vary": "Accept-Encoding"
}
```

## Response body (redacted, first 4000 of 15488 chars; --body-limit N for more)

```json
{
  "current_page": 2,
  "data": [
    {
      "id": "01M44NSB9PMAGWAHGXC3CZMZFB",
      "name": "Measuring Tape",
      "description": "Standard 5-meter measuring tape with a durable 19mm steel blade and reliable automatic retraction mechanism for quick, hassle-free measurements in the workshop, on the job site, or around the home. The precision-riveted end hook features controlled play that automatically compensates for accurate inside and outside measurements, eliminating a common source of measuring error. A thumb-operated blade lock clicks firmly into place to hold your measurement while you mark, transfer dimensions, or record numbers. Clear metric graduations are printed in fade-resistant ink that remains legible even after years of heavy use and repeated blade extension cycles. The compact, lightweight ABS housing fits comfortably in a trouser pocket, tool belt pouch, or apron for all-day portability without adding noticeable weight. An affordable, dependable measuring tool that every tradesperson, crafter, and homeowner should have within arms reach.",
      "price": 10.07,
      "is_location_offer": false,
      "is_rental": false,
      "co2_rating": "C",
      "in_stock": true,
      "is_eco_friendly": false,
      "product_image": {
        "id": "01M44NSB7MSREQ969Q9983BTAK",
        "by_name": "Diana Polekhina",
        "by_url": "https://unsplash.com/@diana_pole",
        "source_name": "Unsplash",
        "source_url": "https://unsplash.com/photos/silver-and-black-necklace-on-yellow-textile-iUfusOthmgQ",
        "file_name": "measure02.avif",
        "title": "Measuring Tape"
      },
      "category": {
        "id": "01M44NSB700A1N91T5WRW6YVJQ",
        "name": "Measures",
        "slug": "measures"
      },
      "brand": {
        "id": "01M44NSATNJ25ZNH4NTDW47XYT",
        "name": "ForgeFlex Tools"
      }
    },
    {
      "id": "01M44NSB8XV9HXVX5XG8AK1DFZ",
      "name": "Thor Hammer",
      "description": "The legendary Thor Hammer combines premium craftsmanship with raw striking power in a tool that is truly built to last generations. Forged from Uru metal with a hand-wrapped leather grip, this extraordinary 5kg masterpiece delivers unmatched impact force for the most demanding demolition, forging, and heavy construction tasks. The perfectly balanced oversized head ensures every swing transfers maximum energy to the target, while the enlarged striking face covers more surface area than any conventional hammer. Despite its impressive mass, the ergonomic handle design and precise weight distribution allow for surprisingly controlled, accurate swings. This is not merely a tool but a statement piece for those who accept nothing less than the absolute best in their workshop. Comes with a lifetime warranty because true legends never fade. Please note: only one Thor Hammer is permitted per customer.",
      "price": 11.14,
      "is_location_offer": false,
      "is_rental": false,
      "co2_rating": "D",
      "in_stock": true,
      "is_eco_friendly": false,
      "product_image": {
        "id": "01M44NSB7MSREQ969Q9983BT9T",
        "by_name": "ANIRUDH",
        "by_url": "https://unsplash.com/@lanirudhreddy",
        "source_name": "Unsplash",
        "source_url": "https://unsplash.com/photos/3esjG-nlgyk",
        "file_name": "hammer04.avif",
        "title": "Hammer"
      },
      "category": {
        "id": "01M44NSB700A1N91T5WRW6YVJH",
        "name": "Hammer",
        "slug": "hammer"
      },
      "brand": {
        "id": "01M44NSATNJ25ZNH4NTDW47XYT",
        "name": "ForgeFlex Tools"
      }
    },
    {
      "id": "01M44NSB8WEXVMWX9W2B8KSWD4",
      "name": "Claw Hammer",
      "description": "Traditional claw hammer with a polished carbon steel head engineered for driving and removing nails with precision and confidence. The rubber-wrapped handle provides a secure, comfortable grip even in wet, dusty, or cold conditions where bare metal or wood handles would slip. At 500g, it offers the ide
```

## Top-level values (the clipped body in brief)

- current_page: 2
- from: 10
- last_page: 6
- per_page: 9
- to: 18
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
