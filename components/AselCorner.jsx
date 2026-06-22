import { useState, useEffect, useRef } from "react";

const DARK = "#1A1A2E";
const CREAM = "#F5F0E8";
const ORANGE = "#FF8C00";

const FREE_DAILY_LIMIT = 3;
function getDecisionCount() {
  if (typeof window === "undefined") return 0;
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("dp_decisions") || "{}");
  if (stored.date !== today) return 0;
  return stored.count || 0;
}
function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function AselCorner({ screen = "landing" }) {
  const [hovered, setHovered] = useState(false);
  const [wave, setWave] = useState(false);
  const [tip, setTip] = useState(null);
  const tipTimers = useRef([]);

  useEffect(() => {
    const id = setInterval(() => {
      setWave(true);
      setTimeout(() => setWave(false), 900);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  function showTip(key, text, action) {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    setTip({ text, action });
    const t = setTimeout(() => setTip(p => p?.text === text ? null : p), 9000);
    tipTimers.current.push(t);
  }

  useEffect(() => {
    tipTimers.current.forEach(clearTimeout);
    tipTimers.current = [];
    if (screen === "landing") {
      if (getDecisionCount() >= FREE_DAILY_LIMIT - 1) {
        const t = setTimeout(() => showTip("asel_limit", "Heads up — this may be your last free decision today. Pro unlocks unlimited 🚀", () => scrollToId("pricing")), 2500);
        tipTimers.current.push(t);
      } else {
        const t = setTimeout(() => showTip("asel_idle", "Stuck choosing? Pick a category above and I'll help 👆", () => scrollToId("categories")), 16000);
        tipTimers.current.push(t);
      }
    } else if (screen === "results") {
      const t = setTimeout(() => showTip("asel_results", "Need a second opinion? Let's chat 💬", null), 6000);
      tipTimers.current.push(t);
    }
    return () => tipTimers.current.forEach(clearTimeout);
  }, [screen]);

  function handleClick() {
    if (tip) { const a = tip.action; setTip(null); if (a) { a(); return; } }
    window.dispatchEvent(new Event("openChat"));
  }

  function dismissTip(e) { e.stopPropagation(); setTip(null); }

  const bubbleVisible = hovered || !!tip;
  const bubbleText = tip ? tip.text : "💬 Chat with Asel";

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{ position: "fixed", right: 20, bottom: 20, zIndex: 70, cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>

      {/* Speech bubble */}
      <div style={{
        background: tip ? "#1A56DB" : "#fff",
        border: `1px solid ${tip ? "#1A56DB" : "#E8ECF4"}`,
        borderRadius: 14, padding: "10px 14px", fontSize: 12.5, fontWeight: 600,
        color: tip ? "#fff" : "#0F172A",
        boxShadow: "0 8px 20px rgba(15,23,42,0.16)",
        whiteSpace: tip ? "normal" : "nowrap", maxWidth: tip ? 220 : "none", lineHeight: 1.5,
        opacity: bubbleVisible ? 1 : 0, transform: bubbleVisible ? "translateY(0)" : "translateY(6px)",
        transition: "all 0.25s ease", position: "relative",
      }}>
        {bubbleText}
        {tip && (
          <span onClick={dismissTip} style={{
            position: "absolute", top: -7, right: -7, width: 20, height: 20, borderRadius: "50%",
            background: "#fff", color: "#475569", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 12, fontWeight: 700,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)", cursor: "pointer",
          }}>×</span>
        )}
        <div style={{
          position: "absolute", right: 22, bottom: -6, width: 10, height: 10,
          background: tip ? "#1A56DB" : "#fff",
          borderRight: `1px solid ${tip ? "#1A56DB" : "#E8ECF4"}`,
          borderBottom: `1px solid ${tip ? "#1A56DB" : "#E8ECF4"}`,
          transform: "rotate(45deg)",
        }}/>
      </div>

      {/* Penguin avatar button */}
      <div style={{
        width: 68, height: 68, borderRadius: "50%", background: "#fff",
        border: "2px solid #E8ECF4",
        boxShadow: hovered ? "0 10px 28px rgba(26,86,219,0.28)" : "0 8px 20px rgba(15,23,42,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: hovered ? "scale(1.07)" : "scale(1)",
        transition: "all 0.2s ease", position: "relative", overflow: "hidden",
      }}>
        {tip && (
          <span style={{
            position: "absolute", inset: -6, borderRadius: "50%",
            border: "2px solid #1A56DB",
            animation: "aselTipPulse 1.6s ease-out infinite",
            pointerEvents: "none",
          }}/>
        )}
        <svg viewBox="0 0 100 110" width="52" height="58"
          style={{ animation: "aselCornerBob 2.8s ease-in-out infinite" }}>
          {/* Feet */}
          <ellipse cx="38" cy="104" rx="11" ry="5" fill={ORANGE}/>
          <ellipse cx="62" cy="104" rx="11" ry="5" fill={ORANGE}/>
          {/* Body */}
          <ellipse cx="50" cy="75" rx="24" ry="32" fill={DARK}/>
          {/* Belly */}
          <ellipse cx="50" cy="78" rx="14" ry="21" fill={CREAM}/>
          {/* Left wing */}
          <path d="M28 60 C18 68 16 84 20 94 C23 100 28 98 30 92 C32 84 30 72 28 60" fill={DARK}/>
          {/* Right wing - waving */}
          <path className="asel-corner-wave"
            d={wave ? "M72 60 C84 52 90 40 83 30" : "M72 60 C82 56 88 44 80 34"}
            stroke={DARK} strokeWidth="12" strokeLinecap="round" fill="none"
            style={{ transition: "d 0.3s ease" }}/>
          <ellipse cx={wave ? 82 : 79} cy={wave ? 28 : 32} rx="8" ry="6"
            fill={DARK} transform={wave ? "rotate(-20 82 28)" : "rotate(-10 79 32)"}
            style={{ transition: "all 0.3s ease" }}/>
          {/* Head */}
          <ellipse cx="50" cy="34" rx="22" ry="20" fill={DARK}/>
          {/* Face patch */}
          <ellipse cx="50" cy="38" rx="14" ry="15" fill={CREAM}/>
          {/* Eyes */}
          <circle cx="43" cy="30" r="5" fill="white"/>
          <circle cx="44.5" cy="30" r="2.8" fill={DARK}/>
          <circle cx="45.5" cy="29" r="1.1" fill="white"/>
          <circle cx="57" cy="30" r="5" fill="white"/>
          <circle cx="58.5" cy="30" r="2.8" fill={DARK}/>
          <circle cx="59.5" cy="29" r="1.1" fill="white"/>
          {/* Beak */}
          <ellipse cx="50" cy="42" rx="6" ry="4.5" fill={ORANGE}/>
          <line x1="44" y1="42" x2="56" y2="42" stroke="#CC6600" strokeWidth="1"/>
        </svg>
      </div>

      <style>{`
        @keyframes aselCornerBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-3px);} }
        @keyframes aselTipPulse { 0%{opacity:0.7;transform:scale(1);} 100%{opacity:0;transform:scale(1.4);} }
      `}</style>
    </div>
  );
}
