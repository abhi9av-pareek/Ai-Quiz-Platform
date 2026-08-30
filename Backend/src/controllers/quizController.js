import Quiz from "../Models/quiz.js";
import User from "../Models/user.js";

/*
   HELPER — check and update streak
   Logic:
   - If lastActiveDate was yesterday → streak continues (+1)
   - If lastActiveDate was today     → streak unchanged (already counted)
   - Anything older                  → streak resets to 1
   Returns { streak, xpBonus }
*/
const updateStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (last) last.setHours(0, 0, 0, 0);

  let xpBonus = 0;

  if (!last) {
    // First ever quiz
    user.streak = 1;
    xpBonus = 20;
  } else {
    const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // Already active today — no change, no bonus
    } else if (diffDays === 1) {
      // Active yesterday — streak continues
      user.streak += 1;
      xpBonus = 20;
    } else {
      // Missed a day — streak resets
      user.streak = 1;
      xpBonus = 20;
    }
  }

  user.lastActiveDate = new Date();
  return xpBonus;
};

/* ═══════════════════════════════════════════════════════════
   HELPER — update weak topics on the user model
   For each weak topic detected in this quiz:
   - If already exists → recalculate avgScore, increment attempts
   - If new           → add it with suggestion
═══════════════════════════════════════════════════════════ */
const updateWeakTopics = (user, questions, subject) => {
  // Group questions by topic and calculate per-topic accuracy
  const topicMap = {};
  questions.forEach((q) => {
    if (!q.topic) return;
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
    topicMap[q.topic].total += 1;
    if (q.isCorrect) topicMap[q.topic].correct += 1;
  });

  for (const [topic, data] of Object.entries(topicMap)) {
    const topicScore = Math.round((data.correct / data.total) * 100);
    const existingIndex = user.weakTopics.findIndex(
      (wt) => wt.subject === subject && wt.topic === topic,
    );

    if (topicScore < 60) {
      // Topic is weak (below 60% threshold)
      if (existingIndex !== -1) {
        // Already tracked — update rolling average
        const existing = user.weakTopics[existingIndex];
        const totalAttempts = existing.attempts + 1;
        const newAvg = Math.round(
          (existing.avgScore * existing.attempts + topicScore) / totalAttempts,
        );
        user.weakTopics[existingIndex].avgScore = newAvg;
        user.weakTopics[existingIndex].attempts = totalAttempts;
        user.weakTopics[existingIndex].suggestion = generateSuggestion(
          subject,
          topic,
          newAvg,
        );
      } else {
        // New weak topic — add it
        user.weakTopics.push({
          subject,
          topic,
          avgScore: topicScore,
          attempts: 1,
          suggestion: generateSuggestion(subject, topic, topicScore),
        });
      }
    } else {
      // Topic improved above 60% — remove from weak topics if present
      if (existingIndex !== -1) {
        user.weakTopics.splice(existingIndex, 1);
      }
    }
  }
};

/* ═══════════════════════════════════════════════════════════
   HELPER — generate study suggestion based on score range
═══════════════════════════════════════════════════════════ */
const generateSuggestion = (subject, topic, avgScore) => {
  if (avgScore < 30) {
    return `"${topic}" in ${subject} needs urgent attention. Start from basics and watch a tutorial before attempting again.`;
  }
  if (avgScore < 50) {
    return `You're struggling with "${topic}" in ${subject}. Review core formulas and solve 10 practice questions.`;
  }
  return `"${topic}" in ${subject} is improving but still weak. A quick revision of key concepts should help.`;
};

/* ═══════════════════════════════════════════════════════════
   HELPER — recalculate rank for all users
   Sorts all users by XP descending and updates their rank field
   Called after every quiz submission
═══════════════════════════════════════════════════════════ */
const recalculateRanks = async () => {
  const allUsers = await User.find({}, "_id xp").sort({ xp: -1 });
  const bulkOps = allUsers.map((u, index) => ({
    updateOne: {
      filter: { _id: u._id },
      update: { $set: { rank: index + 1 } },
    },
  }));
  if (bulkOps.length > 0) await User.bulkWrite(bulkOps);
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 1 — SUBMIT QUIZ
   POST /api/quiz/submit
   Body: { subject, difficulty, totalQuestions, timePerQuestion,
           options, questions, timeTakenTotal }
   - Saves quiz attempt to Quiz collection
   - Awards XP to user
   - Updates streak
   - Updates weak topics
   - Updates accuracy stats
   - Recalculates rank
═══════════════════════════════════════════════════════════ */
export const submitQuiz = async (req, res) => {
  try {
    const userId = req.user.id; // set by auth middleware
    const {
      subject,
      difficulty,
      totalQuestions,
      timePerQuestion,
      options,
      questions, // array of questionResult objects
      timeTakenTotal,
    } = req.body;

    // ── 1. Calculate score ──
    const totalCorrect = questions.filter((q) => q.isCorrect).length;
    const totalWrong = questions.filter(
      (q) => !q.isCorrect && q.userAnswer !== null,
    ).length;
    const totalSkipped = questions.filter((q) => q.userAnswer === null).length;
    const scorePercent = Math.round((totalCorrect / totalQuestions) * 100);

    // ── 2. Calculate XP for this quiz ──
    const xpEarned = Quiz.calculateXP(scorePercent);

    // ── 3. Detect weak topics from this quiz ──
    const weakTopicsDetected = Quiz.detectWeakTopics(questions);

    // ── 4. Save quiz attempt ──
    const quiz = await Quiz.create({
      userId,
      subject,
      difficulty,
      totalQuestions,
      timePerQuestion,
      options,
      questions,
      totalCorrect,
      totalWrong,
      totalSkipped,
      scorePercent,
      xpEarned,
      timeTakenTotal,
      weakTopicsDetected,
      status: "completed",
    });

    // ── 5. Update user ──
    const user = await User.findById(userId);

    // XP
    const streakBonus = updateStreak(user); // updates streak, returns bonus XP
    user.xp += xpEarned + streakBonus;

    // Accuracy (running totals)
    user.totalQuestionsAttempted += totalQuestions;
    user.totalCorrect += totalCorrect;

    // Preferences — add subject if not already saved
    if (!user.preferences.subjects.includes(subject)) {
      user.preferences.subjects.push(subject);
    }

    // Weak topics
    updateWeakTopics(user, questions, subject);

    await user.save();

    // ── 6. Recalculate ranks for all users ──
    await recalculateRanks();

    // ── 7. Respond ──
    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        quizId: quiz._id,
        scorePercent,
        totalCorrect,
        totalWrong,
        totalSkipped,
        xpEarned,
        streakBonus,
        totalXpEarned: xpEarned + streakBonus,
        resultLabel: quiz.resultLabel,
        weakTopicsDetected,
        newXP: user.xp,
        newStreak: user.streak,
        accuracy: user.accuracy,
        rank: user.rank,
      },
    });
  } catch (error) {
    console.error("submitQuiz error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 2 — GET DASHBOARD DATA
   GET /api/quiz/dashboard
   Returns everything the Dashboard.jsx needs:
   - XP, streak, accuracy, rank
   - Recent activity (last 10 quizzes)
   - Subject progress (per subject stats)
   - Weak topics with suggestions
═══════════════════════════════════════════════════════════ */
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    // ── Adding this check after getting several errors
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // ── Recent activity: last 10 quizzes ──
    const recentQuizzes = await Quiz.find({ userId, status: "completed" })
      .sort({ completedAt: -1 })
      .limit(10)
      .select(
        "subject difficulty scorePercent totalCorrect totalQuestions xpEarned completedAt weakTopicsDetected",
      );

    // ── Subject progress: group by subject ──
    const allQuizzes = await Quiz.find({ userId, status: "completed" }).select(
      "subject totalCorrect totalQuestions",
    );

    const subjectMap = {};
    allQuizzes.forEach((q) => {
      if (!subjectMap[q.subject]) {
        subjectMap[q.subject] = { totalCorrect: 0, totalQuestions: 0 };
      }
      subjectMap[q.subject].totalCorrect += q.totalCorrect;
      subjectMap[q.subject].totalQuestions += q.totalQuestions;
    });

    const subjectProgress = Object.entries(subjectMap).map(
      ([subject, data]) => ({
        subject,
        progress: Math.round((data.totalCorrect / data.totalQuestions) * 100),
        totalQuestions: data.totalQuestions,
      }),
    );

    // ── Random quiz suggestion based on preferences ──
    const preferredSubjects = user.preferences.subjects;
    const randomSubject =
      preferredSubjects.length > 0
        ? preferredSubjects[
            Math.floor(Math.random() * preferredSubjects.length)
          ]
        : "Mathematics";

    res.status(200).json({
      success: true,
      dashboard: {
        // Hero stats
        xp: user.xp,
        streak: user.streak,
        accuracy: user.accuracy, // virtual
        rank: user.rank,
        level: user.level, // virtual (Newcomer → Legend)

        // Sections
        recentActivity: recentQuizzes,
        subjectProgress,
        weakTopics: user.weakTopics,
        preferences: user.preferences,

        // Random quiz suggestion
        randomQuizSubject: randomSubject,
      },
    });
  } catch (error) {
    console.error("getDashboardData error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 3 — GET WEAK TOPICS
   GET /api/quiz/weak-topics
   Returns weak topics with suggestions for the current user
═══════════════════════════════════════════════════════════ */
export const getWeakTopics = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("weakTopics");

    // Sort by avgScore ascending (worst first)
    const sorted = [...user.weakTopics].sort((a, b) => a.avgScore - b.avgScore);

    res.status(200).json({ success: true, weakTopics: sorted });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 4 — ADD BOOKMARK
   POST /api/quiz/bookmark
   Body: { questionId, subject, topic, questionText, notes }
═══════════════════════════════════════════════════════════ */
export const addBookmark = async (req, res) => {
  try {
    const { questionId, subject, topic, questionText, notes } = req.body;
    const user = await User.findById(req.user.id);

    // Prevent duplicate bookmarks
    const exists = user.bookmarks.find((b) => b.questionId === questionId);
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Already bookmarked" });
    }

    user.bookmarks.push({
      questionId,
      subject,
      topic,
      questionText,
      notes: notes || "",
    });
    await user.save();

    res.status(200).json({
      success: true,
      message: "Bookmark added",
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 5 — UPDATE BOOKMARK NOTES
   PATCH /api/quiz/bookmark/:questionId
   Body: { notes }
═══════════════════════════════════════════════════════════ */
export const updateBookmarkNotes = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { notes } = req.body;
    const user = await User.findById(req.user.id);

    const bookmark = user.bookmarks.find((b) => b.questionId === questionId);
    if (!bookmark) {
      return res
        .status(404)
        .json({ success: false, message: "Bookmark not found" });
    }

    bookmark.notes = notes;
    await user.save();

    res.status(200).json({ success: true, message: "Notes updated", bookmark });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 6 — REMOVE BOOKMARK
   DELETE /api/quiz/bookmark/:questionId
═══════════════════════════════════════════════════════════ */
export const removeBookmark = async (req, res) => {
  try {
    const { questionId } = req.params;
    const user = await User.findById(req.user.id);

    user.bookmarks = user.bookmarks.filter((b) => b.questionId !== questionId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Bookmark removed",
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 7 — GET ALL BOOKMARKS
   GET /api/quiz/bookmarks
═══════════════════════════════════════════════════════════ */
export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("bookmarks");

    res.status(200).json({ success: true, bookmarks: user.bookmarks });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 8 — GET QUIZ HISTORY
   GET /api/quiz/history?subject=Mathematics&limit=20
═══════════════════════════════════════════════════════════ */
export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, limit = 20 } = req.query;

    const filter = { userId, status: "completed" };
    if (subject) filter.subject = subject;

    const history = await Quiz.find(filter)
      .sort({ completedAt: -1 })
      .limit(Number(limit))
      .select(
        "subject difficulty scorePercent totalCorrect totalQuestions xpEarned timeTakenTotal completedAt weakTopicsDetected",
      );

    res.status(200).json({ success: true, history });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

