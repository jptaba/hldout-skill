# API probe — DELETE https://automationexercise.com/api/brandsList

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T12:05:31.890Z
- Status: **200**
- Time: 567 ms
- Content-Type: text/html; charset=utf-8

## Response headers (redacted)

```json
{
  "allow": "POST, PUT, OPTIONS, GET, DELETE",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41a6088484b4f3a-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 12:05:31 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=6EUjYvgpEKUgWSBRYo7whqqNaSaqn%2BPiHIjAhGh3a6Zq%2F%2FVLMsd5v2IMGizgWIPUuS3W1flNfBlSk%2BhcHYb45GdudazdkQEL7ymTjw2Ygq1KnkCrM3pusCKb9hg1f63s%2FQF%2FCxXyLD5WY7Ly%2FAce5%2B9y1jAQ\"}]}",
  "server": "cloudflare",
  "status": "200 OK",
  "transfer-encoding": "chunked",
  "vary": "Accept,Cookie,Accept-Encoding",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-powered-by": "Phusion Passenger(R) 6.1.8"
}
```

## Response body (redacted)

```json
{
  "responseCode": 405,
  "message": "This request method is not supported."
}
```

## Shape (types only)

```json
{
  "responseCode": "number",
  "message": "string"
}
```
