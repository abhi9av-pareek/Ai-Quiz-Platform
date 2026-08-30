import axios from "axios";
import User from "../Models/user.js";
import Quiz from "../Models/quiz.js";
import ScanRecord from "../Models/scan.js";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b",
  "meta/llama-3.2-11b-vision-instruct",
  "nvidia/nemotron-3.5-lightning-30b-a3b",
];

/**
 * Build the RAG context system prompt from the user's performance data.
 * This creates the intelligence behind GyanBot's personalized mentoring.
 */
async function buildRagContext(userId) {
  try {
    // Parallel retrieval — fast and efficient
    const [user, recentQuizzes, recentScans] = await Promise.all([
      User.findById(userId).lean(),
      Quiz.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      ScanRecord.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    if (!user) return null;

    // ── User Level ──
    let level = "Newcomer";
    if (user.xp >= 10000) level = "Legend";
    else if (user.xp >= 5000) level = "Expert";
    else if (user.xp >= 2000) level = "Intermediate";
    else if (user.xp >= 500) level = "Beginner";

    const accuracy = user.totalQuestionsAttempted > 0
      ? Math.round((user.totalCorrect / user.totalQuestionsAttempted) * 100)
      : 0;

    // ── Weak Topics ──
    const weakTopics = user.weakTopics?.map(w =>
      `${w.subject} → ${w.topic} (avg score: ${w.avgScore}%, attempts: ${w.attempts})`
    ).join("\n  ") || "None identified yet";

    // ── Recent Quiz Performance ──
    let quizSummary = "No quiz attempts found.";
    if (recentQuizzes.length > 0) {
      quizSummary = recentQuizzes.map((q, i) => {
        const date = new Date(q.completedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        const weakDetected = q.weakTopicsDetected?.length > 0
          ? `Weak: ${q.weakTopicsDetected.join(", ")}`
          : "No weak areas detected";
        return `  ${i + 1}. [${date}] ${q.subject} | Difficulty: ${q.difficulty} | Score: ${q.scorePercent?.toFixed(1)}% (${q.totalCorrect}/${q.totalQuestions}) | ${weakDetected}`;
      }).join("\n");
    }

    // ── Recent Scan Performance ──
    let scanSummary = "No scan sessions found.";
    if (recentScans.length > 0) {
      scanSummary = recentScans.map((s, i) => {
        const date = new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        const scoreInfo = s.quizCompleted
          ? `Quiz done — ${s.totalCorrect}/${s.totalQuestionsExtracted} correct (${Math.round((s.totalCorrect / Math.max(s.totalQuestionsExtracted, 1)) * 100)}%)`
          : "Quiz not attempted yet";
        return `  ${i + 1}. [${date}] ${s.detectedSubject || "General"} | ${s.totalQuestionsExtracted} Qs extracted | ${scoreInfo}`;
      }).join("\n");
    }

    // ── Bookmarked questions ──
    const bookmarkCount = user.bookmarks?.length || 0;

    return `
=== STUDENT PROFILE (RAG CONTEXT) ===
Name: ${user.name} (${user.educationLevel || "Student"})
Level: ${level} | XP: ${user.xp} | Streak: ${user.streak} days
Overall Accuracy: ${accuracy}% (${user.totalCorrect}/${user.totalQuestionsAttempted} Qs)
Bookmarks saved: ${bookmarkCount}

=== WEAK AREAS (AI DETECTED) ===
${weakTopics}

=== RECENT QUIZ PERFORMANCE (last 5) ===
${quizSummary}

=== RECENT SCAN SESSIONS (last 5) ===
${scanSummary}
`.trim();
  } catch (err) {
    console.error("[GyanBot RAG] Failed to build context:", err.message);
    return null;
  }
}

/**
 * GyanBot Chat Handler
 * POST /api/gyanbot/chat
 * Body: { message: string, history: Array<{role, content}>, allowRag: boolean }
 */
export const chatWithGyanBot = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message, history = [], allowRag = true } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        reply: "GyanBot's AI engine is not configured on the server. Contact the admin to set up NVIDIA_API_KEY.",
      });
    }

    // ── Build RAG context if user allowed it ──
    let ragContext = "";
    if (allowRag) {
      const context = await buildRagContext(userId);
      if (context) {
        ragContext = `\n\n${context}`;
      }
    }

    // ── System Prompt: GyanBot Personality ──
    const systemPrompt = `You are GyanBot — the AI mentor, friend, tutor, and guide on the Gyantraa learning platform.

YOUR PERSONALITY:
- Direct. Blunt. No buttering. No filler phrases like "Great question!" or "Certainly!" 
- Think Grok — give real talk. If a student's concept is weak, say it. Give them the truth.
- Be smart and efficient. 1-3 sentences max for simple facts. Go deeper only when the topic demands it.
- You are a friend who happens to be smarter than the student. Speak naturally, not robotically.
- Use examples, analogies, and clear explanations when genuinely needed — not as padding.
- If a student asks about their performance, diagnose it honestly and give exact action steps.
- Never moralize or preach. Just help.

YOUR ROLE ON GYANTRAA:
- Gyantraa is an AI-powered learning platform featuring: Quiz mode (MCQ practice) and Document Scanner (AI-extracted MCQ quizzes from images and documents).
- You help users improve their quiz scores, understand difficult concepts, and analyze scan-based quizzes.
- You can see their performance metrics (when they allow it). Use this intel wisely.${allowRag && ragContext ? ragContext : allowRag ? "\n\n(Performance data temporarily unavailable — answer generally.)" : "\n\n(The user has opted out of sharing their performance data. Respect their privacy and give general guidance without referencing personal stats.)"}

IMPORTANT: Answer in plain text or markdown. Be concise. No waffling.`;

    // ── Compile messages array ──
    const messages = [
      { role: "system", content: systemPrompt },
      // Include conversation history (trim to last 20 exchanges to stay within token limits)
      ...history.slice(-20),
      { role: "user", content: message.trim() },
    ];

    // ── Call Nvidia NIM with model fallback ──
    let reply = null;
    for (const model of NVIDIA_MODELS) {
      try {
        const response = await axios.post(
          NVIDIA_API_URL,
          {
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1024,
            stream: false,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            timeout: 20000,
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content && content.trim().length > 0) {
          reply = content.trim();
          break;
        }
      } catch (err) {
        console.warn(`[GyanBot] Model ${model} failed: ${err.message}, trying next...`);
      }
    }

    if (!reply) {
      throw new Error("All AI models failed to respond.");
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("[GyanBot] Chat error:", err.message);

    // Friendly fallback if the API is temporarily down
    const fallbackReplies = [
      "The AI backend is taking a nap right now. Try again in a bit.",
      "Network issue on the AI side. Give it 30 seconds and retry.",
      "Couldn't reach Llama model right now. Your question is valid though — try again shortly.",
    ];
    const fallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

    return res.status(200).json({ reply: fallback, error: true });
  }
};
