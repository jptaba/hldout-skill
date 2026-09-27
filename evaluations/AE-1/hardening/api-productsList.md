# API probe — GET https://automationexercise.com/api/productsList

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T05:40:39.826Z
- Status: **200**
- Time: 608 ms
- Content-Type: text/html; charset=utf-8

## Response headers (redacted)

```json
{
  "allow": "POST, PUT, DELETE, OPTIONS, GET",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a4182cc3897c8f77-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 05:40:39 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=%2B6q9zAhGbIHKnhEdLAvm4PW2eQG30kh2pDVRE5RXwj3dPsDW2%2Bcsldr9%2B2ey4BZ5Lr2%2FrvP5eh8Zky7Y5%2BrWEPvTdpzpOWghkFqQn3tE9ciIAZmhjtNAyYar5FnUA96OyResCymSdFZ6URMRsiHqSgjsjDAq\"}]}",
  "server": "cloudflare",
  "status": "200 OK",
  "transfer-encoding": "chunked",
  "vary": "Accept,Cookie,Accept-Encoding",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-powered-by": "Phusion Passenger(R) 6.1.8"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "responseCode": 200,
  "products": [
    {
      "id": 1,
      "name": "Blue Top",
      "price": "Rs. 500",
      "brand": "Polo",
      "category": {
        "usertype": {
          "usertype": "Women"
        },
        "category": "Tops"
      }
    },
    {
      "id": 2,
      "name": "Men Tshirt",
      "price": "Rs. 400",
      "brand": "H&M",
      "category": {
        "usertype": {
          "usertype": "Men"
        },
        "category": "Tshirts"
      }
    },
    {
      "id": 3,
      "name": "Sleeveless Dress",
      "price": "Rs. 1000",
      "brand": "Madame",
      "category": {
        "usertype": {
          "usertype": "Women"
        },
        "category": "Dress"
      }
    },
    {
      "id": 4,
      "name": "Stylish Dress",
      "price": "Rs. 1500",
      "brand": "Madame",
      "category": {
        "usertype": {
          "usertype": "Women"
        },
        "category": "Dress"
      }
    },
    {
      "id": 5,
      "name": "Winter Top",
      "price": "Rs. 600",
      "brand": "Mast & Harbour",
      "category": {
        "usertype": {
          "usertype": "Women"
        },
        "category": "Tops"
      }
    },
    {
      "id": 6,
      "name": "Summer White Top",
      "price": "Rs. 400",
      "brand": "H&M",
      "category": {
        "usertype": {
          "usertype": "Women"
        },
        "category": "Tops"
      }
    },
    {
      "id": 7,
      "name": "Madame Top For Women",
      "price": "Rs. 1000",
      "brand": "Madame",
      "category": {
        "usertype": {
          "usertype": "Women"
        },
        "category": "Tops"
      }
    },
    {
      "id": 8,
      "name": "Fancy Green Top",
      "price": "Rs. 700",
      "brand": "Polo",
      "category": {
        "usertype": {
          "usertype": "Women"
        },
        "category": "Tops"
      }
    },
    {
      "id": 11,
      "name": "Sleeves Printed Top - White",
      "price": "Rs. 499",
      "brand": "Babyhug",
      "category": {
        "usertype": {
          "usertype": "Kids"
        },
        "category": "Tops & Shirts"
      }
    },
    {
      "id": 12,
      "name": "Half Sleeves Top Schiffli Detailing - Pink",
      "price": "Rs. 359",
      "brand": "Babyhug",
      "category": {
        "usertype": {
          "usertype": "Kids"
        },
        "category": "Tops & Shirts"
      }
    },
    {
      "id": 13,
      "name": "Frozen Tops For Kids",
      "price": "Rs. 278",
      "brand": "Allen Solly Junior",
      "category": {
        "usertype": {
          "usertype": "Kids"
        },
        "category": "Tops & Shirts"
      }
    },
    {
      "id": 14,
      "name": "Full Sleeves Top Cherry - Pink",
      "price": "Rs. 679",
      "brand": "Kookie Kids",
      "category": {
        "usertype": {
          "usertype": "Kids"
        },
        "category": "Tops & Shirts"
      }
    },
    {
      "id": 15,
      "name": "Printed Off Shoulder Top - White",
      "price": "Rs. 315",
      "brand": "Babyhug",
      "category": {
        "usertype": {
          "usertype": "Kids"
        },
        "category": "Tops & Shirts"
      }
    },
    {
      "id": 16,
      "name": "Sleeves Top and Short - Blue & Pink",
      "price": "Rs. 478",
      "brand": "Babyhug",
      "category": {
        "usertype": {
          "usertype": "Kids"
        },
        "category": "Dress"
      }
    },
    {
      "id": 18,
      "name": "Little Girls Mr. Panda Shirt",
      "price": "Rs. 1200",
      "brand": "Kookie Kids",
      "category": {
        "usertype": {
          "usertype": "Kids"
        },
        "category": "Tops & Shirts"
      }
    },
    {
      "id": 19,
      "name": "Sleeveless Unicorn Patch Gown - Pink",
      "price": "Rs. 1050",
      "brand": "Allen Solly Junior",
      "category": {
        "usertype": {
          "usertype": "Kids"
        },
        "category": "Dress"
      }
    },
    {
      "id": 20,
      "name": "Cotton Mull Embroidered 
```

## Shape (types only)

```json
{
  "responseCode": "number",
  "products": [
    {
      "id": "number",
      "name": "string",
      "price": "string",
      "brand": "string",
      "category": {
        "usertype": {
          "usertype": "string"
        },
        "category": "string"
      }
    }
  ]
}
```
