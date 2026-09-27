# API probe — POST https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=40983&toAccountId=39318&amount=1.00

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) · captured 2026-09-27T12:36:03.015Z
- Status: **200**
- Time: 369 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41a8d3e6c8f42e0-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sun, 27 Sep 2026 12:36:03 GMT",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "x-content-type-options": "nosniff"
}
```

## Response body (redacted)

```json
Successfully transferred $1.00 from account #40983 to account #39318
```
