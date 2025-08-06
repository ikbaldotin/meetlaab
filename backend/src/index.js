import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1/auth", authRoutes)

app.listen(process.env.PORT, () => {

    console.log(`server is running ${process.env.PORT}`)
})