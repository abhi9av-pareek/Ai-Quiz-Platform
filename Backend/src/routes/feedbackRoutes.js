import express from "express";
import { submitFeedback, getAllFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

// Public feedback submission endpoint
router.post("/submit", submitFeedback);

// Fetch all feedback (Admin)
router.get("/all", getAllFeedback);

export default router;
