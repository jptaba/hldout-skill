# API probe — POST https://automationintesting.online/api/message

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) · captured 2026-09-26T15:26:22.113Z
- Status: **200**
- Time: 536 ms
- Content-Type: application/json

## Request body

```json
{
  "name": "QA Idem",
  "email": "qa.guest@example.com",
  "phone": "01234567890",
  "subject": "QA idem confirm 1790436378",
  "description": "QA held-out evaluation enquiry please ignore."
}
```

## Response headers (redacted)

```json
{
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41349067b8ec47d-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 15:26:08 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=yXcc40ywW6O8avPJiCfFWqLuIqR6RgjhrwmtTsOIsLNHbN4p%2FGkm6gQr0AyNiAvIVK1iQkzxoFMDY86qBvsluTk3Ns%2F0aBrDWroZsshydJQQHxmKKAnzCSrFNZ6BwV2FnM87nsD1sbPXCXEmCDHNEB48FUFcPlj8QQ%3D%3D\"}]}",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "vary": "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
  "x-hikari-trace": "jfk1.57w5",
  "x-railway-edge": "jfk1",
  "x-railway-request-id": "LpVSFx_7Rcmvj7kcezItjw"
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
