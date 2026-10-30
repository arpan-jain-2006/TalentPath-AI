const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const compression = require("compression")

const app = express()

// Trust proxy for secure cookies behind reverse proxies (Render, Vercel, Cloudflare)
app.set("trust proxy", 1)

// Enable gzip/brotli compression for ultra-fast response transmission
app.use(compression())

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

// Supported origins for CORS
const allowedOrigins = [
    "https://talent-path-ai.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // Allow mobile apps, postman, server-to-server or curl requests
        if (!origin) return callback(null, true)
        
        const isAllowed = allowedOrigins.includes(origin) ||
                          /^http:\/\/localhost:\d+$/.test(origin) ||
                          /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
                          origin.endsWith(".vercel.app")

        if (isAllowed) {
            return callback(null, origin)
        }
        return callback(null, origin)
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Disposition", "Content-Length", "Content-Type"]
}))

/* Health check endpoint */
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.message || err)
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message: "Uploaded file is too large. Maximum allowed size is 8MB."
        })
    }
    return res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    })
})

module.exports = app