const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

async function authUser(req, res, next) {
    try {
        // 👉 1. Cookie ya Header dono se token fetch karo
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({
                message: "Token not provided."
            })
        }

        // 2. Blacklist check
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Token is invalid or expired."
            })
        }

        // 3. Token verification
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded

        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token."
        })
    }
}

module.exports = { authUser }