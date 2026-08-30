import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sigma, Atom, FlaskConical, Cpu, Monitor, PenLine, Shuffle, Lightbulb, Zap, ClipboardList, Check, Brain, Globe } from "lucide-react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0A0B0F; --surface: #111318; --surface2: #181B23;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.13);
    --accent: #7C5CFC; --accent2: #00E5C0; --accent3: #FF6B6B;
    --amber: #FFB347; --text: #F0EFF8; --muted: #7B7A8C; --muted2: #3A394A;
  }
  [data-theme="light"] {
    --bg: #F5F5FA; --surface: #FFFFFF; --surface2: #F0EFF8;
    --border: rgba(0,0,0,0.07); --border2: rgba(0,0,0,0.12);
    --text: #0A0B0F; --muted: #7B7A8C; --muted2: #C8C7D4;
  }
  .bb-root { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; transition: background .3s, color .3s; }

  /* STEPPER */
  .bb-stepper-wrap { display: flex; align-items: center; justify-content: center; padding: 2rem 2rem 0; }
  .bb-step-item { display: flex; align-items: center; gap: 8px; }
  .bb-step-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; font-family: 'Syne', sans-serif; transition: all .3s; border: 2px solid var(--muted2); color: var(--muted); background: transparent; }
  .bb-step-circle.done { background: var(--accent2); border-color: var(--accent2); color: #0A0B0F; }
  .bb-step-circle.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .bb-step-label { font-size: 12px; color: var(--muted); font-weight: 500; transition: color .3s; }
  .bb-step-label.active { color: var(--text); }
  .bb-step-label.done { color: var(--accent2); }
  .bb-step-line { width: 48px; height: 1px; background: var(--muted2); margin: 0 4px; transition: background .3s; }
  .bb-step-line.done { background: var(--accent2); }

  /* MAIN */
  .bb-main { max-width: 660px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
  .bb-panel-header { margin-bottom: 1.75rem; }
  .bb-panel-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
  .bb-panel-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; line-height: 1.2; margin-bottom: 8px; }
  .bb-panel-sub { font-size: 14px; color: var(--muted); line-height: 1.6; }

  /* SUBJECT GRID */
  .bb-subj-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
  .bb-subj-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem; cursor: pointer; transition: all .2s; text-align: center; }
  .bb-subj-card:hover { border-color: var(--border2); background: var(--surface2); }
  .bb-subj-card.sel { border-color: var(--accent); background: rgba(124,92,252,0.08); }
  .bb-subj-card .s-icon { font-size: 22px; margin-bottom: 6px; }
  .bb-subj-card .s-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .bb-subj-card.sel .s-name { color: var(--accent); }

  /* CUSTOM SUBJECT */
  .bb-custom-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.1rem 1.25rem; margin-bottom: 1.5rem; cursor: pointer; transition: border-color .2s; }
  .bb-custom-wrap.sel { border-color: var(--accent); }
  .bb-custom-top { display: flex; align-items: center; gap: 10px; }
  .bb-c-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(0,229,192,0.1); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .bb-c-label { flex: 1; }
  .bb-c-title { font-size: 13px; font-weight: 600; color: var(--text); }
  .bb-c-sub { font-size: 11px; color: var(--muted); }
  .bb-c-arrow { font-size: 16px; color: var(--muted); transition: transform .2s; }
  .bb-c-arrow.open { transform: rotate(90deg); }
  .bb-custom-expand { display: none; margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem; }
  .bb-custom-expand.open { display: block; }
  .bb-custom-input-row { display: flex; gap: 8px; margin-bottom: 10px; }
  .bb-custom-input { flex: 1; background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; padding: 10px 14px; color: var(--text); font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
  .bb-custom-input::placeholder { color: var(--muted); }
  .bb-custom-input:focus { border-color: var(--accent); }
  .bb-custom-add-btn { background: var(--accent); border: none; border-radius: 10px; padding: 10px 16px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .bb-custom-add-btn:hover { background: #9074fd; }
  .bb-custom-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .bb-custom-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(124,92,252,0.12); border: 1px solid rgba(124,92,252,0.3); border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 500; color: var(--accent); }
  .bb-custom-chip .remove { cursor: pointer; color: var(--muted); font-size: 14px; line-height: 1; }
  .bb-custom-chip .remove:hover { color: var(--accent3); }
  .bb-popular-label { font-size: 11px; color: var(--muted); margin-bottom: 6px; letter-spacing: .5px; }
  .bb-popular-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .bb-pop-chip { background: var(--surface2); border: 1px solid var(--border2); border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all .15s; }
  .bb-pop-chip:hover { border-color: var(--accent); color: var(--accent); }

  /* DIFFICULTY */
  .bb-diff-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 1.5rem; }
  .bb-diff-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.2rem 1rem; cursor: pointer; transition: all .2s; }
  .bb-diff-card:hover { border-color: var(--border2); background: var(--surface2); }
  .bb-diff-card.sel-easy { border-color: #00E5C0; background: rgba(0,229,192,0.07); }
  .bb-diff-card.sel-medium { border-color: #FFB347; background: rgba(255,179,71,0.07); }
  .bb-diff-card.sel-hard { border-color: #FF6B6B; background: rgba(255,107,107,0.07); }
  .bb-diff-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; margin-bottom: 10px; }
  .badge-easy { background: rgba(0,229,192,0.15); color: #00E5C0; }
  .badge-medium { background: rgba(255,179,71,0.15); color: #FFB347; }
  .badge-hard { background: rgba(255,107,107,0.15); color: #FF6B6B; }
  .bb-diff-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .bb-diff-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }
  .bb-diff-dots { display: flex; gap: 4px; margin-top: 10px; }
  .bb-diff-dot { width: 8px; height: 8px; border-radius: 50%; }

  /* SECTION DIVIDER */
  .bb-section-divider { display: flex; align-items: center; gap: 12px; margin: 0.25rem 0 1.25rem; }
  .bb-section-divider .divider-line { flex: 1; height: 1px; background: var(--border2); }
  .bb-section-divider .divider-label { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 6px; white-space: nowrap; }

  /* LANGUAGE GRID */
  .bb-lang-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 1.75rem; }
  .bb-lang-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.1rem 1rem; cursor: pointer; transition: all .25s cubic-bezier(.4,0,.2,1); text-align: center; position: relative; overflow: hidden; }
  .bb-lang-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(124,92,252,0.08), transparent 70%); opacity: 0; transition: opacity .25s; }
  .bb-lang-card:hover { border-color: var(--border2); background: var(--surface2); transform: translateY(-2px); }
  .bb-lang-card:hover::before { opacity: 1; }
  .bb-lang-card.sel { border-color: var(--accent); background: rgba(124,92,252,0.08); box-shadow: 0 0 20px rgba(124,92,252,0.18); }
  .bb-lang-card.sel::before { opacity: 1; }
  .bb-lang-card .lang-flag { font-size: 32px; margin-bottom: 8px; line-height: 1; }
  .bb-lang-card .lang-name { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.2; }
  .bb-lang-card.sel .lang-name { color: var(--accent); }
  .bb-lang-card .lang-native { font-size: 12px; color: var(--muted); margin-top: 3px; line-height: 1.2; }
  .bb-lang-card.sel .lang-native { color: rgba(124,92,252,0.85); font-weight: 500; }
  .bb-lang-card .lang-check { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0.5); transition: all .2s cubic-bezier(.4,0,.2,1); }
  .bb-lang-card.sel .lang-check { opacity: 1; transform: scale(1); }

  /* SETTINGS */
  .bb-slider-section { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; margin-bottom: 12px; }
  .bb-slider-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .bb-slider-label { font-size: 14px; font-weight: 500; }
  .bb-slider-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: var(--accent); }
  input[type=range] { width: 100%; accent-color: var(--accent); height: 4px; cursor: pointer; }
  .bb-slider-hints { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-top: 6px; }
  .bb-opt-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.5rem; }
  .bb-opt-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.1rem; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 10px; }
  .bb-opt-card:hover { border-color: var(--border2); background: var(--surface2); }
  .bb-opt-card.sel { border-color: var(--accent); background: rgba(124,92,252,0.08); }
  .bb-opt-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .bb-opt-name { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
  .bb-opt-desc { font-size: 11px; color: var(--muted); }

  /* REVIEW */
  .bb-summary-card { background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
  .bb-summary-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .bb-summary-row:last-child { border-bottom: none; }
  .bb-summary-key { font-size: 13px; color: var(--muted); }
  .bb-summary-val { font-size: 13px; font-weight: 600; color: var(--text); }
  .bb-summary-val.accent { color: var(--accent); }
  .bb-summary-val.teal { color: var(--accent2); }
  .bb-summary-val.amber { color: var(--amber); }
  .bb-summary-val.coral { color: var(--accent3); }
  .bb-est-box { background: rgba(124,92,252,0.08); border: 1px solid rgba(124,92,252,0.2); border-radius: 12px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }
  .bb-est-icon { font-size: 20px; }
  .bb-est-text { font-size: 13px; color: var(--muted); line-height: 1.5; }
  .bb-est-text strong { color: var(--text); }

  /* BUTTONS */
  .bb-btn-row { display: flex; gap: 10px; }
  .bb-btn { padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; transition: all .2s; }
  .bb-btn-primary { background: var(--accent); color: #fff; flex: 1; }
  .bb-btn-primary:hover { background: #9074fd; transform: translateY(-1px); }
  .bb-btn-primary:disabled { background: var(--muted2); color: var(--muted); cursor: not-allowed; transform: none; }
  .bb-btn-ghost { background: rgba(255,255,255,0.05); color: var(--muted); border: 1px solid var(--border2); }
  [data-theme="light"] .bb-btn-ghost { background: rgba(0,0,0,0.04); }
  .bb-btn-ghost:hover { background: rgba(255,255,255,0.09); }
  .bb-btn-start { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #0A0B0F; flex: 1; font-size: 15px; }
  .bb-btn-start:hover { opacity: .9; transform: translateY(-1px); }

  /* ── Light mode fix ── */
  [data-theme="light"] .bb-btn-ghost { background: rgba(0,0,0,0.04); }

  /* ── MOBILE RESPONSIVE ── */
  @media (max-width: 768px) {
    .bb-main { padding: 1.5rem 1rem 3rem; }
    .bb-stepper-wrap { padding: 1.25rem 1rem 0; flex-wrap: wrap; gap: 4px; }
    .bb-step-line { width: 24px; }
    .bb-step-label { font-size: 10px; }
    .bb-panel-title { font-size: 22px; }
    .bb-subj-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .bb-diff-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .bb-lang-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .bb-opt-row { grid-template-columns: 1fr; gap: 8px; }
    .bb-btn-row { flex-direction: column; }
    .bb-btn-row .bb-btn { width: 100%; justify-content: center; }
    .bb-custom-input-row { flex-direction: column; }
    .bb-custom-add-btn { width: 100%; }
  }

  @media (max-width: 480px) {
    .bb-main { padding: 1.25rem 0.75rem 2.5rem; }
    .bb-stepper-wrap { padding: 1rem 0.5rem 0; }
    .bb-step-circle { width: 26px; height: 26px; font-size: 11px; }
    .bb-step-line { width: 16px; }
    .bb-step-label { font-size: 9px; }
    .bb-panel-title { font-size: 20px; }
    .bb-panel-sub { font-size: 13px; }
    .bb-subj-grid { grid-template-columns: repeat(2, 1fr); gap: 6px; }
    .bb-subj-card { padding: 0.75rem; }
    .bb-subj-card .s-name { font-size: 12px; }
    .bb-diff-grid { grid-template-columns: 1fr; gap: 8px; }
    .bb-diff-card { padding: 1rem; }
    .bb-lang-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .bb-lang-card { padding: 0.85rem 0.5rem; border-radius: 12px; }
    .bb-lang-card .lang-flag { font-size: 24px; }
    .bb-lang-card .lang-name { font-size: 13px; }
    .bb-lang-card .lang-native { font-size: 11px; }
    .bb-slider-section { padding: 1rem; }
    .bb-slider-val { font-size: 18px; }
    .bb-opt-card { padding: 0.75rem; }
    .bb-summary-card { padding: 1rem; }
    .bb-est-box { padding: 0.75rem 1rem; }
  }
`;

const SUBJECTS = [
  { name: "Mathematics", icon: <Sigma size={22} /> },
  { name: "Physics", icon: <Atom size={22} /> },
  { name: "DSA", icon: <FlaskConical size={22} /> },
  { name: "Operating System", icon: <Cpu size={22} /> },
  { name: "Comp. Science", icon: <Monitor size={22} /> },
  { name: "Aptitude", icon: <PenLine size={22} /> },
];

const POPULAR_EXAMS = [
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "UPSC",
  "CAT",
  "GATE",
  "SSC CGL",
  "History",
  "Geography",
  "Economics",
];

const DIFFICULTIES = [
  {
    key: "Easy",
    selClass: "sel-easy",
    badgeClass: "badge-easy",
    title: "Beginner",
    desc: "Foundational concepts, straightforward recall questions.",
    dots: ["#00E5C0", "var(--muted2)", "var(--muted2)"],
  },
  {
    key: "Medium",
    selClass: "sel-medium",
    badgeClass: "badge-medium",
    title: "Intermediate",
    desc: "Applied thinking, multi-step problems and concepts.",
    dots: ["#FFB347", "#FFB347", "var(--muted2)"],
  },
  {
    key: "Hard",
    selClass: "sel-hard",
    badgeClass: "badge-hard",
    title: "Advanced",
    desc: "Complex problems, edge cases, exam-level difficulty.",
    dots: ["#FF6B6B", "#FF6B6B", "#FF6B6B"],
  },
];

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧", native: "English" },
  { code: "hi", name: "Hindi",   flag: "🇮🇳", native: "हिन्दी" },
];

const OPTIONS = [
  {
    id: "shuffle",
    icon: <Shuffle size={16} />,
    bg: "rgba(124,92,252,0.12)",
    name: "Shuffle questions",
    desc: "Random order each time",
    defaultSel: true,
  },
  {
    id: "hints",
    icon: <Lightbulb size={16} />,
    bg: "rgba(0,229,192,0.1)",
    name: "Show hints",
    desc: "Get a clue if stuck",
    defaultSel: false,
  },
  {
    id: "instant",
    icon: <Zap size={16} />,
    bg: "rgba(255,179,71,0.1)",
    name: "Instant feedback",
    desc: "See answer immediately",
    defaultSel: true,
  },
  {
    id: "review",
    icon: <ClipboardList size={16} />,
    bg: "rgba(255,107,107,0.1)",
    name: "End review",
    desc: "Detailed result summary",
    defaultSel: false,
  },
];

function Stepper({ step }) {
  const labels = ["Subject", "Difficulty & Lang", "Settings", "Review"];
  return (
    <div className="bb-stepper-wrap">
      {labels.map((label, i) => {
        const num = i + 1;
        const isDone = num < step;
        const isActive = num === step;
        return (
          <React.Fragment key={num}>
            <div className="bb-step-item">
              <div
                className={`bb-step-circle${isDone ? " done" : isActive ? " active" : ""}`}
              >
                {isDone ? <Check size={14} /> : num}
              </div>
              <div
                className={`bb-step-label${isDone ? " done" : isActive ? " active" : ""}`}
              >
                {label}
              </div>
            </div>
            {num < 4 && (
              <div className={`bb-step-line${isDone ? " done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function QuizSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state || {};
  const initialSubject = locState.prefilledSubject || locState.subject || locState.initialSubject || "";

  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState(initialSubject);
  const [customOpen, setCustomOpen] = useState(false);
  const [customList, setCustomList] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [language, setLanguage] = useState("en");
  const [questions, setQuestions] = useState(10);
  const [timePerQ, setTimePerQ] = useState(30);
  const [options, setOptions] = useState(() =>
    OPTIONS.reduce((acc, o) => ({ ...acc, [o.id]: o.defaultSel }), {}),
  );

  const selectSubject = (name) => {
    setSubject(name);
    setCustomList([]);
  };

  const addCustom = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    const next = customList.includes(trimmed)
      ? customList
      : [...customList, trimmed];
    setCustomList(next);
    setSubject(next.join(", "));
  };

  const removeCustom = (val) => {
    const next = customList.filter((x) => x !== val);
    setCustomList(next);
    setSubject(next.length ? next.join(", ") : "");
  };

  const handleAddFromInput = () => {
    addCustom(customInput);
    setCustomInput("");
  };
  const toggleOption = (id) =>
    setOptions((prev) => ({ ...prev, [id]: !prev[id] }));
  const getOptsLabel = () => {
    const active = OPTIONS.filter((o) => options[o.id]).map((o) => o.name);
    return active.length ? active.join(", ") : "None";
  };

  const totalMin = Math.round((questions * timePerQ) / 60);
  const diffColorClass =
    difficulty === "Easy"
      ? "teal"
      : difficulty === "Medium"
        ? "amber"
        : difficulty === "Hard"
          ? "coral"
          : "";
  const isCustomSel = customList.length > 0;
  const selectedLang = LANGUAGES.find((l) => l.code === language);

  return (
    <>
      <style>{css}</style>
      <div className="bb-root">
        <Stepper step={step} />
        <main className="bb-main">
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div className="bb-panel-header">
                <div className="bb-panel-eyebrow">Step 1 of 4</div>
                <div className="bb-panel-title">Choose your subject</div>
                <div className="bb-panel-sub">
                  Pick from our library or type your own subject or exam name.
                </div>
              </div>

              <div className="bb-subj-grid">
                {SUBJECTS.map((s) => (
                  <div
                    key={s.name}
                    className={`bb-subj-card${subject === s.name && !isCustomSel ? " sel" : ""}`}
                    onClick={() => selectSubject(s.name)}
                  >
                    <div className="s-icon">{s.icon}</div>
                    <div className="s-name">{s.name}</div>
                  </div>
                ))}
              </div>

              <div className={`bb-custom-wrap${isCustomSel ? " sel" : ""}`}>
                <div
                  className="bb-custom-top"
                  onClick={() => setCustomOpen(!customOpen)}
                >
                  <div className="bb-c-icon">+</div>
                  <div className="bb-c-label">
                    <div className="bb-c-title">Custom subject or exam</div>
                    <div className="bb-c-sub">
                      Type your own — JEE, NEET, UPSC, History, Law &amp; more
                    </div>
                  </div>
                  <div className={`bb-c-arrow${customOpen ? " open" : ""}`}>
                    ▶
                  </div>
                </div>
                <div className={`bb-custom-expand${customOpen ? " open" : ""}`}>
                  <div className="bb-popular-label">POPULAR EXAMS</div>
                  <div className="bb-popular-chips">
                    {POPULAR_EXAMS.map((exam) => (
                      <div
                        key={exam}
                        className="bb-pop-chip"
                        onClick={() => addCustom(exam)}
                      >
                        {exam}
                      </div>
                    ))}
                  </div>
                  <div className="bb-custom-input-row">
                    <input
                      className="bb-custom-input"
                      type="text"
                      placeholder="e.g. NEET, Organic Chemistry, World History..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddFromInput()
                      }
                    />
                    <button
                      className="bb-custom-add-btn"
                      onClick={handleAddFromInput}
                    >
                      Add
                    </button>
                  </div>
                  <div className="bb-custom-chips">
                    {customList.map((val) => (
                      <div key={val} className="bb-custom-chip">
                        {val}
                        <span
                          className="remove"
                          onClick={() => removeCustom(val)}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bb-btn-row">
                <button
                  className="bb-btn bb-btn-primary"
                  disabled={!subject}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div className="bb-panel-header">
                <div className="bb-panel-eyebrow">Step 2 of 4</div>
                <div className="bb-panel-title">Difficulty & Language</div>
                <div className="bb-panel-sub">
                  Set the challenge level and pick your preferred language.
                </div>
              </div>
              <div className="bb-diff-grid">
                {DIFFICULTIES.map((d) => (
                  <div
                    key={d.key}
                    className={`bb-diff-card${difficulty === d.key ? " " + d.selClass : ""}`}
                    onClick={() => setDifficulty(d.key)}
                  >
                    <div className={`bb-diff-badge ${d.badgeClass}`}>
                      {d.key}
                    </div>
                    <div className="bb-diff-title">{d.title}</div>
                    <div className="bb-diff-desc">{d.desc}</div>
                    <div className="bb-diff-dots">
                      {d.dots.map((color, i) => (
                        <div
                          key={i}
                          className="bb-diff-dot"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bb-section-divider">
                <div className="divider-line" />
                <div className="divider-label">
                  <Globe size={13} /> Select Language
                </div>
                <div className="divider-line" />
              </div>

              <div className="bb-lang-grid">
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    className={`bb-lang-card${language === lang.code ? " sel" : ""}`}
                    onClick={() => setLanguage(lang.code)}
                  >
                    <div className="lang-check">
                      <Check size={10} color="#fff" />
                    </div>
                    <div className="lang-flag">{lang.flag}</div>
                    <div className="lang-name">{lang.name}</div>
                    <div className="lang-native">{lang.native}</div>
                  </div>
                ))}
              </div>

              <div className="bb-btn-row">
                <button
                  className="bb-btn bb-btn-ghost"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <button
                  className="bb-btn bb-btn-primary"
                  disabled={!difficulty || !language}
                  onClick={() => setStep(3)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div className="bb-panel-header">
                <div className="bb-panel-eyebrow">Step 3 of 4</div>
                <div className="bb-panel-title">Quiz settings</div>
                <div className="bb-panel-sub">
                  Customize how your quiz runs.
                </div>
              </div>
              <div className="bb-slider-section" style={{ marginBottom: 12 }}>
                <div className="bb-slider-top">
                  <div className="bb-slider-label">Number of questions</div>
                  <div className="bb-slider-val">{questions}</div>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={questions}
                  onChange={(e) => setQuestions(Number(e.target.value))}
                />
                <div className="bb-slider-hints">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>
              <div
                className="bb-slider-section"
                style={{ marginBottom: "1.5rem" }}
              >
                <div className="bb-slider-top">
                  <div className="bb-slider-label">Time per question</div>
                  <div className="bb-slider-val">{timePerQ}s</div>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="10"
                  value={timePerQ}
                  onChange={(e) => setTimePerQ(Number(e.target.value))}
                />
                <div className="bb-slider-hints">
                  <span>10s</span>
                  <span>60s</span>
                  <span>120s</span>
                </div>
              </div>
              <div className="bb-opt-row">
                {OPTIONS.map((o) => (
                  <div
                    key={o.id}
                    className={`bb-opt-card${options[o.id] ? " sel" : ""}`}
                    onClick={() => toggleOption(o.id)}
                  >
                    <div className="bb-opt-icon" style={{ background: o.bg }}>
                      {o.icon}
                    </div>
                    <div>
                      <div className="bb-opt-name">{o.name}</div>
                      <div className="bb-opt-desc">{o.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bb-btn-row">
                <button
                  className="bb-btn bb-btn-ghost"
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
                <button
                  className="bb-btn bb-btn-primary"
                  onClick={() => setStep(4)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div className="bb-panel-header">
                <div className="bb-panel-eyebrow">Step 4 of 4</div>
                <div className="bb-panel-title">Review &amp; start</div>
                <div className="bb-panel-sub">
                  Everything looks good? Let's go!
                </div>
              </div>
              <div className="bb-summary-card">
                <div className="bb-summary-row">
                  <div className="bb-summary-key">Subject / Exam</div>
                  <div className="bb-summary-val accent">{subject || "—"}</div>
                </div>
                <div className="bb-summary-row">
                  <div className="bb-summary-key">Difficulty</div>
                  <div
                    className={`bb-summary-val${diffColorClass ? " " + diffColorClass : ""}`}
                  >
                    {difficulty || "—"}
                  </div>
                </div>
                <div className="bb-summary-row">
                  <div className="bb-summary-key">Language</div>
                  <div className="bb-summary-val accent">
                    {selectedLang ? `${selectedLang.flag} ${selectedLang.name}` : "English"}
                  </div>
                </div>
                <div className="bb-summary-row">
                  <div className="bb-summary-key">Questions</div>
                  <div className="bb-summary-val">{questions} questions</div>
                </div>
                <div className="bb-summary-row">
                  <div className="bb-summary-key">Time per question</div>
                  <div className="bb-summary-val">{timePerQ}s each</div>
                </div>
                <div className="bb-summary-row">
                  <div className="bb-summary-key">Total time (est.)</div>
                  <div className="bb-summary-val teal">~{totalMin} min</div>
                </div>
                <div className="bb-summary-row">
                  <div className="bb-summary-key">Options</div>
                  <div
                    className="bb-summary-val"
                    style={{ fontSize: 12, textAlign: "right", maxWidth: 240 }}
                  >
                    {getOptsLabel()}
                  </div>
                </div>
              </div>
              <div className="bb-est-box">
                <div className="bb-est-icon" style={{ display: "flex", alignItems: "center" }}><Brain size={20} /></div>
                <div className="bb-est-text">
                  <strong>{questions} questions</strong> in{" "}
                  <strong>{difficulty}</strong> mode on{" "}
                  <strong>{subject}</strong>{language !== "en" && selectedLang ? <> in <strong>{selectedLang.name}</strong></> : ""}. Estimated time: ~{totalMin} min.
                  You've got this!
                </div>
              </div>
              <div className="bb-btn-row">
                <button
                  className="bb-btn bb-btn-ghost"
                  onClick={() => setStep(3)}
                >
                  ← Back
                </button>
                <button
                  className="bb-btn bb-btn-start"
                  onClick={() =>
                    navigate("/quiz", {
                      state: {
                        subject,
                        difficulty,
                        questions,
                        timePerQ,
                        options,
                        language,
                      },
                    })
                  }
                >
                  Start Quiz →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
