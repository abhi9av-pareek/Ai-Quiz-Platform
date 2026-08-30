import axios from "axios";
import http from "http";
import https from "https";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
// Active models on NVIDIA API with automatic fallback
const PRIMARY_NVIDIA_MODELS = [
  "deepseek-ai/deepseek-v4-flash-0731",   // DeepSeek V4 Flash API LLM (requested)
  "nvidia/nemotron-3-nano-30b-a3b",        // Fast reliable fallback (~3.5s)
  "meta/llama-3.2-11b-vision-instruct",   // Llama 3.2 fallback
  "nvidia/nemotron-3.5-lightning-30b-a3b", // Lightning fallback
];

// ─── Validate API key at startup ─────────────────────────────────────────────
let apiKeyWarned = false;
setTimeout(() => {
  const key = process.env.NVIDIA_API_KEY;
  if (!key || key.trim() === "") {
    console.warn(
      "⚠️ NVIDIA_API_KEY is NOT set — quiz fallback generator will be used if AI API calls fail.",
    );
  } else {
    console.log(`NVIDIA_API_KEY loaded (starts with: ${key.slice(0, 12)}...)`);
  }
}, 1000);

// ─── In-memory cache ───────────────────────────────────────────────────────────
const quizCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

const getCacheKey = (subjects, difficulty, count, language = "en") =>
  `${Array.isArray(subjects) ? subjects.sort().join("+") : subjects}__${difficulty}__${count}__${language}`;

// ─── Language name map (English & Hindi only) ─────────────────────────────────
const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi",
};

// ─── Prompt builder with strict Subject & Difficulty enforcement ─────────────
const buildPrompt = (subjects, difficulty, count, language = "en") => {
  const subjectList = Array.isArray(subjects) ? subjects.join(", ") : subjects;
  const isHindi = language === "hi";
  const langInstruction = isHindi
    ? "\nIMPORTANT: Generate ALL text (question, options, explanation) in HINDI language (हिंदी)."
    : "";

  let difficultyGuidelines = "";
  if (difficulty === "Easy") {
    difficultyGuidelines = `
DIFFICULTY LEVEL: EASY (BEGINNER)
- Questions must focus on fundamental definitions, core terminology, basic facts, and introductory principles.
- The correct answer should be clear and straightforward.
- Distractors should be simple and easily distinguishable for someone with basic knowledge.`;
  } else if (difficulty === "Hard") {
    difficultyGuidelines = `
DIFFICULTY LEVEL: HARD (EXAM & ADVANCED LEVEL)
- Questions must be rigorous and test deep conceptual mastery, subtle nuances, edge cases, landmark judgments/amendments/case laws/theorems, or multi-step reasoning.
- Absolutely DO NOT generate basic recall or trivial questions.
- Distractors must be highly plausible, sophisticated, and require careful critical analysis to eliminate.`;
  } else {
    difficultyGuidelines = `
DIFFICULTY LEVEL: MEDIUM (INTERMEDIATE)
- Questions must focus on practical application of concepts, comparing related ideas, and standard analytical problem-solving.
- Requires genuine conceptual understanding beyond surface memory recall.
- Distractors should target common conceptual misconceptions.`;
  }

  return `
You are an expert exam question creator. Generate exactly ${count} Multiple Choice Questions (MCQs) for the subject: "${subjectList}".${langInstruction}
${difficultyGuidelines}

CRITICAL RULES:
1. STRICT SUBJECT TOPIC: Every single question MUST strictly be about "${subjectList}". Absolutely DO NOT include questions from unrelated fields or subjects.
2. 4 OPTIONS PER QUESTION: Each question must have exactly 4 distinct, plausible options.
3. OPTION RANDOMIZATION: Randomly distribute the correct answer across options A, B, C, and D with equal probability. DO NOT place all or most correct answers in option A or the first position.
4. CLEAN FORMAT: Provide only the raw option text without prefixes like "A)", "B.", "Option A:".
5. DETAILED EXPLANATION: Include a clear 1-2 sentence explanation of why the correct answer is right and why others are incorrect.

Output ONLY a raw JSON object (no markdown, no commentary, no thinking text) in this exact schema:
{
  "quiz": [
    {
      "subject": "SUBJECT_HERE",
      "topic": "TOPIC_HERE",
      "question": "FULL_QUESTION_TEXT_HERE",
      "options": ["CHOICE_A", "CHOICE_B", "CHOICE_C", "CHOICE_D"],
      "correctAnswer": "A",
      "explanation": "EXPLANATION_HERE"
    }
  ]
}`;
};

// ─── Aggressive JSON repair ────────────────────────────────────────────────────
const repairJSON = (raw) => {
  let text = raw;
  // Strip markdown fences
  text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");
  // Strip model thinking/reasoning blocks (some models output these before JSON)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");
  text = text.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "");
  // Strip control characters
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON object found");
  text = text.slice(first, last + 1);
  text = text.replace(/,\s*([}\]])/g, "$1");
  return text;
};

// ─── Parse with fallback strategies ───────────────────────────────────────────
const parseResponse = (rawText) => {
  try {
    const cleaned = repairJSON(rawText);
    const parsed = JSON.parse(cleaned);
    const questions = Array.isArray(parsed) ? parsed : parsed?.quiz;
    if (Array.isArray(questions) && questions.length > 0) return questions;
  } catch (_) {}

  try {
    const blocks = [];
    const regex =
      /\{[^{}]*"question"\s*:[^{}]*"correctAnswer"\s*:\s*"[ABCD]"[^{}]*\}/gs;
    let match;
    while ((match = regex.exec(rawText)) !== null) {
      try {
        const q = JSON.parse(repairJSON(match[0]));
        if (q.question && q.options && q.correctAnswer) blocks.push(q);
      } catch (_) {}
    }
    if (blocks.length > 0) return blocks;
  } catch (_) {}

  throw new Error("Could not parse response as JSON after all strategies");
};

// ─── Call NVIDIA API with model fallback ──────────────────────────────────────
const callNvidia = async (prompt) => {
  let lastError = null;

  for (const model of PRIMARY_NVIDIA_MODELS) {
    try {
      const response = await axios.post(
        NVIDIA_API_URL,
        {
          model,
          messages: [
            {
              role: "system",
              content:
                "You are a JSON-only MCQ API. You must output ONLY a valid JSON object matching the requested schema without any reasoning or conversational preamble.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
          top_p: 0.85,
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          },
          timeout: 15000,
        },
      );

      const rawText = response.data?.choices?.[0]?.message?.content;
      if (rawText && rawText.trim().length > 0) {
        console.log(`Model ${model} responded (${rawText.length} chars) — attempting JSON parse...`);
        return rawText;
      }
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      console.warn(`Model ${model} failed (${status || err.message}), trying next model...`);
    }
  }

  throw lastError || new Error("All AI models failed to generate response");
};

// ─── Generate one chunk ────────────────────────────────────────────────────────
const generateChunk = async (subjects, difficulty, chunkSize, language = "en") => {
  const prompt = buildPrompt(subjects, difficulty, chunkSize, language);
  const rawText = await callNvidia(prompt);
  return parseResponse(rawText);
};

// ─── Chunked generation (sequential to avoid NVIDIA concurrency limits) ───────
const generateInChunks = async (subjects, difficulty, totalCount, language = "en") => {
  const CHUNK_SIZE = 5;

  if (totalCount <= CHUNK_SIZE) {
    return generateChunk(subjects, difficulty, totalCount, language);
  }

  const chunks = [];
  let remaining = totalCount;
  while (remaining > 0) {
    chunks.push(Math.min(remaining, CHUNK_SIZE));
    remaining -= CHUNK_SIZE;
  }

  const allQuestions = [];
  for (const size of chunks) {
    const chunkQuestions = await generateChunk(subjects, difficulty, size, language);
    if (Array.isArray(chunkQuestions)) {
      allQuestions.push(...chunkQuestions);
    }
  }

  return allQuestions;
};

// ─── Helper: Letter to Index mapping ──────────────────────────────────────────
const letterToIndex = (letter) => {
  const map = { A: 0, B: 1, C: 2, D: 3 };
  return map[String(letter).toUpperCase().trim()] ?? 0;
};

// ─── Helper: Option Shuffler (Fisher-Yates) ───────────────────────────────────
export const shuffleQuestionOptions = (q) => {
  if (!q || !Array.isArray(q.options) || q.options.length < 2) return q;

  const validLetters = ["A", "B", "C", "D"];

  // Clean any leading prefixes like "A)", "B.", "A. ", "Option A:", "A: "
  let cleanedOptions = q.options.map((opt) =>
    String(opt)
      .replace(/^(?:Option\s+[A-D]:|[A-D][).:\s]+)/i, "")
      .trim(),
  );

  while (cleanedOptions.length < 4) {
    cleanedOptions.push("None of the above");
  }
  cleanedOptions = cleanedOptions.slice(0, 4);

  // Identify the original correct option text
  let originalCorrectIdx = 0;
  if (typeof q.answer === "number" && q.answer >= 0 && q.answer < cleanedOptions.length) {
    originalCorrectIdx = q.answer;
  } else if (typeof q.correctAnswer === "string") {
    originalCorrectIdx = letterToIndex(q.correctAnswer);
  }

  const correctText = cleanedOptions[originalCorrectIdx] ?? cleanedOptions[0];

  // Perform Fisher-Yates shuffle
  const shuffled = [...cleanedOptions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const newCorrectIdx = shuffled.indexOf(correctText);
  const safeNewIdx = newCorrectIdx >= 0 ? newCorrectIdx : 0;
  const newCorrectLetter = validLetters[safeNewIdx];

  return {
    ...q,
    options: shuffled,
    answer: safeNewIdx,
    correctAnswer: newCorrectLetter,
  };
};

// ─── Detect template placeholder responses from the AI ──────────────────────────
const PLACEHOLDER_PATTERNS = [
  /^clear question text/i,
  /^question text/i,
  /^full.?question.?text/i,
  /^subject.?here/i,
  /^topic.?here/i,
  /^question.?here/i,
  /^choice.?[abcd]/i,
  /^option \d$/i,
  /^explanation.?here/i,
  /^choice \d$/i,
  /^answer.?here/i,
  /^your.?question/i,
];

const isPlaceholderQuestion = (q) => {
  if (!q || !q.question) return true;
  const qText = q.question.toLowerCase().trim();
  if (PLACEHOLDER_PATTERNS.some((p) => p.test(qText))) return true;
  // Reject if options look like placeholders
  if (Array.isArray(q.options)) {
    const placeholderOpts = q.options.filter((o) =>
      PLACEHOLDER_PATTERNS.some((p) => p.test(String(o).toLowerCase().trim()))
    );
    if (placeholderOpts.length >= 2) return true;
  }
  return false;
};

// ─── Sanitize & normalize a single question ────────────────────────────────────
const sanitizeQuestion = (q, index) => {
  if (typeof q.question !== "string" || !q.question.trim()) {
    throw new Error(`Question ${index}: missing question text`);
  }
  if (!Array.isArray(q.options) || q.options.length < 2) {
    throw new Error(`Question ${index}: invalid options`);
  }
  // Reject placeholder/template echo responses from AI
  if (isPlaceholderQuestion(q)) {
    throw new Error(`Question ${index}: detected template placeholder — discarding AI echo`);
  }

  const baseQuestion = {
    subject: String(q.subject || "General").trim(),
    topic: String(q.topic || "General").trim(),
    question: q.question.trim(),
    options: q.options.map((o) => String(o).trim()),
    answer: letterToIndex(q.correctAnswer || "A"),
    correctAnswer: String(q.correctAnswer || "A").toUpperCase().trim(),
    explanation: String(q.explanation || "No explanation provided.").trim(),
  };

  return shuffleQuestionOptions(baseQuestion);
};

// ─── Fallback Question Bank (Rich & Diverse) ──────────────────────────────────
const FALLBACK_BANK = {
  "Indian Constitution": [
    {
      question: "Which Constitutional Amendment Act is known as the 'Mini-Constitution' of India?",
      options: ["44th Amendment Act", "42nd Amendment Act", "73rd Amendment Act", "86th Amendment Act"],
      correctAnswer: "B",
      explanation: "The 42nd Amendment Act, 1976 made extensive changes to the Constitution, adding the words Socialist, Secular, and Integrity to the Preamble, and is commonly referred to as the Mini-Constitution."
    },
    {
      question: "Under which Article of the Indian Constitution can a citizen move the Supreme Court directly for the enforcement of Fundamental Rights?",
      options: ["Article 226", "Article 14", "Article 32", "Article 356"],
      correctAnswer: "C",
      explanation: "Article 32 guarantees the Right to Constitutional Remedies, allowing individuals to petition the Supreme Court directly via writs (Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo Warranto)."
    },
    {
      question: "Which landmark case of the Supreme Court established the 'Basic Structure Doctrine' of the Indian Constitution?",
      options: ["Golaknath v. State of Punjab", "Maneka Gandhi v. Union of India", "Minerva Mills v. Union of India", "Kesavananda Bharati v. State of Kerala"],
      correctAnswer: "D",
      explanation: "In the 1973 Kesavananda Bharati case, a 13-judge bench ruled that Parliament cannot alter or destroy the Basic Structure of the Constitution using its amending power under Article 368."
    },
    {
      question: "The Directive Principles of State Policy (DPSP) in Part IV of the Indian Constitution were borrowed from which country's constitution?",
      options: ["Irish Constitution", "US Constitution", "British Constitution", "Australian Constitution"],
      correctAnswer: "A",
      explanation: "The framers of the Indian Constitution borrowed the Directive Principles of State Policy (Articles 36–51) from the Irish Constitution of 1937."
    },
    {
      question: "Which Article of the Indian Constitution abolishes 'Untouchability' and forbids its practice in any form?",
      options: ["Article 14", "Article 17", "Article 19", "Article 21"],
      correctAnswer: "B",
      explanation: "Article 17 abolishes untouchability and makes its practice punishable in accordance with the Protection of Civil Rights Act."
    },
    {
      question: "Under Article 356, the President's Rule can be imposed in a state on the grounds of:",
      options: ["External aggression or armed rebellion", "Failure of constitutional machinery in the state", "Financial instability", "War threat"],
      correctAnswer: "B",
      explanation: "Article 356 empowers the President to impose President's Rule if the governance of a state cannot be carried on in accordance with the provisions of the Constitution."
    },
    {
      question: "Which Schedule of the Indian Constitution contains provisions regarding the allocation of seats in the Rajya Sabha (Council of States)?",
      options: ["Third Schedule", "Fifth Schedule", "Fourth Schedule", "Seventh Schedule"],
      correctAnswer: "C",
      explanation: "The Fourth Schedule specifies the allocation of seats to States and Union Territories in the Rajya Sabha."
    },
    {
      question: "The concept of 'Procedure Established by Law' under Article 21 was interpreted to mean 'Due Process of Law' in which landmark Supreme Court case?",
      options: ["A.K. Gopalan Case (1950)", "Maneka Gandhi Case (1978)", "Berubari Union Case (1960)", "Shankari Prasad Case (1951)"],
      correctAnswer: "B",
      explanation: "In Maneka Gandhi v. Union of India (1978), the Supreme Court held that the procedure under Article 21 must be just, fair, and reasonable, incorporating the American Due Process doctrine."
    }
  ],
  Mathematics: [
    {
      question: "What is the derivative of f(x) = x^3 + 4x^2 - 5x + 7 with respect to x?",
      options: ["3x^2 + 8x - 5", "3x^2 + 4x - 5", "x^2 + 8x - 5", "3x^2 + 8x + 7"],
      correctAnswer: "A",
      explanation: "Using the power rule d/dx(x^n) = n*x^(n-1), d/dx(x^3) = 3x^2, d/dx(4x^2) = 8x, and d/dx(-5x) = -5."
    },
    {
      question: "What is the value of the integral ∫ (2x + 3) dx?",
      options: ["2x^2 + 3x + C", "x^2 + 3x + C", "x^2 + 6x + C", "2x^2 + C"],
      correctAnswer: "B",
      explanation: "The antiderivative of 2x is x^2 and for 3 it is 3x. Adding the constant of integration gives x^2 + 3x + C."
    },
    {
      question: "If matrix A is 3x2 and matrix B is 2x4, what are the dimensions of matrix product AB?",
      options: ["2x2", "4x3", "3x4", "Undefined"],
      correctAnswer: "C",
      explanation: "Multiplying a (3x2) matrix by a (2x4) matrix yields a (3x4) matrix product."
    },
    {
      question: "What is the determinant of matrix [[4, 2], [3, 5]]?",
      options: ["20", "26", "6", "14"],
      correctAnswer: "D",
      explanation: "The determinant det = (4*5) - (2*3) = 20 - 6 = 14."
    },
    {
      question: "What is the probability of rolling a sum of 7 with two fair 6-sided dice?",
      options: ["1/6", "1/12", "1/36", "5/36"],
      correctAnswer: "A",
      explanation: "Outcomes totaling 7 are (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). 6/36 simplifies to 1/6."
    },
    {
      question: "What is the limit of (sin x)/x as x approaches 0?",
      options: ["0", "1", "Infinity", "Undefined"],
      correctAnswer: "B",
      explanation: "By standard calculus identity (and L'Hôpital's rule), lim(x->0) sin(x)/x = cos(0)/1 = 1."
    }
  ],
  Physics: [
    {
      question: "What is Newton's Second Law of Motion expressed mathematically?",
      options: ["F = mv", "F = ma", "E = mc^2", "P = IV"],
      correctAnswer: "B",
      explanation: "Newton's Second Law states that net force equals mass times acceleration (F = ma)."
    },
    {
      question: "What is the SI unit of electric capacitance?",
      options: ["Henry", "Tesla", "Farad", "Ohm"],
      correctAnswer: "C",
      explanation: "The Farad (F) is the SI unit of electrical capacitance."
    },
    {
      question: "Which law states that electric flux through a closed surface is proportional to enclosed charge?",
      options: ["Gauss's Law", "Ampere's Law", "Faraday's Law", "Lenz's Law"],
      correctAnswer: "A",
      explanation: "Gauss's Law relates electric flux through a closed Gaussian surface to the enclosed net charge."
    },
    {
      question: "What wavelength range characterizes human visible light?",
      options: ["1 nm to 10 nm", "1 mm to 1 m", "700 nm to 1 mm", "400 nm to 700 nm"],
      correctAnswer: "D",
      explanation: "Visible light wavelengths span approximately 400 nm (violet) to 700 nm (red)."
    }
  ],
  DSA: [
    {
      question: "What is the worst-case time complexity of QuickSelect for finding the k-th smallest element?",
      options: ["O(N log N)", "O(N)", "O(N^2)", "O(1)"],
      correctAnswer: "C",
      explanation: "Worst-case time complexity for QuickSelect is O(N^2) when poor pivots are chosen repeatedly."
    },
    {
      question: "Which data structure operates on a LIFO (Last In, First Out) principle?",
      options: ["Stack", "Queue", "Binary Heap", "Linked List"],
      correctAnswer: "A",
      explanation: "A Stack operates strictly on Last-In, First-Out (LIFO) order."
    },
    {
      question: "What is the time complexity of Dijkstra's Algorithm using a Min-Heap priority queue?",
      options: ["O(V^2)", "O((V + E) log V)", "O(E log E)", "O(V log V)"],
      correctAnswer: "B",
      explanation: "Dijkstra with an adjacency list and binary min-heap runs in O((V + E) log V) time."
    },
    {
      question: "In Dynamic Programming, what property is required alongside optimal substructure?",
      options: ["Greedy Choice Property", "Linearity", "Independence", "Overlapping Subproblems"],
      correctAnswer: "D",
      explanation: "Dynamic programming is applicable when problems exhibit Optimal Substructure and Overlapping Subproblems."
    }
  ],
  "Operating System": [
    {
      question: "Which CPU scheduling algorithm can suffer from the Convoy Effect?",
      options: ["Round Robin (RR)", "First-Come, First-Served (FCFS)", "Shortest Remaining Time First", "Priority Scheduling"],
      correctAnswer: "B",
      explanation: "FCFS suffers from the Convoy Effect where shorter CPU-burst processes wait behind a long CPU-burst process."
    },
    {
      question: "What is the state of a process waiting for an I/O operation to complete?",
      options: ["Ready", "Running", "Blocked / Waiting", "Terminated"],
      correctAnswer: "C",
      explanation: "A process waiting for I/O is transitioned to the Blocked or Waiting state."
    },
    {
      question: "Which condition is NOT one of Coffman's 4 conditions required for deadlock?",
      options: ["Mutual Exclusion", "Hold and Wait", "Circular Wait", "Preemption Allowed"],
      correctAnswer: "D",
      explanation: "Deadlock requires No Preemption. If preemption is allowed, deadlock cannot form."
    }
  ],
  "Comp. Science": [
    {
      question: "Which OSI layer is responsible for end-to-end communication, flow control, and error recovery?",
      options: ["Network Layer", "Data Link Layer", "Transport Layer", "Session Layer"],
      correctAnswer: "C",
      explanation: "Layer 4 (Transport Layer) manages end-to-end communication, segmentation, flow control, and reliability."
    },
    {
      question: "What does ACID stand for in Database Management Systems?",
      options: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Concurrency, Integrity, Durability", "Atomicity, Coherence, Isolation, Dependency", "Access, Control, Index, Data"],
      correctAnswer: "A",
      explanation: "ACID properties (Atomicity, Consistency, Isolation, Durability) ensure database transaction reliability."
    }
  ],
  History: [
    {
      question: "In which year was the Indus Valley Civilization site of Mohenjo-Daro discovered?",
      options: ["1921", "1922", "1935", "1947"],
      correctAnswer: "B",
      explanation: "Mohenjo-Daro was discovered in 1922 by R. D. Banerji, an officer of the Archaeological Survey of India."
    },
    {
      question: "Who among the following was the founder of the Maurya Empire in ancient India?",
      options: ["Ashoka", "Chandragupta Maurya", "Bindusara", "Brihadratha"],
      correctAnswer: "B",
      explanation: "Chandragupta Maurya founded the Maurya Empire in 322 BCE with the guidance of his advisor Chanakya (Kautilya)."
    }
  ],
  Aptitude: [
    {
      question: "If a train traveling at 60 km/h passes a pole in 9 seconds, what is the length of the train?",
      options: ["120 meters", "180 meters", "150 meters", "200 meters"],
      correctAnswer: "C",
      explanation: "Speed in m/s = 60 * (5/18) = 50/3 m/s. Length = (50/3) * 9 = 150 meters."
    },
    {
      question: "An item is sold for $240 with a 20% profit. What was the cost price?",
      options: ["$200", "$192", "$210", "$220"],
      correctAnswer: "A",
      explanation: "Cost Price = Selling Price / (1 + Profit%) = $240 / 1.20 = $200."
    }
  ],
  "SSC CGL": [
    {
      question: "Which of the following is the highest mountain peak situated in India?",
      options: ["K2 (Godwin-Austen)", "Kangchenjunga", "Nanda Devi", "Kamet"],
      correctAnswer: "B",
      explanation: "Kangchenjunga (8,586 m) in Sikkim is the highest peak in Indian sovereign territory."
    },
    {
      question: "Who among the following was the founder of the Brahmo Samaj in 1828?",
      options: ["Swami Vivekananda", "Raja Ram Mohan Roy", "Ishwar Chandra Vidyasagar", "Dayanand Saraswati"],
      correctAnswer: "B",
      explanation: "Raja Ram Mohan Roy founded the Brahmo Samaj in Calcutta in 1828 to promote monotheism and reform society."
    },
    {
      question: "Under which Article of the Indian Constitution is the Finance Commission constituted?",
      options: ["Article 280", "Article 324", "Article 356", "Article 370"],
      correctAnswer: "A",
      explanation: "Article 280 provides for the constitution of a Finance Commission by the President of India every five years."
    },
    {
      question: "Which river is famously known as the 'Sorrow of Bihar' due to frequent flooding?",
      options: ["Son River", "Kosi River", "Gandak River", "Ghaghara River"],
      correctAnswer: "B",
      explanation: "The Kosi River is known as the 'Sorrow of Bihar' because of devastating annual floods and course shifts."
    },
    {
      question: "If a sum triples itself in 8 years at simple interest, what is the annual rate of interest?",
      options: ["20%", "25%", "15%", "12.5%"],
      correctAnswer: "B",
      explanation: "Triple means Interest = 2P. Rate = (Interest * 100) / (P * T) = (2P * 100) / (P * 8) = 200/8 = 25%."
    }
  ]
};

// ─── Keyword matcher for fallback subjects ─────────────────────────────────────
const matchSubjectBank = (subj) => {
  if (!subj) return null;
  const s = String(subj).toLowerCase().trim();

  if (s.includes("constitution") || s.includes("polity") || s.includes("upsc") || s.includes("law") || s.includes("civics")) {
    return FALLBACK_BANK["Indian Constitution"];
  }
  if (s.includes("math") || s.includes("algebra") || s.includes("calculus") || s.includes("geometry") || s.includes("jee")) {
    return FALLBACK_BANK["Mathematics"];
  }
  if (s.includes("physic") || s.includes("mechanic") || s.includes("optics") || s.includes("neet")) {
    return FALLBACK_BANK["Physics"];
  }
  if (s.includes("dsa") || s.includes("data structure") || s.includes("algorithm") || s.includes("coding") || s.includes("tree")) {
    return FALLBACK_BANK["DSA"];
  }
  if (s.includes("os") || s.includes("operating system") || s.includes("linux") || s.includes("process")) {
    return FALLBACK_BANK["Operating System"];
  }
  if (s.includes("history") || s.includes("ancient") || s.includes("medieval") || s.includes("modern")) {
    return FALLBACK_BANK["History"];
  }
  if (s.includes("cs") || s.includes("comp") || s.includes("network") || s.includes("dbms") || s.includes("database")) {
    return FALLBACK_BANK["Comp. Science"];
  }
  if (s.includes("aptitude") || s.includes("reasoning") || s.includes("cat") || s.includes("quant")) {
    return FALLBACK_BANK["Aptitude"];
  }
  if (s.includes("ssc") || s.includes("cgl") || s.includes("chsl") || s.includes("railway") || s.includes("rrb") || s.includes("bank") || s.includes("ibps")) {
    return FALLBACK_BANK["SSC CGL"];
  }

  return FALLBACK_BANK[subj] || null;
};

const getFallbackQuestions = (subjects, difficulty, count, language = "en") => {
  const subjArray = Array.isArray(subjects) ? subjects : [subjects];
  const isHindi = language === "hi";
  const questions = [];

  subjArray.forEach((subj) => {
    // Only use the pre-built bank if there's an explicit match — never default a random subject to a wrong topic
    const matchedBank = matchSubjectBank(subj);
    if (matchedBank) {
      matchedBank.forEach((q) => {
        questions.push({
          subject: subj,
          topic: q.topic || "Core Concepts",
          question: q.question,
          options: q.options,
          answer: letterToIndex(q.correctAnswer),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        });
      });
    }
    // If no bank matched, skip adding wrong-topic questions — generic ones will be padded below
  });

  const randomizedBank = questions.sort(() => Math.random() - 0.5);
  const finalQuestions = [...randomizedBank];

  // 10 distinct question templates for English — each covers a different conceptual angle
  const EN_TEMPLATES = [
    (s, d) => ({
      topic: `${s} — Core Concepts`,
      question: `What is the primary purpose of ${s}?`,
      options: [
        `To establish a standardized framework applicable across ${s} domains`,
        `To restrict ${s} practice exclusively to certified specialists`,
        `To replace all prior knowledge systems with ${s} principles`,
        `To serve as a supplementary guide without binding authority`,
      ],
      correctAnswer: "A",
      explanation: `The primary purpose of ${s} is to create a standardized, widely applicable framework.`,
    }),
    (s, d) => ({
      topic: `${s} — Key Principles`,
      question: `Which statement best describes a fundamental principle of ${s}?`,
      options: [
        `Fundamental principles in ${s} are optional guidelines`,
        `Secondary rules always override fundamental principles in ${s}`,
        `Fundamental principles form the foundation that all other ${s} rules build upon`,
        `Fundamental and secondary principles carry equal weight in ${s}`,
      ],
      correctAnswer: "C",
      explanation: `In ${s}, fundamental principles serve as the non-negotiable foundation upon which all other rules are built.`,
    }),
    (s, d) => ({
      topic: `${s} — Application`,
      question: `When do exceptions to standard rules in ${s} apply?`,
      options: [
        `Whenever any rule conflicts with individual convenience`,
        `Exceptions never apply — ${s} rules are always absolute`,
        `Only in clearly defined special circumstances outlined in ${s}`,
        `Based solely on individual discretion without documentation`,
      ],
      correctAnswer: "C",
      explanation: `In ${s}, exceptions apply only under clearly defined and documented special circumstances.`,
    }),
    (s, d) => ({
      topic: `${s} — Historical Development`,
      question: `How has ${s} evolved over time?`,
      options: [
        `${s} emerged fully formed with no historical modifications`,
        `${s} has evolved progressively through practice, revision, and adaptation`,
        `${s} was entirely replaced by modern standards and is now obsolete`,
        `${s} development has been driven solely by technological advancement`,
      ],
      correctAnswer: "B",
      explanation: `Like most disciplines, ${s} has evolved through progressive refinement, practical experience, and systematic revision.`,
    }),
    (s, d) => ({
      topic: `${s} — Scope and Boundaries`,
      question: `What defines the scope of ${s}?`,
      options: [
        `The scope of ${s} is limited exclusively to its historical origins`,
        `The scope of ${s} encompasses only theoretical aspects without practical dimension`,
        `The scope of ${s} is defined by the range of contexts and applications it governs`,
        `The scope of ${s} is determined entirely by individual interpretation`,
      ],
      correctAnswer: "C",
      explanation: `The scope of ${s} is defined by the breadth of contexts, domains, and applications it covers.`,
    }),
    (s, d) => ({
      topic: `${s} — Common Misconceptions`,
      question: `Which is a common misconception about ${s}?`,
      options: [
        `${s} is too complex to be practically applied`,
        `${s} principles are rigid and need no contextual interpretation`,
        `${s} has no relevance in modern contexts`,
        `${s} requires complete memorization rather than understanding`,
      ],
      correctAnswer: "B",
      explanation: `A common misconception is that ${s} principles are rigid — in reality, contextual application and judgment are essential.`,
    }),
    (s, d) => ({
      topic: `${s} — Standards`,
      question: `How are standards maintained within ${s}?`,
      options: [
        `Standards in ${s} are set once and never revised`,
        `Standards in ${s} are maintained through ongoing review and expert consensus`,
        `Standards in ${s} are established arbitrarily without methodology`,
        `Standards in ${s} apply only within academic settings`,
      ],
      correctAnswer: "B",
      explanation: `Standards in ${s} are maintained through systematic reviews, expert consensus, and empirical evidence.`,
    }),
    (s, d) => ({
      topic: `${s} — Interdisciplinary Connections`,
      question: `How does ${s} relate to other fields of study?`,
      options: [
        `${s} operates in complete isolation with no overlap with other disciplines`,
        `${s} only borrows from other disciplines without contributing back`,
        `${s} has interdisciplinary connections, both influencing and being influenced by related fields`,
        `${s} is purely a subset of one broader discipline`,
      ],
      correctAnswer: "C",
      explanation: `${s} has rich interdisciplinary connections, drawing from and contributing to related fields.`,
    }),
    (s, d) => ({
      topic: `${s} — Evaluation`,
      question: `What is the most effective approach to evaluate mastery of ${s}?`,
      options: [
        `Rote memorization of all facts and definitions`,
        `Assessment based solely on speed of recall`,
        `Evaluation through conceptual understanding, application, and critical analysis`,
        `Testing limited to theoretical definitions without problem-solving`,
      ],
      correctAnswer: "C",
      explanation: `Mastery of ${s} is best evaluated through conceptual understanding and real-world application, not memorization alone.`,
    }),
    (s, d) => ({
      topic: `${s} — Future Trends`,
      question: `How is ${s} likely to adapt in the future?`,
      options: [
        `${s} will remain entirely static and unchanged`,
        `${s} will be completely replaced by unrelated disciplines`,
        `${s} will continuously evolve by incorporating new research and adapting to new contexts`,
        `${s} will narrow its scope exclusively to historical applications`,
      ],
      correctAnswer: "C",
      explanation: `${s} is expected to evolve continuously, integrating new research and adapting to emerging challenges.`,
    }),
  ];

  // 10 distinct Hindi templates
  const HI_TEMPLATES = [
    (s, d) => ({ topic: `${s} — मूल अवधारणाएँ`, question: `${s} का प्राथमिक उद्देश्य क्या है?`, options: [`${s} के लिए एक मानकीकृत ढांचा स्थापित करना`, `${s} को केवल विशेषज्ञों तक सीमित रखना`, `${s} में सभी पूर्व ज्ञान को प्रतिस्थापित करना`, `${s} को बिना बाध्यकारी अधिकार के पूरक मार्गदर्शिका बनाना`], correctAnswer: "A", explanation: `${s} का प्राथमिक उद्देश्य एक मानकीकृत ढांचा स्थापित करना है।` }),
    (s, d) => ({ topic: `${s} — मूल सिद्धांत`, question: `${s} के मूल सिद्धांत की सबसे अच्छी व्याख्या कौन सी है?`, options: [`${s} के मूल सिद्धांत वैकल्पिक दिशानिर्देश हैं`, `${s} में द्वितीयक नियम प्राथमिक सिद्धांतों से ऊपर होते हैं`, `${s} के मूल सिद्धांत सभी अन्य नियमों की नींव हैं`, `${s} में सभी सिद्धांतों का समान महत्व है`], correctAnswer: "C", explanation: `${s} में मूल सिद्धांत वह नींव है जिस पर अन्य सभी नियम बने होते हैं।` }),
    (s, d) => ({ topic: `${s} — अनुप्रयोग`, question: `${s} में मानक नियमों के अपवाद कब लागू होते हैं?`, options: [`जब भी कोई नियम व्यक्तिगत सुविधा से टकराता है`, `कभी नहीं — ${s} के नियम हमेशा निरपेक्ष होते हैं`, `केवल ${s} में स्पष्ट रूप से परिभाषित विशेष परिस्थितियों में`, `केवल व्यक्तिगत विवेक के आधार पर`], correctAnswer: "C", explanation: `${s} में अपवाद केवल स्पष्ट रूप से परिभाषित विशेष परिस्थितियों में लागू होते हैं।` }),
    (s, d) => ({ topic: `${s} — ऐतिहासिक विकास`, question: `${s} समय के साथ कैसे विकसित हुआ है?`, options: [`${s} में कोई ऐतिहासिक परिवर्तन नहीं हुआ`, `${s} अभ्यास, संशोधन और अनुकूलन के माध्यम से विकसित हुआ है`, `${s} को आधुनिक मानकों द्वारा पूरी तरह बदल दिया गया है`, `${s} केवल तकनीकी प्रगति से विकसित हुआ है`], correctAnswer: "B", explanation: `${s} अभ्यास, संशोधन और व्यावहारिक अनुभव के माध्यम से प्रगतिशील रूप से विकसित हुआ है।` }),
    (s, d) => ({ topic: `${s} — कार्यक्षेत्र`, question: `${s} का कार्यक्षेत्र क्या निर्धारित करता है?`, options: [`${s} का कार्यक्षेत्र केवल इसके ऐतिहासिक मूल तक सीमित है`, `${s} में केवल सैद्धांतिक पहलू शामिल हैं`, `${s} का कार्यक्षेत्र संदर्भों और अनुप्रयोगों की सीमा से निर्धारित होता है`, `${s} का कार्यक्षेत्र व्यक्तिगत व्याख्या से निर्धारित होता है`], correctAnswer: "C", explanation: `${s} का कार्यक्षेत्र उन संदर्भों और अनुप्रयोगों की विस्तृत श्रृंखला से परिभाषित होता है जिन पर यह लागू होता है।` }),
    (s, d) => ({ topic: `${s} — भ्रांतियाँ`, question: `${s} के बारे में एक सामान्य भ्रांति कौन सी है?`, options: [`${s} व्यावहारिक रूप से लागू करने के लिए बहुत जटिल है`, `${s} के सिद्धांत कठोर हैं और किसी व्याख्या की आवश्यकता नहीं है`, `${s} आधुनिक संदर्भों में प्रासंगिक नहीं है`, `${s} के लिए समझ के बजाय रटना जरूरी है`], correctAnswer: "B", explanation: `एक सामान्य भ्रांति यह है कि ${s} के सिद्धांत कठोर हैं — वास्तव में, प्रासंगिक अनुप्रयोग आवश्यक है।` }),
    (s, d) => ({ topic: `${s} — मानक`, question: `${s} में मानकों को कैसे बनाए रखा जाता है?`, options: [`${s} में मानक एक बार निर्धारित किए जाते हैं और कभी संशोधित नहीं होते`, `${s} के मानक निरंतर समीक्षा और विशेषज्ञ सहमति से बनाए रखे जाते हैं`, `${s} में मानक बिना पद्धति के मनमाने ढंग से स्थापित किए जाते हैं`, `${s} के मानक केवल शैक्षणिक सेटिंग में लागू होते हैं`], correctAnswer: "B", explanation: `${s} में मानकों को व्यवस्थित समीक्षाओं और विशेषज्ञ सहमति के माध्यम से बनाए रखा जाता है।` }),
    (s, d) => ({ topic: `${s} — अंतर-विषयक संबंध`, question: `${s} अन्य अध्ययन क्षेत्रों से कैसे संबंधित है?`, options: [`${s} पूरी तरह से अलगाव में काम करता है`, `${s} केवल अन्य विषयों से उधार लेता है`, `${s} के अंतर-विषयक संबंध हैं जो संबंधित क्षेत्रों को प्रभावित करते और प्रभावित होते हैं`, `${s} एक व्यापक अनुशासन का उप-समूह मात्र है`], correctAnswer: "C", explanation: `${s} के समृद्ध अंतर-विषयक संबंध हैं, जो संबंधित क्षेत्रों से आकर्षित और उन्हें योगदान देते हैं।` }),
    (s, d) => ({ topic: `${s} — मूल्यांकन`, question: `${s} में महारत का मूल्यांकन करने का सबसे प्रभावी तरीका क्या है?`, options: [`सभी तथ्यों और परिभाषाओं का रटना`, `केवल याद करने की गति पर आधारित मूल्यांकन`, `वैचारिक समझ, अनुप्रयोग और आलोचनात्मक विश्लेषण के माध्यम से मूल्यांकन`, `केवल सैद्धांतिक परिभाषाओं तक सीमित परीक्षण`], correctAnswer: "C", explanation: `${s} में महारत का सबसे अच्छा मूल्यांकन वैचारिक समझ और वास्तविक अनुप्रयोग के माध्यम से होता है।` }),
    (s, d) => ({ topic: `${s} — भविष्य के रुझान`, question: `${s} भविष्य में कैसे अनुकूलित होने की संभावना है?`, options: [`${s} पूरी तरह से स्थिर रहेगा`, `${s} को असंबंधित विषयों द्वारा पूरी तरह प्रतिस्थापित किया जाएगा`, `${s} नए शोध को शामिल करके और नए संदर्भों के अनुकूल होकर विकसित होता रहेगा`, `${s} केवल ऐतिहासिक अनुप्रयोगों तक अपने दायरे को सीमित करेगा`], correctAnswer: "C", explanation: `${s} नए शोध को एकीकृत करके और उभरती चुनौतियों के अनुकूल होकर विकसित होने की उम्मीद है।` }),
  ];

  while (finalQuestions.length < count) {
    const subjName = subjArray[finalQuestions.length % subjArray.length] || "General";
    const templateIdx = finalQuestions.length % 10;

    if (isHindi) {
      const t = HI_TEMPLATES[templateIdx](subjName, difficulty);
      finalQuestions.push({ subject: subjName, ...t, answer: ["A","B","C","D"].indexOf(t.correctAnswer) });
    } else {
      const t = EN_TEMPLATES[templateIdx](subjName, difficulty);
      finalQuestions.push({ subject: subjName, ...t, answer: ["A","B","C","D"].indexOf(t.correctAnswer) });
    }
  }

  return finalQuestions
    .slice(0, count)
    .map((q) => shuffleQuestionOptions(q));
};

// ─── Clear the in-memory cache (useful for forced refresh) ───────────────────
export const clearQuizCache = () => {
  quizCache.clear();
  console.log("🧹 Quiz cache cleared");
};

// ─── Main controller ───────────────────────────────────────────────────────────
export const generateQuestions = async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      subjects,
      difficulty = "Medium",
      count = 10,
      language = "en",
    } = req.body;

    if (!subjects || (Array.isArray(subjects) && subjects.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least one subject is required",
      });
    }

    const safeCount = Math.min(Math.max(Number(count), 5), 30);
    const safeDifficulty = ["Easy", "Medium", "Hard"].includes(difficulty)
      ? difficulty
      : "Medium";
    const safeLanguage = Object.keys(LANGUAGE_NAMES).includes(language)
      ? language
      : "en";

    console.log(`\n=== Quiz Generation ===`);
    console.log(
      `Subjects: ${subjects} | Difficulty: ${safeDifficulty} | Count: ${safeCount} | Language: ${safeLanguage}`,
    );

    // ── Cache check ──────────────────────────────────────────────────────────
    const cacheKey = getCacheKey(subjects, safeDifficulty, safeCount, safeLanguage);
    const cached = quizCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`Cache HIT — returning ${cached.questions.length} questions instantly`);
      const freshQuestions = cached.questions
        .map((q) => shuffleQuestionOptions(q))
        .sort(() => Math.random() - 0.5);
      return res.status(200).json({
        success: true,
        questions: freshQuestions,
        meta: {
          subjects: Array.isArray(subjects) ? subjects : [subjects],
          difficulty: safeDifficulty,
          count: freshQuestions.length,
          fromCache: true,
          generatedAt: new Date(cached.timestamp).toISOString(),
          responseTimeMs: Date.now() - startTime,
        },
      });
    }

    // Check if key is available for AI generation
    const key = process.env.NVIDIA_API_KEY;
    let questions = [];

    if (key && key.trim() !== "") {
      try {
        const rawQuestions = await generateInChunks(
          subjects,
          safeDifficulty,
          safeCount,
          safeLanguage,
        );
        questions = rawQuestions
          .slice(0, safeCount)
          .map((q, i) => sanitizeQuestion(q, i))
          .filter(Boolean);
      } catch (aiErr) {
        console.warn(`⚠️ AI Generation failed (${aiErr.message}), switching to curated question generator.`);
      }
    } else {
      console.log("ℹ️ No NVIDIA_API_KEY found, using curated fallback question engine.");
    }

    // If AI did not return enough questions or key missing, use fallback bank
    if (!questions || questions.length < safeCount) {
      console.log(`Generating fallback questions for ${subjects} (language: ${safeLanguage})...`);
      questions = getFallbackQuestions(subjects, safeDifficulty, safeCount, safeLanguage);
    }

    const elapsed = Date.now() - startTime;
    console.log(`✓ Ready: ${questions.length} questions generated in ${elapsed}ms`);

    // Store in cache
    quizCache.set(cacheKey, { questions, timestamp: Date.now() });
    if (quizCache.size > 100) {
      const oldestKey = quizCache.keys().next().value;
      quizCache.delete(oldestKey);
    }

    return res.status(200).json({
      success: true,
      questions,
      meta: {
        subjects: Array.isArray(subjects) ? subjects : [subjects],
        difficulty: safeDifficulty,
        count: questions.length,
        language: safeLanguage,
        fromCache: false,
        generatedAt: new Date().toISOString(),
        responseTimeMs: elapsed,
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`✗ generateQuestions catch fallback triggered:`, error.message);

    // Guaranteed safety fallback
    const { subjects, difficulty = "Medium", count = 10 } = req.body;
    const safeCount = Math.min(Math.max(Number(count), 5), 30);
    const fallbackQs = getFallbackQuestions(subjects || "General", difficulty, safeCount);

    return res.status(200).json({
      success: true,
      questions: fallbackQs,
      meta: {
        subjects: Array.isArray(subjects) ? subjects : [subjects || "General"],
        difficulty,
        count: fallbackQs.length,
        fromCache: false,
        fallback: true,
        generatedAt: new Date().toISOString(),
        responseTimeMs: elapsed,
      },
    });
  }
};
