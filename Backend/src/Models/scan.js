import mongoose from "mongoose";

/* ── Extracted question sub-schema ── */
const extractedQuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, default: null },  // A/B/C/D, or null if answer not visible in source
    explanation: { type: String, default: "" },
    topic: { type: String, default: "General" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    confidence: { type: String, enum: ["high", "low"], default: "high" },  // "high" = answer clearly visible, "low" = inferred
    warnings: { type: [String], default: [] },  // OCR validation warnings for this question
  },
  { _id: false },
);

/* ── Main ScanRecord schema ── */
const scanRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ── Image metadata ── */
    imageThumbnail: { type: String, default: "" },  // small base64 thumbnail for history view
    fileName: { type: String, default: "scan.jpg" },
    imageCount: { type: Number, default: 1 },

    /* ── Extracted data ── */
    extractedQuestions: {
      type: [extractedQuestionSchema],
      default: [],
    },
    totalQuestionsExtracted: { type: Number, default: 0 },
    detectedSubject: { type: String, default: "General" },

    /* ── Quiz result (populated after quiz is completed) ── */
    quizCompleted: { type: Boolean, default: false },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    score: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalWrong: { type: Number, default: 0 },
    totalSkipped: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },          // seconds

    /* ── Metadata ── */
    scanDuration: { type: Number, default: 0 },       // ms taken for AI extraction
    status: {
      type: String,
      enum: ["scanned", "quiz_started", "quiz_completed"],
      default: "scanned",
    },
  },
  {
    timestamps: true,
  },
);

/* ── Virtual: score percentage ── */
scanRecordSchema.virtual("scorePercent").get(function () {
  if (this.totalQuestionsExtracted === 0) return 0;
  return Math.round((this.totalCorrect / this.totalQuestionsExtracted) * 100);
});

const ScanRecord = mongoose.model("ScanRecord", scanRecordSchema);
export default ScanRecord;
