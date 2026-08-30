import mongoose from "mongoose";

/* ── Bookmark sub-schema ── */
const bookmarkSchema = new mongoose.Schema(
  {
    questionId: { type: String },
    subject: { type: String },
    topic: { type: String },
    questionText: { type: String },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

/* ── Weak topic sub-schema ── */
const weakTopicSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    avgScore: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    suggestion: { type: String, default: "" },
  },
  { _id: false },
);

/* ── Main user schema ── */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    educationLevel: {
      type: String,
      required: true,
    },

    /* ── TARGET EXAM (competitive exam focus) ── */
    targetExam: {
      type: String,
      trim: true,
      default: "", // e.g. "UPSC", "SSC CGL", "GATE", "Banking"
    },

    /* ── PROFILE ── */
    nickname: {
      type: String,
      trim: true,
      maxlength: 20,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },

    /* ── EDUCATION EXTRAS ── */
    institution: {
      type: String,
      trim: true,
      default: "",
    },
    yearOfStudy: {
      type: String,
      default: "",
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      default: "",
    },

    /* ── XP & STREAK ── */
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },

    /* ── ACCURACY ── */
    totalQuestionsAttempted: {
      type: Number,
      default: 0,
    },
    totalCorrect: {
      type: Number,
      default: 0,
    },

    /* ── RANK ── */
    rank: {
      type: Number,
      default: null,
    },

    /* ── USER PREFERENCES ── */
    preferences: {
      subjects: {
        type: [String],
        default: [],
      },
      defaultDifficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium",
      },
      instantFeedback: {
        type: Boolean,
        default: true,
      },
      shuffleQuestions: {
        type: Boolean,
        default: true,
      },
      showStreak: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: false,
      },
    },

    /* ── WEAK TOPICS ── */
    weakTopics: {
      type: [weakTopicSchema],
      default: [],
    },

    /* ── BOOKMARKS ── */
    bookmarks: {
      type: [bookmarkSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

/* ── VIRTUAL: accuracy ── */
userSchema.virtual("accuracy").get(function () {
  if (this.totalQuestionsAttempted === 0) return 0;
  return Math.round((this.totalCorrect / this.totalQuestionsAttempted) * 100);
});

/* ── VIRTUAL: level ── */
userSchema.virtual("level").get(function () {
  if (this.xp >= 10000) return "Legend";
  if (this.xp >= 5000) return "Expert";
  if (this.xp >= 2000) return "Intermediate";
  if (this.xp >= 500) return "Beginner";
  return "Newcomer";
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
