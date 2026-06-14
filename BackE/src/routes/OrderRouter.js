const express = require("express");
const router = express.Router()
const OrderController = require('../controllers/OrderController');
const { authUserMiddleWare, authMiddleWare, authUserLogin, authOptional } = require("../middleware/authMiddleware");

router.get('/get-all-order/:id',authUserMiddleWare, OrderController.getAllOrderDetails)
router.get('/get-details-order/:id', OrderController.getDetailsOrder)
router.delete('/cancel-order/:id',authUserMiddleWare, OrderController.cancelOrderDetails)
router.get('/get-all-order',authMiddleWare, OrderController.getAllOrder)
router.post('/create', authUserLogin, OrderController.createOrder)
router.post('/create-guest', OrderController.createGuestOrder)
router.put('/update-status/:id', authMiddleWare, OrderController.updateOrderStatus)

module.exports = router