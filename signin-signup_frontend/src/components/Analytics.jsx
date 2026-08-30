import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "";
import axiosInstance from "../utils/axiosConfig";

/* ─── CSS Variables support light/dark mode via data-theme ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* dark theme defaults */
    --bg:        #0A0B0F;
    --bg2:       #0D0E14;
    --surface:   #111318;
    --surface2:  #181B23;
    --surface3:  #1E2130;
    --border:    rgba(255,255,255,0.06);
    --border2:   rgba(255,255,255,0.11);
    --border3:   rgba(255,255,255,0.18);
    --accent:    #7C5CFC;
    --accent2:   #00E5C0;
    --accent3:   #FF6B6B;
    --amber:     #FFB347;
    --blue:      #3895FF;
    --pink:      #FF64B4;
    --text:      #F0EFF8;
    --text2:     #C8C7D4;
    --muted:     #7B7A8C;
    --muted2:    #3A394A;
    --card-glow: rgba(124,92,252,0.06);
    --grid-line: rgba(255,255,255,0.03);
  }

  [data-theme="light"] {
    --bg:        #F5F5FA;
    --bg2:       #EEEEF5;
    --surface:   #FFFFFF;
    --surface2:  #F0EFF8;
    --surface3:  #E8E7F2;
    --border:    rgba(0,0,0,0.07);
    --border2:   rgba(0,0,0,0.12);
    --border3:   rgba(0,0,0,0.18);
    --text:      #0A0B0F;
    --text2:     #3A394A;
    --muted:     #7B7A8C;
    --muted2:    #C8C7D4;
    --card-glow: rgba(124,92,252,0.04);
    --grid-line: rgba(0,0,0,0.03);
  }

  html, body { background: var(--bg); color: var(--text); }

  .an-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    transition: background .3s, color .3s;
  }

  /* ── GRID BACKGROUND ── */
  .an-grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* ── NAV ── */
  .an-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 56px;
    border-bottom: 1px solid var(--border2);
    background: rgba(10,11,15,0.92);
    backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 200;
    transition: background .3s;
  }
  [data-theme="light"] .an-nav { background: rgba(245,245,250,0.92); }
  .an-logo {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px;
    display: flex; align-items: center; gap: 8px; cursor: pointer;
  }
  .an-logo-icon {
    width: 28px; height: 28px;
    border-radius: 7px; overflow: hidden;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .an-logo-icon img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .an-footer { border-top: 1px solid var(--border2); padding: 1rem 2rem; text-align: center; font-size: 11px; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 5px; background: var(--bg); }
  .an-footer img { width: 14px; height: 14px; border-radius: 3px; }
  .an-logo span { color: var(--accent2); }
  .an-nav-links { display: flex; gap: 2rem; list-style: none; }
  .an-nav-links a {
    font-size: 14px; color: var(--muted); text-decoration: none;
    font-weight: 500; cursor: pointer; transition: color .2s;
  }
  .an-nav-links a:hover { color: var(--text); }
  .an-nav-links a.active { color: var(--accent2); }
  .an-nav-right { display: flex; align-items: center; gap: 10px; }

  /* THEME TOGGLE */
  .an-theme-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--surface2); border: 1px solid var(--border2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .2s; color: var(--muted);
  }
  .an-theme-btn:hover { border-color: var(--accent); color: var(--accent); }

  .an-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 10px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: all .2s; border: none; font-family: 'DM Sans', sans-serif;
  }
  .an-btn-primary { background: var(--accent); color: #fff; }
  .an-btn-primary:hover { background: #9074fd; transform: translateY(-1px); }

  /* ── MAIN ── */
  .an-main { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem 8rem; position: relative; z-index: 1; }

  /* ── PAGE HEADER ── */
  .an-page-header { margin-bottom: 2.5rem; }
  .an-eyebrow {
    font-size: 11px; font-weight: 600; letter-spacing: 3px;
    text-transform: uppercase; color: var(--accent2); margin-bottom: 8px;
  }
  .an-page-title {
    font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800;
    line-height: 1.15; margin-bottom: 8px;
    background: linear-gradient(135deg, var(--text) 60%, var(--muted));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  [data-theme="light"] .an-page-title { background: none; -webkit-text-fill-color: var(--text); }
  .an-page-sub { font-size: 14px; color: var(--muted); }

  /* ── KPI ROW ── */
  .an-kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 2rem; }
  .an-kpi {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 16px; padding: 1.25rem;
    position: relative; overflow: hidden;
    transition: border-color .2s, transform .2s, background .3s;
    cursor: default;
  }
  .an-kpi::before {
    content: ''; position: absolute; inset: 0;
    background: var(--card-glow); pointer-events: none;
  }
  .an-kpi:hover { border-color: var(--border3); transform: translateY(-3px); }
  .an-kpi-accent { position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 16px 16px 0 0; }
  .an-kpi-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 12px;
  }
  .an-kpi-val {
    font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800;
    line-height: 1; margin-bottom: 4px;
  }
  .an-kpi-key { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .an-kpi-delta {
    position: absolute; top: 1.25rem; right: 1.25rem;
    font-size: 11px; font-weight: 600; padding: 3px 8px;
    border-radius: 6px;
  }
  .delta-up   { background: rgba(0,229,192,0.12); color: var(--accent2); }
  .delta-down { background: rgba(255,107,107,0.12); color: var(--accent3); }
  .delta-neu  { background: rgba(255,255,255,0.06); color: var(--muted); }

  /* ── GRID LAYOUT ── */
  .an-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .an-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .an-grid-1-2 { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; margin-bottom: 16px; }
  .an-grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 16px; }

  /* ── CARD ── */
  .an-card {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 18px; padding: 1.5rem;
    transition: border-color .2s, background .3s;
    position: relative; overflow: hidden;
  }
  .an-card-title {
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
    color: var(--text2); margin-bottom: 1.25rem;
    display: flex; align-items: center; justify-content: space-between;
  }
  .an-card-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1px;
    text-transform: uppercase; color: var(--muted);
  }

  /* ── BAR CHART (custom SVG-style CSS bars) ── */
  .an-bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; padding-top: 8px; }
  .an-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
  .an-bar-fill {
    width: 100%; border-radius: 6px 6px 0 0;
    min-height: 4px; transition: height 1s cubic-bezier(.4,0,.2,1);
    position: relative;
  }
  .an-bar-fill::after {
    content: attr(data-val);
    position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
    font-size: 10px; font-weight: 600; color: var(--muted);
    font-family: 'JetBrains Mono', monospace; white-space: nowrap;
  }
  .an-bar-label { font-size: 10px; color: var(--muted); text-align: center; }

  /* ── DONUT CHART ── */
  .an-donut-wrap { display: flex; align-items: center; gap: 1.5rem; }
  .an-donut-svg { flex-shrink: 0; }
  .an-donut-circle { transition: stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1); }
  .an-donut-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .an-legend-row { display: flex; align-items: center; gap: 8px; }
  .an-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .an-legend-name { font-size: 12px; color: var(--text2); flex: 1; }
  .an-legend-val { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; color: var(--muted); }

  /* ── LINE CHART ── */
  .an-line-chart { position: relative; width: 100%; height: 140px; }
  .an-line-chart svg { width: 100%; height: 100%; }
  .an-line-path { fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
  .an-line-area { opacity: .15; }
  .an-line-dot { transition: r .15s; cursor: pointer; }
  .an-line-dot:hover { r: 5; }
  .an-chart-grid-line { stroke: var(--grid-line); stroke-width: 1; }
  .an-y-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; fill: var(--muted); }
  .an-x-label { font-family: 'DM Sans', sans-serif; font-size: 9px; fill: var(--muted); }

  /* ── SUBJECT TABLE ── */
  .an-subj-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .an-subj-row:last-child { border-bottom: none; }
  .an-subj-icon {
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .an-subj-name { flex: 1; font-size: 13px; font-weight: 500; }
  .an-subj-bar-wrap { width: 100px; }
  .an-subj-bar-track { height: 6px; background: var(--muted2); border-radius: 6px; overflow: hidden; }
  .an-subj-bar-fill { height: 100%; border-radius: 6px; transition: width 1s cubic-bezier(.4,0,.2,1); }
  .an-subj-pct {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; font-weight: 500; width: 40px; text-align: right;
  }
  .an-subj-count { font-size: 11px; color: var(--muted); width: 60px; text-align: right; }

  /* ── HEATMAP ── */
  .an-heatmap { display: flex; flex-wrap: wrap; gap: 3px; }
  .an-heat-cell {
    width: 14px; height: 14px; border-radius: 3px;
    transition: transform .15s, opacity .15s;
    cursor: default;
  }
  .an-heat-cell:hover { transform: scale(1.4); z-index: 10; position: relative; }

  /* ── DIFFICULTY METER ── */
  .an-diff-row { display: flex; gap: 10px; }
  .an-diff-bar-col { flex: 1; text-align: center; }
  .an-diff-bar-track {
    height: 80px; background: var(--surface2);
    border-radius: 8px; position: relative; overflow: hidden;
    display: flex; align-items: flex-end;
  }
  .an-diff-bar-fill { width: 100%; border-radius: 6px; transition: height 1s cubic-bezier(.4,0,.2,1); }
  .an-diff-label { font-size: 11px; color: var(--muted); margin-top: 6px; }
  .an-diff-val { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; margin-top: 2px; }

  /* ── STREAK CALENDAR ── */
  .an-cal-row { display: flex; gap: 3px; margin-bottom: 3px; }
  .an-cal-day {
    width: 12px; height: 12px; border-radius: 2px;
    background: var(--muted2);
    transition: transform .15s;
  }
  .an-cal-day.active { background: var(--accent); }
  .an-cal-day.today  { background: var(--accent2); outline: 2px solid var(--accent2); outline-offset: 1px; }

  /* ── FLOATING QUOTES ── */
  .an-quotes-scene {
    position: fixed; bottom: 0; left: 0; right: 0; height: 100px;
    pointer-events: none; z-index: 50; overflow: hidden;
  }
  .an-quote-bubble {
    position: absolute; bottom: 12px;
    background: var(--surface2); border: 1px solid var(--border2);
    border-radius: 20px; padding: 8px 16px;
    font-size: 11px; color: var(--muted);
    font-style: italic; white-space: nowrap;
    animation: an-float linear infinite;
    backdrop-filter: blur(8px);
  }
  @keyframes an-float {
    0%   { transform: translateX(110vw); opacity: 0; }
    5%   { opacity: 1; }
    95%  { opacity: 1; }
    100% { transform: translateX(-110vw); opacity: 0; }
  }

  /* ── TOOLTIP ── */
  .an-tooltip {
    position: absolute; background: var(--surface3);
    border: 1px solid var(--border2); border-radius: 8px;
    padding: 6px 10px; font-size: 11px; color: var(--text);
    pointer-events: none; z-index: 300; white-space: nowrap;
    font-family: 'JetBrains Mono', monospace;
  }

  /* ── LOADING ── */
  .an-loading { display: flex; align-items: center; justify-content: center; min-height: 60vh; gap: 12px; color: var(--muted); font-size: 14px; }
  .an-spinner { width: 20px; height: 20px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: an-spin .7s linear infinite; }
  @keyframes an-spin { to { transform: rotate(360deg); } }

  /* ── ANIMATIONS ── */
  @keyframes an-fadein { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .an-a0 { animation: an-fadein .5s ease both; }
  .an-a1 { animation: an-fadein .5s .07s ease both; }
  .an-a2 { animation: an-fadein .5s .14s ease both; }
  .an-a3 { animation: an-fadein .5s .21s ease both; }
  .an-a4 { animation: an-fadein .5s .28s ease both; }
  .an-a5 { animation: an-fadein .5s .35s ease both; }

  /* ── EMPTY STATE ── */
  .an-empty { text-align: center; padding: 3rem; color: var(--muted); }
  .an-empty-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; }

  /* responsive */
  @media (max-width: 768px) {
    .an-kpi-row { grid-template-columns: repeat(2, 1fr); }
    .an-grid-2, .an-grid-3, .an-grid-1-2, .an-grid-2-1 { grid-template-columns: 1fr; }
  }
`;

/* ─── SVG Icons ─── */
const Icon = {
  quiz: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  star: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  target: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  zap: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  clock: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  flame: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  ),
  book: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  sun: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  trend: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
};

/* ─── Quotes ─── */
const QUOTES = [
  "The expert in anything was once a beginner.",
  "Consistency is what transforms average into excellence.",
  "Small daily improvements lead to staggering long-term results.",
  "Every question you answer makes the next one easier.",
  "Learning is a treasure that follows its owner everywhere.",
  "The beautiful thing about learning is nobody can take it away.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Knowledge is power. Consistency is the key.",
  "Your only limit is your mind.",
  "Success is the sum of small efforts repeated every day.",
  "Don't stop when you're tired. Stop when you're done.",
];

/* ─── Subject config ─── */
const SUBJ_CFG = {
  Mathematics: { color: "#7C5CFC", bg: "rgba(124,92,252,0.12)" },
  Physics: { color: "#00E5C0", bg: "rgba(0,229,192,0.1)" },
  Chemistry: { color: "#FF6B6B", bg: "rgba(255,107,107,0.1)" },
  Biology: { color: "#FFB347", bg: "rgba(255,179,71,0.1)" },
  "Comp. Science": { color: "#3895FF", bg: "rgba(56,149,255,0.1)" },
  English: { color: "#FF64B4", bg: "rgba(255,100,180,0.1)" },
};
const SUBJ_DEFAULT = { color: "#7C5CFC", bg: "rgba(124,92,252,0.12)" };
const COLORS = [
  "#7C5CFC",
  "#00E5C0",
  "#FF6B6B",
  "#FFB347",
  "#3895FF",
  "#FF64B4",
  "#A78BFA",
  "#34D399",
];

/* ─── Helpers ─── */
const getColor = (pct) =>
  pct >= 80
    ? "#00E5C0"
    : pct >= 60
      ? "#7C5CFC"
      : pct >= 40
        ? "#FFB347"
        : "#FF6B6B";

/* ─── Mini SVG Bar Chart ─── */
function BarChart({ data, color = "#7C5CFC", animated }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="an-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="an-bar-col">
          <div
            className="an-bar-fill"
            data-val={d.value}
            style={{
              height: animated ? `${(d.value / max) * 100}%` : "0%",
              background: `linear-gradient(180deg, ${color}, ${color}88)`,
              transition: `height 0.8s ${i * 0.06}s cubic-bezier(.4,0,.2,1)`,
            }}
          />
          <div className="an-bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Mini SVG Line Chart ─── */
function LineChart({ data, color = "#7C5CFC", animated }) {
  const W = 400,
    H = 120,
    pad = { t: 20, r: 10, b: 24, l: 28 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;

  const pts = data.map((d, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * iW,
    y: pad.t + iH - ((d.value - min) / range) * iH,
    ...d,
  }));

  const pathD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaD =
    pts.length > 0
      ? `${pathD} L${pts[pts.length - 1].x},${pad.t + iH} L${pts[0].x},${pad.t + iH} Z`
      : "";

  const yLines = [0, 25, 50, 75, 100].map((v) => ({
    y: pad.t + iH - (v / 100) * iH,
    label: `${Math.round(min + (v / 100) * range)}%`,
  }));

  return (
    <div className="an-line-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        {yLines.map((l, i) => (
          <g key={i}>
            <line
              x1={pad.l}
              y1={l.y}
              x2={W - pad.r}
              y2={l.y}
              className="an-chart-grid-line"
            />
            <text
              x={pad.l - 4}
              y={l.y + 3}
              className="an-y-label"
              textAnchor="end"
            >
              {l.label}
            </text>
          </g>
        ))}
        {pts.length > 1 && (
          <>
            <path d={areaD} fill={color} className="an-line-area" />
            <path
              d={pathD}
              stroke={color}
              className="an-line-path"
              strokeDasharray={animated ? "none" : "1000"}
              strokeDashoffset={animated ? "0" : "1000"}
            />
          </>
        )}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={color}
            className="an-line-dot"
          >
            <title>
              {p.label}: {p.value}%
            </title>
          </circle>
        ))}
        {pts.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={H - 4}
            className="an-x-label"
            textAnchor="middle"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ─── Donut Chart ─── */
function DonutChart({ segments, size = 100 }) {
  const cx = size / 2,
    cy = size / 2,
    r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;

  return (
    <div className="an-donut-wrap">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="an-donut-svg"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--muted2)"
          strokeWidth="12"
        />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="an-donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="an-legend-row">
            <div className="an-legend-dot" style={{ background: seg.color }} />
            <div className="an-legend-name">{seg.label}</div>
            <div className="an-legend-val">{seg.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Floating Quotes ─── */
function FloatingQuotes() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const spawn = () => {
      const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      const duration = 22 + Math.random() * 16;
      const bottom = 8 + Math.random() * 60;
      const id = Date.now() + Math.random();
      setBubbles((b) => [...b.slice(-6), { id, text: q, duration, bottom }]);
    };
    spawn();
    const interval = setInterval(spawn, 50000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="an-quotes-scene">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="an-quote-bubble"
          style={{
            bottom: b.bottom,
            animationDuration: `${b.duration}s`,
          }}
        >
          "{b.text}"
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function Analytics() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [history, setHistory] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [scanAnalytics, setScanAnalytics] = useState(null);



  /* fetch data */
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const [hRes, dRes] = await Promise.all([
          fetch(`${API_URL}/api/quiz/history?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/quiz/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const [hData, dData] = await Promise.all([hRes.json(), dRes.json()]);

        if (hData.success) setHistory(hData.history);
        if (dData.success) setDashboard(dData.dashboard);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimated(true), 100);
      }
    };
    load();
  }, [navigate]);

  /* fetch GyanS scan analytics */
  useEffect(() => {
    const loadScan = async () => {
      try {
        const res = await axiosInstance.get("/api/scan/analytics");
        if (res.data.success) {
          setScanAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.warn("Scan analytics not available:", err.message);
      }
    };
    loadScan();
  }, []);

  /* ── derived analytics ── */
  const totalQuizzes = history.length;
  const avgScore = totalQuizzes
    ? Math.round(history.reduce((s, q) => s + q.scorePercent, 0) / totalQuizzes)
    : 0;
  const bestScore = totalQuizzes
    ? Math.max(...history.map((q) => q.scorePercent))
    : 0;
  const totalXP = dashboard?.xp ?? 0;
  const streak = dashboard?.streak ?? 0;
  const rank = dashboard?.rank ?? "—";
  const accuracy = dashboard?.accuracy ?? 0;

  /* per-subject stats */
  const subjectMap = {};
  history.forEach((q) => {
    const key = q.subject;
    if (!subjectMap[key])
      subjectMap[key] = { subject: key, quizzes: 0, totalScore: 0, xp: 0 };
    subjectMap[key].quizzes += 1;
    subjectMap[key].totalScore += q.scorePercent;
    subjectMap[key].xp += q.xpEarned || 0;
  });
  const subjectStats = Object.values(subjectMap)
    .map((s) => ({ ...s, avgScore: Math.round(s.totalScore / s.quizzes) }))
    .sort((a, b) => b.quizzes - a.quizzes);

  /* difficulty breakdown */
  const diffMap = { Easy: 0, Medium: 0, Hard: 0 };
  history.forEach((q) => {
    if (diffMap[q.difficulty] !== undefined) diffMap[q.difficulty]++;
  });

  /* score over time (last 10 quizzes) */
  const scoreOverTime = [...history]
    .reverse()
    .slice(-10)
    .map((q, i) => ({
      label: `Q${i + 1}`,
      value: q.scorePercent,
    }));

  /* quizzes per day (last 7 days) */
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const quizPerDay = Array(7).fill(0);
  const now = new Date();
  history.forEach((q) => {
    const diff = Math.floor((now - new Date(q.completedAt)) / 86400000);
    if (diff < 7) quizPerDay[6 - diff]++;
  });
  const quizBarData = quizPerDay.map((v, i) => ({
    label: dayNames[(now.getDay() - 6 + i + 7) % 7],
    value: v,
  }));

  /* score distribution donut */
  const dist = { Excellent: 0, Good: 0, Average: 0, "Needs Work": 0 };
  history.forEach((q) => {
    if (q.scorePercent >= 90) dist.Excellent++;
    else if (q.scorePercent >= 75) dist.Good++;
    else if (q.scorePercent >= 50) dist.Average++;
    else dist["Needs Work"]++;
  });
  const donutSegs = [
    { label: "Excellent", value: dist.Excellent, color: "#00E5C0" },
    { label: "Good", value: dist.Good, color: "#7C5CFC" },
    { label: "Average", value: dist.Average, color: "#FFB347" },
    { label: "Needs Work", value: dist["Needs Work"], color: "#FF6B6B" },
  ].filter((s) => s.value > 0);

  /* heatmap — last 35 days */
  const heatData = Array(35).fill(0);
  history.forEach((q) => {
    const diff = Math.floor((now - new Date(q.completedAt)) / 86400000);
    if (diff < 35) heatData[34 - diff]++;
  });
  const heatMax = Math.max(...heatData, 1);

  const heatColor = (v) => {
    if (v === 0) return "var(--muted2)";
    const alpha = 0.2 + (v / heatMax) * 0.8;
    return `rgba(124,92,252,${alpha})`;
  };

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="an-root" data-theme={theme}>
          <div className="an-loading">
            <div className="an-spinner" />
            Loading your analytics...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="an-root" data-theme={theme}>
        <div className="an-grid-bg" />

        {/* NAV */}
        <nav className="an-nav">
          <div className="an-logo" onClick={() => navigate("/dashboard")}>
            <div className="an-logo-icon"><img src="/favicon-32.png" alt="Gyantra" /></div>
            Gyan<span>tra</span>
          </div>
          <ul className="an-nav-links">
            <li>
              <a onClick={() => navigate("/dashboard")}>Dashboard</a>
            </li>
            <li>
              <a onClick={() => navigate("/performance")}>Performance</a>
            </li>
            <li>
              <a onClick={() => navigate("/QuizSetup")}>Practice</a>
            </li>
            <li>
              <a onClick={() => navigate("/results/history")}>Results</a>
            </li>
            <li>
              <a className="active">Analytics</a>
            </li>
          </ul>
          <div className="an-nav-right">
            <button
              className="an-theme-btn"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {theme === "dark" ? Icon.sun : Icon.moon}
            </button>
            <button
              className="an-btn an-btn-primary"
              onClick={() => navigate("/QuizSetup")}
            >
              {Icon.zap} New Quiz
            </button>
          </div>
        </nav>

        <main className="an-main">
          {/* PAGE HEADER */}
          <div className="an-page-header an-a0">
            <div className="an-eyebrow">Performance Intelligence</div>
            <div className="an-page-title">Your Analytics</div>
            <div className="an-page-sub">
              Deep insights from {totalQuizzes} quiz
              {totalQuizzes !== 1 ? "zes" : ""} — understand your patterns,
              sharpen your edge.
            </div>
          </div>

          {/* KPI ROW */}
          <div className="an-kpi-row an-a1">
            {[
              {
                label: "Total Quizzes",
                val: totalQuizzes,
                color: "#7C5CFC",
                icon: Icon.quiz,
                delta: null,
              },
              {
                label: "Avg Score",
                val: `${avgScore}%`,
                color: "#00E5C0",
                icon: Icon.target,
                delta: avgScore >= 70 ? "delta-up" : "delta-down",
                deltaText: avgScore >= 70 ? "Good" : "Improve",
              },
              {
                label: "Best Score",
                val: `${bestScore}%`,
                color: "#FFB347",
                icon: Icon.star,
                delta: "delta-up",
                deltaText: "PB",
              },
              {
                label: "Total XP",
                val: totalXP.toLocaleString(),
                color: "#FFB347",
                icon: Icon.zap,
                delta: "delta-up",
                deltaText: `+${totalXP}`,
              },
              {
                label: "Day Streak",
                val: streak,
                color: "#FF6B6B",
                icon: Icon.flame,
                delta: streak > 0 ? "delta-up" : "delta-neu",
                deltaText: streak > 0 ? "Active" : "Inactive",
              },
            ].map((kpi, i) => (
              <div key={i} className="an-kpi">
                <div
                  className="an-kpi-accent"
                  style={{ background: kpi.color }}
                />
                <div
                  className="an-kpi-icon"
                  style={{ background: `${kpi.color}18`, color: kpi.color }}
                >
                  {kpi.icon}
                </div>
                <div className="an-kpi-val" style={{ color: kpi.color }}>
                  {kpi.val}
                </div>
                <div className="an-kpi-key">{kpi.label}</div>
                {kpi.delta && (
                  <div className={`an-kpi-delta ${kpi.delta}`}>
                    {kpi.deltaText}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ROW 1 — Score trend + Quizzes per day */}
          <div className="an-grid-2 an-a2">
            <div className="an-card">
              <div className="an-card-title">
                Score Trend
                <span className="an-card-label">Last 10 quizzes</span>
              </div>
              {scoreOverTime.length < 2 ? (
                <div className="an-empty">
                  <div className="an-empty-title">Not enough data</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    Complete at least 2 quizzes
                  </div>
                </div>
              ) : (
                <LineChart
                  data={scoreOverTime}
                  color="#7C5CFC"
                  animated={animated}
                />
              )}
            </div>

            <div className="an-card">
              <div className="an-card-title">
                Activity
                <span className="an-card-label">Quizzes per day (7d)</span>
              </div>
              <BarChart
                data={quizBarData}
                color="#00E5C0"
                animated={animated}
              />
            </div>
          </div>

          {/* ROW 2 — Score distribution + Difficulty breakdown */}
          <div className="an-grid-1-2 an-a3">
            <div className="an-card">
              <div className="an-card-title">Score Distribution</div>
              {donutSegs.length === 0 ? (
                <div className="an-empty">
                  <div className="an-empty-title">No data yet</div>
                </div>
              ) : (
                <DonutChart segments={donutSegs} size={110} />
              )}
            </div>

            <div className="an-card">
              <div className="an-card-title">
                Difficulty Breakdown
                <span className="an-card-label">Quizzes attempted</span>
              </div>
              <div className="an-diff-row">
                {[
                  { label: "Easy", val: diffMap.Easy, color: "#00E5C0" },
                  { label: "Medium", val: diffMap.Medium, color: "#FFB347" },
                  { label: "Hard", val: diffMap.Hard, color: "#FF6B6B" },
                ].map((d, i) => {
                  const maxDiff = Math.max(
                    diffMap.Easy,
                    diffMap.Medium,
                    diffMap.Hard,
                    1,
                  );
                  return (
                    <div key={i} className="an-diff-bar-col">
                      <div className="an-diff-bar-track">
                        <div
                          className="an-diff-bar-fill"
                          style={{
                            height: animated
                              ? `${(d.val / maxDiff) * 100}%`
                              : "0%",
                            background: d.color,
                            transition: `height 0.8s ${i * 0.1}s cubic-bezier(.4,0,.2,1)`,
                          }}
                        />
                      </div>
                      <div className="an-diff-label">{d.label}</div>
                      <div className="an-diff-val" style={{ color: d.color }}>
                        {d.val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ROW 3 — Subject performance table */}
          <div className="an-card an-a4" style={{ marginBottom: 16 }}>
            <div className="an-card-title">
              Subject Performance
              <span className="an-card-label">
                {subjectStats.length} subjects
              </span>
            </div>
            {subjectStats.length === 0 ? (
              <div className="an-empty">
                <div className="an-empty-title">No subject data yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Complete a quiz to see subject breakdown
                </div>
              </div>
            ) : (
              subjectStats.map((s, i) => {
                const cfg = SUBJ_CFG[s.subject] || SUBJ_DEFAULT;
                const color = getColor(s.avgScore);
                return (
                  <div key={i} className="an-subj-row">
                    <div
                      className="an-subj-icon"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {Icon.book}
                    </div>
                    <div className="an-subj-name">{s.subject}</div>
                    <div className="an-subj-bar-wrap">
                      <div className="an-subj-bar-track">
                        <div
                          className="an-subj-bar-fill"
                          style={{
                            width: animated ? `${s.avgScore}%` : "0%",
                            background: color,
                            transition: `width 0.9s ${i * 0.08}s cubic-bezier(.4,0,.2,1)`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="an-subj-pct" style={{ color }}>
                      {s.avgScore}%
                    </div>
                    <div className="an-subj-count">
                      {s.quizzes} quiz{s.quizzes > 1 ? "zes" : ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ROW 4 — Activity heatmap + Accuracy + Rank */}
          <div className="an-grid-2-1 an-a5">
            <div className="an-card">
              <div className="an-card-title">
                Activity Heatmap
                <span className="an-card-label">Last 35 days</span>
              </div>
              <div className="an-heatmap">
                {heatData.map((v, i) => (
                  <div
                    key={i}
                    className="an-heat-cell"
                    style={{ background: heatColor(v) }}
                    title={`${v} quiz${v !== 1 ? "zes" : ""}`}
                  />
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 10,
                }}
              >
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  Less
                </span>
                {[0.2, 0.4, 0.6, 0.8, 1].map((a, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: `rgba(124,92,252,${a})`,
                    }}
                  />
                ))}
                <span style={{ fontSize: 11, color: "var(--muted)" }}>
                  More
                </span>
              </div>
            </div>

            <div className="an-card">
              <div className="an-card-title">Quick Stats</div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[
                  {
                    label: "Overall Accuracy",
                    val: `${accuracy}%`,
                    color: getColor(accuracy),
                  },
                  { label: "Global Rank", val: `#${rank}`, color: "#7C5CFC" },
                  {
                    label: "XP Level",
                    val: dashboard?.level ?? "Newcomer",
                    color: "#FFB347",
                  },
                  {
                    label: "Best Subject",
                    val: subjectStats[0]?.subject ?? "—",
                    color: "#00E5C0",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {s.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontSize: 13,
                        fontWeight: 600,
                        color: s.color,
                      }}
                    >
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ── GYANS SCANNER ANALYTICS ── */}
        {scanAnalytics && scanAnalytics.totalScans > 0 && (
          <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 2rem", position: "relative", zIndex: 1 }}>
            <div className="an-card an-a4" style={{ borderLeft: "3px solid var(--accent2)" }}>
              <div className="an-card-title">
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7V5a2 2 0 012-2h2" />
                    <path d="M17 3h2a2 2 0 012 2v2" />
                    <path d="M21 17v2a2 2 0 01-2 2h-2" />
                    <path d="M7 21H5a2 2 0 01-2-2v-2" />
                    <path d="M7 8h10" />
                    <path d="M7 12h10" />
                    <path d="M7 16h7" />
                  </svg>
                  GyanS Scanner Analytics
                </span>
                <button
                  className="an-btn an-btn-primary"
                  style={{ fontSize: 12, padding: "6px 14px" }}
                  onClick={() => navigate("/gyans")}
                >
                  Open GyanS →
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Total Scans", value: scanAnalytics.totalScans, color: "var(--accent)" },
                  { label: "Quizzes Done", value: scanAnalytics.completedQuizzes, color: "var(--accent2)" },
                  { label: "Avg Score", value: `${scanAnalytics.avgScore}%`, color: getColor(scanAnalytics.avgScore) },
                  { label: "Avg Scan Time", value: `${(scanAnalytics.avgScanTime / 1000).toFixed(1)}s`, color: "var(--amber)" },
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "12px 8px", background: "var(--surface2)", borderRadius: 12, border: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: stat.color }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              {scanAnalytics.subjectBreakdown.length > 0 && (
                <div>
                  <div className="an-card-label" style={{ marginBottom: 8 }}>Subject Breakdown</div>
                  {scanAnalytics.subjectBreakdown.slice(0, 5).map((subj, i) => (
                    <div key={i} className="an-subj-row">
                      <div className="an-subj-icon" style={{ background: `${COLORS[i % COLORS.length]}18` }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div className="an-subj-name">{subj.subject}</div>
                      <div className="an-subj-bar-wrap">
                        <div className="an-subj-bar-track">
                          <div className="an-subj-bar-fill" style={{ width: `${subj.accuracy}%`, background: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                      <div className="an-subj-pct" style={{ color: COLORS[i % COLORS.length] }}>{subj.accuracy}%</div>
                      <div className="an-subj-count">{subj.scansCount} scans</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* FLOATING QUOTES */}
        <FloatingQuotes />

        <footer className="an-footer">
          <img src="/favicon-32.png" alt="" />
          © {new Date().getFullYear()} Gyantra. All rights reserved.
        </footer>
      </div>
    </>
  );
}
