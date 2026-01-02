    const jwt = require('jsonwebtoken')
    require('dotenv').config()

    const authMiddleWare = (req, res, next) => {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({
                message: 'Authorization header missing',
                status: 'ERROR'
            })
        }

        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Invalid token format',
                status: 'ERROR'
            })
        }

        const token = authHeader.split(' ')[1]

        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                return res.status(401).json({
                    message: 'Token invalid or expired',
                    status: 'ERROR'
                })
            }

            if (!user?.isAdmin) {
                return res.status(403).json({
                    message: 'Admin permission required',
                    status: 'ERROR'
                })
            }

            req.user = user
            next()
        })
    }

    const authUserMiddleWare = (req, res, next) => {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authorization header missing',
                status: 'ERROR'
            })
        }

        const token = authHeader.split(' ')[1]
        const userId = req.params.id;


        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) {
                return res.status(401).json({
                    message: 'Token invalid or expired',
                    status: 'ERROR'
                })
            }

            if (user.isAdmin || user.id === userId) {
                req.user = user
                next()
            } else {
                return res.status(403).json({
                    message: 'Permission denied',
                    status: 'ERROR'
                })
            }
        })
    }

    const authUserLogin = (req, res, next) => {
    const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
            message: "Unauthorized",
            status: "ERROR"
            })
        }

    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) {
        return res.status(401).json({
            message: "Token invalid",
            status: "ERROR"
        })
        }

        req.user = user
        next()
  })
}

module.exports = {
  authMiddleWare,
  authUserMiddleWare,
  authUserLogin
}
