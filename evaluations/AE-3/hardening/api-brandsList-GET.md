# API probe — GET https://automationexercise.com/api/brandsList

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T12:05:27.754Z
- Status: **200**
- Time: 623 ms
- Content-Type: text/html; charset=utf-8

## Response headers (redacted)

```json
{
  "allow": "POST, PUT, OPTIONS, GET, DELETE",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41a606e1b9d983e-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 12:05:27 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=yh%2BmO8%2BLdzck2CkmhTRRlGkGRqn1VVsEFElRSU%2BeP7NSiBjIpB%2BmINwdhejLac1njwf14cxRB7USvePWMzZ5x%2BXcrATxDneMzE%2FlCTVcZcjS1r1Ht%2FRivYny00Pc54ImHrBuXmYrwljCsx0y0Iks%2FYsCG3DD\"}]}",
  "server": "cloudflare",
  "status": "200 OK",
  "transfer-encoding": "chunked",
  "vary": "Accept,Cookie,Accept-Encoding",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-powered-by": "Phusion Passenger(R) 6.1.8"
}
```

## Response body (redacted, first 300 of 1879 chars; --body-limit N for more)

```json
{
  "responseCode": 200,
  "brands": [
    {
      "id": 1,
      "brand": "Polo"
    },
    {
      "id": 2,
      "brand": "H&M"
    },
    {
      "id": 3,
      "brand": "Madame"
    },
    {
      "id": 4,
      "brand": "Madame"
    },
    {
      "id": 5,
      "brand": "Mast & Harbour"
    }
```

## Shape (types only)

```json
{
  "responseCode": "number",
  "brands": [
    {
      "id": "number",
      "brand": "string"
    }
  ]
}
```
