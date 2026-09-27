# API probe — GET https://automationintesting.online/api/room/100003

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) · captured 2026-09-26T15:10:51.187Z
- Status: **500**
- Time: 516 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a413324c59e4c411-EWR",
  "connection": "keep-alive",
  "content-encoding": "gzip",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 15:10:37 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=2BxycoD7qcJhf5kOdzsmAiW6jw7cmXL%2B3v53E2ngTbYCSh6Fw01DJWJrouREPP2URdkQen6SD1fT4XfNddGkeJG4avzDhNOY42h8ma7Ze%2FLn5%2Bixxi6Qi0nGyjRlRsWzpxCbwPIuUMeoOIj0KsloL8Txnx8XfiV1PA%3D%3D\"}]}",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "vary": "Accept-Encoding",
  "x-hikari-trace": "jfk1.57w5",
  "x-railway-edge": "jfk1",
  "x-railway-request-id": "bTcksUBATOyYEKYhCx5-qw"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "timestamp": "2026-09-26T15:10:37.682Z",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/room/100003"
}
```

## Shape (types only)

```json
{
  "timestamp": "string",
  "status": "number",
  "error": "string",
  "path": "string"
}
```
