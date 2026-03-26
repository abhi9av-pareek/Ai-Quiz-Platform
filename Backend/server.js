import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

const app = express();
app.use((req, res, next) => {
  console.log(" Request hit:", req.method, req.url);
  next();
});
// connect DB
connectDB();
// use cors
app.use(cors());
// middleware
app.use(express.json());

//  ADD THIS
app.get("/", (req, res) => {
  res.send("API is running...");
});

// routes
app.use("/api/auth", authRoutes);

// console.log(process.env.JWT_SECRET);
// start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
