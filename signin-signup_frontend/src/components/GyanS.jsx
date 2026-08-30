import React, { useState, useRef, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import axiosInstance from "../utils/axiosConfig";
import { ScanLine, Upload, Image, Trash2, Edit3, Check, X, Clock, Target, Award, ChevronRight, Brain, ArrowLeft, History, Camera, FileText, AlertTriangle, ChevronDown, ChevronUp, Plus, HelpCircle, ShieldCheck, ShieldAlert, BookOpen, Lightbulb } from "lucide-react";
import SuggestionBox from "./common/SuggestionBox";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

/* ─── CSS ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
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

  .gs-root { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; transition: background .3s, color .3s; }

  /* NAV */
  .gs-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 56px; border-bottom: 1px solid var(--border); background: rgba(10,11,15,0.97); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; transition: background .3s; }
  [data-theme="light"] .gs-nav { background: rgba(245,245,250,0.92); }
  .gs-nav-left { display: flex; align-items: center; gap: 12px; }
  .gs-back-btn { background: none; border: 1px solid var(--border2); border-radius: 10px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all .2s; }
  .gs-back-btn:hover { border-color: var(--accent); color: var(--accent); }
  .gs-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px; display: flex; align-items: center; gap: 8px; }
  .gs-logo-icon { width: 28px; height: 28px; border-radius: 7px; overflow: hidden; }
  .gs-logo-icon img { width: 100%; height: 100%; object-fit: cover; }
  .gs-logo span { color: var(--accent2); }
  .gs-nav-right { display: flex; align-items: center; gap: 10px; }
  .gs-theme-btn { width: 36px; height: 36px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; color: var(--muted); }
  .gs-theme-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* MAIN */
  .gs-main { max-width: 840px; margin: 0 auto; padding: 1.5rem 1.5rem 4rem; }

  /* TABS */
  .gs-tabs { display: flex; gap: 4px; background: var(--surface2); padding: 4px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 1.5rem; }
  .gs-tab { flex: 1; padding: 10px; border-radius: 10px; border: none; background: none; color: var(--muted); font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .gs-tab.active { background: var(--surface); color: var(--text); border: 1px solid var(--border2); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .gs-tab:hover:not(.active) { color: var(--text); }

  /* HERO BADGE */
  .gs-hero { text-align: center; margin-bottom: 2rem; }
  .gs-hero-badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, rgba(124,92,252,0.15), rgba(0,229,192,0.1)); border: 1px solid rgba(124,92,252,0.25); border-radius: 24px; padding: 6px 16px; font-size: 12px; font-weight: 600; color: var(--accent); letter-spacing: 0.5px; margin-bottom: 12px; }
  .gs-hero h1 { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .gs-hero h1 .gs-accent { color: var(--accent2); }
  .gs-hero p { color: var(--muted); font-size: 14px; max-width: 480px; margin: 0 auto; line-height: 1.6; }

  /* UPLOAD ZONE */
  .gs-upload-zone { border: 2px dashed var(--border2); border-radius: 20px; padding: 2.5rem 2rem; text-align: center; cursor: pointer; transition: all .3s; background: var(--surface); position: relative; overflow: hidden; }
  .gs-upload-zone:hover { border-color: var(--accent); background: rgba(124,92,252,0.04); }
  .gs-upload-zone.dragging { border-color: var(--accent2); background: rgba(0,229,192,0.06); transform: scale(1.01); }
  .gs-upload-zone.has-images { border-style: solid; border-color: var(--accent); padding: 1.5rem; }
  .gs-upload-icon { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, rgba(124,92,252,0.12), rgba(0,229,192,0.08)); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--accent); }
  .gs-upload-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 6px; }
  .gs-upload-sub { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
  .gs-upload-btn-row { display: flex; gap: 10px; justify-content: center; }
  .gs-upload-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; transition: all .2s; }
  .gs-upload-primary { background: var(--accent); color: #fff; }
  .gs-upload-primary:hover { background: #9074fd; transform: translateY(-1px); }
  .gs-upload-secondary { background: rgba(255,255,255,0.06); color: var(--text); border: 1px solid var(--border2); }
  [data-theme="light"] .gs-upload-secondary { background: rgba(0,0,0,0.04); }
  .gs-upload-secondary:hover { background: rgba(255,255,255,0.1); }
  .gs-upload-hint { font-size: 11px; color: var(--muted2); margin-top: 12px; }

  /* IMAGE PREVIEW */
  .gs-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
  .gs-preview-card { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid var(--border2); background: var(--surface2); aspect-ratio: 4/3; }
  .gs-preview-card img { width: 100%; height: 100%; object-fit: cover; }
  .gs-preview-remove { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,107,107,0.9); border: none; color: #fff; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; backdrop-filter: blur(4px); }
  .gs-preview-remove:hover { background: var(--accent3); transform: scale(1.1); }
  .gs-add-more { border-radius: 14px; border: 2px dashed var(--border2); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; color: var(--muted); font-size: 13px; gap: 4px; aspect-ratio: 4/3; }
  .gs-add-more:hover { border-color: var(--accent); color: var(--accent); }

  /* SCAN BUTTON */
  .gs-scan-row { display: flex; gap: 10px; margin-top: 1.5rem; }
  .gs-scan-btn { flex: 1; padding: 14px 28px; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #0A0B0F; }
  .gs-scan-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .gs-scan-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .gs-clear-btn { padding: 14px 20px; border-radius: 14px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; background: none; border: 1px solid var(--border2); color: var(--muted); transition: all .2s; }
  .gs-clear-btn:hover { border-color: var(--accent3); color: var(--accent3); }

  /* SCANNING ANIMATION */
  .gs-scanning { text-align: center; padding: 3rem 1rem; }
  .gs-scan-orb { width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(from 0deg, var(--accent), var(--accent2), var(--accent3), var(--accent)); padding: 3px; animation: gs-spin 1.5s linear infinite; margin: 0 auto 20px; }
  @keyframes gs-spin { to { transform: rotate(360deg); } }
  .gs-spinner-small { width: 18px; height: 18px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; display: inline-block; animation: gs-spin .7s linear infinite; }
  .gs-scan-orb-inner { width: 100%; height: 100%; border-radius: 50%; background: var(--surface); display: flex; align-items: center; justify-content: center; }
  .gs-scanning h2 { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .gs-scanning p { font-size: 13px; color: var(--muted); }
  .gs-scanning .gs-dots { display: inline-flex; gap: 4px; margin-top: 12px; }
  .gs-scanning .gs-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: gs-pulse 1.2s infinite; }
  .gs-scanning .gs-dot:nth-child(2) { animation-delay: 0.2s; }
  .gs-scanning .gs-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes gs-pulse { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }

  /* EXTRACTED QUESTIONS PREVIEW */
  .gs-results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .gs-results-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
  .gs-results-count { font-size: 13px; color: var(--accent2); font-weight: 500; }

  .gs-meta-pills { display: flex; gap: 8px; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .gs-meta-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; background: var(--surface); border: 1px solid var(--border); }
  .gs-meta-pill .pill-icon { color: var(--accent); }
  .gs-meta-pill .pill-val { color: var(--accent2); font-weight: 600; }

  .gs-question-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 1.5rem; }
  .gs-question-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; transition: all .2s; }
  .gs-question-card:hover { border-color: var(--border2); }
  .gs-q-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
  .gs-q-num { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: var(--accent); background: rgba(124,92,252,0.12); border-radius: 6px; padding: 2px 8px; flex-shrink: 0; }
  .gs-q-actions { display: flex; gap: 6px; }
  .gs-q-action-btn { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--border2); background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .2s; }
  .gs-q-action-btn:hover { border-color: var(--accent); color: var(--accent); }
  .gs-q-action-btn.delete:hover { border-color: var(--accent3); color: var(--accent3); }
  .gs-q-text { font-size: 14px; line-height: 1.5; margin-bottom: 10px; font-weight: 500; }
  .gs-q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; }
  .gs-q-opt { font-size: 12px; padding: 6px 10px; border-radius: 8px; background: var(--surface2); border: 1px solid var(--border); color: var(--muted); }
  .gs-q-opt.correct { border-color: rgba(0,229,192,0.3); color: var(--accent2); background: rgba(0,229,192,0.06); }
  .gs-q-bottom { display: flex; gap: 8px; flex-wrap: wrap; }
  .gs-q-tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px; letter-spacing: 0.5px; }
  .gs-q-tag.easy { background: rgba(0,229,192,0.12); color: var(--accent2); }
  .gs-q-tag.medium { background: rgba(255,179,71,0.12); color: var(--amber); }
  .gs-q-tag.hard { background: rgba(255,107,107,0.12); color: var(--accent3); }
  .gs-q-tag.topic { background: rgba(124,92,252,0.1); color: var(--accent); }

  /* EDIT MODE */
  .gs-edit-input { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; padding: 10px 14px; color: var(--text); font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; resize: vertical; }
  .gs-edit-input:focus { border-color: var(--accent); }
  .gs-edit-opt-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .gs-edit-opt-label { font-size: 12px; font-weight: 700; color: var(--muted); min-width: 18px; }
  .gs-edit-opt-input { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; color: var(--text); font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; }
  .gs-edit-opt-input:focus { border-color: var(--accent); }
  .gs-edit-correct-select { margin-top: 8px; display: flex; align-items: center; gap: 8px; }
  .gs-edit-correct-select label { font-size: 12px; color: var(--muted); }
  .gs-edit-correct-select select { background: var(--surface2); border: 1px solid var(--border2); border-radius: 8px; padding: 4px 10px; color: var(--text); font-size: 12px; font-family: 'DM Sans', sans-serif; }

  /* START QUIZ ROW */
  .gs-start-row { display: flex; gap: 10px; }
  .gs-start-btn { flex: 1; padding: 14px 28px; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #0A0B0F; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .gs-start-btn:hover { opacity: .9; transform: translateY(-1px); }
  .gs-rescan-btn { padding: 14px 20px; border-radius: 14px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; background: none; border: 1px solid var(--border2); color: var(--muted); transition: all .2s; }
  .gs-rescan-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* ── PAST RECORDS ── */
  .gs-history-empty { text-align: center; padding: 3rem; color: var(--muted); }
  .gs-history-empty .gs-empty-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(124,92,252,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--muted2); }
  .gs-history-list { display: flex; flex-direction: column; gap: 10px; }
  .gs-history-card { background: rgba(17,19,24,0.7); border: 1px solid var(--border); border-radius: 16px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all .25s; backdrop-filter: blur(8px); }
  [data-theme="light"] .gs-history-card { background: rgba(255,255,255,0.7); }
  .gs-history-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(124,92,252,0.15); }

  /* FEATURES GRID */
  .gs-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 2.5rem; }
  .gs-feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; text-align: left; transition: all 0.2s; position: relative; overflow: hidden; }
  .gs-feature-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(124,92,252,0.05) 0%, transparent 60%); pointer-events: none; }
  .gs-feature-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
  .gs-feature-icon-wrapper { width: 40px; height: 40px; border-radius: 10px; background: rgba(124,92,252,0.1); color: var(--accent); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .gs-feature-card h3 { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .gs-feature-card p { font-size: 12px; color: var(--muted); line-height: 1.5; }
  @media (max-width: 768px) {
    .gs-features-grid { grid-template-columns: 1fr; gap: 12px; margin-top: 1.5rem; }
  }
  .gs-history-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .gs-history-icon.scanned { background: rgba(124,92,252,0.12); color: var(--accent); }
  .gs-history-icon.completed { background: rgba(0,229,192,0.12); color: var(--accent2); }
  .gs-history-info { flex: 1; min-width: 0; }
  .gs-history-info strong { font-size: 14px; font-weight: 600; display: block; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .gs-history-info span { font-size: 12px; color: var(--muted); }
  .gs-history-score { text-align: right; flex-shrink: 0; }
  .gs-history-score .score-val { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; display: block; }
  .gs-history-score .score-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .score-great { color: var(--accent2); }
  .score-good { color: var(--accent); }
  .score-ok { color: var(--amber); }
  .score-low { color: var(--accent3); }
  .gs-history-arrow { color: var(--muted2); flex-shrink: 0; }
  .gs-history-delete { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .2s; flex-shrink: 0; }
  .gs-history-delete:hover { border-color: var(--accent3); color: var(--accent3); background: rgba(255,107,107,0.08); }

  /* SUBJECT HINT INPUT */
  .gs-subject-hint { margin-bottom: 1rem; }
  .gs-subject-hint label { font-size: 12px; font-weight: 600; color: var(--muted); display: block; margin-bottom: 6px; letter-spacing: 0.3px; }
  .gs-subject-hint-row { display: flex; align-items: center; gap: 8px; }
  .gs-subject-input { flex: 1; background: var(--surface); border: 1px solid var(--border2); border-radius: 10px; padding: 9px 14px; color: var(--text); font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color .2s; }
  .gs-subject-input:focus { border-color: var(--accent); }
  .gs-subject-input::placeholder { color: var(--muted2); }
  .gs-subject-hint-tip { font-size: 11px; color: var(--muted2); margin-top: 4px; }

  /* CONFIDENCE BADGE */
  .gs-conf-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; letter-spacing: 0.4px; }
  .gs-conf-high { background: rgba(0,229,192,0.1); color: var(--accent2); border: 1px solid rgba(0,229,192,0.2); }
  .gs-conf-low { background: rgba(255,179,71,0.1); color: var(--amber); border: 1px solid rgba(255,179,71,0.25); }
  .gs-conf-unknown { background: rgba(255,107,107,0.1); color: var(--accent3); border: 1px solid rgba(255,107,107,0.2); }
  .gs-question-card.low-conf { border-color: rgba(255,179,71,0.35); }
  .gs-question-card.answer-unknown { border-color: rgba(255,107,107,0.3); }

  /* WARNINGS STRIP */
  .gs-q-warnings { background: rgba(255,179,71,0.07); border: 1px solid rgba(255,179,71,0.2); border-radius: 8px; padding: 6px 10px; margin-bottom: 8px; }
  .gs-q-warning-item { font-size: 11px; color: var(--amber); display: flex; align-items: center; gap: 5px; }

  /* EXPLANATION TOGGLE */
  .gs-explain-toggle { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted); cursor: pointer; background: none; border: none; padding: 0; font-family: 'DM Sans', sans-serif; margin-top: 6px; transition: color .2s; }
  .gs-explain-toggle:hover { color: var(--accent); }
  .gs-explain-box { background: rgba(124,92,252,0.06); border: 1px solid rgba(124,92,252,0.15); border-radius: 10px; padding: 10px 12px; margin-top: 6px; font-size: 12px; line-height: 1.6; color: var(--muted); animation: gs-fade-in 0.2s ease; }
  .gs-explain-box .explain-label { font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
  @keyframes gs-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

  /* MANUAL ADD QUESTION MODAL */
  .gs-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: gs-fade-in 0.2s ease; }
  .gs-modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; padding: 1.5rem; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
  .gs-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
  .gs-modal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
  .gs-modal-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border2); background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .2s; }
  .gs-modal-close:hover { border-color: var(--accent3); color: var(--accent3); }
  .gs-modal-field { margin-bottom: 1rem; }
  .gs-modal-label { font-size: 12px; font-weight: 600; color: var(--muted); display: block; margin-bottom: 5px; }
  .gs-modal-input { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; padding: 9px 12px; color: var(--text); font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; resize: vertical; }
  .gs-modal-input:focus { border-color: var(--accent); }
  .gs-modal-input::placeholder { color: var(--muted2); }
  .gs-modal-actions { display: flex; gap: 8px; margin-top: 1.25rem; }
  .gs-modal-save { flex: 1; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #0A0B0F; }
  .gs-modal-cancel { padding: 11px 20px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; background: none; border: 1px solid var(--border2); color: var(--muted); }

  /* ADD QUESTION BUTTON */
  .gs-add-q-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 12px; border-radius: 14px; border: 2px dashed var(--border2); background: none; color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; margin-bottom: 1rem; }
  .gs-add-q-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(124,92,252,0.04); }

  /* SCAN STATUS LOG */
  .gs-status-log { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.25rem; margin-top: 1rem; max-width: 400px; margin-left: auto; margin-right: auto; }
  .gs-status-step { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 4px 0; color: var(--muted); }
  .gs-status-step.active { color: var(--text); font-weight: 600; }
  .gs-status-step.done { color: var(--accent2); }
  .gs-status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--muted2); flex-shrink: 0; }
  .gs-status-step.active .gs-status-dot { background: var(--accent); animation: gs-pulse 1s infinite; }
  .gs-status-step.done .gs-status-dot { background: var(--accent2); }

  /* ERROR */
  .gs-error { text-align: center; padding: 2rem; }
  .gs-error-icon { font-size: 40px; margin-bottom: 12px; }
  .gs-error h3 { font-family: 'Syne', sans-serif; font-size: 18px; margin-bottom: 6px; }
  .gs-error p { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
  .gs-error-tip { font-size: 12px; color: var(--amber); background: rgba(255,179,71,0.08); border: 1px solid rgba(255,179,71,0.2); border-radius: 10px; padding: 8px 12px; margin-bottom: 16px; text-align: left; display: flex; gap: 6px; align-items: flex-start; }
  .gs-error-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; background: var(--accent); color: #fff; }
  .gs-error-btn:hover { background: #9074fd; }

  /* FOOTER */
  .gs-footer { border-top: 1px solid var(--border); padding: 1rem 2rem; text-align: center; font-size: 11px; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 5px; }
  .gs-footer img { width: 14px; height: 14px; border-radius: 3px; }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .gs-nav { padding: 0 1rem; height: 50px; }
    .gs-logo { font-size: 16px; }
    .gs-main { padding: 1rem 1rem 3rem; }
    .gs-hero h1 { font-size: 22px; }
    .gs-upload-zone { padding: 1.5rem 1rem; }
    .gs-preview-grid { grid-template-columns: repeat(2, 1fr); }
    .gs-q-options { grid-template-columns: 1fr; }
    .gs-start-row { flex-direction: column; }
    .gs-scan-row { flex-direction: column; }
    .gs-meta-pills { gap: 6px; }
    .gs-upload-btn-row { flex-direction: column; align-items: center; }
  }

  @media (max-width: 480px) {
    .gs-nav { padding: 0 0.75rem; height: 46px; }
    .gs-main { padding: 0.75rem 0.75rem 2.5rem; }
    .gs-hero h1 { font-size: 20px; }
    .gs-hero p { font-size: 13px; }
    .gs-tabs { font-size: 13px; }
    .gs-tab { font-size: 12px; padding: 8px; }
    .gs-upload-icon { width: 48px; height: 48px; }
    .gs-upload-title { font-size: 16px; }
    .gs-question-card { padding: 1rem; }
    .gs-q-text { font-size: 13px; }
    .gs-history-card { padding: 0.75rem 1rem; }
  }
`;

/* ─── Helpers ─── */
const LETTERS = ["A", "B", "C", "D"];

const getScoreClass = (pct) => {
  if (pct >= 90) return "score-great";
  if (pct >= 75) return "score-good";
  if (pct >= 50) return "score-ok";
  return "score-low";
};

const formatDate = (d) => {
  const date = new Date(d);
  const now = Date.now();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/* ════════════════════════════════════════════════════════
   GYANS COMPONENT
════════════════════════════════════════════════════════ */
export default function GyanS() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("scanner");

  // Scanner state
  const [images, setImages] = useState([]);          // base64 images
  const [imageFiles, setImageFiles] = useState([]);   // File objects for names
  const [pdfFile, setPdfFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgressText, setScanProgressText] = useState("");
  const [scanStep, setScanStep] = useState(0); // 0=idle,1=reading,2=detecting,3=extracting,4=validating

  // Chunk progress tracking for multi-page PDF scans
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 0, extracted: 0 });

  const [scanError, setScanError] = useState(null);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [scanMeta, setScanMeta] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [dragging, setDragging] = useState(false);

  // Subject hint
  const [subjectHint, setSubjectHint] = useState("");

  // Explanation expand per question
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const toggleExplanation = (idx) =>
    setExpandedExplanations((prev) => ({ ...prev, [idx]: !prev[idx] }));

  // Manual add question modal
  const [showManualModal, setShowManualModal] = useState(false);
  const emptyManualQ = () => ({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "A",
    explanation: "",
    topic: subjectHint || "General",
    difficulty: "Medium",
  });
  const [manualQ, setManualQ] = useState(emptyManualQ);

  const saveManualQ = () => {
    if (!manualQ.question.trim()) return;
    const newQ = {
      question: manualQ.question.trim(),
      options: manualQ.options.map((o) => o.trim() || "N/A"),
      correctAnswer: manualQ.correctAnswer,
      answer: ["A", "B", "C", "D"].indexOf(manualQ.correctAnswer),
      explanation: manualQ.explanation.trim() || "Manually added question.",
      topic: manualQ.topic || subjectHint || "General",
      subject: manualQ.topic || subjectHint || "General",
      difficulty: manualQ.difficulty,
      confidence: "high",
      answerUnknown: false,
      warnings: [],
    };
    setExtractedQuestions((prev) => [...prev, newQ]);
    setShowManualModal(false);
    setManualQ(emptyManualQ());
  };

  // Edit state
  const [editingIdx, setEditingIdx] = useState(null);
  const [editData, setEditData] = useState(null);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingRecordId, setLoadingRecordId] = useState(null);

  const handleRecordClick = async (record) => {
    if (loadingRecordId) return;
    setLoadingRecordId(record._id);
    try {
      const res = await axiosInstance.get(`/api/scan/${record._id}`);
      if (res.data.success) {
        const { scan, quiz } = res.data;
        if (scan.quizCompleted && quiz) {
          navigate("/results", {
            state: {
              result: {
                scorePercent: quiz.scorePercent,
                totalCorrect: quiz.totalCorrect,
                totalWrong: quiz.totalWrong,
                totalSkipped: quiz.totalSkipped,
                xpEarned: quiz.xpEarned,
                totalXpEarned: quiz.xpEarned,
                streakBonus: 0,
                newStreak: 0,
              },
              questions: quiz.questions.map((q, idx) => {
                const scanQ = scan.extractedQuestions[idx] || {};
                return {
                  questionText: q.questionText,
                  options: q.options,
                  correctAnswer: q.correctAnswer,
                  userAnswer: q.userAnswer,
                  isCorrect: q.isCorrect,
                  timeTaken: q.timeTaken,
                  topic: q.topic || scan.detectedSubject || "General",
                  explanation: scanQ.explanation || "No explanation provided.",
                };
              }),
              config: {
                subject: quiz.subject,
                difficulty: quiz.difficulty,
                totalQ: quiz.totalQuestions,
              },
            },
          });
        } else {
          // If quiz not completed, start/resume the quiz
          navigate("/quiz", {
            state: {
              subject: scan.detectedSubject || "Scanned Test",
              difficulty: "Medium",
              questions: scan.extractedQuestions.length,
              timePerQ: 60,
              options: { shuffle: false, hints: false, instant: false, review: true },
              preGeneratedQuestions: scan.extractedQuestions.map((eq) => ({
                question: eq.questionText,
                options: eq.options,
                answer: LETTERS.indexOf(eq.correctAnswer),
                correctAnswer: eq.correctAnswer,
                explanation: eq.explanation || "",
                difficulty: eq.difficulty || "Medium",
                topic: eq.topic || scan.detectedSubject || "General",
              })),
              scanId: scan._id,
              isScannedQuiz: true,
            },
          });
        }
      }
    } catch (err) {
      console.error("Failed to load scan record detail:", err);
      alert("Failed to load details. Please try again.");
    } finally {
      setLoadingRecordId(null);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axiosInstance.get("/api/scan/history");
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error("Failed to load scan history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "history") {
      loadHistory();
    }
  };

  // ── File handling ──
  const processFile = useCallback((file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(null);
        return;
      }
      // Compress image before converting to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1200;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
            else { w = Math.round(w * maxDim / h); h = maxDim; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          resolve(compressed);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if a PDF file is selected
    const pdf = files.find((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (pdf) {
      setImages([]);
      setImageFiles([]);
      setPdfFile(pdf);
      if (e.target) e.target.value = "";
      return;
    }

    setPdfFile(null);
    const remaining = 2 - images.length;
    const toProcess = files.slice(0, remaining);

    for (const file of toProcess) {
      const base64 = await processFile(file);
      if (base64) {
        setImages((prev) => [...prev, base64]);
        setImageFiles((prev) => [...prev, file]);
      }
    }
    // Reset input
    if (e.target) e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => {
    setImages([]);
    setImageFiles([]);
    setPdfFile(null);
    setExtractedQuestions([]);
    setScanMeta(null);
    setScanId(null);
    setScanError(null);
    setEditingIdx(null);
    setExpandedExplanations({});
    setScanStep(0);
  };

  // ── Drag & Drop ──
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const pdf = files.find((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (pdf) {
      setImages([]);
      setImageFiles([]);
      setPdfFile(pdf);
      return;
    }

    setPdfFile(null);
    const remaining = 2 - images.length;
    const toProcess = files.slice(0, remaining);
    for (const file of toProcess) {
      const base64 = await processFile(file);
      if (base64) {
        setImages((prev) => [...prev, base64]);
        setImageFiles((prev) => [...prev, file]);
      }
    }
  };

  /* ────────────────────────────────────────────────────────
     HELPER — Layout-aware page text extraction from PDF.js
     Uses y-coordinate grouping to reconstruct proper line
     breaks between question numbers, text, and options.
  ──────────────────────────────────────────────────────── */
  const extractLayoutAwareText = async (page) => {
    const textContent = await page.getTextContent();
    if (textContent.items.length === 0) return "";

    // Group text items by their approximate y-position (line)
    const lineMap = new Map();
    for (const item of textContent.items) {
      if (!item.str || !item.str.trim()) continue;
      // Round y to nearest 3 units to group items on the same line
      const lineY = Math.round(item.transform[5] / 3) * 3;
      if (!lineMap.has(lineY)) lineMap.set(lineY, []);
      lineMap.get(lineY).push({ x: item.transform[4], text: item.str });
    }

    // Sort lines top-to-bottom (higher y = top in PDF coords)
    const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);

    // Assemble lines sorted left-to-right within each line
    const lines = sortedYs.map((y) => {
      const items = lineMap.get(y).sort((a, b) => a.x - b.x);
      return items.map((i) => i.text).join(" ");
    });

    return lines.join("\n");
  };

  /* ────────────────────────────────────────────────────────
     HELPER — Deduplicate questions after multi-chunk merge
  ──────────────────────────────────────────────────────── */
  const deduplicateExtracted = (questions) => {
    const seen = new Set();
    return questions.filter((q) => {
      const key = (q.question || "")
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

  /* ────────────────────────────────────────────────────────
     HELPER — Run async tasks with a max-concurrency cap.
     tasks: array of () => Promise
     concurrency: max simultaneous in-flight promises
  ──────────────────────────────────────────────────────── */
  const runWithConcurrency = async (tasks, concurrency) => {
    const results = new Array(tasks.length);
    let idx = 0;
    const worker = async () => {
      while (idx < tasks.length) {
        const i = idx++;
        results[i] = await tasks[i]();
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
    return results;
  };

  // ── Scan ──
  const handleScan = async () => {
    if (images.length === 0 && !pdfFile) return;
    setScanning(true);
    setScanError(null);
    setExtractedQuestions([]);
    setScanProgressText("");
    setChunkProgress({ current: 0, total: 0, extracted: 0 });
    setExpandedExplanations({});
    setScanStep(1); // Reading

    try {
      if (pdfFile) {
        setScanProgressText("Reading PDF document...");
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        // ── Step 1: Read all pages to detect and extract text ──
        setScanStep(2); // Detecting & Reading
        setScanProgressText(`Reading ${totalPages} pages...`);
        const allPageTexts = await Promise.all(
          Array.from({ length: totalPages }, async (_, i) => {
            try {
              const page = await pdf.getPage(i + 1);
              return await extractLayoutAwareText(page);
            } catch (pageErr) {
              console.warn(`  ⚠ Failed to read page ${i + 1}:`, pageErr.message);
              return "";
            }
          })
        );

        const totalTextLength = allPageTexts.reduce((sum, t) => sum + (t ? t.trim().length : 0), 0);
        const hasExtractableText = totalTextLength > 50;

        const combinedQuestions = [];
        let currentScanId = null;
        let detectedSubject = subjectHint || "General";
        let totalDuration = 0;
        let chunkErrors = 0;
        let scanIdSettled = false;

        setScanStep(3); // Extracting

        if (hasExtractableText) {
          // ── PATH A: Text-based PDF (searchable) ──
          const TEXT_CHUNK_SIZE = 10;
          const totalChunks = Math.ceil(totalPages / TEXT_CHUNK_SIZE);
          setChunkProgress({ current: 0, total: totalChunks, extracted: 0 });
          let chunksCompleted = 0;

          const chunkTasks = Array.from({ length: totalChunks }, (_, c) => async () => {
            const startPage = c * TEXT_CHUNK_SIZE;
            const endPage = Math.min((c + 1) * TEXT_CHUNK_SIZE, totalPages);
            const chunkTexts = allPageTexts.slice(startPage, endPage);

            if (chunkTexts.every((t) => !t.trim())) {
              chunksCompleted++;
              setChunkProgress({ current: chunksCompleted, total: totalChunks, extracted: combinedQuestions.length });
              return;
            }

            const useScanId = currentScanId;
            try {
              const res = await axiosInstance.post("/api/scan/extract-pdf-text", {
                textChunks: chunkTexts,
                fileName: pdfFile.name,
                scanId: useScanId,
                subjectHint: subjectHint.trim(),
              });

              if (res.data.success) {
                combinedQuestions.push(...(res.data.questions || []));
                if (res.data.scanId && !scanIdSettled) {
                  currentScanId = res.data.scanId;
                  scanIdSettled = true;
                }
                if (res.data.meta?.detectedSubject) detectedSubject = res.data.meta.detectedSubject;
                totalDuration += res.data.meta?.scanDurationMs || 0;
              } else {
                console.warn(`  ⚠ Chunk ${c + 1} returned error: ${res.data.message}`);
                chunkErrors++;
              }
            } catch (chunkErr) {
              console.error(`  ✗ Chunk ${c + 1} request failed:`, chunkErr.message);
              chunkErrors++;
            }

            chunksCompleted++;
            setScanProgressText(
              `Extracting questions — ${chunksCompleted}/${totalChunks} chunks done` +
              (combinedQuestions.length > 0 ? ` · ${combinedQuestions.length} found` : "")
            );
            setChunkProgress({ current: chunksCompleted, total: totalChunks, extracted: combinedQuestions.length });
          });

          setScanProgressText(`Extracting questions from ${totalChunks} chunks...`);
          await runWithConcurrency(chunkTasks, 3);

          if (chunkErrors > Math.ceil(totalChunks / 2)) {
            throw new Error(
              `Too many chunk failures (${chunkErrors}/${totalChunks}). Please try again or use a clearer PDF.`
            );
          }

        } else {
          // ── PATH B: Scanned image-based PDF — OCR each page ──
          const totalChunks = totalPages;
          setChunkProgress({ current: 0, total: totalChunks, extracted: 0 });
          let pagesCompleted = 0;

          const pageTasks = Array.from({ length: totalPages }, (_, i) => async () => {
            const pageNum = i + 1;
            let base64;
            try {
              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale: 1.2 });
              const canvas = document.createElement("canvas");
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext("2d");
              await page.render({ canvasContext: ctx, viewport }).promise;
              base64 = canvas.toDataURL("image/jpeg", 0.72);
              canvas.width = 0;
              canvas.height = 0;
            } catch (renderErr) {
              console.warn(`  ⚠ Could not render page ${pageNum}:`, renderErr.message);
              chunkErrors++;
              pagesCompleted++;
              setChunkProgress({ current: pagesCompleted, total: totalChunks, extracted: combinedQuestions.length });
              return;
            }

            const useScanId = currentScanId;
            try {
              const res = await axiosInstance.post("/api/scan/extract", {
                images: [base64.startsWith("data:") ? base64.split(",")[1] : base64],
                fileName: pdfFile.name,
                scanId: useScanId,
                subjectHint: subjectHint.trim(),
              });

              if (res.data.success) {
                combinedQuestions.push(...(res.data.questions || []));
                if (res.data.scanId && !scanIdSettled) {
                  currentScanId = res.data.scanId;
                  scanIdSettled = true;
                }
                if (res.data.meta?.detectedSubject) detectedSubject = res.data.meta.detectedSubject;
                totalDuration += res.data.meta?.scanDurationMs || 0;
              } else {
                console.warn(`  ⚠ OCR page ${pageNum} returned error: ${res.data.message}`);
                chunkErrors++;
              }
            } catch (chunkErr) {
              console.error(`  ✗ OCR page ${pageNum} request failed:`, chunkErr.message);
              chunkErrors++;
            }

            pagesCompleted++;
            setScanProgressText(
              `OCR Scanning — ${pagesCompleted}/${totalPages} pages done` +
              (combinedQuestions.length > 0 ? ` · ${combinedQuestions.length} found` : "")
            );
            setChunkProgress({ current: pagesCompleted, total: totalChunks, extracted: combinedQuestions.length });
          });

          setScanProgressText(`OCR scanning ${totalPages} pages...`);
          await runWithConcurrency(pageTasks, 1);

          if (chunkErrors > Math.ceil(totalChunks / 2)) {
            throw new Error(
              `Too many OCR failures (${chunkErrors}/${totalChunks}). The scan PDF may be too unclear or corrupted.`
            );
          }
        }

        setScanStep(4); // Validating
        setScanProgressText("Validating extracted questions...");

        const deduped = deduplicateExtracted(combinedQuestions);
        const removedCount = combinedQuestions.length - deduped.length;
        if (removedCount > 0) console.log(`  ✓ Removed ${removedCount} duplicate questions`);

        if (deduped.length === 0) {
          throw new Error(
            chunkErrors > 0
              ? `No questions could be extracted. ${chunkErrors} pages failed. Check that your PDF contains MCQ questions.`
              : "No MCQ questions were found in this PDF. Please ensure the document contains multiple-choice questions."
          );
        }

        setExtractedQuestions(deduped);
        setScanId(currentScanId);
        setScanMeta({
          detectedSubject: subjectHint || detectedSubject,
          scanDurationMs: totalDuration,
          model: hasExtractableText ? "PDF Text Engine" : "PDF OCR Engine",
          pagesScanned: totalPages,
          chunkErrors,
          unknownAnswerCount: deduped.filter((q) => q.answerUnknown).length,
          lowConfidenceCount: deduped.filter((q) => q.confidence === "low").length,
        });
      } else {
        // ── Direct image upload (not PDF) ──
        setScanStep(3);
        setScanProgressText("Sending image to GyanS OCR (anti-hallucination mode)...");
        const res = await axiosInstance.post("/api/scan/extract", {
          images: images.map((img) => img.startsWith("data:") ? img.split(",")[1] : img),
          fileName: imageFiles[0]?.name || "scan.jpg",
          subjectHint: subjectHint.trim(),
        });

        setScanStep(4);
        if (res.data.success) {
          setExtractedQuestions(res.data.questions);
          setScanMeta(res.data.meta);
          setScanId(res.data.scanId);
        } else {
          throw new Error(res.data.message || "Extraction failed");
        }
      }
    } catch (err) {
      console.error("Scan error:", err);
      setScanError(
        err.response?.data?.message || err.message || "Failed to extract questions",
      );
    } finally {
      setScanning(false);
      setScanProgressText("");
      setChunkProgress({ current: 0, total: 0, extracted: 0 });
      setScanStep(0);
    }
  };

  // ── Edit question ──
  const startEdit = (idx) => {
    setEditingIdx(idx);
    const q = extractedQuestions[idx];
    setEditData({
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
    });
  };

  const saveEdit = () => {
    if (editingIdx === null || !editData) return;
    setExtractedQuestions((prev) => {
      const next = [...prev];
      next[editingIdx] = {
        ...next[editingIdx],
        question: editData.question,
        options: editData.options,
        correctAnswer: editData.correctAnswer,
        answer: LETTERS.indexOf(editData.correctAnswer),
      };
      return next;
    });
    setEditingIdx(null);
    setEditData(null);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setEditData(null);
  };

  const deleteQuestion = (idx) => {
    setExtractedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Start quiz with extracted questions ──
  const startQuiz = () => {
    if (extractedQuestions.length === 0) return;

    const subject = scanMeta?.detectedSubject || "Scanned Test";
    navigate("/quiz", {
      state: {
        subject,
        difficulty: "Medium",
        questions: extractedQuestions.length,
        timePerQ: 60,
        options: { shuffle: false, hints: false, instant: false, review: true },
        // Pass pre-generated questions so Quiz.jsx skips the API call
        preGeneratedQuestions: extractedQuestions,
        scanId,
        isScannedQuiz: true,
      },
    });
  };

  // ── Delete history record ──
  const deleteRecord = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this scan record?")) return;
    try {
      await axiosInstance.delete(`/api/scan/${id}`);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{css}</style>
      <div className="gs-root">
        {/* NAV */}
        <nav className="gs-nav">
          <div className="gs-nav-left">
            <button className="gs-back-btn" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={16} />
            </button>
            <div className="gs-logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
              <div className="gs-logo-icon"><img src="/favicon-32.png" alt="Gyantra" /></div>
              Gyan<span>S</span>
            </div>
          </div>
          <div className="gs-nav-right">
            <button
              className="gs-theme-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>
          </div>
        </nav>

        <main className="gs-main">
          {/* HERO */}
          <div className="gs-hero">
            <div className="gs-hero-badge">
              <ScanLine size={14} /> GyanS Scanner
            </div>
            <h1>Scan. <span className="gs-accent">Extract.</span> Quiz.</h1>
            <p>
              Upload an image of any MCQ test paper. Gyantraa will extract the questions,
              generate answers & explanations, and create a quiz instantly.
            </p>
          </div>

          {/* TABS */}
          <div className="gs-tabs">
            <button
              className={`gs-tab${activeTab === "scanner" ? " active" : ""}`}
              onClick={() => handleTabChange("scanner")}
            >
              <ScanLine size={15} /> Scanner
            </button>
            <button
              className={`gs-tab${activeTab === "history" ? " active" : ""}`}
              onClick={() => handleTabChange("history")}
            >
              <History size={15} /> Past Records
            </button>
          </div>

          {/* ══════════ SCANNER TAB ══════════ */}
          {activeTab === "scanner" && (
            <>
              {/* STATE: No questions extracted yet */}
              {extractedQuestions.length === 0 && !scanning && !scanError && (
                <>
                  {/* Upload Zone */}
                  <div
                    className={`gs-upload-zone${dragging ? " dragging" : ""}${images.length > 0 || pdfFile ? " has-images" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {images.length === 0 && !pdfFile ? (
                      <>
                        <div className="gs-upload-icon">
                          <Upload size={28} />
                        </div>
                        <div className="gs-upload-title">Upload Test Document / Image</div>
                        <div className="gs-upload-sub">
                          Drag & drop your MCQ PDF or test paper here, or choose an option below
                        </div>
                        <div className="gs-upload-btn-row">
                          <button
                            className="gs-upload-btn gs-upload-primary"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Image size={14} /> Browse Files
                          </button>
                          <button
                            className="gs-upload-btn gs-upload-secondary"
                            onClick={() => cameraInputRef.current?.click()}
                          >
                            <Camera size={14} /> Take Photo
                          </button>
                        </div>
                        <div className="gs-upload-hint">
                          Supports PDF, JPG, PNG, WEBP · Max 2 images or 1 PDF
                        </div>
                      </>
                    ) : pdfFile ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem" }}>
                        <div className="gs-upload-icon" style={{ background: "rgba(255,107,107,0.12)", color: "var(--accent3)" }}>
                          <FileText size={28} />
                        </div>
                        <div className="gs-upload-title" style={{ fontSize: "16px", wordBreak: "break-all" }}>
                          {pdfFile.name}
                        </div>
                        <div className="gs-upload-sub" style={{ fontSize: "12px", marginTop: "4px" }}>
                          PDF Document · {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                        <button
                          className="gs-preview-remove"
                          style={{ position: "absolute", top: "16px", right: "16px" }}
                          onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="gs-preview-grid">
                          {images.map((img, i) => (
                            <div key={i} className="gs-preview-card">
                              <img src={img} alt={`Scan ${i + 1}`} />
                              <button
                                className="gs-preview-remove"
                                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          {images.length < 2 && (
                            <div
                              className="gs-add-more"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload size={18} />
                              Add more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Features Grid */}
                  {images.length === 0 && !pdfFile && (
                    <div className="gs-features-grid">
                      <div className="gs-feature-card">
                        <div className="gs-feature-icon-wrapper">
                          <Brain size={20} className="gs-feature-icon" />
                        </div>
                        <h3>Smart AI Extraction</h3>
                        <p>Extract MCQs from physical papers, worksheets, or textbook snapshots in seconds using NVIDIA AI.</p>
                      </div>
                      <div className="gs-feature-card">
                        <div className="gs-feature-icon-wrapper">
                          <Clock size={20} className="gs-feature-icon" />
                        </div>
                        <h3>Simulated Exam Mode</h3>
                        <p>Launch custom timed tests directly from your scans to build speed and accuracy under pressure.</p>
                      </div>
                      <div className="gs-feature-card">
                        <div className="gs-feature-icon-wrapper">
                          <Target size={20} className="gs-feature-icon" />
                        </div>
                        <h3>Deep Feedback & Edits</h3>
                        <p>Verify and edit extracted questions manually. Get detailed AI explanations for all correct answers.</p>
                      </div>
                    </div>
                  )}

                  {/* Hidden file inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />

                  {/* Subject Hint — shown when file is ready */}
                  {(images.length > 0 || pdfFile) && (
                    <div className="gs-subject-hint">
                      <label htmlFor="gs-subject-input">📚 Subject / Topic (optional — helps reduce AI errors)</label>
                      <div className="gs-subject-hint-row">
                        <input
                          id="gs-subject-input"
                          className="gs-subject-input"
                          placeholder="e.g. Mathematics, Physics, Indian History, Organic Chemistry…"
                          value={subjectHint}
                          onChange={(e) => setSubjectHint(e.target.value)}
                          maxLength={60}
                        />
                      </div>
                      <div className="gs-subject-hint-tip">✦ Providing a subject hint significantly reduces AI hallucinations on technical papers.</div>
                    </div>
                  )}

                  {/* Scan / Clear buttons */}
                  {(images.length > 0 || pdfFile) && (
                    <div className="gs-scan-row">
                      <button
                        className="gs-scan-btn"
                        onClick={handleScan}
                        disabled={scanning}
                      >
                        <ScanLine size={18} /> Scan & Extract Questions
                      </button>
                      <button className="gs-clear-btn" onClick={clearAll}>
                        Clear
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* STATE: Scanning */}
              {scanning && (
                <div className="gs-scanning">
                  <div className="gs-scan-orb">
                    <div className="gs-scan-orb-inner">
                      <Brain size={32} color="var(--accent)" />
                    </div>
                  </div>
                  <h2>Extracting Questions...</h2>
                  <p style={{ minHeight: 20 }}>{scanProgressText || "GyanS is analysing your document"}</p>

                  {/* Step-by-step status log */}
                  <div className="gs-status-log">
                    {[
                      { label: "Reading document",       step: 1 },
                      { label: "Detecting content type", step: 2 },
                      { label: "Extracting questions",   step: 3 },
                      { label: "Validating results",     step: 4 },
                    ].map(({ label, step }) => (
                      <div
                        key={step}
                        className={`gs-status-step${scanStep === step ? " active" : ""}${scanStep > step ? " done" : ""}`}
                      >
                        <div className="gs-status-dot" />
                        {scanStep > step ? "✓ " : ""}{label}
                      </div>
                    ))}
                  </div>

                  {/* Chunk progress bar for multi-page PDFs */}
                  {chunkProgress.total > 0 && (
                    <div style={{ margin: "16px auto 0", maxWidth: 340 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
                        <span>Chunk {chunkProgress.current} / {chunkProgress.total}</span>
                        {chunkProgress.extracted > 0 && (
                          <span style={{ color: "var(--accent2)", fontWeight: 600 }}>{chunkProgress.extracted} found so far</span>
                        )}
                      </div>
                      <div style={{ height: 4, borderRadius: 4, background: "var(--surface2)", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.round((chunkProgress.current / chunkProgress.total) * 100)}%`,
                            background: "linear-gradient(90deg, var(--accent), var(--accent2))",
                            borderRadius: 4,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="gs-dots" style={{ marginTop: 16 }}>
                    <div className="gs-dot" />
                    <div className="gs-dot" />
                    <div className="gs-dot" />
                  </div>
                </div>
              )}

              {/* STATE: Error */}
              {scanError && (
                <div className="gs-error">
                  <div className="gs-error-icon">
                    <AlertTriangle size={36} color="var(--accent3)" style={{ margin: "0 auto 12px" }} />
                  </div>
                  <h3>Extraction Failed</h3>
                  <p>{scanError}</p>
                  {/* Contextual tips based on error */}
                  {(scanError.toLowerCase().includes("math") ||
                    scanError.toLowerCase().includes("formula") ||
                    scanError.toLowerCase().includes("parse") ||
                    scanError.toLowerCase().includes("unparse")) && (
                    <div className="gs-error-tip">
                      <Lightbulb size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>For math/science papers: ensure the image is well-lit and all symbols are clearly visible. Try adding a subject hint like "Mathematics" before scanning to help the AI focus.</span>
                    </div>
                  )}
                  {(scanError.toLowerCase().includes("ocr") ||
                    scanError.toLowerCase().includes("image") ||
                    scanError.toLowerCase().includes("unclear")) && (
                    <div className="gs-error-tip">
                      <Lightbulb size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>OCR tip: Use a higher resolution photo with good lighting. Avoid shadows and tilted angles. For printed papers, scanning works better than photos.</span>
                    </div>
                  )}
                  {scanError.toLowerCase().includes("no mcq") && (
                    <div className="gs-error-tip">
                      <Lightbulb size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>No MCQs detected. GyanS only extracts multiple-choice questions (A/B/C/D). If your paper has a different format, try editing questions manually after a partial scan.</span>
                    </div>
                  )}
                  <button className="gs-error-btn" onClick={() => { setScanError(null); }}>
                    Try Again
                  </button>
                </div>
              )}

              {/* STATE: Questions extracted — preview & edit */}
              {extractedQuestions.length > 0 && !scanning && (
                <>
                  <div className="gs-results-header">
                    <div className="gs-results-title">Extracted Questions</div>
                    <div className="gs-results-count">
                      {extractedQuestions.length} questions found
                    </div>
                  </div>

                  <div className="gs-meta-pills">
                    <div className="gs-meta-pill">
                      <Target size={13} className="pill-icon" />
                      <span className="pill-val">{scanMeta?.detectedSubject || "General"}</span>
                    </div>
                    <div className="gs-meta-pill">
                      <Clock size={13} className="pill-icon" />
                      <span className="pill-val">
                        {scanMeta?.scanDurationMs
                          ? `${(scanMeta.scanDurationMs / 1000).toFixed(1)}s`
                          : "—"}
                      </span>
                    </div>
                    {scanMeta?.pagesScanned && (
                      <div className="gs-meta-pill">
                        <FileText size={13} className="pill-icon" />
                        <span className="pill-val">{scanMeta.pagesScanned} pages</span>
                      </div>
                    )}
                    {scanMeta?.model && (
                      <div className="gs-meta-pill">
                        <Brain size={13} className="pill-icon" />
                        <span className="pill-val">{scanMeta.model}</span>
                      </div>
                    )}
                    {scanMeta?.chunkErrors > 0 && (
                      <div className="gs-meta-pill" style={{ borderColor: "rgba(255,107,107,0.3)" }}>
                        <AlertTriangle size={13} style={{ color: "var(--accent3)" }} />
                        <span style={{ color: "var(--accent3)", fontWeight: 600 }}>{scanMeta.chunkErrors} pages skipped</span>
                      </div>
                    )}
                  </div>

                  {/* Answer unknown / low confidence summary banner */}
                  {(scanMeta?.unknownAnswerCount > 0 || scanMeta?.lowConfidenceCount > 0) && (
                    <div className="gs-q-warnings" style={{ marginBottom: "1rem" }}>
                      {scanMeta.unknownAnswerCount > 0 && (
                        <div className="gs-q-warning-item">
                          <ShieldAlert size={12} />
                          <strong>{scanMeta.unknownAnswerCount} question{scanMeta.unknownAnswerCount > 1 ? "s" : ""}</strong> had no visible answer in the source — marked for your review.
                        </div>
                      )}
                      {scanMeta.lowConfidenceCount > 0 && (
                        <div className="gs-q-warning-item" style={{ marginTop: 2 }}>
                          <AlertTriangle size={12} />
                          <strong>{scanMeta.lowConfidenceCount} question{scanMeta.lowConfidenceCount > 1 ? "s" : ""}</strong> have low OCR confidence — verify before quizzing.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="gs-question-list">
                    {extractedQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className={`gs-question-card${
                          q.answerUnknown ? " answer-unknown" :
                          q.confidence === "low" ? " low-conf" : ""
                        }`}
                      >
                        <div className="gs-q-top">
                          <span className="gs-q-num">Q{idx + 1}</span>
                          <div className="gs-q-actions">
                            {editingIdx === idx ? (
                              <>
                                <button className="gs-q-action-btn" onClick={saveEdit} title="Save">
                                  <Check size={14} />
                                </button>
                                <button className="gs-q-action-btn" onClick={cancelEdit} title="Cancel">
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="gs-q-action-btn" onClick={() => startEdit(idx)} title="Edit">
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  className="gs-q-action-btn delete"
                                  onClick={() => deleteQuestion(idx)}
                                  title="Remove"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {editingIdx === idx && editData ? (
                          <>
                            <textarea
                              className="gs-edit-input"
                              value={editData.question}
                              onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                              rows={2}
                            />
                            <div style={{ marginTop: 8 }}>
                              {editData.options.map((opt, oi) => (
                                <div key={oi} className="gs-edit-opt-row">
                                  <span className="gs-edit-opt-label">{LETTERS[oi]}</span>
                                  <input
                                    className="gs-edit-opt-input"
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...editData.options];
                                      newOpts[oi] = e.target.value;
                                      setEditData({ ...editData, options: newOpts });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="gs-edit-correct-select">
                              <label>Correct:</label>
                              <select
                                value={editData.correctAnswer}
                                onChange={(e) => setEditData({ ...editData, correctAnswer: e.target.value })}
                              >
                                {LETTERS.map((l) => (
                                  <option key={l} value={l}>{l}</option>
                                ))}
                              </select>
                            </div>
                          </>
                          ) : (
                          <>
                            {/* OCR Warnings strip */}
                            {q.warnings && q.warnings.length > 0 && (
                              <div className="gs-q-warnings">
                                {q.warnings.map((w, wi) => (
                                  <div key={wi} className="gs-q-warning-item">
                                    <AlertTriangle size={11} />{w}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="gs-q-text">{q.question}</div>
                            <div className="gs-q-options">
                              {q.options.map((opt, oi) => (
                                <div
                                  key={oi}
                                  className={`gs-q-opt${
                                    !q.answerUnknown && q.correctAnswer === LETTERS[oi] ? " correct" : ""
                                  }`}
                                >
                                  <strong>{LETTERS[oi]}.</strong> {opt}
                                </div>
                              ))}
                            </div>
                            <div className="gs-q-bottom">
                              <span className={`gs-q-tag ${(q.difficulty || "medium").toLowerCase()}`}>
                                {q.difficulty || "Medium"}
                              </span>
                              {q.topic && q.topic !== "General" && (
                                <span className="gs-q-tag topic">{q.topic}</span>
                              )}
                              {/* Confidence badge */}
                              {q.answerUnknown ? (
                                <span className="gs-conf-badge gs-conf-unknown">
                                  <ShieldAlert size={9} /> Answer Unknown
                                </span>
                              ) : q.confidence === "low" ? (
                                <span className="gs-conf-badge gs-conf-low">
                                  <AlertTriangle size={9} /> Low Confidence
                                </span>
                              ) : (
                                <span className="gs-conf-badge gs-conf-high">
                                  <ShieldCheck size={9} /> Verified
                                </span>
                              )}
                            </div>
                            {/* Explanation toggle */}
                            {q.explanation && (
                              <>
                                <button
                                  className="gs-explain-toggle"
                                  onClick={() => toggleExplanation(idx)}
                                >
                                  <BookOpen size={11} />
                                  {expandedExplanations[idx] ? "Hide explanation" : "Why is this the answer?"}
                                  {expandedExplanations[idx] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                </button>
                                {expandedExplanations[idx] && (
                                  <div className="gs-explain-box">
                                    <span className="explain-label">EXPLANATION</span>
                                    {q.explanation}
                                  </div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add question manually */}
                  <button className="gs-add-q-btn" onClick={() => { setManualQ(emptyManualQ()); setShowManualModal(true); }}>
                    <Plus size={16} /> Add Question Manually
                  </button>

                  <div className="gs-start-row">
                    <button className="gs-start-btn" onClick={startQuiz}>
                      <Brain size={18} /> Start Quiz ({extractedQuestions.length} Questions)
                    </button>
                    <button className="gs-rescan-btn" onClick={clearAll}>
                      ← Scan Another
                    </button>
                  </div>

                  {/* ── FEEDBACK ON GYANS EXTRACTION ── */}
                  <SuggestionBox context="GyanS Test Extraction" title="Feedback on GyanS Extraction" subtitle="How accurate was the question extraction?" />
                </>
              )}
            </>
          )}

          {/* ══════════ MANUAL ADD MODAL ══════════ */}
          {showManualModal && (
            <div className="gs-modal-overlay" onClick={() => setShowManualModal(false)}>
              <div className="gs-modal" onClick={(e) => e.stopPropagation()}>
                <div className="gs-modal-header">
                  <div className="gs-modal-title">Add Question Manually</div>
                  <button className="gs-modal-close" onClick={() => setShowManualModal(false)}><X size={15} /></button>
                </div>

                <div className="gs-modal-field">
                  <label className="gs-modal-label">Question Text *</label>
                  <textarea
                    className="gs-modal-input"
                    rows={3}
                    placeholder="Enter the full question text here…"
                    value={manualQ.question}
                    onChange={(e) => setManualQ({ ...manualQ, question: e.target.value })}
                  />
                </div>

                {["A", "B", "C", "D"].map((letter, oi) => (
                  <div className="gs-modal-field" key={letter}>
                    <label className="gs-modal-label">Option {letter}</label>
                    <input
                      className="gs-modal-input"
                      placeholder={`Option ${letter}`}
                      value={manualQ.options[oi]}
                      onChange={(e) => {
                        const newOpts = [...manualQ.options];
                        newOpts[oi] = e.target.value;
                        setManualQ({ ...manualQ, options: newOpts });
                      }}
                    />
                  </div>
                ))}

                <div className="gs-modal-field">
                  <label className="gs-modal-label">Correct Answer</label>
                  <select
                    className="gs-modal-input"
                    value={manualQ.correctAnswer}
                    onChange={(e) => setManualQ({ ...manualQ, correctAnswer: e.target.value })}
                    style={{ cursor: "pointer" }}
                  >
                    {["A", "B", "C", "D"].map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div className="gs-modal-field">
                  <label className="gs-modal-label">Explanation (optional)</label>
                  <textarea
                    className="gs-modal-input"
                    rows={2}
                    placeholder="Why is this the correct answer?"
                    value={manualQ.explanation}
                    onChange={(e) => setManualQ({ ...manualQ, explanation: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <div className="gs-modal-field" style={{ flex: 1, margin: 0 }}>
                    <label className="gs-modal-label">Topic</label>
                    <input
                      className="gs-modal-input"
                      placeholder="e.g. Algebra"
                      value={manualQ.topic}
                      onChange={(e) => setManualQ({ ...manualQ, topic: e.target.value })}
                    />
                  </div>
                  <div className="gs-modal-field" style={{ flex: 1, margin: 0 }}>
                    <label className="gs-modal-label">Difficulty</label>
                    <select
                      className="gs-modal-input"
                      value={manualQ.difficulty}
                      onChange={(e) => setManualQ({ ...manualQ, difficulty: e.target.value })}
                      style={{ cursor: "pointer" }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="gs-modal-actions">
                  <button
                    className="gs-modal-save"
                    onClick={saveManualQ}
                    disabled={!manualQ.question.trim()}
                  >
                    <Plus size={14} style={{ display: "inline", marginRight: 4 }} />Add to List
                  </button>
                  <button className="gs-modal-cancel" onClick={() => setShowManualModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ PAST RECORDS TAB ══════════ */}
          {activeTab === "history" && (
            <>
              {historyLoading ? (
                <div className="gs-scanning">
                  <div className="gs-scan-orb">
                    <div className="gs-scan-orb-inner">
                      <History size={28} color="var(--accent)" />
                    </div>
                  </div>
                  <h2>Loading Records...</h2>
                </div>
              ) : history.length === 0 ? (
                <div className="gs-history-empty">
                  <div className="gs-empty-icon">
                    <ScanLine size={28} />
                  </div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                    No scans yet
                  </p>
                  <p>Scan your first test paper to see records here.</p>
                </div>
              ) : (
                <div className="gs-history-list">
                  {history.map((record) => {
                    const scorePercent = record.totalQuestionsExtracted > 0 && record.quizCompleted
                      ? Math.round((record.totalCorrect / record.totalQuestionsExtracted) * 100)
                      : null;

                    return (
                      <div
                        key={record._id}
                        className="gs-history-card"
                        onClick={() => handleRecordClick(record)}
                      >
                        <div className={`gs-history-icon ${record.quizCompleted ? "completed" : "scanned"}`}>
                          {loadingRecordId === record._id ? (
                            <div className="gs-spinner-small" />
                          ) : record.quizCompleted ? (
                            <Award size={20} />
                          ) : (
                            <ScanLine size={20} />
                          )}
                        </div>
                        <div className="gs-history-info">
                          <strong>{record.detectedSubject || record.fileName}</strong>
                          <span>
                            {record.totalQuestionsExtracted} questions · {formatDate(record.createdAt)}
                            {record.quizCompleted && ` · ${record.totalCorrect}/${record.totalQuestionsExtracted} correct`}
                          </span>
                        </div>
                        {record.quizCompleted && scorePercent !== null && (
                          <div className="gs-history-score">
                            <span className={`score-val ${getScoreClass(scorePercent)}`}>
                              {scorePercent}%
                            </span>
                            <span className="score-label">Score</span>
                          </div>
                        )}
                        {!record.quizCompleted && (
                          <div className="gs-history-score">
                            <span className="score-val" style={{ color: "var(--amber)", fontSize: 12 }}>
                              Pending
                            </span>
                            <span className="score-label">Quiz</span>
                          </div>
                        )}
                        <button
                          className="gs-history-delete"
                          onClick={(e) => deleteRecord(record._id, e)}
                          title="Delete record"
                        >
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight size={16} className="gs-history-arrow" />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>

        {/* FOOTER */}
        <footer className="gs-footer">
          <img src="/favicon-32.png" alt="" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }} />
          © {new Date().getFullYear()} Gyantra · GyanS Scanner
        </footer>
      </div>
    </>
  );
}
