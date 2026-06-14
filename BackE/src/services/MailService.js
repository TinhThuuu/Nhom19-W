
const nodemailer = require('nodemailer');

// Create transporter lazily to avoid reading env too early
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })
}

const checkMailConfig = () => {
  const required = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS', 'MAIL_FROM']
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) {
    throw new Error(`Thiếu cấu hình mail trong .env: ${missing.join(', ')}`)
  }
}

async function sendTestEmail(to) {
  try {
    checkMailConfig()
  } catch (err) {
    return { status: 'ERR', message: err.message }
  }

  // Safe debug logs (do not print MAIL_PASS)
  console.log('MAIL_USER:', process.env.MAIL_USER)
  console.log('MAIL_HOST:', process.env.MAIL_HOST)
  console.log('MAIL_PORT:', process.env.MAIL_PORT)
  console.log('Has MAIL_PASS:', !!process.env.MAIL_PASS)

  const transporter = getTransporter()
  const FROM = process.env.MAIL_FROM

  try {
    await transporter.verify()
  } catch (err) {
    return { status: 'ERR', message: 'Lỗi xác thực SMTP: ' + (err?.message || err) }
  }

  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: 'DT Shop - Test gửi mail',
      html: '<h3>Gửi mail thành công từ hệ thống DT Shop.</h3>',
    })
    return { status: 'OK', message: 'Gửi email test thành công' }
  } catch (error) {
    return { status: 'ERR', message: error?.message || String(error) }
  }
}

// Hàm gửi email xác nhận đơn hàng
async function sendOrderSuccessEmail(to, order) {
  checkMailConfig()
  console.log('MAIL_USER:', process.env.MAIL_USER)
  console.log('MAIL_HOST:', process.env.MAIL_HOST)
  console.log('MAIL_PORT:', process.env.MAIL_PORT)
  console.log('Has MAIL_PASS:', !!process.env.MAIL_PASS)
  const transporter = getTransporter()
  const FROM = process.env.MAIL_FROM
  // Lấy thông tin đơn hàng
  const { _id, shippingAddress, orderItems, totalPrice, itemsPrice, shippingPrice, paymentMethod, isPaid } = order;
  let productRows = '';
  orderItems.forEach(item => {
    productRows += `<tr>
      <td>${item.name}</td>
      <td>${item.amount}</td>
      <td>${item.price.toLocaleString()}₫</td>
    </tr>`;
  });
  const html = `
    <h2>DT Shop - Xác nhận đơn hàng</h2>
    <p>Cảm ơn bạn đã đặt hàng tại DT Shop!</p>
    <p><b>Mã đơn hàng:</b> ${_id}</p>
    <p><b>Tên khách hàng:</b> ${shippingAddress?.fullName || ''}</p>
    <p><b>Số điện thoại:</b> ${shippingAddress?.phone || ''}</p>
    <p><b>Địa chỉ nhận hàng:</b> ${shippingAddress?.address || ''}, ${shippingAddress?.city || ''}</p>
    <table border="1" cellpadding="6" style="border-collapse:collapse;">
      <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Giá</th></tr></thead>
      <tbody>${productRows}</tbody>
    </table>
    <p><b>Tạm tính:</b> ${itemsPrice ? itemsPrice.toLocaleString() : totalPrice.toLocaleString()}₫</p>
    <p><b>Phí vận chuyển:</b> ${shippingPrice ? shippingPrice.toLocaleString() : '0'}₫</p>
    <p><b>Tổng tiền:</b> ${totalPrice.toLocaleString()}₫</p>
    <p><b>Phương thức thanh toán:</b> ${paymentMethod}</p>
    <p><b>Trạng thái thanh toán:</b> ${isPaid ? 'Đã thanh toán' : 'Thanh toán khi nhận hàng'}</p>
    <p>DT Shop cảm ơn bạn đã tin tưởng và ủng hộ!</p>
  `;
  try {
    await transporter.verify()
  } catch (verifyErr) {
    console.error('SMTP verify failed:', verifyErr?.message || verifyErr)
    throw verifyErr
  }

  try {
    await transporter.sendMail({ from: FROM, to, subject: 'DT Shop - Xác nhận đơn hàng', html })
    return true
  } catch (error) {
    console.error('Order success email failed:', error?.message || error)
    throw error
  }
}

// Hàm gửi email đặt lại mật khẩu
async function sendPasswordResetEmail(to, resetLink) {
  try {
    checkMailConfig()
  } catch (err) {
    throw err
  }

  const html = `
    <h2>DT Shop - Đặt lại mật khẩu</h2>
    <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản này.</p>
    <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu (liên kết có hiệu lực trong 1 giờ):</p>
    <p><a href="${resetLink}">Đặt lại mật khẩu</a></p>
    <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    <p>DT Shop</p>
  `

  // Safe debug logs (do not print MAIL_PASS)
  console.log('MAIL_USER:', process.env.MAIL_USER)
  console.log('MAIL_HOST:', process.env.MAIL_HOST)
  console.log('MAIL_PORT:', process.env.MAIL_PORT)
  console.log('Has MAIL_PASS:', !!process.env.MAIL_PASS)

  const transporter = getTransporter()
  const FROM = process.env.MAIL_FROM

  try {
    await transporter.verify()
  } catch (verifyErr) {
    console.error('SMTP verify failed:', verifyErr?.message || verifyErr)
    throw verifyErr
  }

  console.log('sendPasswordResetEmail - sending to:', to)
  try {
    await transporter.sendMail({ from: FROM, to, subject: 'DT Shop - Đặt lại mật khẩu', html })
    console.log('Reset password email sent successfully')
    return true
  } catch (error) {
    console.error('Reset password email failed:', error?.message || error)
    throw error
  }
}

// Hàm gửi email cập nhật trạng thái đơn hàng
async function sendOrderStatusUpdateEmail(to, order) {
  checkMailConfig()
  const transporter = getTransporter()
  const FROM = process.env.MAIL_FROM

  const { _id, status, isPaid, orderItems, totalPrice, itemsPrice, shippingPrice } = order;
  const statusLabel = {
    pending: 'Chưa giao hàng',
    delivering: 'Đang giao hàng',
    delivered: 'Giao hàng thành công',
    cancelled: 'Đã hủy'
  }[status || 'pending'];

  let productRows = '';
  orderItems.forEach(item => {
    productRows += `<tr>
      <td>${item.name}</td>
      <td>${item.amount}</td>
      <td>${item.price ? item.price.toLocaleString() : '0'}₫</td>
    </tr>`;
  });

  const html = `
    <h2>DT Shop - Cập nhật trạng thái đơn hàng</h2>
    <p>Chào bạn,</p>
    <p>Đơn hàng <b>${_id}</b> của bạn đã được cập nhật trạng thái mới:</p>
    <p style="font-size: 16px;"><b>Trạng thái đơn hàng:</b> <span style="color: #ea580c; font-weight: bold;">${statusLabel}</span></p>
    <p><b>Trạng thái thanh toán:</b> ${isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
    <hr/>
    <h3>Chi tiết đơn hàng:</h3>
    <table border="1" cellpadding="6" style="border-collapse:collapse;">
      <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Giá</th></tr></thead>
      <tbody>${productRows}</tbody>
    </table>
    <p><b>Tạm tính:</b> ${itemsPrice ? itemsPrice.toLocaleString() : totalPrice.toLocaleString()}₫</p>
    <p><b>Phí vận chuyển:</b> ${shippingPrice ? shippingPrice.toLocaleString() : '0'}₫</p>
    <p><b>Tổng tiền:</b> ${totalPrice.toLocaleString()}₫</p>
    <p>Cảm ơn bạn đã đồng hành cùng DT Shop!</p>
  `;

  try {
    await transporter.verify()
  } catch (verifyErr) {
    console.error('SMTP verify failed:', verifyErr?.message || verifyErr)
    throw verifyErr
  }

  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: `DT Shop - Cập nhật trạng thái đơn hàng #${_id}`,
      html
    })
    console.log(`Status update email sent to ${to} for order ${_id}`)
    return true
  } catch (error) {
    console.error('Status update email failed:', error?.message || error)
    throw error
  }
}

module.exports = {
  sendTestEmail,
  sendOrderSuccessEmail,
  sendPasswordResetEmail,
  sendOrderStatusUpdateEmail,
};
