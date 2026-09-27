# API probe — PUT https://restful-booker.herokuapp.com/booking/4255

- AUT: Restful Booker (booking API demo) (profile `restful-booker`) · captured 2026-09-26T16:09:51.748Z
- Status: **405**
- Time: 326 ms
- Content-Type: text/plain; charset=utf-8

## Request body

```json
{
  "firstname": "QA confirm",
  "lastname": "Heldout confirm",
  "totalprice": 150,
  "depositpaid": true,
  "bookingdates": {
    "checkin": "2026-11-10",
    "checkout": "2026-11-14"
  }
}
```

## Response headers (redacted)

```json
{
  "content-length": "18",
  "content-type": "text/plain; charset=utf-8",
  "date": "Sat, 26 Sep 2026 16:09:38 GMT",
  "etag": "W/\"12-UGJMK66P4abaBlq0vKHJaCKuGCA\"",
  "nel": "{\"report_to\":\"heroku-nel\",\"response_headers\":[\"Via\"],\"max_age\":3600,\"success_fraction\":0.01,\"failure_fraction\":0.1}",
  "report-to": "{\"group\":\"heroku-nel\",\"endpoints\":[{\"url\":\"https://nel.heroku.com/reports?s=vVCYqmmliNJ5g6oa8UmFM8n0VEbQtN7RqIJ7bg5MIUY%3D\\u0026sid=c46efe9b-d3d2-4a0c-8c76-bfafa16c5add\\u0026ts=1790438978\"}],\"max_age\":3600}",
  "reporting-endpoints": "heroku-nel=\"https://nel.heroku.com/reports?s=vVCYqmmliNJ5g6oa8UmFM8n0VEbQtN7RqIJ7bg5MIUY%3D&sid=c46efe9b-d3d2-4a0c-8c76-bfafa16c5add&ts=1790438978\"",
  "server": "Heroku",
  "via": "1.1 heroku-router",
  "x-powered-by": "Express"
}
```

## Response body (redacted, first 4000 chars)

```json
Method Not Allowed
```
