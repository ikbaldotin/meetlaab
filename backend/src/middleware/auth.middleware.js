import jwt from "jsonwebtoken"
import { db } from "../lib/db.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            res.status(400).json({
                message: "no token is found"
            })
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            return res.status(400).json({
                message: "invalid token"
            })

        }
        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        })
        if (!user) {
            return res.status(400).json({
                message: "user not found"
            })
        }
        req.user = user
        next()

    } catch (error) {
        console.error(error)
        res.status(400).json({
            error: " An error occurred while authenticating the user", error
        })

    }

}

export const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await db.user.findUnique({
            where: {
                id: userId
            },
            select: {
                role: true
            }
        })
        if (!user || !user.role === "ADMIN") {
            return res.status(403).json({
                message: "Access denied, admin only"
            })
        }
        next()

    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: "An error occurred while checking admin privileges", error
        })

    }
}