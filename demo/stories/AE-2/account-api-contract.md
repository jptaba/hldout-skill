# Account API — partner integration contract (v1.2)

Owner: Partner Integration team · Consumer: loyalty/CRM partner · Status: agreed

## 1. General

| Item | Value |
|---|---|
| Base URL | `https://automationexercise.com/api` |
| Request encoding | `application/x-www-form-urlencoded` form fields, **in the request body for every method** (POST, PUT and DELETE alike). Query-string parameters are only used by `GET`. |
| Authentication | None at transport level. Account operations are authorised by the customer's `email` + `password` pair sent with the request. |
| Response body | A JSON object. |

### 1.1 Response envelope

Every response of these endpoints is delivered with **HTTP status 200**. The business outcome is carried in the JSON body:

```json
{ "responseCode": 201, "message": "User created!" }
```

- `responseCode` (integer) — the outcome code. **All codes in this contract refer to `responseCode`**, never to the HTTP status.
- `message` (string) — a human-readable outcome, present on every non-data answer. Messages below are exact.
- Data answers carry their payload next to `responseCode` (e.g. `user`).

Partners must branch on `responseCode`, not on the HTTP status.

## 2. Endpoints

### 2.1 `POST /createAccount` — register a customer

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Display name; shown in the shop header after sign-in |
| `email` | yes | Must be a valid e-mail address. Unique across customers, **compared case-insensitively** |
| `password` | yes | |
| `title` | no | `Mr`, `Mrs` or `Miss` |
| `birth_date` | no | Day of month, e.g. `10` |
| `birth_month` | no | Month name, e.g. `May` |
| `birth_year` | no | e.g. `1990` |
| `firstname` | yes | |
| `lastname` | yes | |
| `company` | no | |
| `address1` | yes | |
| `address2` | no | |
| `country` | yes | e.g. `India`, `Canada` |
| `zipcode` | yes | |
| `state` | yes | |
| `city` | yes | |
| `mobile_number` | yes | |

| Outcome | responseCode | message |
|---|---|---|
| Created | 201 | `User created!` |
| E-mail already registered (any letter case) | 400 | `Email already exists!` |
| Required field missing | 400 | `Bad request, <field> parameter is missing in POST request.` (e.g. `Bad request, city parameter is missing in POST request.`) |
| E-mail not a valid address | 400 | (message not fixed) |

### 2.2 `POST /verifyLogin` — check credentials

Fields: `email`, `password` (both required).

| Outcome | responseCode | message |
|---|---|---|
| Credentials match | 200 | `User exists!` |
| Unknown e-mail or wrong password | 404 | `User not found!` |
| `email` or `password` missing | 400 | `Bad request, email or password parameter is missing in POST request.` |
| Method `DELETE` used on `/verifyLogin` | 405 | `This request method is not supported.` |

### 2.3 `GET /getUserDetailByEmail?email=<email>` — read a profile

Success: `responseCode` 200 and a `user` object with these fields (some response names differ from the request names):

`id`, `name`, `email`, `title`, `birth_day`, `birth_month`, `birth_year`, `first_name`, `last_name`, `company`, `address1`, `address2`, `country`, `state`, `city`, `zipcode`, `mobile_number`

The password is never returned.

| Outcome | responseCode | message |
|---|---|---|
| Found | 200 | (data answer, `user` object) |
| No account for that e-mail | 404 | `Account not found with this email, try another email!` |
| `email` missing | 400 | `Bad request, email parameter is missing in GET request.` |

### 2.4 `PUT /updateAccount` — update a profile

Fields: `email` and `password` (required, identify and authorise the customer) plus any of the registration fields to change. Fields not sent keep their value (partial update).

| Outcome | responseCode | message |
|---|---|---|
| Updated | 200 | `User updated!` |
| E-mail/password pair does not match an account | 404 | `Account not found!` |
| `password` missing | 400 | `Bad request, password parameter is missing in PUT request.` |

### 2.5 `DELETE /deleteAccount` — close an account

Fields (form body): `email`, `password`.

| Outcome | responseCode | message |
|---|---|---|
| Deleted | 200 | `Account deleted!` |
| E-mail/password pair does not match an account | 404 | `Account not found!` |
| `email` or `password` missing | 400 | `Bad request, <field> parameter is missing in DELETE request.` |

## 3. Example

```
POST /api/createAccount
Content-Type: application/x-www-form-urlencoded

name=Asha%20Rao&email=asha.rao%2B1001%40example.com&password=<secret>&title=Mrs&birth_date=12&birth_month=March&birth_year=1991&firstname=Asha&lastname=Rao&company=Acme&address1=12%20MG%20Road&address2=&country=India&zipcode=560001&state=Karnataka&city=Bengaluru&mobile_number=9800000000

HTTP/1.1 200 OK
{"responseCode": 201, "message": "User created!"}
```
