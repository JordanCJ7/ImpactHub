Stripe setup and testing for ImpactHub backend

Follow these steps to obtain Stripe API keys and test webhooks locally.

1) Create a Stripe account
   - Visit https://dashboard.stripe.com/register and create an account or log in.

2) Get API keys
   - In Stripe Dashboard -> Developers -> API keys:
     - Publishable key (pk_test_...): used in client-side code if needed.
     - Secret key (sk_test_...): use as STRIPE_SECRET_KEY in backend .env (keep private).

3) Local webhook testing (recommended)
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Authenticate with `stripe login`.
   - Forward webhooks to your local server (example):
     stripe listen --forward-to localhost:5000/api/donations/webhook
   - Copy the printed webhook signing secret (whsec_...) into backend .env as STRIPE_WEBHOOK_SECRET.

4) Test Checkout flow
   - Run backend & frontend locally.
   - Use the Donate UI to create a Checkout session and complete payment with test card numbers (e.g., 4242 4242 4242 4242).

5) Production
   - Register your production webhook endpoint URL in Stripe Dashboard -> Webhooks and copy the webhook secret to your production environment.

References
- Stripe Checkout: https://stripe.com/docs/payments/checkout
- Stripe CLI webhooks: https://stripe.com/docs/stripe-cli/webhooks
