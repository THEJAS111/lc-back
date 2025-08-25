const express = require("express");
const app = express();
require("dotenv").config();
const main = require("./config/db");
const cookieparser = require("cookie-parser");
const authrouter = require("./routes/userauth");
const redisclient = require("./config/redis");
const problemrouter = require("./routes/problemcreator");
const submitrouter = require("./routes/submit");
const cors = require("cors");
const aiRouter = require("./routes/aichatting");

// Enhanced CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  // Add your actual frontend URL here if different
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

app.use(express.json());
app.use(cookieparser());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Backend is running on Vercel!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await main(); // Ensure DB is connected
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Routes
app.use("/user", authrouter);
app.use("/problem", problemrouter);
app.use("/submission", submitrouter);
app.use("/ai", aiRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize Redis connection (don't wait for it)
const initializeRedis = async () => {
  try {
    if (!redisclient.isOpen) {
      await redisclient.connect();
    }
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
    // Don't throw error - Redis is optional for basic functionality
  }
};

initializeRedis();

module.exports = app;
