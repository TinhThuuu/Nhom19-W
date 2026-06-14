// GET /api/payment/vnpay-return
const vnpayReturn = async (req, res) => {
  try {
    console.log('VNPay Return params:', req.query);
    const vnpParams = { ...req.query };
    // capture incoming values for logs
    const incomingSecureHash = vnpParams.vnp_SecureHash;
    const incomingSecureHashType = vnpParams.vnp_SecureHashType;

    // Remove secure hash fields before signing
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    // Sort keys and build signData using encodeURIComponent + space->+ (same as creation)
    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys.map(key => {
      const value = vnpParams[key] === null || vnpParams[key] === undefined ? '' : String(vnpParams[key]);
      return `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`;
    }).join('&');

    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const computedHash = hmac.update(signData, 'utf8').digest('hex');

    // Mask hashes for logs
    const mask = (s) => {
      if (!s) return '';
      const str = String(s);
      return str.length > 10 ? `${str.substring(0, 6)}...${str.substring(str.length - 4)}` : str;
    };

    console.log('VNPay Return - vnp_TxnRef:', vnpParams.vnp_TxnRef);
    console.log('VNPay Return - vnp_ResponseCode:', vnpParams.vnp_ResponseCode);
    console.log('VNPay Return - receivedSecureHash:', mask(incomingSecureHash));
    console.log('VNPay Return - computedHash:', mask(computedHash));
    console.log('VNPay Return - signData (truncated):', signData.substring(0, 500));

    const verified = incomingSecureHash && computedHash.toLowerCase() === String(incomingSecureHash).toLowerCase();
    console.log('VNPay Return - verified:', verified);

    if (!incomingSecureHash) {
      return res.status(400).json({ status: 'ERR', message: 'Missing vnp_SecureHash in return params' });
    }

    if (!verified) {
      return res.status(400).json({ status: 'ERR', message: 'Sai chữ ký VNPay' });
    }

    const vnp_TxnRef = vnpParams.vnp_TxnRef;
    const vnp_ResponseCode = vnpParams.vnp_ResponseCode;
    const vnp_TransactionNo = vnpParams.vnp_TransactionNo;

    console.log('vnp_TxnRef:', vnp_TxnRef);
    console.log('vnp_ResponseCode:', vnp_ResponseCode);

    const order = await Order.findOne({ vnpTxnRef: vnp_TxnRef });
    console.log('Found order:', !!order);
    if (!order) {
      console.log('VNPay Return - order not found for vnpTxnRef:', vnp_TxnRef);
      return res.status(404).json({ status: 'ERR', message: 'Không tìm thấy đơn hàng tương ứng' });
    }

    // If order already paid, return OK (idempotent)
    if (order.paymentStatus === 'paid' || order.isPaid === true) {
      return res.status(200).json({ status: 'OK', message: 'Đơn hàng đã được thanh toán', data: { orderId: order._id, paymentStatus: order.paymentStatus, isPaid: order.isPaid } });
    }

    if (vnp_ResponseCode === '00') {
      order.paymentStatus = 'paid';
      order.isPaid = true;
      order.paidAt = new Date();
      order.vnpTransactionNo = vnp_TransactionNo;
      order.vnpResponseCode = vnp_ResponseCode;
      order.transactionId = vnp_TransactionNo;
      // Do NOT set order.status = 'confirmed' as schema may not allow it
      await order.save();
      return res.status(200).json({ status: 'OK', message: 'Thanh toán thành công', data: { orderId: order._id, paymentStatus: order.paymentStatus, isPaid: order.isPaid } });
    }

    // If checksum valid but payment not successful, return 200 with failed status
    order.paymentStatus = 'failed';
    order.vnpResponseCode = vnp_ResponseCode;
    await order.save();
    return res.status(200).json({ status: 'OK', message: 'Thanh toán thất bại', data: { orderId: order._id, paymentStatus: order.paymentStatus, isPaid: order.isPaid, vnpResponseCode } });
  } catch (e) {
    console.error('VNPay Return - error:', e.message);
    return res.status(500).json({ status: 'ERR', message: e.message });
  }
};
const PaymentService = require('../services/PaymentService');
const Order = require('../models/OrderProduct');
const crypto = require('crypto');

// POST /api/payment/vnpay/create-payment
const createVNPayPayment = async (req, res) => {
  try {
    const { orderId, amount, bankCode, returnUrl } = req.body;
    if (!orderId || !amount) {
      return res.status(400).json({ status: 'ERR', message: 'orderId and amount are required' });
    }
    // Optionally, check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: 'ERR', message: 'Order not found' });
    }
    // Only allow payment if unpaid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ status: 'ERR', message: 'Order already paid' });
    }
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userId = req.user ? req.user.id : undefined;
    const result = await PaymentService.createVNPayPayment({ orderId, amount, bankCode, ipAddr, userId, returnUrl });
    return res.status(200).json({ status: 'OK', data: result });
  } catch (e) {
    return res.status(500).json({ status: 'ERR', message: e.message });
  }
};

// GET /api/payment/vnpay-ipn
const vnpayIPN = async (req, res) => {
  try {
    console.log('VNPay IPN params:', req.query);
    const vnpParams = { ...req.query };
    const receivedSecureHash = vnpParams.vnp_SecureHash || vnpParams.vnp_SecureHashType;
    // remove secure hash fields for signing
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    // build sign data string sorted by keys (encode values same as creation)
    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys.map(key => {
      const value = vnpParams[key] === null || vnpParams[key] === undefined ? '' : String(vnpParams[key]);
      return `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`;
    }).join('&');

    const vnp_HashSecret = process.env.VNP_HASH_SECRET;
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const computedHash = hmac.update(signData, 'utf8').digest('hex');

    const mask = (s) => {
      if (!s) return '';
      const str = String(s);
      return str.length > 10 ? `${str.substring(0, 6)}...${str.substring(str.length - 4)}` : str;
    };
    console.log('VNPay IPN - receivedSecureHash:', mask(receivedSecureHash));
    console.log('VNPay IPN - computedHash:', mask(computedHash));
    console.log('VNPay IPN - verified:', receivedSecureHash && computedHash.toLowerCase() === String(receivedSecureHash).toLowerCase());

    if (!receivedSecureHash || computedHash.toLowerCase() !== String(receivedSecureHash).toLowerCase()) {
      return res.status(400).json({ RspCode: '97', Message: 'Sai chữ ký VNPay' });
    }

    const vnp_TxnRef = vnpParams.vnp_TxnRef;
    const vnp_Amount = vnpParams.vnp_Amount ? Number(vnpParams.vnp_Amount) / 100 : null;
    const vnp_ResponseCode = vnpParams.vnp_ResponseCode;
    const vnp_TransactionNo = vnpParams.vnp_TransactionNo;

    const order = await Order.findOne({ vnpTxnRef: vnp_TxnRef });
    if (!order) {
      return res.status(404).json({ RspCode: '01', Message: 'Order not found' });
    }

    if (vnp_Amount && order.totalPrice && Math.abs(order.totalPrice - vnp_Amount) > 0.01) {
      return res.status(400).json({ RspCode: '04', Message: 'Amount mismatch' });
    }

    if (vnp_ResponseCode === '00') {
      order.paymentStatus = 'paid';
      order.isPaid = true;
      order.paidAt = new Date();
      order.vnpTransactionNo = vnp_TransactionNo;
      order.vnpResponseCode = vnp_ResponseCode;
      order.transactionId = vnp_TransactionNo;
      // Do NOT set order.status = 'confirmed'
      await order.save();
      return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    }

    order.paymentStatus = 'failed';
    order.vnpResponseCode = vnp_ResponseCode;
    await order.save();
    return res.status(200).json({ RspCode: '02', Message: 'Payment failed' });
  } catch (e) {
    return res.status(500).json({ RspCode: '99', Message: e.message });
  }
};

// GET /api/payment/check/:orderId
const checkPayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!orderId) return res.status(400).json({ status: 'ERR', message: 'orderId required' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ status: 'ERR', message: 'Order not found' });

    const user = req.user;
    if (!user) return res.status(401).json({ status: 'ERR', message: 'Unauthorized' });
    if (!user.isAdmin && String(order.user) !== String(user.id)) {
      return res.status(403).json({ status: 'ERR', message: 'Permission denied' });
    }

    return res.status(200).json({
      status: 'OK',
      data: {
        orderId: order._id,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        status: order.status,
        transactionId: order.transactionId,
        vnpTxnRef: order.vnpTxnRef,
        vnpResponseCode: order.vnpResponseCode
      }
    });
  } catch (e) {
    return res.status(500).json({ status: 'ERR', message: e.message });
  }
};

module.exports = { createVNPayPayment, vnpayIPN, checkPayment, vnpayReturn };