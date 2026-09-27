# API probe — POST https://automationintesting.online/api/message

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) · captured 2026-09-26T15:26:20.013Z
- Status: **200**
- Time: 480 ms
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
  "cf-ray": "a41348f9bdba983e-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 15:26:06 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=rUlZg9uRte%2Fp%2BKS3atbFqfjNOrMMQT7UZVHYOm%2BQ04S6T5sVFOxAN6E4BSsIn%2B8iv2wiW8UvpIePhN3C5flIMaLL4wOCGe4P197k%2F7ql2iOqIrET%2FmPFfofEnwzoBS04CNAiPS0bBWc0kTfheFtZp7e3Q56MRysvLg%3D%3D\"}]}",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "vary": "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
  "x-hikari-trace": "jfk1.pqzh",
  "x-railway-edge": "jfk1",
  "x-railway-request-id": "k2eDp6LjTR--dQEa8u2xcg"
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
