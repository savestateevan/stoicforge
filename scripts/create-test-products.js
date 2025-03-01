#!/usr/bin/env node

// This script creates test products and prices in Stripe
// Run with: node scripts/create-test-products.js

require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createTestProductsAndPrices() {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
    console.error('⚠️ This script should only be run with a test mode API key.');
    console.error('Current key does not start with sk_test_. Aborting for safety.');
    process.exit(1);
  }

  console.log('🚀 Creating test products and prices in Stripe...');

  try {
    // Create Beginner plan product
    const beginnerProduct = await stripe.products.create({
      name: 'Beginner Plan',
      description: 'Perfect for getting started with basic features',
      active: true,
      metadata: {
        credits: '100'
      }
    });

    console.log(`✅ Created Beginner product: ${beginnerProduct.id}`);

    // Create Pro plan product
    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: 'For serious users who need advanced features',
      active: true,
      metadata: {
        credits: '250'
      }
    });

    console.log(`✅ Created Pro product: ${proProduct.id}`);

    // Create price for Beginner plan
    const beginnerPrice = await stripe.prices.create({
      product: beginnerProduct.id,
      unit_amount: 1000, // $10.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'beginner'
      }
    });

    console.log(`✅ Created Beginner price: ${beginnerPrice.id}`);

    // Create price for Pro plan
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1500, // $15.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'pro'
      }
    });

    console.log(`✅ Created Pro price: ${proPrice.id}`);

    console.log('\n🎉 Success! Use these price IDs in your application:');
    console.log('--------------------------------------------------');
    console.log(`Beginner Plan: ${beginnerPrice.id}`);
    console.log(`Pro Plan: ${proPrice.id}`);
    console.log('--------------------------------------------------');
    console.log('\nUpdate these IDs in:');
    console.log('1. app/api/create-checkout-session/route.ts');
    console.log('2. app/pricing/page.tsx');

  } catch (error) {
    console.error('❌ Error creating test products and prices:', error.message);
    process.exit(1);
  }
}

createTestProductsAndPrices(); 