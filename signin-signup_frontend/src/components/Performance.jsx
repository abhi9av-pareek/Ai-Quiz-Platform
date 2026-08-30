import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  Sigma,
  Atom,
  FlaskConical,
  BookOpen,
  ScanLine,
  Target,
  Flame,
  X,
  Brain,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Award,
  Sparkles,
  HelpCircle,
  BarChart3,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  RefreshCw
} from "lucide-react";
import { AvatarRender } from "./Profile";
import { INITIAL_PERFORMANCE_DATA, getFilteredTimeline } from "../data/mockPerformanceData";

/* ─── CSS matching Gyantra Dashboard Visual Identity ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --pf-bg: #0A0B0F;
    --pf-surface: #111318;
    --pf-surface2: #181B23;
    --pf-surface3: #1E2130;
    --pf-border: rgba(255,255,255,0.07);
    --pf-border2: rgba(255,255,255,0.12);
    --pf-border3: rgba(255,255,255,0.20);
    --pf-accent: #7C5CFC;
    --pf-accent2: #00E5C0;
    --pf-accent3: #FF6B6B;
    --pf-amber: #FFB347;
    --pf-blue: #3895FF;
    --pf-pink: #FF64B4;
    --pf-text: #F0EFF8;
    --pf-muted: #7B7A8C;
    --pf-muted2: #4A495A;
    --pf-glow: rgba(124,92,252,0.08);
  }

  [data-theme="light"] {
    --pf-bg: #F5F5FA;
    --pf-surface: #FFFFFF;
    --pf-surface2: #F0EFF8;
    --pf-surface3: #E8E7F2;
    --pf-border: rgba(0,0,0,0.07);
    --pf-border2: rgba(0,0,0,0.12);
    --pf-border3: rgba(0,0,0,0.20);
    --pf-text: #0A0B0F;
    --pf-muted: #7B7A8C;
    --pf-muted2: #C8C7D4;
    --pf-glow: rgba(124,92,252,0.04);
  }

  .pf-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--pf-bg);
    color: var(--pf-text);
    min-height: 100vh;
    transition: background .3s, color .3s;
    position: relative;
    overflow-x: hidden;
  }

  /* ── NAV ── */
  .pf-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    height: 58px;
    border-bottom: 1px solid var(--pf-border);
    background: rgba(10,11,15,0.95);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 100;
    transition: background .3s;
  }
  [data-theme="light"] .pf-nav { background: rgba(245,245,250,0.95); }

  .pf-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 20px;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .pf-logo-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .pf-logo-icon img { width: 100%; height: 100%; object-fit: cover; }
  .pf-logo span { color: var(--pf-accent2); }

  .pf-nav-links { display: flex; gap: 1.8rem; list-style: none; }
  .pf-nav-links a {
    font-size: 14px;
    color: var(--pf-muted);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    cursor: pointer;
  }
  .pf-nav-links a:hover { color: var(--pf-text); }
  .pf-nav-links a.active {
    color: var(--pf-accent2);
    font-weight: 600;
    position: relative;
  }
  .pf-nav-links a.active::after {
    content: '';
    position: absolute;
    bottom: -18px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--pf-accent2);
    border-radius: 2px;
  }

  .pf-nav-right { display: flex; align-items: center; gap: 12px; }
  .pf-streak {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,179,71,0.12);
    border: 1px solid rgba(255,179,71,0.25);
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--pf-amber);
  }

  .pf-theme-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: var(--pf-surface2);
    border: 1px solid var(--pf-border2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all .2s;
    color: var(--pf-muted);
  }
  .pf-theme-btn:hover { border-color: var(--pf-accent); color: var(--pf-accent); }

  /* ── MAIN ── */
  .pf-main {
    padding: 2rem 2rem 5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* ── HERO BANNER / OVERALL SCORE ── */
  .pf-hero {
    background: var(--pf-surface);
    border: 1px solid var(--pf-border2);
    border-radius: 24px;
    padding: 2.25rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2.5rem;
    align-items: center;
    box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  }
  .pf-hero::before {
    content: '';
    position: absolute;
    left: -80px;
    top: -80px;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(124,92,252,0.16) 0%, transparent 70%);
    pointer-events: none;
  }
  .pf-hero::after {
    content: '';
    position: absolute;
    right: -60px;
    bottom: -60px;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(0,229,192,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .pf-hero-gauge-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    z-index: 2;
    border-right: 1px solid var(--pf-border);
    padding-right: 2rem;
  }

  .pf-gauge-container {
    position: relative;
    width: 170px;
    height: 170px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }
  .pf-gauge-svg {
    transform: rotate(-90deg);
    width: 170px;
    height: 170px;
  }
  .pf-gauge-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .pf-gauge-val {
    font-family: 'Syne', sans-serif;
    font-size: 38px;
    font-weight: 800;
    line-height: 1;
    color: var(--pf-text);
  }
  .pf-gauge-unit {
    font-size: 20px;
    color: var(--pf-accent2);
    font-weight: 700;
  }
  .pf-gauge-sub {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--pf-muted);
    margin-top: 4px;
  }

  .pf-hero-details {
    position: relative;
    z-index: 2;
  }
  .pf-hero-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 1rem;
  }
  .pf-hero-title {
    font-family: 'Syne', sans-serif;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }
  .pf-hero-title span { color: var(--pf-accent2); }

  .pf-delta-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(0,229,192,0.12);
    color: var(--pf-accent2);
    border: 1px solid rgba(0,229,192,0.25);
  }

  .pf-hero-desc {
    color: var(--pf-muted);
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    max-width: 620px;
  }

  .pf-hero-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .pf-hero-kpi {
    background: var(--pf-surface2);
    border: 1px solid var(--pf-border);
    border-radius: 14px;
    padding: 12px 14px;
    transition: all 0.2s;
  }
  .pf-hero-kpi:hover {
    border-color: var(--pf-border2);
    transform: translateY(-2px);
  }
  .pf-kpi-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--pf-muted);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .pf-kpi-value {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--pf-text);
  }
  .pf-kpi-sub {
    font-size: 11px;
    color: var(--pf-muted);
    margin-top: 2px;
  }

  /* ── SECTION HEADER ── */
  .pf-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    margin-top: 2rem;
  }
  .pf-section-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pf-section-icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: rgba(124,92,252,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pf-accent);
  }
  .pf-section-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .pf-section-sub {
    font-size: 12px;
    color: var(--pf-muted);
    margin-top: 1px;
  }

  /* ── PERFORMANCE TREND CHART CARD ── */
  .pf-card {
    background: var(--pf-surface);
    border: 1px solid var(--pf-border);
    border-radius: 20px;
    padding: 1.5rem;
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
  }
  .pf-card:hover {
    border-color: var(--pf-border2);
  }

  .pf-trend-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 1.25rem;
  }
  .pf-filter-group {
    display: flex;
    background: var(--pf-surface2);
    padding: 3px;
    border-radius: 10px;
    border: 1px solid var(--pf-border);
  }
  .pf-filter-btn {
    padding: 6px 14px;
    border-radius: 7px;
    border: none;
    background: none;
    color: var(--pf-muted);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .pf-filter-btn.active {
    background: var(--pf-surface);
    color: var(--pf-text);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    border: 1px solid var(--pf-border2);
  }

  /* Trend Chart Area */
  .pf-chart-wrapper {
    position: relative;
    width: 100%;
    height: 220px;
    margin-top: 0.5rem;
  }
  .pf-chart-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .pf-chart-grid {
    stroke: var(--pf-border);
    stroke-dasharray: 4 4;
  }
  .pf-chart-axis-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    fill: var(--pf-muted);
  }

  .pf-chart-tooltip {
    position: absolute;
    pointer-events: none;
    background: var(--pf-surface3);
    border: 1px solid var(--pf-border2);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--pf-text);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    transform: translate(-50%, -120%);
    transition: all 0.1s ease-out;
    z-index: 10;
    min-width: 140px;
  }
  .pf-tooltip-title { font-weight: 700; font-family: 'Syne', sans-serif; font-size: 13px; margin-bottom: 2px; }
  .pf-tooltip-meta { font-size: 11px; color: var(--pf-muted); display: flex; justify-content: space-between; }
  .pf-tooltip-score { color: var(--pf-accent2); font-weight: 700; }

  .pf-trend-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--pf-border);
    font-size: 12px;
    color: var(--pf-muted);
  }
  .pf-trend-insight {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--pf-accent2);
    font-weight: 500;
  }

  /* ── 2-COLUMN SPLIT: QUIZ VS SCAN ── */
  .pf-split-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 2rem;
  }
  .pf-metric-card {
    background: var(--pf-surface);
    border: 1px solid var(--pf-border);
    border-radius: 20px;
    padding: 1.5rem;
    transition: all 0.25s;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .pf-metric-card:hover {
    border-color: var(--pf-border2);
    transform: translateY(-2px);
  }
  .pf-metric-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
  }
  .pf-metric-badge {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
  }
  .badge-purple { background: rgba(124,92,252,0.15); color: var(--pf-accent); border: 1px solid rgba(124,92,252,0.25); }
  .badge-teal   { background: rgba(0,229,192,0.12); color: var(--pf-accent2); border: 1px solid rgba(0,229,192,0.25); }

  .pf-metric-stat-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 1.25rem;
  }
  .pf-sub-stat {
    background: var(--pf-surface2);
    border: 1px solid var(--pf-border);
    border-radius: 12px;
    padding: 10px;
    text-align: center;
  }
  .pf-sub-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
  }
  .pf-sub-stat-lbl {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--pf-muted);
    margin-top: 2px;
  }

  .pf-progress-row {
    margin-bottom: 1rem;
  }
  .pf-progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin-bottom: 6px;
  }
  .pf-bar-bg {
    height: 6px;
    background: var(--pf-surface2);
    border-radius: 6px;
    overflow: hidden;
  }
  .pf-bar-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .pf-action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 1rem;
    border-top: 1px solid var(--pf-border);
  }
  .pf-card-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    border: none;
    transition: all 0.2s;
  }
  .pf-btn-purple { background: var(--pf-accent); color: #fff; }
  .pf-btn-purple:hover { background: #9074fd; transform: translateY(-1px); }
  .pf-btn-teal { background: var(--pf-accent2); color: #0A0B0F; }
  .pf-btn-teal:hover { opacity: 0.9; transform: translateY(-1px); }

  /* ── SUBJECT & TOPIC PERFORMANCE ── */
  .pf-subj-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 1.25rem;
  }
  .pf-subj-card {
    background: var(--pf-surface);
    border: 1px solid var(--pf-border);
    border-radius: 18px;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.25s;
    position: relative;
  }
  .pf-subj-card:hover {
    border-color: var(--pf-border2);
    transform: translateY(-2px);
    background: var(--pf-surface2);
  }
  .pf-subj-card.selected {
    border-color: var(--pf-accent2);
    box-shadow: 0 4px 20px rgba(0,229,192,0.12);
  }
  .pf-subj-card.selected::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--pf-accent2);
    border-radius: 18px 18px 0 0;
  }

  .pf-subj-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .pf-subj-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  .icon-teal { background: rgba(0,229,192,0.12); color: var(--pf-accent2); }
  .icon-coral { background: rgba(255,107,107,0.12); color: var(--pf-accent3); }
  .icon-purple { background: rgba(124,92,252,0.15); color: var(--pf-accent); }

  .pf-subj-name {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 3px;
  }
  .pf-subj-meta {
    font-size: 12px;
    color: var(--pf-muted);
    margin-bottom: 12px;
  }

  /* TOPIC DETAIL ACCORDION / DRAWER */
  .pf-topic-drawer {
    background: var(--pf-surface);
    border: 1px solid var(--pf-border2);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    animation: pf-fadein 0.3s ease;
  }
  @keyframes pf-fadein { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

  .pf-topic-drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--pf-border);
  }

  .pf-topic-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .pf-topic-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--pf-surface2);
    border: 1px solid var(--pf-border);
    border-radius: 14px;
    padding: 12px 16px;
    gap: 14px;
    transition: all 0.2s;
  }
  .pf-topic-item:hover {
    border-color: var(--pf-border2);
    transform: translateX(3px);
  }
  .pf-topic-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }
  .pf-topic-score-badge {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    min-width: 44px;
    padding: 5px 8px;
    border-radius: 8px;
    text-align: center;
  }
  .score-strength { background: rgba(0,229,192,0.15); color: var(--pf-accent2); }
  .score-attention { background: rgba(255,179,71,0.15); color: var(--pf-amber); }
  .score-critical { background: rgba(255,107,107,0.15); color: var(--pf-accent3); }

  .pf-topic-info { flex: 1; min-width: 0; }
  .pf-topic-title {
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pf-topic-sub {
    font-size: 12px;
    color: var(--pf-muted);
    display: flex;
    gap: 10px;
    margin-top: 2px;
  }

  .pf-topic-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pf-topic-pill {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 12px;
  }
  .pill-strength { background: rgba(0,229,192,0.1); color: var(--pf-accent2); }
  .pill-attention { background: rgba(255,179,71,0.1); color: var(--pf-amber); }
  .pill-critical { background: rgba(255,107,107,0.1); color: var(--pf-accent3); }

  .pf-practice-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(124,92,252,0.12);
    color: var(--pf-accent);
    border: 1px solid rgba(124,92,252,0.25);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .pf-practice-btn:hover {
    background: var(--pf-accent);
    color: #fff;
    transform: translateY(-1px);
  }

  /* ── STRENGTHS & WEAKNESSES MATRIX ── */
  .pf-matrix-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 2rem;
  }
  .pf-matrix-col {
    background: var(--pf-surface);
    border: 1px solid var(--pf-border);
    border-radius: 20px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .pf-matrix-col.strength { border-top: 3px solid var(--pf-accent2); }
  .pf-matrix-col.attention { border-top: 3px solid var(--pf-amber); }
  .pf-matrix-col.critical { border-top: 3px solid var(--pf-accent3); }

  .pf-matrix-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .pf-matrix-card {
    background: var(--pf-surface2);
    border: 1px solid var(--pf-border);
    border-radius: 12px;
    padding: 12px;
    transition: all 0.2s;
  }
  .pf-matrix-card:hover {
    border-color: var(--pf-border2);
    transform: translateY(-1px);
  }
  .pf-mc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .pf-mc-title { font-size: 13px; font-weight: 600; }
  .pf-mc-subj { font-size: 11px; color: var(--pf-muted); margin-bottom: 6px; }
  .pf-mc-reason { font-size: 11.5px; color: var(--pf-muted); line-height: 1.4; }

  /* ── MISTAKE ANALYSIS & DIAGNOSTICS ── */
  .pf-mistake-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 2rem;
  }
  .pf-mistake-panel {
    background: var(--pf-surface);
    border: 1px solid var(--pf-border);
    border-radius: 20px;
    padding: 1.5rem;
  }

  .pf-stacked-bar {
    display: flex;
    height: 12px;
    border-radius: 6px;
    overflow: hidden;
    margin: 1.25rem 0 1.5rem;
  }
  .pf-stack-seg {
    height: 100%;
    transition: width 0.6s ease;
  }

  .pf-mistake-cat-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .pf-mistake-cat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--pf-surface2);
    border: 1px solid var(--pf-border);
    border-radius: 10px;
  }
  .pf-cat-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }
  .pf-cat-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  .pf-cat-right {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 600;
  }

  .pf-rep-mistake-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-bottom: 1px solid var(--pf-border);
    gap: 10px;
  }
  .pf-rep-mistake-item:last-child { border-bottom: none; }
  .pf-rep-info strong { font-size: 13px; font-weight: 600; display: block; }
  .pf-rep-info span { font-size: 11px; color: var(--pf-muted); }

  /* ── RECENT ACTIVITY FEED ── */
  .pf-activity-panel {
    background: var(--pf-surface);
    border: 1px solid var(--pf-border);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  .pf-activity-list {
    display: flex;
    flex-direction: column;
  }
  .pf-activity-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    border-bottom: 1px solid var(--pf-border);
  }
  .pf-activity-row:last-child { border-bottom: none; }
  .pf-act-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .pf-act-info { flex: 1; min-width: 0; }
  .pf-act-info strong { font-size: 13.5px; font-weight: 600; display: block; }
  .pf-act-info span { font-size: 12px; color: var(--pf-muted); }
  .pf-act-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--pf-surface2);
    color: var(--pf-muted);
    border: 1px solid var(--pf-border2);
  }
  .pf-act-score {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 8px;
    min-width: 52px;
    text-align: center;
  }

  /* ── SIDEBAR ── */
  .pf-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 140; }
  [data-theme="light"] .pf-backdrop { background: rgba(0,0,0,0.25); }
  .pf-sidebar { position: fixed; top: 0; right: 0; height: 100%; width: 320px; background: var(--pf-surface); border-left: 1px solid var(--pf-border); z-index: 150; transition: transform 0.3s; }
  .pf-sidebar.open   { transform: translateX(0); }
  .pf-sidebar.closed { transform: translateX(100%); }
  .pf-sidebar-header { padding: 1.25rem; border-bottom: 1px solid var(--pf-border); display: flex; justify-content: space-between; align-items: center; }
  .pf-sidebar-close { background: none; border: none; color: var(--pf-muted); font-size: 16px; cursor: pointer; }
  .pf-sidebar-user { padding: 1.25rem; border-bottom: 1px solid var(--pf-border); }
  .pf-sidebar-menu { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; font-size: 14px; }
  .pf-sidebar-menu div { cursor: pointer; transition: color 0.2s; }
  .pf-sidebar-menu div:hover { color: var(--pf-accent2); }

  /* ── FOOTER ── */
  .pf-footer { border-top: 1px solid var(--pf-border); padding: 1.5rem 2rem; text-align: center; font-size: 12px; color: var(--pf-muted); display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--pf-bg); }
  .pf-footer-logo { width: 16px; height: 16px; border-radius: 4px; overflow: hidden; vertical-align: middle; }
  .pf-footer-logo img { width: 100%; height: 100%; object-fit: cover; }

  /* ── MOBILE RESPONSIVE ── */
  @media (max-width: 900px) {
    .pf-hero { grid-template-columns: 1fr; gap: 1.5rem; text-align: center; }
    .pf-hero-gauge-col { border-right: none; border-bottom: 1px solid var(--pf-border); padding-right: 0; padding-bottom: 1.5rem; }
    .pf-hero-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .pf-split-grid { grid-template-columns: 1fr; }
    .pf-subj-grid { grid-template-columns: 1fr; }
    .pf-matrix-grid { grid-template-columns: 1fr; }
    .pf-mistake-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .pf-nav { padding: 0.75rem 1rem; }
    .pf-nav-links { display: none; }
    .pf-main { padding: 1.25rem 1rem 3rem; }
    .pf-hero { padding: 1.5rem; border-radius: 18px; }
    .pf-trend-toolbar { flex-direction: column; align-items: flex-start; }
    .pf-topic-item { flex-direction: column; align-items: flex-start; }
    .pf-topic-right { width: 100%; justify-content: space-between; }
    .pf-sidebar { width: 85vw; max-width: 320px; }
  }
`;

/* ─── SUBJECT ICON RENDERER ─── */
const getSubjectIcon = (iconName, size = 20) => {
  switch (iconName) {
    case "Atom":
      return <Atom size={size} />;
    case "FlaskConical":
      return <FlaskConical size={size} />;
    case "Sigma":
      return <Sigma size={size} />;
    default:
      return <BookOpen size={size} />;
  }
};

/* ════════════════════════════════════════════════
   PERFORMANCE COMPONENT
════════════════════════════════════════════════ */
export default function Performance() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [openProfile, setOpenProfile] = useState(false);
  const [user, setUser] = useState({ name: "Student", email: "", avatar: "", streak: 6 });

  // Data states
  const [data] = useState(INITIAL_PERFORMANCE_DATA);
  const [timeRange, setTimeRange] = useState("7d"); // "7d" | "30d" | "all"
  const [activityTypeFilter, setActivityTypeFilter] = useState("all"); // "all" | "quiz" | "scan"
  const [selectedSubjectId, setSelectedSubjectId] = useState("physics");
  const [recentTab, setRecentTab] = useState("all"); // "all" | "quiz" | "scan"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        setUser((prev) => ({
          ...prev,
          name: u.name || "Student",
          email: u.email || "",
          avatar: u.avatar || "",
          streak: u.streak || 6
        }));
      }
    } catch (e) {
      console.warn("Could not parse user", e);
    }
  }, []);

  // Filtered timeline points for chart
  const timelinePoints = getFilteredTimeline(timeRange, activityTypeFilter);
  const selectedSubject = data.subjectPerformance.find((s) => s.id === selectedSubjectId) || data.subjectPerformance[0];

  // SVG Gauge calculations
  const overallScore = data.overall.scorePercent;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - overallScore / 100);

  // SVG Trend Line Chart Coordinates
  const chartW = 760;
  const chartH = 180;
  const pad = { top: 20, right: 30, bottom: 30, left: 40 };
  const innerW = chartW - pad.left - pad.right;
  const innerH = chartH - pad.top - pad.bottom;

  const maxVal = 100;
  const minVal = 40;
  const range = maxVal - minVal;

  const chartCoords = timelinePoints.map((pt, i) => {
    const x = pad.left + (i / Math.max(timelinePoints.length - 1, 1)) * innerW;
    const y = pad.top + innerH - ((pt.score - minVal) / range) * innerH;
    return { ...pt, x, y };
  });

  const pathD = chartCoords.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    // Smooth bezier curve
    const prev = chartCoords[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");

  const areaD = chartCoords.length > 0
    ? `${pathD} L ${chartCoords[chartCoords.length - 1].x} ${pad.top + innerH} L ${chartCoords[0].x} ${pad.top + innerH} Z`
    : "";

  // Filtered recent activity
  const filteredRecentActivity = data.recentActivity.filter((act) => {
    if (recentTab === "all") return true;
    return act.type === recentTab;
  });

  const handlePracticeTopic = (subjectName, topicName) => {
    navigate("/QuizSetup", { state: { prefilledSubject: subjectName, prefilledTopic: topicName } });
  };

  return (
    <>
      <style>{css}</style>
      <div className="pf-root">
        {/* ── TOP NAV ── */}
        <nav className="pf-nav">
          <div className="pf-logo" onClick={() => navigate("/dashboard")}>
            <div className="pf-logo-icon">
              <img src="/favicon-32.png" alt="Gyantra" />
            </div>
            Gyan<span>tra</span>
          </div>

          <ul className="pf-nav-links">
            <li><a onClick={() => navigate("/dashboard")}>Dashboard</a></li>
            <li><a className="active">Performance</a></li>
            <li><a onClick={() => navigate("/analytics")}>Analytics</a></li>
            <li><a onClick={() => navigate("/gyans")}>GyanS</a></li>
            <li><a onClick={() => navigate("/results/history")}>History</a></li>
          </ul>

          <div className="pf-nav-right">
            <div className="pf-streak">
              <Flame size={14} /> {user.streak} day streak
            </div>

            <button
              className="pf-theme-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>

            <div onClick={() => setOpenProfile(true)} style={{ cursor: "pointer" }}>
              <AvatarRender avatar={user.avatar} name={user.name} size={36} fontSize={14} />
            </div>
          </div>
        </nav>

        <main className="pf-main">
          {/* ════════════════════════════════════════════════
              SECTION 1: OVERALL PERFORMANCE HERO
          ════════════════════════════════════════════════ */}
          <section className="pf-hero">
            <div className="pf-hero-gauge-col">
              <div className="pf-gauge-container">
                <svg className="pf-gauge-svg" viewBox="0 0 170 170">
                  <defs>
                    <linearGradient id="pfGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--pf-accent)" />
                      <stop offset="50%" stopColor="var(--pf-accent2)" />
                      <stop offset="100%" stopColor="#00E5C0" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="var(--pf-surface3)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="85"
                    cy="85"
                    r={radius}
                    fill="none"
                    stroke="url(#pfGaugeGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                  />
                </svg>
                <div className="pf-gauge-center">
                  <div className="pf-gauge-val">
                    {overallScore}<span className="pf-gauge-unit">%</span>
                  </div>
                  <div className="pf-gauge-sub">Overall Score</div>
                </div>
              </div>

              <div className="pf-delta-badge">
                <TrendingUp size={14} /> {data.overall.scoreDelta} vs last cycle
              </div>
            </div>

            <div className="pf-hero-details">
              <div className="pf-hero-header-row">
                <h1 className="pf-hero-title">
                  Performance <span>Overview</span>
                </h1>
                <button
                  className="pf-card-btn pf-btn-purple"
                  onClick={() => navigate("/QuizSetup")}
                >
                  <Zap size={14} /> Start Adaptive Drill
                </button>
              </div>

              <p className="pf-hero-desc">
                Your complete learning analytics across all interactive quizzes, GyanS PYQ extractions, and diagnostic assessments.
              </p>

              <div className="pf-hero-kpi-grid">
                <div className="pf-hero-kpi">
                  <div className="pf-kpi-label"><Target size={12} /> Accuracy</div>
                  <div className="pf-kpi-value" style={{ color: "var(--pf-accent2)" }}>
                    {data.overall.accuracy}%
                  </div>
                  <div className="pf-kpi-sub">{data.overall.accuracyDelta} gain</div>
                </div>

                <div className="pf-hero-kpi">
                  <div className="pf-kpi-label"><BarChart3 size={12} /> Questions</div>
                  <div className="pf-kpi-value">
                    {data.overall.totalAttempted}
                  </div>
                  <div className="pf-kpi-sub">
                    <span style={{ color: "var(--pf-accent2)" }}>{data.overall.totalCorrect} correct</span> · {data.overall.totalIncorrect} err
                  </div>
                </div>

                <div className="pf-hero-kpi">
                  <div className="pf-kpi-label"><Clock size={12} /> Pace / Q</div>
                  <div className="pf-kpi-value" style={{ color: "var(--pf-amber)" }}>
                    {data.overall.avgTimePerQuestionSec}s
                  </div>
                  <div className="pf-kpi-sub">{data.overall.timeDelta}</div>
                </div>

                <div className="pf-hero-kpi">
                  <div className="pf-kpi-label"><Layers size={12} /> Activities</div>
                  <div className="pf-kpi-value">
                    {data.overall.quizzesCompleted + data.overall.scansCompleted}
                  </div>
                  <div className="pf-kpi-sub">
                    {data.overall.quizzesCompleted} Quizzes · {data.overall.scansCompleted} Scans
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════
              SECTION 2: PERFORMANCE TREND
          ════════════════════════════════════════════════ */}
          <div className="pf-section-header">
            <div className="pf-section-title-wrap">
              <div className="pf-section-icon-badge"><TrendingUp size={18} /></div>
              <div>
                <h2 className="pf-section-title">Performance Trend</h2>
                <p className="pf-section-sub">Track your progress and improvement over time across all activities</p>
              </div>
            </div>
          </div>

          <div className="pf-card" style={{ marginBottom: "2rem" }}>
            <div className="pf-trend-toolbar">
              {/* Activity Type filter */}
              <div className="pf-filter-group">
                <button
                  className={`pf-filter-btn${activityTypeFilter === "all" ? " active" : ""}`}
                  onClick={() => setActivityTypeFilter("all")}
                >
                  All Activity
                </button>
                <button
                  className={`pf-filter-btn${activityTypeFilter === "quiz" ? " active" : ""}`}
                  onClick={() => setActivityTypeFilter("quiz")}
                >
                  Quizzes Only
                </button>
                <button
                  className={`pf-filter-btn${activityTypeFilter === "scan" ? " active" : ""}`}
                  onClick={() => setActivityTypeFilter("scan")}
                >
                  GyanS Scans
                </button>
              </div>

              {/* Time range filter */}
              <div className="pf-filter-group">
                <button
                  className={`pf-filter-btn${timeRange === "7d" ? " active" : ""}`}
                  onClick={() => setTimeRange("7d")}
                >
                  7 Days
                </button>
                <button
                  className={`pf-filter-btn${timeRange === "30d" ? " active" : ""}`}
                  onClick={() => setTimeRange("30d")}
                >
                  30 Days
                </button>
                <button
                  className={`pf-filter-btn${timeRange === "all" ? " active" : ""}`}
                  onClick={() => setTimeRange("all")}
                >
                  All Time
                </button>
              </div>
            </div>

            {/* Interactive SVG Trend Line Chart */}
            <div className="pf-chart-wrapper">
              <svg className="pf-chart-svg" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pfAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--pf-accent2)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--pf-accent2)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Y-axis gridlines */}
                {[40, 60, 80, 100].map((val) => {
                  const y = pad.top + innerH - ((val - minVal) / range) * innerH;
                  return (
                    <g key={val}>
                      <line x1={pad.left} y1={y} x2={chartW - pad.right} y2={y} className="pf-chart-grid" />
                      <text x={pad.left - 8} y={y + 4} textAnchor="end" className="pf-chart-axis-text">
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Gradient area */}
                {areaD && <path d={areaD} fill="url(#pfAreaGrad)" />}

                {/* Main line path */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--pf-accent2)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Points */}
                {chartCoords.map((pt, idx) => (
                  <g key={idx} onMouseEnter={() => setHoveredPoint(pt)} onMouseLeave={() => setHoveredPoint(null)}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint?.id === pt.id ? 7 : 4.5}
                      fill={pt.type === "quiz" ? "var(--pf-accent)" : "var(--pf-accent2)"}
                      stroke="var(--pf-surface)"
                      strokeWidth="2.5"
                      style={{ cursor: "pointer", transition: "all 0.15s" }}
                    />
                    <text x={pt.x} y={chartH - 8} textAnchor="middle" className="pf-chart-axis-text">
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip */}
              {hoveredPoint && (
                <div
                  className="pf-chart-tooltip"
                  style={{
                    left: `${(hoveredPoint.x / chartW) * 100}%`,
                    top: `${(hoveredPoint.y / chartH) * 100}%`
                  }}
                >
                  <div className="pf-tooltip-title">{hoveredPoint.title}</div>
                  <div className="pf-tooltip-meta">
                    <span>{hoveredPoint.type === "quiz" ? "📝 Quiz" : "📷 GyanS Scan"}</span>
                    <span className="pf-tooltip-score">{hoveredPoint.score}%</span>
                  </div>
                  <div className="pf-tooltip-meta" style={{ marginTop: 2 }}>
                    <span>{hoveredPoint.correct}/{hoveredPoint.total} correct</span>
                    <span>{hoveredPoint.timeTaken}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pf-trend-footer">
              <div className="pf-trend-insight">
                <Sparkles size={14} /> Upward momentum: +16% score increase over this window
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--pf-accent)" }} /> Quizzes
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--pf-accent2)" }} /> GyanS Scans
                </span>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              SECTIONS 3 & 4: QUIZ VS SCAN PERFORMANCE SPLIT
          ════════════════════════════════════════════════ */}
          <div className="pf-split-grid">
            {/* QUIZ PERFORMANCE */}
            <div className="pf-metric-card">
              <div>
                <div className="pf-metric-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(124,92,252,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pf-accent)" }}>
                      <Zap size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>Quiz Performance</h3>
                      <p style={{ fontSize: 11, color: "var(--pf-muted)" }}>Adaptive tests & chapter quizzes</p>
                    </div>
                  </div>
                  <span className="pf-metric-badge badge-purple">{data.quizPerformance.totalQuizzes} Quizzes</span>
                </div>

                <div className="pf-metric-stat-row">
                  <div className="pf-sub-stat">
                    <div className="pf-sub-stat-val" style={{ color: "var(--pf-accent)" }}>{data.quizPerformance.avgScore}%</div>
                    <div className="pf-sub-stat-lbl">Avg Score</div>
                  </div>
                  <div className="pf-sub-stat">
                    <div className="pf-sub-stat-val" style={{ color: "var(--pf-accent2)" }}>{data.quizPerformance.bestScore}%</div>
                    <div className="pf-sub-stat-lbl">Best Score</div>
                  </div>
                  <div className="pf-sub-stat">
                    <div className="pf-sub-stat-val">{data.quizPerformance.avgAccuracy}%</div>
                    <div className="pf-sub-stat-lbl">Accuracy</div>
                  </div>
                </div>

                <div className="pf-progress-row">
                  <div className="pf-progress-labels">
                    <span style={{ color: "var(--pf-muted)" }}>Accuracy by Difficulty</span>
                    <span style={{ fontWeight: 600 }}>{data.quizPerformance.improvementTrend}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {data.quizPerformance.difficultyBreakdown.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
                        <span style={{ width: 50, color: "var(--pf-muted)" }}>{d.level}</span>
                        <div className="pf-bar-bg" style={{ flex: 1 }}>
                          <div className="pf-bar-fill" style={{ width: `${d.accuracy}%`, background: d.color }} />
                        </div>
                        <span style={{ width: 34, textAlign: "right", fontWeight: 700 }}>{d.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pf-action-row">
                <span style={{ fontSize: 12, color: "var(--pf-muted)" }}>Avg Time: {data.quizPerformance.avgCompletionTime}</span>
                <button className="pf-card-btn pf-btn-purple" onClick={() => navigate("/QuizSetup")}>
                  Start Quiz <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* SCAN PERFORMANCE (EQUAL STATURE) */}
            <div className="pf-metric-card">
              <div>
                <div className="pf-metric-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,229,192,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pf-accent2)" }}>
                      <ScanLine size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>Scan Performance</h3>
                      <p style={{ fontSize: 11, color: "var(--pf-muted)" }}>GyanS OCR Paper & PYQ Analysis</p>
                    </div>
                  </div>
                  <span className="pf-metric-badge badge-teal">{data.scanPerformance.totalScans} Scans</span>
                </div>

                <div className="pf-metric-stat-row">
                  <div className="pf-sub-stat">
                    <div className="pf-sub-stat-val" style={{ color: "var(--pf-accent2)" }}>{data.scanPerformance.scanAccuracy}%</div>
                    <div className="pf-sub-stat-lbl">Scan Accuracy</div>
                  </div>
                  <div className="pf-sub-stat">
                    <div className="pf-sub-stat-val">{data.scanPerformance.questionsAnalyzed}</div>
                    <div className="pf-sub-stat-lbl">Extracted Qs</div>
                  </div>
                  <div className="pf-sub-stat">
                    <div className="pf-sub-stat-val" style={{ color: "var(--pf-amber)" }}>{data.scanPerformance.ocrConfidenceAvg}</div>
                    <div className="pf-sub-stat-lbl">OCR Precision</div>
                  </div>
                </div>

                <div className="pf-progress-row">
                  <div className="pf-progress-labels">
                    <span style={{ color: "var(--pf-muted)" }}>Extracted Source Material</span>
                    <span style={{ fontWeight: 600 }}>Top Subject: {data.scanPerformance.topScannedSubject}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {data.scanPerformance.scanTypeBreakdown.map((st, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
                        <span style={{ width: 130, color: "var(--pf-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{st.type}</span>
                        <div className="pf-bar-bg" style={{ flex: 1 }}>
                          <div className="pf-bar-fill" style={{ width: `${st.percentage}%`, background: "var(--pf-accent2)" }} />
                        </div>
                        <span style={{ width: 34, textAlign: "right", fontWeight: 700 }}>{st.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pf-action-row">
                <span style={{ fontSize: 12, color: "var(--pf-muted)" }}>Avg OCR Extraction: {data.scanPerformance.avgScanDurationSec}</span>
                <button className="pf-card-btn pf-btn-teal" onClick={() => navigate("/gyans")}>
                  Scan Paper <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              SECTION 5: SUBJECT & TOPIC BREAKDOWN
          ════════════════════════════════════════════════ */}
          <div className="pf-section-header">
            <div className="pf-section-title-wrap">
              <div className="pf-section-icon-badge" style={{ background: "rgba(0,229,192,0.12)", color: "var(--pf-accent2)" }}>
                <BookOpen size={18} />
              </div>
              <div>
                <h2 className="pf-section-title">Subject & Topic Breakdown</h2>
                <p className="pf-section-sub">Select a subject below to inspect granular topic mastery and pace</p>
              </div>
            </div>
          </div>

          {/* Subject Cards */}
          <div className="pf-subj-grid">
            {data.subjectPerformance.map((subj) => {
              const isSelected = selectedSubjectId === subj.id;
              const icon = getSubjectIcon(subj.iconName, 20);
              return (
                <div
                  key={subj.id}
                  className={`pf-subj-card${isSelected ? " selected" : ""}`}
                  onClick={() => setSelectedSubjectId(subj.id)}
                >
                  <div className="pf-subj-top">
                    <div className={`pf-subj-icon icon-${subj.color}`}>{icon}</div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: subj.fill }}>
                        {subj.score}%
                      </div>
                      <div style={{ fontSize: 10, color: "var(--pf-muted)", textTransform: "uppercase" }}>Overall Score</div>
                    </div>
                  </div>

                  <h3 className="pf-subj-name">{subj.subject}</h3>
                  <p className="pf-subj-meta">{subj.totalQuestions} questions answered · {subj.accuracy}% accuracy</p>

                  <div className="pf-bar-bg" style={{ height: 5, marginBottom: 8 }}>
                    <div className="pf-bar-fill" style={{ width: `${subj.score}%`, background: subj.fill }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--pf-muted)" }}>
                    <span>{subj.topics.length} Key Topics</span>
                    <span style={{ color: subj.isPositive ? "var(--pf-accent2)" : "var(--pf-accent3)", fontWeight: 600 }}>
                      {subj.trend} vs avg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Topic Detail Drawer */}
          {selectedSubject && (
            <div className="pf-topic-drawer">
              <div className="pf-topic-drawer-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={`pf-subj-icon icon-${selectedSubject.color}`} style={{ width: 34, height: 34 }}>
                    {getSubjectIcon(selectedSubject.iconName, 18)}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700 }}>
                      {selectedSubject.subject} Topics
                    </h3>
                    <p style={{ fontSize: 12, color: "var(--pf-muted)" }}>
                      Target specific topics to boost your overall {selectedSubject.subject} score
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--pf-muted)" }}>
                  Click <strong>Practice</strong> to launch an instant quiz
                </div>
              </div>

              <div className="pf-topic-list">
                {selectedSubject.topics.map((t) => {
                  const scoreClass = t.status === "strength" ? "score-strength" : t.status === "needs_attention" ? "score-attention" : "score-critical";
                  const pillClass = t.status === "strength" ? "pill-strength" : t.status === "needs_attention" ? "pill-attention" : "pill-critical";
                  return (
                    <div key={t.id} className="pf-topic-item">
                      <div className="pf-topic-left">
                        <div className={`pf-topic-score-badge ${scoreClass}`}>{t.score}%</div>
                        <div className="pf-topic-info">
                          <div className="pf-topic-title">{t.name}</div>
                          <div className="pf-topic-sub">
                            <span>{t.correct}/{t.totalQuestions} correct</span>
                            <span>·</span>
                            <span>{t.avgTime} pace</span>
                          </div>
                        </div>
                      </div>

                      <div className="pf-topic-right">
                        <span className={`pf-topic-pill ${pillClass}`}>{t.statusLabel}</span>
                        <button
                          className="pf-practice-btn"
                          onClick={() => handlePracticeTopic(selectedSubject.subject, t.name)}
                        >
                          Practice <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              SECTION 6: STRENGTHS & WEAKNESSES MATRIX
          ════════════════════════════════════════════════ */}
          <div className="pf-section-header">
            <div className="pf-section-title-wrap">
              <div className="pf-section-icon-badge" style={{ background: "rgba(255,179,71,0.12)", color: "var(--pf-amber)" }}>
                <Target size={18} />
              </div>
              <div>
                <h2 className="pf-section-title">Diagnostic Matrix: Strengths & Weaknesses</h2>
                <p className="pf-section-sub">Continuous classification based on retention, pace, and mistake patterns</p>
              </div>
            </div>
          </div>

          <div className="pf-matrix-grid">
            {/* Strengths */}
            <div className="pf-matrix-col strength">
              <div className="pf-matrix-header" style={{ color: "var(--pf-accent2)" }}>
                <CheckCircle2 size={16} /> Your Strengths ({data.strengthsAndWeaknesses.strengths.length})
              </div>
              {data.strengthsAndWeaknesses.strengths.map((item) => (
                <div key={item.id} className="pf-matrix-card">
                  <div className="pf-mc-top">
                    <span className="pf-mc-title">{item.topic}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "var(--pf-accent2)", fontSize: 13 }}>
                      {item.score}%
                    </span>
                  </div>
                  <div className="pf-mc-subj">{item.subject}</div>
                  <div className="pf-mc-reason">{item.reason}</div>
                </div>
              ))}
            </div>

            {/* Needs Attention */}
            <div className="pf-matrix-col attention">
              <div className="pf-matrix-header" style={{ color: "var(--pf-amber)" }}>
                <AlertTriangle size={16} /> Needs Attention ({data.strengthsAndWeaknesses.needsAttention.length})
              </div>
              {data.strengthsAndWeaknesses.needsAttention.map((item) => (
                <div key={item.id} className="pf-matrix-card">
                  <div className="pf-mc-top">
                    <span className="pf-mc-title">{item.topic}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "var(--pf-amber)", fontSize: 13 }}>
                      {item.score}%
                    </span>
                  </div>
                  <div className="pf-mc-subj">{item.subject}</div>
                  <div className="pf-mc-reason">{item.reason}</div>
                </div>
              ))}
            </div>

            {/* Critical Areas */}
            <div className="pf-matrix-col critical">
              <div className="pf-matrix-header" style={{ color: "var(--pf-accent3)" }}>
                <AlertOctagon size={16} /> Critical Focus ({data.strengthsAndWeaknesses.criticalAreas.length})
              </div>
              {data.strengthsAndWeaknesses.criticalAreas.map((item) => (
                <div key={item.id} className="pf-matrix-card">
                  <div className="pf-mc-top">
                    <span className="pf-mc-title">{item.topic}</span>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "var(--pf-accent3)", fontSize: 13 }}>
                      {item.score}%
                    </span>
                  </div>
                  <div className="pf-mc-subj">{item.subject}</div>
                  <div className="pf-mc-reason">{item.reason}</div>
                  <button
                    className="pf-practice-btn"
                    style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
                    onClick={() => handlePracticeTopic(item.subject, item.topic)}
                  >
                    Targeted Practice <ChevronRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              SECTION 7: MISTAKE ANALYSIS & PATTERNS
          ════════════════════════════════════════════════ */}
          <div className="pf-section-header">
            <div className="pf-section-title-wrap">
              <div className="pf-section-icon-badge" style={{ background: "rgba(255,107,107,0.12)", color: "var(--pf-accent3)" }}>
                <HelpCircle size={18} />
              </div>
              <div>
                <h2 className="pf-section-title">Mistake Analysis & Error Distribution</h2>
                <p className="pf-section-sub">Gyantra classifies the root reason behind missed questions to prevent recurring slips</p>
              </div>
            </div>
          </div>

          <div className="pf-mistake-grid">
            {/* Error Category Breakdown */}
            <div className="pf-mistake-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>Error Classification</h3>
                <span style={{ fontSize: 12, color: "var(--pf-muted)" }}>{data.mistakeAnalysis.totalMistakes} Total Errors Logged</span>
              </div>

              {/* Stacked color bar */}
              <div className="pf-stacked-bar">
                {data.mistakeAnalysis.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="pf-stack-seg"
                    style={{ width: `${cat.percent}%`, background: cat.color }}
                    title={`${cat.label}: ${cat.percent}%`}
                  />
                ))}
              </div>

              <div className="pf-mistake-cat-list">
                {data.mistakeAnalysis.categories.map((cat) => (
                  <div key={cat.id} className="pf-mistake-cat-item">
                    <div className="pf-cat-left">
                      <span className="pf-cat-dot" style={{ background: cat.color }} />
                      <div>
                        <strong>{cat.label}</strong>
                        <div style={{ fontSize: 11, color: "var(--pf-muted)" }}>{cat.description}</div>
                      </div>
                    </div>
                    <div className="pf-cat-right">
                      <span>{cat.count} err</span>
                      <span style={{ color: cat.color }}>{cat.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Repeated Mistakes / Frequent Traps */}
            <div className="pf-mistake-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>High-Frequency Traps</h3>
                <span style={{ fontSize: 11, color: "var(--pf-accent3)", fontWeight: 600 }}>Needs Revision</span>
              </div>

              <div>
                {data.mistakeAnalysis.repeatedMistakes.map((rm, idx) => (
                  <div key={idx} className="pf-rep-mistake-item">
                    <div className="pf-rep-info">
                      <strong>{rm.topic}</strong>
                      <span>{rm.subject} · {rm.category} error · Last seen {rm.lastOccurred}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: rm.count >= 5 ? "rgba(255,107,107,0.15)" : "rgba(255,179,71,0.15)",
                        color: rm.count >= 5 ? "var(--pf-accent3)" : "var(--pf-amber)"
                      }}>
                        {rm.count} mistakes
                      </span>
                      <button
                        className="pf-practice-btn"
                        onClick={() => handlePracticeTopic(rm.subject, rm.topic)}
                      >
                        Fix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              SECTION 8: UNIFIED RECENT ACTIVITY
          ════════════════════════════════════════════════ */}
          <div className="pf-section-header">
            <div className="pf-section-title-wrap">
              <div className="pf-section-icon-badge" style={{ background: "rgba(124,92,252,0.12)", color: "var(--pf-accent)" }}>
                <Layers size={18} />
              </div>
              <div>
                <h2 className="pf-section-title">Recent Learning Activity</h2>
                <p className="pf-section-sub">Complete log of recent quiz attempts and GyanS scanned papers</p>
              </div>
            </div>
            <div className="pf-filter-group">
              <button
                className={`pf-filter-btn${recentTab === "all" ? " active" : ""}`}
                onClick={() => setRecentTab("all")}
              >
                All
              </button>
              <button
                className={`pf-filter-btn${recentTab === "quiz" ? " active" : ""}`}
                onClick={() => setRecentTab("quiz")}
              >
                Quizzes
              </button>
              <button
                className={`pf-filter-btn${recentTab === "scan" ? " active" : ""}`}
                onClick={() => setRecentTab("scan")}
              >
                Scans
              </button>
            </div>
          </div>

          <div className="pf-activity-panel">
            <div className="pf-activity-list">
              {filteredRecentActivity.map((act) => {
                const isQuiz = act.type === "quiz";
                const scoreColor = act.score >= 85 ? "var(--pf-accent2)" : act.score >= 70 ? "var(--pf-accent)" : "var(--pf-amber)";
                const scoreBg = act.score >= 85 ? "rgba(0,229,192,0.12)" : act.score >= 70 ? "rgba(124,92,252,0.12)" : "rgba(255,179,71,0.12)";

                return (
                  <div key={act.id} className="pf-activity-row">
                    <div className="pf-act-icon" style={{
                      background: isQuiz ? "rgba(124,92,252,0.12)" : "rgba(0,229,192,0.12)",
                      color: isQuiz ? "var(--pf-accent)" : "var(--pf-accent2)"
                    }}>
                      {isQuiz ? <Zap size={18} /> : <ScanLine size={18} />}
                    </div>

                    <div className="pf-act-info">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <strong>{act.title}</strong>
                        <span className="pf-act-badge">{act.badge}</span>
                      </div>
                      <span>{act.subject} · {act.correct}/{act.total} questions ({act.timeTaken}) · {act.date}</span>
                    </div>

                    <div className="pf-act-score" style={{ background: scoreBg, color: scoreColor }}>
                      {act.score}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* ── PROFILE SIDEBAR ── */}
        {openProfile && (
          <div className="pf-backdrop" onClick={() => setOpenProfile(false)} />
        )}
        <div className={`pf-sidebar${openProfile ? " open" : " closed"}`}>
          <div className="pf-sidebar-header">
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Profile</h2>
            <button className="pf-sidebar-close" onClick={() => setOpenProfile(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="pf-sidebar-user">
            <p style={{ fontWeight: 600 }}>{user.name}</p>
            <p style={{ fontSize: 13, color: "var(--pf-muted)" }}>{user.email || "student@gyantra.com"}</p>
          </div>
          <div className="pf-sidebar-menu">
            <div onClick={() => navigate("/dashboard")}>Dashboard</div>
            <div onClick={() => navigate("/profile")}>My Profile</div>
            <div onClick={() => navigate("/performance")} style={{ color: "var(--pf-accent2)", fontWeight: 600 }}>Performance</div>
            <div onClick={() => navigate("/analytics")}>Analytics</div>
            <div onClick={() => navigate("/gyans")}>GyanS Scanner</div>
            <div onClick={() => navigate("/results/history")}>History</div>
            <div onClick={() => navigate("/bookmarks")}>Bookmarks</div>
            <div style={{ color: "var(--pf-accent3)" }} onClick={() => { localStorage.clear(); navigate("/login"); }}>Logout</div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="pf-footer">
          <span className="pf-footer-logo"><img src="/favicon-32.png" alt="" /></span>
          © {new Date().getFullYear()} Gyantra. All rights reserved.
        </footer>
      </div>
    </>
  );
}
