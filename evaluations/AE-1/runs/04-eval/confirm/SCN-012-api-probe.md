# API probe — POST https://automationexercise.com/api/searchProduct

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T05:48:07.640Z
- Status: **200** (all runs: 200, 200, 200)
- Time: 154 ms (min 146 / max 564)
- Content-Type: text/html; charset=utf-8

## Response headers (redacted)

```json
{
  "allow": "POST, PUT, DELETE, OPTIONS, GET",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41837b44bf4847d-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 05:48:07 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=6vjecLSivP51Ti8Egr2ZQsY2lRIPpvkKXvHNVQsJwWJTSojS7c8whxPUDngWTuNP%2FMo9m2U8svjOYerYjNEyJxhoKD%2FjyXPHZLjT5%2FNM6Q3F%2BF0tPDq5DXnpEUwnWja95zhfh7%2BEY%2BKT%2FaDI6%2BMKMBz1AGhI\"}]}",
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
  "responseCode": 400,
  "message": "Bad request, search_product parameter is missing in POST request."
}
```

## Shape (types only)

```json
{
  "responseCode": "number",
  "message": "string"
}
```
