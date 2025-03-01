#!/bin/bash

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "Error: Stripe CLI is not installed."
    echo "Please install it by following the instructions at: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Run the webhook listener and forward to localhost:3000
echo "Starting Stripe webhook listener..."
echo "Make sure to copy the webhook signing secret and update your .env.local file!"
echo "Example test card: 4242 4242 4242 4242, any future date, any 3 digits CVC, any postal code"
echo "--------------------------------------------------------------------"

stripe listen --forward-to http://localhost:3000/api/webhooks/stripe 