# API probe — GET https://parabank.parasoft.com/parabank/services/bank/accounts/39318

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) · captured 2026-09-27T12:33:19.427Z
- Status: **200**
- Time: 470 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41a893f1ea00cfb-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sun, 27 Sep 2026 12:33:19 GMT",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "x-content-type-options": "nosniff"
}
```

## Response body (redacted)

```json
{
  "id": 39318,
  "customerId": 23312,
  "type": "CHECKING",
  "balance": 515.5
}
```

## Shape (types only)

```json
{
  "id": "number",
  "customerId": "number",
  "type": "string",
  "balance": "number"
}
```
