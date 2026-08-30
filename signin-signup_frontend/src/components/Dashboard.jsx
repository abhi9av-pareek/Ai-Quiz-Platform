import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Sigma, Atom, FlaskConical, Leaf, Monitor, PenLine, BookOpen, ScanLine, Target, Bookmark, Users, Flame, X, Brain, TrendingDown, TrendingUp, ChevronRight, ChevronDown, Code, Layers, Zap, Award, Lightbulb } from "lucide-react";
import { AvatarRender } from "./Profile";

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
  [data-theme="light"] {
    --bb-bg: #F5F5FA; --bb-surface: #FFFFFF; --bb-surface2: #F0EFF8;
    --bb-border: rgba(0,0,0,0.07); --bb-border2: rgba(0,0,0,0.12);
    --bb-text: #0A0B0F; --bb-muted: #7B7A8C; --bb-muted2: #C8C7D4;
  }
  .bb-root { font-family: 'DM Sans', sans-serif; background: var(--bb-bg); color: var(--bb-text); min-height: 100vh; transition: background .3s, color .3s; }

  /* NAV */
  .bb-nav { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; border-bottom: 1px solid var(--bb-border); background: rgba(10,11,15,0.95); position: sticky; top: 0; z-index: 100; transition: background .3s; }
  [data-theme="light"] .bb-nav { background: rgba(245,245,250,0.95); }
  .bb-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; }
  .bb-logo-icon { width: 34px; height: 34px; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .bb-logo-icon img { width: 100%; height: 100%; object-fit: cover; display: block; }
  /* FOOTER */
  .bb-footer { border-top: 1px solid var(--bb-border); padding: 1.5rem 2rem; text-align: center; font-size: 12px; color: var(--bb-muted); display: flex; align-items: center; justify-content: center; gap: 6px; background: var(--bb-bg); }
  .bb-footer-logo { width: 16px; height: 16px; border-radius: 4px; overflow: hidden; vertical-align: middle; }
  .bb-footer-logo img { width: 100%; height: 100%; object-fit: cover; }
  .bb-logo span { color: var(--bb-accent2); }
  .bb-nav-links { display: flex; gap: 2rem; list-style: none; }
  .bb-nav-links a { font-size: 14px; color: var(--bb-muted); text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
  .bb-nav-links a:hover { color: var(--bb-text); }
  .bb-nav-links a.active { color: var(--bb-accent2); }
  .bb-nav-right { display: flex; align-items: center; gap: 12px; }
  .bb-streak { display: flex; align-items: center; gap: 6px; background: rgba(255,179,71,0.12); border: 1px solid rgba(255,179,71,0.25); border-radius: 20px; padding: 5px 12px; font-size: 13px; font-weight: 500; color: var(--bb-amber); }
  .bb-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--bb-accent), #FF6B6B); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; overflow: hidden; }

  /* MAIN */
  .bb-main { padding: 2rem 2rem 4rem; max-width: 1200px; margin: 0 auto; }

  /* LOADING */
  .bb-loading { display: flex; align-items: center; justify-content: center; height: 60vh; font-size: 15px; color: var(--bb-muted); gap: 10px; }
  .bb-spinner { width: 20px; height: 20px; border: 2px solid var(--bb-border2); border-top-color: var(--bb-accent); border-radius: 50%; animation: bb-spin 0.7s linear infinite; }

  /* HERO */
  .bb-hero { background: var(--bb-surface); border: 1px solid var(--bb-border2); border-radius: 20px; padding: 2.5rem; margin-bottom: 2rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: space-between; transition: background .3s; }
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
  .bb-progress-bar { height: 4px; background: var(--bb-muted2); border-radius: 4px; margin-bottom: 6px; }
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

  /* WEAK SUBJECTS — Grouped Accordion */
  .bb-weak-panel { background: var(--bb-surface); border: 1px solid var(--bb-border2); border-radius: 18px; padding: 1.5rem; margin-bottom: 2rem; animation: bb-weak-slide-in 0.35s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes bb-weak-slide-in { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
  .bb-weak-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
  .bb-weak-header-left { display: flex; align-items: center; gap: 10px; }
  .bb-weak-header-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,107,107,0.12); display: flex; align-items: center; justify-content: center; color: var(--bb-accent3); }
  .bb-weak-header h2 { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }
  .bb-weak-header-sub { font-size: 12px; color: var(--bb-muted); margin-top: 1px; }
  .bb-weak-close { background: none; border: 1px solid var(--bb-border2); width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--bb-muted); transition: all .2s; }
  .bb-weak-close:hover { border-color: var(--bb-accent3); color: var(--bb-accent3); }

  /* Subject accordion cards */
  .bb-weak-subjects { display: flex; flex-direction: column; gap: 10px; }
  .bb-weak-subj-card { background: var(--bb-surface2); border: 1px solid var(--bb-border); border-radius: 14px; overflow: hidden; transition: all .25s; }
  .bb-weak-subj-card:hover { border-color: var(--bb-border2); }
  .bb-weak-subj-card.expanded { border-color: rgba(124,92,252,0.25); box-shadow: 0 4px 20px rgba(124,92,252,0.08); }

  .bb-weak-subj-head { display: flex; align-items: center; gap: 14px; padding: 1rem 1.25rem; cursor: pointer; transition: background .2s; }
  .bb-weak-subj-head:hover { background: rgba(255,255,255,0.02); }
  [data-theme="light"] .bb-weak-subj-head:hover { background: rgba(0,0,0,0.02); }

  .bb-weak-subj-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  .bb-weak-score-ring { width: 44px; height: 44px; position: relative; flex-shrink: 0; }
  .bb-weak-score-ring svg { transform: rotate(-90deg); }
  .bb-weak-score-num { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; }

  .bb-weak-subj-info { flex: 1; min-width: 0; }
  .bb-weak-subj-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .bb-weak-subj-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--bb-muted); }
  .bb-weak-subj-meta .meta-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--bb-muted2); }

  .bb-weak-subj-right { display: flex; align-items: center; gap: 10px; }
  .bb-weak-subj-progress { width: 60px; }
  .bb-weak-progress-bar { height: 4px; background: var(--bb-muted2); border-radius: 4px; overflow: hidden; }
  .bb-weak-progress-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
  .bb-weak-subj-chevron { color: var(--bb-muted); transition: transform .3s cubic-bezier(.4,0,.2,1); display: flex; align-items: center; }
  .bb-weak-subj-chevron.open { transform: rotate(180deg); color: var(--bb-accent); }

  /* Expanded topics list inside a subject */
  .bb-weak-topics-inner { border-top: 1px solid var(--bb-border); padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 8px; animation: bb-topics-expand 0.3s ease; }
  @keyframes bb-topics-expand { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }

  .bb-weak-topic-row { display: flex; align-items: center; gap: 12px; padding: 0.7rem 0.75rem; background: var(--bb-surface); border: 1px solid var(--bb-border); border-radius: 10px; transition: all .2s; position: relative; }
  .bb-weak-topic-row:hover { border-color: var(--bb-border2); transform: translateX(2px); }
  .bb-weak-topic-row::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 10px 0 0 10px; }
  .bb-weak-topic-row.severity-critical::before { background: var(--bb-accent3); }
  .bb-weak-topic-row.severity-warning::before { background: var(--bb-amber); }
  .bb-weak-topic-row.severity-mild::before { background: #FFE333; }

  .bb-weak-topic-score { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; min-width: 38px; text-align: center; padding: 4px 8px; border-radius: 8px; flex-shrink: 0; }
  .bb-weak-topic-score.ts-critical { background: rgba(255,107,107,0.12); color: var(--bb-accent3); }
  .bb-weak-topic-score.ts-warning { background: rgba(255,179,71,0.12); color: var(--bb-amber); }
  .bb-weak-topic-score.ts-mild { background: rgba(255,220,50,0.12); color: #FFE333; }

  .bb-weak-topic-info { flex: 1; min-width: 0; }
  .bb-weak-topic-name { font-size: 13px; font-weight: 600; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bb-weak-topic-hint { font-size: 11px; color: var(--bb-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

  .bb-weak-practice-btn { display: flex; align-items: center; gap: 4px; background: rgba(124,92,252,0.1); border: 1px solid rgba(124,92,252,0.2); border-radius: 10px; padding: 6px 12px; color: var(--bb-accent); font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s; white-space: nowrap; font-family: 'DM Sans', sans-serif; flex-shrink: 0; }
  .bb-weak-practice-btn:hover { background: rgba(124,92,252,0.18); border-color: rgba(124,92,252,0.35); transform: translateY(-1px); }

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
  [data-theme="light"] .bb-backdrop { background: rgba(0,0,0,0.25); }
  .bb-sidebar { position: fixed; top: 0; right: 0; height: 100%; width: 320px; background: var(--bb-surface); border-left: 1px solid var(--bb-border); z-index: 50; transition: transform 0.3s, background .3s; }

  /* THEME TOGGLE */
  .bb-theme-btn { width: 36px; height: 36px; border-radius: 10px; background: var(--bb-surface2); border: 1px solid var(--bb-border2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; color: var(--bb-muted); }
  .bb-theme-btn:hover { border-color: var(--bb-accent); color: var(--bb-accent); }
  .bb-sidebar.open   { transform: translateX(0); }
  .bb-sidebar.closed { transform: translateX(100%); }
  .bb-sidebar-header { padding: 1.25rem; border-bottom: 1px solid var(--bb-border); display: flex; justify-content: space-between; align-items: center; }
  .bb-sidebar-close { background: none; border: none; color: var(--bb-muted); font-size: 16px; cursor: pointer; }
  .bb-sidebar-user { padding: 1.25rem; border-bottom: 1px solid var(--bb-border); }
  .bb-sidebar-menu { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; font-size: 14px; }
  .bb-sidebar-menu div { cursor: pointer; transition: color 0.2s; }
  .bb-sidebar-menu div:hover { color: var(--bb-accent2); }
  .bb-sidebar-menu .logout:hover { color: var(--bb-accent3); }

  /* ── Light mode fixes ── */
  [data-theme="light"] .bb-btn-ghost { background: rgba(0,0,0,0.04); }
  [data-theme="light"] .bb-btn-ghost:hover { background: rgba(0,0,0,0.08); }
  [data-theme="light"] .bb-hero::before { background: radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%); }
  [data-theme="light"] .bb-hero::after { background: radial-gradient(circle, rgba(0,229,192,0.06) 0%, transparent 70%); }

  /* ── MOBILE RESPONSIVE ── */
  @media (max-width: 768px) {
    .bb-nav { padding: 0.75rem 1rem; }
    .bb-nav-links { display: none; }
    .bb-logo { font-size: 18px; }
    .bb-logo-icon { width: 28px; height: 28px; }
    .bb-main { padding: 1.25rem 1rem 3rem; }

    .bb-hero { flex-direction: column; gap: 1.25rem; padding: 1.5rem; text-align: center; }
    .bb-hero-text { order: 2; }
    .bb-hero-text h1 { font-size: 22px; }
    .bb-hero-text p { margin-left: auto; margin-right: auto; font-size: 14px; }
    .bb-hero-stats { justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
    .bb-hero-stat span { font-size: 18px; }
    .bb-hero-visual { order: 1; }
    .bb-brain-orb { width: 90px; height: 90px; }
    .bb-brain-inner { font-size: 36px; }
    .bb-level-badge { margin-bottom: 0.5rem; }

    .bb-quick-row { flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; }
    .bb-quick-btn { flex: 1 1 calc(50% - 4px); min-width: 0; padding: 10px 8px; }
    .bb-quick-btn .qb-label { font-size: 11px; }

    .bb-cards-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }

    .bb-bottom-grid { grid-template-columns: 1fr; gap: 14px; }

    .bb-section-header { flex-wrap: wrap; gap: 8px; }

    .bb-weak-subj-head { gap: 10px; padding: 0.85rem 1rem; }
    .bb-weak-subj-icon { width: 34px; height: 34px; }
    .bb-weak-score-ring { width: 38px; height: 38px; }
    .bb-weak-score-num { font-size: 11px; }
    .bb-weak-subj-progress { display: none; }
    .bb-weak-topic-row { flex-wrap: wrap; gap: 8px; }
    .bb-weak-practice-btn { width: 100%; justify-content: center; padding: 8px; }

    .bb-sidebar { width: 85vw; max-width: 320px; }
    .bb-footer { padding: 1rem; font-size: 11px; }
  }

  @media (max-width: 480px) {
    .bb-nav { padding: 0.5rem 0.75rem; }
    .bb-logo { font-size: 16px; gap: 6px; }
    .bb-logo-icon { width: 24px; height: 24px; }
    .bb-streak { font-size: 11px; padding: 4px 8px; }
    .bb-main { padding: 1rem 0.75rem 2.5rem; }

    .bb-hero { padding: 1.25rem; margin-bottom: 1.25rem; border-radius: 16px; }
    .bb-hero-text h1 { font-size: 20px; }
    .bb-hero-text p { font-size: 13px; }
    .bb-hero-stats { gap: 1rem; }
    .bb-hero-stat span { font-size: 16px; }
    .bb-brain-orb { width: 72px; height: 72px; }
    .bb-brain-inner { font-size: 28px; }

    .bb-quick-row { gap: 6px; }
    .bb-quick-btn { padding: 8px 6px; border-radius: 10px; }
    .bb-quick-btn .qb-icon { font-size: 16px; }
    .bb-quick-btn .qb-label { font-size: 10px; }

    .bb-cards-grid { grid-template-columns: 1fr; gap: 10px; }
    .bb-subject-card { padding: 1rem; }
    .bb-subject-card .s-icon { width: 36px; height: 36px; margin-bottom: 8px; }
    .bb-subject-card h3 { font-size: 14px; }

    .bb-btn { padding: 10px 18px; font-size: 13px; }
    .bb-section-title { font-size: 14px; }

    .bb-panel { padding: 1rem; border-radius: 14px; }
    .bb-activity-item { gap: 8px; padding: 8px 0; }
    .bb-activity-icon { width: 30px; height: 30px; }
    .bb-activity-info strong { font-size: 12px; }
    .bb-activity-info span { font-size: 11px; }
    .bb-activity-score { font-size: 12px; padding: 3px 8px; }

    .bb-lb-item { gap: 6px; }
    .bb-lb-avatar { width: 28px; height: 28px; font-size: 10px; }
    .bb-lb-info strong { font-size: 12px; }
    .bb-lb-pts { font-size: 12px; }

    .bb-sidebar { width: 90vw; }
    .bb-footer { flex-direction: column; gap: 4px; }
  }
`;

/* ─── Subject color/icon config ─── */
const SUBJECT_CONFIG = {
  Mathematics: {
    icon: <Sigma size={20} />,
    color: "purple",
    fill: "fill-purple",
    iconCls: "icon-purple",
  },
  Physics: {
    icon: <Atom size={20} />,
    color: "teal",
    fill: "fill-teal",
    iconCls: "icon-teal",
  },
  Chemistry: {
    icon: <FlaskConical size={20} />,
    color: "coral",
    fill: "fill-coral",
    iconCls: "icon-coral",
  },
  Biology: {
    icon: <Leaf size={20} />,
    color: "amber",
    fill: "fill-amber",
    iconCls: "icon-amber",
  },
  "Comp. Science": {
    icon: <Monitor size={20} />,
    color: "blue",
    fill: "fill-blue",
    iconCls: "icon-blue",
  },
  English: {
    icon: <PenLine size={20} />,
    color: "pink",
    fill: "fill-pink",
    iconCls: "icon-pink",
  },
};
const DEFAULT_CONFIG = {
  icon: <BookOpen size={20} />,
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
  if (avg < 30) return "severity-critical";
  if (avg < 50) return "severity-warning";
  return "severity-mild";
};

const getWeakScoreColor = (avg) => {
  if (avg < 30) return "#FF6B6B";
  if (avg < 50) return "#FFB347";
  return "#FFE333";
};

const formatTimeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 172800) return "Yesterday";
  return new Date(dateStr).toLocaleDateString();
};

/* ─── Static leaderboard top 3 (replace with real API later) ─── */
const TOP3 = [];

/* ════════════════════════════════════════════════
   DASHBOARD COMPONENT
════════════════════════════════════════════════ */
function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [openProfile, setOpenProfile] = useState(false);
  const [user, setUser] = useState({ name: "User", streak: 0, email: "", avatar: "" });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [showWeakTopics, setShowWeakTopics] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ contactNumber: "", educationLevel: "" });
  const [onboardingLoading, setOnboardingLoading] = useState(false);


  const fetchDashboard = async (token) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quiz/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (data.success) {
        setDashboard(data.dashboard);

        setUser((prev) => ({
          ...prev,
          streak: data.dashboard.streak,
        }));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

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
        avatar: parsedUser.avatar || "",
        contactNumber: parsedUser.contactNumber || "",
        educationLevel: parsedUser.educationLevel || "",
      });
      
      if (parsedUser.contactNumber === "Pending" || parsedUser.educationLevel === "Pending") {
        setShowOnboarding(true);
      }
    }

    fetchDashboard(token);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleGyanS = () => {
    navigate("/gyans");
  };

  /* ── derived data ── */
  const recentAll = dashboard?.recentActivity || [];
  const recentToday = recentAll.filter(
    (q) => Date.now() - new Date(q.completedAt) < 86400000,
  );
  const activityList = activeTab === "today" ? recentToday : recentAll;
  const subjectCards = dashboard?.subjectProgress || [];
  const weakTopics = dashboard?.weakTopics || [];

  /* Group weak topics by subject for accordion view */
  const weakBySubject = weakTopics.reduce((acc, wt) => {
    const subj = wt.subject || "General";
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(wt);
    return acc;
  }, {});
  const weakSubjectEntries = Object.entries(weakBySubject)
    .map(([subject, topics]) => ({
      subject,
      topics: topics.sort((a, b) => a.avgScore - b.avgScore),
      avgScore: Math.round(topics.reduce((s, t) => s + t.avgScore, 0) / topics.length),
      topicCount: topics.length,
    }))
    .sort((a, b) => a.avgScore - b.avgScore);

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

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(onboardingData.contactNumber)) {
      alert("Contact number must be exactly 10 digits");
      return;
    }
    if (!onboardingData.educationLevel) {
      alert("Please select an education level");
      return;
    }

    try {
      setOnboardingLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(onboardingData)
      });
      const data = await res.json();
      if (data.success) {
        // Update user state and local storage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.contactNumber = data.profile.contactNumber;
        storedUser.educationLevel = data.profile.educationLevel;
        localStorage.setItem("user", JSON.stringify(storedUser));
        
        setUser(prev => ({
          ...prev,
          contactNumber: data.profile.contactNumber,
          educationLevel: data.profile.educationLevel
        }));
        setShowOnboarding(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    } finally {
      setOnboardingLoading(false);
    }
  };

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <>
      <style>{css}</style>
      <div className="bb-root">
        {/* NAV */}
        {/* NAV */}
        <nav className="bb-nav">
          <div className="bb-logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            <div className="bb-logo-icon"><img src="/favicon-32.png" alt="Gyantra" /></div>
            Gyan<span>tra</span>
          </div>

          <ul className="bb-nav-links">
            <li>
              <a onClick={() => navigate("/performance")}>Performance</a>
            </li>
            <li>
              <a onClick={() => navigate("/analytics")}>Analytics</a>
            </li>
          </ul>

          <div className="bb-nav-right">
            <div className="bb-streak"><Flame size={14} /> {user.streak} day streak</div>
            <button
              className="bb-theme-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>

            <div
              onClick={() => setOpenProfile(true)}
              style={{ cursor: "pointer" }}
            >
              <AvatarRender avatar={user.avatar} name={user.name} size={36} fontSize={14} />
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
                  Welcome back, <span>{user.name}!</span>
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
                  <div className="bb-brain-inner"><Brain size={52} strokeWidth={1.5} /></div>
                </div>
              </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="bb-quick-row">
              <div className="bb-quick-btn" onClick={handleGyanS}>
                <div className="qb-icon" style={{ display: "flex", justifyContent: "center" }}><ScanLine size={20} /></div>
                <div className="qb-label">GyanS</div>
              </div>
              <div
                className="bb-quick-btn"
                onClick={() => setShowWeakTopics((p) => !p)}
              >
                <div className="qb-icon" style={{ display: "flex", justifyContent: "center" }}><Target size={20} /></div>
                <div className="qb-label">Weak Subjects</div>
              </div>
              <div
                className="bb-quick-btn"
                onClick={() => navigate("/bookmarks")}
              >
                <div className="qb-icon" style={{ display: "flex", justifyContent: "center" }}><Bookmark size={20} /></div>
                <div className="qb-label" style={{ cursor: "pointer" }}>
                  Bookmarks
                </div>
              </div>
            </div>

            {/* ── WEAK SUBJECTS (grouped accordion) ── */}
            {showWeakTopics && (
              <div className="bb-weak-panel">
                <div className="bb-weak-header">
                  <div className="bb-weak-header-left">
                    <div className="bb-weak-header-icon">
                      <TrendingDown size={18} />
                    </div>
                    <div>
                      <h2>Weak Subjects</h2>
                      <div className="bb-weak-header-sub">
                        {weakSubjectEntries.length > 0
                          ? `${weakSubjectEntries.length} subject${weakSubjectEntries.length > 1 ? "s" : ""} with ${weakTopics.length} weak topic${weakTopics.length > 1 ? "s" : ""}`
                          : "No weak areas detected yet"}
                      </div>
                    </div>
                  </div>
                  <button
                    className="bb-weak-close"
                    onClick={() => { setShowWeakTopics(false); setExpandedSubject(null); }}
                  >
                    <X size={14} />
                  </button>
                </div>
                {weakSubjectEntries.length === 0 ? (
                  <div className="bb-empty">
                    No weak subjects yet — complete a few quizzes and we'll
                    track them here.
                  </div>
                ) : (
                  <div className="bb-weak-subjects">
                    {weakSubjectEntries.map((entry) => {
                      const cfg = SUBJECT_CONFIG[entry.subject] || DEFAULT_CONFIG;
                      const isOpen = expandedSubject === entry.subject;
                      const scoreColor = getWeakScoreColor(entry.avgScore);
                      const circumference = 2 * Math.PI * 16;
                      const dashOffset = circumference * (1 - entry.avgScore / 100);
                      return (
                        <div key={entry.subject} className={`bb-weak-subj-card${isOpen ? " expanded" : ""}`}>
                          <div
                            className="bb-weak-subj-head"
                            onClick={() => setExpandedSubject(isOpen ? null : entry.subject)}
                          >
                            <div className={`bb-weak-subj-icon ${cfg.iconCls}`}>{cfg.icon}</div>
                            <div className="bb-weak-score-ring">
                              <svg width="44" height="44" viewBox="0 0 44 44">
                                <circle cx="22" cy="22" r="16" fill="none" stroke="var(--bb-muted2)" strokeWidth="2.5" />
                                <circle
                                  cx="22" cy="22" r="16" fill="none"
                                  stroke={scoreColor} strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={dashOffset}
                                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                                />
                              </svg>
                              <div className="bb-weak-score-num" style={{ color: scoreColor }}>
                                {entry.avgScore}%
                              </div>
                            </div>
                            <div className="bb-weak-subj-info">
                              <div className="bb-weak-subj-name">{entry.subject}</div>
                              <div className="bb-weak-subj-meta">
                                <span>{entry.topicCount} weak topic{entry.topicCount > 1 ? "s" : ""}</span>
                                <span className="meta-dot" />
                                <span>Avg {entry.avgScore}%</span>
                              </div>
                            </div>
                            <div className="bb-weak-subj-right">
                              <div className="bb-weak-subj-progress">
                                <div className="bb-weak-progress-bar">
                                  <div
                                    className="bb-weak-progress-fill"
                                    style={{ width: `${entry.avgScore}%`, background: scoreColor }}
                                  />
                                </div>
                              </div>
                              <div className={`bb-weak-subj-chevron${isOpen ? " open" : ""}`}>
                                <ChevronDown size={18} />
                              </div>
                            </div>
                          </div>
                          {isOpen && (
                            <div className="bb-weak-topics-inner">
                              {entry.topics.map((wt, i) => {
                                const tScoreClass = wt.avgScore < 30 ? "ts-critical" : wt.avgScore < 50 ? "ts-warning" : "ts-mild";
                                return (
                                  <div key={i} className={`bb-weak-topic-row ${getWeakScoreClass(wt.avgScore)}`}>
                                    <div className={`bb-weak-topic-score ${tScoreClass}`}>
                                      {wt.avgScore}%
                                    </div>
                                    <div className="bb-weak-topic-info">
                                      <div className="bb-weak-topic-name">{wt.topic}</div>
                                      <div className="bb-weak-topic-hint">{wt.suggestion}</div>
                                    </div>
                                    <button
                                      className="bb-weak-practice-btn"
                                      onClick={(e) => { e.stopPropagation(); navigate("/QuizSetup", { state: { prefilledSubject: entry.subject } }); }}
                                    >
                                      Practice <ChevronRight size={14} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
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
              <X size={16} />
            </button>
          </div>
          <div className="bb-sidebar-user">
            <p style={{ fontWeight: 600 }}>{user.name}</p>
            <p style={{ fontSize: 13, color: "var(--bb-muted)" }}>
              {user.email}
            </p>
          </div>
          <div className="bb-sidebar-menu">
            <div className="profile" onClick={() => navigate("/profile")}>
              My Profile
            </div>



            <div onClick={() => navigate("/analytics")}>
              Analytics
            </div>

            <div onClick={handleGyanS}>
              GyanS Scanner
            </div>

            <div onClick={() => navigate("/performance")}>
              Performance
            </div>

            <div onClick={() => alert("Settings will land here soon ")}>
              Settings
            </div>
            <div className="logout" onClick={handleLogout}>
              Logout
            </div>
          </div>
        </div>
            {/* FOOTER */}
        <footer className="bb-footer">
          <span className="bb-footer-logo"><img src="/favicon-32.png" alt="" /></span>
          © {new Date().getFullYear()} Gyantra. All rights reserved.
        </footer>

        {/* ── ONBOARDING MODAL ── */}
        {showOnboarding && (
          <div className="bb-backdrop" style={{ zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div className="bb-panel" style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 101, padding: "2rem" }}>
              <button 
                onClick={() => setShowOnboarding(false)}
                style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--bb-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", marginBottom: "0.5rem" }}>Complete Your Profile</h2>
              <p style={{ color: "var(--bb-muted)", fontSize: "14px", marginBottom: "1.5rem" }}>
                You signed up with Google. Please provide a few more details to fully set up your account.
              </p>
              
              <form onSubmit={handleOnboardingSubmit}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--bb-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                    Contact Number
                  </label>
                  <input 
                    type="tel"
                    placeholder="10 digit number"
                    value={onboardingData.contactNumber}
                    onChange={(e) => setOnboardingData({...onboardingData, contactNumber: e.target.value})}
                    style={{ width: "100%", background: "var(--bb-surface2)", border: "1px solid var(--bb-border)", padding: "10px 14px", borderRadius: "8px", color: "var(--bb-text)", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--bb-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                    Education Level
                  </label>
                  <select 
                    value={onboardingData.educationLevel}
                    onChange={(e) => setOnboardingData({...onboardingData, educationLevel: e.target.value})}
                    style={{ width: "100%", background: "var(--bb-surface2)", border: "1px solid var(--bb-border)", padding: "10px 14px", borderRadius: "8px", color: "var(--bb-text)", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <option value="">Select your education level</option>
                    <option value="Dropout">Dropout</option>
                    <option value="High School">High School</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={onboardingLoading}
                  className="bb-btn bb-btn-primary" 
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {onboardingLoading ? "Saving..." : "Save Details"}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default Dashboard;
