# API probe — GET https://automationintesting.online/api/message

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) · captured 2026-09-26T15:10:46.764Z
- Status: **200**
- Time: 467 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a4133230dc6541a6-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 15:10:33 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=oT1KnKKwXgpKI3%2FWcMAsHFeDJcmIpaWXJCBHtK1MKRHbQkcoW9d9s4Aq9NwM%2F6rUGh9%2F4mfsc7fergm9N1wsZCtT09VAHHORAeHJOdElLKZqP1fjm0yOhaez3r5BFHaL7k2vFuLBeRIf8iFqeifaDmKzyMbTLXampg%3D%3D\"}]}",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "vary": "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
  "x-hikari-trace": "jfk1.57w5",
  "x-railway-edge": "jfk1",
  "x-railway-request-id": "GT4QbS6BRv6sEiN_g4a9AQ"
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
