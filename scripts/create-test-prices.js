// Script to create test products and prices in Stripe
require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createTestProductsAndPrices() {
  try {
    console.log('Creating test products and prices in Stripe...');
    
    // Create Beginner Plan product
    const beginnerProduct = await stripe.products.create({
      name: 'Beginner Plan (Test)',
      description: 'Perfect for getting started with StoicForge',
    });
    console.log('Created Beginner Plan product:', beginnerProduct.id);
    
    // Create Pro Plan product
    const proProduct = await stripe.products.create({
      name: 'Pro Plan (Test)',
      description: 'For serious stoics seeking wisdom',
    });
    console.log('Created Pro Plan product:', proProduct.id);
    
    // Create Beginner Plan price (subscription)
    const beginnerPrice = await stripe.prices.create({
      product: beginnerProduct.id,
      unit_amount: 999,  // $9.99
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log('Created Beginner Plan price:', beginnerPrice.id);
    
    // Create Pro Plan price (subscription)
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1999,  // $19.99
      currency: 'usd',
      recurring: { interval: 'month' },
    });
    console.log('Created Pro Plan price:', proPrice.id);
    
    console.log('\nSummary:');
    console.log('========');
    console.log('Beginner Plan Product ID:', beginnerProduct.id);
    console.log('Beginner Plan Price ID:', beginnerPrice.id);
    console.log('Pro Plan Product ID:', proProduct.id);
    console.log('Pro Plan Price ID:', proPrice.id);
    console.log('\nUpdate your app to use these price IDs for testing:');
    console.log(`BEGINNER: '${beginnerPrice.id}'`);
    console.log(`PRO: '${proPrice.id}'`);
    
  } catch (error) {
    console.error('Error creating test products and prices:', error);
  }
}

createTestProductsAndPrices(); 