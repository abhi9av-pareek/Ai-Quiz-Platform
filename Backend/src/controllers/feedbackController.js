import Feedback from "../Models/Feedback.js";
import { sendEmailNotification, sendWhatsAppNotification } from "../utils/notifier.js";

/**
 * @desc    Submit new suggestion / feedback
 * @route   POST /api/feedback/submit
 * @access  Public (Optional auth)
 */
export const submitFeedback = async (req, res) => {
  try {
    const { name, email, rating, category, message, context } = req.body;

    // Validation
    if (!name || !email || !rating || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (name, email, rating, message).",
      });
    }

    // Create feedback record in DB
    const feedback = await Feedback.create({
      userId: req.user?._id || null,
      name,
      email,
      rating: Number(rating),
      category: category || "Suggestion",
      message,
      context: context || "General",
    });

    // Trigger Notifications asynchronously in background
    let whatsappResult = { whatsappUrl: "" };
    try {
      // Async email notification dispatch (non-blocking)
      sendEmailNotification(feedback).catch((err) =>
        console.error("Async Email Dispatch Error:", err.message)
      );

      // Async WhatsApp notification dispatch & URL generation
      whatsappResult = await sendWhatsAppNotification(feedback);
    } catch (notifErr) {
      console.error("Notification trigger error:", notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Thank you! Your feedback has been submitted successfully.",
      data: feedback,
      whatsappUrl: whatsappResult.whatsappUrl || "",
    });
  } catch (error) {
    console.error("Error in submitFeedback controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback. Please try again later.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all feedback entries (For Admin Review)
 * @route   GET /api/feedback/all
 * @access  Public / Admin
 */
export const getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: feedbackList.length,
      data: feedbackList,
    });
  } catch (error) {
    console.error("Error fetching feedback list:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching feedback.",
    });
  }
};
