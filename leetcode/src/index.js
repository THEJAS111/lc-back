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
// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // only one URL allowed
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use(cookieparser());
app.get("/", (req, res) => {
  res.send("🚀 Backend is running on Vercel!");
});
// Routes
app.use("/user", authrouter);
app.use("/problem", problemrouter);
app.use("/submission", submitrouter);
app.use("/ai", aiRouter);
// DB + Redis initialization
const initializeConnection = async () => {
  try {
    await Promise.all([main(), redisclient.connect()]);
    console.log("✅ DB & Redis connected");
  } catch (err) {
    console.error("❌ Error occurred: " + err);
  }
};
initializeConnection();
// ✅ Instead of app.listen, export the app
module.exports = app;
