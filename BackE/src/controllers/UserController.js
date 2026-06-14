const UserService = require('../services/UserService')
const JwtService = require('../services/JwtService')

const createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone } = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)
        if (!email || !password || !confirmPassword) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Vui lòng nhập đầy đủ thông tin'
            })
        } else if (!isCheckEmail) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Email không hợp lệ'
            })
        } else if (password.length < 6) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Mật khẩu phải chứa ít nhất 6 ký tự'
            })
        } else if (password !== confirmPassword) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Mật khẩu và xác nhận mật khẩu không trùng khớp'
            })
        } else if (phone && !/^[0-9]{10}$/.test(phone)) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Số điện thoại phải chứa đúng 10 chữ số'
            })
        }
        const response = await UserService.createUser(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)
        if (!email || !password) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'
            })
        } else if (!isCheckEmail) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is email'
            })
        }
        const response = await UserService.loginUser(req.body)
        const { refresh_token, ...newReponse } = response
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/',
        })
        return res.status(200).json({...newReponse, refresh_token})
    } catch (e) {
        return res.status(500).json({ 
            status: 'ERR',
            message: e.message || e 
        })
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id
        const data = req.body
        if (!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Số điện thoại phải chứa đúng 10 chữ số'
            })
        }
        const response = await UserService.updateUser(userId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await UserService.deleteUser(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteMany = async (req, res) => {
    try {
        const ids = req.body.ids
        if (!ids) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The ids is required'
            })
        }
        const response = await UserService.deleteManyUser(ids)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Vui lòng nhập đầy đủ các trường mật khẩu.'
            })
        }

        const response = await UserService.changePassword(req.user?.id, {
            currentPassword,
            newPassword,
            confirmPassword,
        })

        if (response.status === 'OK') {
            return res.status(200).json(response)
        }

        return res.status(200).json(response)
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'Đổi mật khẩu thất bại'
        })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const response = await UserService.forgotPassword(email)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'Gửi yêu cầu đặt lại mật khẩu thất bại'
        })
    }
}

const resetPassword = async (req, res) => {
    try {
        const token = req.params.token
        const { password, confirmPassword } = req.body
        const response = await UserService.resetPassword(token, { password, confirmPassword })
        if (response.status === 'OK') {
            return res.status(200).json(response)
        }
        return res.status(400).json(response)
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'Đặt lại mật khẩu thất bại'
        })
    }
}


const getAllUser = async (req, res) => {
    try {
        const response = await UserService.getAllUser()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailsUser = async (req, res) => {
    try {
        const userId = req.params.id
        if (!userId) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }
        const response = await UserService.getDetailsUser(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const refreshToken = async (req, res) => {
    try {
        let token = req.headers.token.split(' ')[1]
        if (!token) {
            return res.status(200).json({
                status: 'ERR',
                message: 'The token is required'
            })
        }
        const response = await JwtService.refreshTokenJwtService(token)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}


const logoutUser = async (req, res) => {
    try {
        res.clearCookie('refresh_token')
        return res.status(200).json({
            status: 'OK',
            message: 'Logout successfully'
        })
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}
module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    refreshToken,
    logoutUser,
    deleteMany,
    changePassword,
    forgotPassword,
    resetPassword
}
