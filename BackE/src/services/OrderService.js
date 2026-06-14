const Order = require("../models/OrderProduct")
const Product = require("../models/ProductModel")
const { sendOrderSuccessEmail } = require("./MailService")
const User = require("../models/UserModel")

const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const {
            orderItems,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            fullName,
            address,
            city,
            phone,
            user,
            isPaid,
            paidAt,
            email
        } = newOrder

        try {
            const promises = orderItems.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        countInStock: { $gte: order.amount }
                    },
                    {
                        $inc: {
                            countInStock: -order.amount,
                            selled: +order.amount
                        }
                    },
                    { new: true }
                )

                if (productData) {
                    return {
                        status: 'OK',
                        message: 'SUCCESS'
                    }
                } else {
                    return {
                        status: 'ERR',
                        id: order.product
                    }
                }
            })

            const results = await Promise.all(promises)
            const newData = results.filter((item) => item?.id)

            if (newData.length) {
                const arrId = newData.map(item => item.id)
                return resolve({
                    status: 'ERR',
                    message: `San pham voi id: ${arrId.join(',')} khong du hang`
                })
            }

            const createdOrder = await Order.create({
                orderItems,
                shippingAddress: {
                    fullName,
                    address,
                    city,
                    phone
                },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
                user,
                isPaid,
                paidAt,
                email
            })

            if (createdOrder) {
                // Log order tạo thành công
                console.log("Order created:", createdOrder._id)
                let userEmail = email;
                if (!userEmail) {
                    const userId = user || createdOrder.user;
                    if (userId) {
                        try {
                            const userDoc = await User.findById(userId).select('email name');
                            userEmail = userDoc?.email;
                        } catch (e) {
                            console.error("Không thể truy vấn user để lấy email:", e.message);
                        }
                    }
                }
                if (userEmail) {
                    console.log("Send order email to:", userEmail)
                    try {
                        await sendOrderSuccessEmail(userEmail, createdOrder)
                        console.log("Order email sent successfully to:", userEmail)
                    } catch (err) {
                        console.error("Order email failed:", err.message)
                    }
                } else {
                    console.log("Không tìm thấy email user để gửi xác nhận đơn hàng")
                }
                return resolve({
                    status: 'OK',
                    message: 'success',
                    data: createdOrder
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

const getAllOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.find({
                user: id
            }).sort({ createdAt: -1, updatedAt: -1 })

            if (order === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            return resolve({
                status: 'OK',
                message: 'SUCESSS',
                data: order
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById({ _id: id })

            if (order === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            return resolve({
                status: 'OK',
                message: 'SUCESSS',
                data: order
            })
        } catch (e) {
            reject(e)
        }
    })
}

const cancelOrderDetails = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let orderDeleted = null

            const promises = data.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: order.product,
                        selled: { $gte: order.amount }
                    },
                    {
                        $inc: {
                            countInStock: +order.amount,
                            selled: -order.amount
                        }
                    },
                    { new: true }
                )

                if (!productData) {
                    return { id: order.product }
                }

                orderDeleted = await Order.findByIdAndDelete(id)
                return null
            })

            const results = await Promise.all(promises)
            const newData = results.find(item => item?.id)

            if (newData) {
                return resolve({
                    status: 'ERR',
                    message: `San pham voi id: ${newData.id} khong ton tai`
                })
            }

            return resolve({
                status: 'OK',
                message: 'success',
                data: orderDeleted
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllOrder = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allOrder = await Order.find().sort({ createdAt: -1, updatedAt: -1 })
            return resolve({
                status: 'OK',
                message: 'Success',
                data: allOrder
            })
        } catch (e) {
            reject(e)
        }
    })
}

const updateOrderStatus = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { isPaid, isDelivered, status } = data
            const order = await Order.findById(id)
            if (order === null) {
                return resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            if (isPaid !== undefined) {
                order.isPaid = isPaid
                order.paymentStatus = isPaid ? 'paid' : 'unpaid'
                if (isPaid) {
                    order.paidAt = new Date()
                } else {
                    order.paidAt = null
                }
            }

            if (isDelivered !== undefined) {
                order.isDelivered = isDelivered
                if (isDelivered) {
                    order.deliveredAt = new Date()
                } else {
                    order.deliveredAt = null
                }
            }

            if (status !== undefined) {
                order.status = status
                if (status === 'delivered') {
                    order.isDelivered = true
                    if (!order.deliveredAt) {
                        order.deliveredAt = new Date()
                    }
                } else if (status === 'cancelled') {
                    order.isDelivered = false
                    order.deliveredAt = null
                    order.paymentStatus = 'cancelled'
                } else {
                    order.isDelivered = false
                    order.deliveredAt = null
                }
            }

            await order.save()

            // Gửi email thông báo trạng thái cập nhật cho người dùng (nếu có email thật)
            let recipientEmail = order.email
            if (!recipientEmail && order.user) {
                try {
                    const userDoc = await User.findById(order.user).select('email')
                    recipientEmail = userDoc?.email
                } catch (err) {
                    console.error("Failed to query user for email notification:", err.message)
                }
            }

            if (recipientEmail && !(recipientEmail.startsWith('guest_') && recipientEmail.endsWith('@dtshop.com'))) {
                console.log(`Sending status update notification email to: ${recipientEmail}`)
                try {
                    const { sendOrderStatusUpdateEmail } = require('./MailService')
                    await sendOrderStatusUpdateEmail(recipientEmail, order)
                } catch (mailErr) {
                    console.error("Failed to send status update email:", mailErr.message)
                }
            }

            return resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: order
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createOrder,
    getAllOrderDetails,
    getOrderDetails,
    cancelOrderDetails,
    getAllOrder,
    updateOrderStatus
}
