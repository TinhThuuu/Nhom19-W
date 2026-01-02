const OrderService = require('../services/OrderService')

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

module.exports = {
    createOrder,
    getAllOrderDetails,
    getDetailsOrder,
    cancelOrderDetails,
    getAllOrder
}
