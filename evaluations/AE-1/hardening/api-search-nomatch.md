# API probe — POST https://automationexercise.com/api/searchProduct

- AUT: Automation Exercise (demo shop + practice API) (profile `automation-exercise`) · captured 2026-09-27T05:40:54.645Z
- Status: **200**
- Time: 576 ms
- Content-Type: text/html; charset=utf-8

## Request body

```json
search_product=zzqxv
```

## Response headers (redacted)

```json
{
  "allow": "POST, PUT, DELETE, OPTIONS, GET",
  "alt-svc": "h3=\":443\"; ma=86400",
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a4182d207deec431-EWR",
  "connection": "keep-alive",
  "content-length": "37",
  "content-type": "text/html; charset=utf-8",
  "date": "Sun, 27 Sep 2026 05:40:54 GMT",
  "nel": "{\"report_to\":\"cf-nel\",\"success_fraction\":0.0,\"max_age\":604800}",
  "referrer-policy": "same-origin",
  "report-to": "{\"group\":\"cf-nel\",\"max_age\":604800,\"endpoints\":[{\"url\":\"https://a.nel.cloudflare.com/report/v4?s=prRln8yDt2nRCMYEYvtzY3uiOWD4dORLSK57lQaeIH3RtbDUedDCCaqo6BGjyijzHD%2F10CwwQWcMndKkluQTcShDaVNNxakIFY1deHlCpxM1atQKMt5uiWhIv0bnmVtl4wgpU22iTNDzx4FQtt6iBswSg56x\"}]}",
  "server": "cloudflare",
  "status": "200 OK",
  "vary": "Accept,Cookie",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-powered-by": "Phusion Passenger(R) 6.1.8"
}
```

## Response body (redacted, first 4000 chars)

```json
{
  "responseCode": 200,
  "products": []
}
```

## Shape (types only)

```json
{
  "responseCode": "number",
  "products": []
}
```
