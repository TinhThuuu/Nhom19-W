const OrderService = require('../services/OrderService')
const User = require('../models/UserModel')

// ================= CREATE ORDER =================
const createOrder = async (req, res) => {
    try {
        const {
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            fullName,
            address,
            city,
            phone,
            orderItems
        } = req.body

        if (
            !paymentMethod ||
            itemsPrice === undefined ||
            shippingPrice === undefined ||
            totalPrice === undefined ||
            !fullName ||
            !address ||
            !city ||
            !phone ||
            !Array.isArray(orderItems) ||
            orderItems.length === 0
            ) {
            return res.status(400).json({
                status: "ERR",
                message: "Missing or invalid required fields",
            });
            }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(200).json({
                status: "ERR",
                message: "Số điện thoại phải chứa đúng 10 chữ số",
            });
        }

        const userId = req.user.id
        const email = req.user.email

        const response = await OrderService.createOrder({
            ...req.body,
            user: userId,
            email
        })

        return res.status(200).json(response)
    } catch (e) {
        console.log('CREATE ORDER ERROR:', e)
        return res.status(500).json({
            
            status: 'ERR',
            message: e.message
        })
    }
}

// ================= GET ALL ORDER BY USER =================
const getAllOrderDetails = async (req, res) => {
    try {
        const userId = req.user.id

        const response = await OrderService.getAllOrderDetails(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        })
    }
}

// ================= GET ORDER DETAILS =================
const getDetailsOrder = async (req, res) => {
    try {
        const orderId = req.params.id

        if (!orderId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'OrderId is required'
            })
        }

        const response = await OrderService.getOrderDetails(orderId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        })
    }
}

// ================= CANCEL ORDER =================
const cancelOrderDetails = async (req, res) => {
    try {
        const { orderItems, orderId } = req.body

        if (!orderId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'OrderId is required'
            })
        }

        const response = await OrderService.cancelOrderDetails(orderId, orderItems)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        })
    }
}

// ================= ADMIN: GET ALL ORDER =================
const getAllOrder = async (req, res) => {
    try {
        const data = await OrderService.getAllOrder()
        return res.status(200).json(data)
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        })
    }
}

// ================= CREATE GUEST ORDER =================
const createGuestOrder = async (req, res) => {
    try {
        const {
            paymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice,
            fullName,
            address,
            city,
            phone,
            orderItems,
            email
        } = req.body

        if (
            !paymentMethod ||
            itemsPrice === undefined ||
            shippingPrice === undefined ||
            totalPrice === undefined ||
            !fullName ||
            !address ||
            !city ||
            !phone ||
            !email ||
            !Array.isArray(orderItems) ||
            orderItems.length === 0
        ) {
            return res.status(400).json({
                status: "ERR",
                message: "Missing or invalid required fields",
            });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(200).json({
                status: "ERR",
                message: "Số điện thoại phải chứa đúng 10 chữ số",
            });
        }

        const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!isEmail.test(email)) {
            return res.status(200).json({
                status: "ERR",
                message: "Email không đúng định dạng",
            });
        }

        // Generate a mock unique email from the phone number for the user account mapping
        const guestEmail = `guest_${phone}@dtshop.com`

        // Find or create guest user document in the database
        let userDoc = await User.findOne({ email: guestEmail })
        if (!userDoc) {
            const randomPassword = Math.random().toString(36).substring(2, 10)
            userDoc = await User.create({
                email: guestEmail,
                password: randomPassword,
                name: fullName,
                phone,
                city,
                address,
                isAdmin: false
            })
        }

        const response = await OrderService.createOrder({
            ...req.body,
            user: userDoc._id,
            email: email // Store the customer's actual email
        })

        return res.status(200).json(response)
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        })
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id
        const data = req.body
        if (!orderId) {
            return res.status(400).json({
                status: 'ERR',
                message: 'The orderId is required'
            })
        }
        const response = await OrderService.updateOrderStatus(orderId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        })
    }
}

module.exports = {
    createOrder,
    getAllOrderDetails,
    getDetailsOrder,
    cancelOrderDetails,
    getAllOrder,
    createGuestOrder,
    updateOrderStatus
}
