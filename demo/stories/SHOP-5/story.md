# Checkout: pay for the cart and receive an invoice

As a signed-in customer I want to pay for my cart with the payment method I prefer and find the invoice in my account afterwards, so that I know what I bought and paid.

## Web shop

The checkout steps are the cart, sign in (a signed-in customer just continues), the billing address and the payment. On the payment step the customer chooses Bank Transfer, Cash on Delivery, Credit Card, Buy Now Pay Later or Gift Card and fills in that method's fields. Confirming first checks the payment details and shows "Payment was successful"; confirming once more places the order and shows "Thanks for your order! Your invoice number is …" with the new invoice number, which starts with INV- and the year.

The invoice then appears under My invoices with its number, billing street, date and total. Its detail page shows the billing address, the payment method, each product with quantity, unit price and line total, then the subtotal, the discounts and the total.

## Amounts

The combined rental discount of 15% (a rental together with a product that is not a rental) is deducted on the invoice too. When more than half of the items are eco-friendly (CO2 rating A or B), an eco-friendly discount of 5% is also deducted and shown as "Eco-Friendly Discount (5%)". The invoice total is the subtotal minus these discounts, shown to the cent.

## API

- POST /payment/check with `payment_method` and `payment_details` answers 200 with `{"message": "Payment was successful"}`, or 422 with an error per wrong field.
- POST /invoices with `billing_street`, `billing_city`, `billing_state`, `billing_country`, `billing_postal_code`, `payment_method`, `payment_details` and `cart_id` places the order and answers 201 Created with the new invoice and its `invoice_number`. A missing street, city or country, or an unknown payment method, is refused with 422.
- GET /invoices lists the customer's own invoices, newest first; GET /invoices/{id} gives one with its `invoicelines`, `payment`, `subtotal`, `additional_discount_amount`, `eco_discount_amount` and `total`. Another customer's invoice is not found (404); without signing in both are refused with 401.
- A new invoice has status AWAITING_FULFILLMENT.

Payment validation rules and the calculation: [Checkout payment and invoice rules|https://confluence.example.com/pages/viewpage.action?pageId=48213377].

Out of scope: guest checkout, the invoice PDF, changing an invoice's status.
