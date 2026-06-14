const User = require("../models/UserModel")
const bcrypt = require("bcrypt")
const crypto = require('crypto')
const MailService = require('./MailService')
const { genneralAccessToken, genneralRefreshToken } = require("./JwtService")

const createUser = (newUser) => {
    return new Promise(async (resolve, reject) => {
        const { name, email, password, confirmPassword, phone } = newUser
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser !== null) {
                resolve({
                    status: 'ERR',
                    message: 'The email is already'
                })
            }
            const hash = bcrypt.hashSync(password, 10)
            const createdUser = await User.create({
                name,
                email,
                password: hash,
                phone
            })
            if (createdUser) {
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdUser
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

const loginUser = (userLogin) => {
    return new Promise(async (resolve, reject) => {
        const { email, password } = userLogin
        try {
            const checkUser = await User.findOne({
                email: email
            })
            if (checkUser === null) {
                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }
            const comparePassword = bcrypt.compareSync(password, checkUser.password)

            if (!comparePassword) {
                resolve({
                    status: 'ERR',
                    message: 'The password or user is incorrect'
                })
            }
            const access_token = await genneralAccessToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })

            const refresh_token = await genneralRefreshToken({
                id: checkUser.id,
                isAdmin: checkUser.isAdmin
            })

            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token,
                refresh_token
            })
        } catch (e) {
            reject(e)
        }
    })
}

const updateUser = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            })
            if (checkUser === null) {
                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }

            const updatedUser = await User.findByIdAndUpdate(id, data, { new: true })
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: updatedUser
            })
        } catch (e) {
            reject(e)
        }
    })
}

const changePassword = (userId, passwordData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = passwordData
            if (!currentPassword || !newPassword || !confirmPassword) {
                return resolve({
                    status: 'ERR',
                    message: 'Các trường mật khẩu là bắt buộc'
                })
            }

            if (newPassword !== confirmPassword) {
                return resolve({
                    status: 'ERR',
                    message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.'
                })
            }

            if (newPassword.length < 6) {
                return resolve({
                    status: 'ERR',
                    message: 'Mật khẩu mới phải có ít nhất 6 ký tự.'
                })
            }

            const user = await User.findById(userId)
            if (!user) {
                return resolve({
                    status: 'ERR',
                    message: 'Người dùng không tồn tại'
                })
            }

            const comparePassword = bcrypt.compareSync(currentPassword, user.password)
            if (!comparePassword) {
                return resolve({
                    status: 'ERR',
                    message: 'Mật khẩu hiện tại không chính xác.'
                })
            }

            const hash = bcrypt.hashSync(newPassword, 10)
            await User.findByIdAndUpdate(userId, { password: hash })

            resolve({
                status: 'OK',
                message: 'Đổi mật khẩu thành công'
            })
        } catch (e) {
            reject(e)
        }
    })
}

const deleteUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkUser = await User.findOne({
                _id: id
            })
            if (checkUser === null) {
                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }

            await User.findByIdAndDelete(id)
            resolve({
                status: 'OK',
                message: 'Delete user success',
            })
        } catch (e) {
            reject(e)
        }
    })
}

const deleteManyUser = (ids) => {
    return new Promise(async (resolve, reject) => {
        try {

            await User.deleteMany({ _id: ids })
            resolve({
                status: 'OK',
                message: 'Delete user success',
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allUser = await User.find().sort({createdAt: -1, updatedAt: -1})
            resolve({
                status: 'OK',
                message: 'Success',
                data: allUser
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getDetailsUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({
                _id: id
            })
            if (user === null) {
                resolve({
                    status: 'ERR',
                    message: 'The user is not defined'
                })
            }
            resolve({
                status: 'OK',
                message: 'SUCESS',
                data: user
            })
        } catch (e) {
            reject(e)
        }
    })
}

const forgotPassword = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email) {
                return resolve({ status: 'ERR', message: 'Email là bắt buộc' })
            }

            console.log('Forgot password email:', email)

            const user = await User.findOne({ email: email })
            console.log('User found:', !!user)

            // Trả về thông báo chung để không tiết lộ email tồn tại hay không
            if (!user) {
                return resolve({ status: 'OK', message: 'Hệ thống sẽ gửi email hướng dẫn đặt lại mật khẩu.' })
            }

            const token = crypto.randomBytes(32).toString('hex')
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

            user.passwordResetToken = hashedToken
            user.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour
            await user.save()

            const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`
            console.log('Reset link:', resetLink)
            console.log('Sending reset email to:', user.email)

            try {
                await MailService.sendPasswordResetEmail(user.email, resetLink)
                console.log('Reset password email sent successfully')
            } catch (mailErr) {
                // Log nhưng không tiết lộ chi tiết cho client
                console.error('Reset password email failed:', mailErr?.message || mailErr)
            }

            return resolve({ status: 'OK', message: 'Nếu email tồn tại, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.' })
        } catch (e) {
            reject(e)
        }
    })
}

const resetPassword = (token, passwordData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { password, confirmPassword } = passwordData
            if (!password || !confirmPassword) {
                return resolve({ status: 'ERR', message: 'Các trường mật khẩu là bắt buộc' })
            }
            if (password.length < 6) {
                return resolve({ status: 'ERR', message: 'Mật khẩu phải chứa ít nhất 6 ký tự.' })
            }
            if (password !== confirmPassword) {
                return resolve({ status: 'ERR', message: 'Mật khẩu không khớp' })
            }

            const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
            const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })
            if (!user) {
                return resolve({ status: 'ERR', message: 'Token không hợp lệ hoặc đã hết hạn' })
            }

            const hash = bcrypt.hashSync(password, 10)
            user.password = hash
            user.passwordResetToken = undefined
            user.passwordResetExpires = undefined
            await user.save()

            return resolve({ status: 'OK', message: 'Đặt lại mật khẩu thành công' })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    changePassword,
    forgotPassword,
    resetPassword,
    deleteManyUser
}