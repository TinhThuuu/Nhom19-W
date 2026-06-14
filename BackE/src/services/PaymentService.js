const querystring = require('querystring');
const crypto = require('crypto');
const Order = require('../models/OrderProduct');

// Helper to sort object keys and encode values per VNPay requirements
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    // encodeURIComponent then replace %20 with + as VNPay demo requires
    const value = obj[key] === null || obj[key] === undefined ? '' : String(obj[key]);
    sorted[key] = encodeURIComponent(value).replace(/%20/g, '+');
  });
  return sorted;
}

async function createVNPayPayment({ orderId, amount, bankCode, ipAddr, userId, returnUrl }) {
  // Read config from env
  const vnp_TmnCode = process.env.VNP_TMN_CODE;
  const vnp_HashSecret = process.env.VNP_HASH_SECRET;
  const vnp_Url = process.env.VNP_URL;
  const vnp_ReturnUrl = returnUrl || process.env.VNP_RETURN_URL;
  if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl) {
    throw new Error('VNPay config missing in environment variables');
  }

  // Minimal env checks for debugging (do not log secrets)
  console.log('VNP_TMN_CODE:', vnp_TmnCode)
  console.log('Has VNP_HASH_SECRET:', !!vnp_HashSecret)

  const date = new Date();
  const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const vnp_TxnRef = orderId + '-' + date.getTime();

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode,
    vnp_Amount: amount * 100, // VNPay expects amount in VND * 100
    vnp_CurrCode: 'VND',
    vnp_TxnRef,
    vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_BankCode: bankCode || ''
  };

  // Remove empty bankCode
  if (!bankCode) delete vnp_Params.vnp_BankCode;

  // Sort params and build sign data following VNPay requirements
  const sortedParams = sortObject(vnp_Params);

  // Build signData: key=value pairs joined by & without additional encoding
  // (values are already encoded in sortObject, spaces replaced with +)
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', vnp_HashSecret);
  const secureHash = hmac.update(signData, 'utf8').digest('hex');
  // Debug logs (temporary) - do NOT log the secret
  console.log('VNPay params before hash:', sortedParams)
  console.log('VNPay signData:', signData)

  // Append secure hash to params
  sortedParams.vnp_SecureHash = secureHash;

  // Build final query string (encoded)
  // Build final query string without re-encoding values
  const queryString = Object.keys(sortedParams)
    .map((key) => `${encodeURIComponent(key)}=${sortedParams[key]}`)
    .join('&');

  const paymentUrl = `${vnp_Url}?${queryString}`;

  // Mask secure hash for logging
  const maskedUrl = paymentUrl.replace(/(vnp_SecureHash=)([0-9a-fA-F]+)/, (m, p1, p2) => {
    const show = p2.substring(0, 6)
    return `${p1}${show}...masked`;
  })
  console.log('VNPay paymentUrl (masked):', maskedUrl)

  // Save to order
  await Order.findByIdAndUpdate(orderId, {
    paymentMethod: 'vnpay',
    paymentStatus: 'pending',
    vnpTxnRef: vnp_TxnRef,
    paymentUrl
  });

  return { paymentUrl };
}

module.exports = { createVNPayPayment };