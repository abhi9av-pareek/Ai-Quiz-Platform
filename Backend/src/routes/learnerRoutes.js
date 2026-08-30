import express from "express";
import { getProfile, getAnalysis } from "../controllers/learnerController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All learner routes require authentication
router.get("/profile",          verifyToken, getProfile);
router.get("/analysis/:quizId", verifyToken, getAnalysis);

export default router;
