import { getUncachableStripeClient } from './stripeClient';

const PACKAGE_PRICES = {
  individual: {
    name: 'Individual Package',
    description: 'Single DV Lottery Application',
    amount: 15000, // $150.00
  },
  couple: {
    name: 'Couple Package',
    description: 'DV Lottery Application for 2 People',
    amount: 25000, // $250.00
  },
  family: {
    name: 'Family Package',
    description: 'DV Lottery Application for Family',
    amount: 35000, // $350.00
  },
};

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating products in Stripe...');

  for (const [key, value] of Object.entries(PACKAGE_PRICES)) {
    // Check if product already exists
    const products = await stripe.products.search({
      query: `name:'${value.name}'`,
    });

    let product;
    if (products.data.length > 0) {
      product = products.data[0];
      console.log(`✓ Product "${value.name}" already exists: ${product.id}`);
    } else {
      // Create new product
      product = await stripe.products.create({
        name: value.name,
        description: value.description,
        metadata: {
          package: key,
          type: 'dv_lottery_application',
        },
      });
      console.log(`✓ Created product "${value.name}": ${product.id}`);
    }

    // Create or get price
    const prices = await stripe.prices.search({
      query: `product:'${product.id}'`,
    });

    if (prices.data.length > 0) {
      const price = prices.data[0];
      console.log(`✓ Price already exists: ${price.id}`);
    } else {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: value.amount,
        currency: 'usd',
        metadata: {
          package: key,
        },
      });
      console.log(`✓ Created price: ${price.id} ($${(value.amount / 100).toFixed(2)})`);
    }
  }

  console.log('\n✅ Products seeded successfully!');
}

seedProducts().catch(console.error);
