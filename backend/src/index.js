import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import problemRoutes from "./routes/problem.routes.js"
import executionRoute from "./routes/executeCode.route.js"
import submissionRoute from "./routes/submission.route.js"
import playlistRoute from "./routes/playlist.route.js"
dotenv.config()

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/problems", problemRoutes)
app.use("/api/v1/executedCode", executionRoute)
app.use("/api/v1/submissions", submissionRoute)
app.use("/api/v1/playlist", playlistRoute)

app.listen(process.env.PORT, () => {

    console.log(`server is running ${process.env.PORT}`)
})