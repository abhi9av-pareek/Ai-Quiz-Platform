import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, AlertCircle, CheckCircle, BookOpen, Rocket, BarChart3, FileText, Flame, Brain, TrendingUp, TrendingDown, Target, Zap, Award, Lightbulb, ChevronRight } from "lucide-react";
import SuggestionBox from "./common/SuggestionBox";

/* ─── CSS ─── */
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
  .rs-root { font-family: 'DM  Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; transition: background .3s, color .3s; }

  /* NAV */
  .rs-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 56px; border-bottom: 1px solid var(--border); background: rgba(10,11,15,0.97); position: sticky; top: 0; z-index: 100; transition: background .3s; }
  [data-theme="light"] .rs-nav { background: rgba(245,245,250,0.95); }
  .rs-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px; display: flex; align-items: center; gap: 8px; }
  .rs-logo-icon { width: 28px; height: 28px; border-radius: 7px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .rs-logo-icon img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .rs-footer { border-top: 1px solid var(--border); padding: 1rem 2rem; text-align: center; font-size: 11px; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 5px; background: var(--bg); }
  .rs-footer img { width: 14px; height: 14px; border-radius: 3px; }
  .rs-logo span { color: var(--accent2); }
  .rs-nav-right { display: flex; gap: 10px; }

  /* BUTTONS */
  .rs-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; border: none; font-family: 'DM Sans', sans-serif; }
  .rs-btn-primary { background: var(--accent); color: #fff; }
  .rs-btn-primary:hover { background: #9074fd; transform: translateY(-1px); }
  .rs-btn-ghost { background: rgba(255,255,255,0.06); color: var(--text); border: 1px solid var(--border2); }
  [data-theme="light"] .rs-btn-ghost { background: rgba(0,0,0,0.04); }
  .rs-btn-ghost:hover { background: rgba(255,255,255,0.1); }
  .rs-btn-start { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #0A0B0F; font-size: 15px; padding: 13px 32px; }
  .rs-btn-start:hover { opacity: .9; transform: translateY(-1px); }

  /* MAIN */
  .rs-main { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem 5rem; }

  /* HERO SECTION */
  .rs-hero { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; padding: 2.5rem; margin-bottom: 1.5rem; position: relative; overflow: hidden; display: flex; align-items: center; gap: 2.5rem; }
  .rs-hero::before { content: ''; position: absolute; right: -60px; top: -60px; width: 280px; height: 280px; background: radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 70%); pointer-events: none; }
  .rs-hero::after  { content: ''; position: absolute; left: -40px; bottom: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(0,229,192,0.1) 0%, transparent 70%); pointer-events: none; }

  /* SCORE RING */
  .rs-ring-wrap { position: relative; width: 140px; height: 140px; flex-shrink: 0; }
  .rs-ring-wrap svg { transform: rotate(-90deg); }
  .rs-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .rs-ring-pct { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; line-height: 1; }
  .rs-ring-label { font-size: 11px; color: var(--muted); margin-top: 3px; }
  .rs-ring-circle { transition: stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1); }

  .rs-hero-info { flex: 1; }
  .rs-hero-badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 10px; }
  .badge-excellent  { background: rgba(0,229,192,0.15);  color: var(--accent2); border: 1px solid rgba(0,229,192,0.3); }
  .badge-good       { background: rgba(124,92,252,0.15); color: var(--accent);  border: 1px solid rgba(124,92,252,0.3); }
  .badge-average    { background: rgba(255,179,71,0.15); color: var(--amber);   border: 1px solid rgba(255,179,71,0.3); }
  .badge-below      { background: rgba(255,107,107,0.15);color: var(--accent3); border: 1px solid rgba(255,107,107,0.3); }
  .rs-hero-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; line-height: 1.2; margin-bottom: 6px; }
  .rs-hero-title span { color: var(--accent2); }
  .rs-hero-sub { font-size: 14px; color: var(--muted); margin-bottom: 1.25rem; line-height: 1.5; }
  .rs-xp-row { display: flex; align-items: center; gap: 8px; }
  .rs-xp-badge { background: rgba(255,179,71,0.12); border: 1px solid rgba(255,179,71,0.25); border-radius: 20px; padding: 5px 14px; font-size: 13px; font-weight: 600; color: var(--amber); }
  .rs-streak-badge { background: rgba(124,92,252,0.12); border: 1px solid rgba(124,92,252,0.25); border-radius: 20px; padding: 5px 14px; font-size: 13px; font-weight: 600; color: var(--accent); }

  /* STATS GRID */
  .rs-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 1.5rem; }
  .rs-stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem; text-align: center; }
  .rs-stat-val { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; margin-bottom: 4px; }
  .rs-stat-key { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .sv-green  { color: var(--accent2); }
  .sv-red    { color: var(--accent3); }
  .sv-amber  { color: var(--amber); }
  .sv-purple { color: var(--accent); }
  .sv-blue   { color: #3895FF; }

  /* SECTION */
  .rs-section { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
  .rs-section-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; }

  /* TOPIC BARS */
  .rs-topic-row { margin-bottom: 14px; }
  .rs-topic-row:last-child { margin-bottom: 0; }
  .rs-topic-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .rs-topic-name { font-size: 13px; font-weight: 500; }
  .rs-topic-score { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; }
  .rs-bar-track { height: 8px; background: var(--muted2); border-radius: 8px; overflow: hidden; }
  .rs-bar-fill { height: 100%; border-radius: 8px; transition: width 1s cubic-bezier(.4,0,.2,1); }
  .bar-great  { background: var(--accent2); }
  .bar-good   { background: var(--accent); }
  .bar-ok     { background: var(--amber); }
  .bar-weak   { background: var(--accent3); }

  /* SUGGESTIONS */
  .rs-suggestion-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .rs-suggestion-item:last-child { border-bottom: none; }
  .rs-sug-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .sug-warn { background: rgba(255,107,107,0.12); }
  .sug-tip  { background: rgba(124,92,252,0.12); }
  .sug-ok   { background: rgba(0,229,192,0.1); }
  .rs-sug-content strong { font-size: 13px; font-weight: 600; display: block; margin-bottom: 3px; }
  .rs-sug-content span { font-size: 12px; color: var(--muted); line-height: 1.5; }

  /* QUESTION REVIEW */
  .rs-q-item { border: 1px solid var(--border); border-radius: 14px; margin-bottom: 10px; overflow: hidden; transition: border-color .2s; }
  .rs-q-item.correct-q { border-color: rgba(0,229,192,0.25); }
  .rs-q-item.wrong-q   { border-color: rgba(255,107,107,0.25); }
  .rs-q-item.skipped-q { border-color: rgba(255,179,71,0.25); }
  .rs-q-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; background: var(--surface2); }
  .rs-q-status { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
  .qs-correct { background: rgba(0,229,192,0.15);  color: var(--accent2); }
  .qs-wrong   { background: rgba(255,107,107,0.15); color: var(--accent3); }
  .qs-skipped { background: rgba(255,179,71,0.15);  color: var(--amber); }
  .rs-q-text { flex: 1; font-size: 13px; font-weight: 500; line-height: 1.4; }
  .rs-q-chevron { font-size: 12px; color: var(--muted); transition: transform .2s; }
  .rs-q-chevron.open { transform: rotate(180deg); }
  .rs-q-body { padding: 14px 16px; border-top: 1px solid var(--border); background: var(--surface); }
  .rs-q-options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
  .rs-q-opt { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 10px; font-size: 13px; border: 1px solid transparent; }
  .rs-q-opt.opt-correct { background: rgba(0,229,192,0.08);  border-color: rgba(0,229,192,0.3);  color: var(--accent2); }
  .rs-q-opt.opt-wrong   { background: rgba(255,107,107,0.08); border-color: rgba(255,107,107,0.3); color: var(--accent3); }
  .rs-q-opt.opt-normal  { background: rgba(255,255,255,0.03); border-color: var(--border); color: var(--muted); }
  .rs-q-explain { font-size: 12px; color: var(--muted); line-height: 1.6; background: rgba(124,92,252,0.06); border: 1px solid rgba(124,92,252,0.15); border-radius: 10px; padding: 10px 12px; }
  .rs-q-explain strong { color: var(--accent); }

  /* MOTIVATIONAL QUOTE */
  .rs-quote-card { background: linear-gradient(135deg, rgba(124,92,252,0.12), rgba(0,229,192,0.08)); border: 1px solid rgba(124,92,252,0.2); border-radius: 20px; padding: 2rem; text-align: center; margin-bottom: 1.5rem; position: relative; overflow: hidden; }
  .rs-quote-card::before { content: '"'; position: absolute; top: -20px; left: 20px; font-size: 120px; color: rgba(124,92,252,0.08); font-family: 'Syne', sans-serif; font-weight: 800; line-height: 1; pointer-events: none; }
  .rs-quote-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; line-height: 1.5; margin-bottom: 10px; position: relative; }
  .rs-quote-author { font-size: 13px; color: var(--muted); position: relative; }

  /* CTA */
  .rs-cta { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; padding: 2rem; text-align: center; }
  .rs-cta-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .rs-cta-sub { font-size: 14px; color: var(--muted); margin-bottom: 1.5rem; }
  .rs-cta-btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }

  /* MINI CHART — time distribution */
  .rs-time-bars { display: flex; align-items: flex-end; gap: 3px; height: 60px; }
  .rs-time-bar  { flex: 1; border-radius: 4px 4px 0 0; min-width: 6px; transition: height .8s cubic-bezier(.4,0,.2,1); }

  .li-unknown-note { background: rgba(255,255,255,0.03); border: 1px dashed var(--border2); border-radius: 12px; padding: 12px 16px; font-size: 12px; color: var(--muted); line-height: 1.5; text-align: center; }

  @media (max-width: 600px) {
    .li-sw-grid { grid-template-columns: 1fr; }
    .li-body { padding: 1rem; }
    .li-header { padding: 1rem; }
  }

  @keyframes rs-spin { to { transform: rotate(360deg); } }

  /* LOADING */
  .rs-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 14px; }
  .rs-spinner { width: 40px; height: 40px; border: 3px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: rs-spin .8s linear infinite; }

  /* TABS */
  .rs-tabs { display: flex; gap: 4px; background: var(--surface2); padding: 4px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 1.25rem; width: fit-content; }
  .rs-tab { padding: 7px 16px; border-radius: 8px; border: none; background: none; color: var(--muted); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 500; transition: all .2s; }
  .rs-tab.active { background: var(--surface); color: var(--text); border: 1px solid var(--border2); }

  @keyframes rs-fadein { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .rs-fadein { animation: rs-fadein .5s ease forwards; }
  .rs-fadein-2 { animation: rs-fadein .5s .1s ease both; }
  .rs-fadein-3 { animation: rs-fadein .5s .2s ease both; }
  .rs-fadein-4 { animation: rs-fadein .5s .3s ease both; }

  /* ── Light mode fixes ── */
  [data-theme="light"] .rs-btn-ghost { background: rgba(0,0,0,0.04); }

  /* ── MOBILE RESPONSIVE ── */
  @media (max-width: 768px) {
    .rs-nav { padding: 0 1rem; height: 50px; }
    .rs-logo { font-size: 16px; }
    .rs-logo-icon { width: 24px; height: 24px; }
    .rs-main { padding: 1.25rem 1rem 3rem; }

    .rs-hero { flex-direction: column; gap: 1.5rem; padding: 1.5rem; text-align: center; }
    .rs-ring-wrap { width: 110px; height: 110px; }
    .rs-ring-wrap svg { width: 110px; height: 110px; }
    .rs-ring-pct { font-size: 24px; }
    .rs-hero-title { font-size: 20px; }
    .rs-hero-sub { font-size: 13px; }
    .rs-xp-row { justify-content: center; flex-wrap: wrap; }

    .rs-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .rs-stat-val { font-size: 20px; }

    .rs-section { padding: 1.25rem; }
    .rs-section-title { font-size: 14px; }

    .rs-nav-right { gap: 6px; }
    .rs-btn { padding: 8px 16px; font-size: 13px; }

    .rs-q-header { padding: 10px 12px; }
    .rs-q-body { padding: 10px 12px; }
    .rs-q-text { font-size: 12px; }

    .rs-cta { padding: 1.5rem; }
    .rs-cta-title { font-size: 18px; }
    .rs-cta-btns { flex-direction: column; }
    .rs-cta-btns .rs-btn { width: 100%; justify-content: center; }

    .rs-quote-card { padding: 1.5rem; }
    .rs-quote-text { font-size: 15px; }

    .rs-footer { padding: 0.75rem 1rem; }
  }

  @media (max-width: 480px) {
    .rs-nav { padding: 0 0.75rem; }
    .rs-main { padding: 1rem 0.75rem 2.5rem; }
    .rs-hero { padding: 1.25rem; border-radius: 16px; }
    .rs-ring-wrap { width: 90px; height: 90px; }
    .rs-ring-wrap svg { width: 90px; height: 90px; }
    .rs-ring-pct { font-size: 20px; }
    .rs-hero-title { font-size: 18px; }
    .rs-hero-badge { font-size: 10px; padding: 3px 10px; }
    .rs-xp-badge, .rs-streak-badge { font-size: 11px; padding: 4px 10px; }
    .rs-stats-grid { gap: 6px; }
    .rs-stat-card { padding: 0.75rem; }
    .rs-stat-val { font-size: 18px; }
    .rs-stat-key { font-size: 10px; }
    .rs-tabs { flex-wrap: wrap; }
    .rs-tab { font-size: 11px; padding: 5px 10px; }
  }
`;

/* ─── Data ─── */
const MOTIVATIONAL_QUOTES = [
  {
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
  },
  { text: "Every master was once a disaster.", author: "T. Harv Eker" },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
  },
  {
    text: "Education is the most powerful weapon you can use to change the world.",
    author: "Nelson Mandela",
  },
  {
    text: "The more that you read, the more things you will know.",
    author: "Dr. Seuss",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
];

const LETTERS = ["A", "B", "C", "D"];
const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54

/* ─── Helpers ─── */
const getResultLabel = (score) => {
  if (score >= 90)
    return {
      label: "Excellent",
      cls: "badge-excellent",
      color: "#00E5C0",
      msg: "Outstanding performance! You've mastered this topic.",
    };
  if (score >= 75)
    return {
      label: "Good",
      cls: "badge-good",
      color: "#7C5CFC",
      msg: "Great work! A little more practice and you'll ace it.",
    };
  if (score >= 60)
    return {
      label: "Average",
      cls: "badge-average",
      color: "#FFB347",
      msg: "Decent attempt. Focus on the weak topics below.",
    };
  if (score >= 40)
    return {
      label: "Below Average",
      cls: "badge-below",
      color: "#FF6B6B",
      msg: "Keep going — every attempt makes you stronger.",
    };
  return {
    label: "Needs Work",
    cls: "badge-below",
    color: "#FF6B6B",
    msg: "Don't give up! Review the topics and try again.",
  };
};

const getBarClass = (pct) => {
  if (pct >= 80) return "bar-great";
  if (pct >= 60) return "bar-good";
  if (pct >= 40) return "bar-ok";
  return "bar-weak";
};

const formatTime = (secs) => {
  if (!secs) return "—";
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
};

const generateSuggestions = (topicStats, scorePercent) => {
  const suggestions = [];

  /* weak topics */
  topicStats
    .filter((t) => t.pct < 60)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .forEach((t) => {
      suggestions.push({
        icon: t.pct < 40 ? <AlertTriangle size={16} /> : <AlertCircle size={16} />,
        cls: t.pct < 40 ? "sug-warn" : "sug-tip",
        title: `Revise "${t.topic}"`,
        text:
          t.pct < 40
            ? `You scored only ${t.pct}% on this topic. Start from fundamentals and watch a tutorial before your next attempt.`
            : `You scored ${t.pct}% on this topic. Solve 10 practice questions to build confidence.`,
      });
    });

  /* strong topics */
  topicStats
    .filter((t) => t.pct >= 80)
    .slice(0, 1)
    .forEach((t) => {
      suggestions.push({
        icon: <CheckCircle size={16} />,
        cls: "sug-ok",
        title: `Strong in "${t.topic}"`,
        text: `You nailed this topic with ${t.pct}%. Keep it sharp by attempting harder difficulty next time.`,
      });
    });

  /* overall suggestion */
  if (scorePercent < 50) {
    suggestions.push({
      icon: <BookOpen size={16} />,
      cls: "sug-tip",
      title: "Review Strategy",
      text: "Try switching to Easy difficulty first to build a strong foundation, then gradually increase.",
    });
  } else if (scorePercent >= 85) {
    suggestions.push({
      icon: <Rocket size={16} />,
      cls: "sug-ok",
      title: "Challenge Yourself",
      text: "You're performing well! Try Hard difficulty or add more subjects to push your limits.",
    });
  }

  return suggestions;
};



export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  const { result, questions = [], config = {} } = location.state || {};

  const [expandedQ, setExpandedQ] = useState(null);
  const [reviewTab, setReviewTab] = useState("all");
  const [ringOffset, setRingOffset] = useState(CIRCUMFERENCE);
  const [barsReady, setBarsReady] = useState(false);
  const animTriggered = useRef(false);

  /* redirect if no data */
  useEffect(() => {
    if (!result) {
      navigate("/dashboard");
      return;
    }
    /* trigger ring + bar animations */
    const t = setTimeout(() => {
      if (!animTriggered.current) {
        animTriggered.current = true;
        const pct = result.scorePercent || 0;
        const offset = CIRCUMFERENCE * (1 - pct / 100);
        setRingOffset(offset);
        setBarsReady(true);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [result, navigate]);

  if (!result) return null;

  /* ── derived data ── */
  const scorePercent = result.scorePercent ?? 0;
  const totalCorrect = result.totalCorrect ?? 0;
  const totalWrong = result.totalWrong ?? 0;
  const totalSkipped = result.totalSkipped ?? 0;
  const xpEarned = result.totalXpEarned ?? result.xpEarned ?? 0;
  const streakBonus = result.streakBonus ?? 0;
  const newStreak = result.newStreak ?? 0;
  const totalQ = config.totalQ ?? questions.length;
  const subject = config.subject;
  const difficulty = config.difficulty ?? "Medium";

  const resultInfo = getResultLabel(scorePercent);
  const ringColor = resultInfo.color;

  /* per-topic stats */
  const topicMap = {};
  questions.forEach((q) => {
    const t = q.topic || "General";
    if (!topicMap[t]) topicMap[t] = { topic: t, correct: 0, total: 0 };
    topicMap[t].total += 1;
    if (q.isCorrect) topicMap[t].correct += 1;
  });
  const topicStats = Object.values(topicMap)
    .map((t) => ({ ...t, pct: Math.round((t.correct / t.total) * 100) }))
    .sort((a, b) => a.pct - b.pct);

  const suggestions = generateSuggestions(topicStats, scorePercent);

  /* filtered review questions */
  const filteredQs = questions.filter((q) => {
    if (reviewTab === "correct") return q.isCorrect;
    if (reviewTab === "wrong") return !q.isCorrect && q.userAnswer !== null;
    if (reviewTab === "skipped") return q.userAnswer === null;
    return true;
  });

  /* random motivational quote */
  const quote =
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  /* avg time per question */
  const avgTime =
    questions.length > 0
      ? Math.round(
          questions.reduce((s, q) => s + (q.timeTaken || 0), 0) /
            questions.length,
        )
      : 0;

  return (
    <>
      <style>{css}</style>
      <div className="rs-root">
        {/* NAV */}
        <nav className="rs-nav">
          <div className="rs-logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            <div className="rs-logo-icon"><img src="/favicon-32.png" alt="Gyantra" /></div>
            Gyan<span>tra</span>
          </div>
          <div className="rs-nav-right">
            <button
              className="rs-btn rs-btn-ghost"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            <button
              className="rs-btn rs-btn-primary"
              onClick={() => navigate("/QuizSetup")}
            >
              New Quiz
            </button>
          </div>
        </nav>

        <main className="rs-main">
          {/* ── HERO ── */}
          <div className="rs-hero rs-fadein">
            {/* SCORE RING */}
            <div className="rs-ring-wrap">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke="#3A394A"
                  strokeWidth="10"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="10"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  className="rs-ring-circle"
                />
              </svg>
              <div className="rs-ring-center">
                <div className="rs-ring-pct" style={{ color: ringColor }}>
                  {scorePercent}%
                </div>
                <div className="rs-ring-label">Score</div>
              </div>
            </div>

            {/* INFO */}
            <div className="rs-hero-info">
              <div className={`rs-hero-badge ${resultInfo.cls}`}>
                {resultInfo.label}
              </div>
              <div className="rs-hero-title">
                Quiz Complete!{" "}
                <span>
                  {Array.isArray(subject) ? subject.join(", ") : subject}
                </span>
              </div>
              <div className="rs-hero-sub">
                {resultInfo.msg} · {difficulty} difficulty
              </div>
              <div className="rs-xp-row">
                <div className="rs-xp-badge">+{xpEarned} XP earned</div>
                {streakBonus > 0 && (
                  <div className="rs-streak-badge">
                    +{streakBonus} streak bonus
                  </div>
                )}
                {newStreak > 0 && (
                  <div className="rs-streak-badge">
                    <Flame size={14} /> {newStreak} day streak
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── STATS GRID ── */}
          <div className="rs-stats-grid rs-fadein-2">
            <div className="rs-stat-card">
              <div className="rs-stat-val sv-green">{totalCorrect}</div>
              <div className="rs-stat-key">Correct</div>
            </div>
            <div className="rs-stat-card">
              <div className="rs-stat-val sv-red">{totalWrong}</div>
              <div className="rs-stat-key">Wrong</div>
            </div>
            <div className="rs-stat-card">
              <div className="rs-stat-val sv-amber">{totalSkipped}</div>
              <div className="rs-stat-key">Skipped</div>
            </div>
            <div className="rs-stat-card">
              <div className="rs-stat-val sv-blue">{formatTime(avgTime)}</div>
              <div className="rs-stat-key">Avg / Question</div>
            </div>
          </div>

          {/* ── TOPIC PERFORMANCE ── */}
          {topicStats.length > 0 && (
            <div className="rs-section rs-fadein-3">
              <div className="rs-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={16} /> Topic Performance</div>
              {topicStats.map((t) => (
                <div key={t.topic} className="rs-topic-row">
                  <div className="rs-topic-header">
                    <div className="rs-topic-name">{t.topic}</div>
                    <div
                      className="rs-topic-score"
                      style={{
                        color:
                          t.pct >= 80
                            ? "var(--accent2)"
                            : t.pct >= 60
                              ? "var(--accent)"
                              : t.pct >= 40
                                ? "var(--amber)"
                                : "var(--accent3)",
                      }}
                    >
                      {t.correct}/{t.total} · {t.pct}%
                    </div>
                  </div>
                  <div className="rs-bar-track">
                    <div
                      className={`rs-bar-fill ${getBarClass(t.pct)}`}
                      style={{ width: barsReady ? `${t.pct}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}



          {/* ── SUGGESTIONS ── */}
          {suggestions.length > 0 && (
            <div className="rs-section rs-fadein-3">
              <div className="rs-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><Rocket size={16} /> What to do next</div>
              {suggestions.map((s, i) => (
                <div key={i} className="rs-suggestion-item">
                  <div className={`rs-sug-icon ${s.cls}`}>{s.icon}</div>
                  <div className="rs-sug-content">
                    <strong>{s.title}</strong>
                    <span>{s.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── QUESTION REVIEW ── */}
          {questions.length > 0 && (
            <div className="rs-section rs-fadein-4">
              <div className="rs-section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><FileText size={16} /> Question Review</div>
              <div className="rs-tabs">
                {["all", "correct", "wrong", "skipped"].map((tab) => (
                  <button
                    key={tab}
                    className={`rs-tab${reviewTab === tab ? " active" : ""}`}
                    onClick={() => setReviewTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === "all" && ` (${questions.length})`}
                    {tab === "correct" &&
                      ` (${questions.filter((q) => q.isCorrect).length})`}
                    {tab === "wrong" &&
                      ` (${questions.filter((q) => !q.isCorrect && q.userAnswer !== null).length})`}
                    {tab === "skipped" &&
                      ` (${questions.filter((q) => q.userAnswer === null).length})`}
                  </button>
                ))}
              </div>

              {filteredQs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1.5rem",
                    color: "var(--muted)",
                    fontSize: 13,
                  }}
                >
                  No questions in this category
                </div>
              ) : (
                filteredQs.map((q, i) => {
                  const isSkipped = q.userAnswer === null;
                  const statusCls = q.isCorrect
                    ? "correct-q"
                    : isSkipped
                      ? "skipped-q"
                      : "wrong-q";
                  const statusBadge = q.isCorrect
                    ? "qs-correct"
                    : isSkipped
                      ? "qs-skipped"
                      : "qs-wrong";
                  const isOpen = expandedQ === i;

                  return (
                    <div key={i} className={`rs-q-item ${statusCls}`}>
                      <div
                        className="rs-q-header"
                        onClick={() => setExpandedQ(isOpen ? null : i)}
                      >
                        <div className={`rs-q-status ${statusBadge}`}>
                          {q.isCorrect ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : isSkipped ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          )}
                        </div>
                        <div className="rs-q-text">{q.questionText}</div>
                        <div className={`rs-q-chevron${isOpen ? " open" : ""}`}>
                          ▼
                        </div>
                      </div>

                      {isOpen && (
                        <div className="rs-q-body">
                          <div className="rs-q-options">
                            {(q.options || []).map((opt, j) => {
                              const isCorrectOpt = opt === q.correctAnswer;
                              const isUserOpt = opt === q.userAnswer;
                              let cls = "opt-normal";
                              if (isCorrectOpt) cls = "opt-correct";
                              else if (isUserOpt && !q.isCorrect)
                                cls = "opt-wrong";
                              return (
                                <div key={j} className={`rs-q-opt ${cls}`}>
                                  <span
                                    style={{
                                      fontFamily: "'Syne',sans-serif",
                                      fontWeight: 700,
                                      fontSize: 12,
                                    }}
                                  >
                                    {LETTERS[j]}
                                  </span>
                                  <span>{opt}</span>
                                  {isCorrectOpt && (
                                    <span style={{ marginLeft: "auto", display: "inline-flex" }}>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </span>
                                  )}
                                  {isUserOpt && !q.isCorrect && (
                                    <span style={{ marginLeft: "auto", display: "inline-flex" }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {q.explanation && (
                            <div className="rs-q-explain">
                              <strong>Explanation: </strong>
                              {q.explanation}
                            </div>
                          )}
                          {q.timeTaken > 0 && (
                            <div
                              style={{
                                marginTop: 8,
                                fontSize: 11,
                                color: "var(--muted)",
                              }}
                            >
                              Time taken: {q.timeTaken}s
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── FEEDBACK BOX (AFTER TEST) ── */}
          <SuggestionBox 
            context={location.state?.scanId ? "GyanS Test Completion" : "Quiz Test Completion"} 
            title={location.state?.scanId ? "Feedback on this GyanS Test" : "Feedback on this Quiz Test"} 
            subtitle="How was your test experience? Tell us what you think."
          />

          {/* ── MOTIVATIONAL QUOTE ── */}
          <div className="rs-quote-card rs-fadein-4">
            <div className="rs-quote-text">"{quote.text}"</div>
            <div className="rs-quote-author">— {quote.author}</div>
          </div>

          {/* ── CTA ── */}
          <div className="rs-cta rs-fadein-4">
            <div className="rs-cta-title">Ready for another round?</div>
            <div className="rs-cta-sub">
              {scorePercent >= 80
                ? "You're on fire! Keep the momentum going."
                : "Every attempt makes you sharper. Let's go again!"}
            </div>
            <div className="rs-cta-btns">
              <button
                className="rs-btn rs-btn-ghost"
                onClick={() => navigate("/dashboard")}
              >
                View Dashboard
              </button>
              <button
                className="rs-btn rs-btn-primary"
                onClick={() =>
                  navigate("/QuizSetup", {
                    state: {
                      prefilledSubject: Array.isArray(subject)
                        ? subject[0]
                        : subject,
                    },
                  })
                }
              >
                Retry Same Subject
              </button>
              <button
                className="rs-btn rs-btn-start"
                onClick={() => navigate("/QuizSetup")}
              >
                New Quiz
              </button>
            </div>
          </div>
        </main>

        <footer className="rs-footer">
          <img src="/favicon-32.png" alt="" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }} />
          © {new Date().getFullYear()} Gyantra. All rights reserved.
        </footer>
      </div>
    </>
  );
}
