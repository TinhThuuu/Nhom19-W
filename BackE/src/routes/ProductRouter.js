const express = require("express")
const router = express.Router()
const ProductController = require('../controllers/ProductController')
const { authMiddleWare, authUserLogin } = require("../middleware/authMiddleware")

// ===== ADMIN =====
router.post('/create', authMiddleWare, ProductController.createProduct)
router.put('/update/:id', authMiddleWare, ProductController.updateProduct)
router.delete('/delete/:id', authMiddleWare, ProductController.deleteProduct)
router.delete('/delete-many', authMiddleWare, ProductController.deleteMany)

// ===== PUBLIC =====
router.get('/get-details/:id', ProductController.getDetailsProduct)
router.get('/get-all', ProductController.getAllProduct)
router.get('/get-all-type', ProductController.getAllType)
router.post('/review/:id', authUserLogin, ProductController.createReview)

module.exports = router
