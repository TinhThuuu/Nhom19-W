const Product = require("../models/ProductModel")
const Order = require('../models/OrderProduct')
const User = require('../models/UserModel')

const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const { name, image, type, countInStock, price, description, discount } = newProduct
        try {
            const checkProduct = await Product.findOne({
                name: name
            })
            if (checkProduct !== null) {
                resolve({
                    status: 'ERR',
                    message: 'The name of product is already'
                })
                return
            }
            const created = await Product.create({
                name,
                image,
                type,
                countInStock: Number(countInStock),
                price,
                description,
                discount: Number(discount || 0),
                // rating/numReviews/reviews are managed by system (defaults in schema)
            })
            if (created) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: created
                })
                return
            }
            resolve({ status: 'ERR', message: 'Create product failed' })
        } catch (e) {
            reject(e)
        }
    })
}

const updateProduct = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if (checkProduct === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
                return
            }

            // prevent admin from modifying rating/reviews directly
            if (data) {
                delete data.rating
                delete data.reviews
                delete data.numReviews
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedProduct
            })
        } catch (e) {
            reject(e)
        }
    })
}

const deleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkProduct = await Product.findOne({
                _id: id
            })
            if (checkProduct === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            await Product.findByIdAndDelete(id)
            resolve({
                status: 'OK',
                message: 'Delete product success',
            })
        } catch (e) {
            reject(e)
        }
    })
}

const deleteManyProduct = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {
            await Product.deleteMany({ _id: ids })
            resolve({
                status: 'OK',
                message: 'Delete product success',
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getDetailsProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findOne({
                _id: id
            })
            if (product === null) {
                resolve({
                    status: 'ERR',
                    message: 'The product is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCESS',
                data: product
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllProduct = async (limit, page, sort, filter) => {
    try {
        let query = {}

        if (filter) {
            const label = filter[0]
            const value = filter[1]
            query[label] = { $regex: value, $options: 'i' }
        }

        let productQuery = Product.find(query)

        if (sort) {
            const sortObj = {}
            sortObj[sort[1]] = sort[0] === 'asc' ? 1 : -1
            productQuery = productQuery.sort(sortObj)
        }

        if (limit) {
            productQuery = productQuery.limit(limit).skip(page * limit)
        }

        productQuery = productQuery.sort({ createdAt: -1, updatedAt: -1 })

        const products = await productQuery
        const total = await Product.countDocuments(query)

        return {
            status: 'OK',
            message: 'Success',
            data: products,
            total,
            pageCurrent: page + 1,
            totalPage: limit ? Math.ceil(total / limit) : 1
        }
    } catch (e) {
        throw e
    }
}

const getAllType = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allType = await Product.distinct('type')
            resolve({
                status: 'OK',
                message: 'Success',
                data: allType,
            })
        } catch (e) {
            reject(e)
        }
    })
}

const createReview = (productId, userId, rating, comment) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await Product.findById(productId)
            if (!product) {
                resolve({ status: 'ERR', message: 'The product is not defined' })
                return
            }

            // check order: user must have an order containing this product and paid/delivered
            const order = await Order.findOne({ user: userId, 'orderItems.product': productId, $or: [{ isPaid: true }, { isDelivered: true }] })
            if (!order) {
                resolve({ status: 'ERR', message: 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng.' })
                return
            }

            // check existing review by this user
            const already = product.reviews && product.reviews.find(r => r.user && r.user.toString() === userId.toString())
            if (already) {
                resolve({ status: 'ERR', message: 'Bạn đã đánh giá sản phẩm này rồi.' })
                return
            }

            const user = await User.findById(userId)
            const review = {
                user: userId,
                name: user ? user.name : 'Khách hàng',
                rating: Number(rating),
                comment: comment || ''
            }

            product.reviews = product.reviews || []
            product.reviews.push(review)
            product.numReviews = product.reviews.length
            const total = product.reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
            product.rating = product.numReviews ? (total / product.numReviews) : 0

            await product.save()

            resolve({ status: 'OK', message: 'SUCESS', data: product })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createProduct,
    updateProduct,
    getDetailsProduct,
    deleteProduct,
    getAllProduct,
    deleteManyProduct,
    getAllType,
    createReview
}