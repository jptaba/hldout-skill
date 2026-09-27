# API probe — POST https://automationexercise.com/api/searchProduct

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T05:40:52.052Z
- Status: **200**
- Time: 620 ms
- Content-Type: text/html; charset=utf-8

## Request body

```json
search_product=jean
```

## Response headers (redacted)

```json
{
  "allow": "POST, PUT, DELETE, OPTIONS, GET",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a4182d0ffed1c334-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 05:40:52 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=oVHmaqy2xWB9te8rYvDvhZjV0d608lekT3vKkcNr5q9GSgev2lqDlTbTgptmuAUd8UTSka%2BFxsVqbE0KYaa3cI2f40uRloAeCXbhFlT3MyOGzxvSlVXSLb0tSyolYKlP2kUY57Di56VGZ1xbiwYlU8pMH8zu\"}]}",
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
      "id": 33,
      "name": "Soft Stretch Jeans",
      "price": "Rs. 799",
      "brand": "Polo",
      "category": {
        "usertype": {
          "usertype": "Men"
        },
        "category": "Jeans"
      }
    },
    {
      "id": 35,
      "name": "Regular Fit Straight Jeans",
      "price": "Rs. 1200",
      "brand": "H&M",
      "category": {
        "usertype": {
          "usertype": "Men"
        },
        "category": "Jeans"
      }
    },
    {
      "id": 37,
      "name": "Grunt Blue Slim Fit Jeans",
      "price": "Rs. 1400",
      "brand": "Polo",
      "category": {
        "usertype": {
          "usertype": "Men"
        },
        "category": "Jeans"
      }
    }
  ]
}
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
