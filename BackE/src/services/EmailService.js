const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()
const inlineBase64 = require('nodemailer-plugin-inline-base64')
const { formatter } = require('../formatter')

const sendEmailCreateOrder = async (email, orderItems) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { 
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD,
    },
  })

  transporter.use('compile', inlineBase64({ cidPrefix: 'somePrefix_' }))

  let listItem = ''
  const attachImage = []

  orderItems.forEach((order) => {
    listItem += `
      <div>
        <p>Bạn đã đặt <b>${order.name}</b></p>
        <p>Số lượng: <b>${order.amount}</b></p>
        <p>Giá: <b>${formatter(order.price)}</b></p>
        <img src="cid:${order.product}" width="200"/>
        <hr/>
      </div>
    `
    attachImage.push({
      filename: 'product.jpg',
      path: order.image,
      cid: order.product,
    })
  })

  await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Bạn đã đặt hàng tại DT SHOP",
    html: `<h3>Đặt hàng thành công</h3>${listItem}`,
    attachments: attachImage,
  })
}

module.exports = { sendEmailCreateOrder }
