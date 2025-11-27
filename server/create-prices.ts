/**
 * Script to create Stripe products and prices for AplikoUSA
 * Run once to create the three payment packages
 * 
 * Usage: npx tsx server/create-prices.ts
 */

import { getUncachableStripeClient } from './stripeClient';

const PACKAGES = {
  individual: {
    name: 'Individual Package',
    description: 'Single applicant for DV Lottery',
    amount: 15000, // $150.00
  },
  couple: {
    name: 'Couple Package',
    description: 'Two applicants for DV Lottery',
    amount: 25000, // $250.00
  },
  family: {
    name: 'Family Package',
    description: 'Family applicants for DV Lottery',
    amount: 35000, // $350.00
  },
};

async function createPrices() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating Stripe products and prices for AplikoUSA...\n');

  for (const [key, pkg] of Object.entries(PACKAGES)) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: pkg.name,
        description: pkg.description,
        metadata: {
          package_type: key,
          aplikousa_package: 'true',
        },
      });

      console.log(`✅ Product created: ${product.name} (${product.id})`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: pkg.amount,
        currency: 'usd',
        metadata: {
          package_type: key,
        },
      });

      console.log(`   ✅ Price created: ${(pkg.amount / 100).toFixed(2)}USD (${price.id})\n`);
    } catch (error: any) {
      console.error(`❌ Error creating ${key} package:`, error.message);
    }
  }

  console.log('Done! Prices are now available in your Stripe account.');
  console.log('Update the priceIds object in dashboard.tsx with the actual price IDs.');
}

createPrices().catch(console.error);
