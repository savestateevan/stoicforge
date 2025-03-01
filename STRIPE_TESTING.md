# Stripe Integration Testing Guide

This guide provides instructions for testing the Stripe integration in your local development environment.

## Setup

1. Ensure you have set up your environment variables in `.env.local`:

```
# Stripe test mode keys
STRIPE_SECRET_KEY="sk_test_51MVBfIISdNa3NclOI1iZhlRa1RpxzqKDEFTSfSGIiBijKvzWwMZVUMDUZxrTCHVpYeqDpVrO2Jkd8C0eOd8OLMaC00j4VmQw7W"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51MVBfIISdNa3NclOA3KlLl3YLWkAfpMFgEr8zBW8M0fEVUKkTgpWKejWYLbp9Bp0DvWUWVGaVNYFfE8BQD4c05o300Tpb2WDYw

# Webhook secret for local testing (from Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_1234567890
```

2. Install the Stripe CLI if you haven't already:
   - Follow instructions at: https://stripe.com/docs/stripe-cli

3. Log in to Stripe CLI:
   ```
   stripe login
   ```

## Testing Locally

1. Start your development server:
   ```
   npm run dev
   ```

2. In a separate terminal, start the webhook listener:
   ```
   ./scripts/run-webhook-listener.sh
   ```
   
   After running this command, you'll see a webhook signing secret displayed in the terminal. Copy this value and update the `STRIPE_WEBHOOK_SECRET` in your `.env.local` file.

3. Navigate to http://localhost:3000/pricing to view the pricing page.

4. Select a plan and click on the subscribe button.

5. When the Stripe checkout form appears, use the following test card details:
   - Card number: `4242 4242 4242 4242`
   - Expiration date: Any future date
   - CVC: Any 3 digits
   - Name and address: Any values

6. Complete the checkout process.

7. You should be redirected to the success page, and credits should be added to your account.

## Troubleshooting

If you encounter issues:

1. Check the terminal logs for both your Next.js server and the Stripe webhook listener.

2. Verify that your environment variables are properly set.

3. Ensure that the price IDs in `app/pricing/page.tsx` match those in `app/api/create-checkout-session/route.ts`.

4. If webhooks aren't being received, make sure the webhook listener is running and the webhook secret is correctly set in your `.env.local` file.

## Additional Test Cards

Stripe provides various test cards to simulate different scenarios:

- **Successful payment**: `4242 4242 4242 4242`
- **Authentication required**: `4000 0025 0000 3155`
- **Payment declined**: `4000 0000 0000 0002`

For more test cards, visit: https://stripe.com/docs/testing#cards

## Going to Production

When ready to go to production:

1. Update your `.env.local` file to use your live Stripe keys.
2. Update the price IDs in your code to use your live price IDs.
3. Ensure you have set up your webhook endpoints in the Stripe dashboard.
4. Remove any test mode indicators from your UI.

Remember to never commit your Stripe secret keys to version control! 