# API probe — POST https://automationexercise.com/api/searchProduct

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T05:40:53.348Z
- Status: **200**
- Time: 567 ms
- Content-Type: text/html; charset=utf-8

## Response headers (redacted)

```json
{
  "allow": "POST, PUT, DELETE, OPTIONS, GET",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a4182d186dd0659d-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 05:40:53 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=hNt%2Ftt4N18xG1JK%2FhgD7sP%2B4WHa7DQb0BvPmm8N5I%2BjruIZ9UvG2Lo6EIyfwEeV1gUkzRS12OA2%2BWV8snRGvOR8tgz3NPG0Eg%2BQ8cAmzBV1bPh79bZKJj4c4BFbmH8qERJO%2BShxY3%2F48GB3jcWW43NPU5vkP\"}]}",
  "server": "cloudflare",
  "status": "200 OK",
  "transfer-encoding": "chunked",
  "vary": "Accept,Cookie,Accept-Encoding",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-powered-by": "Phusion Passenger(R) 6.1.8"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "responseCode": 400,
  "message": "Bad request, search_product parameter is missing in POST request."
}
```

## Shape (types only)

```json
{
  "responseCode": "number",
  "message": "string"
}
```
