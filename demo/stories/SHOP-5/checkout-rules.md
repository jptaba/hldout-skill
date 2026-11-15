# Checkout payment and invoice rules

## Payment details per method

| Method | `payment_method` | Details and rules |
|---|---|---|
| Bank Transfer | `bank-transfer` | `bank_name`: letters and spaces only. `account_name`: letters, digits, spaces, dots, apostrophes and hyphens. `account_number`: digits only. All required. |
| Cash on Delivery | `cash-on-delivery` | No details. |
| Credit Card | `credit-card` | `credit_card_number` in the form 0000-0000-0000-0000; `expiration_date` as MM/YYYY, a date in the past is refused; `cvv` of 3 or 4 digits; `card_holder_name` of letters and spaces. |
| Buy Now Pay Later | `buy-now-pay-later` | `monthly_installments` is required. |
| Gift Card | `gift-card` | `gift_card_number` of exactly 16 letters or digits; `validation_code` of exactly 4 letters or digits. |

A field that breaks its rule makes POST /payment/check answer 422 with that field in `errors`, e.g. `payment_details.account_number` with "The payment details.account number field format is invalid.". The web shop's form checks the same formats before sending.

## Calculation of an invoice

1. Each invoice line is quantity × unit price; the subtotal is the sum of the lines.
2. Combined rental discount: 15% of the subtotal when the cart held at least one rental and at least one product that is not a rental (`additional_discount_amount`).
3. Eco-friendly discount: when at least half of the items (counted by quantity) have CO2 rating A or B, 5% of the subtotal after the combined discount (`eco_discount_amount`).
4. Total = subtotal − combined discount − eco-friendly discount. The invoice in My invoices shows every amount to the cent.

Example: 3 × Wood Saw (12.18, rating B) and 1 × Excavator rental (136.50) give, on the invoice, subtotal $ 173.04, discount $ 25.96, eco-friendly discount $ 7.35 and total $ 139.73.
