# API probe — GET https://automationintesting.online/api/message

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) · captured 2026-09-26T15:17:18.062Z
- Status: **200**
- Time: 264 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a4133bbe9ad5429e-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 15:17:04 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=0VMf2XJ5eARLLzrp0vHYBEiFMG1E0ZSBI6InNlFQbiQiuO4PBCZSGL12iLQB6m2s8CXHxJuHh3Ke%2FLDxEZPB7ACF%2F8TDeLGgB0lGe5ccpBuPkRdMj44FXKfqy7Qpt3MHITw3KvI8eyETv205AehdxC5dNkN8JgyXfA%3D%3D\"}]}",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "vary": "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
  "x-hikari-trace": "jfk1.57w5",
  "x-railway-edge": "jfk1",
  "x-railway-request-id": "3qSB9KPiSU-mog9QU79b0g"
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
    },
    {
      "id": 4,
      "name": "QA Guest ij2v6b6g-1",
      "read": false,
      "subject": "QA Subject ij2v6b78-2"
    },
    {
      "id": 5,
      "name": "QA Guest ij2zovny-5",
      "read": false,
      "subject": "QA Subject ij2zovzp-6"
    },
    {
      "id": 6,
      "name": "qq",
      "read": false,
      "subject": "QA Subject ij30xqya-6"
    },
    {
      "id": 7,
      "name": "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
      "read": false,
      "subject": "QA Subject ij31hzu9-8"
    },
    {
      "id": 8,
      "name": "q",
      "read": false,
      "subject": "QA Subject ij31inza-2"
    },
    {
      "id": 9,
      "name": "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
      "read": false,
      "subject": "QA Subject ij31u420-2"
    },
    {
      "id": 10,
      "name": "QA Guest ij32am21-3",
      "read": false,
      "subject": "QA Subject ij32amyp-4"
    },
    {
      "id": 11,
      "name": "QA Guest ij331zwi-1",
      "read": false,
      "subject": "QA Subject ij331z0t-2"
    },
    {
      "id": 12,
      "name": "QA Guest ij33l52w-3",
      "read": false,
      "subject": "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
    },
    {
      "id": 13,
      "name": "QA Guest ij33k9cy-9",
      "read": false,
      "subject": "qqqqq"
    },
    {
      "id": 14,
      "name": "QA Guest ij342z4l-5",
      "read": false,
      "subject": "QA Subject ij342z13-6"
    },
    {
      "id": 15,
      "name": "QA Guest ij344xlg-11",
      "read": false,
      "subject": "QA Subject ij344xqk-12"
    },
    {
      "id": 16,
      "name": "QA Guest ij34loyg-13",
      "read": false,
      "subject": "QA Subject ij34loz4-14"
    },
    {
      "id": 17,
      "name": "QA Guest ij34kk8e-7",
      "read": false,
      "subject": "QA Subject ij34kkwg-8"
    },
    {
      "id": 18,
      "name": "QA Guest ij37oo0q-1",
      "read": false,
      "subject": "QA Subject ij37ooi5-2"
    },
    {
      "id": 19,
      "name": "ttt ttt",
      "read": false,
      "subject": "You have a new booking!"
    },
    {
      "id": 20,
      "name": "QA Guest ij7m9rdo-1",
      "read": false,
      "subject": "QA Subject ij7m9r88-2"
    },
    {
      "id": 21,
      "name": "QA Guest ij7oye2s-3",
      "read": false,
      "subject": "QA Subject ij7oyeqc-4"
    },
    {
      "id": 22,
      "name": "q",
      "read": false,
      "subject": "QA Subject ij7qai8o-4"
    },
    {
      "id": 23,
      "name": "QA Guest ij7qu4tq-1",
      "read": false,
      "subject": "QA Subject ij7qu4dv-2"
    },
    {
      "id": 24,
      "name": "qq",
      "read": false,
      "subject": "QA Subject ij7ram1s-6"
    },
    {
      "id": 25,
      "name": "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
      "read": false,
      "subject": "QA Subject ij7rqicd-8"
    },
    {
      "id": 26,
      "name": "q",
      "read": false,
      "subject": "QA Subject ij7sat76-2"
    },
    {
      "id": 27,
      "name": "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
      "read": false,
      "subject": "QA Subject ij7sinbq-2"
    },
    {
      "id": 28,
      "name": "QA Guest ij7sz9qa-3",
      "read": false,
      "subject": "QA Subject ij7sz99p-4"
    },
    {
      "id": 29,
      "name": "QA Guest ij7tea92-5",
      "read": false,
      "subject": "QA Subject ij7tea43-6"
    },
    {
      "id": 30,
      "name": "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
      "read": false,
      "subject": "QA Subject ij7tkkrr-2"
    },
    {
      "id": 31,
      "name": "QA Guest ij7udc4b-3",
      "read"
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
