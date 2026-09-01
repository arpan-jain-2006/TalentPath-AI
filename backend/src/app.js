const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

// 👉 Render proxy ke through secure cookies allow karne ke liye:
app.set("trust proxy", 1)

app.use(express.json())
app.use(cookieParser())

// Updated CORS origin
app.use(cors({
    origin: "https://talent-path-ai.vercel.app",
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app