require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../src/models/OrderProduct');
const PaymentService = require('../src/services/PaymentService');

async function run() {
  try {
    await mongoose.connect(process.env.MongoDB);
    console.log('Connected to Mongo for debug script');

    // find latest order
    const order = await Order.findOne().sort({ createdAt: -1 });
    if (!order) {
      console.log('No orders found in DB');
      process.exit(1);
    }
    console.log('Using order id:', order._id.toString());

    const amount = order.totalPrice || 1000;
    const ipAddr = '127.0.0.1';
    const res = await PaymentService.createVNPayPayment({ orderId: order._id.toString(), amount, bankCode: null, ipAddr, userId: order.user });
    console.log('createVNPayPayment result:', res);
    process.exit(0);
  } catch (e) {
    console.error('Debug script error:', e);
    process.exit(1);
  }
}

run();
