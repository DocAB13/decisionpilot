import { useState, useEffect, useRef } from "react";

export default function AselCorner() {
  const [hovered, setHovered] = useState(false);
  const [wave, setWave] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setWave(true);
      setTimeout(() => setWave(false), 900);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  function handleClick() {
    window.dispatchEvent(new Event("openChat"));
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      style={{
        position: "fixed", right: 20, bottom: 20, zIndex: 70,
        cursor: "pointer", display: "flex", flexDirection: "column",
        alignItems: "flex-end", gap: 8,
      }}>
      <div style={{
        background: "#fff", border: "1px solid #E8ECF4", borderRadius: 14,
        padding: "8px 13px", fontSize: 12.5, fontWeight: 600, color: "#0F172A",
        boxShadow: "0 8px 20px rgba(15,23,42,0.16)", whiteSpace: "nowrap",
        opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(6px)",
        transition: "all 0.25s ease", position: "relative",
      }}>
        💬 Chat with Asel
        <div style={{ position: "absolute", right: 22, bottom: -6, width: 10, height: 10, background: "#fff", borderRight: "1px solid #E8ECF4", borderBottom: "1px solid #E8ECF4", transform: "rotate(45deg)" }} />
      </div>

      <div style={{
        width: 64, height: 64, borderRadius: "50%", background: "#fff",
        border: "2px solid #E8ECF4", boxShadow: hovered ? "0 10px 28px rgba(26,86,219,0.25)" : "0 8px 20px rgba(15,23,42,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: hovered ? "scale(1.06)" : "scale(1)",
        transition: "all 0.2s ease",
      }}>
        <svg viewBox="0 0 140 130" width="46" height="44" style={{ animation: "aselCornerBob 2.8s ease-in-out infinite" }}>
          <defs>
            <linearGradient id="aselCornerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E4E8F4" />
            </linearGradient>
          </defs>
          <rect x="40" y="66" width="60" height="56" rx="22" fill="url(#aselCornerGrad)" />
          <rect x="55" y="80" width="30" height="27" rx="10" fill="#1B2A52" stroke="#D4AF37" strokeWidth="2.2" />
          <text x="70" y="100" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize="15" fill="#fff">AS</text>
          <circle cx="42" cy="72" r="6" fill="#D4AF37" />
          <circle cx="98" cy="72" r="6" fill="#D4AF37" />

          <path d={wave ? "M98 80 C112 80 120 64 112 50" : "M98 80 C112 82 118 64 108 50"}
            stroke="url(#aselCornerGrad)" strokeWidth="15" strokeLinecap="round" fill="none"
            style={{ transition: "d 0.25s ease" }} />
          <circle cx={wave ? 112 : 108} cy={wave ? 49 : 48} r="9" fill="url(#aselCornerGrad)" stroke="#C9CEE0" strokeWidth="1" />
          <rect x={wave ? 107 : 103} y="32" width="9" height="17" rx="4.5" fill="url(#aselCornerGrad)" stroke="#C9CEE0" strokeWidth="1" transform={wave ? "rotate(-12 112 40)" : "rotate(0)"} />

          <path d="M42 80 C30 86 28 102 34 112" stroke="url(#aselCornerGrad)" strokeWidth="15" strokeLinecap="round" fill="none" />
          <circle cx="34" cy="114" r="9" fill="url(#aselCornerGrad)" stroke="#C9CEE0" strokeWidth="1" />

          <g>
            <line x1="70" y1="10" x2="70" y2="23" stroke="#C9A24B" strokeWidth="3" strokeLinecap="round" />
            <path d="M70 0 L73 6 L80 8 L73 10 L70 18 L67 10 L60 8 L67 6 Z" fill="#D4AF37" />
            <circle cx="70" cy="8" r="2.2" fill="#1B2A52" style={{ animation: "aselCornerGem 1.8s ease-in-out infinite" }} />
            <ellipse cx="70" cy="40" rx="34" ry="30" fill="url(#aselCornerGrad)" />
            <circle cx="38" cy="42" r="7" fill="#D4AF37" /><circle cx="38" cy="42" r="2.6" fill="#5FD4FF" />
            <circle cx="102" cy="42" r="7" fill="#D4AF37" /><circle cx="102" cy="42" r="2.6" fill="#5FD4FF" />
            <rect x="48" y="28" width="44" height="26" rx="13" fill="#0B0F20" />
            <path d="M56 40 Q62 32 68 40" stroke="#5FD4FF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M72 40 Q78 32 84 40" stroke="#5FD4FF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M60 47 Q70 53 80 47" stroke="#5FD4FF" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      <style>{`
        @keyframes aselCornerBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-3px);} }
        @keyframes aselCornerGem { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
      `}</style>
    </div>
  );
}
