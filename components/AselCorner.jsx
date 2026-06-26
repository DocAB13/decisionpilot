import { useState, useEffect, useRef } from "react";

const FREE_DAILY_LIMIT = Infinity;
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
      const t = setTimeout(() => showTip("asel_idle", "Stuck choosing? Pick a category above and I'll help 👆", () => scrollToId("categories")), 16000);
      tipTimers.current.push(t);
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
  const bubbleText = tip ? tip.text : "💬 Chat with Ai·sel";

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{ position: "fixed", right: 16, bottom: 16, zIndex: 70, cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>

      {/* Speech bubble */}
      {bubbleVisible && (
        <div style={{
          background: tip ? "#1A56DB" : "#fff",
          border: `1px solid ${tip ? "#1A56DB" : "#E8ECF4"}`,
          borderRadius: 14, padding: "10px 14px", fontSize: 12.5, fontWeight: 600,
          color: tip ? "#fff" : "#0F172A",
          boxShadow: "0 8px 20px rgba(15,23,42,0.16)",
          whiteSpace: tip ? "normal" : "nowrap", maxWidth: tip ? 220 : "none", lineHeight: 1.5,
          position: "relative", animation: "aselPopIn 0.2s ease",
        }}>
          {tip && (
            <button onClick={dismissTip} style={{ position:"absolute",top:4,right:6,background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:14,lineHeight:1,padding:0 }}>×</button>
          )}
          {bubbleText}
          {/* Tail */}
          <div style={{ position:"absolute",bottom:-7,right:22,width:14,height:14,
            background: tip ? "#1A56DB" : "#fff",
            border: `1px solid ${tip ? "#1A56DB" : "#E8ECF4"}`,
            clipPath:"polygon(0 0,100% 0,50% 100%)",
          }}/>
        </div>
      )}

      {/* Ai·sel — bigger, full body, floating */}
      <div style={{ position:"relative", width:96, height:96 }}>
        {tip && (
          <span style={{
            position:"absolute", inset:-8, borderRadius:"50%",
            border:"2px solid #1A56DB",
            animation:"aselTipPulse 1.6s ease-out infinite",
            pointerEvents:"none",
          }}/>
        )}
        <img
          src="/asel-hero.png"
          alt="Ai·sel"
          style={{
            width: 96, height: 96,
            objectFit: "contain",
            objectPosition: "center bottom",
            filter: hovered
              ? "drop-shadow(0 12px 28px rgba(26,86,219,0.45))"
              : "drop-shadow(0 8px 20px rgba(26,86,219,0.25))",
            transform: hovered ? "translateY(-6px) scale(1.06)" : "translateY(0) scale(1)",
            transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)",
            animation: "aselCornerBob 3s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes aselCornerBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
        @keyframes aselTipPulse { 0%{opacity:0.7;transform:scale(1);} 100%{opacity:0;transform:scale(1.5);} }
        @keyframes aselPopIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes aselFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
      `}</style>
    </div>
  );
}
