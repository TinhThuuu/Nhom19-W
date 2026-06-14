require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../src/models/OrderProduct');

async function run() {
  try {
    await mongoose.connect(process.env.MongoDB);
    console.log('Connected to MongoDB for migration script');

    // Update all orders with paymentMethod 'paypal' to 'vnpay'
    const result = await Order.updateMany(
      { paymentMethod: 'paypal' },
      { $set: { paymentMethod: 'vnpay' } }
    );

    console.log(`Successfully migrated payment methods:`);
    console.log(`- Matched documents count: ${result.matchedCount}`);
    console.log(`- Modified documents count: ${result.modifiedCount}`);

    process.exit(0);
  } catch (e) {
    console.error('Migration script error:', e);
    process.exit(1);
  }
}

run();
