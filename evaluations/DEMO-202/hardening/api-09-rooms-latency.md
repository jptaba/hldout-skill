# API probe — GET https://automationintesting.online/api/room

- AUT: Shady Meadows B&B (Restful Booker Platform demo) (profile `shady-meadows`) · captured 2026-09-26T15:10:54.366Z
- Status: **200** (all runs: 200, 200, 200, 200, 200)
- Time: 273 ms (min 251 / max 466)
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41332607b358815-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sat, 26 Sep 2026 15:10:40 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=1ntIklN2Cu8xo2OWBbnknfjV8KXcFxphnlhRLBcW3QJ57Zp1jtCFC4YhB1kMncdVXAwEfFCqnvCwjEjjMDvLRLpgg%2B3M6TPsRhEp01ox8uezO1WM8zIBlE9QDeJ0igUfAbGOrktINuqj0SGcNk8bOLLqt5OypqcnSQ%3D%3D\"}]}",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "vary": "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch",
  "x-hikari-trace": "jfk1.57w5",
  "x-railway-edge": "jfk1",
  "x-railway-request-id": "Fhoi7nMnQkiv1O2Kg4a9AQ"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "rooms": [
    {
      "accessible": true,
      "description": "Aenean porttitor mauris sit amet lacinia molestie. In posuere accumsan aliquet. Maecenas sit amet nisl massa. Interdum et malesuada fames ac ante.",
      "features": [
        "TV",
        "WiFi",
        "Safe"
      ],
      "image": "/images/room1.jpg",
      "roomName": "101",
      "roomPrice": 100,
      "roomid": 1,
      "type": "Single"
    },
    {
      "accessible": true,
      "description": "Vestibulum sollicitudin, lectus ac mollis consequat, lorem orci ultrices tellus, eleifend euismod tortor dui egestas erat. Phasellus et ipsum nisl. ",
      "features": [
        "TV",
        "Radio",
        "Safe"
      ],
      "image": "/images/room2.jpg",
      "roomName": "102",
      "roomPrice": 150,
      "roomid": 2,
      "type": "Double"
    },
    {
      "accessible": true,
      "description": "Etiam metus metus, fringilla ac sagittis id, consequat vel neque. Nunc commodo quis nisl nec posuere. Etiam at accumsan ex. ",
      "features": [
        "Radio",
        "WiFi",
        "Safe"
      ],
      "image": "/images/room3.jpg",
      "roomName": "103",
      "roomPrice": 225,
      "roomid": 3,
      "type": "Suite"
    }
  ]
}
```

## Shape (types only)

```json
{
  "rooms": [
    {
      "accessible": "boolean",
      "description": "string",
      "features": [
        "string"
      ],
      "image": "string",
      "roomName": "string",
      "roomPrice": "number",
      "roomid": "number",
      "type": "string"
    }
  ]
}
```
