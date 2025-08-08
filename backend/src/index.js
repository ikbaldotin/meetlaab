import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import problemRoutes from "./routes/problem.routes.js"
import executionRoute from "./routes/executeCode.route.js"
dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/problems", problemRoutes)
app.use("/api/v1/executedCode", executionRoute)

app.listen(process.env.PORT, () => {

    console.log(`server is running ${process.env.PORT}`)
})