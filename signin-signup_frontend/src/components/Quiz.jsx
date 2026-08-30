import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import axiosInstance from "../utils/axiosConfig"; // use axios so interceptor attaches token
import { Bookmark, X, AlertTriangle, Check, Zap, Globe } from "lucide-react";

/* ─── Bookmark Popup Modal Component ─── */
function BookmarkModal({ isOpen, onClose, question, onSave, existingNote }) {
  const [note, setNote] = useState(existingNote || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setNote(existingNote || "");
      setSaved(false);
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [isOpen, existingNote]);

  if (!isOpen || !question) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(note);
      setSaved(true);
      setTimeout(() => {
        onClose();
        setSaved(false);
      }, 1200);
    } catch (err) {
      console.error("Bookmark save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkipNote = async () => {
    setSaving(true);
    try {
      await onSave("");
      setSaved(true);
      setTimeout(() => {
        onClose();
        setSaved(false);
      }, 800);
    } catch (err) {
      console.error("Bookmark save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bkm-overlay" onClick={onClose} />
      <div className={`bkm-popup ${saved ? 'bkm-popup-saved' : ''}`}>
        {saved ? (
          <div className="bkm-saved-state">
            <div className="bkm-saved-icon"><Check size={18} /></div>
            <div className="bkm-saved-text">Bookmarked!</div>
          </div>
        ) : (
          <>
            <div className="bkm-header">
              <div className="bkm-header-left">
                <span className="bkm-emoji" style={{ display: "inline-flex", alignItems: "center" }}><Bookmark size={16} /></span>
                <span className="bkm-title">Bookmark Question</span>
              </div>
              <button className="bkm-close" onClick={onClose}><X size={14} /></button>
            </div>
            <div className="bkm-question-preview">
              <div className="bkm-q-label">QUESTION</div>
              <div className="bkm-q-text">{question}</div>
            </div>
            <div className="bkm-note-section">
              <label className="bkm-note-label">Add a note (optional)</label>
              <textarea
                ref={textareaRef}
                className="bkm-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why is this tricky? Key formula? Revision tip..."
                rows={3}
              />
            </div>
            <div className="bkm-actions">
              <button className="bkm-skip-btn" onClick={handleSkipNote} disabled={saving}>
                Save without note
              </button>
              <button className="bkm-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : <><Bookmark size={14} style={{ display: "inline-block", marginRight: 6, verticalAlign: "middle" }} /> Save with Note</>}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ─── CSS (converted from gyantra_mcq_quiz.html) ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── DARK THEME (default) ── */
  :root {
    --bg: #0A0B0F; --surface: #111318; --surface2: #181B23;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.13);
    --accent: #7C5CFC; --accent2: #00E5C0; --accent3: #FF6B6B;
    --amber: #FFB347; --text: #F0EFF8; --muted: #7B7A8C; --muted2: #3A394A;
  }

  /* ── LIGHT THEME ── */
  [data-theme="light"] {
    --bg:      #F5F5FA;
    --surface: #FFFFFF;
    --surface2:#F0EFF8;
    --border:  rgba(0,0,0,0.07);
    --border2: rgba(0,0,0,0.12);
    --text:    #0A0B0F;
    --muted:   #7B7A8C;
    --muted2:  #C8C7D4;
  }

  .qz-root { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; transition: background .3s, color .3s; }

  /* NAV */
  .qz-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 56px; border-bottom: 1px solid var(--border); background: rgba(10,11,15,0.97); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; transition: background .3s; }
  [data-theme="light"] .qz-nav { background: rgba(245,245,250,0.92); }
  .qz-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px; display: flex; align-items: center; gap: 8px; }
  .qz-logo-icon { width: 28px; height: 28px; border-radius: 7px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .qz-logo-icon img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .qz-footer { border-top: 1px solid var(--border); padding: 1rem 2rem; text-align: center; font-size: 11px; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 5px; }
  .qz-footer img { width: 14px; height: 14px; border-radius: 3px; }
  .qz-logo span { color: var(--accent2); }
  .qz-nav-meta { display: flex; align-items: center; gap: 16px; }
  .qz-nav-tag { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
  .tag-easy   { background: rgba(0,229,192,0.15);  color: var(--accent2); border: 1px solid rgba(0,229,192,0.25); }
  .tag-medium { background: rgba(255,179,71,0.15); color: var(--amber);   border: 1px solid rgba(255,179,71,0.25); }
  .tag-hard   { background: rgba(255,107,107,0.15);color: var(--accent3); border: 1px solid rgba(255,107,107,0.25); }
  .qz-nav-lang { font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 20px; background: rgba(124,92,252,0.12); color: var(--accent); border: 1px solid rgba(124,92,252,0.2); display: flex; align-items: center; gap: 4px; }
  .qz-nav-subjects { font-size: 12px; color: var(--muted); max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .qz-nav-right { display: flex; align-items: center; gap: 12px; }
  .qz-quit-btn { font-size: 13px; color: var(--muted); background: none; border: 1px solid var(--muted2); border-radius: 8px; padding: 5px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .qz-quit-btn:hover { border-color: var(--accent3); color: var(--accent3); }

  /* THEME TOGGLE */
  .qz-theme-btn { width: 36px; height: 36px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; color: var(--muted); }
  .qz-theme-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* PROGRESS BAR */
  .qz-progress-wrap { height: 3px; background: var(--muted2); width: 100%; }
  .qz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); transition: width .4s ease; }

  /* MAIN */
  .qz-main { max-width: 780px; margin: 0 auto; padding: 1.5rem 1.5rem 3rem; }

  /* LOADING / ERROR */
  .qz-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; text-align: center; }
  .qz-spinner { width: 44px; height: 44px; border: 3px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: qz-spin 0.8s linear infinite; }
  @keyframes qz-spin { to { transform: rotate(360deg); } }
  .qz-loading-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
  .qz-loading-sub { font-size: 13px; color: var(--muted); }

  /* STATS ROW */
  .qz-stats-row { display: flex; gap: 10px; margin-bottom: 1.25rem; }
  .qz-stat-chip { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 10px; text-align: center; transition: background .3s; }
  .qz-stat-chip .sv { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .qz-stat-chip .sk { font-size: 11px; color: var(--muted); }
  .sv-green  { color: var(--accent2); }
  .sv-red    { color: var(--accent3); }
  .sv-amber  { color: var(--amber); }
  .sv-purple { color: var(--accent); }

  /* TOP ROW */
  .qz-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; gap: 16px; }
  .qz-q-counter { display: flex; align-items: center; gap: 8px; }
  .qz-q-num { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1; }
  .qz-q-total { font-size: 14px; color: var(--muted); align-self: flex-end; padding-bottom: 3px; }
  .qz-subject-pill { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; background: rgba(124,92,252,0.12); color: var(--accent); border: 1px solid rgba(124,92,252,0.2); }

  /* TIMER RING */
  .qz-timer-wrap { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
  .qz-timer-wrap svg { transform: rotate(-90deg); }
  .qz-timer-num { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .qz-timer-num .tnum { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; line-height: 1; }
  .qz-timer-num .tlabel { font-size: 9px; color: var(--muted); margin-top: 1px; }

  /* MAP TOGGLE */
  .qz-map-toggle { display: flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 6px 14px; cursor: pointer; font-size: 13px; color: var(--muted); font-weight: 500; transition: all .2s; }
  .qz-map-toggle:hover { border-color: var(--border2); color: var(--text); }

  /* QUESTION MAP */
  .qz-map { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.25rem; transition: background .3s; }
  .qz-map-title { font-size: 12px; color: var(--muted); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .qz-map-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .qz-map-dot { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; cursor: pointer; transition: all .15s; border: 1px solid var(--border2); background: var(--surface2); color: var(--muted); }
  .qz-map-dot.answered { background: rgba(124,92,252,0.18); border-color: rgba(124,92,252,0.4); color: var(--accent); }
  .qz-map-dot.current  { background: var(--accent); border-color: var(--accent); color: #fff; }
  .qz-map-dot.skipped  { background: rgba(255,179,71,0.12); border-color: rgba(255,179,71,0.3); color: var(--amber); }

  /* QUESTION CARD */
  .qz-q-card { background: var(--surface); border: 1px solid var(--border2); border-radius: 18px; padding: 2rem; margin-bottom: 1.25rem; transition: background .3s; }
  .qz-q-text { font-size: 17px; font-weight: 500; line-height: 1.65; color: var(--text); }

  /* OPTIONS */
  .qz-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem; }
  .qz-option { display: flex; align-items: center; gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.25rem; cursor: pointer; transition: all .22s; }
  .qz-option:hover:not(.locked) { border-color: var(--border2); background: var(--surface2); }
  .qz-option.selected { border-color: var(--accent);  background: rgba(124,92,252,0.09); }
  .qz-option.correct  { border-color: var(--accent2); background: rgba(0,229,192,0.08); }
  .qz-option.wrong    { border-color: var(--accent3); background: rgba(255,107,107,0.08); }
  .qz-option.locked   { cursor: default; }
  .qz-opt-letter { width: 34px; height: 34px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; flex-shrink: 0; transition: all .2s; color: var(--muted); }
  .qz-option.selected .qz-opt-letter { background: var(--accent);  border-color: var(--accent);  color: #fff; }
  .qz-option.correct  .qz-opt-letter { background: var(--accent2); border-color: var(--accent2); color: #0A0B0F; }
  .qz-option.wrong    .qz-opt-letter { background: var(--accent3); border-color: var(--accent3); color: #fff; }
  .qz-opt-text { font-size: 15px; font-weight: 400; flex: 1; line-height: 1.4; }

  /* FEEDBACK */
  .qz-feedback { border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: flex-start; gap: 10px; }
  .qz-feedback.correct-fb { background: rgba(0,229,192,0.08);  border: 1px solid rgba(0,229,192,0.2); }
  .qz-feedback.wrong-fb   { background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.2); }
  .qz-fb-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .qz-fb-title { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
  .correct-fb .qz-fb-title { color: var(--accent2); }
  .wrong-fb   .qz-fb-title { color: var(--accent3); }
  .qz-fb-explain { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* BOTTOM ROW */
  .qz-bottom-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .qz-skip-btn { background: none; border: 1px solid var(--muted2); border-radius: 12px; padding: 12px 20px; color: var(--muted); font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .qz-skip-btn:hover:not(:disabled) { border-color: var(--border2); color: var(--text); }
  .qz-skip-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .qz-next-btn { background: var(--accent); border: none; border-radius: 12px; padding: 12px 32px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; display: flex; align-items: center; gap: 8px; }
  .qz-next-btn:hover:not(:disabled) { background: #9074fd; transform: translateY(-1px); }
  .qz-next-btn:disabled { background: var(--muted2); color: var(--muted); cursor: not-allowed; transform: none; }
  .qz-finish-btn { background: linear-gradient(135deg, var(--accent), var(--accent2)); border: none; border-radius: 12px; padding: 12px 32px; color: #0A0B0F; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .qz-finish-btn:hover { opacity: .9; transform: translateY(-1px); }
  .qz-bookmark-btn { background: none; border: 1px solid var(--muted2); border-radius: 12px; padding: 12px 14px; color: var(--muted); font-size: 16px; cursor: pointer; transition: all .2s; position: relative; }
  .qz-bookmark-btn:hover { border-color: var(--amber); color: var(--amber); }
  .qz-bookmark-btn.saved { border-color: var(--amber); color: var(--amber); background: rgba(255,179,71,0.08); }
  .qz-bookmark-btn.saved::after { content: ''; position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: var(--amber); border-radius: 50%; border: 2px solid var(--bg); }

  /* BOOKMARK POPUP MODAL */
  .bkm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 300; animation: bkm-fade-in 0.2s ease; }
  [data-theme="light"] .bkm-overlay { background: rgba(0,0,0,0.35); }
  @keyframes bkm-fade-in { from { opacity: 0; } to { opacity: 1; } }
  .bkm-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 440px; max-width: 90vw; max-height: 80vh; background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; z-index: 301; animation: bkm-popup-in 0.3s cubic-bezier(0.34,1.56,0.64,1); overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
  [data-theme="light"] .bkm-popup { box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
  @keyframes bkm-popup-in { from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
  .bkm-popup-saved { animation: bkm-saved-pulse 0.5s ease; }
  @keyframes bkm-saved-pulse { 0% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.03); } 100% { transform: translate(-50%, -50%) scale(1); } }
  .bkm-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .bkm-header-left { display: flex; align-items: center; gap: 8px; }
  .bkm-emoji { font-size: 20px; }
  .bkm-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; }
  .bkm-close { background: none; border: 1px solid var(--border2); width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); font-size: 14px; transition: all .2s; }
  .bkm-close:hover { border-color: var(--accent3); color: var(--accent3); }
  .bkm-question-preview { padding: 16px 20px; background: var(--surface2); }
  .bkm-q-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .bkm-q-text { font-size: 14px; line-height: 1.55; color: var(--text); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .bkm-note-section { padding: 16px 20px; }
  .bkm-note-label { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 8px; display: block; }
  .bkm-textarea { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 12px; padding: 12px 14px; font-size: 14px; color: var(--text); font-family: 'DM Sans', sans-serif; resize: vertical; min-height: 70px; outline: none; transition: border-color .2s, box-shadow .2s; }
  .bkm-textarea::placeholder { color: var(--muted); }
  .bkm-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124,92,252,0.12); }
  .bkm-actions { display: flex; gap: 10px; padding: 12px 20px 18px; justify-content: flex-end; }
  .bkm-skip-btn { background: none; border: 1px solid var(--muted2); border-radius: 10px; padding: 9px 18px; color: var(--muted); font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .bkm-skip-btn:hover:not(:disabled) { border-color: var(--border2); color: var(--text); }
  .bkm-skip-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .bkm-save-btn { background: linear-gradient(135deg, var(--amber), #FF9A3E); border: none; border-radius: 10px; padding: 9px 22px; color: #0A0B0F; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .bkm-save-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .bkm-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .bkm-saved-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 2rem; gap: 10px; }
  .bkm-saved-icon { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, rgba(255,179,71,0.2), rgba(0,229,192,0.15)); display: flex; align-items: center; justify-content: center; font-size: 26px; color: var(--accent2); animation: bkm-check-in 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes bkm-check-in { from { transform: scale(0); } to { transform: scale(1); } }
  .bkm-saved-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--amber); }

  @media (max-width: 480px) {
    .bkm-popup { width: 95vw; border-radius: 16px; }
    .bkm-header { padding: 12px 16px; }
    .bkm-question-preview { padding: 12px 16px; }
    .bkm-note-section { padding: 12px 16px; }
    .bkm-actions { padding: 10px 16px 14px; flex-direction: column; }
    .bkm-skip-btn, .bkm-save-btn { width: 100%; text-align: center; }
  }

  /* SUBMITTING OVERLAY */
  .qz-overlay { position: fixed; inset: 0; background: rgba(10,11,15,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; transition: background .3s; }
  [data-theme="light"] .qz-overlay { background: rgba(245,245,250,0.88); }
  .qz-overlay-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
  .qz-overlay-sub { font-size: 14px; color: var(--muted); }

  /* ── MOBILE RESPONSIVE ── */
  @media (max-width: 768px) {
    .qz-nav { padding: 0 1rem; height: 50px; }
    .qz-nav-meta { display: none; }
    .qz-logo { font-size: 16px; }
    .qz-logo-icon { width: 24px; height: 24px; }
    .qz-main { padding: 1rem 1rem 2rem; }

    .qz-stats-row { gap: 6px; }
    .qz-stat-chip { padding: 8px 6px; }
    .qz-stat-chip .sv { font-size: 15px; }
    .qz-stat-chip .sk { font-size: 10px; }

    .qz-top-row { flex-direction: column; gap: 10px; align-items: flex-start; }
    .qz-q-num { font-size: 22px; }
    .qz-timer-wrap { width: 52px; height: 52px; }
    .qz-timer-wrap svg { width: 52px; height: 52px; }
    .qz-timer-num .tnum { font-size: 14px; }

    .qz-q-card { padding: 1.25rem; border-radius: 14px; }
    .qz-q-text { font-size: 15px; }

    .qz-option { padding: 0.75rem 1rem; gap: 10px; }
    .qz-opt-letter { width: 28px; height: 28px; font-size: 12px; }
    .qz-opt-text { font-size: 13px; }

    .qz-map-dot { width: 26px; height: 26px; font-size: 10px; }

    .qz-bottom-row { flex-direction: column; gap: 10px; }
    .qz-bottom-row > div { width: 100%; display: flex; }
    .qz-skip-btn { flex: 1; }
    .qz-next-btn, .qz-finish-btn { width: 100%; justify-content: center; }

    .qz-feedback { padding: 0.75rem 1rem; }
  }

  @media (max-width: 480px) {
    .qz-nav { padding: 0 0.75rem; height: 46px; }
    .qz-nav-right { gap: 6px; }
    .qz-theme-btn { width: 30px; height: 30px; }
    .qz-quit-btn { font-size: 11px; padding: 4px 10px; }
    .qz-main { padding: 0.75rem 0.75rem 2rem; }

    .qz-stats-row { gap: 4px; margin-bottom: 1rem; }
    .qz-stat-chip { padding: 6px 4px; border-radius: 10px; }
    .qz-stat-chip .sv { font-size: 14px; }

    .qz-q-num { font-size: 20px; }
    .qz-q-card { padding: 1rem; }
    .qz-q-text { font-size: 14px; }
    .qz-option { padding: 0.65rem 0.85rem; border-radius: 12px; }
    .qz-opt-letter { width: 26px; height: 26px; font-size: 11px; border-radius: 8px; }

    .qz-map { padding: 1rem; }
    .qz-map-dot { width: 24px; height: 24px; font-size: 9px; border-radius: 6px; }

    .qz-skip-btn { padding: 10px 14px; font-size: 13px; }
    .qz-next-btn { padding: 10px 20px; font-size: 13px; }
    .qz-finish-btn { padding: 10px 20px; font-size: 13px; }
    .qz-bookmark-btn { padding: 10px; }
  }
`;

const LETTERS = ["A", "B", "C", "D"];
const CIRCUMFERENCE = 2 * Math.PI * 26;

/* ════════════════════════════════════════════════════════
   HELPER — Shuffle options and re-index correct answer
════════════════════════════════════════════════════════ */
const shuffleQuestionOptions = (q) => {
  if (!q || !Array.isArray(q.options) || q.options.length < 2) return q;

  const validLetters = ["A", "B", "C", "D"];
  let cleanedOptions = q.options.map((opt) =>
    String(opt)
      .replace(/^(?:Option\s+[A-D]:|[A-D][).:\s]+)/i, "")
      .trim()
  );
  while (cleanedOptions.length < 4) {
    cleanedOptions.push("None of the above");
  }
  cleanedOptions = cleanedOptions.slice(0, 4);

  let originalCorrectIdx = 0;
  if (typeof q.answer === "number" && q.answer >= 0 && q.answer < cleanedOptions.length) {
    originalCorrectIdx = q.answer;
  } else if (typeof q.correctAnswer === "string") {
    const map = { A: 0, B: 1, C: 2, D: 3 };
    originalCorrectIdx = map[q.correctAnswer.toUpperCase().trim()] ?? 0;
  }

  const correctText = cleanedOptions[originalCorrectIdx] ?? cleanedOptions[0];

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

/* ════════════════════════════════════════════════════════
   HELPER — safely read token from localStorage
   Handles cases where token was accidentally stored as
   JSON string e.g. '"eyJ..."' (with extra quotes)
════════════════════════════════════════════════════════ */
const getToken = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return null;
  // If someone accidentally stored it JSON-encoded, unwrap it
  try {
    const parsed = JSON.parse(raw);
    // parsed will be a plain string if it was double-encoded
    if (typeof parsed === "string") return parsed;
    // or an object with a token field
    if (parsed?.token) return parsed.token;
    if (parsed?.accessToken) return parsed.accessToken;
  } catch {
    // raw is already a plain JWT string — this is the happy path
  }
  return raw;
};

/* ════════════════════════════════════════════════════════
   QUIZ COMPONENT
════════════════════════════════════════════════════════ */
export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();

  const config = location.state || {};
  const {
    subject,
    difficulty = "Medium",
    questions: questionCount = 10,
    timePerQ: timePerQuestion = 30,
    options: quizOptions = {},
    preGeneratedQuestions = null,
    scanId = null,
    isScannedQuiz = false,
    language = "en",
  } = config;

  const [loadingState, setLoadingState] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answered, setAnswered] = useState({});
  const [skipped, setSkipped] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [bookmarkNotes, setBookmarkNotes] = useState({});
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [submitting, setSubmitting] = useState(false);

  /* ════════════ THEME (light/dark) ════════════ */
  const { theme, toggleTheme } = useTheme();

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const totalStartRef = useRef(Date.now());

  const totalQ = questions.length;
  const correctCount = Object.values(answered).filter((a) => a.correct).length;
  const wrongCount = Object.values(answered).filter((a) => !a.correct).length;
  const skippedCount = Object.keys(skipped).length;
  const remaining = totalQ - Object.keys(answered).length - skippedCount;
  const progressPct =
    totalQ > 0
      ? Math.round(
          ((Object.keys(answered).length + skippedCount) / totalQ) * 100,
        )
      : 0;

  const currentQ = questions[currentIdx];

  /* ════════════ FETCH QUESTIONS ════════════
     Use axiosInstance — the request interceptor automatically
        reads token from localStorage and sets Authorization header.
        No manual token handling needed here.
  ═══════════════════════════════════════════ */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // ── GyanS: use pre-generated questions if provided ──
        if (preGeneratedQuestions && preGeneratedQuestions.length > 0) {
          console.log(`GyanS: Using ${preGeneratedQuestions.length} pre-generated questions`);
          let qs = preGeneratedQuestions.map((q) => {
            if (q.correctAnswer && q.correctAnswer !== "?") {
              return shuffleQuestionOptions(q);
            }
            return q;
          });
          if (quizOptions.shuffle !== false) {
            qs = [...qs].sort(() => Math.random() - 0.5);
          }
          setQuestions(qs);
          setLoadingState("ready");
          totalStartRef.current = Date.now();
          return;
        }

        //  Guard: verify token exists and looks like a JWT before requesting
        const token = getToken();
        if (!token || token === "undefined" || token === "null") {
          console.error("No valid token found, redirecting to login");
          navigate("/");
          return;
        }

        const rawSubjects = Array.isArray(subject) ? subject : [subject];
        const subjects = rawSubjects.filter(Boolean);
        if (subjects.length === 0) subjects.push("Mathematics");

        // Clear any stale cached questions so language / subject changes are always respected
        try {
          await axiosInstance.post("/api/quiz/clear-cache");
        } catch (_) {
          // Non-critical: if cache clear fails, continue quiz generation anyway
        }

        //  axiosInstance already has baseURL + Authorization interceptor
        const res = await axiosInstance.post("/api/quiz/generate-questions", {
          subjects,
          difficulty,
          count: questionCount,
          language,
        });

        const data = res.data;

        if (!data.success || !data.questions?.length) {
          throw new Error(data.message || "No questions returned");
        }

        let qs = data.questions.map(shuffleQuestionOptions);
        if (quizOptions.shuffle !== false) {
          qs = [...qs].sort(() => Math.random() - 0.5);
        }

        setQuestions(qs);
        setLoadingState("ready");
        totalStartRef.current = Date.now();
      } catch (err) {
        console.error("fetchQuestions error:", err);

        //  If 401, token is bad — clear storage and redirect to login
        if (err.response?.status === 401) {
          console.error("Token rejected by server — clearing and redirecting");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }

        setLoadingState("error");
      }
    };

    fetchQuestions();
  }, []);

  /* ════════════ TIMER ════════════ */
  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(timePerQuestion);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          setSkipped((s) => {
            if (!s[currentIdx]) {
              return { ...s, [currentIdx]: true };
            }
            return s;
          });
          setTimeout(() => {
            setCurrentIdx((idx) => {
              if (idx < questions.length - 1) return idx + 1;
              return idx;
            });
          }, 700);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentIdx, questions.length, stopTimer, timePerQuestion]);

  useEffect(() => {
    if (loadingState !== "ready" || !currentQ) return;
    if (answered[currentIdx] || skipped[currentIdx]) {
      stopTimer();
      return;
    }
    startTimer();
    return () => stopTimer();
  }, [currentIdx, loadingState]);

  useEffect(() => () => stopTimer(), []);

  // Update feedback when navigating between already answered questions
  useEffect(() => {
    if (answered[currentIdx]) {
      const ans = answered[currentIdx];
      setFeedback({
        correct: ans.correct,
        explanation:
          currentQ?.explanation ||
          (ans.correct
            ? "Correct! Well done."
            : `The correct answer is: ${currentQ?.options?.[currentQ?.answer] || currentQ?.correctAnswer}`),
      });
    } else {
      setFeedback(null);
    }
  }, [currentIdx, answered, currentQ]);

  /* ════════════ ANSWER SELECTION ════════════ */
  const selectOption = (optionIdx) => {
    if (answered[currentIdx] || skipped[currentIdx]) return;
    stopTimer();

    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const isCorrect = optionIdx === currentQ.answer;

    setAnswered((prev) => ({
      ...prev,
      [currentIdx]: {
        chosen: optionIdx,
        correct: isCorrect,
        timeTaken,
        questionText: currentQ.question,
        options: currentQ.options,
        correctAnswer: currentQ.options[currentQ.answer],
        userAnswer: currentQ.options[optionIdx],
        topic: currentQ.topic,
        subject: currentQ.subject,
        isBookmarked: !!bookmarked[currentIdx],
      },
    }));

    // Always show immediate feedback on answer selection
    setFeedback({
      correct: isCorrect,
      explanation:
        currentQ.explanation ||
        (isCorrect
          ? "Correct! Well done."
          : `The correct answer is: ${currentQ.options[currentQ.answer]}`),
    });
  };

  /* ════════════ NAVIGATION ════════════ */
  const handleSkip = () => {
    if (answered[currentIdx]) return;
    stopTimer();
    setSkipped((prev) => ({ ...prev, [currentIdx]: true }));
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((i) => i + 1);
    }
  };

  const jumpTo = (idx) => {
    stopTimer();
    setCurrentIdx(idx);
    setShowMap(false);
  };

  const handleBookmark = () => {
    if (bookmarked[currentIdx]) {
      // Already bookmarked — remove it
      setBookmarked((prev) => ({ ...prev, [currentIdx]: false }));
      // Also remove from backend
      const qId = `quiz_${Date.now()}_${currentIdx}`;
      axiosInstance.delete(`/api/quiz/bookmark/${encodeURIComponent(currentQ?.question)}`).catch(() => {});
    } else {
      // Open the bookmark popup
      setShowBookmarkModal(true);
    }
  };

  const handleBookmarkSave = async (note) => {
    const questionText = currentQ?.question || '';
    const questionId = questionText; // use question text as ID for uniqueness
    try {
      await axiosInstance.post('/api/quiz/bookmark', {
        questionId,
        subject: currentQ?.subject || (Array.isArray(subject) ? subject[0] : subject),
        topic: currentQ?.topic || '',
        questionText,
        notes: note,
      });
    } catch (err) {
      // If already bookmarked (409/400), update the note instead
      if (err.response?.status === 400) {
        await axiosInstance.patch(`/api/quiz/bookmark/${encodeURIComponent(questionId)}`, { notes: note });
      } else {
        throw err;
      }
    }
    setBookmarked((prev) => ({ ...prev, [currentIdx]: true }));
    setBookmarkNotes((prev) => ({ ...prev, [currentIdx]: note }));
  };

  /* ════════════ SUBMIT QUIZ ════════════ */
  const handleFinish = async () => {
    stopTimer();
    setSubmitting(true);

    try {
      const totalTimeTaken = Math.round(
        (Date.now() - totalStartRef.current) / 1000,
      );

      const questionResults = questions.map((q, i) => ({
        questionText: q.question,
        options: q.options,
        correctAnswer: q.options[q.answer],
        userAnswer: answered[i]?.userAnswer || null,
        isCorrect: answered[i]?.correct || false,
        timeTaken: answered[i]?.timeTaken || 0,
        topic: q.topic,
        isBookmarked: !!bookmarked[i],
      }));

      //  Use axiosInstance here too — consistent token handling
      const res = await axiosInstance.post("/api/quiz/submit", {
        subject: Array.isArray(subject) ? subject.join(", ") : subject,
        difficulty,
        totalQuestions: totalQ,
        timePerQuestion,
        options: quizOptions,
        questions: questionResults,
        timeTakenTotal: totalTimeTaken,
      });

      const data = res.data;

      // ── GyanS: Update scan record with quiz results ──
      if (isScannedQuiz && scanId) {
        try {
          await axiosInstance.patch(`/api/scan/${scanId}/complete`, {
            quizId: data.result?.quizId,
            score: data.result?.scorePercent || 0,
            totalCorrect: data.result?.totalCorrect || 0,
            totalWrong: data.result?.totalWrong || 0,
            totalSkipped: data.result?.totalSkipped || 0,
            timeTaken: totalTimeTaken,
          });
          console.log("GyanS: Scan record updated with quiz results");
        } catch (scanErr) {
          console.warn("Failed to update scan record:", scanErr);
          // Don't block navigation — quiz results are already saved
        }
      }

      navigate("/results", {
        state: {
          result: data.result,
          questions: questionResults,
          config: { subject, difficulty, totalQ, timePerQuestion },
        },
      });
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitting(false);
      alert("Failed to submit quiz. Please try again.");
    }
  };

  /* ════════════ TIMER UI ════════════ */
  const timerPercent = timeLeft / timePerQuestion;
  const dashOffset = CIRCUMFERENCE * (1 - timerPercent);
  const timerColor =
    timeLeft > timePerQuestion * 0.5
      ? "#7C5CFC"
      : timeLeft > timePerQuestion * 0.25
        ? "#FFB347"
        : "#FF6B6B";

  const getOptionClass = (optIdx) => {
    const ans = answered[currentIdx];
    if (!ans) return "";

    if (optIdx === currentQ.answer) return "correct";
    if (optIdx === ans.chosen && !ans.correct) return "wrong";
    if (optIdx === ans.chosen) return "correct";
    return "";
  };

  const diffTag = difficulty?.toLowerCase();

  /* ════════════ RENDER: LOADING ════════════ */
  if (loadingState === "loading") {
    return (
      <>
        <style>{css}</style>
        <div className="qz-root">
          <div className="qz-center">
            <div className="qz-spinner" />
            <div className="qz-loading-title">Generating your quiz...</div>
            <div className="qz-loading-sub">
              Gyantra is crafting {questionCount} {difficulty} questions on-
              {Array.isArray(subject) ? subject.join(", ") : subject}, it can
              take some time
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ════════════ RENDER: ERROR ════════════ */
  if (loadingState === "error") {
    return (
      <>
        <style>{css}</style>
        <div className="qz-root">
          <div className="qz-center">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><AlertTriangle size={40} color="var(--accent3)" /></div>
            <div className="qz-loading-title">Failed to generate questions</div>
            <div className="qz-loading-sub">
              Check your internet connection or try a different subject.
            </div>
            <button
              className="qz-next-btn"
              style={{ marginTop: 8 }}
              onClick={() => navigate("/QuizSetup")}
            >
              ← Back to Setup
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ════════════ RENDER: QUIZ ════════════ */
  const isLastQuestion = currentIdx === totalQ - 1;
  const allDone = remaining === 0;
  const currentAnswered = !!answered[currentIdx];
  const currentSkipped = !!skipped[currentIdx];

  return (
    <>
      <style>{css}</style>

      {submitting && (
        <div className="qz-overlay">
          <div className="qz-spinner" />
          <div className="qz-overlay-title">Submitting your quiz...</div>
          <div className="qz-overlay-sub">Calculating your score and XP</div>
        </div>
      )}

      <div className="qz-root">
        {/* ── NAV ── */}
        <nav className="qz-nav">
          <div className="qz-logo" onClick={() => { if (window.confirm("Quit quiz? Your progress will be lost.")) { navigate("/dashboard"); } }} style={{ cursor: "pointer" }}>
            <div className="qz-logo-icon"><img src="/favicon-32.png" alt="Gyantra" /></div>
            Gyan<span>tra</span>
          </div>
          <div className="qz-nav-meta">
            <span className={`qz-nav-tag tag-${diffTag}`}>{difficulty}</span>
            {language && language !== "en" && (
              <span className="qz-nav-lang">
                <Globe size={12} />
                {language.toUpperCase()}
              </span>
            )}
            <span className="qz-nav-subjects">
              {Array.isArray(subject) ? subject.join(" · ") : subject}
            </span>
          </div>
          <div className="qz-nav-right">
            <button
              className="qz-theme-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>
            <button
              className="qz-quit-btn"
              onClick={() => {
                if (window.confirm("Quit quiz? Your progress will be lost.")) {
                  navigate("/dashboard");
                }
              }}
            >
              ● Quit
            </button>
          </div>
        </nav>

        {/* PROGRESS BAR */}
        <div className="qz-progress-wrap">
          <div
            className="qz-progress-fill"
            style={{ width: `${Math.max(progressPct, 2)}%` }}
          />
        </div>

        <main className="qz-main">
          {/* STATS ROW */}
          <div className="qz-stats-row">
            <div className="qz-stat-chip">
              <div className="sv sv-green">{correctCount}</div>
              <div className="sk">Correct</div>
            </div>
            <div className="qz-stat-chip">
              <div className="sv sv-red">{wrongCount}</div>
              <div className="sk">Wrong</div>
            </div>
            <div className="qz-stat-chip">
              <div className="sv sv-amber">{skippedCount}</div>
              <div className="sk">Skipped</div>
            </div>
            <div className="qz-stat-chip">
              <div className="sv sv-purple">{remaining}</div>
              <div className="sk">Remaining</div>
            </div>
          </div>

          {/* TOP ROW */}
          <div className="qz-top-row">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="qz-q-counter">
                <div className="qz-q-num">Q{currentIdx + 1}</div>
                <div className="qz-q-total">/ {totalQ}</div>
              </div>
              <div className="qz-subject-pill">{currentQ?.subject}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                className="qz-map-toggle"
                onClick={() => setShowMap((p) => !p)}
              >
                ⊞ Question map
              </div>
              {/* TIMER RING */}
              <div className="qz-timer-wrap">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="#3A394A"
                    strokeWidth="5"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke={timerColor}
                    strokeWidth="5"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={
                      currentAnswered || currentSkipped ? 0 : dashOffset
                    }
                    strokeLinecap="round"
                    style={{
                      transition: "stroke-dashoffset 1s linear, stroke 0.3s",
                    }}
                  />
                </svg>
                <div className="qz-timer-num">
                  <div
                    className="tnum"
                    style={{
                      color:
                        currentAnswered || currentSkipped
                          ? "#7C5CFC"
                          : timerColor,
                    }}
                  >
                    {currentAnswered || currentSkipped ? <Check size={16} /> : timeLeft}
                  </div>
                  <div className="tlabel">
                    {currentAnswered || currentSkipped ? "" : "sec"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUESTION MAP */}
          {showMap && (
            <div className="qz-map">
              <div className="qz-map-title">
                Question map &nbsp;
                <span style={{ color: "#7C5CFC" }}>■ answered</span>&nbsp;
                <span style={{ color: "#7C5CFC", opacity: 0.5 }}>
                  ■ current
                </span>
                &nbsp;
                <span style={{ color: "#FFB347" }}>■ skipped</span>
              </div>
              <div className="qz-map-grid">
                {questions.map((_, i) => {
                  let cls = "qz-map-dot";
                  if (i === currentIdx) cls += " current";
                  else if (answered[i]) cls += " answered";
                  else if (skipped[i]) cls += " skipped";
                  return (
                    <div key={i} className={cls} onClick={() => jumpTo(i)}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUESTION CARD */}
          <div className="qz-q-card">
            <div className="qz-q-text">{currentQ?.question}</div>
          </div>

          {/* OPTIONS */}
          <div className="qz-options">
            {currentQ?.options.map((opt, i) => {
              const stateCls = getOptionClass(i);
              const locked = currentAnswered || currentSkipped;
              return (
                <div
                  key={i}
                  className={`qz-option${stateCls ? " " + stateCls : ""}${locked ? " locked" : ""}`}
                  onClick={() => !locked && selectOption(i)}
                >
                  <div className="qz-opt-letter">{LETTERS[i]}</div>
                  <div className="qz-opt-text">{opt}</div>
                  {stateCls === "correct" && (
                    <span style={{ marginLeft: "auto", display: "inline-flex" }}><Check size={16} color="var(--accent2)" /></span>
                  )}
                  {stateCls === "wrong" && (
                    <span style={{ marginLeft: "auto", display: "inline-flex" }}><X size={16} color="var(--accent3)" /></span>
                  )}
                </div>
              );
            })}
          </div>

          {/* FEEDBACK BOX */}
          {feedback && (
            <div
              className={`qz-feedback ${feedback.correct ? "correct-fb" : "wrong-fb"}`}
            >
              <div className="qz-fb-icon">{feedback.correct ? <Check size={16} /> : <X size={16} />}</div>
              <div>
                <div className="qz-fb-title">
                  {feedback.correct ? "Correct! Well done." : "Incorrect!"}
                </div>
                <div className="qz-fb-explain">{feedback.explanation}</div>
              </div>
            </div>
          )}

          {/* BOOKMARK MODAL */}
          <BookmarkModal
            isOpen={showBookmarkModal}
            onClose={() => setShowBookmarkModal(false)}
            question={currentQ?.question}
            onSave={handleBookmarkSave}
            existingNote={bookmarkNotes[currentIdx] || ''}
          />

          {/* BOTTOM ROW */}
          <div className="qz-bottom-row">
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={`qz-bookmark-btn${bookmarked[currentIdx] ? " saved" : ""}`}
                onClick={handleBookmark}
                title={bookmarked[currentIdx] ? "Remove bookmark" : "Bookmark this question"}
              >
                <Bookmark size={15} style={{ verticalAlign: "middle" }} />
              </button>
              <button
                className="qz-skip-btn"
                disabled={currentAnswered || currentSkipped}
                onClick={handleSkip}
              >
                Skip →
              </button>
            </div>

            {isLastQuestion || allDone ? (
              <button className="qz-finish-btn" onClick={handleFinish}>
                <Zap size={14} style={{ display: "inline-block", marginRight: 6, verticalAlign: "middle" }} /> Finish Quiz
              </button>
            ) : (
              <button
                className="qz-next-btn"
                disabled={!currentAnswered && !currentSkipped}
                onClick={handleNext}
              >
                Next →
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
