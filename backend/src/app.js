const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

// Allow localhost as well as all Vercel deployed frontends
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) return callback(null, true);
        
        if (
            origin.includes("localhost") || 
            origin.endsWith(".vercel.app")
        ) {
            return callback(null, true);
        } else {
            return callback(null, true); // production me allow-all fallback
        }
    },
    credentials: true
}));

/* Root Health Route */
app.get("/", (req, res) => {
    res.status(200).json({
        message: "🚀 TalentPath AI Backend is Live and Healthy!",
        status: "success"
    });
});

/* require all the routes here */
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

/* using all the routes here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;