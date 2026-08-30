import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import scanRoutes from "./src/routes/scanRoutes.js";
import gyanbotRoutes from "./src/routes/gyanbotRoutes.js";
import feedbackRoutes from "./src/routes/feedbackRoutes.js";

dotenv.config();

const app = express();
const allowedOrigins = [
  "https://brainnbyte.netlify.app", // current live deployment
  "https://gyantra.netlify.app", // future renamed deployment
  "https://gyantraa.in",            // custom domain (HTTPS)
  "http://gyantraa.in",             // custom domain (HTTP, until redirect enforced)
  "https://www.gyantraa.in",        // custom domain with www
  "http://www.gyantraa.in",         // custom domain with www (HTTP)
];
const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

// logging middleware
app.use((req, res, next) => {
  console.log("Request hit:", req.method, req.url);
  next();
});

// connect DB
connectDB();

// middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// routes
app.use("/api/quiz", quizRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/scan", scanRoutes);

// GyanBot AI Chatbot
app.use("/api/gyanbot", gyanbotRoutes);

// Feedback & Suggestion Box Route
app.use("/api/feedback", feedbackRoutes);

// root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Server Error" });
});

// start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
