import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "../utils/axiosConfig";
import { Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

/* ── Tiny particle canvas for the left panel ── */
function PanelParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H, raf;
    const particles = [];

    const resize = () => {
      W = canvas.width = canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,192,${p.a * 0.4})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,229,192,${(1 - dist / 100) * 0.06})`;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

function GoogleLoginButton({ setIsLoading, setError }) {
  const navigate = useNavigate();
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        if (setError) setError("");
        const res = await axios.post("/api/auth/google", { token: tokenResponse.access_token });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/dashboard");
      } catch (error) {
        const msg = error.response?.data?.message || "Google login failed";
        if (setError) setError(msg);
        else alert(msg);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (err) => {
      console.warn("Google login error callback:", err);
      const msg = "Google sign-in popup was closed or unverified.";
      if (setError) setError(msg);
      else alert(msg);
    }
  });

  const onGoogleClick = (e) => {
    if (e) e.preventDefault();
    try {
      handleGoogleLogin();
    } catch (err) {
      console.error("Google Login trigger error:", err);
      const msg = "Google Login is currently unavailable. Please log in with Email & Password.";
      if (setError) setError(msg);
      else alert(msg);
    }
  };

  return (
    <button type="button" className="gl-btn-google" id="login-google" onClick={onGoogleClick}>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Log in with Google
    </button>
  );
}

function LoginModern() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (loginError) setLoginError("");
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!formData.email || !formData.password) {
      setLoginError("Please enter both email and password.");
      return;
    }
    try {
      setIsLoading(true);
      setLoginError("");
      const res = await axios.post("/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (error) {
      setLoginError(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Exo+2:wght@300;400;500;600;700&display=swap');

        /* ── RESET FOR THIS PAGE ── */
        .gl-root *,
        .gl-root *::before,
        .gl-root *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* ── ROOT LAYOUT ── */
        .gl-root {
          font-family: 'Exo 2', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #030711;
          overflow: hidden;
        }

        /* ══════════════════════════════════
           LEFT PANEL — Illustration Side
        ══════════════════════════════════ */
        .gl-left {
          flex: 1.15;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(ellipse 80% 60% at 30% 50%, rgba(0,229,192,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 80% 20%, rgba(124,92,252,0.06) 0%, transparent 60%),
            linear-gradient(180deg, #030711 0%, #060D1A 100%);
          padding: 3rem 2rem;
        }

        .gl-left-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 400px;
        }

        /* Logo on left panel */
        .gl-left-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 3rem;
          animation: glFadeUp 0.8s ease both;
        }
        .gl-left-logo-img {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          overflow: hidden;
        }
        .gl-left-logo-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .gl-left-logo-text {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 20px;
          color: #E8F4F0;
          letter-spacing: 2px;
        }
        .gl-left-logo-text span {
          color: #00E5C0;
        }

        /* Floating geometric shapes */
        .gl-shapes {
          position: relative;
          width: 320px;
          height: 320px;
          margin: 0 auto 2.5rem;
          animation: glFadeUp 0.8s 0.15s ease both;
        }

        .gl-shape {
          position: absolute;
          border-radius: 50%;
          animation: glFloat 6s ease-in-out infinite;
        }

        /* Large cyan circle */
        .gl-shape-1 {
          width: 140px;
          height: 140px;
          background: linear-gradient(135deg, #00E5C0 0%, #00B896 100%);
          top: 30%;
          left: 10%;
          opacity: 0.9;
          animation-delay: 0s;
          border-radius: 32px;
          box-shadow: 0 20px 60px rgba(0,229,192,0.25);
        }

        /* Purple rounded rectangle */
        .gl-shape-2 {
          width: 100px;
          height: 130px;
          background: linear-gradient(135deg, #7C5CFC 0%, #5A3FD9 100%);
          top: 15%;
          right: 15%;
          border-radius: 24px;
          animation-delay: -2s;
          box-shadow: 0 16px 50px rgba(124,92,252,0.2);
        }

        /* Warm accent pill */
        .gl-shape-3 {
          width: 70px;
          height: 90px;
          background: linear-gradient(135deg, #FFB347 0%, #FF6B35 100%);
          bottom: 15%;
          right: 25%;
          border-radius: 35px;
          animation-delay: -4s;
          box-shadow: 0 12px 40px rgba(255,107,53,0.2);
        }

        /* Small dark circle (like a face) */
        .gl-shape-4 {
          width: 60px;
          height: 60px;
          background: #1A2540;
          border: 2px solid rgba(0,229,192,0.3);
          bottom: 25%;
          left: 20%;
          border-radius: 50%;
          animation-delay: -1s;
        }
        .gl-shape-4::before,
        .gl-shape-4::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: #00E5C0;
          border-radius: 50%;
          top: 40%;
        }
        .gl-shape-4::before { left: 30%; }
        .gl-shape-4::after { right: 30%; }

        /* Tiny floating dots */
        .gl-dot {
          position: absolute;
          border-radius: 50%;
          animation: glFloat 5s ease-in-out infinite;
        }
        .gl-dot-1 { width: 12px; height: 12px; background: #00E5C0; top: 8%; left: 35%; animation-delay: -3s; opacity: 0.5; }
        .gl-dot-2 { width: 8px; height: 8px; background: #7C5CFC; bottom: 8%; left: 45%; animation-delay: -1.5s; opacity: 0.4; }
        .gl-dot-3 { width: 10px; height: 10px; background: #FFB347; top: 55%; right: 8%; animation-delay: -4.5s; opacity: 0.6; }
        .gl-dot-4 { width: 6px; height: 6px; background: #00E5C0; top: 75%; left: 8%; animation-delay: -2.5s; opacity: 0.3; }

        /* Phone mockup shape */
        .gl-phone {
          position: absolute;
          width: 55px;
          height: 95px;
          background: #1A2540;
          border: 2px solid rgba(0,229,192,0.2);
          border-radius: 12px;
          top: 8%;
          left: 55%;
          animation: glFloat 7s ease-in-out infinite;
          animation-delay: -3s;
        }
        .gl-phone::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
          border-radius: 6px;
          background: linear-gradient(180deg, rgba(0,229,192,0.15) 0%, rgba(124,92,252,0.1) 100%);
        }

        .gl-left-tagline {
          font-family: 'Orbitron', monospace;
          font-size: 1.15rem;
          font-weight: 700;
          color: #E8F4F0;
          letter-spacing: 1px;
          margin-bottom: 0.6rem;
          animation: glFadeUp 0.8s 0.3s ease both;
        }
        .gl-left-tagline span {
          color: #00E5C0;
        }
        .gl-left-sub {
          font-size: 0.88rem;
          color: #8BA8A0;
          line-height: 1.7;
          font-weight: 300;
          animation: glFadeUp 0.8s 0.4s ease both;
        }

        /* ══════════════════════════════════
           RIGHT PANEL — Form Side
        ══════════════════════════════════ */
        .gl-right {
          flex: 0.85;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          position: relative;
          background:
            linear-gradient(180deg, #0A1628 0%, #0E1F38 50%, #0A1628 100%);
          border-left: 1px solid rgba(0,229,192,0.1);
        }

        .gl-form-wrap {
          width: 100%;
          max-width: 380px;
          animation: glCardReveal 0.7s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes glCardReveal {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        /* Star / Logo icon */
        .gl-form-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0,229,192,0.15) 0%, rgba(124,92,252,0.1) 100%);
          border: 1px solid rgba(0,229,192,0.2);
          border-radius: 14px;
          animation: glFadeUp 0.6s 0.1s ease both;
        }
        .gl-form-icon img {
          width: 28px;
          height: 28px;
          border-radius: 6px;
        }

        /* Heading */
        .gl-heading {
          font-family: 'Orbitron', monospace;
          font-size: 1.85rem;
          font-weight: 900;
          color: #E8F4F0;
          text-align: center;
          margin-bottom: 0.4rem;
          letter-spacing: -0.5px;
          animation: glFadeUp 0.6s 0.15s ease both;
        }
        .gl-heading span {
          color: #00E5C0;
        }

        .gl-subheading {
          text-align: center;
          font-size: 0.85rem;
          color: #8BA8A0;
          margin-bottom: 2.25rem;
          font-weight: 300;
          animation: glFadeUp 0.6s 0.2s ease both;
        }

        /* ── Underline-style inputs ── */
        .gl-field {
          position: relative;
          margin-bottom: 1.5rem;
          animation: glFadeUp 0.6s 0.28s ease both;
        }
        .gl-field + .gl-field {
          animation-delay: 0.34s;
        }

        .gl-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #8BA8A0;
          letter-spacing: 0.5px;
          margin-bottom: 0.45rem;
        }

        .gl-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(0,229,192,0.2);
          padding: 0.65rem 2.5rem 0.65rem 0;
          color: #E8F4F0;
          font-family: 'Exo 2', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .gl-input::placeholder {
          color: #4A7A72;
          font-weight: 300;
        }
        .gl-input:focus {
          border-color: #00E5C0;
          box-shadow: 0 2px 12px rgba(0,229,192,0.15);
        }
        .gl-input:hover:not(:focus) {
          border-color: rgba(0,229,192,0.4);
        }

        .gl-eye-btn {
          position: absolute;
          right: 0;
          bottom: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #8BA8A0;
          display: flex;
          padding: 0;
          transition: color 0.2s;
        }
        .gl-eye-btn:hover {
          color: #00E5C0;
        }

        /* ── Options row ── */
        .gl-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.75rem;
          font-size: 0.78rem;
          animation: glFadeUp 0.6s 0.4s ease both;
        }
        .gl-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #8BA8A0;
        }
        .gl-remember input[type="checkbox"] {
          accent-color: #00E5C0;
          width: 14px;
          height: 14px;
          border-radius: 3px;
          cursor: pointer;
        }
        .gl-forgot {
          color: #00E5C0;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s, opacity 0.2s;
        }
        .gl-forgot:hover {
          opacity: 0.75;
        }

        /* ── CTA button ── */
        .gl-btn-login {
          width: 100%;
          padding: 0.9rem 1rem;
          border: none;
          border-radius: 10px;
          background: #00E5C0;
          color: #030711;
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.3s, background 0.3s;
          box-shadow: 0 4px 24px rgba(0,229,192,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          animation: glFadeUp 0.6s 0.46s ease both;
        }
        .gl-btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px rgba(0,229,192,0.5);
          background: #00D4B3;
        }
        .gl-btn-login:active:not(:disabled) {
          transform: scale(0.975);
        }
        .gl-btn-login:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .gl-error-banner {
          margin-bottom: 1.25rem;
          padding: 0.7rem 1rem;
          background: rgba(255,59,48,0.1);
          border: 1px solid rgba(255,59,48,0.25);
          border-radius: 10px;
          color: #FF6B6B;
          font-size: 0.82rem;
          text-align: center;
          animation: glSlideDown 0.4s ease both;
        }

        @keyframes glSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .gl-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(3,7,17,0.3);
          border-top-color: #030711;
          border-radius: 50%;
          animation: glSpin 0.7s linear infinite;
        }
        @keyframes glSpin { to { transform: rotate(360deg); } }

        /* ── Google button ── */
        .gl-btn-google {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1px solid rgba(0,229,192,0.2);
          border-radius: 10px;
          background: transparent;
          color: #E8F4F0;
          font-family: 'Exo 2', sans-serif;
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 0.75rem;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          animation: glFadeUp 0.6s 0.52s ease both;
        }
        .gl-btn-google:hover {
          border-color: rgba(0,229,192,0.45);
          background: rgba(0,229,192,0.05);
          transform: translateY(-1px);
        }
        .gl-btn-google svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        /* ── Sign-up nudge ── */
        .gl-signup-nudge {
          text-align: center;
          font-size: 0.82rem;
          color: #8BA8A0;
          margin-top: 2rem;
          animation: glFadeUp 0.6s 0.58s ease both;
        }
        .gl-signup-nudge a {
          color: #00E5C0;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s;
        }
        .gl-signup-nudge a:hover {
          opacity: 0.75;
        }

        /* ── Footer ── */
        .gl-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          padding: 1rem;
          font-size: 11px;
          color: rgba(139,168,160,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .gl-footer img {
          width: 13px;
          height: 13px;
          border-radius: 3px;
          opacity: 0.5;
        }

        /* ── Animations ── */
        @keyframes glFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }

        /* ══════════════════════════════════
           LIGHT MODE
        ══════════════════════════════════ */
        [data-theme="light"] .gl-root { background: #F5F7FA; }
        [data-theme="light"] .gl-left {
          background:
            radial-gradient(ellipse 80% 60% at 30% 50%, rgba(0,184,150,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 80% 20%, rgba(124,92,252,0.04) 0%, transparent 60%),
            linear-gradient(180deg, #EFF1F5 0%, #E8EAF2 100%);
        }
        [data-theme="light"] .gl-left-logo-text { color: #1A1A2E; }
        [data-theme="light"] .gl-left-tagline { color: #1A1A2E; }
        [data-theme="light"] .gl-left-sub { color: #555566; }
        [data-theme="light"] .gl-shape-4 { background: #E0E2EA; border-color: rgba(0,184,150,0.3); }
        [data-theme="light"] .gl-phone { background: #E0E2EA; border-color: rgba(0,184,150,0.2); }
        [data-theme="light"] .gl-phone::before { background: linear-gradient(180deg, rgba(0,184,150,0.1) 0%, rgba(124,92,252,0.06) 100%); }
        [data-theme="light"] .gl-right {
          background: linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 50%, #FFFFFF 100%);
          border-left-color: rgba(0,0,0,0.06);
        }
        [data-theme="light"] .gl-heading { color: #1A1A2E; }
        [data-theme="light"] .gl-subheading { color: #555566; }
        [data-theme="light"] .gl-label { color: #555566; }
        [data-theme="light"] .gl-input { color: #1A1A2E; border-bottom-color: rgba(0,0,0,0.12); }
        [data-theme="light"] .gl-input::placeholder { color: #999; }
        [data-theme="light"] .gl-input:focus { border-color: #00B896; box-shadow: 0 2px 12px rgba(0,184,150,0.1); }
        [data-theme="light"] .gl-eye-btn { color: #888; }
        [data-theme="light"] .gl-remember { color: #555566; }
        [data-theme="light"] .gl-btn-google { color: #1A1A2E; border-color: rgba(0,0,0,0.12); }
        [data-theme="light"] .gl-btn-google:hover { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.2); }
        [data-theme="light"] .gl-signup-nudge { color: #555566; }
        [data-theme="light"] .gl-footer { color: rgba(0,0,0,0.3); }
        [data-theme="light"] .gl-form-icon { background: linear-gradient(135deg, rgba(0,184,150,0.1) 0%, rgba(124,92,252,0.06) 100%); border-color: rgba(0,184,150,0.15); }

        /* ══════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════ */
        @media (max-width: 900px) {
          .gl-root {
            flex-direction: column;
          }
          .gl-left {
            flex: none;
            padding: 2rem 1.5rem 1.5rem;
            min-height: auto;
          }
          .gl-shapes {
            width: 220px;
            height: 220px;
            margin-bottom: 1.5rem;
          }
          .gl-shape-1 { width: 95px; height: 95px; border-radius: 22px; }
          .gl-shape-2 { width: 70px; height: 90px; border-radius: 18px; }
          .gl-shape-3 { width: 50px; height: 65px; border-radius: 25px; }
          .gl-shape-4 { width: 45px; height: 45px; }
          .gl-phone { width: 40px; height: 70px; border-radius: 9px; }
          .gl-left-tagline { font-size: 1rem; }
          .gl-left-sub { font-size: 0.82rem; }

          .gl-right {
            flex: 1;
            border-left: none;
            border-top: 1px solid rgba(0,229,192,0.1);
            padding: 2rem 1.5rem 4rem;
          }
        }

        @media (max-width: 600px) {
          .gl-left {
            padding: 1.5rem 1rem 1rem;
          }
          .gl-shapes {
            width: 180px;
            height: 180px;
            margin-bottom: 1rem;
          }
          .gl-shape-1 { width: 80px; height: 80px; border-radius: 18px; }
          .gl-shape-2 { width: 55px; height: 75px; border-radius: 14px; }
          .gl-shape-3 { width: 40px; height: 55px; }
          .gl-shape-4 { width: 38px; height: 38px; }
          .gl-phone { width: 32px; height: 56px; }
          .gl-dot-1, .gl-dot-2, .gl-dot-3, .gl-dot-4 { display: none; }
          .gl-left-tagline { font-size: 0.9rem; }
          .gl-left-sub { font-size: 0.78rem; }
          .gl-left-logo-text { font-size: 17px; }

          .gl-right {
            padding: 1.5rem 1.25rem 4rem;
          }
          .gl-heading {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 380px) {
          .gl-shapes {
            width: 150px;
            height: 150px;
          }
          .gl-shape-1 { width: 65px; height: 65px; }
          .gl-shape-2 { width: 45px; height: 60px; }
          .gl-shape-3 { width: 35px; height: 45px; }
          .gl-shape-4 { width: 32px; height: 32px; }
          .gl-phone { display: none; }
          .gl-heading { font-size: 1.35rem; }
          .gl-left-logo-text { display: none; }
        }
      `}</style>

      <div className="gl-root">
        {/* ════ LEFT PANEL ════ */}
        <div className="gl-left">
          <PanelParticles />

          <div className="gl-left-content">
            {/* Logo */}
            <div className="gl-left-logo">
              <div className="gl-left-logo-img">
                <img src="/favicon-32.png" alt="Gyantra" />
              </div>
              <span className="gl-left-logo-text">
                GY<span>AN</span>TRA
              </span>
            </div>

            {/* Geometric illustration shapes */}
            <div className="gl-shapes">
              <div className="gl-shape gl-shape-1" />
              <div className="gl-shape gl-shape-2" />
              <div className="gl-shape gl-shape-3" />
              <div className="gl-shape gl-shape-4" />
              <div className="gl-phone" />
              <div className="gl-dot gl-dot-1" />
              <div className="gl-dot gl-dot-2" />
              <div className="gl-dot gl-dot-3" />
              <div className="gl-dot gl-dot-4" />
            </div>

            <h2 className="gl-left-tagline">
              Master Every <span>Exam with AI</span>
            </h2>
            <p className="gl-left-sub">
              AI-powered quiz platform with adaptive learning,
              deep analytics, and streak-based motivation.
            </p>
          </div>
        </div>

        {/* ════ RIGHT PANEL — Login Form ════ */}
        <div className="gl-right">
          <div className="gl-form-wrap">
            {/* Icon */}
            <div className="gl-form-icon">
              <img src="/favicon-32.png" alt="" />
            </div>

            {/* Heading */}
            <h1 className="gl-heading">
              Welcome <span>Back!</span>
            </h1>
            <p className="gl-subheading">Please enter your details</p>

            {/* Error Banner */}
            {loginError && (
              <div className="gl-error-banner" id="login-error-banner">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div className="gl-field">
                <label className="gl-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="gl-input"
                  autoComplete="email"
                  id="login-email"
                />
              </div>

              {/* Password */}
              <div className="gl-field">
                <label className="gl-label">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="gl-input"
                  autoComplete="current-password"
                  id="login-password"
                />
                <button
                  type="button"
                  className="gl-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Remember / Forgot */}
              <div className="gl-options">
                <label className="gl-remember">
                  <input type="checkbox" />
                  <span>Remember for 30 days</span>
                </label>
                <Link to="#" className="gl-forgot">
                  Forgot password?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="gl-btn-login"
                disabled={isLoading}
                id="login-submit"
              >
                {isLoading ? (
                  <>
                    <div className="gl-spinner" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            {/* Google login */}
            <GoogleLoginButton setIsLoading={setIsLoading} setError={setLoginError} />

            {/* Sign up nudge */}
            <p className="gl-signup-nudge">
              Don't have an account?{" "}
              <Link to="/signup">Sign Up</Link>
            </p>
          </div>

          {/* Footer */}
          <div className="gl-footer">
            <img src="/favicon-32.png" alt="" />
            © {new Date().getFullYear()} Gyantra. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginModern;
