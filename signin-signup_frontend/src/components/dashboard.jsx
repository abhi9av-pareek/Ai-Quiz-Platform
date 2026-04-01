import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── CSS ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bb-bg: #0A0B0F; --bb-surface: #111318; --bb-surface2: #181B23;
    --bb-border: rgba(255,255,255,0.07); --bb-border2: rgba(255,255,255,0.12);
    --bb-accent: #7C5CFC; --bb-accent2: #00E5C0; --bb-accent3: #FF6B6B;
    --bb-amber: #FFB347; --bb-text: #F0EFF8; --bb-muted: #7B7A8C; --bb-muted2: #4A495A;
  }
  .bb-root { font-family: 'DM Sans', sans-serif; background: var(--bb-bg); color: var(--bb-text); min-height: 100vh; }

  /* NAV */
  .bb-nav { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; border-bottom: 1px solid var(--bb-border); background: rgba(10,11,15,0.95); position: sticky; top: 0; z-index: 100; }
  .bb-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; }
  .bb-logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, var(--bb-accent), var(--bb-accent2)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .bb-logo span { color: var(--bb-accent2); }
  .bb-nav-links { display: flex; gap: 2rem; list-style: none; }
  .bb-nav-links a { font-size: 14px; color: var(--bb-muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
  .bb-nav-links a:hover { color: var(--bb-text); }
  .bb-nav-links a.active { color: var(--bb-accent2); }
  .bb-nav-right { display: flex; align-items: center; gap: 12px; }
  .bb-streak { display: flex; align-items: center; gap: 6px; background: rgba(255,179,71,0.12); border: 1px solid rgba(255,179,71,0.25); border-radius: 20px; padding: 5px 12px; font-size: 13px; font-weight: 500; color: var(--bb-amber); }
  .bb-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--bb-accent), #FF6B6B); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; }

  /* MAIN */
  .bb-main { padding: 2rem 2rem 4rem; max-width: 1200px; margin: 0 auto; }

  /* LOADING */
  .bb-loading { display: flex; align-items: center; justify-content: center; height: 60vh; font-size: 15px; color: var(--bb-muted); gap: 10px; }
  .bb-spinner { width: 20px; height: 20px; border: 2px solid var(--bb-border2); border-top-color: var(--bb-accent); border-radius: 50%; animation: bb-spin 0.7s linear infinite; }

  /* HERO */
  .bb-hero { background: var(--bb-surface); border: 1px solid var(--bb-border2); border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: space-between; }
  .bb-hero::before { content: ''; position: absolute; right: -80px; top: -80px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 70%); pointer-events: none; }
  .bb-hero::after { content: ''; position: absolute; right: 80px; bottom: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(0,229,192,0.12) 0%, transparent 70%); pointer-events: none; }
  .bb-hero-text h1 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; line-height: 1.3; margin-bottom: 8px; }
  .bb-hero-text h1 span { color: var(--bb-accent2); }
  .bb-hero-text p { color: var(--bb-muted); font-size: 15px; margin-bottom: 1.5rem; max-width: 360px; }
  .bb-hero-stats { display: flex; gap: 2rem; margin-bottom: 1.5rem; }
  .bb-hero-stat label { font-size: 11px; color: var(--bb-muted); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 2px; }
  .bb-hero-stat span { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; }
  .bb-hero-stat .accent  { color: var(--bb-accent2); }
  .bb-hero-stat .accent2 { color: var(--bb-accent); }
  .bb-level-badge { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; background: rgba(124,92,252,0.15); color: var(--bb-accent); border: 1px solid rgba(124,92,252,0.25); margin-bottom: 1rem; }
  .bb-hero-visual { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .bb-brain-orb { width: 140px; height: 140px; border-radius: 50%; background: conic-gradient(from 0deg, var(--bb-accent), var(--bb-accent2), #FF6B6B, var(--bb-accent)); padding: 3px; animation: bb-spin 8s linear infinite; }
  @keyframes bb-spin { to { transform: rotate(360deg); } }
  .bb-brain-inner { width: 100%; height: 100%; border-radius: 50%; background: var(--bb-surface); display: flex; align-items: center; justify-content: center; font-size: 52px; }

  /* BUTTONS */
  .bb-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; font-family: 'DM Sans', sans-serif; }
  .bb-btn-primary { background: var(--bb-accent); color: #fff; }
  .bb-btn-primary:hover { background: #9074fd; transform: translateY(-1px); }
  .bb-btn-ghost { background: rgba(255,255,255,0.06); color: var(--bb-text); border: 1px solid var(--bb-border2); }
  .bb-btn-ghost:hover { background: rgba(255,255,255,0.1); }

  /* SECTION HEADER */
  .bb-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .bb-section-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
  .bb-see-all { font-size: 13px; color: var(--bb-accent2); cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; font-weight: 500; }

  /* QUICK ACTIONS */
  .bb-quick-row { display: flex; gap: 10px; margin-bottom: 2rem; }
  .bb-quick-btn { flex: 1; background: var(--bb-surface); border: 1px solid var(--bb-border); border-radius: 12px; padding: 12px; cursor: pointer; text-align: center; transition: all 0.2s; }
  .bb-quick-btn:hover { border-color: var(--bb-border2); background: var(--bb-surface2); transform: translateY(-2px); }
  .bb-quick-btn .qb-icon { font-size: 20px; margin-bottom: 4px; }
  .bb-quick-btn .qb-label { font-size: 12px; color: var(--bb-muted); font-weight: 500; }

  /* SUBJECT CARDS */
  .bb-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 2rem; }
  .bb-subject-card { background: var(--bb-surface); border: 1px solid var(--bb-border); border-radius: 16px; padding: 1.25rem; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden; }
  .bb-subject-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0; opacity: 0; transition: opacity 0.2s; }
  .bb-subject-card:hover { border-color: var(--bb-border2); transform: translateY(-3px); background: var(--bb-surface2); }
  .bb-subject-card:hover::before { opacity: 1; }
  .bb-subject-card.c-purple::before { background: var(--bb-accent); }
  .bb-subject-card.c-teal::before   { background: var(--bb-accent2); }
  .bb-subject-card.c-coral::before  { background: var(--bb-accent3); }
  .bb-subject-card.c-amber::before  { background: var(--bb-amber); }
  .bb-subject-card.c-blue::before   { background: #3895FF; }
  .bb-subject-card.c-pink::before   { background: #FF64B4; }
  .bb-subject-card .s-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 12px; }
  .icon-purple { background: rgba(124,92,252,0.15); }
  .icon-teal   { background: rgba(0,229,192,0.12); }
  .icon-coral  { background: rgba(255,107,107,0.13); }
  .icon-amber  { background: rgba(255,179,71,0.13); }
  .icon-blue   { background: rgba(56,149,255,0.13); }
  .icon-pink   { background: rgba(255,100,180,0.13); }
  .bb-subject-card h3 { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .bb-subject-card p { font-size: 12px; color: var(--bb-muted); margin-bottom: 14px; }
  .bb-progress-bar { height: 4px; background: rgba(255,255,255,0.07); border-radius: 4px; margin-bottom: 6px; }
  .bb-progress-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
  .fill-purple { background: var(--bb-accent); }
  .fill-teal   { background: var(--bb-accent2); }
  .fill-coral  { background: var(--bb-accent3); }
  .fill-amber  { background: var(--bb-amber); }
  .fill-blue   { background: #3895FF; }
  .fill-pink   { background: #FF64B4; }
  .bb-card-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--bb-muted); }
  .bb-card-meta strong { color: var(--bb-text); }

  /* EMPTY STATE */
  .bb-empty { text-align: center; padding: 2rem; color: var(--bb-muted); font-size: 13px; }

  /* WEAK TOPICS */
  .bb-weak-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 2rem; }
  .bb-weak-item { background: var(--bb-surface); border: 1px solid var(--bb-border); border-radius: 14px; padding: 1rem 1.25rem; display: flex; align-items: flex-start; gap: 12px; }
  .bb-weak-score { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; min-width: 48px; text-align: center; padding: 6px 0; border-radius: 10px; }
  .weak-red    { background: rgba(255,107,107,0.12); color: var(--bb-accent3); }
  .weak-amber  { background: rgba(255,179,71,0.12);  color: var(--bb-amber); }
  .weak-yellow { background: rgba(255,220,50,0.12);  color: #FFE333; }
  .bb-weak-info { flex: 1; }
  .bb-weak-info strong { font-size: 13px; font-weight: 600; display: block; margin-bottom: 2px; }
  .bb-weak-info .bb-weak-subject { font-size: 11px; color: var(--bb-accent2); margin-bottom: 4px; display: block; }
  .bb-weak-info .bb-weak-suggestion { font-size: 12px; color: var(--bb-muted); line-height: 1.5; }

  /* BOTTOM GRID */
  .bb-bottom-grid { display: grid; grid-template-columns: 1fr 320px; gap: 14px; }
  .bb-panel { background: var(--bb-surface); border: 1px solid var(--bb-border); border-radius: 16px; padding: 1.25rem; }

  /* RECENT ACTIVITY */
  .bb-activity-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--bb-border); }
  .bb-activity-item:last-child { border-bottom: none; }
  .bb-activity-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .bb-activity-info { flex: 1; }
  .bb-activity-info strong { font-size: 13px; font-weight: 500; display: block; margin-bottom: 2px; }
  .bb-activity-info span { font-size: 12px; color: var(--bb-muted); }
  .bb-activity-score { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; padding: 4px 10px; border-radius: 8px; min-width: 48px; text-align: center; }
  .score-great { background: rgba(0,229,192,0.12);  color: var(--bb-accent2); }
  .score-good  { background: rgba(124,92,252,0.12); color: var(--bb-accent); }
  .score-ok    { background: rgba(255,179,71,0.12); color: var(--bb-amber); }
  .score-low   { background: rgba(255,107,107,0.12); color: var(--bb-accent3); }

  /* TABS */
  .bb-tabs { display: flex; gap: 4px; background: var(--bb-surface2); padding: 4px; border-radius: 10px; border: 1px solid var(--bb-border); }
  .bb-tab { flex: 1; padding: 7px; border-radius: 8px; border: none; background: none; color: var(--bb-muted); font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 500; transition: all 0.2s; }
  .bb-tab.active { background: var(--bb-surface); color: var(--bb-text); border: 1px solid var(--bb-border2); }

  /* LEADERBOARD */
  .bb-lb-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--bb-border); }
  .bb-lb-item:last-child { border-bottom: none; }
  .bb-lb-rank { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; width: 24px; text-align: center; color: var(--bb-muted); }
  .bb-lb-rank.gold   { color: #FFD700; }
  .bb-lb-rank.silver { color: #C0C0C0; }
  .bb-lb-rank.bronze { color: #CD7F32; }
  .bb-lb-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
  .bb-lb-info { flex: 1; }
  .bb-lb-info strong { font-size: 13px; font-weight: 500; display: block; }
  .bb-lb-info span { font-size: 11px; color: var(--bb-muted); }
  .bb-lb-pts { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: var(--bb-accent2); }
  .bb-you-badge { font-size: 10px; background: rgba(124,92,252,0.2); color: var(--bb-accent); border: 1px solid rgba(124,92,252,0.3); border-radius: 6px; padding: 1px 6px; margin-left: 4px; }
  .bb-lb-you-row { background: rgba(124,92,252,0.05); border-radius: 10px; padding: 10px 8px; }

  /* SIDEBAR */
  .bb-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
  .bb-sidebar { position: fixed; top: 0; right: 0; height: 100%; width: 320px; background: var(--bb-surface); border-left: 1px solid var(--bb-border); z-index: 50; transition: transform 0.3s; }
  .bb-sidebar.open   { transform: translateX(0); }
  .bb-sidebar.closed { transform: translateX(100%); }
  .bb-sidebar-header { padding: 1.25rem; border-bottom: 1px solid var(--bb-border); display: flex; justify-content: space-between; align-items: center; }
  .bb-sidebar-close { background: none; border: none; color: var(--bb-muted); font-size: 16px; cursor: pointer; }
  .bb-sidebar-user { padding: 1.25rem; border-bottom: 1px solid var(--bb-border); }
  .bb-sidebar-menu { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; font-size: 14px; }
  .bb-sidebar-menu div { cursor: pointer; transition: color 0.2s; }
  .bb-sidebar-menu div:hover { color: var(--bb-accent2); }
  .bb-sidebar-menu .logout:hover { color: var(--bb-accent3); }
`;

/* ─── Subject color/icon config ─── */
const SUBJECT_CONFIG = {
  Mathematics: {
    icon: "✦",
    color: "purple",
    fill: "fill-purple",
    iconCls: "icon-purple",
  },
  Physics: {
    icon: "⚛",
    color: "teal",
    fill: "fill-teal",
    iconCls: "icon-teal",
  },
  Chemistry: {
    icon: "⚗",
    color: "coral",
    fill: "fill-coral",
    iconCls: "icon-coral",
  },
  Biology: {
    icon: "🌿",
    color: "amber",
    fill: "fill-amber",
    iconCls: "icon-amber",
  },
  "Comp. Science": {
    icon: "💻",
    color: "blue",
    fill: "fill-blue",
    iconCls: "icon-blue",
  },
  English: {
    icon: "✍",
    color: "pink",
    fill: "fill-pink",
    iconCls: "icon-pink",
  },
};
const DEFAULT_CONFIG = {
  icon: "📚",
  color: "purple",
  fill: "fill-purple",
  iconCls: "icon-purple",
};

/* ─── Helpers ─── */
const getScoreClass = (percent) => {
  if (percent >= 90) return "score-great";
  if (percent >= 75) return "score-good";
  if (percent >= 50) return "score-ok";
  return "score-low";
};

const getWeakScoreClass = (avg) => {
  if (avg < 30) return "weak-red";
  if (avg < 50) return "weak-amber";
  return "weak-yellow";
};

const formatTimeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 172800) return "Yesterday";
  return new Date(dateStr).toLocaleDateString();
};

/* ─── Static leaderboard top 3 (replace with real API later) ─── */
const TOP3 = [
  {
    rank: "1",
    rankCls: "gold",
    initials: "PK",
    avatarStyle: { background: "rgba(255,215,0,0.15)", color: "#FFD700" },
    name: "Priya K.",
    subjects: "Biology, Math",
    pts: "9,240",
    isYou: false,
  },
  {
    rank: "2",
    rankCls: "silver",
    initials: "RS",
    avatarStyle: { background: "rgba(192,192,192,0.15)", color: "#C0C0C0" },
    name: "Rohan S.",
    subjects: "Physics, CS",
    pts: "8,890",
    isYou: false,
  },
  {
    rank: "3",
    rankCls: "bronze",
    initials: "NM",
    avatarStyle: { background: "rgba(205,127,50,0.15)", color: "#CD7F32" },
    name: "Neha M.",
    subjects: "Chemistry",
    pts: "8,120",
    isYou: false,
  },
];

/* ════════════════════════════════════════════════
   DASHBOARD COMPONENT
════════════════════════════════════════════════ */
function Dashboard() {
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const [user, setUser] = useState({ name: "User", streak: 0, email: "" });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [showWeakTopics, setShowWeakTopics] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        name: parsedUser.name || "User",
        email: parsedUser.email || "",
        streak: parsedUser.streak || 0,
      });
    }

    fetchDashboard(token);
  }, [navigate]);

  const fetchDashboard = async (token) => {
    try {
      const res = await fetch("/api/quiz/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDashboard(data.dashboard);
        setUser((prev) => ({ ...prev, streak: data.dashboard.streak }));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleRandomQuiz = () => {
    const subject = dashboard?.randomQuizSubject || "Mathematics";
    navigate("/QuizSetup", { state: { prefilledSubject: subject } });
  };

  /* ── derived data ── */
  const recentAll = dashboard?.recentActivity || [];
  const recentToday = recentAll.filter(
    (q) => Date.now() - new Date(q.completedAt) < 86400000,
  );
  const activityList = activeTab === "today" ? recentToday : recentAll;
  const subjectCards = dashboard?.subjectProgress || [];
  const weakTopics = dashboard?.weakTopics || [];

  const xp = dashboard?.xp ?? 0;
  const accuracy = dashboard?.accuracy ?? 0;
  const rank = dashboard?.rank ?? "—";
  const level = dashboard?.level ?? "";

  /* user's leaderboard row built from real data */
  const userLbRow = {
    rank: String(rank),
    rankCls: "you",
    initials: user.name[0] + (user.name.split(" ")[1]?.[0] || ""),
    avatarStyle: {
      background: "linear-gradient(135deg,#7C5CFC,#FF6B6B)",
      color: "#fff",
    },
    name: "You",
    subjects: dashboard?.preferences?.subjects?.join(", ") || "",
    pts: xp.toLocaleString(),
    isYou: true,
  };

  const fullLeaderboard = [...TOP3, userLbRow].sort(
    (a, b) => parseInt(a.rank) - parseInt(b.rank),
  );

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <>
      <style>{css}</style>
      <div className="bb-root">
        {/* NAV */}
        <nav className="bb-nav">
          <div className="bb-logo">
            <div className="bb-logo-icon">🧠</div>
            Brain<span>Byte</span>
          </div>
          <ul className="bb-nav-links">
            <li>
              <a className="active">Dashboard</a>
            </li>
            <li>
              <a>Practice</a>
            </li>
            <li>
              <a>Results</a>
            </li>
            <li>
              <a>Analytics</a>
            </li>
          </ul>
          <div className="bb-nav-right">
            <div className="bb-streak">🔥 {user.streak} day streak</div>
            <div className="bb-avatar" onClick={() => setOpenProfile(true)}>
              {user.name[0]}
            </div>
          </div>
        </nav>

        {/* LOADING */}
        {loading ? (
          <div className="bb-loading">
            <div className="bb-spinner" />
            Loading your dashboard...
          </div>
        ) : (
          <main className="bb-main">
            {/* ── HERO ── */}
            <div className="bb-hero">
              <div className="bb-hero-text">
                {level && <div className="bb-level-badge">{level}</div>}
                <h1>
                  Welcome back, <span>{user.name}!</span> 🫡
                </h1>
                <p>
                  {recentToday.length > 0
                    ? `${recentToday.length} quiz${recentToday.length > 1 ? "zes" : ""} completed today. Keep pushing!`
                    : "Ready to start today? Pick a subject and jump in!"}
                </p>
                {/* REAL stats — update after every quiz submission */}
                <div className="bb-hero-stats">
                  <div className="bb-hero-stat">
                    <label>XP Points</label>
                    <span className="accent">{xp.toLocaleString()}</span>
                  </div>
                  <div className="bb-hero-stat">
                    <label>Accuracy</label>
                    <span className="accent2">{accuracy}%</span>
                  </div>
                  <div className="bb-hero-stat">
                    <label>Rank</label>
                    <span>#{rank}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="bb-btn bb-btn-primary"
                    onClick={() => navigate("/QuizSetup")}
                  >
                    Start Quiz
                  </button>
                  <button
                    className="bb-btn bb-btn-ghost"
                    onClick={() => navigate("/results/history")}
                  >
                    My Results
                  </button>
                </div>
              </div>
              <div className="bb-hero-visual">
                <div className="bb-brain-orb">
                  <div className="bb-brain-inner">🧠</div>
                </div>
              </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="bb-quick-row">
              <div className="bb-quick-btn" onClick={handleRandomQuiz}>
                <div className="qb-icon">🎲</div>
                <div className="qb-label">Random Quiz</div>
              </div>
              <div
                className="bb-quick-btn"
                onClick={() => setShowWeakTopics((p) => !p)}
              >
                <div className="qb-icon">🎯</div>
                <div className="qb-label">Weak Topics</div>
              </div>
              <div
                className="bb-quick-btn"
                onClick={() => navigate("/bookmarks")}
              >
                <div className="qb-icon">🔖</div>
                <div className="qb-label">Bookmarks</div>
              </div>
              <div
                className="bb-quick-btn"
                onClick={() => alert("Challenge feature coming soon!")}
              >
                <div className="qb-icon">👥</div>
                <div className="qb-label">Challenge</div>
              </div>
            </div>

            {/* ── WEAK TOPICS (toggle panel) ── */}
            {showWeakTopics && (
              <div style={{ marginBottom: "2rem" }}>
                <div className="bb-section-header">
                  <h2 className="bb-section-title">Weak Topics</h2>
                  <button
                    className="bb-see-all"
                    onClick={() => setShowWeakTopics(false)}
                  >
                    Close
                  </button>
                </div>
                {weakTopics.length === 0 ? (
                  <div className="bb-empty">
                    No weak topics yet — complete a few quizzes and we will
                    track them here.
                  </div>
                ) : (
                  <div className="bb-weak-list">
                    {[...weakTopics]
                      .sort((a, b) => a.avgScore - b.avgScore) // worst first
                      .map((wt, i) => (
                        <div key={i} className="bb-weak-item">
                          <div
                            className={`bb-weak-score ${getWeakScoreClass(wt.avgScore)}`}
                          >
                            {wt.avgScore}%
                          </div>
                          <div className="bb-weak-info">
                            <strong>{wt.topic}</strong>
                            <span className="bb-weak-subject">
                              {wt.subject}
                            </span>
                            <span className="bb-weak-suggestion">
                              {wt.suggestion}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ── YOUR SUBJECTS (real — from quiz history) ── */}
            <div className="bb-section-header">
              <h2 className="bb-section-title">Your Subjects</h2>
              <button
                className="bb-see-all"
                onClick={() => navigate("/QuizSetup")}
              >
                + New Subject
              </button>
            </div>
            {subjectCards.length === 0 ? (
              <div className="bb-empty" style={{ marginBottom: "2rem" }}>
                No subjects yet — complete a quiz to see your progress here.
              </div>
            ) : (
              <div className="bb-cards-grid">
                {subjectCards.map((s) => {
                  const cfg = SUBJECT_CONFIG[s.subject] || DEFAULT_CONFIG;
                  return (
                    <div
                      key={s.subject}
                      className={`bb-subject-card c-${cfg.color}`}
                      onClick={() =>
                        navigate("/QuizSetup", {
                          state: { prefilledSubject: s.subject },
                        })
                      }
                    >
                      <div className={`s-icon ${cfg.iconCls}`}>{cfg.icon}</div>
                      <h3>{s.subject}</h3>
                      <p>{s.totalQuestions} questions answered</p>
                      <div className="bb-progress-bar">
                        <div
                          className={`bb-progress-fill ${cfg.fill}`}
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                      <div className="bb-card-meta">
                        <span>Accuracy</span>
                        <span>
                          <strong>{s.progress}%</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── BOTTOM GRID ── */}
            <div className="bb-bottom-grid">
              {/* RECENT ACTIVITY — real quiz history */}
              <div className="bb-panel">
                <div
                  className="bb-section-header"
                  style={{ marginBottom: "0.75rem" }}
                >
                  <h2 className="bb-section-title">Recent Activity</h2>
                  <div className="bb-tabs">
                    <button
                      className={`bb-tab${activeTab === "today" ? " active" : ""}`}
                      onClick={() => setActiveTab("today")}
                    >
                      Today
                    </button>
                    <button
                      className={`bb-tab${activeTab === "week" ? " active" : ""}`}
                      onClick={() => setActiveTab("week")}
                    >
                      All Recent
                    </button>
                  </div>
                </div>
                {activityList.length === 0 ? (
                  <div className="bb-empty">
                    {activeTab === "today"
                      ? "No quizzes today yet — start one!"
                      : "No quiz history yet."}
                  </div>
                ) : (
                  activityList.map((q, i) => {
                    const cfg = SUBJECT_CONFIG[q.subject] || DEFAULT_CONFIG;
                    return (
                      <div key={i} className="bb-activity-item">
                        <div className={`bb-activity-icon ${cfg.iconCls}`}>
                          {cfg.icon}
                        </div>
                        <div className="bb-activity-info">
                          <strong>
                            {q.subject} — {q.difficulty}
                          </strong>
                          <span>
                            {formatTimeAgo(q.completedAt)} · {q.totalQuestions}{" "}
                            questions
                          </span>
                        </div>
                        <div
                          className={`bb-activity-score ${getScoreClass(q.scorePercent)}`}
                        >
                          {q.totalCorrect}/{q.totalQuestions}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* LEADERBOARD */}
              <div className="bb-panel">
                <div
                  className="bb-section-header"
                  style={{ marginBottom: "0.75rem" }}
                >
                  <h2 className="bb-section-title">Leaderboard</h2>
                  <button className="bb-see-all">Weekly</button>
                </div>
                {fullLeaderboard.map((lb) => (
                  <div
                    key={lb.rank}
                    className={`bb-lb-item${lb.isYou ? " bb-lb-you-row" : ""}`}
                  >
                    <div
                      className={`bb-lb-rank${lb.rankCls && lb.rankCls !== "you" ? " " + lb.rankCls : ""}`}
                      style={lb.isYou ? { color: "var(--bb-accent)" } : {}}
                    >
                      {lb.rank}
                    </div>
                    <div className="bb-lb-avatar" style={lb.avatarStyle}>
                      {lb.initials}
                    </div>
                    <div className="bb-lb-info">
                      <strong>
                        {lb.name}
                        {lb.isYou && <span className="bb-you-badge">you</span>}
                      </strong>
                      <span>{lb.subjects}</span>
                    </div>
                    <div className="bb-lb-pts">{lb.pts}</div>
                  </div>
                ))}
                <div style={{ marginTop: "1rem" }}>
                  <button
                    className="bb-btn bb-btn-ghost"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      fontSize: 13,
                    }}
                  >
                    View full leaderboard →
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ── PROFILE SIDEBAR ── */}
        {openProfile && (
          <div className="bb-backdrop" onClick={() => setOpenProfile(false)} />
        )}
        <div className={`bb-sidebar${openProfile ? " open" : " closed"}`}>
          <div className="bb-sidebar-header">
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Profile</h2>
            <button
              className="bb-sidebar-close"
              onClick={() => setOpenProfile(false)}
            >
              ✖
            </button>
          </div>
          <div className="bb-sidebar-user">
            <p style={{ fontWeight: 600 }}>{user.name}</p>
            <p style={{ fontSize: 13, color: "var(--bb-muted)" }}>
              {user.email}
            </p>
          </div>
          <div className="bb-sidebar-menu">
            <div>My Profile</div>
            <div>My Progress</div>
            <div>Settings</div>
            <div className="logout" onClick={handleLogout}>
              Logout
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
