# API probe — POST https://automationintesting.online/api/message

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) · captured 2026-09-26T15:10:42.733Z
- Status: **200**
- Time: 500 ms
- Content-Type: application/json

## Request body

```json
{
  "name": "QA probe",
  "email": "qa.guest@example.com",
  "phone": "01234567890",
  "subject": "QA probe subject",
  "description": "QA held-out evaluation enquiry please ignore."
}
```

## Response headers (redacted)

```json
{
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a4133217bb5c643e-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 15:10:29 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=laHzuvlgd9CsR7p03QwPdT%2FoUz2fPUt%2B9rHFqBJHJTVDLx09PjbyRst3dQ%2BpkAEG%2BaAxs%2BhpODy8Y74xz0qxZpF3Ca63r1st%2B80mFSFkjksuCq9mQLEcEpEN1fSy1JJuFhBxo4RBSV0vS0oHhDquf1Wk8lYKCr4jiw%3D%3D\"}]}",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "vary": "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
  "x-hikari-trace": "jfk1.57w5",
  "x-railway-edge": "jfk1",
  "x-railway-request-id": "lllLsYjKR6aFiLy8BT7zVQ"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "success": true
}
```

## Shape (types only)

```json
{
  "success": "boolean"
}
```
