# API probe — GET https://automationintesting.online/api/message

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) · captured 2026-09-26T15:10:49.070Z
- Status: **200**
- Time: 267 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a413323f6c5730f5-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 15:10:35 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=gfNfas31uVyb95aIXNNZIFcOe1%2BsaIf1dp%2B5WrdaEb0BtojhC%2Bxx47qdeLWRCOh2T6AXaLsShgQWlb%2Bc8yS5yKTYZe8V3fRpFASuYRIszrtgdYm68olPyWunKuD%2BrDvKAMHadeHstvr3kFIVwI57L61Pfzq%2BAfg5pg%3D%3D\"}]}",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "vary": "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
  "x-hikari-trace": "jfk1.pqzh",
  "x-railway-edge": "jfk1",
  "x-railway-request-id": "SuSi73fjQDKBW7-Oqmzx2A"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "messages": [
    {
      "id": 1,
      "name": "James Dean",
      "read": false,
      "subject": "Booking enquiry"
    },
    {
      "id": 2,
      "name": "QA Probe",
      "read": false,
      "subject": "QA probe subject"
    },
    {
      "id": 3,
      "name": "QA probe",
      "read": false,
      "subject": "QA probe subject"
    }
  ]
}
```

## Shape (types only)

```json
{
  "messages": [
    {
      "id": "number",
      "name": "string",
      "read": "boolean",
      "subject": "string"
    }
  ]
}
```
