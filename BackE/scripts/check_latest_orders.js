require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../src/models/OrderProduct');

async function run() {
  try {
    await mongoose.connect(process.env.MongoDB);
    console.log('Connected to MongoDB');

    const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
    console.log('LATEST 5 ORDERS:');
    orders.forEach(order => {
      console.log('-------------------------------------------');
      console.log('Order ID:', order._id);
      console.log('Name:', order.shippingAddress?.fullName);
      console.log('Phone:', order.shippingAddress?.phone);
      console.log('Email in Order:', order.email);
      console.log('Items Price:', order.itemsPrice);
      console.log('Shipping Price:', order.shippingPrice);
      console.log('Total Price:', order.totalPrice);
      console.log('Items:');
      order.orderItems.forEach(item => {
        console.log(`  - Name: ${item.name}, Amount: ${item.amount}, Price: ${item.price}`);
      });
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
