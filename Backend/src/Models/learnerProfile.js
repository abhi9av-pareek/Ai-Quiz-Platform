import mongoose from "mongoose";

/* ─────────────────────────────────────────────────────────────────────────────
   TOPIC PROFILE sub-schema
   Tracks per-topic performance within a subject.
   Evidence level controls whether we call a topic "weak" or just "unknown".
──────────────────────────────────────────────────────────────────────────────*/
const topicProfileSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },

    // Raw counters — accumulated across all quiz attempts
    totalAttempted: { type: Number, default: 0 },
    totalCorrect:   { type: Number, default: 0 },
    totalWrong:     { type: Number, default: 0 },
    totalSkipped:   { type: Number, default: 0 },

    // Accuracy: computed from counters (correct / attempted)
    accuracy: { type: Number, default: 0 }, // 0–100

    // Time (only populated when timeTaken data is present)
    avgTimeSecs: { type: Number, default: null },

    /*
      evidenceLevel:
        "sufficient"   → ≥ 3 questions seen across all attempts
        "limited"      → 1–2 questions seen
        "insufficient" → 0 questions (topic recorded but never attempted)
      We NEVER call a topic "weak" unless evidenceLevel = "sufficient".
    */
    evidenceLevel: {
      type: String,
      enum: ["sufficient", "limited", "insufficient"],
      default: "insufficient",
    },

    /*
      strengthScore: 0–100 composite
      Formula: (accuracy × 0.7) + (speed_factor × 0.3)
      speed_factor = 0 if no timing data
    */
    strengthScore: { type: Number, default: 0 },

    /*
      priority:
        "high"    → poor accuracy with sufficient evidence, or repeated weakness
        "medium"  → moderate accuracy with sufficient evidence
        "low"     → strong accuracy
        "unknown" → insufficient evidence
    */
    priority: {
      type: String,
      enum: ["high", "medium", "low", "unknown"],
      default: "unknown",
    },

    // How many individual quiz questions have been seen from this topic
    quizzesSeen: { type: Number, default: 0 },

    // Track consecutive poor performances for "repeated weakness" detection
    consecutiveWeakAttempts: { type: Number, default: 0 },

    lastSeen: { type: Date, default: null },
  },
  { _id: false },
);

/* ─────────────────────────────────────────────────────────────────────────────
   SUBJECT PROFILE sub-schema
   Tracks per-subject performance + contains an array of topic profiles.
──────────────────────────────────────────────────────────────────────────────*/
const subjectProfileSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },

    // Running counters across all quiz attempts for this subject
    totalAttempted: { type: Number, default: 0 },
    totalCorrect:   { type: Number, default: 0 },
    totalWrong:     { type: Number, default: 0 },
    totalSkipped:   { type: Number, default: 0 },

    accuracy: { type: Number, default: 0 }, // 0–100

    // Avg seconds per question (null = no timing data)
    avgTimeSecs: { type: Number, default: null },

    // Composite 0–100 score for this subject
    strengthScore: { type: Number, default: 0 },

    // "high" | "medium" | "low" | "unknown"
    priority: {
      type: String,
      enum: ["high", "medium", "low", "unknown"],
      default: "unknown",
    },

    // How many full quiz attempts have been made on this subject
    quizAttempts: { type: Number, default: 0 },

    lastAttemptAt: { type: Date, default: null },

    // Per-difficulty accuracy for this subject
    difficultyAccuracy: {
      Easy:   { type: Number, default: null },
      Medium: { type: Number, default: null },
      Hard:   { type: Number, default: null },
    },

    // Topic-level breakdown
    topicProfiles: { type: [topicProfileSchema], default: [] },
  },
  { _id: false },
);

/* ─────────────────────────────────────────────────────────────────────────────
   ATTEMPT HISTORY ENTRY sub-schema
   Lightweight summary of each quiz stored in the learner profile.
   The full quiz data lives in the Quiz collection.
──────────────────────────────────────────────────────────────────────────────*/
const attemptHistorySchema = new mongoose.Schema(
  {
    quizId:         { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    subject:        { type: String },
    difficulty:     { type: String },
    totalQuestions: { type: Number },
    correct:        { type: Number },
    wrong:          { type: Number },
    skipped:        { type: Number },
    scorePercent:   { type: Number },
    accuracy:       { type: Number },       // correct / (correct + wrong)
    timeTakenTotal: { type: Number },       // seconds
    detectedPatterns: { type: [String], default: [] },
    analyzedAt:     { type: Date, default: Date.now },
  },
  { _id: false },
);

/* ─────────────────────────────────────────────────────────────────────────────
   PRIORITY AREA sub-schema
   The top areas the student should focus on.
──────────────────────────────────────────────────────────────────────────────*/
const priorityAreaSchema = new mongoose.Schema(
  {
    subject:  { type: String },
    topic:    { type: String },   // null = entire subject is priority
    reason:   { type: String },   // human-readable explanation
    priority: { type: String, enum: ["high", "medium", "low", "unknown"] },
  },
  { _id: false },
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LEARNER PROFILE schema
   One document per student. Updated after every quiz — never replaced.
──────────────────────────────────────────────────────────────────────────────*/
const learnerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,   // exactly one profile per student
      index: true,
    },

    // Target exam (UPSC, SSC CGL, etc.) — optional, set by user
    targetExam: { type: String, default: "" },

    // How many quizzes have been analyzed into this profile
    totalAttempts: { type: Number, default: 0 },

    // Weighted running accuracy across ALL subjects
    overallAccuracy: { type: Number, default: 0 },

    // Overall level derived from accuracy + XP proxy
    estimatedLevel: {
      type: String,
      enum: ["Beginner", "Developing", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    /*
      Profile confidence: how much data we actually have.
        "high"   → ≥ 5 quiz attempts
        "medium" → 2–4 attempts
        "low"    → 0–1 attempts
    */
    confidenceLevel: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },

    // Per-subject breakdown (grows over time)
    subjectProfiles: { type: [subjectProfileSchema], default: [] },

    // Lightweight quiz-by-quiz history (last 50 kept)
    attemptHistory: { type: [attemptHistorySchema], default: [] },

    // Latest pattern detections (updated each quiz)
    detectedPatterns: { type: [String], default: [] },

    // Top priority areas across all subjects (updated each quiz)
    priorityAreas: { type: [priorityAreaSchema], default: [] },

    // Single most actionable recommendation
    recommendedAction: { type: String, default: "" },

    // Convenience fields — list of subject names sorted by strength
    strongSubjects:   { type: [String], default: [] },
    weakSubjects:     { type: [String], default: [] },
    prioritySubjects: { type: [String], default: [] },

    lastUpdatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

/* ─────────────────────────────────────────────────────────────────────────────
   VIRTUAL: profileAge — how many days since first profile creation
──────────────────────────────────────────────────────────────────────────────*/
learnerProfileSchema.virtual("profileAgeDays").get(function () {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((Date.now() - this.createdAt) / msPerDay);
});

const LearnerProfile =
  mongoose.models.LearnerProfile ||
  mongoose.model("LearnerProfile", learnerProfileSchema);

export default LearnerProfile;
