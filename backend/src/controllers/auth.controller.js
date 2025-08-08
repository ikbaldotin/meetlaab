import bcrypt from "bcryptjs"
import { db } from "../lib/db.js"
import { UserRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"
export const register = async (req, res) => {
    const { email, password, name } = req.body
    try {
        const exitingUser = await db.user.findUnique({
            where: {
                email
            }
        })
        if (exitingUser) {
            return res.status(400).json({ error: "user already exists" })
        }
        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await db.user.create({
            data: {
                email,
                name,
                password: hashPassword,
                role: UserRole.USER
            }
        })
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days

        })
        res.status(201).json({
            message: "user created successfully ",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,


            }
        })

    } catch (error) {

        console.error(error)
        res.status(400).json({
            error: " An error occurred while registering the user", error
        })

    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "invalid credentail" })
        }
        const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days          

        })
        res.status(201).json({
            message: "user login successfully ",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,


            }
        })

    } catch (error) {
        console.error(error)
        res.status(400).json({
            error: " An error occurred while logging in the user", error
        })

    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",


        })
        res.status(201).json({
            message: "user logout successfully"
        })
    } catch (error) {
        console.error(error)
        res.status(400).json({
            error: " An error occurred while logging out the user", error
        })

    }
}

export const check = async (req, res) => {

    try {
        res.status(200).json({
            success: true,
            message: "user auth successfully",
            user: req.user

        })

    } catch (error) {
        console.error(error)
        res.status(400).json({
            error: " An error occurred while checking user authentication", error
        })

    }
}