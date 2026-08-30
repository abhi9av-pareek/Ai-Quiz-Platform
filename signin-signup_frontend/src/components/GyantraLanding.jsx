import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Target, BarChart3, Bookmark, Trophy, Lightbulb, Clock, Check, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import Footer from "./common/Footer";
import SuggestionBox from "./common/SuggestionBox";

/* ─── Animated counter ─── */
function Counter({ to, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const pct = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - pct, 3);
          setCount(Math.floor(ease * to));
          if (pct < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Scroll reveal hook ─── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Particle canvas background ─── */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.6,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,192,${p.a * 0.5})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,229,192,${(1 - dist / 110) * 0.07})`;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ─── 3D Flip Card Component ─── */
function FlipCard({ front, back, delay = 0 }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{
        perspective: "1000px", cursor: "pointer",
        animationDelay: `${delay}s`,
      }}
      className="flip-card-wrap"
    >
      <div className={`flip-card-inner${flipped ? " flipped" : ""}`}>
        <div className="flip-card-front">{front}</div>
        <div className="flip-card-back">{back}</div>
      </div>
    </div>
  );
}

/* ─── 3D Tilt Card (on mouse move) ─── */
function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    ref.current.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale(1.03)`;
  };
  const handleLeave = () => {
    ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
  };
  return (
    <div ref={ref} className={`tilt-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

/* ─── Swipe Card Stack (3D carousel) ─── */
function CardStack({ cards }) {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(null);
  const next = () => { setDir("left"); setTimeout(() => { setCurrent(c => (c + 1) % cards.length); setDir(null); }, 350); };
  const prev = () => { setDir("right"); setTimeout(() => { setCurrent(c => (c - 1 + cards.length) % cards.length); setDir(null); }, 350); };

  return (
    <div className="card-stack-wrap">
      <div className="card-stack-scene">
        {cards.map((card, i) => {
          const offset = (i - current + cards.length) % cards.length;
          const isActive = offset === 0;
          const isBehind1 = offset === 1;
          const isBehind2 = offset === 2;
          const style = {
            zIndex: isActive ? 10 : isBehind1 ? 9 : 8,
            transform: isActive
              ? `translateX(${dir === "left" ? "-110%" : dir === "right" ? "110%" : "0"}) scale(1)`
              : isBehind1 ? "translateX(16px) translateY(14px) scale(0.93)"
              : isBehind2 ? "translateX(32px) translateY(28px) scale(0.86)"
              : "translateX(48px) translateY(42px) scale(0.79)",
            opacity: isActive ? 1 : isBehind1 ? 0.7 : isBehind2 ? 0.4 : 0,
            transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
            position: "absolute", inset: 0,
          };
          return (
            <div key={i} className="stack-card" style={style}>
              {card}
            </div>
          );
        })}
      </div>
      <div className="card-stack-controls">
        <button className="stack-btn" onClick={prev}>←</button>
        <div className="stack-dots">
          {cards.map((_, i) => (
            <div key={i} className={`stack-dot${i === current ? " active" : ""}`} onClick={() => setCurrent(i)} />
          ))}
        </div>
        <button className="stack-btn" onClick={next}>→</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════════════ */
export default function GyantraLanding() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [heroRef, heroVisible] = useReveal(0.1);
  const [featRef, featVisible] = useReveal(0.1);
  const [howRef, howVisible] = useReveal(0.1);
  const [flipRef, flipVisible] = useReveal(0.1);
  const [statsRef, statsVisible] = useReveal(0.1);
  const [ctaRef, ctaVisible] = useReveal(0.1);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };

  const FEATURES = [
    { icon: <Zap size={22} />, title: "AI Question Generation", desc: "Powered by NVIDIA AI — generates exam-grade MCQs on any subject, topic, or difficulty level." },
    { icon: <Target size={22} />, title: "Adaptive Difficulty", desc: "Easy → Medium → Hard progression based on your actual performance. Weak topics get more focus." },
    { icon: <BarChart3 size={22} />, title: "Deep Analytics", desc: "Subject-wise accuracy, score trends, activity heatmaps, difficulty breakdown — all visualised beautifully." },
    { icon: <Bookmark size={22} />, title: "Smart Bookmarks", desc: "Bookmark any question during a quiz. Add your own notes. Review before exams." },
    { icon: <Trophy size={22} />, title: "XP & Leaderboard", desc: "Earn XP for every quiz. Streak bonuses for daily activity. Compete on a global leaderboard." },
    { icon: <Lightbulb size={22} />, title: "Weak Topic Radar", desc: "Topics below 60% accuracy are flagged with specific revision tips and suggested question counts." },
  ];

  const HOW_STEPS = [
    { num: "01", title: "Create Account", desc: "Sign up in 30 seconds. Your profile, streak, and XP start immediately." },
    { num: "02", title: "Choose Subject", desc: "Pick from JEE, NEET, UPSC, GATE, or any custom topic you need." },
    { num: "03", title: "AI Generates Quiz", desc: "Gyantra's AI creates unique, exam-grade questions tailored to your difficulty." },
    { num: "04", title: "Attempt & Submit", desc: "Live timer, instant feedback, question map, bookmark support." },
    { num: "05", title: "Review & Learn", desc: "Per-topic breakdown, explanations for every question, weak topic suggestions." },
    { num: "06", title: "Track Growth", desc: "Score trends, heatmaps, XP progression, global rank — all on your analytics page." },
  ];

  /* Cards for the 3D stack */
  const QUIZ_CARDS = [
    <div className="quiz-preview-card" key="a">
      <div className="qpc-subject">Physics · Hard</div>
      <div className="qpc-q">A particle moves in a circle of radius R with uniform speed v. The magnitude of centripetal acceleration is:</div>
      <div className="qpc-opts">
        {["A) v²/R", "B) vR", "C) v/R²", "D) R/v²"].map((o, i) => (
          <div key={i} className={`qpc-opt${i === 0 ? " correct" : ""}`}>{o}</div>
        ))}
      </div>
      <div className="qpc-tag" style={{ display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={12} /> AI Generated</div>
    </div>,
    <div className="quiz-preview-card" key="b" style={{ background: "linear-gradient(135deg, #0A1628 0%, #0E2040 100%)" }}>
      <div className="qpc-subject">Mathematics · Medium</div>
      <div className="qpc-q">The derivative of sin²(x) with respect to x is:</div>
      <div className="qpc-opts">
        {["A) 2sin(x)", "B) sin(2x)", "C) 2cos(x)", "D) cos(2x)"].map((o, i) => (
          <div key={i} className={`qpc-opt${i === 1 ? " correct" : ""}`}>{o}</div>
        ))}
      </div>
      <div className="qpc-tag" style={{ display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={12} /> AI Generated</div>
    </div>,
    <div className="quiz-preview-card" key="c" style={{ background: "linear-gradient(135deg, #0A1628 0%, #150E2A 100%)" }}>
      <div className="qpc-subject">Computer Science · Easy</div>
      <div className="qpc-q">What is the time complexity of binary search on a sorted array of n elements?</div>
      <div className="qpc-opts">
        {["A) O(n)", "B) O(log n)", "C) O(n²)", "D) O(1)"].map((o, i) => (
          <div key={i} className={`qpc-opt${i === 1 ? " correct" : ""}`}>{o}</div>
        ))}
      </div>
      <div className="qpc-tag" style={{ display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={12} /> AI Generated</div>
    </div>,
    <div className="quiz-preview-card" key="d" style={{ background: "linear-gradient(135deg, #0A1628 0%, #0E1F28 100%)" }}>
      <div className="qpc-subject">Chemistry · Hard</div>
      <div className="qpc-q">Which hybridization is present in the central atom of SF₆?</div>
      <div className="qpc-opts">
        {["A) sp³", "B) sp³d", "C) sp³d²", "D) sp²"].map((o, i) => (
          <div key={i} className={`qpc-opt${i === 2 ? " correct" : ""}`}>{o}</div>
        ))}
      </div>
      <div className="qpc-tag" style={{ display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={12} /> AI Generated</div>
    </div>,
  ];

  /* Flip cards for features section */
  const FLIP_DATA = [
    {
      front: { icon: <Zap size={28} />, title: "AI Questions", stat: "∞ unique MCQs" },
      back: { title: "How it works", text: "NVIDIA DeepSeek AI generates contextual, exam-grade questions from your chosen subject, difficulty & topic — no repetition, no limits." },
    },
    {
      front: { icon: <BarChart3 size={28} />, title: "Deep Analytics", stat: "15+ metrics tracked" },
      back: { title: "What you get", text: "Score trends, accuracy by subject, activity heatmaps, streak calendars, weak-topic radar, and global rank — all from your quiz history." },
    },
    {
      front: { icon: <Trophy size={28} />, title: "XP & Rank", stat: "Real-time leaderboard" },
      back: { title: "Earn & Compete", text: "Score 90%+ → 100 XP. Streak bonuses → +20 XP/day. Level up from Newcomer → Legend. Your rank updates after every quiz." },
    },
    {
      front: { icon: <Target size={28} />, title: "Adaptive Path", stat: "Personalized for you" },
      back: { title: "Smart Learning", text: "Topics below 60% accuracy are automatically flagged and get more questions in the next session. Gyantra learns your weak spots." },
    },
    {
      front: { icon: <Bookmark size={28} />, title: "Bookmarks", stat: "Review anytime" },
      back: { title: "Study Smarter", text: "Bookmark any question mid-quiz, add your own notes, and build a personal revision library. Review saved questions before exams." },
    },
    {
      front: { icon: <Clock size={28} />, title: "Live Timer", stat: "Per-question timing" },
      back: { title: "Exam Simulation", text: "Customizable time per question, a live question-map sidebar, progress tracking, and instant post-submit answer review with explanations." },
    },
  ];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Exo+2:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:    #030711; --bg2:   #060D1A; --surface: #0A1628;
      --surf2: #0E1F38; --border: rgba(0,229,192,0.12); --border2: rgba(0,229,192,0.28);
      --cyan:  #00E5C0; --cyan2:  #00B896; --cyan3:  rgba(0,229,192,0.08);
      --purple: #7C5CFC; --text:  #E8F4F0; --text2: #8BA8A0; --text3: #4A7A72;
    }
    html { scroll-behavior: smooth; overflow-x: hidden; }
    body { font-family: 'Exo 2', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
    * { -webkit-tap-highlight-color: transparent; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--cyan2); border-radius: 4px; }

    /* ── NAV ── */
    .g-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between;
      transition: all 0.4s cubic-bezier(.4,0,.2,1);
    }
    .g-nav.scrolled {
      background: rgba(3,7,17,0.92); backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border); padding: 0.65rem 2rem;
    }
    .g-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .g-logo-img { width: 36px; height: 36px; border-radius: 9px; overflow: hidden; flex-shrink: 0; }
    .g-logo-img img { width: 100%; height: 100%; object-fit: cover; }
    .g-logo-text {
      font-family: 'Orbitron', monospace; font-weight: 700; font-size: 20px;
      color: var(--text); letter-spacing: 2px;
    }
    .g-logo-text span { color: var(--cyan); }
    .g-nav-links { display: flex; align-items: center; gap: 2rem; list-style: none; }
    .g-nav-links a {
      font-size: 12px; font-weight: 600; color: var(--text2); letter-spacing: 1.5px;
      text-transform: uppercase; cursor: pointer; text-decoration: none; transition: color 0.2s; position: relative;
    }
    .g-nav-links a::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 1px; background: var(--cyan); transform: scaleX(0); transition: transform 0.2s; }
    .g-nav-links a:hover { color: var(--cyan); }
    .g-nav-links a:hover::after { transform: scaleX(1); }
    .g-nav-cta { display: flex; gap: 10px; }
    .g-btn-outline {
      padding: 9px 22px; border-radius: 7px; font-size: 12px; font-weight: 600;
      font-family: 'Exo 2', sans-serif; cursor: pointer; border: 1px solid var(--border2);
      color: var(--cyan); background: transparent; letter-spacing: 1px; text-transform: uppercase; transition: all 0.2s;
    }
    .g-btn-outline:hover { background: var(--cyan3); transform: translateY(-1px); }
    .g-btn-primary {
      padding: 9px 22px; border-radius: 7px; font-size: 12px; font-weight: 700;
      font-family: 'Exo 2', sans-serif; cursor: pointer; border: none;
      background: var(--cyan); color: #030711; letter-spacing: 1px; text-transform: uppercase;
      transition: all 0.2s; box-shadow: 0 0 16px rgba(0,229,192,0.25);
    }
    .g-btn-primary:hover { box-shadow: 0 0 32px rgba(0,229,192,0.5); transform: translateY(-2px); }
    .g-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; }
    .g-hamburger span { width: 22px; height: 2px; background: var(--cyan); transition: all 0.3s; }

    /* ── HERO ── */
    .g-hero {
      min-height: 100vh; display: flex; align-items: center;
      position: relative; overflow: hidden; padding: 0 2rem; justify-content: center;
    }
    .g-hero-bg {
      position: absolute; inset: 0; z-index: 0;
      background: radial-gradient(ellipse 80% 60% at 60% 50%, rgba(0,229,192,0.07) 0%, transparent 70%),
                  radial-gradient(ellipse 40% 40% at 80% 20%, rgba(0,100,80,0.1) 0%, transparent 60%),
                  radial-gradient(ellipse 50% 50% at 20% 80%, rgba(124,92,252,0.06) 0%, transparent 60%),
                  linear-gradient(180deg, #030711 0%, #060D1A 100%);
    }
    .g-hero-grid {
      position: absolute; inset: 0; z-index: 0;
      background-image: linear-gradient(rgba(0,229,192,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,229,192,0.04) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
    }
    .g-hero-inner {
      position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr;
      gap: 4rem; align-items: center; max-width: 1200px; width: 100%; padding-top: 80px;
    }
    .g-hero-content {}
    .g-hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--cyan3); border: 1px solid var(--border2);
      border-radius: 20px; padding: 6px 16px; font-size: 11px; font-weight: 600;
      letter-spacing: 2px; text-transform: uppercase; color: var(--cyan); margin-bottom: 1.5rem;
      animation: fadeUp 0.8s ease both;
    }
    .g-hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); animation: pulse 2s infinite; }
    .g-hero-title {
      font-family: 'Orbitron', monospace; font-size: clamp(2.2rem, 5vw, 4rem);
      font-weight: 900; line-height: 1.08; letter-spacing: -1px; margin-bottom: 1.25rem;
      animation: fadeUp 0.8s 0.1s ease both;
    }
    .g-hero-title .t1 { display: block; color: var(--text); }
    .g-hero-title .t2 {
      display: block; color: transparent;
      background: linear-gradient(90deg, #00E5C0 0%, #00FFA3 50%, #7C5CFC 100%);
      -webkit-background-clip: text; background-clip: text;
    }
    .g-hero-sub {
      font-size: 1rem; color: var(--text2); font-weight: 300; line-height: 1.75;
      margin-bottom: 2rem; max-width: 480px; animation: fadeUp 0.8s 0.2s ease both;
    }
    .g-hero-buttons { display: flex; gap: 12px; flex-wrap: wrap; animation: fadeUp 0.8s 0.3s ease both; }
    .g-btn-lg {
      padding: 14px 32px; border-radius: 9px; font-size: 14px; font-weight: 700;
      font-family: 'Exo 2', sans-serif; cursor: pointer; letter-spacing: 1px;
      text-transform: uppercase; transition: all 0.25s; text-decoration: none;
      display: inline-flex; align-items: center; gap: 8px; border: none;
    }
    .g-btn-lg-primary {
      background: var(--cyan); color: #030711;
      box-shadow: 0 0 30px rgba(0,229,192,0.3);
    }
    .g-btn-lg-primary:hover { box-shadow: 0 0 50px rgba(0,229,192,0.5); transform: translateY(-2px); }
    .g-btn-lg-outline {
      background: transparent; color: var(--cyan); border: 1px solid var(--border2);
    }
    .g-btn-lg-outline:hover { background: var(--cyan3); transform: translateY(-2px); }
    .g-hero-stats {
      display: flex; gap: 2rem; margin-top: 2.5rem; padding-top: 2rem;
      border-top: 1px solid var(--border); animation: fadeUp 0.8s 0.5s ease both;
    }
    .g-hero-stat-val {
      font-family: 'Orbitron', monospace; font-size: 1.8rem; font-weight: 700; color: var(--cyan); line-height: 1;
    }
    .g-hero-stat-key { font-size: 10px; color: var(--text3); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }

    /* ── 3D CARD STACK (hero right) ── */
    .card-stack-wrap { position: relative; }
    .card-stack-scene { position: relative; height: 360px; perspective: 1200px; }
    .stack-card {
      border-radius: 20px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.5);
      will-change: transform, opacity;
    }
    .quiz-preview-card {
      background: linear-gradient(135deg, #0A1628 0%, #0E1E35 100%);
      border: 1px solid var(--border2); border-radius: 20px; padding: 1.75rem;
      height: 360px; display: flex; flex-direction: column; gap: 1rem;
    }
    .qpc-subject {
      font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      color: var(--cyan); background: var(--cyan3); border: 1px solid var(--border2);
      display: inline-block; padding: 4px 10px; border-radius: 20px; width: fit-content;
    }
    .qpc-q { font-size: 15px; color: var(--text); line-height: 1.6; flex: 1; font-weight: 400; }
    .qpc-opts { display: flex; flex-direction: column; gap: 8px; }
    .qpc-opt {
      padding: 9px 14px; border-radius: 8px; font-size: 13px; border: 1px solid var(--border);
      color: var(--text2); transition: all 0.2s; cursor: pointer;
      background: rgba(255,255,255,0.03);
    }
    .qpc-opt.correct { border-color: var(--cyan); color: var(--cyan); background: var(--cyan3); font-weight: 600; }
    .qpc-tag { font-size: 11px; color: var(--text3); margin-top: auto; }
    .card-stack-controls {
      display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem;
    }
    .stack-btn {
      width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border2);
      background: var(--surface); color: var(--cyan); font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .stack-btn:hover { background: var(--cyan); color: #030711; box-shadow: 0 0 16px rgba(0,229,192,0.4); }
    .stack-dots { display: flex; gap: 6px; }
    .stack-dot {
      width: 6px; height: 6px; border-radius: 50%; background: var(--border2);
      cursor: pointer; transition: all 0.2s;
    }
    .stack-dot.active { background: var(--cyan); width: 18px; border-radius: 3px; }

    /* ── SECTION HELPERS ── */
    .g-section { padding: 100px 2rem; position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }
    .g-section-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: var(--cyan); margin-bottom: 12px; }
    .g-section-title { font-family: 'Orbitron', monospace; font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 700; color: var(--text); line-height: 1.2; margin-bottom: 1rem; }
    .g-section-sub { font-size: 1rem; color: var(--text2); line-height: 1.7; max-width: 520px; font-weight: 300; }

    /* ── REVEAL ── */
    .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-d1 { transition-delay: 0.1s; } .reveal-d2 { transition-delay: 0.2s; }
    .reveal-d3 { transition-delay: 0.3s; } .reveal-d4 { transition-delay: 0.4s; }

    /* ── 3D FLIP CARDS ── */
    .flip-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-top: 3rem; }
    .flip-card-wrap { height: 200px; }
    .flip-card-inner {
      width: 100%; height: 100%; position: relative;
      transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(.4,0,.2,1);
    }
    .flip-card-inner.flipped { transform: rotateY(180deg); }
    .flip-card-front, .flip-card-back {
      position: absolute; inset: 0; backface-visibility: hidden; border-radius: 18px;
      padding: 1.75rem; border: 1px solid var(--border);
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .flip-card-front {
      background: linear-gradient(135deg, var(--surface) 0%, var(--surf2) 100%);
    }
    .flip-card-back {
      background: linear-gradient(135deg, #0B1E35 0%, #0A142A 100%);
      border-color: var(--border2); transform: rotateY(180deg);
    }
    .fc-front-icon { font-size: 2rem; color: var(--cyan); }
    .fc-front-title { font-family: 'Orbitron', monospace; font-size: 0.85rem; font-weight: 700; color: var(--cyan); letter-spacing: 1px; }
    .fc-front-stat { font-size: 11px; color: var(--text3); letter-spacing: 1px; }
    .fc-front-hint { font-size: 10px; color: var(--text3); letter-spacing: 1px; text-align: right; opacity: 0.6; }
    .fc-back-title { font-family: 'Orbitron', monospace; font-size: 0.85rem; font-weight: 700; color: var(--cyan); margin-bottom: 0.75rem; }
    .fc-back-text { font-size: 0.85rem; color: var(--text2); line-height: 1.65; font-weight: 300; }

    .tilt-card { transition: transform 0.15s ease; transform-style: preserve-3d; }
    /* Disable tilt on touch devices (prevents scroll conflicts) */
    @media (hover: none) {
      .tilt-card:hover { transform: none !important; }
      .flip-card-wrap { -webkit-tap-highlight-color: transparent; }
    }

    /* ── HOW IT WORKS (timeline) ── */
    .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3rem; }
    .how-card {
      background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
      padding: 2rem; position: relative; overflow: hidden; transition: all 0.3s;
    }
    .how-card:hover { border-color: var(--border2); transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(0,229,192,0.06); }
    .how-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, var(--cyan), transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .how-card:hover::before { opacity: 1; }
    .how-num {
      font-family: 'Orbitron', monospace; font-size: 3rem; font-weight: 900; line-height: 1;
      margin-bottom: 1rem; color: transparent;
      -webkit-text-stroke: 1px rgba(0,229,192,0.25);
    }
    .how-title { font-family: 'Orbitron', monospace; font-size: 0.85rem; font-weight: 700; color: var(--text); margin-bottom: 0.75rem; letter-spacing: 1px; }
    .how-desc { font-size: 0.88rem; color: var(--text2); line-height: 1.7; font-weight: 300; }

    /* ── STATS ── */
    .g-stats-section {
      padding: 100px 2rem; position: relative; z-index: 1;
      background: linear-gradient(180deg, transparent 0%, rgba(0,229,192,0.03) 50%, transparent 100%);
    }
    .g-stats-section::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,229,192,0.05) 0%, transparent 70%);
    }
    .g-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; max-width: 900px; margin: 2.5rem auto 0; }
    .g-stat-card {
      text-align: center; padding: 2rem 1rem;
      background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
      transition: all 0.3s;
    }
    .g-stat-card:hover { border-color: var(--border2); transform: translateY(-4px); box-shadow: 0 0 30px rgba(0,229,192,0.06); }
    .g-stat-val { font-family: 'Orbitron', monospace; font-size: 2.5rem; font-weight: 900; color: var(--cyan); line-height: 1; }
    .g-stat-label { font-size: 11px; color: var(--text3); letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }

    /* ── CTA ── */
    .g-cta-section { padding: 120px 2rem; text-align: center; position: relative; z-index: 1; }
    .g-cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 500px; border-radius: 50%; background: rgba(0,229,192,0.05); filter: blur(80px); pointer-events: none; }
    .g-cta-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; background: var(--cyan3); border: 1px solid var(--border2); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--cyan); font-weight: 700; margin-bottom: 1.5rem; }
    .g-cta-title { font-family: 'Orbitron', monospace; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 900; color: var(--text); margin-bottom: 1rem; position: relative; }
    .g-cta-title span { color: var(--cyan); }
    .g-cta-sub { font-size: 1rem; color: var(--text2); margin-bottom: 2.5rem; font-weight: 300; position: relative; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.7; }
    .g-cta-buttons { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; }

    /* ── FOOTER ── */
    .g-footer {
      padding: 2.5rem 2rem; text-align: center;
      border-top: 1px solid var(--border); font-size: 12px; color: var(--text3); position: relative; z-index: 1;
    }
    .g-footer-logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 0.5rem; }
    .g-footer-logo-img { width: 20px; height: 20px; border-radius: 5px; overflow: hidden; }
    .g-footer-logo-img img { width: 100%; height: 100%; object-fit: cover; }
    .g-footer-logo-text { font-family: 'Orbitron', monospace; font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: 2px; }
    .g-footer-logo-text span { color: var(--cyan); }

    /* ── MOBILE MENU ── */
    .g-mobile-menu {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(3,7,17,0.97); backdrop-filter: blur(20px); z-index: 999;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem;
      opacity: 0; pointer-events: none; transition: opacity 0.3s;
    }
    .g-mobile-menu.open { opacity: 1; pointer-events: all; }
    .g-mobile-menu a {
      font-family: 'Orbitron', monospace; font-size: 1.3rem; font-weight: 600;
      color: var(--text); letter-spacing: 3px; text-transform: uppercase; cursor: pointer; transition: color 0.2s;
    }
    .g-mobile-menu a:hover { color: var(--cyan); }

    /* ── KEYFRAMES ── */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    @keyframes float3d {
      0%, 100% { transform: perspective(800px) rotateX(4deg) rotateY(-4deg) translateY(0px); }
      50% { transform: perspective(800px) rotateX(-4deg) rotateY(4deg) translateY(-12px); }
    }
    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 20px rgba(0,229,192,0.2); }
      50% { box-shadow: 0 0 50px rgba(0,229,192,0.45); }
    }
    /* Float animation class */
    .g-card-stack-float { animation: float3d 6s ease-in-out infinite; }

    /* ── THEME TOGGLE ── */
    .g-theme-btn {
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(255,255,255,0.06); border: 1px solid var(--border2);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all .2s; color: var(--text2);
    }
    .g-theme-btn:hover { border-color: var(--cyan); color: var(--cyan); }

    /* ════════════════════════════════════
       LIGHT MODE
    ════════════════════════════════════ */
    [data-theme="light"] {
      --bg: #F5F7FA; --bg2: #EFF1F5; --surface: #FFFFFF;
      --surf2: #F0F2F8; --border: rgba(0,0,0,0.08); --border2: rgba(0,0,0,0.15);
      --cyan: #00B896; --cyan2: #009E82; --cyan3: rgba(0,184,150,0.08);
      --purple: #7C5CFC; --text: #1A1A2E; --text2: #555566; --text3: #888899;
    }
    [data-theme="light"] body { background: var(--bg); color: var(--text); }
    [data-theme="light"] .g-nav.scrolled { background: rgba(245,247,250,0.95); }
    [data-theme="light"] .g-hero-bg {
      background: radial-gradient(ellipse 80% 60% at 60% 50%, rgba(0,184,150,0.06) 0%, transparent 70%),
                  radial-gradient(ellipse 40% 40% at 80% 20%, rgba(0,100,80,0.04) 0%, transparent 60%),
                  radial-gradient(ellipse 50% 50% at 20% 80%, rgba(124,92,252,0.04) 0%, transparent 60%),
                  linear-gradient(180deg, #F5F7FA 0%, #EFF1F5 100%);
    }
    [data-theme="light"] .g-hero-grid {
      background-image: linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
    }
    [data-theme="light"] .quiz-preview-card {
      background: linear-gradient(135deg, #FFFFFF 0%, #F0F2F8 100%);
    }
    [data-theme="light"] .qpc-opt { background: rgba(0,0,0,0.03); }
    [data-theme="light"] .flip-card-front {
      background: linear-gradient(135deg, #FFFFFF 0%, #F0F2F8 100%);
    }
    [data-theme="light"] .flip-card-back {
      background: linear-gradient(135deg, #F0F2F8 0%, #E8EAF2 100%);
    }
    [data-theme="light"] .how-card { background: #FFFFFF; }
    [data-theme="light"] .how-card:hover { box-shadow: 0 20px 50px rgba(0,0,0,0.08), 0 0 30px rgba(0,184,150,0.06); }
    [data-theme="light"] .how-num { -webkit-text-stroke: 1px rgba(0,184,150,0.2); }
    [data-theme="light"] .g-stat-card { background: #FFFFFF; }
    [data-theme="light"] .g-stat-card:hover { box-shadow: 0 0 30px rgba(0,184,150,0.06); }
    [data-theme="light"] .g-stats-section {
      background: linear-gradient(180deg, transparent 0%, rgba(0,184,150,0.03) 50%, transparent 100%);
    }
    [data-theme="light"] .g-stats-section::before {
      background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0,184,150,0.04) 0%, transparent 70%);
    }
    [data-theme="light"] .g-cta-glow { background: rgba(0,184,150,0.04); }
    [data-theme="light"] .g-mobile-menu { background: rgba(245,247,250,0.97); }
    [data-theme="light"] .g-mobile-menu a { color: var(--text); }
    [data-theme="light"] .g-footer { background: var(--bg); }
    [data-theme="light"] .stack-btn { background: #FFFFFF; }
    [data-theme="light"] .g-btn-lg-primary { color: #FFFFFF; }
    [data-theme="light"] .g-btn-primary { color: #FFFFFF; }
    [data-theme="light"] .g-theme-btn { background: rgba(0,0,0,0.05); }
    [data-theme="light"] ::-webkit-scrollbar-track { background: var(--bg); }
    [data-theme="light"] ::-webkit-scrollbar-thumb { background: var(--cyan); }

    /* ════════════════════════════════════
       RESPONSIVE — TABLET (≤ 900px)
    ════════════════════════════════════ */
    @media (max-width: 900px) {
      /* Nav */
      .g-nav { padding: 0.85rem 1.25rem; }
      .g-nav.scrolled { padding: 0.6rem 1.25rem; }
      .g-nav-links, .g-nav-cta { display: none; }
      .g-hamburger { display: flex; }
      .g-logo-text { font-size: 17px; }

      /* Hero: stack columns */
      .g-hero { padding: 0 1.25rem; }
      .g-hero-inner {
        grid-template-columns: 1fr; text-align: center;
        padding-top: 90px; gap: 2.5rem;
      }
      .g-hero-sub { margin-left: auto; margin-right: auto; }
      .g-hero-buttons { justify-content: center; }
      .g-hero-stats { justify-content: center; gap: 1.75rem; }

      /* Card stack: smaller on tablet */
      .card-stack-scene { height: 300px; }
      .quiz-preview-card { height: 300px; padding: 1.25rem; }

      /* Flip cards: 2 columns */
      .flip-cards-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
      .flip-card-wrap { height: 190px; }

      /* How grid: 2 columns */
      .how-grid { grid-template-columns: 1fr 1fr; gap: 1.25rem; }

      /* Stats */
      .g-stats-grid { grid-template-columns: 1fr 1fr; gap: 1.25rem; }
      .g-stat-val { font-size: 2rem; }

      /* Sections */
      .g-section { padding: 70px 1.5rem; }
      .g-cta-section { padding: 80px 1.5rem; }
      .g-stats-section { padding: 70px 1.5rem; }
    }

    /* ════════════════════════════════════
       RESPONSIVE — MOBILE (≤ 600px)
    ════════════════════════════════════ */
    @media (max-width: 600px) {
      /* Nav */
      .g-nav { padding: 0.75rem 1rem; }
      .g-logo-text { font-size: 15px; letter-spacing: 1px; }
      .g-logo-img { width: 28px; height: 28px; }

      /* Disable heavy animations on mobile */
      .g-card-stack-float { animation: none; }

      /* Hero */
      .g-hero { padding: 0 1rem; min-height: auto; padding-bottom: 3rem; }
      .g-hero-inner { padding-top: 80px; gap: 2rem; }
      .g-hero-badge { font-size: 9px; padding: 5px 12px; letter-spacing: 1px; }
      .g-hero-title { font-size: clamp(1.8rem, 9vw, 2.5rem); letter-spacing: -0.5px; }
      .g-hero-sub { font-size: 0.9rem; }
      .g-hero-buttons { flex-direction: column; align-items: center; gap: 10px; }
      .g-btn-lg { width: 100%; max-width: 320px; justify-content: center; padding: 14px 20px; font-size: 13px; }
      .g-hero-stats { flex-direction: column; gap: 1.25rem; padding-top: 1.5rem; margin-top: 1.5rem; }
      .g-hero-stat-val { font-size: 1.6rem; }

      /* Card stack: compact */
      .card-stack-scene { height: 260px; }
      .quiz-preview-card { height: 260px; padding: 1rem; gap: 0.75rem; }
      .qpc-q { font-size: 13px; }
      .qpc-opt { font-size: 12px; padding: 7px 10px; }
      .qpc-subject { font-size: 10px; }
      .stack-btn { width: 32px; height: 32px; font-size: 13px; }

      /* Flip cards: 1 column */
      .flip-cards-grid { grid-template-columns: 1fr; gap: 0.9rem; }
      .flip-card-wrap { height: 175px; }
      .flip-card-front, .flip-card-back { padding: 1.25rem; }
      .fc-front-icon { font-size: 1.6rem; }
      .fc-front-title { font-size: 0.8rem; }

      /* How it works: 1 column */
      .how-grid { grid-template-columns: 1fr; gap: 1rem; }
      .how-card { padding: 1.5rem; }
      .how-num { font-size: 2.2rem; }
      .how-title { font-size: 0.8rem; }

      /* Stats: 2 columns */
      .g-stats-grid { grid-template-columns: 1fr 1fr; gap: 0.85rem; }
      .g-stat-card { padding: 1.25rem 0.75rem; }
      .g-stat-val { font-size: 1.6rem; }
      .g-stat-label { font-size: 9px; }

      /* Section headings */
      .g-section-title { font-size: clamp(1.3rem, 6vw, 1.8rem); }
      .g-section-sub { font-size: 0.9rem; }

      /* CTA */
      .g-cta-section { padding: 60px 1rem; }
      .g-cta-title { font-size: clamp(1.4rem, 7vw, 2rem); }
      .g-cta-sub { font-size: 0.9rem; }
      .g-cta-buttons { flex-direction: column; align-items: center; gap: 10px; }
      .g-cta-buttons .g-btn-lg { width: 100%; max-width: 320px; justify-content: center; }

      /* General */
      .g-section { padding: 55px 1rem; }
      .g-stats-section { padding: 55px 1rem; }
      .g-footer { padding: 1.5rem 1rem; font-size: 11px; }

      /* Mobile menu links bigger tap targets */
      .g-mobile-menu a { font-size: 1.1rem; padding: 0.5rem 0; }
    }

    /* ════════════════════════════════════
       RESPONSIVE — SMALL PHONE (≤ 380px)
    ════════════════════════════════════ */
    @media (max-width: 380px) {
      .g-hero-title { font-size: 1.7rem; }
      .g-logo-text { display: none; }
      .g-hero-badge { font-size: 8px; letter-spacing: 0.5px; padding: 4px 10px; }
      .card-stack-scene { height: 230px; }
      .quiz-preview-card { height: 230px; }
      .g-stats-grid { grid-template-columns: 1fr 1fr; }
      .flip-cards-grid { grid-template-columns: 1fr; }
      .g-cta-title { font-size: 1.35rem; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <Particles />

      {/* ── MOBILE MENU ── */}
      <div className={`g-mobile-menu${mobileMenu ? " open" : ""}`}>
        <a onClick={() => scrollTo("features")}>Features</a>
        <a onClick={() => scrollTo("how")}>How It Works</a>
        <a onClick={() => scrollTo("stats")}>Stats</a>
        <a onClick={() => { navigate("/blog"); setMobileMenu(false); }}>Blog</a>
        <a onClick={() => { navigate("/login"); setMobileMenu(false); }}>Log In</a>
        <a onClick={() => { navigate("/signup"); setMobileMenu(false); }} style={{ color: "var(--cyan)" }}>Sign Up Free</a>
        <a onClick={() => setMobileMenu(false)} style={{ fontSize: "0.9rem", color: "var(--text3)" }}>✕ Close</a>
      </div>

      {/* ── NAV ── */}
      <nav className={`g-nav${scrolled ? " scrolled" : ""}`}>
        <div className="g-logo" onClick={() => {
          if (localStorage.getItem("token")) {
            navigate("/dashboard");
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}>
          <div className="g-logo-img"><img src="/favicon-32.png" alt="Gyantra" /></div>
          <span className="g-logo-text">GY<span>AN</span>TRA</span>
        </div>

        <ul className="g-nav-links">
          <li><a onClick={() => scrollTo("features")}>Features</a></li>
          <li><a onClick={() => scrollTo("how")}>How It Works</a></li>
          <li><a onClick={() => scrollTo("stats")}>Stats</a></li>
          <li><a onClick={() => navigate("/blog")}>Blog</a></li>
        </ul>

        <div className="g-nav-cta">
          <button className="g-theme-btn" onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="g-btn-outline" onClick={() => navigate("/login")}>Log In</button>
          <button className="g-btn-primary" onClick={() => navigate("/signup")}>Sign Up Free</button>
        </div>

        <div className="g-hamburger" onClick={() => setMobileMenu(m => !m)}>
          <span /><span /><span />
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="g-hero">
        <div className="g-hero-bg" />
        <div className="g-hero-grid" />

        <div className="g-hero-inner" ref={heroRef}>
          {/* LEFT: Text */}
          <div className="g-hero-content">
            <div className="g-hero-badge">
              <span className="g-hero-badge-dot" />
              AI-Powered Exam Preparation
            </div>

            <h1 className="g-hero-title">
              <span className="t1">Master Every</span>
              <span className="t2">Exam with AI</span>
            </h1>

            <p className="g-hero-sub">
              India's most intelligent quiz platform — NVIDIA AI-generated questions,
              deep performance analytics, adaptive learning paths, and streak-based motivation.
              Built for serious exam aspirants.
            </p>

            <div className="g-hero-buttons">
              <button className="g-btn-lg g-btn-lg-primary" onClick={() => navigate("/signup")}>
                Start Preparing Free →
              </button>
              <button className="g-btn-lg g-btn-lg-outline" onClick={() => scrollTo("how")}>
                See How It Works
              </button>
            </div>

            <div className="g-hero-stats">
              <div className="g-hero-stat">
                <div className="g-hero-stat-val"><Counter to={10000} suffix="+" /></div>
                <div className="g-hero-stat-key">Questions Generated</div>
              </div>
              <div className="g-hero-stat">
                <div className="g-hero-stat-val"><Counter to={20} suffix="+" /></div>
                <div className="g-hero-stat-key">Subjects</div>
              </div>
              <div className="g-hero-stat">
                <div className="g-hero-stat-val">₹<Counter to={0} /></div>
                <div className="g-hero-stat-key">Free to Use</div>
              </div>
            </div>
          </div>

          {/* RIGHT: 3D Card Stack */}
          <div className="g-card-stack-float">
            <CardStack cards={QUIZ_CARDS} />
          </div>
        </div>
      </section>

      {/* ══ FEATURES — 3D FLIP CARDS ══ */}
      <section id="features">
        <div className="g-section" ref={featRef}>
          <div className={`reveal${featVisible ? " visible" : ""}`}>
            <div className="g-section-eyebrow">What You Get</div>
            <h2 className="g-section-title">Every Tool You Need to Ace Exams</h2>
            <p className="g-section-sub">Tap any card to flip it and see how each feature works.</p>
          </div>

          <div className="flip-cards-grid">
            {FLIP_DATA.map((card, i) => (
              <div key={i} className={`reveal reveal-d${(i % 4) + 1}${featVisible ? " visible" : ""}`}>
                <FlipCard
                  delay={i * 0.05}
                  front={
                    <>
                      <div className="fc-front-icon">{card.front.icon}</div>
                      <div>
                        <div className="fc-front-title">{card.front.title}</div>
                        <div className="fc-front-stat">{card.front.stat}</div>
                      </div>
                      <div className="fc-front-hint">Tap to flip →</div>
                    </>
                  }
                  back={
                    <>
                      <div className="fc-back-title">{card.back.title}</div>
                      <div className="fc-back-text">{card.back.text}</div>
                    </>
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS — 3D Tilt Cards ══ */}
      <section id="how">
        <div className="g-section" ref={howRef}>
          <div className={`reveal${howVisible ? " visible" : ""}`}>
            <div className="g-section-eyebrow">The Process</div>
            <h2 className="g-section-title">How Gyantra Works</h2>
            <p className="g-section-sub">From sign-up to mastery in 6 steps.</p>
          </div>

          <div className="how-grid">
            {HOW_STEPS.map((step, i) => (
              <div key={i} className={`reveal reveal-d${(i % 4) + 1}${howVisible ? " visible" : ""}`}>
                <TiltCard>
                  <div className="how-card">
                    <div className="how-num">{step.num}</div>
                    <div className="how-title">{step.title}</div>
                    <div className="how-desc">{step.desc}</div>
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section id="stats">
        <div className="g-stats-section" ref={statsRef}>
          <div className={`reveal${statsVisible ? " visible" : ""}`} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div className="g-section-eyebrow" style={{ justifyContent: "center", display: "flex" }}>By the Numbers</div>
            <h2 className="g-section-title" style={{ textAlign: "center" }}>Trusted by Serious Aspirants</h2>
          </div>
          <div className="g-stats-grid" style={{ position: "relative", zIndex: 1 }}>
            {[
              { val: 10000, suffix: "+", label: "Questions Generated" },
              { val: 20, suffix: "+", label: "Subjects Covered" },
              { val: 100, suffix: "%", label: "Local AI — No Limits" },
              { val: 0, prefix: "₹", label: "Free to Use" },
            ].map((s, i) => (
              <TiltCard key={i}>
                <div className={`g-stat-card reveal reveal-d${i + 1}${statsVisible ? " visible" : ""}`}>
                  <div className="g-stat-val">
                    {s.prefix || ""}
                    <Counter to={s.val} suffix={s.suffix || ""} />
                  </div>
                  <div className="g-stat-label">{s.label}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section>
        <div className="g-cta-section" ref={ctaRef}>
          <div className="g-cta-glow" />
          <div className={`reveal${ctaVisible ? " visible" : ""}`} style={{ position: "relative" }}>
            <div className="g-cta-badge">Start Today — It's Free</div>
            <h2 className="g-cta-title">
              Ready to <span>Ace</span> Your Exam?
            </h2>
            <p className="g-cta-sub">
              Join thousands of students already using Gyantra to study smarter, track progress, and beat the competition.
            </p>
            <div className="g-cta-buttons">
              <button className="g-btn-lg g-btn-lg-primary" onClick={() => navigate("/signup")}>
                Create Free Account →
              </button>
              <button className="g-btn-lg g-btn-lg-outline" onClick={() => navigate("/login")}>
                I Already Have an Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEEDBACK (LANDING PAGE) ══ */}
      <section style={{ padding: "0 1.5rem 3rem", maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <SuggestionBox context="Landing Page" title="Have Feedback or Suggestions?" subtitle="We would love to hear what feature or subject you want next!" />
      </section>

      {/* ── FOOTER ── */}
      <Footer />
    </>
  );
}
