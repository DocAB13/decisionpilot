import { useState, useEffect, useRef } from "react";

const IDLE_MESSAGES = [
  "Hi, I'm Ai·sel — decide faster, spend smarter!",
  "Less searching, more saving. That's my job.",
  "I turn big decisions into easy wins.",
  "Time saved, money smart — let's go!",
];

const WALK_SPOTS = [6, 24, 44, 62, 78, 50, 18];

const CATEGORY_COPY = {
  vacation: { acc: "beach", q: "Sun, sand, and smart savings — let's compare!", r: "Pack your bags — here are my top picks!" },
  car: { acc: "auto", q: "Buckle up — let's find your best ride and save some cash.", r: "Here are my top rides — compared and ranked!" },
  phone: { acc: "phone", q: "New phone? I'll help you save time and money.", r: "Here's my pick for your next phone!" },
  laptop: { acc: "laptop", q: "Let's find the perfect laptop for your budget.", r: "Here are my top laptop picks!" },
  tv: { acc: "tv", q: "Big screen, smart choice — let's compare TVs.", r: "Here's the best TV for your setup!" },
  fitness: { acc: "fitness", q: "Let's get you moving with the right gear.", r: "Here's my top fitness pick!" },
  pet: { acc: "pet", q: "Let's find what's best for your furry friend.", r: "Here are my top picks for your pet!" },
  dining: { acc: "dining", q: "Hungry for a good decision? Let's compare.", r: "Bon appétit — here's my top pick!" },
  career: { acc: "career", q: "Big career move? Let's think it through.", r: "Here's what I'd recommend for your career!" },
};

function messageForScreen(screen, category) {
  const copy = CATEGORY_COPY[category];
  if (!copy) return null;
  if (screen === "questions") return copy.q;
  if (screen === "results") return copy.r;
  return null;
}

function accessoryForCategory(category) {
  return CATEGORY_COPY[category]?.acc || "none";
}

export default function AselMascot({ screen, category }) {
  const [walkPct, setWalkPct] = useState(WALK_SPOTS[0]);
  const [headAngle, setHeadAngle] = useState(0);
  const [hop, setHop] = useState(false);
  const [idleIdx, setIdleIdx] = useState(0);
  const [bubbleOn, setBubbleOn] = useState(false);
  const walkRef = useRef(0);
  const headRef = useRef(0);

  const contextMsg = messageForScreen(screen, category);
  const accessory = accessoryForCategory(category);
  const bubbleText = contextMsg || IDLE_MESSAGES[idleIdx];
  const isGuide = !!contextMsg;

  useEffect(() => {
    const t = setTimeout(() => setBubbleOn(true), 900);
    return () => clearTimeout(t);
  }, []);

  // contextual message takes over immediately when screen/category changes
  useEffect(() => {
    setBubbleOn(true);
    setHop(true);
    const t = setTimeout(() => setHop(false), 550);
    return () => clearTimeout(t);
  }, [screen, category]);

  // idle message rotation (only matters while no contextual message is active)
  useEffect(() => {
    const id = setInterval(() => setIdleIdx(i => (i + 1) % IDLE_MESSAGES.length), 6500);
    return () => clearInterval(id);
  }, []);

  // walking left-right
  useEffect(() => {
    const id = setInterval(() => {
      walkRef.current = (walkRef.current + 1) % WALK_SPOTS.length;
      setWalkPct(WALK_SPOTS[walkRef.current]);
      setHop(true);
      setTimeout(() => setHop(false), 550);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  // head tilt
  useEffect(() => {
    const angles = [0, -10, 7, -6, 9, 0];
    const id = setInterval(() => {
      headRef.current = (headRef.current + 1) % angles.length;
      setHeadAngle(angles[headRef.current]);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  function handleClick() {
    if (!isGuide) setIdleIdx(i => (i + 1) % IDLE_MESSAGES.length);
    setHop(true);
    setTimeout(() => setHop(false), 550);
  }

  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, height: 118, pointerEvents: "none" }}>
      <div style={{ position: "relative", maxWidth: 920, margin: "0 auto", height: "100%" }}>

        <div style={{
          position: "absolute", bottom: 142, left: `${walkPct}%`, transform: "translateX(-6%)",
          background: "#fff", border: `1px solid #E8ECF4`, borderRadius: 14, padding: "9px 14px",
          fontSize: 12.5, fontWeight: 600, color: "#0F172A", boxShadow: "0 8px 20px rgba(15,23,42,0.14)",
          whiteSpace: "nowrap", maxWidth: 240,
          transition: "left 3.6s cubic-bezier(.45,0,.2,1), opacity 0.3s ease, border-color 0.3s ease",
          opacity: bubbleOn ? 1 : 0,
          borderColor: isGuide ? "#1A56DB" : "#E8ECF4",
        }}>
          {isGuide && <span style={{ color: "#1A56DB", fontWeight: 700, marginRight: 4, display: "inline-block", animation: "aselArrow 0.8s ease-in-out infinite" }}>&larr;</span>}
          {bubbleText}
          <div style={{ position: "absolute", left: 26, bottom: -6, width: 11, height: 11, background: "#fff", borderRight: "1px solid #E8ECF4", borderBottom: "1px solid #E8ECF4", transform: "rotate(45deg)" }} />
        </div>

        <div onClick={handleClick} style={{
          position: "absolute", bottom: 8, left: `${walkPct}%`, width: 92, height: 108,
          cursor: "pointer", pointerEvents: "auto",
          transition: "left 3.6s cubic-bezier(.45,0,.2,1)",
        }}>
          <svg viewBox="0 0 140 170" width="92" height="108"
            style={{ display: "block", filter: "drop-shadow(0 12px 14px rgba(15,23,42,0.22))", animation: `aselBob 2.6s ease-in-out infinite${hop ? ", aselHop 0.55s ease" : ""}` }}>
            <defs>
              <linearGradient id="aselBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E4E8F4" />
              </linearGradient>
              <linearGradient id="aselScreenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1C2238" />
                <stop offset="100%" stopColor="#0B0F20" />
              </linearGradient>
            </defs>

            <rect x="52" y="118" width="14" height="32" rx="7" fill="url(#aselBodyGrad)" />
            <rect x="74" y="118" width="14" height="32" rx="7" fill="url(#aselBodyGrad)" />
            <circle cx="59" cy="140" r="4" fill="#D4AF37" />
            <circle cx="81" cy="140" r="4" fill="#D4AF37" />
            <ellipse cx="59" cy="154" rx="13" ry="7" fill="#1B2A52" />
            <ellipse cx="81" cy="154" rx="13" ry="7" fill="#1B2A52" />
            <rect x="49" y="151" width="20" height="3" fill="#D4AF37" />
            <rect x="71" y="151" width="20" height="3" fill="#D4AF37" />

            <path d="M42 80 C30 86 28 102 34 112" stroke="url(#aselBodyGrad)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <circle cx="34" cy="114" r="9" fill="url(#aselBodyGrad)" stroke="#C9CEE0" strokeWidth="1" />

            <path d="M98 80 C112 82 118 64 108 50" stroke="url(#aselBodyGrad)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <circle cx="108" cy="48" r="9" fill="url(#aselBodyGrad)" stroke="#C9CEE0" strokeWidth="1" />
            <rect x="103" y="32" width="9" height="17" rx="4.5" fill="url(#aselBodyGrad)" stroke="#C9CEE0" strokeWidth="1" />

            <ellipse cx="70" cy="65" rx="22" ry="4" fill="#D4AF37" opacity="0.85" />
            <rect x="40" y="66" width="60" height="56" rx="22" fill="url(#aselBodyGrad)" />
            <circle cx="42" cy="72" r="6" fill="#D4AF37" />
            <circle cx="98" cy="72" r="6" fill="#D4AF37" />
            <rect x="55" y="80" width="30" height="27" rx="10" fill="#1B2A52" stroke="#D4AF37" strokeWidth="2.2" />
            <text x="70" y="100" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="700" fontSize="15" fill="#fff">AS</text>

            <g style={{ transformOrigin: "70px 40px", transition: "transform 0.6s ease", transform: `rotate(${headAngle}deg)` }}>
              <line x1="70" y1="10" x2="70" y2="23" stroke="#C9A24B" strokeWidth="3" strokeLinecap="round" />
              <path d="M70 0 L73 6 L80 8 L73 10 L70 18 L67 10 L60 8 L67 6 Z" fill="#D4AF37" />
              <circle cx="70" cy="8" r="2.2" fill="#1B2A52" style={{ animation: "aselGem 1.8s ease-in-out infinite" }} />

              <ellipse cx="70" cy="40" rx="34" ry="30" fill="url(#aselBodyGrad)" />
              <circle cx="38" cy="42" r="7" fill="#D4AF37" />
              <circle cx="38" cy="42" r="2.6" fill="#5FD4FF" />
              <circle cx="102" cy="42" r="7" fill="#D4AF37" />
              <circle cx="102" cy="42" r="2.6" fill="#5FD4FF" />

              <rect x="48" y="28" width="44" height="26" rx="13" fill="url(#aselScreenGrad)" />
              <path d="M56 40 Q62 32 68 40" stroke="#5FD4FF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <path d="M72 40 Q78 32 84 40" stroke="#5FD4FF" strokeWidth="3.2" fill="none" strokeLinecap="round" />
              <path d="M60 47 Q70 53 80 47" stroke="#5FD4FF" strokeWidth="2.6" fill="none" strokeLinecap="round" />

              {accessory === "beach" && (
                <g>
                  <rect x="50" y="33" width="16" height="9" rx="3" fill="#1F2937" />
                  <rect x="74" y="33" width="16" height="9" rx="3" fill="#1F2937" />
                  <line x1="66" y1="37" x2="74" y2="37" stroke="#1F2937" strokeWidth="2" />
                </g>
              )}
            </g>

            {accessory === "beach" && (
              <g>
                <path d="M27 102 L41 102 L34 114 Z" fill="#F59E0B" />
                <rect x="33" y="114" width="2" height="8" fill="#1B2A52" />
              </g>
            )}
            {accessory === "auto" && (
              <g>
                <circle cx="34" cy="114" r="9" fill="none" stroke="#1B2A52" strokeWidth="2.6" />
                <line x1="34" y1="105" x2="34" y2="123" stroke="#1B2A52" strokeWidth="2" />
              </g>
            )}
            {accessory === "phone" && (
              <g>
                <rect x="29" y="102" width="11" height="19" rx="2.6" fill="#1B2A52" />
                <rect x="31.5" y="105" width="6" height="13" fill="#5FD4FF" />
              </g>
            )}
            {accessory === "laptop" && (
              <g>
                <rect x="24" y="98" width="18" height="13" rx="1.6" fill="#1B2A52" />
                <rect x="26" y="100" width="14" height="9" fill="#5FD4FF" />
                <rect x="21" y="111" width="24" height="3" rx="1.5" fill="#C9CEE0" />
              </g>
            )}
            {accessory === "tv" && (
              <g>
                <rect x="23" y="98" width="22" height="14" rx="2" fill="#1B2A52" />
                <rect x="25.5" y="100.5" width="17" height="9" fill="#5FD4FF" />
                <rect x="32" y="112" width="4" height="4" fill="#C9CEE0" />
                <rect x="27" y="116" width="14" height="2" rx="1" fill="#C9CEE0" />
              </g>
            )}
            {accessory === "fitness" && (
              <g>
                <rect x="26" y="111.5" width="16" height="3" rx="1.5" fill="#1B2A52" />
                <circle cx="25" cy="113" r="5" fill="#1B2A52" />
                <circle cx="43" cy="113" r="5" fill="#1B2A52" />
                <circle cx="25" cy="113" r="2" fill="#C9CEE0" />
                <circle cx="43" cy="113" r="2" fill="#C9CEE0" />
              </g>
            )}
            {accessory === "pet" && (
              <g>
                <circle cx="34" cy="111" r="4.4" fill="#1B2A52" />
                <circle cx="27" cy="105" r="2.6" fill="#1B2A52" />
                <circle cx="34" cy="102" r="2.6" fill="#1B2A52" />
                <circle cx="41" cy="105" r="2.6" fill="#1B2A52" />
              </g>
            )}
            {accessory === "dining" && (
              <g>
                <rect x="29" y="98" width="2.4" height="22" rx="1.2" fill="#1B2A52" />
                <path d="M27.5 98 v6 M29.2 98 v6 M31 98 v6" stroke="#1B2A52" strokeWidth="1.6" strokeLinecap="round" />
                <rect x="38" y="98" width="2.4" height="22" rx="1.2" fill="#1B2A52" />
              </g>
            )}
            {accessory === "career" && (
              <g>
                <rect x="23" y="104" width="22" height="15" rx="2.5" fill="#1B2A52" />
                <rect x="30" y="100" width="8" height="6" rx="1.8" fill="none" stroke="#1B2A52" strokeWidth="2.2" />
                <rect x="32.5" y="110" width="3" height="3" fill="#D4AF37" />
              </g>
            )}
          </svg>
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 58, height: 11, background: "rgba(15,23,42,0.16)", borderRadius: "50%", filter: "blur(3px)" }} />
        </div>
      </div>

      <style>{`
        @keyframes aselBob { 0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-6px) rotate(1.5deg);} }
        @keyframes aselHop { 0%{transform:translateY(0) scale(1,1);} 30%{transform:translateY(-16px) scale(0.94,1.1);} 55%{transform:translateY(0) scale(1.07,0.9);} 100%{transform:translateY(0) scale(1,1);} }
        @keyframes aselGem { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        @keyframes aselArrow { 0%,100%{transform:translateX(0);} 50%{transform:translateX(-4px);} }
      `}</style>
    </div>
  );
}
