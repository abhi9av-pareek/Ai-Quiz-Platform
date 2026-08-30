/**
 * Mock Performance Data for Gyantra Performance Route (/performance)
 * Structured cleanly and decoupled from presentation for easy backend integration.
 */

export const INITIAL_PERFORMANCE_DATA = {
  overall: {
    scorePercent: 78,
    scoreDelta: "+8.4%",
    isImprovement: true,
    accuracy: 79,
    accuracyDelta: "+4.2%",
    totalAttempted: 342,
    totalCorrect: 271,
    totalIncorrect: 71,
    avgTimePerQuestionSec: 42,
    timeDelta: "-6s faster",
    quizzesCompleted: 18,
    scansCompleted: 14,
    streakDays: 6,
    xpTotal: 4850,
    rank: 14,
    level: "Knowledge Seeker"
  },

  trendTimeline: {
    "7d": [
      { id: "t1", label: "Mon", date: "Aug 24", type: "quiz", title: "Mechanics & Kinematics Drill", score: 72, accuracy: 75, correct: 15, total: 20, timeTaken: "8m 10s" },
      { id: "t2", label: "Tue", date: "Aug 25", type: "scan", title: "JEE PYQ Physics Set 1", score: 68, accuracy: 70, correct: 7, total: 10, timeTaken: "6m 30s" },
      { id: "t3", label: "Wed", date: "Aug 26", type: "quiz", title: "Organic Reactions Quiz", score: 85, accuracy: 88, correct: 18, total: 20, timeTaken: "9m 05s" },
      { id: "t4", label: "Thu", date: "Aug 27", type: "scan", title: "Calculus Problem Sheet", score: 64, accuracy: 65, correct: 9, total: 14, timeTaken: "11m 20s" },
      { id: "t5", label: "Fri", date: "Aug 28", type: "quiz", title: "Probability & Stats Test", score: 78, accuracy: 80, correct: 16, total: 20, timeTaken: "7m 45s" },
      { id: "t6", label: "Sat", date: "Aug 29", type: "scan", title: "Electrostatics Notes Scan", score: 82, accuracy: 85, correct: 12, total: 14, timeTaken: "8m 15s" },
      { id: "t7", label: "Sun", date: "Today", type: "quiz", title: "Full Subject Mock Assessment", score: 88, accuracy: 90, correct: 27, total: 30, timeTaken: "14m 00s" }
    ],
    "30d": [
      { id: "m1", label: "Aug 2", date: "Aug 02", type: "quiz", title: "Algebra Foundation", score: 62, accuracy: 65, correct: 13, total: 20, timeTaken: "10m" },
      { id: "m2", label: "Aug 5", date: "Aug 05", type: "scan", title: "Physics NCERT PYQ", score: 65, accuracy: 68, correct: 8, total: 12, timeTaken: "7m" },
      { id: "m3", label: "Aug 9", date: "Aug 09", type: "quiz", title: "Thermodynamics Quiz", score: 70, accuracy: 72, correct: 14, total: 20, timeTaken: "9m" },
      { id: "m4", label: "Aug 12", date: "Aug 12", type: "scan", title: "Inorganic Chemistry Sheet", score: 60, accuracy: 62, correct: 6, total: 10, timeTaken: "6m" },
      { id: "m5", label: "Aug 16", date: "Aug 16", type: "quiz", title: "Kinematics Practice", score: 75, accuracy: 78, correct: 15, total: 20, timeTaken: "8m" },
      { id: "m6", label: "Aug 19", date: "Aug 19", type: "scan", title: "Calculus Board Paper", score: 71, accuracy: 73, correct: 10, total: 14, timeTaken: "10m" },
      { id: "m7", label: "Aug 23", date: "Aug 23", type: "quiz", title: "Organic Chemistry Mini", score: 82, accuracy: 84, correct: 17, total: 20, timeTaken: "9m" },
      { id: "m8", label: "Aug 27", date: "Aug 27", type: "scan", title: "Optics & Waves Scan", score: 79, accuracy: 81, correct: 11, total: 14, timeTaken: "8m" },
      { id: "m9", label: "Aug 30", date: "Aug 30", type: "quiz", title: "Full Mock Assessment", score: 88, accuracy: 90, correct: 27, total: 30, timeTaken: "14m" }
    ],
    "all": [
      { id: "a1", label: "Week 1", date: "Jul 15", type: "quiz", title: "Diagnostic Test", score: 54, accuracy: 56, correct: 11, total: 20, timeTaken: "12m" },
      { id: "a2", label: "Week 2", date: "Jul 22", type: "scan", title: "Formula Sheet Scan", score: 58, accuracy: 60, correct: 6, total: 10, timeTaken: "8m" },
      { id: "a3", label: "Week 3", date: "Jul 29", type: "quiz", title: "Physics Practice 1", score: 66, accuracy: 68, correct: 13, total: 20, timeTaken: "9m" },
      { id: "a4", label: "Week 4", date: "Aug 06", type: "scan", title: "Chemistry Mock OCR", score: 72, accuracy: 74, correct: 9, total: 12, timeTaken: "7m" },
      { id: "a5", label: "Week 5", date: "Aug 14", type: "quiz", title: "Maths Speed Run", score: 70, accuracy: 73, correct: 14, total: 20, timeTaken: "8m" },
      { id: "a6", label: "Week 6", date: "Aug 22", type: "scan", title: "PYQ JEE Main Set", score: 81, accuracy: 83, correct: 12, total: 15, timeTaken: "9m" },
      { id: "a7", label: "Week 7", date: "Aug 30", type: "quiz", title: "Latest Comprehensive Test", score: 88, accuracy: 90, correct: 27, total: 30, timeTaken: "14m" }
    ]
  },

  quizPerformance: {
    totalQuizzes: 18,
    avgScore: 76,
    bestScore: 91,
    avgAccuracy: 79,
    avgCompletionTime: "8m 15s",
    totalQuestions: 210,
    correctCount: 168,
    improvementTrend: "+11.2% over last 10 quizzes",
    difficultyBreakdown: [
      { level: "Easy", count: 6, accuracy: 92, color: "#00E5C0" },
      { level: "Medium", count: 9, accuracy: 78, color: "#FFB347" },
      { level: "Hard", count: 3, accuracy: 61, color: "#FF6B6B" }
    ]
  },

  scanPerformance: {
    totalScans: 14,
    questionsAnalyzed: 132,
    totalCorrect: 103,
    totalIncorrect: 29,
    scanAccuracy: 78,
    avgScanDurationSec: "4.8s",
    ocrConfidenceAvg: "96.4%",
    topScannedSubject: "Physics",
    recentScansThisWeek: 5,
    scanTypeBreakdown: [
      { type: "Exam Question Papers", count: 7, percentage: 50 },
      { type: "Coaching PYQ Sheets", count: 4, percentage: 29 },
      { type: "Handwritten / Notes", count: 3, percentage: 21 }
    ]
  },

  subjectPerformance: [
    {
      id: "physics",
      subject: "Physics",
      score: 82,
      accuracy: 84,
      totalQuestions: 118,
      correctQuestions: 99,
      iconName: "Atom",
      color: "teal",
      fill: "#00E5C0",
      trend: "+5.1%",
      isPositive: true,
      topics: [
        { id: "p-mech", name: "Mechanics & Laws of Motion", score: 88, totalQuestions: 40, correct: 35, avgTime: "38s", status: "strength", statusLabel: "Strong Concept" },
        { id: "p-thermo", name: "Thermodynamics & Kinetic Theory", score: 82, totalQuestions: 28, correct: 23, avgTime: "42s", status: "strength", statusLabel: "Proficient" },
        { id: "p-optics", name: "Ray & Wave Optics", score: 79, totalQuestions: 25, correct: 20, avgTime: "45s", status: "needs_attention", statusLabel: "Needs Polish" },
        { id: "p-electro", name: "Electrostatics & Current Electricity", score: 64, totalQuestions: 25, correct: 16, avgTime: "52s", status: "needs_attention", statusLabel: "Review Required" }
      ]
    },
    {
      id: "chemistry",
      subject: "Chemistry",
      score: 74,
      accuracy: 76,
      totalQuestions: 96,
      correctQuestions: 73,
      iconName: "FlaskConical",
      color: "coral",
      fill: "#FF6B6B",
      trend: "+7.3%",
      isPositive: true,
      topics: [
        { id: "c-organic", name: "Organic Reaction Mechanisms", score: 86, totalQuestions: 35, correct: 30, avgTime: "35s", status: "strength", statusLabel: "Strong Concept" },
        { id: "c-physical", name: "Physical Chemistry & Equilibrium", score: 72, totalQuestions: 31, correct: 22, avgTime: "48s", status: "needs_attention", statusLabel: "Needs Polish" },
        { id: "c-inorganic", name: "Inorganic Periodic Trends & Coordination", score: 62, totalQuestions: 30, correct: 18, avgTime: "39s", status: "critical", statusLabel: "Critical Focus" }
      ]
    },
    {
      id: "mathematics",
      subject: "Mathematics",
      score: 58,
      accuracy: 62,
      totalQuestions: 128,
      correctQuestions: 79,
      iconName: "Sigma",
      color: "purple",
      fill: "#7C5CFC",
      trend: "-2.4%",
      isPositive: false,
      topics: [
        { id: "m-algebra", name: "Algebra & Polynomials", score: 72, totalQuestions: 38, correct: 27, avgTime: "46s", status: "strength", statusLabel: "Proficient" },
        { id: "m-prob", name: "Probability & Statistics", score: 76, totalQuestions: 25, correct: 19, avgTime: "41s", status: "strength", statusLabel: "Proficient" },
        { id: "m-calc", name: "Calculus & Integrals", score: 61, totalQuestions: 35, correct: 21, avgTime: "56s", status: "needs_attention", statusLabel: "Review Required" },
        { id: "m-coord", name: "Coordinate Geometry & Conics", score: 48, totalQuestions: 30, correct: 14, avgTime: "62s", status: "critical", statusLabel: "Critical Focus" }
      ]
    }
  ],

  strengthsAndWeaknesses: {
    strengths: [
      { id: "s1", topic: "Mechanics & Laws of Motion", subject: "Physics", score: 88, reason: "Exceptional concept retention with 87.5% accuracy under 40s avg pace." },
      { id: "s2", topic: "Organic Reaction Mechanisms", subject: "Chemistry", score: 86, reason: "High speed and rapid recall on multi-step electrophilic additions." },
      { id: "s3", topic: "Probability & Statistics", subject: "Mathematics", score: 76, reason: "Solid grasp of Bayes theorem and conditional distribution problems." }
    ],
    needsAttention: [
      { id: "w1", topic: "Calculus & Integrals", subject: "Mathematics", score: 61, reason: "Occasional integration substitution errors during timed assessments." },
      { id: "w2", topic: "Electrostatics & Current Electricity", subject: "Physics", score: 64, reason: "Superposition principle and Gauss law calculation pitfalls." },
      { id: "w3", topic: "Physical Chemistry & Equilibrium", subject: "Chemistry", score: 72, reason: "Ionic equilibrium pH calculations require formula consolidation." }
    ],
    criticalAreas: [
      { id: "c1", topic: "Coordinate Geometry & Conics", subject: "Mathematics", score: 48, reason: "High failure rate on parabola/ellipse tangent & normal equations." },
      { id: "c2", topic: "Inorganic Coordination Compounds", subject: "Chemistry", score: 62, reason: "Isomerism and crystal field splitting theory confusion." }
    ]
  },

  mistakeAnalysis: {
    totalMistakes: 71,
    categories: [
      { id: "conceptual", label: "Conceptual Errors", count: 26, percent: 37, color: "#FF6B6B", description: "Misapplied formula, theorem or underlying physics principle" },
      { id: "calculation", label: "Calculation Slips", count: 18, percent: 25, color: "#FFB347", description: "Sign error, fraction arithmetic, or numerical miscalculation" },
      { id: "careless", label: "Careless / Reading Slip", count: 14, percent: 20, color: "#3895FF", description: "Misread question requirements (e.g. 'NOT correct', wrong units)" },
      { id: "timePressure", label: "Time-Pressure Rush", count: 13, percent: 18, color: "#7C5CFC", description: "Guessed or rushed during the final 20% of quiz timer" }
    ],
    repeatedMistakes: [
      { topic: "Coordinate Geometry & Conics", subject: "Mathematics", count: 5, category: "Conceptual", severity: "critical", lastOccurred: "Yesterday" },
      { topic: "Electrostatics & Gauss Law", subject: "Physics", count: 4, category: "Conceptual", severity: "high", lastOccurred: "2 days ago" },
      { topic: "Calculus Definite Integrals", subject: "Mathematics", count: 4, category: "Calculation", severity: "high", lastOccurred: "3 days ago" },
      { topic: "Coordination Isomerism", subject: "Chemistry", count: 3, category: "Conceptual", severity: "medium", lastOccurred: "4 days ago" },
      { topic: "Ray Optics Sign Convention", subject: "Physics", count: 3, category: "Careless", severity: "medium", lastOccurred: "5 days ago" }
    ]
  },

  recentActivity: [
    { id: "act-1", type: "quiz", subject: "Physics", title: "Physics Full Mock Test", score: 88, correct: 27, total: 30, timeTaken: "14m", date: "Today, 4:15 PM", timeAgo: "Today", difficulty: "Medium", badge: "Quiz" },
    { id: "act-2", type: "scan", subject: "Physics", title: "JEE PYQ Optics & Waves", score: 82, correct: 12, total: 14, timeTaken: "8m 15s", date: "Yesterday, 8:30 PM", timeAgo: "Yesterday", difficulty: "Hard", badge: "GyanS Scan" },
    { id: "act-3", type: "quiz", subject: "Chemistry", title: "Organic Reactions Chapter Drill", score: 91, correct: 19, total: 20, timeTaken: "9m 05s", date: "Aug 28, 2026", timeAgo: "2 days ago", difficulty: "Medium", badge: "Quiz" },
    { id: "act-4", type: "scan", subject: "Mathematics", title: "Calculus Definite Integrals PYQ", score: 64, correct: 9, total: 14, timeTaken: "11m 20s", date: "Aug 27, 2026", timeAgo: "3 days ago", difficulty: "Hard", badge: "GyanS Scan" },
    { id: "act-5", type: "quiz", subject: "Mathematics", title: "Algebra & Polynomials Drill", score: 75, correct: 15, total: 20, timeTaken: "7m 45s", date: "Aug 26, 2026", timeAgo: "4 days ago", difficulty: "Easy", badge: "Quiz" },
    { id: "act-6", type: "scan", subject: "Physics", title: "Electrostatics Coaching Sheet", score: 70, correct: 7, total: 10, timeTaken: "6m 30s", date: "Aug 25, 2026", timeAgo: "5 days ago", difficulty: "Medium", badge: "GyanS Scan" }
  ]
};

/**
 * Filter timeline points based on time range ("7d", "30d", "all") and activity type ("all", "quiz", "scan")
 */
export function getFilteredTimeline(timeRange = "7d", activityType = "all") {
  const points = INITIAL_PERFORMANCE_DATA.trendTimeline[timeRange] || INITIAL_PERFORMANCE_DATA.trendTimeline["7d"];
  if (activityType === "all") return points;
  return points.filter((p) => p.type === activityType);
}
