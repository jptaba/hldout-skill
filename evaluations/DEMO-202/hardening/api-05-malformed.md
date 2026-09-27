# API probe — POST https://automationintesting.online/api/message

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) · captured 2026-09-26T15:10:44.785Z
- Status: **500**
- Time: 467 ms
- Content-Type: application/json

## Request body

```json
{"name": "QA malformed", "email": 
```

## Response headers (redacted)

```json
{
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41332249ee0d9fb-EWR",
  "connection": "keep-alive",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 15:10:31 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=pSBi0qatL1ddBtt%2B1ktnigfpVjTYPVHLKGjF4lZAryDBqku2YW6Gtd4I%2BB%2FONamSafXiSgp0WEgCai9Sr6vhmlj2kjRBpGAYkbGWV1otpY%2FX5yXPwAgdvGLGTyiY%2FJ5Ttdo4GFxa%2Bee0tcdPerDLnJTeRR2CmC1y1A%3D%3D\"}]}",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "vary": "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
  "x-hikari-trace": "jfk1.57w5",
  "x-railway-edge": "jfk1",
  "x-railway-request-id": "pEC84nTSSLCNf5tCPvyhXg"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "error": "Failed to create message"
}
```

## Shape (types only)

```json
{
  "error": "string"
}
```
