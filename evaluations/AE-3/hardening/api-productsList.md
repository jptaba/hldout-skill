# API probe — GET https://automationexercise.com/api/productsList

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T12:05:15.450Z
- Status: **200**
- Time: 616 ms
- Content-Type: text/html; charset=utf-8

## Response headers (redacted)

```json
{
  "allow": "POST, PUT, OPTIONS, GET, DELETE",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41a60213f6bc52b-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 12:05:15 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=4CQLBRNg2ToWTu7EA69DMzIRKECZ1h1OIHEFAZOOIJW1NWI9ss3DQNbWf8yFwNdMrxVgW5X62X9kctvvsnLSYvRobsfk8JFlXM6Aos4lXNSBqjvPwM7Hk3ytOU54paiyOtBKu4Gsk7XCOur3vmVPqrZL0PdC\"}]}",
  "server": "cloudflare",
  "status": "200 OK",
  "transfer-encoding": "chunked",
  "vary": "Accept,Cookie,Accept-Encoding",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-powered-by": "Phusion Passenger(R) 6.1.8"
}
```

## Response body (redacted, first 800 of 8410 chars; --body-limit N for more)

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
