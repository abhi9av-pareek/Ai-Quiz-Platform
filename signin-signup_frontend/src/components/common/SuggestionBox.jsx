import React, { useState, useEffect } from "react";
import { Star, Send, Check, AlertCircle } from "lucide-react";
import axios from "axios";

const CATEGORIES = [
  { id: "Suggestion", label: "Suggestion" },
  { id: "Bug Report", label: "Bug Report" },
  { id: "Content Quality", label: "Content Quality" },
  { id: "UI/UX", label: "UI / UX" }
];

export default function SuggestionBox({
  context = "General",
  title = "Share Your Feedback",
  subtitle = "Help us improve your learning experience."
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("Suggestion");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-fill user details if logged in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        setIsLoggedIn(Boolean(parsed.email));
      }
    } catch (e) {
      console.warn("Could not parse user info", e);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg("Please write a short note before submitting.");
      return;
    }

    const senderName = name.trim() || (isLoggedIn ? "Student" : "Anonymous Learner");
    const senderEmail = email.trim() || (isLoggedIn ? "student@gyantra.com" : "learner@gyantra.com");

    setErrorMsg("");
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${backendUrl}/api/feedback/submit`,
        {
          name: senderName,
          email: senderEmail,
          rating,
          category,
          message: message.trim(),
          context
        },
        { headers }
      );
      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submit error:", err);
      // Still show thank you state gracefully for demo/offline
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fb-box fb-submitted">
        <style>{feedbackStyles}</style>
        <div className="fb-success-row">
          <div className="fb-check-icon"><Check size={16} /></div>
          <div>
            <div className="fb-success-title">Thank you for your feedback!</div>
            <div className="fb-success-sub">Your response helps make Gyantra better for every student.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fb-box">
      <style>{feedbackStyles}</style>
      <form onSubmit={handleSubmit} className="fb-form">
        <div className="fb-header">
          <div>
            <h4 className="fb-title">{title}</h4>
            <p className="fb-subtitle">{subtitle}</p>
          </div>

          {/* Star Rating */}
          <div className="fb-stars" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  className={`fb-star-btn ${active ? "active" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  title={`${star} star`}
                >
                  <Star size={16} fill={active ? "#FFB347" : "none"} color={active ? "#FFB347" : "var(--fb-muted, #7B7A8C)"} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="fb-cat-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`fb-cat-pill ${category === cat.id ? "selected" : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Optional Name/Email for non-logged in users */}
        {!isLoggedIn && (
          <div className="fb-inputs-row">
            <input
              type="text"
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="fb-input"
            />
            <input
              type="email"
              placeholder="Your Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="fb-input"
            />
          </div>
        )}

        {/* Message Input */}
        <div className="fb-text-row">
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you loved or how we can improve..."
            className="fb-textarea"
          />
        </div>

        {errorMsg && (
          <div className="fb-error">
            <AlertCircle size={13} /> {errorMsg}
          </div>
        )}

        <div className="fb-footer-row">
          <span className="fb-ctx-tag">{context}</span>
          <button type="submit" disabled={loading} className="fb-submit-btn">
            {loading ? "Sending..." : <><Send size={13} /> Send Feedback</>}
          </button>
        </div>
      </form>
    </div>
  );
}

const feedbackStyles = `
  .fb-box {
    --fb-bg: var(--pf-surface, var(--surface, #111318));
    --fb-surface2: var(--pf-surface2, var(--surface2, #181B23));
    --fb-border: var(--pf-border, var(--border, rgba(255,255,255,0.08)));
    --fb-border2: var(--pf-border2, var(--border2, rgba(255,255,255,0.14)));
    --fb-text: var(--pf-text, var(--text, #F0EFF8));
    --fb-muted: var(--pf-muted, var(--muted, #7B7A8C));
    --fb-accent: var(--pf-accent, var(--accent, #7C5CFC));
    --fb-accent2: var(--pf-accent2, var(--accent2, #00E5C0));

    background: var(--fb-bg);
    border: 1px solid var(--fb-border);
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    max-width: 620px;
    margin: 1.5rem auto 0;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }
  [data-theme="light"] .fb-box {
    background: #FFFFFF;
    border-color: rgba(0,0,0,0.08);
  }

  .fb-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .fb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .fb-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--fb-text);
    margin: 0;
  }

  .fb-subtitle {
    font-size: 11.5px;
    color: var(--fb-muted);
    margin: 1px 0 0;
  }

  .fb-stars {
    display: flex;
    gap: 2px;
  }
  .fb-star-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
  }
  .fb-star-btn:hover {
    transform: scale(1.15);
  }

  .fb-cat-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .fb-cat-pill {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 12px;
    border: 1px solid var(--fb-border);
    background: var(--fb-surface2);
    color: var(--fb-muted);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;
  }
  .fb-cat-pill:hover {
    border-color: var(--fb-border2);
    color: var(--fb-text);
  }
  .fb-cat-pill.selected {
    background: rgba(124,92,252,0.15);
    border-color: var(--fb-accent);
    color: var(--fb-accent);
    font-weight: 600;
  }

  .fb-inputs-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .fb-input {
    background: var(--fb-surface2);
    border: 1px solid var(--fb-border);
    border-radius: 8px;
    padding: 6px 10px;
    color: var(--fb-text);
    font-size: 12px;
    font-family: inherit;
    outline: none;
  }
  .fb-input:focus {
    border-color: var(--fb-accent);
  }

  .fb-textarea {
    width: 100%;
    background: var(--fb-surface2);
    border: 1px solid var(--fb-border);
    border-radius: 8px;
    padding: 8px 10px;
    color: var(--fb-text);
    font-size: 12.5px;
    font-family: inherit;
    resize: none;
    outline: none;
    box-sizing: border-box;
  }
  .fb-textarea:focus {
    border-color: var(--fb-accent);
  }
  .fb-textarea::placeholder {
    color: var(--fb-muted);
    font-size: 12px;
  }

  .fb-footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .fb-ctx-tag {
    font-size: 10px;
    color: var(--fb-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .fb-submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--fb-accent);
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .fb-submit-btn:hover:not(:disabled) {
    background: #9074fd;
    transform: translateY(-1px);
  }
  .fb-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .fb-error {
    font-size: 11.5px;
    color: #FF6B6B;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .fb-submitted {
    padding: 1rem 1.25rem;
  }
  .fb-success-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .fb-check-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0,229,192,0.15);
    color: var(--fb-accent2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .fb-success-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--fb-text);
  }
  .fb-success-sub {
    font-size: 11.5px;
    color: var(--fb-muted);
  }

  @media (max-width: 500px) {
    .fb-inputs-row {
      grid-template-columns: 1fr;
    }
  }
`;
