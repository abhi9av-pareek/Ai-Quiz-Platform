import axios from "axios";
import http from "http";
import https from "https";
import ScanRecord from "../Models/scan.js";
import Quiz from "../Models/quiz.js";

/*
   GyanS Scanner Controller — v2
   Uses NVIDIA Vision (llama-3.2-11b-vision) for image/scanned-PDF OCR
   and llama-3.1-8b for text-PDF extraction.

   ANTI-HALLUCINATION RULES (v2):
   - NEVER invent answers. Only extract what is VISIBLY printed.
   - If the correct answer cannot be determined from the image/text, use "?" — do NOT guess.
   - Preserve mathematical/scientific notation exactly — no simplification.
   - Mark confidence: "high" if answer is printed, "low" if inferred.
   - subjectHint narrows domain to prevent cross-domain hallucination.
   - Post-extraction validation pass flags garbled OCR and suspicious questions.
*/

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

// Active working models on NVIDIA API
const VISION_MODEL = "meta/llama-3.2-11b-vision-instruct";
const TEXT_MODEL = "nvidia/nemotron-3-nano-30b-a3b";

const VISION_MODELS = [
  "meta/llama-3.2-11b-vision-instruct",
];

const TEXT_MODELS = [
  "nvidia/nemotron-3-nano-30b-a3b",
  "meta/llama-3.2-11b-vision-instruct",
  "nvidia/nemotron-3.5-lightning-30b-a3b",
];

/* ═══════════════════════════════════════════════════════════
   HELPER — Create a compressed thumbnail from base64 image
═══════════════════════════════════════════════════════════ */
const createThumbnail = (base64Image) => {
  if (!base64Image) return "";
  const maxLen = 20000;
  if (base64Image.length <= maxLen) return base64Image;
  return base64Image.substring(0, maxLen);
};

/* ═══════════════════════════════════════════════════════════
   HELPER — Build the vision OCR extraction prompt (v2)
   Anti-hallucination: extract-only mode, confidence, subjectHint,
   math notation preservation.
═══════════════════════════════════════════════════════════ */
const buildExtractionPrompt = (imageCount, subjectHint = "") => {
  const subjectLine = subjectHint
    ? `\nSUBJECT CONTEXT: This document is about "${subjectHint}". Only extract questions related to this subject.`
    : "";

  return `You are a precise OCR system specialized in extracting multiple-choice questions (MCQs) from exam papers. Analyze the provided image${imageCount > 1 ? "s" : ""} carefully.${subjectLine}

TASK: Extract ALL multiple-choice questions (MCQs) that are visibly printed in the image${imageCount > 1 ? "s" : ""}.

══════════════════════════════════════════
CRITICAL ANTI-HALLUCINATION RULES — FOLLOW EXACTLY:
══════════════════════════════════════════
1. EXTRACT ONLY — Do NOT invent, rephrase, or paraphrase ANY part of ANY question. Copy text letter-for-letter.
2. CORRECT ANSWER — ONLY set correctAnswer if an answer key, tick mark, circled option, bold/underlined option, or explicit marking is VISIBLE in the image. If no answer is visibly marked, set correctAnswer to "?" — NEVER guess.
3. CONFIDENCE — Set confidence to "high" if the correct answer was clearly printed/marked. Set to "low" if you are inferring from logic or external knowledge.
4. MATHEMATICAL NOTATION — Preserve ALL math symbols exactly: fractions (a/b), powers (x²), roots (√), integrals (∫), Greek letters (α,β,γ), subscripts/superscripts. Do NOT evaluate or simplify equations. If a symbol is unclear, write it as [unclear symbol].
5. PARTIAL QUESTIONS — If a question is cut off at the edge, include what IS visible and append [Partial] to the questionText.
6. OPTIONS — Extract all 4 options (A, B, C, D) exactly as printed. If an option is not visible, write "[Not visible]".
7. TOPIC — Identify the specific subject area (e.g., "Calculus", "Organic Chemistry", "Electrostatics", "World War II").
8. DIFFICULTY — Classify as Easy, Medium, or Hard based on the question complexity.
9. EXPLANATION — Write a factual 1-2 sentence explanation ONLY if correctAnswer is known (not "?"). If correctAnswer is "?", set explanation to "Answer not marked in source — please verify manually."
10. NO SKIPPING — Include every MCQ you can see. Prioritize accuracy over speed.
11. RETURN ONLY VALID JSON — No preamble, markdown, or extra text.

JSON FORMAT (return exactly this structure):
{"questions":[{"questionText":"","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":"A","confidence":"high","explanation":"","topic":"","difficulty":"Medium"}]}

Rules for correctAnswer field:
- Use "A", "B", "C", or "D" when the answer is clearly marked in the image.
- Use "?" when no answer is marked — this is the CORRECT behavior, not an error.

If NO MCQs are visible, return: {"questions":[]}`;
};

/* ═══════════════════════════════════════════════════════════
   HELPER — Build prompt for text-based PDF extraction (v2)
   Same anti-hallucination rules, adapted for text content.
═══════════════════════════════════════════════════════════ */
const buildTextExtractionPrompt = (textContent, subjectHint = "") => {
  const subjectLine = subjectHint
    ? `\nSUBJECT CONTEXT: This document is about "${subjectHint}". Only extract questions related to this subject.`
    : "";

  return `You are a precise MCQ extractor. Below is text extracted from a PDF exam paper with line breaks preserved.${subjectLine}

TASK: Extract ALL multiple-choice questions (MCQs) present in this text.

══════════════════════════════════════════
CRITICAL ANTI-HALLUCINATION RULES — FOLLOW EXACTLY:
══════════════════════════════════════════
1. EXTRACT ONLY — Do NOT invent or generate any questions not present in the text.
2. COPY EXACTLY — Extract question text and options VERBATIM. Do not paraphrase or fix grammar.
3. CORRECT ANSWER — Only set correctAnswer if an answer key is present in the text (e.g., "Ans: B", "Answer: C", marked with *). If no answer is provided, use "?" — NEVER guess or use external knowledge.
4. CONFIDENCE — Set confidence to "high" if the answer appears in the text. Set to "low" if you are inferring.
5. MATHEMATICAL NOTATION — Preserve ALL formulas and math expressions exactly as written. Do NOT evaluate or simplify. Use LaTeX-style notation where helpful (e.g., x^2, sqrt(x), integral).
6. OPTIONS RECONSTRUCTION — If options appear on separate lines (e.g. "A) Newton" on one line, "B) Einstein" on next line), correctly associate them to the nearest question above.
7. TOPIC — Identify the specific subject (e.g., "Thermodynamics", "Linear Algebra", "Indian History").
8. DIFFICULTY — Easy, Medium, or Hard.
9. EXPLANATION — Only provide if correctAnswer is known. Otherwise: "Answer not marked in source — please verify manually."
10. RETURN ONLY VALID JSON — No markdown, no explanation text.

JSON FORMAT:
{"questions":[{"questionText":"","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":"A","confidence":"high","explanation":"","topic":"","difficulty":"Medium"}]}

correctAnswer MUST be one of: "A", "B", "C", "D", or "?". Use "?" when unsure.

If NO MCQs are present: {"questions":[]}

TEXT CONTENT:
${textContent}`;
};

/* ═══════════════════════════════════════════════════════════
   HELPER — Instant local regex parser for standard structured text
   Extracts questions like 'Q1. ... A) ... B) ... C) ... D) ...' in <1ms
═══════════════════════════════════════════════════════════ */
const parseMCQsLocally = (text) => {
  if (!text || typeof text !== "string") return [];
  const questions = [];
  const qBlocks = text.split(/(?=\n\s*(?:Q(?:uestion)?\s*\d+|\d+)[\.\)]\s+)/gi);

  for (const block of qBlocks) {
    const qMatch = block.match(/^\s*(?:Q(?:uestion)?\s*\d+|\d+)[\.\)]\s+([\s\S]+?)(?=(?:^[A-D][\.\)]|\n\s*[A-D][\.\)]|\n\s*\([A-D]\)|\n\s*Option\s+[A-D]))/im);
    if (!qMatch) continue;
    const questionText = qMatch[1].replace(/^\d+[\.\)]\s*/, "").trim();

    const optRegex = /(?:^|\n)\s*(?:([A-D])[).\:\s]+|\(([A-D])\)\s*)([^\n]+)/gi;
    const options = [];
    let optMatch;
    while ((optMatch = optRegex.exec(block)) !== null) {
      options.push(optMatch[3].trim());
    }

    if (options.length >= 2) {
      const ansMatch = block.match(/(?:Ans(?:wer)?|Correct\s+Option)[\s\:\-\.]*([A-D])/i);
      const correctAnswer = ansMatch ? ansMatch[1].toUpperCase() : "?";
      const expMatch = block.match(/(?:Explanation|Exp)[\s\:\-\.]+([^\n]+)/i);
      const explanation = expMatch ? expMatch[1].trim() : "Extracted from source.";

      questions.push({
        questionText,
        options: options.slice(0, 4),
        correctAnswer,
        confidence: ansMatch ? "high" : "low",
        explanation,
        topic: "General",
        difficulty: "Medium",
      });
    }
  }
  return questions;
};

/* ═══════════════════════════════════════════════════════════
   HELPER — Parse and repair JSON from AI response
═══════════════════════════════════════════════════════════ */
const repairJSON = (raw) => {
  let text = raw;
  // Strip markdown code fences
  text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
  // Remove control characters (except \n, \r, \t)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Find outermost JSON object boundaries
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON object found in response");
  text = text.slice(first, last + 1);

  // Remove trailing commas before closing brackets/braces
  text = text.replace(/,\s*([}\]])/g, "$1");

  return text;
};

/* ═══════════════════════════════════════════════════════════
   HELPER — Salvage questions from truncated/partial JSON
═══════════════════════════════════════════════════════════ */
const salvagePartialJSON = (raw) => {
  const blocks = [];
  const regex = /\{\s*"questionText"\s*:\s*"(?:[^"\\]|\\.)*"(?:[^{}]|\{[^{}]*\})*"correctAnswer"\s*:\s*"[ABCD?]"[^{}]*\}/gs;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    try {
      const repaired = repairJSON(match[0]);
      const q = JSON.parse(repaired);
      if (q.questionText && q.correctAnswer) blocks.push(q);
    } catch (_) {}
  }
  return blocks;
};

const parseExtractedQuestions = (rawText) => {
  // Strategy 1: Direct parse of the complete JSON
  try {
    const cleaned = repairJSON(rawText);
    const parsed = JSON.parse(cleaned);
    const questions = Array.isArray(parsed) ? parsed : parsed?.questions;
    if (Array.isArray(questions) && questions.length > 0) return questions;
    if (Array.isArray(questions) && questions.length === 0) return [];
  } catch (_) {}

  // Strategy 2: Salvage partial/truncated JSON
  try {
    const salvaged = salvagePartialJSON(rawText);
    if (salvaged.length > 0) {
      console.log(`  ⚠ Salvaged ${salvaged.length} questions from partial JSON response`);
      return salvaged;
    }
  } catch (_) {}

  // Strategy 4: If AI returned formatted text instead of JSON, parse MCQs directly
  try {
    const textMCQs = parseMCQsLocally(rawText);
    if (textMCQs.length > 0) {
      console.log(`  ✓ Extracted ${textMCQs.length} questions from text-formatted response`);
      return textMCQs;
    }
  } catch (_) {}

  // Strategy 5: If the text is an ad or contains no MCQs
  if (rawText.toLowerCase().includes("no multiple-choice") || rawText.toLowerCase().includes("advertisement") || rawText.toLowerCase().includes("no mcq")) {
    return [];
  }

  throw new Error("Could not parse AI response as valid MCQ JSON");
};

/* ═══════════════════════════════════════════════════════════
   HELPER — Call NVIDIA API with vision support
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   HELPER — Call NVIDIA API with vision support
═══════════════════════════════════════════════════════════ */
const callNvidiaVision = async (images, prompt) => {
  const content = [{ type: "text", text: prompt }];

  for (const img of images) {
    let mimeType = "image/jpeg";
    if (img.startsWith("data:")) {
      const match = img.match(/^data:(image\/\w+);/);
      if (match) mimeType = match[1];
    }
    const base64Data = img.startsWith("data:") ? img.split(",")[1] : img;
    content.push({
      type: "image_url",
      image_url: { url: `data:${mimeType};base64,${base64Data}` },
    });
  }

  for (const model of VISION_MODELS) {
    try {
      const response = await axios.post(
        NVIDIA_API_URL,
        {
          model,
          messages: [{ role: "user", content }],
          temperature: 0.05,
          max_tokens: 4096,
          top_p: 0.5,
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          },
          timeout: 50000,
        },
      );

      const rawText = response.data?.choices?.[0]?.message?.content;
      if (rawText && rawText.trim().length > 0) return rawText;
    } catch (err) {
      console.warn(`Vision model ${model} failed: ${err.message}, trying next...`);
    }
  }

  throw new Error("All Vision models failed to generate OCR response");
};

/* ═══════════════════════════════════════════════════════════
   HELPER — Call NVIDIA text model with automatic model fallback
═══════════════════════════════════════════════════════════ */
const callNvidiaText = async (prompt) => {
  let lastError = null;

  for (const model of TEXT_MODELS) {
    try {
      const response = await axios.post(
        NVIDIA_API_URL,
        {
          model,
          messages: [
            {
              role: "system",
              content: "You are a JSON-only MCQ extractor. Output ONLY a valid JSON object matching the requested schema.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 4096,
          top_p: 0.5,
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          },
          timeout: 20000,
        },
      );

      const rawText = response.data?.choices?.[0]?.message?.content;
      if (rawText && rawText.trim().length > 0) return rawText;
    } catch (err) {
      lastError = err;
      console.warn(`Text model ${model} failed: ${err.message}, trying next...`);
    }
  }

  throw lastError || new Error("All text models failed to extract MCQs");
};

/* ═══════════════════════════════════════════════════════════
   HELPER — Sanitize extracted question to quiz-ready format (v2)
   Now handles correctAnswer "?" gracefully (sets to null).
═══════════════════════════════════════════════════════════ */
const letterToIndex = (letter) => {
  const map = { A: 0, B: 1, C: 2, D: 3 };
  return map[String(letter).toUpperCase().trim()] ?? null;
};

const sanitizeExtractedQuestion = (q, index, validationResult) => {
  if (typeof q.questionText !== "string" || !q.questionText.trim()) {
    throw new Error(`Question ${index}: missing question text`);
  }

  // Clean options — remove "A) ", "B) " prefixes if present
  let opts = Array.isArray(q.options) ? [...q.options] : [];
  opts = opts.map((o) =>
    String(o)
      .replace(/^[A-D][).\s]+/i, "")
      .trim(),
  );
  while (opts.length < 4) opts.push("N/A");

  const rawAnswer = String(q.correctAnswer || "?").toUpperCase().trim();
  const validAnswers = ["A", "B", "C", "D"];
  const isAnswerKnown = validAnswers.includes(rawAnswer);

  const safeAnswer = isAnswerKnown ? rawAnswer : null;
  const answerIndex = isAnswerKnown ? letterToIndex(rawAnswer) : null;

  const validDifficulties = ["Easy", "Medium", "Hard"];
  const difficulty = validDifficulties.includes(q.difficulty) ? q.difficulty : "Medium";

  // Confidence from model response, or from validation pass
  const confidence = validationResult?.confidence || q.confidence || "high";
  const warnings = validationResult?.warnings || [];

  return {
    subject: String(q.topic || "General").trim(),
    topic: String(q.topic || "General").trim(),
    question: q.questionText.trim(),
    options: opts.slice(0, 4),
    answer: answerIndex,
    correctAnswer: safeAnswer,          // null if unknown
    answerUnknown: !isAnswerKnown,      // true when model could not determine answer
    explanation: String(
      q.explanation || (isAnswerKnown ? "No explanation provided." : "Answer not marked in source — please verify manually.")
    ).trim(),
    difficulty,
    confidence,
    warnings,
  };
};

/* ═══════════════════════════════════════════════════════════
   HELPER — Deduplicate questions across chunks
═══════════════════════════════════════════════════════════ */
const deduplicateQuestions = (questions) => {
  const seen = new Set();
  return questions.filter((q) => {
    const key = (q.question || q.questionText || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .slice(0, 80);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/* ═══════════════════════════════════════════════════════════
   SHARED — Process raw AI questions into sanitized format
   Used by both extractFromImage and extractPdfText.
═══════════════════════════════════════════════════════════ */
const processRawQuestions = (rawQuestions) => {
  const questions = rawQuestions
    .map((q, i) => {
      try {
        const validation = validateExtractedQuestion(q);
        if (!validation.valid) {
          console.warn(`  ⚠ Q${i + 1} validation warnings: ${validation.warnings.join("; ")}`);
        }
        return sanitizeExtractedQuestion(q, i, validation);
      } catch (err) {
        console.warn(`  ⚠ Skipping question ${i}: ${err.message}`);
        return null;
      }
    })
    .filter(Boolean);

  // Stats for logging
  const unknownCount = questions.filter((q) => q.answerUnknown).length;
  const lowConfCount = questions.filter((q) => q.confidence === "low").length;
  if (unknownCount > 0) console.log(`  ℹ ${unknownCount} questions have no visible answer (marked as unknown)`);
  if (lowConfCount > 0) console.log(`  ℹ ${lowConfCount} questions have low confidence`);

  return questions;
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 1 — EXTRACT MCQs FROM IMAGE
   POST /api/scan/extract
   Body: { images: [base64string, ...], fileName: string, scanId?: ObjectId, subjectHint?: string }
═══════════════════════════════════════════════════════════ */
export const extractFromImage = async (req, res) => {
  const startTime = Date.now();

  try {
    const key = process.env.NVIDIA_API_KEY;
    if (!key || key.trim() === "") {
      return res.status(500).json({
        success: false,
        message: "AI service not configured — NVIDIA_API_KEY missing",
      });
    }

    const { images, fileName = "scan.jpg", scanId, subjectHint = "" } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    if (images.length > 2) {
      return res.status(400).json({
        success: false,
        message: "Maximum 2 images allowed per request",
      });
    }

    const userId = req.user.id;
    console.log(`\n=== GyanS Scan v2 ===`);
    console.log(`User: ${userId} | Images: ${images.length} | File: ${fileName} | Subject hint: "${subjectHint || "none"}"`);

    // ── Phase 1: Send to vision model ──
    const prompt = buildExtractionPrompt(images.length, subjectHint);
    let rawText;

    try {
      console.log("  → Sending to vision model (anti-hallucination mode)...");
      rawText = await callNvidiaVision(images, prompt);
      console.log(`  ✓ Vision response (first 200 chars): ${rawText.slice(0, 200)}`);
    } catch (visionErr) {
      console.error(`  ✗ Vision model failed: ${visionErr.message}`);
      return res.status(500).json({
        success: false,
        message: `OCR failed on this image chunk: ${visionErr.message}. Try re-uploading with a clearer image.`,
        error: visionErr.message,
      });
    }

    // ── Phase 2: Parse the response ──
    let rawQuestions;
    try {
      rawQuestions = parseExtractedQuestions(rawText);
    } catch (parseErr) {
      console.error("  ✗ JSON parse failed:", parseErr.message);
      return res.status(500).json({
        success: false,
        message: "AI returned an unparseable response. Please try again.",
        error: parseErr.message,
        rawResponse: rawText.slice(0, 500),
      });
    }

    console.log(`  ✓ Parsed ${rawQuestions.length} questions`);

    if (rawQuestions.length === 0) {
      const scanDuration = Date.now() - startTime;
      console.log("  ℹ No MCQs found in this image chunk");
      return res.status(200).json({
        success: true,
        scanId: scanId || null,
        questions: [],
        meta: {
          totalExtracted: 0,
          detectedSubject: subjectHint || "General",
          scanDurationMs: scanDuration,
          model: VISION_MODEL,
          note: "No MCQs detected in this image",
        },
      });
    }

    // ── Phase 3: Sanitize + validate ──
    const questions = processRawQuestions(rawQuestions);

    if (questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Questions were found but could not be formatted correctly. Please try again.",
      });
    }

    const scanDuration = Date.now() - startTime;

    // Detect primary subject from extracted questions
    const topicCounts = {};
    questions.forEach((q) => {
      const t = q.topic || "General";
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
    const detectedSubject =
      subjectHint ||
      Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0];

    const questionsData = rawQuestions.map((q) => ({
      questionText: q.questionText?.trim() || "",
      options: (q.options || []).map((o) => String(o).replace(/^[A-D][).\s]+/i, "").trim()),
      correctAnswer: ["A", "B", "C", "D"].includes(
        String(q.correctAnswer || "").toUpperCase().trim()
      )
        ? String(q.correctAnswer).toUpperCase().trim()
        : null,
      explanation: String(q.explanation || "").trim(),
      topic: String(q.topic || "General").trim(),
      difficulty: ["Easy", "Medium", "Hard"].includes(q.difficulty) ? q.difficulty : "Medium",
    }));

    let scanRecord;
    if (scanId) {
      scanRecord = await ScanRecord.findOne({ _id: scanId, userId });
      if (!scanRecord) {
        return res.status(404).json({ success: false, message: "Scan record not found" });
      }

      scanRecord.extractedQuestions.push(...questionsData);
      scanRecord.totalQuestionsExtracted = scanRecord.extractedQuestions.length;
      scanRecord.scanDuration += scanDuration;
      scanRecord.imageCount += images.length;

      const fullTopicCounts = {};
      scanRecord.extractedQuestions.forEach((q) => {
        const t = q.topic || "General";
        fullTopicCounts[t] = (fullTopicCounts[t] || 0) + 1;
      });
      scanRecord.detectedSubject = Object.entries(fullTopicCounts).sort(
        (a, b) => b[1] - a[1],
      )[0][0];

      await scanRecord.save();
      console.log(`  ✓ Scan record updated (appended): ${scanRecord._id}`);
    } else {
      scanRecord = await ScanRecord.create({
        userId,
        imageThumbnail: createThumbnail(images[0]),
        fileName,
        imageCount: images.length,
        extractedQuestions: questionsData,
        totalQuestionsExtracted: questions.length,
        detectedSubject,
        scanDuration,
        status: "scanned",
      });
      console.log(`  ✓ Scan record created: ${scanRecord._id}`);
    }

    // Count unknowns for meta
    const unknownAnswerCount = questions.filter((q) => q.answerUnknown).length;
    const lowConfidenceCount = questions.filter((q) => q.confidence === "low").length;

    res.status(200).json({
      success: true,
      scanId: scanRecord._id,
      questions,
      meta: {
        totalExtracted: questions.length,
        unknownAnswerCount,
        lowConfidenceCount,
        detectedSubject,
        scanDurationMs: scanDuration,
        model: VISION_MODEL,
        antiHallucinationMode: true,
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`✗ extractFromImage failed after ${elapsed}ms:`, error.message);

    const isTimeout =
      error.message.includes("timed out") ||
      error.message.includes("ETIMEDOUT");

    res.status(500).json({
      success: false,
      message: isTimeout
        ? "OCR is taking too long — please try again with a smaller image or fewer pages"
        : "Failed to extract questions from image — please try again",
      error: error.message,
      responseTimeMs: elapsed,
    });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 2 — UPDATE SCAN WITH QUIZ RESULTS
   PATCH /api/scan/:id/complete
═══════════════════════════════════════════════════════════ */
export const completeScanQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { quizId, score, totalCorrect, totalWrong, totalSkipped, timeTaken } = req.body;

    const scan = await ScanRecord.findOne({ _id: id, userId: req.user.id });
    if (!scan) {
      return res.status(404).json({ success: false, message: "Scan record not found" });
    }

    scan.quizCompleted = true;
    scan.quizId = quizId || null;
    scan.score = score || 0;
    scan.totalCorrect = totalCorrect || 0;
    scan.totalWrong = totalWrong || 0;
    scan.totalSkipped = totalSkipped || 0;
    scan.timeTaken = timeTaken || 0;
    scan.status = "quiz_completed";
    await scan.save();

    res.status(200).json({ success: true, message: "Scan record updated with quiz results", scan });
  } catch (error) {
    console.error("completeScanQuiz error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 3 — GET SCAN HISTORY
   GET /api/scan/history
═══════════════════════════════════════════════════════════ */
export const getScanHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const history = await ScanRecord.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select(
        "fileName imageCount totalQuestionsExtracted detectedSubject quizCompleted score totalCorrect totalWrong totalSkipped timeTaken scanDuration status createdAt",
      );

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("getScanHistory error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 4 — GET SINGLE SCAN RECORD
   GET /api/scan/:id
═══════════════════════════════════════════════════════════ */
export const getScanRecord = async (req, res) => {
  try {
    const scan = await ScanRecord.findOne({ _id: req.params.id, userId: req.user.id });
    if (!scan) {
      return res.status(404).json({ success: false, message: "Scan record not found" });
    }

    let quiz = null;
    if (scan.quizCompleted && scan.quizId) {
      quiz = await Quiz.findById(scan.quizId);
    }

    res.status(200).json({ success: true, scan, quiz });
  } catch (error) {
    console.error("getScanRecord error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 5 — DELETE SCAN RECORD
   DELETE /api/scan/:id
═══════════════════════════════════════════════════════════ */
export const deleteScanRecord = async (req, res) => {
  try {
    const scan = await ScanRecord.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!scan) {
      return res.status(404).json({ success: false, message: "Scan record not found" });
    }
    res.status(200).json({ success: true, message: "Scan record deleted" });
  } catch (error) {
    console.error("deleteScanRecord error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 6 — GET SCAN ANALYTICS
   GET /api/scan/analytics
═══════════════════════════════════════════════════════════ */
export const getScanAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const allScans = await ScanRecord.find({ userId }).select(
      "totalQuestionsExtracted quizCompleted score totalCorrect totalWrong totalSkipped timeTaken detectedSubject scanDuration createdAt",
    );

    const totalScans = allScans.length;
    const completedQuizzes = allScans.filter((s) => s.quizCompleted).length;
    const totalQuestionsScanned = allScans.reduce((sum, s) => sum + s.totalQuestionsExtracted, 0);
    const totalCorrect = allScans.reduce((sum, s) => sum + (s.totalCorrect || 0), 0);
    const totalWrong = allScans.reduce((sum, s) => sum + (s.totalWrong || 0), 0);

    const avgScore =
      completedQuizzes > 0
        ? Math.round(
            allScans
              .filter((s) => s.quizCompleted)
              .reduce((sum, s) => sum + s.score, 0) / completedQuizzes,
          )
        : 0;

    const avgScanTime =
      totalScans > 0
        ? Math.round(allScans.reduce((sum, s) => sum + s.scanDuration, 0) / totalScans)
        : 0;

    const subjectMap = {};
    allScans.forEach((s) => {
      const subj = s.detectedSubject || "General";
      if (!subjectMap[subj]) subjectMap[subj] = { count: 0, correct: 0, total: 0 };
      subjectMap[subj].count += 1;
      subjectMap[subj].correct += s.totalCorrect || 0;
      subjectMap[subj].total += s.totalQuestionsExtracted || 0;
    });

    const subjectBreakdown = Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      scansCount: data.count,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      totalQuestions: data.total,
    }));

    const recentPerformance = allScans
      .filter((s) => s.quizCompleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((s) => ({
        score: s.score,
        totalCorrect: s.totalCorrect,
        totalQuestions: s.totalQuestionsExtracted,
        date: s.createdAt,
        subject: s.detectedSubject,
      }));

    res.status(200).json({
      success: true,
      analytics: {
        totalScans,
        completedQuizzes,
        totalQuestionsScanned,
        totalCorrect,
        totalWrong,
        avgScore,
        avgScanTime,
        subjectBreakdown,
        recentPerformance,
      },
    });
  } catch (error) {
    console.error("getScanAnalytics error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   CONTROLLER 7 — EXTRACT MCQs FROM PDF TEXT CHUNK
   POST /api/scan/extract-pdf-text
   Body: { textChunks: [string], fileName: string, scanId?: ObjectId, subjectHint?: string }
═══════════════════════════════════════════════════════════ */
export const extractPdfText = async (req, res) => {
  const startTime = Date.now();
  try {
    const key = process.env.NVIDIA_API_KEY;
    if (!key || key.trim() === "") {
      return res.status(500).json({
        success: false,
        message: "AI service not configured — NVIDIA_API_KEY missing",
      });
    }

    const { textChunks, fileName = "document.pdf", scanId, subjectHint = "" } = req.body;

    if (!textChunks || !Array.isArray(textChunks) || textChunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Text chunks are required",
      });
    }

    const userId = req.user.id;
    console.log(`\n=== GyanS PDF Text Extraction v2 ===`);
    console.log(`User: ${userId} | Pages: ${textChunks.length} | File: ${fileName} | Subject hint: "${subjectHint || "none"}" | ScanID: ${scanId || "New"}`);

    const combinedText = textChunks.join("\n\n--- PAGE BREAK ---\n\n");

    // ── Fast Path: Check if text can be parsed locally in <5ms ──
    const localQuestions = parseMCQsLocally(combinedText);
    if (localQuestions.length >= 2) {
      console.log(`  ⚡ Fast Path: Locally extracted ${localQuestions.length} MCQs in 1ms!`);
      const questions = processRawQuestions(localQuestions);
      const scanDuration = Date.now() - startTime;

      let scanRecord;
      const questionsData = localQuestions.map((q) => ({
        questionText: q.questionText?.trim() || "",
        options: (q.options || []).map((o) => String(o).replace(/^[A-D][).\s]+/i, "").trim()),
        correctAnswer: ["A", "B", "C", "D"].includes(String(q.correctAnswer || "").toUpperCase().trim())
          ? String(q.correctAnswer).toUpperCase().trim()
          : null,
        explanation: String(q.explanation || "").trim(),
        topic: String(q.topic || "General").trim(),
        difficulty: ["Easy", "Medium", "Hard"].includes(q.difficulty) ? q.difficulty : "Medium",
      }));

      if (scanId) {
        scanRecord = await ScanRecord.findOne({ _id: scanId, userId });
        if (scanRecord) {
          scanRecord.extractedQuestions.push(...questionsData);
          scanRecord.totalQuestionsExtracted = scanRecord.extractedQuestions.length;
          scanRecord.scanDuration += scanDuration;
          await scanRecord.save();
        }
      }

      if (!scanRecord) {
        scanRecord = await ScanRecord.create({
          userId,
          imageThumbnail: "",
          fileName,
          imageCount: 0,
          extractedQuestions: questionsData,
          totalQuestionsExtracted: questions.length,
          detectedSubject: subjectHint || "General",
          scanDuration,
          status: "scanned",
        });
      }

      return res.status(200).json({
        success: true,
        scanId: scanRecord._id,
        questions,
        meta: {
          totalExtracted: questions.length,
          detectedSubject: subjectHint || "General",
          scanDurationMs: scanDuration,
          model: "Fast Local Parser",
          antiHallucinationMode: true,
        },
      });
    }

    const prompt = buildTextExtractionPrompt(combinedText, subjectHint);

    console.log("  → Sending to fast text model...");
    let rawText;
    try {
      rawText = await callNvidiaText(prompt);
      console.log(`  ✓ Response received (first 200 chars): ${rawText.slice(0, 200)}`);
    } catch (apiErr) {
      console.error("  ✗ NVIDIA API error:", apiErr.message);
      return res.status(500).json({
        success: false,
        message: `AI extraction failed: ${apiErr.message}`,
        error: apiErr.message,
      });
    }

    let rawQuestions;
    try {
      rawQuestions = parseExtractedQuestions(rawText);
    } catch (parseErr) {
      console.error("  ✗ JSON parse failed:", parseErr.message);
      return res.status(500).json({
        success: false,
        message: "AI returned an unparseable response. Please try again.",
        error: parseErr.message,
        rawResponse: rawText.slice(0, 500),
      });
    }

    console.log(`  ✓ Parsed ${rawQuestions.length} questions`);

    if (rawQuestions.length === 0) {
      const scanDuration = Date.now() - startTime;
      console.log("  ℹ No MCQs found in this text chunk");
      return res.status(200).json({
        success: true,
        scanId: scanId || null,
        questions: [],
        meta: {
          totalExtracted: 0,
          detectedSubject: subjectHint || "General",
          scanDurationMs: scanDuration,
          model: TEXT_MODEL,
          note: "No MCQs detected in this text chunk",
        },
      });
    }

    const questions = processRawQuestions(rawQuestions);

    if (questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Questions were found but could not be formatted correctly. Please try again.",
      });
    }

    const scanDuration = Date.now() - startTime;

    const topicCounts = {};
    questions.forEach((q) => {
      const t = q.topic || "General";
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    });
    const detectedSubject =
      subjectHint ||
      Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0];

    const questionsData = rawQuestions.map((q) => ({
      questionText: q.questionText?.trim() || "",
      options: (q.options || []).map((o) => String(o).replace(/^[A-D][).\s]+/i, "").trim()),
      correctAnswer: ["A", "B", "C", "D"].includes(
        String(q.correctAnswer || "").toUpperCase().trim()
      )
        ? String(q.correctAnswer).toUpperCase().trim()
        : null,
      explanation: String(q.explanation || "").trim(),
      topic: String(q.topic || "General").trim(),
      difficulty: ["Easy", "Medium", "Hard"].includes(q.difficulty) ? q.difficulty : "Medium",
    }));

    let scanRecord;
    if (scanId) {
      scanRecord = await ScanRecord.findOne({ _id: scanId, userId });
      if (!scanRecord) {
        return res.status(404).json({ success: false, message: "Scan record not found" });
      }

      scanRecord.extractedQuestions.push(...questionsData);
      scanRecord.totalQuestionsExtracted = scanRecord.extractedQuestions.length;
      scanRecord.scanDuration += scanDuration;

      const fullTopicCounts = {};
      scanRecord.extractedQuestions.forEach((q) => {
        const t = q.topic || "General";
        fullTopicCounts[t] = (fullTopicCounts[t] || 0) + 1;
      });
      scanRecord.detectedSubject = Object.entries(fullTopicCounts).sort(
        (a, b) => b[1] - a[1],
      )[0][0];

      await scanRecord.save();
      console.log(`  ✓ Scan record updated (appended): ${scanRecord._id}`);
    } else {
      scanRecord = await ScanRecord.create({
        userId,
        imageThumbnail: "",
        fileName,
        imageCount: 0,
        extractedQuestions: questionsData,
        totalQuestionsExtracted: questions.length,
        detectedSubject,
        scanDuration,
        status: "scanned",
      });
      console.log(`  ✓ Scan record created: ${scanRecord._id}`);
    }

    const unknownAnswerCount = questions.filter((q) => q.answerUnknown).length;
    const lowConfidenceCount = questions.filter((q) => q.confidence === "low").length;

    res.status(200).json({
      success: true,
      scanId: scanRecord._id,
      questions,
      meta: {
        totalExtracted: questions.length,
        unknownAnswerCount,
        lowConfidenceCount,
        detectedSubject: scanRecord.detectedSubject,
        scanDurationMs: scanDuration,
        model: TEXT_MODEL,
        antiHallucinationMode: true,
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`✗ extractPdfText failed after ${elapsed}ms:`, error.message);
    res.status(500).json({
      success: false,
      message: "Failed to extract questions from text chunk — please try again",
      error: error.message,
    });
  }
};
