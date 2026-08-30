import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import ghostIcon from "../assets/gyanbot-icon.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const STORAGE_KEY = "gyanbot-history";
const RAG_KEY = "gyanbot-allow-rag";

// ─────────────────────────────────────────────
//  Inline CSS for ghost animations (injected once)
// ─────────────────────────────────────────────
const GHOST_CSS = `
  @keyframes ghostFloat {
    0%   { transform: translateY(0px) rotate(-1deg); }
    25%  { transform: translateY(-8px) rotate(0.5deg); }
    50%  { transform: translateY(-15px) rotate(1.5deg); }
    75%  { transform: translateY(-8px) rotate(0.5deg); }
    100% { transform: translateY(0px) rotate(-1deg); }
  }
  @keyframes ghostDance {
    0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
    15%      { transform: translateY(-14px) rotate(-12deg) scaleX(0.82) scaleY(1.18); }
    30%      { transform: translateY(6px) rotate(12deg) scaleX(1.15) scaleY(0.85); }
    45%      { transform: translateY(-10px) rotate(-8deg) scaleX(0.88) scaleY(1.12); }
    60%      { transform: translateY(4px) rotate(8deg) scaleX(1.1) scaleY(0.9); }
    75%      { transform: translateY(-6px) rotate(-4deg) scaleX(0.92) scaleY(1.08); }
    90%      { transform: translateY(2px) rotate(4deg) scaleX(1.05) scaleY(0.95); }
  }
  @keyframes chatSlideUp {
    from { opacity: 0; transform: translateY(24px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes typingBounce {
    0%, 80%, 100% { transform: translateY(0); }
    40%           { transform: translateY(-6px); }
  }
  .ghost-float   { animation: ghostFloat 3.2s ease-in-out infinite; transition: all 0.3s ease; }
  .ghost-float:hover { animation: ghostDance 1.2s ease-in-out 2 forwards; }
  .chat-slide-up { animation: chatSlideUp 0.38s cubic-bezier(0.34,1.4,0.64,1) forwards; }
  .dot-bounce    { animation: typingBounce 1.2s ease-in-out infinite; }
  .gyanbot-scrollbar::-webkit-scrollbar { width: 4px; }
  .gyanbot-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .gyanbot-scrollbar::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.35); border-radius: 9999px; }
`;

// ─────────────────────────────────────────────
//  Lightweight custom markdown renderer
// ─────────────────────────────────────────────
function BotMarkdown({ content, isDark }) {
  const textColor  = isDark ? "text-zinc-200"  : "text-slate-800";
  const codeBg     = isDark ? "bg-[#0d0d1a] border-[#2a2a4a] text-emerald-400" : "bg-slate-900 border-slate-700 text-emerald-300";
  const inlineCode = isDark ? "bg-zinc-800 text-fuchsia-300" : "bg-slate-100 text-fuchsia-700";

  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i} className="font-semibold">{p.slice(2,-2)}</strong>;
      if (p.startsWith("`") && p.endsWith("`"))
        return <code key={i} className={`${inlineCode} px-1.5 py-0.5 rounded text-xs font-mono`}>{p.slice(1,-1)}</code>;
      return p;
    });
  };

  const lines = content.split("\n");
  const els = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (ln.startsWith("```")) {
      const block = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { block.push(lines[i]); i++; }
      els.push(<pre key={i} className={`${codeBg} border rounded-xl p-3 text-xs font-mono overflow-x-auto my-2 leading-relaxed`}>{block.join("\n")}</pre>);
    } else if (/^#{1,3}\s/.test(ln)) {
      const lv = ln.match(/^(#{1,3})/)[0].length;
      const tx = ln.replace(/^#{1,3}\s/,"");
      els.push(<p key={i} className={`${lv===1?"font-bold text-base mt-2 mb-1":"font-semibold text-sm mt-1.5 mb-0.5"} ${textColor}`}>{renderInline(tx)}</p>);
    } else if (/^[-*]\s/.test(ln)) {
      els.push(<li key={i} className={`ml-4 text-sm list-disc ${textColor} my-0.5`}>{renderInline(ln.replace(/^[-*]\s/,""))}</li>);
    } else if (/^\d+\.\s/.test(ln)) {
      els.push(<li key={i} className={`ml-4 text-sm list-decimal ${textColor} my-0.5`}>{renderInline(ln.replace(/^\d+\.\s/,""))}</li>);
    } else if (ln.trim()==="") {
      els.push(<div key={i} className="h-1.5"/>);
    } else {
      els.push(<p key={i} className={`text-sm leading-relaxed ${textColor}`}>{renderInline(ln)}</p>);
    }
    i++;
  }
  return <div className="space-y-0.5">{els}</div>;
}

// ─────────────────────────────────────────────
//  Typing indicator
// ─────────────────────────────────────────────
function TypingDots({ isDark }) {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0,1,2].map(d => (
        <span
          key={d}
          className={`w-1.5 h-1.5 rounded-full dot-bounce ${isDark?"bg-violet-400":"bg-violet-500"}`}
          style={{ animationDelay:`${d*0.2}s` }}
        />
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────
//  Single message bubble
// ─────────────────────────────────────────────
function MessageBubble({ msg, isDark }) {
  const isBot = msg.role === "assistant";
  return (
    <div className={`flex ${isBot?"justify-start":"justify-end"} mb-3 items-end gap-2`}>
      {isBot && (
        <img
          src={ghostIcon}
          alt="GyanBot"
          className={`w-7 h-7 rounded-full shrink-0 mb-0.5 p-0.5 ${isDark?"bg-white/10":"bg-violet-50 border border-violet-100"}`}
          style={{ filter: isDark ? "invert(1) brightness(0.9)" : "none" }}
        />
      )}
      <div className={`
        max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
        ${isBot
          ? isDark
            ? "bg-[#1c1c30] border border-[#2e2e50] text-zinc-200"
            : "bg-white border border-slate-200 text-slate-800 shadow-sm"
          : "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md"
        }
        ${!isBot ? "rounded-br-sm" : "rounded-bl-sm"}
      `}>
        {isBot
          ? <BotMarkdown content={msg.content} isDark={isDark}/>
          : <p className="whitespace-pre-wrap">{msg.content}</p>
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main GyanBot component
// ─────────────────────────────────────────────
export default function GyanBot() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const token  = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [allowRag, setAllowRag] = useState(() => {
    const s = localStorage.getItem(RAG_KEY);
    return s === null ? true : s === "true";
  });
  const [showPrivacy, setShowPrivacy] = useState(false);

  const inputRef  = useRef(null);

  const POSITION_KEY = "gyanbot-position";
  const DIMENSIONS_KEY = "gyanbot-dimensions";

  const [position, setPosition] = useState(() => {
    try { return JSON.parse(localStorage.getItem(POSITION_KEY)) || { right: 24, bottom: 30 }; }
    catch { return { right: 24, bottom: 30 }; }
  });

  const [dimensions, setDimensions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DIMENSIONS_KEY)) || { width: 385, height: 580 }; }
    catch { return { width: 385, height: 580 }; }
  });

  // Constraints
  const MIN_WIDTH = 320;
  const MAX_WIDTH = 600;
  const MIN_HEIGHT = 400;
  const MAX_HEIGHT = 800;

  // Refs for direct DOM updates (performance)
  const launcherRef = useRef(null);
  const chatPanelRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Buffers for smooth drags and resizes
  const dragStart = useRef({ clientX: 0, clientY: 0, initialRight: 24, initialBottom: 30 });
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const draggedPosition = useRef({ right: 24, bottom: 30 });

  const resizeStart = useRef({ clientX: 0, clientY: 0, initialWidth: 385, initialHeight: 580 });
  const isResizing = useRef(false);
  const resizeType = useRef(""); // "left", "top", "top-left"
  const resizedDimensions = useRef({ width: 385, height: 580 });

  // Sync buffers
  useEffect(() => {
    draggedPosition.current = position;
  }, [position]);

  useEffect(() => {
    resizedDimensions.current = dimensions;
  }, [dimensions]);

  useEffect(() => {
    localStorage.setItem(POSITION_KEY, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem(DIMENSIONS_KEY, JSON.stringify(dimensions));
  }, [dimensions]);

  // Ghost Drag Handlers
  const handleMouseMoveGhost = useCallback((e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStart.current.clientX;
    const deltaY = e.clientY - dragStart.current.clientY;
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      dragMoved.current = true;
    }
    const newRight = Math.max(10, Math.min(window.innerWidth - 80, dragStart.current.initialRight - deltaX));
    const newBottom = Math.max(10, Math.min(window.innerHeight - 80, dragStart.current.initialBottom - deltaY));

    if (launcherRef.current) {
      launcherRef.current.style.right = `${newRight}px`;
      launcherRef.current.style.bottom = `${newBottom}px`;
    }
    if (chatPanelRef.current) {
      chatPanelRef.current.style.right = `${newRight}px`;
      chatPanelRef.current.style.bottom = `${newBottom + 90}px`;
    }
    draggedPosition.current = { right: newRight, bottom: newBottom };
  }, []);

  const handleMouseUpGhost = useCallback((e) => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMoveGhost);
    document.removeEventListener("mouseup", handleMouseUpGhost);
    setPosition(draggedPosition.current);
  }, [handleMouseMoveGhost]);

  const handleMouseDownGhost = (e) => {
    if (e.button !== 0) return;
    dragMoved.current = false;
    isDragging.current = true;
    dragStart.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialRight: position.right,
      initialBottom: position.bottom
    };
    document.addEventListener("mousemove", handleMouseMoveGhost);
    document.addEventListener("mouseup", handleMouseUpGhost);
  };

  const handleTouchMoveGhost = useCallback((e) => {
    if (!isDragging.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.current.clientX;
    const deltaY = touch.clientY - dragStart.current.clientY;
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      dragMoved.current = true;
    }
    const newRight = Math.max(10, Math.min(window.innerWidth - 80, dragStart.current.initialRight - deltaX));
    const newBottom = Math.max(10, Math.min(window.innerHeight - 80, dragStart.current.initialBottom - deltaY));

    if (launcherRef.current) {
      launcherRef.current.style.right = `${newRight}px`;
      launcherRef.current.style.bottom = `${newBottom}px`;
    }
    if (chatPanelRef.current) {
      chatPanelRef.current.style.right = `${newRight}px`;
      chatPanelRef.current.style.bottom = `${newBottom + 90}px`;
    }
    draggedPosition.current = { right: newRight, bottom: newBottom };
    if (e.cancelable) e.preventDefault();
  }, []);

  const handleTouchEndGhost = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener("touchmove", handleTouchMoveGhost);
    document.removeEventListener("touchend", handleTouchEndGhost);
    setPosition(draggedPosition.current);
  }, [handleTouchMoveGhost]);

  const handleTouchStartGhost = (e) => {
    dragMoved.current = false;
    isDragging.current = true;
    const touch = e.touches[0];
    dragStart.current = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      initialRight: position.right,
      initialBottom: position.bottom
    };
    document.addEventListener("touchmove", handleTouchMoveGhost, { passive: false });
    document.addEventListener("touchend", handleTouchEndGhost);
  };

  // Header Drag Handlers
  const handleMouseMoveHeader = useCallback((e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStart.current.clientX;
    const deltaY = e.clientY - dragStart.current.clientY;
    const newRight = Math.max(10, Math.min(window.innerWidth - (resizedDimensions.current.width + 10), dragStart.current.initialRight - deltaX));
    const newBottom = Math.max(10, Math.min(window.innerHeight - (resizedDimensions.current.height + 100), dragStart.current.initialBottom - deltaY));

    if (launcherRef.current) {
      launcherRef.current.style.right = `${newRight}px`;
      launcherRef.current.style.bottom = `${newBottom}px`;
    }
    if (chatPanelRef.current) {
      chatPanelRef.current.style.right = `${newRight}px`;
      chatPanelRef.current.style.bottom = `${newBottom + 90}px`;
    }
    draggedPosition.current = { right: newRight, bottom: newBottom };
  }, []);

  const handleMouseUpHeader = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMoveHeader);
    document.removeEventListener("mouseup", handleMouseUpHeader);
    setPosition(draggedPosition.current);
  }, [handleMouseMoveHeader]);

  const handleMouseDownHeader = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea")) return;
    isDragging.current = true;
    dragStart.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialRight: position.right,
      initialBottom: position.bottom
    };
    document.addEventListener("mousemove", handleMouseMoveHeader);
    document.addEventListener("mouseup", handleMouseUpHeader);
  };

  const handleTouchMoveHeader = useCallback((e) => {
    if (!isDragging.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.current.clientX;
    const deltaY = touch.clientY - dragStart.current.clientY;
    const newRight = Math.max(10, Math.min(window.innerWidth - (resizedDimensions.current.width + 10), dragStart.current.initialRight - deltaX));
    const newBottom = Math.max(10, Math.min(window.innerHeight - (resizedDimensions.current.height + 100), dragStart.current.initialBottom - deltaY));

    if (launcherRef.current) {
      launcherRef.current.style.right = `${newRight}px`;
      launcherRef.current.style.bottom = `${newBottom}px`;
    }
    if (chatPanelRef.current) {
      chatPanelRef.current.style.right = `${newRight}px`;
      chatPanelRef.current.style.bottom = `${newBottom + 90}px`;
    }
    draggedPosition.current = { right: newRight, bottom: newBottom };
    if (e.cancelable) e.preventDefault();
  }, []);

  const handleTouchEndHeader = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener("touchmove", handleTouchMoveHeader);
    document.removeEventListener("touchend", handleTouchEndHeader);
    setPosition(draggedPosition.current);
  }, [handleTouchMoveHeader]);

  const handleTouchStartHeader = (e) => {
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea")) return;
    isDragging.current = true;
    const touch = e.touches[0];
    dragStart.current = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      initialRight: position.right,
      initialBottom: position.bottom
    };
    document.addEventListener("touchmove", handleTouchMoveHeader, { passive: false });
    document.addEventListener("touchend", handleTouchEndHeader);
  };

  // Panel Resizing Handlers
  const handleMouseMoveResize = useCallback((e) => {
    if (!isResizing.current) return;
    const deltaX = e.clientX - resizeStart.current.clientX;
    const deltaY = e.clientY - resizeStart.current.clientY;

    let newWidth = resizeStart.current.initialWidth;
    let newHeight = resizeStart.current.initialHeight;

    if (resizeType.current === "left" || resizeType.current === "top-left") {
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStart.current.initialWidth - deltaX));
    }
    if (resizeType.current === "top" || resizeType.current === "top-left") {
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStart.current.initialHeight - deltaY));
    }

    if (chatPanelRef.current) {
      chatPanelRef.current.style.width = `${newWidth}px`;
      chatPanelRef.current.style.height = `${newHeight}px`;
    }
    resizedDimensions.current = { width: newWidth, height: newHeight };
  }, []);

  const handleMouseUpResize = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mouseup", handleMouseUpResize);
    setDimensions(resizedDimensions.current);
  }, [handleMouseMoveResize]);

  const startResize = (e, type) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeType.current = type;
    resizeStart.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialWidth: dimensions.width,
      initialHeight: dimensions.height
    };
    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUpResize);
  };

  const handleTouchMoveResize = useCallback((e) => {
    if (!isResizing.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - resizeStart.current.clientX;
    const deltaY = touch.clientY - resizeStart.current.clientY;

    let newWidth = resizeStart.current.initialWidth;
    let newHeight = resizeStart.current.initialHeight;

    if (resizeType.current === "left" || resizeType.current === "top-left") {
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStart.current.initialWidth - deltaX));
    }
    if (resizeType.current === "top" || resizeType.current === "top-left") {
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStart.current.initialHeight - deltaY));
    }

    if (chatPanelRef.current) {
      chatPanelRef.current.style.width = `${newWidth}px`;
      chatPanelRef.current.style.height = `${newHeight}px`;
    }
    resizedDimensions.current = { width: newWidth, height: newHeight };
    if (e.cancelable) e.preventDefault();
  }, []);

  const handleTouchEndResize = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("touchmove", handleTouchMoveResize);
    document.removeEventListener("touchend", handleTouchEndResize);
    setDimensions(resizedDimensions.current);
  }, [handleTouchMoveResize]);

  const startResizeTouch = (e, type) => {
    e.stopPropagation();
    isResizing.current = true;
    resizeType.current = type;
    const touch = e.touches[0];
    resizeStart.current = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      initialWidth: dimensions.width,
      initialHeight: dimensions.height
    };
    document.addEventListener("touchmove", handleTouchMoveResize, { passive: false });
    document.addEventListener("touchend", handleTouchEndResize);
  };

  const handleGhostClick = (e) => {
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }
    setOpen(o => !o);
  };

  // Clean up drag and resize events on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMoveGhost);
      document.removeEventListener("mouseup", handleMouseUpGhost);
      document.removeEventListener("touchmove", handleTouchMoveGhost);
      document.removeEventListener("touchend", handleTouchEndGhost);
      document.removeEventListener("mousemove", handleMouseMoveHeader);
      document.removeEventListener("mouseup", handleMouseUpHeader);
      document.removeEventListener("touchmove", handleTouchMoveHeader);
      document.removeEventListener("touchend", handleTouchEndHeader);
      document.removeEventListener("mousemove", handleMouseMoveResize);
      document.removeEventListener("mouseup", handleMouseUpResize);
      document.removeEventListener("touchmove", handleTouchMoveResize);
      document.removeEventListener("touchend", handleTouchEndResize);
    };
  }, [
    handleMouseMoveGhost, handleMouseUpGhost, handleTouchMoveGhost, handleTouchEndGhost,
    handleMouseMoveHeader, handleMouseUpHeader, handleTouchMoveHeader, handleTouchEndHeader,
    handleMouseMoveResize, handleMouseUpResize, handleTouchMoveResize, handleTouchEndResize
  ]);

  // Inject animations once
  useEffect(() => {
    if (document.getElementById("gyanbot-css")) return;
    const tag = document.createElement("style");
    tag.id = "gyanbot-css";
    tag.textContent = GHOST_CSS;
    document.head.appendChild(tag);
  }, []);

  // Persist
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem(RAG_KEY, String(allowRag)); }, [allowRag]);

  // Auto-scroll
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const container = messagesContainerRef.current;
      const lastMsgEl = lastMessageRef.current;
      const lastMsg = messages[messages.length - 1];

      if (!container) return;

      if (loading) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      } else if (lastMsg && lastMsg.role === "assistant" && lastMsgEl) {
        const containerHeight = container.clientHeight;
        const msgHeight = lastMsgEl.offsetHeight;

        if (msgHeight > containerHeight - 40) {
          container.scrollTo({ top: lastMsgEl.offsetTop - 10, behavior: "smooth" });
        } else {
          container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        }
      } else {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [messages, open, loading]);

  // Focus input
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg   = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res  = await fetch(`${API_BASE}/api/gyanbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          history: newHistory.slice(-20).map(m => ({ role: m.role, content: m.content })),
          allowRag,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Something went wrong on my end." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Network issue. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, allowRag, token]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!token) return null;

  // ── Theme colours ──
  const panelBg     = isDark ? "#0e0e1c" : "#ffffff";
  const panelBorder = isDark ? "rgba(99,76,255,0.18)" : "rgba(139,92,246,0.18)";
  const headerBg    = isDark
    ? "linear-gradient(135deg,#14142a 0%,#0e0e1c 100%)"
    : "linear-gradient(135deg,#f5f3ff 0%,#ffffff 100%)";
  const inputBg     = isDark ? "#16162a" : "#f8f7ff";
  const inputBorder = isDark ? "rgba(99,76,255,0.25)" : "rgba(139,92,246,0.2)";

  return (
    <>
      {/* ────────────────────────────────
           FLOATING GHOST BUTTON
          ──────────────────────────────── */}
      <div
        ref={launcherRef}
        style={{
          position: "fixed",
          right: position.right,
          bottom: position.bottom,
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        {/* Ghost wrapper with float animation */}
        <div className="ghost-float" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Tooltip label */}
          {!open && (
            <div
              style={{
                background: isDark ? "rgba(20,20,40,0.92)" : "rgba(255,255,255,0.95)",
                color: isDark ? "#c4b5fd" : "#7c3aed",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                marginBottom: 4,
                border: `1px solid ${isDark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.25)"}`,
                boxShadow: "0 2px 12px rgba(139,92,246,0.15)",
                whiteSpace: "nowrap",
                letterSpacing: "0.03em",
                opacity: 0.92,
                pointerEvents: "none",
              }}
            >
              GyanBot ✦
            </div>
          )}

          {/* The ghost button */}
          <button
            onMouseDown={handleMouseDownGhost}
            onTouchStart={handleTouchStartGhost}
            onClick={handleGhostClick}
            aria-label="Open GyanBot"
            style={{
              width: 72,
              height: 72,
              background: "transparent",
              border: "none",
              boxShadow: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
              transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              transform: open ? "scale(0.88) rotate(-5deg)" : "scale(1)",
              padding: 0,
              outline: "none",
            }}
          >
            <img
              src={ghostIcon}
              alt="GyanBot ghost"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: isDark ? "invert(1) brightness(0.85) hue-rotate(240deg)" : "none",
                transition: "filter 0.4s ease",
              }}
            />
          </button>
        </div>
      </div>

      {/* ────────────────────────────────
           CHAT PANEL
          ──────────────────────────────── */}
      <div
        ref={chatPanelRef}
        className={open ? "chat-slide-up" : ""}
        style={{
          position: "fixed",
          right: position.right,
          bottom: position.bottom + 90,
          zIndex: 9997,
          width: dimensions.width,
          maxWidth: "calc(100vw - 20px)",
          height: dimensions.height,
          maxHeight: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 24,
          overflow: "hidden",
          background: panelBg,
          border: `1px solid ${panelBorder}`,
          boxShadow: isDark
            ? "0 30px 90px rgba(0,0,0,0.85), 0 0 0 1px rgba(99,76,255,0.12), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "0 30px 90px rgba(109,40,217,0.12), 0 2px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(139,92,246,0.1)",
          // Visibility: if not open, hide completely (no pointer-events)
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: open ? "none" : "opacity 0.25s ease",
        }}
      >
        {/* Resize handles */}
        {open && (
          <>
            <div
              onMouseDown={(e) => startResize(e, "left")}
              onTouchStart={(e) => startResizeTouch(e, "left")}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 6,
                cursor: "ew-resize",
                zIndex: 10000,
                background: "transparent",
              }}
            />
            <div
              onMouseDown={(e) => startResize(e, "top")}
              onTouchStart={(e) => startResizeTouch(e, "top")}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 6,
                cursor: "ns-resize",
                zIndex: 10000,
                background: "transparent",
              }}
            />
            <div
              onMouseDown={(e) => startResize(e, "top-left")}
              onTouchStart={(e) => startResizeTouch(e, "top-left")}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 12,
                height: 12,
                cursor: "nwse-resize",
                zIndex: 10001,
                background: "transparent",
              }}
            />
          </>
        )}
        {/* ── Header ── */}
        <div
          onMouseDown={handleMouseDownHeader}
          onTouchStart={handleTouchStartHeader}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            background: headerBg,
            borderBottom: `1px solid ${isDark ? "rgba(99,76,255,0.12)" : "rgba(139,92,246,0.1)"}`,
            flexShrink: 0,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Mini ghost avatar */}
            <div style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: isDark
                ? "linear-gradient(145deg,#2a1f5e,#1a1040)"
                : "linear-gradient(145deg,#ede9fe,#ddd6fe)",
              border: isDark ? "1.5px solid rgba(139,92,246,0.45)" : "1.5px solid rgba(139,92,246,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 7, flexShrink: 0,
              boxShadow: "0 0 12px rgba(139,92,246,0.25)",
            }}>
              <img
                src={ghostIcon}
                alt=""
                style={{
                  width: "100%", height: "100%", objectFit: "contain",
                  filter: isDark ? "invert(1) brightness(0.85) hue-rotate(240deg)" : "none",
                }}
              />
            </div>
            <div>
              <div style={{
                fontWeight: 800,
                fontSize: 14,
                color: isDark ? "#e2e8f0" : "#1e1b4b",
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "-0.01em",
              }}>GyanBot</div>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: isDark ? "#a78bfa" : "#7c3aed",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }}/>
                {allowRag ? "Personalized Mode" : "General Mode"}
              </div>
            </div>
          </div>

          {/* Header actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Privacy */}
            <HeaderBtn
              isDark={isDark}
              title="Privacy settings"
              onClick={() => setShowPrivacy(s => !s)}
              active={showPrivacy}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </HeaderBtn>
            {/* Clear */}
            <HeaderBtn isDark={isDark} title="Clear chat" onClick={clearChat} danger>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
              </svg>
            </HeaderBtn>
            {/* Close */}
            <HeaderBtn isDark={isDark} title="Close" onClick={() => setOpen(false)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </HeaderBtn>
          </div>
        </div>

        {/* ── Privacy Panel ── */}
        {showPrivacy && (
          <div style={{
            padding: "10px 18px",
            background: isDark ? "rgba(109,40,217,0.08)" : "#faf5ff",
            borderBottom: `1px solid ${isDark ? "rgba(109,40,217,0.15)" : "#ede9fe"}`,
            fontSize: 12,
            color: isDark ? "#c4b5fd" : "#6d28d9",
            flexShrink: 0,
          }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={allowRag}
                onChange={e => setAllowRag(e.target.checked)}
                style={{ marginTop: 2, accentColor: "#7c3aed", width: 14, height: 14, flexShrink: 0 }}
              />
              <span>
                <span style={{ fontWeight: 700, display: "block", marginBottom: 2 }}>
                  Allow GyanBot to read my study data
                </span>
                When ON, GyanBot uses your quiz scores, scan history &amp; weak areas for personalized advice. Turn OFF for fully private, generic responses.
              </span>
            </label>
          </div>
        )}

        {/* ── Messages ── */}
        <div
          ref={messagesContainerRef}
          className="gyanbot-scrollbar"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 16px 8px",
            position: "relative",
          }}
        >
          {messages.length === 0 && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 16,
              textAlign: "center",
            }}>
              {/* Large ghost avatar for empty state */}
              <div className="ghost-float" style={{
                width: 80, height: 80,
                borderRadius: "50%",
                background: isDark
                  ? "linear-gradient(145deg,#2a1f5e,#1a1040)"
                  : "linear-gradient(145deg,#ede9fe,#ddd6fe)",
                border: isDark ? "2px solid rgba(139,92,246,0.4)" : "2px solid rgba(139,92,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 14,
                boxShadow: "0 8px 32px rgba(139,92,246,0.25)",
              }}>
                <img
                  src={ghostIcon}
                  alt=""
                  style={{
                    width: "100%", height: "100%", objectFit: "contain",
                    filter: isDark ? "invert(1) brightness(0.85) hue-rotate(240deg)" : "none",
                  }}
                />
              </div>

              <div>
                <p style={{
                  fontWeight: 800, fontSize: 15, marginBottom: 6,
                  color: isDark ? "#e2e8f0" : "#1e1b4b",
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  Hey, I'm GyanBot 👻
                </p>
                <p style={{
                  fontSize: 12.5, lineHeight: 1.6,
                  color: isDark ? "#8b8baa" : "#6b7280",
                  maxWidth: 220,
                }}>
                  Your direct, no-nonsense tutor on Gyantraa. Ask anything — quiz help, concepts, scan explanations, or study tips.
                </p>
              </div>

              {/* Suggested prompts */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {["How's my progress?", "My weak topics?", "Explain quantum physics", "Study tips today?"].map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                    style={{
                      fontSize: 11.5, padding: "6px 13px",
                      borderRadius: 20,
                      border: isDark ? "1px solid rgba(139,92,246,0.35)" : "1px solid rgba(139,92,246,0.25)",
                      background: isDark ? "rgba(109,40,217,0.1)" : "rgba(237,233,254,0.7)",
                      color: isDark ? "#a78bfa" : "#6d28d9",
                      cursor: "pointer", fontWeight: 600,
                      transition: "all 0.18s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? "rgba(109,40,217,0.22)" : "#ddd6fe"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isDark ? "rgba(109,40,217,0.1)" : "rgba(237,233,254,0.7)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            return (
              <div key={i} ref={isLast ? lastMessageRef : null}>
                <MessageBubble msg={msg} isDark={isDark}/>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12, alignItems: "flex-end", gap: 8 }}>
              <img
                src={ghostIcon}
                alt=""
                style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  padding: 4,
                  background: isDark ? "rgba(255,255,255,0.08)" : "#f3f0ff",
                  border: isDark ? "1px solid rgba(139,92,246,0.2)" : "1px solid #ddd6fe",
                  filter: isDark ? "invert(1) brightness(0.85) hue-rotate(240deg)" : "none",
                  flexShrink: 0,
                }}
              />
              <div style={{
                padding: "10px 16px",
                borderRadius: "18px 18px 18px 4px",
                background: isDark ? "#1c1c30" : "#ffffff",
                border: isDark ? "1px solid #2e2e50" : "1px solid #e5e7eb",
              }}>
                <TypingDots isDark={isDark}/>
              </div>
            </div>
          )}
        </div>

        {/* ── Input area ── */}
        <div style={{
          padding: "12px 14px 14px",
          borderTop: `1px solid ${isDark ? "rgba(99,76,255,0.12)" : "rgba(139,92,246,0.1)"}`,
          background: isDark ? "rgba(14,14,28,0.6)" : "rgba(250,248,255,0.8)",
          flexShrink: 0,
          backdropFilter: "blur(8px)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            background: inputBg,
            border: `1.5px solid ${inputBorder}`,
            borderRadius: 18,
            padding: "10px 12px 10px 16px",
            transition: "border-color 0.2s",
          }}
          onFocus={() => {}}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask GyanBot anything..."
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 13.5,
                lineHeight: 1.5,
                maxHeight: 100,
                overflowY: "auto",
                color: isDark ? "#e2e8f0" : "#1e1b4b",
                fontFamily: "inherit",
                scrollbarWidth: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: input.trim() && !loading
                  ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                  : isDark ? "rgba(99,102,241,0.12)" : "#e5e7eb",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s ease",
                boxShadow: input.trim() && !loading ? "0 4px 12px rgba(124,58,237,0.4)" : "none",
                transform: input.trim() && !loading ? "scale(1)" : "scale(0.92)",
              }}
              onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          <p style={{
            fontSize: 10.5, textAlign: "center",
            color: isDark ? "#4a4a6a" : "#9ca3af",
            marginTop: 8, letterSpacing: "0.01em",
          }}>
            Enter to send · Shift+Enter for newline · {allowRag ? "✦ Personalized mode" : "○ Privacy mode"}
          </p>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
//  Small reusable header icon button
// ─────────────────────────────────────────────
function HeaderBtn({ children, onClick, title, isDark, active, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30,
        borderRadius: 8,
        background: hov
          ? danger
            ? isDark ? "rgba(239,68,68,0.15)" : "#fef2f2"
            : isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6"
          : active
            ? isDark ? "rgba(139,92,246,0.15)" : "#ede9fe"
            : "transparent",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov
          ? danger
            ? isDark ? "#f87171" : "#dc2626"
            : isDark ? "#e2e8f0" : "#374151"
          : active
            ? isDark ? "#a78bfa" : "#7c3aed"
            : isDark ? "#6b6b8a" : "#9ca3af",
        transition: "all 0.18s ease",
      }}
    >
      {children}
    </button>
  );
}
