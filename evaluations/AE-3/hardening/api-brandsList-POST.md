# API probe — POST https://automationexercise.com/api/brandsList

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T12:05:30.548Z
- Status: **200**
- Time: 591 ms
- Content-Type: text/html; charset=utf-8

## Response headers (redacted)

```json
{
  "allow": "POST, PUT, OPTIONS, GET, DELETE",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41a607fbd6d437f-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 12:05:30 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=0yg5BvsuMEDlVmQMbNloSVQSEcdjQZ8ueb8mrnUzXfZ%2F0DUl0TdZN5eQ9A%2BvZusZEcNOqZn8anqpbiKO4vNLH1OpboxMAR1tV3UpydeLDoOJlO63jrFiSdENpuAt2%2B%2BjNosaTwkA2dXA9Dv5vK4z6eEsSTVK\"}]}",
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
