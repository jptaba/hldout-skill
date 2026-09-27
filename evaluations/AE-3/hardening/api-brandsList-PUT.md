# API probe — PUT https://automationexercise.com/api/brandsList

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T12:05:29.174Z
- Status: **200**
- Time: 648 ms
- Content-Type: text/html; charset=utf-8

## Response headers (redacted)

```json
{
  "allow": "OPTIONS, GET, DELETE, POST, PUT",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41a6076dcb7729e-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 12:05:29 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=nBvLy5D7%2Bfsc5336cSHnrRmZxm4fHVEBJXKycb6DphR7QmKxtejhRRg9WI5ofOQVIiVou8EUQZ01krKNqBGj52WgSWVH51ECXdTxilYQcKHNGQkEYVHDhqrXwjZ6K7CBADTBHehQ8J1tMn0T%2FjtnjYCqG5Ca\"}]}",
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
