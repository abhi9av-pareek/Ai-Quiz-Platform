/**
 * LEARNER ANALYSIS SERVICE
 * ========================
 * Pure deterministic analysis module — NO LLM calls.
 * Transforms raw quiz attempt data into structured learner insights
 * and updates the persistent LearnerProfile document.
 *
 * Design principles:
 *  - accuracy = correct / attempted  (NOT correct / total)
 *  - evidenceLevel gates all qualitative labels ("weak" / "strong")
 *  - patterns are detected from observable signals only
 *  - confidence reflects amount of data, not performance level
 *  - profile is UPDATED incrementally, never replaced
 */

import LearnerProfile from "../Models/learnerProfile.js";

/* ══════════════════════════════════════════════════════
   THRESHOLDS  (single source of truth — easy to tune)
══════════════════════════════════════════════════════ */
const T = {
  // Minimum questions from a topic across ALL attempts to call it "sufficient"
  SUFFICIENT_EVIDENCE: 3,
  LIMITED_EVIDENCE_MIN: 1,

  // Accuracy bands (%)
  ACC_STRONG:   70,  // >= 70 → Strong / Low priority
  ACC_MODERATE: 50,  // 50–69 → Needs Attention / Medium
                     // < 50  → Weak / High priority

  // Speed bands — ratio of actual avg time to allowed time-per-question
  SPEED_FAST:   0.40,   // < 40% of allowed → "Fast/Rushing"
  SPEED_SLOW:   1.50,   // > 150% of allowed → "Slow"

  // Pattern thresholds
  SKIP_RATE_HIGH:      0.30,  // skipped > 30% → high skip-rate pattern
  ATTEMPT_RATE_HIGH:   0.70,  // attempted > 70% → high attempt rate
  IMPROVEMENT_DELTA:   10,    // score improvement > 10 pp → detected
  DECLINE_DELTA:       10,    // score decline > 10 pp → detected

  // Profile confidence bands (total quiz attempts)
  CONF_HIGH:   5,
  CONF_MEDIUM: 2,

  // Max attempt history kept in profile
  MAX_HISTORY: 50,
};

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */

/**
 * Safe integer division — returns 0 instead of NaN/Infinity.
 */
const safePct = (num, den) =>
  den === 0 ? 0 : Math.round((num / den) * 100);

/**
 * Compute accuracy as correct / (correct + wrong)
 * i.e. skipped questions don't penalise accuracy.
 */
const computeAccuracy = (correct, wrong) =>
  safePct(correct, correct + wrong);

/**
 * Determine evidence level for a topic based on total attempted questions.
 */
const evidenceLevel = (totalAttempted) => {
  if (totalAttempted >= T.SUFFICIENT_EVIDENCE) return "sufficient";
  if (totalAttempted >= T.LIMITED_EVIDENCE_MIN) return "limited";
  return "insufficient";
};

/**
 * Compute strength score (0–100) for a topic or subject.
 * Weights: accuracy 70%, speed bonus/penalty 30%.
 * Speed component is skipped when timing data is absent.
 */
const computeStrengthScore = (accuracy, avgTimeSecs, allowedTimeSecs) => {
  const accComponent = accuracy * 0.7;

  if (!avgTimeSecs || !allowedTimeSecs) {
    // No timing data — use accuracy only, normalised to 100
    return Math.round(accComponent / 0.7);
  }

  const ratio = avgTimeSecs / allowedTimeSecs;
  // Ideal ratio ≈ 0.7 → full 30 points. Capped at 30.
  let speedScore;
  if (ratio <= T.SPEED_FAST)        speedScore = 15;   // suspiciously fast
  else if (ratio <= 0.7)            speedScore = 30;   // ideal speed
  else if (ratio <= 1.0)            speedScore = 22;   // slightly slow
  else if (ratio <= T.SPEED_SLOW)   speedScore = 10;   // slow
  else                              speedScore = 0;    // very slow

  return Math.round(accComponent + speedScore);
};

/**
 * Determine priority label from accuracy + evidence.
 */
const computePriority = (accuracy, evLevel, consecutiveWeak = 0) => {
  if (evLevel === "insufficient") return "unknown";
  if (evLevel === "limited") {
    // Limited data: only flag high if truly bad
    return accuracy < T.ACC_MODERATE ? "medium" : "unknown";
  }
  // Sufficient evidence
  if (accuracy < T.ACC_MODERATE || consecutiveWeak >= 2) return "high";
  if (accuracy < T.ACC_STRONG)                            return "medium";
  return "low";
};

/**
 * Determine estimated level from overall accuracy + attempt count.
 */
const computeEstimatedLevel = (overallAccuracy, totalAttempts) => {
  if (totalAttempts < 2)          return "Beginner";
  if (overallAccuracy >= 75)      return "Advanced";
  if (overallAccuracy >= 60)      return "Intermediate";
  if (overallAccuracy >= 40)      return "Developing";
  return "Beginner";
};

/**
 * Determine overall profile confidence from attempt count.
 */
const computeConfidence = (totalAttempts) => {
  if (totalAttempts >= T.CONF_HIGH)   return "high";
  if (totalAttempts >= T.CONF_MEDIUM) return "medium";
  return "low";
};

/* ══════════════════════════════════════════════════════
   PATTERN DETECTION
   All patterns are derived from observable data only.
   Returns array of human-readable strings.
══════════════════════════════════════════════════════ */
const detectPatterns = (quizData, profile) => {
  const patterns = [];
  const {
    totalQuestions, correct, wrong, skipped,
    scorePercent, timeTakenTotal, timePerQuestion, subject, difficulty,
  } = quizData;

  const attempted = correct + wrong;
  const accuracy  = computeAccuracy(correct, wrong);

  // ── 1. High attempt + low accuracy ──
  if (attempted / totalQuestions > T.ATTEMPT_RATE_HIGH && accuracy < T.ACC_MODERATE) {
    patterns.push(
      `High attempt rate in ${subject} (${attempted}/${totalQuestions} questions) but low accuracy (${accuracy}%) — suggests guessing rather than confident recall.`
    );
  }

  // ── 2. High skip rate ──
  if (skipped / totalQuestions > T.SKIP_RATE_HIGH) {
    patterns.push(
      `High skip rate in ${subject} — ${skipped} out of ${totalQuestions} questions unattempted. Consider building familiarity with core topics first.`
    );
  }

  // ── 3. Speed patterns (only when timing data exists) ──
  if (timeTakenTotal > 0 && attempted > 0) {
    const avgTime = Math.round(timeTakenTotal / attempted);
    if (timePerQuestion > 0) {
      const ratio = avgTime / timePerQuestion;
      if (ratio < T.SPEED_FAST && accuracy < T.ACC_STRONG) {
        patterns.push(
          `Rushing in ${subject} — avg ${avgTime}s per question against ${timePerQuestion}s allowed. Speed is not translating to accuracy.`
        );
      } else if (ratio > T.SPEED_SLOW && accuracy > T.ACC_STRONG) {
        patterns.push(
          `Slow but accurate in ${subject} — avg ${avgTime}s per question. Accuracy is strong; focus on building speed for exam conditions.`
        );
      } else if (ratio > T.SPEED_SLOW) {
        patterns.push(
          `Spending too long on questions in ${subject} — avg ${avgTime}s vs ${timePerQuestion}s allowed. Practise timed conditions.`
        );
      }
    }
  }

  // ── 4. Trend — improvement or decline vs previous attempts ──
  if (profile && profile.attemptHistory && profile.attemptHistory.length >= 1) {
    const sameSubjectHistory = profile.attemptHistory.filter(
      (h) => h.subject === subject
    );
    if (sameSubjectHistory.length >= 1) {
      const prevAvg = Math.round(
        sameSubjectHistory.reduce((s, h) => s + h.scorePercent, 0) /
          sameSubjectHistory.length
      );
      const delta = scorePercent - prevAvg;
      if (delta >= T.IMPROVEMENT_DELTA) {
        patterns.push(
          `Improvement detected in ${subject} — scored ${scorePercent}% vs previous average of ${prevAvg}%. Keep up the momentum.`
        );
      } else if (delta <= -T.DECLINE_DELTA) {
        patterns.push(
          `Decline detected in ${subject} — scored ${scorePercent}% vs previous average of ${prevAvg}%. Review recent mistakes before the next attempt.`
        );
      }
    }
  }

  // ── 5. Strong on easy but no hard attempts (easy comfort zone) ──
  if (difficulty === "Easy" && accuracy >= T.ACC_STRONG) {
    const hasHardHistory = profile?.subjectProfiles?.find(
      (s) => s.subject === subject
    )?.difficultyAccuracy?.Hard;
    if (hasHardHistory === null || hasHardHistory === undefined) {
      patterns.push(
        `Strong in ${subject} at Easy difficulty. Challenge yourself with Medium or Hard to build exam-readiness.`
      );
    }
  }

  return patterns;
};

/* ══════════════════════════════════════════════════════
   TOPIC ANALYSIS from quiz.questions[]
   Returns a map: { topicName → { correct, wrong, skipped, totalTime } }
══════════════════════════════════════════════════════ */
const buildTopicMap = (questions) => {
  const map = {};
  questions.forEach((q) => {
    const topic = (q.topic || "General").trim();
    if (!map[topic]) {
      map[topic] = { correct: 0, wrong: 0, skipped: 0, totalTime: 0, count: 0 };
    }
    const skipped = q.userAnswer === null;
    if (skipped) {
      map[topic].skipped += 1;
    } else if (q.isCorrect) {
      map[topic].correct += 1;
    } else {
      map[topic].wrong += 1;
    }
    if (q.timeTaken > 0) {
      map[topic].totalTime += q.timeTaken;
      map[topic].count += 1;
    }
  });
  return map;
};

/* ══════════════════════════════════════════════════════
   BUILD PRIORITY AREAS
   Selects top-5 areas across all subjects sorted by priority.
══════════════════════════════════════════════════════ */
const buildPriorityAreas = (subjectProfiles) => {
  const areas = [];

  subjectProfiles.forEach((sp) => {
    // Subject-level high priority (no sufficient topic data)
    if (sp.priority === "high" && sp.topicProfiles.length === 0) {
      areas.push({
        subject: sp.subject,
        topic: null,
        reason: `Low accuracy (${sp.accuracy}%) across ${sp.totalAttempted} questions in ${sp.subject}.`,
        priority: "high",
      });
    }

    // Topic-level priorities
    sp.topicProfiles.forEach((tp) => {
      if (tp.priority === "high" || tp.priority === "medium") {
        const reason =
          tp.consecutiveWeakAttempts >= 2
            ? `Consistently weak in "${tp.topic}" — poor accuracy across multiple attempts.`
            : `${tp.accuracy}% accuracy in "${tp.topic}" (${tp.totalAttempted} questions attempted).`;
        areas.push({
          subject: sp.subject,
          topic: tp.topic,
          reason,
          priority: tp.priority,
        });
      }
    });
  });

  // Sort: high → medium → low
  const rankPriority = { high: 0, medium: 1, low: 2, unknown: 3 };
  areas.sort((a, b) => rankPriority[a.priority] - rankPriority[b.priority]);

  return areas.slice(0, 5);
};

/**
 * Build recommended next action string from priority areas and patterns.
 */
const buildRecommendation = (priorityAreas, patterns, subjectProfiles) => {
  // Highest priority topic
  const top = priorityAreas[0];
  if (top) {
    const target = top.topic ? `"${top.topic}" in ${top.subject}` : top.subject;
    return `Focus on ${target} before your next mock test. ${top.reason}`;
  }

  // All subjects look good
  const allStrong = subjectProfiles.every((sp) => sp.priority === "low");
  if (allStrong) {
    return "Strong overall performance. Try increasing the difficulty or attempting a full-length mock test.";
  }

  return "Keep practising regularly. More data will help Gyantra personalise your study plan further.";
};

/* ══════════════════════════════════════════════════════
   PROFILE UPDATE  —  incremental merge
   Finds or creates the subject/topic profile and updates
   counters in-place using the new quiz data.
══════════════════════════════════════════════════════ */
const updateSubjectProfile = (profile, quizData, topicMap) => {
  const { subject, difficulty, correct, wrong, skipped,
          totalQuestions, timeTakenTotal, timePerQuestion } = quizData;

  // Find or initialise subject profile
  let sp = profile.subjectProfiles.find((s) => s.subject === subject);
  if (!sp) {
    profile.subjectProfiles.push({
      subject,
      totalAttempted: 0, totalCorrect: 0, totalWrong: 0, totalSkipped: 0,
      accuracy: 0, avgTimeSecs: null, strengthScore: 0,
      priority: "unknown", quizAttempts: 0, lastAttemptAt: null,
      difficultyAccuracy: { Easy: null, Medium: null, Hard: null },
      topicProfiles: [],
    });
    sp = profile.subjectProfiles[profile.subjectProfiles.length - 1];
  }

  // Update raw counters
  sp.totalAttempted += correct + wrong;
  sp.totalCorrect   += correct;
  sp.totalWrong     += wrong;
  sp.totalSkipped   += skipped;
  sp.quizAttempts   += 1;
  sp.lastAttemptAt   = new Date();

  // Recompute accuracy
  sp.accuracy = computeAccuracy(sp.totalCorrect, sp.totalWrong);

  // Update difficulty-specific accuracy for this attempt
  if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) {
    const attemptAcc = computeAccuracy(correct, wrong);
    const prev = sp.difficultyAccuracy[difficulty];
    // Rolling average of difficulty accuracy across quizzes
    sp.difficultyAccuracy[difficulty] =
      prev === null
        ? attemptAcc
        : Math.round((prev * (sp.quizAttempts - 1) + attemptAcc) / sp.quizAttempts);
  }

  // Update avg time
  const attempted = correct + wrong;
  if (timeTakenTotal > 0 && attempted > 0) {
    const thisAvg = Math.round(timeTakenTotal / attempted);
    sp.avgTimeSecs =
      sp.avgTimeSecs === null
        ? thisAvg
        : Math.round((sp.avgTimeSecs * (sp.quizAttempts - 1) + thisAvg) / sp.quizAttempts);
  }

  // Recompute strength + priority
  sp.strengthScore = computeStrengthScore(sp.accuracy, sp.avgTimeSecs, timePerQuestion);
  sp.priority = computePriority(sp.accuracy, evidenceLevel(sp.totalAttempted));

  // ── Update topic profiles ──
  Object.entries(topicMap).forEach(([topic, data]) => {
    let tp = sp.topicProfiles.find((t) => t.topic === topic);
    if (!tp) {
      sp.topicProfiles.push({
        topic, totalAttempted: 0, totalCorrect: 0, totalWrong: 0,
        totalSkipped: 0, accuracy: 0, avgTimeSecs: null,
        evidenceLevel: "insufficient", strengthScore: 0,
        priority: "unknown", quizzesSeen: 0, consecutiveWeakAttempts: 0,
        lastSeen: null,
      });
      tp = sp.topicProfiles[sp.topicProfiles.length - 1];
    }

    const topicAttempted = data.correct + data.wrong;
    tp.totalAttempted += topicAttempted;
    tp.totalCorrect   += data.correct;
    tp.totalWrong     += data.wrong;
    tp.totalSkipped   += data.skipped;
    tp.quizzesSeen    += 1;
    tp.lastSeen        = new Date();

    // Recompute accuracy
    tp.accuracy = computeAccuracy(tp.totalCorrect, tp.totalWrong);

    // Update avg time
    if (data.count > 0) {
      const thisTopicAvg = Math.round(data.totalTime / data.count);
      tp.avgTimeSecs =
        tp.avgTimeSecs === null
          ? thisTopicAvg
          : Math.round((tp.avgTimeSecs * (tp.quizzesSeen - 1) + thisTopicAvg) / tp.quizzesSeen);
    }

    // Update evidence level
    tp.evidenceLevel = evidenceLevel(tp.totalAttempted);

    // Track consecutive weak attempts
    const topicAccThisAttempt = computeAccuracy(data.correct, data.wrong);
    if (tp.evidenceLevel === "sufficient" && topicAccThisAttempt < T.ACC_MODERATE) {
      tp.consecutiveWeakAttempts = (tp.consecutiveWeakAttempts || 0) + 1;
    } else {
      tp.consecutiveWeakAttempts = 0;
    }

    // Recompute strength + priority
    tp.strengthScore = computeStrengthScore(tp.accuracy, tp.avgTimeSecs, timePerQuestion);
    tp.priority = computePriority(tp.accuracy, tp.evidenceLevel, tp.consecutiveWeakAttempts);
  });
};

/* ══════════════════════════════════════════════════════
   UPDATE OVERALL PROFILE STATS
══════════════════════════════════════════════════════ */
const updateOverallStats = (profile) => {
  const sps = profile.subjectProfiles;

  if (sps.length === 0) {
    profile.overallAccuracy = 0;
    profile.estimatedLevel  = "Beginner";
  } else {
    // Weighted accuracy by totalAttempted
    const totalQ  = sps.reduce((s, sp) => s + sp.totalAttempted, 0);
    const totalC  = sps.reduce((s, sp) => s + sp.totalCorrect, 0);
    const totalW  = sps.reduce((s, sp) => s + sp.totalWrong, 0);
    profile.overallAccuracy = computeAccuracy(totalC, totalW);
    profile.estimatedLevel  = computeEstimatedLevel(profile.overallAccuracy, profile.totalAttempts);
    void totalQ; // suppress unused warning
  }

  profile.confidenceLevel = computeConfidence(profile.totalAttempts);

  // Build convenience subject lists
  const strong   = sps.filter((sp) => sp.priority === "low").map((sp) => sp.subject);
  const weak     = sps.filter((sp) => sp.priority === "high").map((sp) => sp.subject);
  const priority = sps.filter((sp) => sp.priority !== "low" && sp.priority !== "unknown")
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((sp) => sp.subject);

  profile.strongSubjects   = strong;
  profile.weakSubjects     = weak;
  profile.prioritySubjects = priority;
};

/* ══════════════════════════════════════════════════════
   MAIN PUBLIC FUNCTION
   Called from quizController after a quiz is submitted.

   quizData shape expected:
   {
     quizId, userId, subject, difficulty, totalQuestions,
     correct, wrong, skipped, scorePercent, timeTakenTotal,
     timePerQuestion,    // from quiz config
     questions,          // array of questionResult objects
   }
══════════════════════════════════════════════════════ */
export const analyzeAndUpdateProfile = async (userId, quizData) => {
  try {
    const {
      quizId, subject, difficulty, totalQuestions,
      correct, wrong, skipped, scorePercent,
      timeTakenTotal, timePerQuestion, questions = [],
    } = quizData;

    // ── Guard: skip if already analyzed (idempotent) ──
    const existingCheck = await LearnerProfile.findOne({ userId }, "attemptHistory");
    if (existingCheck) {
      const already = existingCheck.attemptHistory.some(
        (h) => h.quizId?.toString() === quizId?.toString()
      );
      if (already) {
        console.log(`[LearnerAnalysis] Quiz ${quizId} already analysed — skipping.`);
        return null;
      }
    }

    // ── 1. Build topic map from question-level data ──
    const topicMap = buildTopicMap(questions);

    // ── 2. Load or create learner profile ──
    let profile = await LearnerProfile.findOne({ userId });
    if (!profile) {
      profile = new LearnerProfile({ userId });
    }

    // ── 3. Update subject + topic profiles ──
    updateSubjectProfile(profile, {
      subject, difficulty, correct, wrong, skipped,
      totalQuestions, timeTakenTotal, timePerQuestion,
    }, topicMap);

    // ── 4. Detect patterns ──
    const patterns = detectPatterns({
      totalQuestions, correct, wrong, skipped,
      scorePercent, timeTakenTotal, timePerQuestion, subject, difficulty,
    }, profile);

    // ── 5. Append to attempt history (keep last N) ──
    const accuracy = computeAccuracy(correct, wrong);
    profile.attemptHistory.push({
      quizId, subject, difficulty, totalQuestions,
      correct, wrong, skipped, scorePercent, accuracy,
      timeTakenTotal, detectedPatterns: patterns,
      analyzedAt: new Date(),
    });
    if (profile.attemptHistory.length > T.MAX_HISTORY) {
      profile.attemptHistory = profile.attemptHistory.slice(-T.MAX_HISTORY);
    }

    // ── 6. Update overall stats ──
    profile.totalAttempts += 1;
    updateOverallStats(profile);

    // ── 7. Build priority areas + recommendation ──
    profile.detectedPatterns = patterns;
    profile.priorityAreas    = buildPriorityAreas(profile.subjectProfiles);
    profile.recommendedAction = buildRecommendation(
      profile.priorityAreas, patterns, profile.subjectProfiles
    );
    profile.lastUpdatedAt = new Date();

    // ── 8. Save ──
    await profile.save();
    console.log(`[LearnerAnalysis] Profile updated for user ${userId} (attempt #${profile.totalAttempts})`);

    // ── 9. Return structured insight payload for the quiz submit response ──
    return buildInsightPayload(profile, patterns, accuracy, scorePercent);
  } catch (err) {
    // Analysis failure MUST NOT break quiz submission
    console.error("[LearnerAnalysis] Error:", err.message);
    return null;
  }
};

/**
 * Build the lightweight insight payload returned alongside the quiz result.
 * This is what Results.jsx displays immediately after quiz submission.
 */
const buildInsightPayload = (profile, patterns, accuracy, scorePercent) => {
  const isFirstAttempt = profile.totalAttempts === 1;

  // Top 3 strong topics across all subjects
  const strongTopics = [];
  const weakTopics   = [];

  profile.subjectProfiles.forEach((sp) => {
    sp.topicProfiles.forEach((tp) => {
      if (tp.evidenceLevel === "sufficient") {
        if (tp.priority === "low")  strongTopics.push({ subject: sp.subject, topic: tp.topic, accuracy: tp.accuracy });
        if (tp.priority === "high") weakTopics.push({ subject: sp.subject, topic: tp.topic, accuracy: tp.accuracy, reason: `${tp.accuracy}% accuracy` });
      }
    });
  });

  strongTopics.sort((a, b) => b.accuracy - a.accuracy);
  weakTopics.sort((a, b) => a.accuracy - b.accuracy);

  return {
    isFirstAttempt,
    profileConfidence:    profile.confidenceLevel,
    estimatedLevel:       profile.estimatedLevel,
    overallAccuracy:      profile.overallAccuracy,
    thisAttemptAccuracy:  accuracy,
    strongSubjects:       profile.strongSubjects,
    weakSubjects:         profile.weakSubjects,
    prioritySubjects:     profile.prioritySubjects,
    strongTopics:         strongTopics.slice(0, 3),
    weakTopics:           weakTopics.slice(0, 3),
    detectedPatterns:     patterns,
    priorityAreas:        profile.priorityAreas.slice(0, 3),
    recommendedAction:    profile.recommendedAction,
    totalAttempts:        profile.totalAttempts,
  };
};

/**
 * Retrieve full learner profile (for GET /api/learner/profile).
 */
export const getLearnerProfile = async (userId) => {
  return LearnerProfile.findOne({ userId }).lean();
};

/**
 * Retrieve analysis for a specific quiz attempt (for GET /api/learner/analysis/:quizId).
 */
export const getQuizAnalysis = async (userId, quizId) => {
  const profile = await LearnerProfile.findOne({ userId }, "attemptHistory").lean();
  if (!profile) return null;
  return profile.attemptHistory.find(
    (h) => h.quizId?.toString() === quizId
  ) || null;
};
