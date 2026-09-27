# API probe — GET https://parabank.parasoft.com/parabank/services/bank/accounts/40983/transactions

- AUT: ParaBank (Parasoft demo bank, UI + REST) (profile `parabank`) · captured 2026-09-27T12:35:54.669Z
- Status: **200**
- Time: 456 ms
- Content-Type: application/json

## Response headers (redacted)

```json
{
  "cf-cache-status": "DYNAMIC",
  "cf-ray": "a41a8d094897ffb2-EWR",
  "connection": "keep-alive",
  "content-encoding": "br",
  "content-type": "application/json",
  "date": "Sun, 27 Sep 2026 12:35:54 GMT",
  "server": "cloudflare",
  "transfer-encoding": "chunked",
  "x-content-type-options": "nosniff"
}
```

## Response body (redacted)

```json
[
  {
    "id": 59098,
    "accountId": 40983,
    "type": "Credit",
    "date": 1790467200000,
    "amount": 100,
    "description": "Funds Transfer Received"
  },
  {
    "id": 59764,
    "accountId": 40983,
    "type": "Credit",
    "date": 1790467200000,
    "amount": 25.5,
    "description": "Funds Transfer Received"
  }
]
```

## Shape (types only)

```json
[
  {
    "id": "number",
    "accountId": "number",
    "type": "string",
    "date": "number",
    "amount": "number",
    "description": "string"
  }
]
```
