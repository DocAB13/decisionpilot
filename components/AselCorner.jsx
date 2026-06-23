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

      {/* Asel avatar button */}
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
        <img
          src="/asel-mascot.png"
          alt="Asel"
          style={{
            width: 60, height: 60,
            objectFit: "cover",
            objectPosition: "30% 8%",
            animation: "aselCornerBob 2.8s ease-in-out infinite",
            borderRadius: "50%",
          }}
        />
      </div>

      <style>{`
        @keyframes aselCornerBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-3px);} }
        @keyframes aselTipPulse { 0%{opacity:0.7;transform:scale(1);} 100%{opacity:0;transform:scale(1.4);} }
      `}</style>
    </div>
  );
}
