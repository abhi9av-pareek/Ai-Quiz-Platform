import {
  getLearnerProfile,
  getQuizAnalysis,
} from "../utils/learnerAnalysisService.js";

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 1 — GET LEARNER PROFILE
   GET /api/learner/profile
   Returns the current persistent learner profile for the
   authenticated student.
═══════════════════════════════════════════════════════════ */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await getLearnerProfile(userId);

    if (!profile) {
      return res.status(200).json({
        success: true,
        profile: null,
        message: "No learner profile yet. Complete a quiz to generate your initial profile.",
      });
    }

    res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 2 — GET QUIZ-SPECIFIC ANALYSIS
   GET /api/learner/analysis/:quizId
   Returns the learner analysis recorded for one specific
   quiz attempt (from attemptHistory in the profile).
   Students can only access their own data.
═══════════════════════════════════════════════════════════ */
export const getAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({ success: false, message: "quizId is required" });
    }

    const analysis = await getQuizAnalysis(userId, quizId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No analysis found for this quiz. It may not have been processed yet.",
      });
    }

    res.status(200).json({ success: true, analysis });
  } catch (err) {
    console.error("getAnalysis error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
