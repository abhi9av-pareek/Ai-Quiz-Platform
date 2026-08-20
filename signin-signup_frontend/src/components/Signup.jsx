import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function GoogleSignupButton({ setErrors, setLoading }) {
  const navigate = useNavigate();
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setErrors((prev) => ({ ...prev, submit: "" }));
        const res = await axios.post("/api/auth/google", { token: tokenResponse.access_token });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/dashboard");
      } catch (error) {
        setErrors((prev) => ({ ...prev, submit: error.response?.data?.message || "Google signup failed" }));
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.warn("Google signup error callback:", err);
      setErrors((prev) => ({ ...prev, submit: "Google sign-up popup was closed or unverified." }));
    }
  });

  const onGoogleClick = (e) => {
    if (e) e.preventDefault();
    try {
      handleGoogleSignup();
    } catch (err) {
      console.error("Google Signup trigger error:", err);
      setErrors((prev) => ({ ...prev, submit: "Google Signup is currently unavailable. Please sign up using the form." }));
    }
  };

  return (
    <button type="button" className="gs-btn-google" id="signup-google" onClick={onGoogleClick} style={{
      width: '100%',
      padding: '0.85rem 1rem',
      border: '1px solid rgba(0,229,192,0.2)',
      borderRadius: '10px',
      background: 'transparent',
      color: '#E8F4F0',
      fontFamily: "'Exo 2', sans-serif",
      fontWeight: '500',
      fontSize: '0.85rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '0.75rem',
      transition: 'border-color 0.2s, background 0.2s, transform 0.2s'
    }}>
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px', flexShrink: 0 }}>
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
      Sign up with Google
    </button>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    educationLevel: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.contactNumber.trim())
      newErrors.contactNumber = "Contact number is required";
    if (!formData.educationLevel)
      newErrors.educationLevel = "Please select education level";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/auth/signup", formData);

      console.log("Signup success:", res.data);

      const token =
        res.data?.token ||
        res.data?.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.accessToken;

      const user =
        res.data?.user || res.data?.data?.user || res.data?.data || res.data;

      // Guard: if no token found, don't navigate — show error instead
      if (!token) {
        console.error("No token in signup response:", res.data);
        setErrors({
          submit: "Account created but login failed. Please log in manually.",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      console.log("Signup error:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Exo+2:wght@300;400;500;600;700&display=swap');

        /* ── RESET FOR THIS PAGE ── */
        .gs-root *,
        .gs-root *::before,
        .gs-root *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* ── ROOT LAYOUT ── */
        .gs-root {
          font-family: 'Exo 2', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #030711;
          overflow: hidden;
        }

        /* ══════════════════════════════════
           LEFT PANEL — Illustration Side
        ══════════════════════════════════ */
        .gs-left {
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

        .gs-left-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 400px;
        }

        /* Logo on left panel */
        .gs-left-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 3rem;
          animation: gsFadeUp 0.8s ease both;
        }
        .gs-left-logo-img {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          overflow: hidden;
        }
        .gs-left-logo-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .gs-left-logo-text {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 20px;
          color: #E8F4F0;
          letter-spacing: 2px;
        }
        .gs-left-logo-text span {
          color: #00E5C0;
        }

        /* Floating geometric shapes */
        .gs-shapes {
          position: relative;
          width: 320px;
          height: 320px;
          margin: 0 auto 2.5rem;
          animation: gsFadeUp 0.8s 0.15s ease both;
        }

        .gs-shape {
          position: absolute;
          border-radius: 50%;
          animation: gsFloat 6s ease-in-out infinite;
        }

        /* Large purple-blue rounded rectangle */
        .gs-shape-1 {
          width: 130px;
          height: 150px;
          background: linear-gradient(135deg, #7C5CFC 0%, #5A3FD9 100%);
          top: 20%;
          left: 8%;
          border-radius: 32px;
          animation-delay: 0s;
          box-shadow: 0 20px 60px rgba(124,92,252,0.25);
        }

        /* Cyan circle */
        .gs-shape-2 {
          width: 110px;
          height: 110px;
          background: linear-gradient(135deg, #00E5C0 0%, #00B896 100%);
          top: 10%;
          right: 12%;
          border-radius: 50%;
          animation-delay: -2s;
          box-shadow: 0 16px 50px rgba(0,229,192,0.2);
        }

        /* Warm accent tall pill */
        .gs-shape-3 {
          width: 65px;
          height: 100px;
          background: linear-gradient(135deg, #FFB347 0%, #FF6B35 100%);
          bottom: 10%;
          right: 20%;
          border-radius: 32px;
          animation-delay: -4s;
          box-shadow: 0 12px 40px rgba(255,107,53,0.2);
        }

        /* Small dark face */
        .gs-shape-4 {
          width: 55px;
          height: 55px;
          background: #1A2540;
          border: 2px solid rgba(0,229,192,0.3);
          bottom: 20%;
          left: 25%;
          border-radius: 50%;
          animation-delay: -1s;
        }
        .gs-shape-4::before,
        .gs-shape-4::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background: #00E5C0;
          border-radius: 50%;
          top: 40%;
        }
        .gs-shape-4::before { left: 28%; }
        .gs-shape-4::after { right: 28%; }

        /* Book shape */
        .gs-book {
          position: absolute;
          width: 50px;
          height: 38px;
          background: #1A2540;
          border: 2px solid rgba(124,92,252,0.3);
          border-radius: 4px 8px 8px 4px;
          bottom: 35%;
          right: 5%;
          animation: gsFloat 7s ease-in-out infinite;
          animation-delay: -3s;
        }
        .gs-book::before {
          content: '';
          position: absolute;
          left: -1px;
          top: 4px;
          bottom: 4px;
          width: 3px;
          background: #7C5CFC;
          border-radius: 2px;
        }
        .gs-book::after {
          content: '';
          position: absolute;
          top: 8px;
          left: 10px;
          right: 8px;
          height: 2px;
          background: rgba(124,92,252,0.3);
          box-shadow: 0 6px 0 rgba(124,92,252,0.2), 0 12px 0 rgba(124,92,252,0.15);
        }

        /* Tiny floating dots */
        .gs-dot {
          position: absolute;
          border-radius: 50%;
          animation: gsFloat 5s ease-in-out infinite;
        }
        .gs-dot-1 { width: 12px; height: 12px; background: #7C5CFC; top: 5%; left: 40%; animation-delay: -3s; opacity: 0.5; }
        .gs-dot-2 { width: 8px; height: 8px; background: #00E5C0; bottom: 5%; left: 50%; animation-delay: -1.5s; opacity: 0.4; }
        .gs-dot-3 { width: 10px; height: 10px; background: #FFB347; top: 60%; right: 5%; animation-delay: -4.5s; opacity: 0.6; }
        .gs-dot-4 { width: 6px; height: 6px; background: #7C5CFC; top: 80%; left: 5%; animation-delay: -2.5s; opacity: 0.3; }

        /* Graduation cap shape */
        .gs-cap {
          position: absolute;
          top: 5%;
          left: 15%;
          animation: gsFloat 6s ease-in-out infinite;
          animation-delay: -2s;
        }
        .gs-cap-top {
          width: 40px;
          height: 5px;
          background: #00E5C0;
          transform: perspective(80px) rotateX(45deg);
          border-radius: 2px;
        }
        .gs-cap-base {
          width: 28px;
          height: 16px;
          background: #00E5C0;
          margin: -2px auto 0;
          border-radius: 0 0 4px 4px;
          opacity: 0.7;
        }

        .gs-left-tagline {
          font-family: 'Orbitron', monospace;
          font-size: 1.15rem;
          font-weight: 700;
          color: #E8F4F0;
          letter-spacing: 1px;
          margin-bottom: 0.6rem;
          animation: gsFadeUp 0.8s 0.3s ease both;
        }
        .gs-left-tagline span {
          color: #00E5C0;
        }
        .gs-left-sub {
          font-size: 0.88rem;
          color: #8BA8A0;
          line-height: 1.7;
          font-weight: 300;
          animation: gsFadeUp 0.8s 0.4s ease both;
        }

        /* ══════════════════════════════════
           RIGHT PANEL — Form Side
        ══════════════════════════════════ */
        .gs-right {
          flex: 0.85;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2.5rem;
          position: relative;
          background:
            linear-gradient(180deg, #0A1628 0%, #0E1F38 50%, #0A1628 100%);
          border-left: 1px solid rgba(0,229,192,0.1);
          overflow-y: auto;
        }

        .gs-form-wrap {
          width: 100%;
          max-width: 380px;
          animation: gsCardReveal 0.7s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes gsCardReveal {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        /* Icon */
        .gs-form-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0,229,192,0.15) 0%, rgba(124,92,252,0.1) 100%);
          border: 1px solid rgba(0,229,192,0.2);
          border-radius: 14px;
          animation: gsFadeUp 0.6s 0.1s ease both;
        }
        .gs-form-icon img {
          width: 28px;
          height: 28px;
          border-radius: 6px;
        }

        /* Heading */
        .gs-heading {
          font-family: 'Orbitron', monospace;
          font-size: 1.7rem;
          font-weight: 900;
          color: #E8F4F0;
          text-align: center;
          margin-bottom: 0.35rem;
          letter-spacing: -0.5px;
          animation: gsFadeUp 0.6s 0.15s ease both;
        }
        .gs-heading span {
          color: #00E5C0;
        }

        .gs-subheading {
          text-align: center;
          font-size: 0.82rem;
          color: #8BA8A0;
          margin-bottom: 1.75rem;
          font-weight: 300;
          animation: gsFadeUp 0.6s 0.2s ease both;
        }

        /* ── Error banner ── */
        .gs-error-banner {
          margin-bottom: 1.25rem;
          padding: 0.7rem 1rem;
          background: rgba(255,59,48,0.1);
          border: 1px solid rgba(255,59,48,0.25);
          border-radius: 10px;
          color: #FF6B6B;
          font-size: 0.82rem;
          text-align: center;
          animation: gsSlideDown 0.4s ease both;
        }

        @keyframes gsSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Form ── */
        .gs-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Underline-style inputs ── */
        .gs-field {
          position: relative;
          margin-bottom: 1.2rem;
          animation: gsFadeUp 0.6s 0.25s ease both;
        }
        .gs-field:nth-child(2) { animation-delay: 0.3s; }
        .gs-field:nth-child(3) { animation-delay: 0.35s; }
        .gs-field:nth-child(4) { animation-delay: 0.4s; }
        .gs-field:nth-child(5) { animation-delay: 0.45s; }

        .gs-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          color: #8BA8A0;
          letter-spacing: 0.5px;
          margin-bottom: 0.35rem;
          text-transform: uppercase;
        }

        .gs-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(0,229,192,0.2);
          padding: 0.55rem 2.5rem 0.55rem 0;
          color: #E8F4F0;
          font-family: 'Exo 2', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .gs-input::placeholder {
          color: #4A7A72;
          font-weight: 300;
        }
        .gs-input:focus {
          border-color: #00E5C0;
          box-shadow: 0 2px 12px rgba(0,229,192,0.15);
        }
        .gs-input:hover:not(:focus) {
          border-color: rgba(0,229,192,0.4);
        }

        .gs-input-error {
          border-color: rgba(255,59,48,0.5) !important;
        }

        .gs-field-error {
          font-size: 0.72rem;
          color: #FF6B6B;
          margin-top: 0.3rem;
        }

        /* Select styling */
        .gs-select {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(0,229,192,0.2);
          padding: 0.55rem 2rem 0.55rem 0;
          color: #E8F4F0;
          font-family: 'Exo 2', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238BA8A0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 4px center;
        }
        .gs-select:focus {
          border-color: #00E5C0;
          box-shadow: 0 2px 12px rgba(0,229,192,0.15);
        }
        .gs-select:hover:not(:focus) {
          border-color: rgba(0,229,192,0.4);
        }
        .gs-select option {
          background: #0A1628;
          color: #E8F4F0;
          padding: 8px;
        }

        /* Eye toggle */
        .gs-eye-btn {
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
        .gs-eye-btn:hover {
          color: #00E5C0;
        }

        /* ── CTA button ── */
        .gs-btn-signup {
          width: 100%;
          padding: 0.85rem 1rem;
          border: none;
          border-radius: 10px;
          background: #00E5C0;
          color: #030711;
          font-family: 'Exo 2', sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.3s, background 0.3s;
          box-shadow: 0 4px 24px rgba(0,229,192,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 0.75rem;
          animation: gsFadeUp 0.6s 0.5s ease both;
        }
        .gs-btn-signup:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 36px rgba(0,229,192,0.5);
          background: #00D4B3;
        }
        .gs-btn-signup:active:not(:disabled) {
          transform: scale(0.975);
        }
        .gs-btn-signup:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .gs-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(3,7,17,0.3);
          border-top-color: #030711;
          border-radius: 50%;
          animation: gsSpin 0.7s linear infinite;
        }
        @keyframes gsSpin { to { transform: rotate(360deg); } }

        /* ── Login nudge ── */
        .gs-login-nudge {
          text-align: center;
          font-size: 0.82rem;
          color: #8BA8A0;
          margin-top: 1.5rem;
          animation: gsFadeUp 0.6s 0.56s ease both;
        }
        .gs-login-nudge a {
          color: #00E5C0;
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s;
        }
        .gs-login-nudge a:hover {
          opacity: 0.75;
        }

        /* ── Footer ── */
        .gs-footer {
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
        .gs-footer img {
          width: 13px;
          height: 13px;
          border-radius: 3px;
          opacity: 0.5;
        }

        /* ── Animations ── */
        @keyframes gsFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gsFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }

        /* ══════════════════════════════════
           LIGHT MODE
        ══════════════════════════════════ */
        [data-theme="light"] .gs-root { background: #F5F7FA; }
        [data-theme="light"] .gs-left {
          background:
            radial-gradient(ellipse 80% 60% at 30% 50%, rgba(0,184,150,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 80% 20%, rgba(124,92,252,0.04) 0%, transparent 60%),
            linear-gradient(180deg, #EFF1F5 0%, #E8EAF2 100%);
        }
        [data-theme="light"] .gs-left-logo-text { color: #1A1A2E; }
        [data-theme="light"] .gs-left-tagline { color: #1A1A2E; }
        [data-theme="light"] .gs-left-sub { color: #555566; }
        [data-theme="light"] .gs-shape-4 { background: #E0E2EA; border-color: rgba(0,184,150,0.3); }
        [data-theme="light"] .gs-phone { background: #E0E2EA; border-color: rgba(0,184,150,0.2); }
        [data-theme="light"] .gs-phone::before { background: linear-gradient(180deg, rgba(0,184,150,0.1) 0%, rgba(124,92,252,0.06) 100%); }
        [data-theme="light"] .gs-right {
          background: linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 50%, #FFFFFF 100%);
          border-left-color: rgba(0,0,0,0.06);
        }
        [data-theme="light"] .gs-heading { color: #1A1A2E; }
        [data-theme="light"] .gs-subheading { color: #555566; }
        [data-theme="light"] .gs-label { color: #555566; }
        [data-theme="light"] .gs-input { color: #1A1A2E; border-bottom-color: rgba(0,0,0,0.12); }
        [data-theme="light"] .gs-input::placeholder { color: #999; }
        [data-theme="light"] .gs-input:focus { border-color: #00B896; box-shadow: 0 2px 12px rgba(0,184,150,0.1); }
        [data-theme="light"] .gs-select { color: #1A1A2E; border-bottom-color: rgba(0,0,0,0.12); }
        [data-theme="light"] .gs-eye-btn { color: #888; }
        [data-theme="light"] .gs-login-nudge { color: #555566; }
        [data-theme="light"] .gs-footer { color: rgba(0,0,0,0.3); }
        [data-theme="light"] .gs-form-icon { background: linear-gradient(135deg, rgba(0,184,150,0.1) 0%, rgba(124,92,252,0.06) 100%); border-color: rgba(0,184,150,0.15); }
        [data-theme="light"] .gs-step-circle { border-color: rgba(0,0,0,0.15); color: #888; }
        [data-theme="light"] .gs-step-circle.active { background: #00B896; border-color: #00B896; }
        [data-theme="light"] .gs-step-circle.done { background: #00B896; border-color: #00B896; }
        [data-theme="light"] .gs-step-label { color: #888; }
        [data-theme="light"] .gs-step-label.active { color: #1A1A2E; }
        [data-theme="light"] .gs-step-line { background: rgba(0,0,0,0.1); }
        [data-theme="light"] .gs-step-line.done { background: #00B896; }
        [data-theme="light"] .gs-error { color: #DC3545; }
        [data-theme="light"] .gs-btn-google { color: #1A1A2E; border-color: rgba(0,0,0,0.12); }
        [data-theme="light"] .gs-btn-google:hover { background: rgba(0,0,0,0.03); }

        /* ══════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════ */
        @media (max-width: 900px) {
          .gs-root {
            flex-direction: column;
          }
          .gs-left {
            flex: none;
            padding: 2rem 1.5rem 1.5rem;
            min-height: auto;
          }
          .gs-shapes {
            width: 220px;
            height: 220px;
            margin-bottom: 1.5rem;
          }
          .gs-shape-1 { width: 90px; height: 100px; border-radius: 22px; }
          .gs-shape-2 { width: 75px; height: 75px; }
          .gs-shape-3 { width: 45px; height: 70px; }
          .gs-shape-4 { width: 40px; height: 40px; }
          .gs-book { width: 38px; height: 28px; }
          .gs-cap-top { width: 30px; }
          .gs-cap-base { width: 20px; height: 12px; }
          .gs-left-tagline { font-size: 1rem; }
          .gs-left-sub { font-size: 0.82rem; }

          .gs-right {
            flex: 1;
            border-left: none;
            border-top: 1px solid rgba(0,229,192,0.1);
            padding: 2rem 1.5rem 4rem;
          }
        }

        @media (max-width: 600px) {
          .gs-left {
            padding: 1.5rem 1rem 1rem;
          }
          .gs-shapes {
            width: 180px;
            height: 180px;
            margin-bottom: 1rem;
          }
          .gs-shape-1 { width: 75px; height: 85px; border-radius: 18px; }
          .gs-shape-2 { width: 60px; height: 60px; }
          .gs-shape-3 { width: 38px; height: 58px; }
          .gs-shape-4 { width: 35px; height: 35px; }
          .gs-book { width: 32px; height: 24px; }
          .gs-cap { display: none; }
          .gs-dot-1, .gs-dot-2, .gs-dot-3, .gs-dot-4 { display: none; }
          .gs-left-tagline { font-size: 0.9rem; }
          .gs-left-sub { font-size: 0.78rem; }
          .gs-left-logo-text { font-size: 17px; }

          .gs-right {
            padding: 1.5rem 1.25rem 4rem;
          }
          .gs-heading {
            font-size: 1.4rem;
          }
          .gs-field {
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 380px) {
          .gs-shapes {
            width: 150px;
            height: 150px;
          }
          .gs-shape-1 { width: 60px; height: 70px; }
          .gs-shape-2 { width: 50px; height: 50px; }
          .gs-shape-3 { width: 30px; height: 45px; }
          .gs-shape-4 { width: 30px; height: 30px; }
          .gs-book { display: none; }
          .gs-heading { font-size: 1.25rem; }
          .gs-left-logo-text { display: none; }
        }
      `}</style>

      <div className="gs-root">
        {/* ════ LEFT PANEL ════ */}
        <div className="gs-left">
          <PanelParticles />

          <div className="gs-left-content">
            {/* Logo */}
            <div className="gs-left-logo">
              <div className="gs-left-logo-img">
                <img src="/favicon-32.png" alt="Gyantra" />
              </div>
              <span className="gs-left-logo-text">
                GY<span>AN</span>TRA
              </span>
            </div>

            {/* Geometric illustration shapes */}
            <div className="gs-shapes">
              <div className="gs-shape gs-shape-1" />
              <div className="gs-shape gs-shape-2" />
              <div className="gs-shape gs-shape-3" />
              <div className="gs-shape gs-shape-4" />
              <div className="gs-book" />
              <div className="gs-cap">
                <div className="gs-cap-top" />
                <div className="gs-cap-base" />
              </div>
              <div className="gs-dot gs-dot-1" />
              <div className="gs-dot gs-dot-2" />
              <div className="gs-dot gs-dot-3" />
              <div className="gs-dot gs-dot-4" />
            </div>

            <h2 className="gs-left-tagline">
              Join the <span>Gyantra</span> Community
            </h2>
            <p className="gs-left-sub">
              Create your account and start mastering exams
              with AI-powered adaptive learning.
            </p>
          </div>
        </div>

        {/* ════ RIGHT PANEL — Signup Form ════ */}
        <div className="gs-right">
          <div className="gs-form-wrap">
            {/* Icon */}
            <div className="gs-form-icon">
              <img src="/favicon-32.png" alt="" />
            </div>

            {/* Heading */}
            <h1 className="gs-heading">
              Create <span>Account</span>
            </h1>
            <p className="gs-subheading">
              Join Gyantra and master your exams
            </p>

            {/* Error banner */}
            {errors.submit && (
              <div className="gs-error-banner">{errors.submit}</div>
            )}

            {/* Form */}
            <form className="gs-form" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="gs-field">
                <label className="gs-label">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`gs-input${errors.name ? " gs-input-error" : ""}`}
                  id="signup-name"
                />
                {errors.name && (
                  <p className="gs-field-error">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="gs-field">
                <label className="gs-label">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`gs-input${errors.email ? " gs-input-error" : ""}`}
                  id="signup-email"
                />
                {errors.email && (
                  <p className="gs-field-error">{errors.email}</p>
                )}
              </div>

              {/* Contact */}
              <div className="gs-field">
                <label className="gs-label">Contact Number</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXXXXXXX"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={`gs-input${errors.contactNumber ? " gs-input-error" : ""}`}
                  id="signup-contact"
                />
                {errors.contactNumber && (
                  <p className="gs-field-error">{errors.contactNumber}</p>
                )}
              </div>

              {/* Education Level */}
              <div className="gs-field">
                <label className="gs-label">Education Level</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className={`gs-select${errors.educationLevel ? " gs-input-error" : ""}`}
                  id="signup-education"
                >
                  <option value="">Select your education level</option>
                  <option value="Dropout">Dropout</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Professional">Professional</option>
                </select>
                {errors.educationLevel && (
                  <p className="gs-field-error">{errors.educationLevel}</p>
                )}
              </div>

              {/* Password */}
              <div className="gs-field">
                <label className="gs-label">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`gs-input${errors.password ? " gs-input-error" : ""}`}
                  id="signup-password"
                />
                <button
                  type="button"
                  className="gs-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="gs-field-error">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="gs-btn-signup"
                disabled={loading}
                id="signup-submit"
              >
                {loading ? (
                  <>
                    <div className="gs-spinner" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>

              {/* Google signup */}
              <GoogleSignupButton setErrors={setErrors} setLoading={setLoading} />
            </form>

            {/* Login nudge */}
            <p className="gs-login-nudge">
              Already have an account?{" "}
              <Link to="/login">Log In</Link>
            </p>
          </div>

          {/* Footer */}
          <div className="gs-footer">
            <img src="/favicon-32.png" alt="" />
            © {new Date().getFullYear()} Gyantra. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
