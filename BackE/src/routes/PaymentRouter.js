const express = require("express");
const router = express.Router()
const dotenv = require('dotenv');
dotenv.config();
const { authUserLogin, authOptional } = require('../middleware/authMiddleware');
const PaymentController = require('../controllers/PaymentController');


// VNPay payment URL creation
router.post('/vnpay/create-payment', authOptional, PaymentController.createVNPayPayment);

// VNPay IPN endpoint (called by VNPay server-to-server)
router.get('/vnpay-ipn', PaymentController.vnpayIPN);

// VNPay return verify endpoint (called by frontend after redirect)
router.get('/vnpay-return', PaymentController.vnpayReturn);

// Check payment status for an order (auth required)
router.get('/check/:orderId', authUserLogin, PaymentController.checkPayment);

router.get('/config', (req, res) => {
  return res.status(200).json({
    status: 'OK',
    data: process.env.CLIENT_ID
  });
});

module.exports = router